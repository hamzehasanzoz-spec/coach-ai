import { useRef, useState } from "react";
import { FileUp, Paperclip } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function NotesForm({ busy, onNotes }) {
  const [title, setTitle] = useState("");
  const [file, setFile] = useState(null);
  const inputRef = useRef(null);

  async function submit() {
    if (!file || busy) return;
    const name = title.trim() || file.name.replace(/\.[^.]+$/, "");
    setTitle("");
    setFile(null);
    if (inputRef.current) inputRef.current.value = "";
    await onNotes(file, name);
  }

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        submit();
      }}
      className="space-y-2"
    >
      <div className="flex flex-wrap items-center gap-2">
        <Input
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          placeholder="عنوان الملاحظات (اختياري)"
          className="h-12 min-w-40 flex-1 rounded-2xl border-border bg-background"
        />

        <label className="flex h-12 cursor-pointer items-center gap-2 rounded-2xl border border-dashed border-border px-4 text-sm text-muted-foreground transition-colors hover:border-primary hover:text-primary">
          <Paperclip className="h-4 w-4" aria-hidden="true" />
          {file ? <span className="max-w-40 truncate text-foreground">{file.name}</span> : "اختر ملفاً"}
          <input
            ref={inputRef}
            type="file"
            accept=".pdf,.png,.jpg,.jpeg,.webp,.txt,.md"
            className="hidden"
            onChange={(event) => setFile(event.target.files?.[0] ?? null)}
          />
        </label>

        <Button type="submit" disabled={busy || !file} className="h-12 shrink-0 gap-2 rounded-2xl">
          <FileUp className="h-4 w-4" aria-hidden="true" />
          لخّص الملف
        </Button>
      </div>
      <p className="text-xs text-muted-foreground">الصيغ المدعومة: PDF، صور، أو ملف نصي — بحد أقصى ٢٥ ميغابايت.</p>
    </form>
  );
}