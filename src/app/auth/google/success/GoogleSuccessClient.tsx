'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { getMe } from '@/lib/api/auth'
import { loadSession, saveSession } from '@/lib/auth/session'
import { AuthError } from '@/types/auth'

// Module-level guard: survives React Strict Mode's double-invoke of effects
// in dev (which uses a fresh useRef on each remount). Per token, we only ever
// run the exchange once across the whole module lifetime.
const processedTokens = new Set<string>()

export function GoogleSuccessClient() {
  const router = useRouter()
  const params = useSearchParams()
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const token = params.get('token')
    if (!token) {
      router.replace('/login?error=google_failed')
      return
    }

    if (loadSession()) {
      window.location.replace('/dashboard')
      return
    }

    if (processedTokens.has(token)) return
    processedTokens.add(token)

    ;(async () => {
      try {
        const user = await getMe(token)
        saveSession({
          success: true,
          accessToken: token,
          refreshToken: '',
          user,
        })
        window.location.replace('/dashboard')
      } catch (err) {
        // Ignore aborted fetches when redirecting
        if (err instanceof DOMException && err.name === 'AbortError') return
        const message =
          err instanceof AuthError
            ? err.message
            : 'Sign-in failed. Please try again.'
        setError(message)
      }
    })()
  }, [params, router])

  if (error) {
    return (
      <div className="flex min-h-[80vh] items-center justify-center px-4">
        <div className="w-full max-w-sm rounded-3xl bg-white p-8 text-center shadow-card">
          <div className="mb-3 text-4xl" aria-hidden="true">
            ⚠️
          </div>
          <h1 className="mb-2 text-lg font-bold text-dark">Sign-in failed</h1>
          <p className="mb-6 text-sm text-dark-light">{error}</p>
          <a
            href="/login"
            className="inline-flex h-12 items-center justify-center rounded-pill bg-coral px-6 text-sm font-semibold text-white hover:bg-coral-dark"
          >
            Back to login
          </a>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-[80vh] items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <span className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-gray-light border-t-coral" />
        <p className="text-sm text-dark-light">Completing sign-in…</p>
      </div>
    </div>
  )
}
