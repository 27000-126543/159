import { useState, useEffect, useMemo } from 'react';
import {
  Eye,
  CheckCircle,
  Download,
  FileText,
  CreditCard,
  AlertTriangle,
  DollarSign,
  TrendingUp,
  Clock,
  PauseCircle,
  PlayCircle,
  Edit,
  X,
  Plus,
  History,
  AlertCircle,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useSettlementStore } from '@/store/settlementStore';
import { formatCurrency, formatDate } from '@/utils/format';
import { isOverdue } from '@/utils/date';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Table, { TableColumn } from '@/components/ui/Table';
import StatusBadge from '@/components/business/StatusBadge';
import FilterPanel from '@/components/business/FilterPanel';
import Badge from '@/components/ui/Badge';
import Modal from '@/components/ui/Modal';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Pagination from '@/components/business/Pagination';
import KpiCard from '@/components/business/KpiCard';
import { Statement, CreditInfo } from '@/store/settlementStore';
import { Settlement } from '@/mock/data/settlement';

const settlementTabs = [
  { key: 'statement', label: '对账单', icon: <FileText className="w-4 h-4" /> },
  { key: 'settlement', label: '结算单', icon: <DollarSign className="w-4 h-4" /> },
  { key: 'payment', label: '付款记录', icon: <CreditCard className="w-4 h-4" /> },
  { key: 'credit', label: '信用管理', icon: <TrendingUp className="w-4 h-4" /> },
];

const getStatementStatusBadge = (status: string) => {
  const config: Record<string, { label: string; variant: 'primary' | 'success' | 'warning' | 'danger' | 'default' }> = {
    pending: { label: '待确认', variant: 'warning' },
    confirmed: { label: '已确认', variant: 'success' },
    partial: { label: '部分确认', variant: 'primary' },
  };
  const cfg = config[status] || config.pending;
  return <Badge variant={cfg.variant} dot>{cfg.label}</Badge>;
};

const getSettlementStatusBadge = (status: string) => {
  const config: Record<string, { label: string; variant: 'primary' | 'success' | 'warning' | 'danger' | 'default' }> = {
    draft: { label: '待确认', variant: 'warning' },
    verifying: { label: '已确认', variant: 'primary' },
    accounting: { label: '部分付款', variant: 'warning' },
    completed: { label: '已付款', variant: 'success' },
    rejected: { label: '已驳回', variant: 'danger' },
  };
  const cfg = config[status] || config.draft;
  return <Badge variant={cfg.variant} dot>{cfg.label}</Badge>;
};

const getCreditStatusBadge = (status: string) => {
  const config: Record<string, { label: string; variant: 'primary' | 'success' | 'warning' | 'danger' | 'default' }> = {
    normal: { label: '正常', variant: 'success' },
    warning: { label: '警告', variant: 'warning' },
    frozen: { label: '冻结', variant: 'danger' },
  };
  const cfg = config[status] || config.normal;
  return <Badge variant={cfg.variant} dot>{cfg.label}</Badge>;
};

export default function SettlementPage() {
  const {
    statements,
    settlements,
    payments,
    creditList,
    total,
    page,
    pageSize,
    loading,
    currentStatement,
    currentSettlement,
    statistics,
    fetchStatements,
    fetchSettlements,
    fetchPayments,
    fetchCreditList,
    fetchStatistics,
    fetchStatementById,
    fetchSettlementById,
    confirmStatement,
    createSettlementFromStatement,
    registerPayment,
    adjustCreditLimit,
    adjustCreditPeriod,
    suspendSupplier,
    resumeSupplier,
    exportStatement,
    exportPayments,
    setCurrentStatement,
    setCurrentSettlement,
  } = useSettlementStore();

  const [activeTab, setActiveTab] = useState('statement');
  const [showStatementModal, setShowStatementModal] = useState(false);
  const [showSettlementModal, setShowSettlementModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showCreditModal, setShowCreditModal] = useState(false);
  const [showCreditHistoryModal, setShowCreditHistoryModal] = useState(false);
  const [currentCredit, setCurrentCredit] = useState<CreditInfo | null>(null);
  const [paymentForm, setPaymentForm] = useState({
    amount: '',
    paymentDate: new Date().toISOString().split('T')[0],
    paymentMethod: '银行转账',
    referenceNo: '',
  });
  const [creditForm, setCreditForm] = useState({
    creditLimit: '',
    creditPeriod: '',
    adjustType: 'limit',
  });

  useEffect(() => {
    fetchStatistics();
  }, []);

  useEffect(() => {
    switch (activeTab) {
      case 'statement':
        fetchStatements();
        break;
      case 'settlement':
        fetchSettlements();
        break;
      case 'payment':
        fetchPayments();
        break;
      case 'credit':
        fetchCreditList();
        break;
    }
  }, [activeTab]);

  const handleViewStatement = async (statement: Statement) => {
    await fetchStatementById(statement.id);
    setShowStatementModal(true);
  };

  const handleConfirmStatement = async (id: string) => {
    const result = await confirmStatement(id);
    if (result.success) {
      setShowStatementModal(false);
      fetchStatements();
    }
  };

  const handleCreateSettlement = async (statementId: string) => {
    const result = await createSettlementFromStatement(statementId);
    if (result) {
      setShowStatementModal(false);
      setActiveTab('settlement');
    }
  };

  const handleViewSettlement = async (settlement: Settlement) => {
    await fetchSettlementById(settlement.id);
    setShowSettlementModal(true);
  };

  const handleRegisterPayment = () => {
    setPaymentForm({
      amount: currentSettlement?.unpaidAmount.toString() || '',
      paymentDate: new Date().toISOString().split('T')[0],
      paymentMethod: '银行转账',
      referenceNo: '',
    });
    setShowPaymentModal(true);
  };

  const handleSubmitPayment = async () => {
    if (!currentSettlement) return;
    const result = await registerPayment(currentSettlement.id, {
      amount: parseFloat(paymentForm.amount),
      paymentDate: paymentForm.paymentDate,
      paymentMethod: paymentForm.paymentMethod,
      referenceNo: paymentForm.referenceNo,
    });
    if (result.success) {
      setShowPaymentModal(false);
      fetchSettlements();
      fetchPayments();
      fetchSettlementById(currentSettlement.id);
    }
  };

  const handleSuspendSupplier = async (supplierId: string) => {
    await suspendSupplier(supplierId);
    fetchCreditList();
  };

  const handleResumeSupplier = async (supplierId: string) => {
    await resumeSupplier(supplierId);
    fetchCreditList();
  };

  const handleAdjustCredit = (credit: CreditInfo, type: 'limit' | 'period') => {
    setCurrentCredit(credit);
    setCreditForm({
      creditLimit: credit.creditLimit.toString(),
      creditPeriod: credit.creditPeriod.toString(),
      adjustType: type,
    });
    setShowCreditModal(true);
  };

  const handleSubmitCreditAdjust = async () => {
    if (!currentCredit) return;
    if (creditForm.adjustType === 'limit') {
      await adjustCreditLimit(currentCredit.supplierId, parseFloat(creditForm.creditLimit));
    } else {
      await adjustCreditPeriod(currentCredit.supplierId, parseInt(creditForm.creditPeriod));
    }
    setShowCreditModal(false);
    fetchCreditList();
  };

  const handleViewCreditHistory = (credit: CreditInfo) => {
    setCurrentCredit(credit);
    setShowCreditHistoryModal(true);
  };

  const handleFilter = (values: Record<string, unknown>) => {
    const params: Record<string, unknown> = {};
    if (values.supplierId) params.supplierId = values.supplierId;
    if (values.status) params.status = values.status;
    if (values.overdue) params.overdue = values.overdue;
    if (values.dateRange) {
      const dr = values.dateRange as { start?: string; end?: string };
      params.startDate = dr.start;
      params.endDate = dr.end;
    }
    switch (activeTab) {
      case 'statement':
        fetchStatements(params);
        break;
      case 'settlement':
        fetchSettlements(params);
        break;
      case 'payment':
        fetchPayments(params);
        break;
      case 'credit':
        fetchCreditList(params);
        break;
    }
  };

  const handleSearch = (keyword: string) => {
    fetchStatements({ keyword });
  };

  const handlePageChange = (newPage: number) => {
    fetchSettlements({ page: newPage, pageSize });
  };

  const filterFields = useMemo(() => [
    {
      key: 'supplierId',
      label: '供应商',
      type: 'select' as const,
      options: [
        { label: '深圳华为技术有限公司', value: 'S001' },
        { label: '德国西门子股份公司', value: 'S004' },
        { label: '日本三菱电机株式会社', value: 'S005' },
        { label: '鞍钢股份有限公司', value: 'S012' },
        { label: '瑞士ABB集团', value: 'S014' },
      ],
    },
    {
      key: 'dateRange',
      label: '日期范围',
      type: 'daterange' as const,
    },
    ...(activeTab !== 'payment' && activeTab !== 'credit' ? [{
      key: 'status',
      label: '状态',
      type: 'select' as const,
      options: activeTab === 'statement' ? [
        { label: '待确认', value: 'pending' },
        { label: '已确认', value: 'confirmed' },
        { label: '部分确认', value: 'partial' },
      ] : [
        { label: '待确认', value: 'draft' },
        { label: '已确认', value: 'verifying' },
        { label: '部分付款', value: 'accounting' },
        { label: '已付款', value: 'completed' },
        { label: '已超期', value: 'overdue' },
      ],
    }] : []),
    ...(activeTab === 'settlement' ? [{
      key: 'overdue',
      label: '超期过滤',
      type: 'select' as const,
      options: [
        { label: '全部', value: '' },
        { label: '仅显示超期', value: 'true' },
        { label: '排除超期', value: 'false' },
      ],
    }] : []),
  ], [activeTab]);

  const statementColumns: TableColumn<Statement>[] = [
    {
      key: 'statementNo',
      title: '对账单号',
      dataIndex: 'statementNo',
      sortable: true,
      render: (value) => <span className="font-medium text-primary-600">{value as string}</span>,
    },
    {
      key: 'supplierName',
      title: '供应商',
      dataIndex: 'supplierName',
    },
    {
      key: 'periodStart',
      title: '账期开始',
      dataIndex: 'periodStart',
      sortable: true,
      render: (value) => formatDate(value as string),
    },
    {
      key: 'periodEnd',
      title: '账期结束',
      dataIndex: 'periodEnd',
      sortable: true,
      render: (value) => formatDate(value as string),
    },
    {
      key: 'orderCount',
      title: '订单数量',
      dataIndex: 'orderCount',
      align: 'center',
    },
    {
      key: 'totalAmount',
      title: '总金额',
      dataIndex: 'totalAmount',
      sortable: true,
      align: 'right',
      render: (value) => <span className="font-semibold">{formatCurrency(value as number)}</span>,
    },
    {
      key: 'confirmedAmount',
      title: '已确认金额',
      dataIndex: 'confirmedAmount',
      align: 'right',
      render: (value) => formatCurrency(value as number),
    },
    {
      key: 'pendingAmount',
      title: '待确认金额',
      dataIndex: 'pendingAmount',
      align: 'right',
      render: (value) => <span className={value as number > 0 ? 'text-warning-600' : ''}>{formatCurrency(value as number)}</span>,
    },
    {
      key: 'status',
      title: '状态',
      dataIndex: 'status',
      render: (value) => getStatementStatusBadge(value as string),
    },
    {
      key: 'actions',
      title: '操作',
      width: 240,
      render: (_, record) => (
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            icon={<Eye className="w-4 h-4" />}
            onClick={() => handleViewStatement(record)}
          >
            查看明细
          </Button>
          {record.status === 'pending' && (
            <Button
              variant="ghost"
              size="sm"
              icon={<CheckCircle className="w-4 h-4 text-success-500" />}
              onClick={() => handleConfirmStatement(record.id)}
            >
              确认对账
            </Button>
          )}
          <Button
            variant="ghost"
            size="sm"
            icon={<Download className="w-4 h-4" />}
            onClick={() => exportStatement(record.id)}
          >
            导出
          </Button>
        </div>
      ),
    },
  ];

  const settlementColumns: TableColumn<Settlement>[] = [
    {
      key: 'code',
      title: '结算单号',
      dataIndex: 'code',
      sortable: true,
      render: (value, record) => (
        <div className="flex items-center gap-2">
          <span className="font-medium text-primary-600">{value as string}</span>
          {isOverdue(record.creditDueDate) && record.unpaidAmount > 0 && (
            <Badge variant="danger">超期</Badge>
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
      key: 'period',
      title: '账期',
      render: (_, record) => `${formatDate(record.creditStartDate)} - ${formatDate(record.creditDueDate)}`,
    },
    {
      key: 'grandTotal',
      title: '总金额',
      dataIndex: 'grandTotal',
      sortable: true,
      align: 'right',
      render: (value, record) => <span className="font-semibold">{formatCurrency(value as number, record.currency)}</span>,
    },
    {
      key: 'paidAmount',
      title: '已付金额',
      dataIndex: 'paidAmount',
      align: 'right',
      render: (value, record) => formatCurrency(value as number, record.currency),
    },
    {
      key: 'unpaidAmount',
      title: '未付金额',
      dataIndex: 'unpaidAmount',
      align: 'right',
      render: (value, record) => (
        <span className={value as number > 0 ? 'text-danger-600' : 'text-success-600'}>
          {formatCurrency(value as number, record.currency)}
        </span>
      ),
    },
    {
      key: 'creditDueDate',
      title: '到期日',
      dataIndex: 'creditDueDate',
      sortable: true,
      render: (value, record) => {
        const overdue = isOverdue(value as string) && record.unpaidAmount > 0;
        return (
          <span className={overdue ? 'text-danger-600 font-medium' : ''}>
            {formatDate(value as string)}
          </span>
        );
      },
    },
    {
      key: 'status',
      title: '状态',
      dataIndex: 'status',
      render: (value, record) => {
        if (isOverdue(record.creditDueDate) && record.unpaidAmount > 0) {
          return <Badge variant="danger" dot>已超期</Badge>;
        }
        return getSettlementStatusBadge(value as string);
      },
    },
    {
      key: 'actions',
      title: '操作',
      width: 280,
      render: (_, record) => {
        const overdue = isOverdue(record.creditDueDate) && record.unpaidAmount > 0;
        const creditInfo = creditList.find(c => c.supplierId === record.supplierId);
        return (
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              icon={<Eye className="w-4 h-4" />}
              onClick={() => handleViewSettlement(record)}
            >
              查看详情
            </Button>
            {record.unpaidAmount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                icon={<CreditCard className="w-4 h-4 text-primary-500" />}
                onClick={() => {
                  fetchSettlementById(record.id);
                  setTimeout(() => handleRegisterPayment(), 300);
                }}
              >
                登记付款
              </Button>
            )}
            {overdue && creditInfo?.status !== 'frozen' && (
              <Button
                variant="ghost"
                size="sm"
                icon={<PauseCircle className="w-4 h-4 text-danger-500" />}
                onClick={() => handleSuspendSupplier(record.supplierId)}
              >
                暂停供货
              </Button>
            )}
            {creditInfo?.status === 'frozen' && (
              <Button
                variant="ghost"
                size="sm"
                icon={<PlayCircle className="w-4 h-4 text-success-500" />}
                onClick={() => handleResumeSupplier(record.supplierId)}
              >
                恢复供货
              </Button>
            )}
          </div>
        );
      },
    },
  ];

  const paymentColumns: TableColumn<any>[] = [
    {
      key: 'id',
      title: '付款单号',
      dataIndex: 'id',
      sortable: true,
      render: (value) => <span className="font-medium text-primary-600">{value as string}</span>,
    },
    {
      key: 'settlementId',
      title: '关联结算单',
      dataIndex: 'settlementId',
      render: (value) => {
        const settlement = settlements.find(s => s.id === value);
        return <span>{settlement?.code || String(value)}</span>;
      },
    },
    {
      key: 'supplierName',
      title: '供应商',
      render: (_, record) => {
        const settlement = settlements.find(s => s.id === record.settlementId);
        return <span>{settlement?.supplierName || '-'}</span>;
      },
    },
    {
      key: 'amount',
      title: '付款金额',
      dataIndex: 'amount',
      sortable: true,
      align: 'right',
      render: (value) => <span className="font-semibold">{formatCurrency(value as number)}</span>,
    },
    {
      key: 'paymentDate',
      title: '付款日期',
      dataIndex: 'paymentDate',
      sortable: true,
      render: (value) => formatDate(value as string),
    },
    {
      key: 'paymentMethod',
      title: '付款方式',
      dataIndex: 'paymentMethod',
    },
    {
      key: 'referenceNo',
      title: '参考号',
      dataIndex: 'referenceNo',
    },
    {
      key: 'actions',
      title: '操作',
      width: 120,
      render: (_, record) => (
        <Button
          variant="ghost"
          size="sm"
          icon={<Eye className="w-4 h-4" />}
          onClick={() => alert(`查看付款单 ${record.id} 详情`)}
        >
          详情
        </Button>
      ),
    },
  ];

  const creditColumns: TableColumn<CreditInfo>[] = [
    {
      key: 'supplierName',
      title: '供应商名称',
      dataIndex: 'supplierName',
    },
    {
      key: 'creditLimit',
      title: '信用额度',
      dataIndex: 'creditLimit',
      sortable: true,
      align: 'right',
      render: (value) => formatCurrency(value as number),
    },
    {
      key: 'usedCredit',
      title: '已用额度',
      dataIndex: 'usedCredit',
      align: 'right',
      render: (value, record) => {
        const ratio = (value as number) / record.creditLimit;
        return (
          <div className="space-y-1">
            <span>{formatCurrency(value as number)}</span>
            <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
              <div
                className={cn(
                  'h-full rounded-full transition-all',
                  ratio > 0.9 ? 'bg-danger-500' : ratio > 0.7 ? 'bg-warning-500' : 'bg-success-500'
                )}
                style={{ width: `${Math.min(ratio * 100, 100)}%` }}
              />
            </div>
          </div>
        );
      },
    },
    {
      key: 'availableCredit',
      title: '可用额度',
      dataIndex: 'availableCredit',
      align: 'right',
      render: (value, record) => {
        const warning = (value as number) < record.creditLimit * 0.1;
        return (
          <span className={warning ? 'text-warning-600 font-medium' : ''}>
            {formatCurrency(value as number)}
            {warning && <AlertTriangle className="w-4 h-4 inline ml-1" />}
          </span>
        );
      },
    },
    {
      key: 'creditPeriod',
      title: '信用期(天)',
      dataIndex: 'creditPeriod',
      align: 'center',
    },
    {
      key: 'overdueAmount',
      title: '当前逾期金额',
      dataIndex: 'overdueAmount',
      align: 'right',
      render: (value) => (
        <span className={value as number > 0 ? 'text-danger-600 font-medium' : ''}>
          {formatCurrency(value as number)}
          {(value as number) > 0 && <AlertCircle className="w-4 h-4 inline ml-1" />}
        </span>
      ),
    },
    {
      key: 'overdueCount',
      title: '逾期次数',
      dataIndex: 'overdueCount',
      align: 'center',
      render: (value) => (
        <span className={value as number > 0 ? 'text-danger-600' : ''}>
          {value as number}
        </span>
      ),
    },
    {
      key: 'status',
      title: '信用状态',
      dataIndex: 'status',
      render: (value) => getCreditStatusBadge(value as string),
    },
    {
      key: 'actions',
      title: '操作',
      width: 280,
      render: (_, record) => (
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            icon={<Edit className="w-4 h-4" />}
            onClick={() => handleAdjustCredit(record, 'limit')}
          >
            调整额度
          </Button>
          <Button
            variant="ghost"
            size="sm"
            icon={<Clock className="w-4 h-4" />}
            onClick={() => handleAdjustCredit(record, 'period')}
          >
            调整信用期
          </Button>
          <Button
            variant="ghost"
            size="sm"
            icon={<History className="w-4 h-4" />}
            onClick={() => handleViewCreditHistory(record)}
          >
            信用历史
          </Button>
        </div>
      ),
    },
  ];

  const getCurrentColumns = () => {
    switch (activeTab) {
      case 'statement': return statementColumns;
      case 'settlement': return settlementColumns;
      case 'payment': return paymentColumns;
      case 'credit': return creditColumns;
      default: return [];
    }
  };

  const getCurrentDataSource = () => {
    switch (activeTab) {
      case 'statement': return statements;
      case 'settlement': return settlements;
      case 'payment': return payments;
      case 'credit': return creditList;
      default: return [];
    }
  };

  const getRowClassName = (record: any) => {
    if (activeTab === 'settlement') {
      if (isOverdue(record.creditDueDate) && record.unpaidAmount > 0) {
        return 'bg-danger-50/50';
      }
    }
    return '';
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900">结算中心</h1>
        {activeTab === 'payment' && (
          <Button
            variant="outline"
            icon={<Download className="w-4 h-4" />}
            onClick={exportPayments}
          >
            导出付款记录
          </Button>
        )}
      </div>

      {statistics && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <KpiCard
            title="应付总额"
            value={statistics.totalAmount || 0}
            format="currency"
            trend={statistics.totalAmount > 0 ? 'up' : 'neutral'}
            icon={<DollarSign className="w-5 h-5" />}
            variant="primary"
          />
          <KpiCard
            title="已付金额"
            value={statistics.paidAmount || 0}
            format="currency"
            trend={statistics.paidAmount > 0 ? 'up' : 'neutral'}
            icon={<CheckCircle className="w-5 h-5" />}
            variant="success"
          />
          <KpiCard
            title="未付金额"
            value={statistics.unpaidAmount || 0}
            format="currency"
            trend={statistics.unpaidAmount > 0 ? 'down' : 'neutral'}
            icon={<Clock className="w-5 h-5" />}
            variant="warning"
          />
          <KpiCard
            title="逾期金额"
            value={statistics.overdueAmount || 0}
            format="currency"
            trend={statistics.overdueAmount > 0 ? 'up' : 'neutral'}
            icon={<AlertTriangle className="w-5 h-5" />}
            variant="danger"
          />
        </div>
      )}

      <Card padding="none">
        <div className="flex items-center border-b border-slate-100 overflow-x-auto">
          {settlementTabs.map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={cn(
                'px-6 py-4 text-sm font-medium whitespace-nowrap transition-colors relative flex items-center gap-2',
                activeTab === tab.key
                  ? 'text-primary-600'
                  : 'text-slate-500 hover:text-slate-700'
              )}
            >
              {tab.icon}
              {tab.label}
              {activeTab === tab.key && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-500" />
              )}
            </button>
          ))}
        </div>

        <div className="p-4">
          <FilterPanel
            fields={filterFields}
            onFilter={handleFilter}
            onReset={() => handleFilter({})}
            onSearch={handleSearch}
            searchPlaceholder={`搜索${activeTab === 'statement' ? '对账单号、供应商' : activeTab === 'settlement' ? '结算单号、供应商' : activeTab === 'payment' ? '付款单号、参考号' : '供应商名称'}...`}
          />
        </div>

        <div className="px-4 pb-4">
          <Table
            columns={getCurrentColumns() as any[]}
            dataSource={getCurrentDataSource() as any[]}
            loading={loading}
            rowKey="id"
            rowClassName={getRowClassName as any}
            size="small"
          />

          {activeTab === 'settlement' && total > pageSize && (
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
        open={showStatementModal}
        onClose={() => setShowStatementModal(false)}
        title="对账单详情"
        width="xl"
        footer={
          currentStatement && (
            <>
              <Button variant="secondary" onClick={() => setShowStatementModal(false)}>
                关闭
              </Button>
              {currentStatement.status === 'pending' && (
                <Button
                  variant="primary"
                  icon={<CheckCircle className="w-4 h-4" />}
                  onClick={() => handleConfirmStatement(currentStatement.id)}
                >
                  确认对账
                </Button>
              )}
              {currentStatement.status === 'confirmed' && (
                <Button
                  variant="primary"
                  icon={<Plus className="w-4 h-4" />}
                  onClick={() => handleCreateSettlement(currentStatement.id)}
                >
                  生成结算单
                </Button>
              )}
            </>
          )
        }
      >
        {currentStatement && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <p className="text-sm text-slate-500">对账单号</p>
                <p className="font-medium text-slate-900">{currentStatement.statementNo}</p>
              </div>
              <div>
                <p className="text-sm text-slate-500">供应商</p>
                <p className="font-medium text-slate-900">{currentStatement.supplierName}</p>
              </div>
              <div>
                <p className="text-sm text-slate-500">账期开始</p>
                <p className="font-medium text-slate-900">{formatDate(currentStatement.periodStart)}</p>
              </div>
              <div>
                <p className="text-sm text-slate-500">账期结束</p>
                <p className="font-medium text-slate-900">{formatDate(currentStatement.periodEnd)}</p>
              </div>
            </div>

            <div>
              <h4 className="font-medium text-slate-900 mb-3">订单明细</h4>
              <Table
                columns={[
                  { key: 'orderNo', title: '订单号', dataIndex: 'orderNo' },
                  { key: 'orderDate', title: '日期', dataIndex: 'orderDate', render: (v) => formatDate(v as string) },
                  { key: 'amount', title: '金额', dataIndex: 'amount', align: 'right', render: (v) => formatCurrency(v as number) },
                  { key: 'status', title: '状态', dataIndex: 'status', render: (v) => <StatusBadge type="order" status={v as string} /> },
                ]}
                dataSource={currentStatement.orders}
                rowKey="id"
                size="small"
              />
            </div>

            <div className="bg-slate-50 rounded-lg p-4">
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <p className="text-sm text-slate-500">总金额</p>
                  <p className="text-xl font-bold text-slate-900">{formatCurrency(currentStatement.totalAmount)}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-500">已确认金额</p>
                  <p className="text-xl font-bold text-success-600">{formatCurrency(currentStatement.confirmedAmount)}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-500">待确认金额</p>
                  <p className="text-xl font-bold text-warning-600">{formatCurrency(currentStatement.pendingAmount)}</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </Modal>

      <Modal
        open={showSettlementModal}
        onClose={() => setShowSettlementModal(false)}
        title="结算单详情"
        width="xl"
        footer={
          currentSettlement && (
            <>
              <Button variant="secondary" onClick={() => setShowSettlementModal(false)}>
                关闭
              </Button>
              {currentSettlement.unpaidAmount > 0 && (
                <Button
                  variant="primary"
                  icon={<CreditCard className="w-4 h-4" />}
                  onClick={handleRegisterPayment}
                >
                  登记付款
                </Button>
              )}
            </>
          )
        }
      >
        {currentSettlement && (
          <div className="space-y-6">
            {isOverdue(currentSettlement.creditDueDate) && currentSettlement.unpaidAmount > 0 && (
              <div className="p-4 bg-danger-50 border border-danger-200 rounded-lg flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-danger-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-danger-800">警告：此结算单已超信用期</p>
                  <p className="text-sm text-danger-600 mt-1">
                    到期日：{formatDate(currentSettlement.creditDueDate)}，请尽快安排付款，否则将自动暂停供货。
                  </p>
                </div>
              </div>
            )}

            <div className="p-4 bg-primary-50 border border-primary-200 rounded-lg">
              <p className="text-sm text-primary-600">
                <Clock className="w-4 h-4 inline mr-1" />
                信用期：{currentSettlement.creditPeriod}天，到期日：{formatDate(currentSettlement.creditDueDate)}
              </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <p className="text-sm text-slate-500">结算单号</p>
                <p className="font-medium text-slate-900">{currentSettlement.code}</p>
              </div>
              <div>
                <p className="text-sm text-slate-500">供应商</p>
                <p className="font-medium text-slate-900">{currentSettlement.supplierName}</p>
              </div>
              <div>
                <p className="text-sm text-slate-500">结算类型</p>
                <p className="font-medium text-slate-900">
                  {currentSettlement.settlementType === 'normal' ? '正常结算' :
                   currentSettlement.settlementType === 'return' ? '退货结算' :
                   currentSettlement.settlementType === 'discount' ? '折扣结算' : '预付款'}
                </p>
              </div>
              <div>
                <p className="text-sm text-slate-500">状态</p>
                {getSettlementStatusBadge(currentSettlement.status)}
              </div>
            </div>

            <div>
              <h4 className="font-medium text-slate-900 mb-3">金额汇总</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-slate-50 rounded-lg">
                <div>
                  <p className="text-sm text-slate-500">不含税金额</p>
                  <p className="font-medium text-slate-900">{formatCurrency(currentSettlement.totalAmount, currentSettlement.currency)}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-500">税额</p>
                  <p className="font-medium text-slate-900">{formatCurrency(currentSettlement.totalTaxAmount, currentSettlement.currency)}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-500">总金额</p>
                  <p className="font-bold text-slate-900">{formatCurrency(currentSettlement.grandTotal, currentSettlement.currency)}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-500">未付金额</p>
                  <p className="font-bold text-danger-600">{formatCurrency(currentSettlement.unpaidAmount, currentSettlement.currency)}</p>
                </div>
              </div>
            </div>

            {currentSettlement.items.length > 0 && (
              <div>
                <h4 className="font-medium text-slate-900 mb-3">关联订单</h4>
                <Table
                  columns={[
                    { key: 'orderCode', title: '订单号', dataIndex: 'orderCode' },
                    { key: 'productName', title: '产品名称', dataIndex: 'productName' },
                    { key: 'quantity', title: '数量', dataIndex: 'quantity', align: 'right' },
                    { key: 'unitPrice', title: '单价', dataIndex: 'unitPrice', align: 'right', render: (v) => formatCurrency(v as number) },
                    { key: 'totalAmount', title: '金额', dataIndex: 'totalAmount', align: 'right', render: (v) => formatCurrency(v as number) },
                  ]}
                  dataSource={currentSettlement.items}
                  rowKey="id"
                  size="small"
                />
              </div>
            )}

            {currentSettlement.paymentPlans.length > 0 && (
              <div>
                <h4 className="font-medium text-slate-900 mb-3">付款计划</h4>
                <Table
                  columns={[
                    { key: 'paymentName', title: '付款名称', dataIndex: 'paymentName' },
                    { key: 'dueDate', title: '到期日', dataIndex: 'dueDate', render: (v) => formatDate(v as string) },
                    { key: 'dueAmount', title: '应付金额', dataIndex: 'dueAmount', align: 'right', render: (v) => formatCurrency(v as number) },
                    { key: 'status', title: '状态', dataIndex: 'status', render: (v) => (
                      v === 'paid' ? <Badge variant="success" dot>已支付</Badge> :
                      v === 'overdue' ? <Badge variant="danger" dot>已逾期</Badge> :
                      <Badge variant="warning" dot>待支付</Badge>
                    )},
                  ]}
                  dataSource={currentSettlement.paymentPlans}
                  rowKey="id"
                  size="small"
                />
              </div>
            )}

            <div>
              <h4 className="font-medium text-slate-900 mb-3">付款记录</h4>
              {payments.filter(p => p.settlementId === currentSettlement.id).length > 0 ? (
                <Table
                  columns={[
                    { key: 'id', title: '付款单号', dataIndex: 'id' },
                    { key: 'paymentDate', title: '付款日期', dataIndex: 'paymentDate', render: (v) => formatDate(v as string) },
                    { key: 'amount', title: '金额', dataIndex: 'amount', align: 'right', render: (v) => formatCurrency(v as number) },
                    { key: 'paymentMethod', title: '付款方式', dataIndex: 'paymentMethod' },
                    { key: 'referenceNo', title: '参考号', dataIndex: 'referenceNo' },
                  ]}
                  dataSource={payments.filter(p => p.settlementId === currentSettlement.id)}
                  rowKey="id"
                  size="small"
                />
              ) : (
                <div className="text-center py-6 text-slate-400">暂无付款记录</div>
              )}
            </div>
          </div>
        )}
      </Modal>

      <Modal
        open={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        title="登记付款"
        width="md"
        footer={
          <>
            <Button variant="secondary" onClick={() => setShowPaymentModal(false)}>
              取消
            </Button>
            <Button variant="primary" onClick={handleSubmitPayment}>
              确认付款
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          {currentSettlement && (
            <div className="p-4 bg-slate-50 rounded-lg">
              <p className="text-sm text-slate-500">结算单号：{currentSettlement.code}</p>
              <p className="text-sm text-slate-500 mt-1">未付金额：
                <span className="font-bold text-danger-600 ml-1">
                  {formatCurrency(currentSettlement.unpaidAmount, currentSettlement.currency)}
                </span>
              </p>
            </div>
          )}
          <Input
            label="付款金额"
            type="number"
            value={paymentForm.amount}
            onChange={(e) => setPaymentForm({ ...paymentForm, amount: e.target.value })}
            placeholder="请输入付款金额"
          />
          <Input
            label="付款日期"
            type="date"
            value={paymentForm.paymentDate}
            onChange={(e) => setPaymentForm({ ...paymentForm, paymentDate: e.target.value })}
          />
          <Select
            label="付款方式"
            value={paymentForm.paymentMethod}
            onChange={(e) => setPaymentForm({ ...paymentForm, paymentMethod: e.target.value })}
            options={[
              { label: '银行转账', value: '银行转账' },
              { label: '信用证', value: '信用证' },
              { label: '承兑汇票', value: '承兑汇票' },
              { label: '现金', value: '现金' },
              { label: '其他', value: '其他' },
            ]}
          />
          <Input
            label="参考号"
            value={paymentForm.referenceNo}
            onChange={(e) => setPaymentForm({ ...paymentForm, referenceNo: e.target.value })}
            placeholder="请输入付款参考号/流水号"
          />
        </div>
      </Modal>

      <Modal
        open={showCreditModal}
        onClose={() => setShowCreditModal(false)}
        title={creditForm.adjustType === 'limit' ? '调整信用额度' : '调整信用期'}
        width="md"
        footer={
          <>
            <Button variant="secondary" onClick={() => setShowCreditModal(false)}>
              取消
            </Button>
            <Button variant="primary" onClick={handleSubmitCreditAdjust}>
              确认调整
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          {currentCredit && (
            <div className="p-4 bg-slate-50 rounded-lg">
              <p className="text-sm text-slate-500">供应商：{currentCredit.supplierName}</p>
              <p className="text-sm text-slate-500 mt-1">
                当前{creditForm.adjustType === 'limit' ? '信用额度' : '信用期'}：
                <span className="font-bold text-slate-900 ml-1">
                  {creditForm.adjustType === 'limit'
                    ? formatCurrency(currentCredit.creditLimit)
                    : `${currentCredit.creditPeriod}天`}
                </span>
              </p>
            </div>
          )}
          {creditForm.adjustType === 'limit' ? (
            <Input
              label="新信用额度"
              type="number"
              value={creditForm.creditLimit}
              onChange={(e) => setCreditForm({ ...creditForm, creditLimit: e.target.value })}
              placeholder="请输入新的信用额度"
            />
          ) : (
            <Input
              label="新信用期(天)"
              type="number"
              value={creditForm.creditPeriod}
              onChange={(e) => setCreditForm({ ...creditForm, creditPeriod: e.target.value })}
              placeholder="请输入新的信用期天数"
            />
          )}
        </div>
      </Modal>

      <Modal
        open={showCreditHistoryModal}
        onClose={() => setShowCreditHistoryModal(false)}
        title="信用历史"
        width="lg"
      >
        {currentCredit && (
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-4 p-4 bg-slate-50 rounded-lg">
              <div>
                <p className="text-sm text-slate-500">供应商</p>
                <p className="font-medium text-slate-900">{currentCredit.supplierName}</p>
              </div>
              <div>
                <p className="text-sm text-slate-500">信用额度</p>
                <p className="font-medium text-slate-900">{formatCurrency(currentCredit.creditLimit)}</p>
              </div>
              <div>
                <p className="text-sm text-slate-500">信用期</p>
                <p className="font-medium text-slate-900">{currentCredit.creditPeriod}天</p>
              </div>
            </div>

            {currentCredit.history.length > 0 ? (
              <Table
                columns={[
                  { key: 'date', title: '日期', dataIndex: 'date', render: (v) => formatDate(v as string) },
                  { key: 'type', title: '类型', dataIndex: 'type' },
                  { key: 'amount', title: '金额', dataIndex: 'amount', align: 'right', render: (v) => formatCurrency(v as number) },
                  { key: 'operator', title: '操作人', dataIndex: 'operator' },
                  { key: 'remark', title: '备注', dataIndex: 'remark' },
                ]}
                dataSource={currentCredit.history}
                rowKey="id"
                size="small"
              />
            ) : (
              <div className="text-center py-12 text-slate-400">
                <History className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>暂无信用历史记录</p>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}
