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
                  'flex min-h-[36px] shrink-0 items-center gap-2 rounded-full px-2 py-1.5 text-xs font-semibold transition-colors sm:px-3 sm:text-sm',
                  state === 'active' && 'bg-coral text-white shadow-cta',
                  state === 'done' && 'bg-success/25 text-dark',
                  state === 'future' && 'bg-gray-light text-dark-light',
                  !isClickable && 'cursor-default',
                )}
                disabled={!isClickable}
                aria-current={state === 'active' ? 'step' : undefined}
                aria-label={label}
              >
                <span
                  className={cn(
                    'flex h-6 w-6 items-center justify-center rounded-full text-[11px]',
                    state === 'active' && 'bg-white/25',
                    state === 'done' && 'bg-success/70',
                    state === 'future' && 'bg-white',
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
                    'h-[2px] flex-1 rounded-full',
                    step < current ? 'bg-success/60' : 'bg-gray-light',
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
