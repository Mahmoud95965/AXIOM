'use client';

import React from 'react';
import Link from 'next/link';
import { Plus, MessageSquare, Settings, Trash2, PanelRightClose, Coins, LogIn, ExternalLink, Link2, Sun, Moon } from 'lucide-react';
import { ChatSession, PLAN_CONFIGS, TOLZY_PRICING_URL } from '../lib/types';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
  chats: ChatSession[];
  currentChatId: string | null;
  onSelectChat: (id: string) => void;
  onNewChat: () => void;
  onDeleteChat: (id: string, e: React.MouseEvent) => void;
  onClearAll: () => void;
  onOpenInstall: () => void;
  onOpenSettings: () => void;
  onOpenAuth: () => void;
  onOpenPlans: () => void;
  onOpenIntegrations: () => void;
}

export const SidebarDrawer: React.FC<SidebarProps> = ({
  isOpen,
  onToggle,
  chats,
  currentChatId,
  onSelectChat,
  onNewChat,
  onDeleteChat,
  onClearAll,
  onOpenSettings,
  onOpenAuth,
  onOpenPlans,
  onOpenIntegrations
}) => {
  const { user, userProfile, remainingTokens } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const currentPlan = PLAN_CONFIGS[userProfile.plan] || PLAN_CONFIGS.free;

  const usagePercent = Math.min(
    100,
    Math.round((userProfile.tokensUsed / Math.max(1, userProfile.tokensLimit)) * 100)
  );

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div 
          onClick={onToggle}
          className="fixed inset-0 bg-black/60 backdrop-blur-xs z-40 md:hidden" 
        />
      )}

      {/* Sidebar Panel */}
      <aside
        className={`fixed md:relative top-0 right-0 h-full border-l z-50 md:z-20 flex flex-col text-right transition-all duration-200 ease-in-out ${
          theme === 'light'
            ? 'bg-zinc-50 border-zinc-200 text-zinc-900'
            : 'bg-[#0e0e11] border-white/[0.08] text-zinc-100'
        } ${
          isOpen 
            ? 'w-64 sm:w-72 translate-x-0' 
            : 'w-0 -translate-x-full md:translate-x-0 md:w-0 overflow-hidden border-none'
        }`}
      >
        <div className={`w-64 sm:w-72 flex flex-col h-full ${!isOpen ? 'hidden' : 'flex'}`}>
          
          {/* Header */}
          <div className={`flex items-center justify-between p-3.5 border-b ${
            theme === 'light' ? 'border-zinc-200' : 'border-white/[0.06]'
          }`}>
            <div className="flex items-center gap-2">
              <span className="font-bold text-sm">AXIOM V2</span>
              <span className="text-[10px] text-zinc-400">TOLZY</span>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={toggleTheme}
                className="w-7 h-7 rounded-lg flex items-center justify-center text-zinc-400 hover:text-zinc-700 dark:hover:text-white transition-colors"
                title="تغيير المظهر"
              >
                {theme === 'dark' ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
              </button>

              <button
                onClick={onToggle}
                className="w-7 h-7 rounded-lg flex items-center justify-center text-zinc-400 hover:text-zinc-700 dark:hover:text-white transition-colors"
                title="إخفاء القائمة"
              >
                <PanelRightClose className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* New Chat Button */}
          <div className="p-3">
            <button
              onClick={onNewChat}
              className={`w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl border font-medium text-xs transition-colors ${
                theme === 'light'
                  ? 'bg-white hover:bg-zinc-100 border-zinc-200 text-zinc-900 shadow-xs'
                  : 'bg-white/5 hover:bg-white/10 border-white/10 text-white'
              }`}
            >
              <Plus className="w-3.5 h-3.5" />
              <span>محادثة جديدة</span>
            </button>
          </div>

          {/* Chat History List */}
          <div className="flex-1 overflow-y-auto px-2 py-1 space-y-0.5">
            <span className="block text-[10px] font-semibold text-zinc-400 uppercase tracking-wider mb-1.5 px-2">
              المحادثات
            </span>

            {chats.map((chat) => {
              const isActive = chat.id === currentChatId;
              return (
                <div
                  key={chat.id}
                  onClick={() => onSelectChat(chat.id)}
                  className={`group flex items-center justify-between px-2.5 py-2 rounded-lg cursor-pointer text-xs transition-colors ${
                    isActive 
                      ? theme === 'light' ? 'bg-zinc-200 text-zinc-900 font-medium' : 'bg-white/10 text-white font-medium' 
                      : theme === 'light' ? 'text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900' : 'text-zinc-400 hover:bg-white/5 hover:text-zinc-200'
                  }`}
                >
                  <div className="flex items-center gap-2 overflow-hidden">
                    <MessageSquare className="w-3.5 h-3.5 shrink-0 opacity-50" />
                    <span className="truncate max-w-[160px]">{chat.title || 'محادثة جديدة'}</span>
                  </div>

                  <button
                    onClick={(e) => onDeleteChat(chat.id, e)}
                    className="opacity-0 group-hover:opacity-100 p-1 hover:text-red-500 transition-opacity"
                    title="حذف"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              );
            })}
          </div>

          {/* User Plan & Token Quota Card */}
          <div className={`mx-3 mb-2 p-2.5 rounded-xl border space-y-1.5 ${
            theme === 'light' ? 'bg-white border-zinc-200' : 'bg-[#141417] border-white/[0.06]'
          }`}>
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-1">
                <Coins className="w-3 h-3 text-zinc-400" />
                <span className="font-medium">{currentPlan.name}</span>
              </div>
              <button
                onClick={onOpenPlans}
                className="text-[10px] text-blue-500 hover:underline font-medium"
              >
                الخطط
              </button>
            </div>

            <div className={`w-full h-1 rounded-full overflow-hidden ${theme === 'light' ? 'bg-zinc-200' : 'bg-white/5'}`}>
              <div
                className="h-full bg-blue-500 rounded-full transition-all"
                style={{ width: `${usagePercent}%` }}
              />
            </div>

            <div className="flex items-center justify-between text-[10px] text-zinc-400">
              <span>المتبقي: {remainingTokens.toLocaleString('ar-EG')}</span>
              <span>{usagePercent}%</span>
            </div>
          </div>

          {/* Sidebar Menu Items */}
          <div className={`p-2 border-t space-y-0.5 text-xs ${
            theme === 'light' ? 'border-zinc-200' : 'border-white/[0.06]'
          }`}>
            
            {/* Dedicated Integrations Trigger */}
            <Link
              href="/integrations"
              className={`w-full flex items-center gap-2 p-2 rounded-lg transition-colors ${
                theme === 'light' ? 'text-zinc-700 hover:bg-zinc-100' : 'text-zinc-300 hover:text-white hover:bg-white/5'
              }`}
            >
              <Link2 className="w-3.5 h-3.5 text-zinc-400" />
              <span>الربط والتكاملات السحابية</span>
            </Link>

            <button
              onClick={onOpenSettings}
              className={`w-full flex items-center gap-2 p-2 rounded-lg transition-colors ${
                theme === 'light' ? 'text-zinc-600 hover:bg-zinc-100' : 'text-zinc-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <Settings className="w-3.5 h-3.5" />
              <span>الإعدادات</span>
            </button>

            <button
              onClick={() => {
                if (confirm('هل تريد مسح سجل المحادثات؟')) {
                  onClearAll();
                }
              }}
              className="w-full flex items-center gap-2 p-2 rounded-lg text-zinc-400 hover:text-red-500 hover:bg-red-500/5 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>مسح السجل</span>
            </button>

            {/* User Account / Login */}
            <div className={`pt-2 mt-1 border-t px-1 ${theme === 'light' ? 'border-zinc-200' : 'border-white/[0.04]'}`}>
              {user ? (
                <div className="flex items-center gap-2">
                  <div className={`w-6 h-6 rounded-full font-medium text-[11px] flex items-center justify-center overflow-hidden shrink-0 ${
                    theme === 'light' ? 'bg-zinc-200 text-zinc-800' : 'bg-zinc-800 text-white'
                  }`}>
                    {user.photoURL ? (
                      <img src={user.photoURL} alt="Avatar" className="w-full h-full object-cover" />
                    ) : (
                      (user.displayName ? user.displayName.charAt(0).toUpperCase() : 'U')
                    )}
                  </div>
                  <div className="flex flex-col truncate">
                    <span className="text-xs font-medium truncate">{user.displayName || user.email}</span>
                  </div>
                </div>
              ) : (
                <button
                  onClick={onOpenAuth}
                  className={`w-full py-1.5 px-2.5 rounded-lg font-medium flex items-center justify-center gap-1.5 transition-colors ${
                    theme === 'light' ? 'bg-zinc-200 hover:bg-zinc-300 text-zinc-900' : 'bg-white/5 hover:bg-white/10 text-white'
                  }`}
                >
                  <LogIn className="w-3 h-3 text-zinc-400" />
                  <span>تسجيل الدخول</span>
                </button>
              )}
            </div>

          </div>

        </div>
      </aside>
    </>
  );
};
