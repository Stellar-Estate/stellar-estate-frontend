import React, { useEffect, useState } from 'react';
import { apiService } from '../services/apiService.ts';
import { PropertyFinancialPassport } from '../types/index.ts';
import {
  X,
  ShieldCheck,
  CheckCircle2,
  Building,
  Coins,
  TrendingDown,
  ExternalLink,
  History,
  FileCheck2,
  Calendar,
} from 'lucide-react';

interface FinancialPassportModalProps {
  propertyId: string;
  isOpen: boolean;
  onClose: () => void;
}

export const FinancialPassportModal: React.FC<FinancialPassportModalProps> = ({
  propertyId,
  isOpen,
  onClose,
}) => {
  const [passport, setPassport] = useState<PropertyFinancialPassport | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isOpen && propertyId) {
      loadPassport();
    }
  }, [isOpen, propertyId]);

  const loadPassport = async () => {
    setIsLoading(true);
    try {
      const data = await apiService.getPropertyFinancialPassport(propertyId);
      setPassport(data);
    } catch (err) {
      console.error('Failed to load financial passport:', err);
    } finally {
      setIsLoading(false);
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
          maxWidth: 780,
          maxHeight: '92vh',
          overflowY: 'auto',
          background: 'linear-gradient(180deg, #0e1526 0%, #070a13 100%)',
          border: '1px solid rgba(226, 183, 20, 0.35)',
          borderRadius: 'var(--radius-lg)',
          padding: '2rem',
          position: 'relative',
        }}
      >
        <button
          onClick={onClose}
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

        {/* Passport Header */}
        <div style={{ marginBottom: '1.5rem', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
            <span className="badge badge-stellar" style={{ fontSize: '0.72rem' }}>
              OFFICIAL FINANCIAL PASSPORT
            </span>
            <span className="badge badge-verified" style={{ fontSize: '0.72rem' }}>
              <CheckCircle2 size={12} style={{ marginRight: 3 }} />
              AUDITED ON STELLAR
            </span>
          </div>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#fff', margin: 0 }}>
            {passport?.property_name || 'Property'} Financial Passport
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '0.25rem' }}>
            Permanent, verifiable on-chain financial passport tracking lifetime revenue, expenses, reserves, and distributed earnings.
          </p>
        </div>

        {passport && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {/* High Level Key Metrics */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '1rem' }}>
              <div style={{ padding: '1rem', background: 'rgba(16, 185, 129, 0.08)', borderRadius: 'var(--radius-sm)', border: '1px solid rgba(16, 185, 129, 0.25)' }}>
                <div style={{ fontSize: '0.72rem', textTransform: 'uppercase', color: 'var(--text-muted)' }}>
                  Total Lifetime Revenue
                </div>
                <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--accent-emerald)', marginTop: '0.25rem' }}>
                  ${passport.total_lifetime_revenue.toLocaleString()}
                </div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>Verified On-Chain</div>
              </div>

              <div style={{ padding: '1rem', background: 'rgba(239, 68, 68, 0.08)', borderRadius: 'var(--radius-sm)', border: '1px solid rgba(239, 68, 68, 0.25)' }}>
                <div style={{ fontSize: '0.72rem', textTransform: 'uppercase', color: 'var(--text-muted)' }}>
                  Total Expenses
                </div>
                <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--accent-ruby)', marginTop: '0.25rem' }}>
                  ${passport.total_expenses.toLocaleString()}
                </div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>Operating Deductions</div>
              </div>

              <div style={{ padding: '1rem', background: 'rgba(59, 130, 246, 0.08)', borderRadius: 'var(--radius-sm)', border: '1px solid rgba(59, 130, 246, 0.25)' }}>
                <div style={{ fontSize: '0.72rem', textTransform: 'uppercase', color: 'var(--text-muted)' }}>
                  Total Reserves Held
                </div>
                <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#60a5fa', marginTop: '0.25rem' }}>
                  ${passport.total_reserves.toLocaleString()}
                </div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>CapEx Vault Account</div>
              </div>

              <div style={{ padding: '1rem', background: 'rgba(226, 183, 20, 0.08)', borderRadius: 'var(--radius-sm)', border: '1px solid rgba(226, 183, 20, 0.25)' }}>
                <div style={{ fontSize: '0.72rem', textTransform: 'uppercase', color: 'var(--text-muted)' }}>
                  Total Distributed
                </div>
                <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--accent-gold)', marginTop: '0.25rem' }}>
                  ${passport.total_distributed.toLocaleString()}
                </div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>To Stakeholders</div>
              </div>
            </div>

            {/* Active Agreement Snapshot */}
            <div
              style={{
                padding: '1.25rem',
                background: 'rgba(226, 183, 20, 0.04)',
                borderRadius: 'var(--radius-md)',
                border: '1px solid rgba(226, 183, 20, 0.2)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '1rem',
              }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                  <ShieldCheck size={18} color="var(--accent-gold)" />
                  <span style={{ fontSize: '0.95rem', fontWeight: 700, color: '#fff' }}>
                    Active Governance: {passport.active_agreement_id} (Version {passport.active_agreement_version})
                  </span>
                </div>
                <div className="mono-text" style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                  Hash: {passport.active_agreement_hash}
                </div>
              </div>

              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Reconciliation Status</div>
                <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--accent-emerald)' }}>
                  ✓ {passport.reconciliation_status} (100% Balanced)
                </div>
              </div>
            </div>

            {/* Historical Settlements in Passport */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#fff', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <History size={16} />
                  <span>Permanent Settlement Audit History ({passport.settlement_count})</span>
                </div>
              </div>

              {passport.recent_settlements.length === 0 ? (
                <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)', background: 'rgba(255, 255, 255, 0.02)', borderRadius: 'var(--radius-sm)' }}>
                  No settlements executed yet for this property.
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                  {passport.recent_settlements.map((stl) => (
                    <div
                      key={stl.id}
                      style={{
                        padding: '0.85rem 1rem',
                        background: 'rgba(255, 255, 255, 0.02)',
                        borderRadius: 'var(--radius-sm)',
                        border: '1px solid var(--border-subtle)',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        flexWrap: 'wrap',
                        gap: '0.5rem',
                      }}
                    >
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <span style={{ fontWeight: 700, color: '#fff', fontSize: '0.9rem' }}>{stl.id}</span>
                          <span className="badge badge-verified" style={{ fontSize: '0.65rem' }}>
                            {stl.status}
                          </span>
                        </div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                          Gross: ${stl.gross_revenue.toLocaleString()} • Distributed: ${stl.distributable_amount.toLocaleString()} • Agreement v{stl.agreement_version}
                        </div>
                      </div>

                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                          {new Date(stl.executed_at || stl.created_at).toLocaleDateString()}
                        </div>
                        {stl.transaction_hashes.length > 0 && (
                          <a
                            href={`https://stellar.expert/explorer/testnet/tx/${stl.transaction_hashes[0]}`}
                            target="_blank"
                            rel="noreferrer"
                            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', color: 'var(--accent-gold)', fontSize: '0.7rem', textDecoration: 'none' }}
                          >
                            <span>Stellar Explorer</span>
                            <ExternalLink size={10} />
                          </a>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Legal / Prototype Boundary Disclaimer */}
            <div
              style={{
                padding: '0.85rem 1rem',
                background: 'rgba(255, 255, 255, 0.02)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-sm)',
                fontSize: '0.72rem',
                color: 'var(--text-muted)',
                lineHeight: 1.5,
              }}
            >
              <strong>System Notice & Prototype Boundary:</strong> Stellar Estate is an advanced programmable real-estate financial infrastructure prototype. This financial passport functions as a transparent ledger of financial events and distribution rules on Stellar Testnet, not as a legal property title registry or regulated investment offering.
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
