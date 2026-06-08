import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';

type LoadingType = 'spinner' | 'dots' | 'skeleton' | 'pulse';
type LoadingSize = 'sm' | 'md' | 'lg' | 'xl';

export interface LoadingProps {
  type?: LoadingType;
  size?: LoadingSize;
  text?: string;
  fullScreen?: boolean;
  overlay?: boolean;
  className?: string;
}

export default function Loading({
  type = 'spinner',
  size = 'md',
  text,
  fullScreen = false,
  overlay = false,
  className,
}: LoadingProps) {
  const sizeStyles: Record<LoadingSize, string> = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
    xl: 'w-12 h-12',
  };

  const textSizeStyles: Record<LoadingSize, string> = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base',
    xl: 'text-lg',
  };

  const containerStyles = cn(
    'flex flex-col items-center justify-center gap-3',
    fullScreen && 'fixed inset-0 z-50',
    overlay && 'bg-white/80 backdrop-blur-sm',
    className,
  );

  const renderSpinner = () => (
    <Loader2 className={cn(sizeStyles[size], 'text-primary-500 animate-spin')} />
  );

  const renderDots = () => (
    <div className="flex gap-1">
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className={cn(
            'bg-primary-500 rounded-full',
            size === 'sm' && 'w-1.5 h-1.5',
            size === 'md' && 'w-2 h-2',
            size === 'lg' && 'w-2.5 h-2.5',
            size === 'xl' && 'w-3 h-3',
          )}
          style={{
            animation: 'bounce 1.4s infinite ease-in-out both',
            animationDelay: `${i * 0.16}s`,
          }}
        />
      ))}
    </div>
  );

  const renderSkeleton = () => (
    <div className="w-full space-y-3">
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className={cn(
            'bg-slate-200 rounded animate-pulse',
            size === 'sm' && 'h-3',
            size === 'md' && 'h-4',
            size === 'lg' && 'h-5',
            size === 'xl' && 'h-6',
          )}
          style={{ width: `${Math.random() * 40 + 60}%` }}
        />
      ))}
    </div>
  );

  const renderPulse = () => (
    <div className="relative">
      <div className={cn(sizeStyles[size], 'bg-primary-500 rounded-full')} />
      <div
        className={cn(
          'absolute inset-0 bg-primary-500 rounded-full animate-ping opacity-50',
          sizeStyles[size],
        )}
      />
    </div>
  );

  const renderContent = () => {
    switch (type) {
      case 'spinner':
        return renderSpinner();
      case 'dots':
        return renderDots();
      case 'skeleton':
        return renderSkeleton();
      case 'pulse':
        return renderPulse();
      default:
        return renderSpinner();
    }
  };

  return (
    <div className={containerStyles}>
      {renderContent()}
      {text && (
        <span className={cn(textSizeStyles[size], 'text-slate-500')}>{text}</span>
      )}
      <style>{`
        @keyframes bounce {
          0%, 80%, 100% {
            transform: scale(0);
          }
          40% {
            transform: scale(1);
          }
        }
      `}</style>
    </div>
  );
}
