import { createNavigation } from 'next-intl/navigation';
import { routing } from './routing';

// 轻量导航 API：Link、redirect、usePathname、useRouter
export const { Link, redirect, usePathname, useRouter, getPathname } =
  createNavigation(routing);
