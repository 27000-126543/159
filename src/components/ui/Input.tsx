import { InputHTMLAttributes, forwardRef, ReactNode } from 'react';
import { cn } from '@/lib/utils';

export interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'prefix'> {
  label?: string;
  error?: string;
  prefixIcon?: ReactNode;
  suffixIcon?: ReactNode;
  wrapperClassName?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className,
      label,
      error,
      prefixIcon,
      suffixIcon,
      wrapperClassName,
      id,
      ...props
    },
    ref,
  ) => {
    const inputId = id || `input-${Math.random().toString(36).slice(2)}`;

    return (
      <div className={cn('w-full', wrapperClassName)}>
        {label && (
          <label
            htmlFor={inputId}
            className="block text-sm font-medium text-slate-700 mb-1.5"
          >
            {label}
          </label>
        )}
        <div className="relative">
          {prefixIcon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
              {prefixIcon}
            </div>
          )}
          <input
            ref={ref}
            id={inputId}
            className={cn(
              'input-field',
              prefixIcon && 'pl-10',
              suffixIcon && 'pr-10',
              error && 'border-danger-500 focus:ring-danger-500/20 focus:border-danger-500',
              className,
            )}
            {...props}
          />
          {suffixIcon && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
              {suffixIcon}
            </div>
          )}
        </div>
        {error && <p className="mt-1 text-sm text-danger-500">{error}</p>}
      </div>
    );
  },
);

Input.displayName = 'Input';

export default Input;
