import { Link } from '@/i18n/navigation';

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
}

/**
 * 面包屑导航组件
 * 同时渲染可视化导航 + JSON-LD BreadcrumbList 结构化数据
 */
export default function Breadcrumb({ items }: BreadcrumbProps) {
  // 生成 JSON-LD 结构化数据
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.label,
      ...(item.href ? { item: item.href } : {}),
    })),
  };

  return (
    <>
      {/* JSON-LD 结构化数据 */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* 可视化面包屑导航 */}
      <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-sm text-gray-400">
        {items.map((item, index) => (
          <span key={index} className="flex items-center gap-2">
            {index > 0 && (
              <svg className="h-3 w-3 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            )}
            {item.href ? (
              <Link href={item.href} className="transition hover:text-indigo-400">
                {item.label}
              </Link>
            ) : (
              <span className="text-gray-200">{item.label}</span>
            )}
          </span>
        ))}
      </nav>
    </>
  );
}
