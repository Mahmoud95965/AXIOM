'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { 
  ArrowRight, Search, Shield, Sun, Moon, 
  Sparkles, X, Layers, Code2, Palette, Zap, Clock, Bell, Rocket, CheckCircle2 
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';

interface ConnectorItem {
  id: string;
  name: string;
  category: 'all' | 'top' | 'code' | 'design';
  description: string;
  version: string;
  badge: string;
  authType: string;
  renderIcon: (theme: string) => React.ReactNode;
}

const UPCOMING_CONNECTORS_LIST: ConnectorItem[] = [
  // 1. GitHub
  {
    id: 'github',
    name: 'GitHub Connector',
    category: 'code',
    description: 'مزامنة الكود البرمجي، مراجعة الـ Pull Requests، وإنشاء الـ Commits والمستودعات تلقائياً عبر AXIOM V2.',
    version: 'v3.0.0 Next Release',
    badge: 'قريباً',
    authType: 'OAuth 2.0 (Direct Sync)',
    renderIcon: () => (
      <svg width="26" height="26" viewBox="0 0 24 24" fill="currentColor">
        <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
      </svg>
    ),
  },
  // 2. Supabase
  {
    id: 'supabase',
    name: 'Supabase Database',
    category: 'code',
    description: 'إدارة قواعد بيانات PostgreSQL، المصادقة، التخزين السحابي، وتنفيذ دوال Edge Functions الذكية.',
    version: 'v3.0.0 Next Release',
    badge: 'قريباً',
    authType: 'API Key & Live SDK',
    renderIcon: () => (
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
        <path d="M13.35 2.05a1.2 1.2 0 0 0-2.02.68l-.88 9.27h-7.6a1.2 1.2 0 0 0-.93 1.96l9.85 11.23a1.2 1.2 0 0 0 2.03-.7l.87-9.25h7.62a1.2 1.2 0 0 0 .93-1.96L13.35 2.05z" fill="#3ECF8E" />
      </svg>
    ),
  },
  // 3. Google Drive
  {
    id: 'google-drive',
    name: 'Google Drive',
    category: 'top',
    description: 'البحث المباشر، القراءة، وفهرسة وتحليل الملفات ومستندات العمل والـ PDFs فورياً.',
    version: 'v3.0.0 Next Release',
    badge: 'قريباً',
    authType: 'Google Workspace OAuth',
    renderIcon: () => (
      <svg width="26" height="26" viewBox="0 0 16 16">
        <path d="M1.84624 12.6235L2.48571 13.728C2.61858 13.9605 2.80959 14.1432 3.03382 14.2761L5.31765 10.3231H0.75C0.75 10.5805 0.816439 10.8379 0.949316 11.0705L1.84624 12.6235Z" fill="#0066DA" />
        <path d="M8.00011 5.67238L5.71628 1.71931C5.49205 1.85219 5.30104 2.0349 5.16816 2.26743L0.949316 9.57562C0.818882 9.80314 0.750174 10.0608 0.75 10.3231H5.31765L8.00011 5.67238Z" fill="#00AC47" />
        <path d="M12.9663 14.2761C13.1905 14.1432 13.3815 13.9605 13.5144 13.728L13.7802 13.2712L15.0508 11.0705C15.1837 10.8379 15.2501 10.5805 15.2501 10.3231H10.6821L11.6541 12.2331L12.9663 14.2761Z" fill="#EA4335" />
        <path d="M8.00013 5.67238L10.284 1.71931C10.0597 1.58643 9.80228 1.52 9.53652 1.52H6.46374C6.19799 1.52 5.94054 1.59474 5.71631 1.71931L8.00013 5.67238Z" fill="#00832D" />
        <path d="M10.6824 10.3231H5.31752L3.03369 14.2761C3.25792 14.409 3.51537 14.4754 3.78112 14.4754H12.2188C12.4846 14.4754 12.742 14.4007 12.9663 14.2761L10.6824 10.3231Z" fill="#2684FC" />
        <path d="M12.9414 5.92153L10.8319 2.26743C10.6991 2.0349 10.5081 1.85219 10.2838 1.71931L8 5.67238L10.6825 10.3231H15.2418C15.2418 10.0656 15.1754 9.80816 15.0425 9.57562L12.9414 5.92153Z" fill="#FFBA00" />
      </svg>
    ),
  },
  // 4. Notion
  {
    id: 'notion',
    name: 'Notion Workspace',
    category: 'top',
    description: 'ربط مساحة عمل Notion للبحث والتحديث وصياغة الملاحظات والمهام اليومية بذكاء.',
    version: 'v3.0.0 Next Release',
    badge: 'قريباً',
    authType: 'Notion OAuth 2.0',
    renderIcon: () => (
      <svg width="26" height="26" viewBox="0 0 24 24" fill="currentColor">
        <path d="M4.459 4.208c.746.606 1.026.56 2.428.466l11.455-.652c.42-.047.466-.233.326-.466L17.26 2.062c-.42-.326-.886-.466-1.586-.42L3.899 2.482c-.513.047-.653.28-.42.56zm.793 4.292v11.875c0 .793.42 1.258 1.306 1.212l12.434-.7c.886-.046 1.073-.606 1.073-1.306V7.798c0-.7-.28-.979-.886-.933l-13.04.746c-.607.047-.887.327-.887.89zm11.338.932c.094.42 0 .84-.42.886l-.979.187v8.766c-.513.28-1.073.466-1.632.466-.887 0-1.26-.28-1.96-1.12l-4.244-6.621v6.435l1.353.326c.046.42-.187.84-.606.887l-3.358.187c-.094-.42 0-.84.42-.887l1.026-.233V9.897L6.23 9.71c-.046-.42.187-.84.606-.886l3.592-.233 4.524 6.854V9.617l-1.213-.187c-.047-.42.233-.84.653-.886z"/>
      </svg>
    ),
  },
  // 5. Figma
  {
    id: 'figma',
    name: 'Figma UI/UX',
    category: 'design',
    description: 'استخراج المخططات الهندسية وأكواد واجهات المستخدم المتجاوبة المباشرة من تصاميم Figma.',
    version: 'v3.0.0 Next Release',
    badge: 'قريباً',
    authType: 'Figma REST API & OAuth',
    renderIcon: () => (
      <svg width="22" height="30" viewBox="0 0 38 57" fill="none">
        <path d="M19 28.5C19 23.2533 23.2533 19 28.5 19C33.7467 19 38 23.2533 38 28.5C38 33.7467 33.7467 38 28.5 38C23.2533 38 19 33.7467 19 28.5Z" fill="#1ABCFE"/>
        <path d="M0 47.5C0 42.2533 4.25329 38 9.5 38H19V47.5C19 52.7467 14.7467 57 9.5 57C4.25329 57 0 52.7467 0 47.5Z" fill="#0ACF83"/>
        <path d="M19 0V19H28.5C33.7467 19 38 14.7467 38 9.5C38 4.25329 33.7467 0 28.5 0H19Z" fill="#FF7262"/>
        <path d="M0 9.5C0 14.7467 4.25329 19 9.5 19H19V0H9.5C4.25329 0 0 4.25329 0 9.5Z" fill="#F24E1E"/>
        <path d="M0 28.5C0 33.7467 4.25329 38 9.5 38H19V19H9.5C4.25329 19 0 23.2533 0 28.5Z" fill="#A259FF"/>
      </svg>
    ),
  },
  // 6. Slack
  {
    id: 'slack',
    name: 'Slack Collaboration',
    category: 'top',
    description: 'إرسال التنبيهات المباشرة، ملخصات المحادثات، وجلب سياق قنوات Slack.',
    version: 'v3.0.0 Next Release',
    badge: 'قريباً',
    authType: 'Slack Bot & User Token',
    renderIcon: () => (
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
        <path d="M6 15a2 2 0 0 1-2-2 2 2 0 0 1 2-2h2v2a2 2 0 0 1-2 2" fill="#E01E5A"/>
        <path d="M5 17a2 2 0 0 1 2 2 2 2 0 0 1-2 2 2 2 0 0 1-2-2v-2h2" fill="#36C5F0"/>
        <path d="M9 6a2 2 0 0 1 2-2 2 2 0 0 1 2 2v2h-2a2 2 0 0 1-2-2" fill="#36C5F0"/>
        <path d="M7 5a2 2 0 0 1-2 2 2 2 0 0 1-2-2 2 2 0 0 1 2-2h2v2" fill="#2EB67D"/>
        <path d="M18 9a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-2v-2a2 2 0 0 1 2-2" fill="#2EB67D"/>
        <path d="M19 7a2 2 0 0 1-2-2 2 2 0 0 1 2-2 2 2 0 0 1 2 2v2h-2" fill="#ECB22E"/>
        <path d="M15 18a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-2h2a2 2 0 0 1 2 2" fill="#ECB22E"/>
        <path d="M17 19a2 2 0 0 1 2-2 2 2 0 0 1 2 2 2 2 0 0 1-2 2h-2v-2" fill="#E01E5A"/>
      </svg>
    ),
  },
  // 7. Vercel
  {
    id: 'vercel',
    name: 'Vercel Deployment',
    category: 'code',
    description: 'متابعة وفحص أخطاء عمليات البناء (Build Logs)، والنشر الحي التلقائي لمشاريع الويب.',
    version: 'v3.0.0 Next Release',
    badge: 'قريباً',
    authType: 'Vercel API & Webhooks',
    renderIcon: (t: string) => (
      <svg width="24" height="24" viewBox="0 0 24 24" fill={t === 'light' ? '#000' : '#FFF'}>
        <path d="M12 1L24 22H0L12 1Z" />
      </svg>
    ),
  },
];

export default function IntegrationsPage() {
  const { user } = useAuth();
  const { theme, toggleTheme } = useTheme();

  // State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [notified, setNotified] = useState(false);

  const handleNotifyMe = () => {
    setNotified(true);
    setTimeout(() => {
      alert('شكراً لك! تم تسجيل طلبك وسيتم إشعارك فور إطلاق التحديث القادم v3.0.0.');
    }, 200);
  };

  // Filtered connectors
  const filteredConnectors = useMemo(() => {
    return UPCOMING_CONNECTORS_LIST.filter((item) => {
      const matchSearch =
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description.toLowerCase().includes(searchQuery.toLowerCase());

      const matchCategory =
        selectedCategory === 'all' ||
        item.category === selectedCategory ||
        (selectedCategory === 'top' && item.category === 'top');

      return matchSearch && matchCategory;
    });
  }, [searchQuery, selectedCategory]);

  const categories = [
    { id: 'all', label: 'الكل (7 موصلات)', icon: Layers },
    { id: 'top', label: 'الأكثر طلباً', icon: Zap },
    { id: 'code', label: 'البرمجة والتطوير', icon: Code2 },
    { id: 'design', label: 'التصميم والواجهات', icon: Palette },
  ];

  return (
    <div className={`min-h-screen transition-colors ${
      theme === 'light' ? 'bg-[#f8f9fa] text-zinc-900' : 'bg-[#0a0a0c] text-zinc-100'
    }`}>
      
      {/* Top Header */}
      <header className={`sticky top-0 z-30 border-b backdrop-blur-md px-4 sm:px-8 py-3.5 transition-colors ${
        theme === 'light'
          ? 'bg-white/80 border-zinc-200/80 text-zinc-900'
          : 'bg-[#0a0a0c]/80 border-white/[0.08] text-white'
      }`}>
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className={`flex items-center gap-2 py-1.5 px-3 rounded-xl border text-xs font-medium transition-colors ${
                theme === 'light'
                  ? 'bg-zinc-100 hover:bg-zinc-200/70 border-zinc-200 text-zinc-800'
                  : 'bg-white/5 hover:bg-white/10 border-white/10 text-zinc-300 hover:text-white'
              }`}
            >
              <ArrowRight className="w-3.5 h-3.5" />
              <span>العودة إلى الشات</span>
            </Link>

            <span className="text-xs font-bold hidden sm:inline-block opacity-40">/</span>

            <div className="hidden sm:flex items-center gap-1.5 text-xs font-semibold">
              <Rocket className="w-3.5 h-3.5 text-blue-500" />
              <span>الربط والتكاملات السحابية (قريباً في التحديث القادم)</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={toggleTheme}
              className={`w-8 h-8 rounded-xl border flex items-center justify-center transition-colors ${
                theme === 'light'
                  ? 'bg-zinc-100 border-zinc-200 text-zinc-600 hover:bg-zinc-200/70'
                  : 'bg-white/5 border-white/10 text-zinc-400 hover:text-white'
              }`}
              title="تغيير المظهر"
            >
              {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-300" /> : <Moon className="w-4 h-4 text-zinc-600" />}
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-6xl mx-auto p-4 sm:p-8 text-right">
        
        {/* Futuristic Hero Teaser Card (قريباً في التحديث القادم) */}
        <div className={`mb-8 p-6 sm:p-8 rounded-[32px] border relative overflow-hidden text-right transition-all ${
          theme === 'light'
            ? 'bg-gradient-to-br from-white via-zinc-50 to-blue-50/40 border-zinc-200 shadow-sm'
            : 'bg-gradient-to-br from-[#121216] via-[#101014] to-blue-950/20 border-white/10'
        }`}>
          
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold mb-3 bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
              <Sparkles className="w-3.5 h-3.5" />
              <span>قريباً في التحديث القادم • AXIOM V3</span>
            </div>

            <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight mb-2.5">
              بيئة الربط والتكاملات السحابية المباشرة
            </h1>

            <p className={`text-xs sm:text-sm leading-relaxed mb-6 ${
              theme === 'light' ? 'text-zinc-600' : 'text-zinc-400'
            }`}>
              يجري حالياً تجهيز وإطلاق الموصلات الرسمية لمنظومة TOLZY AI لتمكين AXIOM V2 من التفاعل المباشر مع ملفاتك البرمجية، قواعد بيانات Supabase، مستندات Google Drive، ومشاريع GitHub و Figma تلقائياً.
            </p>

            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={handleNotifyMe}
                className={`py-2.5 px-4 rounded-xl font-semibold text-xs transition-all flex items-center gap-2 shadow-sm ${
                  notified
                    ? 'bg-emerald-500 text-white cursor-default'
                    : theme === 'light'
                    ? 'bg-zinc-900 text-white hover:bg-zinc-800'
                    : 'bg-white text-black hover:bg-zinc-200'
                }`}
              >
                {notified ? (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>تم تسجيل الإشعار ✓</span>
                  </>
                ) : (
                  <>
                    <Bell className="w-4 h-4" />
                    <span>أعلمني فور الإطلاق</span>
                  </>
                )}
              </button>

              <div className={`px-3 py-2 rounded-xl border text-xs font-medium inline-flex items-center gap-1.5 ${
                theme === 'light' ? 'bg-white border-zinc-200 text-zinc-700' : 'bg-white/5 border-white/10 text-zinc-300'
              }`}>
                <Clock className="w-3.5 h-3.5 text-zinc-400" />
                <span>الإطلاق المتوقع: التحديث القادم</span>
              </div>
            </div>
          </div>

        </div>

        {/* Search & Filter Bar */}
        <div className="mb-6">
          <div className="flex flex-col sm:flex-row items-center gap-3">
            
            {/* Search Input */}
            <div className={`relative flex-1 w-full rounded-2xl border transition-all ${
              theme === 'light'
                ? 'bg-white border-zinc-200 shadow-xs focus-within:border-zinc-400'
                : 'bg-[#141417] border-white/10 focus-within:border-white/20'
            }`}>
              <Search className="w-4 h-4 text-zinc-400 absolute right-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="ابحث في الموصلات القادمة (GitHub, Supabase, Google Drive, Notion, Figma...)"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-transparent py-2.5 pr-10 pl-4 text-xs font-medium outline-none"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-700 dark:hover:text-white"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Category Filter Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0 scrollbar-none">
              {categories.map((cat) => {
                const isSelected = selectedCategory === cat.id;
                const Icon = cat.icon;
                return (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium whitespace-nowrap transition-all ${
                      isSelected
                        ? theme === 'light'
                          ? 'bg-zinc-900 text-white shadow-xs'
                          : 'bg-white text-black shadow-xs'
                        : theme === 'light'
                          ? 'bg-white hover:bg-zinc-100 text-zinc-700 border border-zinc-200'
                          : 'bg-[#141417] hover:bg-white/10 text-zinc-300 border border-white/5'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5 opacity-70" />
                    <span>{cat.label}</span>
                  </button>
                );
              })}
            </div>

          </div>
        </div>

        {/* Connectors Grid (7 Curated Upcoming Cards) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
          {filteredConnectors.map((item) => {
            return (
              <div
                key={item.id}
                className={`relative rounded-[28px] p-5 sm:p-6 border transition-all duration-200 flex flex-col justify-between group ${
                  theme === 'light'
                    ? 'bg-white border-zinc-200 shadow-2xs hover:border-zinc-300 hover:shadow-xs'
                    : 'bg-[#121215] border-white/[0.07] hover:border-white/15'
                }`}
              >
                {/* Card Top: Icon, Title & Action */}
                <div>
                  <div className="flex items-start justify-between gap-3 mb-3.5">
                    
                    {/* Squircle Icon Container */}
                    <div className={`w-13 h-13 rounded-[20px] border flex items-center justify-center shrink-0 p-2.5 shadow-2xs transition-transform group-hover:scale-105 ${
                      theme === 'light'
                        ? 'bg-zinc-50 border-zinc-200 text-zinc-900'
                        : 'bg-[#18181d] border-white/10 text-white'
                    }`}>
                      {item.renderIcon(theme)}
                    </div>

                    {/* Badge */}
                    <span className={`py-1.5 px-3 rounded-xl font-semibold text-xs flex items-center gap-1.5 shrink-0 ${
                      theme === 'light'
                        ? 'bg-zinc-100 text-zinc-600 border border-zinc-200'
                        : 'bg-white/5 text-zinc-300 border border-white/10'
                    }`}>
                      <Clock className="w-3 h-3 text-blue-500" />
                      <span>قريباً في v3.0</span>
                    </span>

                  </div>

                  {/* Title */}
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="font-bold text-sm leading-tight">
                      {item.name}
                    </h3>
                  </div>

                  {/* Description */}
                  <p className={`text-xs leading-relaxed line-clamp-2 ${
                    theme === 'light' ? 'text-zinc-600' : 'text-zinc-400'
                  }`}>
                    {item.description}
                  </p>
                </div>

                {/* Card Bottom Meta */}
                <div className={`mt-5 pt-3 border-t flex items-center justify-between text-[11px] ${
                  theme === 'light' ? 'border-zinc-100 text-zinc-400' : 'border-white/5 text-zinc-500'
                }`}>
                  <span className="font-mono text-[10px]">{item.authType}</span>
                  <span className="opacity-75">{item.version}</span>
                </div>

              </div>
            );
          })}
        </div>

        {/* Footer info */}
        <div className={`mt-12 pt-6 border-t flex flex-col sm:flex-row items-center justify-between text-xs gap-3 ${
          theme === 'light' ? 'border-zinc-200 text-zinc-500' : 'border-white/[0.06] text-zinc-500'
        }`}>
          <span>دليل الموصلات والتكاملات القادمة لـ AXIOM V2 • منظومة TOLZY AI.</span>
          <span className="text-[11px] opacity-70">Model Context Protocol (MCP Roadmap)</span>
        </div>

      </main>

    </div>
  );
}
