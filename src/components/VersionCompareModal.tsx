import React from 'react';
import { DistributionAgreementVersion, Property } from '../types/index.ts';
import { X, ArrowRight, GitCompare, CheckCircle2, Clock, Lock } from 'lucide-react';

interface VersionCompareModalProps {
  versionA: DistributionAgreementVersion;
  versionB: DistributionAgreementVersion;
  property: Property;
  isOpen: boolean;
  onClose: () => void;
}

export const VersionCompareModal: React.FC<VersionCompareModalProps> = ({
  versionA,
  versionB,
  property,
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className="modal-content"
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: 880, maxHeight: '90vh', overflowY: 'auto', padding: '2rem' }}
      >
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span className="badge badge-future">Version Diff Inspection</span>
              <span className="badge badge-stellar">{property.name}</span>
            </div>
            <h3 style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--text-primary)', marginTop: '0.35rem' }}>
              Compare Agreement Versions (v{versionA.version_number} vs v{versionB.version_number})
            </h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              Inspect material modifications in waterfall rules, basis points, and stakeholder allocations.
            </p>
          </div>
          <button onClick={onClose} style={{ color: 'var(--text-muted)', padding: '0.5rem' }}>
            <X size={20} />
          </button>
        </div>

        {/* Side-by-Side Comparison */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
          {/* Version A */}
          <div
            style={{
              padding: '1.25rem',
              background: 'rgba(255, 255, 255, 0.02)',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--border-subtle)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <div>
                <h4 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Version {versionA.version_number}</h4>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Effective: {versionA.effective_date}</div>
              </div>
              <span className={versionA.status === 'LOCKED' ? 'badge badge-success' : 'badge badge-stellar'}>
                {versionA.status}
              </span>
            </div>

            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
              Agreement Hash:
            </div>
            <div className="mono-text" style={{ fontSize: '0.7rem', color: 'var(--accent-cyan)', wordBreak: 'break-all', marginBottom: '1.25rem' }}>
              {versionA.agreement_hash}
            </div>

            {/* Waterfall */}
            <div style={{ marginBottom: '1.25rem' }}>
              <h5 style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--accent-gold)', marginBottom: '0.5rem' }}>
                Waterfall Rules
              </h5>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                {versionA.waterfall_rules.map((r) => (
                  <div key={r.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', padding: '0.3rem', background: 'rgba(255, 255, 255, 0.02)' }}>
                    <span>{r.name}</span>
                    <span style={{ fontWeight: 600 }}>
                      {r.rule_type === 'FIXED_AMOUNT' ? `$${r.amount_or_bps}` : `${(r.amount_or_bps / 100).toFixed(1)}%`}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Stakeholders */}
            <div>
              <h5 style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--accent-emerald)', marginBottom: '0.5rem' }}>
                Stakeholder Allocations
              </h5>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                {versionA.stakeholders.map((s) => (
                  <div key={s.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', padding: '0.3rem', background: 'rgba(255, 255, 255, 0.02)' }}>
                    <span>{s.name}</span>
                    <span style={{ fontWeight: 700, color: 'var(--accent-gold)' }}>{(s.basis_points / 100).toFixed(1)}% ({s.basis_points} bps)</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Version B */}
          <div
            style={{
              padding: '1.25rem',
              background: 'rgba(255, 255, 255, 0.02)',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--border-card)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <div>
                <h4 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Version {versionB.version_number}</h4>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Effective: {versionB.effective_date}</div>
              </div>
              <span className={versionB.status === 'LOCKED' ? 'badge badge-success' : 'badge badge-warning'}>
                {versionB.status}
              </span>
            </div>

            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
              Agreement Hash:
            </div>
            <div className="mono-text" style={{ fontSize: '0.7rem', color: 'var(--accent-cyan)', wordBreak: 'break-all', marginBottom: '1.25rem' }}>
              {versionB.agreement_hash}
            </div>

            {/* Waterfall */}
            <div style={{ marginBottom: '1.25rem' }}>
              <h5 style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--accent-gold)', marginBottom: '0.5rem' }}>
                Waterfall Rules
              </h5>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                {versionB.waterfall_rules.map((r) => (
                  <div key={r.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', padding: '0.3rem', background: 'rgba(255, 255, 255, 0.02)' }}>
                    <span>{r.name}</span>
                    <span style={{ fontWeight: 600 }}>
                      {r.rule_type === 'FIXED_AMOUNT' ? `$${r.amount_or_bps}` : `${(r.amount_or_bps / 100).toFixed(1)}%`}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Stakeholders */}
            <div>
              <h5 style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--accent-emerald)', marginBottom: '0.5rem' }}>
                Stakeholder Allocations
              </h5>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                {versionB.stakeholders.map((s) => (
                  <div key={s.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', padding: '0.3rem', background: 'rgba(255, 255, 255, 0.02)' }}>
                    <span>{s.name}</span>
                    <span style={{ fontWeight: 700, color: 'var(--accent-gold)' }}>{(s.basis_points / 100).toFixed(1)}% ({s.basis_points} bps)</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'flex-end' }}>
          <button onClick={onClose} className="btn-primary">
            Close Diff
          </button>
        </div>
      </div>
    </div>
  );
};
