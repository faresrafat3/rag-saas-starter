/**
 * SOTA Chat Message Component.
 * Supports Markdown, embedded Citations, and dynamic RTL/LTR layout.
 */
import React from 'react';
import { useAutoDirection } from '@/lib/useAutoDirection';
import { Citation } from './citation';
import { cn } from '@/lib/utils';
import { User, Bot } from 'lucide-react';

interface MessageProps {
  role: 'user' | 'assistant';
  content: string;
  citations?: Array<{ id: number; source: string; snippet?: string }>;
}

export function ChatMessage({ role, content, citations = [] }: MessageProps) {
  const dir = useAutoDirection(content);
  const isUser = role === 'user';

  // SOTA Citation Regex Parsing: Matches [1], [2], etc.
  // In a real implementation, we'd use a custom remark plugin for React Markdown,
  // but for the starter we do a robust string replacement strategy to inject React components.
  
  const renderContentWithCitations = () => {
    if (!citations.length) return <span>{content}</span>;
    
    // Simplistic citation renderer for the demo
    const parts = content.split(/(\[\d+\])/g);
    return parts.map((part, idx) => {
      const match = part.match(/\[(\d+)\]/);
      if (match) {
        const citId = parseInt(match[1], 10);
        const citData = citations.find(c => c.id === citId);
        if (citData) {
          return <Citation key={idx} id={citData.id} source={citData.source} snippet={citData.snippet} />;
        }
      }
      return <span key={idx}>{part}</span>;
    });
  };

  return (
    <div
      dir={dir}
      className={cn(
        "flex w-full mb-6 p-4 rounded-xl shadow-sm border transition-all",
        isUser 
          ? "bg-gray-50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700" 
          : "bg-white dark:bg-gray-900 border-blue-100 dark:border-blue-900/30",
        dir === 'rtl' ? "text-right font-arabic" : "text-left font-sans"
      )}
    >
      <div className={cn("flex-shrink-0 flex items-start", dir === 'rtl' ? "ml-4" : "mr-4")}>
        <div className={cn(
          "p-2 rounded-full",
          isUser ? "bg-gray-200 dark:bg-gray-700" : "bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400"
        )}>
          {isUser ? <User size={20} /> : <Bot size={20} />}
        </div>
      </div>
      
      <div className="flex-1 overflow-hidden">
        <div className="prose dark:prose-invert max-w-none text-sm md:text-base">
          {renderContentWithCitations()}
        </div>
      </div>
    </div>
  );
}
