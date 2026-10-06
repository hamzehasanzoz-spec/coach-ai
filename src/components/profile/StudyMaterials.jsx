import { useRouter } from "@tanstack/react-router";
import { ExternalLink, FileText, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import MaterialUploader from "@/components/profile/MaterialUploader";
import { formatArabicDate, formatFileSize } from "@/lib/labels";
import { deleteStudyMaterial } from "@/lib/server-fns";

export default function StudyMaterials({ materials }) {
  const router = useRouter();

  async function openMaterial(material) {
    try {
      const { signed_url } = await base44.integrations.Core.CreateFileSignedUrl({ file_uri: material.file_uri });
      window.open(signed_url, "_blank", "noopener");
    } catch {
      toast.error("تعذّر فتح الملف.");
    }
  }

  async function remove(id) {
    await deleteStudyMaterial({ data: { id } });
    await router.invalidate();
    toast.success("تم حذف الملف.");
  }

  return (
    <section className="panel p-6">
      <h2 className="font-bold">مواد الدراسة</h2>
      <p className="mt-1 text-sm text-muted-foreground">
        ارفع ملفاتك ومحاضراتك ليستخدمها الكوتش في الشرح والتلخيص والاختبار.
      </p>

      <div className="mt-5">
        <MaterialUploader />
      </div>

      <ul className="mt-5 space-y-3">
        {materials.length === 0 && (
          <li className="rounded-2xl border border-dashed border-border px-5 py-8 text-center text-sm text-muted-foreground">
            لا توجد ملفات بعد — ارفع أول ملف دراسي لك.
          </li>
        )}

        {materials.map((material) => (
          <li key={material.id} className="rounded-2xl border border-border bg-background p-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex min-w-0 items-center gap-3">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-secondary text-primary">
                  <FileText className="h-4 w-4" aria-hidden="true" />
                </span>
                <div className="min-w-0">
                  <p className="truncate font-medium">{material.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {formatArabicDate(material.created_date)}
                    {material.file_type ? ` • ${String(material.file_type).toUpperCase()}` : ""}
                    {formatFileSize(material.size) ? ` • ${formatFileSize(material.size)}` : ""}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  className="gap-2 rounded-full text-primary"
                  onClick={() => openMaterial(material)}
                >
                  <ExternalLink className="h-4 w-4" aria-hidden="true" />
                  عرض
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label={`حذف ${material.name}`}
                  className="h-8 w-8 rounded-full text-muted-foreground hover:text-destructive"
                  onClick={() => remove(material.id)}
                >
                  <Trash2 className="h-4 w-4" aria-hidden="true" />
                </Button>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}