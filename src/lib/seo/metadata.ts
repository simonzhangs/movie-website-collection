import type { Metadata } from 'next';
import type { TMDBMovie, TMDBTVShow, TMDBEpisode } from '@/lib/tmdb/types';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
const IMAGE_BASE = process.env.TMDB_IMAGE_BASE_URL || 'https://image.tmdb.org/t/p';

/**
 * 生成电影的 SEO metadata
 */
export function movieMetadata(movie: TMDBMovie, locale: string): Metadata {
  const title = `${movie.title} (${movie.release_date?.split('-')[0] ?? ''})`;
  const description = movie.overview?.slice(0, 160) || movie.tagline || title;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: 'video.movie',
      url: `${SITE_URL}/${locale}/movie/${movie.id}`,
      images: movie.poster_path
        ? [{ url: `${IMAGE_BASE}/w780${movie.poster_path}`, width: 780, height: 1170 }]
        : undefined,
      locale,
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: movie.backdrop_path
        ? [`${IMAGE_BASE}/w1280${movie.backdrop_path}`]
        : undefined,
    },
    alternates: {
      canonical: `/${locale}/movie/${movie.id}`,
      languages: {
        en: `/en/movie/${movie.id}`,
        zh: `/zh/movie/${movie.id}`,
      },
    },
  };
}

/**
 * 生成电视剧的 SEO metadata
 */
export function tvMetadata(tv: TMDBTVShow, locale: string): Metadata {
  const title = `${tv.name} (${tv.first_air_date?.split('-')[0] ?? ''})`;
  const description = tv.overview?.slice(0, 160) || tv.tagline || title;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: 'video.tv_show',
      url: `${SITE_URL}/${locale}/tv/${tv.id}`,
      images: tv.poster_path
        ? [{ url: `${IMAGE_BASE}/w780${tv.poster_path}`, width: 780, height: 1170 }]
        : undefined,
      locale,
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: tv.backdrop_path
        ? [`${IMAGE_BASE}/w1280${tv.backdrop_path}`]
        : undefined,
    },
    alternates: {
      canonical: `/${locale}/tv/${tv.id}`,
      languages: {
        en: `/en/tv/${tv.id}`,
        zh: `/zh/tv/${tv.id}`,
      },
    },
  };
}

/**
 * 生成单集的 SEO metadata
 */
export function episodeMetadata(
  episode: TMDBEpisode,
  tvName: string,
  tvId: string,
  seasonNumber: number,
  locale: string
): Metadata {
  const title = `${tvName} S${seasonNumber}E${episode.episode_number} - ${episode.name}`;
  const description = episode.overview?.slice(0, 160) || title;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: 'video.episode',
      url: `${SITE_URL}/${locale}/tv/${tvId}/season/${seasonNumber}/episode/${episode.episode_number}`,
      images: episode.still_path
        ? [{ url: `${IMAGE_BASE}/w780${episode.still_path}`, width: 780, height: 439 }]
        : undefined,
      locale,
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
    alternates: {
      canonical: `/${locale}/tv/${tvId}/season/${seasonNumber}/episode/${episode.episode_number}`,
    },
  };
}

/**
 * JSON-LD 结构化数据 - 电影
 */
export function movieJsonLd(movie: TMDBMovie) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Movie',
    name: movie.title,
    description: movie.overview,
    datePublished: movie.release_date,
    duration: movie.runtime ? `PT${movie.runtime}M` : undefined,
    genre: movie.genres.map((g) => g.name),
    aggregateRating: movie.vote_count > 0
      ? {
          '@type': 'AggregateRating',
          ratingValue: movie.vote_average,
          ratingCount: movie.vote_count,
        }
      : undefined,
    image: movie.poster_path
      ? `${IMAGE_BASE}/w500${movie.poster_path}`
      : undefined,
  };
}

/**
 * JSON-LD 结构化数据 - 电视剧
 */
export function tvJsonLd(tv: TMDBTVShow) {
  return {
    '@context': 'https://schema.org',
    '@type': 'TVSeries',
    name: tv.name,
    description: tv.overview,
    datePublished: tv.first_air_date,
    numberOfSeasons: tv.number_of_seasons,
    numberOfEpisodes: tv.number_of_episodes,
    genre: tv.genres.map((g) => g.name),
    aggregateRating: tv.vote_count > 0
      ? {
          '@type': 'AggregateRating',
          ratingValue: tv.vote_average,
          ratingCount: tv.vote_count,
        }
      : undefined,
    image: tv.poster_path
      ? `${IMAGE_BASE}/w500${tv.poster_path}`
      : undefined,
  };
}

/**
 * JSON-LD 结构化数据 - 单集
 */
export function episodeJsonLd(
  episode: TMDBEpisode,
  tvName: string,
  tvId: string,
  seasonNumber: number
) {
  return {
    '@context': 'https://schema.org',
    '@type': 'TVEpisode',
    name: episode.name,
    description: episode.overview,
    episodeNumber: episode.episode_number,
    seasonNumber: seasonNumber,
    partOfSeries: {
      '@type': 'TVSeries',
      name: tvName,
      identifier: tvId,
    },
    datePublished: episode.air_date ?? undefined,
    duration: episode.runtime ? `PT${episode.runtime}M` : undefined,
    aggregateRating: episode.vote_count > 0
      ? {
          '@type': 'AggregateRating',
          ratingValue: episode.vote_average,
          ratingCount: episode.vote_count,
        }
      : undefined,
  };
}
