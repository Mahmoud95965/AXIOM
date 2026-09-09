'use client';

import React, { useEffect, useRef, useState } from 'react';
import { 
  Sparkles, 
  Copy, 
  Check, 
  Volume2, 
  VolumeX,
  Loader2,
  ThumbsUp, 
  RotateCcw, 
  Globe, 
  User, 
  Download, 
  Maximize2, 
  X,
  ExternalLink
} from 'lucide-react';
import { ChatMessage } from '../lib/types';
import { useTheme } from '../context/ThemeContext';

interface ChatThreadProps {
  messages: ChatMessage[];
  isGenerating: boolean;
  onRegenerate: () => void;
  onSpeak?: (text: string) => void;
  speakingMsgId?: string | null;
  onOpenInstall?: () => void;
}

export const ChatThread: React.FC<ChatThreadProps> = ({
  messages,
  isGenerating,
  onRegenerate,
  onSpeak,
  speakingMsgId,
  onOpenInstall
}) => {
  const { theme } = useTheme();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [likedIds, setLikedIds] = useState<Record<string, boolean>>({});
  const [focusedImage, setFocusedImage] = useState<{ url: string; alt: string } | null>(null);

  // Azure AI Foundry TTS (MAI-Voice-2) States & Cache
  const [activeTtsId, setActiveTtsId] = useState<string | null>(null);
  const [isTtsLoading, setIsTtsLoading] = useState<boolean>(false);
  const audioCacheRef = useRef<Map<string, string>>(new Map());
  const currentAudioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isGenerating]);

  // Handle escape key to close focused image
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && focusedImage) {
        setFocusedImage(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [focusedImage]);

  // Clean up audio & object URLs on unmount
  useEffect(() => {
    return () => {
      if (currentAudioRef.current) {
        currentAudioRef.current.pause();
        currentAudioRef.current = null;
      }
      audioCacheRef.current.forEach((url) => {
        try {
          URL.revokeObjectURL(url);
        } catch (e) {}
      });
      audioCacheRef.current.clear();
    };
  }, []);

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleLike = (id: string) => {
    setLikedIds((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  // Play audio helper
  const playAudio = (messageId: string, url: string) => {
    if (currentAudioRef.current) {
      currentAudioRef.current.pause();
      currentAudioRef.current = null;
    }

    const audio = new Audio(url);
    currentAudioRef.current = audio;
    setActiveTtsId(messageId);

    audio.onended = () => {
      setActiveTtsId(null);
      currentAudioRef.current = null;
    };

    audio.onerror = () => {
      console.warn('Audio playback error');
      setActiveTtsId(null);
      currentAudioRef.current = null;
    };

    audio.play().catch((err) => {
      console.warn('Playback failed:', err);
      setActiveTtsId(null);
      currentAudioRef.current = null;
    });
  };

  // Azure AI Foundry TTS Trigger
  const handleToggleTts = async (messageId: string, text: string) => {
    // If this message is currently playing, stop it
    if (activeTtsId === messageId) {
      if (currentAudioRef.current) {
        currentAudioRef.current.pause();
        currentAudioRef.current = null;
      }
      setActiveTtsId(null);
      setIsTtsLoading(false);
      return;
    }

    // Stop any existing playing audio
    if (currentAudioRef.current) {
      currentAudioRef.current.pause();
      currentAudioRef.current = null;
      setActiveTtsId(null);
    }

    // Check in-memory Object URL cache
    if (audioCacheRef.current.has(messageId)) {
      const cachedUrl = audioCacheRef.current.get(messageId)!;
      playAudio(messageId, cachedUrl);
      return;
    }

    // Fetch from /api/tts endpoint
    try {
      setActiveTtsId(messageId);
      setIsTtsLoading(true);

      const response = await fetch('/api/tts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text }),
      });

      if (!response.ok) {
        throw new Error('فشل توليد الصوت من Azure TTS');
      }

      const blob = await response.blob();
      const audioUrl = URL.createObjectURL(blob);
      audioCacheRef.current.set(messageId, audioUrl);

      setIsTtsLoading(false);
      playAudio(messageId, audioUrl);

    } catch (error) {
      console.warn('Azure TTS error, falling back:', error);
      setIsTtsLoading(false);
      setActiveTtsId(null);

      // Graceful fallback to client speech synthesis if available
      if (onSpeak) {
        onSpeak(text);
      }
    }
  };

  // Markdown parser with BiDi preservation for mixed Arabic & English words
  const renderMarkdown = (text: string) => {
    if (!text) return '';
    let html = text;

    // Audio tags [audio:url](prompt) - Render sleek interactive in-chat audio card with direct player & download
    html = html.replace(/\[audio:([^\]]*)\]\(([^\)]*)\)/g, (match, encodedUrl, encodedPrompt) => {
      let audioUrl = encodedUrl;
      let promptText = encodedPrompt || 'ملف صوتي مخلق بنموذج AXIOM-Voice';
      try {
        audioUrl = decodeURIComponent(encodedUrl);
        promptText = decodeURIComponent(encodedPrompt || 'ملف صوتي مخلق بنموذج AXIOM-Voice');
      } catch (e) {}

      return `
        <div class="my-3.5 rounded-2xl overflow-hidden border ${
          theme === 'light' ? 'border-blue-200/90 bg-blue-50/50' : 'border-blue-500/20 bg-blue-950/20'
        } shadow-sm transition-all p-3.5 sm:p-4 text-right">
          <div class="flex items-center justify-between gap-2 mb-3 pb-2 border-b ${
            theme === 'light' ? 'border-blue-200/60' : 'border-white/5'
          }">
            <div class="flex items-center gap-1.5">
              <span class="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span>
              <span class="font-bold text-xs text-blue-500">AXIOM-Voice</span>
              <span class="text-[10px] px-1.5 py-0.2 rounded bg-blue-500/10 text-blue-400 font-semibold border border-blue-500/20">
                Azure AI
              </span>
            </div>
            <span class="text-[10px] text-zinc-400 font-mono">WAV Audio</span>
          </div>

          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <audio controls class="w-full sm:max-w-md h-10 rounded-xl" src="${audioUrl}">
              متصفحك لا يدعم مشغل الصوت المدمج.
            </audio>

            <a
              href="${audioUrl}"
              download="axiom_voice.wav"
              class="inline-flex items-center justify-center gap-1.5 py-2 px-3.5 rounded-xl font-bold text-xs transition-all shrink-0 ${
                theme === 'light'
                  ? 'bg-zinc-900 hover:bg-zinc-800 text-white shadow-xs'
                  : 'bg-white hover:bg-zinc-200 text-black shadow-xs'
              }"
              title="تحميل الملف الصوتي"
            >
              <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
              <span>تحميل الصوت (.wav)</span>
            </a>
          </div>
        </div>
      `;
    });

    // Image tags ![alt](url or data:image) - Render sleek card with overlay icon actions
    html = html.replace(/!\[([^\]]*)\]\(((?:https?:\/\/|data:image\/)[^\)]+)\)/g, (match, alt, url) => {
      const cleanAlt = alt || 'صورة مخلقة عبر FLUX.2 Pro';
      const encodedUrl = encodeURIComponent(url);
      const encodedAlt = encodeURIComponent(cleanAlt);

      return `
        <div class="my-3.5 rounded-2xl overflow-hidden border ${
          theme === 'light' ? 'border-zinc-200/90 bg-zinc-50' : 'border-white/10 bg-[#0e0e12]'
        } shadow-sm group transition-all">
          <div class="relative overflow-hidden cursor-pointer" onclick="window.dispatchEvent(new CustomEvent('axiom_focus_image', { detail: { url: '${encodedUrl}', alt: '${encodedAlt}' } }))">
            <img src="${url}" alt="${cleanAlt}" class="w-full max-h-[480px] object-contain rounded-t-2xl transition-transform duration-300 group-hover:scale-[1.01]" loading="lazy" />
            
            <div class="absolute top-2.5 left-2.5 flex items-center gap-1.5 opacity-90 group-hover:opacity-100 transition-opacity bg-black/60 backdrop-blur-md p-1 rounded-xl border border-white/10" onclick="event.stopPropagation()">
              <a href="${url}" download="flux_image.png" class="p-1.5 rounded-lg text-white hover:bg-white/20 transition-colors" title="تحميل الصورة">
                <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
              </a>
              <button onclick="window.dispatchEvent(new CustomEvent('axiom_focus_image', { detail: { url: '${encodedUrl}', alt: '${encodedAlt}' } }))" class="p-1.5 rounded-lg text-white hover:bg-white/20 transition-colors" title="تكبير ومعاينة الصورة">
                <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 3h6v6"/><path d="M9 21H3v-6"/><path d="M21 3l-7 7"/><path d="M3 21l7-7"/></svg>
              </button>
            </div>
          </div>
          
          <div class="p-2.5 px-3 flex items-center justify-between text-xs border-t ${
            theme === 'light' ? 'border-zinc-200 text-zinc-600' : 'border-white/5 text-zinc-400'
          }">
            <span class="font-medium truncate bidi-arabic">${cleanAlt}</span>
            <span class="text-[10px] px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-500 font-semibold">FLUX.2 Pro</span>
          </div>
        </div>
      `;
    });

    // Code blocks (Strictly LTR)
    html = html.replace(/```([a-zA-Z0-9_-]*)\n([\s\S]*?)```/g, (match: string, lang: string, code: string) => {
      const language = lang || 'code';
      const isLight = theme === 'light';
      return `
        <div class="my-3.5 rounded-xl overflow-hidden border ${
          isLight ? 'border-zinc-200 bg-zinc-900 text-white' : 'border-white/10 bg-[#0c0c0f] text-zinc-200'
        } text-left shadow-sm" dir="ltr">
          <div class="flex items-center justify-between px-3.5 py-1.5 ${
            isLight ? 'bg-zinc-800 border-b border-zinc-700 text-zinc-400' : 'bg-[#15151a] border-b border-white/5 text-zinc-400'
          } text-[11px] font-mono">
            <span>${language}</span>
          </div>
          <pre class="p-3.5 overflow-x-auto text-[13px] font-mono leading-relaxed text-zinc-200"><code>${code.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</code></pre>
        </div>
      `;
    });

    // Inline code
    html = html.replace(/`([^`]+)`/g, `<code class="${theme === 'light' ? 'bg-zinc-200 text-zinc-800' : 'bg-white/10 text-zinc-200'} px-1.5 py-0.5 rounded text-xs font-mono" dir="ltr">$1</code>`);

    // Headers
    html = html.replace(/^### (.*$)/gim, `<h3 class="text-base font-semibold ${theme === 'light' ? 'text-zinc-900' : 'text-white'} mt-4 mb-2 bidi-arabic">$1</h3>`);
    html = html.replace(/^## (.*$)/gim, `<h2 class="text-lg font-bold ${theme === 'light' ? 'text-zinc-900' : 'text-white'} mt-5 mb-2 bidi-arabic">$1</h2>`);
    html = html.replace(/^# (.*$)/gim, `<h1 class="text-xl font-bold ${theme === 'light' ? 'text-zinc-900' : 'text-white'} mt-6 mb-2.5 bidi-arabic">$1</h1>`);

    // Blockquotes
    html = html.replace(/^\> (.*$)/gim, `<blockquote class="border-r-2 ${theme === 'light' ? 'border-blue-500 bg-blue-50/50 text-zinc-700' : 'border-blue-500 bg-blue-950/10 text-zinc-300'} px-3 py-2 my-2 rounded-l-lg bidi-arabic">$1</blockquote>`);

    // Bold
    html = html.replace(/\*\*([^*]+)\*\*/g, `<strong class="${theme === 'light' ? 'text-zinc-900' : 'text-white'} font-semibold bidi-arabic">$1</strong>`);

    // Lists
    html = html.replace(/^\* (.*$)/gim, `<li class="mr-4 my-1 ${theme === 'light' ? 'text-zinc-700' : 'text-zinc-300'} list-disc text-sm leading-relaxed bidi-arabic">$1</li>`);
    html = html.replace(/^\- (.*$)/gim, `<li class="mr-4 my-1 ${theme === 'light' ? 'text-zinc-700' : 'text-zinc-300'} list-disc text-sm leading-relaxed bidi-arabic">$1</li>`);
    html = html.replace(/^\d+\. (.*$)/gim, `<li class="mr-4 my-1 ${theme === 'light' ? 'text-zinc-700' : 'text-zinc-300'} list-decimal text-sm leading-relaxed bidi-arabic">$1</li>`);

    return html;
  };

  // Event listener for opening focused image from markdown
  useEffect(() => {
    const handleFocusImageEvent = (e: any) => {
      if (e.detail?.url) {
        try {
          const decodedUrl = decodeURIComponent(e.detail.url);
          const decodedAlt = decodeURIComponent(e.detail.alt || 'صورة');
          setFocusedImage({ url: decodedUrl, alt: decodedAlt });
        } catch (err) {
          setFocusedImage({ url: e.detail.url, alt: e.detail.alt || 'صورة' });
        }
      }
    };

    window.addEventListener('axiom_focus_image', handleFocusImageEvent);
    return () => window.removeEventListener('axiom_focus_image', handleFocusImageEvent);
  }, []);

  // 1. Zero-State Welcome
  if (messages.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-4 sm:p-6 text-center my-auto animate-fade-in max-w-xl w-full mx-auto">
        <div className={`w-12 h-12 sm:w-14 sm:h-14 mb-3 sm:mb-4 rounded-2xl border flex items-center justify-center shadow-sm ${
          theme === 'light'
            ? 'bg-white border-zinc-200 text-zinc-900'
            : 'bg-[#141418] border-white/10 text-white'
        }`}>
          <Sparkles className="w-5 h-5 sm:w-6 sm:h-6 text-blue-500" />
        </div>

        <h1 className={`text-xl sm:text-3xl font-extrabold mb-1.5 sm:mb-2 tracking-tight ${theme === 'light' ? 'text-zinc-900' : 'text-white'}`}>
          AXIOM V2
        </h1>
        
        <p className={`text-xs sm:text-sm max-w-md leading-relaxed px-2 bidi-arabic ${theme === 'light' ? 'text-zinc-500' : 'text-zinc-400'}`}>
          المساعد الذكي لمنظومة TOLZY. اسأل عن أي كود، استفسار علمي، أو اطلب تخليق وصناعة الصور بنموذج FLUX.2 Pro.
        </p>

        {onOpenInstall && (
          <button
            onClick={onOpenInstall}
            className={`mt-4 inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border text-xs font-semibold transition-all ${
              theme === 'light'
                ? 'bg-blue-50 hover:bg-blue-100 border-blue-200 text-blue-600 shadow-xs'
                : 'bg-blue-950/40 hover:bg-blue-900/60 border-blue-500/30 text-blue-400 shadow-[0_0_15px_rgba(59,130,246,0.15)]'
            }`}
          >
            <Download className="w-3.5 h-3.5" />
            <span>تثبيت التطبيق على هاتفك أو جهازك (PWA)</span>
          </button>
        )}
      </div>
    );
  }

  // 2. Chat Stream & Messages (User on Right, Model on Left)
  return (
    <div className="flex-1 overflow-y-auto px-2.5 py-4 sm:px-6 sm:py-6 space-y-4 sm:space-y-6 max-w-4xl w-full mx-auto relative">
      
      {/* Lightbox / Focused Image Viewer */}
      {focusedImage && (
        <div 
          className="fixed inset-0 z-40 bg-black/70 backdrop-blur-md flex flex-col items-center justify-center p-3 sm:p-6 animate-fade-in"
          onClick={() => setFocusedImage(null)}
        >
          {/* Floating Top Control Bar */}
          <div 
            className="absolute top-4 sm:top-6 inset-x-4 max-w-2xl mx-auto flex items-center justify-between bg-[#15151a]/90 backdrop-blur-lg border border-white/10 rounded-2xl p-2 px-4 shadow-xl z-50"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-2 truncate">
              <Sparkles className="w-4 h-4 text-blue-400 shrink-0" />
              <span className="text-xs text-zinc-200 font-medium truncate bidi-arabic">{focusedImage.alt}</span>
            </div>
            <div className="flex items-center gap-2">
              <a 
                href={focusedImage.url} 
                download="axiom_flux_image.png" 
                className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors flex items-center gap-1 text-xs"
                title="تحميل الصورة"
              >
                <Download className="w-4 h-4" />
                <span className="hidden sm:inline">تحميل</span>
              </a>
              <button 
                onClick={() => setFocusedImage(null)}
                className="p-1.5 rounded-xl bg-white/10 hover:bg-red-500/30 text-zinc-300 hover:text-white transition-colors"
                title="إغلاق المعاينة"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Focused Image Card */}
          <div 
            className="max-w-3xl max-h-[75vh] w-full flex items-center justify-center p-2 rounded-2xl animate-scale-up z-40 mt-10"
            onClick={(e) => e.stopPropagation()}
          >
            <img 
              src={focusedImage.url} 
              alt={focusedImage.alt} 
              className="max-h-[72vh] max-w-full rounded-2xl object-contain shadow-2xl border border-white/10"
            />
          </div>
        </div>
      )}

      {messages.map((msg, index) => {
        const isUser = msg.sender === 'user';
        const isLastAi = !isUser && index === messages.length - 1;
        const isPlayingThis = activeTtsId === msg.id && !isTtsLoading;
        const isLoadingThis = activeTtsId === msg.id && isTtsLoading;

        // =====================================================================
        // User Question (Right Side / ناحية اليمين)
        // =====================================================================
        if (isUser) {
          return (
            <div key={msg.id} className="flex justify-start w-full animate-fade-in">
              <div className="flex items-start gap-2 sm:gap-2.5 max-w-[92%] sm:max-w-[80%]">
                
                {/* User Avatar */}
                <div className={`w-6 h-6 sm:w-7 sm:h-7 rounded-xl border flex items-center justify-center shrink-0 mt-0.5 shadow-2xs ${
                  theme === 'light'
                    ? 'bg-zinc-200 border-zinc-300 text-zinc-700'
                    : 'bg-white/10 border-white/15 text-zinc-300'
                }`}>
                  <User className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                </div>

                {/* User Bubble */}
                <div className={`rounded-[20px] rounded-tr-xs px-3.5 py-2.5 sm:px-4 sm:py-3 text-xs sm:text-sm shadow-2xs leading-relaxed text-right break-words border bidi-arabic ${
                  theme === 'light'
                    ? 'bg-zinc-100 border-zinc-200/90 text-zinc-900'
                    : 'bg-[#1c1c22] border-white/10 text-zinc-100'
                }`}>
                  {msg.image && (
                    <div 
                      className="cursor-pointer relative group rounded-xl overflow-hidden mb-2"
                      onClick={() => setFocusedImage({ url: msg.image!, alt: 'صورة المستخدم' })}
                    >
                      <img src={msg.image} alt="مرفق" className="max-w-[240px] sm:max-w-[280px] max-h-48 sm:max-h-56 rounded-xl object-cover" />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <Maximize2 className="w-4 h-4 text-white" />
                      </div>
                    </div>
                  )}
                  {msg.isWebSearch && (
                    <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-blue-500/15 text-blue-600 dark:text-blue-300 text-[10px] font-medium mb-1.5">
                      <Globe className="w-2.5 h-2.5" />
                      <span>بحث الويب</span>
                    </div>
                  )}
                  <div className="whitespace-pre-wrap">{msg.text}</div>
                </div>

              </div>
            </div>
          );
        }

        // =====================================================================
        // AI Model Response (Left Side / ناحية اليسار)
        // =====================================================================
        const isCurrentlyStreamingThis = isLastAi && isGenerating;

        return (
          <div key={msg.id} className="flex justify-end w-full animate-fade-in">
            <div className="flex items-start gap-2 sm:gap-2.5 max-w-[96%] sm:max-w-[88%]">
              
              {/* Model Response Card */}
              <div className={`flex-1 rounded-[22px] rounded-tl-xs p-3.5 sm:p-5 border text-right shadow-2xs transition-all ${
                theme === 'light'
                  ? 'bg-white border-zinc-200/90 text-zinc-900 shadow-zinc-100'
                  : 'bg-[#121216] border-white/[0.08] text-zinc-100'
              }`}>
                
                {/* Header Tag */}
                <div className="flex items-center justify-between gap-2 mb-2 pb-2 border-b border-zinc-100 dark:border-white/5">
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-xs">AXIOM V2</span>
                    <span className="text-[10px] px-1.5 py-0.2 rounded bg-blue-500/10 text-blue-600 dark:text-blue-400 font-semibold border border-blue-500/20">
                      TOLZY AI
                    </span>
                  </div>
                  {msg.timestamp && (
                    <span className="text-[10px] text-zinc-400">
                      {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  )}
                </div>

                {/* Text Output / Markdown with BiDi preservation */}
                <div className={`text-xs sm:text-sm leading-relaxed space-y-2.5 break-words bidi-arabic ${
                  theme === 'light' ? 'text-zinc-800' : 'text-zinc-200'
                }`}>
                  {msg.text ? (
                    <>
                      <div dangerouslySetInnerHTML={{ __html: renderMarkdown(msg.text) }} />
                      {isCurrentlyStreamingThis && (
                        <span className="typing-dot" title="جاري التوليد..." />
                      )}
                    </>
                  ) : isCurrentlyStreamingThis ? (
                    <div className="py-2 flex items-center gap-2 text-xs text-zinc-500">
                      <span className="typing-dot" />
                      <span>جاري التفكير والتوليد...</span>
                    </div>
                  ) : null}
                </div>

                {/* Action Toolbar */}
                {!isCurrentlyStreamingThis && msg.text && (
                  <div className={`flex items-center gap-1 mt-3 pt-2 border-t ${
                    theme === 'light' ? 'border-zinc-100 text-zinc-400' : 'border-white/5 text-zinc-500'
                  }`}>
                    <button
                      onClick={() => handleCopy(msg.id, msg.text)}
                      className={`p-1.5 rounded-lg transition-colors ${
                        theme === 'light' ? 'hover:text-zinc-900 hover:bg-zinc-100' : 'hover:text-white hover:bg-white/5'
                      }`}
                      title="نسخ الإجابة"
                    >
                      {copiedId === msg.id ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>

                    {/* Azure AI Speech TTS Button (MAI-Voice-2) */}
                    <button
                      onClick={() => handleToggleTts(msg.id, msg.text)}
                      className={`p-1.5 rounded-lg transition-all ${
                        isPlayingThis
                          ? 'text-blue-500 bg-blue-500/10 ring-1 ring-blue-500/30'
                          : isLoadingThis
                          ? 'text-blue-400 bg-blue-500/5'
                          : theme === 'light' ? 'hover:text-zinc-900 hover:bg-zinc-100' : 'hover:text-white hover:bg-white/5'
                      }`}
                      title={isPlayingThis ? 'إيقاف الاستماع الصوتي' : isLoadingThis ? 'جاري توليد الصوت عبر Azure AI Speech...' : 'استماع صوتي فائق الدقة (Azure AI)'}
                      disabled={isLoadingThis}
                    >
                      {isLoadingThis ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin text-blue-500" />
                      ) : isPlayingThis ? (
                        <VolumeX className="w-3.5 h-3.5 text-blue-500 animate-pulse" />
                      ) : (
                        <Volume2 className="w-3.5 h-3.5" />
                      )}
                    </button>

                    <button
                      onClick={() => handleLike(msg.id)}
                      className={`p-1.5 rounded-lg transition-colors ${
                        likedIds[msg.id] ? 'text-blue-500' : theme === 'light' ? 'hover:text-zinc-900 hover:bg-zinc-100' : 'hover:text-white hover:bg-white/5'
                      }`}
                      title="إعجاب"
                    >
                      <ThumbsUp className="w-3.5 h-3.5" />
                    </button>

                    <button
                      onClick={onRegenerate}
                      className={`p-1.5 rounded-lg transition-colors ${
                        theme === 'light' ? 'hover:text-zinc-900 hover:bg-zinc-100' : 'hover:text-white hover:bg-white/5'
                      }`}
                      title="إعادة التوليد"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}

              </div>

              {/* Model Avatar */}
              <div className={`w-6 h-6 sm:w-7 sm:h-7 rounded-xl border flex items-center justify-center shrink-0 mt-0.5 shadow-2xs ${
                theme === 'light'
                  ? 'bg-blue-50 border-blue-200 text-blue-600'
                  : 'bg-blue-950/40 border-blue-500/20 text-blue-400'
              }`}>
                <Sparkles className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
              </div>

            </div>
          </div>
        );
      })}

      <div ref={scrollRef} />
    </div>
  );
};
