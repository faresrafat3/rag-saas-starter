"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  FileText,
  Upload,
  Trash2,
  Loader2,
  FileCheck2,
  AlertCircle,
  Inbox,
} from "lucide-react";
import { cn, formatTime } from "@/lib/utils";
import { useChatContext } from "./chat-provider";

interface DocMeta {
  id: string;
  name: string;
  size: number;
  mime_type: string;
  chunk_count: number;
  status: string;
  created_at: number;
  updated_at: number;
}

export function DocumentPanel() {
  const { selectedIds, onToggleSelect, refreshKey } = useChatContextAdapted();
  const [docs, setDocs] = useState<DocMeta[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fetch documents
  const fetchDocs = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/documents");
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setDocs(data.documents ?? []);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDocs();
  }, [fetchDocs, refreshKey]);

  // File upload
  const handleUpload = async (file: File) => {
    setUploading(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/documents/upload", {
        method: "POST",
        body: formData,
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error ?? `HTTP ${res.status}`);
      }
      await fetchDocs();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("هل أنت متأكد من حذف هذا المستند؟")) return;
    try {
      const res = await fetch(`/api/documents/${id}`, { method: "DELETE" });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error ?? `HTTP ${res.status}`);
      }
      // Also remove from selection
      if (selectedIds.includes(id)) onToggleSelect(id);
      await fetchDocs();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Delete failed");
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleUpload(file);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <aside className="flex flex-col h-full border-s bg-card/40">
      <div className="flex items-center justify-between p-3 border-b">
        <div className="flex items-center gap-2">
          <FileText className="h-4 w-4 text-muted-foreground" />
          <h2 className="text-sm font-semibold">المستندات</h2>
          <span className="text-xs text-muted-foreground">({docs.length})</span>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
        >
          {uploading ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <Upload className="h-3.5 w-3.5" />
          )}
          <span className="text-xs">رفع</span>
        </Button>
        <input
          ref={fileInputRef}
          type="file"
          accept=".txt,.md,.markdown,.json,.csv"
          onChange={handleFileChange}
          className="hidden"
        />
      </div>

      {error && (
        <div className="flex items-center gap-2 p-2 bg-destructive/10 text-destructive text-xs">
          <AlertCircle className="h-3.5 w-3.5 shrink-0" />
          <span className="flex-1 truncate">{error}</span>
          <button
            onClick={() => setError(null)}
            className="text-destructive/70 hover:text-destructive"
            aria-label="إغلاق"
          >
            ×
          </button>
        </div>
      )}

      <ScrollArea className="flex-1">
        {loading ? (
          <div className="flex items-center justify-center p-8">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          </div>
        ) : docs.length === 0 ? (
          <EmptyDocsState />
        ) : (
          <ul className="divide-y">
            {docs.map((doc) => {
              const isSelected = selectedIds.includes(doc.id);
              return (
                <li
                  key={doc.id}
                  className={cn(
                    "p-3 transition-colors cursor-pointer hover:bg-accent/50",
                    isSelected && "bg-primary/10 hover:bg-primary/15"
                  )}
                  onClick={() => onToggleSelect(doc.id)}
                >
                  <div className="flex items-start gap-2">
                    <div className="mt-0.5">
                      {isSelected ? (
                        <FileCheck2 className="h-4 w-4 text-primary" />
                      ) : (
                        <FileText className="h-4 w-4 text-muted-foreground" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-medium truncate" title={doc.name}>
                        {doc.name}
                      </div>
                      <div className="text-[10px] text-muted-foreground mt-0.5 flex items-center gap-2">
                        <span>{formatFileSize(doc.size)}</span>
                        <span>•</span>
                        <span>{doc.chunk_count} قطعة</span>
                      </div>
                      <div className="text-[10px] text-muted-foreground mt-0.5">
                        {formatTime(doc.created_at)}
                      </div>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(doc.id);
                      }}
                      className="text-muted-foreground hover:text-destructive p-1 rounded transition-colors"
                      aria-label="حذف"
                      title="حذف"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </ScrollArea>

      <div className="border-t p-2 text-[10px] text-muted-foreground text-center">
        {selectedIds.length > 0 ? (
          <span>
            <span className="text-primary font-medium">{selectedIds.length}</span>{" "}
            مستند مفعّل للبحث
          </span>
        ) : (
          <span>اختر مستندًا لتفعيل RAG</span>
        )}
      </div>
    </aside>
  );
}

/**
 * Adapter hook — pulls values from ChatContext using the legacy prop names
 * so we can keep DocumentPanel logic unchanged from session 4.
 */
function useChatContextAdapted() {
  const { selectedDocumentIds, toggleDocumentSelection, documentRefreshKey } =
    useChatContext();
  return {
    selectedIds: selectedDocumentIds,
    onToggleSelect: toggleDocumentSelection,
    refreshKey: documentRefreshKey,
  };
}

function EmptyDocsState() {
  return (
    <div className="flex flex-col items-center justify-center h-full p-6 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted mb-3">
        <Inbox className="h-5 w-5 text-muted-foreground" />
      </div>
      <p className="text-xs text-muted-foreground mb-1">لا توجد مستندات</p>
      <p className="text-[10px] text-muted-foreground/70">
        ارفع ملف TXT/MD/JSON/CSV لبدء RAG
      </p>
    </div>
  );
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
