import { afterEach, describe, expect, it, vi } from 'vitest'
import { buildEventPayload, EventApiError, getEventById, mapApiEventDetail, mapGift } from './events'

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
        { name: ' Coffee machine ', category: 'want', quantity: 2 },
        { name: 'Towel set', category: 'nice', quantity: 1 },
        { name: 'Flowers', category: 'avoid', quantity: 1 },
      ],
    })
    expect(payload.name).toBe('Anna and Mark')
    expect(payload.iWant).toEqual([{ name: 'Coffee machine', quantity: 2 }])
    expect(payload.iAmOkWithIt).toEqual([{ name: 'Towel set', quantity: 1 }])
    // "Please avoid" entries are informational: no inventory fields.
    expect(payload.iDontWant).toEqual([{ name: 'Flowers' }])
    expect(payload.expirationDate).toBe(new Date('2026-09-01').toISOString())
    expect(payload.eventType).toEqual({ name: 'wedding' })
    // Ownership must come from the auth token, never the payload.
    expect('user' in payload).toBe(false)
    expect('userId' in payload).toBe(false)
  })

  it('sends the unlimited flag and the link as whereToBuy', () => {
    const payload = buildEventPayload({
      ...base,
      gifts: [
        {
          name: 'Diapers',
          category: 'want',
          quantity: 1,
          unlimited: true,
          link: 'https://shop.example/diapers',
        },
      ],
    })
    expect(payload.iWant).toEqual([
      {
        name: 'Diapers',
        quantity: 1,
        unlimited: true,
        whereToBuy: 'https://shop.example/diapers',
      },
    ])
  })

  it('omits quantity and unlimited for "please avoid" entries', () => {
    const payload = buildEventPayload({
      ...base,
      gifts: [
        { name: 'Figurines', category: 'avoid', quantity: 5, unlimited: true },
      ],
    })
    expect(payload.iDontWant).toEqual([{ name: 'Figurines' }])
  })

  it('passes backend ids through so edits preserve reservations', () => {
    const serverId = '64b7f8a2c1d2e3f4a5b6c7d8'
    const payload = buildEventPayload({
      ...base,
      gifts: [
        { name: 'Vase', category: 'want', quantity: 1, serverId },
        { name: 'New gift', category: 'want', quantity: 1, serverId: 'tmp_abc123' },
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
    expect(gift.unlimited).toBe(false)
  })

  it('never goes below zero', () => {
    expect(mapGift({ _id: 'g', name: 'X', quantity: 1, reservedQuantity: 5 }).available).toBe(0)
  })

  it('treats unlimited item gifts as always available', () => {
    const gift = mapGift({ _id: 'g', name: 'Diapers', quantity: 1, reservedQuantity: 7, unlimited: true })
    expect(gift.unlimited).toBe(true)
    expect(gift.available).toBe(Number.POSITIVE_INFINITY)
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
    // Legacy reservations keep the name they were recorded with.
    expect(detail.reservations![0]!.guestName).toBe('Ana')
  })

  it('leaves reservations undefined on public payloads', () => {
    const { reservations, ...publicDto } = dto
    expect(mapApiEventDetail(publicDto).reservations).toBeUndefined()
  })
})

describe('getEventById (public endpoint status handling)', () => {
  function mockFetchOnce(status: number, body: unknown) {
    const response = {
      ok: status >= 200 && status < 300,
      status,
      text: async () => JSON.stringify(body),
    } as Response
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(response))
  }

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('returns the mapped event on 200', async () => {
    mockFetchOnce(200, {
      success: true,
      data: { publicId: 'pub123', name: 'Wedding', eventType: { name: 'wedding' } },
    })
    const detail = await getEventById('pub123')
    expect(detail?.name).toBe('Wedding')
  })

  it('resolves null for a nonexistent event (400)', async () => {
    mockFetchOnce(400, { success: false, message: 'Event not found' })
    await expect(getEventById('does-not-exist')).resolves.toBeNull()
  })

  it('resolves null for a legacy 404', async () => {
    mockFetchOnce(404, { success: false, message: 'Event not found' })
    await expect(getEventById('legacy')).resolves.toBeNull()
  })

  it('throws an EventApiError with status 410 for an expired event, without treating it as not-found', async () => {
    mockFetchOnce(410, {
      success: false,
      message: 'This event has expired',
      expirationDate: '2026-01-01T00:00:00.000Z',
    })
    const error = await getEventById('expired-event').catch((e: unknown) => e)
    expect(error).toBeInstanceOf(EventApiError)
    expect((error as EventApiError).status).toBe(410)
  })
})
