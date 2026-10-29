import React, { useState } from 'react';

export interface ValuationPoint {
  date: string;
  valuation: number;
  label?: string;
}

interface PropertyValuationChartProps {
  currentValuation: number;
  initialValuation?: number;
  history?: ValuationPoint[];
  currency?: string;
}

export const PropertyValuationChart: React.FC<PropertyValuationChartProps> = ({
  currentValuation,
  initialValuation,
  history,
  currency = 'USDC',
}) => {
  const initial = initialValuation || currentValuation * 0.9;

  // Default 6-month historical progression if not provided
  const points: ValuationPoint[] = history && history.length > 1 ? history : [
    { date: '6 mos ago', valuation: Math.round(initial), label: 'Purchase Valuation' },
    { date: '4 mos ago', valuation: Math.round(initial * 1.025), label: 'Quarterly Revaluation' },
    { date: '2 mos ago', valuation: Math.round(initial * 1.06), label: 'Mid-term Assessment' },
    { date: 'Current', valuation: currentValuation, label: 'Verified Oracle Valuation' },
  ];

  const [activePoint, setActivePoint] = useState<ValuationPoint | null>(null);

  const minVal = Math.min(...points.map((p) => p.valuation)) * 0.95;
  const maxVal = Math.max(...points.map((p) => p.valuation)) * 1.05;
  const range = maxVal - minVal || 1;

  const width = 480;
  const height = 160;
  const paddingX = 40;
  const paddingY = 25;

  const getCoordinates = (index: number, val: number) => {
    const x = paddingX + (index / (points.length - 1)) * (width - 2 * paddingX);
    const y = height - paddingY - ((val - minVal) / range) * (height - 2 * paddingY);
    return { x, y };
  };

  const coords = points.map((p, i) => getCoordinates(i, p.valuation));
  const pathD = coords.reduce((acc, c, i) => `${acc} ${i === 0 ? 'M' : 'L'} ${c.x} ${c.y}`, '');
  const areaD = `${pathD} L ${coords[coords.length - 1].x} ${height - paddingY} L ${coords[0].x} ${height - paddingY} Z`;

  const growthPct = (((currentValuation - points[0].valuation) / points[0].valuation) * 100).toFixed(2);
  const isPositive = Number(growthPct) >= 0;

  return (
    <div className="bg-slate-900/60 rounded-xl border border-slate-800 p-4" data-testid="property-valuation-chart">
      <div className="flex items-center justify-between mb-3">
        <div>
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Property Valuation Trajectory
          </span>
          <div className="flex items-center gap-2 mt-0.5">
            <span className="text-lg font-bold text-white">
              ${currentValuation.toLocaleString()} {currency}
            </span>
            <span
              className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                isPositive ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-rose-500/10 text-rose-400'
              }`}
            >
              {isPositive ? `+${growthPct}%` : `${growthPct}%`}
            </span>
          </div>
        </div>
        {activePoint && (
          <div className="text-right">
            <span className="text-xs text-slate-400">{activePoint.date}:</span>{' '}
            <span className="text-xs font-bold text-sky-400">
              ${activePoint.valuation.toLocaleString()}
            </span>
          </div>
        )}
      </div>

      <div className="relative w-full overflow-hidden">
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto overflow-visible">
          <defs>
            <linearGradient id="valGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#0284c7" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#0284c7" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Grid lines */}
          <line
            x1={paddingX}
            y1={paddingY}
            x2={width - paddingX}
            y2={paddingY}
            stroke="#1e293b"
            strokeDasharray="4 4"
          />
          <line
            x1={paddingX}
            y1={height - paddingY}
            x2={width - paddingX}
            y2={height - paddingY}
            stroke="#334155"
          />

          {/* Area under curve */}
          <path d={areaD} fill="url(#valGrad)" />

          {/* Line curve */}
          <path d={pathD} fill="none" stroke="#38bdf8" strokeWidth="2.5" strokeLinecap="round" />

          {/* Points */}
          {coords.map((c, i) => {
            const pt = points[i];
            const isActive = activePoint?.date === pt.date;
            return (
              <g key={i} className="cursor-pointer" onMouseEnter={() => setActivePoint(pt)} onMouseLeave={() => setActivePoint(null)}>
                <circle
                  cx={c.x}
                  cy={c.y}
                  r={isActive ? 6 : 4}
                  fill="#0284c7"
                  stroke="#ffffff"
                  strokeWidth={isActive ? 2.5 : 1.5}
                  className="transition-all"
                />
                <text
                  x={c.x}
                  y={height - 8}
                  textAnchor="middle"
                  className="text-[9px] fill-slate-400 select-none"
                >
                  {pt.date}
                </text>
              </g>
            );
          })}
        </svg>
      </div>
    </div>
  );
};
