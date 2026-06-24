'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useTranslate } from '@tolgee/react'
import { Button } from '@/components/shared/Button'
import { useToast } from '@/components/shared/Toast'
import {
  changePasswordSchema,
  type ChangePasswordSchema,
} from '@/lib/validations/authSchema'
import { changePassword } from '@/lib/api/auth'
import { loadSession } from '@/lib/auth/session'
import { useCurrentUser } from '@/lib/auth/useCurrentUser'
import { AuthError } from '@/types/auth'

type FieldName = keyof ChangePasswordSchema

const FIELDS: Array<{
  name: FieldName
  labelKey: string
  labelFallback: string
  placeholderKey: string
  placeholderFallback: string
  autoComplete: string
}> = [
  {
    name: 'currentPassword',
    labelKey: 'auth.changePassword.currentLabel',
    labelFallback: 'Current password',
    placeholderKey: 'auth.changePassword.currentPlaceholder',
    placeholderFallback: 'Your current password',
    autoComplete: 'current-password',
  },
  {
    name: 'newPassword',
    labelKey: 'auth.changePassword.newLabel',
    labelFallback: 'New password',
    placeholderKey: 'auth.changePassword.newPlaceholder',
    placeholderFallback: 'At least 8 characters',
    autoComplete: 'new-password',
  },
  {
    name: 'confirmPassword',
    labelKey: 'auth.changePassword.confirmLabel',
    labelFallback: 'Confirm new password',
    placeholderKey: 'auth.changePassword.confirmPlaceholder',
    placeholderFallback: 'Repeat the new password',
    autoComplete: 'new-password',
  },
]

export default function ChangePasswordPage() {
  const { t } = useTranslate()
  const router = useRouter()
  const toast = useToast()
  const { user } = useCurrentUser()
  const [formError, setFormError] = useState<string | null>(null)
  const [visibleField, setVisibleField] = useState<FieldName | null>(null)

  // OAuth-only accounts (Google/Facebook) have no local password; the change-password
  // flow doesn't apply. Show a clear explainer instead of a form that can't succeed.
  const isOAuthOnly = !!user?.provider && user.provider !== 'local'

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<ChangePasswordSchema>({
    resolver: zodResolver(changePasswordSchema),
    mode: 'onBlur',
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
  })

  const onSubmit = async (values: ChangePasswordSchema) => {
    setFormError(null)
    const session = loadSession()
    if (!session?.accessToken) {
      router.push('/login?next=/settings/password')
      return
    }
    try {
      await changePassword(
        {
          currentPassword: values.currentPassword,
          newPassword: values.newPassword,
        },
        session.accessToken,
      )
      toast.success(t('auth.changePassword.successToast', 'Password updated'))
      router.push('/dashboard')
    } catch (err) {
      if (err instanceof AuthError) {
        if (err.status === 401) {
          setError('currentPassword', {
            type: 'server',
            message: 'auth.errors.currentPasswordWrong',
          })
          return
        }
        if (err.status === 409 && err.code === 'NO_LOCAL_PASSWORD') {
          setFormError(
            t(
              'auth.changePassword.oauthOnly',
              err.message ||
                "This account uses social sign-in. There is no password to change.",
            ),
          )
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

  if (isOAuthOnly) {
    const providerLabel =
      user?.provider === 'google'
        ? 'Google'
        : user?.provider === 'facebook'
        ? 'Facebook'
        : user?.provider === 'apple'
        ? 'Apple'
        : (user?.provider ?? 'social provider')
    return (
      <div className="mx-auto w-full max-w-[480px] px-4 py-10 sm:px-6">
        <div className="rounded-3xl bg-white p-7 text-center shadow-card sm:p-8">
          <div className="mb-3 text-5xl" aria-hidden="true">
            🔒
          </div>
          <h1 className="text-xl font-extrabold tracking-tight text-dark">
            {t('auth.changePassword.oauthTitle')}
          </h1>
          <p className="mt-2 text-sm text-dark-light">
            {t('auth.changePassword.oauthDesc')}
          </p>
          <Link
            href="/dashboard"
            className="mt-6 inline-flex h-11 items-center justify-center rounded-pill bg-coral px-5 text-sm font-semibold text-white hover:bg-coral-dark"
          >
            {t('nav.dashboard')}
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto w-full max-w-[480px] px-4 py-10 sm:px-6">
      <div className="rounded-3xl bg-white p-7 shadow-card sm:p-8">
        <div className="mb-6">
          <h1 className="text-2xl font-extrabold tracking-tight text-dark">
            {t('auth.changePassword.title')}
          </h1>
          <p className="mt-1.5 text-sm text-dark-light">
            {t('auth.changePassword.subtitle')}
          </p>
        </div>

        <form
          onSubmit={handleSubmit(onSubmit)}
          noValidate
          className="flex flex-col gap-4"
        >
          {FIELDS.map((field) => {
            const errorMsg = errors[field.name]?.message
            const isVisible = visibleField === field.name
            return (
              <div key={field.name} className="flex flex-col gap-1.5">
                <label
                  htmlFor={`pw-${field.name}`}
                  className="text-sm font-semibold text-dark"
                >
                  {t(field.labelKey)}
                </label>
                <div className="relative">
                  <input
                    id={`pw-${field.name}`}
                    type={isVisible ? 'text' : 'password'}
                    placeholder={t(field.placeholderKey)}
                    autoComplete={field.autoComplete}
                    aria-invalid={!!errorMsg}
                    className={`h-12 min-h-[48px] w-full rounded-xl border-2 bg-white px-4 pr-14 text-base text-dark transition-colors duration-200 placeholder:text-gray focus:border-coral focus:outline-none ${
                      errorMsg ? 'border-coral' : 'border-gray-light'
                    }`}
                    {...register(field.name)}
                  />
                  <button
                    type="button"
                    onClick={() =>
                      setVisibleField((current) =>
                        current === field.name ? null : field.name,
                      )
                    }
                    aria-label={
                      isVisible
                        ? t('auth.register.hidePassword')
                        : t('auth.register.showPassword')
                    }
                    className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full px-3 py-1 text-xs font-semibold text-dark-light hover:text-coral"
                  >
                    {isVisible ? '🙈' : '👁'}
                  </button>
                </div>
                {errorMsg ? (
                  <p className="text-xs font-medium text-coral">
                    {t(errorMsg)}
                  </p>
                ) : null}
              </div>
            )
          })}

          {formError ? (
            <div
              role="alert"
              className="rounded-xl border border-coral/40 bg-coral/10 px-3 py-2 text-sm font-medium text-coral"
            >
              {formError}
            </div>
          ) : null}

          <div className="mt-2 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <Link
              href="/dashboard"
              className="inline-flex h-12 items-center justify-center rounded-pill border-2 border-gray-light bg-white px-6 text-sm font-semibold text-dark transition-colors hover:border-coral hover:text-coral"
            >
              {t('common.buttons.cancel')}
            </Link>
            <Button
              type="submit"
              loading={isSubmitting}
              disabled={isSubmitting}
            >
              {t('auth.changePassword.submit')}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
