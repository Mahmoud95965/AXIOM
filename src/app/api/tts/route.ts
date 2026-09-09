import { NextRequest, NextResponse } from 'next/server';
import * as sdk from 'microsoft-cognitiveservices-speech-sdk';
import { uploadAudioToAzureStorage } from '@/lib/azureStorage';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  try {
    const { text, voice, returnJson, userId } = await req.json();

    if (!text || typeof text !== 'string' || text.trim().length === 0) {
      return NextResponse.json({ error: 'النص المطلوب تحويله إلى صوت مطلوب وغير صالح' }, { status: 400 });
    }

    // Clean and sanitize markdown/code before speech synthesis
    const cleanText = text
      .replace(/```[\s\S]*?```/g, '') // remove large code blocks
      .replace(/`([^`]+)`/g, '$1') // remove inline code ticks
      .replace(/!\[[^\]]*\]\([^)]*\)/g, '') // remove images
      .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1') // convert markdown links to text
      .replace(/[#*`_~>]/g, '') // remove headers, bold, italics, blockquotes
      .replace(/\n+/g, ' ') // replace multiple newlines with spaces
      .trim();

    if (!cleanText) {
      return NextResponse.json({ error: 'لا يوجد نص قابل للقراءة الصوتية' }, { status: 400 });
    }

    const speechEndpoint = process.env.AZURE_SPEECH_ENDPOINT?.trim() || 'https://mahmoudmuhammad212024-3775-resou.cognitiveservices.azure.com/';
    const speechKey = process.env.AZURE_SPEECH_KEY?.trim() || '';

    if (!speechKey) {
      return NextResponse.json({ error: 'مفتاح خدمة تحويل النص إلى كلام AXIOM-Voice غير مهيأ' }, { status: 500 });
    }

    // Determine voice: default to AXIOM-Voice (Ethan MAI-Voice-2) or requested voice
    const isArabic = /[\u0600-\u06FF]/.test(cleanText);
    const requestedVoice = voice || (isArabic ? 'ar-SA-HamedNeural' : (process.env.AZURE_SPEECH_DEFAULT_VOICE || 'en-US-Ethan:MAI-Voice-2'));

    // Configure Azure Speech SDK
    let speechConfig: sdk.SpeechConfig;
    try {
      speechConfig = sdk.SpeechConfig.fromEndpoint(new URL(speechEndpoint), speechKey);
    } catch (endpointErr) {
      speechConfig = sdk.SpeechConfig.fromSubscription(speechKey, 'eastus');
    }

    speechConfig.speechSynthesisVoiceName = requestedVoice;
    speechConfig.speechSynthesisOutputFormat = sdk.SpeechSynthesisOutputFormat.Riff24Khz16BitMonoPcm;

    // Use Pull Stream for in-memory audio output
    const pullStream = sdk.AudioOutputStream.createPullStream();
    const audioConfig = sdk.AudioConfig.fromStreamOutput(pullStream);
    const synthesizer = new sdk.SpeechSynthesizer(speechConfig, audioConfig);

    const audioBuffer = await new Promise<Buffer>((resolve, reject) => {
      synthesizer.speakTextAsync(
        cleanText,
        (result) => {
          if (result.reason === sdk.ResultReason.SynthesizingAudioCompleted) {
            synthesizer.close();
            resolve(Buffer.from(result.audioData));
          } else {
            const errorDetails = result.errorDetails || 'فشل توليد الصوت من نموذج AXIOM-Voice';
            synthesizer.close();
            reject(new Error(errorDetails));
          }
        },
        (error) => {
          synthesizer.close();
          reject(error);
        }
      );
    });

    // If client requested JSON response (for in-chat card rendering)
    if (returnJson || req.headers.get('accept')?.includes('application/json')) {
      let finalAudioUrl: string | null = null;

      // Try uploading to Azure Blob Storage
      try {
        finalAudioUrl = await uploadAudioToAzureStorage(audioBuffer, userId);
      } catch (uploadErr) {
        console.warn('Azure Storage audio upload notice:', uploadErr);
      }

      // Fallback to data URL if cloud storage isn't connected
      if (!finalAudioUrl) {
        finalAudioUrl = `data:audio/wav;base64,${audioBuffer.toString('base64')}`;
      }

      return NextResponse.json({
        success: true,
        audioUrl: finalAudioUrl,
        prompt: cleanText,
        model: 'AXIOM-Voice',
        voice: requestedVoice,
        size: audioBuffer.byteLength
      });
    }

    // Default binary audio response
    return new Response(new Uint8Array(audioBuffer), {
      status: 200,
      headers: {
        'Content-Type': 'audio/wav',
        'Content-Length': audioBuffer.byteLength.toString(),
        'Cache-Control': 'public, max-age=86400',
      },
    });

  } catch (error: any) {
    console.error('TTS Route Error:', error?.message || error);
    return NextResponse.json(
      { error: error?.message || 'حدث خطأ أثناء معالجة وتحويل الصوت' },
      { status: 500 }
    );
  }
}
