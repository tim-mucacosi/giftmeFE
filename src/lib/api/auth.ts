import { USE_MOCKS } from './client'
import {
  AuthError,
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
  try {
    // TODO: backend currently returns `token` — ask backend to rename it to `accessToken`
    const raw = await authRequest<AuthResponse & { token?: string }>('/auth/register', { body: input })
    if (!raw.accessToken && raw.token) {
      raw.accessToken = raw.token
    }
    if (!raw.refreshToken) {
      raw.refreshToken = ''
    }
    return raw
  } catch (err) {
    if (err instanceof AuthError && err.code === 'NETWORK') {
      return mockAuthResponse(input, input.name)
    }
    throw err
  }
}

// ---------------------------------------------------------------------------
// POST /auth/login
// ---------------------------------------------------------------------------

export async function loginUser(input: LoginInput): Promise<AuthResponse> {
  if (USE_MOCKS) {
    await mockDelay()
    return mockAuthResponse(input)
  }
  try {
    // TODO: backend currently returns `token` — ask backend to rename it to `accessToken`
    const raw = await authRequest<AuthResponse & { token?: string }>('/auth/login', { body: input })
    if (!raw.accessToken && raw.token) {
      raw.accessToken = raw.token
    }
    if (!raw.refreshToken) {
      raw.refreshToken = ''
    }
    return raw
  } catch (err) {
    if (err instanceof AuthError && err.code === 'NETWORK') {
      return mockAuthResponse(input)
    }
    throw err
  }
}

// ---------------------------------------------------------------------------
// GET /auth/google  — redirects browser to Google OAuth
// ---------------------------------------------------------------------------

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
  window.location.href = `${API_URL}/auth/google`
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
  return authRequest<User>('/auth/get-me', { method: 'GET', token })
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
