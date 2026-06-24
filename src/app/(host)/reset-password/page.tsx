'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useTranslate } from '@tolgee/react'
import { Button } from '@/components/shared/Button'
import { Input } from '@/components/shared/Input'
import {
  resetPasswordSchema,
  type ResetPasswordSchema,
} from '@/lib/validations/authSchema'
import { resetPassword } from '@/lib/api/auth'
import { AuthError } from '@/types/auth'

export default function ResetPasswordPage() {
  const { t } = useTranslate()
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams.get('passwordResetToken')

  const [resetSuccess, setResetSuccess] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    watch,
  } = useForm<ResetPasswordSchema>({
    resolver: zodResolver(resetPasswordSchema),
    mode: 'onBlur',
    defaultValues: { password: '', confirmPassword: '' },
  })

  const password = watch('password')

  const onSubmit = async (values: ResetPasswordSchema) => {
    if (!token) {
      setFormError(t('auth.resetPassword.invalidToken'))
      return
    }

    setFormError(null)
    try {
      await resetPassword(token, values.password)
      setResetSuccess(true)
      setTimeout(() => {
        router.push('/login')
      }, 2000)
    } catch (err) {
      const message =
        err instanceof AuthError ? err.message : t('common.errors.generic')
      setFormError(message)
    }
  }

  if (!token) {
    return (
      <div className="flex min-h-[80vh] items-center justify-center px-4 py-12">
        <div className="w-full max-w-[420px] rounded-3xl bg-white p-7 shadow-card sm:p-8">
          <div className="text-center">
            <div className="mb-3 text-5xl" aria-hidden="true">
              ⚠️
            </div>
            <h1 className="mb-2 text-2xl font-extrabold tracking-tight text-dark">
              {t('auth.resetPassword.invalidTokenTitle')}
            </h1>
            <p className="mb-6 text-sm text-dark-light">
              {t(
                'auth.resetPassword.invalidTokenDesc'
              )}
            </p>
            <Link
              href="/forgot-password"
              className="inline-flex h-12 items-center justify-center rounded-full bg-coral px-6 text-sm font-semibold text-white hover:bg-coral-dark"
            >
              {t('auth.resetPassword.requestNew')}
            </Link>
          </div>
        </div>
      </div>
    )
  }

  if (resetSuccess) {
    return (
      <div className="flex min-h-[80vh] items-center justify-center px-4 py-12">
        <div className="w-full max-w-[420px] rounded-3xl bg-white p-7 shadow-card sm:p-8">
          <div className="text-center">
            <div className="mb-3 text-5xl" aria-hidden="true">
              ✅
            </div>
            <h1 className="mb-2 text-2xl font-extrabold tracking-tight text-dark">
              {t('auth.resetPassword.successTitle')}
            </h1>
            <p className="mb-6 text-sm text-dark-light">
              {t('auth.resetPassword.successDesc')}
            </p>
            <Link
              href="/login"
              className="inline-flex h-12 items-center justify-center rounded-full bg-coral px-6 text-sm font-semibold text-white hover:bg-coral-dark"
            >
              {t('auth.resetPassword.goToLogin')}
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-[80vh] items-center justify-center px-4 py-12">
      <div className="w-full max-w-[420px] rounded-3xl bg-white p-7 shadow-card sm:p-8">
        <div className="mb-6 text-center">
          <div className="mb-2 text-4xl" aria-hidden="true">
            🔐
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight text-dark">
            {t('auth.resetPassword.title')}
          </h1>
          <p className="mt-2 text-sm text-dark-light">
            {t('auth.resetPassword.subtitle')}
          </p>
        </div>

        <form
          onSubmit={handleSubmit(onSubmit)}
          noValidate
          className="flex flex-col gap-4"
        >
          <Input
            type="password"
            label={t('auth.resetPassword.passwordLabel')}
            placeholder={t('auth.resetPassword.passwordPlaceholder')}
            autoComplete="new-password"
            aria-invalid={!!errors.password}
            error={
              errors.password?.message
                ? t(errors.password.message)
                : undefined
            }
            {...register('password')}
          />

          <Input
            type="password"
            label={t('auth.resetPassword.confirmPasswordLabel')}
            placeholder={t('auth.resetPassword.confirmPasswordPlaceholder')}
            autoComplete="new-password"
            aria-invalid={!!errors.confirmPassword}
            error={
              errors.confirmPassword?.message
                ? t(errors.confirmPassword.message)
                : undefined
            }
            {...register('confirmPassword')}
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
            {t('auth.resetPassword.submit')}
          </Button>
        </form>

        <div className="mt-6 text-center">
          <Link
            href="/login"
            className="text-sm font-semibold text-dark-light hover:text-coral"
          >
            ← {t('auth.resetPassword.backToLogin')}
          </Link>
        </div>
      </div>
    </div>
  )
}
