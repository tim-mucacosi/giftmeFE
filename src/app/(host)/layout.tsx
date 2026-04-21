import type { ReactNode } from 'react'
import { Navbar } from '@/components/marketing/NavBar'

export default function HostLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1 pb-24 lg:pb-12">{children}</main>
    </div>
  )
}
