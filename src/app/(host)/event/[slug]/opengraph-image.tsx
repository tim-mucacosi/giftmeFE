import { ImageResponse } from 'next/og'
import { headers } from 'next/headers'
import { getEventById } from '@/lib/api/events'
import { getBrandName } from '@/lib/utils/eventShareMeta'
import { COVER_PRESETS, FALLBACK_COVER_IMAGE_URL } from '@/lib/utils/imageUpload'
import { cloudinaryTransform } from '@/lib/utils/cloudinaryUrl'
import { getLanguage } from '@/tolgee/language'

export const runtime = 'edge'
export const revalidate = 60
export const alt = 'PokloniMi — poziv za listu poklona'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

// Exact copies of public/covers/*.svg, inlined so they can be embedded as a
// data: URI below. The edge image renderer silently drops
// backgroundImage values made only of CSS gradient() functions, a url()
// layer paints reliably, so every cover (including the branded fallback)
// goes through that path instead of a bare linear-/radial-gradient.
const PRESET_SVG: Record<(typeof COVER_PRESETS)[number]['id'], string> = {
  celebration: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 630"><defs><linearGradient id="warm" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#ffb199"/><stop offset="38%" stop-color="#ff7d70"/><stop offset="70%" stop-color="#ff6b6b"/><stop offset="100%" stop-color="#e05e73"/></linearGradient><radialGradient id="warmGlow" cx="22%" cy="14%" r="55%"><stop offset="0%" stop-color="#ffd93d" stop-opacity="0.55"/><stop offset="100%" stop-color="#ffd93d" stop-opacity="0"/></radialGradient></defs><rect width="1200" height="630" fill="url(#warm)"/><rect width="1200" height="630" fill="url(#warmGlow)"/><g fill="#fff" opacity="0.16"><circle cx="150" cy="120" r="54"/><circle cx="1040" cy="96" r="34"/><circle cx="930" cy="250" r="18"/><circle cx="255" cy="470" r="26"/><circle cx="640" cy="90" r="14"/><circle cx="1120" cy="430" r="46"/><circle cx="430" cy="230" r="10"/><circle cx="760" cy="520" r="30"/></g><g fill="#ffd93d" opacity="0.5"><rect x="330" y="120" width="14" height="14" rx="3" transform="rotate(24 337 127)"/><rect x="880" y="380" width="16" height="16" rx="3" transform="rotate(-18 888 388)"/><rect x="520" y="430" width="12" height="12" rx="3" transform="rotate(40 526 436)"/><rect x="1010" y="180" width="12" height="12" rx="3" transform="rotate(-32 1016 186)"/></g></svg>`,
  blossom: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 630"><defs><linearGradient id="blossom" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#fff3ee"/><stop offset="45%" stop-color="#ffd9d0"/><stop offset="100%" stop-color="#f7b8c4"/></linearGradient><radialGradient id="blossomGlow" cx="78%" cy="20%" r="60%"><stop offset="0%" stop-color="#ffffff" stop-opacity="0.75"/><stop offset="100%" stop-color="#ffffff" stop-opacity="0"/></radialGradient></defs><rect width="1200" height="630" fill="url(#blossom)"/><rect width="1200" height="630" fill="url(#blossomGlow)"/><g opacity="0.5"><path d="M0 470 Q 300 400 600 470 T 1200 470 L1200 630 L0 630 Z" fill="#ffffff" opacity="0.45"/><path d="M0 530 Q 320 470 640 530 T 1200 520 L1200 630 L0 630 Z" fill="#ffffff" opacity="0.5"/></g><g fill="#ff6b6b" opacity="0.22"><circle cx="190" cy="180" r="42"/><circle cx="250" cy="140" r="24"/><circle cx="1000" cy="300" r="34"/><circle cx="1060" cy="248" r="18"/><circle cx="700" cy="150" r="16"/></g><g fill="#ffd93d" opacity="0.55"><circle cx="420" cy="240" r="7"/><circle cx="880" cy="120" r="9"/><circle cx="560" cy="330" r="6"/><circle cx="1130" cy="150" r="8"/></g></svg>`,
  evening: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 630"><defs><linearGradient id="evening" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#3d4548"/><stop offset="55%" stop-color="#2d3436"/><stop offset="100%" stop-color="#1d2426"/></linearGradient><radialGradient id="eveningGlow" cx="50%" cy="100%" r="70%"><stop offset="0%" stop-color="#ffd93d" stop-opacity="0.35"/><stop offset="100%" stop-color="#ffd93d" stop-opacity="0"/></radialGradient></defs><rect width="1200" height="630" fill="url(#evening)"/><rect width="1200" height="630" fill="url(#eveningGlow)"/><g fill="#ffd93d"><circle cx="160" cy="120" r="3" opacity="0.9"/><circle cx="320" cy="200" r="2" opacity="0.7"/><circle cx="480" cy="90" r="3.5" opacity="0.85"/><circle cx="640" cy="180" r="2" opacity="0.6"/><circle cx="800" cy="110" r="3" opacity="0.9"/><circle cx="960" cy="220" r="2.5" opacity="0.7"/><circle cx="1100" cy="140" r="3" opacity="0.8"/><circle cx="240" cy="330" r="2" opacity="0.55"/><circle cx="700" cy="360" r="2.5" opacity="0.6"/><circle cx="1040" cy="400" r="2" opacity="0.5"/><circle cx="400" cy="440" r="3" opacity="0.45"/><circle cx="880" cy="480" r="2" opacity="0.4"/></g><g opacity="0.28"><path d="M0 500 Q 300 440 600 500 T 1200 490 L1200 630 L0 630 Z" fill="#ff6b6b"/></g><g opacity="0.22"><path d="M0 560 Q 340 500 680 560 T 1200 550 L1200 630 L0 630 Z" fill="#ffd93d"/></g></svg>`,
}

function svgDataUrl(svg: string): string {
  return `data:image/svg+xml,${encodeURIComponent(svg)}`
}

export default async function Image({ params }: { params: { slug: string } }) {
  const event = await getEventById(params.slug).catch(() => null)
  const brand = getBrandName(await getLanguage())
  const name = event?.name ?? brand

  const preset = COVER_PRESETS.find((p) => p.url === event?.backgroundImageUrl)

  const isLocalCoverAsset = !!preset || !!event?.backgroundImageUrl?.startsWith('/covers/')

  const photoUrl = event?.backgroundImageUrl && !isLocalCoverAsset
    ? cloudinaryTransform(event.backgroundImageUrl, 'w_1200,h_630,c_fill,g_auto,q_auto,f_auto')
    : null

  const requestHeaders = headers()
  const host = requestHeaders.get('host') ?? 'localhost:3000'
  const protocol = requestHeaders.get('x-forwarded-proto') ?? (host.startsWith('localhost') ? 'http' : 'https')
  const origin = `${protocol}://${host}`

  const coverUrl =
    photoUrl ?? (preset ? svgDataUrl(PRESET_SVG[preset.id]) : `${origin}${FALLBACK_COVER_IMAGE_URL}`)

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'flex-end',
          backgroundImage: `linear-gradient(to top, rgba(17,15,20,0.88) 0%, rgba(17,15,20,0.35) 50%, rgba(17,15,20,0.05) 75%), url(${coverUrl})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          padding: '80px',
          textAlign: 'center',
        }}
      >
        <div
          style={{
            display: 'flex',
            fontSize: name.length > 28 ? 64 : 80,
            fontWeight: 800,
            color: '#ffffff',
            lineHeight: 1.15,
            maxWidth: 980,
            textShadow: '0 4px 24px rgba(0,0,0,0.45)',
          }}
        >
          {name}
        </div>
        {event?.hostName ? (
          <div
            style={{
              display: 'flex',
              marginTop: 28,
              fontSize: 36,
              fontWeight: 600,
              color: 'rgba(255,255,255,0.92)',
              textShadow: '0 2px 12px rgba(0,0,0,0.4)',
            }}
          >
            {event.hostName}
          </div>
        ) : null}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            marginTop: 56,
            gap: 12,
            padding: '14px 32px',
            borderRadius: 999,
            background: 'rgba(17,15,20,0.35)',
            fontSize: 30,
            fontWeight: 700,
            color: '#ffffff',
          }}
        >
          🎁 {brand}
        </div>
      </div>
    ),
    { ...size },
  )
}
