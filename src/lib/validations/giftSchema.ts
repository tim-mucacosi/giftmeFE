// Limits mirror the backend gift schema (giftmeBE models/event.js).
export const GIFT_NAME_MAX = 200
export const GIFT_DESCRIPTION_MAX = 1000
export const GIFT_LINK_MAX = 500
export const GIFT_QUANTITY_MAX = 1000

export interface GiftFormValues {
  type: 'item' | 'envelope'
  name: string
  /** Raw input value; validated as a positive whole number unless unlimited. */
  quantity: string
  unlimited: boolean
  link: string
  description: string
}

export type GiftFormErrors = Partial<Record<'name' | 'quantity' | 'link' | 'description', string>>

export interface ParsedGiftForm {
  type: 'item' | 'envelope'
  name: string
  quantity: number
  unlimited: boolean
  link?: string
  description?: string
}

/**
 * Normalize a user-entered link: trim and default to https:// when no
 * protocol was typed. Returns '' for blank input.
 */
export function normalizeUrl(raw: string): string {
  const trimmed = raw.trim()
  if (!trimmed) return ''
  if (/^https?:\/\//i.test(trimmed)) return trimmed
  return `https://${trimmed}`
}

function isValidUrl(value: string): boolean {
  try {
    const url = new URL(value)
    if (url.protocol !== 'http:' && url.protocol !== 'https:') return false
    // Require a dot in the hostname so bare words ("notaurl") are rejected.
    return url.hostname.includes('.')
  } catch {
    return false
  }
}

/**
 * Validate the Add/Edit gift form. Error values are i18n keys. On success
 * `parsed` carries trimmed/coerced values ready for the draft.
 */
export function validateGiftForm(values: GiftFormValues): {
  errors: GiftFormErrors
  parsed?: ParsedGiftForm
} {
  const errors: GiftFormErrors = {}
  const name = values.name.trim()
  const isEnvelope = values.type === 'envelope'

  if (name.length === 0) {
    errors.name = 'common.errors.required'
  }
  if (name.length > GIFT_NAME_MAX) {
    errors.name = 'common.errors.tooLong'
  }

  let quantity = 1
  if (!isEnvelope && !values.unlimited) {
    const raw = values.quantity.trim()
    if (raw.length === 0) {
      errors.quantity = 'common.errors.required'
    } else if (!/^\d+$/.test(raw) || Number(raw) < 1 || Number(raw) > GIFT_QUANTITY_MAX) {
      errors.quantity = 'host.create.step2.form.quantityError'
    } else {
      quantity = Number(raw)
    }
  }

  const link = isEnvelope ? '' : normalizeUrl(values.link)
  if (link) {
    if (link.length > GIFT_LINK_MAX || !isValidUrl(link)) {
      errors.link = 'host.create.step2.form.linkError'
    }
  }

  const description = values.description.trim()
  if (description.length > GIFT_DESCRIPTION_MAX) {
    errors.description = 'common.errors.tooLong'
  }

  if (Object.keys(errors).length > 0) return { errors }

  return {
    errors,
    parsed: {
      type: values.type,
      name,
      quantity,
      unlimited: !isEnvelope && values.unlimited,
      link: link || undefined,
      description: description || undefined,
    },
  }
}
