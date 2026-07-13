import { redirect } from 'next/navigation'

// Editing moved to the create wizard; keep old bookmarks working.
export default function EventEditRedirect({ params }: { params: { slug: string } }) {
  redirect(`/create?eventId=${params.slug}`)
}
