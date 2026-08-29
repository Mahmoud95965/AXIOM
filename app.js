/**
 * AXIOM by TOLZY AI - Core Application Script
 * Full Gemini Edition with PWA Installation Gate & Mobile Chat Interface
 */

(function () {
  'use strict';

  // State Management
  const state = {
    currentView: 'portal', // 'portal' | 'chat'
    activeModel: 'ultra', // 'ultra' | 'pro' | 'flash'
    chats: [],
    currentChatId: null,
    isGenerating: false,
    deferredPrompt: null,
    attachedImage: null,
    speechRecognition: null,
    isRecording: false,
    liveSessionActive: false,
    liveSpeaking: false,
    settings: {
      autoTts: false,
      showReasoning: true,
      mobileSimulator: true,
      lang: 'ar'
    }
  };

  // DOM Elements
  const elements = {
    // Screens
    portalScreen: document.getElementById('installPortalScreen'),
    chatScreen: document.getElementById('mobileChatScreen'),
    simulatorContainer: document.getElementById('mobileSimulatorContainer'),
    toastContainer: document.getElementById('toastContainer'),

    // Portal Controls
    portalInstallBtn: document.getElementById('portalInstallAppBtn'),
    portalPreviewBtn: document.getElementById('portalPreviewAppBtn'),
    quickLaunchBtn: document.getElementById('quickLaunchBtn'),
    langToggleBtn: document.getElementById('langToggleBtn'),
    platformTabs: document.querySelectorAll('.plat-tab'),
    guideCards: document.querySelectorAll('.guide-card-content'),

    // Chat Header
    drawerToggleBtn: document.getElementById('drawerToggleBtn'),
    modelPickerBtn: document.getElementById('modelPickerBtn'),
    modelDropdownMenu: document.getElementById('modelDropdownMenu'),
    selectedModelLabel: document.getElementById('selectedModelLabel'),
    modelOptions: document.querySelectorAll('.model-option'),
    launchLiveVoiceBtn: document.getElementById('launchLiveVoiceBtn'),
    frameToggleBtn: document.getElementById('frameToggleBtn'),
    userProfileBtn: document.getElementById('userProfileBtn'),

    // Chat Content
    zeroStateView: document.getElementById('zeroStateView'),
    messagesThread: document.getElementById('messagesThread'),
    typingIndicator: document.getElementById('typingIndicator'),
    scrollAnchor: document.getElementById('scrollAnchor'),
    suggestChips: document.querySelectorAll('.suggest-chip'),

    // Prompt Bar
    promptInput: document.getElementById('promptInput'),
    sendPromptBtn: document.getElementById('sendPromptBtn'),
    attachBtn: document.getElementById('attachBtn'),
    imageFileInput: document.getElementById('imageFileInput'),
    attachmentTray: document.getElementById('attachmentPreviewTray'),
    attachedImgEl: document.getElementById('attachedImgElement'),
    attachedImgName: document.getElementById('attachedImgName'),
    removeAttachBtn: document.getElementById('removeAttachBtn'),
    micBtn: document.getElementById('micBtn'),

    // Sidebar Drawer
    sidebarDrawer: document.getElementById('sidebarDrawer'),
    drawerBackdrop: document.getElementById('drawerBackdrop'),
    drawerCloseBtn: document.getElementById('drawerCloseBtn'),
    newChatDrawerBtn: document.getElementById('newChatDrawerBtn'),
    chatHistoryList: document.getElementById('chatHistoryList'),
    drawerPortalBtn: document.getElementById('drawerPortalBtn'),
    drawerSettingsBtn: document.getElementById('drawerSettingsBtn'),
    drawerClearAllBtn: document.getElementById('drawerClearAllBtn'),

    // Live Voice Screen
    liveVoiceModal: document.getElementById('liveVoiceModal'),
    closeLiveVoiceBtn: document.getElementById('closeLiveVoiceBtn'),
    liveStatusText: document.getElementById('liveStatusText'),
    soundSpectrum: document.getElementById('soundSpectrum'),
    liveTranscriptText: document.getElementById('liveTranscriptText'),
    liveMuteBtn: document.getElementById('liveMuteBtn'),
    liveEndBtn: document.getElementById('liveEndBtn'),
    liveTextToggleBtn: document.getElementById('liveTextToggleBtn'),

    // Settings Modal
    settingsModal: document.getElementById('settingsModal'),
    closeSettingsBtn: document.getElementById('closeSettingsBtn'),
    saveSettingsBtn: document.getElementById('saveSettingsBtn'),
    autoTtsToggle: document.getElementById('autoTtsToggle'),
    showReasoningToggle: document.getElementById('showReasoningToggle'),
    mobileSimulatorToggle: document.getElementById('mobileSimulatorToggle')
  };

  // Model Name Maps
  const modelLabels = {
    ultra: 'AXIOM 2.5 Ultra',
    pro: 'AXIOM 2.5 Pro',
    flash: 'AXIOM Flash'
  };

  // Initialize App
  function init() {
    registerServiceWorker();
    loadSettings();
    loadChatsFromStorage();
    setupPWAInstall();
    setupEventListeners();
    setupSpeechRecognition();

    // Check standalone mode or URL parameter
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches || 
                         window.navigator.standalone || 
                         new URLSearchParams(window.location.search).get('mode') === 'app';

    if (isStandalone) {
      switchView('chat');
    } else {
      switchView('portal');
    }

    // Auto-create or load initial chat if needed
    if (state.chats.length === 0) {
      createNewChat();
    } else {
      loadChat(state.chats[0].id);
    }
  }

  // Register Service Worker
  function registerServiceWorker() {
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('./sw.js')
          .then((reg) => console.log('AXIOM PWA SW Registered:', reg.scope))
          .catch((err) => console.log('SW Registration error:', err));
      });
    }
  }

  // Setup PWA Installation Handler
  function setupPWAInstall() {
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      state.deferredPrompt = e;
      console.log('PWA Install Prompt captured.');
      if (elements.portalInstallBtn) {
        elements.portalInstallBtn.classList.add('ready-to-install');
      }
    });

    window.addEventListener('appinstalled', () => {
      state.deferredPrompt = null;
      showToast('🎉 تم تثبيت تطبيق AXIOM بنجاح على جهازك!');
      setTimeout(() => switchView('chat'), 1000);
    });
  }

  // Trigger PWA Installation or Direct Launch
  function triggerInstallFlow() {
    if (state.deferredPrompt) {
      state.deferredPrompt.prompt();
      state.deferredPrompt.userChoice.then((choiceResult) => {
        if (choiceResult.outcome === 'accepted') {
          showToast('🚀 جاري تشغيل تطبيق AXIOM...');
          setTimeout(() => switchView('chat'), 800);
        }
        state.deferredPrompt = null;
      });
    } else {
      // Fallback: Animate simulated install & transition to mobile chat
      showToast('📲 جاري فتح وتحضير واجهة شات AXIOM للموبايل...');
      setTimeout(() => {
        switchView('chat');
        showToast('مرحباً بك في واجهة تطبيق AXIOM! يمكنك أيضاً إضافتها للشاشة الرئيسية عبر المتصفح.');
      }, 700);
    }
  }

  // View Switching
  function switchView(viewName) {
    state.currentView = viewName;
    if (viewName === 'chat') {
      elements.portalScreen.classList.remove('active-view');
      elements.chatScreen.classList.add('active-view');
      window.scrollTo(0, 0);
      focusPromptInput();
    } else {
      elements.chatScreen.classList.remove('active-view');
      elements.portalScreen.classList.add('active-view');
      window.scrollTo(0, 0);
    }
  }

  // Event Listeners Setup
  function setupEventListeners() {
    // Portal CTA Buttons
    elements.portalInstallBtn?.addEventListener('click', triggerInstallFlow);
    elements.portalPreviewBtn?.addEventListener('click', () => switchView('chat'));
    elements.quickLaunchBtn?.addEventListener('click', () => switchView('chat'));

    // Language Toggle Button
    elements.langToggleBtn?.addEventListener('click', () => {
      state.settings.lang = state.settings.lang === 'ar' ? 'en' : 'ar';
      showToast(state.settings.lang === 'ar' ? 'تم ضبط اللغة: العربية' : 'Language set: English');
      updateLanguageDisplay();
    });

    // Platform Tabs in Portal
    elements.platformTabs.forEach((tab) => {
      tab.addEventListener('click', () => {
        elements.platformTabs.forEach((t) => t.classList.remove('active'));
        elements.guideCards.forEach((c) => c.classList.remove('active'));
        
        tab.classList.add('active');
        const plat = tab.getAttribute('data-platform');
        if (plat === 'android') document.getElementById('guideAndroid')?.classList.add('active');
        if (plat === 'ios') document.getElementById('guideIOS')?.classList.add('active');
        if (plat === 'desktop') document.getElementById('guideDesktop')?.classList.add('active');
      });
    });

    // Model Selector Dropdown
    elements.modelPickerBtn?.addEventListener('click', (e) => {
      e.stopPropagation();
      elements.modelDropdownMenu.classList.toggle('show');
      elements.modelPickerBtn.classList.toggle('open');
    });

    document.addEventListener('click', (e) => {
      if (!elements.modelPickerBtn?.contains(e.target) && !elements.modelDropdownMenu?.contains(e.target)) {
        elements.modelDropdownMenu?.classList.remove('show');
        elements.modelPickerBtn?.classList.remove('open');
      }
    });

    elements.modelOptions.forEach((opt) => {
      opt.addEventListener('click', () => {
        const selectedModel = opt.getAttribute('data-model');
        state.activeModel = selectedModel;
        elements.selectedModelLabel.textContent = modelLabels[selectedModel];
        
        elements.modelOptions.forEach((o) => o.classList.remove('active'));
        opt.classList.add('active');

        elements.modelDropdownMenu.classList.remove('show');
        elements.modelPickerBtn.classList.remove('open');

        showToast(`تم التبديل إلى نموذج ${modelLabels[selectedModel]}`);
      });
    });

    // Frame Simulator Toggle (Desktop View / Phone View)
    elements.frameToggleBtn?.addEventListener('click', () => {
      elements.simulatorContainer.classList.toggle('full-width-view');
      const isFull = elements.simulatorContainer.classList.contains('full-width-view');
      showToast(isFull ? 'العرض الكامل للشاشات الكبيرة' : 'تأطير شاشة الهاتف');
    });

    // Sidebar Drawer Controls
    elements.drawerToggleBtn?.addEventListener('click', openDrawer);
    elements.drawerCloseBtn?.addEventListener('click', closeDrawer);
    elements.drawerBackdrop?.addEventListener('click', closeDrawer);
    elements.newChatDrawerBtn?.addEventListener('click', () => {
      createNewChat();
      closeDrawer();
      showToast('تم بدء محادثة جديدة ✨');
    });

    elements.drawerPortalBtn?.addEventListener('click', () => {
      closeDrawer();
      switchView('portal');
    });

    elements.drawerSettingsBtn?.addEventListener('click', () => {
      closeDrawer();
      openSettings();
    });

    elements.drawerClearAllBtn?.addEventListener('click', () => {
      if (confirm('هل أنت متأكد من رغبتك في مسح كافة المحادثات؟')) {
        clearAllChats();
        closeDrawer();
      }
    });

    // Settings Modal
    elements.userProfileBtn?.addEventListener('click', openSettings);
    elements.closeSettingsBtn?.addEventListener('click', closeSettings);
    elements.saveSettingsBtn?.addEventListener('click', () => {
      state.settings.autoTts = elements.autoTtsToggle.checked;
      state.settings.showReasoning = elements.showReasoningToggle.checked;
      saveSettings();
      closeSettings();
      showToast('تم حفظ الإعدادات بنجاح');
    });

    // Prompt Suggestions in Zero-State
    elements.suggestChips.forEach((chip) => {
      chip.addEventListener('click', () => {
        const text = chip.getAttribute('data-prompt');
        elements.promptInput.value = text;
        adjustTextareaHeight();
        validateSendButton();
        sendCurrentMessage();
      });
    });

    // Prompt Textarea & Send Button
    elements.promptInput?.addEventListener('input', () => {
      adjustTextareaHeight();
      validateSendButton();
    });

    elements.promptInput?.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        if (!elements.sendPromptBtn.disabled) {
          sendCurrentMessage();
        }
      }
    });

    elements.sendPromptBtn?.addEventListener('click', sendCurrentMessage);

    // Image Attachment
    elements.attachBtn?.addEventListener('click', () => {
      elements.imageFileInput.click();
    });

    elements.imageFileInput?.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (loadEvt) => {
          state.attachedImage = {
            dataUrl: loadEvt.target.result,
            name: file.name
          };
          elements.attachedImgEl.src = loadEvt.target.result;
          elements.attachedImgName.textContent = file.name;
          elements.attachmentTray.classList.remove('hidden');
          validateSendButton();
        };
        reader.readAsDataURL(file);
      }
    });

    elements.removeAttachBtn?.addEventListener('click', () => {
      state.attachedImage = null;
      elements.imageFileInput.value = '';
      elements.attachmentTray.classList.add('hidden');
      validateSendButton();
    });

    // Mic Dictation
    elements.micBtn?.addEventListener('click', toggleSpeechInput);

    // Live Voice Mode
    elements.launchLiveVoiceBtn?.addEventListener('click', startLiveVoiceMode);
    elements.closeLiveVoiceBtn?.addEventListener('click', endLiveVoiceMode);
    elements.liveEndBtn?.addEventListener('click', endLiveVoiceMode);
    elements.liveTextToggleBtn?.addEventListener('click', endLiveVoiceMode);
    elements.liveMuteBtn?.addEventListener('click', toggleLiveMute);

    // Footer Links in Portal
    document.getElementById('footerAboutBtn')?.addEventListener('click', (e) => {
      e.preventDefault();
      showToast('AXIOM هو الجيل المطور من TOLZY AI لتقديم أذكى مساعد افتراضي.');
    });
    document.getElementById('footerPrivacyBtn')?.addEventListener('click', (e) => {
      e.preventDefault();
      showToast('بياناتك ومحادثاتك مشفرة ومحفوظة محلياً على جهازك.');
    });
    document.getElementById('footerSupportBtn')?.addEventListener('click', (e) => {
      e.preventDefault();
      showToast('الدعم الفني متاح عبر TOLZY AI.');
    });
  }

  // Adjust Textarea Height dynamically
  function adjustTextareaHeight() {
    const input = elements.promptInput;
    if (!input) return;
    input.style.height = 'auto';
    input.style.height = Math.min(input.scrollHeight, 150) + 'px';
  }

  function validateSendButton() {
    const text = elements.promptInput.value.trim();
    const hasImage = !!state.attachedImage;
    elements.sendPromptBtn.disabled = (!text && !hasImage) || state.isGenerating;
  }

  function focusPromptInput() {
    setTimeout(() => elements.promptInput?.focus(), 200);
  }

  // Drawer Functions
  function openDrawer() {
    elements.sidebarDrawer?.classList.add('open');
    renderChatHistoryList();
  }

  function closeDrawer() {
    elements.sidebarDrawer?.classList.remove('open');
  }

  // Settings Functions
  function openSettings() {
    elements.autoTtsToggle.checked = state.settings.autoTts;
    elements.showReasoningToggle.checked = state.settings.showReasoning;
    elements.settingsModal?.classList.remove('hidden');
  }

  function closeSettings() {
    elements.settingsModal?.classList.add('hidden');
  }

  function saveSettings() {
    localStorage.setItem('axiom_settings', JSON.stringify(state.settings));
  }

  function loadSettings() {
    try {
      const saved = localStorage.getItem('axiom_settings');
      if (saved) {
        state.settings = Object.assign(state.settings, JSON.parse(saved));
      }
    } catch (e) {
      console.warn('Could not load settings:', e);
    }
  }

  function updateLanguageDisplay() {
    const isAr = state.settings.lang === 'ar';
    document.documentElement.lang = isAr ? 'ar' : 'en';
    document.documentElement.dir = isAr ? 'rtl' : 'ltr';
    document.body.style.direction = isAr ? 'rtl' : 'ltr';
    if (elements.langToggleBtn) {
      elements.langToggleBtn.querySelector('.lang-code').textContent = isAr ? 'EN' : 'عربي';
    }
  }

  // =========================================================================
  // CHAT & MESSAGING SYSTEM
  // =========================================================================

  function createNewChat() {
    const newChat = {
      id: 'chat_' + Date.now(),
      title: 'محادثة جديدة',
      createdAt: new Date().toISOString(),
      messages: []
    };
    state.chats.unshift(newChat);
    state.currentChatId = newChat.id;
    saveChatsToStorage();
    renderCurrentChat();
  }

  function getCurrentChat() {
    return state.chats.find((c) => c.id === state.currentChatId) || state.chats[0];
  }

  function loadChat(chatId) {
    state.currentChatId = chatId;
    renderCurrentChat();
    closeDrawer();
  }

  function deleteChat(chatId, e) {
    if (e) e.stopPropagation();
    state.chats = state.chats.filter((c) => c.id !== chatId);
    if (state.chats.length === 0) {
      createNewChat();
    } else {
      if (state.currentChatId === chatId) {
        state.currentChatId = state.chats[0].id;
      }
      saveChatsToStorage();
      renderCurrentChat();
    }
    renderChatHistoryList();
    showToast('تم حذف المحادثة');
  }

  function clearAllChats() {
    state.chats = [];
    createNewChat();
    saveChatsToStorage();
    showToast('تم مسح جميع المحادثات');
  }

  function saveChatsToStorage() {
    try {
      localStorage.setItem('axiom_chat_history', JSON.stringify(state.chats));
    } catch (e) {
      console.warn('LocalStorage error:', e);
    }
  }

  function loadChatsFromStorage() {
    try {
      const stored = localStorage.getItem('axiom_chat_history');
      if (stored) {
        state.chats = JSON.parse(stored);
      }
    } catch (e) {
      console.warn('Could not parse chat history:', e);
    }
  }

  function renderChatHistoryList() {
    if (!elements.chatHistoryList) return;
    elements.chatHistoryList.innerHTML = '';

    state.chats.forEach((chat) => {
      const item = document.createElement('div');
      item.className = `history-chat-item ${chat.id === state.currentChatId ? 'active' : ''}`;
      
      const titleSpan = document.createElement('span');
      titleSpan.className = 'history-item-title';
      titleSpan.textContent = chat.title || 'محادثة بدون عنوان';

      const delBtn = document.createElement('button');
      delBtn.className = 'delete-chat-btn';
      delBtn.innerHTML = '&times;';
      delBtn.title = 'حذف المحادثة';
      delBtn.addEventListener('click', (e) => deleteChat(chat.id, e));

      item.appendChild(titleSpan);
      item.appendChild(delBtn);

      item.addEventListener('click', () => loadChat(chat.id));
      elements.chatHistoryList.appendChild(item);
    });
  }

  function renderCurrentChat() {
    const chat = getCurrentChat();
    if (!chat || chat.messages.length === 0) {
      elements.zeroStateView.classList.remove('hidden');
      elements.messagesThread.classList.add('hidden');
      elements.messagesThread.innerHTML = '';
    } else {
      elements.zeroStateView.classList.add('hidden');
      elements.messagesThread.classList.remove('hidden');
      elements.messagesThread.innerHTML = '';

      chat.messages.forEach((msg) => {
        appendMessageElement(msg, false);
      });
      scrollToBottom();
    }
  }

  function scrollToBottom() {
    elements.scrollAnchor?.scrollIntoView({ behavior: 'smooth' });
  }

  // Send Current User Message
  function sendCurrentMessage() {
    if (state.isGenerating) return;

    const text = elements.promptInput.value.trim();
    const attachedImage = state.attachedImage;

    if (!text && !attachedImage) return;

    const chat = getCurrentChat();
    if (!chat) return;

    // Build User Message Object
    const userMsg = {
      id: 'msg_' + Date.now(),
      sender: 'user',
      text: text,
      image: attachedImage ? attachedImage.dataUrl : null,
      timestamp: new Date().toISOString()
    };

    chat.messages.push(userMsg);

    // Update Title if it's first user message
    if (chat.messages.filter((m) => m.sender === 'user').length === 1) {
      chat.title = text.slice(0, 32) + (text.length > 32 ? '...' : '');
    }

    saveChatsToStorage();

    // Reset Input
    elements.promptInput.value = '';
    adjustTextareaHeight();
    state.attachedImage = null;
    elements.imageFileInput.value = '';
    elements.attachmentTray.classList.add('hidden');
    validateSendButton();

    // UI Updates
    elements.zeroStateView.classList.add('hidden');
    elements.messagesThread.classList.remove('hidden');
    appendMessageElement(userMsg, true);
    scrollToBottom();

    // Trigger AI Generation
    generateAIResponse(text, userMsg.image);
  }

  // Append Message Element to Thread
  function appendMessageElement(msg, animate) {
    const row = document.createElement('div');
    row.className = `message-row ${msg.sender === 'user' ? 'user-msg' : 'ai-msg'}`;
    row.id = msg.id;

    if (msg.sender === 'user') {
      const bubble = document.createElement('div');
      bubble.className = 'user-bubble';

      if (msg.image) {
        const img = document.createElement('img');
        img.src = msg.image;
        img.className = 'user-attached-img';
        bubble.appendChild(img);
      }

      if (msg.text) {
        const textNode = document.createElement('div');
        textNode.textContent = msg.text;
        bubble.appendChild(textNode);
      }

      row.appendChild(bubble);
    } else {
      // AI Avatar
      const avatar = document.createElement('div');
      avatar.className = 'ai-avatar';
      avatar.innerHTML = `
        <svg viewBox="0 0 24 24" width="18" height="18" fill="none">
          <path d="M12 2C12 7.5 7.5 12 2 12C7.5 12 12 16.5 12 22C12 16.5 16.5 12 22 12C16.5 12 12 7.5 12 2Z" fill="url(#sparkleGradPortal)" />
        </svg>
      `;

      // Content Wrapper
      const contentWrap = document.createElement('div');
      contentWrap.className = 'ai-content-wrap';

      const headerTag = document.createElement('div');
      headerTag.className = 'ai-header-tag';
      headerTag.innerHTML = `
        <span class="ai-name">AXIOM</span>
        <span>•</span>
        <span class="ai-model-tag">${modelLabels[msg.model || state.activeModel]}</span>
      `;

      const bubble = document.createElement('div');
      bubble.className = 'ai-bubble';
      bubble.innerHTML = parseMarkdownToHTML(msg.text);

      // Actions Toolbar
      const toolbar = createMessageActionsToolbar(msg);

      contentWrap.appendChild(headerTag);
      contentWrap.appendChild(bubble);
      contentWrap.appendChild(toolbar);

      row.appendChild(avatar);
      row.appendChild(contentWrap);
    }

    elements.messagesThread.appendChild(row);
    setupCodeCopyButtons(row);
  }

  // Create Message Action Toolbar
  function createMessageActionsToolbar(msg) {
    const toolbar = document.createElement('div');
    toolbar.className = 'msg-actions-toolbar';

    // Copy Button
    const copyBtn = document.createElement('button');
    copyBtn.className = 'msg-action-btn';
    copyBtn.title = 'نسخ الرد';
    copyBtn.innerHTML = `
      <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
        <path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z"/>
      </svg>
    `;
    copyBtn.addEventListener('click', () => {
      navigator.clipboard.writeText(msg.text);
      showToast('تم نسخ الرد إلى الحافظة 📋');
    });

    // TTS / Read Aloud Button
    const ttsBtn = document.createElement('button');
    ttsBtn.className = 'msg-action-btn';
    ttsBtn.title = 'استماع للرد';
    ttsBtn.innerHTML = `
      <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
        <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/>
      </svg>
    `;
    ttsBtn.addEventListener('click', () => {
      speakText(msg.text, ttsBtn);
    });

    // Like Button
    const likeBtn = document.createElement('button');
    likeBtn.className = 'msg-action-btn';
    likeBtn.title = 'إجابة مفيدة';
    likeBtn.innerHTML = `
      <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
        <path d="M1 21h4V9H1v12zm22-11c0-1.1-.9-2-2-2h-6.31l.95-4.57.03-.32c0-.41-.17-.79-.44-1.06L14.17 1 7.59 7.59C7.22 7.95 7 8.45 7 9v10c0 1.1.9 2 2 2h9c.83 0 1.54-.5 1.84-1.22l3.02-7.05c.09-.23.14-.47.14-.73v-2z"/>
      </svg>
    `;
    likeBtn.addEventListener('click', () => {
      likeBtn.classList.toggle('active');
      showToast('شكراً على تقييمك! 👍');
    });

    // Regenerate Button
    const regenBtn = document.createElement('button');
    regenBtn.className = 'msg-action-btn';
    regenBtn.title = 'إعادة التوليد';
    regenBtn.innerHTML = `
      <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
        <path d="M17.65 6.35C16.2 4.9 14.21 4 12 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08c-.82 2.33-3.04 4-5.65 4-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z"/>
      </svg>
    `;
    regenBtn.addEventListener('click', () => {
      const chat = getCurrentChat();
      const lastUserMsg = chat.messages.filter((m) => m.sender === 'user').slice(-1)[0];
      if (lastUserMsg) {
        generateAIResponse(lastUserMsg.text, lastUserMsg.image);
      }
    });

    toolbar.appendChild(copyBtn);
    toolbar.appendChild(ttsBtn);
    toolbar.appendChild(likeBtn);
    toolbar.appendChild(regenBtn);

    return toolbar;
  }

  // Setup Code Copy Buttons in Rendered Elements
  function setupCodeCopyButtons(container) {
    container.querySelectorAll('.copy-code-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        const codeBlock = btn.closest('.code-box').querySelector('code');
        if (codeBlock) {
          navigator.clipboard.writeText(codeBlock.innerText);
          btn.innerHTML = '<span>تم النسخ! ✓</span>';
          setTimeout(() => {
            btn.innerHTML = '<span>نسخ</span>';
          }, 2000);
        }
      });
    });
  }

  // AI Response Simulation with Dynamic Token Streaming
  function generateAIResponse(promptText, attachedImage) {
    state.isGenerating = true;
    validateSendButton();
    elements.typingIndicator?.classList.remove('hidden');
    scrollToBottom();

    // Prepare simulated dynamic response based on prompt
    const simulatedResponse = buildDynamicAIResponse(promptText, attachedImage, state.activeModel);

    const chat = getCurrentChat();
    const aiMsg = {
      id: 'msg_' + Date.now(),
      sender: 'ai',
      model: state.activeModel,
      text: '',
      timestamp: new Date().toISOString()
    };

    setTimeout(() => {
      elements.typingIndicator?.classList.add('hidden');
      chat.messages.push(aiMsg);
      appendMessageElement(aiMsg, true);

      const msgRow = document.getElementById(aiMsg.id);
      const bubble = msgRow.querySelector('.ai-bubble');

      // Stream text tokens
      let index = 0;
      const chunkSize = 4;
      const streamInterval = setInterval(() => {
        index += chunkSize;
        aiMsg.text = simulatedResponse.slice(0, index);
        bubble.innerHTML = parseMarkdownToHTML(aiMsg.text);
        setupCodeCopyButtons(msgRow);
        scrollToBottom();

        if (index >= simulatedResponse.length) {
          clearInterval(streamInterval);
          aiMsg.text = simulatedResponse;
          bubble.innerHTML = parseMarkdownToHTML(aiMsg.text);
          setupCodeCopyButtons(msgRow);
          state.isGenerating = false;
          validateSendButton();
          saveChatsToStorage();
          scrollToBottom();

          // Auto-TTS if enabled
          if (state.settings.autoTts) {
            speakText(simulatedResponse, msgRow.querySelector('.msg-action-btn:nth-child(2)'));
          }
        }
      }, 25);

    }, 800);
  }

  // Smart Context-Aware Response Builder for AXIOM TOLZY AI
  function buildDynamicAIResponse(prompt, image, model) {
    const p = (prompt || '').toLowerCase();
    const modelTag = modelLabels[model];

    if (image) {
      return `### 🔍 تحليل الصورة بواسطة ${modelTag}

أهلاً بك! لقد قمت بفحص وتحليل الصورة المرفقة بعناية فائقة عبر خوارزميات **TOLZY Multi-Modal Vision**.

#### 📋 النتائج والملاحظات الأساسية:
1. **التعرف على العناصر**: تم اكتشاف المحتوى البصري الرئيسي بدقة عالية.
2. **السمات البصرية**: تناسق ألوان مريح، مع معالجة ذكية للأبعاد والتباين.
3. **التوصية والاقتراح**: يمكن استثمار هذا التصميم وتطويره بشكل أكبر من خلال تحسين التفاصيل التفاعلية ودمج واجهات **AXIOM**.

إذا كنت ترغب في تحليل برمجي دقيق أو استخراج نصوص وبيانات محددة من الصورة، أخبرني فوراً! ✨`;
    }

    if (p.includes('كود') || p.includes('python') || p.includes('برمج') || p.includes('code') || p.includes('javascript')) {
      return `### 💻 حل برمجي متكامل عبر ${modelTag}

يسعدني تقديم هذا الكود البرمجي النظيف والمتكامل والمبني وفقاً لأعلى معايير الأداء والأمان:

\`\`\`python
import asyncio
from dataclasses import dataclass

@dataclass
class AxiomResponse:
    query: str
    model: str
    tokens: int
    status: str = "success"

class TolzyAIEngine:
    """محرك الذكاء الاصطناعي الخاص بـ AXIOM من TOLZY AI"""
    def __init__(self, model_name: str = "AXIOM-2.5-Ultra"):
        self.model_name = model_name
        print(f"✨ [AXIOM Engine] تم تهيئة النموذج: {self.model_name}")

    async def process_prompt(self, prompt: str) -> AxiomResponse:
        print(f"⚡ جاري معالجة الاستعلام: '{prompt}'...")
        await asyncio.sleep(0.5) # محاكاة المعالجة اللحظية
        return AxiomResponse(
            query=prompt,
            model=self.model_name,
            tokens=len(prompt.split()) * 4
        )

# تجربة تشغيل المحرك
async def main():
    engine = TolzyAIEngine()
    result = await engine.process_prompt("${prompt.replace(/"/g, "'") || 'تحليل البيانات'}")
    print(f"✓ اكتملت المعالجة: {result.status} | النموذج: {result.model}")

if __name__ == "__main__":
    asyncio.run(main())
\`\`\`

#### ⚙️ أهم مميزات هذا الكود:
* **بنية برمجية معيارية (Clean Architecture)**: استخدام \`dataclasses\` لتنظيم البيانات وسرعة المعالجة.
* **غير متزامن (Asynchronous)**: دعم البرمجة غير المتزامنة لضمان استجابة فائقة دون تجميد التطبيق.
* **سهولة التوسع**: إمكانية ربط هذا المنطق بواجهات REST API أو تطبيقات الهاتف مباشرة.`;
    }

    if (p.includes('خطة') || p.includes('مشروع') || p.includes('استثمار') || p.includes('business') || p.includes('فكرة')) {
      return `### 🚀 دراسة وخطة عمل مقترحة من ${modelTag}

بناءً على طلبك، إليك خطة استراتيجية متكاملة ومبتكرة:

#### 1. الرؤية والقيمة المضافة (Value Proposition)
* تقديم حلول ذكاء اصطناعي فائقة السرعة للأفراد والشركات.
* التركيز على **تجربة الموبايل (Mobile-First)** والعمل الفوري دون تعقيدات التثبيت التقليدية.

#### 2. مراحل التنفيذ الأساسية:
| المرحلة | المدة الزمنية | المخرجات الرئيسية |
| :--- | :--- | :--- |
| **المرحلة 1: التأسيس والتطوير** | شهر واحد | إطلاق النسخة التجريبية (MVP) لـ AXIOM |
| **المرحلة 2: التوسع والتسويق** | 3 أشهر | جذب أول 10,000 مستخدم نشط |
| **المرحلة 3: النماذج المتقدمة** | 6 أشهر | دمج اشتراكات TOLZY Pro & Ultra |

#### 💡 نصيحة AXIOM الاستراتيجية:
> "التركيز على سرعة استجابة التطبيق وسهولة تجربة المستخدم هو العامل الحاسم في تفوق منصات الذكاء الاصطناعي اليوم."

هل ترغب في صياغة عرض تقديمي (Pitch Deck) مخصص للمستثمرين؟`;
    }

    if (p.includes('إيميل') || p.includes('بريد') || p.includes('رسالة') || p.includes('email')) {
      return `### ✉️ مسودة البريد الإلكتروني الاحترافي

**الموضوع:** طلب شراكة استراتيجية وفرصة تعاون واعدة | AXIOM & TOLZY AI

السادة الأفاضل / [اسم الشريك أو المستثمر]،  
تحية طيبة وبعد،

يسرنا التواصل معكم لبحث آفاق التعاون المشترك بين منظومتينا. نحن في **TOLZY AI** قمنا بتطوير نظام **AXIOM**، وهو الجيل الأحدث من المساعدات الذكية فائقة التطور المصممة لتسهيل الأعمال وزيادة الإنتاجية بمعدل 300%.

نود أن نعرض عليكم جلسة عمل قصيرة (15 دقيقة) لعرض نموذج العمل وإمكانيات التكامل التقني المتبادل.

نتطلع لردكم الكريم،  
وتفضلوا بقبول فائق الاحترام والتقدير.

---
**محمود موسى**  
فريق AXIOM • TOLZY AI`;
    }

    // Default Rich Response
    return `أهلاً بك! لقد استلمت استفسارك عبر نموذج **${modelTag}**.

### 🌟 الإجابة والتحليل الشامل:
بخصوص ما تفضلت به: **"${prompt || 'مرحباً بـ AXIOM'}"**، يسعدني توضيح النقاط التالية:

1. **الدقة والاستيعاب**: صُممت منظومة **AXIOM** من **TOLZY AI** لفهم سياق الحديث واللغة العربية الفصحى واللهجات المختلفة بدقة لا متناهية.
2. **السرعة والفاعلية**: يتم توليد الإجابات في أجزاء من الثانية مع تقديم شروحات معمقة، أمثلة توضيحية، وحلول عملية قابلة للتطبيق الفوري.
3. **التكامل عبر التطبيق**: يمكنك الاستفادة من ميزة **المحادثة الصوتية Live Voice** والتنقل بين النماذج بكل حرية وسلاسة.

> هل تحتاج إلى تفصيل إضافي في أي جانب، أو ترغب في استكشاف أفكار وحلول أخرى؟ أنا هنا لمساعدتك دائماً! ✨`;
  }

  // Markdown to HTML Parser
  function parseMarkdownToHTML(markdown) {
    if (!markdown) return '';
    let html = markdown;

    // Code blocks with syntax box
    html = html.replace(/```([a-zA-Z0-9_-]*)\n([\s\S]*?)```/g, (match, lang, code) => {
      const language = lang || 'code';
      const escapedCode = escapeHtml(code.trim());
      return `
        <div class="code-box">
          <div class="code-box-header">
            <span>${language}</span>
            <button class="copy-code-btn" type="button">
              <svg viewBox="0 0 24 24" width="12" height="12" fill="currentColor">
                <path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z"/>
              </svg>
              <span>نسخ</span>
            </button>
          </div>
          <pre><code>${escapedCode}</code></pre>
        </div>
      `;
    });

    // Inline code
    html = html.replace(/`([^`]+)`/g, '<code style="background:rgba(255,255,255,0.08);padding:2px 6px;border-radius:4px;font-family:var(--font-mono);font-size:13px;color:var(--gemini-light-blue);">$1</code>');

    // Headers
    html = html.replace(/^### (.*$)/gim, '<h3>$1</h3>');
    html = html.replace(/^## (.*$)/gim, '<h2>$1</h2>');
    html = html.replace(/^# (.*$)/gim, '<h1>$1</h1>');

    // Blockquotes
    html = html.replace(/^\> (.*$)/gim, '<blockquote>$1</blockquote>');

    // Bold & Italic
    html = html.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
    html = html.replace(/\*([^*]+)\*/g, '<em>$1</em>');

    // Unordered Lists
    html = html.replace(/^\* (.*$)/gim, '<li>$1</li>');
    html = html.replace(/^\- (.*$)/gim, '<li>$1</li>');

    // Ordered Lists
    html = html.replace(/^\d+\. (.*$)/gim, '<li>$1</li>');

    // Tables simple parser
    html = html.replace(/\|(.+)\|/g, (match, content) => {
      const cells = content.split('|').map(c => `<td>${c.trim()}</td>`).join('');
      return `<tr>${cells}</tr>`;
    });

    // Paragraphs
    html = html.split('\n\n').map(p => {
      if (p.startsWith('<h') || p.startsWith('<pre') || p.startsWith('<blockquote') || p.startsWith('<li>') || p.startsWith('<tr>')) {
        return p;
      }
      return `<p>${p.replace(/\n/g, '<br>')}</p>`;
    }).join('');

    return html;
  }

  function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  // =========================================================================
  // SPEECH RECOGNITION (DICTATION) & SYNTHESIS (TTS)
  // =========================================================================

  function setupSpeechRecognition() {
    const SpeechRec = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRec) {
      state.speechRecognition = new SpeechRec();
      state.speechRecognition.continuous = false;
      state.speechRecognition.interimResults = true;
      state.speechRecognition.lang = 'ar-SA';

      state.speechRecognition.onstart = () => {
        state.isRecording = true;
        elements.micBtn?.classList.add('recording');
        showToast('🎙️ AXIOM يستمع إليك الآن...');
      };

      state.speechRecognition.onresult = (event) => {
        let transcript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          transcript += event.results[i][0].transcript;
        }
        if (state.liveSessionActive) {
          elements.liveTranscriptText.textContent = transcript;
        } else {
          elements.promptInput.value = transcript;
          adjustTextareaHeight();
          validateSendButton();
        }
      };

      state.speechRecognition.onerror = (err) => {
        console.warn('Speech Rec Error:', err);
        stopSpeechInput();
      };

      state.speechRecognition.onend = () => {
        stopSpeechInput();
        if (state.liveSessionActive) {
          handleLiveSpeechEnd();
        }
      };
    }
  }

  function toggleSpeechInput() {
    if (!state.speechRecognition) {
      showToast('⚠️ ميزة التعرف الصوتي غير مدعومة في هذا المتصفح');
      return;
    }

    if (state.isRecording) {
      state.speechRecognition.stop();
      stopSpeechInput();
    } else {
      try {
        state.speechRecognition.start();
      } catch (e) {
        console.warn(e);
      }
    }
  }

  function stopSpeechInput() {
    state.isRecording = false;
    elements.micBtn?.classList.remove('recording');
  }

  // Text-To-Speech (Speech Synthesis)
  function speakText(text, btnElement) {
    if (!('speechSynthesis' in window)) {
      showToast('⚠️ القراءة الصوتية غير مدعومة في جهازك');
      return;
    }

    if (window.speechSynthesis.speaking) {
      window.speechSynthesis.cancel();
      if (btnElement) btnElement.classList.remove('active');
      return;
    }

    // Clean markdown tags for natural speech
    const cleanText = text.replace(/```[\s\S]*?```/g, 'تم تضمين كود برمجي.')
                          .replace(/[#*`_>]/g, '')
                          .slice(0, 400);

    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = 'ar-SA';
    utterance.rate = 1.05;

    // Pick best Arabic/English voice if available
    const voices = window.speechSynthesis.getVoices();
    const arVoice = voices.find(v => v.lang.includes('ar') || v.name.includes('Arabic'));
    if (arVoice) utterance.voice = arVoice;

    if (btnElement) btnElement.classList.add('active');

    utterance.onend = () => {
      if (btnElement) btnElement.classList.remove('active');
    };

    utterance.onerror = () => {
      if (btnElement) btnElement.classList.remove('active');
    };

    window.speechSynthesis.speak(utterance);
  }

  // =========================================================================
  // AXIOM LIVE VOICE MODE (GEMINI LIVE INTERACTION)
  // =========================================================================

  function startLiveVoiceMode() {
    state.liveSessionActive = true;
    elements.liveVoiceModal.classList.remove('hidden');
    elements.soundSpectrum.classList.remove('speaking');
    elements.liveStatusText.textContent = 'AXIOM Live متصل وجاهز';
    elements.liveTranscriptText.textContent = 'تحدث الآن... AXIOM يستمع إليك في محادثة مباشرة.';

    // Start listening
    if (state.speechRecognition) {
      try {
        state.speechRecognition.start();
      } catch (e) {
        console.warn(e);
      }
    }
  }

  function endLiveVoiceMode() {
    state.liveSessionActive = false;
    elements.liveVoiceModal.classList.add('hidden');
    if (state.speechRecognition) {
      state.speechRecognition.stop();
    }
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
  }

  function toggleLiveMute() {
    if (state.isRecording) {
      state.speechRecognition?.stop();
      elements.liveMuteBtn.style.opacity = '0.5';
      elements.liveStatusText.textContent = 'الميكروفون مكتوم';
    } else {
      state.speechRecognition?.start();
      elements.liveMuteBtn.style.opacity = '1';
      elements.liveStatusText.textContent = 'AXIOM Live يستمع';
    }
  }

  function handleLiveSpeechEnd() {
    if (!state.liveSessionActive) return;

    const userSpoken = elements.liveTranscriptText.textContent.trim();
    if (userSpoken && userSpoken !== 'تحدث الآن... AXIOM يستمع إليك في محادثة مباشرة.') {
      elements.liveStatusText.textContent = 'AXIOM يُفكر...';
      elements.soundSpectrum.classList.add('speaking');

      // AI spoken response
      setTimeout(() => {
        const reply = `أهلاً بك! لقد فهمت طلبك حول: "${userSpoken}". بصفتي مساعد AXIOM من TOLZY AI، أنا جاهز لتنفيذ كل ما يلزمك بدقة واحترافية.`;
        elements.liveTranscriptText.textContent = reply;
        elements.liveStatusText.textContent = 'AXIOM يتحدث الآن...';

        const utterance = new SpeechSynthesisUtterance(reply);
        utterance.lang = 'ar-SA';
        utterance.onend = () => {
          elements.soundSpectrum.classList.remove('speaking');
          elements.liveStatusText.textContent = 'AXIOM يستمع مجدداً...';
          // Listen again for natural back-and-forth
          if (state.liveSessionActive) {
            try { state.speechRecognition.start(); } catch (e) {}
          }
        };

        if ('speechSynthesis' in window) {
          window.speechSynthesis.speak(utterance);
        }
      }, 700);
    }
  }

  // Toast Notification Helper
  function showToast(message) {
    if (!elements.toastContainer) return;
    const toast = document.createElement('div');
    toast.className = 'toast-item';
    toast.innerHTML = `
      <span style="font-size:16px;">✨</span>
      <span>${message}</span>
    `;
    elements.toastContainer.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(-10px)';
      toast.style.transition = 'all 0.3s ease';
      setTimeout(() => toast.remove(), 300);
    }, 3200);
  }

  // Kickstart on DOM Content Loaded
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
