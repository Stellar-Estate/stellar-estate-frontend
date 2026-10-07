import React, { useState } from 'react';
import { useWallet } from '../context/WalletContext.tsx';
import { WalletModal } from './WalletModal.tsx';
import { Building2, Wallet, LogOut, RefreshCw, ChevronDown, CheckCircle2 } from 'lucide-react';

interface NavbarProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentTab, setCurrentTab }) => {
  const { wallet, disconnect, refreshBalance, isLoading } = useWallet();
  const [isWalletModalOpen, setIsWalletModalOpen] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

  const truncateAddress = (addr: string) => {
    return `${addr.substring(0, 4)}...${addr.substring(addr.length - 4)}`;
  };

  return (
    <>
      <header
        style={{
          borderBottom: '1px solid var(--border-subtle)',
          background: 'rgba(7, 10, 19, 0.85)',
          backdropFilter: 'blur(12px)',
          position: 'sticky',
          top: 0,
          zIndex: 100,
        }}
      >
        <div
          style={{
            maxWidth: 1280,
            margin: '0 auto',
            padding: '1rem 1.5rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          {/* Logo */}
          <div
            onClick={() => setCurrentTab('home')}
            style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer' }}
          >
            <div
              style={{
                width: 38,
                height: 38,
                borderRadius: 'var(--radius-sm)',
                background: 'linear-gradient(135deg, #e2b714 0%, #ca9e08 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#070a13',
                boxShadow: '0 0 15px rgba(226, 183, 20, 0.3)',
              }}
            >
              <Building2 size={22} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ fontSize: '1.2rem', fontWeight: 800, letterSpacing: '-0.02em', color: '#fff' }}>
                  STELLAR ESTATE
                </span>
                <span className="badge badge-stellar" style={{ fontSize: '0.65rem' }}>
                  TESTNET
                </span>
              </div>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'block', marginTop: -2 }}>
                Programmable Real-Estate Revenue
              </span>
            </div>
          </div>

          {/* Navigation Items */}
          <nav style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <button
              onClick={() => setCurrentTab('home')}
              className={currentTab === 'home' ? 'btn-outline-gold' : 'btn-secondary'}
              style={{ fontSize: '0.875rem', padding: '0.5rem 1rem' }}
            >
              Home
            </button>
            <button
              onClick={() => setCurrentTab('properties')}
              className={currentTab === 'properties' ? 'btn-outline-gold' : 'btn-secondary'}
              style={{ fontSize: '0.875rem', padding: '0.5rem 1rem' }}
            >
              Properties
            </button>
            <button
              onClick={() => setCurrentTab('dashboard')}
              className={currentTab === 'dashboard' ? 'btn-outline-gold' : 'btn-secondary'}
              style={{ fontSize: '0.875rem', padding: '0.5rem 1rem' }}
            >
              Revenue Dashboard
            </button>
            <button
              onClick={() => setCurrentTab('agreements')}
              className={currentTab === 'agreements' ? 'btn-outline-gold' : 'btn-secondary'}
              style={{ fontSize: '0.875rem', padding: '0.5rem 1rem' }}
            >
              Agreements
            </button>
            <button
              onClick={() => setCurrentTab('settlements')}
              className={currentTab === 'settlements' ? 'btn-outline-gold' : 'btn-secondary'}
              style={{ fontSize: '0.875rem', padding: '0.5rem 1rem' }}
            >
              Settlements
            </button>
            <button
              onClick={() => setCurrentTab('audit')}
              className={currentTab === 'audit' ? 'btn-outline-gold' : 'btn-secondary'}
              style={{ fontSize: '0.875rem', padding: '0.5rem 1rem' }}
            >
              Audit & Ledger
            </button>
          </nav>

          {/* Wallet Action */}
          <div style={{ position: 'relative' }}>
            {wallet.isConnected && wallet.address ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <div
                  onClick={() => setShowDropdown(!showDropdown)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    padding: '0.45rem 0.85rem',
                    background: 'var(--bg-card)',
                    border: '1px solid var(--border-card)',
                    borderRadius: 'var(--radius-sm)',
                    cursor: 'pointer',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                    <CheckCircle2 size={14} color="var(--accent-emerald)" />
                    <span className="mono-text" style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                      {truncateAddress(wallet.address)}
                    </span>
                  </div>
                  <span
                    style={{
                      background: 'rgba(255, 255, 255, 0.05)',
                      padding: '0.15rem 0.45rem',
                      borderRadius: 4,
                      fontSize: '0.8rem',
                      color: 'var(--accent-gold)',
                      fontWeight: 600,
                    }}
                  >
                    {wallet.balanceXlm !== null ? `${wallet.balanceXlm} XLM` : '...'}
                  </span>
                  <ChevronDown size={14} color="var(--text-muted)" />
                </div>

                {showDropdown && (
                  <div
                    style={{
                      position: 'absolute',
                      right: 0,
                      top: '110%',
                      width: 230,
                      background: '#0f172a',
                      border: '1px solid var(--border-card)',
                      borderRadius: 'var(--radius-sm)',
                      boxShadow: 'var(--shadow-card)',
                      padding: '0.5rem',
                      zIndex: 200,
                    }}
                  >
                    <div style={{ padding: '0.5rem', borderBottom: '1px solid var(--border-subtle)', marginBottom: '0.25rem' }}>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Wallet Type</div>
                      <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                        {wallet.walletType === 'FREIGHTER' ? 'Freighter Extension' : 'Testnet Account'}
                      </div>
                    </div>
                    <button
                      onClick={async () => {
                        await refreshBalance();
                        setShowDropdown(false);
                      }}
                      style={{
                        width: '100%',
                        padding: '0.5rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        fontSize: '0.85rem',
                        color: 'var(--text-secondary)',
                      }}
                    >
                      <RefreshCw size={14} /> Refresh Balance
                    </button>
                    <button
                      onClick={() => {
                        disconnect();
                        setShowDropdown(false);
                      }}
                      style={{
                        width: '100%',
                        padding: '0.5rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        fontSize: '0.85rem',
                        color: 'var(--accent-rose)',
                      }}
                    >
                      <LogOut size={14} /> Disconnect
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={() => setIsWalletModalOpen(true)}
                className="btn-primary"
                style={{ fontSize: '0.875rem' }}
                disabled={isLoading}
              >
                <Wallet size={16} /> Connect Testnet Wallet
              </button>
            )}
          </div>
        </div>
      </header>

      <WalletModal isOpen={isWalletModalOpen} onClose={() => setIsWalletModalOpen(false)} />
    </>
  );
};
