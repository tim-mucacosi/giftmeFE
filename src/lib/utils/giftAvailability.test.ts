import { describe, expect, it } from 'vitest'
import { isGiftAvailable, remainingLabel } from './giftAvailability'

describe('isGiftAvailable', () => {
  it('is available while units remain', () => {
    expect(isGiftAvailable({ id: 'g1', type: 'item', available: 2 })).toBe(true)
  })

  it('becomes unavailable at zero remaining', () => {
    expect(isGiftAvailable({ id: 'g1', type: 'item', available: 0 })).toBe(false)
  })

  it('envelope gifts stay available regardless of count', () => {
    expect(isGiftAvailable({ id: 'e1', type: 'envelope', available: 0 })).toBe(true)
  })

  it('legacy gifts without a backend id cannot be reserved', () => {
    expect(isGiftAvailable({ id: '', type: 'item', available: 5 })).toBe(false)
  })
})

describe('remainingLabel', () => {
  it('reports remaining units for items', () => {
    expect(remainingLabel({ type: 'item', quantity: 3, reservedQuantity: 1 })).toBe(2)
    expect(remainingLabel({ type: 'item', quantity: 1, reservedQuantity: 4 })).toBe(0)
  })

  it('is null (unlimited) for envelopes', () => {
    expect(remainingLabel({ type: 'envelope', quantity: 1, reservedQuantity: 9 })).toBeNull()
  })
})
