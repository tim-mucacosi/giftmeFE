import "./globals.css";
import { TolgeeNextProvider } from "@/tolgee/client";
import { getLanguage } from "@/tolgee/language";
import { getStaticData } from "@/tolgee/shared";
import { ToastProvider } from '@/components/shared/Toast'
import { Metadata, Viewport } from "next";

export const metadata: Metadata = {
  title: 'PokloniMi — Slavlje bez neželjenih poklona',
  description:
    'Napravi listu želja, podeli sa gostima, i svi su srećni. Bez registracije za goste.',
  icons: {
    icon: [
      {
        url:
          'data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22%3E%3Ctext y=%22.9em%22 font-size=%2290%22%3E%F0%9F%8E%81%3C/text%3E%3C/svg%3E',
      },
    ],
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
    <html>
      <body>
        <TolgeeNextProvider language={locale} staticData={staticData}>
          <ToastProvider>
            { children }
          </ToastProvider>
        </TolgeeNextProvider>
      </body>
    </html>
  );
}
