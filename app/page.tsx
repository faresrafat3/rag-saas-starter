import { ChatHeader } from "@/components/chat/chat-header";
import { ChatContainer } from "@/components/chat/chat-container";

export default function HomePage() {
  return (
    <div className="flex flex-col h-screen overflow-hidden">
      <ChatHeader />
      <main className="flex-1 overflow-hidden">
        <ChatContainer />
      </main>
    </div>
  );
}
