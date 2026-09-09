'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { Menu, PanelRightOpen, Coins, User, LogOut, ExternalLink, Settings, Sun, Moon, Link2, Download, Smartphone } from 'lucide-react';
import { PLAN_CONFIGS, TOLZY_PRICING_URL } from '../lib/types';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

interface ChatHeaderProps {
  isSidebarOpen: boolean;
  onToggleSidebar: () => void;
  onOpenSettings: () => void;
  onOpenAuth: () => void;
  onOpenPlans: () => void;
  onOpenIntegrations: () => void;
  onOpenInstall?: () => void;
}

export const ChatHeader: React.FC<ChatHeaderProps> = ({
  isSidebarOpen,
  onToggleSidebar,
  onOpenSettings,
  onOpenAuth,
  onOpenPlans,
  onOpenIntegrations,
  onOpenInstall
}) => {
  const { user, userProfile, logout, remainingTokens } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const userDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userDropdownRef.current && !userDropdownRef.current.contains(event.target as Node)) {
        setUserDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const currentPlan = PLAN_CONFIGS[userProfile.plan] || PLAN_CONFIGS.free;

  return (
    <header className={`h-14 w-full flex items-center justify-between px-3 sm:px-5 border-b z-30 shrink-0 transition-colors ${
      theme === 'light'
        ? 'bg-white border-zinc-200 text-zinc-900'
        : 'bg-[#0a0a0c] border-white/[0.08] text-zinc-100'
    }`}>
      
      {/* Left: Sidebar Toggle & Model Badge */}
      <div className="flex items-center gap-2 sm:gap-3">
        <button
          onClick={onToggleSidebar}
          className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${
            theme === 'light'
              ? 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100'
              : 'text-zinc-400 hover:text-white hover:bg-white/5'
          }`}
          title={isSidebarOpen ? "إخفاء القائمة" : "إظهار القائمة"}
        >
          {isSidebarOpen ? <Menu className="w-4 h-4" /> : <PanelRightOpen className="w-4 h-4" />}
        </button>

        <div className="flex items-center gap-1.5 text-xs font-semibold">
          <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
          <span>AXIOM V2</span>
        </div>
      </div>

      {/* Right: Install App, Theme Toggle, Tokens & Profile */}
      <div className="flex items-center gap-1.5 sm:gap-2">
        
        {/* Fast Install App Button */}
        {onOpenInstall && (
          <button
            onClick={onOpenInstall}
            className={`flex items-center gap-1.5 py-1 px-2 sm:px-2.5 rounded-lg border text-xs font-medium transition-all ${
              theme === 'light'
                ? 'bg-blue-50 hover:bg-blue-100 border-blue-200 text-blue-600 shadow-2xs'
                : 'bg-blue-950/40 hover:bg-blue-900/60 border-blue-500/30 text-blue-400 shadow-[0_0_12px_rgba(59,130,246,0.15)]'
            }`}
            title="تثبيت وتنزيل تطبيق AXIOM V2"
          >
            <Download className="w-3.5 h-3.5 text-blue-500 shrink-0" />
            <span className="hidden xs:inline font-semibold">تنزيل التطبيق</span>
          </button>
        )}

        {/* Theme Toggle Button (Light/Dark Mode) */}
        <button
          onClick={toggleTheme}
          className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${
            theme === 'light'
              ? 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100'
              : 'text-zinc-400 hover:text-white hover:bg-white/5'
          }`}
          title={theme === 'dark' ? "التحويل للوضع النهاري (Light Mode)" : "التحويل للوضع الليلي (Dark Mode)"}
        >
          {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-300" /> : <Moon className="w-4 h-4 text-zinc-600" />}
        </button>

        {/* Token Balance Button (Only for logged-in users) */}
        {user && (
          <button
            onClick={onOpenPlans}
            className={`flex items-center gap-1.5 py-1 px-2.5 rounded-lg border text-xs font-medium transition-colors ${
              theme === 'light'
                ? 'bg-zinc-100 hover:bg-zinc-200 border-zinc-200 text-zinc-800'
                : 'bg-white/5 hover:bg-white/10 border-white/10 text-zinc-300'
            }`}
            title="عرض رصيد التوكنز والخطط"
          >
            <Coins className="w-3 h-3 text-zinc-400" />
            <span>{remainingTokens > 1000 ? `${(remainingTokens / 1000).toFixed(0)}k` : remainingTokens} توكن</span>
          </button>
        )}

        {/* User Account Dropdown */}
        <div className="relative" ref={userDropdownRef}>
          {user ? (
            <button
              onClick={() => setUserDropdownOpen(!userDropdownOpen)}
              className={`w-7 h-7 rounded-full font-medium text-xs flex items-center justify-center border transition-all overflow-hidden ${
                theme === 'light'
                  ? 'bg-zinc-200 text-zinc-800 border-zinc-300'
                  : 'bg-zinc-800 text-white border-white/15'
              }`}
              title={user.displayName || user.email || 'حسابي'}
            >
              {user.photoURL ? (
                <img src={user.photoURL} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                (user.displayName ? user.displayName.charAt(0).toUpperCase() : 'U')
              )}
            </button>
          ) : (
            <button
              onClick={onOpenAuth}
              className={`py-1 px-3 rounded-lg font-semibold text-xs transition-colors ${
                theme === 'light'
                  ? 'bg-zinc-900 text-white hover:bg-zinc-800'
                  : 'bg-white text-black hover:bg-zinc-200'
              }`}
            >
              تسجيل الدخول
            </button>
          )}

          {/* Dropdown Menu */}
          {userDropdownOpen && user && (
            <div className={`absolute top-full left-0 mt-2 w-56 border rounded-xl shadow-xl p-2 z-50 animate-fade-in space-y-1 text-right text-xs ${
              theme === 'light'
                ? 'bg-white border-zinc-200 text-zinc-800'
                : 'bg-[#16161a] border-white/10 text-zinc-200'
            }`}>
              <div className={`px-2 py-1.5 border-b ${theme === 'light' ? 'border-zinc-100' : 'border-white/5'}`}>
                <p className="font-semibold truncate">{user.displayName || 'مستخدم TOLZY'}</p>
                <p className="text-[11px] text-zinc-400 truncate">{user.email}</p>
              </div>

              {onOpenInstall && (
                <button
                  onClick={() => {
                    setUserDropdownOpen(false);
                    onOpenInstall();
                  }}
                  className={`w-full text-right px-2.5 py-1.5 rounded-lg flex items-center justify-between transition-colors ${
                    theme === 'light' ? 'hover:bg-zinc-100 text-blue-600 font-medium' : 'hover:bg-white/5 text-blue-400 font-medium'
                  }`}
                >
                  <span>تثبيت التطبيق (PWA)</span>
                  <Download className="w-3.5 h-3.5" />
                </button>
              )}

              <Link
                href="/integrations"
                onClick={() => setUserDropdownOpen(false)}
                className={`w-full text-right px-2.5 py-1.5 rounded-lg flex items-center justify-between transition-colors ${
                  theme === 'light' ? 'hover:bg-zinc-100 text-zinc-700' : 'hover:bg-white/5 text-zinc-300 hover:text-white'
                }`}
              >
                <span>الربط والتكاملات (MCP)</span>
                <Link2 className="w-3 h-3 text-zinc-400" />
              </Link>

              <a
                href={TOLZY_PRICING_URL}
                target="_blank"
                rel="noopener noreferrer"
                className={`w-full text-right px-2.5 py-1.5 rounded-lg flex items-center justify-between transition-colors ${
                  theme === 'light' ? 'hover:bg-zinc-100 text-zinc-700' : 'hover:bg-white/5 text-zinc-300 hover:text-white'
                }`}
              >
                <span>الاشتراكات والأسعار</span>
                <ExternalLink className="w-3 h-3 text-zinc-400" />
              </a>

              <button
                onClick={() => {
                  setUserDropdownOpen(false);
                  onOpenSettings();
                }}
                className={`w-full text-right px-2.5 py-1.5 rounded-lg flex items-center gap-2 transition-colors ${
                  theme === 'light' ? 'hover:bg-zinc-100 text-zinc-700' : 'hover:bg-white/5 text-zinc-300 hover:text-white'
                }`}
              >
                <Settings className="w-3 h-3 text-zinc-400" />
                <span>الإعدادات</span>
              </button>

              <button
                onClick={async () => {
                  setUserDropdownOpen(false);
                  await logout();
                }}
                className="w-full text-right px-2.5 py-1.5 rounded-lg hover:bg-red-500/10 text-red-500 flex items-center gap-2 transition-colors border-t border-zinc-100 dark:border-white/5 mt-1"
              >
                <LogOut className="w-3 h-3 text-red-500" />
                <span>تسجيل الخروج</span>
              </button>
            </div>
          )}
        </div>

      </div>

    </header>
  );
};
