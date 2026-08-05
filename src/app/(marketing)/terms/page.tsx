import type { Metadata } from 'next'
import { LegalPage, type LegalSection } from '@/components/legal/LegalPage'
import { LEGAL_TERMS_VERSION } from '@/lib/legal'
import { getTranslate } from '@/tolgee/server'

const SECTION_IDS = [
  'svrha',
  'nalog',
  'liste',
  'rezervacije',
  'odgovornosti',
  'zabranjeno',
  'dostupnost',
  'odgovornost',
  'intelektualna-svojina',
  'ukidanje',
  'izmene',
  'kontakt',
] as const

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslate()
  return { title: t('legal.terms.title') }
}

export default async function TermsPage() {
  const t = await getTranslate()

  const sections: LegalSection[] = SECTION_IDS.map((id) => ({
    id,
    heading: t(`legal.terms.sections.${id}.heading`),
    body: [t(`legal.terms.sections.${id}.body`)],
  }))

  return (
    <LegalPage
      title={t('legal.terms.title')}
      updatedAt={LEGAL_TERMS_VERSION}
      intro={t('legal.terms.intro')}
      sections={sections}
    />
  )
}
