'use client'

import { useTranslate } from '@tolgee/react'
import { FadeUp } from '@/components/shared/FadeUp'

const ITEMS = [
  { icon: '⚡', titleKey: 'landing.why.item1.title', descKey: 'landing.why.item1.desc' },
  { icon: '🔒', titleKey: 'landing.why.item2.title', descKey: 'landing.why.item2.desc' },
  { icon: '🔄', titleKey: 'landing.why.item3.title', descKey: 'landing.why.item3.desc' },
  { icon: '🎨', titleKey: 'landing.why.item4.title', descKey: 'landing.why.item4.desc' },
]

export function WhyPokloniMi() {
  const { t } = useTranslate()

  return (
    <section className="bg-white py-16 lg:py-24">
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
              className="rounded-2xl bg-bg p-5 lg:p-6 border border-gray-light hover:shadow-card transition-shadow"
            >
              <div className="text-3xl mb-3" aria-hidden="true">
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
