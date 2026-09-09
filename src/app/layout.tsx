import type { Metadata, Viewport } from 'next';
import './globals.css';
import { Providers } from '@/components/Providers';

export const metadata: Metadata = {
  metadataBase: new URL('https://axiom.tolzy.me'),
  title: {
    default: 'AXIOM V2 | TOLZY AI - المساعد الذكي فائق التطور',
    template: '%s | AXIOM V2 - TOLZY AI'
  },
  description: 'المساعد الذكي فائق التطور AXIOM V2 من منظومة TOLZY AI. يوفر حلول برمجية ذكية، تخليق صور مذهلة بنموذج FLUX.2 Pro، بحث حي عبر الإنترنت، وتجربة دردشة ثنائية مصممة للغة العربية.',
  keywords: [
    'AXIOM',
    'AXIOM V2',
    'TOLZY AI',
    'TOLZY',
    'ذكاء اصطناعي',
    'مساعد ذكي',
    'توليد الصور',
    'تخليق الصور',
    'FLUX.2 Pro',
    'شات بوت عربي',
    'برمجة وأكواد',
    'بحث حي عبر الويب',
    'Azure AI',
    'PWA'
  ],
  authors: [{ name: 'TOLZY AI', url: 'https://tolzy.me' }],
  creator: 'TOLZY AI Team',
  publisher: 'TOLZY AI',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  alternates: {
    canonical: 'https://axiom.tolzy.me',
    languages: {
      'ar': 'https://axiom.tolzy.me',
      'ar-EG': 'https://axiom.tolzy.me',
      'ar-SA': 'https://axiom.tolzy.me',
      'en': 'https://axiom.tolzy.me',
    }
  },
  openGraph: {
    type: 'website',
    locale: 'ar_AR',
    alternateLocale: ['en_US', 'ar_EG', 'ar_SA'],
    url: 'https://axiom.tolzy.me',
    siteName: 'AXIOM V2 | TOLZY AI',
    title: 'AXIOM V2 | TOLZY AI - المساعد الذكي فائق التطور',
    description: 'المساعد الذكي فائق التطور AXIOM V2 من منظومة TOLZY AI للبرمجة وتخليق الصور بنموذج FLUX.2 Pro والبحث المباشر عبر الإنترنت.',
    images: [
      {
        url: '/icon-512.svg',
        width: 512,
        height: 512,
        alt: 'شعار AXIOM V2 المساعد الذكي',
      }
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AXIOM V2 | TOLZY AI - المساعد الذكي فائق التطور',
    description: 'المساعد الذكي فائق التطور AXIOM V2 من منظومة TOLZY AI للبرمجة وتوليد الصور بنموذج FLUX.2 Pro والبحث المباشر.',
    creator: '@tolzy_ai',
    images: ['/icon-512.svg'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'AXIOM V2',
  },
  icons: {
    icon: [
      { url: '/icon-192.svg', sizes: '192x192', type: 'image/svg+xml' },
      { url: '/icon-512.svg', sizes: '512x512', type: 'image/svg+xml' }
    ],
    apple: [
      { url: '/icon-192.svg', sizes: '192x192', type: 'image/svg+xml' }
    ],
  },
  category: 'technology'
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
  // Schema.org Structured Data (JSON-LD) for Search Engine Rich Snippets
  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Organization',
        '@id': 'https://tolzy.me/#organization',
        'name': 'TOLZY AI',
        'url': 'https://tolzy.me',
        'logo': 'https://axiom.tolzy.me/icon-512.svg',
        'sameAs': [
          'https://axiom.tolzy.me',
          'https://tolzy.me'
        ]
      },
      {
        '@type': 'WebSite',
        '@id': 'https://axiom.tolzy.me/#website',
        'url': 'https://axiom.tolzy.me',
        'name': 'AXIOM V2',
        'description': 'المساعد الذكي فائق التطور AXIOM V2 من منظومة TOLZY AI',
        'publisher': {
          '@id': 'https://tolzy.me/#organization'
        },
        'inLanguage': 'ar'
      },
      {
        '@type': 'SoftwareApplication',
        '@id': 'https://axiom.tolzy.me/#app',
        'name': 'AXIOM V2',
        'operatingSystem': 'All',
        'applicationCategory': 'BusinessApplication, DeveloperApplication, MultimediaApplication',
        'offers': {
          '@type': 'Offer',
          'price': '0',
          'priceCurrency': 'USD'
        },
        'description': 'مساعد الذكاء الاصطناعي AXIOM V2 لكتابة الأكواد وتخليق الصور بنموذج FLUX.2 Pro والبحث المباشر عبر الإنترنت.'
      }
    ]
  };

  return (
    <html lang="ar" dir="rtl" className="dark" suppressHydrationWarning>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="antialiased selection:bg-blue-500/20">
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
