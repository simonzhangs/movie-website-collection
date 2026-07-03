import { Link } from '@/i18n/navigation';
import { getImageUrl, getMediaTitle, getMediaYear } from '@/lib/tmdb/client';
import type { TMDBMediaItem } from '@/lib/tmdb/types';

interface MediaRailProps {
  items: TMDBMediaItem[];
  mediaType?: 'movie' | 'tv';
}

/**
 * 横向滚动卡片轨道 — 使用 CSS scroll-snap，无需客户端 JS
 * 每张卡片使用 backdrop 宽图，适合首屏展示多条内容
 */
export default function MediaRail({ items, mediaType }: MediaRailProps) {
  if (!items || items.length === 0) return null;

  return (
    <div className="rail-scroll -mx-4 flex gap-4 overflow-x-auto px-4 pb-4 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
      {items.map((item, index) => {
        const type = mediaType || item.media_type || (item.title ? 'movie' : 'tv');
        const href = type === 'movie' ? `/movie/${item.id}` : `/tv/${item.id}`;
        const title = getMediaTitle(item);
        const year = getMediaYear(item);
        const rating = item.vote_average ? item.vote_average.toFixed(1) : null;

        return (
          <Link
            key={item.id}
            href={href}
            className="rail-item group relative block flex-shrink-0 overflow-hidden rounded-xl bg-[#1a1a2e] card-hover"
          >
            {/* 宽 backdrop 图 */}
            <div className="relative aspect-[16/10] w-[280px] overflow-hidden sm:w-[340px]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={getImageUrl(item.backdrop_path || item.poster_path, 'w500')}
                alt={title}
                loading={index < 3 ? 'eager' : 'lazy'}
                className="absolute inset-0 h-full w-full object-cover transition duration-300 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />

              {/* 排名角标 */}
              <div className="absolute left-3 top-3 flex h-8 w-8 items-center justify-center rounded-lg bg-black/60 text-sm font-bold text-indigo-400 backdrop-blur-sm">
                {index + 1}
              </div>

              {/* 评分 */}
              {rating && (
                <div className="absolute right-3 top-3 flex items-center gap-1 rounded-md bg-black/60 px-2 py-0.5 text-xs font-bold text-yellow-400 backdrop-blur-sm">
                  <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                  {rating}
                </div>
              )}

              {/* 标题信息 */}
              <div className="absolute bottom-0 left-0 right-0 p-3">
                <h3 className="line-clamp-1 text-sm font-semibold text-white">
                  {title}
                </h3>
                {year && (
                  <p className="text-xs text-gray-400">{year}</p>
                )}
              </div>
            </div>
          </Link>
        );
      })}
    </div>
  );
}
