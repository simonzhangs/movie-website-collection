'use client';

import { useTranslations, useLocale } from 'next-intl';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState, useTransition, useEffect, useCallback, Suspense } from 'react';
import MediaCard from '@/components/media/MediaCard';
import Breadcrumb from '@/components/seo/Breadcrumb';
import type { TMDBMediaItem, TMDBPaginatedResponse } from '@/lib/tmdb/types';

function SearchContent() {
  const locale = useLocale();
  const tNav = useTranslations('nav');
  const tCommon = useTranslations('common');
  const tSearch = useTranslations('search');
  const tListing = useTranslations('listing');

  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const query = searchParams.get('q') || '';
  const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10) || 1);

  const [inputValue, setInputValue] = useState(query);
  const [results, setResults] = useState<TMDBMediaItem[]>([]);
  const [totalResults, setTotalResults] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const performSearch = useCallback(
    async (q: string, p: number, loc: string) => {
      if (!q.trim()) return;
      setLoading(true);
      setHasSearched(true);
      try {
        const res = await fetch(
          `/api/search?q=${encodeURIComponent(q.trim())}&page=${p}&locale=${loc}`
        );
        const data: TMDBPaginatedResponse<TMDBMediaItem> = await res.json();
        setResults(data.results);
        setTotalResults(data.total_results);
        setTotalPages(Math.min(data.total_pages, 500));
      } catch {
        setResults([]);
        setTotalResults(0);
        setTotalPages(0);
      } finally {
        setLoading(false);
      }
    },
    []
  );

  // 当 URL 参数变化时同步输入框和触发搜索
  useEffect(() => {
    setInputValue(query);
    if (query) {
      performSearch(query, page, locale);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query, page, locale]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!inputValue.trim()) return;
    startTransition(() => {
      router.push(`/${locale}/search?q=${encodeURIComponent(inputValue.trim())}`);
    });
  }

  function handlePageChange(newPage: number) {
    startTransition(() => {
      router.push(`/${locale}/search?q=${encodeURIComponent(query)}&page=${newPage}`);
    });
  }

  return (
    <>
      <Breadcrumb
        items={[
          { label: tNav('home'), href: '/' },
          { label: tSearch('title') },
        ]}
      />

      <h1 className="mb-6 mt-4 text-3xl font-bold text-white">
        {tSearch('title')}
      </h1>

      {/* ─── 搜索框 ─── */}
      <form onSubmit={handleSubmit} className="mb-8">
        <div className="flex gap-3">
          <div className="relative flex-1">
            <svg
              className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder={tSearch('placeholder')}
              className="w-full rounded-xl border border-white/10 bg-white/5 py-3 pl-12 pr-4 text-white placeholder-gray-500 outline-none transition focus:border-indigo-500/50 focus:bg-white/[0.07] focus:ring-1 focus:ring-indigo-500/30"
            />
          </div>
          <button
            type="submit"
            disabled={!inputValue.trim()}
            className="rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 px-8 py-3 font-medium text-white transition hover:from-indigo-500 hover:to-purple-500 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {tSearch('button')}
          </button>
        </div>
      </form>

      {/* ─── 搜索结果 ─── */}
      {loading || isPending ? (
        <div className="flex h-40 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-indigo-500 border-t-transparent" />
          <span className="ml-3 text-gray-400">{tListing('loading')}</span>
        </div>
      ) : hasSearched ? (
        <>
          {/* 结果统计 */}
          {query && (
            <p className="mb-6 text-sm text-gray-400">
              {tSearch('resultsFor')}{' '}
              <span className="font-medium text-white">&ldquo;{query}&rdquo;</span>
              {totalResults > 0 && (
                <span>
                  {' — '}
                  {tSearch('found')} {totalResults} {tSearch('items')}
                </span>
              )}
            </p>
          )}

          {/* 结果列表 */}
          {results.length > 0 ? (
            <div className="media-grid">
              {results.map((item) => (
                <MediaCard key={item.id} item={item} />
              ))}
            </div>
          ) : (
            <div className="flex h-40 items-center justify-center text-gray-500">
              {tCommon('noResults')}
            </div>
          )}

          {/* 分页 */}
          {totalPages > 1 && (
            <div className="mt-8 flex items-center justify-center gap-4">
              {page > 1 ? (
                <button
                  onClick={() => handlePageChange(page - 1)}
                  className="rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-sm transition hover:bg-white/10"
                >
                  ← {tListing('prev')}
                </button>
              ) : (
                <span className="rounded-lg border border-white/5 px-4 py-2 text-sm text-gray-600">
                  ← {tListing('prev')}
                </span>
              )}

              <span className="text-sm text-gray-400">
                {tListing('page')} {page} {tListing('of')} {totalPages}
              </span>

              {page < totalPages ? (
                <button
                  onClick={() => handlePageChange(page + 1)}
                  className="rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-sm transition hover:bg-white/10"
                >
                  {tListing('next')} →
                </button>
              ) : (
                <span className="rounded-lg border border-white/5 px-4 py-2 text-sm text-gray-600">
                  {tListing('next')} →
                </span>
              )}
            </div>
          )}
        </>
      ) : (
        /* 未搜索状态 */
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <svg
            className="mb-4 h-16 w-16 text-gray-700"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
          <p className="text-gray-500">{tSearch('emptyState')}</p>
        </div>
      )}
    </>
  );
}

export default function SearchPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <Suspense
        fallback={
          <div className="flex h-40 items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-indigo-500 border-t-transparent" />
          </div>
        }
      >
        <SearchContent />
      </Suspense>
    </div>
  );
}
