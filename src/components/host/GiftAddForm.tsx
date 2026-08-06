'use client'

import { useRef, useState } from 'react'
import { useTranslate } from '@tolgee/react'
import { Modal } from '@/components/shared/Modal'
import { Input } from '@/components/shared/Input'
import { Textarea } from '@/components/shared/Textarea'
import { Button } from '@/components/shared/Button'
import {
  GIFT_DESCRIPTION_MAX,
  GIFT_NAME_MAX,
  GIFT_QUANTITY_MAX,
  usesQuantity,
  validateGiftForm,
  type GiftFormErrors,
} from '@/lib/validations/giftSchema'
import type { Gift, GiftCategory } from '@/types/gift'
import { trackEvent } from '@/lib/analytics/track'

export type GiftDraft = Omit<Gift, 'id' | 'eventId' | 'reservedQuantity' | 'order'>

interface Props {
  open: boolean
  onClose: () => void
  onSubmit: (draft: GiftDraft) => void
  category: GiftCategory
  initial?: GiftDraft
}

export function GiftAddForm({ open, onClose, onSubmit, category, initial }: Props) {
  const { t } = useTranslate()
  // Only pre-existing envelope gifts reach this form (new gifts are always
  // items); editing keeps their type so reservations on them survive.
  const isEnvelope = initial?.type === 'envelope'
  const [name, setName] = useState(initial?.name ?? '')
  const [description, setDescription] = useState(initial?.description ?? '')
  // Kept as a string so the field can be emptied while typing; coerced on submit.
  const [quantity, setQuantity] = useState<string>(
    initial && !initial.unlimited ? String(initial.quantity) : initial?.unlimited ? '' : '1',
  )
  const [unlimited, setUnlimited] = useState<boolean>(initial?.unlimited ?? false)
  const [link, setLink] = useState(initial?.link ?? '')
  const [errors, setErrors] = useState<GiftFormErrors>({})
  // Guards against a second submit racing the close of the modal.
  const submittingRef = useRef(false)
  // "Please avoid" entries are informational: no inventory to track.
  const showQuantity = usesQuantity(category, isEnvelope ? 'envelope' : 'item')

  const clearError = (field: keyof GiftFormErrors) =>
    setErrors((prev) => (prev[field] ? { ...prev, [field]: undefined } : prev))

  const toggleUnlimited = (checked: boolean) => {
    setUnlimited(checked)
    // Selecting Unlimited discards any typed quantity; deselecting requires
    // the user to enter a valid quantity again.
    setQuantity('')
    clearError('quantity')
  }

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    if (submittingRef.current) return
    const { errors: nextErrors, parsed } = validateGiftForm({
      type: isEnvelope ? 'envelope' : 'item',
      category,
      name,
      quantity,
      unlimited,
      link,
      description,
    })
    setErrors(nextErrors)
    if (!parsed) return
    submittingRef.current = true
    const draft: GiftDraft = parsed.type === 'envelope'
      ? {
          type: 'envelope',
          category,
          name: parsed.name,
          description: parsed.description,
          // Envelope gifts have no inventory; they are always unlimited.
          quantity: 1,
          unlimited: true,
        }
      : {
          type: 'item',
          category,
          name: parsed.name,
          description: parsed.description,
          quantity: parsed.quantity,
          unlimited: parsed.unlimited,
          link: parsed.link,
        }
    // Only a new gift is a tracking event; editing an existing one is not.
    if (!initial) trackEvent('gift_added', { category })
    onSubmit(draft)
    onClose()
  }

  return (
    <Modal open={open} onClose={onClose} title={t('host.create.step2.addGift')}>
      <form onSubmit={submit} noValidate className="flex flex-col gap-4">
        {!isEnvelope ? (
          <>
            <Input
              label={t('host.create.step2.form.name')}
              value={name}
              onChange={(e) => {
                setName(e.target.value)
                clearError('name')
              }}
              error={errors.name ? t(errors.name) : undefined}
              maxLength={GIFT_NAME_MAX}
              required
              autoFocus
            />
            {showQuantity ? (
              <div className="flex flex-col gap-1.5">
                <Input
                  type="number"
                  min={1}
                  max={GIFT_QUANTITY_MAX}
                  step={1}
                  inputMode="numeric"
                  label={t('host.create.step2.form.quantity')}
                  value={quantity}
                  onChange={(e) => {
                    setQuantity(e.target.value)
                    clearError('quantity')
                  }}
                  error={errors.quantity ? t(errors.quantity) : undefined}
                  disabled={unlimited}
                  required={!unlimited}
                />
                <label className="flex cursor-pointer items-center gap-2 py-1">
                  <input
                    type="checkbox"
                    checked={unlimited}
                    onChange={(e) => toggleUnlimited(e.target.checked)}
                    className="h-5 w-5 shrink-0 accent-coral"
                  />
                  <span className="text-sm font-semibold text-dark">
                    {t('host.create.step2.form.unlimited')}
                  </span>
                  <span className="text-xs text-dark-light">
                    {t('host.create.step2.form.unlimitedHint')}
                  </span>
                </label>
              </div>
            ) : null}
            <Input
              type="url"
              inputMode="url"
              label={t('host.create.step2.form.link')}
              placeholder={t('host.create.step2.form.linkPlaceholder')}
              value={link}
              onChange={(e) => {
                setLink(e.target.value)
                clearError('link')
              }}
              error={errors.link ? t(errors.link) : undefined}
            />
            <Textarea
              label={t('host.create.step2.form.description')}
              placeholder={t('host.create.step2.form.descriptionPlaceholder')}
              value={description}
              onChange={(e) => {
                setDescription(e.target.value)
                clearError('description')
              }}
              error={errors.description ? t(errors.description) : undefined}
              maxLength={GIFT_DESCRIPTION_MAX}
              rows={3}
            />
          </>
        ) : (
          <>
            <Input
              label={t('host.create.step2.form.name')}
              value={name}
              onChange={(e) => {
                setName(e.target.value)
                clearError('name')
              }}
              error={errors.name ? t(errors.name) : undefined}
              maxLength={GIFT_NAME_MAX}
              required
              autoFocus
            />
            <Textarea
              label={t('host.create.step2.form.description')}
              placeholder={t('host.create.step2.form.descriptionPlaceholder')}
              value={description}
              onChange={(e) => {
                setDescription(e.target.value)
                clearError('description')
              }}
              error={errors.description ? t(errors.description) : undefined}
              maxLength={GIFT_DESCRIPTION_MAX}
              rows={3}
            />
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
