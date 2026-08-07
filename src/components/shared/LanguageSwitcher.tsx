'use client'

import { useEffect, useRef, useState, useTransition } from 'react'
import { useTolgee, useTranslate } from '@tolgee/react'
import { setLanguage } from '@/tolgee/language'
import { ALL_LANGUAGES } from '@/tolgee/shared'
import { cn } from '@/lib/utils/cn'

// Emoji flags (🇷🇸 etc.) are two combined "regional indicator" letters; when
// the OS font can't combine them (notably Windows) it falls back to showing
// the raw letters (e.g. "GB") instead of a flag. SVGs render identically
// everywhere.
function FlagIcon({ code, className }: { code: string; className?: string }) {
  const common = cn('h-3.5 w-5 shrink-0 rounded-[2px]', className)
  switch (code) {
    case 'sr':
      return (
        <svg viewBox="0 0 20 15" className={common} aria-hidden="true">
          <rect width="20" height="15" fill="#fff" />
          <rect width="20" height="5" fill="#C6363C" />
          <rect y="5" width="20" height="5" fill="#0C4076" />
        </svg>
      )
    case 'de':
      return (
        <svg viewBox="0 0 20 15" className={common} aria-hidden="true">
          <rect width="20" height="5" fill="#000" />
          <rect y="5" width="20" height="5" fill="#DD0000" />
          <rect y="10" width="20" height="5" fill="#FFCE00" />
        </svg>
      )
    case 'en':
      return (
        <svg viewBox="0 0 20 15" className={common} aria-hidden="true">
          <rect width="20" height="15" fill="#00247D" />
          <path d="M0 0L20 15M20 0L0 15" stroke="#fff" strokeWidth="3" />
          <path d="M0 0L20 15M20 0L0 15" stroke="#CF142B" strokeWidth="1.2" />
          <path d="M10 0V15M0 7.5H20" stroke="#fff" strokeWidth="5" />
          <path d="M10 0V15M0 7.5H20" stroke="#CF142B" strokeWidth="2" />
        </svg>
      )
    default:
      return null
  }
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
          // Height/text match the nav's Log in pill so the two sit level.
          'inline-flex min-h-[36px] items-center gap-1.5 rounded-full border border-gray-light bg-white/80 px-3 text-sm font-semibold text-dark shadow-sm backdrop-blur transition-colors hover:bg-white',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-coral',
        )}
      >
        <FlagIcon code={current} />
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
              <FlagIcon code={lang} />
              {t(`common.languages.${lang}`)}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
