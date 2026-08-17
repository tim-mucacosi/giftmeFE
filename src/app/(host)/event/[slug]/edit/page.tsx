import { redirect } from 'next/navigation'

// Editing moved to /edit; keep old bookmarks working.
export default function EventEditRedirect({ params }: { params: { slug: string } }) {
  redirect(`/edit?eventId=${params.slug}`)
}
