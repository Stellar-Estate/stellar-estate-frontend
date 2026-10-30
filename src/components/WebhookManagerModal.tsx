import React, { useState, useEffect } from 'react';
import { apiService } from '../services/apiService.ts';
import {
  X,
  Radio,
  Send,
  Trash2,
  CheckCircle2,
  Clock,
  ExternalLink,
  ShieldAlert,
  Activity,
  Plus
} from 'lucide-react';

interface WebhookManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const WebhookManagerModal: React.FC<WebhookManagerModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [subscriptions, setSubscriptions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [dispatchStatus, setDispatchStatus] = useState<string | null>(null);
  const [newUrl, setNewUrl] = useState('');
  const [newEvent, setNewEvent] = useState('settlement.executed');

  const loadWebhooks = async () => {
    setIsLoading(true);
    try {
      const res = await apiService.getWebhooks();
      if (res && res.data) {
        setSubscriptions(res.data);
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadWebhooks();
    }
  }, [isOpen]);

  const handleTestDispatch = async (url: string, event: string) => {
    setDispatchStatus(`Dispatching test event to ${url}...`);
    try {
      const res = await apiService.testDispatchWebhook(url, event);
      if (res.success) {
        setDispatchStatus(`Test dispatch delivered! Signature: ${res.delivery?.signature?.substring(0, 16)}...`);
      }
    } catch {
      setDispatchStatus('Dispatch failed.');
    }
    setTimeout(() => setDispatchStatus(null), 4000);
  };

  const handleUnsubscribe = async (id: string) => {
    try {
      await apiService.unsubscribeWebhook(id);
      setSubscriptions((prev) => prev.filter((s) => s.id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateWebhook = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUrl) return;
    try {
      await apiService.subscribeWebhook(newUrl, [newEvent]);
      setNewUrl('');
      loadWebhooks();
    } catch (err) {
      console.error(err);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-3xl bg-stellar-card border border-stellar-border/80 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-stellar-border/60 bg-stellar-card-subtle/50">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-blue-500/10 border border-blue-500/20 rounded-xl text-blue-400">
              <Radio className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white tracking-wide">
                Webhook Event Subscriptions &amp; Dispatcher
              </h2>
              <p className="text-xs text-stellar-muted mt-0.5">
                Stellar Estate real-time HTTP event notification management and delivery tests
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-stellar-muted hover:text-white hover:bg-white/5 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 custom-scrollbar">
          {/* Dispatch Status Banner */}
          {dispatchStatus && (
            <div className="p-3 bg-blue-500/10 border border-blue-500/30 rounded-xl flex items-center space-x-3 text-xs text-blue-300 animate-fade-in">
              <Activity className="w-4 h-4 text-blue-400 flex-shrink-0 animate-spin" />
              <span>{dispatchStatus}</span>
            </div>
          )}

          {/* Register New Subscription Form */}
          <form onSubmit={handleCreateWebhook} className="p-4 bg-stellar-card-subtle/40 border border-stellar-border/50 rounded-xl space-y-3">
            <span className="text-xs font-semibold text-stellar-muted uppercase tracking-wider block">
              Register New Event Webhook
            </span>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <input
                type="url"
                required
                placeholder="https://myservice.com/webhook"
                value={newUrl}
                onChange={(e) => setNewUrl(e.target.value)}
                className="md:col-span-2 px-3 py-2 bg-stellar-dark/60 border border-stellar-border/60 rounded-lg text-xs text-white placeholder-stellar-muted focus:outline-none focus:border-blue-500"
              />
              <button
                type="submit"
                className="flex items-center justify-center space-x-1.5 px-3 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-lg transition-colors shadow-lg shadow-blue-500/20"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Webhook</span>
              </button>
            </div>
          </form>

          {/* Active Webhook Subscriptions */}
          <div className="space-y-3">
            <span className="text-xs font-semibold text-stellar-muted uppercase tracking-wider block">
              Active Registered Endpoints ({subscriptions.length})
            </span>

            {subscriptions.length === 0 ? (
              <div className="p-8 text-center text-xs text-stellar-muted border border-dashed border-stellar-border/40 rounded-xl">
                No active webhooks configured. Register a listener endpoint above.
              </div>
            ) : (
              subscriptions.map((sub) => (
                <div
                  key={sub.id}
                  className="p-4 bg-stellar-dark/40 border border-stellar-border/60 hover:border-blue-500/40 rounded-xl space-y-3 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-semibold text-white font-mono break-all">
                          {sub.url}
                        </span>
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                          Active
                        </span>
                      </div>
                      <p className="text-[11px] text-stellar-muted mt-1">
                        Subscription ID: <code className="text-stellar-accent">{sub.id}</code>
                      </p>
                    </div>

                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleTestDispatch(sub.url, sub.events?.[0] || 'settlement.executed')}
                        className="flex items-center space-x-1 px-2.5 py-1.5 bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/30 text-blue-300 rounded-lg text-xs transition-colors"
                        title="Send Test Dispatch"
                      >
                        <Send className="w-3 h-3" />
                        <span>Test</span>
                      </button>
                      <button
                        onClick={() => handleUnsubscribe(sub.id)}
                        className="p-1.5 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-400 rounded-lg text-xs transition-colors"
                        title="Delete Webhook"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {(sub.events || []).map((ev: string) => (
                      <span
                        key={ev}
                        className="px-2 py-0.5 bg-purple-500/10 border border-purple-500/20 rounded text-[10px] font-mono text-purple-300"
                      >
                        {ev}
                      </span>
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-stellar-border/60 bg-stellar-card-subtle/50 flex items-center justify-between">
          <div className="flex items-center space-x-2 text-xs text-stellar-muted">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>HMAC-SHA256 Cryptographic Payload Signing Enabled</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-stellar-dark hover:bg-white/5 border border-stellar-border/60 text-xs font-semibold text-white rounded-xl transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

