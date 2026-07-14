'use client'

import { useCallback, useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { useTranslate } from '@tolgee/react'
import { StepIndicator } from '@/components/host/StepIndicator'
import { EventDetailsStep, type EventDetailsData } from '@/components/host/EventDetailsStep'
import { GiftListStep, type DraftGift } from '@/components/host/GiftListStep'
import { ReviewStep } from '@/components/host/ReviewStep'
import { createEvent, updateEvent, EventApiError, getEventById } from '@/lib/api/events'
import { useToast } from '@/components/shared/Toast'
import { useCurrentUser } from '@/lib/auth/useCurrentUser'
import { loadSession } from '@/lib/auth/session'
import { compressImageToDataUrl } from '@/lib/utils/imageUpload'

interface Draft {
  step: number
  details: EventDetailsData
  gifts: DraftGift[]
  collectGuestNames: boolean
  imageFile?: File
}

const emptyDraft: Draft = {
  step: 1,
  details: { type: 'wedding', name: '', date: '', message: '' },
  gifts: [],
  collectGuestNames: true,
  imageFile: undefined,
}

export default function CreatePage() {
  const { t } = useTranslate()
  const toast = useToast()
  const { user } = useCurrentUser()
  const searchParams = useSearchParams()
  const eventId = searchParams.get('eventId')

  const [draft, setDraft] = useState<Draft>(emptyDraft)
  const [errors, setErrors] = useState<Partial<Record<keyof EventDetailsData, string>>>({})
  const [createdEventId, setCreatedEventId] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(!!eventId)

  useEffect(() => {
    if (!eventId) return

    const loadEvent = async () => {
      try {
        const session = loadSession()
        const event = await getEventById(eventId, session?.accessToken)

        if (event) {
          const toDraftGift =
            (category: 'want' | 'nice' | 'avoid') =>
            (gift: (typeof event.gifts.want)[number], idx: number): DraftGift => ({
              // Keep the backend id so edits preserve existing reservations.
              id: gift.id || `tmp_${Math.random().toString(36).slice(2, 8)}`,
              eventId: 'draft',
              name: gift.name,
              description: gift.description,
              category,
              type: gift.type,
              quantity: gift.quantity,
              reservedQuantity: gift.reservedQuantity,
              suggestedAmounts: gift.suggestedAmounts,
              store: gift.whereToBuy,
              order: idx,
            })
          setDraft({
            step: 2,
            details: {
              type: event.type,
              gender: event.gender,
              name: event.name,
              date: event.date,
              message: event.message,
              backgroundImageUrl: event.backgroundImageUrl,
            },
            gifts: [
              ...event.gifts.want.map(toDraftGift('want')),
              ...event.gifts.nice.map(toDraftGift('nice')),
              ...event.gifts.avoid.map(toDraftGift('avoid')),
            ],
            collectGuestNames: event.collectGuestNames,
          })
          setCreatedEventId(event.slug)
        }
      } catch (err) {
        toast.error(t('common.errors.generic'))
      } finally {
        setIsLoading(false)
      }
    }

    loadEvent()
  }, [eventId, t, toast])

  const setStep = (step: number) =>
    setDraft((d) => ({ ...d, step: Math.max(1, Math.min(3, step)) }))

  const setDetails = (details: EventDetailsData) =>
    setDraft((d) => ({ ...d, details }))

  const setGifts = (gifts: DraftGift[]) => setDraft((d) => ({ ...d, gifts }))

  const setImageFile = (imageFile: File | undefined) =>
    setDraft((d) => ({ ...d, imageFile }))

  const validateStep1 = useCallback(() => {
    const next: Partial<Record<keyof EventDetailsData, string>> = {}
    if (!draft.details.name.trim() || draft.details.name.trim().length < 2)
      next.name = t('common.errors.tooShort')
    if (!draft.details.date) next.date = t('common.errors.required')
    setErrors(next)
    return Object.keys(next).length === 0
  }, [draft.details.name, draft.details.date, t])

  const goNext = () => {
    if (draft.step === 1 && !validateStep1()) return
    setStep(draft.step + 1)
    if (typeof window !== 'undefined') window.scrollTo({ top: 0, behavior: 'smooth' })
  }
  const goBack = () => {
    setStep(draft.step - 1)
    if (typeof window !== 'undefined') window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const publish = async () => {
    const session = loadSession()
    if (!user || !session?.accessToken) {
      toast.error(t('common.errors.generic'))
      throw new Error('not-authenticated')
    }
    try {
      let backgroundImageUrl: string | undefined

      if (draft.imageFile) {
        // Downscale/re-encode so the payload stays within the API's cap.
        backgroundImageUrl = await compressImageToDataUrl(draft.imageFile)
      }

      const eventPayload = {
        name: draft.details.name,
        type: draft.details.type,
        gender: draft.details.gender,
        userId: user.id,
        message: draft.details.message,
        backgroundImageUrl: backgroundImageUrl ?? draft.details.backgroundImageUrl,
        date: draft.details.date,
        collectGuestNames: draft.collectGuestNames,
        // Carry the backend gift id (when editing) so reservations survive.
        gifts: draft.gifts.map((g) => ({ ...g, serverId: g.id })),
      }

      const saved = eventId
        ? await updateEvent(eventId, eventPayload, session.accessToken)
        : await createEvent(eventPayload, session.accessToken)

      // The share URL uses the public slug, never the internal id.
      setCreatedEventId(saved?.slug ?? eventId ?? null)
      toast.success(
        eventId
          ? t('host.create.step3.successTitle', 'Event updated!')
          : t('host.create.step3.successTitle', 'Event created!')
      )
    } catch (err) {
      const message =
        err instanceof EventApiError
          ? err.message
          : t('common.errors.generic')
      toast.error(message)
      throw err
    }
  }

  if (isLoading) {
    return (
      <div className="mx-auto w-full max-w-2xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center justify-center gap-4">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-coral/20 border-t-coral" />
          <p className="text-sm text-dark-light">{t('common.buttons.retry')}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto w-full max-w-2xl px-4 pb-10 sm:px-6 lg:px-8">
      <StepIndicator
        current={draft.step}
        onJump={(s) => {
          if (s < draft.step) setStep(s)
        }}
      />

      <div className="pt-6">
        {draft.step === 1 ? (
          <EventDetailsStep
            value={draft.details}
            onChange={setDetails}
            onImageFileChange={setImageFile}
            onNext={goNext}
            errors={errors}
          />
        ) : draft.step === 2 ? (
          <GiftListStep
            gifts={draft.gifts}
            onChange={setGifts}
            collectGuestNames={draft.collectGuestNames}
            onCollectGuestNamesChange={(value) =>
              setDraft((d) => ({ ...d, collectGuestNames: value }))
            }
            onNext={goNext}
            onBack={goBack}
          />
        ) : (
          <ReviewStep
            details={draft.details}
            gifts={draft.gifts}
            id={createdEventId ?? ''}
            isEditing={!!eventId}
            onEdit={setStep}
            onBack={goBack}
            onPublish={publish}
          />
        )}
      </div>
    </div>
  )
}
