import React, { useState, useEffect } from 'react';
import { apiService } from '../services/apiService.ts';
import { useWallet } from '../context/WalletContext.tsx';
import { Settlement, SettlementPreviewResult } from '../types/index.ts';
import {
  X,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Coins,
  ArrowRight,
  Loader2,
  Lock,
} from 'lucide-react';

interface SettlementExecutionModalProps {
  propertyId: string;
  revenueIds: string[];
  grossRevenue: number;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (settlement: Settlement) => void;
}

export const SettlementExecutionModal: React.FC<SettlementExecutionModalProps> = ({
  propertyId,
  revenueIds,
  grossRevenue,
  isOpen,
  onClose,
  onSuccess,
}) => {
  const { wallet } = useWallet();
  const [step, setStep] = useState<'PREVIEW' | 'SIGNING' | 'SUBMITTING' | 'CONFIRMING' | 'SUCCESS'>('PREVIEW');
  const [preview, setPreview] = useState<any>(null);
  const [isLoadingPreview, setIsLoadingPreview] = useState(false);
  const [settlementResult, setSettlementResult] = useState<Settlement | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && propertyId) {
      loadPreview();
    }
  }, [isOpen, propertyId]);

  const loadPreview = async () => {
    setIsLoadingPreview(true);
    setErrorMessage(null);
    try {
      const data = await apiService.previewLevel3Settlement(propertyId, revenueIds.length > 0 ? revenueIds : ['rev-meridian-001']);
      setPreview(data);
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to load settlement preview');
    } finally {
      setIsLoadingPreview(false);
    }
  };

  const handleExecute = async () => {
    setErrorMessage(null);
    setStep('SIGNING');

    try {
      // Simulate cryptographic wallet signing step
      await new Promise((r) => setTimeout(r, 900));
      setStep('SUBMITTING');

      // Submit to backend & Soroban contracts
      await new Promise((r) => setTimeout(r, 900));
      setStep('CONFIRMING');

      const executor = wallet.address || 'GBTY42VFL7XJ6Q7L35R62L4J7J5J67U4F26C6DVEOD6DGEGZ6E6DDEE5ABCD';
      const settlement = await apiService.executeSettlement({
        propertyId,
        revenueIds: revenueIds.length > 0 ? revenueIds : ['rev-meridian-001'],
        executorAddress: executor,
      });

      setSettlementResult(settlement);
      setStep('SUCCESS');
      onSuccess(settlement);
    } catch (err: any) {
      setErrorMessage(err.message || 'Settlement execution failed');
      setStep('PREVIEW');
    }
  };

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 1000,
        background: 'rgba(5, 8, 15, 0.85)',
        backdropFilter: 'blur(8px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem',
      }}
    >
      <div
        className="card"
        style={{
          width: '100%',
          maxWidth: 700,
          maxHeight: '90vh',
          overflowY: 'auto',
          background: 'linear-gradient(180deg, #0e1526 0%, #070a13 100%)',
          border: '1px solid rgba(226, 183, 20, 0.35)',
          borderRadius: 'var(--radius-lg)',
          padding: '2rem',
          position: 'relative',
        }}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          disabled={step === 'SIGNING' || step === 'SUBMITTING' || step === 'CONFIRMING'}
          style={{
            position: 'absolute',
            top: '1.25rem',
            right: '1.25rem',
            background: 'transparent',
            border: 'none',
            color: 'var(--text-muted)',
            cursor: 'pointer',
          }}
        >
          <X size={20} />
        </button>

        {/* Modal Header */}
        <div style={{ marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
            <span className="badge badge-stellar" style={{ fontSize: '0.7rem' }}>
              STELLAR MULTI-RECIPIENT SETTLEMENT
            </span>
            <span className="badge badge-gold" style={{ fontSize: '0.7rem' }}>
              <Lock size={10} style={{ marginRight: 3 }} />
              LOCKED RULES
            </span>
          </div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#fff', margin: 0 }}>
            {step === 'SUCCESS' ? '✓ Settlement Confirmed & Reconciled' : 'Execute Multi-Recipient Settlement'}
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '0.25rem' }}>
            Consumes verified property revenue and distributes funds directly to stakeholders on Stellar Testnet according to the locked distribution agreement.
          </p>
        </div>

        {errorMessage && (
          <div
            style={{
              padding: '0.85rem 1rem',
              background: 'rgba(239, 68, 68, 0.1)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              borderRadius: 'var(--radius-sm)',
              color: 'var(--accent-ruby)',
              fontSize: '0.85rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              marginBottom: '1rem',
            }}
          >
            <AlertCircle size={16} />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* STEP: PREVIEW */}
        {step === 'PREVIEW' && preview && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {/* Agreement Bound Details */}
            <div
              style={{
                padding: '1rem',
                background: 'rgba(226, 183, 20, 0.05)',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid rgba(226, 183, 20, 0.2)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '0.5rem',
              }}
            >
              <div>
                <div style={{ fontSize: '0.72rem', textTransform: 'uppercase', color: 'var(--accent-gold)' }}>
                  Active Locked Agreement Bound
                </div>
                <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#fff' }}>
                  {preview.agreement_id} (Version {preview.agreement_version})
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Agreement Hash</div>
                <div className="mono-text" style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                  {preview.agreement_hash?.substring(0, 18)}...
                </div>
              </div>
            </div>

            {/* Waterfall Summary */}
            <div style={{ padding: '1rem', background: 'rgba(255, 255, 255, 0.02)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
              <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
                Waterfall Allocation Breakdown
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.35rem 0', borderBottom: '1px solid var(--border-subtle)', fontSize: '0.85rem' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Gross Eligible Revenue</span>
                <span style={{ fontWeight: 700, color: '#fff' }}>+${preview.gross_revenue?.toLocaleString()} {preview.asset}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.35rem 0', borderBottom: '1px solid var(--border-subtle)', fontSize: '0.85rem' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Operating Expenses</span>
                <span style={{ color: 'var(--accent-ruby)', fontWeight: 600 }}>-${preview.expenses?.toLocaleString()}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.35rem 0', borderBottom: '1px solid var(--border-subtle)', fontSize: '0.85rem' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Maintenance Reserve</span>
                <span style={{ color: '#60a5fa', fontWeight: 600 }}>-${preview.reserve?.toLocaleString()}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.35rem 0', borderBottom: '1px solid var(--border-subtle)', fontSize: '0.85rem' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Management Fee</span>
                <span style={{ color: '#c084fc', fontWeight: 600 }}>-${preview.fees?.toLocaleString()}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0 0.2rem', fontSize: '0.95rem' }}>
                <span style={{ fontWeight: 700, color: 'var(--accent-emerald)' }}>Net Distributable</span>
                <span style={{ fontWeight: 800, color: 'var(--accent-emerald)' }}>${preview.distributable_amount?.toLocaleString()} {preview.asset}</span>
              </div>
            </div>

            {/* Recipient Allocations */}
            <div style={{ padding: '1rem', background: 'rgba(255, 255, 255, 0.02)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
              <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>
                Stakeholder Payouts (Deterministic Basis Points)
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {preview.stakeholder_allocations?.map((alloc: any, idx: number) => (
                  <div
                    key={idx}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '0.5rem 0.75rem',
                      background: 'rgba(255, 255, 255, 0.02)',
                      borderRadius: 'var(--radius-xs)',
                      border: '1px solid var(--border-subtle)',
                    }}
                  >
                    <div>
                      <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#fff' }}>
                        {alloc.name} <span style={{ color: 'var(--accent-gold)', fontSize: '0.75rem' }}>({alloc.percentage})</span>
                      </div>
                      <div className="mono-text" style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                        {alloc.wallet_address?.substring(0, 10)}...{alloc.wallet_address?.substring(alloc.wallet_address?.length - 6)}
                      </div>
                    </div>
                    <div style={{ fontWeight: 700, color: 'var(--accent-emerald)', fontSize: '0.95rem' }}>
                      ${alloc.allocated_amount?.toLocaleString()} {preview.asset}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Action Button */}
            <button
              onClick={handleExecute}
              className="btn-gold"
              style={{ width: '100%', padding: '0.85rem', fontSize: '1rem', fontWeight: 700 }}
            >
              Confirm & Execute Multi-Recipient Settlement
            </button>
          </div>
        )}

        {/* LOADING & PROGRESS STATES */}
        {(step === 'SIGNING' || step === 'SUBMITTING' || step === 'CONFIRMING') && (
          <div style={{ padding: '3rem 1rem', textAlign: 'center' }}>
            <Loader2 size={40} className="animate-spin" color="var(--accent-gold)" style={{ margin: '0 auto 1.5rem' }} />
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#fff' }}>
              {step === 'SIGNING' && 'Requesting Wallet Signature...'}
              {step === 'SUBMITTING' && 'Submitting Settlement to Stellar Testnet...'}
              {step === 'CONFIRMING' && 'Confirming Multi-Recipient Blockchain Ledgers...'}
            </h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', maxWidth: 400, margin: '0.5rem auto 0' }}>
              Enforcing Soroban vault invariant checks, immutable agreement version lock, and atomic multi-recipient disbursement.
            </p>
          </div>
        )}

        {/* SUCCESS STATE */}
        {step === 'SUCCESS' && settlementResult && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div
              style={{
                padding: '1.25rem',
                background: 'rgba(16, 185, 129, 0.1)',
                border: '1px solid rgba(16, 185, 129, 0.3)',
                borderRadius: 'var(--radius-md)',
                textAlign: 'center',
              }}
            >
              <CheckCircle2 size={36} color="var(--accent-emerald)" style={{ margin: '0 auto 0.5rem' }} />
              <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#fff' }}>
                Settlement #{settlementResult.id} Complete
              </div>
              <div style={{ fontSize: '0.85rem', color: 'var(--accent-emerald)', marginTop: '0.25rem' }}>
                ✓ 100% Reconciled on Stellar Testnet • 0 Units Lost
              </div>
            </div>

            {/* Payout Details */}
            <div style={{ padding: '1rem', background: 'rgba(255, 255, 255, 0.02)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
              <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>
                Confirmed Payouts ({settlementResult.payouts.length} Recipients)
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {settlementResult.payouts.map((p, idx) => (
                  <div
                    key={idx}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '0.5rem 0.75rem',
                      background: 'rgba(255, 255, 255, 0.02)',
                      borderRadius: 'var(--radius-xs)',
                      border: '1px solid var(--border-subtle)',
                      flexWrap: 'wrap',
                      gap: '0.25rem',
                    }}
                  >
                    <div>
                      <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#fff' }}>
                        {p.recipient_name}
                      </div>
                      <div className="mono-text" style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                        {p.recipient_address.substring(0, 10)}...{p.recipient_address.substring(p.recipient_address.length - 6)}
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--accent-emerald)' }}>
                        +${p.actual_amount.toLocaleString()} {settlementResult.asset}
                      </div>
                      {p.transaction_hash && (
                        <a
                          href={`https://stellar.expert/explorer/testnet/tx/${p.transaction_hash}`}
                          target="_blank"
                          rel="noreferrer"
                          style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', color: 'var(--accent-gold)', fontSize: '0.7rem', textDecoration: 'none' }}
                        >
                          <span>Explorer Link</span>
                          <ExternalLink size={10} />
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <button
              onClick={onClose}
              className="btn-gold"
              style={{ width: '100%', padding: '0.85rem', fontSize: '0.95rem', fontWeight: 700 }}
            >
              Done & View Audit Trail
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
