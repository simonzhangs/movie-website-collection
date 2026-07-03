import { setRequestLocale, getTranslations } from 'next-intl/server';
import { getPopularTV, getTopRatedTV } from '@/lib/tmdb/client';
import MediaGrid from '@/components/media/MediaGrid';
import AdSlot from '@/components/seo/AdSlot';
import { Link } from '@/i18n/navigation';
import type { Metadata } from 'next';

interface TVListPageProps {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ page?: string }>;
}

export async function generateMetadata({
  params,
}: TVListPageProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'home' });
  return {
    title: t('popularTV'),
    description: t('subtitle'),
  };
}

export default async function TVListPage({ params, searchParams }: TVListPageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  const { page: pageStr } = await searchParams;
  const page = Math.max(1, parseInt(pageStr || '1', 10) || 1);

  const t = await getTranslations('home');
  const tListing = await getTranslations('listing');

  const [popular, topRated] = await Promise.all([
    getPopularTV(locale, page),
    getTopRatedTV(locale, 1),
  ]);

  const totalPages = Math.min(popular.total_pages, 500);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="mb-8 text-3xl font-bold text-white">{t('popularTV')}</h1>

      {/* ─── 当前页剧集 ─── */}
      <MediaGrid items={popular.results} mediaType="tv" />

      {/* ─── 广告位 ─── */}
      <div className="my-8">
        <AdSlot slotId="tv-list" format="horizontal" />
      </div>

      {/* ─── 分页 ─── */}
      <div className="mt-8 flex items-center justify-center gap-4">
        {page > 1 ? (
          <Link
            href={`/tv?page=${page - 1}`}
            className="rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-sm transition hover:bg-white/10"
          >
            ← {tListing('prev')}
          </Link>
        ) : (
          <span className="rounded-lg border border-white/5 px-4 py-2 text-sm text-gray-600">
            ← {tListing('prev')}
          </span>
        )}

        <span className="text-sm text-gray-400">
          {tListing('page')} {page} {tListing('of')} {totalPages}
        </span>

        {page < totalPages ? (
          <Link
            href={`/tv?page=${page + 1}`}
            className="rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-sm transition hover:bg-white/10"
          >
            {tListing('next')} →
          </Link>
        ) : (
          <span className="rounded-lg border border-white/5 px-4 py-2 text-sm text-gray-600">
            {tListing('next')} →
          </span>
        )}
      </div>

      {/* ─── Top Rated 区 ─── */}
      <section className="mt-16">
        <h2 className="mb-4 text-xl font-bold text-white">{t('topRated')}</h2>
        <MediaGrid items={topRated.results.slice(0, 12)} mediaType="tv" />
      </section>
    </div>
  );
}
