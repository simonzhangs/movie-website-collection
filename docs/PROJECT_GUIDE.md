# CinePedia 项目指南

> 最后更新：2026-06-30
> 项目路径：`/Users/fegarden/movie-website-collection`

---

## 一、项目背景与目标

### 做什么

一个**电影/影视资源介绍网站**，介绍每个影视资源，每一集也有对应的独立页面。

### 核心诉求

1. **便于 SEO**：服务端渲染，每部电影/每集都有独立 URL，搜索引擎可收录
2. **挣广告费**：页面多 = 收录多 = 流量大 = 广告收入高
3. **快速上新**：上新新剧时迅速快捷发布对应页面，不能每次全站重新构建
4. **多语言**：支持中英文（可扩展更多语言），覆盖不同地区搜索流量

---

## 二、技术选型决策

### 最终方案：Next.js (App Router) + next-intl + TMDB API

### 选型过程

调研了三类方案：

| 方案 | 代表 | 结论 |
|------|------|------|
| 现代化前端框架 | **Next.js** vs Astro | ✅ 选 Next.js |
| 传统影视 CMS | 苹果CMS / 海洋CMS / GoFilm | ❌ SEO 弱、现代化差 |
| 静态生成器 | Hugo / Jekyll / Gatsby | ❌ 缺 ISR、多语言弱 |

### Next.js vs Astro 核心对比

| 维度 | Next.js | Astro | 胜者 |
|------|---------|-------|------|
| **上新新剧速度** | ISR 原生支持，1 行 `revalidatePath` 搞定 | 需 Vercel 适配器 + 手写缓存失效 | 🏆 Next.js |
| **大规模页面（数万页）** | ISR + fallback 从容应对 | 全量构建压力大 | 🏆 Next.js |
| **SEO/性能** | Lighthouse 70-90（需调优） | Lighthouse 95-100（零 JS） | Astro |
| **多语言** | next-intl 成熟，SSR 无闪烁 | 内置 i18n，够用但较年轻 | 🏆 Next.js |
| **生态/招人** | React 生态最大 | 较小 | 🏆 Next.js |

**决定性因素**：项目明确要求"上新新剧时迅速快捷发布"，ISR 是 Next.js 原生一等公民能力，Astro 在这点上需要"拼装"实现。数万页面规模下 Astro 的全量重建策略会成为瓶颈。

---

## 三、技术栈

| 技术 | 版本 | 用途 |
|------|------|------|
| Next.js | ^15.1.0 | 全栈框架（App Router），SSR/SSG/ISR |
| React | ^19.0.0 | UI 库 |
| next-intl | ^3.26.0 | 多语言国际化（App Router 专用） |
| TMDB API | v3 | 影视数据源（免费，40+ 语言） |
| Tailwind CSS | ^3.4.1 | 样式（暗色主题） |
| TypeScript | ^5 | 类型安全 |

---

## 四、架构总览

```
                    用户请求
                       │
                       ▼
              ┌─── middleware.ts ────┐
              │  next-intl 中间件    │
              │  识别 locale，重定向  │
              │  / → /en/ 或 /zh/    │
              └──────────┬───────────┘
                         │
                         ▼
              ┌─── [locale]/layout.tsx ───┐
              │  NextIntlClientProvider   │
              │  Header + Footer + AdSlot │
              └──────────┬────────────────┘
                         │
          ┌──────────────┼──────────────┐
          │              │              │
          ▼              ▼              ▼
     首页 page.tsx   电影/[id]    剧集/[id]
     热门+Trending   ISR 预生成    ISR 预生成
                                    │
                                    ▼
                          season-[s]/episode-[e]
                          每集独立页面（ISR）
                         │              │
                         ▼              ▼
                   TMDB API       /api/revalidate
                   (cached 1h)    按需刷新页面
```

### 数据流

```
TMDB API (language=zh-CN)     ← 影视元数据（标题/简介/海报/剧集）
       │
       ▼
  tmdb/client.ts              ← fetch + next.revalidate: 3600（缓存1小时）
       │
       ▼
  页面 Server Component        ← 调用 client 函数获取数据
       │
       ▼
  generateMetadata()           ← 生成 SEO metadata（TDK/OG/hreflang）
  JsonLd 组件                  ← 注入 schema.org 结构化数据
       │
       ▼
  渲染 HTML 输出               ← 爬虫和用户都拿到完整 HTML
```

---

## 五、核心设计详解

### 5.1 多语言 (i18n)

**配置位置**：`src/i18n/routing.ts`

```typescript
locales: ['en', 'zh']       // 支持的语言
defaultLocale: 'en'         // 默认语言
localePrefix: 'always'      // URL 始终带语言前缀（/en/... /zh/...）
```

**关键文件**：

| 文件 | 作用 |
|------|------|
| `src/i18n/routing.ts` | 语言列表、默认语言、前缀策略 |
| `src/i18n/request.ts` | next-intl 请求配置，加载翻译文件 |
| `src/i18n/navigation.ts` | `Link`/`redirect`/`useRouter` 等导航 API |
| `src/i18n/messages/en.json` | 英文 UI 翻译 |
| `src/i18n/messages/zh.json` | 中文 UI 翻译 |
| `middleware.ts` | 拦截请求，注入 locale |

**TMDB 语言映射**（`src/lib/tmdb/client.ts`）：

```typescript
const LOCALE_TO_TMDB: Record<string, string> = {
  en: 'en-US',
  zh: 'zh-CN',
};
```

TMDB API 的 `language` 参数直接返回对应语言的影视数据，UI 文案则用 JSON 翻译文件管理。

**添加新语言步骤**：
1. `routing.ts` 的 `locales` 加新代码
2. `messages/` 下创建对应 JSON
3. `client.ts` 的 `LOCALE_TO_TMDB` 加 TMDB 语言映射

### 5.2 ISR 增量静态再生（核心）

这是项目的**最关键能力**——上新新剧时无需全站重建。

**三层 ISR 策略**：

| 层级 | 机制 | 实现位置 |
|------|------|---------|
| 时间驱动 | `next: { revalidate: 3600 }`，1 小时自动检查 | `tmdb/client.ts` 的 `tmdbFetch()` |
| 按需触发 | `revalidatePath()` 手动刷新指定页面 | `api/revalidate/route.ts` |
| Fallback | `generateStaticParams` 只预生成热门 20 部，其余首次访问按需生成 | 各页面 `generateStaticParams` + `dynamicParams: true` |

**上新新剧的实际操作**：

```bash
# 方式 1：API 调用（推荐，秒级生效）
curl -X POST https://your-domain.com/api/revalidate \
  -H "Content-Type: application/json" \
  -d '{
    "secret": "your_revalidate_secret",
    "paths": [
      "/en/tv/新剧ID",
      "/zh/tv/新剧ID",
      "/en/tv/新剧ID/season-1/episode-1",
      "/zh/tv/新剧ID/season-1/episode-1"
    ]
  }'

# 方式 2：GET 请求（方便 webhook）
curl "https://your-domain.com/api/revalidate?secret=xxx&path=/en/tv/12345"
```

**预生成范围**：
- 电影：`getPopularMovieIds(20)` → 热门前 20 部
- 剧集：`getPopularTVIds(20)` → 热门前 20 部
- 其余内容：首次访问时 `dynamicParams: true` 按需生成，之后变静态缓存

### 5.3 每集独立页面

**路由格式**：`/[locale]/tv/[id]/season-[s]/episode-[e]`

示例 URL：`/zh/tv/1399/season-1/episode-1`（权力的游戏 S1E1）

**实现位置**：`src/app/[locale]/tv/[id]/season-[s]/episode-[e]/page.tsx`

**关键设计**：
- 路由参数用 `season-1` / `episode-1` 而非纯数字，URL 更语义化，利于 SEO
- `parseSeasonEpisode()` 函数从 URL 参数中正则解析季数和集数
- 每集页面包含：集名、剧照、播出日期、时长、评分、简介
- 上一集/下一集导航，提升用户浏览深度和页面跳转率
- JSON-LD `TVEpisode` 结构化数据

### 5.4 SEO 体系

**实现位置**：`src/lib/seo/metadata.ts`

| SEO 能力 | 实现方式 |
|----------|---------|
| TDK（Title/Description/Keywords） | `generateMetadata()` 函数，每个页面动态生成 |
| Open Graph | `openGraph` 字段，含标题/描述/图片/类型 |
| Twitter Card | `twitter` 字段，`summary_large_image` |
| hreflang 多语言标注 | `alternates.languages`，标注 `/en` 和 `/zh` 版本 |
| JSON-LD 结构化数据 | `JsonLd` 组件 + `movieJsonLd()` / `tvJsonLd()` / `episodeJsonLd()` |
| sitemap.xml | `src/app/sitemap.ts`，动态生成含热门电影/剧集 |
| robots.txt | `src/app/robots.ts`，允许爬虫抓取，禁 `/api/` |
| canonical URL | `alternates.canonical`，避免重复内容 |

**JSON-LD 类型映射**：

| 页面 | schema.org 类型 |
|------|----------------|
| 电影详情页 | `Movie` |
| 剧集详情页 | `TVSeries` |
| 每集页面 | `TVEpisode`（含 `partOfSeries` 关联） |

### 5.5 广告位

**组件**：`src/components/seo/AdSlot.tsx`

当前是占位组件，支持三种格式：
- `horizontal`：横幅广告（默认）
- `vertical`：竖幅广告
- `square`：方形广告

**接入 Google AdSense 步骤**：
1. 在 `[locale]/layout.tsx` 的 `<head>` 添加 AdSense 脚本
2. 将 `AdSlot` 内部替换为 `<ins className="adsbygoogle" ... />`
3. 配置 `data-ad-client` 和 `data-ad-slot` ID

**当前广告位分布**：

| 位置 | slot ID | 格式 |
|------|---------|------|
| 首页顶部 | `home-top` | horizontal |
| 首页中部 | `home-middle` | horizontal |
| 页面底部（全局） | `footer-banner` | horizontal |
| 电影详情页 | `movie-detail` | horizontal |
| 剧集详情页 | `tv-detail` | horizontal |
| 每集页面 | `episode-detail` | horizontal |
| 电影列表页 | `movies-list` | horizontal |
| 剧集列表页 | `tv-list` | horizontal |

---

## 六、页面路由清单

| 路由 | 文件 | 渲染策略 | SEO |
|------|------|---------|-----|
| `/[locale]` | `[locale]/page.tsx` | SSG | 首页 metadata |
| `/[locale]/movies` | `[locale]/movies/page.tsx` | SSG + 分页 | 列表 metadata |
| `/[locale]/tv` | `[locale]/tv/page.tsx` | SSG + 分页 | 列表 metadata |
| `/[locale]/movie/[id]` | `[locale]/movie/[id]/page.tsx` | ISR（revalidate 1h） | Movie JSON-LD |
| `/[locale]/tv/[id]` | `[locale]/tv/[id]/page.tsx` | ISR（revalidate 1h） | TVSeries JSON-LD |
| `/[locale]/tv/[id]/season-[s]/episode-[e]` | `.../episode-[e]/page.tsx` | ISR（revalidate 1h） | TVEpisode JSON-LD |
| `/api/revalidate` | `api/revalidate/route.ts` | 动态 API | — |
| `/sitemap.xml` | `app/sitemap.ts` | 动态 | sitemap |
| `/robots.txt` | `app/robots.ts` | 静态 | robots |

---

## 七、TMDB API 客户端

**文件**：`src/lib/tmdb/client.ts` + `src/lib/tmdb/types.ts`

### 可用函数

| 函数 | 用途 |
|------|------|
| `getPopularMovies(locale, page)` | 热门电影（分页） |
| `getTopRatedMovies(locale, page)` | 高分电影（分页） |
| `getMovieDetails(id, locale)` | 电影详情 |
| `getMovieCredits(id, locale)` | 电影演员表 |
| `getSimilarMovies(id, locale, page)` | 相似电影 |
| `getPopularTV(locale, page)` | 热门剧集（分页） |
| `getTopRatedTV(locale, page)` | 高分剧集（分页） |
| `getTVDetails(id, locale)` | 剧集详情（含季列表） |
| `getSeasonDetails(tvId, season, locale)` | 单季详情（含集列表） |
| `getEpisodeDetails(tvId, season, episode, locale)` | 单集详情 |
| `getSimilarTV(id, locale, page)` | 相似剧集 |
| `getTrending(locale, timeWindow)` | 全站热门（day/week） |
| `getImageUrl(path, size)` | TMDB 图片 URL 生成 |
| `getPopularMovieIds(limit)` | 热门电影 ID 列表（用于 generateStaticParams） |
| `getPopularTVIds(limit)` | 热门剧集 ID 列表（用于 generateStaticParams） |

### 类型定义

所有 TMDB 返回类型定义在 `types.ts` 中：`TMDBMovie`、`TMDBTVShow`、`TMDBSeason`、`TMDBEpisode`、`TMDBMediaItem`、`TMDBCastMember` 等。

### 图片尺寸参考

| 用途 | size 参数 | 说明 |
|------|-----------|------|
| 列表海报 | `w342` | 卡片用 |
| 详情海报 | `w500` | 详情页大海报 |
| 背景图 | `original` | Hero Banner |
| 剧照 | `w780` | 每集剧照 |
| 季海报 | `w154` | 季列表小图 |

---

## 八、组件清单

### layout/

| 组件 | 文件 | 说明 |
|------|------|------|
| `Header` | `Header.tsx` | 顶部导航（Logo + 菜单 + 语言切换），sticky 定位 |
| `Footer` | `Footer.tsx` | 底部（版权 + 链接） |
| `LanguageSwitcher` | `LanguageSwitcher.tsx` | 语言切换下拉菜单（client component） |

### media/

| 组件 | 文件 | 说明 |
|------|------|------|
| `MediaCard` | `MediaCard.tsx` | 单个影视卡片（海报 + 标题 + 评分 + 年份） |
| `MediaGrid` | `MediaGrid.tsx` | 响应式网格容器，自动排列 MediaCard |

### seo/

| 组件 | 文件 | 说明 |
|------|------|------|
| `JsonLd` | `JsonLd.tsx` | JSON-LD 结构化数据注入组件 |
| `AdSlot` | `AdSlot.tsx` | 广告位占位组件（3 种格式） |

---

## 九、环境变量

| 变量 | 说明 | 获取方式 |
|------|------|---------|
| `TMDB_API_KEY` | TMDB API 密钥 | https://www.themoviedb.org/settings/api （免费申请） |
| `REVALIDATE_SECRET` | ISR 刷新鉴权密钥 | 自定义随机字符串 |
| `NEXT_PUBLIC_SITE_URL` | 站点 URL（sitemap 用） | 部署后填实际域名 |

---

## 十、开发与部署

### 常用命令

```bash
npm run dev      # 开发服务器（http://localhost:3000）
npm run build    # 生产构建
npm run start    # 启动生产服务器
npm run lint     # ESLint 检查
npx tsc --noEmit # TypeScript 类型检查
```

### 部署到 Vercel（推荐）

ISR 在 Vercel 上开箱即用，无需额外配置：

```bash
npm i -g vercel
vercel          # 首次部署
vercel --prod   # 生产部署
```

部署后在 Vercel Dashboard 配置环境变量（`TMDB_API_KEY`、`REVALIDATE_SECRET`、`NEXT_PUBLIC_SITE_URL`）。

### 部署到其他平台

| 平台 | 适配 | ISR 支持 |
|------|------|---------|
| Vercel | 原生 | ✅ 完整 |
| Cloudflare | `@cloudflare/next-on-pages` | ⚠️ 部分 |
| 自建 Node | `next start` | ✅（需持久化存储） |

---

## 十一、扩展指南

### 添加搜索功能

1. 创建 `src/app/[locale]/search/page.tsx`
2. 调用 TMDB `/search/multi` 端点
3. 在 `client.ts` 添加 `searchMulti(query, locale)` 函数

### 添加演员页面

1. 创建 `src/app/[locale]/person/[id]/page.tsx`
2. 调用 TMDB `/person/{id}` + `/person/{id}/movie_credits` + `/person/{id}/tv_credits`
3. 在 `client.ts` 添加对应函数
4. 在 `types.ts` 添加 `TMDBPerson` 类型

### 接入 Google AdSense

1. `[locale]/layout.tsx` 的 `<html>` 中添加：
   ```tsx
   <Script
     async
     src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-XXXX"
     crossOrigin="anonymous"
     strategy="afterInteractive"
   />
   ```
2. 修改 `AdSlot.tsx`：
   ```tsx
   <ins
     className="adsbygoogle"
     style={{ display: 'block' }}
     data-ad-client="ca-pub-XXXX"
     data-ad-slot={slotId}
     data-ad-format="auto"
   />
   ```
3. 在客户端组件中 `useEffect` 里触发 `(window.adsbygoogle = window.adsbygoogle || []).push([])`

### 添加结构化数据验证

部署后用 Google Rich Results Test 验证 JSON-LD：
- https://search.google.com/test/rich-results
- 输入页面 URL，检查 `Movie` / `TVSeries` / `TVEpisode` 是否被正确识别

---

## 十二、已知限制与后续优化

| 项目 | 当前状态 | 优化方向 |
|------|---------|---------|
| 搜索 | 未实现 | 添加 `/search` 页面 + TMDB search API |
| 演员/导演页面 | 未实现 | 添加 `/person/[id]` 路由 |
| 评论/评分 | 仅展示 TMDB 评分 | 可接入 Disqus 或自建评论 |
| 用户系统 | 无 | 可接入 NextAuth.js |
| 图片优化 | 用 `<img>` | 迁移到 `next/image` 组件（需配置 `remotePatterns`，已配） |
| 搜索引擎推送 | 无 | 可添加 Google Indexing API 自动推送新页面 |
| 站点地图分片 | 单文件 | 页面超 5 万时需拆分多个 sitemap |
| 缓存策略 | 统一 1 小时 | 可按页面类型设置不同 revalidate 时间 |
