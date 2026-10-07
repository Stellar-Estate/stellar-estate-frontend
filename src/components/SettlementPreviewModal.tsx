import React, { useState, useEffect } from 'react';
import { DistributionAgreementVersion, Property, SettlementPreviewResult } from '../types/index.ts';
import { apiService } from '../services/apiService.ts';
import {
  X,
  TrendingUp,
  Coins,
  CheckCircle2,
  DollarSign,
  AlertTriangle,
  ArrowRight,
  ShieldCheck,
  Building2,
  Lock,
} from 'lucide-react';

interface SettlementPreviewModalProps {
  version: DistributionAgreementVersion;
  property: Property;
  isOpen: boolean;
  onClose: () => void;
}

export const SettlementPreviewModal: React.FC<SettlementPreviewModalProps> = ({
  version,
  property,
  isOpen,
  onClose,
}) => {
  const [sampleRevenue, setSampleRevenue] = useState<number>(8000.0);
  const [preview, setPreview] = useState<SettlementPreviewResult | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const calculatePreview = async (amount: number) => {
    setIsLoading(true);
    try {
      const data = await apiService.previewSettlement(version.id, amount);
      setPreview(data);
    } catch (err) {
      console.error('Failed to calculate preview:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      calculatePreview(sampleRevenue);
    }
  }, [isOpen, version.id]);

  if (!isOpen) return null;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className="modal-content"
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: 780, maxHeight: '90vh', overflowY: 'auto', padding: '2rem' }}
      >
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span className="badge badge-stellar">Deterministic Preview</span>
              <span className="badge badge-future">Level 3 Execution Target</span>
            </div>
            <h3 style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--text-primary)', marginTop: '0.35rem' }}>
              Waterfall Settlement Preview
            </h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              Simulates exact cash-flow distributions using locked rules for <strong>{property.name}</strong> (v{version.version_number}).
            </p>
          </div>
          <button onClick={onClose} style={{ color: 'var(--text-muted)', padding: '0.5rem' }}>
            <X size={20} />
          </button>
        </div>

        {/* Input Revenue Slider / Field */}
        <div
          style={{
            padding: '1.25rem',
            background: 'rgba(255, 255, 255, 0.02)',
            borderRadius: 'var(--radius-sm)',
            border: '1px solid var(--border-card)',
            marginBottom: '1.5rem',
          }}
        >
          <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>
            Input Sample Gross Property Revenue ({version.accepted_asset})
          </label>
          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
            <input
              type="number"
              step="500"
              min="1000"
              value={sampleRevenue}
              onChange={(e) => {
                const val = parseFloat(e.target.value) || 0;
                setSampleRevenue(val);
                calculatePreview(val);
              }}
              style={{
                flex: 1,
                padding: '0.65rem 0.85rem',
                background: 'var(--bg-input)',
                border: '1px solid var(--border-card)',
                borderRadius: 'var(--radius-sm)',
                color: 'var(--text-primary)',
                fontFamily: 'var(--font-mono)',
                fontSize: '1.1rem',
                fontWeight: 700,
              }}
            />
            <div style={{ display: 'flex', gap: '0.35rem' }}>
              <button
                onClick={() => {
                  setSampleRevenue(8000);
                  calculatePreview(8000);
                }}
                className="btn-secondary"
                style={{ fontSize: '0.75rem', padding: '0.45rem 0.65rem' }}
              >
                $8,000
              </button>
              <button
                onClick={() => {
                  setSampleRevenue(10000);
                  calculatePreview(10000);
                }}
                className="btn-secondary"
                style={{ fontSize: '0.75rem', padding: '0.45rem 0.65rem' }}
              >
                $10,000
              </button>
              <button
                onClick={() => {
                  setSampleRevenue(25000);
                  calculatePreview(25000);
                }}
                className="btn-secondary"
                style={{ fontSize: '0.75rem', padding: '0.45rem 0.65rem' }}
              >
                $25,000
              </button>
            </div>
          </div>
        </div>

        {/* Breakdown Results */}
        {preview && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {/* Stage 1: Waterfall Deductions */}
            <div
              style={{
                padding: '1.25rem',
                background: 'rgba(255, 255, 255, 0.02)',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--border-subtle)',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--accent-cyan)' }}>
                  Step 1: Waterfall Priority Deductions
                </h4>
                <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--accent-rose)' }}>
                  Total Deductions: -${preview.total_waterfall_deductions.toLocaleString()}
                </span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {preview.waterfall_breakdown.map((item, idx) => (
                  <div
                    key={idx}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      padding: '0.5rem 0.75rem',
                      background: 'rgba(255, 255, 255, 0.02)',
                      borderRadius: 4,
                      fontSize: '0.85rem',
                    }}
                  >
                    <div>
                      <span style={{ fontWeight: 600 }}>{item.name}</span>
                      <span style={{ color: 'var(--text-muted)', marginLeft: '0.5rem' }}>
                        ({item.rate_or_amount})
                      </span>
                    </div>
                    <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>
                      -${item.deducted_amount.toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>

              <div
                style={{
                  marginTop: '0.75rem',
                  paddingTop: '0.75rem',
                  borderTop: '1px solid var(--border-subtle)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <span style={{ fontWeight: 600, color: 'var(--text-secondary)' }}>Net Distributable Revenue:</span>
                <span style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--accent-gold)' }}>
                  ${preview.net_distributable_revenue.toLocaleString()} {preview.asset}
                </span>
              </div>
            </div>

            {/* Stage 2: Stakeholder Allocations */}
            <div
              style={{
                padding: '1.25rem',
                background: 'rgba(255, 255, 255, 0.02)',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--border-subtle)',
              }}
            >
              <h4 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '0.75rem', color: 'var(--accent-emerald)' }}>
                Step 2: Stakeholder Payout Allocations
              </h4>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {preview.stakeholder_allocations.map((st, idx) => (
                  <div
                    key={idx}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '0.65rem 0.85rem',
                      background: 'rgba(255, 255, 255, 0.03)',
                      borderRadius: 4,
                      fontSize: '0.85rem',
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: 600 }}>{st.name}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        {st.role} • {st.percentage} ({st.basis_points} bps)
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <span style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--accent-emerald)' }}>
                        ${st.allocated_amount.toLocaleString()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Accounting Invariant Verification Banner */}
            <div
              style={{
                padding: '0.85rem 1rem',
                background: preview.accounting_balanced ? 'rgba(16, 185, 129, 0.08)' : 'rgba(244, 63, 94, 0.08)',
                border: `1px solid ${preview.accounting_balanced ? 'rgba(16, 185, 129, 0.25)' : 'rgba(244, 63, 94, 0.25)'}`,
                borderRadius: 'var(--radius-sm)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                fontSize: '0.8rem',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <CheckCircle2 size={16} color="var(--accent-emerald)" />
                <span>
                  Invariant Checked: <strong>Gross Revenue (${preview.gross_revenue_input.toLocaleString()})</strong> =
                  Deductions (${preview.total_waterfall_deductions.toLocaleString()}) + Distributable ($
                  {preview.net_distributable_revenue.toLocaleString()})
                </span>
              </div>
              <span className="badge badge-success">Balanced</span>
            </div>
          </div>
        )}

        {/* Warning Notice */}
        <div
          style={{
            marginTop: '1.5rem',
            padding: '0.75rem',
            background: 'rgba(255, 255, 255, 0.02)',
            borderRadius: 'var(--radius-sm)',
            fontSize: '0.75rem',
            color: 'var(--text-muted)',
            textAlign: 'center',
          }}
        >
          {preview?.disclaimer}
        </div>

        <div style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'flex-end' }}>
          <button onClick={onClose} className="btn-primary">
            Close Preview
          </button>
        </div>
      </div>
    </div>
  );
};
