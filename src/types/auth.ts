import type { User } from './user'

export interface RegisterInput {
  name: string
  email: string
  password: string
}

export interface LoginInput {
  email: string
  password: string
}

export interface AuthResponse {
  success: true
  accessToken: string
  refreshToken: string
  user: User
}

export interface VerifyEmailResponse {
  success: boolean
  message?: string
}

/**
 * Registration does not sign the user in: the account must be verified via
 * the emailed link first. When no mail provider is configured (local dev)
 * the backend verifies immediately and `requiresVerification` is false.
 */
export interface RegisterResponse {
  success: boolean
  message?: string
  requiresVerification: boolean
  /** False when the provider rejected the send; offer a resend. */
  emailSent: boolean
  user?: Pick<User, 'id' | 'name' | 'email'>
}

export interface AuthSession {
  accessToken: string
  refreshToken?: string
  user: User
}

export interface ChangePasswordInput {
  currentPassword: string
  newPassword: string
}

export class AuthError extends Error {
  status: number
  code?: string
  fieldErrors?: Partial<Record<'name' | 'email' | 'password', string>>

  constructor(
    message: string,
    status: number = 0,
    options?: {
      code?: string
      fieldErrors?: AuthError['fieldErrors']
    },
  ) {
    super(message)
    this.name = 'AuthError'
    this.status = status
    this.code = options?.code
    this.fieldErrors = options?.fieldErrors
  }
}
