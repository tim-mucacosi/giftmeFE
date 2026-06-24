'use client'

import { useTolgee, useTranslate } from '@tolgee/react'
import { setLanguage } from '@/tolgee/language'
import { ALL_LANGUAGES } from '@/tolgee/shared'
import { cn } from '@/lib/utils/cn'
import { useTransition } from 'react'

const FLAGS: Record<string, string> = {
  sr: '🇷🇸',
  en: '🇬🇧',
  de: '🇩🇪',
}

export function LanguageSwitcher({ className }: { className?: string }) {
  const tolgee = useTolgee(['language'])
  const current = tolgee.getLanguage() ?? 'sr'
  const { t } = useTranslate()
  const [pending, startTransition] = useTransition()

  const onChange = (lang: string) => {
    tolgee.changeLanguage(lang)
    startTransition(() => {
      setLanguage(lang)
    })
  }

  return (
    <label
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full bg-white/80 backdrop-blur border border-gray-light px-2 py-1 text-sm shadow-sm',
        className,
      )}
    >
      <span className="sr-only">{t('common.language')}</span>
      <select
        aria-label={t('common.language')}
        className="bg-transparent pr-1 font-semibold text-dark focus:outline-none"
        value={current}
        onChange={(e) => onChange(e.target.value)}
        disabled={pending}
      >
        {ALL_LANGUAGES.map((lang) => (
          <option key={lang} value={lang}>
            {FLAGS[lang]} {t(`common.languages.${lang}`)}
          </option>
        ))}
      </select>
    </label>
  )
}
