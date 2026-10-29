import React, { useState, useEffect } from 'react';
import { apiService } from '../services/apiService.ts';
import { Property } from '../types.ts';
import {
  X,
  History,
  Shield,
  FileCheck2,
  DollarSign,
  Lock,
  GitFork,
  RefreshCw,
  ExternalLink,
  Clock,
  UserCheck
} from 'lucide-react';
import { getStellarExpertUrl } from '../utils/stellarExpert.ts';

interface PropertyAuditTrailModalProps {
  property: Property;
  isOpen: boolean;
  onClose: () => void;
}

export const PropertyAuditTrailModal: React.FC<PropertyAuditTrailModalProps> = ({
  property,
  isOpen,
  onClose,
}) => {
  const [auditData, setAuditData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  const fetchAuditTrail = async () => {
    setIsLoading(true);
    try {
      const res = await apiService.getPropertyAuditTrail(property.id);
      if (res && res.data) {
        setAuditData(res);
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchAuditTrail();
    }
  }, [isOpen, property.id]);

  if (!isOpen) return null;

  const events = auditData?.data || [];

  const getEventIcon = (type: string) => {
    if (type.includes('SETTLEMENT')) return <DollarSign className="w-4 h-4 text-emerald-400" />;
    if (type.includes('LOCK')) return <Lock className="w-4 h-4 text-amber-400" />;
    if (type.includes('FORK')) return <GitFork className="w-4 h-4 text-blue-400" />;
    if (type.includes('REVENUE')) return <FileCheck2 className="w-4 h-4 text-cyan-400" />;
    return <Shield className="w-4 h-4 text-purple-400" />;
  };

  const getEventBadgeClass = (type: string) => {
    if (type.includes('SETTLEMENT')) return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
    if (type.includes('LOCK')) return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
    if (type.includes('FORK')) return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
    if (type.includes('REVENUE')) return 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20';
    return 'bg-purple-500/10 text-purple-400 border-purple-500/20';
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-2xl bg-stellar-card border border-stellar-border/80 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-stellar-border/60 bg-stellar-card-subtle/50">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-amber-500/10 border border-amber-500/20 rounded-xl text-amber-400">
              <History className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                Property Audit Trail & Ledger Events
              </h2>
              <p className="text-xs text-stellar-muted flex items-center gap-1.5 mt-0.5">
                <span>{property.name}</span>
                <span className="font-mono text-stellar-primary">({property.id})</span>
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={fetchAuditTrail}
              disabled={isLoading}
              className="p-2 text-stellar-muted hover:text-white rounded-lg hover:bg-stellar-card-subtle transition-colors disabled:opacity-50"
              title="Refresh Audit Trail"
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
        <div className="p-6 overflow-y-auto space-y-4">
          <div className="flex items-center justify-between text-xs text-stellar-muted border-b border-stellar-border/40 pb-2">
            <span>CHRONOLOGICAL AUDIT LOG</span>
            <span className="font-mono">{events.length} Verified Records</span>
          </div>

          {events.length === 0 ? (
            <div className="text-center py-8 text-stellar-muted text-sm bg-stellar-card-subtle/30 rounded-xl border border-stellar-border/40">
              No audit events recorded for this property yet.
            </div>
          ) : (
            <div className="space-y-3">
              {events.map((evt: any) => (
                <div
                  key={evt.id}
                  className="p-4 bg-stellar-card-subtle/70 border border-stellar-border/70 rounded-xl space-y-2 hover:border-stellar-border transition-colors"
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <div className="p-1 rounded-md bg-stellar-card border border-stellar-border/50">
                        {getEventIcon(evt.event_type)}
                      </div>
                      <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full border ${getEventBadgeClass(evt.event_type)}`}>
                        {evt.event_type}
                      </span>
                      <span className="text-xs text-stellar-muted font-mono">{evt.entity_type}</span>
                    </div>
                    <span className="text-[11px] text-stellar-muted flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {new Date(evt.created_at).toLocaleString()}
                    </span>
                  </div>

                  {evt.actor_address && (
                    <div className="text-xs text-stellar-muted flex items-center gap-1.5 font-mono">
                      <UserCheck className="w-3.5 h-3.5 text-blue-400" />
                      <span>Actor:</span>
                      <a
                        href={getStellarExpertUrl('account', evt.actor_address)}
                        target="_blank"
                        rel="noreferrer"
                        className="text-stellar-primary hover:underline flex items-center gap-1"
                      >
                        {evt.actor_address.substring(0, 8)}...{evt.actor_address.slice(-6)}
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  )}

                  {evt.payload && Object.keys(evt.payload).length > 0 && (
                    <div className="text-xs bg-black/40 rounded-lg p-2.5 font-mono text-stellar-muted/90 overflow-x-auto border border-stellar-border/30">
                      {JSON.stringify(evt.payload, null, 2)}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-stellar-border/60 bg-stellar-card-subtle/50 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-stellar-card border border-stellar-border text-white text-sm font-medium hover:bg-stellar-card-subtle transition-colors"
          >
            Close Audit Trail
          </button>
        </div>
      </div>
    </div>
  );
};
