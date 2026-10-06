import ReactMarkdown from "react-markdown";
import { cn } from "@/lib/utils";

const MARKDOWN = {
  p: ({ node, ...props }) => <p className="mb-2 leading-8 last:mb-0" {...props} />,
  ul: ({ node, ...props }) => <ul className="mb-2 list-disc space-y-1 pr-5 leading-8 last:mb-0" {...props} />,
  ol: ({ node, ...props }) => <ol className="mb-2 list-decimal space-y-1 pr-5 leading-8 last:mb-0" {...props} />,
  h1: ({ node, ...props }) => <h3 className="mb-2 mt-3 text-base font-bold text-primary last:mb-0" {...props} />,
  h2: ({ node, ...props }) => <h3 className="mb-2 mt-3 text-base font-bold text-primary last:mb-0" {...props} />,
  h3: ({ node, ...props }) => <h3 className="mb-2 mt-3 text-base font-bold text-primary last:mb-0" {...props} />,
  strong: ({ node, ...props }) => <strong className="font-bold" {...props} />,
  code: ({ node, ...props }) => <code className="rounded bg-card/60 px-1.5 py-0.5 text-sm" {...props} />,
};

export default function MessageBubble({ message }) {
  const isUser = message.role === "user";

  return (
    <div className={cn("flex", isUser ? "justify-end" : "justify-start")}>
      <div
        className={cn(
          "max-w-[88%] rounded-3xl px-5 py-3.5 text-sm sm:text-[0.95rem]",
          isUser ? "bg-primary text-primary-foreground" : "bg-secondary/70 text-foreground",
        )}
      >
        {isUser ? (
          <p className="whitespace-pre-wrap leading-8">{message.content}</p>
        ) : (
          <ReactMarkdown components={MARKDOWN}>{message.content ?? ""}</ReactMarkdown>
        )}
      </div>
    </div>
  );
}