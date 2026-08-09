'use client'

import { useCallback, useState } from 'react'
import Cropper, { type Area } from 'react-easy-crop'
import 'react-easy-crop/react-easy-crop.css'
import { useTranslate } from '@tolgee/react'
import { Modal } from '@/components/shared/Modal'
import { Button } from '@/components/shared/Button'
import { cropImageToFile } from '@/lib/utils/cropImage'

// Matches the OG share image canvas so the region the host frames here is
// what actually shows up when the link is shared.
const COVER_ASPECT = 1200 / 630

interface Props {
  imageSrc: string
  onCancel: () => void
  onApply: (file: File, previewUrl: string) => void
}

export function ImageCropModal({ imageSrc, onCancel, onApply }: Props) {
  const { t } = useTranslate()
  const [crop, setCrop] = useState({ x: 0, y: 0 })
  const [zoom, setZoom] = useState(1)
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null)
  const [saving, setSaving] = useState(false)

  const onCropComplete = useCallback((_area: Area, pixels: Area) => {
    setCroppedAreaPixels(pixels)
  }, [])

  const apply = async () => {
    if (!croppedAreaPixels) return
    setSaving(true)
    try {
      const file = await cropImageToFile(imageSrc, croppedAreaPixels, 'cover.jpg')
      onApply(file, URL.createObjectURL(file))
    } finally {
      setSaving(false)
    }
  }

  return (
    <Modal open onClose={onCancel} title={t('host.create.step1.cropTitle')}>
      <div className="flex flex-col gap-4">
        <div className="relative h-72 w-full overflow-hidden rounded-xl bg-dark sm:h-96">
          <Cropper
            image={imageSrc}
            crop={crop}
            zoom={zoom}
            aspect={COVER_ASPECT}
            onCropChange={setCrop}
            onZoomChange={setZoom}
            onCropComplete={onCropComplete}
          />
        </div>

        <div className="flex items-center gap-3">
          <span aria-hidden="true">🔍</span>
          <input
            type="range"
            min={1}
            max={3}
            step={0.01}
            value={zoom}
            onChange={(e) => setZoom(Number(e.target.value))}
            aria-label={t('host.create.step1.cropZoomLabel')}
            className="w-full accent-coral"
          />
        </div>

        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <Button type="button" variant="outline" onClick={onCancel} disabled={saving}>
            {t('common.buttons.cancel')}
          </Button>
          <Button type="button" onClick={apply} loading={saving}>
            {t('host.create.step1.cropApply')}
          </Button>
        </div>
      </div>
    </Modal>
  )
}
