import React, { useState } from 'react';
import { Property } from '../types/index.ts';
import { Building2, Search, Filter, ArrowRight, ShieldCheck } from 'lucide-react';

interface PropertiesPageProps {
  properties: Property[];
  onSelectProperty: (property: Property) => void;
}

export const PropertiesPage: React.FC<PropertiesPageProps> = ({ properties, onSelectProperty }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('ALL');

  const propertyTypes = ['ALL', 'Residential / Mixed-Use', 'Commercial Residential', 'Serviced Apartments'];

  const filteredProperties = properties.filter((prop) => {
    const matchesSearch =
      prop.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      prop.location.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = selectedType === 'ALL' || prop.property_type === selectedType;
    return matchesSearch && matchesType;
  });

  return (
    <div>
      {/* Header */}
      <div className="section-header" style={{ marginBottom: '2.5rem' }}>
        <div className="section-tag">
          <Building2 size={16} /> Property Directory
        </div>
        <h1 className="section-title">Discover Properties & Financial Vaults</h1>
        <p className="section-subtitle">
          Explore institutional real-estate assets with dedicated Stellar Testnet vaults, live financial history, and verified cash flows.
        </p>
      </div>

      {/* Filters & Search */}
      <div
        style={{
          display: 'flex',
          gap: '1rem',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '2rem',
        }}
      >
        <div style={{ position: 'relative', flex: 1, minWidth: 280, maxWidth: 440 }}>
          <Search
            size={18}
            color="var(--text-muted)"
            style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)' }}
          />
          <input
            type="text"
            placeholder="Search by property name or location..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              width: '100%',
              padding: '0.65rem 1rem 0.65rem 2.5rem',
              background: 'var(--bg-card)',
              border: '1px solid var(--border-card)',
              borderRadius: 'var(--radius-sm)',
              color: 'var(--text-primary)',
            }}
          />
        </div>

        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          {propertyTypes.map((type) => (
            <button
              key={type}
              onClick={() => setSelectedType(type)}
              className={selectedType === type ? 'btn-primary' : 'btn-secondary'}
              style={{ fontSize: '0.8rem', padding: '0.45rem 0.85rem' }}
            >
              {type === 'ALL' ? 'All Types' : type}
            </button>
          ))}
        </div>
      </div>

      {/* Property Grid */}
      <div className="grid-3">
        {filteredProperties.map((prop) => (
          <div
            key={prop.id}
            className="glass-card"
            style={{ overflow: 'hidden', cursor: 'pointer', display: 'flex', flexDirection: 'column' }}
            onClick={() => onSelectProperty(prop)}
          >
            <div style={{ position: 'relative', height: 220, overflow: 'hidden' }}>
              <img
                src={prop.image_url}
                alt={prop.name}
                style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.4s ease' }}
                onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.04)')}
                onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
              />
              <div style={{ position: 'absolute', top: 12, right: 12 }}>
                <span className="badge badge-success">Vault Active</span>
              </div>
              <div
                style={{
                  position: 'absolute',
                  bottom: 0,
                  insetInline: 0,
                  padding: '1rem',
                  background: 'linear-gradient(to top, rgba(7, 10, 19, 0.95), transparent)',
                }}
              >
                <span style={{ fontSize: '0.8rem', color: 'var(--accent-gold)', fontWeight: 600 }}>
                  {prop.property_type}
                </span>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#fff' }}>{prop.name}</h3>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{prop.location}</p>
              </div>
            </div>

            <div style={{ padding: '1.25rem', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.85rem', marginBottom: '1.25rem' }}>
                <div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Valuation</span>
                  <div style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                    ${prop.valuation.toLocaleString()}
                  </div>
                </div>
                <div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Occupancy</span>
                  <div style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--accent-emerald)' }}>
                    {prop.occupancy_percentage}%
                  </div>
                </div>
                <div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Units</span>
                  <div style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                    {prop.unit_count} Units
                  </div>
                </div>
                <div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Est. Monthly Revenue</span>
                  <div style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--accent-gold)' }}>
                    ${(prop.financial_summary?.monthly_run_rate || 8000).toLocaleString()}
                  </div>
                </div>
              </div>

              <div
                style={{
                  paddingTop: '0.85rem',
                  borderTop: '1px solid var(--border-subtle)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <div>
                  <span className="mono-text" style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    Vault: {prop.vault_stellar_address.substring(0, 6)}...{prop.vault_stellar_address.substring(prop.vault_stellar_address.length - 4)}
                  </span>
                </div>
                <div style={{ color: 'var(--accent-gold)', fontSize: '0.85rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                  Open Profile <ArrowRight size={14} />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
