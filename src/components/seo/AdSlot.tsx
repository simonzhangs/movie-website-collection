'use client';

import { useTranslations } from 'next-intl';
import { useEffect, useRef } from 'react';

type AdProvider = 'adsense' | 'baidu' | 'custom' | 'placeholder';

interface AdSlotProps {
  /** 广告位标识，便于管理多个广告位 */
  slotId?: string;
  /** 自定义样式 */
  className?: string;
  /** 广告格式：horizontal / vertical / square */
  format?: 'horizontal' | 'vertical' | 'square';
  /**
   * AdSense 广告单元 ID（如 "1234567890"）
   * 配合 NEXT_PUBLIC_ADSENSE_CLIENT 使用
   */
  adsenseSlot?: string;
  /**
   * 百度联盟广告位 ID（如 "1234567"）
   * 配合 NEXT_PUBLIC_BAIDU_CPRO_ID 使用
   * 前往 https://union.baidu.com 注册申请
   */
  baiduSlotId?: string;
  /**
   * 自定义广告 HTML 代码（优先级最高）
   * 用于直接投放合作方广告、图片+链接等
   */
  customHtml?: string;
}

const ADSENSE_CLIENT = process.env.NEXT_PUBLIC_ADSENSE_CLIENT;
const BAIDU_CPRO_ID = process.env.NEXT_PUBLIC_BAIDU_CPRO_ID;

const dimensions: Record<string, string> = {
  horizontal: 'min-h-[90px] w-full',
  vertical: 'min-h-[600px] w-[300px]',
  square: 'min-h-[250px] w-[250px]',
};

/**
 * 百度联盟广告子组件
 * 动态加载百度联盟 JS 并渲染广告
 */
function BaiduAd({ slotId }: { slotId: string }) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // 动态加载百度联盟脚本
    const script = document.createElement('script');
    script.src = '//cpro.baidustatic.com/cpro/ui/cm.js';
    script.async = true;
    if (containerRef.current) {
      containerRef.current.appendChild(script);
    }

    return () => {
      script.remove();
    };
  }, []);

  return (
    <div ref={containerRef}>
      <ins
        className="adsbybaidu"
        data-cpro-id={slotId}
        style={{ display: 'block', margin: '0 auto' }}
      />
    </div>
  );
}

/**
 * 广告位组件
 *
 * 支持四种模式（按优先级自动选择）：
 * 1. customHtml — 直接渲染自定义广告代码（合作方直投）
 * 2. baidu — 百度联盟（国内首选），需配置 NEXT_PUBLIC_BAIDU_CPRO_ID
 * 3. adsense — Google AdSense（海外流量），需配置 NEXT_PUBLIC_ADSENSE_CLIENT
 * 4. placeholder — 占位模式（开发环境）
 *
 * ─── 百度联盟接入 ───
 * 1. 前往 https://union.baidu.com 注册账号
 * 2. 添加网站并通过审核（需 ICP 备案）
 * 3. 创建广告位，获取广告位 ID
 * 4. 在 .env.local 中设置 NEXT_PUBLIC_BAIDU_CPRO_ID=你的联盟ID
 * 5. 使用时传入 baiduSlotId="广告位ID"
 *
 * ─── Google AdSense 接入 ───
 * 1. 前往 https://www.google.com/adsense 注册账号
 * 2. 获取 Publisher ID（ca-pub-XXXXXXXXXXXXXXXX）
 * 3. 在 .env.local 中设置 NEXT_PUBLIC_ADSENSE_CLIENT=ca-pub-XXXXXXXXXXXXXXXX
 * 4. 创建广告单元，使用时传入 adsenseSlot="1234567890"
 *
 * ─── 自定义广告 ───
 * 直接传入 customHtml="<a href='...'><img src='...' /></a>"
 */
export default function AdSlot({
  slotId = 'default',
  className = '',
  format = 'horizontal',
  adsenseSlot,
  baiduSlotId,
  customHtml,
}: AdSlotProps) {
  const t = useTranslations('common');
  const insRef = useRef<HTMLModElement>(null);

  // ─── 确定广告模式 ───
  const provider: AdProvider = customHtml
    ? 'custom'
    : baiduSlotId && BAIDU_CPRO_ID
      ? 'baidu'
      : adsenseSlot && ADSENSE_CLIENT
        ? 'adsense'
        : 'placeholder';

  useEffect(() => {
    // AdSense 模式：推送广告请求
    if (provider === 'adsense' && insRef.current) {
      try {
        // @ts-expect-error — adsbygoogle 由 AdSense 脚本注入到 window
        (window.adsbygoogle = window.adsbygoogle || []).push({});
      } catch {
        // AdSense 脚本未加载或已推送，忽略
      }
    }
  }, [provider]);

  // ─── 自定义广告模式 ───
  if (provider === 'custom') {
    return (
      <div
        data-ad-slot={slotId}
        data-ad-provider="custom"
        className={className}
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: customHtml! }}
      />
    );
  }

  // ─── 百度联盟模式 ───
  if (provider === 'baidu') {
    return (
      <div data-ad-slot={slotId} data-ad-provider="baidu" className={className}>
        <BaiduAd slotId={baiduSlotId!} />
      </div>
    );
  }

  // ─── AdSense 模式 ───
  if (provider === 'adsense') {
    return (
      <div data-ad-slot={slotId} data-ad-provider="adsense" className={className}>
        <ins
          ref={insRef}
          className="adsbygoogle"
          style={{ display: 'block' }}
          data-ad-client={ADSENSE_CLIENT}
          data-ad-slot={adsenseSlot}
          data-ad-format="auto"
          data-full-width-responsive="true"
        />
      </div>
    );
  }

  // ─── 占位模式（开发环境） ───
  return (
    <div
      data-ad-slot={slotId}
      data-ad-provider="placeholder"
      className={`flex items-center justify-center rounded-lg border border-dashed border-white/10 bg-white/[0.02] ${dimensions[format]} ${className}`}
    >
      <span className="text-xs text-gray-600">{t('advertisement')}</span>
    </div>
  );
}
