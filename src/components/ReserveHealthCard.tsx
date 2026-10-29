import React, { useState, useEffect } from 'react';
import { apiService } from '../services/apiService.ts';
import { ShieldAlert, ShieldCheck, TrendingUp, DollarSign, RefreshCw, Sliders } from 'lucide-react';

interface ReserveHealthCardProps {
  propertyId: string;
  initialReserve?: number;
}

export const ReserveHealthCard: React.FC<ReserveHealthCardProps> = ({
  propertyId,
  initialReserve = 25000,
}) => {
  const [targetBps, setTargetBps] = useState<number>(1000); // 10%
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const calculateHealth = async (bps: number) => {
    setLoading(true);
    try {
      const res = await apiService.calculateReserveReplenishment(propertyId, bps);
      if (res && res.data) {
        setData(res.data);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    calculateHealth(targetBps);
  }, [propertyId, targetBps]);

  const currentReserve = data?.current_reserve ?? initialReserve;
  const targetReserve = data?.target_reserve ?? 25000;
  const replenishmentNeeded = data?.replenishment_needed ?? 0;
  const isHealthy = data?.is_reserve_healthy ?? true;
  const healthPercentage = targetReserve > 0 ? Math.min(100, Math.round((currentReserve / targetReserve) * 100)) : 100;

  return (
    <div className="p-5 bg-stellar-card border border-stellar-border/70 rounded-2xl shadow-lg space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2.5">
          <div className={`p-2 rounded-xl ${isHealthy ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'}`}>
            {isHealthy ? <ShieldCheck className="w-4 h-4" /> : <ShieldAlert className="w-4 h-4" />}
          </div>
          <div>
            <h3 className="text-sm font-bold text-white tracking-wide">
              Vault Reserve Buffer &amp; Health
            </h3>
            <p className="text-[11px] text-stellar-muted">
              CapEx &amp; operational safety ratio for property stability
            </p>
          </div>
        </div>
        <span
          className={`px-2.5 py-1 rounded-full text-[11px] font-bold border ${
            isHealthy
              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
              : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
          }`}
        >
          {isHealthy ? 'OPTIMAL BUFFER' : 'REPLENISHMENT RECOMMENDED'}
        </span>
      </div>

      {/* Numerical Stats */}
      <div className="grid grid-cols-3 gap-3">
        <div className="p-3 bg-stellar-dark/50 border border-stellar-border/40 rounded-xl">
          <span className="text-[10px] text-stellar-muted uppercase font-semibold block">
            Current Reserve
          </span>
          <span className="text-base font-bold text-white mt-0.5 block font-mono">
            ${currentReserve.toLocaleString()}
          </span>
        </div>

        <div className="p-3 bg-stellar-dark/50 border border-stellar-border/40 rounded-xl">
          <span className="text-[10px] text-stellar-muted uppercase font-semibold block">
            Target Reserve ({(targetBps / 100).toFixed(1)}%)
          </span>
          <span className="text-base font-bold text-amber-300 mt-0.5 block font-mono">
            ${targetReserve.toLocaleString()}
          </span>
        </div>

        <div className="p-3 bg-stellar-dark/50 border border-stellar-border/40 rounded-xl">
          <span className="text-[10px] text-stellar-muted uppercase font-semibold block">
            Replenishment Gap
          </span>
          <span className={`text-base font-bold mt-0.5 block font-mono ${replenishmentNeeded > 0 ? 'text-amber-400' : 'text-emerald-400'}`}>
            ${replenishmentNeeded.toLocaleString()}
          </span>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="space-y-1.5">
        <div className="flex justify-between text-[11px]">
          <span className="text-stellar-muted">Buffer Funded Ratio</span>
          <span className="text-white font-semibold font-mono">{healthPercentage}%</span>
        </div>
        <div className="w-full bg-stellar-dark h-2 rounded-full overflow-hidden border border-stellar-border/40">
          <div
            className={`h-full transition-all duration-500 rounded-full ${
              isHealthy ? 'bg-gradient-to-r from-emerald-500 to-teal-400' : 'bg-gradient-to-r from-amber-500 to-orange-400'
            }`}
            style={{ width: `${healthPercentage}%` }}
          />
        </div>
      </div>

      {/* Ratio Selector Buttons */}
      <div className="flex items-center justify-between pt-1">
        <div className="flex items-center space-x-1.5">
          <Sliders className="w-3.5 h-3.5 text-stellar-muted" />
          <span className="text-[11px] text-stellar-muted font-medium">Policy Target:</span>
        </div>
        <div className="flex items-center space-x-1">
          {[500, 1000, 1500, 2000].map((bps) => (
            <button
              key={bps}
              onClick={() => setTargetBps(bps)}
              className={`px-2 py-1 rounded text-[10px] font-semibold transition-colors ${
                targetBps === bps
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                  : 'bg-stellar-dark/60 text-stellar-muted hover:text-white border border-stellar-border/40'
              }`}
            >
              {(bps / 100).toFixed(0)}%
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
