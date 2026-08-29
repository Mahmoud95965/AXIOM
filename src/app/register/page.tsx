'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Mail, Lock, User as UserIcon, Sparkles, ArrowRight, AlertCircle, CheckCircle2, Eye, EyeOff, ShieldCheck, Zap } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { TOLZY_PRICING_URL } from '@/lib/types';

export default function RegisterPage() {
  const router = useRouter();
  const { loginWithGoogle, registerWithEmail } = useAuth();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGoogleSignIn = async () => {
    try {
      setLoading(true);
      setError(null);
      await loginWithGoogle();
      router.push('/');
    } catch (err: any) {
      console.error('Google Sign In Error:', err);
      setError(err.message || 'فشل التسجيل باستخدام Google');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError('يرجى إدخال اسمك الكريم');
      return;
    }

    if (password.length < 6) {
      setError('كلمة المرور يجب ألا تقل عن 6 خانات أو أحرف');
      return;
    }

    if (password !== confirmPassword) {
      setError('كلمات المرور غير متطابقة، يرجى التأكد');
      return;
    }

    setLoading(true);

    try {
      await registerWithEmail(email.trim(), password, name.trim());
      router.push('/');
    } catch (err: any) {
      console.error('Registration Error:', err);
      let msg = 'حدث خطأ أثناء إنشاء الحساب، يرجى المحاولة لاحقاً';
      if (err.code === 'auth/email-already-in-use') {
        msg = 'هذا البريد الإلكتروني مسجل بالفعل، يمكنك تسجيل الدخول مباشرة';
      } else if (err.code === 'auth/invalid-email') {
        msg = 'صيغة البريد الإلكتروني غير صحيحة';
      } else if (err.code === 'auth/weak-password') {
        msg = 'كلمة المرور ضعيفة جداً، يرجى اختيار كلمة مرور أقوى';
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

      {/* Back to Chat Button */}
      <div className="absolute top-6 right-6 z-20">
        <Link
          href="/"
          className="flex items-center gap-2 py-2 px-4 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs sm:text-sm font-semibold text-gray-300 hover:text-white transition-all backdrop-blur-md"
        >
          <span>العودة إلى الشات</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      {/* Main Register Card */}
      <div className="relative z-10 w-full max-w-lg bg-[#1e1f20]/90 backdrop-blur-2xl border border-white/10 rounded-3xl shadow-2xl p-6 sm:p-10 text-right animate-fade-in my-10">
        
        {/* Brand Header */}
        <div className="text-center mb-6">
          <div className="w-14 h-14 mx-auto mb-3 rounded-2xl bg-gradient-to-tr from-[#4285f4] via-[#9b51e0] to-[#fbbc05] p-0.5 shadow-lg shadow-purple-500/25 flex items-center justify-center">
            <div className="w-full h-full bg-[#1e1f20] rounded-[14px] flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-purple-400" />
            </div>
          </div>
          
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight mb-1 text-white">
            إنشاء حساب جديد في <span className="gradient-text">TOLZY</span>
          </h1>
          <p className="text-xs sm:text-sm text-gray-400">
            انضم الآن واحصل على <strong>25,000 توكن مجاناً</strong> فور التسجيل
          </p>
        </div>

        {/* Free Plan Benefits Banner */}
        <div className="mb-6 p-3.5 rounded-2xl bg-gradient-to-r from-purple-950/40 via-blue-950/30 to-purple-950/40 border border-purple-500/30 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2 text-purple-200 font-bold">
            <Zap className="w-4 h-4 text-amber-400 shrink-0" />
            <span>هدية الترحيب: 25k توكن</span>
          </div>
          <span className="text-[11px] text-gray-400">تجدد شهرياً مجاناً</span>
        </div>

        {/* Error Notification */}
        {error && (
          <div className="mb-5 p-3.5 rounded-2xl bg-red-500/10 border border-red-500/30 flex items-start gap-2.5 text-red-300 text-xs animate-shake">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-400 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* Google One-Click Register Button */}
        <button
          type="button"
          onClick={handleGoogleSignIn}
          disabled={loading}
          className="w-full py-3.5 px-4 rounded-2xl bg-white hover:bg-gray-100 text-gray-900 font-bold text-sm flex items-center justify-center gap-3 transition-all transform active:scale-[0.99] shadow-md disabled:opacity-50 mb-5"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
            />
          </svg>
          <span>التسجيل السريع بحساب Google</span>
        </button>

        {/* Divider */}
        <div className="flex items-center my-5 gap-3">
          <div className="flex-1 h-px bg-white/10" />
          <span className="text-xs text-gray-500 font-semibold">أو بالبريد الإلكتروني</span>
          <div className="flex-1 h-px bg-white/10" />
        </div>

        {/* Registration Form */}
        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div>
            <label className="block text-xs font-semibold text-gray-300 mb-1">الاسم الكامل</label>
            <div className="relative">
              <input
                type="text"
                required
                placeholder="محمود محمد"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-[#131314] border border-white/10 rounded-2xl py-3 pr-11 pl-4 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[#a8c7fa] focus:ring-1 focus:ring-[#a8c7fa] transition-all text-right"
              />
              <UserIcon className="w-4 h-4 text-gray-400 absolute right-4 top-3.5" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-300 mb-1">البريد الإلكتروني</label>
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

          <div>
            <label className="block text-xs font-semibold text-gray-300 mb-1">كلمة المرور (6 أحرف على الأقل)</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-[#131314] border border-white/10 rounded-2xl py-3 pr-11 pl-11 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[#a8c7fa] focus:ring-1 focus:ring-[#a8c7fa] transition-all text-right"
              />
              <Lock className="w-4 h-4 text-gray-400 absolute right-4 top-3.5" />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute left-4 top-3.5 text-gray-400 hover:text-white transition-colors"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-300 mb-1">تأكيد كلمة المرور</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full bg-[#131314] border border-white/10 rounded-2xl py-3 pr-11 pl-4 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[#a8c7fa] focus:ring-1 focus:ring-[#a8c7fa] transition-all text-right"
              />
              <ShieldCheck className="w-4 h-4 text-gray-400 absolute right-4 top-3.5" />
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-[#4285f4] via-[#9b51e0] to-[#fbbc05] hover:opacity-95 text-white font-bold text-sm shadow-lg shadow-purple-500/20 transition-all transform active:scale-[0.99] disabled:opacity-50 mt-2"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                جاري إنشاء الحساب...
              </span>
            ) : (
              'إنشاء الحساب وبدء التجربة المجانية'
            )}
          </button>
        </form>

        {/* Footer Links */}
        <div className="mt-6 pt-5 border-t border-white/10 text-center text-xs text-gray-400 space-y-2">
          <p>
            لديك حساب بالفعل؟{' '}
            <Link
              href="/login"
              className="text-[#a8c7fa] font-bold hover:underline"
            >
              تسجيل الدخول
            </Link>
          </p>

          <p className="text-[11px] text-gray-500">
            بالتسجيل، أنت توافق على شروط وسياسات منظومة{' '}
            <a
              href={TOLZY_PRICING_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-400 underline hover:text-white"
            >
              TOLZY AI
            </a>
          </p>
        </div>

      </div>
    </div>
  );
}
