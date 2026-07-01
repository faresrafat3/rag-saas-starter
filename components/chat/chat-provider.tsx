"use client";

import * as React from "react";
import {
  loadSelectedDocIds,
  saveSelectedDocIds,
} from "@/lib/persistence";

/**
 * ChatProvider — central state shared between ChatContainer and DocumentPanel.
 *
 * Session 5B update: persists selected document IDs to localStorage so
 * the user's selection survives page refreshes.
 *
 * State managed:
 * - selectedDocumentIds: which documents are active for RAG retrieval
 * - documentRefreshKey: bump to force DocumentPanel to re-fetch
 * - mobileDrawerOpen: whether the mobile documents drawer is open
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
}

const ChatContext = React.createContext<ChatContextValue | null>(null);

export function ChatProvider({ children }: { children: React.ReactNode }) {
  // Load initial state from localStorage (lazy initializer)
  const [selectedDocumentIds, setSelectedDocumentIds] = React.useState<string[]>(
    () => loadSelectedDocIds()
  );
  const [documentRefreshKey, setDocumentRefreshKey] = React.useState(0);
  const [mobileDrawerOpen, setMobileDrawerOpen] = React.useState(false);

  // Persist selected doc IDs whenever they change
  React.useEffect(() => {
    saveSelectedDocIds(selectedDocumentIds);
  }, [selectedDocumentIds]);

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
      setSelectedDocumentIds,
      refreshDocuments,
      documentRefreshKey,
      mobileDrawerOpen,
      setMobileDrawerOpen,
    }),
    [
      selectedDocumentIds,
      toggleDocumentSelection,
      refreshDocuments,
      documentRefreshKey,
      mobileDrawerOpen,
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
