import type { Metadata } from 'next'
import { getTranslate } from '@/tolgee/server'

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslate()
  return { title: t('legal.about.title') }
}

export default async function AboutPage() {
  const t = await getTranslate()
  const paragraphs = ['p1', 'p2', 'p3'] as const

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
      <h1 className="text-3xl font-extrabold tracking-tight text-dark sm:text-4xl">
        {t('legal.about.title')}
      </h1>
      <div className="mt-6 flex flex-col gap-4">
        {paragraphs.map((key) => (
          <p key={key} className="text-base leading-relaxed text-dark">
            {t(`legal.about.${key}`)}
          </p>
        ))}
      </div>
      <p className="mt-8 rounded-2xl bg-bg px-4 py-3 text-sm text-dark-light">
        {t('legal.about.contact')}
      </p>
    </div>
  )
}
