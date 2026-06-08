import { ReactNode, useEffect, useState, useRef } from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatNumber, formatPercent, formatCurrency } from '@/utils/format';

type KpiVariant = 'primary' | 'success' | 'warning' | 'danger' | 'info';
type ValueFormat = 'number' | 'currency' | 'percent';

export interface KpiCardProps {
  title: string;
  value: number;
  previousValue?: number;
  format?: ValueFormat;
  currency?: string;
  decimals?: number;
  unit?: string;
  icon?: ReactNode;
  variant?: KpiVariant;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: number;
  description?: string;
  footer?: ReactNode;
  loading?: boolean;
  animate?: boolean;
  className?: string;
  glow?: boolean;
}

const variantStyles: Record<KpiVariant, { gradient: string; text: string; bg: string }> = {
  primary: {
    gradient: 'from-primary-500/20 to-primary-600/10',
    text: 'text-primary-600',
    bg: 'bg-primary-50',
  },
  success: {
    gradient: 'from-success-500/20 to-success-600/10',
    text: 'text-success-600',
    bg: 'bg-success-50',
  },
  warning: {
    gradient: 'from-warning-500/20 to-warning-600/10',
    text: 'text-warning-600',
    bg: 'bg-warning-50',
  },
  danger: {
    gradient: 'from-danger-500/20 to-danger-600/10',
    text: 'text-danger-600',
    bg: 'bg-danger-50',
  },
  info: {
    gradient: 'from-sky-500/20 to-sky-600/10',
    text: 'text-sky-600',
    bg: 'bg-sky-50',
  },
};

function useAnimatedNumber(targetValue: number, duration: number = 1500, enabled: boolean = true) {
  const [displayValue, setDisplayValue] = useState(enabled ? 0 : targetValue);
  const previousValueRef = useRef(0);
  const startTimeRef = useRef<number | null>(null);
  const animationRef = useRef<number | null>(null);
  const displayValueRef = useRef(displayValue);

  useEffect(() => {
    displayValueRef.current = displayValue;
  }, [displayValue]);

  useEffect(() => {
    if (!enabled) {
      setDisplayValue(targetValue);
      return;
    }

    previousValueRef.current = displayValueRef.current;
    startTimeRef.current = null;

    const animate = (timestamp: number) => {
      if (startTimeRef.current === null) {
        startTimeRef.current = timestamp;
      }

      const elapsed = timestamp - startTimeRef.current;
      const progress = Math.min(elapsed / duration, 1);

      const easeOutQuart = 1 - Math.pow(1 - progress, 4);
      const currentValue =
        previousValueRef.current + (targetValue - previousValueRef.current) * easeOutQuart;

      setDisplayValue(currentValue);

      if (progress < 1) {
        animationRef.current = requestAnimationFrame(animate);
      }
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [targetValue, duration, enabled]);

  return displayValue;
}

function formatValue(
  value: number,
  format: ValueFormat,
  currency: string,
  decimals: number,
  unit?: string,
): string {
  let formatted = '';
  switch (format) {
    case 'currency':
      formatted = formatCurrency(value, currency, decimals);
      break;
    case 'percent':
      formatted = formatPercent(value, decimals);
      break;
    case 'number':
    default:
      formatted = formatNumber(value, decimals);
      break;
  }
  return unit ? `${formatted}${unit}` : formatted;
}

export default function KpiCard({
  title,
  value,
  previousValue,
  format = 'number',
  currency = 'CNY',
  decimals = 0,
  unit,
  icon,
  variant = 'primary',
  trend,
  trendValue,
  description,
  footer,
  loading = false,
  animate = true,
  className,
  glow = true,
}: KpiCardProps) {
  const animatedValue = useAnimatedNumber(value, 1500, animate);
  const styles = variantStyles[variant];

  const displayValue = loading ? 0 : animate ? animatedValue : value;

  const actualTrend = trend || (previousValue !== undefined
    ? value > previousValue
      ? 'up'
      : value < previousValue
      ? 'down'
      : 'neutral'
    : undefined);

  const actualTrendValue =
    trendValue !== undefined && previousValue !== undefined
      ? trendValue
      : previousValue !== undefined
      ? previousValue > 0
        ? ((value - previousValue) / previousValue) * 100
        : value > 0
        ? 100
        : 0
      : undefined;

  const TrendIcon = actualTrend === 'up' ? TrendingUp : actualTrend === 'down' ? TrendingDown : Minus;
  const trendColor =
    actualTrend === 'up'
      ? 'text-success-600'
      : actualTrend === 'down'
      ? 'text-danger-600'
      : 'text-slate-500';

  return (
    <div
      className={cn(
        'relative rounded-xl p-5 bg-white border border-slate-100 overflow-hidden transition-all duration-300',
        'hover:shadow-lg hover:-translate-y-0.5',
        glow && 'kpi-glow',
        className,
      )}
    >
      <div
        className={cn(
          'absolute inset-0 bg-gradient-to-br opacity-50',
          styles.gradient,
        )}
      />

      <div className="relative z-10">
        <div className="flex items-start justify-between mb-3">
          <h3 className="text-sm font-medium text-slate-600">{title}</h3>
          {icon && (
            <div
              className={cn(
                'w-10 h-10 rounded-lg flex items-center justify-center',
                styles.bg,
                styles.text,
              )}
            >
              {icon}
            </div>
          )}
        </div>

        {loading ? (
          <div className="space-y-2">
            <div className="h-8 w-2/3 bg-slate-200 rounded animate-pulse" />
            <div className="h-4 w-1/3 bg-slate-200 rounded animate-pulse" />
          </div>
        ) : (
          <>
            <div className="flex items-baseline gap-2">
              <span
                className={cn(
                  'text-3xl font-bold font-display number-rolling animate-number-roll',
                  styles.text,
                )}
              >
                {formatValue(displayValue, format, currency, decimals, unit)}
              </span>

              {actualTrend && actualTrendValue !== undefined && (
                <span className={cn('flex items-center gap-0.5 text-sm', trendColor)}>
                  <TrendIcon className="w-4 h-4" />
                  <span>{formatPercent(Math.abs(actualTrendValue), 1)}</span>
                </span>
              )}
            </div>

            {description && (
              <p className="mt-1 text-sm text-slate-500">{description}</p>
            )}

            {previousValue !== undefined && (
              <p className="mt-1 text-xs text-slate-400">
                上期：{formatValue(previousValue, format, currency, decimals, unit)}
              </p>
            )}
          </>
        )}

        {footer && <div className="mt-4 pt-4 border-t border-slate-100">{footer}</div>}
      </div>
    </div>
  );
}
