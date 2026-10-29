import React from 'react';
import { ShieldCheck, Activity, Coins, Database, Layers } from 'lucide-react';
import { VaultAssetBadge } from './VaultAssetBadge.tsx';

export interface VaultSummaryCardProps {
  propertyId: string;
  propertyName?: string;
  contractId?: string;
  totalRevenue?: number;
  distributableBalance?: number;
  reserveBalance?: number;
  settlementCount?: number;
  className?: string;
}

export const VaultSummaryCard: React.FC<VaultSummaryCardProps> = ({
  propertyId,
  propertyName = 'Property Vault',
  contractId = 'CAQCFV2AUUXA2RFYGI4HD4KSGYYEB5Q5OC54ZAWU4HBPWZ7AL64KLCPH',
  totalRevenue = 250000,
  distributableBalance = 175000,
  reserveBalance = 25000,
  settlementCount = 3,
  className = '',
}) => {
  return (
    <div
      className={`bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl backdrop-blur-md ${className}`}
      data-testid="vault-summary-card"
    >
      <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-emerald-500/10 text-emerald-400 rounded-xl border border-emerald-500/20">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <span>Soroban Treasury Vault</span>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Active v1.0.0
              </span>
            </h3>
            <p className="text-xs text-slate-400 font-mono mt-0.5">{propertyId}</p>
          </div>
        </div>

        <VaultAssetBadge assetCode="USDC" contractId={contractId} />
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800/80">
          <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-1">
            <Coins className="w-3.5 h-3.5 text-emerald-400" />
            <span>Total Inflow</span>
          </div>
          <div className="text-lg font-bold text-white font-mono">
            ${totalRevenue.toLocaleString()}
          </div>
        </div>

        <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800/80">
          <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-1">
            <Activity className="w-3.5 h-3.5 text-sky-400" />
            <span>Distributable</span>
          </div>
          <div className="text-lg font-bold text-sky-400 font-mono">
            ${distributableBalance.toLocaleString()}
          </div>
        </div>

        <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800/80">
          <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-1">
            <Database className="w-3.5 h-3.5 text-amber-400" />
            <span>Reserve Buffer</span>
          </div>
          <div className="text-lg font-bold text-amber-400 font-mono">
            ${reserveBalance.toLocaleString()}
          </div>
        </div>

        <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800/80">
          <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-1">
            <Layers className="w-3.5 h-3.5 text-purple-400" />
            <span>Settlements</span>
          </div>
          <div className="text-lg font-bold text-purple-300 font-mono">
            {settlementCount} Finalized
          </div>
        </div>
      </div>
    </div>
  );
};
