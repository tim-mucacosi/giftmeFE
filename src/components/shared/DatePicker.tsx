'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { useTolgee } from '@tolgee/react'
import { formatDateShort } from '@/lib/utils/formatDate'
import { todayIsoDate } from '@/lib/validations/eventSchema'
import { cn } from '@/lib/utils/cn'

interface Props {
  label?: string
  value: string
  onChange: (iso: string) => void
  min?: string
  error?: string
  id?: string
}

const CALENDAR_LOCALES: Record<string, string> = { sr: 'sr-RS', en: 'en-GB', de: 'de-DE' }

function pad(n: number): string {
  return String(n).padStart(2, '0')
}

function toIso(year: number, month: number, day: number): string {
  return `${year}-${pad(month + 1)}-${pad(day)}`
}

function parseIso(iso: string | undefined): { year: number; month: number; day: number } | null {
  if (!iso) return null
  const [y, m, d] = iso.slice(0, 10).split('-').map(Number)
  if (!y || !m || !d) return null
  return { year: y, month: m - 1, day: d }
}

function mondayIndex(year: number, month: number, day: number): number {
  const dow = new Date(year, month, day).getDay()
  return (dow + 6) % 7
}

function buildMonthCells(year: number, month: number): (number | null)[] {
  const total = new Date(year, month + 1, 0).getDate()
  const leading = mondayIndex(year, month, 1)
  const cells: (number | null)[] = Array(leading).fill(null)
  for (let d = 1; d <= total; d++) cells.push(d)
  while (cells.length % 7 !== 0) cells.push(null)
  return cells
}

function weekdayLabels(locale: string): string[] {
  const fmt = new Intl.DateTimeFormat(locale, { weekday: 'short' })
  return Array.from({ length: 7 }, (_, i) => fmt.format(new Date(2023, 0, 2 + i)))
}

export function DatePicker({ label, value, onChange, min, error, id }: Props) {
  const tolgee = useTolgee(['language'])
  const locale = CALENDAR_LOCALES[tolgee.getLanguage() ?? 'sr'] ?? 'sr-RS'
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  const selected = parseIso(value)
  const today = parseIso(todayIsoDate())!
  const [viewYear, setViewYear] = useState(selected?.year ?? today.year)
  const [viewMonth, setViewMonth] = useState(selected?.month ?? today.month)

  // Keep the visible month in sync when the value changes from outside
  // (e.g. loading an existing event into the edit form).
  useEffect(() => {
    if (selected) {
      setViewYear(selected.year)
      setViewMonth(selected.month)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value])

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    if (open) document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open])

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    if (open) document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [open])

  const inputId = id ?? `date_${Math.random().toString(36).slice(2, 8)}`
  const cells = useMemo(() => buildMonthCells(viewYear, viewMonth), [viewYear, viewMonth])
  const weekdays = useMemo(() => weekdayLabels(locale), [locale])
  const monthLabel = useMemo(
    () => new Intl.DateTimeFormat(locale, { month: 'long', year: 'numeric' }).format(new Date(viewYear, viewMonth, 1)),
    [locale, viewYear, viewMonth],
  )

  const minParsed = parseIso(min)
  const atMinMonth = minParsed && viewYear === minParsed.year && viewMonth === minParsed.month

  const goPrevMonth = () => {
    if (viewMonth === 0) {
      setViewMonth(11)
      setViewYear((y) => y - 1)
    } else {
      setViewMonth((m) => m - 1)
    }
  }
  const goNextMonth = () => {
    if (viewMonth === 11) {
      setViewMonth(0)
      setViewYear((y) => y + 1)
    } else {
      setViewMonth((m) => m + 1)
    }
  }

  const selectDay = (day: number) => {
    onChange(toIso(viewYear, viewMonth, day))
    setOpen(false)
  }

  return (
    <div ref={ref} className="relative flex flex-col gap-1.5">
      {label ? (
        <label htmlFor={inputId} className="text-sm font-semibold text-dark">
          {label}
        </label>
      ) : null}
      <button
        type="button"
        id={inputId}
        onClick={() => setOpen((s) => !s)}
        aria-haspopup="dialog"
        aria-expanded={open}
        className={cn(
          'flex h-12 min-h-[48px] w-full items-center justify-between rounded-xl border-2 border-gray-light bg-white px-4 text-left text-base transition-colors',
          'focus:border-coral focus:outline-none',
          error && 'border-coral',
        )}
      >
        <span className={value ? 'text-dark' : 'text-gray'}>
          {value ? formatDateShort(value) : 'dd/mm/yyyy'}
        </span>
        <span aria-hidden="true">📅</span>
      </button>
      {error ? <p className="text-xs font-medium text-coral">{error}</p> : null}

      {open ? (
        <div
          role="dialog"
          aria-label={label}
          className="absolute left-0 right-0 top-full z-20 mt-2 rounded-2xl border border-gray-light bg-white p-3 shadow-card sm:right-auto sm:w-[300px]"
        >
          <div className="mb-2 flex items-center justify-between">
            <button
              type="button"
              onClick={goPrevMonth}
              disabled={!!atMinMonth}
              aria-label="Previous month"
              className="flex h-8 w-8 items-center justify-center rounded-full text-dark-light transition-colors hover:bg-gray-light/60 disabled:opacity-30 disabled:hover:bg-transparent"
            >
              ‹
            </button>
            <span className="text-sm font-semibold capitalize text-dark">{monthLabel}</span>
            <button
              type="button"
              onClick={goNextMonth}
              aria-label="Next month"
              className="flex h-8 w-8 items-center justify-center rounded-full text-dark-light transition-colors hover:bg-gray-light/60"
            >
              ›
            </button>
          </div>

          <div className="grid grid-cols-7 gap-1">
            {weekdays.map((w) => (
              <span key={w} className="flex h-7 items-center justify-center text-xs font-semibold uppercase text-dark-light">
                {w}
              </span>
            ))}
            {cells.map((day, i) => {
              if (day === null) return <span key={`empty-${i}`} />
              const iso = toIso(viewYear, viewMonth, day)
              const isSelected = value === iso
              const isToday = today.year === viewYear && today.month === viewMonth && today.day === day
              const disabled = !!min && iso < min
              return (
                <button
                  key={iso}
                  type="button"
                  disabled={disabled}
                  onClick={() => selectDay(day)}
                  aria-current={isToday ? 'date' : undefined}
                  aria-pressed={isSelected}
                  className={cn(
                    'flex h-9 items-center justify-center rounded-lg text-sm font-medium text-dark transition-colors',
                    'hover:bg-coral/10',
                    isSelected && 'bg-coral text-white hover:bg-coral-dark',
                    isToday && !isSelected && 'font-bold text-coral',
                    disabled && 'cursor-not-allowed text-gray-light hover:bg-transparent',
                  )}
                >
                  {day}
                </button>
              )
            })}
          </div>
        </div>
      ) : null}
    </div>
  )
}
