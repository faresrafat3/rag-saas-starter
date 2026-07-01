"use client";

import { useEffect } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DocumentPanel } from "./document-panel";
import { useChatContext } from "./chat-provider";
import { cn } from "@/lib/utils";

/**
 * Mobile-only slide-out drawer for the documents panel.
 *
 * Visible only on screens < md breakpoint.
 * Controlled by `mobileDrawerOpen` from ChatContext.
 *
 * Implementation note: pure CSS transitions (no Radix Sheet dependency).
 */
export function MobileDocDrawer() {
  const { mobileDrawerOpen, setMobileDrawerOpen } = useChatContext();

  // Close on Escape key
  useEffect(() => {
    if (!mobileDrawerOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMobileDrawerOpen(false);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [mobileDrawerOpen, setMobileDrawerOpen]);

  // Lock body scroll when open
  useEffect(() => {
    if (!mobileDrawerOpen) return;
    const original = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = original;
    };
  }, [mobileDrawerOpen]);

  return (
    <>
      {/* Overlay */}
      <div
        className={cn(
          "md:hidden fixed inset-0 z-40 bg-black/50 transition-opacity",
          mobileDrawerOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        )}
        onClick={() => setMobileDrawerOpen(false)}
        aria-hidden="true"
      />

      {/* Drawer */}
      <aside
        className={cn(
          "md:hidden fixed inset-y-0 right-0 z-50 w-[85vw] max-w-sm",
          "bg-background shadow-xl border-s",
          "transform transition-transform duration-300 ease-in-out",
          mobileDrawerOpen ? "translate-x-0" : "translate-x-full"
        )}
        role="dialog"
        aria-modal="true"
        aria-label="إدارة المستندات"
      >
        <div className="flex items-center justify-between p-3 border-b">
          <span className="text-sm font-semibold">المستندات</span>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setMobileDrawerOpen(false)}
            aria-label="إغلاق"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
        <div className="h-[calc(100%-3.5rem)]">
          {/* DocumentPanel already handles its own scroll area */}
          <DocumentPanel />
        </div>
      </aside>
    </>
  );
}
