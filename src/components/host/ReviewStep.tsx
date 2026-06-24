'use client'

import { useState } from 'react'
import { useTranslate } from '@tolgee/react'
import { Button } from '@/components/shared/Button'
import { Input } from '@/components/shared/Input'
import { Modal } from '@/components/shared/Modal'
import { useToast } from '@/components/shared/Toast'
import { formatDate } from '@/lib/utils/formatDate'
import type { EventDetailsData } from './EventDetailsStep'
import type { Gift } from '@/types/gift'

interface Props {
  details: EventDetailsData
  gifts: Gift[]
  id: string
  isEditing?: boolean
  onEdit: (step: number) => void
  onBack: () => void
  onPublish: () => Promise<void> | void
}

export function ReviewStep({ details, gifts, id, isEditing, onEdit, onBack, onPublish }: Props) {
  const { t } = useTranslate()
  const toast = useToast()
  const [publishing, setPublishing] = useState(false)
  const [done, setDone] = useState(false)

  const publish = async () => {
    setPublishing(true)
    try {
      await onPublish()
      setDone(true)
    } catch {
      // Parent surfaces the error via toast; keep the modal closed.
    } finally {
      setPublishing(false)
    }
  }

  const url =
    typeof window !== 'undefined' ? `${window.location.origin}/event/${id}` : `/event/${id}`

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(url)
      toast.success(t('common.buttons.copied'))
    } catch {
      toast.error(t('common.errors.generic'))
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-2xl font-extrabold tracking-tight text-dark sm:text-3xl">
          {t('host.create.step3.title')}
        </h2>
      </div>

      <section className="rounded-2xl bg-white p-5 shadow-card">
        <header className="mb-3 flex items-center justify-between">
          <h3 className="text-base font-extrabold tracking-tight text-dark">
            {t('host.create.step3.details')}
          </h3>
          <button
            type="button"
            onClick={() => onEdit(1)}
            className="text-sm font-semibold text-coral hover:text-coral-dark"
          >
            {t('common.buttons.edit')}
          </button>
        </header>
        <dl className="grid grid-cols-1 gap-2 text-sm sm:grid-cols-2">
          <Row label={t('host.create.step1.typeLabel')} value={t(`eventTypes.${details.type}`)} />
          {details.gender && (
            <Row
              label={t('host.create.step1.genderLabel')}
              value={t(`host.create.step1.gender${details.gender.charAt(0).toUpperCase() + details.gender.slice(1)}`)}
            />
          )}
          <Row label={t('host.create.step1.nameLabel')} value={details.name || '—'} />
          <Row label={t('host.create.step1.dateLabel')} value={details.date ? formatDate(details.date) : '—'} />
        </dl>
      </section>

      <section className="rounded-2xl bg-white p-5 shadow-card">
        <header className="mb-3 flex items-center justify-between">
          <h3 className="text-base font-extrabold tracking-tight text-dark">
            {t('host.create.step3.giftsCount')}
          </h3>
          <button
            type="button"
            onClick={() => onEdit(2)}
            className="text-sm font-semibold text-coral hover:text-coral-dark"
          >
            {t('common.buttons.edit')}
          </button>
        </header>
        <div className="text-sm text-dark-light">
          ❤️ {gifts.filter((g) => g.category === 'want').length} · 💛{' '}
          {gifts.filter((g) => g.category === 'nice').length} · ⛔{' '}
          {gifts.filter((g) => g.category === 'avoid').length}
        </div>
      </section>

      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-between">
        <Button variant="outline" onClick={onBack} fullWidth className="sm:w-auto">
          ← {t('common.buttons.back')}
        </Button>
        <Button onClick={publish} loading={publishing} size="lg" fullWidth className="sm:w-auto">
          {isEditing ? t('host.create.step3.update') : t('common.buttons.publish')}
        </Button>
      </div>

      <Modal
        open={done}
        onClose={() => setDone(false)}
        title={isEditing ? t('host.create.step3.updateTitle') : t('host.create.step3.successTitle')}
        hideClose
      >
        <div className="flex flex-col gap-5 py-2">
          <div className="flex flex-col items-center gap-3 text-center">
            <div className="text-5xl" aria-hidden="true">
              🎉
            </div>
            <p className="text-sm text-dark-light">
              {t('host.create.step3.successDesc')}
            </p>
          </div>

          <div className="rounded-xl bg-bg p-3">
            <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-dark-light">
              {t('host.create.step3.eventLink')}
            </div>
            <div className="flex flex-col gap-2 sm:flex-row">
              <Input
                value={url}
                readOnly
                onFocus={(e) => e.currentTarget.select()}
                containerClassName="flex-1"
              />
              <Button variant="dark" onClick={copyLink} type="button">
                📋 {t('common.buttons.copy')}
              </Button>
            </div>
          </div>

          <div className="flex flex-col gap-2 sm:flex-row sm:justify-center">
            <Button href="/dashboard" fullWidth className="sm:w-auto">
              {t('host.dashboard.title')}
            </Button>
          </div>

          <p className="rounded-xl bg-bg p-3 text-center text-xs text-dark-light">
            {t('host.create.step3.referral')}
          </p>
        </div>
      </Modal>
    </div>
  )
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-0.5">
      <dt className="text-xs font-semibold uppercase tracking-wide text-dark-light">{label}</dt>
      <dd className="text-sm font-semibold text-dark">{value}</dd>
    </div>
  )
}
