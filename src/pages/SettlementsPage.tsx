import React, { useState, useEffect } from 'react';
import { apiService } from '../services/apiService.ts';
import {
  Property,
  Settlement,
  RevenuePool,
  SettlementTraceResult,
  StakeholderEarnings,
} from '../types/index.ts';
import { WhereDidMyRentGo } from '../components/WhereDidMyRentGo.tsx';
import { SettlementExecutionModal } from '../components/SettlementExecutionModal.tsx';
import { FinancialPassportModal } from '../components/FinancialPassportModal.tsx';
import {
  Coins,
  ShieldCheck,
  CheckCircle2,
  ExternalLink,
  Building,
  Sparkles,
  TrendingUp,
  FileText,
  UserCheck,
  History,
  Lock,
  ArrowRight,
  Activity,
} from 'lucide-react';

interface SettlementsPageProps {
  properties: Property[];
  selectedProperty: Property | null;
}

export const SettlementsPage: React.FC<SettlementsPageProps> = ({
  properties,
  selectedProperty: initialSelectedProp,
}) => {
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(
    initialSelectedProp || properties[0] || null
  );
  const [revenuePool, setRevenuePool] = useState<RevenuePool | null>(null);
  const [settlements, setSettlements] = useState<Settlement[]>([]);
  const [selectedTrace, setSelectedTrace] = useState<SettlementTraceResult | null>(null);
  const [stakeholderTab, setStakeholderTab] = useState<'alice' | 'bob' | 'charlie'>('alice');
  const [stakeholderEarnings, setStakeholderEarnings] = useState<StakeholderEarnings | null>(null);
  const [isExecutionModalOpen, setIsExecutionModalOpen] = useState(false);
  const [isPassportModalOpen, setIsPassportModalOpen] = useState(false);
  const [activeView, setActiveView] = useState<'trace' | 'history' | 'stakeholders'>('trace');

  const STAKEHOLDER_ADDRESSES = {
    alice: 'GBTY42VFL7XJ6Q7L35R62L4J7J5J67U4F26C6DVEOD6DGEGZ6E6DDEE5ABCD',
    bob: 'GCDZ42VFL7XJ6Q7L35R62L4J7J5J67U4F26C6DVEOD6DGEGZ6E6DDEE5WXYZ',
    charlie: 'GCVRQYZCRG6E4V7P6E4J67U4F26C6DVEOD6DGEGZ6E6DDEE5ABCDKLMN',
  };

  useEffect(() => {
    if (selectedProperty) {
      loadData(selectedProperty.id);
    }
  }, [selectedProperty]);

  useEffect(() => {
    loadStakeholderEarnings(STAKEHOLDER_ADDRESSES[stakeholderTab]);
  }, [stakeholderTab]);

  const loadData = async (propId: string) => {
    try {
      const [pool, stlList] = await Promise.all([
        apiService.getRevenuePool(propId),
        apiService.getSettlements(propId),
      ]);
      setRevenuePool(pool);
      setSettlements(stlList);

      if (stlList.length > 0) {
        const trace = await apiService.getSettlementTrace(stlList[0].id);
        setSelectedTrace(trace);
      } else {
        // Fallback default trace for showcase
        const trace = await apiService.getSettlementTrace('STL-MERIDIAN-001');
        setSelectedTrace(trace);
      }
    } catch (err) {
      console.error('Failed to load settlements data:', err);
    }
  };

  const loadStakeholderEarnings = async (addr: string) => {
    try {
      const data = await apiService.getStakeholderEarnings(addr);
      setStakeholderEarnings(data);
    } catch (err) {
      console.error('Failed to load stakeholder earnings:', err);
    }
  };

  const handleSettlementSuccess = async (newSettlement: Settlement) => {
    if (selectedProperty) {
      await loadData(selectedProperty.id);
      loadStakeholderEarnings(STAKEHOLDER_ADDRESSES[stakeholderTab]);
    }
  };

  const prop = selectedProperty || properties[0];

  return (
    <div style={{ maxWidth: 1280, margin: '0 auto', padding: '2rem 1.5rem' }}>
      {/* Top Header & Property Switcher */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1.5rem', marginBottom: '2rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
            <span className="badge badge-stellar" style={{ fontSize: '0.75rem' }}>
              LEVEL 3 SETTLEMENT ENGINE
            </span>
            <span className="badge badge-gold" style={{ fontSize: '0.75rem' }}>
              <Lock size={12} style={{ marginRight: 3 }} />
              DETERMINISTIC WATERFALL
            </span>
          </div>
          <h1 style={{ fontSize: '2.4rem', fontWeight: 900, color: '#fff', letterSpacing: '-0.03em', margin: 0 }}>
            Programmable Settlement Platform
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1rem', marginTop: '0.5rem', maxWidth: 720 }}>
            Turns locked property agreements into automated, provable multi-recipient financial settlements on Stellar Testnet.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
          <button
            onClick={() => setIsPassportModalOpen(true)}
            className="btn-secondary"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1.25rem' }}
          >
            <FileText size={16} />
            <span>Financial Passport</span>
          </button>

          <button
            onClick={() => setIsExecutionModalOpen(true)}
            className="btn-gold"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1.25rem', fontWeight: 700 }}
          >
            <Coins size={16} />
            <span>Execute Settlement</span>
          </button>
        </div>
      </div>

      {/* Revenue Pool Stats Dashboard */}
      {revenuePool && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
          <div className="card" style={{ padding: '1.25rem' }}>
            <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-muted)' }}>Confirmed Revenue</div>
            <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--accent-emerald)', marginTop: '0.25rem' }}>
              ${revenuePool.total_confirmed_revenue.toLocaleString()}
            </div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>Verified Stellar Payments</div>
          </div>

          <div className="card" style={{ padding: '1.25rem' }}>
            <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-muted)' }}>Available for Settlement</div>
            <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--accent-gold)', marginTop: '0.25rem' }}>
              ${revenuePool.available_for_settlement.toLocaleString()}
            </div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>Unconsumed Eligible Funds</div>
          </div>

          <div className="card" style={{ padding: '1.25rem' }}>
            <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-muted)' }}>Total Settled</div>
            <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#fff', marginTop: '0.25rem' }}>
              ${revenuePool.total_settled_revenue.toLocaleString()}
            </div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>Paid to Stakeholders</div>
          </div>

          <div className="card" style={{ padding: '1.25rem' }}>
            <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-muted)' }}>Maintenance Reserve</div>
            <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#60a5fa', marginTop: '0.25rem' }}>
              ${revenuePool.total_reserves_held.toLocaleString()}
            </div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>Retained CapEx Vault</div>
          </div>

          <div className="card" style={{ padding: '1.25rem' }}>
            <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-muted)' }}>Management Fees</div>
            <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#c084fc', marginTop: '0.25rem' }}>
              ${revenuePool.total_fees_paid.toLocaleString()}
            </div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>Operator Compensation</div>
          </div>
        </div>
      )}

      {/* Navigation Tabs */}
      <div style={{ display: 'flex', gap: '0.5rem', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.75rem', marginBottom: '1.5rem' }}>
        <button
          onClick={() => setActiveView('trace')}
          className={activeView === 'trace' ? 'btn-outline-gold' : 'btn-secondary'}
          style={{ fontSize: '0.875rem' }}
        >
          “Where Did My Rent Go?” Trace
        </button>
        <button
          onClick={() => setActiveView('history')}
          className={activeView === 'history' ? 'btn-outline-gold' : 'btn-secondary'}
          style={{ fontSize: '0.875rem' }}
        >
          Settlement History ({settlements.length})
        </button>
        <button
          onClick={() => setActiveView('stakeholders')}
          className={activeView === 'stakeholders' ? 'btn-outline-gold' : 'btn-secondary'}
          style={{ fontSize: '0.875rem' }}
        >
          Stakeholder Earnings
        </button>
      </div>

      {/* VIEW 1: WHERE DID MY RENT GO TRACE */}
      {activeView === 'trace' && selectedTrace && (
        <WhereDidMyRentGo trace={selectedTrace} onRefresh={() => selectedProperty && loadData(selectedProperty.id)} />
      )}

      {/* VIEW 2: SETTLEMENT HISTORY */}
      {activeView === 'history' && (
        <div className="card" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#fff', margin: 0 }}>
                Permanent Settlement Records
              </h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '0.25rem' }}>
                Every settlement is cryptographically anchored to its governing agreement version, hash, and Stellar transaction hashes.
              </p>
            </div>
            <span className="badge badge-verified">
              <CheckCircle2 size={14} style={{ marginRight: 4 }} />
              100% RECONCILED
            </span>
          </div>

          {settlements.length === 0 ? (
            <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
              No settlements executed yet. Click "Execute Settlement" to initiate your first Level 3 payout.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {settlements.map((stl) => (
                <div
                  key={stl.id}
                  style={{
                    padding: '1.25rem',
                    background: 'rgba(255, 255, 255, 0.02)',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--border-subtle)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: '1rem',
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                      <span style={{ fontWeight: 800, color: '#fff', fontSize: '1.05rem' }}>{stl.id}</span>
                      <span className="badge badge-gold" style={{ fontSize: '0.65rem' }}>
                        Agreement v{stl.agreement_version}
                      </span>
                      <span className="badge badge-verified" style={{ fontSize: '0.65rem' }}>
                        ✓ {stl.status}
                      </span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginTop: '0.4rem', fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                      <span>Gross: <strong>${stl.gross_revenue.toLocaleString()}</strong></span>
                      <span>Deductions: <strong>${(stl.expenses + stl.reserve + stl.fees).toLocaleString()}</strong></span>
                      <span>Distributable: <strong style={{ color: 'var(--accent-emerald)' }}>${stl.distributable_amount.toLocaleString()}</strong></span>
                    </div>

                    <div className="mono-text" style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '0.35rem' }}>
                      Hash: {stl.agreement_hash.substring(0, 24)}...
                    </div>
                  </div>

                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      {new Date(stl.executed_at || stl.created_at).toLocaleString()}
                    </div>
                    {stl.transaction_hashes.length > 0 && (
                      <a
                        href={`https://stellar.expert/explorer/testnet/tx/${stl.transaction_hashes[0]}`}
                        target="_blank"
                        rel="noreferrer"
                        style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', color: 'var(--accent-gold)', fontSize: '0.8rem', textDecoration: 'none', marginTop: '0.35rem' }}
                      >
                        <span>Stellar Explorer</span>
                        <ExternalLink size={12} />
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* VIEW 3: STAKEHOLDER EARNINGS */}
      {activeView === 'stakeholders' && (
        <div className="card" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem' }}>
            <div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#fff', margin: 0 }}>
                Stakeholder Earnings & Allocations
              </h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '0.25rem' }}>
                All earnings derive directly from verified on-chain settlements according to the locked distribution agreement.
              </p>
            </div>

            {/* Stakeholder Switcher */}
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button
                onClick={() => setStakeholderTab('alice')}
                className={stakeholderTab === 'alice' ? 'btn-outline-gold' : 'btn-secondary'}
                style={{ fontSize: '0.8rem', padding: '0.4rem 0.8rem' }}
              >
                Alice (Majority Equity)
              </button>
              <button
                onClick={() => setStakeholderTab('bob')}
                className={stakeholderTab === 'bob' ? 'btn-outline-gold' : 'btn-secondary'}
                style={{ fontSize: '0.8rem', padding: '0.4rem 0.8rem' }}
              >
                Bob (Operating Partner)
              </button>
              <button
                onClick={() => setStakeholderTab('charlie')}
                className={stakeholderTab === 'charlie' ? 'btn-outline-gold' : 'btn-secondary'}
                style={{ fontSize: '0.8rem', padding: '0.4rem 0.8rem' }}
              >
                Charlie (Investor)
              </button>
            </div>
          </div>

          {stakeholderEarnings && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {/* Stakeholder Header Card */}
              <div style={{ padding: '1.25rem', background: 'rgba(255, 255, 255, 0.02)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                <div>
                  <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#fff' }}>
                    {stakeholderEarnings.stakeholder_name}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.25rem' }}>
                    <span className="badge badge-stellar">{stakeholderEarnings.role}</span>
                    <span style={{ fontSize: '0.85rem', color: 'var(--accent-gold)', fontWeight: 600 }}>
                      Current Allocation: {(stakeholderEarnings.current_allocation_bps / 100).toFixed(2)}% ({stakeholderEarnings.current_allocation_bps} bps)
                    </span>
                  </div>
                  <div className="mono-text" style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '0.35rem' }}>
                    {stakeholderEarnings.wallet_address}
                  </div>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-muted)' }}>Total Settled To Date</div>
                  <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--accent-emerald)' }}>
                    ${stakeholderEarnings.total_settled.toLocaleString()} USDC
                  </div>
                </div>
              </div>

              {/* Settlement Payments List */}
              <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#fff', marginTop: '0.5rem' }}>
                Settlement Disbursements
              </div>

              {stakeholderEarnings.settlements.length === 0 ? (
                <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                  No disbursements recorded for this stakeholder yet.
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {stakeholderEarnings.settlements.map((item, idx) => (
                    <div
                      key={idx}
                      style={{
                        padding: '0.75rem 1rem',
                        background: 'rgba(255, 255, 255, 0.02)',
                        borderRadius: 'var(--radius-xs)',
                        border: '1px solid var(--border-subtle)',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        flexWrap: 'wrap',
                        gap: '0.5rem',
                      }}
                    >
                      <div>
                        <div style={{ fontWeight: 600, color: '#fff', fontSize: '0.875rem' }}>{item.settlement_id}</div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                          {new Date(item.date).toLocaleDateString()}
                        </div>
                      </div>

                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--accent-emerald)' }}>
                          +${item.amount.toLocaleString()} USDC
                        </div>
                        {item.tx_hash && (
                          <a
                            href={`https://stellar.expert/explorer/testnet/tx/${item.tx_hash}`}
                            target="_blank"
                            rel="noreferrer"
                            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', color: 'var(--accent-gold)', fontSize: '0.7rem', textDecoration: 'none' }}
                          >
                            <span>Explorer Tx</span>
                            <ExternalLink size={10} />
                          </a>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Modals */}
      {isExecutionModalOpen && prop && (
        <SettlementExecutionModal
          propertyId={prop.id}
          revenueIds={['rev-meridian-001']}
          grossRevenue={10000}
          isOpen={isExecutionModalOpen}
          onClose={() => setIsExecutionModalOpen(false)}
          onSuccess={handleSettlementSuccess}
        />
      )}

      {isPassportModalOpen && prop && (
        <FinancialPassportModal
          propertyId={prop.id}
          isOpen={isPassportModalOpen}
          onClose={() => setIsPassportModalOpen(false)}
        />
      )}
    </div>
  );
};
