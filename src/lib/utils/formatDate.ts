export function formatDate(iso: string, locale: string = 'sr-RS'): string {
  try {
    const d = new Date(iso)
    return new Intl.DateTimeFormat(locale, {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    }).format(d)
  } catch {
    return iso
  }
}

export function formatDateShort(iso: string, locale: string = 'sr-RS'): string {
  try {
    const d = new Date(iso)
    return new Intl.DateTimeFormat(locale, {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    }).format(d)
  } catch {
    return iso
  }
}
