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