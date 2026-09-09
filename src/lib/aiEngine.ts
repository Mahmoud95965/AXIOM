export function generateAIPromptResponse(prompt: string, attachedImage: string | null, isWebSearch: boolean = false): string {
  const p = (prompt || '').toLowerCase();
  const modelName = 'AXIOM';

  if (attachedImage) {
    return `### 🔍 تحليل وفحص الصورة بواسطة ${modelName}

أهلاً بك! تم تحليل الصورة المرفقة واستخراج تفاصيلها الفنية بدقة:

#### 📋 الملاحظات والنتائج الرئيسية:
1. **التعرف البصري**: تم استخراج الهيكل الأساسي والمحتوى البصري والعناصر التصميمية.
2. **الأنماط والتكوين**: تباين متوازن وتوزيع متناسق للمساحات والألوان.
3. **التطبيق البرمجي**: يمكن تحويل هذا النموذج مباشرة إلى كود برمجي تفاعلي (React/Next.js).

هل ترغب في إنشاء المكون البرمجي لهذا التصميم؟`;
  }

  if (isWebSearch) {
    return `### 🌐 نتائج البحث المباشر عبر الإنترنت

تم استخراج أحدث البيانات والمعلومات الموثقة حول: **"${prompt}"**

#### 📌 أبرز الحقائق والمستجدات:
* **التحديثات الموثقة**: تشير المصادر الرسمية إلى تسارع وتيرة التطوير والتحسينات في هذا المجال.
* **التحليل والمقارنة**: توفر الحلول الحديثة كفاءة أعلى وسرعة معالجة محسّنة بأكثر من 40%.
* **التوصيات التنفيذية**: يفضل تطبيق أفضل الممارسات المعتمدة وتحديث بيئات التشغيل دورياً.

هل تود الاستفسار عن تفاصيل إضافية أو مصادر محددة؟`;
  }

  if (p.includes('كود') || p.includes('python') || p.includes('برمج') || p.includes('code') || p.includes('javascript') || p.includes('react') || p.includes('next') || p.includes('تطبيق') || p.includes('صفحة')) {
    return `### 💻 حل برمجي متكامل ومعماري عبر ${modelName}

يسعدني تزويدك بهذا الحل البرمجي المتكامل، المكتوب وفقاً لأحدث معايير الأداء والنظافة البرمجية (Clean Code):

\`\`\`typescript
import React, { useState, useEffect } from 'react';

interface AppState {
  status: 'idle' | 'loading' | 'success' | 'error';
  data: Array<{ id: string; title: string; active: boolean }>;
}

export const ModernDashboard: React.FC = () => {
  const [state, setState] = useState<AppState>({ status: 'idle', data: [] });

  useEffect(() => {
    // محاكاة جلب البيانات اللحظية
    setState({
      status: 'success',
      data: [
        { id: '1', title: 'مساحة العمل السحابية', active: true },
        { id: '2', title: 'تكاملات MCP المباشرة', active: true },
      ]
    });
  }, []);

  return (
    <div className="p-6 rounded-2xl bg-zinc-900 border border-zinc-800 text-white">
      <h2 className="text-lg font-bold mb-4">لوحة تحكم AXIOM</h2>
      <div className="space-y-2">
        {state.data.map((item) => (
          <div key={item.id} className="p-3 rounded-xl bg-zinc-800/50 flex justify-between items-center text-sm">
            <span>{item.title}</span>
            <span className="text-xs px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400">نشط</span>
          </div>
        ))}
      </div>
    </div>
  );
};
\`\`\`

#### 🚀 مميزات البناء البرمجي:
* **Strict TypeScript Types**: أمان عالي للأنواع البرمجية لمنع الأخطاء أثناء التشغيل.
* **Component Architecture**: تقسيم منطقي يسهل إعادة الاستخدام والتوسيع.
* **Responsive & Accessible**: توافق تام مع مختلف الشاشات ومعايير الـ UX.`;
  }

  return `### 💡 إجابة AXIOM • TOLZY AI

أهلاً بك! رداً على استفسارك: **"${prompt}"**

1. **التحليل المباشر**: تم فحص المعطيات وتقديم الحل الأمثل بناءً على أفضل الممارسات المعتمدة.
2. **الاستنتاج العملي**:
   - الحلول المقترحة تضمن سرعة في الإنجاز وكفاءة عالية في الأداء.
   - متوافقة تماماً مع منظومة التطوير السحابية الذكية.
3. **الخطوة التالية**: يمكنك سؤالي عن أي استفسار إضافي أو طلب كود برمجي متخصص لتنفيذه فوراً.`;
}
