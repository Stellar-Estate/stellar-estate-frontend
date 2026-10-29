import React from 'react';
import { Users, CheckCircle2, Clock, ShieldCheck, Lock } from 'lucide-react';
import { AgreementStakeholder } from '../types/index.ts';

export interface StakeholderConsensusCardProps {
  stakeholders: AgreementStakeholder[];
  versionNumber: number;
  status: string;
  className?: string;
}

export const StakeholderConsensusCard: React.FC<StakeholderConsensusCardProps> = ({
  stakeholders = [],
  versionNumber,
  status,
  className = '',
}) => {
  const approvedCount = stakeholders.filter((s) => s.has_approved).length;
  const totalCount = stakeholders.length;
  const percentage = totalCount > 0 ? Math.round((approvedCount / totalCount) * 100) : 0;
  const isLocked = status === 'LOCKED';
  const isReady = totalCount > 0 && approvedCount >= totalCount;

  return (
    <div
      className={`bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl backdrop-blur-md ${className}`}
      data-testid="stakeholder-consensus-card"
    >
      <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-indigo-500/10 text-indigo-400 rounded-xl border border-indigo-500/20">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-white flex items-center gap-2">
              <span>Stakeholder Consensus Quorum (v{versionNumber})</span>
              {isLocked ? (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  <Lock className="w-3 h-3" /> Fully Enforced
                </span>
              ) : isReady ? (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  <ShieldCheck className="w-3 h-3" /> Ready to Lock
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-amber-500/20 text-amber-400 border border-amber-500/30">
                  <Clock className="w-3 h-3" /> Awaiting Signatures
                </span>
              )}
            </h4>
            <p className="text-xs text-slate-400 mt-0.5">
              {approvedCount} of {totalCount} Stakeholders Approved ({percentage}%)
            </p>
          </div>
        </div>

        <span className="font-mono text-sm font-bold text-slate-200">
          {percentage}%
        </span>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-slate-950 rounded-full h-2.5 mb-4 overflow-hidden border border-slate-800">
        <div
          className={`h-2.5 rounded-full transition-all duration-500 ${
            isReady || isLocked ? 'bg-gradient-to-r from-emerald-500 to-teal-400' : 'bg-gradient-to-r from-amber-500 to-yellow-400'
          }`}
          style={{ width: `${percentage}%` }}
        />
      </div>

      {/* Stakeholder List */}
      <div className="space-y-2">
        {stakeholders.map((s, idx) => (
          <div
            key={s.id || idx}
            className="flex items-center justify-between p-2.5 bg-slate-950/60 rounded-xl border border-slate-800/80 text-xs"
          >
            <div className="flex items-center gap-2">
              {s.has_approved ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
              ) : (
                <Clock className="w-4 h-4 text-amber-400/80 flex-shrink-0 animate-pulse" />
              )}
              <div>
                <div className="font-semibold text-slate-200 flex items-center gap-1.5">
                  <span>{s.name}</span>
                  <span className="text-[10px] text-slate-400 font-normal">({s.role})</span>
                </div>
                <div className="font-mono text-[11px] text-slate-500">
                  {s.wallet_address ? `${s.wallet_address.slice(0, 6)}...${s.wallet_address.slice(-6)}` : 'G...'}
                </div>
              </div>
            </div>

            <div className="text-right">
              <span className="font-mono font-semibold text-slate-300">
                {(s.basis_points / 100).toFixed(2)}%
              </span>
              <div className="text-[10px]">
                {s.has_approved ? (
                  <span className="text-emerald-400">Signed</span>
                ) : (
                  <span className="text-amber-400/80">Pending</span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
