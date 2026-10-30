import React from 'react';
import { DistributionAgreementVersion } from '../types/index.ts';
import { CheckCircle2, Clock, Lock, AlertCircle, Copy, Check, ArrowRight } from 'lucide-react';
import { useClipboard } from '../utils/clipboard.ts';

interface AgreementTimelineProps {
  versions: DistributionAgreementVersion[];
  selectedVersionId: string;
  onSelectVersion: (version: DistributionAgreementVersion) => void;
}

export const AgreementTimeline: React.FC<AgreementTimelineProps> = ({
  versions,
  selectedVersionId,
  onSelectVersion,
}) => {
  const { copy } = useClipboard();
  const [copiedId, setCopiedId] = React.useState<string | null>(null);

  const sortedVersions = [...versions].sort((a, b) => b.version_number - a.version_number);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'LOCKED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
            <Lock className="w-3 h-3" /> Locked & Active
          </span>
        );
      case 'PENDING_APPROVAL':
      case 'PENDING_APPROVALS':
      case 'DRAFT':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-500/15 text-amber-400 border border-amber-500/30">
            <Clock className="w-3 h-3" /> Pending Approvals
          </span>
        );
      case 'REVOKED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-500/15 text-rose-400 border border-rose-500/30">
            <AlertCircle className="w-3 h-3" /> Revoked
          </span>
        );
      case 'SUPERSEDED':
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-500/15 text-slate-400 border border-slate-500/30">
            <CheckCircle2 className="w-3 h-3" /> Superseded
          </span>
        );
    }
  };

  return (
    <div className="w-full bg-stellar-card border border-stellar-border/80 rounded-2xl p-5 shadow-lg">
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-stellar-border/50">
        <div>
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            Agreement Version Lineage
          </h3>
          <p className="text-xs text-stellar-muted mt-0.5">
            Immutable cryptographic progression of waterfall rules across protocol lifecycle
          </p>
        </div>
        <span className="text-xs font-mono px-2.5 py-1 bg-stellar-card-subtle rounded-lg text-blue-400 border border-stellar-border">
          {versions.length} {versions.length === 1 ? 'Version' : 'Versions'}
        </span>
      </div>

      <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-3 before:bottom-3 before:w-0.5 before:bg-stellar-border/60">
        {sortedVersions.map((ver) => {
          const isSelected = ver.id === selectedVersionId;
          const approvedCount = ver.stakeholders.filter((s) => s.has_approved).length;
          const totalStakeholders = ver.stakeholders.length;

          return (
            <div
              key={ver.id}
              onClick={() => onSelectVersion(ver)}
              className={`relative cursor-pointer transition-all p-4 rounded-xl border ${
                isSelected
                  ? 'bg-blue-600/10 border-blue-500 shadow-md shadow-blue-500/10'
                  : 'bg-stellar-card-subtle/50 border-stellar-border/50 hover:border-stellar-border hover:bg-stellar-card-subtle'
              }`}
            >
              {/* Timeline marker */}
              <div
                className={`absolute -left-[1.85rem] top-5 w-4 h-4 rounded-full border-2 transition-all ${
                  ver.status === 'LOCKED'
                    ? 'bg-emerald-500 border-stellar-bg ring-4 ring-emerald-500/20'
                    : isSelected
                    ? 'bg-blue-500 border-stellar-bg ring-4 ring-blue-500/20'
                    : 'bg-stellar-card border-stellar-border'
                }`}
              />

              <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                <div className="flex items-center gap-2.5">
                  <span className="font-mono text-sm font-bold text-white">
                    Version {ver.version_number}
                  </span>
                  {getStatusBadge(ver.status)}
                </div>

                <span className="text-xs text-stellar-muted font-mono">
                  {new Date(ver.created_at).toLocaleDateString(undefined, {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                  })}
                </span>
              </div>

              {/* Hash and Consensus row */}
              <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-stellar-muted mt-2 pt-2 border-t border-stellar-border/40">
                <div className="flex items-center gap-1.5 font-mono">
                  <span>Hash:</span>
                  <span className="text-white bg-black/40 px-2 py-0.5 rounded border border-stellar-border/50">
                    {ver.agreement_hash.substring(0, 10)}...{ver.agreement_hash.substring(ver.agreement_hash.length - 8)}
                  </span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      copy(ver.agreement_hash);
                      setCopiedId(ver.id);
                      setTimeout(() => setCopiedId(null), 2000);
                    }}
                    className="p-1 hover:text-white transition-colors"
                    title="Copy canonical hash"
                  >
                    {copiedId === ver.id ? (
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <span>Approvals:</span>
                  <span
                    className={`font-semibold font-mono ${
                      approvedCount === totalStakeholders && totalStakeholders > 0
                        ? 'text-emerald-400'
                        : 'text-amber-400'
                    }`}
                  >
                    {approvedCount}/{totalStakeholders}
                  </span>
                  {isSelected && (
                    <span className="text-blue-400 font-semibold flex items-center gap-1 ml-2">
                      Active View <ArrowRight className="w-3 h-3" />
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

