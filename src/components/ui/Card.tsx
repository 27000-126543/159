import { HTMLAttributes, forwardRef, ReactNode } from 'react';
import { cn } from '@/lib/utils';

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  hoverable?: boolean;
  glass?: boolean;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  header?: ReactNode;
  footer?: ReactNode;
}

const Card = forwardRef<HTMLDivElement, CardProps>(
  (
    {
      className,
      hoverable = false,
      glass = false,
      padding = 'md',
      header,
      footer,
      children,
      ...props
    },
    ref,
  ) => {
    const paddingStyles: Record<string, string> = {
      none: '',
      sm: 'p-3',
      md: 'p-5',
      lg: 'p-7',
    };

    return (
      <div
        ref={ref}
        className={cn(
          glass ? 'card-glass' : 'card',
          hoverable && 'hover:-translate-y-1 hover:shadow-xl transition-all duration-300',
          className,
        )}
        {...props}
      >
        {header && (
          <div className={cn('border-b border-slate-100', paddingStyles[padding])}>
            {header}
          </div>
        )}
        <div className={paddingStyles[padding]}>{children}</div>
        {footer && (
          <div className={cn('border-t border-slate-100', paddingStyles[padding])}>
            {footer}
          </div>
        )}
      </div>
    );
  },
);

Card.displayName = 'Card';

export default Card;
