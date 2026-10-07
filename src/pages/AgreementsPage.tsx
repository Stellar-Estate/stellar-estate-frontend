import React, { useState, useEffect } from 'react';
import {
  Property,
  DistributionAgreement,
  DistributionAgreementVersion,
} from '../types/index.ts';
import { apiService } from '../services/apiService.ts';
import { useWallet } from '../context/WalletContext.tsx';
import { WaterfallBuilder } from '../components/WaterfallBuilder.tsx';
import { AgreementApprovalModal } from '../components/AgreementApprovalModal.tsx';
import { SettlementPreviewModal } from '../components/SettlementPreviewModal.tsx';
import { VersionCompareModal } from '../components/VersionCompareModal.tsx';
import {
  FileText,
  Lock,
  Clock,
  CheckCircle2,
  AlertCircle,
  Plus,
  GitCompare,
  TrendingUp,
  ShieldCheck,
  Building2,
  ExternalLink,
  Coins,
  Layers,
} from 'lucide-react';

interface AgreementsPageProps {
  properties: Property[];
  selectedProperty?: Property | null;
}

export const AgreementsPage: React.FC<AgreementsPageProps> = ({
  properties,
  selectedProperty: initialProperty,
}) => {
  const { wallet } = useWallet();
  const [activeProperty, setActiveProperty] = useState<Property>(
    initialProperty || properties[0] || ({} as Property)
  );

  const [agreements, setAgreements] = useState<DistributionAgreement[]>([]);
  const [selectedVersion, setSelectedVersion] = useState<DistributionAgreementVersion | null>(null);

  // Modals
  const [isBuilderOpen, setIsBuilderOpen] = useState(false);
  const [isApprovalOpen, setIsApprovalOpen] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isCompareOpen, setIsCompareOpen] = useState(false);
  const [proposingVersionForId, setProposingVersionForId] = useState<string | undefined>(undefined);

  const loadAgreements = async (propId: string) => {
    try {
      const data = await apiService.getPropertyAgreements(propId);
      setAgreements(data);
      if (data.length > 0 && data[0].versions.length > 0) {
        // default select latest or locked
        const activeVer = data[0].versions.find((v) => v.status === 'LOCKED') || data[0].versions[0];
        setSelectedVersion(activeVer);
      } else {
        setSelectedVersion(null);
      }
    } catch (err) {
      console.error('Failed to load agreements:', err);
    }
  };

  useEffect(() => {
    if (activeProperty?.id) {
      loadAgreements(activeProperty.id);
    }
  }, [activeProperty?.id]);

  const primaryAgreement = agreements[0];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1.5rem' }}>
        <div>
          <div className="section-tag">
            <Layers size={16} /> Level 2 Governance Core
          </div>
          <h1 className="section-title">Property Distribution Agreements</h1>
          <p className="section-subtitle">
            Authoritative, multi-party approved financial waterfall rules enforced on Soroban. Immutable rules govern future Level 3 settlements.
          </p>
        </div>

        {/* Property Selector & New Agreement CTA */}
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <select
            value={activeProperty?.id}
            onChange={(e) => {
              const p = properties.find((prop) => prop.id === e.target.value);
              if (p) setActiveProperty(p);
            }}
            style={{
              padding: '0.65rem 1rem',
              background: 'var(--bg-card)',
              border: '1px solid var(--border-card)',
              borderRadius: 'var(--radius-sm)',
              color: 'var(--text-primary)',
              fontSize: '0.9rem',
              fontWeight: 600,
            }}
          >
            {properties.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name} ({p.location})
              </option>
            ))}
          </select>

          <button
            onClick={() => {
              setProposingVersionForId(undefined);
              setIsBuilderOpen(true);
            }}
            className="btn-primary"
            style={{ fontSize: '0.875rem' }}
          >
            <Plus size={16} /> New Agreement
          </button>
        </div>
      </div>

      {/* Main Grid: Versions on left, Selected Version details on right */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 2.2fr)', gap: '1.5rem' }}>
        {/* Left Column: Version History & Switcher */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div className="glass-card" style={{ padding: '1.5rem' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <FileText size={18} color="var(--accent-gold)" /> Agreement Versions
            </h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '1.25rem' }}>
              Immutable version history for <strong>{primaryAgreement?.agreement_identifier || 'Agreements'}</strong>
            </p>

            {primaryAgreement?.versions && primaryAgreement.versions.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {primaryAgreement.versions.map((v) => {
                  const isSelected = selectedVersion?.id === v.id;
                  return (
                    <div
                      key={v.id}
                      onClick={() => setSelectedVersion(v)}
                      style={{
                        padding: '1rem',
                        borderRadius: 'var(--radius-sm)',
                        background: isSelected ? 'rgba(226, 183, 20, 0.08)' : 'rgba(255, 255, 255, 0.02)',
                        border: `1px solid ${isSelected ? 'var(--accent-gold)' : 'var(--border-subtle)'}`,
                        cursor: 'pointer',
                        transition: 'var(--transition)',
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                        <span style={{ fontWeight: 700, fontSize: '0.95rem' }}>Version {v.version_number}</span>
                        <span
                          className={
                            v.status === 'LOCKED'
                              ? 'badge badge-success'
                              : v.status === 'READY_TO_LOCK'
                              ? 'badge badge-warning'
                              : 'badge badge-stellar'
                          }
                          style={{ fontSize: '0.65rem' }}
                        >
                          {v.status === 'LOCKED' && <Lock size={10} />}
                          {v.status}
                        </span>
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        Effective: {v.effective_date} • {v.accepted_asset}
                      </div>
                      <div className="mono-text" style={{ fontSize: '0.7rem', color: 'var(--accent-cyan)', marginTop: '0.4rem' }}>
                        Hash: {v.agreement_hash.substring(0, 12)}...
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '2rem 1rem', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                No agreements defined yet. Click "New Agreement" to configure the waterfall.
              </div>
            )}

            {primaryAgreement && primaryAgreement.versions.length >= 2 && (
              <button
                onClick={() => setIsCompareOpen(true)}
                className="btn-secondary"
                style={{ width: '100%', marginTop: '1.25rem', fontSize: '0.8rem' }}
              >
                <GitCompare size={14} /> Compare Versions (v1 vs v2)
              </button>
            )}

            {primaryAgreement && (
              <button
                onClick={() => {
                  setProposingVersionForId(primaryAgreement.id);
                  setIsBuilderOpen(true);
                }}
                className="btn-outline-gold"
                style={{ width: '100%', marginTop: '0.75rem', fontSize: '0.8rem' }}
              >
                <Plus size={14} /> Propose New Version
              </button>
            )}
          </div>
        </div>

        {/* Right Column: Detailed Agreement View */}
        {selectedVersion ? (
          <div className="glass-card" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
            {/* Top Status Bar */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
                  <span className="badge badge-stellar">Version {selectedVersion.version_number}</span>
                  <span
                    className={
                      selectedVersion.status === 'LOCKED'
                        ? 'badge badge-success'
                        : selectedVersion.status === 'READY_TO_LOCK'
                        ? 'badge badge-warning'
                        : 'badge badge-stellar'
                    }
                  >
                    {selectedVersion.status === 'LOCKED' && <Lock size={12} />} {selectedVersion.status}
                  </span>
                </div>
                <h2 style={{ fontSize: '1.6rem', fontWeight: 800 }}>
                  {primaryAgreement?.agreement_identifier} — Version {selectedVersion.version_number}
                </h2>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                  Revenue Source: <strong>{selectedVersion.revenue_source}</strong> • Settlement Asset: <strong>{selectedVersion.accepted_asset}</strong>
                </div>
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                <button
                  onClick={() => setIsPreviewOpen(true)}
                  className="btn-secondary"
                  style={{ fontSize: '0.85rem' }}
                >
                  <TrendingUp size={15} /> Settlement Preview
                </button>
                <button
                  onClick={() => setIsApprovalOpen(true)}
                  className="btn-primary"
                  style={{ fontSize: '0.85rem' }}
                >
                  <CheckCircle2 size={15} /> Review & Approvals
                </button>
              </div>
            </div>

            {/* Immutability Banner if LOCKED */}
            {selectedVersion.status === 'LOCKED' && (
              <div
                style={{
                  padding: '1rem',
                  background: 'rgba(16, 185, 129, 0.08)',
                  border: '1px solid rgba(16, 185, 129, 0.3)',
                  borderRadius: 'var(--radius-sm)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                }}
              >
                <Lock size={20} color="var(--accent-emerald)" style={{ flexShrink: 0 }} />
                <div style={{ fontSize: '0.825rem', color: 'var(--text-primary)' }}>
                  <strong>LOCKED & AUTHORITATIVE RULE SET:</strong> This agreement was locked on{' '}
                  <span className="mono-text">{new Date(selectedVersion.locked_at || selectedVersion.created_at).toLocaleString()}</span>. Financial terms and percentages are permanently immutable on-chain. Amendments require proposing a new version.
                </div>
              </div>
            )}

            {/* Canonical Hash Box */}
            <div
              style={{
                padding: '1rem',
                background: 'rgba(255, 255, 255, 0.02)',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--border-subtle)',
              }}
            >
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                DETERMINISTIC CANONICAL AGREEMENT HASH (SHA-256):
              </div>
              <div className="mono-text" style={{ fontSize: '0.85rem', color: 'var(--accent-gold)', wordBreak: 'break-all', marginTop: '0.25rem' }}>
                {selectedVersion.agreement_hash}
              </div>
              {selectedVersion.contract_reference && (
                <div style={{ fontSize: '0.75rem', color: 'var(--accent-cyan)', marginTop: '0.4rem' }}>
                  Soroban Contract Ref: <span className="mono-text">{selectedVersion.contract_reference}</span>
                </div>
              )}
            </div>

            {/* Waterfall Deduction Hierarchy */}
            <div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '0.75rem', color: 'var(--accent-cyan)' }}>
                Waterfall Priority Cascade
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                {selectedVersion.waterfall_rules.map((rule) => (
                  <div
                    key={rule.id}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '0.75rem 1rem',
                      background: 'rgba(255, 255, 255, 0.02)',
                      borderRadius: 'var(--radius-sm)',
                      border: '1px solid var(--border-subtle)',
                    }}
                  >
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span className="badge badge-stellar" style={{ fontSize: '0.7rem' }}>
                          Priority #{rule.priority}
                        </span>
                        <span style={{ fontWeight: 600 }}>{rule.name}</span>
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                        {rule.description}
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <span style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--accent-gold)' }}>
                        {rule.rule_type === 'FIXED_AMOUNT'
                          ? `$${rule.amount_or_bps.toLocaleString()}`
                          : `${(rule.amount_or_bps / 100).toFixed(2)}% (${rule.amount_or_bps} bps)`}
                      </span>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{rule.rule_type}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Stakeholder Multi-Party Allocation & Status */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--accent-emerald)' }}>
                  Stakeholder Allocations & Approvals
                </h3>
                <span className="badge badge-success" style={{ fontSize: '0.7rem' }}>
                  Invariant: 10,000 bps (100.00%)
                </span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                {selectedVersion.stakeholders.map((st) => (
                  <div
                    key={st.id}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '0.75rem 1rem',
                      background: 'rgba(255, 255, 255, 0.02)',
                      borderRadius: 'var(--radius-sm)',
                      border: '1px solid var(--border-subtle)',
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: 600 }}>
                        {st.name} <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>({st.role})</span>
                      </div>
                      <div className="mono-text" style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        {st.wallet_address.substring(0, 10)}...{st.wallet_address.substring(st.wallet_address.length - 8)}
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
                      <div style={{ textAlign: 'right' }}>
                        <span style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                          {(st.basis_points / 100).toFixed(2)}%
                        </span>
                        <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{st.basis_points} bps</div>
                      </div>

                      <div>
                        {st.has_approved ? (
                          <span className="badge badge-success">
                            <CheckCircle2 size={12} /> Approved
                          </span>
                        ) : (
                          <span className="badge badge-warning">
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
        ) : (
          <div className="glass-card" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
            Select a property and version to view the distribution agreement.
          </div>
        )}
      </div>

      {/* Modals */}
      {activeProperty && (
        <>
          <WaterfallBuilder
            property={activeProperty}
            isOpen={isBuilderOpen}
            onClose={() => setIsBuilderOpen(false)}
            onAgreementCreated={() => loadAgreements(activeProperty.id)}
            existingAgreementId={proposingVersionForId}
          />

          {selectedVersion && (
            <>
              <AgreementApprovalModal
                version={selectedVersion}
                property={activeProperty}
                isOpen={isApprovalOpen}
                onClose={() => setIsApprovalOpen(false)}
                onVersionUpdated={() => loadAgreements(activeProperty.id)}
              />

              <SettlementPreviewModal
                version={selectedVersion}
                property={activeProperty}
                isOpen={isPreviewOpen}
                onClose={() => setIsPreviewOpen(false)}
              />

              {primaryAgreement && primaryAgreement.versions.length >= 2 && (
                <VersionCompareModal
                  versionA={primaryAgreement.versions[0]}
                  versionB={primaryAgreement.versions[1]}
                  property={activeProperty}
                  isOpen={isCompareOpen}
                  onClose={() => setIsCompareOpen(false)}
                />
              )}
            </>
          )}
        </>
      )}
    </div>
  );
};
