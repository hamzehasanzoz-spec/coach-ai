import { Activity } from "lucide-react";

export default function Logo({ compact = false }) {
  return (
    <span className="flex items-center gap-2.5">
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-sm">
        <Activity className="h-5 w-5" aria-hidden="true" />
      </span>
      {!compact && (
        <span className="font-display text-lg font-bold leading-none tracking-tight">
          كوتش <span className="text-primary">AI</span>
        </span>
      )}
    </span>
  );
}