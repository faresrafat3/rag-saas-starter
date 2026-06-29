"use client";

import { cn, formatTime } from "@/lib/utils";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import type { ChatMessage } from "@/lib/types";
import { User, Sparkles } from "lucide-react";

interface ChatMessageItemProps {
  message: ChatMessage;
}

export function ChatMessageItem({ message }: ChatMessageItemProps) {
  const isUser = message.role === "user";

  return (
    <div
      className={cn(
        "flex gap-3 p-4 md:p-6",
        isUser ? "flex-row" : "flex-row-reverse"
      )}
    >
      <Avatar className="h-9 w-9 shrink-0">
        <AvatarFallback
          className={cn(
            isUser
              ? "bg-primary text-primary-foreground"
              : "bg-muted text-muted-foreground"
          )}
        >
          {isUser ? <User className="h-4 w-4" /> : <Sparkles className="h-4 w-4" />}
        </AvatarFallback>
      </Avatar>

      <div
        className={cn(
          "flex flex-col gap-1 max-w-[85%] md:max-w-[75%]",
          isUser ? "items-start" : "items-end"
        )}
      >
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span className="font-medium">
            {isUser ? "أنت" : "المساعد"}
          </span>
          <span>{formatTime(message.createdAt)}</span>
        </div>

        <div
          className={cn(
            "rounded-2xl px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap break-words",
            isUser
              ? "bg-primary text-primary-foreground rounded-tr-sm"
              : "bg-muted text-foreground rounded-tl-sm",
            message.isStreaming && "streaming-cursor"
          )}
        >
          {message.content || (message.isStreaming ? "" : "—")}
        </div>
      </div>
    </div>
  );
}

/**
 * Typing indicator (three bouncing dots) shown while the assistant is
 * preparing its response, before any text has streamed.
 */
export function TypingIndicator() {
  return (
    <div className="flex gap-3 p-4 md:p-6 flex-row-reverse">
      <Avatar className="h-9 w-9 shrink-0">
        <AvatarFallback className="bg-muted text-muted-foreground">
          <Sparkles className="h-4 w-4" />
        </AvatarFallback>
      </Avatar>
      <div className="flex flex-col gap-1 items-end">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span className="font-medium">المساعد</span>
        </div>
        <div className="rounded-2xl rounded-tl-sm bg-muted px-4 py-3">
          <div className="flex gap-1.5">
            <span className="typing-dot h-2 w-2 rounded-full bg-muted-foreground/60" />
            <span className="typing-dot h-2 w-2 rounded-full bg-muted-foreground/60" />
            <span className="typing-dot h-2 w-2 rounded-full bg-muted-foreground/60" />
          </div>
        </div>
      </div>
    </div>
  );
}
