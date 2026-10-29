import React, { useState, useEffect } from 'react';
import { ShieldAlert, ExternalLink, Code2, Activity, CheckCircle2, AlertCircle } from 'lucide-react';
import { stellarService } from '../services/stellarService';
import { SystemDiagnosticsModal } from './SystemDiagnosticsModal.tsx';

export const Footer: React.FC = () => {
  const [isDiagnosticsOpen, setIsDiagnosticsOpen] = useState(false);
  const [networkHealth, setNetworkHealth] = useState<{
    operational: boolean;
    latencyMs: number;
    latestLedger: number;
    checked: boolean;
  }>({
    operational: true,
    latencyMs: 42,
    latestLedger: 0,
    checked: false,
  });

  useEffect(() => {
    let isMounted = true;
    const fetchHealth = async () => {
      const res = await stellarService.checkHorizonHealth();
      if (isMounted) {
        setNetworkHealth({
          operational: res.operational,
          latencyMs: res.latencyMs,
          latestLedger: res.latestLedger,
          checked: true,
        });
      }
    };
    fetchHealth();
    const interval = setInterval(fetchHealth, 30000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);
  return (
    <footer
      style={{
        borderTop: '1px solid var(--border-subtle)',
        background: 'rgba(5, 7, 14, 0.95)',
        padding: '3rem 1.5rem',
        marginTop: 'auto',
      }}
    >
      <div style={{ maxWidth: 1280, margin: '0 auto' }}>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '2.5rem',
            marginBottom: '2.5rem',
          }}
        >
          {/* Brand Vision */}
          <div>
            <div style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.75rem' }}>
              STELLAR ESTATE
            </div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', fontStyle: 'italic', marginBottom: '1rem' }}>
              “Every property has a story. We make its money programmable.”
            </p>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
              Real-estate financial infrastructure connecting off-chain property revenues to on-chain Stellar settlement architecture.
            </p>
          </div>

          {/* Repositories & Resources */}
          <div>
            <div style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--accent-gold)', textTransform: 'uppercase', marginBottom: '0.75rem' }}>
              GitHub Organization Repositories
            </div>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.65rem', fontSize: '0.875rem' }}>
              <li>
                <a
                  href="https://github.com/Stellar-Estate/stellar-estate-frontend"
                  target="_blank"
                  rel="noreferrer"
                  style={{ color: 'var(--text-secondary)', display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}
                >
                  <Code2 size={15} /> stellar-estate-frontend <ExternalLink size={12} />
                </a>
              </li>
              <li>
                <a
                  href="https://github.com/Stellar-Estate/stellar-estate-core"
                  target="_blank"
                  rel="noreferrer"
                  style={{ color: 'var(--text-secondary)', display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}
                >
                  <Code2 size={15} /> stellar-estate-core (Backend & Soroban) <ExternalLink size={12} />
                </a>
              </li>
              <li>
                <a
                  href="https://stellar.expert/explorer/testnet"
                  target="_blank"
                  rel="noreferrer"
                  style={{ color: 'var(--text-secondary)', display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}
                >
                  Stellar.Expert Testnet Explorer <ExternalLink size={12} />
                </a>
              </li>
            </ul>
          </div>

          {/* Network & Specs */}
          <div>
            <div style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--accent-cyan)', textTransform: 'uppercase', marginBottom: '0.75rem' }}>
              Network & Technical Context
            </div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
              <div><strong>Network:</strong> Stellar Testnet</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <strong>Horizon Status:</strong>
                <span
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.35rem',
                    padding: '0.15rem 0.5rem',
                    borderRadius: '12px',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    background: networkHealth.operational ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                    color: networkHealth.operational ? '#10b981' : '#ef4444',
                    border: `1px solid ${networkHealth.operational ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`,
                  }}
                >
                  {networkHealth.operational ? <CheckCircle2 size={12} /> : <AlertCircle size={12} />}
                  {networkHealth.operational ? `Live (${networkHealth.latencyMs}ms)` : 'Offline'}
                </span>
                <button
                  onClick={() => setIsDiagnosticsOpen(true)}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.35rem',
                    padding: '0.2rem 0.6rem',
                    borderRadius: '8px',
                    fontSize: '0.72rem',
                    fontWeight: 600,
                    background: 'rgba(59, 130, 246, 0.15)',
                    color: '#60a5fa',
                    border: '1px solid rgba(59, 130, 246, 0.3)',
                    cursor: 'pointer',
                    marginLeft: '0.5rem',
                  }}
                  title="View live system diagnostics and telemetry"
                >
                  <Activity size={12} /> System Diagnostics
                </button>
              </div>
              {networkHealth.latestLedger > 0 && (
                <div><strong>Latest Ledger:</strong> <span className="mono-text" style={{ fontSize: '0.75rem' }}>#{networkHealth.latestLedger.toLocaleString()}</span></div>
              )}
              <div><strong>Passphrase:</strong> <span className="mono-text" style={{ fontSize: '0.75rem' }}>Test SDF Network ; September 2015</span></div>
              <div><strong>Protocol Engine:</strong> Stellar Core &amp; Soroban Smart Contracts</div>
            </div>
          </div>
        </div>

        {/* Legal & Technical Disclaimer Box */}
        <div
          style={{
            padding: '1.25rem',
            background: 'rgba(255, 255, 255, 0.02)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-sm)',
            display: 'flex',
            gap: '1rem',
            alignItems: 'flex-start',
          }}
        >
          <ShieldAlert size={20} color="var(--accent-gold)" style={{ flexShrink: 0, marginTop: 2 }} />
          <div style={{ fontSize: '0.775rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
            <strong>LEGAL & TECHNICAL DISCLAIMER:</strong> This prototype demonstrates programmable real-estate financial infrastructure and accounting on the Stellar Testnet. It does <strong>not</strong> constitute a transfer of legal title to physical property, a regulated securities offering, investment advice, or a substitute for jurisdiction-specific property law. Physical deed ownership remains governed exclusively by local government land registries and statutory real-estate conveyance requirements.
          </div>
        </div>

        <div style={{ marginTop: '1.5rem', textAlign: 'center', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
          © 2026 Stellar Estate Organization. Licensed under Apache 2.0. Built for transparent, programmable property finance.
        </div>
      </div>

      <SystemDiagnosticsModal
        isOpen={isDiagnosticsOpen}
        onClose={() => setIsDiagnosticsOpen(false)}
      />
    </footer>
  );
};
