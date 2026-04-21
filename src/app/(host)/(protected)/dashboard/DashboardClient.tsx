'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { useTranslate } from '@tolgee/react'
import { useCurrentUser } from '@/lib/auth/useCurrentUser'
import { cn } from '@/lib/utils/cn'
import type { Event, EventType } from '@/types/event'

// ---------------------------------------------------------------------------
// Mock events — replace with real API call when the backend is ready
// ---------------------------------------------------------------------------
const TODAY = new Date()
const d = (offset: number) => {
  const date = new Date(TODAY)
  date.setDate(date.getDate() + offset)
  return date.toISOString().split('T')[0]!
}

const MOCK_EVENTS: Event[] = [
  { id: '1', slug: 'svadba-ane-i-marka', type: 'wedding',   name: "Ana & Marko's Wedding",   date: d(30),  message: 'Join us!',       hostId: 'usr_1', createdAt: d(-10), updatedAt: d(-10) },
  { id: '2', slug: 'rodjendane-luke',    type: 'birthday',  name: "Luka's 1st Birthday",      date: d(10),  message: 'Come celebrate!', hostId: 'usr_1', createdAt: d(-5),  updatedAt: d(-5)  },
  { id: '3', slug: 'krstenje-sofije',    type: 'baptism',   name: "Sofia's Baptism",          date: d(-15), message: 'Thank you!',      hostId: 'usr_1', createdAt: d(-20), updatedAt: d(-20) },
  { id: '4', slug: 'slava-petrovic',     type: 'patrons_day', name: "Petrović Family Slava",  date: d(-3),  message: 'You are welcome!', hostId: 'usr_1', createdAt: d(-30), updatedAt: d(-30) },
  { id: '5', slug: 'rodjendane-jelene',  type: 'birthday',  name: "Jelena's 30th Birthday",   date: d(60),  message: 'Big party!',       hostId: 'usr_1', createdAt: d(-2),  updatedAt: d(-2)  },
  { id: '6', slug: 'svadba-dusana',      type: 'wedding',   name: "Dušan & Milica's Wedding", date: d(-45), message: 'Thank you all!',   hostId: 'usr_1', createdAt: d(-60), updatedAt: d(-60) },
]

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
type StatusFilter = 'all' | 'active' | 'past'

const EVENT_TYPE_EMOJIS: Record<EventType, string> = {
  wedding:     '💒',
  birthday:    '🎂',
  baptism:     '👶',
  patrons_day: '🕯️',
  other:       '✨',
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------
export function DashboardClient() {
  const { t } = useTranslate()
  const { user } = useCurrentUser()

  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all')
  const [typeFilter, setTypeFilter] = useState<EventType | 'all'>('all')

  // Derive unique event types present in the data for the type filter pills
  const availableTypes = useMemo(
    () => Array.from(new Set(MOCK_EVENTS.map((e) => e.type))),
    [],
  )

  // Apply both filters
  const filtered = useMemo(() => {
    return MOCK_EVENTS.filter((event) => {
      const eventDate = new Date(event.date)
      const isActive = eventDate >= TODAY

      if (statusFilter === 'active' && !isActive) return false
      if (statusFilter === 'past' && isActive) return false
      if (typeFilter !== 'all' && event.type !== typeFilter) return false

      return true
    })
  }, [statusFilter, typeFilter])

  const STATUS_TABS: { key: StatusFilter; label: string }[] = [
    { key: 'all',    label: t('host.dashboard.filters.all') },
    { key: 'active', label: t('host.dashboard.filters.active') },
    { key: 'past',   label: t('host.dashboard.filters.past') },
  ]

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-dark">
            {t('host.dashboard.title')}
          </h1>
          {user?.name && (
            <p className="mt-0.5 text-sm text-dark-light">
              {user.name}
            </p>
          )}
        </div>
        <Link
          href="/create"
          className="inline-flex h-10 items-center gap-1.5 rounded-full bg-coral px-5 text-sm font-semibold text-white transition-colors hover:bg-coral-dark"
        >
          ✨ {t('nav.create')}
        </Link>
      </div>

      {/* Status filter tabs */}
      <div className="mb-4 flex gap-1 rounded-full border border-gray-light bg-white p-1 w-fit">
        {STATUS_TABS.map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setStatusFilter(tab.key)}
            className={cn(
              'rounded-full px-4 py-1.5 text-sm font-semibold transition-colors',
              statusFilter === tab.key
                ? 'bg-coral text-white shadow-sm'
                : 'text-dark-light hover:text-dark',
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Event type pills */}
      <div className="mb-6 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setTypeFilter('all')}
          className={cn(
            'rounded-full border px-3 py-1 text-xs font-semibold transition-colors',
            typeFilter === 'all'
              ? 'border-dark bg-dark text-white'
              : 'border-gray-light text-dark-light hover:border-dark hover:text-dark',
          )}
        >
          {t('host.dashboard.filters.all')}
        </button>
        {availableTypes.map((type) => (
          <button
            key={type}
            type="button"
            onClick={() => setTypeFilter(type)}
            className={cn(
              'rounded-full border px-3 py-1 text-xs font-semibold transition-colors',
              typeFilter === type
                ? 'border-coral bg-coral/10 text-coral'
                : 'border-gray-light text-dark-light hover:border-coral hover:text-coral',
            )}
          >
            {EVENT_TYPE_EMOJIS[type]} {t(`eventTypes.${type}`)}
          </button>
        ))}
      </div>

      {/* Event list */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-3xl border-2 border-dashed border-gray-light py-16 text-center">
          <span className="text-4xl">📭</span>
          <p className="font-semibold text-dark">{t('host.dashboard.emptyTitle')}</p>
          <p className="text-sm text-dark-light">{t('host.dashboard.emptyDesc')}</p>
          <Link
            href="/create"
            className="mt-2 inline-flex h-10 items-center rounded-full bg-coral px-5 text-sm font-semibold text-white hover:bg-coral-dark"
          >
            {t('common.buttons.createFirst')}
          </Link>
        </div>
      ) : (
        <ul className="flex flex-col gap-3">
          {filtered.map((event) => (
            <EventCard key={event.id} event={event} />
          ))}
        </ul>
      )}
    </div>
  )
}

// ---------------------------------------------------------------------------
// EventCard sub-component
// ---------------------------------------------------------------------------
function EventCard({ event }: { event: Event }) {
  const { t } = useTranslate()
  const eventDate = new Date(event.date)
  const isPast = eventDate < TODAY
  const daysFromNow = Math.round((eventDate.getTime() - TODAY.getTime()) / (1000 * 60 * 60 * 24))

  const dateLabel = isPast
    ? `${Math.abs(daysFromNow)} days ago`
    : daysFromNow === 0
    ? 'Today'
    : `In ${daysFromNow} days`

  return (
    <li className="flex items-start gap-3 rounded-2xl border border-gray-light bg-white p-4 shadow-card transition-shadow hover:shadow-card-hover">
      {/* Type icon */}
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-coral/15 to-gold/15 text-2xl">
        {EVENT_TYPE_EMOJIS[event.type]}
      </div>

      {/* Info + actions */}
      <div className="min-w-0 flex-1">
        {/* Name + status badge */}
        <div className="flex items-center gap-2">
          <p className="truncate font-semibold text-dark">{event.name}</p>
          <span className={cn(
            'shrink-0 rounded-full px-2 py-0.5 text-xs font-semibold',
            isPast ? 'bg-gray-light text-dark-light' : 'bg-coral/10 text-coral',
          )}>
            {isPast ? t('host.dashboard.filters.past') : t('host.dashboard.filters.active')}
          </span>
        </div>

        {/* Meta row — wraps naturally on narrow screens */}
        <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-dark-light">
          <span>{new Date(event.date).toLocaleDateString()}</span>
          <span aria-hidden="true">·</span>
          <span className={isPast ? 'text-dark-light' : 'text-coral font-medium'}>
            {dateLabel}
          </span>
          <span aria-hidden="true">·</span>
          <span className="capitalize">{t(`eventTypes.${event.type}`)}</span>
        </div>

        {/* Action */}
        <div className="mt-2">
          <Link
            href={`/event/${event.slug}`}
            className="inline-flex rounded-full bg-gray-light/60 px-3 py-1 text-xs font-semibold text-dark-light transition-colors hover:bg-gray-light hover:text-dark"
          >
            {t('host.dashboard.actions.view')}
          </Link>
        </div>
      </div>
    </li>
  )
}
