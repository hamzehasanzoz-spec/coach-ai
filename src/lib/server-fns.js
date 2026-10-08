import { supabase } from './supabase';

// ==========================================
// 1. الخطة الدراسية (Study Plan)
// ==========================================

/**
 * جلب جميع بنود الخطة الدراسية الخاصة بالطالب الحالي
 */
export async function getStudyPlan() {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from('study_plan')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('خطأ في جلب الخطة الدراسية:', error);
    return [];
  }
  return data || [];
}

/**
 * إضافة بند جديد للخطة الدراسية
 */
export async function createStudyPlanItem({ data }) {
  const { title, subject, due_date } = data;
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('المستخدم غير مسجل الدخول');

  const { data: newItem, error } = await supabase
    .from('study_plan')
    .insert([
      {
        user_id: user.id,
        title: title.trim(),
        subject: subject ? subject.trim() : null,
        due_date: due_date || null,
        status: 'pending',
      },
    ])
    .select()
    .single();

  if (error) throw error;
  return newItem;
}

/**
 * تحديث حالة البند (منجز / قيد الانتظار)
 */
export async function setStudyPlanStatus({ data }) {
  const { id, status } = data;
  const { data: updatedItem, error } = await supabase
    .from('study_plan')
    .update({ status })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return updatedItem;
}

/**
 * حذف بند من الخطة الدراسية
 */
export async function deleteStudyPlanItem({ data }) {
  const { id } = data;
  const { error } = await supabase
    .from('study_plan')
    .delete()
    .eq('id', id);

  if (error) throw error;
  return { success: true };
}

// ==========================================
// 2. إحصائيات لوحة التحكم (Dashboard Stats)
// ==========================================

/**
 * جلب الإحصائيات العامة لتقدم الطالب في الامتحان الوطني
 */
export async function getDashboardStats() {
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return {
      answered: 0,
      accuracy: 0,
      conversations: 0,
      planDone: 0,
      planTotal: 0,
      target_exam_date: null,
    };
  }

  // 1. جلب تاريخ الامتحان من الملف الشخصي
  const { data: profile } = await supabase
    .from('profiles')
    .select('target_exam_date')
    .eq('id', user.id)
    .single();

  // 2. جلب بنود الخطة الدراسية وحساب الإنجاز
  const { data: plan } = await supabase
    .from('study_plan')
    .select('status')
    .eq('user_id', user.id);

  const planTotal = plan?.length || 0;
  const planDone = plan?.filter((p) => p.status === 'done').length || 0;

  // 3. جلب عدد المحادثات مع الذكاء الاصطناعي
  const { count: conversationsCount } = await supabase
    .from('conversations')
    .select('*', { count: 'exact', head: true })
    .eq('student_id', user.id);

  // 4. جلب إحصائيات بنك الأسئلة والمحاكاة
  const { data: answers } = await supabase
    .from('user_answers')
    .select('is_correct')
    .eq('user_id', user.id);

  const answered = answers?.length || 0;
  const correctCount = answers?.filter((a) => a.is_correct).length || 0;
  const accuracy = answered > 0 ? Math.round((correctCount / answered) * 100) : 0;

  return {
    answered,
    accuracy,
    conversations: conversationsCount || 0,
    planDone,
    planTotal,
    target_exam_date: profile?.target_exam_date || null,
  };
}

// ==========================================
// 3. نشاط الأسئلة الأسبوعي (Weekly Activity)
// ==========================================

/**
 * حساب عدد الأسئلة المحلولة يوماً بيوم لآخر 7 أيام
 */
export async function getActivityDaily() {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
  sevenDaysAgo.setHours(0, 0, 0, 0);

  const { data: answers } = await supabase
    .from('user_answers')
    .select('created_at')
    .eq('user_id', user.id)
    .gte('created_at', sevenDaysAgo.toISOString());

  // تجهيز الخريطة الزمانية للأيام السبعة
  const daysMap = {};
  for (let i = 0; i < 7; i++) {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    const dateStr = d.toISOString().split('T')[0];
    daysMap[dateStr] = 0;
  }

  (answers || []).forEach((a) => {
    const dateStr = new Date(a.created_at).toISOString().split('T')[0];
    if (daysMap[dateStr] !== undefined) {
      daysMap[dateStr]++;
    }
  });

  return Object.keys(daysMap).map((date) => ({
    date,
    count: daysMap[date],
  }));
}

// ==========================================
// 4. المحادثات الجارية مع كوتش AI
// ==========================================

/**
 * جلب أحدث المحادثات لعرضها في السجل
 */
export async function getRecentConversations() {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from('conversations')
    .select('id, title, updated_at')
    .eq('student_id', user.id)
    .order('updated_at', { ascending: false })
    .limit(10);

  if (error) {
    console.error('خطأ في جلب المحادثات:', error);
    return [];
  }

  return (data || []).map((c) => ({
    id: c.id,
    title: c.title || 'جلسة تدريب طبي',
    updated_date: c.updated_at,
  }));
}