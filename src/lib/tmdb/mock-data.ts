import type { TMDBMediaItem, TMDBPaginatedResponse } from './types';

/**
 * 开发环境 Mock 数据
 * 当 TMDB API 不可访问时（如网络受限），使用这些数据让页面正常渲染
 */

const mockItemBase = {
  poster_path: null,
  backdrop_path: null,
  overview: 'This is mock data. Set TMDB_API_USE_MOCK=false or fix network connectivity to load real data from TMDB.',
  vote_average: 0,
  vote_count: 0,
  popularity: 0,
  original_language: 'en',
};

export const mockTrending: TMDBPaginatedResponse<TMDBMediaItem> = {
  page: 1,
  total_pages: 1,
  total_results: 6,
  results: [
    { ...mockItemBase, id: 1, media_type: 'movie', title: 'Mock Movie 1', release_date: '2024-01-15' },
    { ...mockItemBase, id: 2, media_type: 'tv', name: 'Mock TV Show 1', first_air_date: '2024-02-20' },
    { ...mockItemBase, id: 3, media_type: 'movie', title: 'Mock Movie 2', release_date: '2024-03-10' },
    { ...mockItemBase, id: 4, media_type: 'tv', name: 'Mock TV Show 2', first_air_date: '2024-04-05' },
    { ...mockItemBase, id: 5, media_type: 'movie', title: 'Mock Movie 3', release_date: '2024-05-18' },
    { ...mockItemBase, id: 6, media_type: 'tv', name: 'Mock TV Show 3', first_air_date: '2024-06-22' },
  ],
};

export const mockPopularMovies: TMDBPaginatedResponse<TMDBMediaItem> = {
  page: 1,
  total_pages: 1,
  total_results: 6,
  results: [
    { ...mockItemBase, id: 101, title: 'Popular Mock Movie 1', release_date: '2024-01-15' },
    { ...mockItemBase, id: 102, title: 'Popular Mock Movie 2', release_date: '2024-02-20' },
    { ...mockItemBase, id: 103, title: 'Popular Mock Movie 3', release_date: '2024-03-10' },
    { ...mockItemBase, id: 104, title: 'Popular Mock Movie 4', release_date: '2024-04-05' },
    { ...mockItemBase, id: 105, title: 'Popular Mock Movie 5', release_date: '2024-05-18' },
    { ...mockItemBase, id: 106, title: 'Popular Mock Movie 6', release_date: '2024-06-22' },
  ],
};

export const mockPopularTV: TMDBPaginatedResponse<TMDBMediaItem> = {
  page: 1,
  total_pages: 1,
  total_results: 6,
  results: [
    { ...mockItemBase, id: 201, name: 'Popular Mock TV 1', first_air_date: '2024-01-15' },
    { ...mockItemBase, id: 202, name: 'Popular Mock TV 2', first_air_date: '2024-02-20' },
    { ...mockItemBase, id: 203, name: 'Popular Mock TV 3', first_air_date: '2024-03-10' },
    { ...mockItemBase, id: 204, name: 'Popular Mock TV 4', first_air_date: '2024-04-05' },
    { ...mockItemBase, id: 205, name: 'Popular Mock TV 5', first_air_date: '2024-05-18' },
    { ...mockItemBase, id: 206, name: 'Popular Mock TV 6', first_air_date: '2024-06-22' },
  ],
};

/**
 * 搜索 mock 数据 — 根据查询词过滤
 */
export function getMockSearchResults(query: string): TMDBPaginatedResponse<TMDBMediaItem> {
  const allItems: TMDBMediaItem[] = [
    { ...mockItemBase, id: 1, media_type: 'movie', title: 'Mock Movie 1', release_date: '2024-01-15' },
    { ...mockItemBase, id: 101, title: 'Popular Mock Movie 1', release_date: '2024-01-15' },
    { ...mockItemBase, id: 102, title: 'Popular Mock Movie 2', release_date: '2024-02-20' },
    { ...mockItemBase, id: 2, media_type: 'tv', name: 'Mock TV Show 1', first_air_date: '2024-02-20' },
    { ...mockItemBase, id: 201, name: 'Popular Mock TV 1', first_air_date: '2024-01-15' },
    { ...mockItemBase, id: 202, name: 'Popular Mock TV 2', first_air_date: '2024-02-20' },
  ];

  const q = query.toLowerCase();
  const filtered = allItems.filter(
    (item) =>
      (item.title && item.title.toLowerCase().includes(q)) ||
      (item.name && item.name.toLowerCase().includes(q))
  );

  return {
    page: 1,
    total_pages: 1,
    total_results: filtered.length,
    results: filtered,
  };
}

/**
 * 根据类型生成单个媒体项的 mock 数据
 */
export function getMockMediaItem(id: string, type: 'movie' | 'tv') {
  const base = {
    id: Number(id),
    overview: mockItemBase.overview,
    poster_path: null,
    backdrop_path: null,
    vote_average: 0,
    vote_count: 0,
    popularity: 0,
    original_language: 'en',
    genres: [],
    tagline: '',
    homepage: '',
    production_companies: [],
    spoken_languages: [],
    status: 'Released',
  };

  if (type === 'movie') {
    return {
      ...base,
      title: `Mock Movie ${id}`,
      original_title: `Mock Movie ${id}`,
      release_date: '2024-01-01',
      runtime: 120,
      imdb_id: null,
    };
  }

  return {
    ...base,
    name: `Mock TV Show ${id}`,
    original_name: `Mock TV Show ${id}`,
    first_air_date: '2024-01-01',
    last_air_date: '2024-06-01',
    number_of_seasons: 1,
    number_of_episodes: 10,
    seasons: [],
    created_by: [],
    episode_run_time: [45],
    in_production: false,
    type: 'Scripted',
  };
}
