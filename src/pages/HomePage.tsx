import React from 'react';
import { Property } from '../types/index.ts';
import {
  Building2,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Lock,
  Layers,
  Sparkles,
  TrendingUp,
  Coins,
  Scale,
} from 'lucide-react';

interface HomePageProps {
  properties: Property[];
  onSelectProperty: (property: Property) => void;
  onExploreProperties: () => void;
}

export const HomePage: React.FC<HomePageProps> = ({
  properties,
  onSelectProperty,
  onExploreProperties,
}) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '4.5rem' }}>
      {/* HERO SECTION */}
      <section
        style={{
          padding: '4rem 0 2rem',
          textAlign: 'center',
          maxWidth: 900,
          margin: '0 auto',
        }}
      >
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
          <span className="badge badge-stellar" style={{ padding: '0.35rem 0.85rem' }}>
            <Sparkles size={14} /> Live Platform — Stellar Testnet
          </span>
        </div>

        <h1
          style={{
            fontSize: '3.4rem',
            fontWeight: 800,
            lineHeight: 1.15,
            letterSpacing: '-0.03em',
            marginBottom: '1.5rem',
            background: 'linear-gradient(180deg, #FFFFFF 0%, #CBD5E1 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
        >
          Every property has a story.<br />
          <span style={{ color: 'var(--accent-gold)', WebkitTextFillColor: 'var(--accent-gold)' }}>
            We make its money programmable.
          </span>
        </h1>

        <p
          style={{
            fontSize: '1.2rem',
            color: 'var(--text-secondary)',
            lineHeight: 1.6,
            marginBottom: '2.5rem',
            maxWidth: 720,
            margin: '0 auto 2.5rem',
          }}
        >
          Stellar Estate provides real-estate financial infrastructure that makes property revenues transparent, traceable, and ready for programmable settlement on the Stellar network.
        </p>

        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          <button onClick={onExploreProperties} className="btn-primary" style={{ padding: '0.85rem 1.75rem', fontSize: '1rem' }}>
            Discover Properties <ArrowRight size={18} />
          </button>
          <a
            href="https://github.com/Stellar-Estate"
            target="_blank"
            rel="noreferrer"
            className="btn-secondary"
            style={{ padding: '0.85rem 1.75rem', fontSize: '1rem' }}
          >
            Review GitHub Architecture
          </a>
        </div>
      </section>

      {/* CORE VALUE PILLARS */}
      <section>
        <div className="section-header" style={{ textAlign: 'center', maxWidth: 640, margin: '0 auto 2.5rem' }}>
          <div className="section-tag" style={{ justifyContent: 'center' }}>
            <ShieldCheck size={16} /> Architectural Paradigm
          </div>
          <h2 className="section-title">Why Stellar Estate?</h2>
          <p className="section-subtitle" style={{ margin: '0.5rem auto 0' }}>
            Traditional property finance is fragmented into closed banking ledgers and manual accounting. We establish direct on-chain revenue traceability.
          </p>
        </div>

        <div className="grid-3">
          <div className="glass-card" style={{ padding: '2rem' }}>
            <div
              style={{
                width: 48,
                height: 48,
                borderRadius: 'var(--radius-sm)',
                background: 'rgba(226, 183, 20, 0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--accent-gold)',
                marginBottom: '1.25rem',
              }}
            >
              <Coins size={26} />
            </div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.5rem' }}>
              Real Revenue, Not Speculation
            </h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.6 }}>
              We do not build generic NFT badges or fake token speculation. The application captures verified rental and commercial lease revenue directly into dedicated property vaults.
            </p>
          </div>

          <div className="glass-card" style={{ padding: '2rem' }}>
            <div
              style={{
                width: 48,
                height: 48,
                borderRadius: 'var(--radius-sm)',
                background: 'rgba(56, 189, 248, 0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--accent-cyan)',
                marginBottom: '1.25rem',
              }}
            >
              <Lock size={26} />
            </div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.5rem' }}>
              Independent Stellar Verification
            </h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.6 }}>
              Client assertions are never trusted. All revenue events are independently verified against Stellar Horizon testnet validators, enforcing idempotency and preventing transaction replay.
            </p>
          </div>

          <div className="glass-card" style={{ padding: '2rem' }}>
            <div
              style={{
                width: 48,
                height: 48,
                borderRadius: 'var(--radius-sm)',
                background: 'rgba(168, 85, 247, 0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#c084fc',
                marginBottom: '1.25rem',
              }}
            >
              <Layers size={26} />
            </div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.5rem' }}>
              Soroban Financial Core
            </h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.6 }}>
              Smart contracts in Rust enforce immutable vault accounting with safe integer arithmetic (zero floating-point math), structured for future multi-party waterfall settlement.
            </p>
          </div>
        </div>
      </section>

      {/* FEATURED PROPERTIES */}
      <section>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '2rem' }}>
          <div>
            <div className="section-tag">
              <Building2 size={16} /> Portfolio Discovery
            </div>
            <h2 className="section-title">Featured Property Vaults</h2>
          </div>
          <button onClick={onExploreProperties} className="btn-secondary">
            View All ({properties.length}) <ArrowRight size={16} />
          </button>
        </div>

        <div className="grid-3">
          {properties.slice(0, 3).map((prop) => (
            <div
              key={prop.id}
              className="glass-card"
              style={{ overflow: 'hidden', cursor: 'pointer', display: 'flex', flexDirection: 'column' }}
              onClick={() => onSelectProperty(prop)}
            >
              <div style={{ position: 'relative', height: 210, overflow: 'hidden' }}>
                <img
                  src={prop.image_url}
                  alt={prop.name}
                  style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.4s ease' }}
                  onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.05)')}
                  onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
                />
                <div style={{ position: 'absolute', top: 12, right: 12 }}>
                  <span className="badge badge-success">Active Vault</span>
                </div>
                <div
                  style={{
                    position: 'absolute',
                    bottom: 0,
                    insetInline: 0,
                    padding: '1rem',
                    background: 'linear-gradient(to top, rgba(7, 10, 19, 0.95), transparent)',
                  }}
                >
                  <span style={{ fontSize: '0.8rem', color: 'var(--accent-gold)', fontWeight: 600 }}>
                    {prop.property_type}
                  </span>
                  <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#fff' }}>{prop.name}</h3>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{prop.location}</p>
                </div>
              </div>

              <div style={{ padding: '1.25rem', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1.25rem' }}>
                  <div>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Valuation</span>
                    <div style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                      ${prop.valuation.toLocaleString()}
                    </div>
                  </div>
                  <div>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Occupancy</span>
                    <div style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--accent-emerald)' }}>
                      {prop.occupancy_percentage}%
                    </div>
                  </div>
                  <div>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Units</span>
                    <div style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                      {prop.unit_count} Units
                    </div>
                  </div>
                  <div>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Monthly Revenue</span>
                    <div style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--accent-gold)' }}>
                      ${(prop.financial_summary?.monthly_run_rate || 8000).toLocaleString()}
                    </div>
                  </div>
                </div>

                <div
                  style={{
                    paddingTop: '0.75rem',
                    borderTop: '1px solid var(--border-subtle)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    fontSize: '0.8rem',
                  }}
                >
                  <span className="mono-text" style={{ color: 'var(--text-muted)' }}>
                    Vault: {prop.vault_stellar_address.substring(0, 6)}...{prop.vault_stellar_address.substring(prop.vault_stellar_address.length - 4)}
                  </span>
                  <span style={{ color: 'var(--accent-gold)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                    Inspect Profile <ArrowRight size={14} />
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* HOW PROPERTY REVENUE WORKS ON STELLAR */}
      <section
        className="glass-card"
        style={{
          padding: '3rem 2rem',
          background: 'linear-gradient(135deg, rgba(18, 26, 44, 0.8) 0%, rgba(11, 17, 32, 0.9) 100%)',
        }}
      >
        <div style={{ textAlign: 'center', maxWidth: 700, margin: '0 auto 2.5rem' }}>
          <div className="section-tag" style={{ justifyContent: 'center' }}>
            <Scale size={16} /> Traceable Settlement Pathway
          </div>
          <h2 className="section-title">The Property Revenue Pipeline</h2>
          <p className="section-subtitle" style={{ margin: '0.5rem auto 0' }}>
            From tenant payment to verified cryptographic proof on Stellar.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem', textAlign: 'center' }}>
          <div style={{ padding: '1rem' }}>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--accent-gold)', marginBottom: '0.5rem' }}>01</div>
            <h4 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '0.35rem' }}>Physical Property</h4>
            <p style={{ fontSize: '0.825rem', color: 'var(--text-secondary)' }}>
              Verified properties with known unit configurations and physical occupancy metrics.
            </p>
          </div>
          <div style={{ padding: '1rem' }}>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--accent-cyan)', marginBottom: '0.5rem' }}>02</div>
            <h4 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '0.35rem' }}>Revenue Intent</h4>
            <p style={{ fontSize: '0.825rem', color: 'var(--text-secondary)' }}>
              Operating rent or lease revenues designated for the property's dedicated vault.
            </p>
          </div>
          <div style={{ padding: '1rem' }}>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--accent-emerald)', marginBottom: '0.5rem' }}>03</div>
            <h4 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '0.35rem' }}>Stellar Transaction</h4>
            <p style={{ fontSize: '0.825rem', color: 'var(--text-secondary)' }}>
              Payer signs and broadcasts payment transaction directly to Stellar Testnet validators.
            </p>
          </div>
          <div style={{ padding: '1rem' }}>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#c084fc', marginBottom: '0.5rem' }}>04</div>
            <h4 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '0.35rem' }}>Independent Audit</h4>
            <p style={{ fontSize: '0.825rem', color: 'var(--text-secondary)' }}>
              Backend independently verifies on-chain facts, prevents replays, and updates financials.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};
