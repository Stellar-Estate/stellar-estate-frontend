import React, { useState } from 'react';
import { Sparkles, X, ChevronRight, CheckCircle2, Shield, Coins, FileText, Activity } from 'lucide-react';

interface DemoModeBannerProps {
  onNavigateTab: (tab: string) => void;
  currentTab: string;
}

export const DemoModeBanner: React.FC<DemoModeBannerProps> = ({ onNavigateTab, currentTab }) => {
  const [isDismissed, setIsDismissed] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);

  if (isDismissed) return null;

  if (isMinimized) {
    return (
      <div
        style={{
          position: 'fixed',
          bottom: '1.5rem',
          right: '1.5rem',
          zIndex: 900,
          background: 'rgba(15, 23, 42, 0.95)',
          border: '1px solid rgba(251, 191, 36, 0.4)',
          borderRadius: 'var(--radius-md)',
          padding: '0.6rem 1rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.5)',
          backdropFilter: 'blur(10px)',
        }}
      >
        <Sparkles size={16} style={{ color: 'var(--accent-gold)' }} />
        <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#fff' }}>Hackathon Judge Tour</span>
        <button
          onClick={() => setIsMinimized(false)}
          className="btn-outline-gold"
          style={{ fontSize: '0.75rem', padding: '0.25rem 0.6rem' }}
        >
          Expand
        </button>
      </div>
    );
  }

  const steps = [
    {
      id: 'properties',
      label: '1. Property Vaults',
      desc: 'On-chain Soroban vaults, valuation & occupancy',
      icon: Shield,
    },
    {
      id: 'agreements',
      label: '2. Multi-Party Agreements',
      desc: 'Quorum consensus, Ed25519 hash locking',
      icon: FileText,
    },
    {
      id: 'settlements',
      label: '3. Programmable Settlements',
      desc: 'Automated waterfall & rent tracing',
      icon: Coins,
    },
    {
      id: 'audit',
      label: '4. Provenance & Audit',
      desc: 'Horizon ledger reconciliation',
      icon: Activity,
    },
  ];

  return (
    <div
      style={{
        background: 'linear-gradient(90deg, rgba(226, 183, 20, 0.12) 0%, rgba(30, 41, 59, 0.95) 50%, rgba(15, 23, 42, 0.98) 100%)',
        borderBottom: '1px solid rgba(251, 191, 36, 0.35)',
        padding: '0.75rem 1.5rem',
        position: 'relative',
        zIndex: 50,
      }}
    >
      <div
        style={{
          maxWidth: 1280,
          margin: '0 auto',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: '50%',
              background: 'rgba(251, 191, 36, 0.2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--accent-gold)',
            }}
          >
            <Sparkles size={16} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ fontSize: '0.82rem', fontWeight: 800, color: 'var(--accent-gold)', letterSpacing: '0.04em' }}>
                HACKATHON EVALUATION WALKTHROUGH
              </span>
              <span className="badge badge-verified" style={{ fontSize: '0.65rem', padding: '0.1rem 0.4rem' }}>
                LIVE TESTNET
              </span>
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
              Explore the 4 core pillars of Stellar Estate's real-world asset financial protocol.
            </div>
          </div>
        </div>

        {/* Guided Step Buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
          {steps.map((s) => {
            const isActive = currentTab === s.id;
            const Icon = s.icon;
            return (
              <button
                key={s.id}
                onClick={() => onNavigateTab(s.id)}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  padding: '0.35rem 0.75rem',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '0.75rem',
                  fontWeight: isActive ? 800 : 600,
                  background: isActive ? 'var(--accent-gold)' : 'rgba(255, 255, 255, 0.05)',
                  color: isActive ? '#000' : '#fff',
                  border: isActive ? '1px solid var(--accent-gold)' : '1px solid rgba(255, 255, 255, 0.1)',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
                title={s.desc}
              >
                <Icon size={12} />
                <span>{s.label}</span>
              </button>
            );
          })}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <button
            onClick={() => setIsMinimized(true)}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--text-muted)',
              fontSize: '0.75rem',
              cursor: 'pointer',
              padding: '0.2rem 0.4rem',
            }}
          >
            Minimize
          </button>
          <button
            onClick={() => setIsDismissed(true)}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--text-muted)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              padding: '0.2rem',
            }}
            title="Dismiss Tour"
          >
            <X size={15} />
          </button>
        </div>
      </div>
    </div>
  );
};
