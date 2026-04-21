import { cn } from '@/lib/utils/cn'

export function LoadingSpinner({
  size = 20,
  className,
}: {
  size?: number
  className?: string
}) {
  return (
    <span
      aria-label="loading"
      role="status"
      className={cn(
        'inline-block rounded-full border-2 border-gray-light border-t-coral animate-spin',
        className,
      )}
      style={{ width: size, height: size }}
    />
  )
}
