import { headers } from 'next/headers'
import type { Metadata } from 'next'
import { GuestEventClient } from '@/components/guest/GuestEventClient'
import { getEventById } from '@/lib/api/events'
import { buildEventShareMeta } from '@/lib/utils/eventShareMeta'
import { getLanguage } from '@/tolgee/language'

interface Props {
  params: { slug: string }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const event = await getEventById(params.slug).catch(() => null)
  if (!event) return {}

  const lang = await getLanguage()
  const { title, description } = buildEventShareMeta(event, lang)

  const requestHeaders = headers()
  const host = requestHeaders.get('host') ?? 'localhost:3000'
  const protocol = requestHeaders.get('x-forwarded-proto') ?? (host.startsWith('localhost') ? 'http' : 'https')
  const base = new URL(`${protocol}://${host}`)
  const url = new URL(`/event/${params.slug}`, base)

  return {
    metadataBase: base,
    title,
    description,
    alternates: { canonical: url.toString() },
    openGraph: {
      title,
      description,
      url,
      siteName: 'PokloniMi',
      type: 'website',
    },
  }
}

export default function EventGuestPage({ params }: Props) {
  return <GuestEventClient slug={params.slug} />
}
