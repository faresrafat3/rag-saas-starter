"use client";

import * as React from "react";
import {
  loadSelectedDocIds,
  saveSelectedDocIds,
  clearMessages,
} from "@/lib/persistence";

/**
 * ChatProvider — central state shared between ChatContainer and DocumentPanel.
 *
 * Session 5B update: persists selected document IDs to localStorage so
 * the user's selection survives page refreshes.
 *
 * Session 5C update:
 * - Added `clearChat` action (clears messages + localStorage)
 * - Added `hasMessages` flag for the header to show/hide clear button
 * - Added `setMessages` for external control
 */

interface ChatContextValue {
  /** IDs of documents currently selected for RAG */
  selectedDocumentIds: string[];
  /** Toggle a document's selection */
  toggleDocumentSelection: (id: string) => void;
  /** Set the entire selection (used when loading from storage) */
  setSelectedDocumentIds: (ids: string[]) => void;
  /** Force document list refresh */
  refreshDocuments: () => void;
  /** Refresh key — DocumentPanel watches this to know when to re-fetch */
  documentRefreshKey: number;
  /** Mobile drawer state */
  mobileDrawerOpen: boolean;
  setMobileDrawerOpen: (open: boolean) => void;
  /** Messages (lifted up so the header can read hasMessages + clearChat) */
  messages: import("@/lib/types").ChatMessage[];
  setMessages: (
    updater: import("@/lib/types").ChatMessage[] |
    ((prev: import("@/lib/types").ChatMessage[]) => import("@/lib/types").ChatMessage[])
  ) => void;
  /** Clear all messages + localStorage */
  clearChat: () => void;
  /** Whether there are any messages (for header clear button visibility) */
  hasMessages: boolean;
}

const ChatContext = React.createContext<ChatContextValue | null>(null);

export function ChatProvider({ children }: { children: React.ReactNode }) {
  // Load initial state from localStorage (lazy initializer)
  const [selectedDocumentIds, setSelectedDocumentIds] = React.useState<string[]>(
    () => loadSelectedDocIds()
  );
  const [documentRefreshKey, setDocumentRefreshKey] = React.useState(0);
  const [mobileDrawerOpen, setMobileDrawerOpen] = React.useState(false);
  const [messages, setMessagesState] = React.useState<
    import("@/lib/types").ChatMessage[]
  >([]);

  // Persist selected doc IDs whenever they change
  React.useEffect(() => {
    saveSelectedDocIds(selectedDocumentIds);
  }, [selectedDocumentIds]);

  const setMessages = React.useCallback(
    (
      updater:
        | import("@/lib/types").ChatMessage[]
        | ((
            prev: import("@/lib/types").ChatMessage[]
          ) => import("@/lib/types").ChatMessage[])
    ) => {
      setMessagesState(updater);
    },
    []
  );

  const clearChat = React.useCallback(() => {
    setMessagesState([]);
    clearMessages();
  }, []);

  const toggleDocumentSelection = React.useCallback((id: string) => {
    setSelectedDocumentIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  }, []);

  const refreshDocuments = React.useCallback(() => {
    setDocumentRefreshKey((k) => k + 1);
  }, []);

  const hasMessages = messages.length > 0;

  const value = React.useMemo(
    () => ({
      selectedDocumentIds,
      toggleDocumentSelection,
      setSelectedDocumentIds,
      refreshDocuments,
      documentRefreshKey,
      mobileDrawerOpen,
      setMobileDrawerOpen,
      messages,
      setMessages,
      clearChat,
      hasMessages,
    }),
    [
      selectedDocumentIds,
      toggleDocumentSelection,
      refreshDocuments,
      documentRefreshKey,
      mobileDrawerOpen,
      messages,
      setMessages,
      clearChat,
      hasMessages,
    ]
  );

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
}

export function useChatContext(): ChatContextValue {
  const ctx = React.useContext(ChatContext);
  if (!ctx) {
    throw new Error("useChatContext must be used within a ChatProvider");
  }
  return ctx;
}
