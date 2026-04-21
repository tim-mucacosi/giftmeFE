'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { saveSession } from '@/lib/auth/session'
import { getMe } from '@/lib/api/auth'
import { AuthError } from '@/types/auth'

export default function AuthCallbackPage() {
  const router = useRouter()
  const params = useSearchParams()
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function handleCallback() {
      const accessToken = params.get('accessToken')
      const refreshToken = params.get('refreshToken')

      if (!accessToken || !refreshToken) {
        setError('Missing tokens in the callback URL. Please try signing in again.')
        return
      }

      try {
        const user = await getMe(accessToken)
        saveSession({ success: true, accessToken, refreshToken, user })
        router.replace('/dashboard')
      } catch (err) {
        setError(err instanceof AuthError ? err.message : 'Sign-in failed. Please try again.')
      }
    }

    handleCallback()
  }, [params, router])

  if (error) {
    return (
      <div className="flex min-h-[80vh] items-center justify-center px-4">
        <div className="w-full max-w-sm rounded-3xl bg-white p-8 shadow-card text-center">
          <div className="mb-3 text-4xl" aria-hidden="true">⚠️</div>
          <h1 className="mb-2 text-lg font-bold text-dark">Sign-in failed</h1>
          <p className="mb-6 text-sm text-dark-light">{error}</p>
          <a href="/login" className="inline-flex h-12 items-center justify-center rounded-pill bg-coral px-6 text-sm font-semibold text-white hover:bg-coral-dark">
            Back to login
          </a>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-[80vh] items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <span className="inline-block h-8 w-8 rounded-full border-4 border-gray-light border-t-coral animate-spin" />
        <p className="text-sm text-dark-light">Completing sign-in…</p>
      </div>
    </div>
  )
}
