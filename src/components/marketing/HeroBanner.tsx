'use client'

import { useTranslate } from '@tolgee/react'
import { Button } from '@/components/shared/Button'
import styles from './HeroBanner.module.css'

export function HeroBanner() {
  const { t } = useTranslate()

  return (
    <section className={styles.hero}>
      <div className={styles.glow1} aria-hidden="true" />
      <div className={styles.glow2} aria-hidden="true" />
      <div className="mx-auto w-full max-w-container px-4 sm:px-6 lg:flex lg:items-center lg:gap-16 lg:px-8">
        <div className={styles.content}>
          <div className={styles.logoRow}>
            <span className={styles.logoEmoji} aria-hidden="true">
              🎁
            </span>
            <span className={styles.logoText}>{t('common.appName')}</span>
          </div>
          <h1 className={styles.headline}>{t('landing.hero.headline')}</h1>
          <p className={styles.subheadline}>{t('landing.hero.subheadline')}</p>
          <div className={styles.ctaWrap}>
            <Button href="/create" size="lg" fullWidth className="sm:w-auto">
              {t('landing.hero.cta')}
            </Button>
          </div>
          <p className={styles.note}>{t('landing.hero.note')}</p>
        </div>
        <div className={styles.visual} aria-hidden="true">
          <div className={styles.phone}>
            <div className={styles.phoneScreen}>
              <div className={styles.phoneHeader}>
                <span>🎁</span>
                <span className={styles.phoneTitle}>PokloniMi</span>
              </div>
              <div className={styles.phoneCardWant}>
                <div className={styles.phoneDot} />
                <div className={styles.phoneBars}>
                  <div className={styles.phoneBar} style={{ width: '70%' }} />
                  <div className={styles.phoneBar} style={{ width: '45%' }} />
                </div>
              </div>
              <div className={styles.phoneCardNice}>
                <div className={styles.phoneDotGold} />
                <div className={styles.phoneBars}>
                  <div className={styles.phoneBar} style={{ width: '60%' }} />
                  <div className={styles.phoneBar} style={{ width: '40%' }} />
                </div>
              </div>
              <div className={styles.phoneCTA}>✓ Rezervisano</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
