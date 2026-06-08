import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Plus,
  Search,
  Filter,
  Download,
  LayoutGrid,
  List,
  Eye,
  XCircle,
  MessageSquare,
  AlertTriangle,
  ChevronRight,
  Check,
  Clock,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useOrderStore } from '@/store/orderStore';
import { formatCurrency, formatDate } from '@/utils/format';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Table, { TableColumn } from '@/components/ui/Table';
import StatusBadge from '@/components/business/StatusBadge';
import FilterPanel from '@/components/business/FilterPanel';
import Badge from '@/components/ui/Badge';
import Modal from '@/components/ui/Modal';
import Pagination from '@/components/business/Pagination';
import { Order } from '@/mock/data/orders';

const statusTabs = [
  { key: '', label: '全部', status: 'default' },
  { key: 'pending_approval', label: '待审批', status: 'warning' },
  { key: 'approved', label: '审批中', status: 'primary' },
  { key: 'production', label: '已批准', status: 'success' },
  { key: 'shipping', label: '已发货', status: 'primary' },
  { key: 'delivered', label: '已送达', status: 'success' },
  { key: 'completed', label: '已完成', status: 'success' },
  { key: 'cancelled', label: '已取消', status: 'default' },
];

const getApprovalProgress = (order: Order) => {
  const records = order.approvalRecords || [];
  const totalNodes = order.totalAmount > 100000 ? 4 : 3;
  const completedNodes = records.filter(r => r.status === 'approved').length;
  return {
    completed: completedNodes,
    total: totalNodes,
    percentage: Math.round((completedNodes / totalNodes) * 100),
  };
};

export default function OrdersPage() {
  const navigate = useNavigate();
  const { orders, total, page, pageSize, loading, fetchOrders, setFilterParams, updateOrderStatus } = useOrderStore();
  const [activeTab, setActiveTab] = useState('');
  const [viewMode, setViewMode] = useState<'list' | 'kanban'>('list');
  const [selectedRows, setSelectedRows] = useState<string[]>([]);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelOrder, setCancelOrder] = useState<Order | null>(null);

  useEffect(() => {
    fetchOrders({ status: activeTab || undefined, page: 1, pageSize: 10 });
  }, [activeTab]);

  const handleTabChange = (key: string) => {
    setActiveTab(key);
    setSelectedRows([]);
  };

  const handleFilter = (values: Record<string, unknown>) => {
    const params: Record<string, unknown> = { ...values, status: activeTab || undefined };
    if (values.dateRange) {
      const dr = values.dateRange as { start?: string; end?: string };
      params.startDate = dr.start;
      params.endDate = dr.end;
    }
    if (values.amountRange) {
      const ar = values.amountRange as { min?: number; max?: number };
      params.minAmount = ar.min;
      params.maxAmount = ar.max;
    }
    setFilterParams(params);
    fetchOrders(params);
  };

  const handleSearch = (keyword: string) => {
    fetchOrders({ keyword, status: activeTab || undefined });
  };

  const handleReset = () => {
    setFilterParams({});
    fetchOrders({ status: activeTab || undefined });
  };

  const handleCancelOrder = async () => {
    if (!cancelOrder) return;
    const result = await updateOrderStatus(cancelOrder.id, 'cancelled');
    if (result) {
      setShowCancelModal(false);
      setCancelOrder(null);
    }
  };

  const handlePageChange = (newPage: number) => {
    fetchOrders({ page: newPage, pageSize });
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedRows(orders.map(o => o.id));
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

  const handleBatchExport = () => {
    alert(`已选择 ${selectedRows.length} 条订单进行导出`);
  };

  const filterFields = [
    {
      key: 'supplierId',
      label: '供应商',
      type: 'select' as const,
      options: [
        { label: '深圳华为技术有限公司', value: 'S001' },
        { label: '索尼集团', value: 'S004' },
        { label: '西门子（中国）有限公司', value: 'S002' },
        { label: '三星电子', value: 'S005' },
        { label: '宝钢股份有限公司', value: 'S006' },
      ],
    },
    {
      key: 'category',
      label: '品类',
      type: 'select' as const,
      options: [
        { label: '电子元器件', value: '电子元器件' },
        { label: '机械设备', value: '机械设备' },
        { label: '原材料', value: '原材料' },
        { label: '其他', value: '其他' },
      ],
    },
    {
      key: 'dateRange',
      label: '创建日期',
      type: 'daterange' as const,
    },
    {
      key: 'minAmount',
      label: '最小金额',
      type: 'number' as const,
      placeholder: '请输入最小金额',
    },
    {
      key: 'maxAmount',
      label: '最大金额',
      type: 'number' as const,
      placeholder: '请输入最大金额',
    },
  ];

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

  const columns: TableColumn<Order>[] = [
    {
      key: 'select',
      title: (
        <input
          type="checkbox"
          checked={selectedRows.length === orders.length && orders.length > 0}
          onChange={(e) => handleSelectAll(e.target.checked)}
          className="w-4 h-4 rounded border-slate-300 text-primary-500 focus:ring-primary-500"
        />
      ),
      width: 50,
      render: (_, record) => (
        <input
          type="checkbox"
          checked={selectedRows.includes(record.id)}
          onChange={(e) => handleSelectRow(record.id, e.target.checked)}
          onClick={(e) => e.stopPropagation()}
          className="w-4 h-4 rounded border-slate-300 text-primary-500 focus:ring-primary-500"
        />
      ),
    },
    {
      key: 'code',
      title: '订单号',
      dataIndex: 'code',
      sortable: true,
      render: (value, record) => (
        <div className="flex items-center gap-2">
          <span className="font-medium text-primary-600 hover:underline cursor-pointer">
            {value as string}
          </span>
          {record.totalAmount > 100000 && (
            <Badge variant="warning" className="text-xs">
              <AlertTriangle className="w-3 h-3 mr-1" />
              大额
            </Badge>
          )}
        </div>
      ),
    },
    {
      key: 'supplierName',
      title: '供应商',
      dataIndex: 'supplierName',
    },
    {
      key: 'category',
      title: '品类',
      dataIndex: 'category',
      render: (value) => (
        <Badge variant="outline" className="bg-slate-50">
          {value as string}
        </Badge>
      ),
    },
    {
      key: 'totalAmount',
      title: '总金额',
      dataIndex: 'totalAmount',
      sortable: true,
      align: 'right',
      render: (value, record) => (
        <span className={cn(
          'font-semibold',
          record.totalAmount > 100000 ? 'text-warning-600' : 'text-slate-800'
        )}>
          {formatCurrency(value as number, record.currency)}
        </span>
      ),
    },
    {
      key: 'currency',
      title: '货币',
      dataIndex: 'currency',
      align: 'center',
    },
    {
      key: 'expectedDeliveryDate',
      title: '交货日期',
      dataIndex: 'expectedDeliveryDate',
      sortable: true,
      render: (value) => formatDate(value as string),
    },
    {
      key: 'status',
      title: '状态',
      dataIndex: 'status',
      render: (value, record) => (
        <StatusBadge type="order" status={mapOrderStatus(record.status)} />
      ),
    },
    {
      key: 'approvalProgress',
      title: '审批进度',
      render: (_, record) => {
        const progress = getApprovalProgress(record);
        return (
          <div className="flex items-center gap-2 min-w-[160px]">
            <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-primary-400 to-primary-600 rounded-full transition-all duration-500"
                style={{ width: `${progress.percentage}%` }}
              />
            </div>
            <span className="text-xs text-slate-500 whitespace-nowrap">
              {progress.completed}/{progress.total}
            </span>
          </div>
        );
      },
    },
    {
      key: 'createdAt',
      title: '创建时间',
      dataIndex: 'createdAt',
      sortable: true,
      render: (value) => formatDate(value as string),
    },
    {
      key: 'actions',
      title: '操作',
      width: 180,
      render: (_, record) => (
        <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
          <Button
            variant="ghost"
            size="sm"
            icon={<Eye className="w-4 h-4" />}
            onClick={() => navigate(`/orders/${record.id}`)}
          >
            详情
          </Button>
          {record.status === 'pending_approval' && (
            <Button
              variant="ghost"
              size="sm"
              icon={<XCircle className="w-4 h-4 text-danger-500" />}
              onClick={() => {
                setCancelOrder(record);
                setShowCancelModal(true);
              }}
            >
              取消
            </Button>
          )}
          <Button
            variant="ghost"
            size="sm"
            icon={<MessageSquare className="w-4 h-4" />}
            onClick={() => alert('跟进功能开发中')}
          >
            跟进
          </Button>
        </div>
      ),
    },
  ];

  const stats = useMemo(() => {
    return statusTabs.map(tab => {
      const count = tab.key
        ? orders.filter(o => o.status === tab.key).length
        : orders.length;
      return { ...tab, count };
    });
  }, [orders]);

  if (viewMode === 'kanban') {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className="text-2xl font-bold text-slate-900">采购订单</h1>
            <Button
              variant="primary"
              icon={<Plus className="w-4 h-4" />}
              onClick={() => alert('创建订单功能开发中')}
            >
              创建订单
            </Button>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              icon={<List className="w-4 h-4" />}
              onClick={() => setViewMode('list')}
            >
              列表
            </Button>
            <Button
              variant="primary"
              size="sm"
              icon={<LayoutGrid className="w-4 h-4" />}
              onClick={() => setViewMode('kanban')}
            >
              看板
            </Button>
          </div>
        </div>

        <FilterPanel
          fields={filterFields}
          onFilter={handleFilter}
          onReset={handleReset}
          onSearch={handleSearch}
          searchPlaceholder="搜索订单号、供应商名称..."
        />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {orders.map(order => (
            <Card
              key={order.id}
              hoverable
              className="cursor-pointer"
              onClick={() => navigate(`/orders/${order.id}`)}
            >
              <div className="space-y-4">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-slate-900">{order.code}</span>
                      {order.totalAmount > 100000 && (
                        <Badge variant="warning" className="text-xs">大额</Badge>
                      )}
                    </div>
                    <p className="text-sm text-slate-500 mt-1">{order.title}</p>
                  </div>
                  <StatusBadge type="order" status={mapOrderStatus(order.status)} />
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-500">供应商</span>
                    <span className="text-slate-700">{order.supplierName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">品类</span>
                    <span className="text-slate-700">{order.category}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">金额</span>
                    <span className={cn(
                      'font-semibold',
                      order.totalAmount > 100000 ? 'text-warning-600' : 'text-slate-800'
                    )}>
                      {formatCurrency(order.totalAmount, order.currency)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">交货日期</span>
                    <span className="text-slate-700">{formatDate(order.expectedDeliveryDate)}</span>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-slate-500">审批进度</span>
                    <span className="text-xs text-slate-500">
                      {getApprovalProgress(order).percentage}%
                    </span>
                  </div>
                  <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-primary-400 to-primary-600 rounded-full"
                      style={{ width: `${getApprovalProgress(order).percentage}%` }}
                    />
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h1 className="text-2xl font-bold text-slate-900">采购订单</h1>
          <Button
            variant="primary"
            icon={<Plus className="w-4 h-4" />}
            onClick={() => alert('创建订单功能开发中')}
          >
            创建订单
          </Button>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="primary"
            size="sm"
            icon={<List className="w-4 h-4" />}
            onClick={() => setViewMode('list')}
          >
            列表
          </Button>
          <Button
            variant="ghost"
            size="sm"
            icon={<LayoutGrid className="w-4 h-4" />}
            onClick={() => setViewMode('kanban')}
          >
            看板
          </Button>
        </div>
      </div>

      <FilterPanel
        fields={filterFields}
        onFilter={handleFilter}
        onReset={handleReset}
        onSearch={handleSearch}
        searchPlaceholder="搜索订单号、供应商名称..."
        extra={
          selectedRows.length > 0 && (
            <Button
              variant="outline"
              size="sm"
              icon={<Download className="w-4 h-4" />}
              onClick={handleBatchExport}
            >
              批量导出 ({selectedRows.length})
            </Button>
          )
        }
      />

      <Card padding="none">
        <div className="flex items-center border-b border-slate-100 overflow-x-auto">
          {stats.map(tab => (
            <button
              key={tab.key}
              onClick={() => handleTabChange(tab.key)}
              className={cn(
                'px-5 py-3 text-sm font-medium whitespace-nowrap transition-colors relative',
                activeTab === tab.key
                  ? 'text-primary-600'
                  : 'text-slate-500 hover:text-slate-700'
              )}
            >
              <span className="flex items-center gap-2">
                {tab.label}
                <Badge variant={activeTab === tab.key ? 'primary' : 'default'} className="text-xs">
                  {tab.count}
                </Badge>
              </span>
              {activeTab === tab.key && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-500" />
              )}
            </button>
          ))}
        </div>

        <div className="p-4">
          <Table
            columns={columns}
            dataSource={orders}
            loading={loading}
            rowKey="id"
            onRowClick={(record) => navigate(`/orders/${record.id}`)}
          />

          {total > pageSize && (
            <div className="mt-4 flex items-center justify-end">
              <Pagination
                current={page}
                pageSize={pageSize}
                total={total}
                onChange={handlePageChange}
              />
            </div>
          )}
        </div>
      </Card>

      <Modal
        open={showCancelModal}
        onClose={() => setShowCancelModal(false)}
        title="确认取消订单"
        footer={
          <>
            <Button variant="secondary" onClick={() => setShowCancelModal(false)}>
              取消
            </Button>
            <Button variant="danger" onClick={handleCancelOrder}>
              确认取消
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <div className="flex items-start gap-3 p-4 bg-warning-50 rounded-lg">
            <AlertTriangle className="w-5 h-5 text-warning-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-warning-800">确认取消此订单？</p>
              <p className="text-sm text-warning-600 mt-1">
                订单号：{cancelOrder?.code}
              </p>
              <p className="text-sm text-warning-600">
                取消后将无法恢复，请谨慎操作。
              </p>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
}
