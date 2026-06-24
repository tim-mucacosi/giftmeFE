'use client'

import { useTranslate } from '@tolgee/react'
import { Input } from '@/components/shared/Input'
import { Textarea } from '@/components/shared/Textarea'
import { Button } from '@/components/shared/Button'
import { cn } from '@/lib/utils/cn'
import type { EventType, EventGender } from '@/types/event'

export interface EventDetailsData {
  type: EventType
  gender?: EventGender
  name: string
  date: string
  message: string
  backgroundImageUrl?: string
}

const TYPES: { key: EventType; icon: string }[] = [
  { key: 'wedding', icon: '💒' },
  { key: 'birthday', icon: '🎂' },
  { key: 'baptism', icon: '👶' },
  { key: 'patrons_day', icon: '🕯️' },
  { key: 'other', icon: '✨' },
]

interface Props {
  value: EventDetailsData
  onChange: (v: EventDetailsData) => void
  onImageFileChange?: (file: File | undefined) => void
  onNext: () => void
  errors?: Partial<Record<keyof EventDetailsData, string>>
}

export function EventDetailsStep({ value, onChange, onImageFileChange, onNext, errors }: Props) {
  const { t } = useTranslate()

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-2xl font-extrabold tracking-tight text-dark sm:text-3xl">
          {t('host.create.step1.title')}
        </h2>
      </div>

      <div className="flex flex-col gap-3">
        <label className="text-sm font-semibold text-dark">
          {t('host.create.step1.typeLabel')}
        </label>
        <div className="flex flex-wrap gap-2">
          {TYPES.map((tp) => (
            <button
              key={tp.key}
              type="button"
              onClick={() => onChange({ ...value, type: tp.key })}
              className={cn(
                'inline-flex min-h-[44px] items-center gap-2 rounded-full border-2 px-4 py-2 text-sm font-semibold transition-all',
                value.type === tp.key
                  ? 'border-coral bg-coral text-white shadow-cta'
                  : 'border-gray-light bg-white text-dark hover:border-coral hover:text-coral',
              )}
            >
              <span aria-hidden="true">{tp.icon}</span>
              {t(`host.create.step1.types.${tp.key}`)}
            </button>
          ))}
        </div>
      </div>

      {(value.type === 'birthday' || value.type === 'baptism') && (
        <div className="flex flex-col gap-3">
          <label className="text-sm font-semibold text-dark">
            {t('host.create.step1.genderLabel')}
          </label>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => onChange({ ...value, gender: 'boy' })}
              className={cn(
                'flex-1 inline-flex min-h-[44px] items-center justify-center gap-2 rounded-full border-2 px-4 py-2 text-sm font-semibold transition-all',
                value.gender === 'boy'
                  ? 'border-blue-400 bg-blue-50 text-blue-600 shadow-sm'
                  : 'border-gray-light bg-white text-dark hover:border-blue-400 hover:text-blue-600',
              )}
            >
              <span aria-hidden="true">👦</span>
              {t('host.create.step1.genderBoy')}
            </button>
            <button
              type="button"
              onClick={() => onChange({ ...value, gender: 'girl' })}
              className={cn(
                'flex-1 inline-flex min-h-[44px] items-center justify-center gap-2 rounded-full border-2 px-4 py-2 text-sm font-semibold transition-all',
                value.gender === 'girl'
                  ? 'border-pink-300 bg-pink-50 text-pink-600 shadow-sm'
                  : 'border-gray-light bg-white text-dark hover:border-pink-300 hover:text-pink-600',
              )}
            >
              <span aria-hidden="true">👧</span>
              {t('host.create.step1.genderGirl')}
            </button>
          </div>
        </div>
      )}

      <Input
        label={t('host.create.step1.nameLabel')}
        placeholder={t('host.create.step1.namePlaceholder')}
        value={value.name}
        onChange={(e) => onChange({ ...value, name: e.target.value })}
        error={errors?.name}
      />

      <Input
        type="date"
        label={t('host.create.step1.dateLabel')}
        value={value.date}
        onChange={(e) => onChange({ ...value, date: e.target.value })}
        error={errors?.date}
      />

      <Textarea
        label={t('host.create.step1.messageLabel')}
        placeholder={t('host.create.step1.messagePlaceholder')}
        value={value.message}
        onChange={(e) => onChange({ ...value, message: e.target.value })}
        rows={4}
      />

      <div className="flex flex-col gap-2">
        <label className="text-sm font-semibold text-dark">
          {t('host.create.step1.imageLabel')}
        </label>
        <label
          htmlFor="bg-image"
          className="relative flex min-h-[200px] max-h-[300px] cursor-pointer overflow-hidden rounded-xl border-2 border-dashed border-gray-light bg-white transition-colors hover:border-coral hover:bg-coral/5"
        >
          {value.backgroundImageUrl ? (
            <img
              src={value.backgroundImageUrl}
              alt="Preview"
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex w-full flex-col items-center justify-center gap-2 p-6 text-center">
              <span className="text-3xl" aria-hidden="true">
                📷
              </span>
              <span className="text-sm text-dark-light">{t('host.create.step1.imageHint')}</span>
            </div>
          )}
          <input
            id="bg-image"
            type="file"
            accept="image/*"
            className="sr-only"
            onChange={(e) => {
              const file = e.target.files?.[0]
              if (!file) return
              const url = URL.createObjectURL(file)
              onChange({ ...value, backgroundImageUrl: url })
              onImageFileChange?.(file)
            }}
          />
        </label>
      </div>

      <div className="flex justify-end">
        <Button onClick={onNext} size="md" fullWidth className="sm:w-auto">
          {t('common.buttons.next')} →
        </Button>
      </div>
    </div>
  )
}
