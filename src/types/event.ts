export type EventType = 'wedding' | 'birthday' | 'baptism' | 'patrons_day' | 'other';
export type EventGender = 'boy' | 'girl';

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
}
