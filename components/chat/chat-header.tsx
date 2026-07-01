"use client";

import { Sparkles, Github, FileText, PanelRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "./theme-toggle";
import { useChatContext } from "./chat-provider";
import { IS_MOCK_MODE } from "@/lib/ai-config";

export function ChatHeader() {
  const { setMobileDrawerOpen, selectedDocumentIds } = useChatContext();

  return (
    <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-14 items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Sparkles className="h-4 w-4" />
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-semibold leading-tight">
              RAG SaaS Starter
            </span>
            <span className="text-[11px] text-muted-foreground leading-tight">
              {IS_MOCK_MODE ? (
                <span className="text-amber-600 dark:text-amber-400">
                  ● وضع تجريبي (mock)
                </span>
              ) : (
                <span className="text-emerald-600 dark:text-emerald-400">
                  ● متصل بـ AI
                </span>
              )}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1">
          {/* Mobile: open documents drawer */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden relative"
            onClick={() => setMobileDrawerOpen(true)}
            aria-label="فتح المستندات"
            title="المستندات"
          >
            <PanelRight className="h-4 w-4" />
            {selectedDocumentIds.length > 0 && (
              <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-primary" />
            )}
          </Button>

          <Button
            variant="ghost"
            size="icon"
            asChild
            aria-label="GitHub"
            title="GitHub"
            className="hidden sm:inline-flex"
          >
            <a
              href="https://github.com/faresrafat3/rag-saas-starter"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Github className="h-4 w-4" />
            </a>
          </Button>
          <Button
            variant="ghost"
            size="icon"
            asChild
            aria-label="الوثائق"
            title="الوثائق"
            className="hidden sm:inline-flex"
          >
            <a href="https://github.com/faresrafat3/rag-saas-starter#readme">
              <FileText className="h-4 w-4" />
            </a>
          </Button>
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
