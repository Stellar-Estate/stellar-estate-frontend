import React, { useState, useEffect } from 'react';
import { apiService } from '../services/apiService.ts';
import { Activity, ShieldCheck, Zap, Radio, CheckCircle, ExternalLink, X } from 'lucide-react';

export const NetworkMetricsBanner: React.FC = () => {
  const [metrics, setMetrics] = useState<any>(null);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    apiService.getStellarMetrics().then((res) => {
      if (res && res.data) {
        setMetrics(res.data);
      }
    });
  }, []);

  if (!visible) return null;

  const data = metrics || {
    network: 'TESTNET',
    protocol_version: 22,
    base_fee_stroops: 100,
    latest_ledger: 1092831,
    horizon_url: 'https://horizon-testnet.stellar.org',
    rpc_url: 'https://soroban-testnet.stellar.org',
  };

  return (
    <div className="w-full bg-gradient-to-r from-blue-950/80 via-slate-900/90 to-purple-950/80 border-b border-stellar-border/60 px-4 py-2 text-xs backdrop-blur-md">
      <div className="max-w-7xl mx-auto flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center space-x-4 flex-wrap gap-y-1">
          {/* Status Badge */}
          <div className="flex items-center space-x-1.5">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="font-bold text-white tracking-wide">
              Stellar {data.network}
            </span>
            <span className="px-1.5 py-0.2 rounded bg-purple-500/20 text-purple-300 font-mono text-[10px]">
              Protocol {data.protocol_version}
            </span>
          </div>

          {/* Ledger Sequence */}
          <div className="flex items-center space-x-1 text-stellar-muted">
            <Activity className="w-3.5 h-3.5 text-blue-400" />
            <span>Ledger:</span>
            <span className="font-mono text-white font-semibold">
              #{data.latest_ledger.toLocaleString()}
            </span>
          </div>

          {/* Base Fee */}
          <div className="flex items-center space-x-1 text-stellar-muted">
            <Zap className="w-3.5 h-3.5 text-amber-400" />
            <span>Fee:</span>
            <span className="font-mono text-white font-semibold">
              {data.base_fee_stroops} stroops
            </span>
          </div>

          {/* Gateway Status */}
          <div className="flex items-center space-x-1 text-stellar-muted hidden sm:flex">
            <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
            <span>Soroban RPC Connected</span>
          </div>
        </div>

        {/* Action Link & Dismiss */}
        <div className="flex items-center space-x-3">
          <a
            href="https://stellar.expert/explorer/testnet"
            target="_blank"
            rel="noreferrer"
            className="flex items-center space-x-1 text-stellar-accent hover:text-white transition-colors text-[11px]"
          >
            <span>StellarExpert</span>
            <ExternalLink className="w-3 h-3" />
          </a>
          <button
            onClick={() => setVisible(false)}
            className="text-stellar-muted hover:text-white transition-colors"
            title="Dismiss Network Banner"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
