import { describe, expect, it } from 'vitest'
import { usesQuantity, validateGiftForm, type GiftFormValues } from './giftSchema'

const form = (overrides: Partial<GiftFormValues> = {}): GiftFormValues => ({
  type: 'item',
  category: 'want',
  name: 'Coffee machine',
  quantity: '2',
  unlimited: false,
  link: '',
  description: '',
  ...overrides,
})

describe('usesQuantity', () => {
  it('is on for regular gifts and off for avoid entries and envelopes', () => {
    expect(usesQuantity('want', 'item')).toBe(true)
    expect(usesQuantity('nice', 'item')).toBe(true)
    expect(usesQuantity('avoid', 'item')).toBe(false)
    expect(usesQuantity('want', 'envelope')).toBe(false)
  })
})

describe('validateGiftForm', () => {
  it('accepts a valid gift and trims the name', () => {
    const { errors, parsed } = validateGiftForm(form({ name: '  Coffee machine  ' }))
    expect(errors).toEqual({})
    expect(parsed?.name).toBe('Coffee machine')
    expect(parsed?.quantity).toBe(2)
  })

  it('rejects a blank or whitespace-only name', () => {
    expect(validateGiftForm(form({ name: '   ' })).errors.name).toBe('common.errors.required')
  })

  it('accepts positive whole quantities only', () => {
    expect(validateGiftForm(form({ quantity: '0' })).errors.quantity).toBeTruthy()
    expect(validateGiftForm(form({ quantity: '-1' })).errors.quantity).toBeTruthy()
    expect(validateGiftForm(form({ quantity: '1.5' })).errors.quantity).toBeTruthy()
    expect(validateGiftForm(form({ quantity: 'abc' })).errors.quantity).toBeTruthy()
    expect(validateGiftForm(form({ quantity: '3' })).errors.quantity).toBeUndefined()
  })

  it('ignores quantity when unlimited is selected', () => {
    const { errors, parsed } = validateGiftForm(form({ quantity: '', unlimited: true }))
    expect(errors.quantity).toBeUndefined()
    expect(parsed?.unlimited).toBe(true)
  })

  it('does not require a quantity for "please avoid" entries', () => {
    const { errors, parsed } = validateGiftForm(form({ category: 'avoid', quantity: '' }))
    expect(errors.quantity).toBeUndefined()
    expect(parsed?.unlimited).toBe(false)
  })

  it('normalizes a link without a scheme and rejects an invalid one', () => {
    expect(validateGiftForm(form({ link: 'www.shop.com/x' })).parsed?.link).toBe(
      'https://www.shop.com/x',
    )
    expect(validateGiftForm(form({ link: 'not a url' })).errors.link).toBeTruthy()
    // Empty stays valid: the link is optional.
    expect(validateGiftForm(form({ link: '' })).errors.link).toBeUndefined()
  })
})
