'use client'

import { forwardRef, type SelectHTMLAttributes } from 'react'
import { cn } from '@/lib/utils/cn'

export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string
  error?: string
  hint?: string
}

/** Native select styled like <Input>. */
export const Select = forwardRef<HTMLSelectElement, SelectProps>(function Select(
  { label, error, hint, className, id, children, ...rest },
  ref,
) {
  const selectId = id ?? `sel_${Math.random().toString(36).slice(2, 8)}`
  return (
    <div className="flex flex-col gap-1.5">
      {label ? (
        <label htmlFor={selectId} className="text-sm font-semibold text-dark">
          {label}
        </label>
      ) : null}
      <div className="relative">
        <select
          id={selectId}
          ref={ref}
          className={cn(
            'h-12 min-h-[48px] w-full appearance-none rounded-xl border-2 border-gray-light bg-white pl-4 pr-10 text-base text-dark',
            'transition-colors duration-200 focus:border-coral focus:outline-none',
            error && 'border-coral',
            className,
          )}
          {...rest}
        >
          {children}
        </select>
        {/* Replaces the native arrow hidden by appearance-none */}
        <svg
          aria-hidden="true"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={3}
          strokeLinecap="round"
          strokeLinejoin="round"
          className="pointer-events-none absolute right-4 top-1/2 h-3 w-3 -translate-y-1/2 text-dark-light"
        >
          <path d="M6 9l6 6 6-6" />
        </svg>
      </div>
      {hint && !error ? <p className="text-xs text-dark-light">{hint}</p> : null}
      {error ? <p className="text-xs text-coral font-medium">{error}</p> : null}
    </div>
  )
})
