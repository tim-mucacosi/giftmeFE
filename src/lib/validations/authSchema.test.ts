import { describe, expect, it } from 'vitest'
import { registerSchema } from './authSchema'

const valid = {
  name: 'Ana Anić',
  email: 'ana@example.com',
  password: 'dovoljnoDuga1',
  acceptedTerms: true,
}

describe('registerSchema', () => {
  it('accepts a complete registration with consent given', () => {
    expect(registerSchema.safeParse(valid).success).toBe(true)
  })

  it('rejects registration when the legal checkbox is not ticked', () => {
    const result = registerSchema.safeParse({ ...valid, acceptedTerms: false })
    expect(result.success).toBe(false)
    if (!result.success) {
      const issue = result.error.issues.find((i) => i.path[0] === 'acceptedTerms')
      expect(issue?.message).toBe('auth.errors.termsRequired')
    }
  })

  it('rejects registration when consent is missing entirely', () => {
    const { acceptedTerms, ...withoutConsent } = valid
    expect(registerSchema.safeParse(withoutConsent).success).toBe(false)
  })

  it('still enforces the existing name, email and password rules', () => {
    expect(registerSchema.safeParse({ ...valid, name: 'A' }).success).toBe(false)
    expect(registerSchema.safeParse({ ...valid, email: 'not-an-email' }).success).toBe(false)
    expect(registerSchema.safeParse({ ...valid, password: 'short' }).success).toBe(false)
  })
})
