import type { Event } from '@/types/event'

export const mockEvents: Event[] = [
  {
    id: 'evt_1',
    slug: 'svadba-marka-i-ane',
    type: 'wedding',
    name: 'Svadba Marka i Ane',
    date: '2026-08-22T18:00:00.000Z',
    message:
      'Dragi gosti, hvala vam što ćete biti uz nas na najlepšem danu. Ispod je naša lista poklona — sve je predlog, najbitnije je da ste tu!',
    backgroundImageUrl:
      'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1600&q=60',
    hostId: 'usr_1',
    createdAt: '2026-03-01T10:00:00.000Z',
    updatedAt: '2026-03-10T10:00:00.000Z',
  },
  {
    id: 'evt_2',
    slug: 'lukin-prvi-rodjendan',
    type: 'birthday',
    name: 'Lukin prvi rođendan',
    date: '2026-05-10T12:00:00.000Z',
    message: 'Luka puni godinu dana! Hvala vam što delite ovaj dan sa nama.',
    hostId: 'usr_1',
    createdAt: '2026-02-15T10:00:00.000Z',
    updatedAt: '2026-02-20T10:00:00.000Z',
  },
]
