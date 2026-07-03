import { useTranslations } from 'next-intl';

interface AdSlotProps {
  /** 广告位标识，便于管理多个广告位 */
  slotId?: string;
  /** 自定义样式 */
  className?: string;
  /** 广告格式：horizontal / vertical / square */
  format?: 'horizontal' | 'vertical' | 'square';
}

/**
 * 广告位占位组件
 *
 * 预留广告位，后续接入 Google AdSense 或其他广告平台时替换内部实现。
 * 当前显示一个占位区域，确保页面布局中已预留广告空间。
 *
 * 接入 AdSense 示例：
 * 1. 在 layout.tsx 的 <head> 中添加 AdSense 脚本
 * 2. 将本组件内部的占位替换为 <ins className="adsbygoogle" ... />
 */
export default function AdSlot({
  slotId = 'default',
  className = '',
  format = 'horizontal',
}: AdSlotProps) {
  const t = useTranslations('common');

  const dimensions: Record<string, string> = {
    horizontal: 'min-h-[90px] w-full',
    vertical: 'min-h-[600px] w-[300px]',
    square: 'min-h-[250px] w-[250px]',
  };

  return (
    <div
      data-ad-slot={slotId}
      className={`flex items-center justify-center rounded-lg border border-dashed border-white/10 bg-white/[0.02] ${dimensions[format]} ${className}`}
    >
      <span className="text-xs text-gray-600">{t('advertisement')}</span>
    </div>
  );
}
