'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useTranslate } from '@tolgee/react'

const DISMISSED_KEY = 'poklonimi.betaNoticeDismissed'

/**
 * Slim, dismissible strip telling visitors the app is still in beta.
 * Dismissal is remembered per browser so returning visitors are not nagged.
 */
export function BetaNotice() {
  const { t } = useTranslate()
  // Hidden until mounted so SSR output matches the first client render.
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    try {
      setVisible(localStorage.getItem(DISMISSED_KEY) !== '1')
    } catch {
      setVisible(true)
    }
  }, [])

  const dismiss = () => {
    setVisible(false)
    try {
      localStorage.setItem(DISMISSED_KEY, '1')
    } catch {
      // storage unavailable; the notice simply reappears next visit
    }
  }

  if (!visible) return null

  return (
    <div
      className="border-b-2 border-gold/60 bg-gradient-to-r from-gold/35 via-gold/20 to-coral/20"
      role="status"
    >
      <div className="mx-auto flex w-full max-w-container flex-wrap items-center justify-between gap-3 px-4 py-3 sm:flex-nowrap sm:justify-start sm:px-6 lg:px-8">
        <span className="shrink-0 rounded-pill bg-coral px-3 py-1 text-xs font-extrabold uppercase tracking-wide text-white shadow-cta">
          ✨ {t('landing.beta.badge')}
        </span>
        <p className="order-last w-full min-w-0 text-center text-sm font-medium leading-snug text-dark sm:order-none sm:w-auto sm:flex-1 sm:text-base">
          {t('landing.beta.text')}{' '}
          <Link
            href="/contact"
            className="whitespace-nowrap font-semibold text-coral underline underline-offset-2 hover:text-coral-dark"
          >
            {t('landing.beta.cta')}
          </Link>
        </p>
        <button
          type="button"
          onClick={dismiss}
          aria-label={t('landing.beta.dismiss')}
          className="shrink-0 rounded-full p-2 text-dark/70 transition-colors hover:bg-gold/40 hover:text-dark"
        >
          ✕
        </button>
      </div>
    </div>
  )
}
