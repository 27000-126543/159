import Badge from '@/components/ui/Badge';
import { cn } from '@/lib/utils';

export type OrderStatus =
  | 'pending'
  | 'approved'
  | 'rejected'
  | 'processing'
  | 'shipped'
  | 'delivered'
  | 'completed'
  | 'cancelled';

export type ApprovalStatus =
  | 'pending'
  | 'approved'
  | 'rejected'
  | 'processing'
  | 'timeout'
  | 'escalated';

export type QualityStatus = 'pending' | 'passed' | 'failed' | 'reinspection';

export type PaymentStatus = 'unpaid' | 'partial' | 'paid' | 'overdue';

export type SupplierStatus = 'pending' | 'approved' | 'rejected' | 'suspended';

interface StatusConfig {
  label: string;
  variant: 'primary' | 'success' | 'warning' | 'danger' | 'default';
  dot?: boolean;
}

const orderStatusConfig: Record<OrderStatus, StatusConfig> = {
  pending: { label: '待审批', variant: 'warning', dot: true },
  approved: { label: '已审批', variant: 'success', dot: true },
  rejected: { label: '已拒绝', variant: 'danger', dot: true },
  processing: { label: '处理中', variant: 'primary', dot: true },
  shipped: { label: '已发货', variant: 'primary', dot: true },
  delivered: { label: '已到货', variant: 'success', dot: true },
  completed: { label: '已完成', variant: 'success', dot: true },
  cancelled: { label: '已取消', variant: 'default', dot: true },
};

const approvalStatusConfig: Record<ApprovalStatus, StatusConfig> = {
  pending: { label: '待审批', variant: 'warning', dot: true },
  approved: { label: '已通过', variant: 'success', dot: true },
  rejected: { label: '已驳回', variant: 'danger', dot: true },
  processing: { label: '审批中', variant: 'primary', dot: true },
  timeout: { label: '已超时', variant: 'danger', dot: true },
  escalated: { label: '已越级', variant: 'warning', dot: true },
};

const qualityStatusConfig: Record<QualityStatus, StatusConfig> = {
  pending: { label: '待质检', variant: 'warning', dot: true },
  passed: { label: '质检合格', variant: 'success', dot: true },
  failed: { label: '质检不合格', variant: 'danger', dot: true },
  reinspection: { label: '待复检', variant: 'primary', dot: true },
};

const paymentStatusConfig: Record<PaymentStatus, StatusConfig> = {
  unpaid: { label: '未付款', variant: 'danger', dot: true },
  partial: { label: '部分付款', variant: 'warning', dot: true },
  paid: { label: '已付款', variant: 'success', dot: true },
  overdue: { label: '已逾期', variant: 'danger', dot: true },
};

const supplierStatusConfig: Record<SupplierStatus, StatusConfig> = {
  pending: { label: '待审核', variant: 'warning', dot: true },
  approved: { label: '已入驻', variant: 'success', dot: true },
  rejected: { label: '已拒绝', variant: 'danger', dot: true },
  suspended: { label: '已暂停', variant: 'default', dot: true },
};

export interface StatusBadgeProps {
  type: 'order' | 'approval' | 'quality' | 'payment' | 'supplier';
  status: string;
  className?: string;
  showDot?: boolean;
}

export default function StatusBadge({
  type,
  status,
  className,
  showDot = true,
}: StatusBadgeProps) {
  let config: StatusConfig | undefined;

  switch (type) {
    case 'order':
      config = orderStatusConfig[status as OrderStatus];
      break;
    case 'approval':
      config = approvalStatusConfig[status as ApprovalStatus];
      break;
    case 'quality':
      config = qualityStatusConfig[status as QualityStatus];
      break;
    case 'payment':
      config = paymentStatusConfig[status as PaymentStatus];
      break;
    case 'supplier':
      config = supplierStatusConfig[status as SupplierStatus];
      break;
  }

  if (!config) {
    return (
      <Badge variant="default" className={className}>
        {status}
      </Badge>
    );
  }

  return (
    <Badge variant={config.variant} dot={showDot && config.dot} className={cn(className)}>
      {config.label}
    </Badge>
  );
}
