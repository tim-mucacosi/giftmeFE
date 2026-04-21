'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useTranslate } from '@tolgee/react'
import { LanguageSwitcher } from '@/components/shared/LanguageSwitcher'
import { UserMenu } from '@/components/shared/UserMenu'
import { useCurrentUser } from '@/lib/auth/useCurrentUser'
import { cn } from '@/lib/utils/cn'
import styles from './Navbar.module.css'

interface NavItem {
  href: string
  labelKey: string
  icon: string
}

const BASE_ITEMS: NavItem[] = [
  { href: '/', labelKey: 'nav.home', icon: '🏠' },
  { href: '/create', labelKey: 'nav.create', icon: '✨' },
  { href: '/dashboard', labelKey: 'nav.dashboard', icon: '📋' },
  // { href: '/event/svadba-marka-i-ane', labelKey: 'nav.demo', icon: '👁️' },
]


export function Navbar() {
  const pathname = usePathname()
  const { t } = useTranslate()
  const { user, ready, logout } = useCurrentUser()

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/'
    return pathname?.startsWith(href)
  }

  const mobileItems = BASE_ITEMS

  return (
    <>
      {/* Mobile top bar — logo + language switcher (hidden on desktop) */}
      <header className={styles.mobileTopBar} aria-label="Mobile top bar">
        <Link href="/" className="flex items-center gap-2 text-base font-extrabold tracking-tight">
          <span className={styles.logoEmoji} aria-hidden="true">🎁</span>
          <span>{t('common.appName')}</span>
        </Link>
        <div className="flex items-center gap-2">
          <LanguageSwitcher />
          {ready && user && <UserMenu user={user} onLogout={logout} />}
        </div>
      </header>

      {/* Desktop top nav */}
      <header className={styles.topNav} aria-label="Primary navigation">
        <div className="mx-auto flex w-full max-w-container items-center justify-between gap-6 px-6 py-4 lg:px-8">
          <Link href="/" className="flex items-center gap-2 text-lg font-extrabold tracking-tight">
            <span className={styles.logoEmoji} aria-hidden="true">🎁</span>
            <span>{t('common.appName')}</span>
          </Link>
          <nav className="hidden items-center gap-1 lg:flex">
            {BASE_ITEMS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'rounded-full px-4 py-2 text-sm font-semibold transition-colors',
                  isActive(item.href) ? 'bg-coral/10 text-coral' : 'text-dark hover:bg-gray-light/60',
                )}
              >
                {t(item.labelKey)}
              </Link>
            ))}
          </nav>
          <div className="flex items-center gap-2">
            <LanguageSwitcher />
            {!ready ? (
              <div className="hidden h-9 w-[120px] animate-pulse rounded-full bg-gray-light lg:block" />
            ) : user ? (
              <UserMenu user={user} onLogout={logout} />
            ) : (
              <>
                <Link
                  href="/login"
                  className="hidden rounded-full px-4 py-2 text-sm font-semibold text-dark transition-colors hover:text-coral lg:inline-flex"
                >
                  {t('nav.login')}
                </Link>
                <Link
                  href="/register"
                  className="hidden rounded-full bg-dark px-5 py-2 text-sm font-semibold text-white transition-colors hover:bg-dark-light lg:inline-flex"
                >
                  {t('auth.register.signUp')}
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Mobile bottom nav */}
      <nav className={styles.bottomNav} aria-label="Primary navigation">
        <ul
          className={styles.bottomList}
          style={{ gridTemplateColumns: `repeat(${mobileItems.length}, 1fr)` }}
        >
          {mobileItems.map((item) => {
            const active = isActive(item.href)
            return (
              <li key={item.href + item.labelKey} className={styles.bottomItem}>
                <Link
                  href={item.href}
                  className={cn(styles.bottomLink, active && styles.bottomLinkActive)}
                >
                  {active ? <span className={styles.activeIndicator} aria-hidden="true" /> : null}
                  <span className={styles.bottomIcon} aria-hidden="true">{item.icon}</span>
                  <span className={styles.bottomLabel}>{t(item.labelKey)}</span>
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>
    </>
  )
}
