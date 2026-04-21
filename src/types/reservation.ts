export interface Reservation {
  id: string
  giftId: string
  quantity: number
  amount?: number
  message?: string
  createdAt: string
}