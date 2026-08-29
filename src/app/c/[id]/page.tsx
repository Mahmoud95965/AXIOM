'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import { ChatMainView } from '@/components/ChatMainView';

export default function ChatSlugPage() {
  const params = useParams();
  const chatId = typeof params?.id === 'string' ? params.id : Array.isArray(params?.id) ? params.id[0] : undefined;

  return <ChatMainView initialChatId={chatId} />;
}
