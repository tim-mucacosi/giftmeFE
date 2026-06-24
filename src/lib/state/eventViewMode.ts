'use client'

import { useEffect, useSyncExternalStore } from 'react'

/**
 * Tiny global subject that lets event pages tell the Navbar what the visitor
 * is currently looking at. Used today to lock the language switcher when the
 * visitor isn't the host (guest or read-only viewer of someone else's event),
 * since gift names are user-generated and don't translate.
 *
 *  - 'guest'  : public guest view (/event/<id>)
 *  - 'viewer' : logged-in non-host on /event/<id>/edit (read-only banner)
 *  - 'editor' : logged-in host actively editing (/event/<id>/edit)
 *  - null     : not on an event page
 */
export type EventViewMode = 'guest' | 'viewer' | 'editor' | null

let current: EventViewMode = null
const listeners = new Set<() => void>()

function setMode(next: EventViewMode) {
  if (current === next) return
  current = next
  listeners.forEach((l) => l())
}

function subscribe(listener: () => void) {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}

export function useEventViewMode(): EventViewMode {
  return useSyncExternalStore(
    subscribe,
    () => current,
    () => null,
  )
}

/**
 * Page-side helper: publish `mode` while the component is mounted, and clear
 * it on unmount. Pass `null` to opt out (e.g. before event data has loaded).
 */
export function usePublishEventViewMode(mode: EventViewMode) {
  useEffect(() => {
    setMode(mode)
    return () => {
      // Only clear if we still own the value; otherwise a sibling page might
      // have already taken over (shouldn't happen in practice, but cheap).
      if (current === mode) setMode(null)
    }
  }, [mode])
}
