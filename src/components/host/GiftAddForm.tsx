'use client'

import { useState } from 'react'
import { useTranslate } from '@tolgee/react'
import { Modal } from '@/components/shared/Modal'
import { Input } from '@/components/shared/Input'
import { Textarea } from '@/components/shared/Textarea'
import { Button } from '@/components/shared/Button'
import { cn } from '@/lib/utils/cn'
import type { Gift, GiftCategory } from '@/types/gift'

export type GiftDraft = Omit<Gift, 'id' | 'eventId' | 'reservedQuantity' | 'order'>

interface Props {
  open: boolean
  onClose: () => void
  onSubmit: (draft: GiftDraft) => void
  category: GiftCategory
  envelopeAllowed: boolean
  initial?: GiftDraft
}

const DEFAULT_AMOUNTS = [20, 50, 100]

export function GiftAddForm({ open, onClose, onSubmit, category, envelopeAllowed, initial }: Props) {
  const { t } = useTranslate()
  const [isEnvelope, setIsEnvelope] = useState<boolean>(initial?.type === 'envelope')
  const [name, setName] = useState(initial?.name ?? '')
  const [description, setDescription] = useState(initial?.description ?? '')
  const [price, setPrice] = useState<string>(initial?.price?.toString() ?? '')
  // Kept as a string so the field can be emptied while typing; coerced on submit.
  const [quantity, setQuantity] = useState<string>(String(initial?.quantity ?? 1))
  const [color, setColor] = useState(initial?.color ?? '')
  const [store, setStore] = useState(initial?.store ?? '')
  const [suggestedAmounts, setSuggestedAmounts] =
    useState<number[]>(initial?.suggestedAmounts ?? DEFAULT_AMOUNTS)
  const [customAmount, setCustomAmount] = useState<string>('')

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!isEnvelope && !name.trim()) return
    const draft: GiftDraft = isEnvelope
      ? {
          type: 'envelope',
          category,
          name: name.trim() || t('host.create.step2.form.envelopeDefaultName', 'Koverta'),
          description: description.trim() || undefined,
          // Envelope gifts have no inventory; the backend treats them as
          // unlimited regardless of quantity.
          quantity: 1,
          suggestedAmounts,
        }
      : {
          type: 'item',
          category,
          name: name.trim(),
          description: description.trim() || undefined,
          price: price ? Number(price) : undefined,
          quantity: Math.max(1, Math.floor(Number(quantity)) || 1),
          color: color.trim() || undefined,
          store: store.trim() || undefined,
        }
    onSubmit(draft)
    onClose()
  }

  const addCustomAmount = () => {
    const n = Number(customAmount)
    if (!n || n <= 0) return
    if (suggestedAmounts.includes(n)) return
    setSuggestedAmounts((prev) => [...prev, n].sort((a, b) => a - b))
    setCustomAmount('')
  }

  return (
    <Modal open={open} onClose={onClose} title={t('host.create.step2.addGift').replace('+ ', '')}>
      <form onSubmit={submit} className="flex flex-col gap-4">
        {envelopeAllowed ? (
          <div className="flex rounded-full bg-gray-light p-1">
            <button
              type="button"
              onClick={() => setIsEnvelope(false)}
              className={cn(
                'flex-1 rounded-full px-4 py-2 text-sm font-semibold transition-colors',
                !isEnvelope ? 'bg-white text-dark shadow-sm' : 'text-dark-light',
              )}
            >
              🎁 {t('host.create.step2.form.typeItem')}
            </button>
            <button
              type="button"
              onClick={() => setIsEnvelope(true)}
              className={cn(
                'flex-1 rounded-full px-4 py-2 text-sm font-semibold transition-colors',
                isEnvelope ? 'bg-white text-dark shadow-sm' : 'text-dark-light',
              )}
            >
              💌 {t('host.create.step2.form.typeEnvelope')}
            </button>
          </div>
        ) : null}

        {!isEnvelope ? (
          <>
            <Input
              label={t('host.create.step2.form.name')}
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              autoFocus
            />
            <Textarea
              label={t('host.create.step2.form.description')}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
            />
            {category !== 'avoid' ? (
              <>
                <div className="grid grid-cols-2 gap-3">
                  <Input
                    type="number"
                    min={0}
                    label={t('host.create.step2.form.price')}
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                  />
                  <Input
                    type="number"
                    min={1}
                    label={t('host.create.step2.form.quantity')}
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    onBlur={() => {
                      const n = Math.floor(Number(quantity))
                      setQuantity(String(n >= 1 ? n : 1))
                    }}
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <Input
                    label={t('host.create.step2.form.color')}
                    value={color}
                    onChange={(e) => setColor(e.target.value)}
                  />
                  <Input
                    label={t('host.create.step2.form.store')}
                    value={store}
                    onChange={(e) => setStore(e.target.value)}
                  />
                </div>
              </>
            ) : null}
          </>
        ) : (
          <>
            <Input
              label={t('host.create.step2.form.envelopeTitleLabel')}
              placeholder={t('host.create.step2.form.envelopeDefaultName', 'Koverta')}
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <Textarea
              label={t('host.create.step2.form.description')}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
            />
            {category !== 'avoid' ? (
              <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold text-dark">
                  {t('host.create.step2.form.suggestedAmounts')}
                </label>
                <div className="flex flex-wrap gap-2">
                  {suggestedAmounts.map((amt) => (
                    <button
                      key={amt}
                      type="button"
                      onClick={() =>
                        setSuggestedAmounts((prev) => prev.filter((a) => a !== amt))
                      }
                      className="inline-flex min-h-[36px] items-center gap-1 rounded-full border-2 border-gold bg-gold/20 px-3 text-sm font-semibold text-dark hover:bg-gold/40"
                    >
                      {amt}€ <span aria-hidden="true">✕</span>
                    </button>
                  ))}
                </div>
                <div className="flex gap-2">
                  <Input
                    type="number"
                    min={1}
                    placeholder="75"
                    value={customAmount}
                    onChange={(e) => setCustomAmount(e.target.value)}
                    containerClassName="flex-1"
                  />
                  <Button type="button" variant="outline" size="sm" onClick={addCustomAmount}>
                    +
                  </Button>
                </div>
              </div>
            ) : null}
          </>
        )}

        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Button variant="outline" type="button" onClick={onClose}>
            {t('common.buttons.cancel')}
          </Button>
          <Button type="submit">
            {initial ? t('host.create.step2.form.editSubmit') : t('host.create.step2.form.submit')}
          </Button>
        </div>
      </form>
    </Modal>
  )
}
