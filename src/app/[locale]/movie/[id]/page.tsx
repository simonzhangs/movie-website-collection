import { setRequestLocale, getTranslations } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { getMovieDetails, getSimilarMovies, getImageUrl, getPopularMovieIds } from '@/lib/tmdb/client';
import { movieMetadata, movieJsonLd } from '@/lib/seo/metadata';
import JsonLd from '@/components/seo/JsonLd';
import AdSlot from '@/components/seo/AdSlot';
import MediaGrid from '@/components/media/MediaGrid';
import type { Metadata } from 'next';

interface MoviePageProps {
  params: Promise<{ locale: string; id: string }>;
}

// ─── ISR：预生成热门电影页面 ───
export async function generateStaticParams() {
  const ids = await getPopularMovieIds(20);
  return ids.map((id) => ({ id }));
}

export const dynamicParams = true; // 允许按需生成未预渲染的页面

export async function generateMetadata({
  params,
}: MoviePageProps): Promise<Metadata> {
  const { id, locale } = await params;
  try {
    const movie = await getMovieDetails(id, locale);
    return movieMetadata(movie, locale);
  } catch {
    return { title: 'Movie' };
  }
}

export default async function MovieDetailPage({ params }: MoviePageProps) {
  const { id, locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations('movie');

  let movie;
  let similar;
  try {
    [movie, similar] = await Promise.all([
      getMovieDetails(id, locale),
      getSimilarMovies(id, locale, 1),
    ]);
  } catch {
    notFound();
  }

  const releaseYear = movie.release_date?.split('-')[0];

  return (
    <div>
      {/* ─── JSON-LD 结构化数据 ─── */}
      <JsonLd data={movieJsonLd(movie)} />

      {/* ─── Hero / Backdrop ─── */}
      <section className="relative h-[40vh] min-h-[300px] w-full overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={getImageUrl(movie.backdrop_path, 'original')}
          alt={movie.title}
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0f] via-[#0a0a0f]/50 to-transparent" />
      </section>

      {/* ─── 主要内容 ─── */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="-mt-32 flex flex-col gap-8 md:flex-row">
          {/* 海报 */}
          <div className="flex-shrink-0">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={getImageUrl(movie.poster_path, 'w500')}
              alt={movie.title}
              className="w-40 rounded-xl shadow-2xl sm:w-52"
            />
          </div>

          {/* 信息 */}
          <div className="flex-1 pt-4">
            <h1 className="text-3xl font-bold text-white sm:text-4xl">
              {movie.title}
              {releaseYear && <span className="ml-2 text-xl font-normal text-gray-400">({releaseYear})</span>}
            </h1>
            {movie.tagline && (
              <p className="mt-2 text-lg italic text-gray-400">&ldquo;{movie.tagline}&rdquo;</p>
            )}

            {/* 评分 + 基本信息 */}
            <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-gray-300">
              {movie.vote_average > 0 && (
                <span className="flex items-center gap-1 font-semibold text-yellow-400">
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                  {movie.vote_average.toFixed(1)} ({movie.vote_count} {t('reviews')})
                </span>
              )}
              {movie.runtime && (
                <span>{movie.runtime} {t('minutes')}</span>
              )}
              {movie.status && (
                <span className="rounded-full bg-white/10 px-3 py-0.5">{movie.status}</span>
              )}
              {movie.release_date && (
                <span>{t('releaseDate')}: {movie.release_date}</span>
              )}
            </div>

            {/* 类型 */}
            {movie.genres.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-2">
                {movie.genres.map((genre) => (
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
                {movie.overview || 'No overview available.'}
              </p>
            </div>
          </div>
        </div>

        {/* ─── 广告位 ─── */}
        <div className="mt-8">
          <AdSlot slotId="movie-detail" format="horizontal" />
        </div>

        {/* ─── 相似电影 ─── */}
        {similar.results.length > 0 && (
          <section className="mt-12 mb-8">
            <h2 className="mb-4 text-xl font-bold text-white">{t('similar')}</h2>
            <MediaGrid items={similar.results.slice(0, 12)} mediaType="movie" />
          </section>
        )}
      </div>
    </div>
  );
}
