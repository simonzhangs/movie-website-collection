import { setRequestLocale, getTranslations } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { getTVDetails, getEpisodeDetails, getImageUrl } from '@/lib/tmdb/client';
import { episodeMetadata, episodeJsonLd } from '@/lib/seo/metadata';
import JsonLd from '@/components/seo/JsonLd';
import AdSlot from '@/components/seo/AdSlot';
import { Link } from '@/i18n/navigation';
import type { Metadata } from 'next';

interface EpisodePageProps {
  params: Promise<{ locale: string; id: string; s: string; e: string }>;
}

export const dynamicParams = true;

export async function generateMetadata({
  params,
}: EpisodePageProps): Promise<Metadata> {
  const { id, locale, s, e } = await params;
  const season = parseInt(s, 10);
  const episode = parseInt(e, 10);
  if (isNaN(season) || isNaN(episode)) return { title: 'Episode' };

  try {
    const [tv, episodeData] = await Promise.all([
      getTVDetails(id, locale),
      getEpisodeDetails(id, season, episode, locale),
    ]);
    return episodeMetadata(episodeData, tv.name, id, season, locale);
  } catch {
    return { title: 'Episode' };
  }
}

export default async function EpisodePage({ params }: EpisodePageProps) {
  const { id, locale, s, e } = await params;
  setRequestLocale(locale);

  const season = parseInt(s, 10);
  const episode = parseInt(e, 10);
  if (isNaN(season) || isNaN(episode)) notFound();

  const t = await getTranslations('episode');
  const tTv = await getTranslations('tv');

  let tv;
  let episodeData;
  try {
    [tv, episodeData] = await Promise.all([
      getTVDetails(id, locale),
      getEpisodeDetails(id, season, episode, locale),
    ]);
  } catch {
    notFound();
  }

  // 上一集 / 下一集导航
  const prevEp = episode > 1 ? { s: season, e: episode - 1 } : null;
  const nextEp = episode + 1;

  return (
    <div>
      <JsonLd data={episodeJsonLd(episodeData, tv.name, id, season)} />

      {/* ─── Hero / Still ─── */}
      <section className="relative h-[35vh] min-h-[250px] w-full overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={getImageUrl(episodeData.still_path || tv.backdrop_path, 'original')}
          alt={`${tv.name} S${season}E${episode} - ${episodeData.name}`}
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0f] via-[#0a0a0f]/50 to-transparent" />
      </section>

      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        {/* ─── 面包屑 ─── */}
        <nav className="-mt-20 flex items-center gap-2 text-sm text-gray-400">
          <Link href={`/tv/${id}`} className="transition hover:text-indigo-400">
            {tv.name}
          </Link>
          <span>/</span>
          <span className="text-gray-300">
            {tTv('season')} {season} · {t('episode')} {episode}
          </span>
        </nav>

        {/* ─── 标题 ─── */}
        <div className="mt-6">
          <span className="mb-2 inline-block rounded-full bg-indigo-500/20 px-3 py-1 text-xs font-medium text-indigo-300">
            {tv.name} · {tTv('season')} {season} · {t('episode')} {episode}
          </span>
          <h1 className="text-3xl font-bold text-white sm:text-4xl">
            {episodeData.name}
          </h1>
        </div>

        {/* ─── 基本信息 ─── */}
        <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-gray-400">
          {episodeData.air_date && (
            <span className="flex items-center gap-1">
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              {t('airDate')}: {episodeData.air_date}
            </span>
          )}
          {episodeData.runtime && (
            <span className="flex items-center gap-1">
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {episodeData.runtime} {t('minutes')}
            </span>
          )}
          {episodeData.vote_average > 0 && (
            <span className="flex items-center gap-1 text-yellow-400">
              <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
              {episodeData.vote_average.toFixed(1)}
            </span>
          )}
        </div>

        {/* ─── 简介 ─── */}
        <div className="mt-6">
          <h2 className="mb-2 text-lg font-semibold text-white">{t('overview')}</h2>
          <p className="leading-relaxed text-gray-300">
            {episodeData.overview || 'No overview available.'}
          </p>
        </div>

        {/* ─── 广告位 ─── */}
        <div className="mt-8">
          <AdSlot slotId="episode-detail" format="horizontal" />
        </div>

        {/* ─── 上一集 / 下一集 导航 ─── */}
        <div className="mt-8 flex items-center justify-between border-t border-white/5 pt-6">
          {prevEp ? (
            <Link
              href={`/tv/${id}/season/${prevEp.s}/episode/${prevEp.e}`}
              className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-sm transition hover:bg-white/10"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              <span>{t('episode')} {prevEp.e}</span>
            </Link>
          ) : (
            <div />
          )}

          <Link
            href={`/tv/${id}`}
            className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-sm transition hover:bg-white/10"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16l-4-4m0 0l4-4m-4 4h18" />
            </svg>
            {t('backToShow')}
          </Link>

          <Link
            href={`/tv/${id}/season/${season}/episode/${nextEp}`}
            className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-sm transition hover:bg-white/10"
          >
            <span>{t('episode')} {nextEp}</span>
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      </div>
    </div>
  );
}
