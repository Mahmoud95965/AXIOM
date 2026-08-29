'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('App Global Error:', error);
  }, [error]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#0a0a0c] text-white p-6 text-center">
      <h2 className="text-2xl font-bold mb-2">حدث خطأ غير متوقع</h2>
      <p className="text-xs text-zinc-400 mb-6 max-w-sm">
        نعتذر عن هذا الخطأ المؤقت في AXIOM. يمكنك المحاولة مرة أخرى أو العودة للشات.
      </p>
      <div className="flex items-center gap-3">
        <button
          onClick={() => reset()}
          className="py-2 px-4 rounded-xl bg-white text-black font-semibold text-xs hover:bg-zinc-200 transition-colors"
        >
          إعادة المحاولة
        </button>
        <Link
          href="/"
          className="py-2 px-4 rounded-xl bg-white/10 hover:bg-white/15 text-white font-medium text-xs transition-colors"
        >
          العودة للرئيسية
        </Link>
      </div>
    </div>
  );
}
