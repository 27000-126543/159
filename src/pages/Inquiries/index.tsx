import { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Plus,
  LayoutList,
  LayoutGrid,
  Eye,
  Send,
  XCircle,
  Trash2,
  Calendar,
  Package,
  FileText,
  Clock,
  User,
} from 'lucide-react';
import { useInquiryStore, inquirySelectors } from '@/store/inquiryStore';
import { useUserStore } from '@/store/userStore';
import { Inquiry } from '@/mock/data/inquiries';
import Card from '@/components/ui/Card';
import Table, { TableColumn } from '@/components/ui/Table';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import FilterPanel, { FilterField } from '@/components/business/FilterPanel';
import Pagination from '@/components/business/Pagination';
import Modal from '@/components/ui/Modal';
import { formatCurrency, formatDate } from '@/utils/format';
import { cn } from '@/lib/utils';

type ViewMode = 'list' | 'kanban';

const statusTabs = [
  { key: '', label: '全部', color: 'default' as const },
  { key: 'draft', label: '草稿', color: 'default' as const },
  { key: 'published', label: '已发布', color: 'primary' as const },
  { key: 'quoting', label: '报价中', color: 'warning' as const },
  { key: 'negotiating', label: '议价中', color: 'primary' as const },
  { key: 'completed', label: '已完成', color: 'success' as const },
  { key: 'cancelled', label: '已关闭', color: 'danger' as const },
];

const getStatusBadge = (status: string) => {
  const config: Record<string, { variant: 'primary' | 'success' | 'warning' | 'danger' | 'default'; label: string }> = {
    draft: { variant: 'default', label: '草稿' },
    published: { variant: 'primary', label: '已发布' },
    quoting: { variant: 'warning', label: '报价中' },
    negotiating: { variant: 'primary', label: '议价中' },
    completed: { variant: 'success', label: '已完成' },
    cancelled: { variant: 'danger', label: '已关闭' },
  };
  const cfg = config[status] || config.draft;
  return <Badge variant={cfg.variant} dot>{cfg.label}</Badge>;
};

const filterFields: FilterField[] = [
  {
    key: 'category',
    label: '品类',
    type: 'select',
    options: [
      { label: '电子元器件', value: '电子元器件' },
      { label: '机械设备', value: '机械设备' },
      { label: '原材料', value: '原材料' },
    ],
  },
  {
    key: 'dateRange',
    label: '创建日期',
    type: 'daterange',
  },
];

export default function InquiriesPage() {
  const navigate = useNavigate();
  const { user } = useUserStore();
  const {
    fetchInquiries,
    publishInquiry,
    deleteInquiry,
    setFilterParams,
  } = useInquiryStore();

  const inquiries = useInquiryStore(inquirySelectors.selectInquiries);
  const total = useInquiryStore(inquirySelectors.selectTotal);
  const page = useInquiryStore(inquirySelectors.selectPage);
  const pageSize = useInquiryStore(inquirySelectors.selectPageSize);
  const loading = useInquiryStore(inquirySelectors.selectLoading);
  const filterParams = useInquiryStore(inquirySelectors.selectFilterParams);

  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [activeTab, setActiveTab] = useState('');
  const [sortField, setSortField] = useState<string | null>(null);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc' | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showPublishModal, setShowPublishModal] = useState(false);
  const [selectedInquiry, setSelectedInquiry] = useState<Inquiry | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  const loadInquiries = useCallback(() => {
    fetchInquiries({
      ...filterParams,
      status: activeTab || undefined,
      page,
      pageSize,
    });
  }, [fetchInquiries, filterParams, activeTab, page, pageSize]);

  useEffect(() => {
    loadInquiries();
  }, [activeTab, loadInquiries]);

  const handleSearch = (keyword: string) => {
    setFilterParams({ keyword });
    fetchInquiries({ ...filterParams, keyword, page: 1 });
  };

  const handleFilter = (values: Record<string, unknown>) => {
    const params: Record<string, unknown> = {};
    if (values.category) params.category = values.category as string;
    if (values.dateRange) {
      const range = values.dateRange as { start?: string; end?: string };
      if (range.start) params.startDate = range.start;
      if (range.end) params.endDate = range.end;
    }
    setFilterParams(params);
    fetchInquiries({ ...filterParams, ...params, page: 1 });
  };

  const handleReset = () => {
    setFilterParams({});
    fetchInquiries({ status: activeTab || undefined, page: 1, pageSize });
  };

  const handlePageChange = (newPage: number, newPageSize: number) => {
    fetchInquiries({
      ...filterParams,
      status: activeTab || undefined,
      page: newPage,
      pageSize: newPageSize,
    });
  };

  const handleSort = (key: string | number | symbol, direction: 'asc' | 'desc' | null) => {
    setSortField(key as string);
    setSortOrder(direction);
  };

  const handlePublish = async () => {
    if (!selectedInquiry) return;
    setActionLoading(true);
    try {
      const result = await publishInquiry(selectedInquiry.id);
      if (result) {
        loadInquiries();
        setShowPublishModal(false);
        setSelectedInquiry(null);
      }
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedInquiry) return;
    setActionLoading(true);
    try {
      const result = await deleteInquiry(selectedInquiry.id);
      if (result.success) {
        loadInquiries();
        setShowDeleteModal(false);
        setSelectedInquiry(null);
      }
    } finally {
      setActionLoading(false);
    }
  };

  const handleClose = async (inquiry: Inquiry) => {
    setSelectedInquiry(inquiry);
    setShowDeleteModal(true);
  };

  const columns: TableColumn<Inquiry>[] = [
    {
      key: 'code',
      title: '询价单号',
      dataIndex: 'code',
      width: 180,
      render: (_, record) => (
        <span className="font-mono text-sm text-primary-600 font-medium">{record.code}</span>
      ),
    },
    {
      key: 'title',
      title: '标题',
      dataIndex: 'title',
      sortable: true,
      render: (_, record) => (
        <div className="flex items-center gap-2">
          <FileText className="w-4 h-4 text-slate-400" />
          <span className="font-medium text-slate-800">{record.title}</span>
        </div>
      ),
    },
    {
      key: 'category',
      title: '品类',
      dataIndex: 'category',
      width: 120,
      render: (_, record) => (
        <Badge variant="default">{record.category}</Badge>
      ),
    },
    {
      key: 'quantity',
      title: '数量',
      dataIndex: 'items',
      width: 100,
      align: 'right',
      render: (_, record) => {
        const totalQty = record.items.reduce((sum, item) => sum + item.quantity, 0);
        return <span className="font-medium">{totalQty.toLocaleString()}</span>;
      },
    },
    {
      key: 'deadline',
      title: '截止日期',
      dataIndex: 'quotationDeadline',
      sortable: true,
      width: 130,
      render: (value) => (
        <div className="flex items-center gap-1">
          <Calendar className="w-3.5 h-3.5 text-slate-400" />
          <span>{formatDate(value as string)}</span>
        </div>
      ),
    },
    {
      key: 'quoteCount',
      title: '已报价数',
      dataIndex: 'quotes',
      width: 100,
      align: 'center',
      render: (_, record) => (
        <span className={cn(
          'font-semibold',
          record.quotes.length > 0 ? 'text-success-600' : 'text-slate-400'
        )}>
          {record.quotes.length}
        </span>
      ),
    },
    {
      key: 'status',
      title: '状态',
      dataIndex: 'status',
      width: 100,
      render: (value) => getStatusBadge(value as string),
    },
    {
      key: 'createdAt',
      title: '创建时间',
      dataIndex: 'createdAt',
      sortable: true,
      width: 160,
      render: (value) => formatDate(value as string, 'YYYY-MM-DD HH:mm'),
    },
    {
      key: 'actions',
      title: '操作',
      width: 200,
      align: 'center',
      render: (_, record) => (
        <div className="flex items-center justify-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            icon={<Eye className="w-4 h-4" />}
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/inquiries/${record.id}`);
            }}
          >
            查看
          </Button>
          {record.status === 'draft' && user?.role !== 'supplier' && (
            <Button
              variant="ghost"
              size="sm"
              icon={<Send className="w-4 h-4" />}
              className="text-primary-600"
              onClick={(e) => {
                e.stopPropagation();
                setSelectedInquiry(record);
                setShowPublishModal(true);
              }}
            >
              发布
            </Button>
          )}
          {record.status !== 'completed' && record.status !== 'cancelled' && user?.role !== 'supplier' && (
            <Button
              variant="ghost"
              size="sm"
              icon={<XCircle className="w-4 h-4" />}
              className="text-warning-600"
              onClick={(e) => {
                e.stopPropagation();
                handleClose(record);
              }}
            >
              关闭
            </Button>
          )}
          {record.status === 'draft' && user?.role !== 'supplier' && (
            <Button
              variant="ghost"
              size="sm"
              icon={<Trash2 className="w-4 h-4" />}
              className="text-danger-600"
              onClick={(e) => {
                e.stopPropagation();
                setSelectedInquiry(record);
                setShowDeleteModal(true);
              }}
            >
              删除
            </Button>
          )}
        </div>
      ),
    },
  ];

  const kanbanGroups = useMemo(() => {
    const groups: Record<string, Inquiry[]> = {};
    statusTabs.forEach(tab => {
      if (tab.key) {
        groups[tab.key] = inquiries.filter(i => i.status === tab.key);
      }
    });
    if (!activeTab) {
      groups['all'] = inquiries;
    }
    return groups;
  }, [inquiries, activeTab]);

  const renderKanbanCard = (inquiry: Inquiry) => (
    <Card
      key={inquiry.id}
      hoverable
      className="cursor-pointer mb-3"
      onClick={() => navigate(`/inquiries/${inquiry.id}`)}
    >
      <div className="flex items-start justify-between mb-3">
        <span className="font-mono text-xs text-primary-600 font-medium">{inquiry.code}</span>
        {getStatusBadge(inquiry.status)}
      </div>
      <h4 className="font-medium text-slate-800 mb-2 line-clamp-2">{inquiry.title}</h4>
      <div className="flex flex-wrap gap-2 mb-3">
        <Badge variant="default" size="sm">{inquiry.category}</Badge>
        {inquiry.quotes.length > 0 && (
          <Badge variant="success" size="sm">{inquiry.quotes.length} 家报价</Badge>
        )}
      </div>
      <div className="space-y-1.5 text-xs text-slate-500">
        <div className="flex items-center gap-1.5">
          <Package className="w-3.5 h-3.5" />
          <span>共 {inquiry.items.reduce((s, i) => s + i.quantity, 0).toLocaleString()} {inquiry.items[0]?.unit || '件'}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Clock className="w-3.5 h-3.5" />
          <span>截止：{formatDate(inquiry.quotationDeadline)}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <User className="w-3.5 h-3.5" />
          <span>{inquiry.requesterName}</span>
        </div>
      </div>
      {inquiry.totalTargetAmount > 0 && (
        <div className="mt-3 pt-3 border-t border-slate-100">
          <span className="text-sm font-semibold text-success-600">
            目标预算：{formatCurrency(inquiry.totalTargetAmount, inquiry.currency)}
          </span>
        </div>
      )}
    </Card>
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-800">询价单管理</h1>
        {user?.role !== 'supplier' && (
          <Button
            variant="primary"
            icon={<Plus className="w-4 h-4" />}
            onClick={() => {/* TODO: 跳转到创建页面 */}}
          >
            创建询价单
          </Button>
        )}
      </div>

      <FilterPanel
        fields={filterFields}
        onFilter={handleFilter}
        onReset={handleReset}
        onSearch={handleSearch}
        searchPlaceholder="搜索询价单号、标题..."
        extra={
          <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-lg">
            <button
              onClick={() => setViewMode('list')}
              className={cn(
                'p-2 rounded-md transition-all',
                viewMode === 'list'
                  ? 'bg-white shadow-sm text-primary-600'
                  : 'text-slate-400 hover:text-slate-600'
              )}
            >
              <LayoutList className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('kanban')}
              className={cn(
                'p-2 rounded-md transition-all',
                viewMode === 'kanban'
                  ? 'bg-white shadow-sm text-primary-600'
                  : 'text-slate-400 hover:text-slate-600'
              )}
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
          </div>
        }
      />

      <Card padding="none">
        <div className="flex items-center gap-1 p-2 border-b border-slate-100 overflow-x-auto">
          {statusTabs.map((tab) => {
            const count = tab.key
              ? inquiries.filter(i => i.status === tab.key).length
              : inquiries.length;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={cn(
                  'flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap',
                  activeTab === tab.key
                    ? 'bg-primary-50 text-primary-600'
                    : 'text-slate-500 hover:bg-slate-50'
                )}
              >
                {tab.label}
                <span className={cn(
                  'px-1.5 py-0.5 text-xs rounded-full',
                  activeTab === tab.key
                    ? 'bg-primary-100 text-primary-600'
                    : 'bg-slate-100 text-slate-500'
                )}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        <div className="p-5">
          {viewMode === 'list' ? (
            <>
              <Table<Inquiry>
                columns={columns}
                dataSource={inquiries}
                rowKey="id"
                loading={loading}
                sortField={sortField}
                sortOrder={sortOrder}
                onSort={handleSort}
                onRowClick={(record) => navigate(`/inquiries/${record.id}`)}
                emptyText="暂无询价单数据"
              />
              <div className="mt-4">
                <Pagination
                  current={page}
                  pageSize={pageSize}
                  total={total}
                  onChange={handlePageChange}
                />
              </div>
            </>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {Object.entries(kanbanGroups).map(([status, items]) => (
                items.length > 0 && (
                  <div key={status}>
                    <div className="flex items-center gap-2 mb-3">
                      <span className="font-medium text-slate-700">
                        {statusTabs.find(t => t.key === status)?.label || '全部'}
                      </span>
                      <span className="px-2 py-0.5 text-xs bg-slate-100 text-slate-600 rounded-full">
                        {items.length}
                      </span>
                    </div>
                    <div className="space-y-3">
                      {items.map(renderKanbanCard)}
                    </div>
                  </div>
                )
              ))}
            </div>
          )}
        </div>
      </Card>

      <Modal
        open={showPublishModal}
        onClose={() => {
          setShowPublishModal(false);
          setSelectedInquiry(null);
        }}
        title="确认发布询价单"
        width="md"
        footer={
          <>
            <Button
              variant="secondary"
              onClick={() => {
                setShowPublishModal(false);
                setSelectedInquiry(null);
              }}
            >
              取消
            </Button>
            <Button
              variant="primary"
              loading={actionLoading}
              onClick={handlePublish}
            >
              确认发布
            </Button>
          </>
        }
      >
        <div className="space-y-3">
          <p className="text-slate-600">
            确定要发布询价单 <span className="font-semibold text-primary-600">{selectedInquiry?.code}</span> 吗？
          </p>
          <p className="text-sm text-slate-500">
            发布后，供应商将可以看到该询价单并进行报价。
          </p>
        </div>
      </Modal>

      <Modal
        open={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setSelectedInquiry(null);
        }}
        title="确认操作"
        width="md"
        footer={
          <>
            <Button
              variant="secondary"
              onClick={() => {
                setShowDeleteModal(false);
                setSelectedInquiry(null);
              }}
            >
              取消
            </Button>
            <Button
              variant="danger"
              loading={actionLoading}
              onClick={handleDelete}
            >
              确认{selectedInquiry?.status === 'draft' ? '删除' : '关闭'}
            </Button>
          </>
        }
      >
        <div className="space-y-3">
          <p className="text-slate-600">
            确定要{selectedInquiry?.status === 'draft' ? '删除' : '关闭'}询价单{' '}
            <span className="font-semibold text-danger-600">{selectedInquiry?.code}</span> 吗？
          </p>
          {selectedInquiry?.status === 'draft' ? (
            <p className="text-sm text-slate-500">
              删除后将无法恢复，请谨慎操作。
            </p>
          ) : (
            <p className="text-sm text-slate-500">
              关闭后，供应商将无法再进行报价。
            </p>
          )}
        </div>
      </Modal>
    </div>
  );
}
