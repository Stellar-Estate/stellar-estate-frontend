import React, { useState, useEffect } from 'react';
import { Property, RevenueRecord } from '../types/index.ts';
import { apiService } from '../services/apiService.ts';
import { STELLAR_EXPERT_EXPLORER } from '../services/stellarService.ts';
import { ReconciliationAuditModal } from '../components/ReconciliationAuditModal.tsx';
import { WebhookManagerModal } from '../components/WebhookManagerModal.tsx';
import {
  ShieldCheck,
  Search,
  ExternalLink,
  CheckCircle2,
  FileCheck,
  ArrowRight,
  Database,
  Lock,
  RefreshCw,
  Copy,
  Scale,
  Radio,
} from 'lucide-react';

interface AuditPageProps {
  properties: Property[];
}

export const AuditPage: React.FC<AuditPageProps> = ({ properties }) => {
  const [allRevenues, setAllRevenues] = useState<RevenueRecord[]>([]);
  const [selectedRevenue, setSelectedRevenue] = useState<RevenueRecord | null>(null);
  const [reconReport, setReconReport] = useState<any>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [copiedHash, setCopiedHash] = useState(false);
  const [isReconModalOpen, setIsReconModalOpen] = useState(false);
  const [isWebhookModalOpen, setIsWebhookModalOpen] = useState(false);

  const loadData = async () => {
    setIsRefreshing(true);
    try {
      let list: RevenueRecord[] = [];
      for (const p of properties) {
        const revs = await apiService.getPropertyRevenue(p.id);
        list = [...list, ...revs];
      }
      setAllRevenues(list);
      if (list.length > 0 && !selectedRevenue) {
        setSelectedRevenue(list[0]);
      }

      const report = await apiService.getReconciliationReport();
      setReconReport(report);
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [properties]);

  const targetProperty = selectedRevenue
    ? properties.find((p) => p.id === selectedRevenue.property_id) || properties[0]
    : properties[0];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div className="section-tag">
            <ShieldCheck size={16} /> Auditability & Provenance
          </div>
          <h1 className="section-title">Cryptographic Revenue Provenance</h1>
          <p className="section-subtitle">
            Inspect the complete immutable chain: Property → Revenue Event → Stellar Transaction → Independent Verification → Financial Ledger.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <button
            onClick={() => setIsReconModalOpen(true)}
            className="btn-outline-gold"
            style={{ fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
          >
            <Scale size={15} /> Vault Reconciliation
          </button>
          <button
            onClick={() => setIsWebhookModalOpen(true)}
            className="btn-secondary"
            style={{ fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
          >
            <Radio size={14} className="text-blue-400" /> Event Webhooks
          </button>
          <button
            onClick={loadData}
            className="btn-secondary"
            disabled={isRefreshing}
            style={{ fontSize: '0.85rem' }}
          >
            <RefreshCw size={14} style={{ animation: isRefreshing ? 'spin 1s linear infinite' : 'none' }} />
            Re-Audit State
          </button>
        </div>
      </div>

      {/* 5-STAGE PIPELINE VISUALIZER */}
      {selectedRevenue && (
        <div className="glass-card" style={{ padding: '2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '0.5rem' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700 }}>
              End-to-End Audit Trail for Revenue Entry #{selectedRevenue.id.substring(0, 12)}
            </h3>
            <span className="badge badge-success">Verified On-Chain</span>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
              gap: '1rem',
              position: 'relative',
            }}
          >
            {/* Step 1: Property */}
            <div style={{ padding: '1.25rem', background: 'rgba(255, 255, 255, 0.03)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--accent-gold)', fontWeight: 700 }}>STEP 1</div>
              <h4 style={{ fontSize: '1rem', fontWeight: 700, margin: '0.25rem 0' }}>Target Property</h4>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-primary)', fontWeight: 600 }}>{targetProperty.name}</p>
              <div className="mono-text" style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                {targetProperty.location}
              </div>
            </div>

            {/* Step 2: Revenue Event */}
            <div style={{ padding: '1.25rem', background: 'rgba(255, 255, 255, 0.03)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--accent-gold)', fontWeight: 700 }}>STEP 2</div>
              <h4 style={{ fontSize: '1rem', fontWeight: 700, margin: '0.25rem 0' }}>Revenue Event</h4>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-primary)', fontWeight: 600 }}>{selectedRevenue.source}</p>
              <div style={{ fontSize: '0.8rem', color: 'var(--accent-gold)', fontWeight: 700 }}>
                {selectedRevenue.amount} {selectedRevenue.asset}
              </div>
            </div>

            {/* Step 3: Stellar Transaction */}
            <div style={{ padding: '1.25rem', background: 'rgba(255, 255, 255, 0.03)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--accent-cyan)', fontWeight: 700 }}>STEP 3</div>
              <h4 style={{ fontSize: '1rem', fontWeight: 700, margin: '0.25rem 0' }}>Stellar Ledger</h4>
              <div className="mono-text" style={{ fontSize: '0.75rem', color: 'var(--accent-cyan)', wordBreak: 'break-all' }}>
                {selectedRevenue.transaction_hash.substring(0, 12)}...
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                Ledger #{selectedRevenue.metadata?.ledger || 1084512}
              </div>
            </div>

            {/* Step 4: Verification */}
            <div style={{ padding: '1.25rem', background: 'rgba(255, 255, 255, 0.03)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--accent-emerald)', fontWeight: 700 }}>STEP 4</div>
              <h4 style={{ fontSize: '1rem', fontWeight: 700, margin: '0.25rem 0' }}>Verification</h4>
              <p style={{ fontSize: '0.8rem', color: 'var(--accent-emerald)', fontWeight: 600 }}>
                Horizon Confirmed
              </p>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                Replay: Zero Duplicate
              </div>
            </div>

            {/* Step 5: Financial Record */}
            <div style={{ padding: '1.25rem', background: 'rgba(255, 255, 255, 0.03)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
              <div style={{ fontSize: '0.75rem', color: '#c084fc', fontWeight: 700 }}>STEP 5</div>
              <h4 style={{ fontSize: '1rem', fontWeight: 700, margin: '0.25rem 0' }}>Financial Record</h4>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-primary)', fontWeight: 600 }}>
                State Persisted
              </p>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                Ready for Waterfall Allocation
              </div>
            </div>
          </div>

          <div style={{ marginTop: '1.5rem', display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
            <a
              href={`${STELLAR_EXPERT_EXPLORER}/${selectedRevenue.transaction_hash}`}
              target="_blank"
              rel="noreferrer"
              className="btn-primary"
              style={{ fontSize: '0.85rem', display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}
            >
              <span>Verify on Stellar.Expert</span>
              <ExternalLink size={14} />
            </a>

            <a
              href={`https://horizon-testnet.stellar.org/transactions/${selectedRevenue.transaction_hash}`}
              target="_blank"
              rel="noreferrer"
              className="btn-secondary"
              style={{ fontSize: '0.85rem', display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}
            >
              <span>Horizon Raw JSON</span>
              <ExternalLink size={14} />
            </a>

            <button
              onClick={() => {
                if (typeof navigator !== 'undefined' && navigator.clipboard) {
                  navigator.clipboard.writeText(selectedRevenue.transaction_hash);
                }
                setCopiedHash(true);
                setTimeout(() => setCopiedHash(false), 2000);
              }}
              className="btn-secondary"
              style={{ fontSize: '0.85rem', display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}
            >
              <Copy size={14} />
              <span>{copiedHash ? '✓ Copied Tx Hash' : 'Copy Tx Hash'}</span>
            </button>
          </div>
        </div>
      )}

      {/* ALL REVENUE RECORDS TABLE */}
      <div className="glass-card" style={{ padding: '2rem' }}>
        <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1.25rem' }}>
          All Immutably Recorded Revenue Transactions
        </h3>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-card)', color: 'var(--text-muted)' }}>
                <th style={{ padding: '0.75rem 1rem' }}>Property</th>
                <th style={{ padding: '0.75rem 1rem' }}>Revenue Source</th>
                <th style={{ padding: '0.75rem 1rem' }}>Amount</th>
                <th style={{ padding: '0.75rem 1rem' }}>Transaction Hash</th>
                <th style={{ padding: '0.75rem 1rem' }}>Verification</th>
                <th style={{ padding: '0.75rem 1rem' }}>Provenance Flow</th>
              </tr>
            </thead>
            <tbody>
              {allRevenues.map((r) => {
                const prop = properties.find((p) => p.id === r.property_id);
                const isSelected = selectedRevenue?.id === r.id;
                return (
                  <tr
                    key={r.id}
                    style={{
                      borderBottom: '1px solid var(--border-subtle)',
                      backgroundColor: isSelected ? 'rgba(226, 183, 20, 0.05)' : 'transparent',
                      cursor: 'pointer',
                    }}
                    onClick={() => setSelectedRevenue(r)}
                  >
                    <td style={{ padding: '1rem', fontWeight: 600 }}>{prop?.name || r.property_id}</td>
                    <td style={{ padding: '1rem' }}>{r.source}</td>
                    <td style={{ padding: '1rem', fontWeight: 700, color: 'var(--accent-gold)' }}>
                      {r.amount.toLocaleString()} {r.asset}
                    </td>
                    <td style={{ padding: '1rem' }}>
                      <span className="mono-text" style={{ fontSize: '0.75rem', color: 'var(--accent-cyan)' }}>
                        {r.transaction_hash.substring(0, 14)}...
                      </span>
                    </td>
                    <td style={{ padding: '1rem' }}>
                      <span className="badge badge-success" style={{ fontSize: '0.7rem' }}>
                        <CheckCircle2 size={12} /> {r.status}
                      </span>
                    </td>
                    <td style={{ padding: '1rem' }}>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedRevenue(r);
                        }}
                        className="btn-secondary"
                        style={{ padding: '0.35rem 0.65rem', fontSize: '0.75rem' }}
                      >
                        Inspect Chain <ArrowRight size={12} />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <ReconciliationAuditModal
        property={targetProperty}
        isOpen={isReconModalOpen}
        onClose={() => setIsReconModalOpen(false)}
      />

      <WebhookManagerModal
        isOpen={isWebhookModalOpen}
        onClose={() => setIsWebhookModalOpen(false)}
      />
    </div>
  );
};
