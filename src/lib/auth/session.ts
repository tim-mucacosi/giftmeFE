'use client'

import type { AuthResponse, AuthSession } from '@/types/auth'
import type { User } from '@/types/user'

const STORAGE_KEY = 'poklonimi.session'

export function saveSession(response: AuthResponse): AuthSession {
  const session: AuthSession = {
    accessToken: response.accessToken,
    refreshToken: response.refreshToken,
    user: response.user,
  }
  try {
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(session))
      window.dispatchEvent(new Event('poklonimi:session-changed'))
    }
  } catch {
    // Storage may be full or disabled — the in-memory return is still valid.
  }
  return session
}

export function loadSession(): AuthSession | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as AuthSession
    if (!parsed.accessToken || !parsed.user) return null
    return parsed
  } catch {
    return null
  }
}

export function clearSession(): void {
  if (typeof window === 'undefined') return
  try {
    localStorage.removeItem(STORAGE_KEY)
    window.dispatchEvent(new Event('poklonimi:session-changed'))
  } catch {
    // ignore
  }
}

export function getCurrentUser(): User | null {
  return loadSession()?.user ?? null
}
