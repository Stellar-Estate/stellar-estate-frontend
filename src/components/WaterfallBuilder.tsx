import React, { useState } from 'react';
import { Property, WaterfallRule, AgreementStakeholder } from '../types/index.ts';
import { useWallet } from '../context/WalletContext.tsx';
import { apiService } from '../services/apiService.ts';
import {
  X,
  Plus,
  Trash2,
  Layers,
  Percent,
  DollarSign,
  AlertCircle,
  CheckCircle2,
  Lock,
  ArrowRight,
  ShieldCheck,
  Building2,
  Hash,
} from 'lucide-react';

interface WaterfallBuilderProps {
  property: Property;
  isOpen: boolean;
  onClose: () => void;
  onAgreementCreated: () => void;
  existingAgreementId?: string; // If provided, proposing a new version
}

export const WaterfallBuilder: React.FC<WaterfallBuilderProps> = ({
  property,
  isOpen,
  onClose,
  onAgreementCreated,
  existingAgreementId,
}) => {
  const { wallet } = useWallet();

  const [agreementIdentifier, setAgreementIdentifier] = useState(
    existingAgreementId ? 'MERIDIAN-REV-001' : `${property.name.replace(/\s+/g, '-').toUpperCase()}-REV-001`
  );
  const [revenueSource, setRevenueSource] = useState('Rental Revenue');
  const [acceptedAsset, setAcceptedAsset] = useState('USDC');
  const [effectiveDate, setEffectiveDate] = useState('2026-11-01');

  // Waterfall Rules
  const [rules, setRules] = useState<Omit<WaterfallRule, 'id' | 'agreement_version_id'>[]>([
    { priority: 1, rule_type: 'FIXED_AMOUNT', name: 'Operating Expenses', amount_or_bps: 1000, description: 'Facility maintenance & utilities' },
    { priority: 2, rule_type: 'FIXED_AMOUNT', name: 'Maintenance Reserve', amount_or_bps: 1000, description: 'CapEx reserve account' },
    { priority: 3, rule_type: 'PERCENTAGE_BASIS_POINTS', name: 'Management Fee', amount_or_bps: 500, description: 'Operator management fee (5%)' },
  ]);

  // Stakeholders (Defaults to 40% / 35% / 25% = 100%)
  const [stakeholders, setStakeholders] = useState<
    Omit<AgreementStakeholder, 'id' | 'agreement_version_id' | 'has_approved' | 'approved_at'>[]
  >([
    {
      wallet_address: wallet.address || 'GBTY42VFL7XJ6Q7L35R62L4J7J5J67U4F26C6DVEOD6DGEGZ6E6DDEE5ABCD',
      name: 'Alice (Meridian Capital)',
      role: 'Majority Equity',
      basis_points: 4000, // 40.00%
    },
    {
      wallet_address: 'GCDZ42VFL7XJ6Q7L35R62L4J7J5J67U4F26C6DVEOD6DGEGZ6E6DDEE5WXYZ',
      name: 'Bob (Apex Property Mgmt)',
      role: 'Operating Partner',
      basis_points: 3500, // 35.00%
    },
    {
      wallet_address: 'GCVRQYZCRG6E4V7P6E4J67U4F26C6DVEOD6DGEGZ6E6DDEE5ABCDKLMN',
      name: 'Charlie (Strategic Investor)',
      role: 'Equity Participant',
      basis_points: 2500, // 25.00%
    },
  ]);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  // Invariant calculation
  const totalBps = stakeholders.reduce((sum, s) => sum + s.basis_points, 0);
  const isBpsBalanced = totalBps === 10000;

  const handleAddRule = () => {
    setRules([
      ...rules,
      {
        priority: rules.length + 1,
        rule_type: 'FIXED_AMOUNT',
        name: 'New Deduction Rule',
        amount_or_bps: 500,
        description: 'Deduction description',
      },
    ]);
  };

  const handleRemoveRule = (index: number) => {
    setRules(rules.filter((_, i) => i !== index));
  };

  const handleAddStakeholder = () => {
    setStakeholders([
      ...stakeholders,
      {
        wallet_address: 'G...',
        name: 'New Stakeholder',
        role: 'Participant',
        basis_points: 0,
      },
    ]);
  };

  const handleRemoveStakeholder = (index: number) => {
    setStakeholders(stakeholders.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    setErrorMessage(null);
    if (!isBpsBalanced) {
      setErrorMessage(
        `Stakeholder allocations must sum to exactly 10,000 basis points (100.00%). Current sum: ${totalBps} bps (${(
          totalBps / 100
        ).toFixed(2)}%).`
      );
      return;
    }

    setIsSubmitting(true);
    try {
      if (existingAgreementId) {
        await apiService.proposeNewVersion(existingAgreementId, {
          revenueSource,
          acceptedAsset,
          effectiveDate,
          proposerAddress: wallet.address || 'G_ADMIN',
          waterfallRules: rules,
          stakeholders,
        });
      } else {
        await apiService.createAgreement({
          propertyId: property.id,
          agreementIdentifier,
          revenueSource,
          acceptedAsset,
          effectiveDate,
          createdBy: wallet.address || 'G_ADMIN',
          waterfallRules: rules,
          stakeholders,
        });
      }

      onAgreementCreated();
      onClose();
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to create agreement.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className="modal-content"
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: 840, maxHeight: '90vh', overflowY: 'auto', padding: '2rem' }}
      >
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span className="badge badge-stellar">Level 2 Agreement Builder</span>
              <span className="badge badge-future">Multi-Party Waterfall</span>
            </div>
            <h3 style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--text-primary)', marginTop: '0.35rem' }}>
              {existingAgreementId ? 'Propose New Agreement Version' : 'Create Property Distribution Agreement'}
            </h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              Target Property: <strong>{property.name}</strong> ({property.location})
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
              display: 'flex',
              gap: '0.5rem',
              alignItems: 'center',
              color: 'var(--accent-rose)',
              fontSize: '0.85rem',
            }}
          >
            <AlertCircle size={18} />
            <div style={{ flex: 1 }}>{errorMessage}</div>
          </div>
        )}

        {/* Form Sections */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
          {/* 1. Basic Terms */}
          <div style={{ padding: '1.25rem', background: 'rgba(255, 255, 255, 0.02)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
            <h4 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1rem', color: 'var(--accent-gold)' }}>
              1. Agreement Parameters
            </h4>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>
                  Agreement Identifier
                </label>
                <input
                  type="text"
                  value={agreementIdentifier}
                  disabled={!!existingAgreementId}
                  onChange={(e) => setAgreementIdentifier(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.55rem',
                    background: 'var(--bg-input)',
                    border: '1px solid var(--border-card)',
                    borderRadius: 'var(--radius-sm)',
                    color: 'var(--text-primary)',
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.85rem',
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>
                  Revenue Source
                </label>
                <select
                  value={revenueSource}
                  onChange={(e) => setRevenueSource(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.55rem',
                    background: 'var(--bg-input)',
                    border: '1px solid var(--border-card)',
                    borderRadius: 'var(--radius-sm)',
                    color: 'var(--text-primary)',
                    fontSize: '0.85rem',
                  }}
                >
                  <option value="Rental Revenue">Rental Revenue</option>
                  <option value="Commercial Lease">Commercial Ground Lease</option>
                  <option value="All Property Revenue">All Operating Revenue</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>
                  Accepted Settlement Asset
                </label>
                <select
                  value={acceptedAsset}
                  onChange={(e) => setAcceptedAsset(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.55rem',
                    background: 'var(--bg-input)',
                    border: '1px solid var(--border-card)',
                    borderRadius: 'var(--radius-sm)',
                    color: 'var(--text-primary)',
                    fontSize: '0.85rem',
                  }}
                >
                  <option value="USDC">USDC (Stellar Testnet SAC)</option>
                  <option value="XLM">XLM (Native Stellar Lumens)</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>
                  Effective Date
                </label>
                <input
                  type="date"
                  value={effectiveDate}
                  onChange={(e) => setEffectiveDate(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.55rem',
                    background: 'var(--bg-input)',
                    border: '1px solid var(--border-card)',
                    borderRadius: 'var(--radius-sm)',
                    color: 'var(--text-primary)',
                    fontSize: '0.85rem',
                  }}
                />
              </div>
            </div>
          </div>

          {/* 2. Visual Waterfall Sequence */}
          <div style={{ padding: '1.25rem', background: 'rgba(255, 255, 255, 0.02)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h4 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--accent-cyan)' }}>
                2. Waterfall Deduction Cascade
              </h4>
              <button
                onClick={handleAddRule}
                className="btn-secondary"
                style={{ fontSize: '0.75rem', padding: '0.3rem 0.65rem' }}
              >
                <Plus size={14} /> Add Rule
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {rules.map((rule, idx) => (
                <div
                  key={idx}
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '40px 1.4fr 1.2fr 1fr 1.6fr 40px',
                    gap: '0.65rem',
                    alignItems: 'center',
                    padding: '0.65rem',
                    background: 'rgba(255, 255, 255, 0.03)',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--border-subtle)',
                  }}
                >
                  <span className="badge badge-stellar" style={{ fontSize: '0.7rem' }}>
                    #{rule.priority}
                  </span>
                  <input
                    type="text"
                    value={rule.name}
                    onChange={(e) => {
                      const updated = [...rules];
                      updated[idx].name = e.target.value;
                      setRules(updated);
                    }}
                    placeholder="Rule Name"
                    style={{
                      padding: '0.45rem',
                      background: 'var(--bg-input)',
                      border: '1px solid var(--border-card)',
                      borderRadius: 4,
                      color: 'var(--text-primary)',
                      fontSize: '0.8rem',
                    }}
                  />
                  <select
                    value={rule.rule_type}
                    onChange={(e) => {
                      const updated = [...rules];
                      updated[idx].rule_type = e.target.value as any;
                      setRules(updated);
                    }}
                    style={{
                      padding: '0.45rem',
                      background: 'var(--bg-input)',
                      border: '1px solid var(--border-card)',
                      borderRadius: 4,
                      color: 'var(--text-primary)',
                      fontSize: '0.8rem',
                    }}
                  >
                    <option value="FIXED_AMOUNT">Fixed Amount ($)</option>
                    <option value="PERCENTAGE_BASIS_POINTS">Percentage (bps)</option>
                  </select>
                  <input
                    type="number"
                    value={rule.amount_or_bps}
                    onChange={(e) => {
                      const updated = [...rules];
                      updated[idx].amount_or_bps = parseFloat(e.target.value) || 0;
                      setRules(updated);
                    }}
                    placeholder={rule.rule_type === 'FIXED_AMOUNT' ? 'Amount' : 'Bps (e.g. 500 = 5%)'}
                    style={{
                      padding: '0.45rem',
                      background: 'var(--bg-input)',
                      border: '1px solid var(--border-card)',
                      borderRadius: 4,
                      color: 'var(--text-primary)',
                      fontSize: '0.8rem',
                      fontFamily: 'var(--font-mono)',
                    }}
                  />
                  <input
                    type="text"
                    value={rule.description}
                    onChange={(e) => {
                      const updated = [...rules];
                      updated[idx].description = e.target.value;
                      setRules(updated);
                    }}
                    placeholder="Purpose / Destination"
                    style={{
                      padding: '0.45rem',
                      background: 'var(--bg-input)',
                      border: '1px solid var(--border-card)',
                      borderRadius: 4,
                      color: 'var(--text-primary)',
                      fontSize: '0.8rem',
                    }}
                  />
                  <button
                    onClick={() => handleRemoveRule(idx)}
                    style={{ color: 'var(--accent-rose)', padding: '0.25rem' }}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* 3. Stakeholder Allocation & Invariant Check */}
          <div style={{ padding: '1.25rem', background: 'rgba(255, 255, 255, 0.02)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <div>
                <h4 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--accent-emerald)' }}>
                  3. Stakeholder Allocation (Residual Distribution)
                </h4>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                  Must sum to exactly 10,000 basis points (100.00%).
                </div>
              </div>
              <button
                onClick={handleAddStakeholder}
                className="btn-secondary"
                style={{ fontSize: '0.75rem', padding: '0.3rem 0.65rem' }}
              >
                <Plus size={14} /> Add Stakeholder
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {stakeholders.map((st, idx) => (
                <div
                  key={idx}
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '1.5fr 1.2fr 2fr 1fr 40px',
                    gap: '0.65rem',
                    alignItems: 'center',
                    padding: '0.65rem',
                    background: 'rgba(255, 255, 255, 0.03)',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--border-subtle)',
                  }}
                >
                  <input
                    type="text"
                    value={st.name}
                    onChange={(e) => {
                      const updated = [...stakeholders];
                      updated[idx].name = e.target.value;
                      setStakeholders(updated);
                    }}
                    placeholder="Stakeholder Name"
                    style={{
                      padding: '0.45rem',
                      background: 'var(--bg-input)',
                      border: '1px solid var(--border-card)',
                      borderRadius: 4,
                      color: 'var(--text-primary)',
                      fontSize: '0.8rem',
                    }}
                  />
                  <input
                    type="text"
                    value={st.role}
                    onChange={(e) => {
                      const updated = [...stakeholders];
                      updated[idx].role = e.target.value;
                      setStakeholders(updated);
                    }}
                    placeholder="Role"
                    style={{
                      padding: '0.45rem',
                      background: 'var(--bg-input)',
                      border: '1px solid var(--border-card)',
                      borderRadius: 4,
                      color: 'var(--text-primary)',
                      fontSize: '0.8rem',
                    }}
                  />
                  <input
                    type="text"
                    value={st.wallet_address}
                    onChange={(e) => {
                      const updated = [...stakeholders];
                      updated[idx].wallet_address = e.target.value;
                      setStakeholders(updated);
                    }}
                    placeholder="Stellar Public Key (G...)"
                    style={{
                      padding: '0.45rem',
                      background: 'var(--bg-input)',
                      border: '1px solid var(--border-card)',
                      borderRadius: 4,
                      color: 'var(--text-primary)',
                      fontSize: '0.75rem',
                      fontFamily: 'var(--font-mono)',
                    }}
                  />
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                    <input
                      type="number"
                      value={st.basis_points}
                      onChange={(e) => {
                        const updated = [...stakeholders];
                        updated[idx].basis_points = parseInt(e.target.value, 10) || 0;
                        setStakeholders(updated);
                      }}
                      placeholder="Basis Points"
                      style={{
                        width: '100%',
                        padding: '0.45rem',
                        background: 'var(--bg-input)',
                        border: '1px solid var(--border-card)',
                        borderRadius: 4,
                        color: 'var(--text-primary)',
                        fontSize: '0.8rem',
                        fontFamily: 'var(--font-mono)',
                      }}
                    />
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      {(st.basis_points / 100).toFixed(1)}%
                    </span>
                  </div>
                  <button
                    onClick={() => handleRemoveStakeholder(idx)}
                    style={{ color: 'var(--accent-rose)', padding: '0.25rem' }}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>

            {/* Invariant Bar */}
            <div
              style={{
                marginTop: '1rem',
                padding: '0.65rem 1rem',
                borderRadius: 'var(--radius-sm)',
                background: isBpsBalanced ? 'rgba(16, 185, 129, 0.1)' : 'rgba(244, 63, 94, 0.1)',
                border: `1px solid ${isBpsBalanced ? 'rgba(16, 185, 129, 0.3)' : 'rgba(244, 63, 94, 0.3)'}`,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                fontSize: '0.85rem',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                {isBpsBalanced ? (
                  <CheckCircle2 size={16} color="var(--accent-emerald)" />
                ) : (
                  <AlertCircle size={16} color="var(--accent-rose)" />
                )}
                <span>
                  Allocation Sum: <strong>{totalBps} bps</strong> ({(totalBps / 100).toFixed(2)}%)
                </span>
              </div>
              <span style={{ fontWeight: 600, color: isBpsBalanced ? 'var(--accent-emerald)' : 'var(--accent-rose)' }}>
                {isBpsBalanced ? 'Invariant Satisfied (100.00%)' : `Variance: ${10000 - totalBps} bps`}
              </span>
            </div>
          </div>
        </div>

        {/* Submit Actions */}
        <div style={{ marginTop: '2rem', display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
          <button onClick={onClose} className="btn-secondary">
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={!isBpsBalanced || isSubmitting}
            className="btn-primary"
            style={{ opacity: isBpsBalanced && !isSubmitting ? 1 : 0.6 }}
          >
            {isSubmitting ? 'Generating Canonical Hash...' : 'Create & Propose Agreement'} <ArrowRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};
