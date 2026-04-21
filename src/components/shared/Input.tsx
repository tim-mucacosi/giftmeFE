'use client'

import { forwardRef, type InputHTMLAttributes } from 'react'
import { cn } from '@/lib/utils/cn'

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  hint?: string
  containerClassName?: string
}

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { label, error, hint, containerClassName, className, id, ...rest },
  ref,
) {
  const inputId = id ?? `in_${Math.random().toString(36).slice(2, 8)}`
  return (
    <div className={cn('flex flex-col gap-1.5', containerClassName)}>
      {label ? (
        <label htmlFor={inputId} className="text-sm font-semibold text-dark">
          {label}
        </label>
      ) : null}
      <input
        id={inputId}
        ref={ref}
        className={cn(
          'h-12 min-h-[48px] w-full rounded-xl border-2 border-gray-light bg-white px-4 text-base text-dark',
          'transition-colors duration-200 placeholder:text-gray',
          'focus:border-coral focus:outline-none',
          error && 'border-coral',
          className,
        )}
        {...rest}
      />
      {hint && !error ? <p className="text-xs text-dark-light">{hint}</p> : null}
      {error ? <p className="text-xs text-coral font-medium">{error}</p> : null}
    </div>
  )
})
