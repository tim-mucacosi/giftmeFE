'use client'

import { useEffect, useRef, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { cn } from '@/lib/utils/cn'
import styles from './Modal.module.css'

export interface ModalProps {
  open: boolean
  onClose: () => void
  title?: string
  children: ReactNode
  className?: string
  hideClose?: boolean
}

export function Modal({ open, onClose, title, children, className, hideClose }: ModalProps) {
  const contentRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = prev
    }
  }, [open])

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open, onClose])

  useEffect(() => {
    if (!open) return
    const el = contentRef.current
    if (!el) return
    const focusable = el.querySelectorAll<HTMLElement>(
      'a,button,textarea,input,select,[tabindex]:not([tabindex="-1"])',
    )
    focusable[0]?.focus()
    const trap = (e: KeyboardEvent) => {
      if (e.key !== 'Tab' || focusable.length === 0) return
      const first = focusable[0]!
      const last = focusable[focusable.length - 1]!
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault()
        last.focus()
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault()
        first.focus()
      }
    }
    document.addEventListener('keydown', trap)
    return () => document.removeEventListener('keydown', trap)
  }, [open])

  if (!open) return null
  if (typeof document === 'undefined') return null

  return createPortal(
    <div
      className={cn(styles.backdrop)}
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
      role="dialog"
      aria-modal="true"
      aria-label={title}
    >
      <div ref={contentRef} className={cn(styles.sheet, className)}>
        <div className={styles.handle} aria-hidden="true" />
        {title ? (
          <div className="flex items-start justify-between gap-4 px-5 pt-4 pb-2">
            <h2 className="text-xl font-extrabold tracking-tight text-dark">{title}</h2>
            {!hideClose && (
              <button
                type="button"
                onClick={onClose}
                aria-label="Close"
                className="h-10 w-10 rounded-full text-dark-light hover:bg-gray-light"
              >
                ✕
              </button>
            )}
          </div>
        ) : null}
        <div className="px-5 pb-5 pt-2">{children}</div>
      </div>
    </div>,
    document.body,
  )
}
