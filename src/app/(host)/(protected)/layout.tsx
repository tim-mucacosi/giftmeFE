import type { ReactNode } from 'react'
import { AuthGuard } from '@/components/shared/AuthGuard'

export default function ProtectedLayout({ children }: { children: ReactNode }) {
  return <AuthGuard>{children}</AuthGuard>
}
