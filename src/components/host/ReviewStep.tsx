'use client'

import { useState } from 'react'
import { useTranslate } from '@tolgee/react'
import { Button } from '@/components/shared/Button'
import { formatDate } from '@/lib/utils/formatDate'
import { cn } from '@/lib/utils/cn'
import type { EventDetailsData } from './EventDetailsStep'
import type { Gift, GiftCategory } from '@/types/gift'

const CATEGORY_PILL_STYLE: Record<GiftCategory, string> = {
  want: 'border-success/70 bg-success/30 text-dark',
  nice: 'border-gold/70 bg-gold/30 text-dark',
  avoid: 'border-red-soft/80 bg-red-soft/30 text-dark',
}

const CATEGORY_ICON: Record<GiftCategory, string> = {
  want: '❤️',
  nice: '💛',
  avoid: '⛔',
}

interface Props {
  details: EventDetailsData
  gifts: Gift[]
  isEditing?: boolean
  onEdit: (step: number) => void
  onBack: () => void
  onPublish: () => Promise<void> | void
}

export function ReviewStep({ details, gifts, isEditing, onEdit, onBack, onPublish }: Props) {
  const { t } = useTranslate()
  const [publishing, setPublishing] = useState(false)

  const publish = async () => {
    setPublishing(true)
    try {
      // On success the parent navigates away (to the dashboard, with a
      // success modal there); on failure it surfaces a toast and we just
      // stop spinning so the user can retry.
      await onPublish()
    } catch {
      setPublishing(false)
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-2xl font-extrabold tracking-tight text-dark sm:text-3xl">
          {t('host.create.step3.title')}
        </h2>
      </div>

      <section className="overflow-hidden rounded-2xl bg-white shadow-card">
        {/* Cover preview: works for both a local blob URL (freshly picked
            file) and a stored https/data URL on an existing event. */}
        {details.backgroundImageUrl ? (
          // Local blob/data-URL preview; next/image cannot optimize these.
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={details.backgroundImageUrl}
            alt=""
            className="h-40 w-full object-cover sm:h-48"
          />
        ) : null}
        <div className="p-5">
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
            <Row label={t('host.create.step1.nameLabel')} value={details.name || '—'} />
            <Row label={t('host.create.step1.dateLabel')} value={details.date ? formatDate(details.date) : '—'} />
          </dl>
          {details.message.trim() ? (
            <div className="mt-3 border-t border-gray-light pt-3">
              <dt className="text-xs font-semibold uppercase tracking-wide text-dark-light">
                {t('host.create.step1.messageLabel')}
              </dt>
              <dd className="mt-0.5 whitespace-pre-line break-words text-sm text-dark">
                {details.message.trim()}
              </dd>
            </div>
          ) : null}
        </div>
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
        <div className="flex flex-wrap gap-2">
          {gifts.map((g) => (
            <span
              key={g.id}
              className={cn(
                'rounded-full border-2 px-3 py-1 text-sm font-semibold',
                CATEGORY_PILL_STYLE[g.category],
              )}
            >
              {CATEGORY_ICON[g.category]} {g.name}
            </span>
          ))}
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
