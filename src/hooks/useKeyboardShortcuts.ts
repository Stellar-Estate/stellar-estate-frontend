import { useEffect, useCallback } from 'react';

export interface ShortcutHandlers {
  onEscape?: () => void;
  onEnter?: () => void;
  onCustom?: Record<string, (e: KeyboardEvent) => void>;
  enabled?: boolean;
  ignoreFormInputs?: boolean;
}

/**
 * Custom React hook for binding accessible keyboard shortcuts (e.g. Esc to close modals, Enter to submit forms).
 */
export function useKeyboardShortcuts({
  onEscape,
  onEnter,
  onCustom,
  enabled = true,
  ignoreFormInputs = false,
}: ShortcutHandlers) {
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (!enabled) return;

      if (ignoreFormInputs) {
        const target = e.target as HTMLElement | null;
        const tagName = target?.tagName?.toLowerCase();
        const isEditable = target?.isContentEditable || tagName === 'input' || tagName === 'textarea' || tagName === 'select';
        if (isEditable && e.key !== 'Escape') {
          return;
        }
      }

      if (e.key === 'Escape' && onEscape) {
        e.preventDefault();
        onEscape();
        return;
      }

      if (e.key === 'Enter' && onEnter) {
        onEnter();
        return;
      }

      if (onCustom && onCustom[e.key]) {
        onCustom[e.key](e);
      }
    },
    [enabled, ignoreFormInputs, onEscape, onEnter, onCustom]
  );

  useEffect(() => {
    if (!enabled) return;
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [enabled, handleKeyDown]);
}
