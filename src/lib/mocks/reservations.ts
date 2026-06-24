import type { Reservation } from '@/types/reservation'

export const mockReservations: Reservation[] = [
  {
    id: 'rsv_1',
    giftId: 'gft_3',
    quantity: 1,
    message: 'Srećno!',
    createdAt: '2026-04-01T10:00:00.000Z',
  },
  {
    id: 'rsv_2',
    giftId: 'gft_4',
    quantity: 2,
    createdAt: '2026-04-05T10:00:00.000Z',
  },
]
