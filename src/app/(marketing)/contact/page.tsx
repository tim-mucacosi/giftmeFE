import type { Metadata } from 'next'
import { getTranslate } from '@/tolgee/server'
import { ContactForm } from '@/components/marketing/ContactForm'

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslate()
  return { title: t('contact.title') }
}

export default async function ContactPage() {
  const t = await getTranslate()

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
      <h1 className="text-3xl font-extrabold tracking-tight text-dark sm:text-4xl">
        {t('contact.title')}
      </h1>
      <ContactForm />
    </div>
  )
}
