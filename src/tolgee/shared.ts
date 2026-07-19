import { DevTools, Tolgee, BackendFetch } from '@tolgee/web'
import { FormatIcu } from '@tolgee/format-icu'
import type { TolgeeStaticData } from '@tolgee/react'

const apiKey = process.env.NEXT_PUBLIC_TOLGEE_API_KEY
const apiUrl = process.env.NEXT_PUBLIC_TOLGEE_API_URL

export const ALL_LANGUAGES = ['sr', 'en', 'de'] as const
export type Language = (typeof ALL_LANGUAGES)[number]
export const DEFAULT_LANGUAGE: Language = 'sr'

// Bundle local message files as static data so the app is fully functional
// without a Tolgee CDN or API key. When NEXT_PUBLIC_TOLGEE_API_KEY is set,
// Tolgee will still activate in-context editing in dev.
export async function getStaticData(languages: readonly string[]): Promise<TolgeeStaticData> {
  const result: TolgeeStaticData = {}
  for (const lang of languages) {
    result[lang] = (await import(`../../messages/${lang}.json`)).default
  }
  return result
}

export function TolgeeBase() {
  return Tolgee()
    .use(FormatIcu())
    .use(DevTools())
    .use(BackendFetch({
      prefix: process.env.NEXT_PUBLIC_TOLGEE_CDN_URL,
      next: { revalidate: 60 },
    }))
    .updateDefaults({
      apiKey,
      apiUrl,
      fallbackLanguage: 'sr',
    })
}
