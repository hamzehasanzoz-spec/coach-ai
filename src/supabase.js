import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('تنبيه: متغيرات بيئة Supabase غير معرفة بشكل صحيح في ملف .env.local');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);