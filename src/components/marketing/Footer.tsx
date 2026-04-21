'use client'

import Link from 'next/link'
import { useTranslate } from '@tolgee/react'

export function Footer() {
  const { t } = useTranslate()
  return (
    <footer className="border-t border-gray-light bg-white py-10">
      <div className="mx-auto flex w-full max-w-container flex-col items-center gap-4 px-4 text-sm text-dark-light sm:px-6 lg:flex-row lg:justify-between lg:px-8">
        <p>{t('landing.footer.copyright')}</p>
        <nav className="flex flex-wrap items-center justify-center gap-4">
          <Link href="#" className="hover:text-coral">
            {t('landing.footer.about')}
          </Link>
          <span aria-hidden="true">·</span>
          <Link href="#" className="hover:text-coral">
            {t('landing.footer.terms')}
          </Link>
          <span aria-hidden="true">·</span>
          <Link href="#" className="hover:text-coral">
            {t('landing.footer.privacy')}
          </Link>
          <span aria-hidden="true">·</span>
          <Link href="#" className="hover:text-coral">
            {t('landing.footer.contact')}
          </Link>
        </nav>
      </div>
    </footer>
  )
}
