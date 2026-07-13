import { AuthGuard } from '@/components/shared/AuthGuard'
import { EventDetailClient } from '../EventDetailClient'

export default function EventOverviewPage({ params }: { params: { slug: string } }) {
  return (
    <AuthGuard>
      <EventDetailClient slug={params.slug} />
    </AuthGuard>
  )
}
