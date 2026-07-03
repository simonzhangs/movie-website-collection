import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4 text-center">
      <h1 className="text-6xl font-bold gradient-text">404</h1>
      <p className="mt-4 text-xl text-gray-400">Page not found</p>
      <p className="mt-2 text-sm text-gray-500">
        The page you are looking for doesn&apos;t exist or has been moved.
      </p>
      <div className="mt-8 flex gap-4">
        <Link
          href="/en"
          className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-indigo-500"
        >
          English
        </Link>
        <Link
          href="/zh"
          className="inline-flex items-center gap-2 rounded-lg border border-white/20 px-6 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
        >
          中文
        </Link>
      </div>
    </div>
  );
}
