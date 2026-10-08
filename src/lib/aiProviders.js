// src/lib/aiProviders.js
import { GoogleGenerativeAI } from '@google/generative-ai';
import Groq from 'groq-sdk';

const providers = [
  {
    name: 'gemini',
    call: async (prompt, systemPrompt) => {
      const apiKey = import.meta.env.VITE_GEMINI_KEY;
      if (!apiKey) throw new Error('مفتاح GEMINI غير محدد');
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({
        model: 'gemini-1.5-flash',
        systemInstruction: systemPrompt,
      });
      const result = await model.generateContent(prompt);
      return result.response.text();
    },
  },
  {
    name: 'groq',
    call: async (prompt, systemPrompt) => {
      const apiKey = import.meta.env.VITE_GROQ_KEY;
      if (!apiKey) throw new Error('مفتاح GROQ غير محدد');
      const groq = new Groq({ apiKey, dangerouslyAllowBrowser: true });
      const chat = await groq.chat.completions.create({
        model: 'llama-3.3-70b-versatile',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: prompt },
        ],
      });
      return chat.choices[0].message.content;
    },
  },
  {
    name: 'openrouter',
    call: async (prompt, systemPrompt) => {
      const apiKey = import.meta.env.VITE_OPENROUTER_KEY;
      if (!apiKey) throw new Error('مفتاح OPENROUTER غير محدد');
      const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'meta-llama/llama-3.3-70b-instruct:free',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: prompt },
          ],
        }),
      });
      if (!res.ok) throw new Error(`OpenRouter status: ${res.status}`);
      const data = await res.json();
      return data.choices[0].message.content;
    },
  },
  {
    name: 'mistral',
    call: async (prompt, systemPrompt) => {
      const apiKey = import.meta.env.VITE_MISTRAL_KEY;
      if (!apiKey) throw new Error('مفتاح MISTRAL غير محدد');
      const res = await fetch('https://api.mistral.ai/v1/chat/completions', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'mistral-small-latest',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: prompt },
          ],
        }),
      });
      if (!res.ok) throw new Error(`Mistral status: ${res.status}`);
      const data = await res.json();
      return data.choices[0].message.content;
    },
  },
];

/**
 * تنفيذ الطلب مع الانتقال للمزود التالي في حال حدوث خطأ أو تجاوز الحصة
 */
export async function askAI(prompt, systemPrompt) {
  const errors = [];

  for (const provider of providers) {
    try {
      const result = await provider.call(prompt, systemPrompt);
      return { text: result, provider: provider.name };
    } catch (err) {
      console.warn(`فشل المزود ${provider.name}:`, err.message);
      errors.push(`${provider.name}: ${err.message}`);
      continue;
    }
  }

  throw new Error(`تعذر الحصول على رد من جميع المزودات المتاحة:\n${errors.join('\n')}`);
}
```[cite: 31]

---

### 2️⃣ محرك البحث واسترجاع المراجع الطبيّة (`src/lib/rag.js`)

يقوم الملف بربط سؤال الطالب بالمحاضرات وملفات الأسئلة المرفوعة في قاعدة البيانات[cite: 31]. يتم استخدام نموذج **Cohere Multilingual v3.0** لتحويل النص إلى متجه عددي (Embedding) بجودة عالية للنصوص العربية الطبية[cite: 31].

```javascript
// src/lib/rag.js
import { supabase } from './supabase.js';
import { askAI } from './aiProviders';

const SYSTEM_PROMPT = `أنت "كوتش AI" - المساعد الطبي المخصص لطلاب الطب البشري المتقدمين للامتحان الوطني الموحد في سوريا.

قواعد صارمة للإجابة:
1. أجب فقط استناداً إلى المقتطفات المرفقة من ملفات ومحاضرات الطالب.
2. إذا لم تجد الإجابة في المقتطفات، قل بوضوح: "لم أجد هذه المعلومة في موادك الدراسية المرفوعة حالياً."
3. لا تقم بتأليف أو اختلاق أي معلومة طبية خارج النص المرفق.
4. اتبع أسلوب شرح مبسط، وادعم الإجابات بالنكات السريرة أو النقاط المفتاحية بنمط الامتحان الوطني.`;

/**
 * تحويل السؤال إلى Vector Embedding عبر Cohere API
 */
async function getEmbedding(text) {
  const apiKey = import.meta.env.VITE_COHERE_KEY;
  if (!apiKey) throw new Error('مفتاح COHERE غير محدد');

  const res = await fetch('https://api.cohere.com/v1/embed', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      texts: [text],
      model: 'embed-multilingual-v3.0',
      input_type: 'search_query',
    }),
  });

  if (!res.ok) throw new Error(`Cohere status: ${res.status}`);
  const data = await res.json();
  return data.embeddings[0];
}

/**
 * الاستعلام عن المرجع الطبي والإجابة باستخدام RAG
 */
export async function askCoachAI(question, studentId) {
  // 1. حساب المتجه العددي للسؤال
  const embedding = await getEmbedding(question);

  // 2. البحث عن أقرب 5 مقتطفات من محاضرات الطالب في Supabase
  const { data: chunks, error } = await supabase.rpc('match_materials', {
    query_embedding: embedding,
    match_student_id: studentId,
    match_count: 5,
  });

  if (error) console.error('خطأ في استعلام البحث المتجهي:', error);

  // 3. الاعتذار في حال عدم وجود نتائج مطابقة
  if (!chunks || chunks.length === 0) {
    return {
      text: 'لم أجد هذه المعلومة في موادك الدراسية. حاول رفع المحاضرة أو الملف المصدري الذي يغطي هذا الموضوع.',
      source: 'no_context',
    };
  }

  // 4. تجميع السياق وتجهيز الـ Prompt الموجه
  const context = chunks.map((c, i) => `[المقتطف الطبي ${i + 1}]\n${c.content}`).join('\n\n');
  const fullPrompt = `سؤال الطالب: ${question}\n\nالمقتطفات المرجعية المتاحة:\n${context}`;

  // 5. التمرير لمحرك الذكاء الاصطناعي مع دعم Failover
  return await askAI(fullPrompt, SYSTEM_PROMPT);
}
```[cite: 31]

---

### 3️⃣ السكربت البرمجي لقاعدة البيانات المتجهية (Supabase pgvector)

تفعيل الإضافة وإنشاء جدول التخزين ودالة المطابقة بواسطة تشغيل السكربت التالي في **SQL Editor** داخل Supabase[cite: 31]:

```sql
-- 1. تفعيل إضافة pgvector
CREATE EXTENSION IF NOT EXISTS vector;

-- 2. جدول أجزاء المحاضرات مع عمود المتجه العددي (1024 بُعداً لنموذج Cohere)
CREATE TABLE IF NOT EXISTS material_chunks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  material_id UUID REFERENCES materials(id) ON DELETE CASCADE,
  student_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  content TEXT,
  embedding vector(1024),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. بناء فهرس IVFFlat للبحث السريع بنسبة تشابه الكوساين (Cosine Similarity)
CREATE INDEX IF NOT EXISTS material_chunks_embedding_idx
  ON material_chunks
  USING ivfflat (embedding vector_cosine_ops)
  WITH (lists = 100);

-- 4. دالة المطابقة واستخراج المقتطفات الطبية الخاصة بالطالب
CREATE OR REPLACE FUNCTION match_materials(
  query_embedding vector(1024),
  match_student_id UUID,
  match_count INT DEFAULT 5
) RETURNS TABLE (content TEXT, similarity FLOAT) AS $$
BEGIN
  RETURN QUERY
  SELECT mc.content, (1 - (mc.embedding <=> query_embedding))::FLOAT AS similarity
  FROM material_chunks mc
  WHERE mc.student_id = match_student_id
  ORDER BY mc.embedding <=> query_embedding
  LIMIT match_count;
END;
$$ LANGUAGE plpgsql;
```[cite: 31]

---

### 🔑 المتغيرات الواجب إضافتها لملف `.env.local`:
```env
VITE_GEMINI_KEY=xxxx
VITE_GROQ_KEY=xxxx
VITE_OPENROUTER_KEY=xxxx
VITE_MISTRAL_KEY=xxxx
VITE_COHERE_KEY=xxxx
```[cite: 31]

ما هو الجزء القادم الذي تود الانتقال لمراجعته أو تطبيقه فوراً؟