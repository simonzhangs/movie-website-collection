import { NextRequest, NextResponse } from 'next/server';
import { searchMulti } from '@/lib/tmdb/client';

export const dynamic = 'force-dynamic';

/**
 * 搜索 API 端点
 *
 * GET /api/search?q=keyword&page=1&locale=en
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q');
  const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10) || 1);
  const locale = searchParams.get('locale') || 'en';

  if (!query || !query.trim()) {
    return NextResponse.json(
      { page: 1, results: [], total_pages: 0, total_results: 0 },
      { status: 200 }
    );
  }

  try {
    const data = await searchMulti(query.trim(), locale, page);
    return NextResponse.json(data, {
      headers: {
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300',
      },
    });
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error('[Search API] Error:', msg);
    return NextResponse.json(
      { page: 1, results: [], total_pages: 0, total_results: 0 },
      { status: 500 }
    );
  }
}
