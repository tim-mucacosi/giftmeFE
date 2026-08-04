'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useTranslate } from '@tolgee/react'
import { cn } from '@/lib/utils/cn'
import type { User } from '@/types/user'

type Props = { user: User; onLogout: () => void }

export function UserMenu({ user, onLogout }: Props) {
  const { t } = useTranslate()
  const router = useRouter()
  const [open, setOpen] = useState(false)
  // Fall back to initials when the provider photo fails to load (expired
  // Google/Facebook CDN URLs would otherwise render a broken image).
  const [imgError, setImgError] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const showImage = !!user.profilePicture && !imgError

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    if (open) document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open])

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false) }
    if (open) document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [open])

  function handleLogout() {
    setOpen(false)
    onLogout()
    router.push('/')
    router.refresh()
  }

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((s) => !s)}
        aria-expanded={open}
        aria-haspopup="true"
        aria-label={user.name ?? user.email}
        className={cn(
          'relative flex h-9 w-9 items-center justify-center rounded-full',
          'bg-gradient-to-br from-coral to-gold text-sm font-bold text-white shadow-card',
          'ring-2 ring-white transition-all duration-200',
          'hover:scale-105 hover:shadow-card-hover',
          'focus-visible:outline-none focus-visible:ring-coral',
          open && 'ring-coral',
        )}
      >
        {showImage ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={user.profilePicture}
            alt={user.name ?? user.email}
            onError={() => setImgError(true)}
            className="h-full w-full rounded-full object-cover"
          />
        ) : (
          // Head-and-shoulders silhouette, clipped by the circle like a photo.
          <svg
            aria-hidden="true"
            viewBox="0 0 24 24"
            fill="currentColor"
            className="h-full w-full rounded-full p-1"
          >
            <circle cx="12" cy="8.2" r="4" />
            <path d="M12 13.8c-4.4 0-7.5 2.6-7.5 6.2V22h15v-2c0-3.6-3.1-6.2-7.5-6.2z" />
          </svg>
        )}
        {/* Chevron badge: signals this avatar opens a menu. */}
        <span
          aria-hidden="true"
          className="absolute -bottom-0.5 -right-1 flex h-4 w-4 items-center justify-center rounded-full border border-gray-light bg-white text-dark-light shadow-sm"
        >
          <svg
            viewBox="0 0 24 24"
            className={cn('h-2.5 w-2.5 transition-transform duration-200', open && 'rotate-180')}
            fill="none"
            stroke="currentColor"
            strokeWidth={3}
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M6 9l6 6 6-6" />
          </svg>
        </span>
      </button>

      {open && (
        <div role="menu" className="absolute right-0 top-full z-50 mt-2 w-52 overflow-hidden rounded-2xl border border-gray-light bg-white shadow-card">
          <div className="border-b border-gray-light px-4 py-3">
            {user.name && <p className="truncate text-sm font-semibold text-dark">{user.name}</p>}
            <p className="truncate text-xs text-dark-light">{user.email}</p>
          </div>
          <div className="py-1">
            <Link href="/dashboard" role="menuitem" onClick={() => setOpen(false)} className="flex items-center gap-2.5 px-4 py-2.5 text-sm font-medium text-dark transition-colors hover:bg-gray-light/60">
              <span aria-hidden="true">📋</span>
              {t('nav.dashboard')}
            </Link>
            {/* Only local-auth users have a password to change. Hide for Google/Facebook accounts. */}
            {(!user.provider || user.provider === 'local') && (
              <Link href="/settings/password" role="menuitem" onClick={() => setOpen(false)} className="flex items-center gap-2.5 px-4 py-2.5 text-sm font-medium text-dark transition-colors hover:bg-gray-light/60">
                <span aria-hidden="true">🔑</span>
                {t('auth.changePassword.title')}
              </Link>
            )}
            <button type="button" role="menuitem" onClick={handleLogout} className="flex w-full items-center gap-2.5 px-4 py-2.5 text-sm font-medium text-coral transition-colors hover:bg-coral/10">
              <span aria-hidden="true">👋</span>
              {t('nav.logout')}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
