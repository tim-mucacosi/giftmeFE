/**
 * Origin of this deployment: `NEXT_PUBLIC_APP_URL` when set, otherwise the
 * browser's own origin. Empty on the server when neither is available.
 */
export function getAppBaseUrl(): string {
  const configured = process.env.NEXT_PUBLIC_APP_URL
  if (configured) return configured.replace(/\/+$/, '')
  if (typeof window !== 'undefined') return window.location.origin
  return ''
}

/** Absolute URL of an event's public page. */
export function getEventUrl(slug: string): string {
  const base = getAppBaseUrl()
  return base ? `${base}/event/${slug}` : `/event/${slug}`
}

export type ShareResult = 'shared' | 'cancelled' | 'copied' | 'failed'

/**
 * Share a URL with the native sheet, falling back to the clipboard when the
 * Web Share API is missing or rejects. `'cancelled'` means the user dismissed
 * the sheet and expects no feedback at all.
 */
export async function shareOrCopy(url: string, title?: string): Promise<ShareResult> {
  if (typeof navigator !== 'undefined' && typeof navigator.share === 'function') {
    try {
      await navigator.share({ title, url })
      return 'shared'
    } catch (err) {
      // The user dismissing the sheet is a normal outcome, not a failure.
      if (err instanceof DOMException && err.name === 'AbortError') return 'cancelled'
      // Anything else (e.g. NotAllowedError) falls through to the clipboard.
    }
  }
  return (await copyToClipboard(url)) ? 'copied' : 'failed'
}

/** Copy text to the clipboard. Returns false when the API is unavailable or denied. */
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    if (typeof navigator === 'undefined' || !navigator.clipboard) return false
    await navigator.clipboard.writeText(text)
    return true
  } catch {
    return false
  }
}
