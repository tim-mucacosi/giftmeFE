import { GuestEventClient } from '@/components/guest/GuestEventClient'

export default function EventGuestPage({ params }: { params: { slug: string } }) {
  return <GuestEventClient slug={params.slug} />
}
