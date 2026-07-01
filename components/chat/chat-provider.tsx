"use client";

import * as React from "react";

/**
 * ChatProvider — central state shared between ChatContainer and DocumentPanel.
 *
 * Why a context (instead of lifting state to page.tsx)?
 * - Page is a server component; can't hold client state
 * - Avoids prop-drilling through multiple component levels
 * - Single source of truth for selected document IDs + refresh key
 *
 * State managed:
 * - selectedDocumentIds: which documents are active for RAG retrieval
 * - documentRefreshKey: bump to force DocumentPanel to re-fetch (after upload/delete)
 */

interface ChatContextValue {
  /** IDs of documents currently selected for RAG */
  selectedDocumentIds: string[];
  /** Toggle a document's selection */
  toggleDocumentSelection: (id: string) => void;
  /** Force document list refresh */
  refreshDocuments: () => void;
  /** Refresh key — DocumentPanel watches this to know when to re-fetch */
  documentRefreshKey: number;
}

const ChatContext = React.createContext<ChatContextValue | null>(null);

export function ChatProvider({ children }: { children: React.ReactNode }) {
  const [selectedDocumentIds, setSelectedDocumentIds] = React.useState<string[]>([]);
  const [documentRefreshKey, setDocumentRefreshKey] = React.useState(0);

  const toggleDocumentSelection = React.useCallback((id: string) => {
    setSelectedDocumentIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  }, []);

  const refreshDocuments = React.useCallback(() => {
    setDocumentRefreshKey((k) => k + 1);
  }, []);

  const value = React.useMemo(
    () => ({
      selectedDocumentIds,
      toggleDocumentSelection,
      refreshDocuments,
      documentRefreshKey,
    }),
    [selectedDocumentIds, toggleDocumentSelection, refreshDocuments, documentRefreshKey]
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
