import { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { Check, Clock, X, Dot } from 'lucide-react';
import { formatDateTime } from '@/utils/format';

export type TimelineItemStatus = 'completed' | 'current' | 'pending' | 'failed';

export interface TimelineItem {
  id: string;
  title: string;
  description?: string;
  time?: Date | string;
  status?: TimelineItemStatus;
  user?: string;
  icon?: ReactNode;
  extra?: ReactNode;
}

export interface TimelineProps {
  items: TimelineItem[];
  className?: string;
  reverse?: boolean;
}

const statusConfig: Record<
  TimelineItemStatus,
  {
    bg: string;
    border: string;
    icon: ReactNode;
    line: string;
  }
> = {
  completed: {
    bg: 'bg-success-500',
    border: 'border-success-500',
    icon: <Check className="w-3 h-3 text-white" />,
    line: 'bg-success-500',
  },
  current: {
    bg: 'bg-primary-500',
    border: 'border-primary-500',
    icon: <Dot className="w-4 h-4 text-white fill-white" />,
    line: 'bg-primary-500',
  },
  pending: {
    bg: 'bg-slate-200',
    border: 'border-slate-300',
    icon: <Clock className="w-3 h-3 text-slate-500" />,
    line: 'bg-slate-200',
  },
  failed: {
    bg: 'bg-danger-500',
    border: 'border-danger-500',
    icon: <X className="w-3 h-3 text-white" />,
    line: 'bg-danger-500',
  },
};

export default function Timeline({ items, className, reverse = false }: TimelineProps) {
  const sortedItems = reverse ? [...items].reverse() : items;

  return (
    <div className={cn('relative', className)}>
      <div className="absolute left-[11px] top-0 bottom-0 w-0.5 bg-slate-200" />
      <div className="space-y-6">
        {sortedItems.map((item, index) => {
          const status = item.status || 'pending';
          const config = statusConfig[status];
          const isLast = index === sortedItems.length - 1;

          return (
            <div key={item.id} className="relative pl-8">
              <div
                className={cn(
                  'absolute left-0 w-6 h-6 rounded-full border-2 flex items-center justify-center',
                  config.bg,
                  config.border,
                  status === 'current' && 'animate-pulse-glow',
                )}
              >
                {item.icon || config.icon}
              </div>

              {!isLast && (
                <div
                  className={cn(
                    'absolute left-[11px] top-6 w-0.5 h-[calc(100%-24px)]',
                    status === 'completed' || status === 'current'
                      ? config.line
                      : 'bg-slate-200',
                  )}
                />
              )}

              <div className="pb-2">
                <div className="flex items-center justify-between gap-2">
                  <h4 className="text-sm font-medium text-slate-800">{item.title}</h4>
                  {item.time && (
                    <span className="text-xs text-slate-400 whitespace-nowrap">
                      {formatDateTime(item.time)}
                    </span>
                  )}
                </div>
                {item.description && (
                  <p className="mt-1 text-sm text-slate-500">{item.description}</p>
                )}
                {item.user && (
                  <p className="mt-1 text-xs text-slate-400">操作人：{item.user}</p>
                )}
                {item.extra && <div className="mt-2">{item.extra}</div>}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
