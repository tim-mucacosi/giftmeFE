import "./globals.css";
import { TolgeeNextProvider } from "@/tolgee/client";
import { getLanguage } from "@/tolgee/language";
import { getStaticData } from "@/tolgee/shared";
import { ToastProvider } from '@/components/shared/Toast'
import { PwaRegister } from '@/components/shared/PwaRegister'
import { Metadata, Viewport } from "next";

export const metadata: Metadata = {
  title: 'PokloniMi — Slavlje bez neželjenih poklona',
  description:
    'Napravi listu želja, podeli sa gostima, i svi su srećni. Bez registracije za goste.',
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
