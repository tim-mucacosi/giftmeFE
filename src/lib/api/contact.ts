import { USE_MOCKS } from './client'
import type { ContactType } from '@/lib/validations/contactSchema'

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'https://giftmebe.onrender.com/api'

export interface ContactMessageInput {
  /** Sender's address, used by the backend as reply-to only. */
  email: string
  type: ContactType
  message: string
}

/** Submit the contact form. The backend picks the inbox and template. */
export async function sendContactMessage(input: ContactMessageInput): Promise<void> {
  if (USE_MOCKS) {
    await new Promise((resolve) => setTimeout(resolve, 400))
    return
  }

  const response = await fetch(`${API_URL}/contact`, {
    method: 'POST',
    headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  })

  if (!response.ok) {
    // Server messages are English, so callers show their own copy.
    throw new Error(`Contact request failed: ${response.status}`)
  }
}
