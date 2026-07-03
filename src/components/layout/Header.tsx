'use client';

import { useTranslations } from 'next-intl';
import { Link, usePathname } from '@/i18n/navigation';
import LanguageSwitcher from './LanguageSwitcher';

export default function Header() {
  const t = useTranslations('nav');
  const pathname = usePathname();

  const navLinks = [
    { href: '/', label: t('home') },
    { href: '/movies', label: t('movies') },
    { href: '/tv', label: t('tv') },
  ];

  function isActive(href: string) {
    if (href === '/') {
      return pathname === '/';
    }
    return pathname.startsWith(href);
  }

  const activeClass = 'rounded-lg px-4 py-2 text-sm font-medium bg-indigo-600/15 text-indigo-400';
  const inactiveClass = 'rounded-lg px-4 py-2 text-sm font-medium text-gray-300 transition hover:bg-white/5 hover:text-white';

  const activeMobileClass = 'rounded-lg px-3 py-1.5 text-sm font-medium bg-indigo-600/15 text-indigo-400';
  const inactiveMobileClass = 'rounded-lg px-3 py-1.5 text-sm font-medium text-gray-400 transition hover:bg-white/5 hover:text-white';

  return (
    <header className="sticky top-0 z-50 border-b border-white/5 bg-[#0a0a0f]/80 backdrop-blur-lg">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600">
            <svg className="h-5 w-5 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M18 4l2 4h-3l-2-4h-2l2 4h-3l-2-4H8l2 4H7L5 4H4a2 2 0 00-2 2v12a2 2 0 002 2h16a2 2 0 002-2V4h-4z" />
            </svg>
          </div>
          <span className="text-lg font-bold gradient-text">CinePedia</span>
        </Link>

        {/* Nav links */}
        <nav className="hidden items-center gap-1 md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={isActive(link.href) ? activeClass : inactiveClass}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Right side */}
        <div className="flex items-center gap-3">
          <LanguageSwitcher />
        </div>
      </div>

      {/* Mobile nav */}
      <nav className="flex items-center gap-1 border-t border-white/5 px-4 py-2 md:hidden">
        {navLinks.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={isActive(link.href) ? activeMobileClass : inactiveMobileClass}
          >
            {link.label}
          </Link>
        ))}
      </nav>
    </header>
  );
}
