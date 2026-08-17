'use client'

import { useRef, useState } from 'react'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useTranslate } from '@tolgee/react'
import { Button } from '@/components/shared/Button'
import { Input } from '@/components/shared/Input'
import { Select } from '@/components/shared/Select'
import { Textarea } from '@/components/shared/Textarea'
import { sendContactMessage } from '@/lib/api/contact'
import {
  CONTACT_MESSAGE_MAX,
  CONTACT_TYPES,
  contactSchema,
  type ContactFormValues,
  type ContactType,
} from '@/lib/validations/contactSchema'

export function ContactForm() {
  const { t } = useTranslate()
  // Set once the backend confirms delivery; picks the thank-you copy.
  const [sentType, setSentType] = useState<ContactType | null>(null)
  const [formError, setFormError] = useState<string | null>(null)
  // Also blocks a submit fired while the first request is in flight.
  const submittingRef = useRef(false)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ContactFormValues>({
    resolver: zodResolver(contactSchema),
    mode: 'onBlur',
    defaultValues: { email: '', type: '', message: '' },
  })

  const onSubmit = async (values: ContactFormValues) => {
    if (submittingRef.current) return
    submittingRef.current = true
    setFormError(null)
    // Resolver only lets the two supported types through.
    const type = values.type as ContactType
    try {
      await sendContactMessage({
        email: values.email.trim(),
        type,
        message: values.message.trim(),
      })
      setSentType(type)
    } catch {
      // Values stay in the form so the user can send again.
      setFormError(t('contact.errors.sendFailed'))
    } finally {
      submittingRef.current = false
    }
  }

  if (sentType) return <SuccessView type={sentType} />

  return (
    <>
      <p className="mt-4 text-base leading-relaxed text-dark">{t('contact.intro')}</p>

      <form
        onSubmit={handleSubmit(onSubmit)}
        noValidate
        className="mt-8 flex flex-col gap-4 rounded-3xl bg-white p-6 shadow-card sm:p-8"
      >
        <Input
          type="email"
          label={t('contact.emailLabel')}
          placeholder={t('contact.emailPlaceholder')}
          autoComplete="email"
          inputMode="email"
          aria-invalid={!!errors.email}
          error={errors.email?.message ? t(errors.email.message) : undefined}
          {...register('email')}
        />

        <Select
          label={t('contact.typeLabel')}
          defaultValue=""
          aria-invalid={!!errors.type}
          error={errors.type?.message ? t(errors.type.message) : undefined}
          {...register('type')}
        >
          <option value="" disabled>
            {t('contact.typePlaceholder')}
          </option>
          {CONTACT_TYPES.map((type) => (
            <option key={type} value={type}>
              {t(`contact.types.${type}`)}
            </option>
          ))}
        </Select>

        <Textarea
          label={t('contact.messageLabel')}
          placeholder={t('contact.messagePlaceholder')}
          rows={6}
          maxLength={CONTACT_MESSAGE_MAX}
          aria-invalid={!!errors.message}
          error={errors.message?.message ? t(errors.message.message) : undefined}
          {...register('message')}
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
          size="lg"
          fullWidth
          loading={isSubmitting}
          disabled={isSubmitting}
          className="sm:w-auto sm:self-end"
        >
          {t('contact.submit')}
        </Button>
      </form>
    </>
  )
}

function SuccessView({ type }: { type: ContactType }) {
  const { t } = useTranslate()
  return (
    <div className="mt-8 flex flex-col items-center gap-3 rounded-3xl bg-white p-8 text-center shadow-card sm:p-10">
      <span className="text-5xl" aria-hidden="true">
        💌
      </span>
      <h2 className="text-2xl font-extrabold tracking-tight text-dark">
        {t(`contact.success.${type}.title`)}
      </h2>
      <p className="max-w-md text-base leading-relaxed text-dark-light">
        {t(`contact.success.${type}.desc`)}
      </p>
      <Link
        href="/"
        className="mt-2 inline-flex h-12 items-center justify-center rounded-pill bg-coral px-6 text-sm font-semibold text-white transition-colors hover:bg-coral-dark"
      >
        {t('contact.success.home')}
      </Link>
    </div>
  )
}
