import React, { useState } from 'react';
import { useWallet } from '../context/WalletContext.tsx';
import { useCurrency } from '../context/CurrencyContext.tsx';
import { WalletModal } from './WalletModal.tsx';
import { Building2, Wallet, LogOut, RefreshCw, ChevronDown, CheckCircle2, ExternalLink, AlertTriangle, Coins } from 'lucide-react';
import { getStellarExpertUrl } from '../utils/stellarExpert.ts';

interface NavbarProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentTab, setCurrentTab }) => {
  const { wallet, disconnect, refreshBalance, fundCurrentAccountWithFriendbot, isLoading } = useWallet();
  const { currency, setCurrency } = useCurrency();
  const [isWalletModalOpen, setIsWalletModalOpen] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [isFunding, setIsFunding] = useState(false);

  const isWrongNetwork = wallet.isConnected && (!wallet.isTestnet || (wallet.network && !wallet.network.toUpperCase().includes('TESTNET')));

  const truncateAddress = (addr: string) => {
    return `${addr.substring(0, 4)}...${addr.substring(addr.length - 4)}`;
  };

  const formattedBalance = wallet.balanceXlm !== null
    ? `${Number(wallet.balanceXlm).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} XLM`
    : '...';

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
        {isWrongNetwork && (
          <div
            style={{
              background: 'rgba(239, 68, 68, 0.15)',
              borderBottom: '1px solid rgba(239, 68, 68, 0.3)',
              color: '#f87171',
              padding: '0.6rem 1.5rem',
              fontSize: '0.85rem',
              fontWeight: 500,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
            }}
          >
            <AlertTriangle size={16} />
            <span>
              <strong>Wrong Stellar Network:</strong> Connected to {wallet.network}. Stellar Estate contracts operate on Stellar Testnet. Please switch your Freighter wallet to Testnet.
            </span>
          </div>
        )}
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

          {/* Currency Toggle */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              background: 'rgba(255, 255, 255, 0.05)',
              borderRadius: 'var(--radius-sm)',
              padding: '2px',
              border: '1px solid var(--border-subtle)',
            }}
            title="Switch display currency"
          >
            {(['USDC', 'XLM', 'USD'] as const).map((curr) => (
              <button
                key={curr}
                type="button"
                onClick={() => setCurrency(curr)}
                style={{
                  padding: '0.25rem 0.5rem',
                  fontSize: '0.72rem',
                  fontWeight: 700,
                  borderRadius: 'calc(var(--radius-sm) - 2px)',
                  border: 'none',
                  cursor: 'pointer',
                  background: currency === curr ? 'var(--accent-gold)' : 'transparent',
                  color: currency === curr ? '#000' : 'var(--text-secondary)',
                  transition: 'all 0.15s ease',
                }}
              >
                {curr}
              </button>
            ))}
          </div>

          {/* Wallet Action */}
          <div style={{ position: 'relative' }}>
            {wallet.isConnected && wallet.address ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                {/* Network & Wallet Type Badges */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.35rem',
                    background: isWrongNetwork ? 'rgba(239, 68, 68, 0.15)' : 'rgba(56, 189, 248, 0.1)',
                    border: `1px solid ${isWrongNetwork ? 'rgba(239, 68, 68, 0.3)' : 'rgba(56, 189, 248, 0.25)'}`,
                    padding: '0.25rem 0.55rem',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: '0.72rem',
                    color: isWrongNetwork ? 'var(--accent-rose)' : '#38bdf8',
                    fontWeight: 600,
                    letterSpacing: '0.04em',
                  }}
                  title={`Connected to Stellar ${wallet.network || 'TESTNET'}`}
                >
                  <span
                    style={{
                      width: 6,
                      height: 6,
                      borderRadius: '50%',
                      background: isWrongNetwork ? 'var(--accent-rose)' : 'var(--accent-emerald)',
                      display: 'inline-block',
                      boxShadow: isWrongNetwork
                        ? '0 0 6px var(--accent-rose)'
                        : '0 0 6px var(--accent-emerald)',
                    }}
                  />
                  {wallet.network || 'TESTNET'}
                </div>

                <div
                  style={{
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid var(--border-subtle)',
                    padding: '0.25rem 0.55rem',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: '0.72rem',
                    color: 'var(--text-secondary)',
                    fontWeight: 500,
                  }}
                  title={`Wallet Client: ${wallet.walletType === 'FREIGHTER' ? 'Freighter Extension' : 'Testnet Keypair'}`}
                >
                  {wallet.walletType === 'FREIGHTER' ? 'Freighter' : 'Keypair'}
                </div>

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
                    {formattedBalance}
                  </span>
                  <ChevronDown size={14} color="var(--text-muted)" />
                </div>

                {showDropdown && (
                  <div
                    style={{
                      position: 'absolute',
                      right: 0,
                      top: '110%',
                      width: 250,
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
                    <div style={{ padding: '0.5rem', borderBottom: '1px solid var(--border-subtle)', marginBottom: '0.25rem' }}>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Available Balance</div>
                      <div style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--accent-gold)' }}>
                        {formattedBalance}
                      </div>
                    </div>
                    <button
                      disabled={isFunding}
                      onClick={async () => {
                        setIsFunding(true);
                        try {
                          await fundCurrentAccountWithFriendbot();
                        } catch {}
                        setIsFunding(false);
                        setShowDropdown(false);
                      }}
                      style={{
                        width: '100%',
                        padding: '0.5rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        fontSize: '0.85rem',
                        color: 'var(--accent-emerald)',
                        cursor: isFunding ? 'wait' : 'pointer',
                        opacity: isFunding ? 0.7 : 1,
                      }}
                    >
                      <Coins size={14} /> {isFunding ? 'Requesting Testnet XLM...' : 'Request Testnet XLM (Faucet)'}
                    </button>
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
                    {wallet.address && (
                      <a
                        href={getStellarExpertUrl('account', wallet.address)}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={() => setShowDropdown(false)}
                        style={{
                          width: '100%',
                          padding: '0.5rem',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.5rem',
                          fontSize: '0.85rem',
                          color: 'var(--accent-cyan)',
                          textDecoration: 'none',
                        }}
                      >
                        <ExternalLink size={14} /> View on StellarExpert
                      </a>
                    )}
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
