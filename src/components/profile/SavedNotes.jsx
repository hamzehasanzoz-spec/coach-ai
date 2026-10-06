import { useRouter } from "@tanstack/react-router";
import { ExternalLink, FileText, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { formatArabicDate } from "@/lib/labels";
import { deleteMyNote } from "@/lib/server-fns";

export default function SavedNotes({ notes }) {
  const router = useRouter();

  async function openNote(note) {
    try {
      const { signed_url } = await base44.integrations.Core.CreateFileSignedUrl({ file_uri: note.file_uri });
      window.open(signed_url, "_blank", "noopener");
    } catch {
      toast.error("تعذّر فتح الملف.");
    }
  }

  async function remove(id) {
    await deleteMyNote({ data: { id } });
    await router.invalidate();
    toast.success("تم حذف الملاحظات.");
  }

  return (
    <section className="panel p-6">
      <h2 className="font-bold">ملاحظاتي الملخّصة</h2>
      <p className="mt-1 text-sm text-muted-foreground">الملفات التي رفعتها إلى الكوتش وملخصاتها المحفوظة.</p>

      <ul className="mt-5 space-y-3">
        {notes.length === 0 && (
          <li className="rounded-2xl border border-dashed border-border px-5 py-8 text-center text-sm text-muted-foreground">
            لا توجد ملاحظات بعد — استخدم وضع «راجع ملاحظاتي» في الدردشة.
          </li>
        )}

        {notes.map((note) => (
          <li key={note.id} className="rounded-2xl border border-border bg-background p-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex min-w-0 items-center gap-3">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-secondary text-primary">
                  <FileText className="h-4 w-4" aria-hidden="true" />
                </span>
                <div className="min-w-0">
                  <p className="truncate font-medium">{note.title}</p>
                  <p className="text-xs text-muted-foreground">{formatArabicDate(note.created_date)}</p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <Button variant="ghost" size="sm" className="gap-2 rounded-full text-primary" onClick={() => openNote(note)}>
                  <ExternalLink className="h-4 w-4" aria-hidden="true" />
                  الملف
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label="حذف الملاحظات"
                  className="h-8 w-8 rounded-full text-muted-foreground hover:text-destructive"
                  onClick={() => remove(note.id)}
                >
                  <Trash2 className="h-4 w-4" aria-hidden="true" />
                </Button>
              </div>
            </div>

            {note.summary && <p className="mt-3 text-sm leading-8 text-muted-foreground">{note.summary}</p>}
          </li>
        ))}
      </ul>
    </section>
  );
}