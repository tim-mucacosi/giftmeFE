export type UserMainRole = 'user' | 'admin';
export type UserAppRole = 'host' | 'guest';
export type AuthProvider = 'local' | 'google' | 'facebook' | 'apple'

export interface User {
  id: string
  email: string
  name?: string
  role?: UserMainRole
  profilePicture?: string
  provider?: AuthProvider
  createdAt: string
  updatedAt?: string
}