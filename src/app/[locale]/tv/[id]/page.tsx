import { setRequestLocale, getTranslations } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { getTVDetails, getSimilarTV, getImageUrl, getPopularTVIds } from '@/lib/tmdb/client';
import { tvMetadata, tvJsonLd } from '@/lib/seo/metadata';
import JsonLd from '@/components/seo/JsonLd';
import AdSlot from '@/components/seo/AdSlot';
import MediaGrid from '@/components/media/MediaGrid';
import { Link } from '@/i18n/navigation';
import type { Metadata } from 'next';
import type { TMDBSeason } from '@/lib/tmdb/types';

interface TVPageProps {
  params: Promise<{ locale: string; id: string }>;
}

// ─── ISR：预生成热门剧集页面 ───
export async function generateStaticParams() {
  const ids = await getPopularTVIds(20);
  return ids.map((id) => ({ id }));
}

export const dynamicParams = true;

export async function generateMetadata({
  params,
}: TVPageProps): Promise<Metadata> {
  const { id, locale } = await params;
  try {
    const tv = await getTVDetails(id, locale);
    return tvMetadata(tv, locale);
  } catch {
    return { title: 'TV Show' };
  }
}

export default async function TVDetailPage({ params }: TVPageProps) {
  const { id, locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations('tv');

  let tv;
  let similar;
  try {
    [tv, similar] = await Promise.all([
      getTVDetails(id, locale),
      getSimilarTV(id, locale, 1),
    ]);
  } catch {
    notFound();
  }

  const firstYear = tv.first_air_date?.split('-')[0];

  return (
    <div>
      <JsonLd data={tvJsonLd(tv)} />

      {/* ─── Hero ─── */}
      <section className="relative h-[40vh] min-h-[300px] w-full overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={getImageUrl(tv.backdrop_path, 'original')}
          alt={tv.name}
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0f] via-[#0a0a0f]/50 to-transparent" />
      </section>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="-mt-32 flex flex-col gap-8 md:flex-row">
          {/* 海报 */}
          <div className="flex-shrink-0">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={getImageUrl(tv.poster_path, 'w500')}
              alt={tv.name}
              className="w-40 rounded-xl shadow-2xl sm:w-52"
            />
          </div>

          {/* 信息 */}
          <div className="flex-1 pt-4">
            <h1 className="text-3xl font-bold text-white sm:text-4xl">
              {tv.name}
              {firstYear && <span className="ml-2 text-xl font-normal text-gray-400">({firstYear})</span>}
            </h1>
            {tv.tagline && (
              <p className="mt-2 text-lg italic text-gray-400">&ldquo;{tv.tagline}&rdquo;</p>
            )}

            {/* 基本信息 */}
            <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-gray-300">
              {tv.vote_average > 0 && (
                <span className="flex items-center gap-1 font-semibold text-yellow-400">
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                  {tv.vote_average.toFixed(1)}
                </span>
              )}
              <span>{tv.number_of_seasons} {t('seasons')}</span>
              <span>{tv.number_of_episodes} {t('episodes')}</span>
              {tv.status && (
                <span className="rounded-full bg-white/10 px-3 py-0.5">{tv.status}</span>
              )}
              {tv.first_air_date && (
                <span>{t('firstAired')}: {tv.first_air_date}</span>
              )}
            </div>

            {/* 类型 */}
            {tv.genres.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-2">
                {tv.genres.map((genre) => (
                  <span
                    key={genre.id}
                    className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-gray-300"
                  >
                    {genre.name}
                  </span>
                ))}
              </div>
            )}

            {/* 简介 */}
            <div className="mt-6">
              <h2 className="mb-2 text-lg font-semibold text-white">{t('overview')}</h2>
              <p className="leading-relaxed text-gray-300">
                {tv.overview || 'No overview available.'}
              </p>
            </div>
          </div>
        </div>

        {/* ─── 广告位 ─── */}
        <div className="mt-8">
          <AdSlot slotId="tv-detail" format="horizontal" />
        </div>

        {/* ─── 季数 & 剧集列表 ─── */}
        <section className="mt-12 mb-8">
          <h2 className="mb-6 text-xl font-bold text-white">{t('seasons')}</h2>
          <div className="space-y-8">
            {tv.seasons
              .filter((s: TMDBSeason) => s.season_number > 0 || s.episode_count > 0)
              .map((season: TMDBSeason) => (
                <div key={season.id} className="rounded-xl border border-white/5 bg-white/[0.02] p-5">
                  <div className="flex items-start gap-4">
                    {/* 季海报 */}
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={getImageUrl(season.poster_path, 'w154')}
                      alt={season.name}
                      className="h-36 w-24 flex-shrink-0 rounded-lg object-cover"
                    />
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-white">{season.name}</h3>
                      <p className="mt-1 text-sm text-gray-400">
                        {season.episode_count} {t('episodes')}
                        {season.air_date && ` · ${season.air_date}`}
                      </p>
                      {season.overview && (
                        <p className="mt-2 line-clamp-2 text-sm text-gray-300">{season.overview}</p>
                      )}

                      {/* 剧集链接列表 */}
                      <div className="mt-3 flex flex-wrap gap-2">
                        {Array.from({ length: Math.min(season.episode_count, 20) }, (_, i) => i + 1).map(
                          (epNum) => (
                            <Link
                              key={epNum}
                              href={`/tv/${id}/season/${season.season_number}/episode/${epNum}`}
                              className="rounded-md border border-white/10 bg-white/5 px-2.5 py-1 text-xs text-gray-300 transition hover:bg-indigo-600/20 hover:text-indigo-300"
                            >
                              E{epNum}
                            </Link>
                          )
                        )}
                        {season.episode_count > 20 && (
                          <span className="self-center text-xs text-gray-500">
                            +{season.episode_count - 20} {t('episodes')}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </section>

        {/* ─── 相似剧集 ─── */}
        {similar.results.length > 0 && (
          <section className="mt-12 mb-8">
            <h2 className="mb-4 text-xl font-bold text-white">{t('similar')}</h2>
            <MediaGrid items={similar.results.slice(0, 12)} mediaType="tv" />
          </section>
        )}
      </div>
    </div>
  );
}
