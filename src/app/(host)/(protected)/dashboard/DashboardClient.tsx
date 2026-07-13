'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { useTranslate } from '@tolgee/react'
import { useCurrentUser } from '@/lib/auth/useCurrentUser'
import { loadSession } from '@/lib/auth/session'
import { useToast } from '@/components/shared/Toast'
import { Modal } from '@/components/shared/Modal'
import { Button } from '@/components/shared/Button'
import { getMyEvents, deleteEvent, EventApiError } from '@/lib/api/events'
import { getEventEmoji } from '@/lib/utils/eventEmoji'
import { cn } from '@/lib/utils/cn'
import type { Event, EventType } from '@/types/event'

const TODAY = new Date()

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
type StatusFilter = 'all' | 'active' | 'past'

// Calendar-aware {years, months, days} diff. `from` and `to` should already
// be normalized to local-midnight to avoid time-of-day rounding errors.
function diffYMD(from: Date, to: Date) {
  let y = to.getFullYear() - from.getFullYear()
  let m = to.getMonth() - from.getMonth()
  let d = to.getDate() - from.getDate()
  if (d < 0) {
    // Borrow from previous month to avoid negative days
    m -= 1
    d += new Date(to.getFullYear(), to.getMonth(), 0).getDate()
  }
  if (m < 0) {
    y -= 1
    m += 12
  }
  return { y, m, d }
}

// Localizable descriptor for "how far away is this date", reduced to the
// largest unit. The time.* translation keys carry the ICU plural forms.
function timeUntilDescriptor(
  target: Date,
  now: Date,
): { key: string; params?: { n: number } } {
  const startOf = (date: Date) =>
    new Date(date.getFullYear(), date.getMonth(), date.getDate())
  const t = startOf(target)
  const n = startOf(now)
  if (+t === +n) return { key: 'time.today' }

  const past = t < n
  const { y, m, d } = diffYMD(past ? t : n, past ? n : t)
  if (y === 0 && m === 0 && d === 1) return { key: past ? 'time.yesterday' : 'time.tomorrow' }

  if (y > 0) return { key: past ? 'time.yearsAgo' : 'time.inYears', params: { n: y } }
  if (m > 0) return { key: past ? 'time.monthsAgo' : 'time.inMonths', params: { n: m } }
  return { key: past ? 'time.daysAgo' : 'time.inDays', params: { n: Math.max(1, d) } }
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------
export function DashboardClient() {
  const { t } = useTranslate()
  const { user, ready } = useCurrentUser()
  const toast = useToast()

  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all')
  const [typeFilter, setTypeFilter] = useState<EventType | 'all'>('all')
  const [origin, setOrigin] = useState('')

  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Event | null>(null)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    if (typeof window !== 'undefined') setOrigin(window.location.origin)
  }, [])

  const fetchEvents = useCallback(() => {
    const session = loadSession()
    const token = session?.accessToken ?? ''
    setLoading(true)
    setErrorMessage(null)
    return getMyEvents(token)
      .then(setEvents)
      .catch((err: unknown) => {
        const message = err instanceof Error ? err.message : t('common.errors.generic')
        setErrorMessage(message)
      })
      .finally(() => setLoading(false))
  }, [t])

  useEffect(() => {
    if (!ready) return
    if (!user) {
      setEvents([])
      setLoading(false)
      return
    }
    fetchEvents()
  }, [ready, user, fetchEvents])

  const confirmDelete = async () => {
    if (!deleteTarget || deleting) return
    const session = loadSession()
    if (!session?.accessToken) return
    setDeleting(true)
    try {
      await deleteEvent(deleteTarget.id, session.accessToken)
      setEvents((prev) => prev.filter((e) => e.id !== deleteTarget.id))
      setDeleteTarget(null)
      toast.success(t('host.dashboard.deleteSuccess'))
    } catch (err) {
      const message =
        err instanceof EventApiError ? err.message : t('common.errors.generic')
      toast.error(message)
    } finally {
      setDeleting(false)
    }
  }

  const availableTypes = useMemo(
    () => Array.from(new Set(events.map((e) => e.type))),
    [events],
  )

  const filtered = useMemo(() => {
    return events.filter((event) => {
      const eventDate = new Date(event.date)
      const isActive = eventDate >= TODAY

      if (statusFilter === 'active' && !isActive) return false
      if (statusFilter === 'past' && isActive) return false
      if (typeFilter !== 'all' && event.type !== typeFilter) return false

      return true
    })
  }, [events, statusFilter, typeFilter])

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
            {getEventEmoji(type)} {t(`eventTypes.${type}`)}
          </button>
        ))}
      </div>

      {/* Event list */}
      {loading ? (
        <ul className="flex flex-col gap-3" aria-busy="true" aria-live="polite">
          {Array.from({ length: 3 }).map((_, i) => (
            <li
              key={i}
              className="flex items-start gap-3 rounded-2xl border border-gray-light bg-white p-4 shadow-card"
            >
              <div className="h-11 w-11 shrink-0 animate-pulse rounded-xl bg-gray-light" />
              <div className="flex-1 space-y-2">
                <div className="h-4 w-2/3 animate-pulse rounded bg-gray-light" />
                <div className="h-3 w-1/2 animate-pulse rounded bg-gray-light" />
                <div className="h-7 w-full animate-pulse rounded-md bg-gray-light/70" />
              </div>
            </li>
          ))}
        </ul>
      ) : errorMessage ? (
        <div className="flex flex-col items-center gap-3 rounded-3xl border border-red-soft bg-red-soft/10 py-12 text-center">
          <span className="text-3xl">⚠️</span>
          <p className="px-6 text-sm text-dark">{errorMessage}</p>
          <button
            type="button"
            onClick={() => fetchEvents()}
            className="rounded-full bg-coral px-4 py-1.5 text-sm font-semibold text-white hover:bg-coral-dark"
          >
            {t('common.buttons.retry')}
          </button>
        </div>
      ) : filtered.length === 0 ? (
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
            <EventCard
              key={event.id}
              event={event}
              origin={origin}
              onDelete={() => setDeleteTarget(event)}
            />
          ))}
        </ul>
      )}

      {/* Delete confirmation */}
      <Modal
        open={!!deleteTarget}
        onClose={() => {
          if (!deleting) setDeleteTarget(null)
        }}
        title={t('host.dashboard.deleteTitle')}
      >
        <div className="flex flex-col gap-4">
          <p className="text-sm text-dark">
            {t('host.dashboard.deleteConfirm')}{' '}
            <strong className="break-words">{deleteTarget?.name}</strong>?
          </p>
          <p className="rounded-xl bg-red-soft/15 px-3 py-2 text-xs text-dark">
            ⚠️ {t('host.dashboard.deleteWarning')}
          </p>
          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <Button
              variant="outline"
              type="button"
              onClick={() => setDeleteTarget(null)}
              disabled={deleting}
            >
              {t('common.buttons.cancel')}
            </Button>
            <Button
              type="button"
              variant="dark"
              onClick={confirmDelete}
              loading={deleting}
              disabled={deleting}
            >
              🗑 {t('common.buttons.delete')}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}

// ---------------------------------------------------------------------------
// EventCard sub-component
// ---------------------------------------------------------------------------
function EventCard({
  event,
  origin,
  onDelete,
}: {
  event: Event
  origin: string
  onDelete: () => void
}) {
  const { t } = useTranslate()
  const toast = useToast()
  const eventDate = new Date(event.date)
  const isPast = eventDate < TODAY
  const { key: dateKey, params: dateParams } = timeUntilDescriptor(eventDate, TODAY)
  const dateLabel = dateParams ? t(dateKey, dateParams) : t(dateKey)

  const eventUrl = origin ? `${origin}/event/${event.slug}` : `/event/${event.slug}`
  const reserved = event.stats?.reserved ?? 0
  const desired = event.stats?.desired ?? 0

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(eventUrl)
      toast.success(t('common.buttons.copied'))
    } catch {
      toast.error(t('common.errors.generic'))
    }
  }

  const shareLink = async () => {
    if (typeof navigator !== 'undefined' && 'share' in navigator) {
      try {
        await (navigator as Navigator & { share: (data: ShareData) => Promise<void> }).share({
          title: event.name,
          url: eventUrl,
        })
        return
      } catch {
        // User dismissed, fall back to copy
      }
    }
    await copyLink()
  }

  return (
    <li className="group relative flex items-start gap-3 overflow-hidden rounded-2xl border border-gray-light bg-white p-4 pt-5 shadow-card transition-all duration-200 hover:-translate-y-0.5 hover:border-coral/40 hover:shadow-card-hover focus-within:ring-2 focus-within:ring-coral/40">
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-coral via-coral-light to-gold"
      />

      {/* Stretched link opens the host overview (stats, reservations).
          Sits behind interactive children (z-[1]) so buttons and links still work. */}
      <Link
        href={`/event/${event.id}/overview`}
        aria-label={`${t('host.event.viewTitle', 'Event details')} - ${event.name}`}
        className="absolute inset-0 rounded-2xl focus:outline-none focus-visible:ring-2 focus-visible:ring-coral"
      >
        <span className="sr-only">
          {t('host.event.viewTitle', 'Event details')} - {event.name}
        </span>
      </Link>

      {/* Type icon */}
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-coral/15 to-gold/15 text-2xl">
        {getEventEmoji(event.type, event.gender)}
      </div>

      {/* Info + actions */}
      <div className="min-w-0 flex-1">
        {/* Name + status badge */}
        <div className="flex items-center gap-2">
          <p className="truncate font-semibold text-dark transition-colors group-hover:text-coral">
            {event.name}
          </p>
          <span className={cn(
            'shrink-0 rounded-full px-2 py-0.5 text-xs font-semibold',
            isPast ? 'bg-gray-light text-dark-light' : 'bg-coral/10 text-coral',
          )}>
            {isPast ? t('host.dashboard.filters.past') : t('host.dashboard.filters.active')}
          </span>
        </div>

        {/* Meta row wraps naturally on narrow screens */}
        <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-dark-light">
          <span>{new Date(event.date).toLocaleDateString()}</span>
          <span aria-hidden="true">·</span>
          <span className={isPast ? 'text-dark-light' : 'text-coral font-medium'}>
            {dateLabel}
          </span>
          <span aria-hidden="true">·</span>
          <span className="capitalize">{t(`eventTypes.${event.type}`)}</span>
        </div>

        {/* Reservation progress */}
        {desired > 0 ? (
          <div className="mt-2 flex items-center gap-2">
            <div
              className="h-1.5 flex-1 overflow-hidden rounded-full bg-gray-light/60"
              role="progressbar"
              aria-valuemin={0}
              aria-valuemax={desired}
              aria-valuenow={reserved}
              aria-label={t('host.event.progress.reserved')}
            >
              <div
                className="h-full rounded-full bg-gradient-to-r from-coral to-gold transition-all"
                style={{ width: `${Math.min(100, (reserved / desired) * 100)}%` }}
              />
            </div>
            <span className="shrink-0 text-xs font-semibold text-dark-light">
              🎁 {reserved}/{desired}
            </span>
          </div>
        ) : null}

        {/* Event link */}
        <div className="mt-2.5 flex flex-col gap-2">
          <span
            className="block w-full truncate rounded-md bg-bg px-2.5 py-1.5 text-xs text-dark-light"
            title={eventUrl}
          >
            {eventUrl}
          </span>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={copyLink}
              className="relative z-[1] block flex-1 rounded-full bg-coral/10 px-3 py-1.5 text-xs font-semibold text-coral transition-colors hover:bg-coral/20"
            >
              📋 {t('host.dashboard.actions.copyLink')}
            </button>
            <button
              type="button"
              onClick={shareLink}
              className="relative z-[1] block flex-1 rounded-full bg-coral px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-coral-dark"
            >
              📤 {t('host.event.share')}
            </button>
          </div>
        </div>

        {/* Secondary actions */}
        <div className="mt-2 flex flex-wrap items-center gap-2">
          <Link
            href={`/event/${event.slug}`}
            className="relative z-[1] inline-flex items-center gap-1 rounded-full bg-gray-light/60 px-3 py-1 text-xs font-semibold text-dark-light transition-colors hover:bg-gray-light hover:text-dark"
          >
            👁️ {t('host.dashboard.actions.view')}
          </Link>
          <button
            type="button"
            onClick={onDelete}
            className="relative z-[1] inline-flex items-center gap-1 rounded-full bg-red-soft/20 px-3 py-1 text-xs font-semibold text-dark transition-colors hover:bg-red-soft/40"
            aria-label={`${t('common.buttons.delete')} - ${event.name}`}
          >
            🗑 {t('common.buttons.delete')}
          </button>
          <Link
            href={`/create?eventId=${event.id}`}
            className="relative z-[1] ml-auto inline-flex items-center gap-1 rounded-full bg-coral px-3 py-1 text-xs font-semibold text-white shadow-sm transition-transform hover:translate-x-0.5"
          >
            ✏️ {t('host.dashboard.actions.manage')} →
          </Link>
        </div>
      </div>
    </li>
  )
}
