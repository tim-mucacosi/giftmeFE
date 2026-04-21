import type { ReactNode } from 'react'
import { Navbar } from '@/components/marketing/NavBar'
import { Footer } from '@/components/marketing/Footer'

export default function MarketingLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1 pb-24 lg:pb-0">{children}</main>
      <Footer />
    </div>
  )
}
