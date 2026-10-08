/**
 * تنسيق التواريخ باللغة العربية
 */
export function formatArabicDate(dateInput, options = {}) {
  if (!dateInput) return '';
  const date = new Date(dateInput);
  if (isNaN(date.getTime())) return '';

  const defaultOptions = {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    ...options
  };

  return new Intl.DateTimeFormat('ar-SY', defaultOptions).format(date);
}

/**
 * حساب الأيام المتبقية حتى موعد الامتحان الوطني
 */
export function daysUntil(targetDateInput) {
  if (!targetDateInput) return null;
  const target = new Date(targetDateInput);
  if (isNaN(target.getTime())) return null;

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  target.setHours(0, 0, 0, 0);

  const diffTime = target.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  return diffDays;
}