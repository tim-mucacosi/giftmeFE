import { cn } from '@/lib/utils/cn'

/** Compact display label for a gift link, e.g. "ikea.rs". */
export function linkLabel(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, '')
  } catch {
    return url
  }
}

interface Props {
  url: string
  className?: string
}

/** "Where to buy" chip, used in the host gift list and on the guest page. */
export function GiftLinkPreview({ url, className }: Props) {
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(
        'inline-flex max-w-full items-center gap-1 truncate text-xs font-medium text-coral hover:underline',
        className,
      )}
    >
      🔗 {linkLabel(url)}
    </a>
  )
}
