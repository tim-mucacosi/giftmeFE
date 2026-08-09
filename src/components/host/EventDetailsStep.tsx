'use client'

import { useMemo, useRef, useState } from 'react'
import { useTranslate } from '@tolgee/react'
import { Input } from '@/components/shared/Input'
import { DatePicker } from '@/components/shared/DatePicker'
import { Textarea } from '@/components/shared/Textarea'
import { Button } from '@/components/shared/Button'
import { ImageCropModal } from './ImageCropModal'
import { ACCEPTED_IMAGE_TYPES, COVER_PRESETS, validateImageFile } from '@/lib/utils/imageUpload'
import { todayIsoDate } from '@/lib/validations/eventSchema'
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
  { key: 'baby_shower', icon: '🍼' },
  { key: 'anniversary', icon: '💞' },
  { key: 'house_warming', icon: '🏡' },
  { key: 'graduation', icon: '🎓' },
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
  const [imageError, setImageError] = useState<string | null>(null)
  // Object URL of a just-picked file, pending crop confirmation.
  const [cropSrc, setCropSrc] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  // Picker floor; manual entry and restored state are re-checked on submit.
  const minDate = useMemo(() => todayIsoDate(), [])

  const closeCrop = () => {
    if (cropSrc) URL.revokeObjectURL(cropSrc)
    setCropSrc(null)
    // Allows re picking the same file (browsers dont fire onChange again
    // for an unchanged selection unless the input is cleared first).
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

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

      <Input
        label={t('host.create.step1.nameLabel')}
        placeholder={t('host.create.step1.namePlaceholder')}
        value={value.name}
        onChange={(e) => onChange({ ...value, name: e.target.value })}
        error={errors?.name}
      />

      <DatePicker
        label={t('host.create.step1.dateLabel')}
        min={minDate}
        value={value.date}
        onChange={(iso) => onChange({ ...value, date: iso })}
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

        <div className="grid grid-cols-3 gap-2" role="group" aria-label={t('host.create.step1.presetsLabel')}>
          {COVER_PRESETS.map((preset) => {
            const selected = value.backgroundImageUrl === preset.url
            return (
              <button
                key={preset.id}
                type="button"
                aria-pressed={selected}
                onClick={() => {
                  onChange({ ...value, backgroundImageUrl: preset.url })
                  onImageFileChange?.(undefined)
                  setImageError(null)
                }}
                className={cn(
                  'relative h-20 overflow-hidden rounded-xl border-2 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-coral focus-visible:ring-offset-2 sm:h-24',
                  selected ? 'border-coral shadow-cta' : 'border-gray-light hover:border-coral/60',
                )}
              >
                {/* Static bundled asset; next/image adds no value here. */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={preset.url}
                  alt={t(`host.create.step1.presets.${preset.id}`)}
                  className="h-full w-full object-cover"
                />
                {selected ? (
                  <span className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-coral text-[11px] font-bold text-white">
                    ✓
                  </span>
                ) : null}
              </button>
            )
          })}
        </div>

        <p className="text-xs text-dark-light">{t('host.create.step1.presetsOr')}</p>

        <label
          htmlFor="bg-image"
          className="relative flex min-h-[200px] max-h-[300px] cursor-pointer overflow-hidden rounded-xl border-2 border-dashed border-gray-light bg-white transition-colors hover:border-coral hover:bg-coral/5"
        >
          {value.backgroundImageUrl ? (
            // Local blob/data-URL preview; next/image cannot optimize these.
            // eslint-disable-next-line @next/next/no-img-element
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
            ref={fileInputRef}
            type="file"
            // Limits the OS picker to the formats the backend accepts;
            // validateImageFile re-checks in case the dialog is bypassed.
            accept={ACCEPTED_IMAGE_TYPES.join(',')}
            className="sr-only"
            onChange={(e) => {
              const file = e.target.files?.[0]
              if (!file) return
              const problem = validateImageFile(file)
              if (problem) {
                setImageError(
                  problem === 'type'
                    ? t('host.create.step1.imageErrorType')
                    : t('host.create.step1.imageErrorSize'),
                )
                e.target.value = ''
                return
              }
              setImageError(null)
              // Cropping happens before the file is accepted; onChange/
              // onImageFileChange only fire once the host confirms the crop.
              setCropSrc(URL.createObjectURL(file))
            }}
          />
        </label>
        {imageError ? (
          <p className="text-sm font-medium text-coral" role="alert">
            {imageError}
          </p>
        ) : null}
        {value.backgroundImageUrl ? (
          <button
            type="button"
            onClick={() => {
              onChange({ ...value, backgroundImageUrl: undefined })
              onImageFileChange?.(undefined)
              setImageError(null)
            }}
            className="self-start rounded-full border-2 border-gray-light px-3 py-1 text-xs font-semibold text-dark-light transition-colors hover:border-coral hover:text-coral"
          >
            🗑 {t('host.create.step1.imageRemove')}
          </button>
        ) : null}
      </div>

      <div className="flex justify-end">
        <Button onClick={onNext} size="md" fullWidth className="sm:w-auto">
          {t('common.buttons.next')} →
        </Button>
      </div>

      {cropSrc ? (
        <ImageCropModal
          imageSrc={cropSrc}
          onCancel={closeCrop}
          onApply={(file, previewUrl) => {
            closeCrop()
            onChange({ ...value, backgroundImageUrl: previewUrl })
            onImageFileChange?.(file)
          }}
        />
      ) : null}
    </div>
  )
}
