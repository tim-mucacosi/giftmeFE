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


export const forgotPasswordSchema = z.object({
  email: z.string().trim().email('common.errors.invalidEmail'),
})

export type ForgotPasswordSchema = z.infer<typeof forgotPasswordSchema>


export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, 'common.errors.required'),
    newPassword: z
      .string()
      .min(8, 'auth.errors.passwordTooShort')
      .max(128, 'common.errors.tooLong'),
    confirmPassword: z.string().min(1, 'common.errors.required'),
  })
  .refine((v) => v.newPassword === v.confirmPassword, {
    path: ['confirmPassword'],
    message: 'auth.errors.passwordMismatch',
  })
  .refine((v) => v.newPassword !== v.currentPassword, {
    path: ['newPassword'],
    message: 'auth.errors.passwordSameAsOld',
  })

export type ChangePasswordSchema = z.infer<typeof changePasswordSchema>


export const resetPasswordSchema = z
  .object({
    password: z
      .string()
      .min(8, 'auth.errors.passwordTooShort')
      .max(128, 'common.errors.tooLong'),
    confirmPassword: z.string().min(1, 'common.errors.required'),
  })
  .refine((v) => v.password === v.confirmPassword, {
    path: ['confirmPassword'],
    message: 'auth.errors.passwordMismatch',
  })

export type ResetPasswordSchema = z.infer<typeof resetPasswordSchema>