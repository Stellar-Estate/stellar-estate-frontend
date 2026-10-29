import { useState, useCallback } from 'react';

/**
 * Copies plain text to the system clipboard with browser fallback
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  if (!text) return false;

  try {
    if (navigator?.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch {
    // Fallback to legacy document.execCommand
  }

  try {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.left = '-9999px';
    textArea.style.top = '-9999px';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    const successful = document.execCommand('copy');
    document.body.removeChild(textArea);
    return successful;
  } catch {
    return false;
  }
}

/**
 * React hook providing copy functionality with temporary copied state
 */
export function useClipboard(timeout = 2000) {
  const [copied, setCopied] = useState(false);

  const copy = useCallback(
    async (text: string) => {
      const result = await copyToClipboard(text);
      if (result) {
        setCopied(true);
        setTimeout(() => setCopied(false), timeout);
      }
      return result;
    },
    [timeout]
  );

  return { copy, copied };
}
