'use client'

import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react'
import Link from 'next/link'
import { cn } from '@/lib/utils/cn'

type Variant = 'coral' | 'gold' | 'outline' | 'ghost' | 'dark'
type Size = 'sm' | 'md' | 'lg'

const base =
  'inline-flex items-center justify-center gap-2 font-semibold select-none ' +
  'transition-all duration-200 ease-[cubic-bezier(0.4,0,0.2,1)] ' +
  'disabled:opacity-50 disabled:cursor-not-allowed ' +
  'active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-coral focus-visible:ring-offset-2'

const variants: Record<Variant, string> = {
  coral:
    'bg-coral text-white shadow-cta hover:bg-coral-dark hover:shadow-cta-hover',
  gold: 'bg-gold text-dark shadow-card hover:shadow-card-hover hover:bg-gold-light',
  outline:
    'bg-white text-dark border-2 border-gray-light hover:border-coral hover:text-coral',
  ghost: 'bg-transparent text-dark hover:bg-gray-light/60',
  dark: 'bg-dark text-white hover:bg-dark-light',
}

const sizes: Record<Size, string> = {
  sm: 'h-10 px-4 text-sm rounded-pill',
  md: 'h-12 px-6 text-base rounded-pill min-h-[48px]',
  lg: 'h-14 px-8 text-base md:text-lg rounded-pill min-h-[48px]',
}

type CommonProps = {
  variant?: Variant
  size?: Size
  fullWidth?: boolean
  loading?: boolean
  children: ReactNode
  className?: string
}

type ButtonAsButton = CommonProps &
  ButtonHTMLAttributes<HTMLButtonElement> & {
    href?: undefined
  }

type ButtonAsLink = CommonProps & {
  href: string
  target?: string
  rel?: string
  onClick?: () => void
}

export type ButtonProps = ButtonAsButton | ButtonAsLink

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  props,
  ref,
) {
  const {
    variant = 'coral',
    size = 'md',
    fullWidth,
    loading,
    children,
    className,
    ...rest
  } = props

  const classes = cn(
    base,
    variants[variant],
    sizes[size],
    fullWidth && 'w-full',
    className,
  )

  if ('href' in rest && rest.href) {
    const { href, target, rel, onClick } = rest
    return (
      <Link
        href={href}
        target={target}
        rel={rel}
        onClick={onClick}
        className={classes}
      >
        {children}
      </Link>
    )
  }

  const buttonRest = rest as ButtonHTMLAttributes<HTMLButtonElement>
  return (
    <button
      ref={ref}
      className={classes}
      disabled={loading || buttonRest.disabled}
      {...buttonRest}
    >
      {loading ? (
        <span className="inline-block h-4 w-4 rounded-full border-2 border-white/40 border-t-white animate-spin" />
      ) : null}
      {children}
    </button>
  )
})
