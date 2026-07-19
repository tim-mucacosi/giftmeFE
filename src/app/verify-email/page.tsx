'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { useTranslate } from '@tolgee/react'
import { Button } from '@/components/shared/Button'
import { verifyEmail } from '@/lib/api/auth'

type Status = 'loading' | 'success' | 'error'

export default function VerifyEmailPage() {
  const searchParams = useSearchParams()
  const token = searchParams.get('token')
  const [status, setStatus] = useState<Status>('loading')

  useEffect(() => {
    if (!token) {
      setStatus('error')
      return
    }

    let cancelled = false;
    (async () => {
      try {
        const response = await verifyEmail(token)
        if (cancelled) return
        setStatus(response.success !== false ? 'success' : 'error')
      } catch {
        if (!cancelled) setStatus('error')
      }
    })()

    return () => {
      cancelled = true
    }
  }, [token])

  return (
    <div className="flex min-h-[80vh] items-center justify-center px-4 py-12">
      <div className="w-full max-w-[420px] rounded-3xl bg-white p-7 shadow-card sm:p-8">
        {status === 'loading' && <LoadingState />}
        {status === 'success' && <SuccessState />}
        {status === 'error' && <ErrorState />}
      </div>
    </div>
  )
}

function LoadingState() {
  const { t } = useTranslate()
  return (
    <div className="flex flex-col items-center text-center">
      <div
        className="mb-5 inline-block h-10 w-10 rounded-full border-4 border-coral/20 border-t-coral animate-spin"
        aria-hidden="true"
      />
      <h1 className="text-2xl font-extrabold tracking-tight text-dark">
        {t('auth.verifyEmail.loading.title')}
      </h1>
      <p className="mt-2 text-sm text-dark-light">
        {t('auth.verifyEmail.loading.subtitle')}
      </p>
    </div>
  )
}

function SuccessState() {
  const { t } = useTranslate()
  return (
    <div className="flex flex-col items-center text-center">
      <div
        className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-success/25 text-3xl"
        aria-hidden="true"
      >
        ✅
      </div>
      <h1 className="text-2xl font-extrabold tracking-tight text-dark">
        {t('auth.verifyEmail.success.title')}
      </h1>
      <p className="mt-2 mb-6 text-sm text-dark-light">
        {t('auth.verifyEmail.success.subtitle')}
      </p>
      <Button href="/login" fullWidth>
        {t('auth.verifyEmail.success.goToLogin')}
      </Button>
      <Link
        href="/"
        className="mt-4 text-sm font-semibold text-dark-light hover:text-coral"
      >
        ← {t('auth.verifyEmail.success.backToHome')}
      </Link>
    </div>
  )
}

function ErrorState() {
  const { t } = useTranslate()
  return (
    <div className="flex flex-col items-center text-center">
      <div
        className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-coral/15 text-3xl"
        aria-hidden="true"
      >
        ⚠️
      </div>
      <h1 className="text-2xl font-extrabold tracking-tight text-dark">
        {t('auth.verifyEmail.error.title')}
      </h1>
      <p className="mt-2 mb-6 text-sm text-dark-light">
        {t('auth.verifyEmail.error.subtitle')}
      </p>
      <Button href="/login" fullWidth>
        {t('auth.verifyEmail.error.goToLogin')}
      </Button>
      <Link
        href="/register"
        className="mt-4 text-sm font-semibold text-coral hover:text-coral-dark"
      >
        {t('auth.verifyEmail.error.createAccount')}
      </Link>
    </div>
  )
}
