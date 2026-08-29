import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#131314] text-white p-6 text-center">
      <h2 className="text-4xl font-extrabold mb-4 gradient-text">404 - الصفحة غير موجودة</h2>
      <p className="text-gray-400 mb-6">عذراً، لم نتمكن من العثور على الصفحة المطلوبة في AXIOM.</p>
      <Link
        href="/"
        className="py-3 px-6 rounded-full bg-white text-black font-bold text-sm hover:bg-[#a8c7fa] transition-colors"
      >
        العودة إلى الشات
      </Link>
    </div>
  );
}
