'use client'

import { useState } from 'react'
import { useTranslate } from '@tolgee/react'
import { CONSENT_COOKIE, type ConsentValue } from '@/lib/consent/constants'

interface Props {
  /** Server-computed: true only for EEA visitors who haven't answered yet. */
  initialShow: boolean
}

export function ConsentBanner({ initialShow }: Props) {
  const { t } = useTranslate()
  const [visible, setVisible] = useState(initialShow)

  const answer = (value: ConsentValue) => {
    window.gtag?.('consent', 'update', { analytics_storage: value })
    document.cookie = `${CONSENT_COOKIE}=${value}; path=/; max-age=${60 * 60 * 24 * 365}; samesite=lax`
    setVisible(false)
  }

  if (!visible) return null

  return (
    <div
      role="region"
      aria-label={t('common.cookieConsent.message')}
      className="fixed inset-x-0 bottom-0 z-50 border-t-2 border-gray-light bg-white p-4 shadow-card sm:p-5"
    >
      <div className="mx-auto flex w-full max-w-container flex-col items-center gap-3 sm:flex-row sm:justify-between">
        <p className="text-sm text-dark-light">{t('common.cookieConsent.message')}</p>
        <div className="flex shrink-0 gap-2">
          <button
            type="button"
            onClick={() => answer('denied')}
            className="rounded-full border-2 border-gray-light bg-white px-4 py-2 text-sm font-semibold text-dark transition-colors hover:border-coral hover:text-coral"
          >
            {t('common.cookieConsent.decline')}
          </button>
          <button
            type="button"
            onClick={() => answer('granted')}
            className="rounded-full bg-coral px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-coral-dark"
          >
            {t('common.cookieConsent.accept')}
          </button>
        </div>
      </div>
    </div>
  )
}
