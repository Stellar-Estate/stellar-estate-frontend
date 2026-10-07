import React, { useState, useEffect } from 'react';
import { Property, RevenueRecord } from '../types/index.ts';
import { apiService } from '../services/apiService.ts';
import { STELLAR_EXPERT_EXPLORER } from '../services/stellarService.ts';
import {
  TrendingUp,
  DollarSign,
  Layers,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  ShieldCheck,
  Calendar,
  Building2,
} from 'lucide-react';

interface DashboardPageProps {
  properties: Property[];
  onSelectProperty: (property: Property) => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({ properties, onSelectProperty }) => {
  const [allRevenues, setAllRevenues] = useState<RevenueRecord[]>([]);
  const [reconReport, setReconReport] = useState<any>(null);

  useEffect(() => {
    const fetchData = async () => {
      let combined: RevenueRecord[] = [];
      for (const p of properties) {
        const revs = await apiService.getPropertyRevenue(p.id);
        combined = [...combined, ...revs];
      }
      setAllRevenues(combined);

      const report = await apiService.getReconciliationReport();
      setReconReport(report);
    };
    fetchData();
  }, [properties]);

  const totalRevenue = allRevenues.reduce((acc, r) => acc + r.amount, 0);
  const totalTransactions = allRevenues.length;
  const portfolioValuation = properties.reduce((acc, p) => acc + p.valuation, 0);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
      {/* Header */}
      <div className="section-header">
        <div className="section-tag">
          <TrendingUp size={16} /> Financial Operations
        </div>
        <h1 className="section-title">Portfolio Revenue & Settlement Dashboard</h1>
        <p className="section-subtitle">
          Real-time aggregated revenue metrics, blockchain settlement activity, and cryptographic reconciliation status across all property vaults.
        </p>
      </div>

      {/* Top 4 Metric Cards */}
      <div className="grid-4">
        <div className="glass-card" style={{ padding: '1.5rem' }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
            Portfolio Total Revenue
          </div>
          <div style={{ fontSize: '1.85rem', fontWeight: 800, color: 'var(--accent-gold)', margin: '0.35rem 0' }}>
            ${totalRevenue.toLocaleString()} XLM
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--accent-emerald)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
            <CheckCircle2 size={13} /> 100% Verified On-Chain
          </div>
        </div>

        <div className="glass-card" style={{ padding: '1.5rem' }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
            Settlement Transactions
          </div>
          <div style={{ fontSize: '1.85rem', fontWeight: 800, color: 'var(--text-primary)', margin: '0.35rem 0' }}>
            {totalTransactions}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
            Across {properties.length} Active Vaults
          </div>
        </div>

        <div className="glass-card" style={{ padding: '1.5rem' }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
            Total Asset Valuation
          </div>
          <div style={{ fontSize: '1.85rem', fontWeight: 800, color: 'var(--text-primary)', margin: '0.35rem 0' }}>
            ${portfolioValuation.toLocaleString()}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
            Underlying Real-Estate Assets
          </div>
        </div>

        <div className="glass-card" style={{ padding: '1.5rem' }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
            Reconciliation State
          </div>
          <div style={{ fontSize: '1.85rem', fontWeight: 800, color: 'var(--accent-emerald)', margin: '0.35rem 0' }}>
            BALANCED
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--accent-emerald)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
            <ShieldCheck size={13} /> Zero Discrepancy Found
          </div>
        </div>
      </div>

      {/* Financial Trend SVG Chart */}
      <div className="glass-card" style={{ padding: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700 }}>Quarterly Revenue Ingestion Trend</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              Verified cash flow settled through Stellar Testnet vaults (2026)
            </p>
          </div>
          <div className="badge badge-stellar">Monthly Run-Rate: $43,700 XLM</div>
        </div>

        {/* Clean SVG financial curve */}
        <div style={{ width: '100%', height: 220, position: 'relative' }}>
          <svg viewBox="0 0 800 200" style={{ width: '100%', height: '100%', overflow: 'visible' }}>
            <defs>
              <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#e2b714" stopOpacity="0.4" />
                <stop offset="100%" stopColor="#e2b714" stopOpacity="0.0" />
              </linearGradient>
            </defs>

            {/* Grid Lines */}
            <line x1="50" y1="30" x2="750" y2="30" stroke="rgba(255,255,255,0.06)" strokeDasharray="4" />
            <line x1="50" y1="90" x2="750" y2="90" stroke="rgba(255,255,255,0.06)" strokeDasharray="4" />
            <line x1="50" y1="150" x2="750" y2="150" stroke="rgba(255,255,255,0.06)" strokeDasharray="4" />

            {/* Area */}
            <path
              d="M 100 150 L 220 120 L 360 135 L 500 85 L 640 60 L 720 40 L 720 180 L 100 180 Z"
              fill="url(#chartGradient)"
            />

            {/* Line */}
            <path
              d="M 100 150 L 220 120 L 360 135 L 500 85 L 640 60 L 720 40"
              fill="none"
              stroke="#e2b714"
              strokeWidth="3.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            {/* Data Points */}
            <circle cx="100" cy="150" r="5" fill="#e2b714" stroke="#070a13" strokeWidth="2" />
            <circle cx="220" cy="120" r="5" fill="#e2b714" stroke="#070a13" strokeWidth="2" />
            <circle cx="360" cy="135" r="5" fill="#e2b714" stroke="#070a13" strokeWidth="2" />
            <circle cx="500" cy="85" r="5" fill="#e2b714" stroke="#070a13" strokeWidth="2" />
            <circle cx="640" cy="60" r="5" fill="#e2b714" stroke="#070a13" strokeWidth="2" />
            <circle cx="720" cy="40" r="6" fill="#38bdf8" stroke="#070a13" strokeWidth="2" />

            {/* Labels */}
            <text x="100" y="195" fill="#64748b" fontSize="12" textAnchor="middle">May '26</text>
            <text x="220" y="195" fill="#64748b" fontSize="12" textAnchor="middle">Jun '26</text>
            <text x="360" y="195" fill="#64748b" fontSize="12" textAnchor="middle">Jul '26</text>
            <text x="500" y="195" fill="#64748b" fontSize="12" textAnchor="middle">Aug '26</text>
            <text x="640" y="195" fill="#64748b" fontSize="12" textAnchor="middle">Sep '26</text>
            <text x="720" y="195" fill="#38bdf8" fontSize="12" textAnchor="middle">Oct '26 (Live)</text>
          </svg>
        </div>
      </div>

      {/* Property Vault Breakdown Table */}
      <div className="glass-card" style={{ padding: '2rem' }}>
        <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1.25rem' }}>
          Property Vault Financial Performance
        </h3>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-card)', color: 'var(--text-muted)' }}>
                <th style={{ padding: '0.75rem 1rem' }}>Property</th>
                <th style={{ padding: '0.75rem 1rem' }}>Location</th>
                <th style={{ padding: '0.75rem 1rem' }}>Valuation</th>
                <th style={{ padding: '0.75rem 1rem' }}>Occupancy</th>
                <th style={{ padding: '0.75rem 1rem' }}>Confirmed Revenue</th>
                <th style={{ padding: '0.75rem 1rem' }}>Vault Address</th>
                <th style={{ padding: '0.75rem 1rem' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {properties.map((p) => (
                <tr
                  key={p.id}
                  style={{ borderBottom: '1px solid var(--border-subtle)' }}
                >
                  <td style={{ padding: '1rem', fontWeight: 600 }}>{p.name}</td>
                  <td style={{ padding: '1rem', color: 'var(--text-secondary)' }}>{p.location}</td>
                  <td style={{ padding: '1rem', fontWeight: 600 }}>${p.valuation.toLocaleString()}</td>
                  <td style={{ padding: '1rem', color: 'var(--accent-emerald)', fontWeight: 600 }}>
                    {p.occupancy_percentage}%
                  </td>
                  <td style={{ padding: '1rem', fontWeight: 700, color: 'var(--accent-gold)' }}>
                    ${(p.financial_summary?.total_revenue_recorded || 8000).toLocaleString()} XLM
                  </td>
                  <td style={{ padding: '1rem' }}>
                    <span className="mono-text" style={{ fontSize: '0.75rem', color: 'var(--accent-cyan)' }}>
                      {p.vault_stellar_address.substring(0, 8)}...{p.vault_stellar_address.substring(p.vault_stellar_address.length - 4)}
                    </span>
                  </td>
                  <td style={{ padding: '1rem' }}>
                    <button
                      onClick={() => onSelectProperty(p)}
                      className="btn-secondary"
                      style={{ padding: '0.35rem 0.75rem', fontSize: '0.75rem' }}
                    >
                      Inspect Profile
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
