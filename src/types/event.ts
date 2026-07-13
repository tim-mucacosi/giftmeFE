export type EventType =
  | 'wedding'
  | 'birthday'
  | 'baptism'
  | 'baby_shower'
  | 'anniversary'
  | 'house_warming'
  | 'graduation'
  | 'patrons_day'
  | 'christmas'
  | 'other';
export type EventGender = 'boy' | 'girl';

export interface EventStats {
  /** Number of reservable (item) gifts. */
  gifts: number
  /** Total desired units across item gifts. */
  desired: number
  /** Total reserved units across item gifts. */
  reserved: number
  /** Number of guest reservations (host-only data; undefined on public views). */
  reservationCount?: number
}

export interface Event {
  id: string
  slug: string
  type: EventType
  gender?: EventGender
  name: string
  date: string
  message: string
  backgroundImageUrl?: string
  hostId: string
  createdAt: string
  updatedAt: string
  stats?: EventStats
}
