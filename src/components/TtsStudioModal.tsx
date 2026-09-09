'use client';

import React, { useState, useRef, useEffect } from 'react';
import { 
  Mic, 
  Volume2, 
  Download, 
  Play, 
  Pause, 
  RotateCcw, 
  X, 
  Sparkles, 
  Loader2, 
  Music,
  CheckCircle2,
  Lock,
  Clock
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { normalizePlan, TOLZY_PRICING_URL } from '../lib/types';

interface TtsStudioModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRequireUpgrade: (featureName: string) => void;
}

const VOICES = [
  { id: 'en-US-Ethan:MAI-Voice-2', name: 'Ethan (Azure MAI-Voice-2)', lang: 'English (US)' },
  { id: 'ar-SA-HamedNeural', name: 'حامد (ذكاء اصطناعي عصبي)', lang: 'العربية (السعودية)' },
  { id: 'ar-EG-SalmaNeural', name: 'سلمى (ذكاء اصطناعي عصبي)', lang: 'العربية (مصر)' },
  { id: 'ar-SA-ZariyahNeural', name: 'زارية (نبرة هادئة)', lang: 'العربية' },
  { id: 'en-US-JennyNeural', name: 'Jenny (Neural HD)', lang: 'English' },
];

const FREE_LIFETIME_SECONDS = 60; // 1 minute lifetime for Free plan

export const TtsStudioModal: React.FC<TtsStudioModalProps> = ({ isOpen, onClose, onRequireUpgrade }) => {
  const { theme } = useTheme();
  const { user, userProfile } = useAuth();

  const [text, setText] = useState('');
  const [selectedVoice, setSelectedVoice] = useState(VOICES[0].id);
  const [isGenerating, setIsGenerating] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  // Free lifetime seconds used tracker
  const [freeSecondsUsed, setFreeSecondsUsed] = useState<number>(0);

  const audioRef = useRef<HTMLAudioElement | null>(null);

  const effectivePlan = normalizePlan(userProfile.plan || 'free');
  const isProOrMax = effectivePlan === 'pro' || effectivePlan === 'max';

  // Load free seconds used from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem('axiom_tts_free_seconds_used');
      if (stored) {
        setFreeSecondsUsed(parseFloat(stored) || 0);
      }
    } catch (e) {}
  }, [isOpen]);

  useEffect(() => {
    return () => {
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
      }
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, [audioUrl]);

  if (!isOpen) return null;

  const remainingFreeSeconds = Math.max(0, FREE_LIFETIME_SECONDS - freeSecondsUsed);

  const handleGenerateSpeech = async () => {
    if (!text.trim() || isGenerating) return;

    // Check Plan & Lifetime Limit for Free Users
    if (!isProOrMax && remainingFreeSeconds <= 0) {
      onRequireUpgrade('تحويل النص إلى صوت (TTS Studio)');
      return;
    }

    try {
      setIsGenerating(true);
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
        setAudioUrl(null);
      }

      const response = await fetch('/api/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, voice: selectedVoice }),
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || 'فشل توليد الصوت');
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      setAudioUrl(url);
      setIsGenerating(false);

      // Setup audio playback
      const audio = new Audio(url);
      audioRef.current = audio;
      
      audio.onloadedmetadata = () => {
        const audioDuration = audio.duration || 0;
        setDuration(audioDuration);

        // Deduct from free seconds if on Free plan
        if (!isProOrMax) {
          const updatedUsed = Math.min(FREE_LIFETIME_SECONDS, freeSecondsUsed + audioDuration);
          setFreeSecondsUsed(updatedUsed);
          try {
            localStorage.setItem('axiom_tts_free_seconds_used', updatedUsed.toString());
          } catch (e) {}
        }
      };

      audio.ontimeupdate = () => setCurrentTime(audio.currentTime);
      audio.onended = () => setIsPlaying(false);
      audio.play().catch(() => {});
      setIsPlaying(true);

    } catch (err: any) {
      alert(err.message || 'حدث خطأ أثناء توليد الصوت');
      setIsGenerating(false);
    }
  };

  const togglePlayPause = () => {
    if (!audioRef.current && audioUrl) {
      const audio = new Audio(audioUrl);
      audioRef.current = audio;
      audio.onloadedmetadata = () => setDuration(audio.duration);
      audio.ontimeupdate = () => setCurrentTime(audio.currentTime);
      audio.onended = () => setIsPlaying(false);
    }

    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
      } else {
        audioRef.current.play().catch(() => {});
        setIsPlaying(true);
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className={`relative w-full max-w-xl rounded-3xl shadow-2xl overflow-hidden p-6 sm:p-8 text-right border transition-all ${
        theme === 'light'
          ? 'bg-white border-zinc-200 text-zinc-900 shadow-zinc-200'
          : 'bg-[#141418] border-white/10 text-white shadow-black/80'
      }`}>
        
        {/* Top Gradient Sheen */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className={`absolute top-5 left-5 w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
            theme === 'light' ? 'bg-zinc-100 hover:bg-zinc-200 text-zinc-600' : 'bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white'
          }`}
          title="إغلاق"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-500 shrink-0 shadow-inner">
            <Mic className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold text-blue-500 uppercase tracking-wide">Azure AI Foundry</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-500/15 text-blue-400 font-semibold border border-blue-500/20">
                MAI-Voice-2
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight">استوديو تحويل النص إلى صوت (TTS)</h2>
          </div>
        </div>

        {/* Plan Quota Banner */}
        <div className={`p-3 rounded-2xl border mb-4 flex items-center justify-between text-xs ${
          isProOrMax
            ? theme === 'light' ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-emerald-950/30 border-emerald-500/30 text-emerald-400'
            : theme === 'light' ? 'bg-amber-50 border-amber-200 text-amber-800' : 'bg-amber-950/30 border-amber-500/30 text-amber-400'
        }`}>
          <div className="flex items-center gap-2">
            {isProOrMax ? <Sparkles className="w-4 h-4 shrink-0" /> : <Clock className="w-4 h-4 shrink-0" />}
            <div>
              <p className="font-bold">
                {isProOrMax ? `باقتك الحالية (${effectivePlan.toUpperCase()}) - استخدام صوتي غير محدود` : 'الخطة المجانية - تجربة 1 دقيقة مدى الحياة'}
              </p>
              {!isProOrMax && (
                <p className="text-[11px] opacity-85">
                  المتبقي لك: {Math.round(remainingFreeSeconds)} ثانية من أصل 60 ثانية
                </p>
              )}
            </div>
          </div>

          {!isProOrMax && (
            <button
              onClick={() => onRequireUpgrade('تحويل النص إلى صوت غير محدود')}
              className="py-1 px-2.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-black font-bold text-[11px] transition-colors shrink-0"
            >
              ترقية الباقة
            </button>
          )}
        </div>

        {/* Text Input */}
        <div className="space-y-1.5 mb-3.5">
          <label className="text-xs font-semibold text-zinc-400">اكتب أو الصق النص المراد تحويله إلى صوت:</label>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="اكتب النص هنا لتحويله مباشرة إلى كلام مسموع فائق الجودة..."
            rows={3}
            className={`w-full p-3.5 rounded-2xl border text-sm outline-none transition-all resize-none ${
              theme === 'light'
                ? 'bg-zinc-50 border-zinc-200 focus:border-blue-500 text-zinc-900'
                : 'bg-[#0c0c0f] border-white/10 focus:border-blue-500/50 text-white'
            }`}
          />
        </div>

        {/* Voice Selector */}
        <div className="space-y-1.5 mb-4">
          <label className="text-xs font-semibold text-zinc-400">اختر نبرة الصوت واللغة:</label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {VOICES.map((v) => (
              <button
                key={v.id}
                onClick={() => setSelectedVoice(v.id)}
                className={`p-2.5 rounded-xl border text-right transition-all flex items-center justify-between text-xs ${
                  selectedVoice === v.id
                    ? 'border-blue-500 bg-blue-500/15 text-blue-400 font-semibold shadow-xs'
                    : theme === 'light' ? 'border-zinc-200 hover:bg-zinc-100 text-zinc-700' : 'border-white/5 hover:bg-white/5 text-zinc-400'
                }`}
              >
                <div>
                  <p className="font-medium">{v.name}</p>
                  <p className="text-[10px] opacity-70">{v.lang}</p>
                </div>
                {selectedVoice === v.id && <CheckCircle2 className="w-4 h-4 text-blue-500 shrink-0" />}
              </button>
            ))}
          </div>
        </div>

        {/* Audio Player Card if Generated */}
        {audioUrl && (
          <div className={`p-3.5 rounded-2xl border mb-4 flex items-center justify-between gap-3 animate-scale-up ${
            theme === 'light' ? 'bg-blue-50/70 border-blue-200' : 'bg-blue-950/25 border-blue-500/25'
          }`}>
            <div className="flex items-center gap-3 overflow-hidden">
              <button
                onClick={togglePlayPause}
                className="w-10 h-10 rounded-xl bg-blue-600 hover:bg-blue-500 text-white flex items-center justify-center shadow-md transition-all shrink-0"
              >
                {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 mr-0.5" />}
              </button>
              <div className="truncate">
                <p className="text-xs font-bold text-blue-500 truncate">تم توليد الصوت بنجاح</p>
                <p className="text-[11px] text-zinc-400 font-mono">
                  {Math.floor(currentTime)}s / {Math.floor(duration || 0)}s • WAV Audio
                </p>
              </div>
            </div>

            {/* Direct Download Button */}
            <a
              href={audioUrl}
              download="axiom_speech.wav"
              className={`p-2 px-3.5 rounded-xl font-semibold text-xs flex items-center gap-1.5 transition-all shadow-sm shrink-0 ${
                theme === 'light'
                  ? 'bg-zinc-900 hover:bg-zinc-800 text-white shadow-zinc-300/30'
                  : 'bg-white hover:bg-zinc-200 text-black shadow-white/10'
              }`}
              title="تحميل الملف الصوتي بصيغة WAV"
            >
              <Download className="w-4 h-4" />
              <span>تحميل الصوت (.wav)</span>
            </a>
          </div>
        )}

        {/* Generate Action Button */}
        <button
          onClick={handleGenerateSpeech}
          disabled={!text.trim() || isGenerating}
          className={`w-full py-3 px-5 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-lg ${
            !text.trim() || isGenerating
              ? 'opacity-50 cursor-not-allowed bg-zinc-700 text-zinc-400'
              : 'bg-blue-600 hover:bg-blue-500 text-white shadow-blue-500/25 active:scale-[0.99]'
          }`}
        >
          {isGenerating ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>جاري تحويل النص إلى صوت عبر Azure MAI-Voice-2...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              <span>توليد الصوت الآن (Generate Audio)</span>
            </>
          )}
        </button>

      </div>
    </div>
  );
};
