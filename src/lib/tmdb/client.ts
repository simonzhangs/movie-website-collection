import type {
  TMDBMovie,
  TMDBTVShow,
  TMDBSeasonDetail,
  TMDBEpisode,
  TMDBPaginatedResponse,
  TMDBMediaItem,
  TMDBCastMember,
} from './types';
import { mockTrending, mockPopularMovies, mockPopularTV, getMockMediaItem } from './mock-data';

// 支持通过环境变量覆盖 API 地址（方便使用代理/镜像）
const TMDB_BASE_URL = process.env.TMDB_BASE_URL || 'https://api.themoviedb.org/3';
const TMDB_IMAGE_BASE_URL = process.env.TMDB_IMAGE_BASE_URL || 'https://image.tmdb.org/t/p';

// 开发环境可启用 mock 数据（TMDB_API_USE_MOCK=true）
const USE_MOCK = process.env.TMDB_API_USE_MOCK === 'true';

// TMDB 语言映射：将 next-intl 的 locale 转为 TMDB 的 language 参数
const LOCALE_TO_TMDB: Record<string, string> = {
  en: 'en-US',
  zh: 'zh-CN',
};

function getApiKey(): string {
  const key = process.env.TMDB_API_KEY;
  if (!key) {
    throw new Error('TMDB_API_KEY is not set. Please check your .env.local file.');
  }
  return key;
}

/**
 * 判断是否为 v4 Read Access Token（JWT，以 eyJ 开头）
 * v4 token 使用 Authorization: Bearer 认证
 * v3 API Key（32 位 hex）使用 ?api_key= 查询参数认证
 */
function isV4Token(key: string): boolean {
  return key.startsWith('eyJ');
}

function tmdbLanguage(locale: string): string {
  return LOCALE_TO_TMDB[locale] ?? 'en-US';
}

function getImageUrl(path: string | null, size: string = 'w500'): string {
  if (!path) return '/placeholder.svg';
  return `${TMDB_IMAGE_BASE_URL}/${size}${path}`;
}

async function tmdbFetch<T>(
  endpoint: string,
  locale: string = 'en',
  params: Record<string, string | number> = {}
): Promise<T> {
  const apiKey = getApiKey();
  const useBearer = isV4Token(apiKey);

  const url = new URL(`${TMDB_BASE_URL}${endpoint}`);
  url.searchParams.set('language', tmdbLanguage(locale));
  // v3 API Key 通过查询参数传递
  if (!useBearer) {
    url.searchParams.set('api_key', apiKey);
  }
  for (const [key, value] of Object.entries(params)) {
    url.searchParams.set(key, String(value));
  }

  const res = await fetch(url, {
    headers: {
      // v4 Token 使用 Bearer 认证
      ...(useBearer ? { Authorization: `Bearer ${apiKey}` } : {}),
      Accept: 'application/json',
    },
    // ISR：默认缓存 1 小时，可通过 revalidate 参数调整
    next: { revalidate: 3600 },
    // 超时保护：15 秒
    signal: AbortSignal.timeout(15000),
  });

  if (!res.ok) {
    throw new Error(`TMDB API error: ${res.status} ${res.statusText} for ${endpoint}`);
  }

  return res.json();
}

/**
 * 包装 tmdbFetch，在 TMDB 不可用时回退到 mock 数据
 */
async function tmdbFetchWithFallback<T>(
  endpoint: string,
  locale: string = 'en',
  params: Record<string, string | number> = {},
  mockFallback?: T
): Promise<T> {
  // 开发环境直接使用 mock
  if (USE_MOCK && mockFallback !== undefined) {
    return mockFallback;
  }

  try {
    return await tmdbFetch<T>(endpoint, locale, params);
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    console.warn(`[TMDB] Fetch failed for ${endpoint}: ${msg}`);

    if (mockFallback !== undefined) {
      console.warn(`[TMDB] Falling back to mock data for ${endpoint}`);
      return mockFallback;
    }
    throw error;
  }
}

// ─── 电影相关 ───

export async function getPopularMovies(
  locale: string = 'en',
  page: number = 1
): Promise<TMDBPaginatedResponse<TMDBMediaItem>> {
  return tmdbFetchWithFallback('/movie/popular', locale, { page }, mockPopularMovies);
}

export async function getTopRatedMovies(
  locale: string = 'en',
  page: number = 1
): Promise<TMDBPaginatedResponse<TMDBMediaItem>> {
  return tmdbFetchWithFallback('/movie/top_rated', locale, { page }, mockPopularMovies);
}

export async function getMovieDetails(id: string, locale: string = 'en'): Promise<TMDBMovie> {
  return tmdbFetchWithFallback<TMDBMovie>(`/movie/${id}`, locale, {}, getMockMediaItem(id, 'movie') as unknown as TMDBMovie);
}

export async function getMovieCredits(
  id: string,
  locale: string = 'en'
): Promise<{ cast: TMDBCastMember[] }> {
  return tmdbFetchWithFallback(`/movie/${id}/credits`, locale, {}, { cast: [] });
}

export async function getSimilarMovies(
  id: string,
  locale: string = 'en',
  page: number = 1
): Promise<TMDBPaginatedResponse<TMDBMediaItem>> {
  return tmdbFetchWithFallback(`/movie/${id}/similar`, locale, { page }, { page: 1, results: [], total_pages: 0, total_results: 0 });
}

// ─── 剧集相关 ───

export async function getPopularTV(
  locale: string = 'en',
  page: number = 1
): Promise<TMDBPaginatedResponse<TMDBMediaItem>> {
  return tmdbFetchWithFallback('/tv/popular', locale, { page }, mockPopularTV);
}

export async function getTopRatedTV(
  locale: string = 'en',
  page: number = 1
): Promise<TMDBPaginatedResponse<TMDBMediaItem>> {
  return tmdbFetchWithFallback('/tv/top_rated', locale, { page }, mockPopularTV);
}

export async function getTVDetails(id: string, locale: string = 'en'): Promise<TMDBTVShow> {
  return tmdbFetchWithFallback<TMDBTVShow>(`/tv/${id}`, locale, {}, getMockMediaItem(id, 'tv') as unknown as TMDBTVShow);
}

export async function getSeasonDetails(
  tvId: string,
  seasonNumber: number,
  locale: string = 'en'
): Promise<TMDBSeasonDetail> {
  return tmdbFetchWithFallback(`/tv/${tvId}/season/${seasonNumber}`, locale, {}, {
    id: Number(tvId),
    season_number: seasonNumber,
    name: `Season ${seasonNumber}`,
    overview: '',
    poster_path: null,
    air_date: null,
    episode_count: 0,
    episodes: [],
  });
}

export async function getEpisodeDetails(
  tvId: string,
  seasonNumber: number,
  episodeNumber: number,
  locale: string = 'en'
): Promise<TMDBEpisode> {
  return tmdbFetchWithFallback(`/tv/${tvId}/season/${seasonNumber}/episode/${episodeNumber}`, locale, {}, {
    id: 0,
    episode_number: episodeNumber,
    season_number: seasonNumber,
    name: `Episode ${episodeNumber}`,
    overview: '',
    still_path: null,
    air_date: null,
    runtime: null,
    vote_average: 0,
    vote_count: 0,
    guest_stars: [],
    crew: [],
  });
}

export async function getSimilarTV(
  id: string,
  locale: string = 'en',
  page: number = 1
): Promise<TMDBPaginatedResponse<TMDBMediaItem>> {
  return tmdbFetchWithFallback(`/tv/${id}/similar`, locale, { page }, { page: 1, results: [], total_pages: 0, total_results: 0 });
}

// ─── 综合 ───

export async function getTrending(
  locale: string = 'en',
  timeWindow: 'day' | 'week' = 'week'
): Promise<TMDBPaginatedResponse<TMDBMediaItem>> {
  return tmdbFetchWithFallback(`/trending/all/${timeWindow}`, locale, {}, mockTrending);
}

// ─── 辅助函数 ───

export { getImageUrl };

/**
 * 获取媒体标题（兼容电影和电视剧的字段差异）
 */
export function getMediaTitle(item: TMDBMediaItem): string {
  return item.title || item.name || 'Unknown';
}

/**
 * 获取媒体年份
 */
export function getMediaYear(item: TMDBMediaItem): string {
  const date = item.release_date || item.first_air_date;
  return date ? date.split('-')[0] : '';
}

/**
 * 获取热门电视剧 ID 列表（用于 generateStaticParams 预生成）
 */
export async function getPopularTVIds(limit: number = 20): Promise<string[]> {
  const data = await getPopularTV('en', 1);
  return data.results.slice(0, limit).map((item) => String(item.id));
}

/**
 * 获取热门电影 ID 列表（用于 generateStaticParams 预生成）
 */
export async function getPopularMovieIds(limit: number = 20): Promise<string[]> {
  const data = await getPopularMovies('en', 1);
  return data.results.slice(0, limit).map((item) => String(item.id));
}
