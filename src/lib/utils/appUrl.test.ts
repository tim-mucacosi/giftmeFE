import { afterEach, describe, expect, it, vi } from 'vitest'
import { copyToClipboard, getAppBaseUrl, getEventUrl, shareOrCopy } from './appUrl'

const originalEnv = process.env.NEXT_PUBLIC_APP_URL

afterEach(() => {
  process.env.NEXT_PUBLIC_APP_URL = originalEnv
  vi.unstubAllGlobals()
})

describe('getAppBaseUrl', () => {
  it('prefers the configured origin and strips trailing slashes', () => {
    process.env.NEXT_PUBLIC_APP_URL = 'https://staging.example.com/'
    expect(getAppBaseUrl()).toBe('https://staging.example.com')
  })

  it('falls back to the browser origin when unconfigured', () => {
    delete process.env.NEXT_PUBLIC_APP_URL
    vi.stubGlobal('window', { location: { origin: 'http://localhost:3000' } })
    expect(getAppBaseUrl()).toBe('http://localhost:3000')
    expect(getEventUrl('abc')).toBe('http://localhost:3000/event/abc')
  })

  it('returns an empty base (relative URL) when neither is available', () => {
    delete process.env.NEXT_PUBLIC_APP_URL
    expect(getAppBaseUrl()).toBe('')
    expect(getEventUrl('abc')).toBe('/event/abc')
  })
})

describe('copyToClipboard', () => {
  it('reports failure instead of throwing when the API rejects', async () => {
    vi.stubGlobal('navigator', {
      clipboard: { writeText: vi.fn().mockRejectedValue(new Error('denied')) },
    })
    expect(await copyToClipboard('x')).toBe(false)
  })

  it('reports failure when the clipboard API is unavailable', async () => {
    vi.stubGlobal('navigator', {})
    expect(await copyToClipboard('x')).toBe(false)
  })
})

describe('shareOrCopy', () => {
  it('reports a completed native share', async () => {
    vi.stubGlobal('navigator', { share: vi.fn().mockResolvedValue(undefined) })
    expect(await shareOrCopy('https://app.example')).toBe('shared')
  })

  it('reports a cancelled share when the user dismisses the sheet', async () => {
    const abort = new DOMException('cancelled', 'AbortError')
    vi.stubGlobal('navigator', { share: vi.fn().mockRejectedValue(abort) })
    expect(await shareOrCopy('https://app.example')).toBe('cancelled')
  })

  it('falls back to the clipboard when native sharing is unavailable', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined)
    vi.stubGlobal('navigator', { clipboard: { writeText } })
    expect(await shareOrCopy('https://app.example')).toBe('copied')
    expect(writeText).toHaveBeenCalledWith('https://app.example')
  })

  it('falls back to the clipboard when native sharing fails unexpectedly', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined)
    vi.stubGlobal('navigator', {
      share: vi.fn().mockRejectedValue(new DOMException('nope', 'NotAllowedError')),
      clipboard: { writeText },
    })
    expect(await shareOrCopy('https://app.example')).toBe('copied')
  })

  it('reports failure when neither sharing nor copying works', async () => {
    vi.stubGlobal('navigator', {})
    expect(await shareOrCopy('https://app.example')).toBe('failed')
  })
})
