import React, { useState } from 'react';
import { useWallet } from '../context/WalletContext.tsx';
import { X, Wallet, ShieldCheck, Zap, AlertCircle } from 'lucide-react';

interface WalletModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const WalletModal: React.FC<WalletModalProps> = ({ isOpen, onClose }) => {
  const { connectFreighter, connectTestnetKeypair, isLoading, error, clearError } = useWallet();
  const [customSecret, setCustomSecret] = useState('');
  const [showCustomInput, setShowCustomInput] = useState(false);

  if (!isOpen) return null;

  const handleFreighter = async () => {
    try {
      await connectFreighter();
      onClose();
    } catch {
      // Error handled in context
    }
  };

  const handleInstantKeypair = async () => {
    try {
      await connectTestnetKeypair(customSecret.trim() ? customSecret.trim() : undefined);
      onClose();
    } catch {
      // Error handled in context
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ padding: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <div>
            <h3 style={{ fontSize: '1.35rem', fontWeight: 700, color: 'var(--text-primary)' }}>
              Connect Stellar Testnet Wallet
            </h3>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
              Select your preferred method to interact with Stellar Testnet vaults.
            </p>
          </div>
          <button
            onClick={onClose}
            style={{ color: 'var(--text-muted)', padding: '0.5rem', borderRadius: 'var(--radius-sm)' }}
          >
            <X size={20} />
          </button>
        </div>

        {error && (
          <div
            style={{
              padding: '0.85rem',
              background: 'rgba(244, 63, 94, 0.1)',
              border: '1px solid rgba(244, 63, 94, 0.3)',
              borderRadius: 'var(--radius-sm)',
              marginBottom: '1.25rem',
              display: 'flex',
              gap: '0.5rem',
              alignItems: 'center',
              color: 'var(--accent-rose)',
              fontSize: '0.875rem',
            }}
          >
            <AlertCircle size={18} />
            <div style={{ flex: 1 }}>{error}</div>
            <button onClick={clearError} style={{ color: 'var(--text-muted)' }}>
              <X size={14} />
            </button>
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {/* Option 1: Freighter Wallet */}
          <div
            onClick={isLoading ? undefined : handleFreighter}
            style={{
              padding: '1.25rem',
              borderRadius: 'var(--radius-md)',
              background: 'rgba(255, 255, 255, 0.03)',
              border: '1px solid var(--border-card)',
              cursor: isLoading ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '1rem',
              transition: 'var(--transition)',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.borderColor = 'var(--accent-gold)')}
            onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'var(--border-card)')}
          >
            <div
              style={{
                width: 44,
                height: 44,
                borderRadius: 'var(--radius-sm)',
                background: 'rgba(226, 183, 20, 0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--accent-gold)',
              }}
            >
              <Wallet size={24} />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>Freighter Wallet</span>
                <span className="badge badge-stellar">Extension</span>
              </div>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
                Official Stellar non-custodial browser extension.
              </p>
            </div>
          </div>

          {/* Option 2: Instant Testnet Account */}
          <div
            onClick={isLoading ? undefined : handleInstantKeypair}
            style={{
              padding: '1.25rem',
              borderRadius: 'var(--radius-md)',
              background: 'rgba(255, 255, 255, 0.03)',
              border: '1px solid var(--border-card)',
              cursor: isLoading ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '1rem',
              transition: 'var(--transition)',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.borderColor = 'var(--accent-cyan)')}
            onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'var(--border-card)')}
          >
            <div
              style={{
                width: 44,
                height: 44,
                borderRadius: 'var(--radius-sm)',
                background: 'rgba(56, 189, 248, 0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--accent-cyan)',
              }}
            >
              <Zap size={24} />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                  Instant Testnet Dev Account
                </span>
                <span className="badge badge-success">Friendbot Funded</span>
              </div>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
                Automatically generates and funds 10,000 Testnet XLM via Stellar Friendbot.
              </p>
            </div>
          </div>
        </div>

        <div style={{ marginTop: '1.25rem', textAlign: 'center' }}>
          <button
            onClick={() => setShowCustomInput(!showCustomInput)}
            style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textDecoration: 'underline' }}
          >
            {showCustomInput ? 'Hide manual secret import' : 'Have an existing Testnet secret key? (Import)'}
          </button>
        </div>

        {showCustomInput && (
          <div style={{ marginTop: '0.75rem' }}>
            <input
              type="password"
              placeholder="S... (Stellar Testnet Secret Key)"
              value={customSecret}
              onChange={(e) => setCustomSecret(e.target.value)}
              style={{
                width: '100%',
                padding: '0.65rem 0.85rem',
                background: 'var(--bg-input)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-sm)',
                color: 'var(--text-primary)',
                fontFamily: 'var(--font-mono)',
              }}
            />
            <button
              onClick={handleInstantKeypair}
              className="btn-secondary"
              style={{ width: '100%', marginTop: '0.5rem' }}
            >
              Import & Connect
            </button>
          </div>
        )}

        <div
          style={{
            marginTop: '1.5rem',
            paddingTop: '1rem',
            borderTop: '1px solid var(--border-subtle)',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            fontSize: '0.75rem',
            color: 'var(--text-muted)',
          }}
        >
          <ShieldCheck size={16} color="var(--accent-emerald)" />
          <span>Non-custodial connection. Network strictly isolated to Stellar Testnet.</span>
        </div>
      </div>
    </div>
  );
};
