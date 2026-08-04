export interface EventDetailsFields {
  name: string
  date: string
}

export type EventDetailsErrors = Partial<Record<'name' | 'date', string>>

/** Today's date as a local YYYY-MM-DD string (matches `<input type="date">`). */
export function todayIsoDate(now: Date = new Date()): string {
  const y = now.getFullYear()
  const m = String(now.getMonth() + 1).padStart(2, '0')
  const d = String(now.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

/** Whether a YYYY-MM-DD (or ISO) date string falls before today (local). */
export function isPastDate(date: string, now: Date = new Date()): boolean {
  return date.slice(0, 10) < todayIsoDate(now)
}

/**
 * Validate step 1 of the create/edit wizard. Returns i18n error keys per
 * field. `initialDate` is the date the event already had when loaded for
 * editing: keeping it unchanged stays valid even if it is in the past, but a
 * newly picked past date is rejected.
 */
export function validateEventDetails(
  fields: EventDetailsFields,
  initialDate?: string,
  now: Date = new Date(),
): EventDetailsErrors {
  const errors: EventDetailsErrors = {}
  if (!fields.name.trim() || fields.name.trim().length < 2) {
    errors.name = 'common.errors.tooShort'
  }
  if (!fields.date) {
    errors.date = 'common.errors.required'
  } else if (isPastDate(fields.date, now) && fields.date.slice(0, 10) !== initialDate?.slice(0, 10)) {
    errors.date = 'host.create.step1.dateErrorPast'
  }
  return errors
}
