import { createFileRoute, useRouter } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { base44 } from "@/api/base44Client";
import {
  answerQuestion,
  createConversation,
  deleteConversation,
  listConversations,
  listMessages,
  listTopics,
  sendChatMessage,
  startQuiz,
  summarizeNote,
} from "@/lib/server-fns";
import ConversationList from "@/components/chat/ConversationList";
import MessageList from "@/components/chat/MessageList";
import ChatComposer from "@/components/chat/ChatComposer";

export const Route = createFileRoute("/_authed/chat")({
  validateSearch: (search) => (typeof search.c === "string" ? { c: search.c } : {}),
  loaderDeps: ({ search }) => ({ c: search.c }),
  loader: async ({ deps }) => {
    const [conversations, topics] = await Promise.all([listConversations(), listTopics()]);
    const activeId = deps.c ?? conversations[0]?.id ?? null;
    const messages = activeId ? await listMessages({ data: { conversation_id: activeId } }) : [];
    return { conversations, topics, activeId, messages };
  },
  head: () => ({ meta: [{ title: "الدردشة الطبية — كوتش AI" }] }),
  component: ChatPage,
});

function ChatPage() {
  const { conversations, topics, activeId, messages } = Route.useLoaderData();
  const router = useRouter();
  const navigate = Route.useNavigate();

  const [mode, setMode] = useState("explain");
  const [busy, setBusy] = useState(false);
  const [extra, setExtra] = useState([]);
  const [quiz, setQuiz] = useState(null);

  useEffect(() => {
    setExtra([]);
    setQuiz(null);
  }, [activeId]);

  useEffect(() => {
    setExtra([]);
  }, [messages]);

  const shown = [...messages, ...extra];

  async function ensureConversation() {
    if (activeId) return activeId;
    const conversation = await createConversation({ data: {} });
    await navigate({ to: "/chat", search: { c: conversation.id } });
    return conversation.id;
  }

  async function handleSend(text) {
    if (!text.trim() || busy) return;
    setBusy(true);
    try {
      const id = await ensureConversation();
      setExtra([{ id: "optimistic", role: "user", kind: "chat", content: text }]);
      const { userMessage, assistantMessage } = await sendChatMessage({ data: { conversation_id: id, text } });
      setExtra([userMessage, assistantMessage]);
      await router.invalidate();
    } catch {
      setExtra([]);
      toast.error("تعذّر إرسال الرسالة. يرجى المحاولة مرة أخرى.");
    } finally {
      setBusy(false);
    }
  }

  async function handleStartQuiz(topic) {
    setBusy(true);
    try {
      const id = await ensureConversation();
      const result = await startQuiz({ data: { conversation_id: id, topic } });
      setQuiz({ messageId: result.message.id, question: result.question, selected: null, result: null });
      await router.invalidate();
    } catch {
      toast.error("تعذّر توليد السؤال. حاول مرة أخرى.");
    } finally {
      setBusy(false);
    }
  }

  async function handleAnswer(index) {
    if (!quiz || quiz.selected !== null || busy) return;
    setBusy(true);
    try {
      const result = await answerQuestion({
        data: { conversation_id: activeId, question_id: quiz.question.id, selected_index: index },
      });
      setQuiz((current) => (current ? { ...current, selected: index, result } : current));
      await router.invalidate();
    } catch {
      toast.error("تعذّر تسجيل الإجابة.");
    } finally {
      setBusy(false);
    }
  }

  async function handleNotes(file, title) {
    setBusy(true);
    try {
      const id = await ensureConversation();
      const { file_uri } = await base44.integrations.Core.UploadPrivateFile({ file });
      const { signed_url } = await base44.integrations.Core.CreateFileSignedUrl({ file_uri });
      await summarizeNote({ data: { conversation_id: id, file_uri, signed_url, title } });
      await router.invalidate();
      toast.success("تم تحليل المحاضرة واستخراج النقاط المهمة.");
    } catch {
      toast.error("تعذّر تحليل الملف. تأكد من الصيغة والحجم.");
    } finally {
      setBusy(false);
    }
  }

  async function handleNew() {
    const conversation = await createConversation({ data: {} });
    await router.invalidate();
    await navigate({ to: "/chat", search: { c: conversation.id } });
  }

  async function handleDelete(id) {
    try {
      await deleteConversation({ data: { id } });
      if (id === activeId) await navigate({ to: "/chat", search: {} });
      await router.invalidate();
      toast.success("تم حذف المحادثة.");
    } catch {
      toast.error("تعذّر حذف المحادثة.");
    }
  }

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-4 px-4 py-6 sm:px-6 lg:h-[calc(100vh-4rem)] lg:flex-row lg:py-8" dir="rtl">
      <ConversationList
        conversations={conversations}
        activeId={activeId}
        onSelect={(id) => navigate({ to: "/chat", search: { c: id } })}
        onNew={handleNew}
        onDelete={handleDelete}
      />

      <section className="panel flex min-h-[65vh] flex-1 flex-col overflow-hidden">
        <MessageList
          messages={shown}
          busy={busy}
          quiz={quiz}
          onAnswer={handleAnswer}
          onNextQuestion={() => setQuiz(null)}
          onQuickAsk={handleSend}
        />
        <ChatComposer
          mode={mode}
          setMode={setMode}
          busy={busy}
          topics={topics}
          onSend={handleSend}
          onStartQuiz={handleStartQuiz}
          onNotes={handleNotes}
        />
      </section>
    </div>
  );
}