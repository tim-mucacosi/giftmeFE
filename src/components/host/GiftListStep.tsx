'use client'

import { useState } from 'react'
import { useTranslate } from '@tolgee/react'
import { Button } from '@/components/shared/Button'
import { Modal } from '@/components/shared/Modal'
import { GiftAddForm, type GiftDraft } from './GiftAddForm'
import type { Gift, GiftCategory } from '@/types/gift'
import { cn } from '@/lib/utils/cn'

export type DraftGift = Gift

/** Compact display label for a gift link, e.g. "ikea.rs". */
function linkLabel(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, '')
  } catch {
    return url
  }
}

const CATEGORY_META: { key: GiftCategory; icon: string; palette: string }[] = [
  { key: 'want', icon: '❤️', palette: 'want' },
  { key: 'nice', icon: '💛', palette: 'nice' },
  { key: 'avoid', icon: '⛔', palette: 'avoid' },
]

interface Props {
  gifts: DraftGift[]
  onChange: (gifts: DraftGift[]) => void
  onNext: () => void
  onBack: () => void
}

export function GiftListStep({ gifts, onChange, onNext, onBack }: Props) {
  const { t } = useTranslate()
  const [addingInto, setAddingInto] = useState<GiftCategory | null>(null)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [openMap, setOpenMap] = useState<Record<GiftCategory, boolean>>({
    want: true,
    nice: true,
    avoid: true,
  })

  const addGift = (cat: GiftCategory, draft: GiftDraft) => {
    const newGift: DraftGift = {
      ...draft,
      category: cat,
      id: `tmp_${Math.random().toString(36).slice(2, 8)}`,
      eventId: 'draft',
      reservedQuantity: 0,
      order: gifts.filter((g) => g.category === cat).length,
    }
    onChange([...gifts, newGift])
    setAddingInto(null)
  }

  const updateGift = (giftId: string, draft: GiftDraft) => {
    onChange(
      gifts.map((g) =>
        g.id === giftId
          ? { ...g, ...draft, category: g.category }
          : g
      )
    )
    setEditingId(null)
  }

  const removeGift = (id: string) => {
    onChange(gifts.filter((g) => g.id !== id))
  }

  // Swap a gift with its neighbour within its own category. The overall
  // array keeps its shape; only the two category slots trade contents, so
  // the payload (which preserves array order per category) follows along.
  const moveGift = (id: string, dir: -1 | 1) => {
    const gift = gifts.find((g) => g.id === id)
    if (!gift) return
    const catItems = gifts.filter((g) => g.category === gift.category)
    const idx = catItems.findIndex((g) => g.id === id)
    const target = idx + dir
    if (target < 0 || target >= catItems.length) return
    const reordered = [...catItems]
    ;[reordered[idx], reordered[target]] = [reordered[target]!, reordered[idx]!]
    let i = 0
    onChange(
      gifts.map((g) => (g.category === gift.category ? { ...reordered[i]!, order: i++ } : g)),
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-2xl font-extrabold tracking-tight text-dark sm:text-3xl">
          {t('host.create.step2.title')}
        </h2>
        <p className="mt-1 text-sm text-dark-light">{t('host.create.step2.desc')}</p>
      </div>

      {CATEGORY_META.map(({ key, icon, palette }) => {
        const items = gifts.filter((g) => g.category === key)
        const open = openMap[key]
        return (
          <section
            key={key}
            className={cn(
              'rounded-2xl',
              palette === 'want' && 'bg-gradient-to-br from-success/15 to-success/5 p-1',
              palette === 'nice' && 'bg-gradient-to-br from-gold/15 to-gold/5 p-1',
              palette === 'avoid' && 'border-2 border-dashed border-red-soft bg-red-soft/5 p-1',
            )}
          >
            <button
              type="button"
              onClick={() => setOpenMap((m) => ({ ...m, [key]: !m[key] }))}
              className={cn(
                'flex w-full items-center justify-between rounded-2xl px-4 py-3 text-left transition-colors',
                palette === 'want' && 'bg-gradient-to-r from-success to-success/80 text-dark',
                palette === 'nice' && 'bg-gradient-to-r from-gold to-gold-light text-dark',
                palette === 'avoid' && 'text-dark-light',
              )}
              aria-expanded={open}
            >
              <div className="flex items-center gap-3">
                <span className="text-xl" aria-hidden="true">
                  {icon}
                </span>
                <div>
                  <div className="text-base font-extrabold tracking-tight">
                    {t(`host.create.step2.categories.${key}`)}
                  </div>
                  <div className="text-xs opacity-85">
                    {t(`host.create.step2.categories.${key}Tagline`)}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="rounded-full bg-white/25 px-2 py-0.5 text-xs font-bold">
                  {items.length}
                </span>
                <span aria-hidden="true" className={cn(open && 'rotate-180')}>
                  ▾
                </span>
              </div>
            </button>

            {open ? (
              <div className="flex flex-col gap-2 p-3">
                {items.length === 0 ? (
                  <p className="px-2 py-3 text-center text-sm text-dark-light">—</p>
                ) : (
                  items.map((g, idx) => (
                    <div
                      key={g.id}
                      className={cn(
                        'flex items-center gap-2 rounded-xl border-2 p-3 shadow-sm transition-all hover:shadow-md',
                        palette === 'want' && 'border-success/70 bg-success/30 hover:border-success hover:bg-success/40',
                        palette === 'nice' && 'border-gold/70 bg-gold/30 hover:border-gold hover:bg-gold/40',
                        palette === 'avoid' && 'border-red-soft/80 bg-red-soft/30 hover:border-red-soft hover:bg-red-soft/40',
                      )}
                    >
                      <div className="flex shrink-0 flex-col gap-1">
                        <button
                          type="button"
                          onClick={() => moveGift(g.id, -1)}
                          disabled={idx === 0}
                          aria-label={`${t('host.create.step2.moveUp')}: ${g.name}`}
                          className="flex h-8 w-8 items-center justify-center rounded-lg border border-gray-light bg-white text-dark-light transition-colors hover:border-coral hover:text-coral focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-coral disabled:opacity-30 disabled:hover:border-gray-light disabled:hover:text-dark-light"
                        >
                          <svg aria-hidden="true" viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round">
                            <path d="M18 15l-6-6-6 6" />
                          </svg>
                        </button>
                        <button
                          type="button"
                          onClick={() => moveGift(g.id, 1)}
                          disabled={idx === items.length - 1}
                          aria-label={`${t('host.create.step2.moveDown')}: ${g.name}`}
                          className="flex h-8 w-8 items-center justify-center rounded-lg border border-gray-light bg-white text-dark-light transition-colors hover:border-coral hover:text-coral focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-coral disabled:opacity-30 disabled:hover:border-gray-light disabled:hover:text-dark-light"
                        >
                          <svg aria-hidden="true" viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round">
                            <path d="M6 9l6 6 6-6" />
                          </svg>
                        </button>
                      </div>
                      <div className="flex-1 overflow-hidden">
                        <div className="flex items-center gap-1.5">
                          <span className="truncate text-sm font-bold text-dark">
                            {g.type === 'envelope' ? '💌 ' : ''}
                            {g.name}
                          </span>
                          {key !== 'avoid' ? (
                            <span className="shrink-0 rounded-full bg-gray-light/60 px-1.5 py-0.5 text-[10px] font-bold text-dark-light">
                              {g.unlimited ? '∞' : `×${g.quantity}`}
                            </span>
                          ) : null}
                        </div>
                        {g.description ? (
                          <div className="truncate text-xs text-dark-light">{g.description}</div>
                        ) : null}
                        {g.link ? (
                          <a
                            href={g.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex max-w-full items-center gap-1 truncate text-xs font-medium text-coral hover:underline"
                          >
                            🔗 {linkLabel(g.link)}
                          </a>
                        ) : null}
                      </div>
                      <button
                        type="button"
                        onClick={() => setEditingId(g.id)}
                        className="rounded-full p-2 text-dark-light hover:text-coral"
                        aria-label={t('common.buttons.edit')}
                      >
                        ✏️
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeletingId(g.id)}
                        className="rounded-full p-2 text-dark-light hover:text-coral"
                        aria-label={t('common.buttons.delete')}
                      >
                        🗑
                      </button>
                    </div>
                  ))
                )}
                <div className="flex justify-center pt-1 pb-1">
                  <Button
                    type="button"
                    variant={palette === 'nice' ? 'gold' : palette === 'want' ? 'success' : 'coral'}
                    size="sm"
                    onClick={() => setAddingInto(key)}
                    className="px-6"
                  >
                    <svg
                      aria-hidden="true"
                      viewBox="0 0 24 24"
                      className="h-4 w-4"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={3}
                      strokeLinecap="round"
                    >
                      <path d="M12 5v14M5 12h14" />
                    </svg>
                    {t('host.create.step2.addGift')}
                  </Button>
                </div>
              </div>
            ) : null}
          </section>
        )
      })}

      {addingInto ? (
        <GiftAddForm
          open
          onClose={() => setAddingInto(null)}
          onSubmit={(d) => addGift(addingInto, d)}
          category={addingInto}
        />
      ) : null}

      {editingId ? (() => {
        const gift = gifts.find((g) => g.id === editingId)
        if (!gift) return null
        return (
          <GiftAddForm
            open
            onClose={() => setEditingId(null)}
            onSubmit={(d) => updateGift(editingId, d)}
            category={gift.category}
            initial={gift}
          />
        )
      })() : null}

      {/* Delete confirmation */}
      {deletingId ? (() => {
        const gift = gifts.find((g) => g.id === deletingId)
        if (!gift) return null
        return (
          <Modal
            open
            onClose={() => setDeletingId(null)}
            title={t('host.create.step2.deleteConfirm.title')}
          >
            <div className="flex flex-col gap-4">
              <p className="rounded-xl bg-bg px-3 py-2.5 text-sm font-bold text-dark">
                {gift.type === 'envelope' ? '💌 ' : ''}
                {gift.name}
              </p>
              <p className="text-sm text-dark-light">
                {t('host.create.step2.deleteConfirm.text')}
              </p>
              <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                <Button variant="outline" type="button" onClick={() => setDeletingId(null)}>
                  {t('common.buttons.cancel')}
                </Button>
                <Button
                  type="button"
                  onClick={() => {
                    removeGift(gift.id)
                    setDeletingId(null)
                  }}
                >
                  {t('common.buttons.delete')}
                </Button>
              </div>
            </div>
          </Modal>
        )
      })() : null}

      {gifts.length === 0 ? (
        <p className="rounded-xl bg-bg px-3 py-2.5 text-center text-sm text-dark-light" role="status">
          {t('host.create.step2.emptyHint')}
        </p>
      ) : null}

      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-between">
        <Button variant="outline" onClick={onBack} fullWidth className="sm:w-auto">
          ← {t('common.buttons.back')}
        </Button>
        <Button onClick={onNext} disabled={gifts.length === 0} fullWidth className="sm:w-auto">
          {t('common.buttons.next')} →
        </Button>
      </div>
    </div>
  )
}
