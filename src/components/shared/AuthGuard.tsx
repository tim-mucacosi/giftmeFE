'use client'

import { useEffect, useRef } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import type { ReactNode } from 'react'
import { useCurrentUser } from '@/lib/auth/useCurrentUser'
import { loadSession, saveSession, clearSession } from '@/lib/auth/session'
import { getMe } from '@/lib/api/auth'
import { AuthError } from '@/types/auth'

export function AuthGuard({ children }: { children: ReactNode }) {
  const { user, ready } = useCurrentUser()
  const router = useRouter()
  const pathname = usePathname()
  const refreshedRef = useRef(false)

  // Redirect when auth is ready and there's no user.
  useEffect(() => {
    if (ready && !user) {
      router.replace(`/login?next=${encodeURIComponent(pathname ?? '/dashboard')}`)
    }
  }, [ready, user, router, pathname])

  // Refresh the cached user from /auth/get-me on first mount of any protected
  // page. Picks up any backend-side changes (provider, profile picture, name)
  // without forcing the user to log out and back in. Also surfaces an expired
  // token by clearing the session and bouncing to /login.
  useEffect(() => {
    if (!ready || !user || refreshedRef.current) return
    refreshedRef.current = true

    const session = loadSession()
    if (!session?.accessToken) return

    let cancelled = false
    ;(async () => {
      try {
        const fresh = await getMe(session.accessToken)
        if (cancelled) return
        // Only write back if something actually changed (avoid noise from the
        // 'poklonimi:session-changed' event).
        const a = JSON.stringify(session.user)
        const b = JSON.stringify(fresh)
        if (a !== b) {
          saveSession({
            success: true,
            accessToken: session.accessToken,
            refreshToken: session.refreshToken ?? '',
            user: fresh,
          })
        }
      } catch (err) {
        if (cancelled) return
        if (err instanceof AuthError && err.status === 401) {
          clearSession()
          router.replace(
            `/login?next=${encodeURIComponent(pathname ?? '/dashboard')}`,
          )
        }
        // Network errors / 5xx: keep working with the cached user.
      }
    })()

    return () => {
      cancelled = true
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
