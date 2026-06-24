'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import Link from 'next/link'
import { useTranslate } from '@tolgee/react'
import { Button } from '@/components/shared/Button'
import { useToast } from '@/components/shared/Toast'
import { useCurrentUser } from '@/lib/auth/useCurrentUser'
import { loadSession } from '@/lib/auth/session'
import { EventApiError, getEventById, reserveGift, type EventDetail, type DetailGift } from '@/lib/api/events'
import { usePublishEventViewMode } from '@/lib/state/eventViewMode'
import { cn } from '@/lib/utils/cn'
import type { EventType } from '@/types/event'
import styles from './GuestEvent.module.css'

function getEventEmoji(type: EventType, gender?: string): string {
  if (type === 'birthday') {
    return gender === 'girl' ? '🎂👧' : gender === 'boy' ? '🎂👦' : '🎂'
  }
  if (type === 'baptism') {
    return gender === 'girl' ? '⛪👧' : gender === 'boy' ? '⛪👦' : '⛪'
  }
  const TYPE_EMOJIS: Record<EventType, string> = {
    wedding: '💒',
    birthday: '🎂',
    baptism: '⛪',
    patrons_day: '🕯️',
    other: '✨',
  }
  return TYPE_EMOJIS[type] ?? '✨'
}

type Section = 'want' | 'nice'

interface PendingChoice {
  category: Section
  index: number
  name: string
}

interface Props {
  slug: string
}

const RESERVATIONS_PREFIX = 'poklonimi.guestReservations.'

interface Reservations {
  [key: string]: number
}

function readReservations(slug: string): Reservations {
  if (typeof window === 'undefined') return {}
  try {
    const raw = sessionStorage.getItem(RESERVATIONS_PREFIX + slug)
    if (!raw) return {}
    return JSON.parse(raw) as Reservations
  } catch {
    return {}
  }
}

function writeReservations(slug: string, reservations: Reservations) {
  if (typeof window === 'undefined') return
  try {
    sessionStorage.setItem(RESERVATIONS_PREFIX + slug, JSON.stringify(reservations))
  } catch {
    // ignore quota errors
  }
}

export function GuestEventClient({ slug }: Props) {
  const { t } = useTranslate()
  const toast = useToast()
  const { user, ready } = useCurrentUser()

  const [event, setEvent] = useState<EventDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [errorKind, setErrorKind] = useState<'private' | 'generic' | null>(null)
  const [origin, setOrigin] = useState('')

  const [reservations, setReservations] = useState<Reservations>({})
  const [pending, setPending] = useState<PendingChoice | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [avoidOpen, setAvoidOpen] = useState(false)
  const cardsRef = useRef<HTMLDivElement>(null)
  const observerRef = useRef<IntersectionObserver | null>(null)

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
        console.log('Event detail:', detail) // Debug: check what fields are returned
        setEvent(detail)
        setReservations(readReservations(slug))
      })
      .catch((err: unknown) => {
        if (cancelled) return
        if (err instanceof EventApiError) {
          if (err.status === 403) {
            setErrorKind('private')
            setErrorMessage(t('host.guest.private.hint'))
            return
          }
        }
        const message = err instanceof Error ? err.message : t('common.errors.generic')
        setErrorMessage(message)
        setErrorKind('generic')
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [ready, slug, t])

  useEffect(() => {
    if (!cardsRef.current) return

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          entry.target.classList.toggle(styles.visible, entry.isIntersecting)
        })
      },
      { threshold: 0.1 },
    )
    observerRef.current = observer
    cardsRef.current?.querySelectorAll(`.${styles.giftCard}`).forEach((el) => observer.observe(el))
    return () => observer.disconnect()
  }, [event])

  const eventUrl = useMemo(
    () => (origin ? `${origin}/event/${slug}` : `/event/${slug}`),
    [origin, slug],
  )

  const reserveKey = (cat: Section, index: number) => `${cat}:${index}`

  const openConfirm = (category: Section, index: number, name: string) => {
    setPending({ category, index, name })
  }

  const closeConfirm = () => setPending(null)

  const confirmChoice = async () => {
    if (!pending) return
    try {
      // Call backend to reserve gift and decrement quantity
      const updatedEvent = await reserveGift(slug, pending.category, pending.index)
      setEvent(updatedEvent)

      // Also update local reservations
      const key = reserveKey(pending.category, pending.index)
      const updated = { ...reservations }
      updated[key] = (updated[key] ?? 0) + 1
      setReservations(updated)
      writeReservations(slug, updated)

      setSuccess(pending.name)
      setPending(null)

      // Confetti effect
      launchConfetti()

      // Auto-dismiss after 5 seconds
      setTimeout(() => {
        setSuccess(null)
      }, 5000)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to reserve gift'
      toast.error(message)
    }
  }

  const dismissSuccess = () => setSuccess(null)

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

  const launchConfetti = () => {
    if (typeof document === 'undefined') return
    const container = document.getElementById('confetti-root')
    if (!container) return
    const colors = ['#FF6B6B', '#FFD93D', '#6BCB77', '#74b9ff', '#a29bfe', '#fd79a8', '#fdcb6e']
    const shapes: Array<'square' | 'circle'> = ['square', 'circle']
    for (let i = 0; i < 60; i += 1) {
      const piece = document.createElement('div')
      piece.className = styles.confettiPiece!
      const color = colors[Math.floor(Math.random() * colors.length)] ?? '#FF6B6B'
      const size = 6 + Math.random() * 8
      const left = Math.random() * 100
      const duration = 2 + Math.random() * 2.5
      const delay = Math.random() * 1.5
      const shape = shapes[Math.floor(Math.random() * shapes.length)]
      piece.style.cssText = [
        `left:${left}%`,
        `width:${size}px`,
        `height:${size}px`,
        `background:${color}`,
        `border-radius:${shape === 'circle' ? '50%' : '2px'}`,
        `animation-duration:${duration}s`,
        `animation-delay:${delay}s`,
      ].join(';')
      container.appendChild(piece)
    }
    setTimeout(() => {
      container.innerHTML = ''
    }, 5000)
  }

  if (loading) return <GuestSkeleton />

  if (errorMessage) {
    if (errorKind === 'private') {
      return (
        <div className="mx-auto w-full max-w-md px-4 py-16 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center gap-4 rounded-3xl border border-gold/40 bg-gold/10 p-8 text-center shadow-card">
            <span className="text-4xl">🔒</span>
            <h1 className="text-xl font-extrabold tracking-tight text-dark">
              {t('host.guest.private.title')}
            </h1>
            <p className="text-sm text-dark-light">{errorMessage}</p>
            <div className="mt-2 flex flex-col gap-2 sm:flex-row">
              <Link
                href="/login"
                className="rounded-full bg-coral px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-coral-dark"
              >
                {t('nav.login')}
              </Link>
              <Link
                href="/"
                className="rounded-full border-2 border-gray-light bg-white px-4 py-2 text-sm font-semibold text-dark transition-colors hover:border-coral hover:text-coral"
              >
                {t('host.guest.private.home')}
              </Link>
            </div>
          </div>
        </div>
      )
    }
    return (
      <div className="mx-auto w-full max-w-2xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center gap-3 rounded-3xl border border-red-soft bg-red-soft/10 py-12 text-center">
          <span className="text-3xl">⚠️</span>
          <p className="px-6 text-sm text-dark">{errorMessage}</p>
        </div>
      </div>
    )
  }

  if (!event) {
    return (
      <div className="mx-auto w-full max-w-2xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center gap-3 rounded-3xl border-2 border-dashed border-gray-light py-16 text-center">
          <span className="text-4xl">🔍</span>
          <p className="font-semibold text-dark">
            {t('host.event.notFound.title')}
          </p>
          <p className="px-6 text-sm text-dark-light">
            {t('host.event.notFound.desc')}
          </p>
        </div>
      </div>
    )
  }

  const wantAvailableCount = event.gifts.want.filter(
    (gift) => gift.quantity > 0,
  ).length
  const niceAvailableCount = event.gifts.nice.filter(
    (gift) => gift.quantity > 0,
  ).length
  const totalReserved = Object.values(reservations).reduce((sum, count) => sum + count, 0)

  return (
    <>
      <div className="bg-bg pb-32">
        {/* Hero */}
        <section
          className={cn(
            'relative isolate flex min-h-[58vh] flex-col justify-end overflow-hidden px-6 pb-9 pt-8 text-center text-white sm:min-h-[44vh] sm:max-h-[500px]',
            styles.shimmer,
          )}
        >
          <div
            className={styles.heroBg}
            aria-hidden="true"
            style={
              event?.backgroundImageUrl
                ? { backgroundImage: `url(${event.backgroundImageUrl})` }
                : undefined
            }
          />
          <div className={styles.heroOverlay} aria-hidden="true" />
          <div className={cn('relative z-[2]', styles.heroContent)}>
            <div className={cn('mb-3 text-5xl', styles.heroEmoji)}>
              {getEventEmoji(event.type, event.gender)}
            </div>
            <h1 className="mb-1.5 text-[clamp(1.6rem,4vw,2.5rem)] font-extrabold leading-tight tracking-tight [text-shadow:0_2px_12px_rgba(0,0,0,0.3)]">
              {event.name}
            </h1>
            {event.hostName ? (
              <p className="mb-5 text-sm font-medium tracking-wide opacity-85 sm:text-base">
                {t('host.event.hostedBy')} {event.hostName}
              </p>
            ) : (
              <div className="mb-5" />
            )}
            <div className="mx-auto mb-5 h-0.5 w-12 rounded-full bg-white/40" />
            <p className="mx-auto max-w-md text-sm italic leading-[1.65] opacity-90 [text-shadow:0_1px_8px_rgba(0,0,0,0.2)] sm:text-base">
              {t('host.guest.heroMessage')}
            </p>
          </div>
        </section>

        {/* Welcome message */}
        <div className="mx-auto w-full max-w-2xl px-4 sm:px-6 lg:px-8">
          <div className="relative z-[3] -mt-8 rounded-[20px] border border-white/40 bg-white/75 p-6 shadow-card backdrop-blur-md sm:p-8">
            <p className="text-base leading-relaxed text-dark sm:text-lg">
              {event.message || t('host.guest.welcome')}
            </p>
          </div>
        </div>

        {/* Gift cards */}
        <div className="mx-auto w-full max-w-2xl px-4 py-8 sm:px-6 lg:px-8">
          <div ref={cardsRef} className="mt-8 flex flex-col gap-8">
            {/* Want section */}
            <SectionBlock
              icon="❤️"
              title={t('host.create.step2.categories.want')}
              tagline={t('host.create.step2.categories.wantTagline')}
              childCount={wantAvailableCount}
              category="want"
            >
              {event.gifts.want.map((gift, idx) => {
                const reserved = reservations[reserveKey('want', idx)] ?? 0
                const isReserved = gift.quantity <= 0 || reserved >= gift.quantity
                return (
                  <GiftCard
                    key={idx}
                    name={gift.name}
                    description={gift.description}
                    isReserved={isReserved}
                    reservedLabel={t('host.guest.giftCard.reserved')}
                    badge={t('host.guest.giftCard.topWish')}
                    category="want"
                    onChoose={() => openConfirm('want', idx, gift.name)}
                  />
                )
              })}
            </SectionBlock>

            <SectionSeparator label={t('host.guest.sep.gold')} />

            {/* Nice section */}
            <SectionBlock
              icon="💛"
              title={t('host.create.step2.categories.nice')}
              tagline={t('host.create.step2.categories.niceTagline')}
              childCount={niceAvailableCount}
              category="nice"
            >
              {event.gifts.nice.map((gift, idx) => {
                const reserved = reservations[reserveKey('nice', idx)] ?? 0
                const isReserved = gift.quantity <= 0 || reserved >= gift.quantity
                return (
                  <GiftCard
                    key={idx}
                    name={gift.name}
                    description={gift.description}
                    isReserved={isReserved}
                    reservedLabel={t('host.guest.giftCard.reserved')}
                    badge={t('host.guest.giftCard.welcomeToo')}
                    category="nice"
                    onChoose={() => openConfirm('nice', idx, gift.name)}
                  />
                )
              })}
            </SectionBlock>

            {event.gifts.avoid.length > 0 ? (
              <>
                <SectionSeparator label={t('host.guest.sep.avoid')} />
                <AvoidSection
                  items={event.gifts.avoid}
                  title={t('host.create.step2.categories.avoid')}
                  subtitle={t('host.guest.sections.avoid.subtitle')}
                  open={avoidOpen}
                  onToggle={() => setAvoidOpen((o) => !o)}
                />
              </>
            ) : null}
          </div>

          {/* Footer */}
          <div className="mt-12 text-center text-xs text-dark-light">
            <p className="text-sm font-semibold text-dark-light">
              {t('host.guest.footer.brand')}
            </p>
            <p className="mt-1 text-gray">
              {t('host.guest.footer.tagline')}
            </p>
          </div>
        </div>
      </div>

      {/* Floating reserved badge */}
      <div
        className={cn(
          'fixed bottom-8 right-8 z-[900] rounded-full border-2 border-coral bg-white px-4 py-2 text-sm font-semibold text-coral shadow-lg',
          totalReserved > 0 && styles.show,
        )}
      >
        <span className={cn('h-2 w-2 rounded-full bg-success', styles.badgeDot)} />
        {t('host.guest.floating.label')}: {totalReserved}
      </div>

      {/* Confirmation modal */}
      <div
        className={cn(
          'fixed inset-0 z-[950] flex items-center justify-center bg-dark/50 transition-opacity duration-300',
          !pending && 'pointer-events-none opacity-0',
        )}
        onClick={closeConfirm}
      >
        <div
          className={cn(
            'relative w-full max-w-sm rounded-3xl bg-white px-6 py-8 shadow-2xl transition-transform duration-300 sm:px-8',
            !pending && 'scale-95',
          )}
          onClick={(e) => {
            e.stopPropagation()
          }}
        >
          <div className="mx-auto mb-6 h-1 w-10 rounded-full bg-gray-light" />
          <h3 className="mb-2 text-center text-xl font-bold text-dark">
            {t('host.guest.modal.title')}
          </h3>
          <p className="mb-7 text-center text-base font-semibold text-coral">
            {pending?.name}
          </p>

          <Button
            onClick={confirmChoice}
            size="lg"
            fullWidth
            className="mb-3"
          >
            {t('host.guest.modal.confirm')}
          </Button>
          <Button
            onClick={closeConfirm}
            variant="outline"
            size="lg"
            fullWidth
          >
            {t('host.guest.modal.cancel')}
          </Button>
        </div>
      </div>

      {/* Success overlay */}
      <div
        className={cn(
          'fixed inset-0 z-[1000] flex items-center justify-center bg-dark/40 transition-opacity duration-300',
          !success && 'pointer-events-none opacity-0',
        )}
        onClick={dismissSuccess}
      >
        <div
          className={cn(
            'relative w-full max-w-sm rounded-3xl bg-white px-6 py-12 shadow-2xl transition-transform duration-300 sm:px-8',
            !success && 'scale-95',
          )}
          onClick={(e) => {
            e.stopPropagation()
          }}
        >
          <div className="relative z-[2] max-w-sm text-center">
            <div className={cn('mb-4 text-7xl', styles.successCheck)}>✅</div>
            <h2 className="mb-2 text-3xl font-extrabold text-dark sm:text-4xl">
              {t('host.guest.success.title')}
            </h2>
            <p className="mb-1 text-base text-dark-light sm:text-lg">
              {t('host.guest.success.youChose')}{' '}
              <strong className="font-bold text-coral">{success ?? ''}</strong>
            </p>
            <p className="mb-8 text-sm text-dark-light sm:text-base">
              {t('host.guest.success.notify')}
            </p>
            <div className="mx-auto mb-8 h-0.5 w-12 rounded-full bg-gray-light" />
            <p className="mb-3.5 text-base font-semibold text-dark sm:text-lg">
              {t('host.guest.success.cta')}
            </p>
            <Button href="/" size="md" variant="coral">
              {t('host.guest.success.makeOwn')}
            </Button>
            <div className="mt-8 flex flex-col items-center gap-2 border-t border-gray-light pt-5">
              <p className="text-sm font-bold text-dark">
                {t('host.guest.success.shareTitle')}
              </p>
              <p className="text-xs text-dark-light">
                {t('host.guest.success.shareSub')}
              </p>
              <div className="mt-1 flex flex-wrap justify-center gap-2">
                <button
                  type="button"
                  onClick={copyLink}
                  className="rounded-full border-2 border-gray-light px-3 py-1 text-xs font-semibold text-dark transition-colors hover:border-coral hover:text-coral"
                >
                  📋 {t('common.buttons.copy')}
                </button>
                <button
                  type="button"
                  onClick={shareLink}
                  className="rounded-full border-2 border-coral bg-coral px-3 py-1 text-xs font-semibold text-white transition-colors hover:bg-coral-dark"
                >
                  📤 {t('host.event.share')}
                </button>
              </div>
            </div>

            <button
              type="button"
              onClick={dismissSuccess}
              className="absolute right-6 top-6 text-2xl text-dark-light transition-colors hover:text-dark"
            >
              ✕
            </button>
          </div>
        </div>
      </div>

      <div id="confetti-root" className="pointer-events-none fixed inset-0 z-[1099] overflow-hidden" />
    </>
  )
}

type SectionCategory = 'want' | 'nice'

interface SectionBlockProps {
  icon: string
  title: string
  tagline: string
  childCount: number
  children: React.ReactNode
  category?: SectionCategory
  hasChildren?: boolean
}

function SectionBlock({ icon, title, tagline, childCount, children, category }: SectionBlockProps) {
  const { t } = useTranslate()
  const hasChildren = !!children && (Array.isArray(children) ? children.length > 0 : true)

  if (!hasChildren) return null

  const isWant = category === 'want'
  const isNice = category === 'nice'

  return (
    <section
      className={cn(
        'rounded-3xl p-4 shadow-card sm:p-5 border-2',
        isWant && 'border-coral/40 bg-gradient-to-br from-coral/5 to-coral/2',
        isNice && 'border-gold/50 bg-gradient-to-br from-gold/5 to-gold/2',
        !isWant && !isNice && 'border-gray-light',
        styles.frame,
      )}
    >
      <header
        className={cn(
          'mb-4 flex flex-wrap items-center gap-y-2 rounded-2xl px-4 py-3 -mx-4 -mt-4 sm:-mx-5 sm:-mt-5',
          isWant && 'bg-gradient-to-r from-coral/15 to-coral/5',
          isNice && 'bg-gradient-to-r from-gold/20 to-gold/5',
          !isWant && !isNice && 'bg-gray-light/20',
          styles.accent,
        )}
      >
        <h2 className={cn('text-lg font-extrabold leading-tight tracking-tight text-dark', styles.frameTitle)}>
          <span aria-hidden="true">{icon}</span> {title}
        </h2>
        <span
          className={cn(
            'rounded-full px-3 py-1 text-xs font-semibold border',
            childCount === 0
              ? 'bg-gray-light/20 border-gray-light/50 text-gray'
              : isWant
                ? 'bg-coral/10 border-coral/30 text-coral'
                : isNice
                  ? 'bg-gold/10 border-gold/40 text-gold-dark'
                  : 'bg-gray-light/30 border-gray-light text-dark',
            styles.pill,
          )}
        >
          {childCount === 0 ? t('host.guest.count.allReserved') : `${childCount} ${t('host.guest.count.available')}`}
        </span>
        <p className="mt-1 w-full text-xs italic text-dark-light">{tagline}</p>
      </header>
      {hasChildren ? (
        <div className={cn('grid grid-cols-1 gap-3', childCount > 1 && 'lg:grid-cols-2')}>{children}</div>
      ) : (
        <div className={cn('rounded-2xl bg-white py-8 text-center text-sm text-dark-light', styles.empty)}>
          {t('host.guest.empty.want')}
        </div>
      )}
    </section>
  )
}

interface GiftCardProps {
  name: string
  description?: string
  isReserved: boolean
  reservedLabel: string
  badge: string
  category?: SectionCategory
  onChoose: () => void
}

function GiftCard({ name, description, isReserved, reservedLabel, badge, category, onChoose }: GiftCardProps) {
  const { t } = useTranslate()
  const isNice = category === 'nice'

  if (isReserved) {
    return (
      <div
        className={cn(
          'flex min-h-[100px] flex-col justify-between rounded-2xl border-2 border-success/30 bg-success/10 p-4 text-dark sm:p-5',
          styles.giftCard,
        )}
      >
        <div className="flex items-center gap-2 text-base font-bold text-dark-light line-through">
          <span aria-hidden="true">✅</span>
          <span className="break-words">{name}</span>
        </div>
        <p className="mt-1 text-xs font-medium text-gray">{reservedLabel}</p>
      </div>
    )
  }

  return (
    <button
      onClick={onChoose}
      className={cn(
        'group relative flex min-h-[100px] flex-col justify-between rounded-2xl border-2 p-4 text-left transition-all focus-visible:outline-none focus-visible:ring-2 sm:p-5',
        isNice
          ? 'border-gold/40 bg-gradient-to-br from-gold/10 to-gold/5 hover:border-gold hover:shadow-lg focus-visible:ring-gold'
          : 'border-coral/30 bg-gradient-to-br from-coral/10 to-gold/10 hover:border-coral hover:shadow-lg focus-visible:ring-coral',
        styles.giftCard,
      )}
    >
      <div>
        <span
          className={cn(
            'mb-2 inline-flex rounded-full px-2 py-0.5 text-xs font-bold',
            isNice ? 'bg-gold/20 text-gold-dark' : 'bg-coral/20 text-coral',
            styles.badge,
          )}
        >
          {badge}
        </span>
        <span className="mb-3 mt-1 break-words text-lg font-bold text-dark sm:text-xl">
          {name}
        </span>
        {description && (
          <p className="text-xs text-dark-light">{description}</p>
        )}
      </div>

      <span
        className={cn(
          'inline-flex rounded-full px-4 py-2 text-sm font-semibold text-white transition-all',
          isNice ? 'bg-gold hover:bg-gold-dark' : 'bg-coral hover:bg-coral-dark',
          styles.cta,
        )}
      >
        {t('host.guest.giftCard.cta')}
      </span>
    </button>
  )
}

function SectionSeparator({ label }: { label: string }) {
  return (
    <div className="my-2 flex items-center gap-3 px-1">
      <div className="h-px flex-1 border-t border-dashed border-gray-light" />
      <span className="whitespace-nowrap text-[11px] text-gray">{label}</span>
      <div className="h-px flex-1 border-t border-dashed border-gray-light" />
    </div>
  )
}

interface AvoidSectionProps {
  items: DetailGift[]
  title: string
  subtitle: string
  open: boolean
  onToggle: () => void
}

function AvoidSection({ items, title, subtitle, open, onToggle }: AvoidSectionProps) {
  return (
    <section className="rounded-3xl bg-gradient-to-br from-red-soft/25 to-red-soft/10 p-1 shadow-card ring-1 ring-red-soft/50">
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full items-center justify-between rounded-[18px] bg-white px-4 py-4 transition-colors hover:bg-red-soft/5 sm:px-5"
      >
        <span className="min-w-0">
          <span className="font-extrabold">{title}</span>{' '}
          <span aria-hidden="true">⛔</span>{' '}
          <span className="text-sm font-medium text-dark/75">
            {subtitle}
          </span>
        </span>
        <span
          className={cn(
            'ml-2 shrink-0 text-xl transition-transform duration-300',
            open && 'rotate-180',
          )}
        >
          ▼
        </span>
      </button>
      <div
        className={cn(
          'overflow-hidden transition-all duration-300',
          open ? 'max-h-[500px]' : 'max-h-0',
        )}
      >
        <div className="flex flex-col gap-2 p-3">
          {items.map((gift, idx) => (
            <div
              key={idx}
              className="flex items-start gap-3 rounded-xl bg-white/50 px-3 py-2"
            >
              <span className="mt-0.5 shrink-0 text-xl" aria-hidden="true">
                ⛔
              </span>
              <div className="min-w-0 flex-1">
                <p className="break-words text-sm font-semibold text-dark">{gift.name}</p>
                {gift.description && (
                  <p className="break-words text-xs text-dark-light">{gift.description}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function GuestSkeleton() {
  return (
    <div className="bg-bg pb-32">
      <div className="relative min-h-[58vh] overflow-hidden bg-gradient-to-br from-coral/40 via-coral/30 to-gold/30 sm:min-h-[44vh]">
        <div className="absolute inset-x-0 bottom-8 mx-auto flex max-w-md flex-col items-center gap-3 px-6">
          <div className="h-12 w-12 animate-pulse rounded-full bg-white/40" />
          <div className="h-7 w-3/4 animate-pulse rounded bg-white/40" />
          <div className="h-3 w-1/2 animate-pulse rounded bg-white/30" />
        </div>
      </div>
      <div className="mx-auto w-full max-w-2xl px-4 sm:px-6 lg:px-8">
        <div className="-mt-8 rounded-[20px] border border-white/40 bg-white/75 p-6 shadow-card backdrop-blur-md">
          <div className="h-4 w-3/4 animate-pulse rounded bg-gray-light" />
          <div className="mt-2 h-4 w-1/2 animate-pulse rounded bg-gray-light" />
        </div>
        <div className="mt-8 space-y-6">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="rounded-2xl border border-gray-light bg-white p-5 shadow-card">
              <div className="h-5 w-1/3 animate-pulse rounded bg-gray-light" />
              <div className="mt-3 h-4 w-2/3 animate-pulse rounded bg-gray-light" />
              <div className="mt-4 h-12 w-full animate-pulse rounded-2xl bg-gray-light/70" />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
