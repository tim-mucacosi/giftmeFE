'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { T, useTranslate } from '@tolgee/react'
import { Button } from '@/components/shared/Button'
import { Input } from '@/components/shared/Input'
import { useToast } from '@/components/shared/Toast'
import { GoogleAuthButton } from '@/components/shared/GoogleAuthButton'
import { registerSchema, type RegisterSchema } from '@/lib/validations/authSchema'
import { registerUser, resendVerificationEmail } from '@/lib/api/auth'
import { RETURN_TO_PARAM, safeReturnTo, withReturnTo } from '@/lib/auth/returnTo'
import { AuthError } from '@/types/auth'

export default function RegisterPage() {
  const { t } = useTranslate()
  const router = useRouter()
  const searchParams = useSearchParams()
  const next = safeReturnTo(searchParams.get(RETURN_TO_PARAM))
  const toast = useToast()
  const [showPassword, setShowPassword] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)
  // Set once the account exists and is awaiting email verification.
  const [pendingEmail, setPendingEmail] = useState<string | null>(null)
  const [emailSent, setEmailSent] = useState(true)
  const [resending, setResending] = useState(false)

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<RegisterSchema>({
    resolver: zodResolver(registerSchema),
    mode: 'onBlur',
    // acceptedTerms starts false: consent must be given, never assumed.
    defaultValues: { name: '', email: '', password: '', acceptedTerms: false },
  })

  const onSubmit = async (values: RegisterSchema) => {
    setFormError(null)
    try {
      const email = values.email.trim()
      const response = await registerUser({
        name: values.name.trim(),
        email,
        password: values.password,
        acceptedTerms: values.acceptedTerms,
      })
      if (!response.requiresVerification) {
        // No mail provider configured: the account is usable right away.
        toast.success(t('auth.register.successNoVerification'))
        router.push(withReturnTo('/login', next))
        return
      }
      // Registration does not sign the user in; the emailed link must be
      // followed first, so show what to do next instead of a dashboard.
      setPendingEmail(email)
      setEmailSent(response.emailSent)
    } catch (err) {
      if (err instanceof AuthError) {
        if (err.fieldErrors) {
          for (const [field, message] of Object.entries(err.fieldErrors)) {
            setError(field as keyof RegisterSchema, { type: 'server', message })
          }
        }
        // Older backends answered 400 for a duplicate address.
        if (err.status === 409 || err.code === 'EMAIL_IN_USE') {
          setError('email', { type: 'server', message: 'auth.errors.emailInUse' })
          return
        }
        if (err.code === 'TERMS_NOT_ACCEPTED') {
          setError('acceptedTerms', { type: 'server', message: 'auth.errors.termsRequired' })
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

  const resend = async () => {
    if (!pendingEmail || resending) return
    setResending(true)
    try {
      await resendVerificationEmail(pendingEmail)
      setEmailSent(true)
      toast.success(t('auth.register.verifyPending.resent'))
    } catch (err) {
      const message =
        err instanceof AuthError && err.code === 'NETWORK'
          ? t('auth.errors.network')
          : t('common.errors.generic')
      toast.error(message)
    } finally {
      setResending(false)
    }
  }

  if (pendingEmail) {
    return (
      <div className="flex min-h-[80vh] items-center justify-center px-4 py-12">
        <div className="w-full max-w-[420px] rounded-3xl bg-white p-7 text-center shadow-card sm:p-8">
          <div className="mb-2 text-4xl" aria-hidden="true">
            📬
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight text-dark">
            {t('auth.register.verifyPending.title')}
          </h1>
          <p className="mt-2 text-sm text-dark-light">
            {t('auth.register.verifyPending.desc')}
          </p>
          <p className="mt-3 break-all rounded-xl bg-bg px-3 py-2 text-sm font-semibold text-dark">
            {pendingEmail}
          </p>

          {!emailSent ? (
            <div
              role="alert"
              className="mt-4 rounded-xl border border-coral/40 bg-coral/10 px-3 py-2 text-sm font-medium text-coral"
            >
              {t('auth.register.verifyPending.sendFailed')}
            </div>
          ) : null}

          <p className="mt-4 text-xs text-dark-light">
            {t('auth.register.verifyPending.spamHint')}
          </p>

          <div className="mt-6 flex flex-col gap-2">
            <Button type="button" variant="outline" onClick={resend} loading={resending} fullWidth>
              {t('auth.register.verifyPending.resend')}
            </Button>
            <Button href={withReturnTo('/login', next)} fullWidth>
              {t('nav.login')}
            </Button>
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
            🎁
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight text-dark">
            {t('auth.register.title')}
          </h1>
          <p className="mt-2 text-sm text-dark-light">{t('auth.register.subtitle')}</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-4">
          <GoogleAuthButton mode="signup" next={next} onError={(msg) => setFormError(msg)} />

          <div className="flex items-center gap-3">
            <div className="h-px flex-1 bg-gray-light" />
            <span className="text-xs font-medium text-dark-light">{t('auth.google.orDivider')}</span>
            <div className="h-px flex-1 bg-gray-light" />
          </div>

          <Input
            type="text"
            label={t('auth.register.nameLabel')}
            placeholder={t('auth.register.namePlaceholder')}
            autoComplete="name"
            autoCapitalize="words"
            aria-invalid={!!errors.name}
            error={errors.name?.message ? t(errors.name.message) : undefined}
            {...register('name')}
          />

          <Input
            type="email"
            label={t('auth.register.emailLabel')}
            placeholder={t('auth.register.emailPlaceholder')}
            autoComplete="email"
            inputMode="email"
            aria-invalid={!!errors.email}
            error={errors.email?.message ? t(errors.email.message) : undefined}
            {...register('email')}
          />

          <div className="flex flex-col gap-1.5">
            <label htmlFor="register-password" className="text-sm font-semibold text-dark">
              {t('auth.register.passwordLabel')}
            </label>
            <div className="relative">
              <input
                id="register-password"
                type={showPassword ? 'text' : 'password'}
                placeholder={t('auth.register.passwordPlaceholder')}
                autoComplete="new-password"
                aria-invalid={!!errors.password}
                aria-describedby="register-password-hint"
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
            ) : (
              <p id="register-password-hint" className="text-xs text-dark-light">
                {t('auth.register.passwordHint')}
              </p>
            )}
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="accept-terms" className="flex cursor-pointer items-start gap-2.5">
              <input
                id="accept-terms"
                type="checkbox"
                aria-invalid={!!errors.acceptedTerms}
                aria-describedby={errors.acceptedTerms ? 'accept-terms-error' : undefined}
                className="mt-0.5 h-5 w-5 shrink-0 accent-coral focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-coral focus-visible:ring-offset-2"
                {...register('acceptedTerms')}
              />
              <span className="text-sm text-dark">
                {/* One sentence per language: translators keep the wording and
                    the link positions, which differ by grammar. */}
                <T
                  keyName="auth.register.terms"
                  params={{
                    terms: (
                      <Link
                        href="/terms"
                        target="_blank"
                        // Inside the label, so a click would otherwise also
                        // toggle the checkbox.
                        onClick={(e) => e.stopPropagation()}
                        className="font-semibold text-coral underline underline-offset-2 hover:text-coral-dark"
                      />
                    ),
                    privacy: (
                      <Link
                        href="/privacy"
                        target="_blank"
                        onClick={(e) => e.stopPropagation()}
                        className="font-semibold text-coral underline underline-offset-2 hover:text-coral-dark"
                      />
                    ),
                  }}
                />
              </span>
            </label>
            {errors.acceptedTerms?.message ? (
              <p
                id="accept-terms-error"
                role="alert"
                className="text-xs font-medium text-coral"
              >
                {t(errors.acceptedTerms.message)}
              </p>
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
            {t('auth.register.submit')}
          </Button>
        </form>

        <div className="mt-6 border-t border-gray-light pt-5 text-center text-sm text-dark-light">
          {t('auth.register.haveAccount')}{' '}
          <Link
            href={withReturnTo('/login', next)}
            className="font-semibold text-coral hover:text-coral-dark"
          >
            {t('auth.register.signIn')}
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
