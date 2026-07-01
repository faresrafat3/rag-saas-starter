import { ChatHeader } from "@/components/chat/chat-header";
import { ChatContainer } from "@/components/chat/chat-container";
import { DocumentPanel } from "@/components/chat/document-panel";
import { MobileDocDrawer } from "@/components/chat/mobile-doc-drawer";
import { ChatProvider } from "@/components/chat/chat-provider";

export default function HomePage() {
  return (
    <ChatProvider>
      <div className="flex flex-col h-screen overflow-hidden">
        <ChatHeader />
        <main className="flex-1 overflow-hidden">
          {/* Desktop layout: sidebar + chat */}
          <div className="hidden md:flex h-full">
            <div className="w-80 shrink-0 border-e">
              <DocumentPanel />
            </div>
            <div className="flex-1 overflow-hidden">
              <ChatContainer />
            </div>
          </div>

          {/* Mobile layout: chat only + drawer accessible via header button */}
          <div className="md:hidden h-full">
            <ChatContainer />
          </div>
        </main>

        {/* Mobile drawer (renders only on small screens) */}
        <MobileDocDrawer />
      </div>
    </ChatProvider>
  );
}
