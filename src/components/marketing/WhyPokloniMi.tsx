'use client'

import { useTranslate } from '@tolgee/react'
import { FadeUp } from '@/components/shared/FadeUp'

const ITEMS = [
  {
    icon: '⚡',
    chip: 'bg-coral/20 text-coral-dark',
    stripe: 'from-coral to-coral-light',
    titleKey: 'landing.why.item1.title',
    descKey: 'landing.why.item1.desc',
  },
  {
    icon: '🔒',
    chip: 'bg-gold/30 text-dark',
    stripe: 'from-gold to-gold-light',
    titleKey: 'landing.why.item2.title',
    descKey: 'landing.why.item2.desc',
  },
  {
    icon: '🔄',
    chip: 'bg-success/30 text-dark',
    stripe: 'from-success to-gold-light',
    titleKey: 'landing.why.item3.title',
    descKey: 'landing.why.item3.desc',
  },
  {
    icon: '🎨',
    chip: 'bg-coral/20 text-coral-dark',
    stripe: 'from-coral-light to-gold',
    titleKey: 'landing.why.item4.title',
    descKey: 'landing.why.item4.desc',
  },
] as const

export function WhyPokloniMi() {
  const { t } = useTranslate()

  return (
    <section className="bg-bg py-16 lg:py-24">
      <div className="mx-auto w-full max-w-container px-4 sm:px-6 lg:px-8">
        <FadeUp>
          <h2 className="text-center font-extrabold tracking-tight text-dark text-[clamp(26px,5vw,44px)] mb-10">
            {t('landing.why.title')}
          </h2>
        </FadeUp>
        <div className="grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-4 lg:gap-6">
          {ITEMS.map((item, i) => (
            <FadeUp
              key={item.titleKey}
              delay={0.08 * (i + 1)}
              className="relative overflow-hidden rounded-2xl bg-white p-5 pt-7 lg:p-6 lg:pt-8 border border-gray-light shadow-card hover:shadow-card-hover hover:-translate-y-1 transition-all duration-200"
            >
              <div
                className={`absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r ${item.stripe}`}
                aria-hidden="true"
              />
              <div
                className={`mb-4 inline-flex h-14 w-14 items-center justify-center rounded-2xl text-3xl ${item.chip}`}
                aria-hidden="true"
              >
                {item.icon}
              </div>
              <h3 className="text-base lg:text-lg font-extrabold tracking-tight text-dark mb-1">
                {t(item.titleKey)}
              </h3>
              <p className="text-sm text-dark-light leading-relaxed">{t(item.descKey)}</p>
            </FadeUp>
          ))}
        </div>
      </div>
    </section>
  )
}
