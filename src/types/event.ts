export type EventType = 'wedding' | 'birthday' | 'baptism' | 'patrons_day' | 'other';

export interface Event {
  id: string
  slug: string
  type: EventType
  name: string
  date: string
  message: string
  backgroundImageUrl?: string
  hostId: string
  createdAt: string
  updatedAt: string
}
