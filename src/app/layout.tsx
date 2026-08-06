import "./globals.css";
import { cookies } from "next/headers";
import Script from "next/script";
import { GoogleAnalytics } from "@next/third-parties/google";
import { TolgeeNextProvider } from "@/tolgee/client";
import { getLanguage } from "@/tolgee/language";
import { getStaticData } from "@/tolgee/shared";
import { ToastProvider } from '@/components/shared/Toast'
import { PwaRegister } from '@/components/shared/PwaRegister'
import { ConsentBanner } from '@/components/shared/ConsentBanner'
import { CONSENT_COOKIE, GEO_COOKIE, type ConsentValue } from '@/lib/consent/constants'
import { Metadata, Viewport } from "next";

// Only loaded in production so local/dev traffic never pollutes GA4 data.
const GA_MEASUREMENT_ID =
  process.env.NODE_ENV === 'production' ? process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID : undefined

interface SiteMetaMessages {
  common: { appName: string }
  landing: { meta: { title: string; description: string } }
}

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLanguage()
  const messages = ((await import(`../../messages/${locale}.json`)).default) as SiteMetaMessages
  const { title, description } = messages.landing.meta
  const appName = messages.common.appName

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      siteName: appName,
      type: 'website',
    },
    manifest: '/manifest.webmanifest',
    appleWebApp: {
      capable: true,
      statusBarStyle: 'default',
      title: appName,
    },
    icons: {
      icon: [
        { url: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
        { url: '/icons/icon-512.png', sizes: '512x512', type: 'image/png' },
      ],
      apple: [{ url: '/icons/apple-touch-icon.png', sizes: '180x180', type: 'image/png' }],
    },
  }
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#fffaf8',
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = await getLanguage();
  const staticData = await getStaticData([locale, 'sr']);

  // Region + any prior answer, both set via cookies (middleware sets the
  // region on every request; the banner sets the answer once the visitor
  // responds). EEA visitors default to denied until they say otherwise;
  // everyone else is granted outright, no banner needed.
  const cookieStore = cookies();
  const isEea = cookieStore.get(GEO_COOKIE)?.value === 'eea';
  const priorConsent = cookieStore.get(CONSENT_COOKIE)?.value as ConsentValue | undefined;
  const initialConsent: ConsentValue = priorConsent ?? (isEea ? 'denied' : 'granted');
  const showConsentBanner = isEea && !priorConsent;

  return (
    <html lang={locale}>
      <body>
        <TolgeeNextProvider language={locale} staticData={staticData}>
          <ToastProvider>
            { children }
          </ToastProvider>
          {GA_MEASUREMENT_ID && <ConsentBanner initialShow={showConsentBanner} />}
        </TolgeeNextProvider>
        <PwaRegister />
      </body>
      {GA_MEASUREMENT_ID && (
        <>
          {/* Must run before the GA tag below so gtag.js sees the consent
              state from its very first hit, not after the fact. */}
          <Script id="consent-default" strategy="beforeInteractive">
            {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('consent','default',{'analytics_storage':'${initialConsent}','ad_storage':'denied','ad_user_data':'denied','ad_personalization':'denied'});`}
          </Script>
          <GoogleAnalytics gaId={GA_MEASUREMENT_ID} />
        </>
      )}
    </html>
  );
}
