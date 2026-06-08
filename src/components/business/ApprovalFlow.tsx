import { ReactNode } from 'react';
import { Check, Clock, X, User, ChevronRight, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatDateTime } from '@/utils/format';

export type ApprovalNodeStatus = 'pending' | 'approved' | 'rejected' | 'current' | 'skipped' | 'timeout';

export interface ApprovalNode {
  id: string;
  title: string;
  role: string;
  approver?: string;
  status: ApprovalNodeStatus;
  comment?: string;
  approvedAt?: Date | string;
  isEscalated?: boolean;
}

export interface ApprovalFlowProps {
  nodes: ApprovalNode[];
  showConnector?: boolean;
  className?: string;
  direction?: 'horizontal' | 'vertical';
}

const statusConfig: Record<
  ApprovalNodeStatus,
  {
    bg: string;
    border: string;
    icon: ReactNode;
    text: string;
  }
> = {
  pending: {
    bg: 'bg-slate-100',
    border: 'border-slate-200',
    icon: <Clock className="w-4 h-4 text-slate-400" />,
    text: '待审批',
  },
  approved: {
    bg: 'bg-success-500',
    border: 'border-success-500',
    icon: <Check className="w-4 h-4 text-white" />,
    text: '已通过',
  },
  rejected: {
    bg: 'bg-danger-500',
    border: 'border-danger-500',
    icon: <X className="w-4 h-4 text-white" />,
    text: '已驳回',
  },
  current: {
    bg: 'bg-primary-500',
    border: 'border-primary-500',
    icon: <User className="w-4 h-4 text-white" />,
    text: '审批中',
  },
  skipped: {
    bg: 'bg-slate-200',
    border: 'border-slate-300',
    icon: <ChevronRight className="w-4 h-4 text-slate-500" />,
    text: '已跳过',
  },
  timeout: {
    bg: 'bg-warning-500',
    border: 'border-warning-500',
    icon: <AlertTriangle className="w-4 h-4 text-white" />,
    text: '已超时',
  },
};

export default function ApprovalFlow({
  nodes,
  showConnector = true,
  className,
  direction = 'horizontal',
}: ApprovalFlowProps) {
  const isHorizontal = direction === 'horizontal';

  return (
    <div
      className={cn(
        'flex',
        isHorizontal ? 'flex-row items-start overflow-x-auto' : 'flex-col',
        'gap-0',
        className,
      )}
    >
      {nodes.map((node, index) => {
        const config = statusConfig[node.status];
        const isLast = index === nodes.length - 1;
        const isActive = node.status === 'current' || node.status === 'approved';

        return (
          <div
            key={node.id}
            className={cn(
              'relative flex',
              isHorizontal ? 'flex-row items-center' : 'flex-row items-start',
            )}
          >
            <div className={cn('flex flex-col items-center', isHorizontal ? 'min-w-[140px]' : '')}>
              <div
                className={cn(
                  'w-10 h-10 rounded-full flex items-center justify-center border-2',
                  config.bg,
                  config.border,
                  node.status === 'current' && 'animate-pulse-glow',
                )}
              >
                {config.icon}
              </div>

              <div className="mt-2 text-center">
                <div className="text-sm font-medium text-slate-800">{node.title}</div>
                <div className="text-xs text-slate-500 mt-0.5">{node.role}</div>
                {node.approver && (
                  <div className="text-xs text-slate-400 mt-0.5">{node.approver}</div>
                )}
                <div
                  className={cn(
                    'text-xs mt-1',
                    node.status === 'approved' && 'text-success-600',
                    node.status === 'rejected' && 'text-danger-600',
                    node.status === 'current' && 'text-primary-600',
                    node.status === 'timeout' && 'text-warning-600',
                    node.status === 'pending' && 'text-slate-500',
                    node.status === 'skipped' && 'text-slate-400',
                  )}
                >
                  {config.text}
                </div>
                {node.approvedAt && (
                  <div className="text-xs text-slate-400 mt-1">
                    {formatDateTime(node.approvedAt)}
                  </div>
                )}
                {node.isEscalated && (
                  <div className="text-xs text-warning-600 mt-1">已越级审批</div>
                )}
                {node.comment && (
                  <div className="text-xs text-slate-500 mt-1 max-w-[120px] truncate">
                    备注：{node.comment}
                  </div>
                )}
              </div>
            </div>

            {showConnector && !isLast && (
              <div
                className={cn(
                  'relative',
                  isHorizontal
                    ? 'w-12 h-0.5 mx-2 self-center mt-[-24px]'
                    : 'w-0.5 h-12 mx-5 self-start',
                )}
              >
                <div
                  className={cn(
                    'absolute inset-0',
                    isActive
                      ? 'bg-gradient-to-r from-success-500 to-primary-500'
                      : 'bg-slate-200',
                  )}
                />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
