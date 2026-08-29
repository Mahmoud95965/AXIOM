'use client';

import React, { useState } from 'react';
import { X, Download, Smartphone, Apple, Monitor, Sparkles, CheckCircle2 } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

interface InstallModalProps {
  isOpen: boolean;
  onClose: () => void;
  onInstall: () => void;
}

export const InstallModal: React.FC<InstallModalProps> = ({ isOpen, onClose, onInstall }) => {
  const { theme } = useTheme();
  const [activeTab, setActiveTab] = useState<'android' | 'ios' | 'desktop'>('android');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-fade-in">
      <div className={`relative w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden p-6 sm:p-8 text-right border transition-all ${
        theme === 'light'
          ? 'bg-white border-zinc-200 text-zinc-900 shadow-zinc-200'
          : 'bg-[#141418] border-white/10 text-white shadow-black/80'
      }`}>
        
        {/* Top Gradient Sheen */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#00f0ff] via-[#8b5cf6] to-[#ec4899]" />

        {/* Close Button (✕) */}
        <button
          onClick={onClose}
          className={`absolute top-5 left-5 w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
            theme === 'light' ? 'bg-zinc-100 hover:bg-zinc-200 text-zinc-600' : 'bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white'
          }`}
          title="إغلاق"
        >
          <X className="w-4 h-4" />
        </button>

        {/* App Logo & Header */}
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-2xl overflow-hidden shadow-md border border-white/10 shrink-0">
            <img src="/icon-192.svg" alt="AXIOM Icon" className="w-full h-full object-cover" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold text-blue-500 uppercase tracking-wide">تطبيق الويب التقدمي (PWA)</span>
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            </div>
            <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight">
              تثبيت تطبيق AXIOM V2
            </h2>
          </div>
        </div>

        <p className={`text-xs sm:text-sm mb-6 leading-relaxed ${
          theme === 'light' ? 'text-zinc-600' : 'text-zinc-400'
        }`}>
          ثبّت AXIOM V2 على شاشتك الرئيسية أو سطح المكتب لتجربة سريعة وفائقة الاستجابة تعمل بدون متصفح مع إشعارات فورية وأداء سلس.
        </p>

        {/* Main Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center gap-2.5 mb-6">
          <button
            onClick={onInstall}
            className={`w-full sm:w-auto flex-1 flex items-center justify-center gap-2 py-3 px-5 rounded-2xl font-bold text-xs shadow-md transition-all ${
              theme === 'light'
                ? 'bg-zinc-900 hover:bg-zinc-800 text-white shadow-zinc-400/20'
                : 'bg-white hover:bg-zinc-200 text-black shadow-white/10'
            }`}
          >
            <Download className="w-4 h-4" />
            <span>تثبيت التطبيق الآن</span>
          </button>

          <button
            onClick={onClose}
            className={`w-full sm:w-auto py-3 px-5 rounded-2xl border font-medium text-xs transition-colors ${
              theme === 'light'
                ? 'bg-zinc-100 hover:bg-zinc-200 border-zinc-200 text-zinc-700'
                : 'bg-white/5 hover:bg-white/10 border-white/10 text-zinc-300'
            }`}
          >
            لاحقاً
          </button>
        </div>

        {/* Platform Tabs */}
        <div className={`border-t pt-4 ${theme === 'light' ? 'border-zinc-100' : 'border-white/5'}`}>
          <div className="flex items-center gap-1.5 mb-3">
            <button
              onClick={() => setActiveTab('android')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                activeTab === 'android'
                  ? 'bg-blue-500/15 text-blue-600 dark:text-blue-400 border border-blue-500/30'
                  : theme === 'light' ? 'text-zinc-500 hover:bg-zinc-100' : 'text-zinc-400 hover:bg-white/5'
              }`}
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span>Android</span>
            </button>

            <button
              onClick={() => setActiveTab('ios')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                activeTab === 'ios'
                  ? 'bg-blue-500/15 text-blue-600 dark:text-blue-400 border border-blue-500/30'
                  : theme === 'light' ? 'text-zinc-500 hover:bg-zinc-100' : 'text-zinc-400 hover:bg-white/5'
              }`}
            >
              <Apple className="w-3.5 h-3.5" />
              <span>iPhone (iOS)</span>
            </button>

            <button
              onClick={() => setActiveTab('desktop')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                activeTab === 'desktop'
                  ? 'bg-blue-500/15 text-blue-600 dark:text-blue-400 border border-blue-500/30'
                  : theme === 'light' ? 'text-zinc-500 hover:bg-zinc-100' : 'text-zinc-400 hover:bg-white/5'
              }`}
            >
              <Monitor className="w-3.5 h-3.5" />
              <span>كمبيوتر (Desktop)</span>
            </button>
          </div>

          <div className={`rounded-2xl p-3.5 border text-xs space-y-2 ${
            theme === 'light' ? 'bg-zinc-50 border-zinc-200 text-zinc-700' : 'bg-[#0d0d10] border-white/5 text-zinc-300'
          }`}>
            {activeTab === 'android' && (
              <>
                <p className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                  <span>انقر على زر <strong>"تثبيت التطبيق الآن"</strong> بالأعلى.</span>
                </p>
                <p className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                  <span>أو من قائمة المتصفح (⋮) اختر <strong>"تثبيت التطبيق"</strong> أو <strong>"إضافة للشاشة الرئيسية"</strong>.</span>
                </p>
              </>
            )}

            {activeTab === 'ios' && (
              <>
                <p className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                  <span>في متصفح Safari، اضغط على زر المشاركة (المربع مع سهم لأعلى ⎋).</span>
                </p>
                <p className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                  <span>اختر <strong>"إضافة إلى الصفحة الرئيسية (Add to Home Screen)"</strong>.</span>
                </p>
              </>
            )}

            {activeTab === 'desktop' && (
              <>
                <p className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                  <span>انقر على أيقونة التثبيت ⊕ في شريط العنوان أعلى متصفح Chrome أو Edge.</span>
                </p>
                <p className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                  <span>اضغط <strong>Install</strong> لتشغيل AXIOM كتطبيق نافذة مستقل وسريع.</span>
                </p>
              </>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};
