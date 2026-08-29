'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Mail, Sparkles, ArrowRight, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export default function ForgotPasswordPage() {
  const { resetPassword } = useAuth();

  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);

    try {
      await resetPassword(email.trim());
      setSuccess('تم إرسال رابط إعادة تعيين كلمة المرور بنجاح إلى بريدك الإلكتروني. يرجى مراجعة صندوق الوارد والبريد غير الهام (Spam).');
    } catch (err: any) {
      console.error('Password Reset Error:', err);
      let msg = 'حدث خطأ أثناء إرسال البريد الإلكتروني، يرجى المحاولة لاحقاً';
      if (err.code === 'auth/user-not-found') {
        msg = 'لم نتمكن من العثور على حساب مسجل بهذا البريد الإلكتروني';
      } else if (err.code === 'auth/invalid-email') {
        msg = 'صيغة البريد الإلكتروني غير صحيحة';
      }
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-screen flex flex-col items-center justify-center bg-[#131314] text-white p-4 relative overflow-hidden selection:bg-purple-500/30 selection:text-white">
      
      {/* Ambient Aurora Glows */}
      <div className="aurora-ambient-bg">
        <div className="aurora-orb aurora-orb-1" />
        <div className="aurora-orb aurora-orb-2" />
      </div>

      {/* Back Button */}
      <div className="absolute top-6 right-6 z-20">
        <Link
          href="/login"
          className="flex items-center gap-2 py-2 px-4 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs sm:text-sm font-semibold text-gray-300 hover:text-white transition-all backdrop-blur-md"
        >
          <span>العودة لتسجيل الدخول</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      {/* Main Card */}
      <div className="relative z-10 w-full max-w-md bg-[#1e1f20]/90 backdrop-blur-2xl border border-white/10 rounded-3xl shadow-2xl p-6 sm:p-10 text-right animate-fade-in my-10">
        
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-gradient-to-tr from-[#4285f4] via-[#9b51e0] to-[#fbbc05] p-0.5 shadow-lg shadow-purple-500/25 flex items-center justify-center">
            <div className="w-full h-full bg-[#1e1f20] rounded-[14px] flex items-center justify-center">
              <Mail className="w-6 h-6 text-blue-400" />
            </div>
          </div>
          
          <h1 className="text-2xl font-extrabold tracking-tight mb-2 text-white">
            استعادة كلمة المرور
          </h1>
          <p className="text-xs sm:text-sm text-gray-400 leading-relaxed">
            أدخل بريدك الإلكتروني المسجل وسنرسل لك رابطاً آمناً لإعادة تعيين كلمة المرور فوراً
          </p>
        </div>

        {/* Notifications */}
        {error && (
          <div className="mb-5 p-3.5 rounded-2xl bg-red-500/10 border border-red-500/30 flex items-start gap-2.5 text-red-300 text-xs animate-shake">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-400 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="mb-5 p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-start gap-2.5 text-emerald-300 text-xs leading-relaxed">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400 mt-0.5" />
            <span>{success}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-300 mb-1.5">البريد الإلكتروني</label>
            <div className="relative">
              <input
                type="email"
                required
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-[#131314] border border-white/10 rounded-2xl py-3 pr-11 pl-4 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[#a8c7fa] focus:ring-1 focus:ring-[#a8c7fa] transition-all text-right"
              />
              <Mail className="w-4 h-4 text-gray-400 absolute right-4 top-3.5" />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-[#4285f4] via-[#9b51e0] to-[#fbbc05] hover:opacity-95 text-white font-bold text-sm shadow-lg shadow-purple-500/20 transition-all transform active:scale-[0.99] disabled:opacity-50 mt-2"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                جاري الإرسال...
              </span>
            ) : (
              'إرسال رابط الاستعادة'
            )}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-white/10 text-center text-xs text-gray-400">
          تذكرت كلمة المرور؟{' '}
          <Link href="/login" className="text-[#a8c7fa] font-bold hover:underline">
            تسجيل الدخول
          </Link>
        </div>

      </div>
    </div>
  );
}
