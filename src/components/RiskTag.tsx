import { cn } from '@/lib/utils';
import { getRiskLabel } from '@/data/lakesData';
import {
  AlertTriangle,
  AlertCircle,
  CheckCircle,
  LucideIcon,
} from 'lucide-react';

/* -------------------- TYPES -------------------- */

export type RiskLevel = 'high' | 'medium' | 'low';

interface RiskTagProps {
  level: RiskLevel;
  score?: number;          // expected: 0 → 1
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
  animate?: boolean;       // NEW: control pulse explicitly
}

/* -------------------- CONFIG -------------------- */

const ICON_MAP: Record<RiskLevel, LucideIcon> = {
  high: AlertTriangle,
  medium: AlertCircle,
  low: CheckCircle,
};

const SIZE_CLASSES = {
  sm: 'px-2 py-0.5 text-xs gap-1',
  md: 'px-3 py-1 text-sm gap-1.5',
  lg: 'px-4 py-1.5 text-base gap-2',
};

const ICON_SIZES = {
  sm: 'w-3 h-3',
  md: 'w-4 h-4',
  lg: 'w-5 h-5',
};

/* -------------------- COMPONENT -------------------- */

const RiskTag = ({
  level,
  score,
  size = 'md',
  showIcon = true,
  animate = level === 'high',
}: RiskTagProps) => {
  const Icon = ICON_MAP[level];

  return (
    <span
      role="status"
      aria-label={`Risk level ${level}`}
      className={cn(
        'inline-flex items-center font-medium rounded-full select-none',
        SIZE_CLASSES[size],
        level === 'high' && 'risk-high',
        level === 'medium' && 'risk-medium',
        level === 'low' && 'risk-low',
        animate && level === 'high' && 'animate-pulse-glow'
      )}
    >
      {showIcon && <Icon className={ICON_SIZES[size]} aria-hidden />}

      <span>{getRiskLabel(level)}</span>
    </span>
  );
};

export default RiskTag;
