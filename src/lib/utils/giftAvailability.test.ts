import { describe, expect, it } from 'vitest'
import { isGiftAvailable, remainingLabel } from './giftAvailability'

describe('isGiftAvailable', () => {
  it('is available while units remain', () => {
    expect(isGiftAvailable({ id: 'g1', unlimited: false, available: 2 })).toBe(true)
  })

  it('becomes unavailable at zero remaining', () => {
    expect(isGiftAvailable({ id: 'g1', unlimited: false, available: 0 })).toBe(false)
  })

  it('unlimited gifts stay available regardless of count', () => {
    expect(isGiftAvailable({ id: 'e1', unlimited: true, available: 0 })).toBe(true)
  })

  it('legacy gifts without a backend id cannot be reserved', () => {
    expect(isGiftAvailable({ id: '', unlimited: false, available: 5 })).toBe(false)
  })
})

describe('remainingLabel', () => {
  it('reports remaining units for items', () => {
    expect(remainingLabel({ unlimited: false, quantity: 3, reservedQuantity: 1 })).toBe(2)
    expect(remainingLabel({ unlimited: false, quantity: 1, reservedQuantity: 4 })).toBe(0)
  })

  it('is null for unlimited gifts', () => {
    expect(remainingLabel({ unlimited: true, quantity: 1, reservedQuantity: 9 })).toBeNull()
  })
})
