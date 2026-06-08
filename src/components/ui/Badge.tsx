import { HTMLAttributes, forwardRef, ReactNode } from 'react';
import { cn } from '@/lib/utils';

type BadgeVariant = 'primary' | 'success' | 'warning' | 'danger' | 'default' | 'outline' | 'secondary';

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
  dot?: boolean;
  icon?: ReactNode;
  size?: 'sm' | 'md' | 'lg';
}

const Badge = forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className, variant = 'default', dot = false, icon, size = 'md', children, ...props }, ref) => {
    const variantStyles: Record<BadgeVariant, string> = {
      primary: 'badge-primary',
      success: 'badge-success',
      warning: 'badge-warning',
      danger: 'badge-danger',
      default: 'bg-slate-100 text-slate-600 badge',
      outline: 'border border-slate-300 text-slate-600 bg-transparent',
      secondary: 'bg-slate-200 text-slate-700',
    };

    const dotColors: Record<BadgeVariant, string> = {
      primary: 'bg-primary-500',
      success: 'bg-success-500',
      warning: 'bg-warning-500',
      danger: 'bg-danger-500',
      default: 'bg-slate-400',
      outline: 'bg-slate-400',
      secondary: 'bg-slate-500',
    };

    const sizeStyles = {
      sm: 'text-xs px-1.5 py-0.5',
      md: 'text-xs px-2 py-0.5',
      lg: 'text-sm px-2.5 py-1',
    };

    return (
      <span ref={ref} className={cn(variantStyles[variant], sizeStyles[size], className)} {...props}>
        {dot && (
          <span
            className={cn(
              'w-1.5 h-1.5 rounded-full mr-1.5',
              dotColors[variant],
            )}
          />
        )}
        {icon && <span className="mr-1">{icon}</span>}
        {children}
      </span>
    );
  },
);

Badge.displayName = 'Badge';

export default Badge;
