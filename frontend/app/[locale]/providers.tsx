'use client';

import {NextIntlClientProvider} from 'next-intl';
import {AuthProvider} from '@/app/context/AuthContext';
import {SavedProvider} from '@/app/context/SavedContext';
import SmoothScroll from '@/app/components/SmoothScroll';
import ScrollToTop from '@/app/components/ScrollToTop';
import SavedToast from '@/app/components/SavedToast';
import SiteHeader from '@/app/components/SiteHeader';

export default function Providers({
  children,
  locale,
  messages,
}: {
  children: React.ReactNode;
  locale: string;
  messages: Record<string, any>;
}) {
  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      <SmoothScroll>
        <AuthProvider>
          <SavedProvider>
            <SiteHeader />
            {children}
            <SavedToast />
          </SavedProvider>
        </AuthProvider>
      </SmoothScroll>
      <ScrollToTop />
    </NextIntlClientProvider>
  );
}
