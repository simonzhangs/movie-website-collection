interface FaqItem {
  question: string;
  answer: string;
}

interface FaqSectionProps {
  items: FaqItem[];
}

/**
 * FAQ 组件 — 常见问题模块
 * 同时渲染可视化 FAQ + JSON-LD FAQPage 结构化数据
 */
export default function FaqSection({ items }: FaqSectionProps) {
  if (!items.length) return null;

  // 生成 JSON-LD FAQPage 结构化数据
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: items.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.answer,
      },
    })),
  };

  return (
    <section className="mt-10">
      {/* JSON-LD 结构化数据 */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* 可视化 FAQ */}
      <h2 className="mb-6 text-xl font-bold text-white">常见问题</h2>
      <div className="space-y-4">
        {items.map((item, index) => (
          <details
            key={index}
            className="group rounded-xl border border-white/10 bg-white/5"
          >
            <summary className="flex cursor-pointer items-center justify-between px-5 py-4 text-left font-medium text-white transition hover:text-indigo-300">
              {item.question}
              <svg
                className="h-5 w-5 shrink-0 text-gray-400 transition-transform group-open:rotate-180"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </summary>
            <div className="px-5 pb-4 text-sm leading-relaxed text-gray-400">
              {item.answer}
            </div>
          </details>
        ))}
      </div>
    </section>
  );
}
