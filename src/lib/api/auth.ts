import { USE_MOCKS } from './client'
import {
  AuthError,
  VerifyEmailResponse,
  type AuthResponse,
  type ChangePasswordInput,
  type LoginInput,
  type RegisterInput,
} from '@/types/auth'
import type { User } from '@/types/user'

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'https://giftmebe.onrender.com/api'

// ---------------------------------------------------------------------------
// Core request helper
// ---------------------------------------------------------------------------

type AuthRequestOptions = {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'
  body?: unknown
  token?: string
}

async function authRequest<T>(path: string, options: AuthRequestOptions = {}): Promise<T> {
  const { method = 'POST', body, token } = options

  const headers: Record<string, string> = { Accept: 'application/json' }
  if (body !== undefined) headers['Content-Type'] = 'application/json'
  if (token) headers['Authorization'] = `Bearer ${token}`

  let response: Response
  try {
    response = await fetch(`${API_URL}${path}`, {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    })
  } catch {
    throw new AuthError('auth.errors.network', 0, { code: 'NETWORK' })
  }

  let data: unknown
  try {
    data = await response.json()
  } catch {
    data = null
  }

  if (!response.ok) {
    const parsed = (data ?? {}) as {
      message?: string
      code?: string
      errors?: Record<string, string>
    }
    throw new AuthError(
      parsed.message ?? `API error: ${response.status}`,
      response.status,
      { code: parsed.code, fieldErrors: parsed.errors as AuthError['fieldErrors'] },
    )
  }

  return data as T
}

// ---------------------------------------------------------------------------
// Mock helpers
// ---------------------------------------------------------------------------

function mockAuthResponse(input: RegisterInput | LoginInput, name?: string): AuthResponse {
  const now = new Date().toISOString()
  return {
    success: true,
    accessToken: `mock.access.${Math.random().toString(36).slice(2)}`,
    refreshToken: `mock.refresh.${Math.random().toString(36).slice(2)}`,
    user: {
      id: `usr_${Math.random().toString(36).slice(2, 10)}`,
      name: name ?? ('name' in input ? input.name : undefined),
      email: input.email,
      role: 'user',
      provider: 'local',
      createdAt: now,
      updatedAt: now,
    },
  }
}

function mockDelay(ms = 400) {
  return new Promise((r) => setTimeout(r, ms))
}

// ---------------------------------------------------------------------------
// POST /auth/register
// ---------------------------------------------------------------------------

export async function registerUser(input: RegisterInput): Promise<AuthResponse> {
  if (USE_MOCKS) {
    await mockDelay()
    return mockAuthResponse(input, input.name)
  }
  // Normalize token field name
  const raw = await authRequest<AuthResponse & { token?: string }>('/auth/register', { body: input })
  if (!raw.accessToken && raw.token) {
    raw.accessToken = raw.token
  }
  if (!raw.refreshToken) {
    raw.refreshToken = ''
  }
  return raw
}

// ---------------------------------------------------------------------------
// POST /auth/verify-email
// ---------------------------------------------------------------------------
export async function verifyEmail(token: string): Promise<VerifyEmailResponse> {
  if (USE_MOCKS) {
    await mockDelay()
    return { code: 200, description: 'Email verified successfully' }
  }
  return await authRequest<VerifyEmailResponse>('/auth/verify-email', { body: { token } });
}

// ---------------------------------------------------------------------------
// POST /auth/login
// ---------------------------------------------------------------------------

export async function loginUser(input: LoginInput): Promise<AuthResponse> {
  if (USE_MOCKS) {
    await mockDelay()
    return mockAuthResponse(input)
  }
  // Normalize token field name
  const raw = await authRequest<AuthResponse & { token?: string }>('/auth/login', { body: input })
  if (!raw.accessToken && raw.token) {
    raw.accessToken = raw.token
  }
  if (!raw.refreshToken) {
    raw.refreshToken = ''
  }
  return raw
}

// Google OAuth login

export async function loginWithGoogle(): Promise<AuthResponse | null> {
  if (USE_MOCKS) {
    await mockDelay(600)
    const now = new Date().toISOString()
    return {
      success: true,
      accessToken: `mock.access.${Math.random().toString(36).slice(2)}`,
      refreshToken: `mock.refresh.${Math.random().toString(36).slice(2)}`,
      user: {
        id: `usr_${Math.random().toString(36).slice(2, 10)}`,
        name: 'Demo Google User',
        email: 'demo@gmail.com',
        role: 'user',
        provider: 'google',
        createdAt: now,
        updatedAt: now,
      },
    }
  }
  // Tell the backend which frontend to come back to after the OAuth
  // handshake; it validates the origin against its allowlist.
  const origin = encodeURIComponent(window.location.origin)
  window.location.href = `${API_URL}/auth/google?origin=${origin}`
  return null
}

// ---------------------------------------------------------------------------
// GET /auth/get-me
// ---------------------------------------------------------------------------

export async function getMe(token: string): Promise<User> {
  if (USE_MOCKS) {
    await mockDelay(200)
    return {
      id: 'usr_mock',
      name: 'Mock User',
      email: 'mock@example.com',
      role: 'user',
      provider: 'local',
      createdAt: new Date().toISOString(),
    }
  }
  // Handle wrapped or direct user response
  const raw = await authRequest<User | { success?: boolean; user: User }>(
    '/auth/get-me',
    { method: 'GET', token },
  )
  return 'user' in raw && raw.user ? raw.user : (raw as User)
}

// ---------------------------------------------------------------------------
// PUT /auth/change-password
// ---------------------------------------------------------------------------

export async function changePassword(input: ChangePasswordInput, token: string): Promise<void> {
  if (USE_MOCKS) {
    await mockDelay()
    return
  }
  await authRequest<unknown>('/auth/change-password', { method: 'PUT', body: input, token })
}

// ---------------------------------------------------------------------------
// POST /auth/forgot-password
//
export async function requestPasswordReset(email: string): Promise<void> {
  if (USE_MOCKS) {
    await mockDelay(500)
    return
  }
  try {
    await authRequest<unknown>('/auth/initiate-password-change', { body: { email } })
  } catch (err) {
    if (err instanceof AuthError) {
      // Treat missing endpoint as success
      if (err.status === 404 || err.code === 'NETWORK') return
    }
    throw err
  }
}

export async function resetPassword(
  passwordResetToken: string,
  newPassword: string,
): Promise<void> {
  if (USE_MOCKS) {
    await mockDelay(500)
    return
  }
  try {
    await authRequest<unknown>('/auth/change-password', {
      method: 'PUT',
      body: { passwordResetToken, newPassword },
    })
  } catch (err) {
    if (err instanceof AuthError) {
      throw err
    }
    throw new AuthError('auth.errors.resetFailed', 0)
  }
}
