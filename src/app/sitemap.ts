import type { MetadataRoute } from 'next';
import { routing } from '@/i18n/routing';
import { getPopularMovies, getPopularTV } from '@/lib/tmdb/client';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const entries: MetadataRoute.Sitemap = [];

  // ─── 静态页面（每种语言）───
  const staticPaths = ['', '/movies', '/tv'];

  for (const locale of routing.locales) {
    for (const path of staticPaths) {
      entries.push({
        url: `${SITE_URL}/${locale}${path}`,
        lastModified: new Date(),
        changeFrequency: 'daily',
        priority: path === '' ? 1.0 : 0.8,
        alternates: {
          languages: Object.fromEntries(
            routing.locales.map((l) => [l, `${SITE_URL}/${l}${path}`])
          ),
        },
      });
    }
  }

  // ─── 动态页面：热门电影和剧集 ───
  try {
    const [movies, tvShows] = await Promise.all([
      getPopularMovies('en', 1),
      getPopularTV('en', 1),
    ]);

    for (const locale of routing.locales) {
      // 电影详情页
      for (const movie of movies.results) {
        entries.push({
          url: `${SITE_URL}/${locale}/movie/${movie.id}`,
          lastModified: new Date(),
          changeFrequency: 'weekly',
          priority: 0.6,
          alternates: {
            languages: Object.fromEntries(
              routing.locales.map((l) => [l, `${SITE_URL}/${l}/movie/${movie.id}`])
            ),
          },
        });
      }

      // 剧集详情页
      for (const tv of tvShows.results) {
        entries.push({
          url: `${SITE_URL}/${locale}/tv/${tv.id}`,
          lastModified: new Date(),
          changeFrequency: 'weekly',
          priority: 0.6,
          alternates: {
            languages: Object.fromEntries(
              routing.locales.map((l) => [l, `${SITE_URL}/${l}/tv/${tv.id}`])
            ),
          },
        });
      }
    }
  } catch {
    // 如果 TMDB API 不可用，仅返回静态页面
  }

  return entries;
}
