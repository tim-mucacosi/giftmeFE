'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useTranslate } from '@tolgee/react'
import { Button } from '@/components/shared/Button'
import { Input } from '@/components/shared/Input'
import {
  forgotPasswordSchema,
  type ForgotPasswordSchema,
} from '@/lib/validations/authSchema'
import { requestPasswordReset } from '@/lib/api/auth'
import { AuthError } from '@/types/auth'

export default function ForgotPasswordPage() {
  const { t } = useTranslate()
  const [submittedEmail, setSubmittedEmail] = useState<string | null>(null)
  const [formError, setFormError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordSchema>({
    resolver: zodResolver(forgotPasswordSchema),
    mode: 'onBlur',
    defaultValues: { email: '' },
  })

  const onSubmit = async (values: ForgotPasswordSchema) => {
    setFormError(null)
    try {
      const email = values.email.trim()
      await requestPasswordReset(email)
      setSubmittedEmail(email)
    } catch (err) {
      const message =
        err instanceof AuthError ? err.message : t('common.errors.generic')
      setFormError(message)
    }
  }

  const tryAnother = () => {
    setSubmittedEmail(null)
    reset({ email: '' })
  }

  return (
    <div className="flex min-h-[80vh] items-center justify-center px-4 py-12">
      <div className="w-full max-w-[420px] rounded-3xl bg-white p-7 shadow-card sm:p-8">
        {submittedEmail ? (
          <SuccessView email={submittedEmail} onTryAnother={tryAnother} />
        ) : (
          <>
            <div className="mb-6 text-center">
              <div className="mb-2 text-4xl" aria-hidden="true">
                🔑
              </div>
              <h1 className="text-2xl font-extrabold tracking-tight text-dark">
                {t('auth.forgotPassword.title')}
              </h1>
              <p className="mt-2 text-sm text-dark-light">
                {t('auth.forgotPassword.subtitle')}
              </p>
            </div>

            <form
              onSubmit={handleSubmit(onSubmit)}
              noValidate
              className="flex flex-col gap-4"
            >
              <Input
                type="email"
                label={t('auth.forgotPassword.emailLabel')}
                placeholder={t('auth.forgotPassword.emailPlaceholder')}
                autoComplete="email"
                inputMode="email"
                aria-invalid={!!errors.email}
                error={
                  errors.email?.message
                    ? t(errors.email.message)
                    : undefined
                }
                {...register('email')}
              />

              {formError ? (
                <div
                  role="alert"
                  className="rounded-xl border border-coral/40 bg-coral/10 px-3 py-2 text-sm font-medium text-coral"
                >
                  {formError}
                </div>
              ) : null}

              <Button
                type="submit"
                fullWidth
                loading={isSubmitting}
                disabled={isSubmitting}
              >
                {t('auth.forgotPassword.submit')}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <Link
                href="/login"
                className="text-sm font-semibold text-dark-light hover:text-coral"
              >
                ← {t('auth.forgotPassword.backToLogin')}
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

function SuccessView({
  email,
  onTryAnother,
}: {
  email: string
  onTryAnother: () => void
}) {
  const { t } = useTranslate()
  return (
    <div className="text-center">
      <div className="mb-3 text-5xl" aria-hidden="true">
        📬
      </div>
      <h1 className="mb-2 text-2xl font-extrabold tracking-tight text-dark">
        {t('auth.forgotPassword.successTitle')}
      </h1>
      <p className="mb-2 text-sm text-dark-light">
        {t('auth.forgotPassword.successDesc')}
      </p>
      <p className="mb-6 text-sm font-semibold text-dark">{email}</p>

      <div
        className="mb-6 rounded-xl border border-gold/40 bg-gold/10 px-3 py-2 text-left text-xs text-dark-light"
        role="note"
      >
        <span className="mr-1" aria-hidden="true">
          ⚠️
        </span>
        {t('auth.forgotPassword.comingSoonNotice')}
      </div>

      <div className="flex flex-col gap-3">
        <Link
          href="/login"
          className="inline-flex h-12 items-center justify-center rounded-pill bg-coral px-6 text-sm font-semibold text-white hover:bg-coral-dark"
        >
          {t('auth.forgotPassword.backToLogin')}
        </Link>
        <button
          type="button"
          onClick={onTryAnother}
          className="text-sm font-semibold text-dark-light hover:text-coral"
        >
          {t('auth.forgotPassword.tryAnotherEmail')}
        </button>
      </div>
    </div>
  )
}
