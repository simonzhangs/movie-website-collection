'use client';

import { useLocale } from 'next-intl';
import { useParams } from 'next/navigation';
import { useRouter, usePathname } from '@/i18n/navigation';
import { routing } from '@/i18n/routing';
import { useState, useTransition } from 'react';

const LOCALE_LABELS: Record<string, string> = {
  en: 'English',
  zh: '中文',
};

const LOCALE_FLAGS: Record<string, string> = {
  en: 'EN',
  zh: 'ZH',
};

export default function LanguageSwitcher() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const params = useParams();
  const [isPending, startTransition] = useTransition();
  const [isOpen, setIsOpen] = useState(false);

  function onSelectChange(newLocale: string) {
    startTransition(() => {
      // 保持当前路径，只切换语言
      router.replace(
        // @ts-expect-error — pathname 类型与 params 的组合在运行时是字符串
        { pathname, params },
        { locale: newLocale }
      );
    });
    setIsOpen(false);
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-sm font-medium transition hover:bg-white/10"
        disabled={isPending}
      >
        <span className="text-xs font-bold opacity-60">
          {LOCALE_FLAGS[locale]}
        </span>
        <span>{LOCALE_LABELS[locale]}</span>
        <svg
          className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <>
          {/* 点击外部关闭 */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 z-50 mt-2 w-36 overflow-hidden rounded-lg border border-white/10 bg-[#1a1a2e] shadow-xl">
            {routing.locales.map((l) => (
              <button
                key={l}
                onClick={() => onSelectChange(l)}
                className={`flex w-full items-center gap-2 px-4 py-2.5 text-sm transition hover:bg-white/10 ${
                  l === locale ? 'text-indigo-400' : 'text-gray-300'
                }`}
              >
                <span className="text-xs font-bold opacity-60">{LOCALE_FLAGS[l]}</span>
                {LOCALE_LABELS[l]}
                {l === locale && (
                  <svg className="ml-auto h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
