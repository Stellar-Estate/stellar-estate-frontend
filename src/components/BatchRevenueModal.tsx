import React, { useState } from 'react';
import { Property } from '../types/index.ts';
import { useToast } from '../context/ToastContext.tsx';
import { apiService } from '../services/apiService.ts';
import {
  X,
  Plus,
  Trash2,
  Building2,
  DollarSign,
  CheckCircle2,
  Layers,
  ArrowRight,
  Loader2,
  AlertCircle
} from 'lucide-react';

interface BatchDepositItem {
  id: string;
  source: string;
  amount: string;
  description: string;
}

interface BatchRevenueModalProps {
  property: Property;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const BatchRevenueModal: React.FC<BatchRevenueModalProps> = ({
  property,
  isOpen,
  onClose,
  onSuccess,
}) => {
  const { showSuccess, showError } = useToast();

  const [items, setItems] = useState<BatchDepositItem[]>([
    { id: '1', source: 'UNIT_101_RENT', amount: '1250', description: 'Unit 101 Residential Rent' },
    { id: '2', source: 'UNIT_102_RENT', amount: '1400', description: 'Unit 102 Residential Rent' },
    { id: '3', source: 'PARKING_LEASES', amount: '350', description: 'Covered Parking Bay Leases' },
  ]);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successResult, setSuccessResult] = useState<{ count: number; total: number } | null>(null);

  if (!isOpen) return null;

  const totalAmount = items.reduce((sum, item) => {
    const val = parseFloat(item.amount) || 0;
    return sum + val;
  }, 0);

  const handleAddItem = () => {
    const nextId = String(Date.now());
    setItems((prev) => [
      ...prev,
      {
        id: nextId,
        source: `UNIT_${103 + prev.length}_RENT`,
        amount: '1200',
        description: `Unit ${103 + prev.length} Residential Rent`,
      },
    ]);
  };

  const handleRemoveItem = (id: string) => {
    if (items.length <= 1) return;
    setItems((prev) => prev.filter((item) => item.id !== id));
  };

  const handleUpdateItem = (id: string, field: keyof BatchDepositItem, value: string) => {
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, [field]: value } : item))
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (items.length === 0) return;

    for (const item of items) {
      const val = parseFloat(item.amount);
      if (isNaN(val) || val <= 0) {
        showError('All deposit amounts must be positive numbers');
        return;
      }
    }

    setIsSubmitting(true);
    try {
      const payload = items.map((i) => ({
        source: i.source,
        amount: parseFloat(i.amount),
        description: i.description,
      }));

      const res = await apiService.recordBatchRevenue(property.id, payload);
      if (res.success) {
        setSuccessResult({
          count: res.data?.count || items.length,
          total: res.data?.total_amount || totalAmount,
        });
        showSuccess(`Successfully ingested ${items.length} revenue records atomically!`);
        if (onSuccess) onSuccess();
      } else {
        showError(res.error || 'Failed to record batch revenue');
      }
    } catch (err: any) {
      showError(err.message || 'An error occurred during batch ingestion');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetAndClose = () => {
    setSuccessResult(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-2xl bg-stellar-card border border-stellar-border/80 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-stellar-border/60 bg-stellar-card-subtle/50">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-blue-500/10 border border-blue-500/20 rounded-xl text-blue-400">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                Batch Revenue Ingestion
              </h2>
              <p className="text-xs text-stellar-muted flex items-center gap-1.5 mt-0.5">
                <Building2 className="w-3.5 h-3.5" />
                {property.name} &bull; Soroban Vault
              </p>
            </div>
          </div>
          <button
            onClick={handleResetAndClose}
            className="p-2 text-stellar-muted hover:text-white rounded-lg hover:bg-stellar-card-subtle transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        {successResult ? (
          <div className="p-8 text-center flex flex-col items-center">
            <div className="w-16 h-16 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-full flex items-center justify-center mb-4">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Batch Inflow Recorded</h3>
            <p className="text-sm text-stellar-muted max-w-md mb-6">
              {successResult.count} rental revenue streams totaling{' '}
              <span className="font-semibold text-white">
                ${successResult.total.toLocaleString(undefined, { minimumFractionDigits: 2 })} USDC
              </span>{' '}
              were successfully registered and credited to the property vault ledger.
            </p>
            <button
              onClick={handleResetAndClose}
              className="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-sm font-semibold transition-all shadow-lg shadow-blue-600/20"
            >
              Done & Return
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
            <div className="p-6 overflow-y-auto space-y-4 flex-1">
              <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-3 text-xs text-blue-300 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                <span>
                  Deposit multiple rental payments or auxiliary streams in one atomic operation. Each line item will be stamped to the Soroban vault and eligible for the next waterfall settlement.
                </span>
              </div>

              <div className="space-y-3">
                {items.map((item, index) => (
                  <div
                    key={item.id}
                    className="p-3.5 bg-stellar-card-subtle/70 border border-stellar-border/40 rounded-xl flex items-center gap-3 transition-all hover:border-stellar-border"
                  >
                    <span className="text-xs font-mono text-stellar-muted w-5 shrink-0">
                      #{index + 1}
                    </span>

                    <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-2">
                      <input
                        type="text"
                        placeholder="Stream / Source ID"
                        value={item.source}
                        onChange={(e) => handleUpdateItem(item.id, 'source', e.target.value)}
                        className="px-3 py-1.5 bg-black/40 border border-stellar-border/60 rounded-lg text-xs text-white placeholder-stellar-muted focus:outline-none focus:border-blue-500"
                        required
                      />
                      <input
                        type="text"
                        placeholder="Description (e.g. Unit 101)"
                        value={item.description}
                        onChange={(e) => handleUpdateItem(item.id, 'description', e.target.value)}
                        className="px-3 py-1.5 bg-black/40 border border-stellar-border/60 rounded-lg text-xs text-white placeholder-stellar-muted focus:outline-none focus:border-blue-500"
                      />
                      <div className="relative">
                        <DollarSign className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-stellar-muted" />
                        <input
                          type="number"
                          step="0.01"
                          min="0.01"
                          placeholder="Amount (USDC)"
                          value={item.amount}
                          onChange={(e) => handleUpdateItem(item.id, 'amount', e.target.value)}
                          className="w-full pl-7 pr-3 py-1.5 bg-black/40 border border-stellar-border/60 rounded-lg text-xs text-white font-mono placeholder-stellar-muted focus:outline-none focus:border-blue-500"
                          required
                        />
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleRemoveItem(item.id)}
                      disabled={items.length <= 1}
                      className="p-1.5 text-stellar-muted hover:text-rose-400 disabled:opacity-30 disabled:hover:text-stellar-muted transition-colors"
                      title="Remove row"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>

              <button
                type="button"
                onClick={handleAddItem}
                className="w-full py-2 border border-dashed border-stellar-border/80 hover:border-blue-500/50 hover:bg-blue-500/5 rounded-xl text-xs font-medium text-blue-400 flex items-center justify-center gap-1.5 transition-all"
              >
                <Plus className="w-4 h-4" /> Add Another Revenue Stream
              </button>
            </div>

            {/* Footer */}
            <div className="p-4 bg-stellar-card-subtle/50 border-t border-stellar-border/60 flex items-center justify-between">
              <div>
                <span className="text-xs text-stellar-muted block">Total Batch Inflow</span>
                <span className="text-lg font-bold text-white font-mono">
                  ${totalAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}{' '}
                  <span className="text-xs font-sans text-blue-400 font-medium">USDC</span>
                </span>
              </div>

              <div className="flex items-center space-x-3">
                <button
                  type="button"
                  onClick={handleResetAndClose}
                  className="px-4 py-2 text-xs font-medium text-stellar-muted hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || totalAmount <= 0}
                  className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white rounded-xl text-xs font-semibold flex items-center gap-2 transition-all shadow-lg shadow-blue-600/20"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" /> Ingesting Inflows...
                    </>
                  ) : (
                    <>
                      Commit Batch ({items.length}) <ArrowRight className="w-3.5 h-3.5" />
                    </>
                  )}
                </button>
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
