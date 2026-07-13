export async function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      const result = reader.result as string
      resolve(result)
    }
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

export const ACCEPTED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
/** Max size of the file the user may pick (before compression). */
export const MAX_UPLOAD_BYTES = 10 * 1024 * 1024

export function validateImageFile(file: File): 'type' | 'size' | null {
  if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) return 'type'
  if (file.size > MAX_UPLOAD_BYTES) return 'size'
  return null
}

/**
 * Downscale + re-encode a cover image so the resulting data URL stays under
 * the backend's payload cap (~600KB). Falls back to the raw file when the
 * canvas API is unavailable (very old browsers).
 */
export async function compressImageToDataUrl(
  file: File,
  { maxDimension = 1600, targetBytes = 600_000 } = {},
): Promise<string> {
  if (typeof document === 'undefined') return fileToBase64(file)

  const dataUrl = await fileToBase64(file)
  const img = await new Promise<HTMLImageElement>((resolve, reject) => {
    const el = new Image()
    el.onload = () => resolve(el)
    el.onerror = reject
    el.src = dataUrl
  }).catch(() => null)
  if (!img) return dataUrl

  const scale = Math.min(1, maxDimension / Math.max(img.width, img.height))
  const canvas = document.createElement('canvas')
  canvas.width = Math.max(1, Math.round(img.width * scale))
  canvas.height = Math.max(1, Math.round(img.height * scale))
  const ctx = canvas.getContext('2d')
  if (!ctx) return dataUrl
  ctx.drawImage(img, 0, 0, canvas.width, canvas.height)

  // Step quality down until the payload fits.
  for (const quality of [0.85, 0.7, 0.55, 0.4]) {
    const out = canvas.toDataURL('image/jpeg', quality)
    if (out.length <= targetBytes) return out
  }
  return canvas.toDataURL('image/jpeg', 0.3)
}
