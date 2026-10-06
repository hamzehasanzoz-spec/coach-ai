export const roleLabel = (role) => (role === "admin" ? "مدير" : "طالب");

export function formatArabicDate(value, options = { day: "numeric", month: "long", year: "numeric" }) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleDateString("ar-EG-u-nu-latn", { ...options, timeZone: "UTC" });
}

export function daysUntil(value) {
  if (!value) return null;
  const target = new Date(`${value}T00:00:00Z`);
  if (Number.isNaN(target.getTime())) return null;
  const today = new Date();
  const start = Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate());
  return Math.round((target.getTime() - start) / 86400000);
}

export const STUDY_STYLES = [
  { value: "visual", label: "بصري — مخططات وصور" },
  { value: "auditory", label: "سمعي — شرح ومسموع" },
  { value: "reading", label: "قراءة وكتابة — ملخصات" },
  { value: "kinesthetic", label: "حركي — تطبيق وحالات" },
];

export const STUDY_TIMES = [
  { value: "early_morning", label: "الصباح الباكر" },
  { value: "morning", label: "الصباح" },
  { value: "afternoon", label: "بعد الظهر" },
  { value: "evening", label: "المساء" },
  { value: "late_night", label: "آخر الليل" },
];

export const studyStyleLabel = (value) =>
  STUDY_STYLES.find((style) => style.value === value)?.label ?? "—";

export const studyTimeLabel = (value) =>
  STUDY_TIMES.find((time) => time.value === value)?.label ?? value;

export function formatFileSize(bytes) {
  const size = Number(bytes);
  if (!Number.isFinite(size) || size <= 0) return "";
  if (size < 1024 * 1024) return `${Math.max(1, Math.round(size / 1024))} كيلوبايت`;
  return `${(size / (1024 * 1024)).toFixed(1)} ميغابايت`;
}