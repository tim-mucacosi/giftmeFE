import { z } from 'zod'

/** Inquiry types the backend accepts (see giftmeBE contactController). */
export const CONTACT_TYPES = ['business', 'feedback'] as const
export type ContactType = (typeof CONTACT_TYPES)[number]

// Mirrors the backend limit.
export const CONTACT_MESSAGE_MAX = 2000

export const contactSchema = z.object({
  email: z.string().trim().email('common.errors.invalidEmail'),
  type: z.enum(CONTACT_TYPES, {
    errorMap: () => ({ message: 'contact.errors.typeRequired' }),
  }),
  message: z
    .string()
    .trim()
    .min(1, 'common.errors.required')
    .max(CONTACT_MESSAGE_MAX, 'common.errors.tooLong'),
})

export type ContactSchema = z.infer<typeof contactSchema>

/** Form state. `type` starts empty so the select has no preselection. */
export type ContactFormValues = Omit<ContactSchema, 'type'> & {
  type: ContactType | ''
}
