import type { DetailGift } from '@/lib/api/events'

/**
 * Whether a guest can still reserve this gift.
 * Unlimited gifts are always available; the rest need remaining units.
 * Gifts without a backend id cannot be reserved through the API.
 */
export function isGiftAvailable(gift: Pick<DetailGift, 'id' | 'unlimited' | 'available'>): boolean {
  if (!gift.id) return false
  if (gift.unlimited) return true
  return gift.available > 0
}

/**
 * Total units guests can still reserve across a list of gifts.
 * Limited gifts contribute their remaining units; unlimited gifts each count
 * as one so the section never reads "all reserved".
 */
export function availableUnits(gifts: Pick<DetailGift, 'id' | 'unlimited' | 'available'>[]): number {
  return gifts.reduce(
    (sum, gift) => sum + (isGiftAvailable(gift) ? (gift.unlimited ? 1 : gift.available) : 0),
    0,
  )
}

/** Remaining units as a display value; null for unlimited gifts. */
export function remainingLabel(gift: Pick<DetailGift, 'unlimited' | 'quantity' | 'reservedQuantity'>): number | null {
  if (gift.unlimited) return null
  return Math.max(0, gift.quantity - gift.reservedQuantity)
}
