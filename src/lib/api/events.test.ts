import { describe, expect, it } from 'vitest'
import { buildEventPayload, mapApiEventDetail, mapGift } from './events'

describe('buildEventPayload', () => {
  const base = {
    name: '  Anna and Mark  ',
    type: 'wedding' as const,
    userId: 'u1',
    message: ' hi ',
    date: '2026-09-01',
  }

  it('splits gifts into backend categories and trims fields', () => {
    const payload = buildEventPayload({
      ...base,
      gifts: [
        { name: ' Coffee machine ', category: 'want', type: 'item', quantity: 2 },
        { name: 'Towel set', category: 'nice', type: 'item', quantity: 1 },
        { name: 'Flowers', category: 'avoid', type: 'item', quantity: 1 },
      ],
    })
    expect(payload.name).toBe('Anna and Mark')
    expect(payload.iWant).toEqual([{ name: 'Coffee machine', quantity: 2 }])
    expect(payload.iAmOkWithIt).toEqual([{ name: 'Towel set', quantity: 1 }])
    expect(payload.iDontWant).toEqual([{ name: 'Flowers', quantity: 1 }])
    expect(payload.expirationDate).toBe(new Date('2026-09-01').toISOString())
    expect(payload.eventType).toEqual({ name: 'wedding' })
    // Ownership must come from the auth token, never the payload.
    expect('user' in payload).toBe(false)
    expect('userId' in payload).toBe(false)
  })

  it('marks envelope gifts and omits quantity for them', () => {
    const payload = buildEventPayload({
      ...base,
      gifts: [
        {
          name: '',
          category: 'want',
          type: 'envelope',
          quantity: 999,
          suggestedAmounts: [20, 50],
        },
      ],
    })
    expect(payload.iWant).toEqual([
      { name: 'Money in an envelope', type: 'envelope', suggestedAmounts: [20, 50] },
    ])
  })

  it('passes backend ids through so edits preserve reservations', () => {
    const serverId = '64b7f8a2c1d2e3f4a5b6c7d8'
    const payload = buildEventPayload({
      ...base,
      gifts: [
        { name: 'Vase', category: 'want', type: 'item', quantity: 1, serverId },
        { name: 'New gift', category: 'want', type: 'item', quantity: 1, serverId: 'tmp_abc123' },
      ],
    })
    expect(payload.iWant[0]!._id).toBe(serverId)
    // Local draft ids must not leak to the API.
    expect(payload.iWant[1]!._id).toBeUndefined()
  })
})

describe('mapGift', () => {
  it('computes availability from desired minus reserved', () => {
    const gift = mapGift({ _id: 'g1', name: 'Coffee machine', quantity: 2, reservedQuantity: 1 })
    expect(gift.available).toBe(1)
    expect(gift.type).toBe('item')
  })

  it('never goes below zero and treats envelopes as unlimited', () => {
    expect(mapGift({ _id: 'g', name: 'X', quantity: 1, reservedQuantity: 5 }).available).toBe(0)
    const env = mapGift({ _id: 'e', name: 'Envelope', type: 'envelope', reservedQuantity: 40 })
    expect(env.available).toBe(Number.POSITIVE_INFINITY)
  })
})

describe('mapApiEventDetail', () => {
  const dto = {
    _id: 'abc',
    publicId: 'pub123',
    name: 'Wedding',
    eventType: { name: 'wedding' },
    user: 'host1',
    iWant: [{ _id: 'g1', name: 'Coffee machine', quantity: 2, reservedQuantity: 2 }],
    iAmOkWithIt: [],
    iDontWant: [{ _id: 'g2', name: 'Flowers', quantity: 1 }],
    reservations: [
      { _id: 'r1', giftId: 'g1', giftName: 'Coffee machine', guestName: 'Ana', createdAt: '2026-07-01' },
    ],
  }

  it('uses the public id as the share slug', () => {
    expect(mapApiEventDetail(dto).slug).toBe('pub123')
    expect(mapApiEventDetail({ ...dto, publicId: undefined }).slug).toBe('abc')
  })

  it('maps host reservations when present', () => {
    const detail = mapApiEventDetail(dto)
    expect(detail.reservations).toHaveLength(1)
    expect(detail.reservations![0]!.guestName).toBe('Ana')
  })

  it('leaves reservations undefined on public payloads', () => {
    const { reservations, ...publicDto } = dto
    expect(mapApiEventDetail(publicDto).reservations).toBeUndefined()
  })
})
