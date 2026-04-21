'use client'

import { useTranslate } from '@tolgee/react'
import { FadeUp } from '@/components/shared/FadeUp'
import styles from './HowItWorks.module.css'

const STEPS = [
  { icon: '📋', titleKey: 'landing.howItWorks.step1.title', descKey: 'landing.howItWorks.step1.desc' },
  { icon: '📨', titleKey: 'landing.howItWorks.step2.title', descKey: 'landing.howItWorks.step2.desc' },
  { icon: '🎉', titleKey: 'landing.howItWorks.step3.title', descKey: 'landing.howItWorks.step3.desc' },
]

export function HowItWorks() {
  const { t } = useTranslate()

  return (
    <section className="py-16 lg:py-24">
      <div className="mx-auto w-full max-w-container px-4 sm:px-6 lg:px-8">
        <FadeUp>
          <h2 className={styles.title}>{t('landing.howItWorks.title')}</h2>
        </FadeUp>

        <div className={styles.scroller}>
          {STEPS.map((step, i) => (
            <FadeUp key={step.titleKey} delay={0.08 * (i + 1)} className={styles.card}>
              <div className={styles.badge}>{i + 1}</div>
              <div className={styles.icon} aria-hidden="true">
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
