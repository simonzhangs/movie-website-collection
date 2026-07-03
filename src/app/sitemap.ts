import type { MetadataRoute } from 'next';
import { routing } from '@/i18n/routing';
import { getPopularMovies, getPopularTV, getTVDetails } from '@/lib/tmdb/client';

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

  // ─── 动态页面：热门电影、剧集、每集 ───
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

      // 剧集详情页 + 每集页面
      const tvList = tvShows.results.slice(0, 10); // 前 10 部热门剧集
      for (const tv of tvList) {
        // 剧集详情页
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

        // 获取剧集详情，生成每集 URL
        try {
          const tvDetails = await getTVDetails(String(tv.id), locale);
          for (const season of tvDetails.seasons) {
            if (season.season_number <= 0) continue; // 跳过特别篇
            for (let ep = 1; ep <= season.episode_count; ep++) {
              entries.push({
                url: `${SITE_URL}/${locale}/tv/${tv.id}/season/${season.season_number}/episode/${ep}`,
                lastModified: new Date(),
                changeFrequency: 'monthly',
                priority: 0.4,
              });
            }
          }
        } catch {
          // 单部剧集详情获取失败，跳过该剧集
        }
      }
    }
  } catch {
    // 如果 TMDB API 不可用，仅返回静态页面
  }

  return entries;
}
