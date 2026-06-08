import { useState, useEffect, useMemo } from 'react';
import {
  Search,
  LayoutGrid,
  List,
  Eye,
  FileText,
  Send,
  CreditCard,
  Download,
  FileCheck,
  Package,
  Globe,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  RefreshCw,
  Filter,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { customsService } from '@/mock/services/customsService';
import { Customs } from '@/mock/data/customs';
import { formatCurrency, formatDate, formatDateTime } from '@/utils/format';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Table, { TableColumn } from '@/components/ui/Table';
import StatusBadge from '@/components/business/StatusBadge';
import FilterPanel from '@/components/business/FilterPanel';
import Badge from '@/components/ui/Badge';
import Modal from '@/components/ui/Modal';
import Pagination from '@/components/business/Pagination';
import Timeline from '@/components/business/Timeline';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';

const statusTabs = [
  { key: '', label: '全部', status: 'default' },
  { key: 'draft', label: '草稿', status: 'default' },
  { key: 'submitted', label: '已申报', status: 'primary' },
  { key: 'under_review', label: '清关中', status: 'warning' },
  { key: 'tax_payment', label: '待缴税', status: 'warning' },
  { key: 'cleared', label: '已完成', status: 'success' },
];

const customsMethodOptions = [
  { label: '一般贸易', value: 'general_trade' },
  { label: '加工贸易', value: 'processing_trade' },
  { label: '保税', value: 'bonded' },
];

const customsTypeOptions = [
  { label: '进口', value: 'import' },
  { label: '出口', value: 'export' },
];

const getStatusConfig = (status: string) => {
  const config: Record<string, { label: string; variant: 'primary' | 'success' | 'warning' | 'danger' | 'default' }> = {
    draft: { label: '草稿', variant: 'default' },
    submitted: { label: '已申报', variant: 'primary' },
    under_review: { label: '审核中', variant: 'warning' },
    inspection: { label: '查验中', variant: 'warning' },
    tax_payment: { label: '待缴税', variant: 'warning' },
    cleared: { label: '已放行', variant: 'success' },
    rejected: { label: '被退回', variant: 'danger' },
    cancelled: { label: '已取消', variant: 'default' },
  };
  return config[status] || { label: status, variant: 'default' };
};

export default function CustomsPage() {
  const [customsList, setCustomsList] = useState<Customs[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('');
  const [viewMode, setViewMode] = useState<'list' | 'card'>('list');
  const [filterParams, setFilterParams] = useState<Record<string, unknown>>({});

  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedCustoms, setSelectedCustoms] = useState<Customs | null>(null);
  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [showTaxModal, setShowTaxModal] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [payingTax, setPayingTax] = useState(false);
  const [documentType, setDocumentType] = useState('declaration_form');

  const fetchCustomsList = async (params: Record<string, unknown> = {}) => {
    setLoading(true);
    try {
      const result = await customsService.getCustomsList({
        ...filterParams,
        ...params,
        status: activeTab || undefined,
        page,
        pageSize,
      });
      setCustomsList(result.list);
      setTotal(result.total);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomsList({ page: 1 });
  }, [activeTab]);

  const handleTabChange = (key: string) => {
    setActiveTab(key);
    setPage(1);
  };

  const handleFilter = (values: Record<string, unknown>) => {
    const params: Record<string, unknown> = { ...values };
    if (values.dateRange) {
      const dr = values.dateRange as { start?: string; end?: string };
      params.startDate = dr.start;
      params.endDate = dr.end;
    }
    setFilterParams(params);
    setPage(1);
    fetchCustomsList({ ...params, page: 1 });
  };

  const handleSearch = (keyword: string) => {
    setPage(1);
    fetchCustomsList({ keyword, page: 1 });
  };

  const handleReset = () => {
    setFilterParams({});
    setPage(1);
    fetchCustomsList({ page: 1 });
  };

  const handlePageChange = (newPage: number, newPageSize?: number) => {
    const size = newPageSize || pageSize;
    setPage(newPage);
    setPageSize(size);
    fetchCustomsList({ page: newPage, pageSize: size });
  };

  const handleViewDetail = (record: Customs) => {
    setSelectedCustoms(record);
    setShowDetailModal(true);
  };

  const handleGenerateDocument = async () => {
    if (!selectedCustoms) return;
    setGenerating(true);
    try {
      const result = await customsService.generateDocument({
        customsId: selectedCustoms.id,
        documentType: documentType as any,
      });
      if (result.success) {
        alert(result.message);
        setShowGenerateModal(false);
        fetchCustomsList();
      }
    } finally {
      setGenerating(false);
    }
  };

  const handleSubmitDeclaration = async () => {
    if (!selectedCustoms) return;
    setSubmitting(true);
    try {
      const result = await customsService.submitDeclaration(selectedCustoms.id);
      if (result) {
        alert('申报提交成功！');
        setShowSubmitModal(false);
        fetchCustomsList();
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handlePayTax = async () => {
    if (!selectedCustoms) return;
    setPayingTax(true);
    try {
      const result = await customsService.updateStatus(selectedCustoms.id, 'cleared');
      if (result) {
        alert('缴税成功！货物已放行。');
        setShowTaxModal(false);
        fetchCustomsList();
      }
    } finally {
      setPayingTax(false);
    }
  };

  const getTimelineItems = (customs: Customs) => {
    const items: Array<{ id: string; title: string; description?: string; time?: string; status: 'completed' | 'current' | 'pending' | 'failed' }> = [
      {
        id: '1',
        title: '创建报关单',
        time: customs.createdAt,
        status: 'completed',
      },
    ];

    if (customs.submittedAt) {
      items.push({
        id: '2',
        title: '提交申报',
        time: customs.submittedAt,
        status: 'completed',
      });
    }

    if (customs.status === 'under_review' || customs.status === 'inspection' || customs.status === 'tax_payment' || customs.status === 'cleared') {
      items.push({
        id: '3',
        title: '海关审核',
        status: customs.status === 'under_review' ? 'current' : 'completed',
      });
    }

    if (customs.inspections.length > 0 || customs.status === 'inspection' || customs.status === 'tax_payment' || customs.status === 'cleared') {
      const inspection = customs.inspections[0];
      items.push({
        id: '4',
        title: customs.status === 'rejected' ? '查验不通过' : '查验通过',
        description: inspection?.remarks,
        time: inspection?.inspectionDate,
        status: customs.status === 'rejected' ? 'failed' : customs.status === 'inspection' ? 'current' : 'completed',
      });
    }

    if (customs.status === 'tax_payment' || customs.status === 'cleared') {
      items.push({
        id: '5',
        title: '缴纳税费',
        status: customs.status === 'tax_payment' ? 'current' : 'completed',
      });
    }

    if (customs.clearedAt) {
      items.push({
        id: '6',
        title: '海关放行',
        time: customs.clearedAt,
        status: 'completed',
      });
    }

    return items;
  };

  const filterFields = [
    {
      key: 'status',
      label: '状态',
      type: 'select' as const,
      options: statusTabs.filter(t => t.key).map(t => ({ label: t.label, value: t.key })),
    },
    {
      key: 'customsMethod',
      label: '报关方式',
      type: 'select' as const,
      options: customsMethodOptions,
    },
    {
      key: 'customsType',
      label: '报关类型',
      type: 'select' as const,
      options: customsTypeOptions,
    },
    {
      key: 'dateRange',
      label: '创建日期',
      type: 'daterange' as const,
    },
  ];

  const columns: TableColumn<Customs>[] = [
    {
      key: 'code',
      title: '报关单号',
      dataIndex: 'code',
      sortable: true,
      render: (value) => (
        <span className="font-medium text-primary-600">{value as string}</span>
      ),
    },
    {
      key: 'orderCode',
      title: '关联订单号',
      dataIndex: 'orderCode',
    },
    {
      key: 'supplierName',
      title: '供应商',
      dataIndex: 'supplierName',
    },
    {
      key: 'goodsDescription',
      title: '商品描述',
      dataIndex: 'goodsDescription',
      render: (value) => (
        <div className="max-w-[200px] truncate" title={value as string}>
          {value as string}
        </div>
      ),
    },
    {
      key: 'totalAmount',
      title: '申报价值',
      dataIndex: 'totalAmount',
      sortable: true,
      align: 'right',
      render: (value, record) => formatCurrency(value as number, record.currency),
    },
    {
      key: 'currency',
      title: '货币',
      dataIndex: 'currency',
      align: 'center',
    },
    {
      key: 'originCountry',
      title: '原产国',
      dataIndex: 'originCountry',
    },
    {
      key: 'destinationCountry',
      title: '目的国',
      dataIndex: 'destinationCountry',
    },
    {
      key: 'status',
      title: '状态',
      dataIndex: 'status',
      render: (value) => {
        const config = getStatusConfig(value as string);
        return <Badge variant={config.variant} dot>{config.label}</Badge>;
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
      width: 220,
      render: (_, record) => (
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            icon={<Eye className="w-4 h-4" />}
            onClick={() => handleViewDetail(record)}
          >
            详情
          </Button>
          {record.status === 'draft' && (
            <>
              <Button
                variant="ghost"
                size="sm"
                icon={<FileText className="w-4 h-4" />}
                onClick={() => {
                  setSelectedCustoms(record);
                  setShowGenerateModal(true);
                }}
              >
                生成文件
              </Button>
              <Button
                variant="ghost"
                size="sm"
                icon={<Send className="w-4 h-4 text-primary-500" />}
                onClick={() => {
                  setSelectedCustoms(record);
                  setShowSubmitModal(true);
                }}
              >
                提交申报
              </Button>
            </>
          )}
          {record.status === 'tax_payment' && (
            <Button
              variant="ghost"
              size="sm"
              icon={<CreditCard className="w-4 h-4 text-warning-500" />}
              onClick={() => {
                setSelectedCustoms(record);
                setShowTaxModal(true);
              }}
            >
              缴税
            </Button>
          )}
          {record.documents.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              icon={<Download className="w-4 h-4" />}
              onClick={() => alert('查看文件功能开发中')}
            >
              文件
            </Button>
          )}
        </div>
      ),
    },
  ];

  const stats = useMemo(() => {
    return statusTabs.map(tab => {
      const count = tab.key
        ? customsList.filter(c => c.status === tab.key).length
        : customsList.length;
      return { ...tab, count };
    });
  }, [customsList]);

  if (viewMode === 'card') {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-slate-900">报关管理</h1>
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
              onClick={() => setViewMode('card')}
            >
              卡片
            </Button>
          </div>
        </div>

        <FilterPanel
          fields={filterFields}
          onFilter={handleFilter}
          onReset={handleReset}
          onSearch={handleSearch}
          searchPlaceholder="搜索报关单号、商品名称、HS编码..."
        />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {customsList.map(customs => (
            <Card
              key={customs.id}
              hoverable
              className="cursor-pointer"
              onClick={() => handleViewDetail(customs)}
            >
              <div className="space-y-4">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="font-semibold text-slate-900">{customs.code}</div>
                    <p className="text-sm text-slate-500 mt-1">{customs.goodsName}</p>
                  </div>
                  <Badge variant={getStatusConfig(customs.status).variant} dot>
                    {getStatusConfig(customs.status).label}
                  </Badge>
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-500">订单号</span>
                    <span className="text-slate-700">{customs.orderCode}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">供应商</span>
                    <span className="text-slate-700">{customs.supplierName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">申报价值</span>
                    <span className="font-semibold text-slate-800">
                      {formatCurrency(customs.totalAmount, customs.currency)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">税费合计</span>
                    <span className="font-semibold text-warning-600">
                      {formatCurrency(customs.totalTaxAmount, customs.currency)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">贸易方式</span>
                    <span className="text-slate-700">
                      {customsMethodOptions.find(o => o.value === customs.customsMethod)?.label}
                    </span>
                  </div>
                </div>

                {customs.hasIssue && (
                  <div className="p-3 bg-warning-50 rounded-lg">
                    <div className="flex items-start gap-2">
                      <AlertTriangle className="w-4 h-4 text-warning-500 flex-shrink-0 mt-0.5" />
                      <div className="text-sm text-warning-700">{customs.issueDescription}</div>
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                  <div className="flex items-center gap-1 text-xs text-slate-400">
                    <FileCheck className="w-3.5 h-3.5" />
                    <span>{customs.documents.length} 份文件</span>
                  </div>
                  <span className="text-xs text-slate-400">{formatDate(customs.createdAt)}</span>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {total > pageSize && (
          <div className="flex items-center justify-end">
            <Pagination
              current={page}
              pageSize={pageSize}
              total={total}
              onChange={handlePageChange}
            />
          </div>
        )}

        {renderDetailModal()}
        {renderGenerateModal()}
        {renderSubmitModal()}
        {renderTaxModal()}
      </div>
    );
  }

  function renderDetailModal() {
    if (!selectedCustoms) return null;
    return (
      <Modal
        open={showDetailModal}
        onClose={() => setShowDetailModal(false)}
        title="报关单详情"
        width="xl"
        footer={
          <div className="flex items-center justify-end gap-2">
            <Button variant="secondary" onClick={() => setShowDetailModal(false)}>
              关闭
            </Button>
            {selectedCustoms.status === 'draft' && (
              <>
                <Button
                  variant="primary"
                  icon={<FileText className="w-4 h-4" />}
                  onClick={() => {
                    setShowDetailModal(false);
                    setShowGenerateModal(true);
                  }}
                >
                  生成报关单
                </Button>
                <Button
                  variant="primary"
                  icon={<Send className="w-4 h-4" />}
                  onClick={() => {
                    setShowDetailModal(false);
                    setShowSubmitModal(true);
                  }}
                >
                  提交申报
                </Button>
              </>
            )}
            {selectedCustoms.status === 'tax_payment' && (
              <Button
                variant="primary"
                icon={<CreditCard className="w-4 h-4" />}
                onClick={() => {
                  setShowDetailModal(false);
                  setShowTaxModal(true);
                }}
              >
                立即缴税
              </Button>
            )}
          </div>
        }
      >
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-sm text-slate-500 mb-1">报关单号</div>
              <div className="font-semibold text-slate-900">{selectedCustoms.code}</div>
            </div>
            <div>
              <div className="text-sm text-slate-500 mb-1">关联订单号</div>
              <div className="font-medium text-slate-700">{selectedCustoms.orderCode}</div>
            </div>
            <div>
              <div className="text-sm text-slate-500 mb-1">供应商</div>
              <div className="font-medium text-slate-700">{selectedCustoms.supplierName}</div>
            </div>
            <div>
              <div className="text-sm text-slate-500 mb-1">状态</div>
              <Badge variant={getStatusConfig(selectedCustoms.status).variant} dot>
                {getStatusConfig(selectedCustoms.status).label}
              </Badge>
            </div>
          </div>

          <Card padding="sm">
            <div className="flex items-center gap-2 mb-3">
              <Package className="w-4 h-4 text-primary-500" />
              <span className="font-medium text-slate-800">商品信息</span>
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-slate-500">商品名称：</span>
                <span className="text-slate-700">{selectedCustoms.goodsName}</span>
              </div>
              <div>
                <span className="text-slate-500">HS编码：</span>
                <span className="text-slate-700 font-mono">{selectedCustoms.hsCode}</span>
              </div>
              <div>
                <span className="text-slate-500">数量：</span>
                <span className="text-slate-700">{selectedCustoms.quantity} {selectedCustoms.unit}</span>
              </div>
              <div>
                <span className="text-slate-500">申报价值：</span>
                <span className="text-slate-700 font-medium">{formatCurrency(selectedCustoms.totalAmount, selectedCustoms.currency)}</span>
              </div>
              <div>
                <span className="text-slate-500">商品描述：</span>
                <span className="text-slate-700">{selectedCustoms.goodsDescription}</span>
              </div>
            </div>
          </Card>

          <Card padding="sm">
            <div className="flex items-center gap-2 mb-3">
              <Globe className="w-4 h-4 text-primary-500" />
              <span className="font-medium text-slate-800">报关信息</span>
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-slate-500">贸易方式：</span>
                <span className="text-slate-700">{customsMethodOptions.find(o => o.value === selectedCustoms.customsMethod)?.label}</span>
              </div>
              <div>
                <span className="text-slate-500">报关类型：</span>
                <span className="text-slate-700">{customsTypeOptions.find(o => o.value === selectedCustoms.customsType)?.label}</span>
              </div>
              <div>
                <span className="text-slate-500">原产国：</span>
                <span className="text-slate-700">{selectedCustoms.originCountry}</span>
              </div>
              <div>
                <span className="text-slate-500">目的国：</span>
                <span className="text-slate-700">{selectedCustoms.destinationCountry}</span>
              </div>
              <div>
                <span className="text-slate-500">起运港：</span>
                <span className="text-slate-700">{selectedCustoms.portOfLoading}</span>
              </div>
              <div>
                <span className="text-slate-500">目的港：</span>
                <span className="text-slate-700">{selectedCustoms.portOfDischarge}</span>
              </div>
              <div>
                <span className="text-slate-500">报关行：</span>
                <span className="text-slate-700">{selectedCustoms.customsBroker}</span>
              </div>
              <div>
                <span className="text-slate-500">联系方式：</span>
                <span className="text-slate-700">{selectedCustoms.brokerContact}</span>
              </div>
            </div>
          </Card>

          <Card padding="sm">
            <div className="flex items-center gap-2 mb-3">
              <CreditCard className="w-4 h-4 text-warning-500" />
              <span className="font-medium text-slate-800">税费计算明细</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-200">
                    <th className="text-left py-2 px-3 font-medium text-slate-600">税费类型</th>
                    <th className="text-right py-2 px-3 font-medium text-slate-600">税率</th>
                    <th className="text-right py-2 px-3 font-medium text-slate-600">金额</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-slate-100">
                    <td className="py-2 px-3 text-slate-700">完税价格</td>
                    <td className="text-right py-2 px-3 text-slate-500">-</td>
                    <td className="text-right py-2 px-3 text-slate-700">{formatCurrency(selectedCustoms.totalAmount, selectedCustoms.currency)}</td>
                  </tr>
                  <tr className="border-b border-slate-100">
                    <td className="py-2 px-3 text-slate-700">进口关税</td>
                    <td className="text-right py-2 px-3 text-slate-500">{selectedCustoms.dutyRate}%</td>
                    <td className="text-right py-2 px-3 text-slate-700">{formatCurrency(selectedCustoms.dutyAmount, selectedCustoms.currency)}</td>
                  </tr>
                  <tr className="border-b border-slate-100">
                    <td className="py-2 px-3 text-slate-700">增值税</td>
                    <td className="text-right py-2 px-3 text-slate-500">{selectedCustoms.vatRate}%</td>
                    <td className="text-right py-2 px-3 text-slate-700">{formatCurrency(selectedCustoms.vatAmount, selectedCustoms.currency)}</td>
                  </tr>
                  <tr className="bg-slate-50">
                    <td className="py-2 px-3 font-semibold text-slate-800">税费合计</td>
                    <td className="text-right py-2 px-3 text-slate-500">-</td>
                    <td className="text-right py-2 px-3 font-semibold text-warning-600">{formatCurrency(selectedCustoms.totalTaxAmount, selectedCustoms.currency)}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </Card>

          <Card padding="sm">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-primary-500" />
                <span className="font-medium text-slate-800">报关文件</span>
              </div>
              {selectedCustoms.status === 'draft' && (
                <Button
                  variant="primary"
                  size="sm"
                  icon={<RefreshCw className="w-4 h-4" />}
                  onClick={() => {
                    setShowDetailModal(false);
                    setShowGenerateModal(true);
                  }}
                >
                  生成文件
                </Button>
              )}
            </div>
            {selectedCustoms.documents.length > 0 ? (
              <div className="space-y-2">
                {selectedCustoms.documents.map((doc, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-primary-100 rounded flex items-center justify-center">
                        <FileText className="w-4 h-4 text-primary-500" />
                      </div>
                      <div>
                        <div className="text-sm font-medium text-slate-700">{doc.name}</div>
                        <div className="text-xs text-slate-400">上传时间：{formatDateTime(doc.uploadedAt)}</div>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      icon={<Download className="w-4 h-4" />}
                    >
                      下载
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6 text-slate-400">
                <FileText className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>暂无报关文件</p>
              </div>
            )}
          </Card>

          <Card padding="sm">
            <div className="flex items-center gap-2 mb-4">
              <Clock className="w-4 h-4 text-primary-500" />
              <span className="font-medium text-slate-800">申报进度</span>
            </div>
            <Timeline items={getTimelineItems(selectedCustoms)} />
          </Card>

          {selectedCustoms.remarks && (
            <div className="p-4 bg-slate-50 rounded-lg">
              <div className="text-sm text-slate-500 mb-1">备注</div>
              <div className="text-sm text-slate-700">{selectedCustoms.remarks}</div>
            </div>
          )}
        </div>
      </Modal>
    );
  }

  function renderGenerateModal() {
    if (!selectedCustoms) return null;
    return (
      <Modal
        open={showGenerateModal}
        onClose={() => setShowGenerateModal(false)}
        title="生成报关文件"
        footer={
          <>
            <Button variant="secondary" onClick={() => setShowGenerateModal(false)}>
              取消
            </Button>
            <Button variant="primary" onClick={handleGenerateDocument} loading={generating} icon={<FileText className="w-4 h-4" />}>
              生成文件
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <div className="p-4 bg-primary-50 rounded-lg">
            <div className="text-sm text-primary-800">
              <div className="font-medium">报关单：{selectedCustoms.code}</div>
              <div className="mt-1">商品：{selectedCustoms.goodsName}</div>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">选择文件类型</label>
            <Select
              value={documentType}
              onChange={(e) => setDocumentType(e.target.value)}
              options={[
                { label: '报关单', value: 'declaration_form' },
                { label: '商业发票', value: 'commercial_invoice' },
                { label: '装箱单', value: 'packing_list' },
                { label: '原产地证书', value: 'certificate_of_origin' },
              ]}
            />
          </div>
          <div className="text-sm text-slate-500">
            <p>系统将根据报关单信息自动生成PDF文件，生成后可在文件列表中查看和下载。</p>
          </div>
        </div>
      </Modal>
    );
  }

  function renderSubmitModal() {
    if (!selectedCustoms) return null;
    return (
      <Modal
        open={showSubmitModal}
        onClose={() => setShowSubmitModal(false)}
        title="确认提交申报"
        footer={
          <>
            <Button variant="secondary" onClick={() => setShowSubmitModal(false)}>
              取消
            </Button>
            <Button variant="primary" onClick={handleSubmitDeclaration} loading={submitting} icon={<Send className="w-4 h-4" />}>
              确认提交
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <div className="flex items-start gap-3 p-4 bg-warning-50 rounded-lg">
            <AlertTriangle className="w-5 h-5 text-warning-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-warning-800">确认提交此报关单至海关？</p>
              <p className="text-sm text-warning-600 mt-1">报关单号：{selectedCustoms.code}</p>
              <p className="text-sm text-warning-600 mt-1">提交后将无法修改，请确保信息准确无误。</p>
            </div>
          </div>
          <div className="text-sm text-slate-600">
            <p className="font-medium mb-2">提交前请检查：</p>
            <ul className="list-disc list-inside space-y-1 text-slate-500">
              <li>商品信息、HS编码是否准确</li>
              <li>报关文件是否齐全</li>
              <li>税费计算是否正确</li>
            </ul>
          </div>
        </div>
      </Modal>
    );
  }

  function renderTaxModal() {
    if (!selectedCustoms) return null;
    return (
      <Modal
        open={showTaxModal}
        onClose={() => setShowTaxModal(false)}
        title="缴纳税费"
        footer={
          <>
            <Button variant="secondary" onClick={() => setShowTaxModal(false)}>
              取消
            </Button>
            <Button variant="primary" onClick={handlePayTax} loading={payingTax} icon={<CreditCard className="w-4 h-4" />}>
              确认缴税
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <div className="p-4 bg-warning-50 rounded-lg">
            <div className="text-center">
              <div className="text-sm text-warning-600 mb-1">待缴税费合计</div>
              <div className="text-3xl font-bold text-warning-600">
                {formatCurrency(selectedCustoms.totalTaxAmount, selectedCustoms.currency)}
              </div>
            </div>
          </div>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-slate-500">进口关税</span>
              <span className="text-slate-700">{formatCurrency(selectedCustoms.dutyAmount, selectedCustoms.currency)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">增值税</span>
              <span className="text-slate-700">{formatCurrency(selectedCustoms.vatAmount, selectedCustoms.currency)}</span>
            </div>
            <div className="flex justify-between pt-2 border-t border-slate-100">
              <span className="font-medium text-slate-700">合计</span>
              <span className="font-bold text-warning-600">{formatCurrency(selectedCustoms.totalTaxAmount, selectedCustoms.currency)}</span>
            </div>
          </div>
          {selectedCustoms.taxPaymentDeadline && (
            <div className="p-3 bg-slate-50 rounded-lg">
              <div className="flex items-center gap-2 text-sm">
                <Clock className="w-4 h-4 text-slate-400" />
                <span className="text-slate-500">缴税期限：</span>
                <span className="text-slate-700 font-medium">{formatDate(selectedCustoms.taxPaymentDeadline)}</span>
              </div>
            </div>
          )}
          <div className="text-sm text-slate-500">
            <p>确认缴税后，系统将自动完成税费扣除，并通知海关放行货物。</p>
          </div>
        </div>
      </Modal>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900">报关管理</h1>
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
            onClick={() => setViewMode('card')}
          >
            卡片
          </Button>
        </div>
      </div>

      <FilterPanel
        fields={filterFields}
        onFilter={handleFilter}
        onReset={handleReset}
        onSearch={handleSearch}
        searchPlaceholder="搜索报关单号、商品名称、HS编码..."
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
            dataSource={customsList}
            loading={loading}
            rowKey="id"
            onRowClick={(record) => handleViewDetail(record)}
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

      {renderDetailModal()}
      {renderGenerateModal()}
      {renderSubmitModal()}
      {renderTaxModal()}
    </div>
  );
}
