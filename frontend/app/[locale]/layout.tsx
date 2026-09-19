import type {Metadata, Viewport} from 'next';
import {hasLocale} from 'next-intl';
import {Nunito, Kantumruy_Pro} from 'next/font/google';
import {notFound} from 'next/navigation';
import {routing} from '@/src/i18n/routing';
import Providers from './providers';
import '../globals.css';

const nunito = Nunito({
  variable: '--font-nunito',
  subsets: ['latin'],
  display: 'swap',
  weight: ['400', '500', '600', '700', '800', '900'],
});

const kantumruyPro = Kantumruy_Pro({
  variable: '--font-kantumruy-pro',
  subsets: ['khmer', 'latin'],
  display: 'swap',
  weight: ['400', '500', '600', '700'],
});

export const viewport: Viewport = {
  themeColor: [
    {media: '(prefers-color-scheme: light)', color: '#E2F1F1'},
    {media: '(prefers-color-scheme: dark)', color: '#0A0D12'},
  ],
};

export async function generateStaticParams() {
  return routing.locales.map((locale) => ({locale}));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{locale: string}>;
}): Promise<Metadata> {
  const {locale} = await params;
  const isKm = locale === 'km';

  return {
    title: isKm
      ? 'Domner — ដឹកនាំអនាគតរបស់អ្នកដោយទំនុកចិត្ត'
      : 'Domner — Navigate Your Future with Confidence',
    description: isKm
      ? 'Domner ជួយសិស្សរកឃើញ វាយតម្លៃ ផ្ទៀងផ្ទាត់ និងប្រៀបធៀបព័ត៌មានឌីជីថលអំពីអាជីព មុខជំនាញ សាកលវិទ្យាល័យ និងអាហារូបករណ៍ ដើម្បីឱ្យពួកគេអាចសម្រេចចិត្តបានត្រឹមត្រូវ។'
      : 'Domner helps students discover, evaluate, verify, and compare digital information about careers, majors, universities, and scholarships so they can make informed decisions.',
  };
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{locale: string}>;
}) {
  const {locale} = await params;

  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  const messages = (await import(`../../messages/${locale}.json`)).default;

  return (
    <html lang={locale} suppressHydrationWarning className={`${nunito.variable} ${kantumruyPro.variable} antialiased`}>
      <head />
      <body suppressHydrationWarning className="min-h-screen flex flex-col">
        <Providers locale={locale} messages={messages}>
          <main id="main-content" className="flex-1">
            {children}
          </main>
        </Providers>
      </body>
    </html>
  );
}
