import type { ReactNode } from 'react'

export function EmptyState({
  icon = '🎁',
  title,
  description,
  action,
}: {
  icon?: ReactNode
  title: string
  description?: string
  action?: ReactNode
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 px-6 py-12 text-center">
      <div
        aria-hidden="true"
        className="flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-coral/20 to-gold/20 text-4xl"
      >
        {icon}
      </div>
      <h3 className="text-lg font-extrabold tracking-tight text-dark">{title}</h3>
      {description ? (
        <p className="max-w-sm text-sm text-dark-light">{description}</p>
      ) : null}
      {action ? <div className="mt-2">{action}</div> : null}
    </div>
  )
}
