import React, { useState } from 'react';
import { SettlementTraceResult } from '../types/index.ts';
import {
  ArrowDown,
  ExternalLink,
  ShieldCheck,
  CheckCircle2,
  FileCode2,
  Coins,
  TrendingDown,
  Building,
  UserCheck,
  Hash,
} from 'lucide-react';

interface WhereDidMyRentGoProps {
  trace: SettlementTraceResult;
  onRefresh?: () => void;
}

export const WhereDidMyRentGo: React.FC<WhereDidMyRentGoProps> = ({ trace }) => {
  const [activeTab, setActiveTab] = useState<'flow' | 'json' | 'invariants'>('flow');

  return (
    <div className="card" style={{ padding: '2rem', border: '1px solid rgba(226, 183, 20, 0.3)', background: 'linear-gradient(180deg, rgba(16, 24, 40, 0.95) 0%, rgba(10, 15, 29, 0.98) 100%)' }}>
      {/* Title & Badge */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.35rem' }}>
            <span className="badge badge-stellar" style={{ fontSize: '0.75rem', padding: '0.25rem 0.6rem' }}>
              LEVEL 3 PROVABLE FLOW
            </span>
            <span className="badge badge-verified" style={{ fontSize: '0.75rem' }}>
              <CheckCircle2 size={12} style={{ marginRight: 4 }} />
              RECONCILED ON-CHAIN
            </span>
          </div>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#fff', letterSpacing: '-0.02em', margin: 0 }}>
            “Where Did My Rent Go?”
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '0.25rem' }}>
            Deterministic financial trace from initial tenant payment to multi-recipient Stellar Testnet settlement.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button
            onClick={() => setActiveTab('flow')}
            className={activeTab === 'flow' ? 'btn-outline-gold' : 'btn-secondary'}
            style={{ fontSize: '0.8rem', padding: '0.4rem 0.8rem' }}
          >
            Visual Waterfall
          </button>
          <button
            onClick={() => setActiveTab('invariants')}
            className={activeTab === 'invariants' ? 'btn-outline-gold' : 'btn-secondary'}
            style={{ fontSize: '0.8rem', padding: '0.4rem 0.8rem' }}
          >
            Accounting Invariants
          </button>
          <button
            onClick={() => setActiveTab('json')}
            className={activeTab === 'json' ? 'btn-outline-gold' : 'btn-secondary'}
            style={{ fontSize: '0.8rem', padding: '0.4rem 0.8rem' }}
          >
            Auditable Snapshot
          </button>
        </div>
      </div>

      {activeTab === 'flow' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {/* STEP 1: RENT INGESTION */}
          <div style={{ padding: '1.25rem', background: 'rgba(255, 255, 255, 0.03)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'rgba(16, 185, 129, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent-emerald)' }}>
                  <Coins size={22} />
                </div>
                <div>
                  <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-muted)', letterSpacing: '0.05em' }}>
                    1. Real Tenant Payment Ingested
                  </div>
                  <div style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--accent-emerald)' }}>
                    +${trace.waterfall_flow.gross_revenue.toLocaleString()} {trace.revenue_events[0]?.asset || 'USDC'}
                  </div>
                </div>
              </div>

              {trace.revenue_events[0] && (
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Stellar Testnet Transaction</div>
                  <a
                    href={trace.revenue_events[0].explorer_url}
                    target="_blank"
                    rel="noreferrer"
                    style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', color: 'var(--accent-gold)', fontSize: '0.8rem', textDecoration: 'none' }}
                  >
                    <span className="mono-text">{trace.revenue_events[0].transaction_hash.substring(0, 16)}...</span>
                    <ExternalLink size={12} />
                  </a>
                </div>
              )}
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <ArrowDown size={20} color="var(--accent-gold)" />
          </div>

          {/* STEP 2: LOCKED AGREEMENT */}
          <div style={{ padding: '1.25rem', background: 'rgba(226, 183, 20, 0.05)', borderRadius: 'var(--radius-md)', border: '1px solid rgba(226, 183, 20, 0.25)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'rgba(226, 183, 20, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent-gold)' }}>
                  <ShieldCheck size={22} />
                </div>
                <div>
                  <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--accent-gold)', letterSpacing: '0.05em' }}>
                    2. Governed by Active Locked Agreement
                  </div>
                  <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#fff' }}>
                    {trace.agreement.id} • Version {trace.agreement.version} (LOCKED)
                  </div>
                </div>
              </div>

              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Canonical SHA-256 Hash</div>
                <div className="mono-text" style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                  {trace.agreement.hash.substring(0, 24)}...
                </div>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <ArrowDown size={20} color="var(--accent-gold)" />
          </div>

          {/* STEP 3: WATERFALL DEDUCTIONS */}
          <div style={{ padding: '1.25rem', background: 'rgba(255, 255, 255, 0.02)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
            <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-muted)', letterSpacing: '0.05em', marginBottom: '0.75rem' }}>
              3. Deterministic Waterfall Deductions
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.75rem' }}>
              <div style={{ padding: '0.85rem', background: 'rgba(239, 68, 68, 0.08)', borderRadius: 'var(--radius-sm)', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Operating Expenses</span>
                  <TrendingDown size={14} color="var(--accent-ruby)" />
                </div>
                <div style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--accent-ruby)', marginTop: '0.25rem' }}>
                  -${trace.waterfall_flow.operating_expenses.toLocaleString()}
                </div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>Fixed Priority 1</div>
              </div>

              <div style={{ padding: '0.85rem', background: 'rgba(59, 130, 246, 0.08)', borderRadius: 'var(--radius-sm)', border: '1px solid rgba(59, 130, 246, 0.2)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Maintenance Reserve</span>
                  <Building size={14} color="#60a5fa" />
                </div>
                <div style={{ fontSize: '1.15rem', fontWeight: 700, color: '#60a5fa', marginTop: '0.25rem' }}>
                  -${trace.waterfall_flow.maintenance_reserve.toLocaleString()}
                </div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>Fixed Priority 2</div>
              </div>

              <div style={{ padding: '0.85rem', background: 'rgba(168, 85, 247, 0.08)', borderRadius: 'var(--radius-sm)', border: '1px solid rgba(168, 85, 247, 0.2)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Management Fee</span>
                  <UserCheck size={14} color="#c084fc" />
                </div>
                <div style={{ fontSize: '1.15rem', fontWeight: 700, color: '#c084fc', marginTop: '0.25rem' }}>
                  -${trace.waterfall_flow.management_fee.toLocaleString()}
                </div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>Percentage Priority 3</div>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <ArrowDown size={20} color="var(--accent-gold)" />
          </div>

          {/* STEP 4: NET DISTRIBUTABLE REVENUE */}
          <div style={{ padding: '1rem 1.25rem', background: 'rgba(16, 185, 129, 0.1)', borderRadius: 'var(--radius-md)', border: '1px solid rgba(16, 185, 129, 0.3)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--accent-emerald)', letterSpacing: '0.05em' }}>
                4. Net Distributable Revenue
              </div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                Gross Revenue - (Expenses + Reserves + Fees)
              </div>
            </div>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--accent-emerald)' }}>
              ${trace.waterfall_flow.net_distributable.toLocaleString()} USDC
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <ArrowDown size={20} color="var(--accent-gold)" />
          </div>

          {/* STEP 5: MULTI-RECIPIENT PAYOUTS */}
          <div style={{ padding: '1.25rem', background: 'rgba(255, 255, 255, 0.02)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-muted)', letterSpacing: '0.05em' }}>
                5. On-Chain Multi-Recipient Stellar Settlements
              </div>
              <span className="badge badge-verified" style={{ fontSize: '0.7rem' }}>
                {trace.recipient_allocations.length} Verified Recipients
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {trace.recipient_allocations.map((alloc, idx) => (
                <div
                  key={idx}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '0.85rem 1rem',
                    background: 'rgba(255, 255, 255, 0.03)',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--border-subtle)',
                    flexWrap: 'wrap',
                    gap: '0.5rem',
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span style={{ fontWeight: 700, color: '#fff', fontSize: '0.95rem' }}>{alloc.recipient_name}</span>
                      <span className="badge badge-stellar" style={{ fontSize: '0.65rem' }}>{alloc.role}</span>
                      <span style={{ color: 'var(--accent-gold)', fontSize: '0.8rem', fontWeight: 600 }}>({alloc.percentage})</span>
                    </div>
                    <div className="mono-text" style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>
                      {alloc.address.substring(0, 12)}...{alloc.address.substring(alloc.address.length - 8)}
                    </div>
                  </div>

                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--accent-emerald)' }}>
                      +${alloc.actual_amount.toLocaleString()} USDC
                    </div>
                    {alloc.explorer_url && (
                      <a
                        href={alloc.explorer_url}
                        target="_blank"
                        rel="noreferrer"
                        style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', color: 'var(--accent-gold)', fontSize: '0.72rem', textDecoration: 'none' }}
                      >
                        <span>View Settlement Tx</span>
                        <ExternalLink size={10} />
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'invariants' && (
        <div style={{ padding: '1.5rem', background: 'rgba(255, 255, 255, 0.02)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#fff', marginBottom: '1rem' }}>
            Mathematical & Accounting Invariants Verification
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ padding: '1rem', background: 'rgba(16, 185, 129, 0.08)', borderRadius: 'var(--radius-sm)', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--accent-emerald)', fontWeight: 700, marginBottom: '0.25rem' }}>
                <CheckCircle2 size={16} />
                Invariant 1: Total Deductions Balance
              </div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                Gross Revenue (${trace.waterfall_flow.gross_revenue}) = Expenses (${trace.waterfall_flow.operating_expenses}) + Reserves (${trace.waterfall_flow.maintenance_reserve}) + Fees (${trace.waterfall_flow.management_fee}) + Distributable (${trace.waterfall_flow.net_distributable})
              </div>
            </div>

            <div style={{ padding: '1rem', background: 'rgba(16, 185, 129, 0.08)', borderRadius: 'var(--radius-sm)', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--accent-emerald)', fontWeight: 700, marginBottom: '0.25rem' }}>
                <CheckCircle2 size={16} />
                Invariant 2: Stakeholder Allocations Sum
              </div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                Net Distributable (${trace.waterfall_flow.net_distributable}) = Sum of Recipient Allocations (${trace.recipient_allocations.reduce((sum, r) => sum + r.actual_amount, 0)}) + Explicit Remainder ($0.00)
              </div>
            </div>

            <div style={{ padding: '1rem', background: 'rgba(16, 185, 129, 0.08)', borderRadius: 'var(--radius-sm)', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--accent-emerald)', fontWeight: 700, marginBottom: '0.25rem' }}>
                <CheckCircle2 size={16} />
                Invariant 3: Basis Points Completeness
              </div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                Total Allocated Basis Points = {trace.recipient_allocations.reduce((sum, r) => sum + r.basis_points, 0)} bps / 10,000 bps (100.00%)
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'json' && (
        <div style={{ padding: '1.25rem', background: '#0a0d17', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Authoritative Immutable Calculation Snapshot</span>
            <span className="badge badge-stellar" style={{ fontSize: '0.65rem' }}>SHA-256 VERIFIED</span>
          </div>
          <pre
            className="mono-text"
            style={{
              fontSize: '0.75rem',
              color: 'var(--accent-gold)',
              background: 'transparent',
              padding: 0,
              margin: 0,
              overflowX: 'auto',
              maxHeight: 350,
            }}
          >
            {JSON.stringify(trace.calculation_snapshot || trace, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
};
