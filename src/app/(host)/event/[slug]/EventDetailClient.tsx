'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { useTranslate } from '@tolgee/react'
import { Button } from '@/components/shared/Button'
import { useToast } from '@/components/shared/Toast'
import { useCurrentUser } from '@/lib/auth/useCurrentUser'
import { loadSession } from '@/lib/auth/session'
import {
  getEventById,
  type EventDetail,
  type DetailGift,
} from '@/lib/api/events'
import { usePublishEventViewMode } from '@/lib/state/eventViewMode'
import { getEventEmoji } from '@/lib/utils/eventEmoji'
import { cn } from '@/lib/utils/cn'

interface Props {
  slug: string
}

// Host-facing event overview: reservation status, share actions, and a
// read-only gift list. All editing happens in the create wizard
// (`/create?eventId=...`).
export function EventDetailClient({ slug }: Props) {
  const { t } = useTranslate()
  const toast = useToast()
  const { user, ready } = useCurrentUser()

  const [event, setEvent] = useState<EventDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [origin, setOrigin] = useState('')

  useEffect(() => {
    if (typeof window !== 'undefined') setOrigin(window.location.origin)
  }, [])

  useEffect(() => {
    if (!ready) return
    let cancelled = false
    setLoading(true)
    setErrorMessage(null)

    const session = loadSession()
    getEventById(slug, session?.accessToken)
      .then((detail) => {
        if (cancelled) return
        setEvent(detail)
      })
      .catch((err: unknown) => {
        if (cancelled) return
        const message = err instanceof Error ? err.message : t('common.errors.generic')
        setErrorMessage(message)
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [ready, slug, t])

  // Share the public slug, never the internal id (this page is opened with
  // the Mongo id, which must not appear in guest-facing links).
  const shareSlug = event?.slug ?? slug
  const eventUrl = useMemo(
    () => (origin ? `${origin}/event/${shareSlug}` : `/event/${shareSlug}`),
    [origin, shareSlug],
  )

  const isHost = !!user && !!event && user.id === event.hostId
  const showNotHostBanner = !!event && ready && !isHost

  // Lock the language switcher in the navbar when the visitor isn't the host.
  // While auth/event are still resolving we publish `null` to avoid flicker.
  usePublishEventViewMode(!ready || !event ? null : isHost ? 'editor' : 'viewer')

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
          title: event?.name ?? 'PokloniMi',
          url: eventUrl,
        })
        return
      } catch {
        // User dismissed, fall back to copy
      }
    }
    await copyLink()
  }

  if (loading) {
    return <DetailSkeleton />
  }

  if (errorMessage) {
    return (
      <Shell>
        <div className="flex flex-col items-center gap-3 rounded-3xl border border-red-soft bg-red-soft/10 py-12 text-center">
          <span className="text-3xl">⚠️</span>
          <p className="px-6 text-sm text-dark">{errorMessage}</p>
          <Link href="/dashboard" className="text-sm font-semibold text-coral hover:text-coral-dark">
            ← {t('host.dashboard.title')}
          </Link>
        </div>
      </Shell>
    )
  }

  if (!event) {
    return (
      <Shell>
        <div className="flex flex-col items-center gap-3 rounded-3xl border-2 border-dashed border-gray-light py-16 text-center">
          <span className="text-4xl">🔍</span>
          <p className="font-semibold text-dark">
            {t('host.event.notFound.title')}
          </p>
          <p className="px-6 text-sm text-dark-light">
            {t('host.event.notFound.desc')}
          </p>
          <Link href="/dashboard" className="text-sm font-semibold text-coral hover:text-coral-dark">
            ← {t('host.dashboard.title')}
          </Link>
        </div>
      </Shell>
    )
  }

  return (
    <Shell>
      {showNotHostBanner ? (
        <div className="mb-4 flex items-center justify-between gap-3 rounded-2xl border border-gold/40 bg-gold/10 px-4 py-3 text-sm text-dark">
          <span>
            {t('host.event.notHostBanner')}
          </span>
          <Link
            href={`/event/${shareSlug}`}
            className="shrink-0 text-sm font-semibold text-coral hover:text-coral-dark"
          >
            {t('host.event.openView')} →
          </Link>
        </div>
      ) : null}

      {/* Hero */}
      <section className="relative overflow-hidden rounded-3xl border border-gray-light bg-white p-6 shadow-card sm:p-8">
        <div className="absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r from-coral via-coral-light to-gold" />
        <div className="flex flex-col gap-5">
          <div className="flex items-start gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-coral/15 to-gold/15 text-3xl">
              {getEventEmoji(event.type, event.gender)}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-dark-light">
                {t('host.event.viewTitle', 'Event details')}
              </p>
              <h1 className="mt-1 break-words text-2xl font-extrabold tracking-tight text-dark sm:text-3xl">
                {event.name}
              </h1>
              <p className="mt-1 text-sm text-dark-light">
                {new Date(event.date).toLocaleDateString()} · {t(`eventTypes.${event.type}`)}
              </p>
            </div>
            {isHost ? (
              <Link
                href={`/create?eventId=${event.id}`}
                className="shrink-0 rounded-full border-2 border-gray-light bg-white px-3 py-1.5 text-xs font-semibold text-dark transition-colors hover:border-coral hover:text-coral"
              >
                ✏️ {t('host.event.editAction')}
              </Link>
            ) : null}
          </div>

          <div className="flex flex-col gap-2 sm:flex-row">
            <Button variant="coral" size="md" onClick={shareLink} fullWidth className="sm:w-auto">
              📤 {t('host.event.share')}
            </Button>
            <Button variant="outline" size="md" onClick={copyLink} fullWidth className="sm:w-auto">
              📋 {t('host.dashboard.actions.copyLink')}
            </Button>
            <Button
              variant="outline"
              size="md"
              href={`/event/${shareSlug}`}
              fullWidth
              className="sm:w-auto"
            >
              👁️ {t('host.dashboard.actions.view')}
            </Button>
          </div>

          <div
            className="rounded-xl bg-bg px-3 py-2 text-xs text-dark-light"
            title={eventUrl}
          >
            <span className="block truncate">{eventUrl}</span>
          </div>
        </div>
      </section>

      {/* Reservation status (host only) */}
      {isHost ? <HostGiftStatus event={event} /> : null}

      {/* Gifts (read-only; editing happens in the wizard) */}
      <section className="mt-6 flex flex-col gap-4">
        <header className="flex items-end justify-between">
          <h2 className="text-lg font-extrabold tracking-tight text-dark sm:text-xl">
            {t('host.event.giftsTitle')}
          </h2>
          <span className="text-xs font-semibold text-dark-light">
            {event.gifts.want.length + event.gifts.nice.length + event.gifts.avoid.length}{' '}
            {t('host.event.giftsCount')}
          </span>
        </header>

        <GiftList
          palette="want"
          icon="❤️"
          title={t('host.create.step2.categories.want')}
          tagline={t('host.create.step2.categories.wantTagline')}
          items={event.gifts.want}
          emptyLabel={t('host.event.gifts.empty')}
        />
        <GiftList
          palette="nice"
          icon="💛"
          title={t('host.create.step2.categories.nice')}
          tagline={t('host.create.step2.categories.niceTagline')}
          items={event.gifts.nice}
          emptyLabel={t('host.event.gifts.empty')}
        />
        <GiftList
          palette="avoid"
          icon="⛔"
          title={t('host.create.step2.categories.avoid')}
          tagline={t('host.create.step2.categories.avoidTagline')}
          items={event.gifts.avoid}
          emptyLabel={t('host.event.gifts.empty')}
        />
      </section>

      <div className="mt-6 flex justify-center">
        <Link
          href="/dashboard"
          className="text-sm font-semibold text-dark-light hover:text-dark"
        >
          ← {t('host.dashboard.title')}
        </Link>
      </div>
    </Shell>
  )
}

function HostGiftStatus({ event }: { event: EventDetail }) {
  const { t } = useTranslate()
  const [showAllReservations, setShowAllReservations] = useState(false)

  const items = [...event.gifts.want, ...event.gifts.nice]
  const itemGifts = items.filter((g) => g.type === 'item')
  const envelopes = items.filter((g) => g.type === 'envelope')
  const reservations = event.reservations ?? []

  const totalDesired = itemGifts.reduce((acc, g) => acc + g.quantity, 0)
  const totalReserved = itemGifts.reduce((acc, g) => acc + g.reservedQuantity, 0)
  const envelopeCount = envelopes.reduce((acc, g) => acc + g.reservedQuantity, 0)
  const envelopeTotal = reservations.reduce((acc, r) => acc + (r.amount ?? 0), 0)

  const visibleReservations = showAllReservations ? reservations : reservations.slice(0, 5)

  return (
    <section className="mt-6 rounded-3xl border border-gray-light bg-white p-5 shadow-card sm:p-6">
      <h2 className="text-lg font-extrabold tracking-tight text-dark sm:text-xl">
        📊 {t('host.event.status.title')}
      </h2>

      {/* Summary tiles */}
      <dl className="mt-4 grid grid-cols-3 gap-2 text-center">
        <div className="rounded-2xl bg-coral/10 px-2 py-3">
          <dt className="text-[11px] font-semibold uppercase tracking-wide text-dark-light">
            {t('host.event.status.reserved')}
          </dt>
          <dd className="mt-0.5 text-xl font-extrabold text-coral">
            {totalReserved}/{totalDesired}
          </dd>
        </div>
        <div className="rounded-2xl bg-gold/15 px-2 py-3">
          <dt className="text-[11px] font-semibold uppercase tracking-wide text-dark-light">
            {t('host.event.status.envelopes')}
          </dt>
          <dd className="mt-0.5 text-xl font-extrabold text-gold-dark">
            {envelopes.length > 0 ? envelopeCount : '—'}
          </dd>
          {envelopeTotal > 0 ? (
            <p className="text-[11px] font-semibold text-dark-light">
              {t('host.event.status.total')}: {envelopeTotal}€
            </p>
          ) : null}
        </div>
        <div className="rounded-2xl bg-gray-light/40 px-2 py-3">
          <dt className="text-[11px] font-semibold uppercase tracking-wide text-dark-light">
            {t('host.event.status.guests')}
          </dt>
          <dd className="mt-0.5 text-xl font-extrabold text-dark">
            {reservations.length}
          </dd>
        </div>
      </dl>

      {/* Per-gift progress */}
      {items.length > 0 ? (
        <ul className="mt-4 flex flex-col gap-2.5">
          {items.map((gift) => {
            const soldOut = gift.type === 'item' && gift.reservedQuantity >= gift.quantity
            return (
              <li key={gift.id || gift.name} className="rounded-xl bg-bg px-3 py-2.5">
                <div className="flex items-center justify-between gap-2">
                  <span className="min-w-0 flex-1 break-words text-sm font-semibold text-dark">
                    {gift.type === 'envelope' ? '💌 ' : ''}
                    {gift.name}
                  </span>
                  <span
                    className={cn(
                      'shrink-0 rounded-full px-2 py-0.5 text-xs font-bold',
                      gift.type === 'envelope'
                        ? 'bg-gold/20 text-gold-dark'
                        : soldOut
                          ? 'bg-success/15 text-dark'
                          : 'bg-coral/10 text-coral',
                    )}
                  >
                    {gift.type === 'envelope'
                      ? `${gift.reservedQuantity} · ${t('host.event.status.unlimited')}`
                      : `${gift.reservedQuantity}/${gift.quantity}${soldOut ? ' ✓' : ''}`}
                  </span>
                </div>
                {gift.type === 'item' ? (
                  <div
                    className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-gray-light/60"
                    role="progressbar"
                    aria-valuemin={0}
                    aria-valuemax={gift.quantity}
                    aria-valuenow={gift.reservedQuantity}
                    aria-label={`${gift.name}: ${gift.reservedQuantity}/${gift.quantity}`}
                  >
                    <div
                      className={cn(
                        'h-full rounded-full transition-all',
                        soldOut ? 'bg-success' : 'bg-gradient-to-r from-coral to-gold',
                      )}
                      style={{
                        width: `${Math.min(100, (gift.reservedQuantity / gift.quantity) * 100)}%`,
                      }}
                    />
                  </div>
                ) : null}
              </li>
            )
          })}
        </ul>
      ) : null}

      {/* Reservation list */}
      <h3 className="mt-5 text-sm font-extrabold uppercase tracking-wide text-dark-light">
        {t('host.event.status.reservationsTitle')}
      </h3>
      {reservations.length === 0 ? (
        <p className="mt-2 rounded-xl border-2 border-dashed border-gray-light px-3 py-4 text-center text-sm text-dark-light">
          {t('host.event.status.noReservations')}
        </p>
      ) : (
        <>
          <ul className="mt-2 flex flex-col gap-1.5">
            {visibleReservations.map((r) => (
              <li
                key={r.id}
                className="flex flex-wrap items-baseline justify-between gap-x-2 gap-y-0.5 rounded-xl bg-bg px-3 py-2 text-sm"
              >
                <span className={cn('font-semibold', r.guestName ? 'text-dark' : 'italic text-dark-light')}>
                  {r.guestName || t('host.event.status.anonymous')}
                </span>
                <span className="min-w-0 flex-1 truncate text-dark-light">
                  → {r.giftName}
                  {typeof r.amount === 'number' ? ` · ${r.amount}€` : ''}
                </span>
                <span className="shrink-0 text-xs text-gray">
                  {r.createdAt ? new Date(r.createdAt).toLocaleDateString() : ''}
                </span>
                {r.message ? (
                  <span className="w-full text-xs italic text-dark-light">“{r.message}”</span>
                ) : null}
              </li>
            ))}
          </ul>
          {reservations.length > 5 ? (
            <button
              type="button"
              onClick={() => setShowAllReservations((s) => !s)}
              className="mt-2 text-sm font-semibold text-coral hover:text-coral-dark"
            >
              {showAllReservations
                ? t('host.event.status.showLess')
                : `${t('host.event.status.showAll')} (${reservations.length})`}
            </button>
          ) : null}
        </>
      )}
    </section>
  )
}

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-8 sm:px-6 lg:px-8">{children}</div>
  )
}

function DetailSkeleton() {
  return (
    <Shell>
      <div className="rounded-3xl border border-gray-light bg-white p-6 shadow-card sm:p-8">
        <div className="flex items-start gap-4">
          <div className="h-14 w-14 shrink-0 animate-pulse rounded-2xl bg-gray-light" />
          <div className="flex-1 space-y-2">
            <div className="h-3 w-20 animate-pulse rounded bg-gray-light" />
            <div className="h-7 w-3/4 animate-pulse rounded bg-gray-light" />
            <div className="h-3 w-1/2 animate-pulse rounded bg-gray-light" />
          </div>
        </div>
      </div>
      <div className="mt-6 flex flex-col gap-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div
            key={i}
            className="rounded-2xl border border-gray-light bg-white p-5 shadow-card"
          >
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 animate-pulse rounded-full bg-gray-light" />
              <div className="flex-1 space-y-2">
                <div className="h-4 w-1/3 animate-pulse rounded bg-gray-light" />
                <div className="h-3 w-1/2 animate-pulse rounded bg-gray-light" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </Shell>
  )
}

interface GiftListProps {
  palette: 'want' | 'nice' | 'avoid'
  icon: string
  title: string
  tagline: string
  items: DetailGift[]
  emptyLabel: string
}

function GiftList({ palette, icon, title, tagline, items, emptyLabel }: GiftListProps) {
  const styles = {
    want: {
      frame: 'bg-gradient-to-br from-coral/20 to-coral/10 ring-1 ring-coral/25',
      header: 'bg-gradient-to-r from-coral to-coral-light text-white',
      headerSub: 'text-white/90',
      badge: 'bg-white/30 text-white',
      itemIcon: '🎁',
    },
    nice: {
      frame: 'bg-gradient-to-br from-gold/25 to-gold/10 ring-1 ring-gold/40',
      header: 'bg-gradient-to-r from-gold to-gold-light text-dark',
      headerSub: 'text-dark/70',
      badge: 'bg-dark/15 text-dark',
      itemIcon: '🎁',
    },
    avoid: {
      frame: 'bg-gradient-to-br from-red-soft/30 to-red-soft/15 ring-1 ring-red-soft/60',
      header: 'bg-gradient-to-r from-red-soft to-red-soft/85 text-dark',
      headerSub: 'text-dark/70',
      badge: 'bg-dark/15 text-dark',
      itemIcon: '✕',
    },
  }[palette]

  return (
    <section
      className={cn(
        'overflow-hidden rounded-2xl p-1 shadow-card',
        styles.frame,
      )}
    >
      <div className={cn('flex items-center gap-3 rounded-2xl px-4 py-3', styles.header)}>
        <span className="text-xl" aria-hidden="true">
          {icon}
        </span>
        <div className="min-w-0 flex-1">
          <div className="text-base font-extrabold tracking-tight">{title}</div>
          <div className={cn('text-xs', styles.headerSub)}>{tagline}</div>
        </div>
        <span className={cn('shrink-0 rounded-full px-2 py-0.5 text-xs font-bold', styles.badge)}>
          {items.length}
        </span>
      </div>

      <ul className="flex flex-col gap-2 p-3">
        {items.length === 0 ? (
          <li className="rounded-xl bg-white/70 px-2 py-3 text-center text-sm text-dark-light">
            {emptyLabel}
          </li>
        ) : (
          items.map((gift, idx) => (
            <li
              key={gift.id || idx}
              className="flex items-center gap-2 rounded-xl bg-white p-2.5 shadow-sm"
            >
              <span className="text-base text-dark-light" aria-hidden="true">
                {gift.type === 'envelope' ? '💌' : styles.itemIcon}
              </span>
              <span className="min-w-0 flex-1 truncate text-sm font-semibold text-dark">
                {gift.name}
              </span>
              {palette !== 'avoid' && gift.type === 'item' && gift.quantity > 1 ? (
                <span className="shrink-0 text-xs font-semibold text-dark-light">
                  ×{gift.quantity}
                </span>
              ) : null}
            </li>
          ))
        )}
      </ul>
    </section>
  )
}
