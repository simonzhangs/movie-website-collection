import type { Metadata } from 'next';
import { NextIntlClientProvider } from 'next-intl';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { routing } from '@/i18n/routing';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import AdSlot from '@/components/seo/AdSlot';

// 预生成所有语言的静态布局
export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'seo' });

  return {
    metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'),
    title: {
      default: `${t('siteName')} - ${t('siteDescription')}`,
      template: `%s | ${t('siteName')}`,
    },
    description: t('siteDescription'),
    openGraph: {
      title: t('siteName'),
      description: t('siteDescription'),
      type: 'website',
      locale,
    },
    twitter: {
      card: 'summary_large_image',
    },
    alternates: {
      languages: {
        en: '/en',
        zh: '/zh',
      },
    },
  };
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  // 验证 locale
  if (!routing.locales.includes(locale as 'en' | 'zh')) {
    notFound();
  }

  // 启用静态渲染
  setRequestLocale(locale);

  return (
    <div className="min-h-screen flex flex-col">
      <NextIntlClientProvider>
        <Header />
        <main className="flex-1">
          {children}
          {/* 页面底部广告位 */}
          <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
            <AdSlot slotId="footer-banner" format="horizontal" />
          </div>
        </main>
        <Footer />
      </NextIntlClientProvider>
    </div>
  );
}
