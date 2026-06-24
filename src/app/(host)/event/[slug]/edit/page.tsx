import { AuthGuard } from '@/components/shared/AuthGuard'
import { EventDetailClient } from '../EventDetailClient'

export default function EventEditPage({ params }: { params: { slug: string } }) {
  return (
    <AuthGuard>
      <EventDetailClient slug={params.slug} mode="edit" />
    </AuthGuard>
  )
}
