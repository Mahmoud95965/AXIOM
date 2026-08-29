import type { Metadata, Viewport } from 'next';
import './globals.css';
import { Providers } from '@/components/Providers';

export const metadata: Metadata = {
  title: 'AXIOM V2 | TOLZY AI - المساعد الذكي فائق التطور',
  description: 'المساعد الذكي فائق التطور AXIOM V2 من منظومة TOLZY AI بتصميم وتجربة احترافية متطورة للبرمجة وتوليد الصور وحل المشكلات المعقدة.',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'AXIOM V2',
  },
  icons: {
    icon: '/icon-192.svg',
    apple: '/icon-192.svg',
  }
};

export const viewport: Viewport = {
  themeColor: '#0a0a0c',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl" className="dark" suppressHydrationWarning>
      <body className="antialiased selection:bg-blue-500/20">
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
