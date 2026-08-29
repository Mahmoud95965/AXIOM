'use client';

import React, { useState } from 'react';
import { X, Mail, Lock, User as UserIcon, Sparkles, AlertCircle, CheckCircle2, ExternalLink } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { TOLZY_PRICING_URL } from '../lib/types';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'login' | 'register';
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  initialMode = 'login'
}) => {
  const { loginWithGoogle, loginWithEmail, registerWithEmail, resetPassword } = useAuth();

  const [mode, setMode] = useState<'login' | 'register' | 'forgot'>(initialMode);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleGoogleSignIn = async () => {
    try {
      setLoading(true);
      setError(null);
      await loginWithGoogle();
      onClose();
    } catch (err: any) {
      console.error('Google Sign In Error:', err);
      setError(err.message || 'فشل تسجيل الدخول باستخدام Google');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);
    setLoading(true);

    try {
      if (mode === 'login') {
        await loginWithEmail(email, password);
        onClose();
      } else if (mode === 'register') {
        if (!name.trim()) {
          throw new Error('يرجى إدخال اسمك الكريم');
        }
        await registerWithEmail(email, password, name.trim());
        onClose();
      } else if (mode === 'forgot') {
        await resetPassword(email);
        setSuccessMsg('تم إرسال رابط إعادة تعيين كلمة المرور إلى بريدك الإلكتروني بنجاح.');
      }
    } catch (err: any) {
      console.error('Auth submit error:', err);
      let msg = err.message || 'حدث خطأ أثناء المصادقة';
      if (msg.includes('auth/invalid-credential') || msg.includes('auth/wrong-password')) {
        msg = 'البريد الإلكتروني أو كلمة المرور غير صحيحة';
      } else if (msg.includes('auth/email-already-in-use')) {
        msg = 'هذا البريد الإلكتروني مسجل بالفعل';
      } else if (msg.includes('auth/weak-password')) {
        msg = 'كلمة المرور ضعيفة، يرجى إدخال 6 أحرف على الأقل';
      } else if (msg.includes('auth/invalid-email')) {
        msg = 'البريد الإلكتروني غير صالح';
      }
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-md bg-[#1e1f20] border border-white/10 rounded-3xl shadow-2xl p-6 md:p-8 overflow-hidden text-right text-white">
        
        {/* Ambient Top Glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-20 bg-gradient-to-r from-[#4285f4]/30 via-[#9b51e0]/30 to-[#fbbc05]/20 blur-2xl pointer-events-none" />

        {/* Header with Close */}
        <div className="flex items-center justify-between mb-6 relative z-10">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#4285f4] via-[#9b51e0] to-[#fbbc05] flex items-center justify-center shadow-lg shadow-purple-500/20">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold tracking-wide">
                {mode === 'login' && 'تسجيل الدخول إلى TOLZY'}
                {mode === 'register' && 'إنشاء حساب جديد في TOLZY'}
                {mode === 'forgot' && 'استعادة كلمة المرور'}
              </h2>
              <p className="text-xs text-gray-400">بوابة الدخول الموحدة لـ AXIOM V2</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Error / Success Messages */}
        {error && (
          <div className="mb-4 p-3 rounded-2xl bg-red-500/10 border border-red-500/30 flex items-center gap-2 text-red-300 text-xs">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
            <span>{error}</span>
          </div>
        )}

        {successMsg && (
          <div className="mb-4 p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center gap-2 text-emerald-300 text-xs">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Google One-Click Login Button */}
        {mode !== 'forgot' && (
          <div className="mb-6">
            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={loading}
              className="w-full py-3 px-4 rounded-2xl bg-white hover:bg-gray-100 text-gray-900 font-semibold text-sm flex items-center justify-center gap-3 transition-all transform active:scale-[0.99] shadow-md disabled:opacity-50"
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
              <span>المتابعة باستخدام Google</span>
            </button>

            <div className="flex items-center my-5 gap-3">
              <div className="flex-1 h-px bg-white/10" />
              <span className="text-xs text-gray-500 font-medium">أو بالبريد الإلكتروني</span>
              <div className="flex-1 h-px bg-white/10" />
            </div>
          </div>
        )}

        {/* Email & Password Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'register' && (
            <div>
              <label className="block text-xs font-medium text-gray-300 mb-1">الاسم الكامل</label>
              <div className="relative">
                <input
                  type="text"
                  required
                  placeholder="محمد أحمد"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-[#131314] border border-white/10 rounded-2xl py-3 pr-10 pl-4 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[#a8c7fa] transition-colors text-right"
                />
                <UserIcon className="w-4 h-4 text-gray-400 absolute right-3 top-3.5" />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-gray-300 mb-1">البريد الإلكتروني</label>
            <div className="relative">
              <input
                type="email"
                required
                placeholder="example@tolzy.me"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-[#131314] border border-white/10 rounded-2xl py-3 pr-10 pl-4 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[#a8c7fa] transition-colors text-right"
              />
              <Mail className="w-4 h-4 text-gray-400 absolute right-3 top-3.5" />
            </div>
          </div>

          {mode !== 'forgot' && (
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-medium text-gray-300">كلمة المرور</label>
                {mode === 'login' && (
                  <button
                    type="button"
                    onClick={() => setMode('forgot')}
                    className="text-[11px] text-[#a8c7fa] hover:underline"
                  >
                    نسيت كلمة المرور؟
                  </button>
                )}
              </div>
              <div className="relative">
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-[#131314] border border-white/10 rounded-2xl py-3 pr-10 pl-4 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[#a8c7fa] transition-colors text-right"
                />
                <Lock className="w-4 h-4 text-gray-400 absolute right-3 top-3.5" />
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 rounded-2xl bg-gradient-to-r from-[#4285f4] via-[#9b51e0] to-[#fbbc05] hover:opacity-95 text-white font-bold text-sm shadow-lg shadow-purple-500/20 transition-all transform active:scale-[0.99] disabled:opacity-50 mt-2"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                جاري المعالجة...
              </span>
            ) : mode === 'login' ? (
              'تسجيل الدخول'
            ) : mode === 'register' ? (
              'إنشاء الحساب وبدء التجربة'
            ) : (
              'إرسال رابط الاستعادة'
            )}
          </button>
        </form>

        {/* Footer Mode Switcher & Pricing Link */}
        <div className="mt-6 text-center text-xs text-gray-400 space-y-2">
          {mode === 'login' && (
            <p>
              ليس لديك حساب بعد؟{' '}
              <button
                type="button"
                onClick={() => {
                  setMode('register');
                  setError(null);
                }}
                className="text-[#a8c7fa] font-bold hover:underline"
              >
                إنشاء حساب مجاني (25k توكن)
              </button>
            </p>
          )}

          {mode === 'register' && (
            <p>
              لديك حساب بالفعل؟{' '}
              <button
                type="button"
                onClick={() => {
                  setMode('login');
                  setError(null);
                }}
                className="text-[#a8c7fa] font-bold hover:underline"
              >
                تسجيل الدخول
              </button>
            </p>
          )}

          {mode === 'forgot' && (
            <p>
              تذكرت كلمة المرور؟{' '}
              <button
                type="button"
                onClick={() => {
                  setMode('login');
                  setError(null);
                }}
                className="text-[#a8c7fa] font-bold hover:underline"
              >
                العودة لتسجيل الدخول
              </button>
            </p>
          )}

          <div className="pt-2 border-t border-white/5">
            <a
              href={TOLZY_PRICING_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-400 hover:text-white inline-flex items-center gap-1 text-[11px] transition-colors"
            >
              <span>تفاصيل الخطط والاشتراكات على tolzy.me/pricing</span>
              <ExternalLink className="w-3 h-3 text-[#a8c7fa]" />
            </a>
          </div>
        </div>

      </div>
    </div>
  );
};
