import { USE_MOCKS } from './client'
import { mockEvents } from '@/lib/mocks/events'
import type { Event, EventType, EventGender } from '@/types/event'
import type { Gift, GiftCategory } from '@/types/gift'

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'https://giftmebe.onrender.com/api'

export interface CreateEventGiftInput
  extends Pick<Gift, 'name' | 'category' | 'description' | 'quantity' | 'price' | 'priceRange' | 'store' | 'type'> {
  /** Backend subdocument id, present when editing an existing gift. */
  serverId?: string
  suggestedAmounts?: number[]
}

export interface CreateEventInput {
  name: string
  type: EventType
  gender?: EventGender
  userId: string
  message?: string
  backgroundImageUrl?: string
  /** ISO date string for when the celebration happens. */
  date?: string
  gifts: CreateEventGiftInput[]
}

export class EventApiError extends Error {
  status: number
  code?: string
  constructor(message: string, status: number, code?: string) {
    super(message)
    this.name = 'EventApiError'
    this.status = status
    this.code = code
  }
}

interface ApiGift {
  _id?: string
  id?: string
  name?: string
  description?: string
  whereToBuy?: string
  priceInRange?: string
  type?: string
  quantity?: number
  reservedQuantity?: number
  suggestedAmounts?: number[]
}

interface ApiReservation {
  _id?: string
  id?: string
  giftId?: string
  category?: string
  giftName?: string
  guestName?: string
  message?: string
  createdAt?: string
}

interface ApiEventDto {
  _id?: string
  id?: string
  publicId?: string
  name?: string
  eventType?: { name?: string } | string
  gender?: string
  user?: string | { _id?: string; id?: string; name?: string; email?: string }
  message?: string
  backgroundImageUrl?: string
  /**
   * Backend field representing when the celebration happens; the list expires
   * for guests on/after this date. Frontend exposes it as `date` for clarity.
   */
  expirationDate?: string
  createdAt?: string
  updatedAt?: string
  iWant?: ApiGift[]
  iAmOkWithIt?: ApiGift[]
  iDontWant?: ApiGift[]
  reservations?: ApiReservation[]
}

export interface DetailGift {
  /** Backend gift id used for reservations. Empty for legacy gifts. */
  id: string
  name: string
  description?: string
  whereToBuy?: string
  priceInRange?: string
  type: 'item' | 'envelope'
  quantity: number
  reservedQuantity: number
  /** Remaining units. Envelope gifts are always available. */
  available: number
  suggestedAmounts?: number[]
}

export interface HostReservation {
  id: string
  giftId: string
  giftName: string
  guestName: string
  message?: string
  createdAt: string
}

export interface EventDetail {
  id: string
  /** Public share identifier (falls back to id for legacy events). */
  slug: string
  type: EventType
  gender?: EventGender
  name: string
  hostId: string
  hostName?: string
  message: string
  backgroundImageUrl?: string
  /** ISO date string of the celebration. Falls back to createdAt for legacy events. */
  date: string
  createdAt: string
  gifts: {
    want: DetailGift[]
    nice: DetailGift[]
    avoid: DetailGift[]
  }
  /** Present only on the authenticated host endpoint. */
  reservations?: HostReservation[]
}

function extractHostId(user: ApiEventDto['user']): string {
  if (!user) return ''
  if (typeof user === 'string') return user
  return user._id ?? user.id ?? ''
}

function extractHostName(user: ApiEventDto['user']): string | undefined {
  if (!user || typeof user === 'string') return undefined
  return user.name
}

export function mapGift(g: ApiGift): DetailGift {
  const type = g.type === 'envelope' ? 'envelope' : 'item'
  const quantity = typeof g.quantity === 'number' && g.quantity > 0 ? g.quantity : 1
  const reservedQuantity = typeof g.reservedQuantity === 'number' ? g.reservedQuantity : 0
  return {
    id: g._id ?? g.id ?? '',
    name: (g.name ?? '').trim(),
    description: g.description,
    whereToBuy: g.whereToBuy,
    priceInRange: g.priceInRange,
    type,
    quantity,
    reservedQuantity,
    available: type === 'envelope' ? Number.POSITIVE_INFINITY : Math.max(0, quantity - reservedQuantity),
    suggestedAmounts: g.suggestedAmounts,
  }
}

function mapGiftArr(arr: ApiEventDto['iWant']): DetailGift[] {
  if (!Array.isArray(arr)) return []
  return arr.map(mapGift).filter((g) => g.name.length > 0)
}

function sumBy<T>(arr: T[], fn: (item: T) => number): number {
  return arr.reduce((acc, item) => acc + fn(item), 0)
}

export function mapApiEvent(dto: ApiEventDto): Event {
  const id = dto._id ?? dto.id ?? ''
  const eventTypeName =
    typeof dto.eventType === 'string' ? dto.eventType : dto.eventType?.name
  const created = dto.createdAt ?? new Date().toISOString()
  // Prefer the host-chosen celebration date (stored as `expirationDate` on
  // the backend; expires the list for guests after that day). Fall back to
  // createdAt for legacy events that predate the field.
  const eventDate = dto.expirationDate ?? created
  const items = [...mapGiftArr(dto.iWant), ...mapGiftArr(dto.iAmOkWithIt)].filter(
    (g) => g.type === 'item',
  )
  return {
    id,
    slug: dto.publicId ?? id,
    type: (eventTypeName ?? 'other') as EventType,
    name: dto.name ?? '',
    date: eventDate,
    message: '',
    hostId: extractHostId(dto.user),
    createdAt: created,
    updatedAt: dto.updatedAt ?? created,
    stats: {
      gifts: items.length,
      desired: sumBy(items, (g) => g.quantity),
      reserved: sumBy(items, (g) => g.reservedQuantity),
      reservationCount: Array.isArray(dto.reservations) ? dto.reservations.length : undefined,
    },
  }
}

export function mapApiEventDetail(dto: ApiEventDto): EventDetail {
  const base = mapApiEvent(dto)
  return {
    id: base.id,
    slug: base.slug,
    type: base.type,
    gender: dto.gender as EventGender | undefined,
    name: base.name,
    hostId: base.hostId,
    hostName: extractHostName(dto.user),
    message: typeof dto.message === 'string' ? dto.message : '',
    backgroundImageUrl: dto.backgroundImageUrl,
    date: base.date,
    createdAt: base.createdAt,
    gifts: {
      want: mapGiftArr(dto.iWant),
      nice: mapGiftArr(dto.iAmOkWithIt),
      avoid: mapGiftArr(dto.iDontWant),
    },
    reservations: Array.isArray(dto.reservations)
      ? dto.reservations.map((r) => ({
          id: r._id ?? r.id ?? '',
          giftId: r.giftId ?? '',
          giftName: r.giftName ?? '',
          guestName: r.guestName ?? '',
          message: r.message,
          createdAt: r.createdAt ?? '',
        }))
      : undefined,
  }
}

async function readJson(response: Response): Promise<unknown> {
  try {
    const text = await response.text()
    return text ? JSON.parse(text) : null
  } catch {
    return null
  }
}

function throwApiError(response: Response, data: unknown): never {
  const parsed = (data ?? {}) as { message?: string; code?: string }
  throw new EventApiError(
    parsed.message ?? `API error: ${response.status}`,
    response.status,
    parsed.code,
  )
}

function unwrapDto(data: unknown): ApiEventDto | null {
  // Accept either a bare object or a wrapper like { data: {...} } / { event: {...} }.
  if (!data || typeof data !== 'object') return null
  if ('data' in data) return ((data as { data: ApiEventDto }).data ?? null)
  if ('event' in data) return ((data as { event: ApiEventDto }).event ?? null)
  return data as ApiEventDto
}

async function apiFetch(path: string, init?: RequestInit): Promise<Response> {
  try {
    return await fetch(`${API_URL}${path}`, init)
  } catch {
    throw new EventApiError('Network error', 0, 'NETWORK')
  }
}

function mockDetail(idOrSlug: string): EventDetail | null {
  const ev = mockEvents.find((e) => e.id === idOrSlug || e.slug === idOrSlug) ?? mockEvents[0]
  if (!ev) return null
  const gift = (partial: Partial<DetailGift> & { id: string; name: string }): DetailGift => ({
    type: 'item',
    quantity: 1,
    reservedQuantity: 0,
    available: 1,
    ...partial,
  })
  return {
    id: ev.id,
    slug: ev.slug,
    type: ev.type,
    name: ev.name,
    hostId: ev.hostId,
    hostName: 'Mock host',
    message: ev.message ?? '',
    backgroundImageUrl: ev.backgroundImageUrl,
    date: ev.date,
    createdAt: ev.createdAt,
    gifts: {
      want: [
        gift({ id: 'mock-wine', name: 'Bottle of red wine', quantity: 2, available: 2, description: 'A nice red wine' }),
        gift({ id: 'mock-envelope', name: 'Money in an envelope', type: 'envelope', available: Number.POSITIVE_INFINITY }),
      ],
      nice: [gift({ id: 'mock-linen', name: 'Linen tablecloth set', description: 'Natural linen' })],
      avoid: [gift({ id: 'mock-cards', name: 'Generic gift cards' })],
    },
    reservations: [],
  }
}

/**
 * Fetch one event. With a token the authenticated host endpoint is tried
 * first (it includes reservations); when the requester is not the owner or
 * the identifier is a public slug, it falls back to the public endpoint.
 */
export async function getEventById(idOrSlug: string, token?: string): Promise<EventDetail | null> {
  if (USE_MOCKS) return mockDetail(idOrSlug)

  const encoded = encodeURIComponent(idOrSlug)

  if (token) {
    const response = await apiFetch(`/events/${encoded}`, {
      headers: { Accept: 'application/json', Authorization: `Bearer ${token}` },
    })
    if (response.ok) {
      const dto = unwrapDto(await readJson(response))
      return dto ? mapApiEventDetail(dto) : null
    }
    if (response.status !== 403 && response.status !== 404 && response.status !== 401) {
      throwApiError(response, await readJson(response))
    }
    // Not the owner (or a public slug), so fall through to the public view.
  }

  const response = await apiFetch(`/events/public/${encoded}`, {
    headers: { Accept: 'application/json' },
  })
  if (response.status === 404) return null
  const data = await readJson(response)
  if (!response.ok) throwApiError(response, data)
  const dto = unwrapDto(data)
  return dto ? mapApiEventDetail(dto) : null
}

/** List the authenticated host's own events. */
export async function getMyEvents(token: string): Promise<Event[]> {
  if (USE_MOCKS) return mockEvents

  const response = await apiFetch('/events/mine', {
    headers: { Accept: 'application/json', Authorization: `Bearer ${token}` },
  })
  const data = await readJson(response)
  if (!response.ok) throwApiError(response, data)

  const list: ApiEventDto[] = Array.isArray(data)
    ? (data as ApiEventDto[])
    : Array.isArray((data as { data?: unknown })?.data)
      ? ((data as { data: ApiEventDto[] }).data)
      : []

  return list.map(mapApiEvent)
}

export function buildEventPayload(input: CreateEventInput) {
  const giftsByCategory = (cat: GiftCategory) =>
    input.gifts
      .filter((g) => g.category === cat)
      .map((g) => {
        const isEnvelope = g.type === 'envelope'
        const gift: Record<string, unknown> = isEnvelope
          ? { name: g.name.trim() || 'Money in an envelope', type: 'envelope' }
          : { name: g.name.trim(), quantity: g.quantity ?? 1 }
        if (g.serverId && /^[0-9a-f]{24}$/i.test(g.serverId)) gift._id = g.serverId
        if (g.description?.trim()) gift.description = g.description.trim()
        if (g.priceRange) gift.priceInRange = `${g.priceRange[0]}-${g.priceRange[1]}`
        else if (g.price) gift.priceInRange = String(g.price)
        if (g.store?.trim()) gift.whereToBuy = g.store.trim()
        if (isEnvelope && g.suggestedAmounts?.length) gift.suggestedAmounts = g.suggestedAmounts
        return gift
      })
      .filter((g) => typeof g.name === 'string' && (g.name as string).length > 0)

  return {
    name: input.name.trim(),
    eventType: { name: input.type },
    ...(input.gender ? { gender: input.gender } : {}),
    message: (input.message ?? '').trim(),
    ...(input.backgroundImageUrl ? { backgroundImageUrl: input.backgroundImageUrl } : {}),
    // Send the date as ISO under `expirationDate` (the field also represents
    // when the list expires for guests). Omitted if blank.
    ...(input.date ? { expirationDate: new Date(input.date).toISOString() } : {}),
    iWant: giftsByCategory('want'),
    iAmOkWithIt: giftsByCategory('nice'),
    iDontWant: giftsByCategory('avoid'),
  }
}

async function sendEventMutation(
  path: string,
  method: 'POST' | 'PUT',
  payload: ReturnType<typeof buildEventPayload>,
  token: string,
): Promise<EventDetail | null> {
  const response = await apiFetch(path, {
    method,
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  })
  const data = await readJson(response)
  if (!response.ok) throwApiError(response, data)
  const dto = unwrapDto(data)
  return dto ? mapApiEventDetail(dto) : null
}

export async function createEvent(input: CreateEventInput, token: string): Promise<EventDetail | null> {
  if (USE_MOCKS) {
    const now = new Date().toISOString()
    return {
      ...mockDetail('mock')!,
      id: `evt_${Math.random().toString(36).slice(2, 8)}`,
      slug: input.name.toLowerCase().replace(/\s+/g, '-') || 'novi-event',
      type: input.type,
      name: input.name,
      date: input.date ?? now,
      createdAt: now,
    }
  }
  return sendEventMutation('/events', 'POST', buildEventPayload(input), token)
}

export async function updateEvent(
  id: string,
  input: CreateEventInput,
  token: string,
): Promise<EventDetail | null> {
  if (USE_MOCKS) return mockDetail(id)
  return sendEventMutation(`/events/${encodeURIComponent(id)}`, 'PUT', buildEventPayload(input), token)
}

export async function deleteEvent(id: string, token: string): Promise<void> {
  if (USE_MOCKS) return
  const response = await apiFetch(`/events/${encodeURIComponent(id)}`, {
    method: 'DELETE',
    headers: { Accept: 'application/json', Authorization: `Bearer ${token}` },
  })
  if (!response.ok) throwApiError(response, await readJson(response))
}

export interface ReserveGiftResult {
  event: EventDetail | null
  alreadyReserved: boolean
}

/**
 * Reserve one unit of a gift as a guest. `requestToken` must stay identical
 * across retries of the same submission; the backend uses it to make the
 * call idempotent.
 */
export async function reserveGift(
  eventSlug: string,
  giftId: string,
  guestName: string,
  requestToken: string,
  message?: string,
): Promise<ReserveGiftResult> {
  if (USE_MOCKS) {
    return { event: mockDetail(eventSlug), alreadyReserved: false }
  }
  const response = await apiFetch(
    `/events/public/${encodeURIComponent(eventSlug)}/reservations`,
    {
      method: 'POST',
      headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
      body: JSON.stringify({ giftId, guestName, requestToken, ...(message ? { message } : {}) }),
    },
  )
  const data = await readJson(response)
  if (!response.ok) throwApiError(response, data)
  const parsed = data as { alreadyReserved?: boolean }
  const dto = unwrapDto(data)
  return { event: dto ? mapApiEventDetail(dto) : null, alreadyReserved: parsed?.alreadyReserved === true }
}
