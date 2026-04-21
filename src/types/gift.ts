export type GiftType = 'item' | 'envelope';
export type GiftCategory = 'want' | 'nice' | 'avoid';

export interface Gift {
  id: string
  eventId: string
  type: GiftType
  category: GiftCategory
  name: string
  description?: string
  price?: number
  priceRange?: [number, number]
  color?: string
  quantity: number
  reservedQuantity: number
  store?: string
  productUrl?: string
  suggestedAmounts?: number[]
  order: number
}