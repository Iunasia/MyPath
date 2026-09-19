'use client';

import {NextIntlClientProvider} from 'next-intl';
import {AuthProvider} from '@/app/context/AuthContext';
import {SavedProvider} from '@/app/context/SavedContext';
import {ThemeProvider} from '@/app/context/ThemeContext';
import SmoothScroll from '@/app/components/SmoothScroll';
import ScrollToTop from '@/app/components/ScrollToTop';
import SavedToast from '@/app/components/SavedToast';
import SavedAuthModal from '@/app/components/SavedAuthModal';
import SiteHeader from '@/app/components/SiteHeader';

export default function Providers({
  children,
  locale,
  messages,
}: {
  children: React.ReactNode;
  locale: string;
  messages: Record<string, unknown>;
}) {
  return (
    <NextIntlClientProvider locale={locale} messages={messages} timeZone="Asia/Phnom_Penh">
      <ThemeProvider>
        <SmoothScroll>
          <AuthProvider>
            <SavedProvider>
              <SiteHeader />
              {children}
              <SavedToast />
              <SavedAuthModal />
            </SavedProvider>
          </AuthProvider>
        </SmoothScroll>
        <ScrollToTop />
      </ThemeProvider>
    </NextIntlClientProvider>
  );
}
