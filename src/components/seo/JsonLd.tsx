interface JsonLdProps {
  data: Record<string, unknown>;
}

/**
 * JSON-LD 结构化数据组件
 * 用于在页面中注入 schema.org 结构化数据，提升 SEO
 */
export default function JsonLd({ data }: JsonLdProps) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
