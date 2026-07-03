import { Link } from '@/i18n/navigation';
import { getImageUrl, getMediaTitle, getMediaYear } from '@/lib/tmdb/client';
import type { TMDBMediaItem } from '@/lib/tmdb/types';

interface MediaCardProps {
  item: TMDBMediaItem;
  /** "movie" | "tv" — 决定链接路径 */
  mediaType?: 'movie' | 'tv';
}

export default function MediaCard({ item, mediaType }: MediaCardProps) {
  // 优先使用传入的 mediaType，否则从 item 推断
  const type = mediaType || item.media_type || (item.title ? 'movie' : 'tv');
  const href = type === 'movie' ? `/movie/${item.id}` : `/tv/${item.id}`;
  const title = getMediaTitle(item);
  const year = getMediaYear(item);
  const rating = item.vote_average ? item.vote_average.toFixed(1) : null;

  return (
    <Link href={href} className="group block card-hover">
      <div className="relative aspect-[2/3] overflow-hidden rounded-lg bg-[#1a1a2e]">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={getImageUrl(item.poster_path, 'w342')}
          alt={title}
          loading="lazy"
          className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
        />

        {/* 评分徽章 */}
        {rating && (
          <div className="absolute right-2 top-2 flex items-center gap-1 rounded-md bg-black/70 px-2 py-0.5 text-xs font-bold text-yellow-400 backdrop-blur-sm">
            <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
            {rating}
          </div>
        )}

        {/* 渐变遮罩 */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
      </div>

      <div className="mt-2">
        <h3 className="line-clamp-1 text-sm font-medium text-gray-200 transition group-hover:text-white">
          {title}
        </h3>
        {year && (
          <p className="text-xs text-gray-500">{year}</p>
        )}
      </div>
    </Link>
  );
}
