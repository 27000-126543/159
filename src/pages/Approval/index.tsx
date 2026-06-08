import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Clock,
  CheckCircle,
  Send,
  AlertTriangle,
  Check,
  X,
  Eye,
  FileText,
  ClipboardCheck,
  ChevronRight,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useApprovalStore, ApprovalItem } from '@/store/approvalStore';
import { useOrderStore } from '@/store/orderStore';
import { formatCurrency, formatDate, formatDateTime } from '@/utils/format';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Table, { TableColumn } from '@/components/ui/Table';
import StatusBadge from '@/components/business/StatusBadge';
import Badge from '@/components/ui/Badge';
import Modal from '@/components/ui/Modal';
import Input from '@/components/ui/Input';
import ApprovalFlow, { ApprovalNode } from '@/components/business/ApprovalFlow';
import Timeline from '@/components/business/Timeline';
import { Order, ApprovalRecord } from '@/mock/data/orders';

const tabs = [
  { key: 'pending', label: '待我审批', icon: Clock, status: 'pending' },
  { key: 'approved', label: '我已审批', icon: CheckCircle, status: 'approved' },
  { key: 'initiated', label: '我发起的', icon: Send, status: 'initiated' },
];

const getApprovalNodes = (order: Order): ApprovalNode[] => {
  const records = order.approvalRecords || [];
  const isLargeAmount = order.totalAmount > 100000;

  const baseNodes: ApprovalNode[] = [
    {
      id: 'create',
      title: '创建订单',
      role: '采购员',
      approver: order.buyerName,
      status: 'approved',
      comment: '订单信息无误，提交审批',
      approvedAt: order.createdAt,
    },
    {
      id: 'manager',
      title: '主管审批',
      role: '采购经理',
      approver: records.find(r => r.nodeName.includes('经理'))?.approverName,
      status: records.find(r => r.nodeName.includes('经理'))?.status === 'approved'
        ? 'approved'
        : order.currentApprovalNode?.includes('经理')
        ? 'current'
        : 'pending',
      comment: records.find(r => r.nodeName.includes('经理'))?.opinion,
      approvedAt: records.find(r => r.nodeName.includes('经理'))?.approvedAt,
    },
    {
      id: 'finance',
      title: '财务审批',
      role: '财务专员',
      approver: records.find(r => r.nodeName.includes('财务'))?.approverName,
      status: records.find(r => r.nodeName.includes('财务'))?.status === 'approved'
        ? 'approved'
        : order.currentApprovalNode?.includes('财务')
        ? 'current'
        : 'pending',
      comment: records.find(r => r.nodeName.includes('财务'))?.opinion,
      approvedAt: records.find(r => r.nodeName.includes('财务'))?.approvedAt,
    },
  ];

  if (isLargeAmount) {
    baseNodes.splice(3, 0, {
      id: 'ceo',
      title: '总经理审批',
      role: '总经理',
      approver: records.find(r => r.nodeName.includes('总经理') || r.nodeName.includes('CEO'))?.approverName,
      status: records.find(r => r.nodeName.includes('总经理') || r.nodeName.includes('CEO'))?.status === 'approved'
        ? 'approved'
        : order.currentApprovalNode?.includes('总经理') || order.currentApprovalNode?.includes('CEO')
        ? 'current'
        : 'pending',
      comment: records.find(r => r.nodeName.includes('总经理') || r.nodeName.includes('CEO'))?.opinion,
      approvedAt: records.find(r => r.nodeName.includes('总经理') || r.nodeName.includes('CEO'))?.approvedAt,
    });
  }

  baseNodes.push({
    id: 'complete',
    title: '订单下达',
    role: '系统',
    status: order.status === 'approved' || order.status === 'production' || order.status === 'shipping' || order.status === 'delivered' || order.status === 'completed'
      ? 'approved'
      : 'pending',
    approvedAt: order.status === 'approved' ? order.createdAt : undefined,
  });

  return baseNodes;
};

const getRemainingTime = (createdAt: string): { hours: number; isUrgent: boolean } => {
  const created = new Date(createdAt).getTime();
  const now = Date.now();
  const elapsed = now - created;
  const totalDeadline = 24 * 60 * 60 * 1000;
  const remaining = totalDeadline - elapsed;
  const hours = Math.max(0, Math.ceil(remaining / (60 * 60 * 1000)));
  return {
    hours,
    isUrgent: hours <= 4,
  };
};

const mapOrderStatus = (status: string): string => {
  const statusMap: Record<string, string> = {
    'draft': 'pending',
    'pending_approval': 'pending',
    'approved': 'approved',
    'rejected': 'rejected',
    'production': 'processing',
    'shipping': 'shipped',
    'delivered': 'delivered',
    'completed': 'completed',
    'cancelled': 'cancelled',
  };
  return statusMap[status] || status;
};

export default function ApprovalPage() {
  const navigate = useNavigate();
  const {
    pendingApprovals,
    approvedApprovals,
    rejectedApprovals,
    currentApproval,
    pendingCount,
    approvedCount,
    rejectedCount,
    loading,
    fetchPendingApprovals,
    fetchApprovedApprovals,
    fetchRejectedApprovals,
    fetchApprovalDetail,
    approve,
    reject,
    batchApprove,
    setCurrentApproval,
  } = useApprovalStore();
  const { currentOrder, fetchOrderById } = useOrderStore();

  const [activeTab, setActiveTab] = useState('pending');
  const [selectedRows, setSelectedRows] = useState<string[]>([]);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showQuickApproveModal, setShowQuickApproveModal] = useState(false);
  const [showBatchModal, setShowBatchModal] = useState(false);
  const [quickAction, setQuickAction] = useState<'approve' | 'reject'>('approve');
  const [opinion, setOpinion] = useState('');
  const [currentApprovalItem, setCurrentApprovalItem] = useState<ApprovalItem | null>(null);

  useEffect(() => {
    fetchPendingApprovals();
    fetchApprovedApprovals();
    fetchRejectedApprovals();
  }, []);

  const currentList = useMemo(() => {
    switch (activeTab) {
      case 'pending':
        return pendingApprovals;
      case 'approved':
        return approvedApprovals;
      case 'initiated':
        return [...approvedApprovals, ...rejectedApprovals];
      default:
        return pendingApprovals;
    }
  }, [activeTab, pendingApprovals, approvedApprovals, rejectedApprovals]);

  const handleTabChange = (key: string) => {
    setActiveTab(key);
    setSelectedRows([]);
  };

  const handleQuickAction = async () => {
    if (!currentApprovalItem) return;

    if (quickAction === 'approve') {
      await approve(currentApprovalItem.id, opinion);
    } else {
      await reject(currentApprovalItem.id, opinion);
    }

    setShowQuickApproveModal(false);
    setOpinion('');
    setCurrentApprovalItem(null);
  };

  const handleBatchAction = async () => {
    await batchApprove(selectedRows, opinion);
    setShowBatchModal(false);
    setOpinion('');
    setSelectedRows([]);
  };

  const handleViewDetail = async (item: ApprovalItem) => {
    await fetchApprovalDetail(item.id);
    await fetchOrderById(item.businessId);
    setCurrentApprovalItem(item);
    setShowDetailModal(true);
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedRows(currentList.map(a => a.id));
    } else {
      setSelectedRows([]);
    }
  };

  const handleSelectRow = (id: string, checked: boolean) => {
    if (checked) {
      setSelectedRows(prev => [...prev, id]);
    } else {
      setSelectedRows(prev => prev.filter(r => r !== id));
    }
  };

  const openQuickApprove = (item: ApprovalItem, action: 'approve' | 'reject') => {
    setCurrentApprovalItem(item);
    setQuickAction(action);
    setShowQuickApproveModal(true);
  };

  const columns: TableColumn<ApprovalItem>[] = [
    {
      key: 'select',
      title: activeTab === 'pending' ? (
        <input
          type="checkbox"
          checked={selectedRows.length === currentList.length && currentList.length > 0}
          onChange={(e) => handleSelectAll(e.target.checked)}
          className="w-4 h-4 rounded border-slate-300 text-primary-500 focus:ring-primary-500"
        />
      ) : '',
      width: 50,
      render: (_, record) => activeTab === 'pending' ? (
        <input
          type="checkbox"
          checked={selectedRows.includes(record.id)}
          onChange={(e) => handleSelectRow(record.id, e.target.checked)}
          onClick={(e) => e.stopPropagation()}
          className="w-4 h-4 rounded border-slate-300 text-primary-500 focus:ring-primary-500"
        />
      ) : null,
    },
    {
      key: 'code',
      title: '订单号',
      dataIndex: 'code',
      render: (value, record) => (
        <span className="font-medium text-primary-600">{value as string}</span>
      ),
    },
    {
      key: 'title',
      title: '申请类型',
      dataIndex: 'title',
      render: (value) => (
        <span className="text-slate-700">{value as string}</span>
      ),
    },
    {
      key: 'applicantName',
      title: '申请人',
      dataIndex: 'applicantName',
    },
    {
      key: 'applicantDepartment',
      title: '申请部门',
      dataIndex: 'applicantDepartment',
    },
    {
      key: 'amount',
      title: '申请金额',
      dataIndex: 'amount',
      align: 'right',
      render: (value, record) => (
        <span className={cn(
          'font-semibold',
          record.amount > 100000 ? 'text-warning-600' : 'text-slate-800'
        )}>
          {formatCurrency(value as number, record.currency)}
        </span>
      ),
    },
    {
      key: 'appliedAt',
      title: '申请时间',
      dataIndex: 'appliedAt',
      render: (value) => formatDateTime(value as string),
    },
    {
      key: 'remainingTime',
      title: '剩余时间',
      render: (_, record) => {
        const { hours, isUrgent } = getRemainingTime(record.appliedAt);
        return (
          <div className="flex items-center gap-2">
            {isUrgent && <AlertTriangle className="w-4 h-4 text-danger-500" />}
            <span className={cn(
              isUrgent ? 'text-danger-600 font-medium' : 'text-slate-600'
            )}>
              {hours > 0 ? `${hours}小时` : '已超时'}
            </span>
          </div>
        );
      },
    },
    {
      key: 'actions',
      title: '操作',
      width: 240,
      render: (_, record) => (
        <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
          <Button
            variant="ghost"
            size="sm"
            icon={<Eye className="w-4 h-4" />}
            onClick={() => handleViewDetail(record)}
          >
            详情
          </Button>
          {activeTab === 'pending' && (
            <>
              <Button
                variant="ghost"
                size="sm"
                icon={<Check className="w-4 h-4 text-success-500" />}
                onClick={() => openQuickApprove(record, 'approve')}
              >
                通过
              </Button>
              <Button
                variant="ghost"
                size="sm"
                icon={<X className="w-4 h-4 text-danger-500" />}
                onClick={() => openQuickApprove(record, 'reject')}
              >
                拒绝
              </Button>
            </>
          )}
        </div>
      ),
    },
  ];

  const approvalNodes = currentOrder ? getApprovalNodes(currentOrder) : [];

  const stats = [
    { ...tabs[0], count: pendingCount },
    { ...tabs[1], count: approvedCount },
    { ...tabs[2], count: approvedCount + rejectedCount },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900">审批中心</h1>
        {activeTab === 'pending' && selectedRows.length > 0 && (
          <div className="flex items-center gap-2">
            <span className="text-sm text-slate-500">
              已选择 {selectedRows.length} 项
            </span>
            <Button
              variant="success"
              size="sm"
              icon={<Check className="w-4 h-4" />}
              onClick={() => setShowBatchModal(true)}
            >
              批量通过
            </Button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {stats.map(tab => (
          <Card
            key={tab.key}
            hoverable
            className={cn(
              'cursor-pointer transition-all',
              activeTab === tab.key && 'ring-2 ring-primary-500 ring-offset-2'
            )}
            onClick={() => handleTabChange(tab.key)}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={cn(
                  'w-12 h-12 rounded-xl flex items-center justify-center',
                  tab.key === 'pending' ? 'bg-warning-50' :
                  tab.key === 'approved' ? 'bg-success-50' : 'bg-primary-50'
                )}>
                  <tab.icon className={cn(
                    'w-6 h-6',
                    tab.key === 'pending' ? 'text-warning-500' :
                    tab.key === 'approved' ? 'text-success-500' : 'text-primary-500'
                  )} />
                </div>
                <div>
                  <p className="text-sm text-slate-500">{tab.label}</p>
                  <p className="text-2xl font-bold text-slate-900">{tab.count}</p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-slate-300" />
            </div>
          </Card>
        ))}
      </div>

      <Card padding="none">
        <div className="flex items-center border-b border-slate-100">
          {tabs.map(tab => (
            <button
              key={tab.key}
              onClick={() => handleTabChange(tab.key)}
              className={cn(
                'px-6 py-4 text-sm font-medium transition-colors relative flex items-center gap-2',
                activeTab === tab.key
                  ? 'text-primary-600'
                  : 'text-slate-500 hover:text-slate-700'
              )}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
              <Badge
                variant={activeTab === tab.key ? 'primary' : 'default'}
                className="text-xs"
              >
                {tab.key === 'pending' ? pendingCount :
                 tab.key === 'approved' ? approvedCount :
                 approvedCount + rejectedCount}
              </Badge>
              {activeTab === tab.key && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-500" />
              )}
            </button>
          ))}
        </div>

        <div className="p-4">
          <Table
            columns={columns}
            dataSource={currentList}
            loading={loading}
            rowKey="id"
            onRowClick={(record) => handleViewDetail(record)}
            emptyText={activeTab === 'pending' ? '暂无待审批事项' : '暂无数据'}
          />
        </div>
      </Card>

      <Modal
        open={showQuickApproveModal}
        onClose={() => {
          setShowQuickApproveModal(false);
          setOpinion('');
          setCurrentApprovalItem(null);
        }}
        title={quickAction === 'approve' ? '审批通过' : '审批拒绝'}
        width="md"
        footer={
          <>
            <Button
              variant="secondary"
              onClick={() => {
                setShowQuickApproveModal(false);
                setOpinion('');
                setCurrentApprovalItem(null);
              }}
            >
              取消
            </Button>
            <Button
              variant={quickAction === 'approve' ? 'success' : 'danger'}
              onClick={handleQuickAction}
            >
              {quickAction === 'approve' ? '确认通过' : '确认拒绝'}
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <div className="p-4 bg-slate-50 rounded-lg">
            <div className="flex justify-between text-sm mb-2">
              <span className="text-slate-500">订单号</span>
              <span className="font-medium text-slate-700">{currentApprovalItem?.code}</span>
            </div>
            <div className="flex justify-between text-sm mb-2">
              <span className="text-slate-500">申请金额</span>
              <span className="font-semibold text-slate-900">
                {formatCurrency(currentApprovalItem?.amount || 0, currentApprovalItem?.currency || 'CNY')}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-500">当前节点</span>
              <Badge variant="primary" className="text-xs">{currentApprovalItem?.currentNode}</Badge>
            </div>
          </div>

          <Input
            label="审批意见"
            value={opinion}
            onChange={(e) => setOpinion(e.target.value)}
            placeholder={`请输入${quickAction === 'approve' ? '通过' : '拒绝'}意见...`}
          />

          {currentApprovalItem?.amount && currentApprovalItem.amount > 100000 && (
            <div className="flex items-start gap-2 p-3 bg-warning-50 rounded-lg">
              <AlertTriangle className="w-4 h-4 text-warning-500 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-warning-700">
                此订单金额超过10万，属于大额订单，审批后将自动进入总经理审批环节。
              </p>
            </div>
          )}

          {currentApprovalItem && getRemainingTime(currentApprovalItem.appliedAt).isUrgent && (
            <div className="flex items-start gap-2 p-3 bg-danger-50 rounded-lg">
              <AlertTriangle className="w-4 h-4 text-danger-500 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-danger-700">
                此审批已接近超时，根据规则超时未审批将自动越级。
              </p>
            </div>
          )}
        </div>
      </Modal>

      <Modal
        open={showBatchModal}
        onClose={() => {
          setShowBatchModal(false);
          setOpinion('');
        }}
        title="批量审批"
        width="md"
        footer={
          <>
            <Button
              variant="secondary"
              onClick={() => {
                setShowBatchModal(false);
                setOpinion('');
              }}
            >
              取消
            </Button>
            <Button
              variant="success"
              onClick={handleBatchAction}
            >
              确认批量通过
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <div className="p-4 bg-success-50 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle className="w-5 h-5 text-success-500" />
              <span className="font-medium text-success-800">
                批量通过 {selectedRows.length} 条审批
              </span>
            </div>
            <p className="text-sm text-success-600">
              请确认以上审批均符合要求，批量操作后将无法撤回。
            </p>
          </div>

          <Input
            label="审批意见"
            value={opinion}
            onChange={(e) => setOpinion(e.target.value)}
            placeholder="请输入审批意见（可选）"
          />
        </div>
      </Modal>

      <Modal
        open={showDetailModal}
        onClose={() => {
          setShowDetailModal(false);
          setCurrentApproval(null);
          setCurrentApprovalItem(null);
        }}
        title="审批详情"
        width="full"
        footer={activeTab === 'pending' && currentApprovalItem ? (
          <>
            <Button
              variant="secondary"
              onClick={() => {
                setShowDetailModal(false);
                setCurrentApproval(null);
                setCurrentApprovalItem(null);
              }}
            >
              取消
            </Button>
            <Button
              variant="danger"
              onClick={() => {
                setShowDetailModal(false);
                openQuickApprove(currentApprovalItem, 'reject');
              }}
            >
              拒绝
            </Button>
            <Button
              variant="success"
              onClick={() => {
                setShowDetailModal(false);
                openQuickApprove(currentApprovalItem, 'approve');
              }}
            >
              通过
            </Button>
          </>
        ) : true}
      >
        {currentApproval && currentOrder ? (
          <div className="space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-4 bg-slate-50 rounded-lg">
                <p className="text-sm text-slate-500">订单号</p>
                <p className="font-semibold text-slate-900">{currentApproval.code}</p>
              </div>
              <div className="p-4 bg-slate-50 rounded-lg">
                <p className="text-sm text-slate-500">申请金额</p>
                <p className={cn(
                  'font-bold text-lg',
                  currentApproval.amount > 100000 ? 'text-warning-600' : 'text-primary-600'
                )}>
                  {formatCurrency(currentApproval.amount, currentApproval.currency)}
                </p>
              </div>
              <div className="p-4 bg-slate-50 rounded-lg">
                <p className="text-sm text-slate-500">申请人</p>
                <p className="font-semibold text-slate-900">{currentApproval.applicantName}</p>
              </div>
              <div className="p-4 bg-slate-50 rounded-lg">
                <p className="text-sm text-slate-500">申请时间</p>
                <p className="font-semibold text-slate-900">{formatDateTime(currentApproval.appliedAt)}</p>
              </div>
            </div>

            <Card padding="lg">
              <h3 className="text-lg font-semibold text-slate-900 mb-4">订单信息</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-slate-500">供应商</span>
                  <span className="text-slate-700">{currentOrder.supplierName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">收货地址</span>
                  <span className="text-slate-700">{currentOrder.deliveryAddress}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">交货日期</span>
                  <span className="text-slate-700">{formatDate(currentOrder.expectedDeliveryDate)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">付款条款</span>
                  <span className="text-slate-700">{currentOrder.paymentTerms}</span>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-slate-100">
                <h4 className="font-medium text-slate-700 mb-2">商品明细</h4>
                <div className="space-y-2">
                  {currentOrder.items.slice(0, 3).map((item, index) => (
                    <div key={index} className="flex justify-between text-sm p-2 bg-slate-50 rounded">
                      <span className="text-slate-600">
                        {item.productName} x {item.quantity} {item.unit}
                      </span>
                      <span className="text-slate-700 font-medium">
                        {formatCurrency(item.totalPrice, item.currency)}
                      </span>
                    </div>
                  ))}
                  {currentOrder.items.length > 3 && (
                    <button
                      className="text-sm text-primary-600 hover:underline"
                      onClick={() => navigate(`/orders/${currentOrder.id}`)}
                    >
                      查看全部 {currentOrder.items.length} 项商品 →
                    </button>
                  )}
                </div>
              </div>
            </Card>

            <Card padding="lg">
              <h3 className="text-lg font-semibold text-slate-900 mb-4">审批流程</h3>
              <ApprovalFlow nodes={approvalNodes} direction="horizontal" />
            </Card>

            <Card padding="lg">
              <h3 className="text-lg font-semibold text-slate-900 mb-4">历史审批记录</h3>
              {currentOrder.approvalRecords && currentOrder.approvalRecords.length > 0 ? (
                <Timeline
                  items={currentOrder.approvalRecords.map((record: ApprovalRecord) => ({
                    id: record.id,
                    title: record.nodeName,
                    description: record.opinion,
                    time: record.approvedAt,
                    user: record.approverName,
                    status: record.status === 'approved' ? 'completed' : record.status === 'rejected' ? 'failed' : 'pending',
                    extra: (
                      <div className="flex items-center gap-2">
                        <Badge
                          variant={record.status === 'approved' ? 'success' : 'danger'}
                          className="text-xs"
                        >
                          {record.status === 'approved' ? '已通过' : '已驳回'}
                        </Badge>
                        <span className="text-xs text-slate-400">{record.approverRole}</span>
                      </div>
                    ),
                  }))}
                />
              ) : (
                <p className="text-sm text-slate-400 text-center py-8">暂无审批记录</p>
              )}
            </Card>

            {activeTab === 'pending' && (
              <Card padding="lg">
                <h3 className="text-lg font-semibold text-slate-900 mb-4">填写审批意见</h3>
                <Input
                  label="审批意见"
                  value={opinion}
                  onChange={(e) => setOpinion(e.target.value)}
                  placeholder="请输入审批意见..."
                />
              </Card>
            )}
          </div>
        ) : (
          <div className="flex items-center justify-center py-12">
            <div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
          </div>
        )}
      </Modal>
    </div>
  );
}
