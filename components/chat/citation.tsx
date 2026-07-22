/**
 * SOTA Citation Component (Perplexity Style).
 * Displays interactive source references dynamically while streaming.
 */
import React from 'react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

interface CitationProps {
  id: number;
  source: string;
  snippet?: string;
}

export function Citation({ id, source, snippet }: CitationProps) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <sup className="cursor-pointer text-xs font-bold text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/30 px-1 py-0.5 rounded-sm ml-1 hover:bg-blue-200 transition-colors">
          [{id}]
        </sup>
      </PopoverTrigger>
      <PopoverContent className="w-80 text-sm p-4">
        <div className="font-semibold text-gray-900 dark:text-gray-100 mb-2 border-b pb-1">
          Source Reference
        </div>
        <p className="text-gray-700 dark:text-gray-300 font-mono text-xs break-all">
          {source}
        </p>
        {snippet && (
          <div className="mt-2 text-gray-600 dark:text-gray-400 italic border-l-2 border-gray-300 pl-2">
            "{snippet}"
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}
