import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';

export default function Footer() {
  const t = useTranslations('nav');
  const year = new Date().getFullYear();

  return (
    <footer className="mt-20 border-t border-white/5 bg-[#08080c]">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center justify-between gap-6 md:flex-row">
          {/* Logo + desc */}
          <div className="flex flex-col items-center gap-2 md:items-start">
            <Link href="/" className="flex items-center gap-2">
              <span className="text-lg font-bold gradient-text">FullWatch</span>
            </Link>
            <p className="text-sm text-gray-500">
              © {year} FullWatch. Powered by TMDB.
            </p>
          </div>

          {/* Links */}
          <nav className="flex items-center gap-6">
            <Link href="/" className="text-sm text-gray-400 transition hover:text-white">
              {t('home')}
            </Link>
            <Link href="/movies" className="text-sm text-gray-400 transition hover:text-white">
              {t('movies')}
            </Link>
            <Link href="/tv" className="text-sm text-gray-400 transition hover:text-white">
              {t('tv')}
            </Link>
          </nav>
        </div>
      </div>
    </footer>
  );
}
