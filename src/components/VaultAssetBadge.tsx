import React, { useState } from 'react';
import { Coins, ExternalLink, Copy, Check } from 'lucide-react';

interface VaultAssetBadgeProps {
  assetCode?: string;
  contractId?: string;
  propertyId?: string;
  className?: string;
}

export const VaultAssetBadge: React.FC<VaultAssetBadgeProps> = ({
  assetCode = 'USDC',
  contractId = 'CAQCFV2AUUXA2RFYGI4HD4KSGYYEB5Q5OC54ZAWU4HBPWZ7AL64KLCPH',
  className = '',
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(contractId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const truncated = contractId.length > 12 
    ? `${contractId.slice(0, 6)}...${contractId.slice(-6)}` 
    : contractId;

  return (
    <div className={`inline-flex flex-wrap items-center gap-2 bg-slate-800/80 border border-slate-700/80 rounded-lg px-3 py-1.5 text-xs text-slate-300 ${className}`} data-testid="vault-asset-badge">
      <div className="flex items-center gap-1.5 font-medium text-emerald-400">
        <Coins className="w-3.5 h-3.5 text-emerald-400" />
        <span>Vault Asset: {assetCode}</span>
      </div>

      <span className="text-slate-600">|</span>

      <div className="flex items-center gap-1 font-mono text-slate-400">
        <span title={contractId}>{truncated}</span>
        <button
          onClick={handleCopy}
          className="p-1 hover:text-white transition-colors text-slate-400"
          title="Copy Contract Address"
          aria-label="Copy Contract Address"
        >
          {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
        </button>
      </div>

      <a
        href={`https://stellar.expert/explorer/testnet/contract/${contractId}`}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1 text-sky-400 hover:text-sky-300 transition-colors ml-1 font-medium"
        title="View on StellarExpert"
      >
        <span>StellarExpert</span>
        <ExternalLink className="w-3 h-3" />
      </a>
    </div>
  );
};
