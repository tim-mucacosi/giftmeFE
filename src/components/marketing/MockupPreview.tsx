'use client'

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
          <div
            aria-hidden="true"
            className="relative block rounded-[42px] bg-dark p-3 shadow-[0_40px_80px_rgba(45,52,54,0.25)]"
            style={{ width: 280, aspectRatio: '9/19' }}
          >
            <div className="flex h-full w-full flex-col gap-2.5 overflow-hidden rounded-[32px] bg-bg p-3">
              {/* Cover hero: same gradient + scrim the real guest page shows
                  for a wedding without an uploaded photo. */}
              <div className="relative -mx-3 -mt-3 flex h-24 shrink-0 flex-col items-center justify-end overflow-hidden pb-2.5 text-center">
                <div
                  className="absolute inset-0"
                  style={{
                    background:
                      'radial-gradient(ellipse at 22% 12%, rgba(255, 217, 61, 0.45) 0%, transparent 45%), radial-gradient(ellipse at 82% 20%, rgba(255, 255, 255, 0.22) 0%, transparent 40%), radial-gradient(ellipse at 55% 95%, rgba(255, 120, 120, 0.4) 0%, transparent 55%), linear-gradient(160deg, #ffb199 0%, #ff7d70 35%, #ff6b6b 60%, #e05e73 85%, #cf5470 100%)',
                  }}
                />
                <div
                  className="absolute inset-0"
                  style={{
                    background:
                      'linear-gradient(to top, rgba(70, 15, 40, 0.5) 0%, rgba(70, 15, 40, 0.12) 45%, rgba(70, 15, 40, 0) 100%)',
                  }}
                />
                <div className="relative">
                  <div className="text-2xl leading-none">💒</div>
                  <div className="mt-1 text-sm font-extrabold text-white [text-shadow:0_1px_8px_rgba(0,0,0,0.35)]">
                    {t('landing.mockup.eventName')}
                  </div>
                </div>
              </div>

              {/* "Really want" section, styled like the real guest page */}
              <div className="rounded-2xl border-2 border-success/50 bg-gradient-to-br from-success/10 to-success/5 p-2">
                <div className="flex flex-wrap items-center gap-x-1.5 gap-y-0.5 px-1 pb-1.5">
                  <span className="text-[11px] font-extrabold">
                    ❤️ {t('host.create.step2.categories.want')}
                  </span>
                  <span className="rounded-full border border-success/40 bg-success/15 px-1.5 py-px text-[8px] font-semibold text-dark">
                    2 {t('host.guest.count.available')}
                  </span>
                  <span className="w-full text-[8px] italic text-dark-light">
                    {t('host.create.step2.categories.wantTagline')}
                  </span>
                </div>
                <div className="rounded-xl border-2 border-success/40 bg-gradient-to-br from-success/15 to-success/5 p-2 shadow-card">
                  <span className="inline-flex rounded-full bg-success/25 px-1.5 py-px text-[8px] font-bold text-dark">
                    {t('host.guest.giftCard.topWish')}
                  </span>
                  <div className="mt-1 text-xs font-bold">{t('landing.mockup.gift1')}</div>
                  <div className="mt-0.5 text-[8px] text-dark-light">
                    {t('host.guest.giftCard.remaining')}: 2/2
                  </div>
                  <div className="mt-1.5 w-fit rounded-full bg-success px-2.5 py-1 text-[9px] font-semibold text-dark">
                    {t('host.guest.giftCard.cta')}
                  </div>
                </div>
              </div>

              {/* "Nice to have" section: yellow, like the real guest page */}
              <div className="rounded-2xl border-2 border-gold/50 bg-gradient-to-br from-gold/10 to-gold/5 p-2">
                <div className="flex flex-wrap items-center gap-x-1.5 gap-y-0.5 px-1 pb-1.5">
                  <span className="text-[11px] font-extrabold">
                    💛 {t('host.create.step2.categories.nice')}
                  </span>
                  <span className="rounded-full border border-gold/40 bg-gold/10 px-1.5 py-px text-[8px] font-semibold text-gold-dark">
                    1 {t('host.guest.count.available')}
                  </span>
                </div>
                <div className="rounded-xl border-2 border-gold/50 bg-gradient-to-br from-gold/20 to-gold/5 p-2 shadow-card">
                  <span className="inline-flex rounded-full bg-gold/25 px-1.5 py-px text-[8px] font-bold text-dark">
                    {t('host.guest.giftCard.welcomeToo')}
                  </span>
                  <div className="mt-1 text-xs font-bold">{t('landing.mockup.gift2')}</div>
                  <div className="mt-1.5 w-fit rounded-full bg-gold px-2.5 py-1 text-[9px] font-semibold text-dark">
                    {t('host.guest.giftCard.cta')}
                  </div>
                </div>
              </div>

              {/* Collapsed "Please avoid" strip, like the real page */}
              <div className="flex items-center justify-between rounded-xl bg-white px-2.5 py-2 shadow-card ring-1 ring-red-soft/50">
                <span className="text-[10px] font-extrabold">
                  {t('host.create.step2.categories.avoid')} <span aria-hidden="true">⛔</span>
                </span>
                <span aria-hidden="true" className="text-[9px] text-dark-light">
                  ▼
                </span>
              </div>
            </div>
          </div>

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
