import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'edge';
export const dynamic = 'force-dynamic';

const TMDB_BASE_URL = process.env.TMDB_BASE_URL || 'https://api.themoviedb.org/3';

/**
 * TMDB API 代理路由
 *
 * Vercel 服务器 IP 常被 TMDB 屏蔽，通过 Edge Runtime 转发请求可解决。
 * 同时支持浏览器端跨域调用。
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path } = await params;
  const pathStr = path.join('/');
  const searchParams = request.nextUrl.searchParams;

  // 确保包含 API Key
  const apiKey = process.env.TMDB_API_KEY;
  if (apiKey && !searchParams.has('api_key') && !apiKey.startsWith('eyJ')) {
    searchParams.set('api_key', apiKey);
  }

  const targetUrl = `${TMDB_BASE_URL}/${pathStr}?${searchParams.toString()}`;

  try {
    const res = await fetch(targetUrl, {
      headers: {
        Accept: 'application/json',
        'User-Agent': 'FullWatch/1.0',
      },
      next: { revalidate: 3600 },
    });

    return new NextResponse(res.body, {
      status: res.status,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
      },
    });
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    return NextResponse.json(
      { error: 'Proxy fetch failed', message: msg },
      { status: 502 }
    );
  }
}
