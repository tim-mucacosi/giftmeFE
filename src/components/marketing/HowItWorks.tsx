'use client'

import { useTranslate } from '@tolgee/react'
import { FadeUp } from '@/components/shared/FadeUp'
import styles from './HowItWorks.module.css'

const STEPS = [
  { icon: '📋', tint: 'coral', titleKey: 'landing.howItWorks.step1.title', descKey: 'landing.howItWorks.step1.desc' },
  { icon: '📨', tint: 'gold', titleKey: 'landing.howItWorks.step2.title', descKey: 'landing.howItWorks.step2.desc' },
  { icon: '🎉', tint: 'success', titleKey: 'landing.howItWorks.step3.title', descKey: 'landing.howItWorks.step3.desc' },
] as const

export function HowItWorks() {
  const { t } = useTranslate()

  return (
    <section className="bg-bg py-16 lg:py-24">
      <div className="mx-auto w-full max-w-container px-4 sm:px-6 lg:px-8">
        <FadeUp>
          <h2 className={styles.title}>{t('landing.howItWorks.title')}</h2>
        </FadeUp>

        <div className={styles.scroller}>
          {STEPS.map((step, i) => (
            <FadeUp key={step.titleKey} delay={0.08 * (i + 1)} className={styles.card}>
              <div className={styles.stripe} data-tint={step.tint} aria-hidden="true" />
              <div className={styles.badge} data-tint={step.tint}>
                {i + 1}
              </div>
              <div className={styles.iconChip} data-tint={step.tint} aria-hidden="true">
                {step.icon}
              </div>
              <h3 className={styles.cardTitle}>{t(step.titleKey)}</h3>
              <p className={styles.cardDesc}>{t(step.descKey)}</p>
            </FadeUp>
          ))}
        </div>
      </div>
    </section>
  )
}
