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
import { validateEventDetails } from '@/lib/validations/eventSchema'

interface Draft {
  step: number
  details: EventDetailsData
  gifts: DraftGift[]
  imageFile?: File
}

const emptyDraft: Draft = {
  step: 1,
  details: { type: 'wedding', name: '', date: '', message: '' },
  gifts: [],
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
  // Date the event had when loaded for editing. Keeping it unchanged is
  // allowed even if it is in the past; picking a new past date is not.
  const [initialDate, setInitialDate] = useState<string | undefined>(undefined)

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
              unlimited: gift.unlimited,
              reservedQuantity: gift.reservedQuantity,
              link: gift.whereToBuy,
              order: idx,
            })
          // `date` feeds an <input type="date">, which needs YYYY-MM-DD.
          const eventDate = event.date ? event.date.slice(0, 10) : ''
          setDraft({
            step: 2,
            details: {
              type: event.type,
              gender: event.gender,
              name: event.name,
              date: eventDate,
              message: event.message,
              backgroundImageUrl: event.backgroundImageUrl,
            },
            gifts: [
              ...event.gifts.want.map(toDraftGift('want')),
              ...event.gifts.nice.map(toDraftGift('nice')),
              ...event.gifts.avoid.map(toDraftGift('avoid')),
            ],
          })
          setInitialDate(eventDate)
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
    const keys = validateEventDetails(
      { name: draft.details.name, date: draft.details.date },
      initialDate,
    )
    const next: Partial<Record<keyof EventDetailsData, string>> = {}
    if (keys.name) next.name = t(keys.name)
    if (keys.date) next.date = t(keys.date)
    setErrors(next)
    return Object.keys(next).length === 0
  }, [draft.details.name, draft.details.date, initialDate, t])

  const goNext = () => {
    if (draft.step === 1 && !validateStep1()) return
    setErrors({})
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
    // A past date can only come from restored state (e.g. a stale draft);
    // publishing must never silently accept a newly picked one.
    if (!validateStep1()) {
      setStep(1)
      throw new Error('invalid-details')
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
