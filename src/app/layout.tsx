import "./globals.css";
import { TolgeeNextProvider } from "@/tolgee/client";
import { getLanguage } from "@/tolgee/language";
import { getStaticData } from "@/tolgee/shared";
import { ToastProvider } from '@/components/shared/Toast'
import { PwaRegister } from '@/components/shared/PwaRegister'
import { Metadata, Viewport } from "next";

interface SiteMetaMessages {
  landing: { meta: { title: string; description: string } }
}

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLanguage()
  const messages = ((await import(`../../messages/${locale}.json`)).default) as SiteMetaMessages
  const { title, description } = messages.landing.meta

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      siteName: 'PokloniMi',
      type: 'website',
    },
    manifest: '/manifest.webmanifest',
    appleWebApp: {
      capable: true,
      statusBarStyle: 'default',
      title: 'PokloniMi',
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
  return (
    <html lang={locale}>
      <body>
        <TolgeeNextProvider language={locale} staticData={staticData}>
          <ToastProvider>
            { children }
          </ToastProvider>
        </TolgeeNextProvider>
        <PwaRegister />
      </body>
    </html>
  );
}
