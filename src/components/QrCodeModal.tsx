import React from 'react';
import { X, Copy, Check, ExternalLink, QrCode } from 'lucide-react';
import { useClipboard } from '../utils/clipboard.ts';
import { useKeyboardShortcuts } from '../hooks/useKeyboardShortcuts.ts';

export interface QrCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  uri: string;
  description?: string;
  badgeText?: string;
}

export const QrCodeModal: React.FC<QrCodeModalProps> = ({
  isOpen,
  onClose,
  title,
  uri,
  description,
  badgeText = 'SEP-0007 URI',
}) => {
  const { copied, copy } = useClipboard();
  useKeyboardShortcuts({ onEscape: onClose, enabled: isOpen });

  if (!isOpen) return null;

  // Use standard SVG / PNG QR generator URL for standard SEP-0007 mobile wallets (Lobstr, Albedo, etc.)
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=260x260&margin=12&data=${encodeURIComponent(uri)}`;

  return (
    <div className="modal-backdrop" onClick={onClose} style={{ zIndex: 1100 }}>
      <div
        className="modal-content"
        onClick={(e) => e.stopPropagation()}
        style={{
          maxWidth: 440,
          textAlign: 'center',
          padding: '2rem',
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span className="badge badge-stellar">{badgeText}</span>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--text-muted)',
              cursor: 'pointer',
              padding: '0.25rem',
            }}
          >
            <X size={20} />
          </button>
        </div>

        <h3 style={{ fontSize: '1.3rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
          {title}
        </h3>
        {description && (
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1.5rem', lineHeight: 1.5 }}>
            {description}
          </p>
        )}

        {/* QR Code Container */}
        <div
          style={{
            background: '#ffffff',
            padding: '1.25rem',
            borderRadius: 'var(--radius-md)',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 1.5rem',
            boxShadow: '0 8px 24px rgba(0, 0, 0, 0.4)',
            border: '2px solid rgba(226, 183, 20, 0.3)',
          }}
        >
          <img
            src={qrCodeUrl}
            alt="SEP-0007 Payment QR Code"
            width={240}
            height={240}
            style={{ display: 'block', borderRadius: 4 }}
          />
        </div>

        {/* URI Box & Action Buttons */}
        <div
          style={{
            background: 'var(--bg-input)',
            border: '1px solid var(--border-card)',
            borderRadius: 'var(--radius-sm)',
            padding: '0.75rem',
            marginBottom: '1.25rem',
            textAlign: 'left',
          }}
        >
          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 4 }}>
            Raw Payment URI
          </div>
          <div
            className="mono-text"
            style={{
              fontSize: '0.75rem',
              color: 'var(--accent-cyan)',
              wordBreak: 'break-all',
              maxHeight: 64,
              overflowY: 'auto',
            }}
          >
            {uri}
          </div>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
          <button
            onClick={() => copy(uri)}
            className="btn-secondary"
            style={{
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              fontSize: '0.85rem',
            }}
          >
            {copied ? <Check size={16} color="var(--accent-emerald)" /> : <Copy size={16} />}
            {copied ? 'Copied URI' : 'Copy URI'}
          </button>

          <a
            href={uri}
            className="btn-primary"
            style={{
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              fontSize: '0.85rem',
              textDecoration: 'none',
            }}
          >
            <ExternalLink size={16} /> Open Wallet
          </a>
        </div>
      </div>
    </div>
  );
};
