import { setRequestLocale, getTranslations } from 'next-intl/server';
import { getPopularMovies, getPopularTV, getTrending, getTopPicks, getImageUrl } from '@/lib/tmdb/client';
import MediaGrid from '@/components/media/MediaGrid';
import MediaRail from '@/components/media/MediaRail';
import AdSlot from '@/components/seo/AdSlot';
import { Link } from '@/i18n/navigation';
import type { TMDBMediaItem } from '@/lib/tmdb/types';

interface HomePageProps {
  params: Promise<{ locale: string }>;
}

export default async function HomePage({ params }: HomePageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations('home');
  const tCommon = await getTranslations('common');

  // 并行获取首页数据
  const [trending, popularMovies, popularTV, topPicks] = await Promise.all([
    getTrending(locale, 'week'),
    getPopularMovies(locale, 1),
    getPopularTV(locale, 1),
    getTopPicks(locale, 12),
  ]);

  // Hero 区域：取 trending 第一条
  const heroItem: TMDBMediaItem | undefined = trending.results[0];
  const heroType = heroItem?.media_type === 'tv' || (!heroItem?.title && !!heroItem?.name) ? 'tv' : 'movie';
  const heroHref = heroItem ? (heroType === 'movie' ? `/movie/${heroItem.id}` : `/tv/${heroItem.id}`) : '/';
  const heroTitle = heroItem?.title || heroItem?.name || '';
  const heroOverview = heroItem?.overview || '';

  // 趋势轨道：trending 第 2~11 条
  const railItems = trending.results.slice(1, 11);

  return (
    <div>
      {/* ─── 紧凑 Hero Banner (~30vh) ─── */}
      {heroItem && (
        <section className="relative h-[32vh] min-h-[280px] w-full overflow-hidden">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={getImageUrl(heroItem.backdrop_path, 'original')}
            alt={heroTitle}
            className="absolute inset-0 h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0f] via-[#0a0a0f]/50 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#0a0a0f]/80 to-transparent" />

          <div className="relative flex h-full items-end">
            <div className="mx-auto w-full max-w-7xl px-4 pb-6 sm:px-6 lg:px-8">
              <div className="max-w-2xl">
                <span className="mb-2 inline-block rounded-full bg-indigo-500/20 px-3 py-1 text-xs font-medium text-indigo-300">
                  {t('trending')}
                </span>
                <h1 className="mb-2 text-3xl font-bold text-white sm:text-4xl lg:text-5xl">
                  {heroTitle}
                </h1>
                <p className="mb-4 line-clamp-2 text-sm text-gray-300 sm:text-base">
                  {heroOverview}
                </p>
                <Link
                  href={heroHref}
                  className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-500"
                >
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {t('viewDetails')}
                </Link>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ─── 趋势轨道（横向滚动，首屏可见） ─── */}
      <section className="mx-auto max-w-7xl px-4 pt-6 sm:px-6 lg:px-8">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-xl font-bold text-white">{t('trending')}</h2>
          <Link
            href="/movies"
            className="flex items-center gap-1 text-sm text-indigo-400 transition hover:text-indigo-300"
          >
            <span>{tCommon('viewAll')}</span>
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
        <MediaRail items={railItems} />
      </section>

      {/* ─── 顶部广告位 ─── */}
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <AdSlot slotId="home-top" format="horizontal" />
      </div>

      {/* ─── 为你推荐（高分混合） ─── */}
      <Section title={t('topPicks')} href="/movies" viewAllText={tCommon('viewAll')}>
        <MediaGrid items={topPicks} />
      </Section>

      {/* ─── 热门电影 ─── */}
      <Section title={t('popularMovies')} href="/movies" viewAllText={tCommon('viewAll')}>
        <MediaGrid items={popularMovies.results.slice(0, 12)} mediaType="movie" />
      </Section>

      {/* ─── 中部广告位 ─── */}
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <AdSlot slotId="home-middle" format="horizontal" />
      </div>

      {/* ─── 热门电视剧 ─── */}
      <Section title={t('popularTV')} href="/tv" viewAllText={tCommon('viewAll')}>
        <MediaGrid items={popularTV.results.slice(0, 12)} mediaType="tv" />
      </Section>
    </div>
  );
}

function Section({
  title,
  href,
  viewAllText,
  children,
}: {
  title: string;
  href: string;
  viewAllText: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-xl font-bold text-white">{title}</h3>
        <Link
          href={href}
          className="flex items-center gap-1 text-sm text-indigo-400 transition hover:text-indigo-300"
        >
          <span>{viewAllText}</span>
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </Link>
      </div>
      {children}
    </section>
  );
}
