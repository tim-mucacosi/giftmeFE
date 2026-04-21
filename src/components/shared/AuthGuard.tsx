'use client'

import { useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import type { ReactNode } from 'react'
import { useCurrentUser } from '@/lib/auth/useCurrentUser'

export function AuthGuard({ children }: { children: ReactNode }) {
  const { user, ready } = useCurrentUser()
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    if (ready && !user) {
      router.replace(`/login?next=${encodeURIComponent(pathname ?? '/dashboard')}`)
    }
  }, [ready, user, router, pathname])

  if (!ready) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <span className="inline-block h-8 w-8 rounded-full border-4 border-gray-light border-t-coral animate-spin" />
      </div>
    )
  }

  if (!user) return null

  return <>{children}</>
}
