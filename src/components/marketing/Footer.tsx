'use client'

import Link from 'next/link'
import { useTranslate } from '@tolgee/react'

export function Footer() {
  const { t } = useTranslate()
  return (
    <footer className="border-t border-gray-light bg-white pt-10 pb-[calc(6rem+env(safe-area-inset-bottom))] lg:pb-10">
      <div className="mx-auto flex w-full max-w-container flex-col items-center gap-3 px-4 text-sm text-dark-light sm:px-6 lg:flex-row lg:justify-between lg:gap-4 lg:px-8">
        <p>{t('landing.footer.copyright')}</p>
        <nav
          aria-label={t('landing.footer.navLabel')}
          className="flex flex-wrap items-center justify-center gap-x-3 gap-y-2"
        >
          <Link
            href="/about"
            className="rounded px-1 py-0.5 hover:text-coral focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-coral"
          >
            {t('landing.footer.about')}
          </Link>
          <span aria-hidden="true">·</span>
          <Link
            href="/terms"
            className="rounded px-1 py-0.5 hover:text-coral focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-coral"
          >
            {t('landing.footer.terms')}
          </Link>
          <span aria-hidden="true">·</span>
          <Link
            href="/privacy"
            className="rounded px-1 py-0.5 hover:text-coral focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-coral"
          >
            {t('landing.footer.privacy')}
          </Link>
        </nav>
      </div>
    </footer>
  )
}
