import React, { useState } from 'react';
import { DistributionAgreementVersion, Property } from '../types/index.ts';
import { useWallet } from '../context/WalletContext.tsx';
import { apiService } from '../services/apiService.ts';
import {
  X,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Lock,
  AlertCircle,
  FileText,
  Key,
  ExternalLink,
} from 'lucide-react';

interface AgreementApprovalModalProps {
  version: DistributionAgreementVersion;
  property: Property;
  isOpen: boolean;
  onClose: () => void;
  onVersionUpdated: () => void;
}

export const AgreementApprovalModal: React.FC<AgreementApprovalModalProps> = ({
  version,
  property,
  isOpen,
  onClose,
  onVersionUpdated,
}) => {
  const { wallet } = useWallet();
  const [isApproving, setIsApproving] = useState(false);
  const [isLocking, setIsLocking] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const currentStakeholder = version.stakeholders.find(
    (s) => s.wallet_address.toUpperCase() === (wallet.address || '').toUpperCase()
  );

  const canCurrentSign = currentStakeholder && !currentStakeholder.has_approved && version.status !== 'LOCKED';
  const isReadyToLock = version.status === 'READY_TO_LOCK' || version.stakeholders.every((s) => s.has_approved);

  const handleApprove = async () => {
    if (!wallet.address) {
      setErrorMessage('Please connect your Stellar Testnet wallet to approve.');
      return;
    }

    setIsApproving(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      await apiService.approveAgreementVersion(version.id, {
        stakeholderAddress: wallet.address,
        agreementHash: version.agreement_hash,
      });

      setSuccessMessage('Cryptographic approval successfully registered for this exact canonical agreement hash.');
      onVersionUpdated();
    } catch (err: any) {
      setErrorMessage(err.message || 'Approval failed.');
    } finally {
      setIsApproving(false);
    }
  };

  const handleLock = async () => {
    if (!wallet.address) {
      setErrorMessage('Please connect your wallet to lock the agreement.');
      return;
    }

    setIsLocking(true);
    setErrorMessage(null);
    try {
      await apiService.lockAgreementVersion(version.id, wallet.address);
      setSuccessMessage('Agreement locked successfully. Rules are now authoritative and immutable on-chain.');
      onVersionUpdated();
    } catch (err: any) {
      setErrorMessage(err.message || 'Locking agreement failed.');
    } finally {
      setIsLocking(false);
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className="modal-content"
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: 720, maxHeight: '90vh', overflowY: 'auto', padding: '2rem' }}
      >
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span className="badge badge-stellar">Version {version.version_number}</span>
              <span
                className={
                  version.status === 'LOCKED'
                    ? 'badge badge-success'
                    : version.status === 'READY_TO_LOCK'
                    ? 'badge badge-warning'
                    : 'badge badge-stellar'
                }
              >
                {version.status}
              </span>
            </div>
            <h3 style={{ fontSize: '1.35rem', fontWeight: 700, color: 'var(--text-primary)', marginTop: '0.35rem' }}>
              Review Distribution Agreement
            </h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              Property: <strong>{property.name}</strong> • Effective Date: {version.effective_date}
            </p>
          </div>
          <button onClick={onClose} style={{ color: 'var(--text-muted)', padding: '0.5rem' }}>
            <X size={20} />
          </button>
        </div>

        {errorMessage && (
          <div
            style={{
              padding: '0.85rem',
              background: 'rgba(244, 63, 94, 0.1)',
              border: '1px solid rgba(244, 63, 94, 0.3)',
              borderRadius: 'var(--radius-sm)',
              marginBottom: '1.25rem',
              color: 'var(--accent-rose)',
              fontSize: '0.85rem',
              display: 'flex',
              gap: '0.5rem',
              alignItems: 'center',
            }}
          >
            <AlertCircle size={18} />
            <div>{errorMessage}</div>
          </div>
        )}

        {successMessage && (
          <div
            style={{
              padding: '0.85rem',
              background: 'rgba(16, 185, 129, 0.1)',
              border: '1px solid rgba(16, 185, 129, 0.3)',
              borderRadius: 'var(--radius-sm)',
              marginBottom: '1.25rem',
              color: 'var(--accent-emerald)',
              fontSize: '0.85rem',
              display: 'flex',
              gap: '0.5rem',
              alignItems: 'center',
            }}
          >
            <CheckCircle2 size={18} />
            <div>{successMessage}</div>
          </div>
        )}

        {/* MATERIAL TERMS OVERVIEW */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {/* Canonical Hash Banner */}
          <div
            style={{
              padding: '0.85rem 1rem',
              background: 'rgba(226, 183, 20, 0.05)',
              border: '1px solid rgba(226, 183, 20, 0.25)',
              borderRadius: 'var(--radius-sm)',
            }}
          >
            <div style={{ fontSize: '0.75rem', color: 'var(--accent-gold)', fontWeight: 700 }}>
              DETERMINISTIC AGREEMENT HASH (SHA-256)
            </div>
            <div
              className="mono-text"
              style={{ fontSize: '0.8rem', color: 'var(--text-primary)', wordBreak: 'break-all', marginTop: '0.2rem' }}
            >
              {version.agreement_hash}
            </div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
              Signatures authorize this exact canonical byte representation. If any term is altered, the hash changes and approval fails.
            </div>
          </div>

          {/* Waterfall Cascade */}
          <div style={{ padding: '1rem', background: 'rgba(255, 255, 255, 0.02)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
            <h4 style={{ fontSize: '0.9rem', fontWeight: 700, marginBottom: '0.75rem', color: 'var(--accent-cyan)' }}>
              Waterfall Priority Rules
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {version.waterfall_rules.map((rule) => (
                <div
                  key={rule.id}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    padding: '0.45rem 0.65rem',
                    background: 'rgba(255, 255, 255, 0.02)',
                    borderRadius: 4,
                    fontSize: '0.8rem',
                  }}
                >
                  <div>
                    <span style={{ fontWeight: 600 }}>#{rule.priority} {rule.name}</span>
                    <span style={{ color: 'var(--text-muted)', marginLeft: '0.5rem' }}>({rule.description})</span>
                  </div>
                  <span style={{ fontWeight: 700, color: 'var(--accent-gold)' }}>
                    {rule.rule_type === 'FIXED_AMOUNT' ? `$${rule.amount_or_bps.toLocaleString()}` : `${(rule.amount_or_bps / 100).toFixed(2)}% (${rule.amount_or_bps} bps)`}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Stakeholder Allocation & Approval Status */}
          <div style={{ padding: '1rem', background: 'rgba(255, 255, 255, 0.02)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
            <h4 style={{ fontSize: '0.9rem', fontWeight: 700, marginBottom: '0.75rem', color: 'var(--accent-emerald)' }}>
              Stakeholder Multi-Party Approvals
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {version.stakeholders.map((st) => (
                <div
                  key={st.id}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '0.65rem 0.85rem',
                    background: 'rgba(255, 255, 255, 0.03)',
                    borderRadius: 4,
                    fontSize: '0.8rem',
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 600 }}>{st.name} ({st.role})</div>
                    <div className="mono-text" style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                      {st.wallet_address.substring(0, 10)}...{st.wallet_address.substring(st.wallet_address.length - 8)}
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{ textAlign: 'right' }}>
                      <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{(st.basis_points / 100).toFixed(2)}%</span>
                      <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'block' }}>{st.basis_points} bps</span>
                    </div>

                    <div>
                      {st.has_approved ? (
                        <span className="badge badge-success" style={{ fontSize: '0.7rem' }}>
                          <CheckCircle2 size={12} /> Approved
                        </span>
                      ) : (
                        <span className="badge badge-warning" style={{ fontSize: '0.7rem' }}>
                          <Clock size={12} /> Awaiting
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div style={{ marginTop: '2rem', display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', alignItems: 'center' }}>
          <button onClick={onClose} className="btn-secondary">
            Close
          </button>

          {canCurrentSign && (
            <button
              onClick={handleApprove}
              disabled={isApproving}
              className="btn-primary"
            >
              <Key size={16} /> {isApproving ? 'Signing with Wallet...' : 'Approve Agreement'}
            </button>
          )}

          {isReadyToLock && version.status !== 'LOCKED' && (
            <button
              onClick={handleLock}
              disabled={isLocking}
              className="btn-primary"
              style={{ background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', color: '#fff' }}
            >
              <Lock size={16} /> {isLocking ? 'Locking on Soroban...' : 'Lock Agreement (Immutable)'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
