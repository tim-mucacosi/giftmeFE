'use client'

import { useEffect, useRef, useState, useTransition } from 'react'
import { useTolgee, useTranslate } from '@tolgee/react'
import { setLanguage } from '@/tolgee/language'
import { ALL_LANGUAGES } from '@/tolgee/shared'
import { cn } from '@/lib/utils/cn'

const FLAGS: Record<string, string> = {
  sr: '🇷🇸',
  en: '🇬🇧',
  de: '🇩🇪',
}

// Custom dropdown instead of a native <select>: mobile browsers render the
// native option list at an OS-controlled size we cannot style, and it was too
// small to tap comfortably.
export function LanguageSwitcher({ className }: { className?: string }) {
  const tolgee = useTolgee(['language'])
  const current = tolgee.getLanguage() ?? 'sr'
  const { t } = useTranslate()
  const [pending, startTransition] = useTransition()
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    if (open) document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open])

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    if (open) document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [open])

  const onSelect = (lang: string) => {
    setOpen(false)
    if (lang === current) return
    tolgee.changeLanguage(lang)
    startTransition(() => {
      setLanguage(lang)
    })
  }

  return (
    <div ref={ref} className={cn('relative', className)}>
      <button
        type="button"
        onClick={() => setOpen((s) => !s)}
        disabled={pending}
        aria-expanded={open}
        aria-haspopup="listbox"
        aria-label={t('common.language')}
        className={cn(
          'inline-flex items-center gap-1.5 rounded-full bg-white/80 backdrop-blur border border-gray-light px-3 py-2 text-base font-semibold text-dark shadow-sm transition-colors hover:bg-white sm:px-2.5 sm:py-1 sm:text-sm',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-coral',
        )}
      >
        <span aria-hidden="true">{FLAGS[current]}</span>
        <span className="uppercase">{current}</span>
        <svg
          aria-hidden="true"
          viewBox="0 0 24 24"
          className={cn('h-3.5 w-3.5 text-dark-light transition-transform duration-200', open && 'rotate-180')}
          fill="none"
          stroke="currentColor"
          strokeWidth={3}
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M6 9l6 6 6-6" />
        </svg>
      </button>

      {open && (
        <div
          role="listbox"
          aria-label={t('common.language')}
          className="absolute right-0 top-full z-50 mt-2 w-48 overflow-hidden rounded-2xl border border-gray-light bg-white py-1 shadow-card"
        >
          {ALL_LANGUAGES.map((lang) => (
            <button
              key={lang}
              type="button"
              role="option"
              aria-selected={lang === current}
              onClick={() => onSelect(lang)}
              className={cn(
                'flex w-full items-center gap-2.5 px-4 py-3 text-base font-medium transition-colors sm:py-2.5 sm:text-sm',
                lang === current
                  ? 'bg-coral/10 text-coral'
                  : 'text-dark hover:bg-gray-light/60',
              )}
            >
              <span aria-hidden="true">{FLAGS[lang]}</span>
              {t(`common.languages.${lang}`)}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
