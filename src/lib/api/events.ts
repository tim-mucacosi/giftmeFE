import { apiClient, USE_MOCKS } from './client'
import { mockEvents } from '@/lib/mocks/events'
import type { Event, EventType, EventGender } from '@/types/event'
import type { Gift, GiftCategory } from '@/types/gift'

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'https://giftmebe.onrender.com/api'

export interface CreateEventInput {
  name: string
  type: EventType
  gender?: EventGender
  userId: string
  message?: string
  backgroundImageUrl?: string
  /** ISO date string for when the celebration happens. */
  date?: string
  gifts: Pick<Gift, 'name' | 'category' | 'description' | 'quantity' | 'price' | 'priceRange' | 'store'>[]
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

export async function getEvents(): Promise<Event[]> {
  if (USE_MOCKS) return mockEvents
  try {
    return await apiClient.get<Event[]>('/events')
  } catch {
    return mockEvents
  }
}

export async function getEvent(slug: string): Promise<Event | null> {
  if (USE_MOCKS) return mockEvents.find((e) => e.slug === slug) ?? mockEvents[0] ?? null
  try {
    return await apiClient.get<Event>(`/events/${slug}`)
  } catch {
    return mockEvents.find((e) => e.slug === slug) ?? null
  }
}

interface ApiGift {
  name?: string
  description?: string
  whereToBuy?: string
  priceInRange?: string
  quantity?: number
}

interface ApiEventDto {
  _id?: string
  id?: string
  name?: string
  eventType?: { name?: string } | string
  gender?: string
  user?: string | { _id?: string; id?: string; name?: string; email?: string }
  slug?: string
  message?: string
  backgroundImageUrl?: string
  /**
   * Backend field representing when the celebration happens; the list expires
   * for guests on/after this date. Frontend exposes it as `date` for clarity.
   */
  expirationDate?: string
  createdAt?: string
  updatedAt?: string
  iWant?: Array<ApiGift | string>
  iAmOkWithIt?: Array<ApiGift | string>
  iDontWant?: Array<ApiGift | string>
}

export interface DetailGift {
  name: string
  description?: string
  whereToBuy?: string
  priceInRange?: string
  quantity: number
}

export interface EventDetail {
  id: string
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

function mapGiftArr(arr: ApiEventDto['iWant']): DetailGift[] {
  if (!Array.isArray(arr)) return []
  return arr
    .map((g) => {
      const name = typeof g === 'string' ? g : (g?.name ?? '')
      return {
        name: name.trim(),
        description: typeof g === 'string' ? undefined : g?.description,
        whereToBuy: typeof g === 'string' ? undefined : g?.whereToBuy,
        priceInRange: typeof g === 'string' ? undefined : g?.priceInRange,
        quantity: typeof g === 'string' ? 1 : (g?.quantity ?? 1),
      }
    })
    .filter((g) => g.name.length > 0)
}

function mapApiEvent(dto: ApiEventDto): Event {
  const id = dto._id ?? dto.id ?? ''
  const eventTypeName =
    typeof dto.eventType === 'string' ? dto.eventType : dto.eventType?.name
  const created = dto.createdAt ?? new Date().toISOString()
  // Prefer the host-chosen celebration date (stored as `expirationDate` on
  // the backend; expires the list for guests after that day). Fall back to
  // createdAt for legacy events that predate the field.
  const eventDate = dto.expirationDate ?? created
  return {
    id,
    slug: dto.slug ?? id,
    type: (eventTypeName ?? 'other') as EventType,
    name: dto.name ?? '',
    date: eventDate,
    message: '',
    hostId: extractHostId(dto.user),
    createdAt: created,
    updatedAt: dto.updatedAt ?? created,
  }
}

function mapApiEventDetail(dto: ApiEventDto): EventDetail {
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
  }
}

export async function getEventById(id: string, token?: string): Promise<EventDetail | null> {
  if (USE_MOCKS) {
    const ev = mockEvents.find((e) => e.id === id || e.slug === id) ?? mockEvents[0]
    if (!ev) return null
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
          { name: 'Bottle of red wine', quantity: 2, description: 'A nice red wine' },
          { name: 'Hand-thrown ceramic bowl', quantity: 1 },
        ],
        nice: [
          { name: 'Linen tablecloth set', quantity: 1, description: 'Natural linen' },
        ],
        avoid: [
          { name: 'Generic gift cards', quantity: 999 },
        ],
      },
    }
  }

  let response: Response
  try {
    // Use /guests endpoint for public access (no auth required)
    // Use regular endpoint for authenticated access (host)
    const endpoint = token ? `/events/${encodeURIComponent(id)}` : `/events/${encodeURIComponent(id)}/guests`
    response = await fetch(`${API_URL}${endpoint}`, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    })
  } catch {
    throw new EventApiError('Network error', 0, 'NETWORK')
  }

  if (response.status === 404) return null

  let data: unknown = null
  try {
    const text = await response.text()
    data = text ? JSON.parse(text) : null
  } catch {
    data = null
  }

  if (!response.ok) {
    const parsed = (data ?? {}) as { message?: string; code?: string }
    throw new EventApiError(
      parsed.message ?? `API error: ${response.status}`,
      response.status,
      parsed.code,
    )
  }

  // Accept either a bare object or a wrapper like { data: {...} } / { event: {...} }.
  const dto: ApiEventDto | null =
    data && typeof data === 'object'
      ? ('data' in data
          ? ((data as { data: ApiEventDto }).data ?? null)
          : 'event' in data
            ? ((data as { event: ApiEventDto }).event ?? null)
            : (data as ApiEventDto))
      : null

  if (!dto) return null
  return mapApiEventDetail(dto)
}

export async function getEventsByUser(userId: string, token: string): Promise<Event[]> {
  if (USE_MOCKS) return mockEvents

  let response: Response
  try {
    response = await fetch(`${API_URL}/events/user/${encodeURIComponent(userId)}`, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    })
  } catch {
    throw new EventApiError('Network error', 0, 'NETWORK')
  }

  if (response.status === 404) return []

  let data: unknown = null
  try {
    const text = await response.text()
    data = text ? JSON.parse(text) : null
  } catch {
    data = null
  }

  // Treat "no events found" response as empty list, not an error
  if (!response.ok) {
    const parsed = (data ?? {}) as { success?: boolean; message?: string; code?: string }
    if (parsed.success === false && /no events found/i.test(parsed.message ?? '')) {
      return []
    }
    throw new EventApiError(
      parsed.message ?? `API error: ${response.status}`,
      response.status,
      parsed.code,
    )
  }

  const list: ApiEventDto[] = Array.isArray(data)
    ? (data as ApiEventDto[])
    : Array.isArray((data as { data?: unknown })?.data)
      ? ((data as { data: ApiEventDto[] }).data)
      : Array.isArray((data as { events?: unknown })?.events)
        ? ((data as { events: ApiEventDto[] }).events)
        : []

  return list.map(mapApiEvent)
}

function buildEventPayload(input: CreateEventInput) {
  const giftsByCategory = (cat: GiftCategory) =>
    input.gifts
      .filter((g) => g.category === cat)
      .map((g) => {
        const gift: any = { name: g.name.trim(), quantity: g.quantity ?? 1 }
        if (g.description?.trim()) gift.description = g.description.trim()
        if (g.priceRange) gift.priceInRange = `${g.priceRange[0]}-${g.priceRange[1]}`
        if (g.store?.trim()) gift.whereToBuy = g.store.trim()
        return gift
      })
      .filter((g) => g.name.length > 0)

  return {
    name: input.name.trim(),
    eventType: { name: input.type },
    ...(input.gender ? { gender: input.gender } : {}),
    user: input.userId,
    message: (input.message ?? '').trim(),
    ...(input.backgroundImageUrl ? { backgroundImageUrl: input.backgroundImageUrl } : {}),
    // Send the date as ISO under `expirationDate` (the field also represents
    // when the list expires for guests. Omitted if blank.
    ...(input.date ? { expirationDate: new Date(input.date).toISOString() } : {}),
    iWant: giftsByCategory('want'),
    iAmOkWithIt: giftsByCategory('nice'),
    iDontWant: giftsByCategory('avoid'),
  }
}

async function sendEventMutation(
  url: string,
  method: 'POST' | 'PUT',
  payload: ReturnType<typeof buildEventPayload>,
  token: string,
): Promise<unknown> {
  let response: Response
  try {
    response = await fetch(url, {
      method,
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify(payload),
    })
  } catch {
    throw new EventApiError('Network error', 0, 'NETWORK')
  }

  let data: unknown = null
  try {
    const text = await response.text()
    data = text ? JSON.parse(text) : null
  } catch {
    data = null
  }

  if (!response.ok) {
    const parsed = (data ?? {}) as { message?: string; code?: string }
    throw new EventApiError(
      parsed.message ?? `API error: ${response.status}`,
      response.status,
      parsed.code,
    )
  }

  return data
}

export async function createEvent(input: CreateEventInput, token: string): Promise<unknown> {
  if (USE_MOCKS) {
    const now = new Date().toISOString()
    return {
      id: `evt_${Math.random().toString(36).slice(2, 8)}`,
      slug: input.name.toLowerCase().replace(/\s+/g, '-') || 'novi-event',
      type: input.type,
      name: input.name,
      date: now,
      message: '',
      hostId: input.userId,
      createdAt: now,
      updatedAt: now,
    }
  }
  return sendEventMutation(`${API_URL}/events`, 'POST', buildEventPayload(input), token)
}

export async function updateEvent(
  id: string,
  input: CreateEventInput,
  token: string,
): Promise<unknown> {
  if (USE_MOCKS) {
    return { id, ...buildEventPayload(input), updatedAt: new Date().toISOString() }
  }
  return sendEventMutation(
    `${API_URL}/events/${encodeURIComponent(id)}`,
    'PUT',
    buildEventPayload(input),
    token,
  )
}

export async function deleteEvent(id: string): Promise<void> {
  if (USE_MOCKS) return
  await apiClient.delete(`/events/${id}`)
}

export async function reserveGift(
  eventId: string,
  category: 'want' | 'nice' | 'avoid',
  giftIndex: number,
): Promise<EventDetail> {
  if (USE_MOCKS) {
    throw new Error('Mock not implemented')
  }
  const response = await fetch(
    `${API_URL}/events/${encodeURIComponent(eventId)}/reserve`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ category, index: giftIndex }),
    }
  )

  if (!response.ok) {
    const error = await response.text()
    throw new EventApiError(error || 'Failed to reserve gift', response.status)
  }

  const data = await response.json()
  const dto = data?.data ?? data
  return mapApiEventDetail(dto)
}
