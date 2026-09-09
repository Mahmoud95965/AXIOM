'use client';

import React, { useState, useRef, useEffect } from 'react';
import { ArrowUp, Image as ImageIcon, Globe, X, Link2, Wand2, Mic } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

interface PromptCapsuleProps {
  onSendMessage: (
    text: string, 
    image: string | null, 
    isWebSearch?: boolean, 
    isImageGen?: boolean,
    isVoiceGen?: boolean
  ) => void;
  isGenerating: boolean;
  onOpenIntegrations?: () => void;
  userPlan?: string;
  onRequireUpgrade?: (feature: string) => void;
}

export const PromptCapsule: React.FC<PromptCapsuleProps> = ({
  onSendMessage,
  isGenerating,
  onOpenIntegrations,
  userPlan = 'free',
  onRequireUpgrade
}) => {
  const { theme } = useTheme();
  const [text, setText] = useState('');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isWebSearch, setIsWebSearch] = useState(false);
  const [isImageGen, setIsImageGen] = useState(false);
  const [isVoiceGen, setIsVoiceGen] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isProOrMax = userPlan === 'pro' || userPlan === 'max';

  // Auto-grow textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 180)}px`;
    }
  }, [text]);

  const handleToggleWebSearch = () => {
    if (!isProOrMax) {
      if (onRequireUpgrade) {
        onRequireUpgrade('البحث المباشر عبر الإنترنت (Web Search)');
      }
      return;
    }
    setIsWebSearch(!isWebSearch);
  };

  const handleToggleImageGen = () => {
    if (!isProOrMax) {
      if (onRequireUpgrade) {
        onRequireUpgrade('تخليق وصناعة الصور (FLUX.2 Pro)');
      }
      return;
    }
    setIsImageGen(!isImageGen);
    if (!isImageGen) {
      setIsVoiceGen(false);
    }
  };

  const handleToggleVoiceGen = () => {
    setIsVoiceGen(!isVoiceGen);
    if (!isVoiceGen) {
      setIsImageGen(false);
    }
  };

  const handleSend = () => {
    if ((text.trim() || selectedImage) && !isGenerating) {
      onSendMessage(text.trim(), selectedImage, isWebSearch, isImageGen, isVoiceGen);
      setText('');
      setSelectedImage(null);
      setIsImageGen(false);
      setIsVoiceGen(false);
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const canSubmit = (text.trim().length > 0 || selectedImage !== null) && !isGenerating;

  return (
    <div className={`w-full px-2.5 sm:px-4 pb-3 sm:pb-5 pt-1.5 transition-colors relative z-50 ${
      theme === 'light'
        ? 'bg-gradient-to-t from-zinc-100 via-zinc-100/90 to-transparent'
        : 'bg-gradient-to-t from-[#0a0a0c] via-[#0a0a0c]/90 to-transparent'
    }`}>
      <div className="max-w-3xl mx-auto">
        
        {/* Main Input Capsule Box */}
        <div className={`rounded-2xl p-2 sm:p-3 shadow-sm transition-all text-right border ${
          theme === 'light'
            ? 'bg-white border-zinc-200 focus-within:border-zinc-400 shadow-zinc-200/50'
            : 'bg-[#18181b] border-white/10 focus-within:border-white/20'
        }`}>
          
          {/* Active Image Mode Banner */}
          {isImageGen && (
            <div className={`mb-2 px-2.5 py-1 rounded-xl text-xs flex items-center justify-between font-medium ${
              theme === 'light'
                ? 'bg-purple-50 text-purple-700 border border-purple-200'
                : 'bg-purple-950/30 text-purple-300 border border-purple-500/20'
            }`}>
              <div className="flex items-center gap-1.5 truncate">
                <Wand2 className="w-3.5 h-3.5 text-purple-500 shrink-0" />
                <span className="truncate">وضع تخليق الصور (FLUX.2 Pro • Pro/Max)</span>
              </div>
              <button
                type="button"
                onClick={() => setIsImageGen(false)}
                className="hover:opacity-75 p-0.5"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* Active Voice Mode Banner */}
          {isVoiceGen && (
            <div className={`mb-2 px-2.5 py-1 rounded-xl text-xs flex items-center justify-between font-medium ${
              theme === 'light'
                ? 'bg-blue-50 text-blue-700 border border-blue-200'
                : 'bg-blue-950/30 text-blue-300 border border-blue-500/20'
            }`}>
              <div className="flex items-center gap-1.5 truncate">
                <Mic className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                <span className="truncate">وضع تحويل النص إلى صوت (AXIOM-Voice)</span>
              </div>
              <button
                type="button"
                onClick={() => setIsVoiceGen(false)}
                className="hover:opacity-75 p-0.5"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* Image Preview if selected */}
          {selectedImage && (
            <div className={`relative inline-block mb-2 p-1 rounded-xl border ${
              theme === 'light' ? 'bg-zinc-100 border-zinc-300' : 'bg-white/5 border-white/10'
            }`}>
              <img src={selectedImage} alt="Preview" className="h-14 w-14 sm:h-16 sm:w-16 object-cover rounded-lg" />
              <button
                onClick={() => setSelectedImage(null)}
                className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-zinc-800 text-zinc-300 hover:text-white flex items-center justify-center border border-white/20"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* Textarea for Prompt */}
          <textarea
            ref={textareaRef}
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={
              isImageGen 
                ? "صف المشهد أو الصورة المراد تخليقها بنموذج FLUX.2 Pro..." 
                : isVoiceGen
                ? "اكتب أو الصق النص الذي تريد تحويله إلى ملف صوتي بنموذج AXIOM-Voice..."
                : "اسأل AXIOM V2 عن أي شيء أو اكتب فكرتك..."
            }
            rows={1}
            className={`w-full bg-transparent border-none outline-none resize-none text-xs sm:text-sm max-h-44 leading-relaxed font-normal text-right bidi-arabic ${
              theme === 'light'
                ? 'text-zinc-900 placeholder-zinc-400'
                : 'text-zinc-100 placeholder-zinc-500'
            }`}
          />

          {/* Bottom Action Toolbar inside Capsule */}
          <div className="flex items-center justify-between mt-2 pt-1 border-t border-zinc-100 dark:border-white/[0.04]">
            
            {/* Left: Interactive Tools & Modes */}
            <div className="flex items-center gap-1 sm:gap-1.5 overflow-x-auto no-scrollbar py-0.5">
              
              {/* FLUX Image Generation Mode Toggle */}
              <button
                type="button"
                onClick={handleToggleImageGen}
                className={`flex items-center gap-1 sm:gap-1.5 px-2 py-1 sm:px-2.5 sm:py-1 rounded-xl text-xs font-medium transition-colors shrink-0 ${
                  isImageGen
                    ? 'bg-purple-500/15 text-purple-600 dark:text-purple-300 border border-purple-500/30 shadow-xs font-semibold'
                    : theme === 'light'
                    ? 'text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100'
                    : 'text-zinc-400 hover:text-zinc-200 hover:bg-white/5'
                }`}
                title={isProOrMax ? "تخليق وصناعة الصور (FLUX.2 Pro)" : "صناعة الصور (حصري لمشتركي Pro / Max)"}
              >
                <Wand2 className="w-3.5 h-3.5 text-purple-500" />
                <span className="text-[11px] hidden xs:inline">صناعة صورة</span>
                {!isProOrMax && <span className="text-[9px] px-1 py-0.2 rounded bg-amber-500/20 text-amber-600 dark:text-amber-300 font-bold">PRO</span>}
              </button>

              {/* AXIOM-Voice Generation Mode Toggle (In-Chat Mode) */}
              <button
                type="button"
                onClick={handleToggleVoiceGen}
                className={`flex items-center gap-1 sm:gap-1.5 px-2 py-1 sm:px-2.5 sm:py-1 rounded-xl text-xs font-medium transition-colors shrink-0 ${
                  isVoiceGen
                    ? 'bg-blue-500/15 text-blue-600 dark:text-blue-300 border border-blue-500/30 shadow-xs font-semibold'
                    : theme === 'light'
                    ? 'text-blue-600 hover:text-blue-700 hover:bg-blue-50'
                    : 'text-blue-400 hover:text-blue-300 hover:bg-blue-950/30'
                }`}
                title="تحويل النص إلى صوت داخل الشات (AXIOM-Voice)"
              >
                <Mic className="w-3.5 h-3.5 text-blue-500" />
                <span className="text-[11px] hidden xs:inline font-semibold">توليد صوت</span>
              </button>

              {/* Web Search Toggle (Pro / Max Exclusive) */}
              <button
                type="button"
                onClick={handleToggleWebSearch}
                className={`flex items-center gap-1 sm:gap-1.5 px-2 py-1 sm:px-2.5 sm:py-1 rounded-xl text-xs font-medium transition-colors shrink-0 ${
                  isWebSearch
                    ? 'bg-blue-500/15 text-blue-600 dark:text-blue-300 border border-blue-500/30'
                    : theme === 'light'
                    ? 'text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100'
                    : 'text-zinc-400 hover:text-zinc-200 hover:bg-white/5'
                }`}
                title={isProOrMax ? "البحث المباشر عبر الإنترنت" : "البحث المباشر (حصري لمشتركي Pro / Max)"}
              >
                <Globe className="w-3.5 h-3.5" />
                <span className="text-[11px] hidden xs:inline">بحث</span>
                {!isProOrMax && <span className="text-[9px] px-1 py-0.2 rounded bg-amber-500/20 text-amber-600 dark:text-amber-300 font-bold">PRO</span>}
              </button>

              {/* Image Upload Button */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className={`p-1.5 rounded-xl transition-colors shrink-0 ${
                  theme === 'light'
                    ? 'text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100'
                    : 'text-zinc-400 hover:text-zinc-200 hover:bg-white/5'
                }`}
                title="إرفاق صورة"
              >
                <ImageIcon className="w-4 h-4" />
              </button>

              {/* Integration Link Button */}
              <button
                type="button"
                onClick={onOpenIntegrations}
                className={`p-1.5 rounded-xl transition-colors shrink-0 ${
                  theme === 'light'
                    ? 'text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100'
                    : 'text-zinc-400 hover:text-zinc-200 hover:bg-white/5'
                }`}
                title="دليل الموصلات والتكاملات القادمة"
              >
                <Link2 className="w-4 h-4" />
              </button>

            </div>

            {/* Right: Clean Send Button */}
            <button
              onClick={handleSend}
              disabled={!canSubmit}
              className={`w-7 h-7 sm:w-8 sm:h-8 rounded-xl flex items-center justify-center transition-all shrink-0 ${
                canSubmit
                  ? theme === 'light'
                    ? 'bg-zinc-900 text-white hover:bg-zinc-800'
                    : 'bg-white text-black hover:bg-zinc-200 shadow-sm'
                  : theme === 'light'
                  ? 'bg-zinc-100 text-zinc-400 cursor-not-allowed'
                  : 'bg-white/5 text-zinc-600 cursor-not-allowed'
              }`}
              title="إرسال"
            >
              <ArrowUp className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </button>

          </div>

        </div>

      </div>
    </div>
  );
};
