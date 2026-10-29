import React, { useState, useEffect } from 'react';
import { apiService } from '../services/apiService.ts';
import {
  X,
  PieChart,
  Briefcase,
  TrendingUp,
  DollarSign,
  Building,
  ExternalLink,
  ShieldCheck,
  RefreshCw
} from 'lucide-react';
import { getStellarExpertUrl } from '../utils/stellarExpert.ts';

interface StakeholderPortfolioModalProps {
  isOpen: boolean;
  onClose: () => void;
  walletAddress?: string;
}

export const StakeholderPortfolioModal: React.FC<StakeholderPortfolioModalProps> = ({
  isOpen,
  onClose,
  walletAddress = 'GBTY42VFL7XJ6Q7L35R62L4J7J5J67U4F26C6DVEOD6DGEGZ6E6DDEE5ABCD',
}) => {
  const [portfolio, setPortfolio] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  const fetchPortfolio = async () => {
    setIsLoading(true);
    try {
      const res = await apiService.getStakeholderPortfolio(walletAddress);
      if (res && res.data) {
        setPortfolio(res.data);
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchPortfolio();
    }
  }, [isOpen, walletAddress]);

  if (!isOpen) return null;

  const holdings = portfolio?.holdings || [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-3xl bg-stellar-card border border-stellar-border/80 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-stellar-border/60 bg-stellar-card-subtle/50">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-purple-500/10 border border-purple-500/20 rounded-xl text-purple-400">
              <PieChart className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                Stakeholder Portfolio & Equity Ledger
              </h2>
              <p className="text-xs text-stellar-muted flex items-center gap-1.5 mt-0.5 font-mono">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                {walletAddress.substring(0, 10)}...{walletAddress.slice(-6)}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={fetchPortfolio}
              disabled={isLoading}
              className="p-2 text-stellar-muted hover:text-white rounded-lg hover:bg-stellar-card-subtle transition-colors disabled:opacity-50"
              title="Refresh Portfolio"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={onClose}
              className="p-2 text-stellar-muted hover:text-white rounded-lg hover:bg-stellar-card-subtle transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Top KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-stellar-card-subtle/60 border border-stellar-border/60 rounded-xl">
              <div className="flex items-center gap-2 text-xs text-stellar-muted font-medium uppercase tracking-wider mb-1">
                <DollarSign className="w-4 h-4 text-emerald-400" />
                Total Equity Value
              </div>
              <div className="text-2xl font-bold text-white tracking-tight font-mono">
                ${(portfolio?.total_portfolio_equity_value_usdc || 0).toLocaleString()}
                <span className="text-xs text-stellar-muted ml-1 font-sans">USDC</span>
              </div>
            </div>

            <div className="p-4 bg-stellar-card-subtle/60 border border-stellar-border/60 rounded-xl">
              <div className="flex items-center gap-2 text-xs text-stellar-muted font-medium uppercase tracking-wider mb-1">
                <TrendingUp className="w-4 h-4 text-blue-400" />
                Lifetime Payouts
              </div>
              <div className="text-2xl font-bold text-emerald-400 tracking-tight font-mono">
                ${(portfolio?.total_lifetime_payouts_usdc || 0).toLocaleString()}
                <span className="text-xs text-stellar-muted ml-1 font-sans">USDC</span>
              </div>
            </div>

            <div className="p-4 bg-stellar-card-subtle/60 border border-stellar-border/60 rounded-xl">
              <div className="flex items-center gap-2 text-xs text-stellar-muted font-medium uppercase tracking-wider mb-1">
                <Building className="w-4 h-4 text-purple-400" />
                Properties Invested
              </div>
              <div className="text-2xl font-bold text-white tracking-tight font-mono">
                {portfolio?.total_properties_invested || 0}
                <span className="text-xs text-stellar-muted ml-1 font-sans">Assets</span>
              </div>
            </div>
          </div>

          {/* Holdings List */}
          <div>
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-3 flex items-center gap-2">
              <Briefcase className="w-4 h-4 text-stellar-primary" />
              Real Estate Asset Holdings
            </h3>

            {holdings.length === 0 ? (
              <div className="text-center py-8 text-stellar-muted text-sm bg-stellar-card-subtle/30 rounded-xl border border-stellar-border/40">
                No active property allocations recorded for this wallet address.
              </div>
            ) : (
              <div className="space-y-3">
                {holdings.map((h: any, idx: number) => (
                  <div
                    key={idx}
                    className="p-4 bg-stellar-card-subtle/80 border border-stellar-border/80 rounded-xl hover:border-stellar-primary/50 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4"
                  >
                    <div className="flex items-start gap-3">
                      <img
                        src={h.property_image}
                        alt={h.property_name}
                        className="w-14 h-14 rounded-lg object-cover border border-stellar-border/60 shrink-0"
                      />
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-semibold text-white text-base">{h.property_name}</h4>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">
                            {h.property_type}
                          </span>
                        </div>
                        <div className="text-xs text-stellar-muted flex items-center gap-3 mt-1">
                          <span className="bg-purple-500/10 text-purple-400 px-2 py-0.5 rounded border border-purple-500/20 font-medium">
                            Role: {h.role}
                          </span>
                          <span>Allocation: <strong className="text-white">{h.share_percentage}%</strong> ({h.share_basis_points} bps)</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-6 border-t md:border-t-0 pt-3 md:pt-0 border-stellar-border/40 justify-between md:justify-end">
                      <div className="text-right">
                        <div className="text-xs text-stellar-muted">Equity Value</div>
                        <div className="text-base font-bold text-white font-mono">
                          ${h.equity_value_usdc.toLocaleString()}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-xs text-stellar-muted">Lifetime Payouts</div>
                        <div className="text-base font-bold text-emerald-400 font-mono">
                          ${h.total_lifetime_payouts_usdc.toLocaleString()}
                        </div>
                      </div>
                      <a
                        href={getStellarExpertUrl('account', walletAddress)}
                        target="_blank"
                        rel="noreferrer"
                        className="p-2 text-stellar-muted hover:text-white rounded-lg hover:bg-stellar-card transition-colors shrink-0"
                        title="View on Stellar.expert"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-stellar-border/60 bg-stellar-card-subtle/50 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-stellar-card border border-stellar-border text-white text-sm font-medium hover:bg-stellar-card-subtle transition-colors"
          >
            Close Portfolio
          </button>
        </div>
      </div>
    </div>
  );
};
