import type { EventDetail } from '@/lib/api/events'
import type { Language } from '@/tolgee/shared'

const STRINGS: Record<Language, { brand: string; hostedBy: string; tagline: string }> = {
  sr: {
    brand: 'PokloniMi',
    hostedBy: 'Organizuje',
    tagline: 'Pogledaj listu poklona i izaberi nešto lepo 🎁',
  },
  en: {
    brand: 'GiftMe',
    hostedBy: 'Hosted by',
    tagline: 'Check out the gift list and pick something special 🎁',
  },
  de: {
    brand: 'SchenkMir',
    hostedBy: 'Veranstaltet von',
    tagline: 'Sieh dir die Geschenkeliste an und wähle etwas Besonderes 🎁',
  },
}

/** Localized brand name for server-side contexts (metadata, OG images). */
export function getBrandName(lang: Language): string {
  return (STRINGS[lang] ?? STRINGS.sr).brand
}

const MAX_DESCRIPTION_LENGTH = 200

function truncate(text: string, max: number): string {
  const trimmed = text.trim()
  if (trimmed.length <= max) return trimmed
  return `${trimmed.slice(0, max - 1).trimEnd()}…`
}

/** Personalized title/description for link-preview cards (WhatsApp, Viber, iMessage, …). */
export function buildEventShareMeta(event: EventDetail, lang: Language) {
  const strings = STRINGS[lang] ?? STRINGS.sr
  const title = `${event.name} · ${strings.brand}`

  const personalNote = event.message?.trim()
  const description = personalNote
    ? truncate(personalNote, MAX_DESCRIPTION_LENGTH)
    : truncate(
        event.hostName ? `${strings.hostedBy} ${event.hostName}. ${strings.tagline}` : strings.tagline,
        MAX_DESCRIPTION_LENGTH,
      )

  return { title, description }
}
