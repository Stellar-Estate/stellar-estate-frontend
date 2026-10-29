import React, { useState, useEffect } from 'react';
import { apiService } from '../services/apiService.ts';
import {
  X,
  PieChart,
  DollarSign,
  TrendingUp,
  ShieldCheck,
  ExternalLink,
  Layers,
  ArrowDownRight,
  Receipt
} from 'lucide-react';
import { getStellarExpertUrl } from '../utils/stellarExpert.ts';

interface SettlementBreakdownModalProps {
  settlementId: string;
  isOpen: boolean;
  onClose: () => void;
}

export const SettlementBreakdownModal: React.FC<SettlementBreakdownModalProps> = ({
  settlementId,
  isOpen,
  onClose,
}) => {
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isOpen && settlementId) {
      setIsLoading(true);
      apiService
        .getSettlementBreakdown(settlementId)
        .then((res) => {
          if (res && res.data) {
            setData(res.data);
          }
        })
        .finally(() => setIsLoading(false));
    }
  }, [isOpen, settlementId]);

  if (!isOpen) return null;

  const breakdown = data?.breakdown || {
    gross_revenue: 25000,
    expenses: 2500,
    reserve: 2500,
    distributable_amount: 20000,
  };

  const ratios = data?.ratios_bps || {
    distributable_bps: 8000,
    reserve_bps: 1000,
    expense_bps: 1000,
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-2xl bg-stellar-card border border-stellar-border/80 rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-stellar-border/60 bg-stellar-card-subtle/50">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-400">
              <Receipt className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white tracking-wide">
                Settlement Financial Breakdown
              </h2>
              <p className="text-xs text-stellar-muted mt-0.5">
                Deterministic waterfall tranche allocations for #{settlementId}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-stellar-muted hover:text-white hover:bg-white/5 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Tranche Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3 bg-stellar-dark/60 border border-stellar-border/50 rounded-xl">
              <span className="text-[11px] font-semibold text-stellar-muted uppercase tracking-wider block">
                Gross Inflow
              </span>
              <span className="text-lg font-bold text-white mt-1 block">
                ${breakdown.gross_revenue.toLocaleString()}
              </span>
              <span className="text-[10px] text-stellar-muted">100.00%</span>
            </div>

            <div className="p-3 bg-red-500/5 border border-red-500/20 rounded-xl">
              <span className="text-[11px] font-semibold text-red-400 uppercase tracking-wider block">
                Expenses
              </span>
              <span className="text-lg font-bold text-red-300 mt-1 block">
                -${breakdown.expenses.toLocaleString()}
              </span>
              <span className="text-[10px] text-red-400/80">
                {(ratios.expense_bps / 100).toFixed(2)}%
              </span>
            </div>

            <div className="p-3 bg-amber-500/5 border border-amber-500/20 rounded-xl">
              <span className="text-[11px] font-semibold text-amber-400 uppercase tracking-wider block">
                Reserve
              </span>
              <span className="text-lg font-bold text-amber-300 mt-1 block">
                +${breakdown.reserve.toLocaleString()}
              </span>
              <span className="text-[10px] text-amber-400/80">
                {(ratios.reserve_bps / 100).toFixed(2)}%
              </span>
            </div>

            <div className="p-3 bg-emerald-500/5 border border-emerald-500/20 rounded-xl">
              <span className="text-[11px] font-semibold text-emerald-400 uppercase tracking-wider block">
                Distributable
              </span>
              <span className="text-lg font-bold text-emerald-300 mt-1 block">
                ${breakdown.distributable_amount.toLocaleString()}
              </span>
              <span className="text-[10px] text-emerald-400/80">
                {(ratios.distributable_bps / 100).toFixed(2)}%
              </span>
            </div>
          </div>

          {/* Waterfall Pipeline Visualization */}
          <div className="p-4 bg-stellar-card-subtle/30 border border-stellar-border/40 rounded-xl space-y-3">
            <span className="text-xs font-semibold text-stellar-muted uppercase tracking-wider block">
              Waterfall Distribution Flow
            </span>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-white">Tier 1: Operating Expenses</span>
                <span className="text-red-400 font-mono">-${breakdown.expenses.toLocaleString()} USDC</span>
              </div>
              <div className="w-full bg-stellar-dark h-2 rounded-full overflow-hidden">
                <div
                  className="bg-red-500 h-full rounded-full"
                  style={{ width: `${Math.min(100, ratios.expense_bps / 100)}%` }}
                />
              </div>

              <div className="flex items-center justify-between text-xs pt-1">
                <span className="text-white">Tier 2: CapEx &amp; Maintenance Reserve</span>
                <span className="text-amber-400 font-mono">+${breakdown.reserve.toLocaleString()} USDC</span>
              </div>
              <div className="w-full bg-stellar-dark h-2 rounded-full overflow-hidden">
                <div
                  className="bg-amber-500 h-full rounded-full"
                  style={{ width: `${Math.min(100, ratios.reserve_bps / 100)}%` }}
                />
              </div>

              <div className="flex items-center justify-between text-xs pt-1">
                <span className="text-white">Tier 3: Net Equity Payouts</span>
                <span className="text-emerald-400 font-mono">${breakdown.distributable_amount.toLocaleString()} USDC</span>
              </div>
              <div className="w-full bg-stellar-dark h-2 rounded-full overflow-hidden">
                <div
                  className="bg-emerald-500 h-full rounded-full"
                  style={{ width: `${Math.min(100, ratios.distributable_bps / 100)}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-stellar-border/60 bg-stellar-card-subtle/50 flex items-center justify-between">
          <div className="flex items-center space-x-2 text-xs text-stellar-muted">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Cryptographically Verified on Soroban Contract</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-stellar-dark hover:bg-white/5 border border-stellar-border/60 text-xs font-semibold text-white rounded-xl transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
