"use client";

import { useState, useRef, useEffect, type FormEvent } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Send, Square } from "lucide-react";

interface ChatInputProps {
  onSend: (content: string) => void;
  onStop?: () => void;
  isStreaming: boolean;
  disabled?: boolean;
  placeholder?: string;
}

export function ChatInput({
  onSend,
  onStop,
  isStreaming,
  disabled = false,
  placeholder = "اكتب رسالتك هنا...",
}: ChatInputProps) {
  const [value, setValue] = useState("");
  const textareaRef = useRef<HTMLInputElement>(null);

  // Auto-focus on mount
  useEffect(() => {
    textareaRef.current?.focus();
  }, []);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const trimmed = value.trim();
    if (!trimmed || disabled || isStreaming) return;
    onSend(trimmed);
    setValue("");
  };

  const handleStop = () => {
    onStop?.();
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="flex gap-2 p-4 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60"
    >
      <Input
        ref={textareaRef}
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        className="flex-1 text-base"
        autoComplete="off"
        autoCorrect="off"
        spellCheck={false}
      />

      {isStreaming ? (
        <Button
          type="button"
          onClick={handleStop}
          variant="destructive"
          size="icon"
          aria-label="إيقاف"
        >
          <Square className="h-4 w-4" />
        </Button>
      ) : (
        <Button
          type="submit"
          disabled={!value.trim() || disabled}
          size="icon"
          aria-label="إرسال"
        >
          <Send className="h-4 w-4 rtl:scale-x-[-1]" />
        </Button>
      )}
    </form>
  );
}
