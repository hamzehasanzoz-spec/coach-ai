import { useState } from "react";
import { Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const SUGGESTED = [
  "تشريح",
  "فسيولوجيا",
  "باثولوجيا",
  "فارماكولوجيا",
  "ميكروبيولوجيا",
  "باطنة",
  "جراحة",
  "أطفال",
  "نساء وتوليد",
  "طب شرعي",
];

export default function SubjectTags({ subjects, onChange }) {
  const [draft, setDraft] = useState("");

  function add(raw) {
    const value = raw.trim().replace(/[،,]+$/, "");
    if (!value || subjects.includes(value) || subjects.length >= 20) return;
    onChange([...subjects, value]);
    setDraft("");
  }

  const suggestions = SUGGESTED.filter((subject) => !subjects.includes(subject)).slice(0, 8);

  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        <Input
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter" || event.key === "," || event.key === "،") {
              event.preventDefault();
              add(draft);
            }
          }}
          placeholder="اكتب مادة ثم اضغط Enter"
          className="h-11 rounded-xl border-border bg-background"
        />
        <Button type="button" variant="outline" onClick={() => add(draft)} className="h-11 shrink-0 gap-1 rounded-xl">
          <Plus className="h-4 w-4" aria-hidden="true" />
          إضافة
        </Button>
      </div>

      {subjects.length > 0 && (
        <ul className="flex flex-wrap gap-2">
          {subjects.map((subject) => (
            <li
              key={subject}
              className="flex items-center gap-2 rounded-full bg-secondary px-3 py-1 text-sm font-medium text-secondary-foreground"
            >
              {subject}
              <button
                type="button"
                aria-label={`حذف ${subject}`}
                onClick={() => onChange(subjects.filter((item) => item !== subject))}
                className="text-muted-foreground transition-colors hover:text-destructive"
              >
                <X className="h-3.5 w-3.5" aria-hidden="true" />
              </button>
            </li>
          ))}
        </ul>
      )}

      {suggestions.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {suggestions.map((subject) => (
            <button
              key={subject}
              type="button"
              onClick={() => add(subject)}
              className="rounded-full border border-dashed border-border px-3 py-1 text-xs text-muted-foreground transition-colors hover:border-primary hover:text-primary"
            >
              {subject}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}