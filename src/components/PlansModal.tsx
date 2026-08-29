'use client';

import React from 'react';
import { X, Check, ExternalLink } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { PLAN_CONFIGS, UserPlan, TOLZY_PRICING_URL } from '../lib/types';

interface PlansModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenAuth?: () => void;
}

export const PlansModal: React.FC<PlansModalProps> = ({
  isOpen,
  onClose,
  onOpenAuth
}) => {
  const { userProfile, upgradePlan, remainingTokens } = useAuth();

  if (!isOpen) return null;

  const handleSelectPlan = async (plan: UserPlan) => {
    if (plan === 'free') {
      await upgradePlan('free');
      onClose();
      return;
    }
    window.open(TOLZY_PRICING_URL, '_blank');
    onClose();
  };

  const plans: UserPlan[] = ['free', 'pro', 'max'];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs animate-fade-in overflow-y-auto">
      <div className="relative w-full max-w-3xl bg-[#141417] border border-white/10 rounded-2xl shadow-2xl p-6 sm:p-8 text-white text-right my-8">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 left-5 p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-white/5 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Title */}
        <div className="text-center mb-6">
          <h2 className="text-xl sm:text-2xl font-bold mb-1.5 text-white">
            خطط واشتراكات TOLZY AI
          </h2>
          <p className="text-xs sm:text-sm text-zinc-400 max-w-md mx-auto">
            اختر الخطة المناسبة لاحتياجاتك واستمتع بحصة توكنز أكبر وسرعة معالجة عالية.
          </p>

          <div className="mt-3 inline-flex items-center gap-2 bg-[#0e0e11] px-3.5 py-1.5 rounded-xl border border-white/5 text-xs text-zinc-400">
            <span>الخطة الحالية: <strong className="text-white">{PLAN_CONFIGS[userProfile.plan].name}</strong></span>
            <span>•</span>
            <span>المتبقي: <strong className="text-zinc-200">{remainingTokens.toLocaleString('ar-EG')} توكن</strong></span>
          </div>
        </div>

        {/* Plans Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {plans.map((planKey) => {
            const plan = PLAN_CONFIGS[planKey];
            const isCurrent = userProfile.plan === planKey;
            const isPro = planKey === 'pro';

            return (
              <div
                key={planKey}
                className={`rounded-2xl p-5 flex flex-col justify-between transition-all ${
                  isPro
                    ? 'bg-[#1a1a1f] border border-white/20 shadow-md'
                    : 'bg-[#0e0e11] border border-white/[0.08]'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs px-2 py-0.5 rounded bg-white/5 border border-white/10 font-medium text-zinc-300">
                      {plan.badge}
                    </span>
                    {isPro && <span className="text-[10px] text-zinc-400 font-medium">الأكثر طلباً</span>}
                  </div>

                  <h3 className="text-base font-bold text-white mb-1">{plan.name}</h3>
                  <div className="text-xl font-bold my-2">{plan.price}</div>

                  <div className="bg-white/5 rounded-xl p-2.5 mb-4 text-center">
                    <span className="text-[11px] text-zinc-400 block">الحصة الشهرية</span>
                    <strong className="text-xs text-zinc-100 font-semibold">{plan.tokenLimitLabel}</strong>
                  </div>

                  <ul className="space-y-2 mb-6 text-xs text-zinc-300">
                    {plan.features.map((feat, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <Check className="w-3.5 h-3.5 text-zinc-400 shrink-0 mt-0.5" />
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <button
                  onClick={() => handleSelectPlan(planKey)}
                  disabled={isCurrent}
                  className={`w-full py-2 px-3 rounded-xl font-medium text-xs transition-colors flex items-center justify-center gap-1.5 ${
                    isCurrent
                      ? 'bg-white/5 text-zinc-500 cursor-default'
                      : isPro
                      ? 'bg-white text-black hover:bg-zinc-200'
                      : 'bg-white/10 hover:bg-white/15 text-white'
                  }`}
                >
                  {isCurrent ? (
                    'خطتك الحالية'
                  ) : planKey === 'free' ? (
                    'التحويل للمجانية'
                  ) : (
                    <>
                      <span>الترقية عبر TOLZY</span>
                      <ExternalLink className="w-3 h-3" />
                    </>
                  )}
                </button>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="mt-6 text-center text-xs text-zinc-500 flex items-center justify-center gap-1.5">
          <span>تتم إدارة الاشتراكات بأمان عبر</span>
          <a
            href={TOLZY_PRICING_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="text-zinc-300 hover:underline font-medium inline-flex items-center gap-1"
          >
            <span>TOLZY.me/pricing</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>

      </div>
    </div>
  );
};
