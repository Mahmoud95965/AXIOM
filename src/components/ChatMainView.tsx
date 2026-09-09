'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { ChatHeader } from '@/components/ChatHeader';
import { SidebarDrawer } from '@/components/SidebarDrawer';
import { ChatThread } from '@/components/ChatThread';
import { PromptCapsule } from '@/components/PromptCapsule';
import { InstallModal } from '@/components/InstallModal';
import { SettingsModal } from '@/components/SettingsModal';
import { AuthModal } from '@/components/AuthModal';
import { PlansModal } from '@/components/PlansModal';
import { IntegrationsModal } from '@/components/IntegrationsModal';
import { ChatSession, ChatMessage, AppSettings, normalizePlan } from '@/lib/types';
import { 
  saveChatToFirestore, 
  loadUserChatsFromFirestore, 
  deleteChatFromFirestore, 
  clearAllUserChatsFromFirestore 
} from '@/lib/chatStorage';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';

interface ChatMainViewProps {
  initialChatId?: string;
}

export const ChatMainView: React.FC<ChatMainViewProps> = ({ initialChatId }) => {
  const router = useRouter();
  const { user, userProfile, consumeTokens, hasTokensLeft } = useAuth();
  const { theme } = useTheme();

  // Chat State
  const [chats, setChats] = useState<ChatSession[]>([]);
  const [currentChatId, setCurrentChatId] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [speakingMsgId, setSpeakingMsgId] = useState<string | null>(null);
  const [isMounted, setIsMounted] = useState<boolean>(false);

  // Layout & Modals
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(true);
  const [isInstallModalOpen, setIsInstallModalOpen] = useState<boolean>(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [isPlansModalOpen, setIsPlansModalOpen] = useState<boolean>(false);
  const [isIntegrationsModalOpen, setIsIntegrationsModalOpen] = useState<boolean>(false);

  // PWA Prompt
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

  // Settings
  const [settings, setSettings] = useState<AppSettings>({
    autoTts: false,
    showReasoning: true,
    mobileSimulator: false,
    lang: 'ar'
  });

  // Helper to safely update URL without triggering React render conflicts
  const updateUrl = useCallback((path: string) => {
    if (typeof window !== 'undefined') {
      try {
        if (window.location.pathname !== path) {
          window.history.pushState(null, '', path);
        }
      } catch (e) {
        console.warn('URL update notice:', e);
      }
    }
  }, []);

  // 1. Initial Mount & Load Data
  useEffect(() => {
    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handleBeforeInstall);

    try {
      const stored = localStorage.getItem('axiom_chats_next');
      let loadedChats: ChatSession[] = [];
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          loadedChats = parsed;
        }
      }

      // If initialChatId was specified in URL (e.g. /c/[id])
      if (initialChatId) {
        const existingChat = loadedChats.find((c) => c.id === initialChatId);
        if (existingChat) {
          setChats(loadedChats);
          setCurrentChatId(initialChatId);
        } else {
          // New chat opened via URL
          const newChat: ChatSession = {
            id: initialChatId,
            title: 'محادثة جديدة',
            createdAt: new Date().toISOString(),
            messages: []
          };
          const updated = [newChat, ...loadedChats];
          setChats(updated);
          setCurrentChatId(initialChatId);
        }
      } else {
        // We are on root "/"
        const draftId = 'chat_' + Date.now();
        const draftChat: ChatSession = {
          id: draftId,
          title: 'محادثة جديدة',
          createdAt: new Date().toISOString(),
          messages: []
        };
        setChats([draftChat, ...loadedChats.filter(c => c.messages && c.messages.length > 0)]);
        setCurrentChatId(draftId);
      }

      const savedSettings = localStorage.getItem('axiom_settings_next');
      if (savedSettings) {
        setSettings(JSON.parse(savedSettings));
      }
    } catch (e) {
      console.warn('Initialization error:', e);
      const draftId = 'chat_' + Date.now();
      const draftChat: ChatSession = {
        id: draftId,
        title: 'محادثة جديدة',
        createdAt: new Date().toISOString(),
        messages: []
      };
      setChats([draftChat]);
      setCurrentChatId(draftId);
    }

    if (window.innerWidth < 768) {
      setIsSidebarOpen(false);
    }

    setIsMounted(true);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
    };
  }, [initialChatId]);

  // 2. Persist only non-empty chats to LocalStorage
  useEffect(() => {
    if (isMounted && chats.length > 0) {
      try {
        const chatsToSave = chats.filter((c) => c.messages && c.messages.length > 0);
        localStorage.setItem('axiom_chats_next', JSON.stringify(chatsToSave));
      } catch (e) {
        console.warn('LocalStorage save error:', e);
      }
    }
  }, [chats, isMounted]);

  // 3. Sync chats with Firestore when user logs in
  useEffect(() => {
    if (!user) return;

    let isCancelled = false;

    const syncUserChats = async () => {
      try {
        const cloudChats = await loadUserChatsFromFirestore(user.uid);
        if (isCancelled) return;

        if (cloudChats && cloudChats.length > 0) {
          setChats((prevChats) => {
            const chatMap = new Map<string, ChatSession>();

            // Include local non-empty chats first
            prevChats.forEach((c) => {
              if (c.messages && c.messages.length > 0) {
                chatMap.set(c.id, c);
              }
            });

            // Merge / overwrite with cloud chats
            cloudChats.forEach((c) => {
              chatMap.set(c.id, c);
            });

            const merged = Array.from(chatMap.values()).sort(
              (a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
            );

            // Sync any local-only chats up to Firestore so they are preserved in cloud
            prevChats.forEach((c) => {
              if (c.messages && c.messages.length > 0 && !cloudChats.some((cc) => cc.id === c.id)) {
                saveChatToFirestore(user.uid, c);
              }
            });

            return merged.length > 0 ? merged : prevChats;
          });
        } else {
          // If no cloud chats, sync all existing local non-empty chats to Firestore
          setChats((prevChats) => {
            const localNonEmpty = prevChats.filter((c) => c.messages && c.messages.length > 0);
            localNonEmpty.forEach((c) => {
              saveChatToFirestore(user.uid, c);
            });
            return prevChats;
          });
        }
      } catch (err) {
        console.warn('Firestore chats sync error:', err);
      }
    };

    syncUserChats();

    return () => {
      isCancelled = true;
    };
  }, [user]);

  // Current active chat object & messages
  const currentChat = chats.find((c) => c.id === currentChatId) || chats[0] || {
    id: 'draft',
    title: 'محادثة جديدة',
    createdAt: new Date().toISOString(),
    messages: []
  };
  const currentMessages = currentChat ? currentChat.messages : [];

  // Chats visible in Sidebar (only those with messages)
  const sidebarChats = chats.filter((c) => c.messages && c.messages.length > 0);

  // Chat Actions: New Chat (Resets to "/" without generating URL until message sent)
  const createNewChat = () => {
    if (currentChat && currentChat.messages.length === 0) {
      updateUrl('/');
      return;
    }

    const draftId = 'chat_' + Date.now();
    const newChat: ChatSession = {
      id: draftId,
      title: 'محادثة جديدة',
      createdAt: new Date().toISOString(),
      messages: []
    };

    setChats((prev) => [newChat, ...prev.filter((c) => c.messages.length > 0)]);
    setCurrentChatId(draftId);
    updateUrl('/');
  };

  // Select an existing chat (sets URL to /c/{id})
  const handleSelectChat = (id: string) => {
    setCurrentChatId(id);
    updateUrl(`/c/${id}`);
    if (window.innerWidth < 768) {
      setIsSidebarOpen(false);
    }
  };

  // Delete chat
  const handleDeleteChat = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const remaining = chats.filter((c) => c.id !== id);

    if (user?.uid) {
      deleteChatFromFirestore(user.uid, id);
    }

    if (currentChatId === id) {
      const nextChat = remaining.find((c) => c.messages.length > 0);
      if (nextChat) {
        setChats(remaining);
        setCurrentChatId(nextChat.id);
        updateUrl(`/c/${nextChat.id}`);
      } else {
        const draftId = 'chat_' + Date.now();
        const draftChat: ChatSession = {
          id: draftId,
          title: 'محادثة جديدة',
          createdAt: new Date().toISOString(),
          messages: []
        };
        setChats([draftChat]);
        setCurrentChatId(draftId);
        updateUrl('/');
      }
    } else {
      setChats(remaining);
    }
  };

  // Clear all chats
  const handleClearAll = () => {
    const draftId = 'chat_' + Date.now();
    const draftChat: ChatSession = {
      id: draftId,
      title: 'محادثة جديدة',
      createdAt: new Date().toISOString(),
      messages: []
    };
    if (user?.uid) {
      clearAllUserChatsFromFirestore(user.uid);
    }
    setChats([draftChat]);
    setCurrentChatId(draftId);
    try {
      localStorage.removeItem('axiom_chats_next');
    } catch (e) {}
    updateUrl('/');
  };

  // Require Upgrade Trigger
  const handleRequireUpgrade = (featureName: string) => {
    setIsPlansModalOpen(true);
  };

  // Send Message (Generates and establishes the /c/[id] URL on the FIRST message)
  const handleSendMessage = async (
    text: string, 
    image: string | null, 
    isWebSearch: boolean = false, 
    isImageGen: boolean = false,
    isVoiceGen: boolean = false
  ) => {
    if (isGenerating) return;

    if (!hasTokensLeft) {
      if (!user) {
        setIsAuthModalOpen(true);
      } else {
        setIsPlansModalOpen(true);
      }
      return;
    }

    let targetChatId = currentChatId;
    if (!targetChatId) {
      targetChatId = 'chat_' + Date.now();
      setCurrentChatId(targetChatId);
    }

    const effectivePlan = normalizePlan(userProfile.plan || 'free');
    const isProOrMax = effectivePlan === 'pro' || effectivePlan === 'max';

    // Web Search Gate
    if (isWebSearch && !isProOrMax) {
      setIsPlansModalOpen(true);
      return;
    }

    // Update URL to /c/{targetChatId} on sending the first message!
    updateUrl(`/c/${targetChatId}`);

    const userMessage: ChatMessage = {
      id: 'msg_' + Date.now(),
      sender: 'user',
      text,
      image,
      isWebSearch,
      timestamp: new Date().toISOString()
    };

    const aiMessageId = 'msg_' + (Date.now() + 1);
    const initialAiMessage: ChatMessage = {
      id: aiMessageId,
      sender: 'ai',
      text: '',
      timestamp: new Date().toISOString()
    };

    setChats((prevChats) => {
      const exists = prevChats.some((c) => c.id === targetChatId);
      if (exists) {
        return prevChats.map((chat) => {
          if (chat.id === targetChatId) {
            const isFirstMessage = chat.messages.length === 0;
            const updatedTitle =
              isFirstMessage && text
                ? text.slice(0, 32) + (text.length > 32 ? '...' : '')
                : chat.title;

            return {
              ...chat,
              title: updatedTitle,
              messages: [...chat.messages, userMessage, initialAiMessage]
            };
          }
          return chat;
        });
      } else {
        const newChat: ChatSession = {
          id: targetChatId!,
          title: text.slice(0, 32) + (text.length > 32 ? '...' : ''),
          createdAt: new Date().toISOString(),
          messages: [userMessage, initialAiMessage]
        };
        return [newChat, ...prevChats];
      }
    });

    setIsGenerating(true);

    // =========================================================================
    // 1. AI Image Generation Feature via FLUX.2 Pro (Pro & Max Exclusive)
    // =========================================================================
    const isImageGenerationRequest = 
      isImageGen || 
      text.trim().startsWith('/image ') || 
      text.includes('ولد صورة') || 
      text.includes('اصنع صورة') || 
      text.includes('صمم صورة') ||
      text.includes('صنع صورة') ||
      text.includes('خلق صورة');

    if (isImageGenerationRequest) {
      if (!isProOrMax) {
        setIsGenerating(false);
        const upgradeRequiredMessage = `> 🔒 **ميزة حصرية:** تخليق وصناعة الصور بالذكاء الاصطناعي متاحة حصرياً لمشتركي **باقة Pro** و **باقة Max**.\n\nخطتك الحالية هي: **المجانية (Free)**.\nيمكنك ترقية باقتك عبر الضغط على زر الخطط للوصول غير المحدود إلى نموذج تخليق الصور المتطور **FLUX.2 Pro**.`;

        setChats((prevChats) =>
          prevChats.map((c) => {
            if (c.id === targetChatId) {
              return {
                ...c,
                messages: c.messages.map((m) =>
                  m.id === aiMessageId ? { ...m, text: upgradeRequiredMessage } : m
                ),
              };
            }
            return c;
          })
        );

        setTimeout(() => {
          setIsPlansModalOpen(true);
        }, 600);
        return;
      }

      // User is Pro or Max: Execute FLUX Image Generation
      try {
        const cleanPrompt = text.replace(/^\/image\s+/i, '').trim();

        const imgResponse = await fetch('/api/generate-image', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            prompt: cleanPrompt,
            userId: user?.uid,
            userPlan: effectivePlan,
            userEmail: user?.email,
            width: 1024,
            height: 1024
          })
        });

        const imgData = await imgResponse.json();

        if (!imgResponse.ok) {
          throw new Error(imgData.error || 'فشل تخليق الصورة');
        }

        const generatedImageMarkdown = `![صورة مخلقة بنموذج FLUX.2 Pro](${imgData.imageUrl})\n\n✨ **تم تخليق وتوليد الصورة بنجاح عبر نموذج FLUX.2 Pro**\n> 📝 **الوصف:** ${imgData.prompt}`;

        setChats((prevChats) =>
          prevChats.map((c) => {
            if (c.id === targetChatId) {
              const updatedChat: ChatSession = {
                ...c,
                messages: c.messages.map((m) =>
                  m.id === aiMessageId ? { ...m, text: generatedImageMarkdown, image: imgData.imageUrl } : m
                ),
              };
              if (user?.uid) {
                saveChatToFirestore(user.uid, updatedChat);
              }
              return updatedChat;
            }
            return c;
          })
        );

        await consumeTokens(100);
        setIsGenerating(false);
        return;

      } catch (imgErr: any) {
        console.error('FLUX Image Gen Error:', imgErr);
        setIsGenerating(false);
        setChats((prevChats) =>
          prevChats.map((c) => {
            if (c.id === targetChatId) {
              return {
                ...c,
                messages: c.messages.map((m) =>
                  m.id === aiMessageId ? { ...m, text: `⚠️ تعذر تخليق الصورة: ${imgErr.message || 'حدث خطأ غير متوقع'}` } : m
                ),
              };
            }
            return c;
          })
        );
        return;
      }
    }

    // =========================================================================
    // 2. AXIOM-Voice Text-to-Speech In-Chat Generation
    // =========================================================================
    const isVoiceGenerationRequest =
      isVoiceGen ||
      text.startsWith('/voice') ||
      text.startsWith('/tts') ||
      text.startsWith('حول لصوت') ||
      text.startsWith('حول إلى صوت');

    if (isVoiceGenerationRequest) {
      const freeSecondsUsed = parseFloat(localStorage.getItem('axiom_tts_free_seconds_used') || '0');
      if (!isProOrMax && freeSecondsUsed >= 60) {
        setIsGenerating(false);
        const upgradeRequiredMessage = `> 🔒 **ميزة حصرية:** لقد استنفدت التجربة المجانية لتحويل النص إلى صوت (دقيقة واحدة مدى الحياة).\n\nيرجى الترقية إلى **باقة Pro** أو **باقة Max** للاستمتاع بتحويل وتنزيل ملفات صوتية غير محدودة بنموذج **AXIOM-Voice**.`;

        setChats((prevChats) =>
          prevChats.map((c) => {
            if (c.id === targetChatId) {
              return {
                ...c,
                messages: c.messages.map((m) =>
                  m.id === aiMessageId ? { ...m, text: upgradeRequiredMessage } : m
                ),
              };
            }
            return c;
          })
        );

        setTimeout(() => {
          setIsPlansModalOpen(true);
        }, 600);
        return;
      }

      // Execute AXIOM-Voice Generation
      try {
        const cleanPrompt = text
          .replace(/^\/voice\s+/i, '')
          .replace(/^\/tts\s+/i, '')
          .replace(/^حول\s+إلى\s+صوت\s*[:\s]*/i, '')
          .replace(/^حول\s+لصوت\s*[:\s]*/i, '')
          .trim();

        const ttsResponse = await fetch('/api/tts', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: JSON.stringify({
            text: cleanPrompt,
            returnJson: true,
            userId: user?.uid
          })
        });

        const ttsData = await ttsResponse.json();

        if (!ttsResponse.ok) {
          throw new Error(ttsData.error || 'فشل توليد الصوت من نموذج AXIOM-Voice');
        }

        // Update free quota if free plan
        if (!isProOrMax) {
          const estimatedSeconds = Math.max(3, Math.round(cleanPrompt.length / 15));
          const updatedFreeUsed = Math.min(60, freeSecondsUsed + estimatedSeconds);
          try {
            localStorage.setItem('axiom_tts_free_seconds_used', updatedFreeUsed.toString());
          } catch (e) {}
        }

        const generatedAudioMarkdown = `[audio:${encodeURIComponent(ttsData.audioUrl)}](${encodeURIComponent(ttsData.prompt)})\n\n✨ **تم تحويل النص إلى صوت بنجاح عبر نموذج AXIOM-Voice**\n> 📝 **النص الأصلي:** ${ttsData.prompt}`;

        setChats((prevChats) =>
          prevChats.map((c) => {
            if (c.id === targetChatId) {
              const updatedChat: ChatSession = {
                ...c,
                messages: c.messages.map((m) =>
                  m.id === aiMessageId ? { ...m, text: generatedAudioMarkdown, audio: ttsData.audioUrl } : m
                ),
              };
              if (user?.uid) {
                saveChatToFirestore(user.uid, updatedChat);
              }
              return updatedChat;
            }
            return c;
          })
        );

        await consumeTokens(25);
        setIsGenerating(false);
        return;

      } catch (ttsErr: any) {
        console.error('AXIOM-Voice Error:', ttsErr);
        setIsGenerating(false);
        setChats((prevChats) =>
          prevChats.map((c) => {
            if (c.id === targetChatId) {
              return {
                ...c,
                messages: c.messages.map((m) =>
                  m.id === aiMessageId ? { ...m, text: `⚠️ تعذر توليد الصوت: ${ttsErr.message || 'حدث خطأ أثناء الاتصال'}` } : m
                ),
              };
            }
            return c;
          })
        );
        return;
      }
    }

    // =========================================================================
    // 3. Regular Text / Code Chat Stream
    // =========================================================================
    try {
      const chat = chats.find((c) => c.id === targetChatId);
      const existingMessages = (chat?.messages || []).map((m) => ({
        role: m.sender === 'user' ? 'user' : 'assistant',
        content: m.text,
      }));
      existingMessages.push({ role: 'user', content: text });

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: existingMessages,
          model: 'axiom',
          attachedImage: image,
          isWebSearch: isWebSearch && isProOrMax,
          userId: user?.uid || null
        }),
      });

      if (!response.ok) {
        const errJson = await response.json().catch(() => ({}));
        throw new Error(errJson.error || `خطأ في الاتصال (${response.status})`);
      }

      if (!response.body) {
        throw new Error('لا توجد استجابة من الخادم');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder('utf-8');
      let accumulatedText = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        accumulatedText += decoder.decode(value, { stream: true });

        setChats((prevChats) =>
          prevChats.map((c) => {
            if (c.id === targetChatId) {
              return {
                ...c,
                messages: c.messages.map((m) =>
                  m.id === aiMessageId ? { ...m, text: accumulatedText } : m
                ),
              };
            }
            return c;
          })
        );
      }

      // Save complete chat to Firestore
      if (user?.uid) {
        setChats((prevChats) => {
          const finalChat = prevChats.find((c) => c.id === targetChatId);
          if (finalChat) {
            saveChatToFirestore(user.uid, finalChat);
          }
          return prevChats;
        });
      }

      setIsGenerating(false);

      const estimatedTokens = Math.max(15, Math.round((text.length + accumulatedText.length) / 3.5));
      await consumeTokens(estimatedTokens);

      if (settings.autoTts && accumulatedText) {
        handleSpeak(accumulatedText);
      }

    } catch (err: any) {
      console.error('Chat API Error:', err);
      setIsGenerating(false);
      const errorMsg = `⚠️ عذراً، تعذر الاتصال: ${err.message || 'يرجى التحقق من الاتصال'}`;
      setChats((prevChats) =>
        prevChats.map((c) => {
          if (c.id === targetChatId) {
            return {
              ...c,
              messages: c.messages.map((m) =>
                m.id === aiMessageId ? { ...m, text: errorMsg } : m
              ),
            };
          }
          return c;
        })
      );
    }
  };

  // Regenerate Response
  const handleRegenerate = async () => {
    if (isGenerating) return;
    const targetChatId = currentChatId || (chats[0] ? chats[0].id : null);
    if (!targetChatId) return;

    const chat = chats.find((c) => c.id === targetChatId);
    if (!chat || chat.messages.length === 0) return;

    const lastUserMsg = [...chat.messages].reverse().find((m) => m.sender === 'user');
    if (!lastUserMsg) return;

    const lastAiMsg = [...chat.messages].reverse().find((m) => m.sender === 'ai');
    const aiTargetId = lastAiMsg ? lastAiMsg.id : 'msg_' + (Date.now() + 1);

    setChats((prevChats) =>
      prevChats.map((c) => {
        if (c.id === targetChatId) {
          if (lastAiMsg) {
            return {
              ...c,
              messages: c.messages.map((m) =>
                m.id === lastAiMsg.id ? { ...m, text: '' } : m
              )
            };
          } else {
            return {
              ...c,
              messages: [...c.messages, { id: aiTargetId, sender: 'ai', text: '', timestamp: new Date().toISOString() }]
            };
          }
        }
        return c;
      })
    );

    setIsGenerating(true);

    try {
      const messagesForApi = chat.messages
        .filter((m) => m.id !== aiTargetId)
        .map((m) => ({
          role: m.sender === 'user' ? 'user' : 'assistant',
          content: m.text,
        }));

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: messagesForApi,
          model: 'axiom',
          attachedImage: lastUserMsg.image || null,
          userId: user?.uid || null
        }),
      });

      if (!response.ok) {
        throw new Error(`خطأ (${response.status})`);
      }

      if (!response.body) {
        throw new Error('لا توجد استجابة من الخادم');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder('utf-8');
      let accumulatedText = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        accumulatedText += decoder.decode(value, { stream: true });

        setChats((prevChats) =>
          prevChats.map((c) => {
            if (c.id === targetChatId) {
              return {
                ...c,
                messages: c.messages.map((m) =>
                  m.id === aiTargetId ? { ...m, text: accumulatedText } : m
                ),
              };
            }
            return c;
          })
        );
      }

      // Save complete chat to Firestore
      if (user?.uid) {
        setChats((prevChats) => {
          const finalChat = prevChats.find((c) => c.id === targetChatId);
          if (finalChat) {
            saveChatToFirestore(user.uid, finalChat);
          }
          return prevChats;
        });
      }

      setIsGenerating(false);

      const estimatedTokens = Math.max(15, Math.round((lastUserMsg.text.length + accumulatedText.length) / 3.5));
      await consumeTokens(estimatedTokens);

    } catch (err: any) {
      console.error('Regenerate Error:', err);
      setIsGenerating(false);
    }
  };

  // Text to Speech
  const handleSpeak = (text: string) => {
    if (!('speechSynthesis' in window)) return;
    if (window.speechSynthesis.speaking) {
      window.speechSynthesis.cancel();
      setSpeakingMsgId(null);
      return;
    }

    const clean = text.replace(/```[\s\S]*?```/g, 'كود برمجي').replace(/[#*`_>]/g, '').slice(0, 300);
    const utter = new SpeechSynthesisUtterance(clean);
    utter.lang = 'ar-SA';
    utter.onend = () => setSpeakingMsgId(null);
    utter.onerror = () => setSpeakingMsgId(null);

    setSpeakingMsgId('speaking');
    window.speechSynthesis.speak(utter);
  };

  // PWA Install Action
  const handleInstallApp = async () => {
    if (deferredPrompt) {
      try {
        await deferredPrompt.prompt();
        const choiceResult = await deferredPrompt.userChoice;
        if (choiceResult && choiceResult.outcome === 'accepted') {
          setIsInstallModalOpen(false);
        }
      } catch (err) {
        console.warn('PWA prompt execution:', err);
      }
      setDeferredPrompt(null);
    } else {
      // Open modal with platform specific manual instructions
      setIsInstallModalOpen(true);
    }
  };

  const handleUpdateSettings = (newSettings: Partial<AppSettings>) => {
    const updated = { ...settings, ...newSettings };
    setSettings(updated);
    try {
      localStorage.setItem('axiom_settings_next', JSON.stringify(updated));
    } catch (e) {}
  };

  return (
    <main className={`h-screen w-screen flex overflow-hidden relative z-10 transition-colors ${
      theme === 'light' ? 'bg-[#f8f9fa]' : 'bg-[#0a0a0c]'
    }`}>
      
      {/* Sidebar - shows only chats with messages */}
      <SidebarDrawer
        isOpen={isSidebarOpen}
        onToggle={() => setIsSidebarOpen(!isSidebarOpen)}
        chats={sidebarChats}
        currentChatId={currentChatId}
        onSelectChat={handleSelectChat}
        onNewChat={createNewChat}
        onDeleteChat={handleDeleteChat}
        onClearAll={handleClearAll}
        onOpenInstall={() => setIsInstallModalOpen(true)}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenAuth={() => setIsAuthModalOpen(true)}
        onOpenPlans={() => setIsPlansModalOpen(true)}
        onOpenIntegrations={() => router.push('/integrations')}
      />

      {/* Main Chat App Area */}
      <div className="flex-1 flex flex-col h-full overflow-hidden relative">
        
        {/* Top Header with Theme Switcher & Install Button */}
        <ChatHeader
          isSidebarOpen={isSidebarOpen}
          onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
          onOpenSettings={() => setIsSettingsOpen(true)}
          onOpenAuth={() => setIsAuthModalOpen(true)}
          onOpenPlans={() => setIsPlansModalOpen(true)}
          onOpenIntegrations={() => router.push('/integrations')}
          onOpenInstall={handleInstallApp}
        />

        {/* Chat Thread with Two-Sided Arabic Layout */}
        <div className="flex-1 overflow-y-auto flex flex-col">
          <ChatThread
            messages={currentMessages}
            isGenerating={isGenerating}
            onRegenerate={handleRegenerate}
            onSpeak={handleSpeak}
            speakingMsgId={speakingMsgId}
            onOpenInstall={handleInstallApp}
          />
        </div>

        {/* Floating Centered Prompt Capsule with Image Gen, Voice Gen, Search & Gating */}
        <PromptCapsule
          onSendMessage={handleSendMessage}
          isGenerating={isGenerating}
          onOpenIntegrations={() => router.push('/integrations')}
          userPlan={userProfile.plan || 'free'}
          onRequireUpgrade={handleRequireUpgrade}
        />

      </div>

      {/* Modals */}
      <InstallModal
        isOpen={isInstallModalOpen}
        onClose={() => setIsInstallModalOpen(false)}
        onInstall={handleInstallApp}
      />

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={settings}
        onUpdateSettings={handleUpdateSettings}
      />

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
      />

      <PlansModal
        isOpen={isPlansModalOpen}
        onClose={() => setIsPlansModalOpen(false)}
        onOpenAuth={() => setIsAuthModalOpen(true)}
      />

      <IntegrationsModal
        isOpen={isIntegrationsModalOpen}
        onClose={() => setIsIntegrationsModalOpen(false)}
        onOpenAuth={() => setIsAuthModalOpen(true)}
      />

    </main>
  );
};
