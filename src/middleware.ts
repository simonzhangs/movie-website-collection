import { NextRequest } from 'next/server';
import createMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';

const intlMiddleware = createMiddleware(routing);

export default function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 当访问根路径 / 时，根据浏览器语言重定向到对应 locale
  if (pathname === '/') {
    const acceptLanguage = request.headers.get('accept-language') || '';
    const preferredLocale = acceptLanguage.split(',')[0].split('-')[0].toLowerCase();
    const locale = routing.locales.includes(preferredLocale as 'en' | 'zh')
      ? preferredLocale
      : routing.defaultLocale;
    return Response.redirect(new URL(`/${locale}`, request.url), 307);
  }

  // 其他路径走 next-intl 中间件
  return intlMiddleware(request);
}

export const config = {
  // 匹配根路径和所有非静态资源路径
  matcher: ['/', '/((?!_next|api|.*\\..*).*)'],
};
