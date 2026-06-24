'use client'

import { useEffect, useMemo, useState, type KeyboardEvent } from 'react'
import Link from 'next/link'
import { useTranslate } from '@tolgee/react'
import { Button } from '@/components/shared/Button'
import { Input } from '@/components/shared/Input'
import { useToast } from '@/components/shared/Toast'
import { useCurrentUser } from '@/lib/auth/useCurrentUser'
import { loadSession } from '@/lib/auth/session'
import {
  EventApiError,
  getEventById,
  updateEvent,
  type EventDetail,
  type DetailGift,
} from '@/lib/api/events'
import { usePublishEventViewMode } from '@/lib/state/eventViewMode'
import { cn } from '@/lib/utils/cn'
import type { EventType } from '@/types/event'

const TYPES: { key: EventType; icon: string }[] = [
  { key: 'wedding', icon: '💒' },
  { key: 'birthday', icon: '🎂' },
  { key: 'baptism', icon: '👶' },
  { key: 'patrons_day', icon: '🕯️' },
  { key: 'other', icon: '✨' },
]

const TYPE_EMOJIS: Record<EventType, string> = {
  wedding: '💒',
  birthday: '🎂',
  baptism: '👶',
  patrons_day: '🕯️',
  other: '✨',
}

type ViewMode = 'view' | 'edit'

interface Props {
  slug: string
  mode: ViewMode
}

interface DraftState {
  name: string
  type: EventType
  want: string[]
  nice: string[]
  avoid: string[]
}

function detailToDraft(d: EventDetail): DraftState {
  return {
    name: d.name,
    type: d.type,
    want: d.gifts.want.map((g) => g.name),
    nice: d.gifts.nice.map((g) => g.name),
    avoid: d.gifts.avoid.map((g) => g.name),
  }
}

function arraysEqual(a: string[], b: DetailGift[]) {
  if (a.length !== b.length) return false
  return a.every((v, i) => v === b[i].name)
}

export function EventDetailClient({ slug, mode }: Props) {
  const { t } = useTranslate()
  const toast = useToast()
  const { user, ready } = useCurrentUser()

  const [event, setEvent] = useState<EventDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [origin, setOrigin] = useState('')

  const [draft, setDraft] = useState<DraftState | null>(null)
  const [saving, setSaving] = useState(false)
  const [nameError, setNameError] = useState<string | null>(null)

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
        setDraft(detail ? detailToDraft(detail) : null)
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

  const eventUrl = useMemo(
    () => (origin ? `${origin}/event/${slug}` : `/event/${slug}`),
    [origin, slug],
  )

  const isHost = !!user && !!event && user.id === event.hostId
  const canEdit = mode === 'edit' && isHost
  const showWrongModeBanner = mode === 'edit' && !!event && ready && !isHost

  // Lock the language switcher in the navbar when the visitor isn't the host.
  // While auth/event are still resolving we publish `null` to avoid flicker.
  usePublishEventViewMode(!ready || !event ? null : isHost ? 'editor' : 'viewer')

  const isDirty =
    !!event &&
    !!draft &&
    (draft.name.trim() !== event.name ||
      draft.type !== event.type ||
      !arraysEqual(draft.want, event.gifts.want) ||
      !arraysEqual(draft.nice, event.gifts.nice) ||
      !arraysEqual(draft.avoid, event.gifts.avoid))

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

  const updateDraft = (patch: Partial<DraftState>) => {
    setDraft((d) => (d ? { ...d, ...patch } : d))
  }

  const addItem = (cat: 'want' | 'nice' | 'avoid', value: string) => {
    const trimmed = value.trim()
    if (!trimmed) return
    setDraft((d) => (d ? { ...d, [cat]: [...d[cat], trimmed] } : d))
  }

  const removeItem = (cat: 'want' | 'nice' | 'avoid', index: number) => {
    setDraft((d) =>
      d ? { ...d, [cat]: d[cat].filter((_, i) => i !== index) } : d,
    )
  }

  const editItem = (cat: 'want' | 'nice' | 'avoid', index: number, value: string) => {
    setDraft((d) =>
      d
        ? { ...d, [cat]: d[cat].map((v, i) => (i === index ? value : v)) }
        : d,
    )
  }

  const discard = () => {
    if (event) setDraft(detailToDraft(event))
    setNameError(null)
  }

  const save = async () => {
    if (!event || !draft || !user) return
    if (!draft.name.trim() || draft.name.trim().length < 2) {
      setNameError(t('common.errors.tooShort'))
      return
    }
    setNameError(null)

    const session = loadSession()
    if (!session?.accessToken) {
      toast.error(t('common.errors.generic'))
      return
    }

    const cleanedDraft: DraftState = {
      ...draft,
      want: draft.want.map((s) => s.trim()).filter(Boolean),
      nice: draft.nice.map((s) => s.trim()).filter(Boolean),
      avoid: draft.avoid.map((s) => s.trim()).filter(Boolean),
    }

    setSaving(true)
    try {
      await updateEvent(
        event.id,
        {
          name: cleanedDraft.name.trim(),
          type: cleanedDraft.type,
          userId: user.id,
          // Preserve fields that don't have an editor in this screen yet;
          // otherwise PUT (full-replace) would silently wipe them.
          message: event.message,
          date: event.date,
          gifts: [
            ...cleanedDraft.want.map((name) => {
              const orig = event.gifts.want.find((g) => g.name === name)
              return { name, category: 'want' as const, quantity: orig?.quantity ?? 1, description: orig?.description, whereToBuy: orig?.whereToBuy, priceInRange: orig?.priceInRange }
            }),
            ...cleanedDraft.nice.map((name) => {
              const orig = event.gifts.nice.find((g) => g.name === name)
              return { name, category: 'nice' as const, quantity: orig?.quantity ?? 1, description: orig?.description, whereToBuy: orig?.whereToBuy, priceInRange: orig?.priceInRange }
            }),
            ...cleanedDraft.avoid.map((name) => {
              const orig = event.gifts.avoid.find((g) => g.name === name)
              return { name, category: 'avoid' as const, quantity: orig?.quantity ?? 1, description: orig?.description, whereToBuy: orig?.whereToBuy, priceInRange: orig?.priceInRange }
            }),
          ],
        },
        session.accessToken,
      )

      const nextEvent: EventDetail = {
        ...event,
        name: cleanedDraft.name.trim(),
        type: cleanedDraft.type,
        gifts: {
          want: cleanedDraft.want.map((name) => {
            const orig = event.gifts.want.find((g) => g.name === name)
            return orig || { name, quantity: 1 }
          }),
          nice: cleanedDraft.nice.map((name) => {
            const orig = event.gifts.nice.find((g) => g.name === name)
            return orig || { name, quantity: 1 }
          }),
          avoid: cleanedDraft.avoid.map((name) => {
            const orig = event.gifts.avoid.find((g) => g.name === name)
            return orig || { name, quantity: 1 }
          }),
        },
      }
      setEvent(nextEvent)
      setDraft(detailToDraft(nextEvent))
      toast.success(t('host.event.saveSuccess', 'Event updated'))
    } catch (err) {
      const message =
        err instanceof EventApiError ? err.message : t('common.errors.generic')
      toast.error(message)
    } finally {
      setSaving(false)
    }
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

  if (!event || !draft) {
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
      {showWrongModeBanner ? (
        <div className="mb-4 flex items-center justify-between gap-3 rounded-2xl border border-gold/40 bg-gold/10 px-4 py-3 text-sm text-dark">
          <span>
            {t('host.event.notHostBanner')}
          </span>
          <Link
            href={`/event/${slug}`}
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
              {TYPE_EMOJIS[draft.type] ?? '✨'}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-dark-light">
                {canEdit
                  ? t('host.event.editTitle', 'Edit event')
                  : t('host.event.viewTitle', 'Event details')}
              </p>
              {canEdit ? null : (
                <>
                  <h1 className="mt-1 break-words text-2xl font-extrabold tracking-tight text-dark sm:text-3xl">
                    {event.name}
                  </h1>
                  {event.hostName ? (
                    <p className="mt-1 text-sm text-dark-light">
                      {t('host.event.hostedBy')}{' '}
                      <span className="font-semibold text-dark">{event.hostName}</span>
                    </p>
                  ) : null}
                </>
              )}
            </div>
            {mode === 'view' && isHost ? (
              <Link
                href={`/event/${slug}/edit`}
                className="shrink-0 rounded-full border-2 border-gray-light bg-white px-3 py-1.5 text-xs font-semibold text-dark transition-colors hover:border-coral hover:text-coral"
              >
                ✏️ {t('host.event.editAction')}
              </Link>
            ) : null}
          </div>

          {canEdit ? (
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold text-dark">
                  {t('host.event.typeLabel')}
                </label>
                <div className="flex flex-wrap gap-2">
                  {TYPES.map((tp) => (
                    <button
                      key={tp.key}
                      type="button"
                      onClick={() => updateDraft({ type: tp.key })}
                      className={cn(
                        'inline-flex min-h-[40px] items-center gap-2 rounded-full border-2 px-3.5 py-1.5 text-sm font-semibold transition-all',
                        draft.type === tp.key
                          ? 'border-coral bg-coral text-white shadow-cta'
                          : 'border-gray-light bg-white text-dark hover:border-coral hover:text-coral',
                      )}
                    >
                      <span aria-hidden="true">{tp.icon}</span>
                      {t(`eventTypes.${tp.key}`)}
                    </button>
                  ))}
                </div>
              </div>

              <Input
                label={t('host.event.nameLabel')}
                value={draft.name}
                onChange={(e) => {
                  updateDraft({ name: e.target.value })
                  if (nameError) setNameError(null)
                }}
                error={nameError ?? undefined}
                placeholder={t('host.event.namePlaceholder')}
              />
            </div>
          ) : null}

          <div className="flex flex-col gap-2 sm:flex-row">
            <Button variant="coral" size="md" onClick={shareLink} fullWidth className="sm:w-auto">
              📤 {t('host.event.share')}
            </Button>
            <Button variant="outline" size="md" onClick={copyLink} fullWidth className="sm:w-auto">
              📋 {t('host.dashboard.actions.copyLink')}
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

      {/* Gifts */}
      <section className="mt-6 flex flex-col gap-4">
        <header className="flex items-end justify-between">
          <h2 className="text-lg font-extrabold tracking-tight text-dark sm:text-xl">
            {t('host.event.giftsTitle')}
          </h2>
          <span className="text-xs font-semibold text-dark-light">
            {draft.want.length + draft.nice.length + draft.avoid.length}{' '}
            {t('host.event.giftsCount')}
          </span>
        </header>

        <GiftCategoryEditor
          palette="want"
          icon="❤️"
          title={t('host.create.step2.categories.want')}
          tagline={t('host.create.step2.categories.wantTagline')}
          items={draft.want}
          editable={canEdit}
          onAdd={(v) => addItem('want', v)}
          onRemove={(i) => removeItem('want', i)}
          onEdit={(i, v) => editItem('want', i, v)}
          addPlaceholder={t('host.event.itemPlaceholder')}
          addLabel={t('host.event.addItem')}
          emptyLabel={t('host.event.gifts.empty')}
        />
        <GiftCategoryEditor
          palette="nice"
          icon="💛"
          title={t('host.create.step2.categories.nice')}
          tagline={t('host.create.step2.categories.niceTagline')}
          items={draft.nice}
          editable={canEdit}
          onAdd={(v) => addItem('nice', v)}
          onRemove={(i) => removeItem('nice', i)}
          onEdit={(i, v) => editItem('nice', i, v)}
          addPlaceholder={t('host.event.itemPlaceholder')}
          addLabel={t('host.event.addItem')}
          emptyLabel={t('host.event.gifts.empty')}
        />
        <GiftCategoryEditor
          palette="avoid"
          icon="⛔"
          title={t('host.create.step2.categories.avoid')}
          tagline={t('host.create.step2.categories.avoidTagline')}
          items={draft.avoid}
          editable={canEdit}
          onAdd={(v) => addItem('avoid', v)}
          onRemove={(i) => removeItem('avoid', i)}
          onEdit={(i, v) => editItem('avoid', i, v)}
          addPlaceholder={t('host.event.itemPlaceholder')}
          addLabel={t('host.event.addItem')}
          emptyLabel={t('host.event.gifts.empty')}
        />
      </section>

      {/* Save bar (host edit only) */}
      {canEdit ? (
        <div
          className={cn(
            'sticky bottom-0 z-20 -mx-4 mt-8 border-t border-gray-light bg-white/95 px-4 py-3 backdrop-blur sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8',
            !isDirty && 'opacity-90',
          )}
        >
          <div className="mx-auto flex w-full max-w-2xl flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-xs text-dark-light">
              {isDirty
                ? t('host.event.unsaved', 'You have unsaved changes.')
                : t('host.event.allSaved', 'All changes saved.')}
            </p>
            <div className="flex flex-col-reverse gap-2 sm:flex-row">
              <Button
                variant="outline"
                size="sm"
                onClick={discard}
                disabled={!isDirty || saving}
                fullWidth
                className="sm:w-auto"
              >
                {t('host.event.discard')}
              </Button>
              <Button
                variant="coral"
                size="sm"
                onClick={save}
                loading={saving}
                disabled={!isDirty}
                fullWidth
                className="sm:w-auto"
              >
                {t('host.event.save')}
              </Button>
            </div>
          </div>
        </div>
      ) : null}

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

interface GiftCategoryEditorProps {
  palette: 'want' | 'nice' | 'avoid'
  icon: string
  title: string
  tagline: string
  items: string[]
  editable: boolean
  onAdd: (value: string) => void
  onRemove: (index: number) => void
  onEdit: (index: number, value: string) => void
  addPlaceholder: string
  addLabel: string
  emptyLabel: string
}

function GiftCategoryEditor({
  palette,
  icon,
  title,
  tagline,
  items,
  editable,
  onAdd,
  onRemove,
  onEdit,
  addPlaceholder,
  addLabel,
  emptyLabel,
}: GiftCategoryEditorProps) {
  const [newItem, setNewItem] = useState('')

  const submitNew = () => {
    if (!newItem.trim()) return
    onAdd(newItem)
    setNewItem('')
  }

  const handleKey = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      submitNew()
    }
  }

  const styles = {
    want: {
      frame: 'bg-gradient-to-br from-coral/20 to-coral/10 ring-1 ring-coral/25',
      header: 'bg-gradient-to-r from-coral to-coral-light text-white',
      headerSub: 'text-white/90',
      badge: 'bg-white/30 text-white',
      itemIcon: '🎁',
      addBtn: 'bg-coral text-white hover:bg-coral-dark',
      removeHover: 'hover:text-coral',
    },
    nice: {
      frame: 'bg-gradient-to-br from-gold/25 to-gold/10 ring-1 ring-gold/40',
      header: 'bg-gradient-to-r from-gold to-gold-light text-dark',
      headerSub: 'text-dark/70',
      badge: 'bg-dark/15 text-dark',
      itemIcon: '🎁',
      addBtn: 'bg-dark text-white hover:bg-dark-light',
      removeHover: 'hover:text-coral',
    },
    avoid: {
      frame: 'bg-gradient-to-br from-red-soft/30 to-red-soft/15 ring-1 ring-red-soft/60',
      header: 'bg-gradient-to-r from-red-soft to-red-soft/85 text-dark',
      headerSub: 'text-dark/70',
      badge: 'bg-dark/15 text-dark',
      itemIcon: '✕',
      addBtn: 'bg-red-soft text-dark hover:bg-red-soft/85',
      removeHover: 'hover:text-coral',
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
          items.map((name, idx) => (
            <li
              key={idx}
              className="flex items-center gap-2 rounded-xl bg-white p-2.5 shadow-sm"
            >
              <span className="text-base text-dark-light" aria-hidden="true">
                {styles.itemIcon}
              </span>
              {editable ? (
                <input
                  type="text"
                  value={name}
                  onChange={(e) => onEdit(idx, e.target.value)}
                  className="min-w-0 flex-1 rounded-md bg-transparent px-1 py-1 text-sm font-semibold text-dark focus:bg-bg focus:outline-none"
                />
              ) : (
                <span className="min-w-0 flex-1 truncate text-sm font-semibold text-dark">
                  {name}
                </span>
              )}
              {editable ? (
                <button
                  type="button"
                  onClick={() => onRemove(idx)}
                  className={cn(
                    'shrink-0 rounded-full p-1.5 text-dark-light',
                    styles.removeHover,
                  )}
                  aria-label="Remove"
                >
                  🗑
                </button>
              ) : null}
            </li>
          ))
        )}

        {editable ? (
          <li className="flex items-center gap-2 rounded-xl bg-white p-2 shadow-sm">
            <input
              type="text"
              value={newItem}
              onChange={(e) => setNewItem(e.target.value)}
              onKeyDown={handleKey}
              placeholder={addPlaceholder}
              className="min-w-0 flex-1 rounded-md bg-transparent px-2 py-1 text-sm text-dark placeholder:text-gray focus:bg-bg focus:outline-none"
            />
            <button
              type="button"
              onClick={submitNew}
              disabled={!newItem.trim()}
              className={cn(
                'shrink-0 rounded-full px-3 py-1.5 text-xs font-semibold transition-colors',
                newItem.trim() ? styles.addBtn : 'bg-gray-light text-dark-light',
              )}
            >
              + {addLabel}
            </button>
          </li>
        ) : null}
      </ul>
    </section>
  )
}
