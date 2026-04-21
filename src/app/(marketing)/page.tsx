import type { Metadata } from 'next'
import { HeroBanner } from '@/components/marketing/HeroBanner'
import { HowItWorks } from '@/components/marketing/HowItWorks'
import { WhyPokloniMi } from '@/components/marketing/WhyPokloniMi'
import { MockupPreview } from '@/components/marketing/MockupPreview'
import { Testimonials } from '@/components/marketing/Testimonials'
import { CtaSection } from '@/components/marketing/CtaSection'
import { getTranslate } from '@/tolgee/server'

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslate()
  return {
    title: t('landing.meta.title'),
    description: t('landing.meta.description'),
  }
}

export default function LandingPage() {
  return (
    <>
      <HeroBanner />
      <HowItWorks />
      <WhyPokloniMi />
      <MockupPreview />
      <Testimonials />
      <CtaSection />
    </>
  )
}
