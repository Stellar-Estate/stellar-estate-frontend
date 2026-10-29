import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface ToastItem {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  actionUrl?: string;
  actionLabel?: string;
  duration?: number;
}

interface ToastContextType {
  toasts: ToastItem[];
  showToast: (toast: Omit<ToastItem, 'id'>) => void;
  removeToast: (id: string) => void;
  showSuccess: (title: string, message?: string, actionUrl?: string, actionLabel?: string) => void;
  showError: (title: string, message?: string) => void;
  showInfo: (title: string, message?: string) => void;
  showWarning: (title: string, message?: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback(
    (toast: Omit<ToastItem, 'id'>) => {
      const id = Math.random().toString(36).substring(2, 9);
      const newToast: ToastItem = { ...toast, id };

      setToasts((prev) => [...prev, newToast]);

      const duration = toast.duration ?? 5000;
      if (duration > 0) {
        setTimeout(() => {
          removeToast(id);
        }, duration);
      }
    },
    [removeToast]
  );

  const showSuccess = useCallback(
    (title: string, message?: string, actionUrl?: string, actionLabel?: string) => {
      showToast({ type: 'success', title, message, actionUrl, actionLabel });
    },
    [showToast]
  );

  const showError = useCallback(
    (title: string, message?: string) => {
      showToast({ type: 'error', title, message, duration: 7000 });
    },
    [showToast]
  );

  const showInfo = useCallback(
    (title: string, message?: string) => {
      showToast({ type: 'info', title, message });
    },
    [showToast]
  );

  const showWarning = useCallback(
    (title: string, message?: string) => {
      showToast({ type: 'warning', title, message });
    },
    [showToast]
  );

  return (
    <ToastContext.Provider
      value={{
        toasts,
        showToast,
        removeToast,
        showSuccess,
        showError,
        showInfo,
        showWarning,
      }}
    >
      {children}
      {/* Toast Notification Container */}
      <div
        style={{
          position: 'fixed',
          bottom: '1.5rem',
          right: '1.5rem',
          zIndex: 99999,
          display: 'flex',
          flexDirection: 'column',
          gap: '0.75rem',
          maxWidth: '420px',
          width: '100%',
          pointerEvents: 'none',
        }}
      >
        {toasts.map((toast) => {
          const bgColors = {
            success: 'rgba(16, 185, 129, 0.15)',
            error: 'rgba(239, 68, 68, 0.15)',
            info: 'rgba(56, 189, 248, 0.15)',
            warning: 'rgba(245, 158, 11, 0.15)',
          };

          const borderColors = {
            success: 'rgba(16, 185, 129, 0.4)',
            error: 'rgba(239, 68, 68, 0.4)',
            info: 'rgba(56, 189, 248, 0.4)',
            warning: 'rgba(245, 158, 11, 0.4)',
          };

          const iconColors = {
            success: '#10b981',
            error: '#ef4444',
            info: '#38bdf8',
            warning: '#f59e0b',
          };

          return (
            <div
              key={toast.id}
              style={{
                pointerEvents: 'auto',
                background: '#0f172a',
                border: `1px solid ${borderColors[toast.type]}`,
                borderLeft: `4px solid ${iconColors[toast.type]}`,
                borderRadius: '10px',
                padding: '0.875rem 1rem',
                boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.5)',
                display: 'flex',
                alignItems: 'flex-start',
                gap: '0.75rem',
                animation: 'slideIn 0.25s ease-out',
              }}
            >
              <div style={{ color: iconColors[toast.type], marginTop: '2px', flexShrink: 0 }}>
                {toast.type === 'success' && <CheckCircle2 size={18} />}
                {toast.type === 'error' && <AlertCircle size={18} />}
                {toast.type === 'info' && <Info size={18} />}
                {toast.type === 'warning' && <AlertTriangle size={18} />}
              </div>

              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 600, color: '#f8fafc', fontSize: '0.9rem' }}>
                  {toast.title}
                </div>
                {toast.message && (
                  <div style={{ color: '#94a3b8', fontSize: '0.8rem', marginTop: '3px', lineHeight: 1.4 }}>
                    {toast.message}
                  </div>
                )}
                {toast.actionUrl && (
                  <a
                    href={toast.actionUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      display: 'inline-block',
                      marginTop: '6px',
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      color: '#38bdf8',
                      textDecoration: 'underline',
                    }}
                  >
                    {toast.actionLabel || 'View on StellarExpert →'}
                  </a>
                )}
              </div>

              <button
                onClick={() => removeToast(toast.id)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#64748b',
                  cursor: 'pointer',
                  padding: '2px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <X size={14} />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = (): ToastContextType => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};
