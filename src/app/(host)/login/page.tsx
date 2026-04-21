'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useTranslate } from '@tolgee/react'
import { Button } from '@/components/shared/Button'
import { Input } from '@/components/shared/Input'
import { useToast } from '@/components/shared/Toast'
import { GoogleAuthButton } from '@/components/shared/GoogleAuthButton'
import { loginSchema, type LoginSchema } from '@/lib/validations/authSchema'
import { loginUser } from '@/lib/api/auth'
import { saveSession } from '@/lib/auth/session'
import { AuthError } from '@/types/auth'

export default function LoginPage() {
  const { t } = useTranslate()
  const router = useRouter()
  const searchParams = useSearchParams()
  const next = searchParams.get('next') ?? '/dashboard'
  const toast = useToast()
  const [showPassword, setShowPassword] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<LoginSchema>({
    resolver: zodResolver(loginSchema),
    mode: 'onBlur',
    defaultValues: { email: '', password: '' },
  })

  const onSubmit = async (values: LoginSchema) => {
    setFormError(null)
    try {
      const response = await loginUser({
        email: values.email.trim(),
        password: values.password,
      })
      saveSession(response)
      toast.success(t('host.login.successToast'))
      router.push(next)
      router.refresh()
    } catch (err) {
      if (err instanceof AuthError) {
        if (err.fieldErrors) {
          for (const [field, message] of Object.entries(err.fieldErrors)) {
            if (field === 'email' || field === 'password') {
              setError(field, { type: 'server', message })
            }
          }
        }
        if (err.status === 401 || err.status === 400) {
          setFormError(t('auth.errors.invalidCredentials'))
          return
        }
        if (err.code === 'NETWORK') {
          setFormError(t('auth.errors.network'))
          return
        }
        setFormError(err.message || t('common.errors.generic'))
        return
      }
      setFormError(t('common.errors.generic'))
    }
  }

  return (
    <div className="flex min-h-[80vh] items-center justify-center px-4 py-12">
      <div className="w-full max-w-[420px] rounded-3xl bg-white p-7 shadow-card sm:p-8">
        <div className="mb-6 text-center">
          <div className="mb-2 text-4xl" aria-hidden="true">
            🎁
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight text-dark">
            {t('host.login.title')}
          </h1>
          <p className="mt-2 text-sm text-dark-light">{t('host.login.subtitle')}</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-4">
          <GoogleAuthButton onError={(msg) => setFormError(msg)} />

          <div className="flex items-center gap-3">
            <div className="h-px flex-1 bg-gray-light" />
            <span className="text-xs font-medium text-dark-light">{t('auth.google.orDivider', 'ili')}</span>
            <div className="h-px flex-1 bg-gray-light" />
          </div>

          <Input
            type="email"
            label={t('host.login.emailLabel')}
            placeholder={t('host.login.emailPlaceholder')}
            autoComplete="email"
            inputMode="email"
            aria-invalid={!!errors.email}
            error={errors.email?.message ? t(errors.email.message) : undefined}
            {...register('email')}
          />

          <div className="flex flex-col gap-1.5">
            <div className="flex items-baseline justify-between">
              <label htmlFor="login-password" className="text-sm font-semibold text-dark">
                {t('host.login.passwordLabel')}
              </label>
              <Link
                href="/forgot-password"
                className="text-xs font-semibold text-coral hover:text-coral-dark"
              >
                {t('host.login.forgotPassword')}
              </Link>
            </div>
            <div className="relative">
              <input
                id="login-password"
                type={showPassword ? 'text' : 'password'}
                placeholder={t('host.login.passwordPlaceholder')}
                autoComplete="current-password"
                aria-invalid={!!errors.password}
                className={`h-12 min-h-[48px] w-full rounded-xl border-2 bg-white px-4 pr-14 text-base text-dark transition-colors duration-200 placeholder:text-gray focus:border-coral focus:outline-none ${
                  errors.password ? 'border-coral' : 'border-gray-light'
                }`}
                {...register('password')}
              />
              <button
                type="button"
                onClick={() => setShowPassword((s) => !s)}
                aria-label={
                  showPassword
                    ? t('auth.register.hidePassword')
                    : t('auth.register.showPassword')
                }
                className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full px-3 py-1 text-xs font-semibold text-dark-light hover:text-coral"
              >
                {showPassword ? '🙈' : '👁'}
              </button>
            </div>
            {errors.password?.message ? (
              <p className="text-xs font-medium text-coral">{t(errors.password.message)}</p>
            ) : null}
          </div>

          {formError ? (
            <div
              role="alert"
              className="rounded-xl border border-coral/40 bg-coral/10 px-3 py-2 text-sm font-medium text-coral"
            >
              {formError}
            </div>
          ) : null}

          <Button type="submit" fullWidth loading={isSubmitting} disabled={isSubmitting}>
            {t('host.login.submit')}
          </Button>
        </form>

        <div className="mt-6 border-t border-gray-light pt-5 text-center text-sm text-dark-light">
          {t('auth.register.noAccount')}{' '}
          <Link href="/register" className="font-semibold text-coral hover:text-coral-dark">
            {t('auth.register.signUp')}
          </Link>
        </div>

        <div className="mt-4 text-center">
          <Link href="/" className="text-sm font-semibold text-dark-light hover:text-coral">
            ← {t('host.login.backToHome')}
          </Link>
        </div>
      </div>
    </div>
  )
}
