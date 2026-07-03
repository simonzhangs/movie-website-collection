import MediaCard from './MediaCard';
import type { TMDBMediaItem } from '@/lib/tmdb/types';

interface MediaGridProps {
  items: TMDBMediaItem[];
  mediaType?: 'movie' | 'tv';
}

export default function MediaGrid({ items, mediaType }: MediaGridProps) {
  if (!items || items.length === 0) {
    return (
      <div className="flex h-40 items-center justify-center text-gray-500">
        No results found
      </div>
    );
  }

  return (
    <div className="media-grid">
      {items.map((item) => (
        <MediaCard key={item.id} item={item} mediaType={mediaType} />
      ))}
    </div>
  );
}
