import type { DetailGift } from '@/lib/api/events'

/**
 * Whether a guest can still reserve this gift.
 * Envelope (money) gifts are always available; item gifts need remaining
 * units. Gifts without a backend id cannot be reserved through the API.
 */
export function isGiftAvailable(gift: Pick<DetailGift, 'id' | 'type' | 'available'>): boolean {
  if (!gift.id) return false
  if (gift.type === 'envelope') return true
  return gift.available > 0
}

/** Remaining units as a display value; null for unlimited (envelope). */
export function remainingLabel(gift: Pick<DetailGift, 'type' | 'quantity' | 'reservedQuantity'>): number | null {
  if (gift.type === 'envelope') return null
  return Math.max(0, gift.quantity - gift.reservedQuantity)
}
