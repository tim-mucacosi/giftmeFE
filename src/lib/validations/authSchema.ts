import { z } from 'zod'

export const registerSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, 'auth.errors.nameTooShort')
    .max(80, 'common.errors.tooLong'),
  email: z.string().trim().email('common.errors.invalidEmail'),
  password: z
    .string()
    .min(8, 'auth.errors.passwordTooShort')
    .max(128, 'common.errors.tooLong'),
})

export type RegisterSchema = z.infer<typeof registerSchema>


export const loginSchema = z.object({
  email: z.string().trim().email('common.errors.invalidEmail'),
  password: z.string().min(1, 'common.errors.required'),
});

export type LoginSchema = z.infer<typeof loginSchema>