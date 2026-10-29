import React from 'react';
import { Activity, ShieldCheck, Server, Cpu, ExternalLink } from 'lucide-react';

export interface ProtocolUptimeCardProps {
  network?: string;
  protocolVersion?: number;
  latestLedger?: number;
  baseFeeStroops?: number;
  className?: string;
}

export const ProtocolUptimeCard: React.FC<ProtocolUptimeCardProps> = ({
  network = 'TESTNET',
  protocolVersion = 22,
  latestLedger = 1092831,
  baseFeeStroops = 100,
  className = '',
}) => {
  return (
    <div
      className={`bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl backdrop-blur-md ${className}`}
      data-testid="protocol-uptime-card"
    >
      <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-sky-500/10 text-sky-400 rounded-xl border border-sky-500/20">
            <Activity className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <span>Stellar Protocol Telemetry</span>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                Live Consensus
              </span>
            </h3>
            <p className="text-xs text-slate-400 font-mono mt-0.5">
              Protocol {protocolVersion} — {network}
            </p>
          </div>
        </div>

        <a
          href="https://stellar.expert/explorer/testnet"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-xs text-sky-400 hover:text-sky-300 font-medium transition-colors"
        >
          <span>StellarExpert</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </a>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
        <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800/80">
          <div className="flex items-center gap-1.5 text-slate-400 mb-1">
            <Server className="w-3.5 h-3.5 text-sky-400" />
            <span>Latest Ledger</span>
          </div>
          <div className="text-base font-bold text-white font-mono">
            #{latestLedger.toLocaleString()}
          </div>
        </div>

        <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800/80">
          <div className="flex items-center gap-1.5 text-slate-400 mb-1">
            <Cpu className="w-3.5 h-3.5 text-emerald-400" />
            <span>Base Gas Fee</span>
          </div>
          <div className="text-base font-bold text-emerald-400 font-mono">
            {baseFeeStroops} stroops
          </div>
        </div>

        <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800/80">
          <div className="flex items-center gap-1.5 text-slate-400 mb-1">
            <ShieldCheck className="w-3.5 h-3.5 text-purple-400" />
            <span>Smart Contracts</span>
          </div>
          <div className="text-base font-bold text-purple-300 font-mono">
            3 Active
          </div>
        </div>

        <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800/80">
          <div className="flex items-center gap-1.5 text-slate-400 mb-1">
            <Activity className="w-3.5 h-3.5 text-amber-400" />
            <span>Horizon Status</span>
          </div>
          <div className="text-base font-bold text-amber-400 font-mono">
            Optimal (100%)
          </div>
        </div>
      </div>
    </div>
  );
};
