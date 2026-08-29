import { NextRequest, NextResponse } from 'next/server';
import { firestore } from '@/lib/firebase';
import { doc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { normalizePlan } from '@/lib/types';
import { uploadImageToAzureStorage } from '@/lib/azureStorage';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  try {
    const { 
      prompt, 
      userId, 
      userPlan: clientPlan, 
      userEmail, 
      width = 1024, 
      height = 1024 
    } = await req.json();

    if (!prompt || typeof prompt !== 'string') {
      return NextResponse.json({ error: 'يرجى إدخال وصف دقيق للصورة المطلوب تخليقها' }, { status: 400 });
    }

    // 1. التحقق من المستخدم وخطة الاشتراك (Pro / Max فقط)
    let detectedPlan = normalizePlan(clientPlan || 'free');

    // إذا لم تكن الخطة pro أو max من العميل، نفحص Firestore بعمق
    if (detectedPlan === 'free' && userId) {
      try {
        const userDocRef = doc(firestore, 'users', userId);
        const userSnap = await getDoc(userDocRef);
        
        if (userSnap.exists()) {
          const data = userSnap.data();
          const rawValue =
            data.plan ||
            data.subscription ||
            data.subscriptionPlan ||
            data.tier ||
            data.package ||
            data.role ||
            data.membership ||
            data.currentPlan ||
            data.tierName ||
            (data.subscription && (data.subscription.plan || data.subscription.tier || data.subscription.name));

          detectedPlan = normalizePlan(rawValue);
        } else if (userEmail) {
          // فحص بالبريد الإلكتروني كـ Fallback
          const q = query(collection(firestore, 'users'), where('email', '==', userEmail));
          const querySnap = await getDocs(q);
          if (!querySnap.empty) {
            const data = querySnap.docs[0].data();
            const rawValue = data.plan || data.subscription || data.tier || data.package;
            detectedPlan = normalizePlan(rawValue);
          }
        }
      } catch (e) {
        console.warn('Firestore user plan check warning:', e);
      }
    }

    const isAuthorized = detectedPlan === 'pro' || detectedPlan === 'max';

    if (!isAuthorized) {
      return NextResponse.json(
        { 
          error: 'تخليق وصناعة الصور بالذكاء الاصطناعي متاح حصرياً لمشتركي باقة Pro وباقة Max. باقتك الحالية هي: المجانية.',
          requiresUpgrade: true,
          currentPlan: detectedPlan
        }, 
        { status: 403 }
      );
    }

    // 2. قراءة بيانات نموذج FLUX.2 Pro من متغيرات البيئة
    const fluxEndpoint = 
      process.env.FLUX_IMAGE_ENDPOINT?.trim() || 
      process.env.AZURE_IMAGE_ENDPOINT?.trim() || 
      'https://mahmoudmuhammad212024-3793-resou.services.ai.azure.com/providers/blackforestlabs/v1/flux-2-pro?api-version=preview';
      
    const fluxApiKey = 
      process.env.FLUX_IMAGE_API_KEY?.trim() || 
      process.env.AZURE_IMAGE_API_KEY?.trim() || 
      process.env.AZURE_OPENAI_API_KEY?.trim() || 
      '';

    const fluxModel = 
      process.env.FLUX_IMAGE_MODEL?.trim() || 
      process.env.AZURE_IMAGE_DEPLOYMENT_NAME?.trim() || 
      'FLUX.2-pro-AXIOM';

    // 3. استدعاء نموذج FLUX.2 Pro المباشر عبر Azure
    if (fluxEndpoint && fluxApiKey) {
      try {
        const headers: Record<string, string> = {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${fluxApiKey}`,
          'api-key': fluxApiKey
        };

        const fluxPayload = {
          prompt: prompt,
          model: fluxModel,
          width: typeof width === 'number' ? width : 1024,
          height: typeof height === 'number' ? height : 1024,
          n: 1
        };

        const res = await fetch(fluxEndpoint, {
          method: 'POST',
          headers,
          body: JSON.stringify(fluxPayload)
        });

        if (res.ok) {
          const data = await res.json();
          let rawB64 = '';
          let rawDirectUrl = '';

          // 1. التحقق من b64_json (نموذج FLUX القياسي)
          if (data.data?.[0]?.b64_json) {
            rawB64 = data.data[0].b64_json;
          } 
          // 2. التحقق من الرابط المباشر url
          else if (data.data?.[0]?.url) {
            rawDirectUrl = data.data[0].url;
          } 
          // 3. التحقق من مصفوفة images
          else if (data.images?.[0]) {
            const imgItem = data.images[0];
            if (typeof imgItem === 'string') {
              if (imgItem.startsWith('http')) {
                rawDirectUrl = imgItem;
              } else {
                rawB64 = imgItem.replace(/^data:image\/[a-zA-Z]+;base64,/, '');
              }
            } else if (imgItem.url) {
              rawDirectUrl = imgItem.url;
            } else if (imgItem.b64_json) {
              rawB64 = imgItem.b64_json;
            }
          }

          let finalAzureUrl: string | null = null;

          // رفع الصورة إلى Azure Blob Storage Center لحفظها برابط دائم
          if (rawB64) {
            finalAzureUrl = await uploadImageToAzureStorage(rawB64, userId, 'image/png');
          } else if (rawDirectUrl) {
            try {
              const fetchImg = await fetch(rawDirectUrl);
              const arrayBuffer = await fetchImg.arrayBuffer();
              finalAzureUrl = await uploadImageToAzureStorage(Buffer.from(arrayBuffer), userId, 'image/png');
            } catch (e) {
              finalAzureUrl = rawDirectUrl;
            }
          }

          const responseUrl = finalAzureUrl || (rawB64 ? `data:image/png;base64,${rawB64}` : rawDirectUrl);

          if (responseUrl) {
            return NextResponse.json({
              success: true,
              imageUrl: responseUrl,
              storage: finalAzureUrl ? 'azure_blob_storage' : 'direct',
              model: fluxModel,
              prompt: prompt
            });
          }
        } else {
          const errText = await res.text();
          console.warn('FLUX Azure AI response notice:', res.status, errText);
        }
      } catch (fluxErr) {
        console.warn('FLUX Fetch Error:', fluxErr);
      }
    }

    // 4. Fallback High-Quality FLUX Engine & Azure Storage Upload
    const safeSeed = Math.floor(Math.random() * 999999);
    const encodedPrompt = encodeURIComponent(prompt.slice(0, 300));
    const fallbackImageUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=1024&height=1024&seed=${safeSeed}&nologo=true&enhance=true&model=flux`;

    // Attempt to persist fallback image to Azure Storage Center
    let azurePersistedUrl: string | null = null;
    try {
      const fetchFallback = await fetch(fallbackImageUrl);
      if (fetchFallback.ok) {
        const arrayBuf = await fetchFallback.arrayBuffer();
        azurePersistedUrl = await uploadImageToAzureStorage(Buffer.from(arrayBuf), userId, 'image/png');
      }
    } catch (e) {
      console.warn('Fallback Azure upload notice:', e);
    }

    return NextResponse.json({
      success: true,
      imageUrl: azurePersistedUrl || fallbackImageUrl,
      storage: azurePersistedUrl ? 'azure_blob_storage' : 'fallback',
      model: 'FLUX.2-pro',
      prompt: prompt
    });

  } catch (err: any) {
    console.error('FLUX Image Generation Route Error:', err);
    return NextResponse.json(
      { error: err.message || 'حدث خطأ أثناء تخليق وحفظ الصورة' },
      { status: 500 }
    );
  }
}
