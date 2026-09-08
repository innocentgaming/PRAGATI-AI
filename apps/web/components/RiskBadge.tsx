import React from 'react';

export type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

interface RiskBadgeProps {
  level: string;
  score?: number;
  showScore?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export const RiskBadge: React.FC<RiskBadgeProps> = ({
  level,
  score,
  showScore = true,
  size = 'sm',
}) => {
  const normalizedLevel = (level || 'LOW').toUpperCase() as RiskLevel;

  const getColors = () => {
    switch (normalizedLevel) {
      case 'CRITICAL':
        return 'bg-rose-50 text-rose-700 border-rose-200 font-bold';
      case 'HIGH':
        return 'bg-orange-50 text-orange-700 border-orange-200 font-semibold';
      case 'MEDIUM':
        return 'bg-amber-50 text-amber-700 border-amber-200 font-semibold';
      case 'LOW':
      default:
        return 'bg-emerald-50 text-emerald-700 border-emerald-200 font-medium';
    }
  };

  const getSize = () => {
    switch (size) {
      case 'lg':
        return 'px-3 py-1 text-xs gap-1.5';
      case 'md':
        return 'px-2.5 py-0.5 text-xs gap-1';
      case 'sm':
      default:
        return 'px-2 py-0.5 text-[11px] gap-1';
    }
  };

  return (
    <span
      className={`inline-flex items-center rounded-md border tracking-tight ${getColors()} ${getSize()}`}
    >
      <span
        className={`h-1.5 w-1.5 rounded-full ${
          normalizedLevel === 'CRITICAL'
            ? 'bg-rose-600'
            : normalizedLevel === 'HIGH'
            ? 'bg-orange-600'
            : normalizedLevel === 'MEDIUM'
            ? 'bg-amber-600'
            : 'bg-emerald-600'
        }`}
      />
      <span>{normalizedLevel}</span>
      {showScore && score !== undefined && score !== null && (
        <span className="font-mono text-[10px] opacity-80">
          ({score.toFixed(0)})
        </span>
      )}
    </span>
  );
};
