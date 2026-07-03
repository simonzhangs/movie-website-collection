import { getTranslations } from 'next-intl/server';
import MediaCard from './MediaCard';
import type { TMDBMediaItem } from '@/lib/tmdb/types';

interface MediaGridProps {
  items: TMDBMediaItem[];
  mediaType?: 'movie' | 'tv';
}

export default async function MediaGrid({ items, mediaType }: MediaGridProps) {
  const tCommon = await getTranslations('common');

  if (!items || items.length === 0) {
    return (
      <div className="flex h-40 items-center justify-center text-gray-500">
        {tCommon('noResults')}
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
