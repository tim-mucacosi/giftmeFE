'use client'

import { useTranslate } from '@tolgee/react'
import { Button } from '@/components/shared/Button'
import { FadeUp } from '@/components/shared/FadeUp'

export function CtaSection() {
  const { t } = useTranslate()
  return (
    <section className="relative overflow-hidden py-20 lg:py-28">
      <div
        className="absolute inset-0 bg-gradient-to-br from-coral/15 via-gold/10 to-transparent"
        aria-hidden="true"
      />
      <div className="relative mx-auto w-full max-w-container px-4 sm:px-6 lg:px-8">
        <FadeUp className="mx-auto max-w-2xl text-center">
          <h2 className="font-extrabold tracking-tight text-dark text-[clamp(28px,5vw,48px)] mb-5">
            {t('landing.finalCta.title')}
          </h2>
          <Button href="/create" size="lg">
            {t('landing.finalCta.button')}
          </Button>
        </FadeUp>
      </div>
    </section>
  )
}
