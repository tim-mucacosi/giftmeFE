import { describe, expect, it } from 'vitest'
import { isPastDate, todayIsoDate, validateEventDetails } from './eventSchema'

const NOW = new Date('2026-08-04T12:00:00')

describe('todayIsoDate', () => {
  it('formats the local date as YYYY-MM-DD', () => {
    expect(todayIsoDate(NOW)).toBe('2026-08-04')
  })
})

describe('isPastDate', () => {
  it('is true only before today', () => {
    expect(isPastDate('2026-08-03', NOW)).toBe(true)
    expect(isPastDate('2026-08-04', NOW)).toBe(false)
    expect(isPastDate('2026-08-05', NOW)).toBe(false)
  })
})

describe('validateEventDetails', () => {
  const valid = { name: 'Anna and Mark', date: '2026-09-01' }

  it('accepts today and future dates', () => {
    expect(validateEventDetails(valid, undefined, NOW)).toEqual({})
    expect(validateEventDetails({ ...valid, date: '2026-08-04' }, undefined, NOW)).toEqual({})
  })

  it('rejects a newly picked past date', () => {
    expect(validateEventDetails({ ...valid, date: '2026-07-01' }, undefined, NOW).date).toBe(
      'host.create.step1.dateErrorPast',
    )
  })

  it('still allows saving an existing event that already had a past date', () => {
    expect(
      validateEventDetails({ ...valid, date: '2026-07-01' }, '2026-07-01', NOW).date,
    ).toBeUndefined()
  })

  it('requires a name and a date', () => {
    expect(validateEventDetails({ name: ' ', date: '' }, undefined, NOW)).toEqual({
      name: 'common.errors.tooShort',
      date: 'common.errors.required',
    })
  })
})
