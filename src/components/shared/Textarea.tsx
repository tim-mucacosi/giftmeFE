'use client'

import { forwardRef, type TextareaHTMLAttributes } from 'react'
import { cn } from '@/lib/utils/cn'

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string
  error?: string
  hint?: string
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  function Textarea({ label, error, hint, className, id, ...rest }, ref) {
    const inputId = id ?? `ta_${Math.random().toString(36).slice(2, 8)}`
    return (
      <div className="flex flex-col gap-1.5">
        {label ? (
          <label htmlFor={inputId} className="text-sm font-semibold text-dark">
            {label}
          </label>
        ) : null}
        <textarea
          id={inputId}
          ref={ref}
          className={cn(
            'min-h-[120px] w-full rounded-xl border-2 border-gray-light bg-white px-4 py-3 text-base text-dark',
            'transition-colors duration-200 placeholder:text-gray',
            'focus:border-coral focus:outline-none resize-y',
            error && 'border-coral',
            className,
          )}
          {...rest}
        />
        {hint && !error ? <p className="text-xs text-dark-light">{hint}</p> : null}
        {error ? <p className="text-xs text-coral font-medium">{error}</p> : null}
      </div>
    )
  },
)
