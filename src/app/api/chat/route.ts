import { NextRequest, NextResponse } from 'next/server';
import { generateAIPromptResponse } from '@/lib/aiEngine';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  try {
    const { messages, attachedImage, isWebSearch, userId } = await req.json();

    const rawEndpoint = process.env.AZURE_OPENAI_ENDPOINT?.trim().replace(/\/+$/, '') || '';
    const apiKey = process.env.AZURE_OPENAI_API_KEY?.trim() || '';
    const deploymentName = process.env.AZURE_OPENAI_DEPLOYMENT_NAME?.trim() || 'AXIOM-V2';
    const apiVersion = process.env.AZURE_OPENAI_API_VERSION?.trim() || '2024-08-01-preview';

    const lastMessage = messages[messages.length - 1];
    const promptText = typeof lastMessage?.content === 'string' ? lastMessage.content : '';

    // Fallback إذا لم تكن مفاتيح Azure متاحة
    if (!rawEndpoint || !apiKey) {
      const fallbackResponse = generateAIPromptResponse(promptText, attachedImage, isWebSearch);
      return streamCustomText(fallbackResponse);
    }

    // إعداد الـ System Prompt القوي والاحترافي لـ AXIOM V2
    const systemPrompt = {
      role: 'system',
      content: `أنت AXIOM V2، المساعد الذكي وكبير مهندسي البرمجيات المعماريين (Senior Principal AI Architect) لمنظومة TOLZY AI.

### 🌟 المبادئ الجوهرية وطريقة العمل:
1. **الدقة والاحترافية الفائقة**:
   - قدم إجابات مباشرة، عميقة، خالية من الحشو والاعتذارات المتكررة.
   - حلل المسائل المعقدة بخطوات منطقية ومنظمة.
2. **كتابة كود برمجي متكامل ونظيف (Production-Ready Clean Code)**:
   - اكتب أكواداً برمجية كاملة، آمنة، ومبنية بأحدث المعايير (TypeScript, React, Next.js, Python, Tailwind CSS).
   - ضع أسماء واضحة للمتغيرات والدوال، واستخدم أنواع البيانات الصارمة (Strict Types) وعالج الحالات الشاذة (Edge Cases).
3. **التنسيق البصري الأنيق (Markdown Formatting)**:
   - نسق النصوص باستخدام عناوين واضحة، قوائم نقطية، وجداول مقارنة عند الحاجة.
4. **الفصاحة اللغوية**:
   - تحدث بلغة عربية فصحى راقية وسلسة، أو باللغة الإنجليزية حسب لغة المستخدم.`
    };

    // تجهيز آخر 6 رسائل
    const recentMessages = messages.slice(-6);
    const formattedMessages: any[] = [systemPrompt];

    for (let i = 0; i < recentMessages.length; i++) {
      const msg = recentMessages[i];
      const isLast = i === recentMessages.length - 1;

      if (isLast && attachedImage) {
        formattedMessages.push({
          role: msg.role,
          content: [
            { type: 'text', text: msg.content || 'يرجى تحليل هذه الصورة' },
            {
              type: 'image_url',
              image_url: { url: attachedImage }
            }
          ]
        });
      } else {
        formattedMessages.push({
          role: msg.role,
          content: msg.content
        });
      }
    }

    // إعداد ترويسات الطلب المباشر
    let azureUrl = '';
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'api-key': apiKey,
      'Authorization': `Bearer ${apiKey}`,
    };

    if (userId) {
      headers['x-user-id'] = userId;
    }

    if (rawEndpoint.includes('services.ai.azure.com')) {
      const urlObj = new URL(rawEndpoint);
      azureUrl = `${urlObj.origin}/openai/v1/chat/completions`;
    } else if (rawEndpoint.endsWith('/v1')) {
      azureUrl = `${rawEndpoint}/chat/completions`;
    } else {
      azureUrl = `${rawEndpoint}/openai/deployments/${deploymentName}/chat/completions?api-version=${apiVersion}`;
    }

    // إرسال الطلب إلى Azure
    const azureRes = await fetch(azureUrl, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        model: deploymentName,
        messages: formattedMessages,
        stream: true,
        max_tokens: 1800,
        temperature: 0.7,
      }),
    });

    if (!azureRes.ok) {
      const errText = await azureRes.text();
      console.error('Azure API error:', azureRes.status, errText);

      if (azureRes.status === 429) {
        const rateLimitNotice = `> ⚠️ **ملاحظة:** تم استهلاك الحصة اللحظية للنموذج في Azure.
> تم توليد الإجابة الحالية عبر **AXIOM V2 Engine** لتفادي التوقف، وتتجدد الحصة تلقائياً.

---

` + generateAIPromptResponse(promptText, attachedImage, isWebSearch);

        return streamCustomText(rateLimitNotice);
      }

      return NextResponse.json(
        { error: `Azure API Error (${azureRes.status}): ${errText}` },
        { status: azureRes.status }
      );
    }

    if (!azureRes.body) {
      return NextResponse.json({ error: 'لا يوجد رد من سيرفر Azure' }, { status: 500 });
    }

    return handleStreamResponse(azureRes.body);

  } catch (error: any) {
    console.error('Chat API Handler Error:', error);
    return NextResponse.json(
      { error: error.message || 'حدث خطأ أثناء معالجة الطلب في الخادم' },
      { status: 500 }
    );
  }
}

function streamCustomText(text: string) {
  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      const chunkSize = 8;
      for (let i = 0; i < text.length; i += chunkSize) {
        const chunk = text.slice(i, i + chunkSize);
        controller.enqueue(encoder.encode(chunk));
        await new Promise((r) => setTimeout(r, 16));
      }
      controller.close();
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Transfer-Encoding': 'chunked',
    },
  });
}

function handleStreamResponse(body: ReadableStream<Uint8Array>) {
  const encoder = new TextEncoder();
  const decoder = new TextDecoder('utf-8');

  const stream = new ReadableStream({
    async start(controller) {
      const reader = body.getReader();
      let buffer = '';

      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split('\n');
          buffer = lines.pop() || '';

          for (const line of lines) {
            const trimmed = line.trim();
            if (!trimmed || trimmed.startsWith(':')) continue;

            if (trimmed === 'data: [DONE]') {
              controller.close();
              return;
            }

            if (trimmed.startsWith('data: ')) {
              try {
                const jsonStr = trimmed.substring(6);
                const parsed = JSON.parse(jsonStr);
                const content = parsed.choices?.[0]?.delta?.content;
                if (content) {
                  controller.enqueue(encoder.encode(content));
                }
              } catch (e) {}
            }
          }
        }

        controller.close();
      } catch (err) {
        controller.error(err);
      }
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Transfer-Encoding': 'chunked',
      'Cache-Control': 'no-cache',
    },
  });
}
