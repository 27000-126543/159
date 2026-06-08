import { cn } from '@/lib/utils';

type StatusType = 'success' | 'warning' | 'danger' | 'primary' | 'default' | 'info';

export interface StatusDotProps {
  status?: StatusType;
  pulse?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export default function StatusDot({
  status = 'default',
  pulse = false,
  size = 'md',
  className,
}: StatusDotProps) {
  const colorStyles: Record<StatusType, string> = {
    success: 'bg-success-500',
    warning: 'bg-warning-500',
    danger: 'bg-danger-500',
    primary: 'bg-primary-500',
    default: 'bg-slate-400',
    info: 'bg-sky-500',
  };

  const sizeStyles: Record<string, string> = {
    sm: 'w-1.5 h-1.5',
    md: 'w-2 h-2',
    lg: 'w-3 h-3',
  };

  return (
    <span className="relative inline-flex">
      <span
        className={cn(
          'status-dot',
          colorStyles[status],
          sizeStyles[size],
          className,
        )}
      />
      {pulse && (
        <span
          className={cn(
            'absolute inline-flex h-full w-full rounded-full opacity-75',
            colorStyles[status],
            'animate-ping',
          )}
        />
      )}
    </span>
  );
}
