import { setRequestLocale, getTranslations } from 'next-intl/server';
import { getPopularMovies, getTopRatedMovies } from '@/lib/tmdb/client';
import MediaGrid from '@/components/media/MediaGrid';
import AdSlot from '@/components/seo/AdSlot';
import Breadcrumb from '@/components/seo/Breadcrumb';
import { Link } from '@/i18n/navigation';
import type { Metadata } from 'next';

interface MoviesPageProps {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ page?: string }>;
}

export async function generateMetadata({
  params,
}: MoviesPageProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'seo' });
  return {
    title: t('moviesListTitle'),
    description: t('moviesListDescription'),
  };
}

export default async function MoviesPage({ params, searchParams }: MoviesPageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  const { page: pageStr } = await searchParams;
  const page = Math.max(1, parseInt(pageStr || '1', 10) || 1);

  const t = await getTranslations('home');
  const tNav = await getTranslations('nav');
  const tListing = await getTranslations('listing');

  const [popular, topRated] = await Promise.all([
    getPopularMovies(locale, page),
    getTopRatedMovies(locale, 1),
  ]);

  const totalPages = Math.min(popular.total_pages, 500); // TMDB 最大 500 页

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <Breadcrumb
        items={[
          { label: tNav('home'), href: '/' },
          { label: tNav('movies') },
        ]}
      />
      <h1 className="mb-8 mt-4 text-3xl font-bold text-white">{t('popularMovies')}</h1>

      {/* ─── 当前页电影 ─── */}
      <MediaGrid items={popular.results} mediaType="movie" />

      {/* ─── 广告位 ─── */}
      <div className="my-8">
        <AdSlot slotId="movies-list" format="horizontal" />
      </div>

      {/* ─── 分页 ─── */}
      <div className="mt-8 flex items-center justify-center gap-4">
        {page > 1 ? (
          <Link
            href={`/movies?page=${page - 1}`}
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
            href={`/movies?page=${page + 1}`}
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
        <MediaGrid items={topRated.results.slice(0, 12)} mediaType="movie" />
      </section>
    </div>
  );
}
