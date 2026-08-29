export type ModelType = 'axiom_v2';

export type UserPlan = 'free' | 'pro' | 'max';

export interface UserProfile {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  plan: UserPlan;
  tokensUsed: number;
  tokensLimit: number;
  dailyTokensUsed?: number;
  dailyTokensLimit?: number;
  lastActiveDate?: string;
  createdAt: string;
}

export interface PlanConfig {
  id: UserPlan;
  name: string;
  badge: string;
  badgeClass: string;
  tokenLimit: number;
  tokenLimitLabel: string;
  dailyTokenLimit: number;
  dailyLimitLabel: string;
  price: string;
  features: string[];
}

export const PLAN_CONFIGS: Record<UserPlan, PlanConfig> = {
  free: {
    id: 'free',
    name: 'الخطة المجانية',
    badge: 'مجاني',
    badgeClass: 'bg-gray-700/50 text-gray-300 border-gray-600/30',
    tokenLimit: 25000,
    tokenLimitLabel: '25,000 توكن / شهرياً',
    dailyTokenLimit: 2500,
    dailyLimitLabel: '2,500 توكن يومياً',
    price: '0$ مجاناً',
    features: [
      'وصول مباشر لنموذج AXIOM V2',
      '2,500 توكن ذكاء اصطناعي يومياً (25,000 شهرياً)',
      'إجابات دقيقة وكتابة أكواد برمجية',
      'حفظ سجل المحادثات وتثبيت الـ PWA'
    ]
  },
  pro: {
    id: 'pro',
    name: 'خطة البرو (Pro)',
    badge: 'Pro ✨',
    badgeClass: 'bg-purple-900/50 text-purple-300 border-purple-500/40 shadow-[0_0_12px_rgba(155,81,224,0.3)]',
    tokenLimit: 300000,
    tokenLimitLabel: '300,000 توكن / شهرياً',
    dailyTokenLimit: 30000,
    dailyLimitLabel: '30,000 توكن يومياً',
    price: '9.99$ / شهرياً',
    features: [
      'وصول كامل لنموذج AXIOM V2 بسرعة مضاعفة',
      '30,000 توكن يومياً (300,000 شهرياً)',
      'البحث الحي المباشر عبر الإنترنت',
      'تخليق وصناعة الصور عبر نموذج FLUX.2 Pro',
      'حفظ الصور سحابياً على Azure Storage Center'
    ]
  },
  max: {
    id: 'max',
    name: 'خطة الماكس (Max)',
    badge: 'Max 🚀',
    badgeClass: 'bg-amber-900/50 text-amber-300 border-amber-500/40 shadow-[0_0_15px_rgba(251,188,5,0.3)]',
    tokenLimit: 1200000,
    tokenLimitLabel: '1,200,000 توكن / شهرياً',
    dailyTokenLimit: 120000,
    dailyLimitLabel: '120,000 توكن يومياً',
    price: '24.99$ / شهرياً',
    features: [
      'أعلى سعة: 120,000 توكن يومياً (1,200,000 شهرياً)',
      'أولوية قصوى على سيرفرات Azure AI المباشرة',
      'تخليق غير محدود للصور بنموذج FLUX.2 Pro',
      'تخزين سحابي فوري على Azure Blob Storage',
      'وصول كامل لكافة أدوات منظومة TOLZY AI'
    ]
  }
};

/**
 * Normalizer to accurately detect and normalize user plans from any source
 * (Firestore fields, custom claims, Arabic, English, lowercase, uppercase, nested objects)
 */
export function normalizePlan(rawPlan: any): UserPlan {
  if (!rawPlan) return 'free';
  const str = String(rawPlan).trim().toLowerCase();

  if (
    str.includes('max') ||
    str.includes('ultra') ||
    str.includes('enterprise') ||
    str.includes('vip') ||
    str.includes('ماكس') ||
    str.includes('ألترا') ||
    str.includes('الماكس')
  ) {
    return 'max';
  }

  if (
    str.includes('pro') ||
    str.includes('plus') ||
    str.includes('premium') ||
    str.includes('professional') ||
    str.includes('برو') ||
    str.includes('بلس') ||
    str.includes('احترافي') ||
    str.includes('البرو')
  ) {
    return 'pro';
  }

  return 'free';
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  image?: string | null;
  timestamp: string;
  tokensEstimate?: number;
  isWebSearch?: boolean;
}

export interface ChatSession {
  id: string;
  title: string;
  createdAt: string;
  messages: ChatMessage[];
}

export interface AppSettings {
  autoTts: boolean;
  showReasoning: boolean;
  mobileSimulator: boolean;
  lang: 'ar' | 'en';
}

export const TOLZY_PRICING_URL = 'https://tolzy.me/pricing';
