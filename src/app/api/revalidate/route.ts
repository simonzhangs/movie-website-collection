import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath, revalidateTag } from 'next/cache';

/**
 * On-Demand ISR（按需增量静态再生）API 端点
 *
 * 当上新新剧或更新内容时，调用此端点触发指定页面的重新生成，
 * 无需重新构建整个站点。
 *
 * 使用示例:
 *
 * 1. 刷新单个剧集页面:
 *    curl -X POST https://your-domain.com/api/revalidate \
 *      -H "Content-Type: application/json" \
 *      -d '{"secret":"YOUR_SECRET","paths":["/en/tv/12345","/zh/tv/12345"]}'
 *
 * 2. 刷新某部剧的所有页面（含每集）:
 *    curl -X POST https://your-domain.com/api/revalidate \
 *      -H "Content-Type: application/json" \
 *      -d '{"secret":"YOUR_SECRET","tags":["tv-12345"]}'
 *
 * 3. 全站刷新:
 *    curl -X POST https://your-domain.com/api/revalidate \
 *      -H "Content-Type: application/json" \
 *      -d '{"secret":"YOUR_SECRET","paths":["/en","/zh"]}'
 */

export async function POST(request: NextRequest) {
  // ─── 鉴权 ───
  const body = await request.json().catch(() => ({}));
  const { secret, paths, tags } = body as {
    secret?: string;
    paths?: string[];
    tags?: string[];
  };

  if (secret !== process.env.REVALIDATE_SECRET) {
    return NextResponse.json(
      { message: 'Invalid secret token' },
      { status: 401 }
    );
  }

  // ─── 验证参数 ───
  if (!paths && !tags) {
    return NextResponse.json(
      { message: 'No paths or tags provided. Use "paths" or "tags" in the request body.' },
      { status: 400 }
    );
  }

  const revalidatedPaths: string[] = [];
  const revalidatedTags: string[] = [];
  const errors: string[] = [];

  // ─── 按路径刷新 ───
  if (paths && Array.isArray(paths)) {
    for (const path of paths) {
      try {
        revalidatePath(path);
        revalidatedPaths.push(path);
      } catch (err) {
        errors.push(`Failed to revalidate path ${path}: ${(err as Error).message}`);
      }
    }
  }

  // ─── 按标签刷新（用于批量刷新某部剧的所有页面）───
  if (tags && Array.isArray(tags)) {
    for (const tag of tags) {
      try {
        revalidateTag(tag);
        revalidatedTags.push(tag);
      } catch (err) {
        errors.push(`Failed to revalidate tag ${tag}: ${(err as Error).message}`);
      }
    }
  }

  return NextResponse.json({
    revalidated: true,
    revalidatedPaths,
    revalidatedTags,
    errors: errors.length > 0 ? errors : undefined,
    timestamp: new Date().toISOString(),
  });
}

// 也支持 GET 请求（方便 webhook 调用）
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const secret = searchParams.get('secret');
  const path = searchParams.get('path');
  const tag = searchParams.get('tag');

  if (secret !== process.env.REVALIDATE_SECRET) {
    return NextResponse.json({ message: 'Invalid secret' }, { status: 401 });
  }

  const results: string[] = [];

  if (path) {
    try {
      revalidatePath(path);
      results.push(`Path revalidated: ${path}`);
    } catch (err) {
      return NextResponse.json(
        { message: `Error: ${(err as Error).message}` },
        { status: 500 }
      );
    }
  }

  if (tag) {
    try {
      revalidateTag(tag);
      results.push(`Tag revalidated: ${tag}`);
    } catch (err) {
      return NextResponse.json(
        { message: `Error: ${(err as Error).message}` },
        { status: 500 }
      );
    }
  }

  return NextResponse.json({
    revalidated: true,
    results,
    timestamp: new Date().toISOString(),
  });
}
