import React, { useState, useEffect } from 'react';
import { Property, RevenueRecord, PropertyUnit, PropertyParticipation } from '../types/index.ts';
import { apiService } from '../services/apiService.ts';
import { STELLAR_EXPERT_EXPLORER } from '../services/stellarService.ts';
import { RevenueDepositModal } from '../components/RevenueDepositModal.tsx';
import { FinancialPassportModal } from '../components/FinancialPassportModal.tsx';
import {
  Building2,
  MapPin,
  Coins,
  ShieldCheck,
  TrendingUp,
  Layers,
  ExternalLink,
  PlusCircle,
  Clock,
  CheckCircle2,
  AlertCircle,
  FileText,
  UserCheck,
  ArrowLeft,
  Lock,
} from 'lucide-react';

interface PropertyDetailPageProps {
  property: Property;
  onBack: () => void;
  onNavigateToAgreements?: () => void;
}

export const PropertyDetailPage: React.FC<PropertyDetailPageProps> = ({
  property,
  onBack,
  onNavigateToAgreements,
}) => {
  const [revenueHistory, setRevenueHistory] = useState<RevenueRecord[]>([]);
  const [units, setUnits] = useState<PropertyUnit[]>([]);
  const [participations, setParticipations] = useState<PropertyParticipation[]>([]);
  const [financials, setFinancials] = useState<any>(null);
  const [isDepositModalOpen, setIsDepositModalOpen] = useState(false);
  const [isPassportModalOpen, setIsPassportModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const loadPropertyData = async () => {
    setIsLoading(true);
    try {
      const data = await apiService.getProperty(property.id);
      setUnits(data.units);
      setParticipations(data.participations);
      setFinancials(data.financials);

      const revs = await apiService.getPropertyRevenue(property.id);
      setRevenueHistory(revs);
    } catch (err) {
      console.error('Failed to load property details:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadPropertyData();
  }, [property.id]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
      {/* Top Back & Header */}
      <div>
        <button
          onClick={onBack}
          className="btn-secondary"
          style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem', fontSize: '0.85rem' }}
        >
          <ArrowLeft size={16} /> Back to Directory
        </button>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1.5rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.35rem' }}>
              <span className="badge badge-stellar">{property.property_type}</span>
              <span className="badge badge-success">Vault Active</span>
            </div>
            <h1 style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--text-primary)' }}>{property.name}</h1>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
              <MapPin size={16} color="var(--accent-gold)" /> {property.location}
            </div>
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            <button
              onClick={() => setIsPassportModalOpen(true)}
              className="btn-secondary"
              style={{ padding: '0.75rem 1.25rem', fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
            >
              <FileText size={18} /> Financial Passport
            </button>
            {onNavigateToAgreements && (
              <button
                onClick={onNavigateToAgreements}
                className="btn-outline-gold"
                style={{ padding: '0.75rem 1.25rem', fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
              >
                <FileText size={18} /> Distribution Agreements
              </button>
            )}
            <button
              onClick={() => setIsDepositModalOpen(true)}
              className="btn-primary"
              style={{ padding: '0.75rem 1.5rem', fontSize: '0.95rem' }}
            >
              <PlusCircle size={18} /> Deposit Property Revenue
            </button>
          </div>
        </div>
      </div>

      {/* Hero Media & Top Metrics */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.8fr) minmax(0, 1.2fr)', gap: '1.5rem' }}>
        <div className="glass-card" style={{ overflow: 'hidden', height: 380, position: 'relative' }}>
          <img
            src={property.image_url}
            alt={property.name}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
          <div
            style={{
              position: 'absolute',
              bottom: 0,
              insetInline: 0,
              padding: '1.25rem',
              background: 'linear-gradient(to top, rgba(7, 10, 19, 0.95), transparent)',
            }}
          >
            <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              Stellar Testnet Vault Identifier:
            </div>
            <div className="mono-text" style={{ fontSize: '0.85rem', color: 'var(--accent-gold)', wordBreak: 'break-all' }}>
              {property.vault_stellar_address}
            </div>
          </div>
        </div>

        {/* Financial Highlights */}
        <div className="glass-card" style={{ padding: '1.75rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontSize: '0.8rem', color: 'var(--accent-gold)', fontWeight: 700, textTransform: 'uppercase', marginBottom: '0.5rem' }}>
              Financial Summary
            </div>
            <h3 style={{ fontSize: '1.35rem', fontWeight: 700, marginBottom: '1.25rem' }}>Core Capital Structure</h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '0.75rem', borderBottom: '1px solid var(--border-subtle)' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Property Valuation:</span>
                <span style={{ fontWeight: 700, fontSize: '1.1rem' }}>${property.valuation.toLocaleString()}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '0.75rem', borderBottom: '1px solid var(--border-subtle)' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Physical Occupancy:</span>
                <span style={{ fontWeight: 700, color: 'var(--accent-emerald)', fontSize: '1.1rem' }}>
                  {property.occupancy_percentage}% ({property.unit_count} Units)
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '0.75rem', borderBottom: '1px solid var(--border-subtle)' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Total Verified Revenue:</span>
                <span style={{ fontWeight: 700, color: 'var(--accent-gold)', fontSize: '1.1rem' }}>
                  ${(financials?.total_revenue_confirmed || 16000).toLocaleString()} XLM
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '0.75rem', borderBottom: '1px solid var(--border-subtle)' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Reserve Provision (15%):</span>
                <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                  ${((financials?.total_revenue_confirmed || 16000) * 0.15).toLocaleString()}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Net Distributable:</span>
                <span style={{ fontWeight: 700, color: 'var(--accent-cyan)' }}>
                  ${((financials?.total_revenue_confirmed || 16000) * 0.85).toLocaleString()}
                </span>
              </div>
            </div>
          </div>

          <div
            style={{
              padding: '0.85rem',
              background: 'rgba(255, 255, 255, 0.03)',
              borderRadius: 'var(--radius-sm)',
              fontSize: '0.75rem',
              color: 'var(--text-muted)',
              marginTop: '1rem',
            }}
          >
            * Verified on Stellar ledger. Waterfalls and multi-party distributions execute according to locked distribution agreements.
          </div>
        </div>
      </div>

      {/* OVERVIEW & UNITS TABS */}
      <div className="grid-2">
        {/* Description & Specs */}
        <div className="glass-card" style={{ padding: '1.75rem' }}>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Building2 size={20} color="var(--accent-gold)" /> Property Profile & Specs
          </h3>
          <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '1.5rem' }}>
            {property.description}
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', fontSize: '0.875rem' }}>
            <div>
              <span style={{ color: 'var(--text-muted)', display: 'block' }}>Construction Year</span>
              <strong>{property.metadata?.construction_year || 2022}</strong>
            </div>
            <div>
              <span style={{ color: 'var(--text-muted)', display: 'block' }}>Gross Floor Area</span>
              <strong>{property.metadata?.gross_floor_area_sqm || 1850} m²</strong>
            </div>
            <div>
              <span style={{ color: 'var(--text-muted)', display: 'block' }}>Energy Efficiency</span>
              <strong>{property.metadata?.energy_rating || 'A'}</strong>
            </div>
            <div>
              <span style={{ color: 'var(--text-muted)', display: 'block' }}>Accepted Revenue Asset</span>
              <strong>XLM / USDC</strong>
            </div>
          </div>
        </div>

        {/* Ownership & Participation */}
        <div className="glass-card" style={{ padding: '1.75rem' }}>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <UserCheck size={20} color="var(--accent-cyan)" /> Participation & Stakeholders
          </h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '1.25rem' }}>
            Prototype participation allocations registered in the core database model.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            {participations.map((part) => (
              <div
                key={part.id}
                style={{
                  padding: '1rem',
                  background: 'rgba(255, 255, 255, 0.02)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-sm)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <div>
                  <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                    {part.participant?.display_name || 'Stakeholder'}
                  </div>
                  <div className="mono-text" style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    {part.participant?.wallet_address.substring(0, 10)}...{part.participant?.wallet_address.substring(part.participant?.wallet_address.length - 8)}
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--accent-gold)' }}>
                    {part.share_percentage}%
                  </div>
                  <span className="badge badge-stellar" style={{ fontSize: '0.65rem' }}>
                    {part.role}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* REVENUE ACTIVITY & STELLAR TESTNET HISTORY */}
      <div className="glass-card" style={{ padding: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <div className="section-tag">
              <Coins size={16} /> Transparent On-Chain Ledger
            </div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 700 }}>Property Revenue Activity</h2>
          </div>
          <button onClick={() => setIsDepositModalOpen(true)} className="btn-primary" style={{ fontSize: '0.85rem' }}>
            <PlusCircle size={15} /> New Revenue Deposit
          </button>
        </div>

        {revenueHistory.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--text-muted)' }}>
            <Coins size={36} style={{ margin: '0 auto 1rem', opacity: 0.5 }} />
            <p>No revenue deposits recorded yet for this property.</p>
            <button onClick={() => setIsDepositModalOpen(true)} className="btn-outline-gold" style={{ marginTop: '1rem' }}>
              Initiate First Deposit
            </button>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-card)', color: 'var(--text-muted)' }}>
                  <th style={{ padding: '0.75rem 1rem' }}>Timestamp</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Source</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Amount</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Depositor</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Transaction Hash</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Status</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Explorer</th>
                </tr>
              </thead>
              <tbody>
                {revenueHistory.map((rec) => (
                  <tr
                    key={rec.id}
                    style={{ borderBottom: '1px solid var(--border-subtle)', transition: 'var(--transition)' }}
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.02)')}
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                  >
                    <td style={{ padding: '1rem', color: 'var(--text-secondary)' }}>
                      {new Date(rec.verified_at).toLocaleDateString()} {new Date(rec.verified_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td style={{ padding: '1rem', fontWeight: 600 }}>{rec.source}</td>
                    <td style={{ padding: '1rem', fontWeight: 700, color: 'var(--accent-gold)' }}>
                      {rec.amount.toLocaleString()} {rec.asset}
                    </td>
                    <td style={{ padding: '1rem' }}>
                      <span className="mono-text" style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        {rec.depositor_address.substring(0, 6)}...{rec.depositor_address.substring(rec.depositor_address.length - 4)}
                      </span>
                    </td>
                    <td style={{ padding: '1rem' }}>
                      <span className="mono-text" style={{ fontSize: '0.75rem', color: 'var(--accent-cyan)' }}>
                        {rec.transaction_hash.substring(0, 10)}...
                      </span>
                    </td>
                    <td style={{ padding: '1rem' }}>
                      <span className="badge badge-success" style={{ fontSize: '0.7rem' }}>
                        <CheckCircle2 size={12} /> {rec.status}
                      </span>
                    </td>
                    <td style={{ padding: '1rem' }}>
                      <a
                        href={`${STELLAR_EXPERT_EXPLORER}/${rec.transaction_hash}`}
                        target="_blank"
                        rel="noreferrer"
                        className="btn-secondary"
                        style={{ padding: '0.35rem 0.65rem', fontSize: '0.75rem', display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}
                      >
                        Inspect <ExternalLink size={12} />
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* PROGRAMMABLE AGREEMENT & SETTLEMENT ENGINE */}
      <div
        className="glass-card"
        style={{
          padding: '2.5rem',
          border: '1px dashed rgba(168, 85, 247, 0.4)',
          background: 'rgba(24, 18, 43, 0.4)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', marginBottom: '0.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span className="badge badge-stellar">Live Protocol Component</span>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Soroban Distribution Agreements Active</span>
          </div>
          {onNavigateToAgreements && (
            <button
              onClick={onNavigateToAgreements}
              className="btn-outline-gold"
              style={{ fontSize: '0.8rem', padding: '0.4rem 0.85rem' }}
            >
              Open Agreements & Waterfalls →
            </button>
          )}
        </div>
        <h3 style={{ fontSize: '1.4rem', fontWeight: 700, color: '#fff', marginBottom: '0.75rem' }}>
          Programmable Distribution Agreements & Waterfall Rules
        </h3>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.6, maxWidth: 850, marginBottom: '2rem' }}>
          Stellar Estate transforms real-estate cash flows into an immutable financial agreement system. Multi-stakeholder waterfall agreements are canonicalized, cryptographically hashed, approved via Stellar wallets, and locked on Soroban for automated settlement execution.
        </p>

        <div className="grid-3">
          <div style={{ padding: '1.25rem', background: 'rgba(255, 255, 255, 0.02)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
            <div style={{ fontSize: '0.8rem', color: '#10b981', fontWeight: 700, marginBottom: '0.35rem' }}>GOVERNANCE & CONSENSUS</div>
            <h4 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '0.5rem' }}>Distribution Agreements</h4>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              On-chain Soroban multi-signature agreements defining immutable basis-point rules, stakeholders, and canonical hashes.
            </p>
          </div>

          <div style={{ padding: '1.25rem', background: 'rgba(255, 255, 255, 0.02)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
            <div style={{ fontSize: '0.8rem', color: '#10b981', fontWeight: 700, marginBottom: '0.35rem' }}>DETERMINISTIC WATERFALL</div>
            <h4 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '0.5rem' }}>Tranche Engine</h4>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Deterministic sequence: Expenses → Reserves → Management Fee → Distributable Revenue → Stakeholder Allocations.
            </p>
          </div>

          <div style={{ padding: '1.25rem', background: 'rgba(255, 255, 255, 0.02)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
            <div style={{ fontSize: '0.8rem', color: '#c084fc', fontWeight: 700, marginBottom: '0.35rem' }}>SETTLEMENT ENGINE</div>
            <h4 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '0.5rem' }}>Atomic Multi-Disbursement</h4>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Automated multi-recipient disbursements executed atomically on Stellar with instantaneous cryptographic settlement receipts.
            </p>
          </div>
        </div>
      </div>

      {/* Deposit Modal */}
      <RevenueDepositModal
        property={property}
        isOpen={isDepositModalOpen}
        onClose={() => setIsDepositModalOpen(false)}
        onRevenueConfirmed={loadPropertyData}
      />

      {/* Financial Passport Modal */}
      <FinancialPassportModal
        propertyId={property.id}
        isOpen={isPassportModalOpen}
        onClose={() => setIsPassportModalOpen(false)}
      />
    </div>
  );
};
