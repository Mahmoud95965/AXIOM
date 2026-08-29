'use client';

import React from 'react';
import { X, Volume2, Moon, Globe } from 'lucide-react';
import { AppSettings } from '../lib/types';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: AppSettings;
  onUpdateSettings: (newSettings: Partial<AppSettings>) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onUpdateSettings
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs animate-fade-in">
      <div className="relative w-full max-w-md bg-[#141417] border border-white/10 rounded-2xl shadow-2xl p-5 sm:p-6 text-white text-right">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 left-4 p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-white/5 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Title */}
        <h2 className="text-base font-bold text-white mb-4">الإعدادات والتفضيلات</h2>

        {/* Options List */}
        <div className="space-y-3">
          
          {/* TTS Toggle */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-[#0e0e11] border border-white/[0.06]">
            <div className="flex items-center gap-2.5">
              <Volume2 className="w-4 h-4 text-zinc-400" />
              <div>
                <span className="text-xs font-semibold text-white block">القراءة الصوتية التلقائية</span>
                <span className="text-[10px] text-zinc-500">نطق الردود الصوتية فور توليدها</span>
              </div>
            </div>
            <input
              type="checkbox"
              checked={settings.autoTts}
              onChange={(e) => onUpdateSettings({ autoTts: e.target.checked })}
              className="w-4 h-4 accent-white rounded cursor-pointer"
            />
          </div>

          {/* Theme Note */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-[#0e0e11] border border-white/[0.06]">
            <div className="flex items-center gap-2.5">
              <Moon className="w-4 h-4 text-zinc-400" />
              <div>
                <span className="text-xs font-semibold text-white block">المظهر</span>
                <span className="text-[10px] text-zinc-500">النمط الليلي الداكن الافتراضي (Dark Minimal)</span>
              </div>
            </div>
            <span className="text-[11px] text-zinc-400 bg-white/5 px-2 py-0.5 rounded">مفعل</span>
          </div>

        </div>

        {/* Footer */}
        <div className="mt-5 pt-3 border-t border-white/[0.06] text-center">
          <button
            onClick={onClose}
            className="w-full py-2 rounded-xl bg-white text-black font-semibold text-xs hover:bg-zinc-200 transition-colors"
          >
            حفظ وإغلاق
          </button>
        </div>

      </div>
    </div>
  );
};
