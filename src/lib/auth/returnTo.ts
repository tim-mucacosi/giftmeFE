export const RETURN_TO_PARAM = 'next'
const DEFAULT_RETURN_TO = '/dashboard'
/** Survives the full-page redirect of the OAuth handshake. */
const STORAGE_KEY = 'poklonimi.returnTo'

/**
 * Accept only same-origin absolute paths ("/create"). Anything else —
 * absolute URLs, protocol-relative "//evil.com", or a missing value — falls
 * back to the dashboard, so a crafted `?next=` cannot redirect users off-site
 * after they sign in.
 */
export function safeReturnTo(value: string | null | undefined): string {
  if (!value) return DEFAULT_RETURN_TO
  if (!value.startsWith('/') || value.startsWith('//')) return DEFAULT_RETURN_TO
  return value
}

/** Build a login/register link that comes back to `path` once signed in. */
export function withReturnTo(base: '/login' | '/register', path: string | null | undefined): string {
  const target = safeReturnTo(path)
  if (target === DEFAULT_RETURN_TO) return base
  return `${base}?${RETURN_TO_PARAM}=${encodeURIComponent(target)}`
}

export function rememberReturnTo(path: string) {
  try {
    sessionStorage.setItem(STORAGE_KEY, safeReturnTo(path))
  } catch {
    // storage unavailable; the default destination still applies
  }
}

/** Read and clear the remembered destination. */
export function consumeReturnTo(): string {
  try {
    const stored = sessionStorage.getItem(STORAGE_KEY)
    sessionStorage.removeItem(STORAGE_KEY)
    return safeReturnTo(stored)
  } catch {
    return DEFAULT_RETURN_TO
  }
}
