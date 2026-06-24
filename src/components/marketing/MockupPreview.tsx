'use client'

import Link from 'next/link'
import { useTranslate } from '@tolgee/react'
import { FadeUp } from '@/components/shared/FadeUp'

export function MockupPreview() {
  const { t } = useTranslate()

  return (
    <section className="bg-white py-16 lg:py-24">
      <div className="mx-auto w-full max-w-container px-4 sm:px-6 lg:px-8">
        <FadeUp>
          <h2 className="text-center font-extrabold tracking-tight text-dark text-[clamp(26px,5vw,44px)] mb-10">
            {t('landing.mockup.title')}
          </h2>
        </FadeUp>

        <div className="flex flex-col items-center gap-8 lg:flex-row lg:items-center lg:justify-around">
          <Link
            href="/event/svadba-marka-i-ane"
            className="relative block rounded-[42px] bg-dark p-3 shadow-[0_40px_80px_rgba(45,52,54,0.25)] transition-transform hover:-translate-y-2"
            style={{ width: 280, aspectRatio: '9/19' }}
          >
            <div className="flex h-full w-full flex-col gap-3 overflow-hidden rounded-[32px] bg-gradient-to-b from-bg to-coral/15 p-4">
              <div className="flex items-center gap-2 text-sm font-extrabold">
                <span aria-hidden="true">💒</span>
                <span>Svadba Marka i Ane</span>
              </div>
              <div className="rounded-xl bg-white px-3 py-2.5 text-xs font-bold shadow-card">
                <div className="text-coral">❤️ Baš mi treba</div>
              </div>
              <div className="space-y-2">
                <div className="rounded-xl border-l-4 border-coral bg-white p-3 shadow-card">
                  <div className="text-xs font-bold">Sudo mašina</div>
                  <div className="mt-1 h-1.5 w-3/4 rounded-full bg-gray-light" />
                </div>
                <div className="rounded-xl border-l-4 border-coral bg-white p-3 shadow-card">
                  <div className="text-xs font-bold">Koverta</div>
                  <div className="mt-1 text-[10px] text-dark-light">20€ · 50€ · 100€</div>
                </div>
              </div>
              <div className="mt-auto rounded-full bg-coral py-2.5 text-center text-xs font-extrabold text-white shadow-cta">
                Izaberi poklon
              </div>
            </div>
          </Link>

          <FadeUp delay={0.2} className="max-w-md text-center lg:text-left">
            <p className="text-xl lg:text-2xl leading-snug text-dark">
              {t('landing.mockup.tagline')}
            </p>
          </FadeUp>
        </div>
      </div>
    </section>
  )
}
