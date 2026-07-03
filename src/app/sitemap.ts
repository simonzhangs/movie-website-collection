import type { MetadataRoute } from 'next';
import { routing } from '@/i18n/routing';
import { getPopularMovies, getPopularTV } from '@/lib/tmdb/client';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const entries: MetadataRoute.Sitemap = [];

  // ─── 静态页面（每种语言）───
  const staticPaths = ['', '/movies', '/tv', '/search'];

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

  // ─── 动态页面（用 timeout 保护） ───
  // 如果 TMDB API 在构建时不可用，跳过动态页面
  const fetchWithTimeout = <T>(promise: Promise<T>, timeoutMs: number): Promise<T | null> =>
    Promise.race([
      promise,
      new Promise<null>((resolve) => setTimeout(() => resolve(null), timeoutMs)),
    ]);

  try {
    const movies = await fetchWithTimeout(getPopularMovies('en', 1), 10000);

    if (movies) {
      for (const locale of routing.locales) {
        for (const movie of movies.results.slice(0, 20)) {
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
      }
    }

    const tvShows = await fetchWithTimeout(getPopularTV('en', 1), 10000);
    if (tvShows) {
      for (const locale of routing.locales) {
        for (const tv of tvShows.results.slice(0, 20)) {
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
    }
  } catch {
    // 如果 TMDB API 不可用，仅返回静态页面
  }

  return entries;
}
