'use client';

import React, { useState, useEffect } from 'react';
import { X, Mic, MicOff, PhoneOff, MessageSquare } from 'lucide-react';

interface LiveVoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const LiveVoiceModal: React.FC<LiveVoiceModalProps> = ({ isOpen, onClose }) => {
  const [isMuted, setIsMuted] = useState(false);
  const [statusText, setStatusText] = useState('AXIOM Live متصل وجاهز');
  const [transcript, setTranscript] = useState('تحدث الآن... AXIOM يستمع إليك في محادثة مباشرة.');
  const [isSpeaking, setIsSpeaking] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    // Start recognition if available
    const SpeechRec = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    let recognition: any = null;

    if (SpeechRec && !isMuted) {
      recognition = new SpeechRec();
      recognition.lang = 'ar-SA';
      recognition.continuous = false;
      recognition.interimResults = true;

      recognition.onstart = () => {
        setStatusText('AXIOM Live يستمع إليك...');
      };

      recognition.onresult = (evt: any) => {
        let text = '';
        for (let i = evt.resultIndex; i < evt.results.length; i++) {
          text += evt.results[i][0].transcript;
        }
        setTranscript(text);
      };

      recognition.onend = () => {
        if (transcript && transcript !== 'تحدث الآن... AXIOM يستمع إليك في محادثة مباشرة.') {
          setStatusText('AXIOM يُفكر...');
          setIsSpeaking(true);

          setTimeout(() => {
            const aiReply = `أهلاً بك! لقد فهمت ما تفضلت به حول "${transcript}". بصفتي مساعد AXIOM من TOLZY AI، أنا جاهز لمساعدتك في كل خطوة بدقة واحترافية.`;
            setTranscript(aiReply);
            setStatusText('AXIOM يتحدث الآن...');

            if ('speechSynthesis' in window) {
              const utter = new SpeechSynthesisUtterance(aiReply);
              utter.lang = 'ar-SA';
              utter.onend = () => {
                setIsSpeaking(false);
                setStatusText('AXIOM يستمع مجدداً...');
                try { recognition?.start(); } catch (e) {}
              };
              window.speechSynthesis.speak(utter);
            } else {
              setIsSpeaking(false);
            }
          }, 800);
        }
      };

      try {
        recognition.start();
      } catch (e) {
        console.warn(e);
      }
    }

    return () => {
      try { recognition?.stop(); } catch (e) {}
      if ('speechSynthesis' in window) window.speechSynthesis.cancel();
    };
  }, [isOpen, isMuted]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-radial from-[#1b1c24] to-[#0d0e12] animate-fade-in p-6">
      
      <div className="w-full max-w-md h-full flex flex-col justify-between items-center text-center">
        
        {/* Header */}
        <div className="w-full flex items-center justify-between">
          <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 text-xs font-semibold text-white">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span>{statusText}</span>
          </div>

          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white flex items-center justify-center transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Fluid 3D Glowing Aurora Orb */}
        <div className="flex flex-col items-center justify-center my-auto">
          <div className="live-orb-mesh">
            <div className="orb-layer orb-layer-1" />
            <div className="orb-layer orb-layer-2" />
            <div className="orb-layer orb-layer-3" />
            <div className="orb-center-glow" />
          </div>

          {/* Sound Spectrum */}
          <div className="flex items-center gap-1.5 h-10 mt-8">
            <span className={`w-1 bg-blue-400 rounded-full transition-all ${isSpeaking ? 'h-6 animate-pulse' : 'h-2'}`} />
            <span className={`w-1 bg-purple-400 rounded-full transition-all ${isSpeaking ? 'h-9 animate-pulse [animation-delay:0.2s]' : 'h-3'}`} />
            <span className={`w-1 bg-pink-400 rounded-full transition-all ${isSpeaking ? 'h-5 animate-pulse [animation-delay:0.1s]' : 'h-2'}`} />
            <span className={`w-1 bg-amber-400 rounded-full transition-all ${isSpeaking ? 'h-10 animate-pulse [animation-delay:0.3s]' : 'h-3'}`} />
            <span className={`w-1 bg-blue-400 rounded-full transition-all ${isSpeaking ? 'h-7 animate-pulse [animation-delay:0.15s]' : 'h-2'}`} />
          </div>
        </div>

        {/* Transcription text */}
        <div className="w-full p-4 rounded-2xl bg-white/5 border border-white/10 text-sm text-gray-200 min-h-[70px] flex items-center justify-center leading-relaxed">
          {transcript}
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-5 mt-6">
          
          <button
            onClick={() => setIsMuted(!isMuted)}
            className={`w-12 h-12 rounded-full border border-white/15 flex items-center justify-center transition-all ${
              isMuted ? 'bg-red-500/20 text-red-400' : 'bg-white/10 text-white hover:bg-white/15'
            }`}
            title="كتم / تشغيل الميكروفون"
          >
            {isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
          </button>

          <button
            onClick={onClose}
            className="w-14 h-14 rounded-full bg-red-600 hover:bg-red-700 text-white flex items-center justify-center shadow-lg shadow-red-600/30 hover:scale-105 transition-all"
            title="إنهاء المكالمة"
          >
            <PhoneOff className="w-6 h-6" />
          </button>

          <button
            onClick={onClose}
            className="w-12 h-12 rounded-full bg-white/10 hover:bg-white/15 border border-white/15 text-white flex items-center justify-center transition-all"
            title="الرجوع للشات النصي"
          >
            <MessageSquare className="w-5 h-5" />
          </button>

        </div>

      </div>

    </div>
  );
};
