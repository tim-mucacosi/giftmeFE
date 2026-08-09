export const ACCEPTED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp']


export const COVER_PRESETS = [
  { id: 'celebration', url: '/covers/celebration.svg' },
  { id: 'blossom', url: '/covers/blossom.svg' },
  { id: 'evening', url: '/covers/evening.svg' },
] as const

export function isCoverPreset(url: string | undefined): boolean {
  return !!url && COVER_PRESETS.some((p) => p.url === url)
}

export const FALLBACK_COVER_IMAGE_URL = '/covers/fallback.png'

/** Max size of the file the user may pick; Cloudinary handles resizing/compression server-side. */
export const MAX_UPLOAD_BYTES = 10 * 1024 * 1024

export function validateImageFile(file: File): 'type' | 'size' | null {
  if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) return 'type'
  if (file.size > MAX_UPLOAD_BYTES) return 'size'
  return null
}
