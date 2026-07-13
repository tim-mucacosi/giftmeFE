import type { EventType } from '@/types/event'

const TYPE_EMOJIS: Record<EventType, string> = {
  wedding: '💒',
  birthday: '🎂',
  baptism: '⛪',
  baby_shower: '🍼',
  anniversary: '💞',
  house_warming: '🏡',
  graduation: '🎓',
  patrons_day: '🕯️',
  christmas: '🎄',
  other: '✨',
}

export function getEventEmoji(type: EventType, gender?: string): string {
  if (type === 'birthday') {
    return gender === 'girl' ? '🎂👧' : gender === 'boy' ? '🎂👦' : '🎂'
  }
  if (type === 'baptism') {
    return gender === 'girl' ? '⛪👧' : gender === 'boy' ? '⛪👦' : '⛪'
  }
  return TYPE_EMOJIS[type] ?? '✨'
}
