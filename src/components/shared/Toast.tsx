'use client'

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import { cn } from '@/lib/utils/cn'
import styles from './Toast.module.css'

type ToastKind = 'success' | 'info' | 'error'
interface ToastItem {
  id: string
  message: string
  kind: ToastKind
}

interface ToastContextValue {
  show: (message: string, kind?: ToastKind) => void
  success: (message: string) => void
  info: (message: string) => void
  error: (message: string) => void
}

const ToastContext = createContext<ToastContextValue | null>(null)

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be used within ToastProvider')
  return ctx
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([])
  const timeouts = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map())

  const remove = useCallback((id: string) => {
    setItems((prev) => prev.filter((t) => t.id !== id))
    const t = timeouts.current.get(id)
    if (t) clearTimeout(t)
    timeouts.current.delete(id)
  }, [])

  const show = useCallback(
    (message: string, kind: ToastKind = 'info') => {
      const id = `t_${Math.random().toString(36).slice(2, 9)}`
      setItems((prev) => [...prev, { id, message, kind }])
      const timer = setTimeout(() => remove(id), 3500)
      timeouts.current.set(id, timer)
    },
    [remove],
  )

  useEffect(() => {
    const map = timeouts.current
    return () => {
      map.forEach((t) => clearTimeout(t))
      map.clear()
    }
  }, [])

  const value = useMemo<ToastContextValue>(
    () => ({
      show,
      success: (m) => show(m, 'success'),
      info: (m) => show(m, 'info'),
      error: (m) => show(m, 'error'),
    }),
    [show],
  )

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className={styles.container} aria-live="polite" aria-atomic="true">
        {items.map((t) => (
          <div
            key={t.id}
            className={cn(styles.toast, styles[t.kind])}
            role="status"
            onClick={() => remove(t.id)}
          >
            {t.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}
