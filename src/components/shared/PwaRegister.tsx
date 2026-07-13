'use client'

import { useEffect } from 'react'

/**
 * Registers the service worker and checks for updates on load. The worker
 * itself calls skipWaiting/clients.claim, so a new deployment replaces the
 * old one on the next navigation without trapping users on a stale shell.
 */
export function PwaRegister() {
  useEffect(() => {
    if (typeof window === 'undefined' || !('serviceWorker' in navigator)) return
    if (process.env.NODE_ENV !== 'production') return

    navigator.serviceWorker
      .register('/sw.js')
      .then((registration) => {
        registration.update().catch(() => {})
      })
      .catch(() => {
        // Registration failing (private mode, unsupported) is non-fatal.
      })
  }, [])

  return null
}
