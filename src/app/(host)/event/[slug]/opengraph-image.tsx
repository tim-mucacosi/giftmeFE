import { ImageResponse } from 'next/og'
import { getEventById } from '@/lib/api/events'
import { getEventEmoji } from '@/lib/utils/eventEmoji'

export const runtime = 'edge'
export const revalidate = 60
export const alt = 'PokloniMi — poziv za listu poklona'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default async function Image({ params }: { params: { slug: string } }) {
  const event = await getEventById(params.slug).catch(() => null)
  const emoji = event ? getEventEmoji(event.type, event.gender) : '🎁'
  const name = event?.name ?? 'PokloniMi'

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundImage: 'linear-gradient(135deg, #ff6b6b 0%, #ff8787 45%, #ffd93d 100%)',
          padding: '80px',
          textAlign: 'center',
        }}
      >
        <div style={{ display: 'flex', fontSize: 140, lineHeight: 1, marginBottom: 32 }}>{emoji}</div>
        <div
          style={{
            display: 'flex',
            fontSize: name.length > 28 ? 64 : 80,
            fontWeight: 800,
            color: '#ffffff',
            lineHeight: 1.15,
            maxWidth: 980,
            textShadow: '0 4px 24px rgba(45,52,54,0.35)',
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
              textShadow: '0 2px 12px rgba(45,52,54,0.3)',
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
            background: 'rgba(45,52,54,0.22)',
            fontSize: 30,
            fontWeight: 700,
            color: '#ffffff',
          }}
        >
          🎁 PokloniMi
        </div>
      </div>
    ),
    { ...size },
  )
}
