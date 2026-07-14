'use client'

import { useState } from 'react'
import { useTranslate } from '@tolgee/react'
import { Button } from '@/components/shared/Button'
import { GiftAddForm, type GiftDraft } from './GiftAddForm'
import type { Gift, GiftCategory } from '@/types/gift'
import { cn } from '@/lib/utils/cn'

export type DraftGift = Gift

const CATEGORY_META: { key: GiftCategory; icon: string; palette: string }[] = [
  { key: 'want', icon: '❤️', palette: 'want' },
  { key: 'nice', icon: '💛', palette: 'nice' },
  { key: 'avoid', icon: '⛔', palette: 'avoid' },
]

interface Props {
  gifts: DraftGift[]
  onChange: (gifts: DraftGift[]) => void
  collectGuestNames: boolean
  onCollectGuestNamesChange: (value: boolean) => void
  onNext: () => void
  onBack: () => void
}

export function GiftListStep({
  gifts,
  onChange,
  collectGuestNames,
  onCollectGuestNamesChange,
  onNext,
  onBack,
}: Props) {
  const { t } = useTranslate()
  const [addingInto, setAddingInto] = useState<GiftCategory | null>(null)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [openMap, setOpenMap] = useState<Record<GiftCategory, boolean>>({
    want: true,
    nice: true,
    avoid: false,
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
              palette === 'want' && 'bg-gradient-to-br from-coral/10 to-coral/5 p-1',
              palette === 'nice' && 'bg-gradient-to-br from-gold/15 to-gold/5 p-1',
              palette === 'avoid' && 'border-2 border-dashed border-red-soft bg-red-soft/5 p-1',
            )}
          >
            <button
              type="button"
              onClick={() => setOpenMap((m) => ({ ...m, [key]: !m[key] }))}
              className={cn(
                'flex w-full items-center justify-between rounded-2xl px-4 py-3 text-left transition-colors',
                palette === 'want' && 'bg-gradient-to-r from-coral to-coral-light text-white',
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
                  items.map((g) => (
                    <div
                      key={g.id}
                      className="flex items-center gap-3 rounded-xl bg-white p-3 shadow-sm"
                    >
                      <span className="text-lg text-dark-light" aria-hidden="true">
                        ⠿
                      </span>
                      <div className="flex-1 overflow-hidden">
                        <div className="truncate text-sm font-bold text-dark">
                          {g.type === 'envelope' ? '💌 ' : ''}
                          {g.name}
                        </div>
                        {g.description ? (
                          <div className="truncate text-xs text-dark-light">{g.description}</div>
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
                        onClick={() => removeGift(g.id)}
                        className="rounded-full p-2 text-dark-light hover:text-coral"
                        aria-label={t('common.buttons.delete')}
                      >
                        🗑
                      </button>
                    </div>
                  ))
                )}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setAddingInto(key)}
                  fullWidth
                >
                  {t('host.create.step2.addGift')}
                </Button>
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
          envelopeAllowed={!gifts.filter((g) => g.category === addingInto).some((g) => g.type === 'envelope')}
        />
      ) : null}

      {editingId ? (() => {
        const gift = gifts.find((g) => g.id === editingId)
        if (!gift) return null
        const envelopeExists = gifts.filter((g) => g.category === gift.category && g.id !== editingId).some((g) => g.type === 'envelope')
        return (
          <GiftAddForm
            open
            onClose={() => setEditingId(null)}
            onSubmit={(d) => updateGift(editingId, d)}
            category={gift.category}
            envelopeAllowed={!envelopeExists}
            initial={gift}
          />
        )
      })() : null}

      {/* Reservation settings */}
      <label className="flex cursor-pointer items-start gap-3 rounded-2xl border border-gray-light bg-white p-4 shadow-card">
        <input
          type="checkbox"
          checked={collectGuestNames}
          onChange={(e) => onCollectGuestNamesChange(e.target.checked)}
          className="mt-0.5 h-5 w-5 shrink-0 accent-coral"
        />
        <span className="min-w-0">
          <span className="block text-sm font-semibold text-dark">
            🙋 {t('host.create.step2.collectNames.label')}
          </span>
          <span className="mt-0.5 block text-xs text-dark-light">
            {t('host.create.step2.collectNames.hint')}
          </span>
        </span>
      </label>

      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-between">
        <Button variant="outline" onClick={onBack} fullWidth className="sm:w-auto">
          ← {t('common.buttons.back')}
        </Button>
        <Button onClick={onNext} fullWidth className="sm:w-auto">
          {t('common.buttons.next')} →
        </Button>
      </div>
    </div>
  )
}
