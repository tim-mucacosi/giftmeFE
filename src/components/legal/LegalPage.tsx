'use client'

import { useTranslate } from '@tolgee/react'

export interface LegalSection {
  id: string
  heading: string
  body: string[]
}

interface Props {
  title: string
  updatedAt: string
  intro: string
  sections: LegalSection[]
}

/**
 * Shared shell for the Terms and Privacy pages: title, last-updated date,
 * the draft-status banner, a table of contents, and the section list.
 */
export function LegalPage({ title, updatedAt, intro, sections }: Props) {
  const { t } = useTranslate()

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
      <header>
        <h1 className="text-3xl font-extrabold tracking-tight text-dark sm:text-4xl">{title}</h1>
        <p className="mt-2 text-sm text-dark-light">
          {t('legal.lastUpdated')}: {updatedAt}
        </p>
      </header>

      <p
        role="note"
        className="mt-6 rounded-2xl border-2 border-gold/60 bg-gold/15 px-4 py-3 text-sm font-medium text-dark"
      >
        {t('legal.draftNotice')}
      </p>

      <p className="mt-6 text-base leading-relaxed text-dark">{intro}</p>

      <nav aria-labelledby="toc-heading" className="mt-8 rounded-2xl bg-bg p-5">
        <h2 id="toc-heading" className="text-sm font-extrabold uppercase tracking-wide text-dark-light">
          {t('legal.tableOfContents')}
        </h2>
        <ol className="mt-3 flex list-decimal flex-col gap-1.5 pl-5 text-sm marker:text-dark-light">
          {sections.map((section) => (
            <li key={section.id}>
              <a href={`#${section.id}`} className="text-coral hover:underline">
                {section.heading}
              </a>
            </li>
          ))}
        </ol>
      </nav>

      <div className="mt-10 flex flex-col gap-8">
        {sections.map((section, index) => (
          <section key={section.id} id={section.id} aria-labelledby={`${section.id}-heading`}>
            <h2
              id={`${section.id}-heading`}
              className="text-xl font-extrabold tracking-tight text-dark sm:text-2xl"
            >
              {index + 1}. {section.heading}
            </h2>
            {section.body.map((paragraph, i) => (
              <p key={i} className="mt-3 text-base leading-relaxed text-dark">
                {paragraph}
              </p>
            ))}
          </section>
        ))}
      </div>
    </div>
  )
}
