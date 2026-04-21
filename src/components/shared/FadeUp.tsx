'use client'

import { useEffect, useRef, useState, type ReactNode } from 'react'
import { cn } from '@/lib/utils/cn'

export function FadeUp({
  children,
  delay = 0,
  className,
  as: Tag = 'div',
}: {
  children: ReactNode
  delay?: number
  className?: string
  as?: 'div' | 'section' | 'article' | 'li'
}) {
  const ref = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const node = ref.current
    if (!node) return
    if (typeof IntersectionObserver === 'undefined') {
      setVisible(true)
      return
    }
    const rect = node.getBoundingClientRect()
    const inViewport =
      rect.top < (window.innerHeight || 0) && rect.bottom > 0
    if (inViewport) {
      setVisible(true)
      return
    }
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setVisible(true)
            observer.disconnect()
          }
        })
      },
      { threshold: 0, rootMargin: '0px 0px -40px 0px' },
    )
    observer.observe(node)
    return () => observer.disconnect()
  }, [])

  const Component = Tag as 'div'
  return (
    <Component
      ref={ref as never}
      className={cn(visible ? 'fade-up-visible' : 'fade-up-hidden', className)}
      style={{ animationDelay: visible ? `${delay}s` : undefined }}
    >
      {children}
    </Component>
  )
}
