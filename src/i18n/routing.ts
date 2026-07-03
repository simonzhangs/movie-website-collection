import { defineRouting } from 'next-intl/routing';

export const routing = defineRouting({
  // 支持的语言列表
  locales: ['en', 'zh'],

  // 默认语言（URL 中不带前缀时使用）
  defaultLocale: 'en',

  // 始终显示 locale 前缀，利于 SEO
  localePrefix: 'always'
});
