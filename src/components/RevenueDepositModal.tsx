import React, { useState } from 'react';
import { Property, DepositLifecycleState } from '../types/index.ts';
import { useWallet } from '../context/WalletContext.tsx';
import { stellarService, STELLAR_EXPERT_EXPLORER } from '../services/stellarService.ts';
import { apiService } from '../services/apiService.ts';
import {
  X,
  Building2,
  DollarSign,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  ExternalLink,
  Loader2,
  Send,
  Lock,
} from 'lucide-react';

interface RevenueDepositModalProps {
  property: Property;
  isOpen: boolean;
  onClose: () => void;
  onRevenueConfirmed: () => void;
}

export const RevenueDepositModal: React.FC<RevenueDepositModalProps> = ({
  property,
  isOpen,
  onClose,
  onRevenueConfirmed,
}) => {
  const { wallet, cachedSecretKey, refreshBalance } = useWallet();

  const [revenueSource, setRevenueSource] = useState('RENTAL_REVENUE');
  const [depositAmount, setDepositAmount] = useState('100.00');
  const [assetType] = useState('XLM');
  const [depositState, setDepositState] = useState<DepositLifecycleState>('READY');
  const [statusMessage, setStatusMessage] = useState<string>('');
  const [txHash, setTxHash] = useState<string | null>(null);
  const [confirmedLedger, setConfirmedLedger] = useState<number | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleStartProcess = () => {
    if (!wallet.isConnected) {
      setDepositState('WALLET_REQUIRED');
      return;
    }
    setDepositState('REVIEW');
  };

  const handleExecuteDeposit = async () => {
    if (!wallet.address) {
      setDepositState('WALLET_REQUIRED');
      return;
    }

    try {
      setErrorMessage(null);

      // 1. SIGNING
      setDepositState('SIGNING');
      setStatusMessage('Requesting cryptographic signature for Stellar Testnet payment...');

      // 2. SUBMITTING
      setDepositState('SUBMITTING');
      setStatusMessage('Broadcasting signed transaction to Stellar Testnet Horizon validators...');

      const result = await stellarService.submitRevenuePayment({
        sourcePublicKey: wallet.address,
        sourceSecretKey: cachedSecretKey || undefined,
        destinationVault: property.vault_stellar_address,
        amount: depositAmount,
        memoText: `REV-${property.id.substring(0, 10)}`,
        useFreighter: wallet.walletType === 'FREIGHTER',
      });

      setTxHash(result.hash);
      setConfirmedLedger(result.ledger);

      // 3. CONFIRMING & INDEPENDENT VERIFICATION
      setDepositState('CONFIRMING');
      setStatusMessage('Submitting transaction hash to Stellar Estate Core for independent verification...');

      // Call backend verification
      await apiService.verifyDeposit({
        propertyId: property.id,
        transactionHash: result.hash,
        source: revenueSource,
        depositorAddress: wallet.address,
      });

      // 4. CONFIRMED
      setDepositState('CONFIRMED');
      setStatusMessage('Transaction independently verified on Stellar Testnet and recorded in property financials.');
      await refreshBalance();
      onRevenueConfirmed();
    } catch (err: any) {
      console.error('Deposit error:', err);
      setDepositState('FAILED');
      setErrorMessage(err.message || 'Transaction execution or verification failed.');
    }
  };

  const resetModal = () => {
    setDepositState('READY');
    setTxHash(null);
    setConfirmedLedger(null);
    setErrorMessage(null);
    setStatusMessage('');
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ padding: '2rem' }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span className="badge badge-stellar">Testnet Deposit</span>
              <span className="mono-text" style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                Vault: {property.vault_stellar_address.substring(0, 8)}...
              </span>
            </div>
            <h3 style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--text-primary)', marginTop: '0.35rem' }}>
              Deposit Property Revenue
            </h3>
          </div>
          <button onClick={onClose} style={{ color: 'var(--text-muted)', padding: '0.5rem' }}>
            <X size={20} />
          </button>
        </div>

        {/* State Indicator */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: 'rgba(255, 255, 255, 0.03)',
            padding: '0.65rem 1rem',
            borderRadius: 'var(--radius-sm)',
            marginBottom: '1.5rem',
            fontSize: '0.8rem',
            border: '1px solid var(--border-subtle)',
          }}
        >
          <span style={{ color: 'var(--text-muted)' }}>Status:</span>
          <span
            className={
              depositState === 'CONFIRMED'
                ? 'badge badge-success'
                : depositState === 'FAILED'
                ? 'badge badge-warning'
                : 'badge badge-stellar'
            }
          >
            {depositState}
          </span>
        </div>

        {/* BODY BY STATE */}

        {/* STATE: READY / INPUT FORM */}
        {depositState === 'READY' && (
          <div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {/* Property summary */}
              <div
                style={{
                  padding: '1rem',
                  background: 'rgba(255, 255, 255, 0.02)',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--border-subtle)',
                }}
              >
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Target Property</div>
                <div style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)' }}>{property.name}</div>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{property.location}</div>
              </div>

              {/* Revenue Source */}
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>
                  Revenue Source
                </label>
                <select
                  value={revenueSource}
                  onChange={(e) => setRevenueSource(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.65rem 0.85rem',
                    background: 'var(--bg-input)',
                    border: '1px solid var(--border-card)',
                    borderRadius: 'var(--radius-sm)',
                    color: 'var(--text-primary)',
                  }}
                >
                  <option value="RENTAL_REVENUE">Monthly Residential Rental Revenue</option>
                  <option value="COMMERCIAL_LEASE">Commercial Ground Lease Payment</option>
                  <option value="PARKING_FACILITY">Ancillary Parking & Amenity Income</option>
                </select>
              </div>

              {/* Amount & Asset */}
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>
                  Revenue Amount (Stellar Testnet)
                </label>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <input
                    type="number"
                    step="0.01"
                    min="1"
                    value={depositAmount}
                    onChange={(e) => setDepositAmount(e.target.value)}
                    style={{
                      flex: 1,
                      padding: '0.65rem 0.85rem',
                      background: 'var(--bg-input)',
                      border: '1px solid var(--border-card)',
                      borderRadius: 'var(--radius-sm)',
                      color: 'var(--text-primary)',
                      fontFamily: 'var(--font-mono)',
                      fontWeight: 600,
                    }}
                  />
                  <div
                    style={{
                      padding: '0.65rem 1rem',
                      background: 'rgba(255, 255, 255, 0.05)',
                      border: '1px solid var(--border-card)',
                      borderRadius: 'var(--radius-sm)',
                      color: 'var(--accent-gold)',
                      fontWeight: 700,
                      display: 'flex',
                      alignItems: 'center',
                    }}
                  >
                    {assetType}
                  </div>
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.35rem' }}>
                  Simulates property operating income flowing directly into the property vault.
                </div>
              </div>
            </div>

            <div style={{ marginTop: '2rem', display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
              <button onClick={onClose} className="btn-secondary">
                Cancel
              </button>
              <button onClick={handleStartProcess} className="btn-primary">
                Review Deposit <ArrowRight size={16} />
              </button>
            </div>
          </div>
        )}

        {/* STATE: WALLET_REQUIRED */}
        {depositState === 'WALLET_REQUIRED' && (
          <div style={{ textAlign: 'center', padding: '1rem 0' }}>
            <div
              style={{
                width: 50,
                height: 50,
                borderRadius: '50%',
                background: 'rgba(245, 158, 11, 0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 1rem',
                color: 'var(--accent-amber)',
              }}
            >
              <AlertTriangle size={26} />
            </div>
            <h4 style={{ fontSize: '1.15rem', color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
              Stellar Testnet Wallet Required
            </h4>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
              To deposit real revenue into the property vault, please connect your Testnet wallet or generate an instant testnet account.
            </p>
            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
              <button onClick={resetModal} className="btn-secondary">
                Back
              </button>
              <button onClick={onClose} className="btn-primary">
                Connect Wallet
              </button>
            </div>
          </div>
        )}

        {/* STATE: REVIEW */}
        {depositState === 'REVIEW' && (
          <div>
            <div
              style={{
                padding: '1.25rem',
                background: 'rgba(255, 255, 255, 0.02)',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-card)',
                marginBottom: '1.5rem',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '0.75rem', borderBottom: '1px solid var(--border-subtle)' }}>
                <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Property:</span>
                <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{property.name}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.75rem 0', borderBottom: '1px solid var(--border-subtle)' }}>
                <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Source:</span>
                <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{revenueSource}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.75rem 0', borderBottom: '1px solid var(--border-subtle)' }}>
                <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Amount:</span>
                <span style={{ fontWeight: 700, color: 'var(--accent-gold)' }}>{depositAmount} {assetType}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.75rem 0', borderBottom: '1px solid var(--border-subtle)' }}>
                <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>From Account:</span>
                <span className="mono-text" style={{ fontSize: '0.75rem', color: 'var(--text-primary)' }}>
                  {wallet.address?.substring(0, 10)}...{wallet.address?.substring(wallet.address.length - 8)}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '0.75rem' }}>
                <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Destination Vault:</span>
                <span className="mono-text" style={{ fontSize: '0.75rem', color: 'var(--accent-cyan)' }}>
                  {property.vault_stellar_address.substring(0, 10)}...{property.vault_stellar_address.substring(property.vault_stellar_address.length - 8)}
                </span>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
              <button onClick={resetModal} className="btn-secondary">
                Back
              </button>
              <button onClick={handleExecuteDeposit} className="btn-primary">
                <Send size={16} /> Sign & Submit to Testnet
              </button>
            </div>
          </div>
        )}

        {/* STATE: SIGNING / SUBMITTING / CONFIRMING */}
        {(depositState === 'SIGNING' || depositState === 'SUBMITTING' || depositState === 'CONFIRMING') && (
          <div style={{ textAlign: 'center', padding: '2rem 1rem' }}>
            <Loader2
              size={48}
              color="var(--accent-gold)"
              style={{ animation: 'spin 1.5s linear infinite', margin: '0 auto 1.5rem' }}
            />
            <h4 style={{ fontSize: '1.2rem', color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
              {depositState === 'SIGNING' && 'Signing Transaction...'}
              {depositState === 'SUBMITTING' && 'Broadcasting to Stellar Testnet...'}
              {depositState === 'CONFIRMING' && 'Verifying with Core Independent Verifier...'}
            </h4>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', maxWidth: 400, margin: '0 auto' }}>
              {statusMessage}
            </p>
          </div>
        )}

        {/* STATE: CONFIRMED */}
        {depositState === 'CONFIRMED' && (
          <div style={{ textAlign: 'center', padding: '1rem 0' }}>
            <div
              style={{
                width: 56,
                height: 56,
                borderRadius: '50%',
                background: 'rgba(16, 185, 129, 0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 1rem',
                color: 'var(--accent-emerald)',
              }}
            >
              <CheckCircle2 size={32} />
            </div>
            <h4 style={{ fontSize: '1.35rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
              Revenue Confirmed
            </h4>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
              The property revenue payment of <strong>{depositAmount} {assetType}</strong> has been successfully settled on Stellar Testnet and immutably recorded in the property financials.
            </p>

            {txHash && (
              <div
                style={{
                  padding: '1rem',
                  background: 'rgba(255, 255, 255, 0.03)',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--border-subtle)',
                  textAlign: 'left',
                  marginBottom: '1.5rem',
                }}
              >
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Transaction Identifier (Hash)</div>
                <div className="mono-text" style={{ fontSize: '0.8rem', color: 'var(--accent-cyan)', wordBreak: 'break-all', margin: '0.25rem 0 0.75rem' }}>
                  {txHash}
                </div>
                {confirmedLedger && (
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    Ledger Sequence: <span className="mono-text" style={{ color: 'var(--text-primary)' }}>#{confirmedLedger}</span>
                  </div>
                )}
                <div style={{ marginTop: '0.75rem' }}>
                  <a
                    href={`${STELLAR_EXPERT_EXPLORER}/${txHash}`}
                    target="_blank"
                    rel="noreferrer"
                    className="btn-secondary"
                    style={{ fontSize: '0.8rem', padding: '0.4rem 0.8rem', display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}
                  >
                    View on Stellar.Expert Explorer <ExternalLink size={14} />
                  </a>
                </div>
              </div>
            )}

            <button onClick={onClose} className="btn-primary" style={{ width: '100%' }}>
              Return to Property Profile
            </button>
          </div>
        )}

        {/* STATE: FAILED */}
        {depositState === 'FAILED' && (
          <div style={{ textAlign: 'center', padding: '1rem 0' }}>
            <div
              style={{
                width: 56,
                height: 56,
                borderRadius: '50%',
                background: 'rgba(244, 63, 94, 0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 1rem',
                color: 'var(--accent-rose)',
              }}
            >
              <AlertTriangle size={32} />
            </div>
            <h4 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
              Transaction Failed
            </h4>
            <p style={{ fontSize: '0.85rem', color: 'var(--accent-rose)', marginBottom: '1.5rem' }}>
              {errorMessage}
            </p>
            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
              <button onClick={onClose} className="btn-secondary">
                Close
              </button>
              <button onClick={resetModal} className="btn-primary">
                Try Again
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
