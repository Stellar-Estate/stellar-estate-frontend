import React from 'react';
import { Property, PropertyUnit } from '../types/index.ts';
import { X, Building2, CheckCircle2, AlertCircle, DollarSign, Home } from 'lucide-react';

export interface UnitBreakdownModalProps {
  isOpen: boolean;
  onClose: () => void;
  property: Property;
  units: PropertyUnit[];
}

export const UnitBreakdownModal: React.FC<UnitBreakdownModalProps> = ({
  isOpen,
  onClose,
  property,
  units,
}) => {
  if (!isOpen) return null;

  const totalMonthlyRollup = units.reduce((acc, u) => acc + (u.monthly_rent || 0), 0);
  const occupiedUnits = units.filter((u) => u.occupancy_status === 'OCCUPIED');
  const occupancyPercentage = units.length > 0 ? Math.round((occupiedUnits.length / units.length) * 100) : 0;

  return (
    <div className="modal-backdrop" onClick={onClose} style={{ zIndex: 1050 }}>
      <div
        className="modal-content"
        onClick={(e) => e.stopPropagation()}
        style={{
          maxWidth: 780,
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
          padding: '2rem',
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
              <span className="badge badge-stellar">{property.name}</span>
              <span className="badge badge-success">{units.length} Total Units</span>
            </div>
            <h3 style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--text-primary)' }}>
              Property Unit Roster & Rent Roll
            </h3>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--text-muted)',
              cursor: 'pointer',
              padding: '0.5rem',
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Summary Metrics Banner */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr 1fr',
            gap: '1rem',
            background: 'rgba(255, 255, 255, 0.03)',
            border: '1px solid var(--border-card)',
            borderRadius: 'var(--radius-sm)',
            padding: '1rem',
            marginBottom: '1.5rem',
          }}
        >
          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
              Occupancy Rate
            </div>
            <div style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--accent-emerald)' }}>
              {occupancyPercentage}% ({occupiedUnits.length} / {units.length})
            </div>
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
              Monthly Gross Rent Roll
            </div>
            <div style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--accent-gold)' }}>
              ${totalMonthlyRollup.toLocaleString()} XLM
            </div>
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
              Annualized Projected Run-Rate
            </div>
            <div style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)' }}>
              ${(totalMonthlyRollup * 12).toLocaleString()} XLM
            </div>
          </div>
        </div>

        {/* Unit Table */}
        <div style={{ flex: 1, overflowY: 'auto', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-sm)' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
            <thead>
              <tr style={{ background: 'rgba(255, 255, 255, 0.04)', borderBottom: '1px solid var(--border-card)', color: 'var(--text-muted)' }}>
                <th style={{ padding: '0.75rem 1rem' }}>Unit ID</th>
                <th style={{ padding: '0.75rem 1rem' }}>Type</th>
                <th style={{ padding: '0.75rem 1rem' }}>Monthly Rent</th>
                <th style={{ padding: '0.75rem 1rem' }}>Status</th>
                <th style={{ padding: '0.75rem 1rem' }}>Area / Specs</th>
              </tr>
            </thead>
            <tbody>
              {units.map((unit) => (
                <tr
                  key={unit.id}
                  style={{
                    borderBottom: '1px solid var(--border-subtle)',
                    transition: 'var(--transition)',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.02)')}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                >
                  <td style={{ padding: '0.85rem 1rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <Home size={14} color="var(--accent-gold)" />
                      {unit.unit_identifier}
                    </div>
                  </td>
                  <td style={{ padding: '0.85rem 1rem', color: 'var(--text-secondary)' }}>
                    {unit.unit_type}
                  </td>
                  <td style={{ padding: '0.85rem 1rem', fontWeight: 700, color: 'var(--accent-gold)' }}>
                    ${unit.monthly_rent.toLocaleString()} XLM
                  </td>
                  <td style={{ padding: '0.85rem 1rem' }}>
                    <span
                      className={unit.occupancy_status === 'OCCUPIED' ? 'badge badge-success' : 'badge badge-warning'}
                      style={{ fontSize: '0.7rem' }}
                    >
                      {unit.occupancy_status === 'OCCUPIED' ? (
                        <>
                          <CheckCircle2 size={11} style={{ marginRight: 3 }} /> OCCUPIED
                        </>
                      ) : (
                        <>
                          <AlertCircle size={11} style={{ marginRight: 3 }} /> VACANT
                        </>
                      )}
                    </span>
                  </td>
                  <td style={{ padding: '0.85rem 1rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    {unit.metadata?.sqm ? `${unit.metadata.sqm} m²` : 'Standard'}
                    {unit.metadata?.floor ? ` • Floor ${unit.metadata.floor}` : ''}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'flex-end' }}>
          <button onClick={onClose} className="btn-secondary" style={{ padding: '0.6rem 1.25rem' }}>
            Close Unit Roster
          </button>
        </div>
      </div>
    </div>
  );
};
