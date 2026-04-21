'use client'

import { useEffect, useState } from 'react'
import type { User } from '@/types/user'
import { getCurrentUser, clearSession } from '@/lib/auth/session'

export function useCurrentUser() {
  const [user, setUser] = useState<User | null>(null)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    setUser(getCurrentUser())
    setReady(true)

    const refresh = () => setUser(getCurrentUser())
    window.addEventListener('poklonimi:session-changed', refresh)
    return () => window.removeEventListener('poklonimi:session-changed', refresh)
  }, [])

  function logout() {
    clearSession()
    setUser(null)
  }

  return { user, ready, logout }
}
