'use client'

import { useTranslate } from '@tolgee/react'

interface Stat {
  icon: string
  labelKey: string
  value: string | number
}

export function DashboardStats({ guests, reserved, envelope }: {
  guests: number
  reserved: string
  envelope: string
}) {
  const { t } = useTranslate()
  const stats: Stat[] = [
    { icon: '👥', labelKey: 'host.dashboard.stats.guests', value: guests },
    { icon: '🎁', labelKey: 'host.dashboard.stats.reserved', value: reserved },
    { icon: '💰', labelKey: 'host.dashboard.stats.envelope', value: envelope },
  ]

  return (
    <div className="flex gap-3 overflow-x-auto no-scrollbar sm:grid sm:grid-cols-3 sm:gap-4">
      {stats.map((s) => (
        <div
          key={s.labelKey}
          className="min-w-[220px] flex-1 rounded-2xl bg-white p-5 shadow-card sm:min-w-0"
        >
          <div className="mb-2 text-2xl" aria-hidden="true">
            {s.icon}
          </div>
          <div className="text-2xl font-extrabold tracking-tight text-dark">{s.value}</div>
          <div className="text-sm text-dark-light">{t(s.labelKey)}</div>
        </div>
      ))}
    </div>
  )
}
