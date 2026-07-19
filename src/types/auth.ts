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
