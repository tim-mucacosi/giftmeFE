export type GiftCategory = 'want' | 'nice' | 'avoid';

export interface Gift {
  id: string
  eventId: string
  category: GiftCategory
  name: string
  description?: string
  quantity: number
  /** When true the gift can be reserved any number of times. */
  unlimited?: boolean
  reservedQuantity: number
  /** Optional product URL where the gift can be found. */
  link?: string
  order: number
}
