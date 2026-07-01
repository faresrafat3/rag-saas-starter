"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ChatMessageItem, TypingIndicator } from "./chat-message";
import { ChatInput } from "./chat-input";
import { EmptyState } from "./empty-state";
import { useChatContext } from "./chat-provider";
import { generateId } from "@/lib/utils";
import type { ChatMessage } from "@/lib/types";

/**
 * Main chat container — manages state, streaming, and scroll behavior.
 *
 * Session 5 update: integrates with ChatContext to read selected document IDs
 * and includes them in the chat request (enabling RAG retrieval on the server).
 */
export function ChatContainer() {
  const { selectedDocumentIds } = useChatContext();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const viewportRef = useRef<HTMLDivElement | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Auto-scroll to bottom on new messages / streaming chunks
  const scrollToBottom = useCallback(() => {
    const viewport = viewportRef.current;
    if (viewport) {
      viewport.scrollTo({
        top: viewport.scrollHeight,
        behavior: "smooth",
      });
    }
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  // Find the ScrollArea viewport
  useEffect(() => {
    if (scrollAreaRef.current) {
      viewportRef.current = scrollAreaRef.current.querySelector(
        "[data-radix-scroll-area-viewport]"
      );
    }
  }, []);

  const handleSend = useCallback(
    async (content: string) => {
      setError(null);

      const userMessage: ChatMessage = {
        id: generateId("msg"),
        role: "user",
        content,
        createdAt: Date.now(),
        documentIds: selectedDocumentIds.length > 0 ? selectedDocumentIds : undefined,
      };

      const assistantMessage: ChatMessage = {
        id: generateId("msg"),
        role: "assistant",
        content: "",
        createdAt: Date.now(),
        isStreaming: true,
      };

      const newMessages = [...messages, userMessage];
      setMessages([...newMessages, assistantMessage]);
      setIsStreaming(true);

      const controller = new AbortController();
      abortControllerRef.current = controller;

      try {
        const response = await fetch("/api/chat", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({
            messages: newMessages.map((m) => ({
              role: m.role,
              content: m.content,
            })),
            // Include selected documents for RAG retrieval
            documentIds:
              selectedDocumentIds.length > 0 ? selectedDocumentIds : undefined,
          }),
          signal: controller.signal,
        });

        if (!response.ok) {
          const errText = await response.text();
          throw new Error(
            `HTTP ${response.status}: ${errText.slice(0, 200)}`
          );
        }

        if (!response.body) {
          throw new Error("Response body is null");
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let accumulated = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value, { stream: true });
          accumulated += chunk;

          // Update the assistant message in place
          setMessages((prev) =>
            prev.map((m) =>
              m.id === assistantMessage.id
                ? { ...m, content: accumulated, isStreaming: true }
                : m
            )
          );
        }

        // Finalize: mark as not streaming
        setMessages((prev) =>
          prev.map((m) =>
            m.id === assistantMessage.id ? { ...m, isStreaming: false } : m
          )
        );
      } catch (err) {
        if (err instanceof DOMException && err.name === "AbortError") {
          // User cancelled — mark as not streaming, keep partial content
          setMessages((prev) =>
            prev.map((m) =>
              m.id === assistantMessage.id ? { ...m, isStreaming: false } : m
            )
          );
        } else {
          const message = err instanceof Error ? err.message : "Unknown error";
          setError(message);
          setMessages((prev) =>
            prev
              .filter(
                (m) =>
                  m.id !== assistantMessage.id || m.content.length > 0
              )
              .map((m) =>
                m.id === assistantMessage.id
                  ? { ...m, isStreaming: false }
                  : m
              )
          );
        }
      } finally {
        setIsStreaming(false);
        abortControllerRef.current = null;
      }
    },
    [messages, selectedDocumentIds]
  );

  const handleStop = useCallback(() => {
    abortControllerRef.current?.abort();
  }, []);

  const handleExampleClick = useCallback(
    (prompt: string) => {
      if (!isStreaming) {
        handleSend(prompt);
      }
    },
    [handleSend, isStreaming]
  );

  return (
    <div className="flex flex-col h-full">
      <ScrollArea ref={scrollAreaRef} className="flex-1">
        {messages.length === 0 ? (
          <EmptyState onExampleClick={handleExampleClick} />
        ) : (
          <div className="max-w-3xl mx-auto pb-4">
            {messages.map((message, idx) => (
              <div key={message.id}>
                {message.isStreaming &&
                message.content.length === 0 &&
                idx === messages.length - 1 ? (
                  <TypingIndicator />
                ) : (
                  <ChatMessageItem message={message} />
                )}
              </div>
            ))}
          </div>
        )}
      </ScrollArea>

      {error && (
        <div className="px-4 py-2 bg-destructive/10 text-destructive text-xs text-center">
          ⚠️ حدث خطأ: {error}
        </div>
      )}

      <div className="max-w-3xl mx-auto w-full">
        <ChatInput
          onSend={handleSend}
          onStop={handleStop}
          isStreaming={isStreaming}
        />
      </div>
    </div>
  );
}
