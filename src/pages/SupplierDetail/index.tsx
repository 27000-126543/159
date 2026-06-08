import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Star,
  MapPin,
  Phone,
  Mail,
  Globe,
  Building2,
  FileText,
  Package,
  Clock,
  TrendingUp,
  CheckCircle2,
  Download,
  CreditCard,
  DollarSign,
  Calendar,
  Users,
  Award,
  BarChart3,
  PieChart,
  AlertCircle,
  Loader2,
} from 'lucide-react';
import { useSupplierStore } from '@/store/supplierStore';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import Table from '@/components/ui/Table';
import StatusBadge from '@/components/business/StatusBadge';
import KpiCard from '@/components/business/KpiCard';
import { RadarChart } from '@/components/charts/RadarChart';
import { LineChart } from '@/components/charts/LineChart';
import { formatCurrency, formatPercent, formatNumber, formatDate } from '@/utils/format';
import { cn } from '@/lib/utils';
import type { Supplier } from '@/mock/data/suppliers';
import type { TableColumn } from '@/components/ui/Table';

type TabType = 'basic' | 'qualification' | 'capacity' | 'transactions' | 'quality' | 'credit';

const tabs = [
  { key: 'basic', label: '基本信息', icon: Building2 },
  { key: 'qualification', label: '资质文件', icon: FileText },
  { key: 'capacity', label: '产能配置', icon: Package },
  { key: 'transactions', label: '历史交易', icon: TrendingUp },
  { key: 'quality', label: '质量记录', icon: CheckCircle2 },
  { key: 'credit', label: '信用信息', icon: CreditCard },
];

const StarRating = ({ rating }: { rating: number }) => {
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 >= 0.5;

  return (
    <div className="flex items-center gap-0.5">
      {[...Array(5)].map((_, i) => (
        <Star
          key={i}
          className={cn(
            'w-5 h-5',
            i < fullStars
              ? 'text-warning-500 fill-warning-500'
              : i === fullStars && hasHalfStar
              ? 'text-warning-500 fill-warning-500'
              : 'text-slate-300',
          )}
        />
      ))}
      <span className="ml-2 text-lg font-bold text-slate-800">{rating.toFixed(1)}</span>
    </div>
  );
};

const mockQualifications = [
  { id: '1', name: 'ISO9001质量管理体系认证', type: '体系认证', issuer: '中国质量认证中心', issueDate: '2023-01-15', expiryDate: '2026-01-14', status: 'valid' },
  { id: '2', name: 'ISO14001环境管理体系认证', type: '体系认证', issuer: '中国质量认证中心', issueDate: '2023-02-20', expiryDate: '2026-02-19', status: 'valid' },
  { id: '3', name: 'IATF16949汽车质量管理体系', type: '行业认证', issuer: 'TUV莱茵', issueDate: '2023-03-10', expiryDate: '2026-03-09', status: 'valid' },
  { id: '4', name: '营业执照', type: '企业资质', issuer: '深圳市市场监督管理局', issueDate: '2019-06-15', expiryDate: '2029-06-14', status: 'valid' },
  { id: '5', name: '税务登记证', type: '企业资质', issuer: '深圳市税务局', issueDate: '2019-06-20', expiryDate: '长期', status: 'valid' },
];

const mockCapacities = [
  { id: '1', category: '芯片/集成电路', monthlyCapacity: 500000, unit: 'PCS', utilization: 85, peakSeasonCapacity: 600000, offSeasonCapacity: 350000, leadTime: 15, minOrderQuantity: 1000 },
  { id: '2', category: '通信模块', monthlyCapacity: 200000, unit: 'PCS', utilization: 78, peakSeasonCapacity: 250000, offSeasonCapacity: 150000, leadTime: 20, minOrderQuantity: 500 },
  { id: '3', category: '电子元器件', monthlyCapacity: 800000, unit: 'PCS', utilization: 92, peakSeasonCapacity: 1000000, offSeasonCapacity: 500000, leadTime: 10, minOrderQuantity: 2000 },
];

const mockTransactions = [
  { id: '1', orderNo: 'PO-2024-001', date: '2024-01-15', amount: 1250000, status: 'completed', onTimeRate: 98 },
  { id: '2', orderNo: 'PO-2024-008', date: '2024-01-28', amount: 890000, status: 'completed', onTimeRate: 100 },
  { id: '3', orderNo: 'PO-2024-015', date: '2024-02-10', amount: 2100000, status: 'completed', onTimeRate: 95 },
  { id: '4', orderNo: 'PO-2024-022', date: '2024-02-25', amount: 560000, status: 'shipped', onTimeRate: 0 },
  { id: '5', orderNo: 'PO-2024-030', date: '2024-03-05', amount: 1780000, status: 'in_progress', onTimeRate: 0 },
];

const mockTrendData = [
  { date: '2023-10', value: 1850000 },
  { date: '2023-11', value: 2100000 },
  { date: '2023-12', value: 1950000 },
  { date: '2024-01', value: 2140000 },
  { date: '2024-02', value: 2660000 },
  { date: '2024-03', value: 1780000 },
];

const mockQualityRecords = [
  { id: '1', date: '2024-01-20', productName: '5G通信芯片', quantity: 10000, passed: 9920, failed: 80, passRate: 99.2, result: 'passed' },
  { id: '2', date: '2024-02-15', productName: '物联网模块', quantity: 5000, passed: 4950, failed: 50, passRate: 99.0, result: 'passed' },
  { id: '3', date: '2024-03-01', productName: '处理器芯片', quantity: 8000, passed: 7880, failed: 120, passRate: 98.5, result: 'passed' },
  { id: '4', date: '2024-03-18', productName: '存储芯片', quantity: 12000, passed: 11950, failed: 50, passRate: 99.6, result: 'passed' },
];

const mockQualityTrend = [
  { date: '2023-10', value: 98.5 },
  { date: '2023-11', value: 98.8 },
  { date: '2023-12', value: 99.1 },
  { date: '2024-01', value: 99.2 },
  { date: '2024-02', value: 99.0 },
  { date: '2024-03', value: 98.5 },
];

const mockPaymentRecords = [
  { id: '1', date: '2024-01-30', amount: 1250000, method: '电汇', status: 'paid' },
  { id: '2', date: '2024-02-28', amount: 890000, method: '信用证', status: 'paid' },
  { id: '3', date: '2024-03-15', amount: 2100000, method: '电汇', status: 'paid' },
  { id: '4', date: '2024-04-01', amount: 560000, method: '承兑汇票', status: 'pending' },
];

const radarIndicators = [
  { name: '价格', max: 100 },
  { name: '质量', max: 100 },
  { name: '交付', max: 100 },
  { name: '服务', max: 100 },
  { name: '合规', max: 100 },
];

const radarData = [
  {
    name: '该供应商',
    value: [85, 92, 88, 80, 95],
    color: '#3B82F6',
    areaStyle: true,
  },
  {
    name: '行业平均',
    value: [75, 78, 72, 70, 80],
    color: '#94A3B8',
    areaStyle: true,
  },
];

export default function SupplierDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<TabType>('basic');

  const { currentSupplier, loading, fetchSupplierById } = useSupplierStore();

  useEffect(() => {
    if (id) {
      fetchSupplierById(id);
    }
  }, [id, fetchSupplierById]);

  if (loading && !currentSupplier) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 text-primary-500 animate-spin" />
      </div>
    );
  }

  if (!currentSupplier) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <AlertCircle className="w-16 h-16 text-slate-300 mb-4" />
        <p className="text-slate-500 mb-4">供应商不存在</p>
        <Button variant="primary" onClick={() => navigate('/suppliers')}>
          返回列表
        </Button>
      </div>
    );
  }

  const supplier = currentSupplier;

  const qualificationColumns: TableColumn<typeof mockQualifications[0]>[] = [
    { key: 'name', title: '文件名称', dataIndex: 'name' },
    { key: 'type', title: '类型', dataIndex: 'type' },
    { key: 'issuer', title: '颁发机构', dataIndex: 'issuer' },
    { key: 'issueDate', title: '颁发日期', dataIndex: 'issueDate', render: (v) => formatDate(v as string) },
    { key: 'expiryDate', title: '有效期至', dataIndex: 'expiryDate', render: (v) => formatDate(v as string) },
    { key: 'status', title: '状态', render: () => <Badge variant="success">有效</Badge> },
    {
      key: 'action',
      title: '操作',
      align: 'center',
      render: () => (
        <Button variant="ghost" size="sm" icon={<Download className="w-4 h-4" />}>
          下载
        </Button>
      ),
    },
  ];

  const capacityColumns: TableColumn<typeof mockCapacities[0]>[] = [
    { key: 'category', title: '品类', dataIndex: 'category' },
    { key: 'monthlyCapacity', title: '月产能', dataIndex: 'monthlyCapacity', render: (v, r) => `${formatNumber(v as number)} ${r.unit}` },
    { key: 'utilization', title: '利用率', dataIndex: 'utilization', render: (v) => formatPercent(v as number, 1) },
    { key: 'peakSeasonCapacity', title: '旺季产能', dataIndex: 'peakSeasonCapacity', render: (v, r) => `${formatNumber(v as number)} ${r.unit}` },
    { key: 'offSeasonCapacity', title: '淡季产能', dataIndex: 'offSeasonCapacity', render: (v, r) => `${formatNumber(v as number)} ${r.unit}` },
    { key: 'leadTime', title: '交货周期(天)', dataIndex: 'leadTime' },
    { key: 'minOrderQuantity', title: '最小订单量', dataIndex: 'minOrderQuantity', render: (v) => formatNumber(v as number) },
  ];

  const transactionColumns: TableColumn<typeof mockTransactions[0]>[] = [
    { key: 'orderNo', title: '订单号', dataIndex: 'orderNo' },
    { key: 'date', title: '日期', dataIndex: 'date', render: (v) => formatDate(v as string) },
    { key: 'amount', title: '金额', dataIndex: 'amount', render: (v) => formatCurrency(v as number) },
    { key: 'status', title: '状态', dataIndex: 'status', render: (v) => <StatusBadge type="order" status={v as string} /> },
    { key: 'onTimeRate', title: '准时率', dataIndex: 'onTimeRate', render: (v) => (v as number) > 0 ? formatPercent(v as number, 1) : '-' },
  ];

  const qualityColumns: TableColumn<typeof mockQualityRecords[0]>[] = [
    { key: 'date', title: '质检日期', dataIndex: 'date', render: (v) => formatDate(v as string) },
    { key: 'productName', title: '产品名称', dataIndex: 'productName' },
    { key: 'quantity', title: '质检数量', dataIndex: 'quantity', render: (v) => formatNumber(v as number) },
    { key: 'passed', title: '合格数量', dataIndex: 'passed', render: (v) => formatNumber(v as number) },
    { key: 'failed', title: '不合格数量', dataIndex: 'failed', render: (v) => formatNumber(v as number) },
    { key: 'passRate', title: '合格率', dataIndex: 'passRate', render: (v) => formatPercent(v as number, 1) },
    { key: 'result', title: '结果', dataIndex: 'result', render: (v) => <StatusBadge type="quality" status={v as string} /> },
  ];

  const paymentColumns: TableColumn<typeof mockPaymentRecords[0]>[] = [
    { key: 'date', title: '付款日期', dataIndex: 'date', render: (v) => formatDate(v as string) },
    { key: 'amount', title: '金额', dataIndex: 'amount', render: (v) => formatCurrency(v as number) },
    { key: 'method', title: '付款方式', dataIndex: 'method' },
    { key: 'status', title: '状态', dataIndex: 'status', render: (v) => <StatusBadge type="payment" status={v as string} /> },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" icon={<ArrowLeft className="w-4 h-4" />} onClick={() => navigate('/suppliers')}>
          返回列表
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-slate-800">供应商详情</h1>
          <p className="text-slate-500">查看和管理供应商详细信息</p>
        </div>
      </div>

      <Card className="overflow-hidden">
        <div className="bg-gradient-to-r from-primary-500 to-primary-600 px-6 py-8">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
            <img
              src={supplier.logo}
              alt={supplier.name}
              className="w-20 h-20 rounded-2xl object-cover bg-white p-2 shadow-lg"
            />
            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-3 mb-2">
                <h2 className="text-2xl font-bold text-white">{supplier.name}</h2>
                <Badge variant="default" className="bg-white/20 text-white border-0">
                  {supplier.code}
                </Badge>
                <StatusBadge type="supplier" status={supplier.qualificationStatus} />
                <Badge variant="warning" className="bg-warning-500/20 text-white border-0">
                  {supplier.qualificationLevel}级供应商
                </Badge>
              </div>
              <p className="text-white/80 mb-3">{supplier.nameEn}</p>
              <div className="flex flex-wrap items-center gap-4 text-white/90">
                <div className="flex items-center gap-1">
                  <MapPin className="w-4 h-4" />
                  <span>{supplier.country} · {supplier.city}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Award className="w-4 h-4" />
                  <span>{supplier.category}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Users className="w-4 h-4" />
                  <span>{supplier.contactPerson} ({supplier.contactTitle})</span>
                </div>
              </div>
            </div>
            <div className="text-center md:text-right">
              <StarRating rating={supplier.rating} />
              <p className="text-white/70 text-sm mt-1">{supplier.reviewCount} 条评价</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-0">
          <div className="p-5 text-center border-r border-b md:border-b-0 border-slate-100">
            <p className="text-sm text-slate-500 mb-1">历史订单</p>
            <p className="text-2xl font-bold text-slate-800">{supplier.orderCount}</p>
          </div>
          <div className="p-5 text-center border-r border-b md:border-b-0 border-slate-100">
            <p className="text-sm text-slate-500 mb-1">交易总额</p>
            <p className="text-2xl font-bold text-slate-800">{formatCurrency(supplier.totalAmount)}</p>
          </div>
          <div className="p-5 text-center border-r border-b md:border-b-0 border-slate-100">
            <p className="text-sm text-slate-500 mb-1">准时交付率</p>
            <p className="text-2xl font-bold text-success-600">{formatPercent(supplier.onTimeDeliveryRate, 1)}</p>
          </div>
          <div className="p-5 text-center border-r border-b md:border-b-0 border-slate-100">
            <p className="text-sm text-slate-500 mb-1">质量合格率</p>
            <p className="text-2xl font-bold text-success-600">{formatPercent(supplier.qualityPassRate, 1)}</p>
          </div>
          <div className="p-5 text-center border-r border-b md:border-b-0 border-slate-100">
            <p className="text-sm text-slate-500 mb-1">信用额度</p>
            <p className="text-2xl font-bold text-primary-600">{formatCurrency(supplier.creditLimit)}</p>
          </div>
          <div className="p-5 text-center border-b md:border-b-0 border-slate-100">
            <p className="text-sm text-slate-500 mb-1">账期</p>
            <p className="text-2xl font-bold text-primary-600">{supplier.creditPeriod}天</p>
          </div>
        </div>

        <div className="px-6 py-4 border-t border-slate-100">
          <div className="flex flex-wrap items-center gap-2">
            {supplier.certification.map((cert) => (
            <Badge key={cert} variant="default">
              {cert}
            </Badge>
          ))}
            {supplier.tags.map((tag) => (
              <Badge key={tag} variant="primary" className="bg-primary-50 text-primary-600">
                {tag}
              </Badge>
            ))}
          </div>
        </div>
      </Card>

      <Card>
        <div className="flex overflow-x-auto border-b border-slate-100 mb-0">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              className={cn(
                'flex items-center gap-2 px-6 py-4 text-sm font-medium whitespace-nowrap transition-colors border-b-2 -mb-px',
                activeTab === tab.key
                  ? 'text-primary-600 border-primary-500'
                  : 'text-slate-500 border-transparent hover:text-slate-700 hover:border-slate-300',
              )}
              onClick={() => setActiveTab(tab.key as TabType)}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>

        <div className="p-6">
          {activeTab === 'basic' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <h3 className="text-lg font-semibold text-slate-800 mb-4">企业简介</h3>
                  <p className="text-slate-600 leading-relaxed">{supplier.businessScope}</p>
                </Card>

                <Card>
                  <h3 className="text-lg font-semibold text-slate-800 mb-4">注册信息</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between py-2 border-b border-slate-100">
                      <span className="text-slate-500">注册资本</span>
                      <span className="font-medium text-slate-800">{supplier.registeredCapital}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-slate-100">
                      <span className="text-slate-500">成立日期</span>
                      <span className="font-medium text-slate-800">{formatDate(supplier.establishmentDate)}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-slate-100">
                      <span className="text-slate-500">税号</span>
                      <span className="font-medium text-slate-800 font-mono">{supplier.taxNumber}</span>
                    </div>
                    <div className="flex justify-between py-2">
                      <span className="text-slate-500">官网</span>
                      <span className="font-medium text-primary-600">{supplier.website}</span>
                    </div>
                  </div>
                </Card>

                <Card>
                  <h3 className="text-lg font-semibold text-slate-800 mb-4">联系方式</h3>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 py-2 border-b border-slate-100">
                      <div className="w-10 h-10 rounded-lg bg-primary-50 flex items-center justify-center">
                        <Users className="w-5 h-5 text-primary-500" />
                      </div>
                      <div>
                        <p className="text-sm text-slate-500">联系人</p>
                        <p className="font-medium text-slate-800">{supplier.contactPerson} ({supplier.contactTitle})</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 py-2 border-b border-slate-100">
                      <div className="w-10 h-10 rounded-lg bg-success-50 flex items-center justify-center">
                        <Phone className="w-5 h-5 text-success-500" />
                      </div>
                      <div>
                        <p className="text-sm text-slate-500">电话</p>
                        <p className="font-medium text-slate-800">{supplier.phone}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 py-2 border-b border-slate-100">
                      <div className="w-10 h-10 rounded-lg bg-warning-50 flex items-center justify-center">
                        <Mail className="w-5 h-5 text-warning-500" />
                      </div>
                      <div>
                        <p className="text-sm text-slate-500">邮箱</p>
                        <p className="font-medium text-slate-800">{supplier.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 py-2">
                      <div className="w-10 h-10 rounded-lg bg-info-50 flex items-center justify-center">
                        <Globe className="w-5 h-5 text-sky-500" />
                      </div>
                      <div>
                        <p className="text-sm text-slate-500">官网</p>
                        <p className="font-medium text-primary-600">{supplier.website}</p>
                      </div>
                    </div>
                  </div>
                </Card>

                <Card>
                  <h3 className="text-lg font-semibold text-slate-800 mb-4">地址信息</h3>
                  <div className="space-y-3">
                    <div className="flex items-start gap-3 py-2">
                      <div className="w-10 h-10 rounded-lg bg-danger-50 flex items-center justify-center mt-0.5">
                        <MapPin className="w-5 h-5 text-danger-500" />
                      </div>
                      <div>
                        <p className="text-sm text-slate-500">详细地址</p>
                        <p className="font-medium text-slate-800">{supplier.address}</p>
                      </div>
                    </div>
                    <div className="flex justify-between py-2 border-t border-slate-100">
                      <span className="text-slate-500">国家/地区</span>
                      <span className="font-medium text-slate-800">{supplier.country} ({supplier.countryCode})</span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-slate-100">
                      <span className="text-slate-500">城市</span>
                      <span className="font-medium text-slate-800">{supplier.city}</span>
                    </div>
                  </div>
                </Card>
              </div>
            </div>
          )}

          {activeTab === 'qualification' && (
            <div className="space-y-6">
              <Table columns={qualificationColumns} dataSource={mockQualifications} rowKey="id" />
            </div>
          )}

          {activeTab === 'capacity' && (
            <div className="space-y-6">
              <Table columns={capacityColumns} dataSource={mockCapacities} rowKey="id" />
            </div>
          )}

          {activeTab === 'transactions' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <KpiCard
                  title="总交易金额"
                  value={supplier.totalAmount}
                  format="currency"
                  icon={<DollarSign className="w-5 h-5" />}
                  variant="primary"
                />
                <KpiCard
                  title="订单总数"
                  value={supplier.orderCount}
                  icon={<BarChart3 className="w-5 h-5" />}
                  variant="success"
                />
                <KpiCard
                  title="平均准时率"
                  value={supplier.onTimeDeliveryRate}
                  format="percent"
                  icon={<Clock className="w-5 h-5" />}
                  variant="warning"
                />
              </div>

              <Card>
                <h3 className="text-lg font-semibold text-slate-800 mb-4">交易趋势</h3>
                <LineChart
                  data={mockTrendData}
                  xField="month"
                  yField="amount"
                  color="#3B82F6"
                  areaStyle
                  height={300}
                  yAxisFormatter={(value) => formatCurrency(value, 'CNY', 0)}
                />
              </Card>

              <Card>
                <h3 className="text-lg font-semibold text-slate-800 mb-4">订单列表</h3>
                <Table columns={transactionColumns} dataSource={mockTransactions} rowKey="id" />
              </Card>
            </div>
          )}

          {activeTab === 'quality' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <KpiCard
                  title="平均合格率"
                  value={supplier.qualityPassRate}
                  format="percent"
                  icon={<CheckCircle2 className="w-5 h-5" />}
                  variant="success"
                />
                <KpiCard
                  title="质检次数"
                  value={mockQualityRecords.length}
                  icon={<PieChart className="w-5 h-5" />}
                  variant="primary"
                />
                <KpiCard
                  title="不合格率"
                  value={100 - supplier.qualityPassRate}
                  format="percent"
                  icon={<AlertCircle className="w-5 h-5" />}
                  variant="danger"
                />
              </div>

              <Card>
                <h3 className="text-lg font-semibold text-slate-800 mb-4">合格率趋势</h3>
                <LineChart
                  data={mockQualityTrend}
                  xField="month"
                  yField="rate"
                  color="#10B981"
                  areaStyle
                  height={300}
                  yAxisFormatter={(value) => `${value}%`}
                />
              </Card>

              <Card>
                <h3 className="text-lg font-semibold text-slate-800 mb-4">质检记录</h3>
                <Table columns={qualityColumns} dataSource={mockQualityRecords} rowKey="id" />
              </Card>

              <Card>
                <h3 className="text-lg font-semibold text-slate-800 mb-4">不合格原因分析</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 bg-warning-50 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <AlertCircle className="w-5 h-5 text-warning-500" />
                      <span className="font-medium text-slate-800">外观缺陷</span>
                    </div>
                    <p className="text-sm text-slate-600">占比 45% - 主要为表面划痕、色差等问题</p>
                  </div>
                  <div className="p-4 bg-danger-50 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <AlertCircle className="w-5 h-5 text-danger-500" />
                      <span className="font-medium text-slate-800">性能不达标</span>
                    </div>
                    <p className="text-sm text-slate-600">占比 30% - 功能测试未通过参数指标</p>
                  </div>
                  <div className="p-4 bg-warning-50 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <AlertCircle className="w-5 h-5 text-warning-500" />
                      <span className="font-medium text-slate-800">包装问题</span>
                    </div>
                    <p className="text-sm text-slate-600">占比 15% - 包装破损、标识不清等</p>
                  </div>
                  <div className="p-4 bg-info-50 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <AlertCircle className="w-5 h-5 text-sky-500" />
                      <span className="font-medium text-slate-800">其他</span>
                    </div>
                    <p className="text-sm text-slate-600">占比 10% - 文档不全、配件缺失等</p>
                  </div>
                </div>
              </Card>
            </div>
          )}

          {activeTab === 'credit' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <KpiCard
                  title="信用额度"
                  value={supplier.creditLimit}
                  format="currency"
                  icon={<CreditCard className="w-5 h-5" />}
                  variant="primary"
                />
                <KpiCard
                  title="信用账期"
                  value={supplier.creditPeriod}
                  unit="天"
                  icon={<Calendar className="w-5 h-5" />}
                  variant="success"
                />
                <KpiCard
                  title="信用评分"
                  value={88}
                  format="number"
                  icon={<Award className="w-5 h-5" />}
                  variant="warning"
                />
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <h3 className="text-lg font-semibold text-slate-800 mb-4">信用评分雷达图</h3>
                  <RadarChart
                    indicators={radarIndicators}
                    data={radarData}
                    height={350}
                    radius="70%"
                  />
                </Card>

                <Card>
                  <h3 className="text-lg font-semibold text-slate-800 mb-4">银行信息</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between py-2 border-b border-slate-100">
                      <span className="text-slate-500">开户银行</span>
                      <span className="font-medium text-slate-800">{supplier.bankName}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-slate-100">
                      <span className="text-slate-500">银行账号</span>
                      <span className="font-medium text-slate-800 font-mono">{supplier.bankAccount}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-slate-100">
                      <span className="text-slate-500">税号</span>
                      <span className="font-medium text-slate-800 font-mono">{supplier.taxNumber}</span>
                    </div>
                    <div className="flex justify-between py-2">
                      <span className="text-slate-500">付款方式偏好</span>
                      <span className="font-medium text-slate-800">电汇、信用证</span>
                    </div>
                  </div>
                </Card>
              </div>

              <Card>
                <h3 className="text-lg font-semibold text-slate-800 mb-4">历史付款记录</h3>
                <Table columns={paymentColumns} dataSource={mockPaymentRecords} rowKey="id" />
              </Card>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
