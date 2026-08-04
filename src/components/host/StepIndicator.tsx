'use client'

import { useTranslate } from '@tolgee/react'
import { cn } from '@/lib/utils/cn'

const STEP_KEYS = ['details', 'gifts', 'review'] as const

// English fallbacks shown if Tolgee can't find the key (e.g. CDN out of sync).
const STEP_FALLBACK: Record<(typeof STEP_KEYS)[number], string> = {
  details: 'Details',
  gifts: 'Gifts',
  review: 'Review',
}

interface StepIndicatorProps {
  current: number // 1-3
  onJump?: (step: number) => void
}

export function StepIndicator({ current, onJump }: StepIndicatorProps) {
  const { t } = useTranslate()
  return (
    <div className="sticky top-0 z-30 -mx-4 border-b border-gray-light bg-white/90 px-4 py-3 backdrop-blur sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
      <ol className="mx-auto flex w-full max-w-2xl items-center gap-2">
        {STEP_KEYS.map((key, i) => {
          const step = i + 1
          const state = step < current ? 'done' : step === current ? 'active' : 'future'
          const isClickable = state === 'done' && !!onJump
          const isLast = i === STEP_KEYS.length - 1
          const label = t(`host.create.steps.${key}`, STEP_FALLBACK[key])
          return (
            <li
              key={key}
              className={cn('flex items-center gap-2', !isLast && 'flex-1 min-w-0')}
            >
              <button
                type="button"
                onClick={() => isClickable && onJump?.(step)}
                className={cn(
                  'flex min-h-[38px] shrink-0 items-center gap-2 rounded-full py-1.5 pl-1.5 pr-2.5 text-xs font-semibold transition-all duration-200 sm:pr-3.5 sm:text-sm',
                  state === 'active' &&
                    'scale-105 bg-coral text-white shadow-cta ring-2 ring-coral/25 ring-offset-2',
                  state === 'done' && 'bg-success text-dark shadow-card',
                  state === 'future' && 'border-2 border-gray-light bg-white text-dark-light',
                  isClickable
                    ? 'hover:shadow-card-hover hover:brightness-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-coral focus-visible:ring-offset-2'
                    : 'cursor-default',
                )}
                disabled={!isClickable}
                aria-current={state === 'active' ? 'step' : undefined}
                aria-label={label}
              >
                <span
                  className={cn(
                    'flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[11px] font-extrabold',
                    state === 'active' && 'bg-white text-coral',
                    state === 'done' && 'bg-white/60 text-dark',
                    state === 'future' && 'bg-gray-light text-dark-light',
                  )}
                >
                  {state === 'done' ? '✓' : step}
                </span>
                <span
                  className={cn(
                    'max-w-[36vw] truncate whitespace-nowrap',
                    state !== 'active' && 'hidden sm:inline',
                  )}
                >
                  {label}
                </span>
              </button>
              {!isLast ? (
                <span
                  aria-hidden="true"
                  className={cn(
                    'h-1 flex-1 rounded-full transition-colors duration-300',
                    step < current ? 'bg-success' : 'bg-gray-light',
                  )}
                />
              ) : null}
            </li>
          )
        })}
      </ol>
    </div>
  )
}
