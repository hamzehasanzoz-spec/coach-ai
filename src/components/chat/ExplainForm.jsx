import { useState } from "react";
import { Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

export default function ExplainForm({ busy, onSend }) {
  const [text, setText] = useState("");

  async function submit() {
    const value = text.trim();
    if (!value || busy) return;
    setText("");
    await onSend(value);
  }

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        submit();
      }}
      className="flex items-end gap-2"
    >
      <Textarea
        value={text}
        onChange={(event) => setText(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === "Enter" && !event.shiftKey) {
            event.preventDefault();
            submit();
          }
        }}
        rows={2}
        placeholder="اكتب سؤالك الطبي هنا… (Enter للإرسال)"
        className="min-h-[52px] resize-none rounded-2xl border-border bg-background"
      />
      <Button type="submit" size="icon" disabled={busy || !text.trim()} className="h-[52px] w-12 shrink-0 rounded-2xl" aria-label="إرسال">
        <Send className="h-5 w-5" aria-hidden="true" />
      </Button>
    </form>
  );
}