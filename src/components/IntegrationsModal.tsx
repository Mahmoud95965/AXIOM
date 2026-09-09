'use client';

import React from 'react';
import { X, Clock, Shield } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

interface IntegrationsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenAuth?: () => void;
}

export const IntegrationsModal: React.FC<IntegrationsModalProps> = ({
  isOpen,
  onClose
}) => {
  const { theme } = useTheme();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs animate-fade-in">
      <div className={`relative w-full max-w-lg rounded-2xl shadow-2xl p-5 sm:p-6 text-right border ${
        theme === 'light'
          ? 'bg-white border-zinc-200 text-zinc-900'
          : 'bg-[#141417] border-white/10 text-white'
      }`}>
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 left-4 p-1.5 rounded-lg text-zinc-400 hover:text-zinc-700 dark:hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="mb-5">
          <h2 className="text-lg font-bold mb-1">دليل الموصلات والتكاملات (MCP)</h2>
          <p className="text-xs text-zinc-400">إدارة الأدوات السحابية والتكاملات المتوافقة مع مساعد AXIOM</p>
        </div>

        {/* Notice */}
        <div className={`p-4 rounded-xl border flex items-center justify-between gap-3 ${
          theme === 'light' ? 'bg-zinc-50 border-zinc-200 text-zinc-800' : 'bg-[#0e0e11] border-white/[0.08] text-zinc-300'
        }`}>
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl border flex items-center justify-center p-1.5 shrink-0 ${
              theme === 'light' ? 'bg-white border-zinc-200' : 'bg-zinc-800 border-white/10'
            }`}>
              <Shield className="w-5 h-5 text-blue-500" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-0.5">
                <span className="text-sm font-semibold">تكاملات MCP السحابية</span>
                <span className="text-[10px] text-zinc-500 bg-zinc-200 dark:bg-white/5 px-1.5 py-0.5 rounded">قيد التجهيز</span>
              </div>
              <p className="text-[11px] text-zinc-400">يجري تجهيز موصلات GitHub و Supabase و Google Workspace وغيرها.</p>
            </div>
          </div>

          <div className="flex items-center gap-1 text-xs text-zinc-400 shrink-0">
            <Clock className="w-3.5 h-3.5" />
            <span>قريباً</span>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-5 pt-3 border-t border-zinc-100 dark:border-white/5 flex items-center justify-between text-[11px] text-zinc-400">
          <span>يتم تأمين كافة الاتصالات بمعايير التشفير القياسية (AES-256).</span>
        </div>

      </div>
    </div>
  );
};
