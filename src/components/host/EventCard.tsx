'use client'

import Link from 'next/link'
import { useTranslate } from '@tolgee/react'
import type { Event } from '@/types/event'
import { formatDateShort } from '@/lib/utils/formatDate'

const ICONS: Record<Event['type'], string> = {
  wedding: '💒',
  birthday: '🎂',
  baptism: '👶',
  patrons_day: '🕯️',
  other: '✨',
}

interface EventCardProps {
  event: Event
  reservedCount: number
  totalGifts: number
  onDelete: (id: string) => void
  onShare: (slug: string) => void
}

export function EventCard({ event, reservedCount, totalGifts, onDelete, onShare }: EventCardProps) {
  const { t } = useTranslate()
  const icon = ICONS[event.type]

  return (
    <article className="flex flex-col overflow-hidden rounded-2xl bg-white shadow-card transition-shadow hover:shadow-card-hover">
      <div
        className="relative h-28 w-full bg-gradient-to-br from-coral to-gold"
        style={
          event.backgroundImageUrl
            ? { backgroundImage: `url(${event.backgroundImageUrl})`, backgroundSize: 'cover', backgroundPosition: 'center' }
            : undefined
        }
        aria-hidden="true"
      >
        <div className="absolute inset-0 bg-gradient-to-t from-dark/55 to-transparent" />
        <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between text-white">
          <span className="text-2xl" aria-hidden="true">
            {icon}
          </span>
          <span className="rounded-full bg-white/20 px-3 py-1 text-xs font-semibold backdrop-blur">
            {formatDateShort(event.date)}
          </span>
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-3 p-5">
        <h3 className="text-lg font-extrabold tracking-tight text-dark">{event.name}</h3>
        <p className="text-sm text-dark-light">
          {reservedCount} / {totalGifts} {t('host.dashboard.stats.reserved').toLowerCase()}
        </p>

        <div className="mt-auto flex flex-wrap gap-2">
          <Link
            href={`/event/${event.slug}`}
            className="inline-flex h-10 min-w-[88px] items-center justify-center rounded-full bg-coral px-4 text-sm font-semibold text-white shadow-cta transition-all hover:bg-coral-dark"
          >
            {t('host.dashboard.actions.view')}
          </Link>
          <Link
            href={`/create?id=${event.id}`}
            className="inline-flex h-10 items-center justify-center rounded-full border-2 border-gray-light px-4 text-sm font-semibold text-dark transition-colors hover:border-coral hover:text-coral"
          >
            {t('host.dashboard.actions.edit')}
          </Link>
          <button
            type="button"
            onClick={() => onShare(event.slug)}
            className="inline-flex h-10 items-center justify-center rounded-full border-2 border-gray-light px-4 text-sm font-semibold text-dark transition-colors hover:border-coral hover:text-coral"
          >
            {t('host.dashboard.actions.share')}
          </button>
          <button
            type="button"
            onClick={() => onDelete(event.id)}
            className="inline-flex h-10 items-center justify-center rounded-full px-3 text-sm font-semibold text-dark-light transition-colors hover:text-coral"
            aria-label={t('host.dashboard.actions.delete')}
          >
            🗑
          </button>
        </div>
      </div>
    </article>
  )
}
