import type { Metadata } from 'next'
import { LegalPage, type LegalSection } from '@/components/legal/LegalPage'
import { LEGAL_PRIVACY_VERSION } from '@/lib/legal'
import { getTranslate } from '@/tolgee/server'

const SECTION_IDS = [
  'podaci',
  'svrha',
  'nalog',
  'proslave',
  'gosti',
  'kolacici',
  'cuvanje',
  'bezbednost',
  'prava',
  'brisanje',
  'trece-strane',
  'izmene',
  'kontakt',
] as const

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslate()
  return { title: t('legal.privacy.title') }
}

export default async function PrivacyPage() {
  const t = await getTranslate()

  const sections: LegalSection[] = SECTION_IDS.map((id) => ({
    id,
    heading: t(`legal.privacy.sections.${id}.heading`),
    body: [t(`legal.privacy.sections.${id}.body`)],
  }))

  return (
    <LegalPage
      title={t('legal.privacy.title')}
      updatedAt={LEGAL_PRIVACY_VERSION}
      intro={t('legal.privacy.intro')}
      sections={sections}
    />
  )
}
