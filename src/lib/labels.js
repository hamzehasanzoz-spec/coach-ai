export function roleLabel(role) {
  if (role === "admin") return "مدير";
  return "طالب";
}

export function formatArabicDate(dateStr, options) {
  if (!dateStr) return "";
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return dateStr;
  return new Intl.DateTimeFormat("ar-SY", options || { day: "numeric", month: "long", year: "numeric" }).format(date);
}

export function daysUntil(targetDateStr) {
  if (!targetDateStr) return null;
  const target = new Date(targetDateStr);
  const now = new Date();
  const diffTime = target - now;
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}
export function studyStyleLabel(style) {
  const map = {
    visual: "بصري (خرائط ذهنية وتخطيط)",
    auditory: "سمعي (تسجيلات ومحاضرات)",
    reading: "قراءة ونصوص مكثفة",
    practical: "عملي وحل أسئلة دورات",
  };
  return map[style] || style || "غير محدد";
}

export function studyTimeLabel(time) {
  const map = {
    morning: "الصباح الباكر",
    afternoon: "فترة بعد الظهر",
    evening: "المساء",
    night: "وقت متأخر من الليل",
  };
  return map[time] || time || "مرن";
}

export function formatFileSize(bytes) {
  if (!bytes || bytes === 0) return "0 بايت";
  const k = 1024;
  const sizes = ["بايت", "كيلوبايت", "ميجابايت", "جيجابايت"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
}
export const STUDY_STYLES = [
  { id: "visual", label: "بصري (خرائط ذهنية وتخطيط)" },
  { id: "auditory", label: "سمعي (تسجيلات ومحاضرات)" },
  { id: "reading", label: "قراءة ونصوص مكثفة" },
  { id: "practical", label: "عملي وحل أسئلة دورات" }
];

export const STUDY_TIMES = [
  { id: "morning", label: "الصباح الباكر" },
  { id: "afternoon", label: "فترة بعد الظهر" },
  { id: "evening", label: "المساء" },
  { id: "night", label: "وقت متأخر من الليل" }
];