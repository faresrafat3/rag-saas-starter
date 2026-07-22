/**
 * Advanced Auto-Direction Hook (SOTA Multilingual Support).
 * Automatically detects if the incoming text is Arabic/Hebrew (RTL) 
 * or English/Latin (LTR) and flips the UI layout on a per-message basis.
 */
import { useMemo } from 'react';

// Regex to detect Arabic, Hebrew, or Persian characters
const RTL_REGEX = /[\u0591-\u07FF\uFB1D-\uFDFD\uFE70-\uFEFC]/;

export function useAutoDirection(text: string) {
  return useMemo(() => {
    if (!text) return 'ltr';
    // We check the first 50 characters to guess the primary language of the message
    const sample = text.substring(0, 50);
    return RTL_REGEX.test(sample) ? 'rtl' : 'ltr';
  }, [text]);
}
