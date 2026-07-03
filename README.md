# FullWatch - 影视资源介绍网站

基于 **Next.js 15 (App Router) + next-intl + TMDB API** 构建的影视介绍网站，支持多语言、SSR/ISR、SEO 优化和广告位预留。

## ✨ 核心特性

- **多语言 (i18n)**：基于 `next-intl`，支持中/英双语，URL 前缀路由（`/en`、`/zh`），SEO 友好
- **ISR 增量静态再生**：上新新剧时按需刷新页面，无需全站重新构建
- **每集独立页面**：`/tv/[id]/season/[s]/episode/[e]` 路由，每集都有独立 URL，利于 SEO 收录
- **SEO 全套**：metadata API（TDK）、Open Graph、Twitter Card、JSON-LD 结构化数据、sitemap.xml、robots.txt、hreflang 多语言标注
- **TMDB 数据源**：对接 The Movie Database API，40+ 语言元数据
- **广告位预留**：`AdSlot` 组件，后续接入 Google AdSense 即可
- **暗色主题 UI**：Tailwind CSS，响应式设计

## 🚀 快速开始

### 1. 安装依赖

```bash
npm install
```

### 2. 配置环境变量

复制 `.env.local.example` 为 `.env.local`，填入你的 TMDB API Key：

```bash
cp .env.local.example .env.local
```

前往 https://www.themoviedb.org/settings/api 申请免费的 API Key。

### 3. 启动开发服务器

```bash
npm run dev
```

访问 http://localhost:3000

### 4. 构建生产版本

```bash
npm run build
npm run start
```

## 📁 项目结构

```
src/
├── app/
│   ├── [locale]/              # 多语言路由
│   │   ├── layout.tsx         # 布局（Header + Footer + 广告位）
│   │   ├── page.tsx           # 首页（热门电影 + 剧集 + Hero Banner）
│   │   ├── movie/[id]/        # 电影详情页（ISR + JSON-LD）
│   │   ├── tv/
│   │   │   ├── [id]/          # 剧集详情页（ISR + 季/集列表）
│   │   │   │   └── season/
│   │   │   │       └── [s]/
│   │   │   │           └── episode/
│   │   │   │               └── [e]/  # 每集独立页面
│   │   │   └── page.tsx       # 剧集列表页（分页）
│   │   └── movies/
│   │       └── page.tsx       # 电影列表页（分页）
│   ├── api/
│   │   └── revalidate/        # On-Demand ISR API
│   ├── sitemap.ts             # 动态 sitemap
│   ├── robots.ts              # robots.txt
│   └── not-found.tsx          # 404 页面
├── components/
│   ├── layout/                # Header, Footer, LanguageSwitcher
│   ├── media/                 # MediaCard, MediaGrid, MediaRail
│   └── seo/                   # JsonLd, AdSlot
├── i18n/
│   ├── routing.ts             # 语言配置
│   ├── request.ts             # next-intl 请求配置
│   ├── navigation.ts          # 导航 API（Link, redirect 等）
│   └── messages/              # 翻译文件
│       ├── en.json
│       └── zh.json
├── lib/
│   ├── tmdb/                  # TMDB API 客户端 + 类型
│   │   ├── client.ts
│   │   └── types.ts
│   └── seo/
│       └── metadata.ts        # SEO metadata + JSON-LD 生成
└── middleware.ts              # next-intl 中间件
```

## 🔁 ISR：上新新剧的工作流

### 方式一：时间驱动（自动）

TMDB 客户端默认设置 `revalidate: 3600`（1 小时），页面会自动检查更新。

### 方式二：按需触发（推荐）

调用 `/api/revalidate` 端点，瞬间刷新指定页面：

```bash
# 刷新某部新剧的中英文页面
curl -X POST http://localhost:3000/api/revalidate \
  -H "Content-Type: application/json" \
  -d '{
    "secret": "your_revalidate_secret",
    "paths": [
      "/en/tv/12345",
      "/zh/tv/12345",
      "/en/tv/12345/season/1/episode/1",
      "/zh/tv/12345/season/1/episode/1"
    ]
  }'
```

### 方式三：fallback 按需生成

`generateStaticParams` 只预生成热门内容，冷门内容首次访问时按需生成并缓存。

## 🌐 添加新语言

1. 在 `src/i18n/routing.ts` 的 `locales` 数组中添加语言代码
2. 在 `src/i18n/messages/` 下创建对应的 JSON 翻译文件
3. 在 `src/lib/tmdb/client.ts` 的 `LOCALE_TO_TMDB` 中添加 TMDB 语言映射

## 📺 广告接入

项目已预留 7 个广告位（首页×2、列表页×2、详情页×3、全局底部×1），通过 `AdSlot` 组件管理。
未配置时显示占位区域，配置后自动切换为真实广告。

`AdSlot` 支持四种模式（按优先级自动选择）：

| 模式 | 适用场景 | 配置方式 |
|------|---------|---------|
| **自定义广告** | 合作方直投、图片+链接 | 传入 `customHtml` 属性 |
| **百度联盟** | 国内 Web 流量（首选） | 配置 `NEXT_PUBLIC_BAIDU_CPRO_ID` + 传入 `baiduSlotId` |
| **Google AdSense** | 海外流量 | 配置 `NEXT_PUBLIC_ADSENSE_CLIENT` + 传入 `adsenseSlot` |
| **占位模式** | 开发调试 | 不配置任何广告，显示占位框 |

### 接入百度联盟（国内首选）

百度联盟是国内 Web 站长最常用的广告平台，支持个人申请，JS 代码接入。

1. 前往 [百度联盟](https://union.baidu.com) 注册账号
2. 添加网站并通过审核（需 ICP 备案，日 IP 建议 ≥ 100）
3. 在"媒体管理"中创建广告位，获取广告位 ID
4. 在 `.env.local` 中配置：
   ```bash
   NEXT_PUBLIC_BAIDU_CPRO_ID=你的联盟ID
   ```
5. 在页面中传入 `baiduSlotId` 属性：
   ```tsx
   <AdSlot slotId="home-top" format="horizontal" baiduSlotId="1234567" />
   ```

### 接入 Google AdSense（海外流量）

1. 前往 [Google AdSense](https://www.google.com/adsense) 注册账号，获取 Publisher ID（格式 `ca-pub-XXXXXXXXXXXXXXXX`）
2. 在 `.env.local` 中配置：
   ```bash
   NEXT_PUBLIC_ADSENSE_CLIENT=ca-pub-XXXXXXXXXXXXXXXX
   ```
3. 在 AdSense 后台创建广告单元，获取 slot ID
4. 在页面中传入 `adsenseSlot` 属性：
   ```tsx
   <AdSlot slotId="home-top" format="horizontal" adsenseSlot="1234567890" />
   ```
5. 将网站域名添加到 AdSense 后台，等待审核通过

> 配置 `NEXT_PUBLIC_ADSENSE_CLIENT` 后，AdSense 脚本会自动在 `layout.tsx` 中加载，无需手动修改。

### 自定义广告（合作方直投）

直接传入 HTML 代码，适合与广告主直接合作：

```tsx
<AdSlot
  slotId="home-top"
  format="horizontal"
  customHtml='<a href="https://example.com"><img src="/ads/banner.jpg" alt="广告" /></a>'
/>
```

### 国内其他可选广告联盟

| 平台 | 适合 Web 端 | 个人可申请 | 备注 |
|------|:-----------:|:---------:|------|
| **百度联盟** | ✅ | ✅ | 国内 Web 首选，需备案 |
| **360 广告联盟** | ✅ | ✅ | 百度联盟的替代方案 |
| **Google AdSense** | ✅ | ✅ | 海外流量收益更高 |
| **穿山甲/优量汇/快手** | ❌ | ❌ | 仅支持 App SDK，需企业资质 |

## 🚢 部署

推荐部署到 **Vercel**（ISR 开箱即用）：

```bash
# 安装 Vercel CLI
npm i -g vercel

# 部署
vercel
```

也支持部署到 Cloudflare、自建 Node 服务器等。

## 📝 技术栈

| 技术 | 用途 |
|------|------|
| Next.js 15 (App Router) | 全栈框架，SSR/SSG/ISR |
| next-intl | 多语言国际化 |
| TMDB API | 影视数据源 |
| Tailwind CSS | 样式 |
| TypeScript | 类型安全 |

## 📄 License

MIT
