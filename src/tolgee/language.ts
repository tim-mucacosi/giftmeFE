'use server'

import { cookies } from 'next/headers'
import { ALL_LANGUAGES, DEFAULT_LANGUAGE, type Language } from './shared'

const LANGUAGE_COOKIE = 'NEXT_LOCALE'

export async function getLanguage(): Promise<Language> {
  const value = cookies().get(LANGUAGE_COOKIE)?.value
  if (value && (ALL_LANGUAGES as readonly string[]).includes(value)) {
    return value as Language
  }
  return DEFAULT_LANGUAGE
}

export async function setLanguage(language: string): Promise<void> {
  const safe = (ALL_LANGUAGES as readonly string[]).includes(language)
    ? (language as Language)
    : DEFAULT_LANGUAGE
  cookies().set(LANGUAGE_COOKIE, safe, {
    path: '/',
    maxAge: 60 * 60 * 24 * 365,
    sameSite: 'lax',
  })
}
