'use client'

import { EventWizard } from '@/components/host/EventWizard'

// Same wizard as /create, on its own route so the "New wishlist" nav item
// is not highlighted while editing.
export default function EditPage() {
  return <EventWizard />
}
