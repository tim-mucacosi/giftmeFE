'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useTranslate } from '@tolgee/react'
import type { User } from '@/types/user'

type Props = { user: User; onLogout: () => void }

function getInitials(user: User): string {
  if (user.name) {
    const parts = user.name.trim().split(/\s+/)
    return parts.length >= 2
      ? (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
      : parts[0][0].toUpperCase()
  }
  return user.email[0].toUpperCase()
}

export function UserMenu({ user, onLogout }: Props) {
  const { t } = useTranslate()
  const router = useRouter()
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
        className="flex h-9 w-9 items-center justify-center rounded-full bg-coral text-sm font-bold text-white transition-opacity hover:opacity-85 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-coral focus-visible:ring-offset-2"
      >
        {user.profilePicture ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={user.profilePicture} alt={user.name ?? user.email} className="h-full w-full rounded-full object-cover" />
        ) : getInitials(user)}
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
            <button type="button" role="menuitem" onClick={handleLogout} className="flex w-full items-center gap-2.5 px-4 py-2.5 text-sm font-medium text-coral transition-colors hover:bg-coral/10">
              <span aria-hidden="true">👋</span>
              {t('nav.logout', 'Odjavi se')}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
