import { useRef, useState } from "react";
import { useRouter } from "@tanstack/react-router";
import { FileUp, Loader2, Paperclip } from "lucide-react";
import { toast } from "sonner";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { addStudyMaterial } from "@/lib/server-fns";

const MAX_SIZE = 25 * 1024 * 1024;
const ACCEPTED = ["pdf", "doc", "docx", "txt"];

export default function MaterialUploader() {
  const router = useRouter();
  const inputRef = useRef(null);
  const [file, setFile] = useState(null);
  const [busy, setBusy] = useState(false);

  async function upload(event) {
    event.preventDefault();
    if (!file || busy) return;

    const type = file.name.includes(".") ? file.name.split(".").pop().toLowerCase() : "";
    if (!ACCEPTED.includes(type)) {
      toast.error("الصيغ المدعومة: PDF، Word، أو ملف نصي.");
      return;
    }
    if (file.size > MAX_SIZE) {
      toast.error("حجم الملف كبير — الحد الأقصى ٢٥ ميغابايت.");
      return;
    }

    setBusy(true);
    try {
      const { file_uri } = await base44.integrations.Core.UploadPrivateFile({ file });
      await addStudyMaterial({ data: { name: file.name, file_uri, file_type: type, size: file.size } });
      setFile(null);
      if (inputRef.current) inputRef.current.value = "";
      await router.invalidate();
      toast.success("تم رفع الملف إلى مكتبتك.");
    } catch {
      toast.error("تعذّر رفع الملف. حاول مرة أخرى.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={upload} className="space-y-2">
      <div className="flex flex-wrap items-center gap-3">
        <label className="flex h-12 min-w-52 flex-1 cursor-pointer items-center gap-2 rounded-2xl border border-dashed border-border px-4 text-sm text-muted-foreground transition-colors hover:border-primary hover:text-primary">
          <Paperclip className="h-4 w-4 shrink-0" aria-hidden="true" />
          {file ? <span className="truncate text-foreground">{file.name}</span> : "اختر ملفاً من جهازك"}
          <input
            ref={inputRef}
            type="file"
            accept=".pdf,.doc,.docx,.txt"
            className="hidden"
            onChange={(event) => setFile(event.target.files?.[0] ?? null)}
          />
        </label>

        <Button type="submit" disabled={!file || busy} className="h-12 shrink-0 gap-2 rounded-2xl">
          {busy ? (
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
          ) : (
            <FileUp className="h-4 w-4" aria-hidden="true" />
          )}
          {busy ? "جارٍ الرفع..." : "رفع الملف"}
        </Button>
      </div>
      <p className="text-xs text-muted-foreground">الصيغ المدعومة: PDF، Word (doc/docx)، أو ملف نصي — بحد أقصى ٢٥ ميغابايت.</p>
    </form>
  );
}