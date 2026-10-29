import React from 'react';

export type SkeletonVariant = 'card' | 'table' | 'line' | 'metrics';

export interface SkeletonLoaderProps {
  variant?: SkeletonVariant;
  count?: number;
  height?: number | string;
  width?: number | string;
  className?: string;
}

export const SkeletonLoader: React.FC<SkeletonLoaderProps> = ({
  variant = 'card',
  count = 1,
  height,
  width,
  className = '',
}) => {
  const items = Array.from({ length: Math.max(1, count) });

  const pulseStyle: React.CSSProperties = {
    background: 'linear-gradient(90deg, rgba(255, 255, 255, 0.04) 25%, rgba(255, 255, 255, 0.09) 50%, rgba(255, 255, 255, 0.04) 75%)',
    backgroundSize: '200% 100%',
    animation: 'skeletonPulse 1.6s ease-in-out infinite',
    borderRadius: 'var(--radius-sm)',
  };

  const renderSingle = (index: number) => {
    switch (variant) {
      case 'card':
        return (
          <div
            key={index}
            className={`glass-card ${className}`}
            style={{
              padding: '1.25rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '1rem',
              overflow: 'hidden',
            }}
          >
            {/* Image Placeholder */}
            <div style={{ ...pulseStyle, width: '100%', height: 180, borderRadius: 'var(--radius-md)' }} />
            {/* Header / Title */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ ...pulseStyle, width: '60%', height: 22 }} />
              <div style={{ ...pulseStyle, width: '20%', height: 18 }} />
            </div>
            {/* Subtitle / Location */}
            <div style={{ ...pulseStyle, width: '40%', height: 14 }} />
            {/* Metrics Row */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '0.75rem',
                marginTop: '0.5rem',
                paddingTop: '0.75rem',
                borderTop: '1px solid var(--border-subtle)',
              }}
            >
              <div>
                <div style={{ ...pulseStyle, width: '50%', height: 12, marginBottom: 6 }} />
                <div style={{ ...pulseStyle, width: '75%', height: 18 }} />
              </div>
              <div>
                <div style={{ ...pulseStyle, width: '50%', height: 12, marginBottom: 6 }} />
                <div style={{ ...pulseStyle, width: '75%', height: 18 }} />
              </div>
            </div>
          </div>
        );

      case 'metrics':
        return (
          <div
            key={index}
            className={`glass-card ${className}`}
            style={{
              padding: '1.5rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.75rem',
            }}
          >
            <div style={{ ...pulseStyle, width: '45%', height: 12 }} />
            <div style={{ ...pulseStyle, width: '70%', height: 32 }} />
            <div style={{ ...pulseStyle, width: '55%', height: 12 }} />
          </div>
        );

      case 'table':
        return (
          <div
            key={index}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '1rem',
              borderBottom: '1px solid var(--border-subtle)',
              gap: '1rem',
            }}
          >
            <div style={{ ...pulseStyle, width: '25%', height: 16 }} />
            <div style={{ ...pulseStyle, width: '20%', height: 16 }} />
            <div style={{ ...pulseStyle, width: '15%', height: 16 }} />
            <div style={{ ...pulseStyle, width: '15%', height: 16 }} />
            <div style={{ ...pulseStyle, width: '10%', height: 26, borderRadius: 'var(--radius-sm)' }} />
          </div>
        );

      case 'line':
      default:
        return (
          <div
            key={index}
            style={{
              ...pulseStyle,
              width: width || '100%',
              height: height || 16,
              margin: '0.25rem 0',
            }}
          />
        );
    }
  };

  return (
    <>
      <style>
        {`
          @keyframes skeletonPulse {
            0% { background-position: 200% 0; }
            100% { background-position: -200% 0; }
          }
        `}
      </style>
      {items.map((_, i) => renderSingle(i))}
    </>
  );
};
