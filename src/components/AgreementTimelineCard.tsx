import React from 'react';
import { CheckCircle2, Clock, Lock, FileCode, ShieldCheck } from 'lucide-react';

export interface AgreementTimelineCardProps {
  agreementId: string;
  versionNumber: number;
  status: string;
  createdAt?: string;
  lockedAt?: string;
  approvalCount?: number;
  totalStakeholders?: number;
  className?: string;
}

export const AgreementTimelineCard: React.FC<AgreementTimelineCardProps> = ({
  agreementId,
  versionNumber,
  status,
  createdAt,
  lockedAt,
  approvalCount = 2,
  totalStakeholders = 3,
  className = '',
}) => {
  const isLocked = status === 'LOCKED';
  const isPending = status === 'PENDING_APPROVALS' || status === 'PARTIALLY_APPROVED';

  const stages = [
    {
      id: 1,
      title: 'Canonical Inception',
      description: 'Deterministic JSON representation compiled with SHA-256 agreement hash.',
      timestamp: createdAt ? new Date(createdAt).toLocaleDateString() : 'Recorded',
      status: 'COMPLETED',
      icon: <FileCode className="w-4 h-4 text-emerald-400" />,
    },
    {
      id: 2,
      title: 'Multi-Sig Consensus',
      description: `Stakeholder ED25519 signatures gathered (${approvalCount}/${totalStakeholders} verified).`,
      timestamp: isLocked ? 'Consensus Reached' : `${approvalCount}/${totalStakeholders} Approved`,
      status: isLocked ? 'COMPLETED' : 'IN_PROGRESS',
      icon: isLocked ? (
        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
      ) : (
        <Clock className="w-4 h-4 text-amber-400 animate-pulse" />
      ),
    },
    {
      id: 3,
      title: 'Soroban Vault Locking',
      description: 'Permanent activation on Soroban smart contract. Nonces locked.',
      timestamp: lockedAt ? new Date(lockedAt).toLocaleDateString() : (isLocked ? 'Active on Testnet' : 'Awaiting Final Signatures'),
      status: isLocked ? 'COMPLETED' : 'PENDING',
      icon: isLocked ? (
        <Lock className="w-4 h-4 text-emerald-400" />
      ) : (
        <ShieldCheck className="w-4 h-4 text-slate-500" />
      ),
    },
  ];

  return (
    <div
      className={`bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl backdrop-blur-md ${className}`}
      data-testid="agreement-timeline-card"
    >
      <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-800/80">
        <div>
          <h4 className="text-sm font-bold text-white flex items-center gap-2">
            <span>Lifecycle Stages — Agreement v{versionNumber}</span>
            {isLocked ? (
              <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                Active & Enforced
              </span>
            ) : (
              <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-amber-500/20 text-amber-400 border border-amber-500/30">
                Pending Governance
              </span>
            )}
          </h4>
          <p className="text-xs text-slate-400 font-mono mt-0.5">{agreementId}</p>
        </div>
      </div>

      <div className="space-y-4">
        {stages.map((stage, idx) => (
          <div key={stage.id} className="relative flex items-start gap-3">
            {idx < stages.length - 1 && (
              <div
                className={`absolute left-3.5 top-8 bottom-0 w-0.5 ${
                  stage.status === 'COMPLETED' ? 'bg-emerald-500/40' : 'bg-slate-800'
                }`}
                style={{ height: 'calc(100% - 8px)' }}
              />
            )}
            <div
              className={`flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center border z-10 ${
                stage.status === 'COMPLETED'
                  ? 'bg-emerald-950/70 border-emerald-500/50'
                  : stage.status === 'IN_PROGRESS'
                  ? 'bg-amber-950/70 border-amber-500/50'
                  : 'bg-slate-800/80 border-slate-700'
              }`}
            >
              {stage.icon}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-semibold text-slate-200">{stage.title}</span>
                <span className="text-[11px] text-slate-400 font-mono">{stage.timestamp}</span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">{stage.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
