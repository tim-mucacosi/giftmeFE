'use client'

import { useTranslate } from '@tolgee/react'
import { FadeUp } from '@/components/shared/FadeUp'

const ITEMS = [
  { key: 't1', avatar: 'J', color: 'from-coral to-coral-light', stripe: 'from-coral to-coral-light' },
  { key: 't2', avatar: 'M', color: 'from-gold to-gold-light', stripe: 'from-gold to-gold-light' },
  { key: 't3', avatar: 'D', color: 'from-success to-gold-light', stripe: 'from-success to-gold-light' },
] as const

export function Testimonials() {
  const { t } = useTranslate()

  return (
    <section className="bg-bg py-16 lg:py-24">
      <div className="mx-auto w-full max-w-container px-4 sm:px-6 lg:px-8">
        <FadeUp>
          <h2 className="text-center font-extrabold tracking-tight text-dark text-[clamp(26px,5vw,44px)] mb-10">
            {t('landing.testimonials.title')}
          </h2>
        </FadeUp>
        <div className="grid gap-5 md:grid-cols-3">
          {ITEMS.map((item, i) => (
            <FadeUp
              key={item.key}
              delay={0.1 * (i + 1)}
              className="relative overflow-hidden rounded-2xl bg-white p-6 pt-7 border border-gray-light shadow-card hover:shadow-card-hover hover:-translate-y-1 transition-all duration-200"
            >
              <div
                className={`absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r ${item.stripe}`}
                aria-hidden="true"
              />
              <p className="text-base leading-relaxed text-dark">
                &ldquo;{t(`landing.testimonials.${item.key}`)}&rdquo;
              </p>
              <div className="mt-5 flex items-center gap-3">
                <div
                  className={`h-10 w-10 rounded-full bg-gradient-to-br ${item.color} flex items-center justify-center text-white font-extrabold shadow-sm`}
                  aria-hidden="true"
                >
                  {item.avatar}
                </div>
                <span className="font-semibold text-dark">
                  {t(`landing.testimonials.${item.key}Name`)}
                </span>
              </div>
            </FadeUp>
          ))}
        </div>
      </div>
    </section>
  )
}
