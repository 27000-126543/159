import { useState, useEffect, useMemo } from 'react';
import {
  Plus,
  Search,
  LayoutGrid,
  List,
  Eye,
  Truck,
  MapPin,
  Clock,
  CheckCircle,
  AlertTriangle,
  QrCode,
  Package,
  Plane,
  Ship,
  Train,
  Bike,
  Layers,
  ChevronRight,
  RefreshCw,
  Bell,
  Calendar,
  User,
  Phone,
  FileText,
  AlertCircle,
  X,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { logisticsService } from '@/mock/services/logisticsService';
import { Logistics } from '@/mock/data/logistics';
import { useUserStore } from '@/store/userStore';
import { formatCurrency, formatDate, formatDateTime } from '@/utils/format';
import { diffDays, getRemainingDays } from '@/utils/date';
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
  { key: 'planning', label: '待发货', status: 'default' },
  { key: 'in_transit', label: '运输中', status: 'primary' },
  { key: 'arrived', label: '已到达', status: 'success' },
  { key: 'customs_clearance', label: '清关中', status: 'warning' },
  { key: 'delivered', label: '已送达', status: 'success' },
];

const transportMethodOptions = [
  { label: '空运', value: 'air', icon: Plane },
  { label: '海运', value: 'sea', icon: Ship },
  { label: '陆运', value: 'land', icon: Truck },
  { label: '铁路', value: 'rail', icon: Train },
  { label: '快递', value: 'express', icon: Bike },
];

const getStatusConfig = (status: string) => {
  const config: Record<string, { label: string; variant: 'primary' | 'success' | 'warning' | 'danger' | 'default' }> = {
    planning: { label: '计划中', variant: 'default' },
    picked_up: { label: '已揽收', variant: 'primary' },
    in_transit: { label: '运输中', variant: 'primary' },
    customs_clearance: { label: '清关中', variant: 'warning' },
    out_for_delivery: { label: '派送中', variant: 'primary' },
    delivered: { label: '已送达', variant: 'success' },
    exception: { label: '异常', variant: 'danger' },
    returned: { label: '已退回', variant: 'default' },
  };
  return config[status] || { label: status, variant: 'default' };
};

const getTransportIcon = (method: string) => {
  const icons: Record<string, any> = {
    air: Plane,
    sea: Ship,
    land: Truck,
    rail: Train,
    express: Bike,
  };
  return icons[method] || Truck;
};

const getProgressColor = (progress: number, hasException: boolean) => {
  if (hasException) return 'from-danger-400 to-danger-600';
  if (progress >= 100) return 'from-success-400 to-success-600';
  if (progress >= 50) return 'from-primary-400 to-primary-600';
  return 'from-warning-400 to-warning-600';
};

export default function LogisticsPage() {
  const [logisticsList, setLogisticsList] = useState<Logistics[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('');
  const [viewMode, setViewMode] = useState<'list' | 'card'>('list');
  const [filterParams, setFilterParams] = useState<Record<string, unknown>>({});

  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showScanModal, setShowScanModal] = useState(false);
  const [selectedLogistics, setSelectedLogistics] = useState<Logistics | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);

  const [scanInput, setScanInput] = useState('');
  const [scanResult, setScanResult] = useState<Logistics | null>(null);
  const [scanning, setScanning] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [signatory, setSignatory] = useState('');

  const currentUser = useUserStore(state => state.user);
  const currentUserRole = currentUser?.role;
  const currentUserRegions = currentUser?.regions;

  const fetchLogisticsList = async (params: Record<string, unknown> = {}) => {
    setLoading(true);
    try {
      const result = await logisticsService.getLogisticsList({
        ...filterParams,
        ...params,
        status: activeTab || undefined,
        page,
        pageSize,
      }, currentUserRole, currentUserRegions);
      setLogisticsList(result.list);
      setTotal(result.total);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogisticsList({ page: 1 });
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
    fetchLogisticsList({ ...params, page: 1 });
  };

  const handleSearch = (keyword: string) => {
    setPage(1);
    fetchLogisticsList({ keyword, page: 1 });
  };

  const handleReset = () => {
    setFilterParams({});
    setPage(1);
    fetchLogisticsList({ page: 1 });
  };

  const handlePageChange = (newPage: number, newPageSize?: number) => {
    const size = newPageSize || pageSize;
    setPage(newPage);
    setPageSize(size);
    fetchLogisticsList({ page: newPage, pageSize: size });
  };

  const handleViewDetail = (record: Logistics) => {
    setSelectedLogistics(record);
    setShowDetailModal(true);
  };

  const handleScan = async () => {
    if (!scanInput.trim()) return;
    setScanning(true);
    try {
      const result = await logisticsService.getTrackingInfo(scanInput.trim());
      setScanResult(result);
    } finally {
      setScanning(false);
    }
  };

  const handleConfirmReceipt = async () => {
    if (!scanResult || !signatory.trim()) return;
    setConfirming(true);
    try {
      const pkg = scanResult.packages[0];
      const result = await logisticsService.scanReceipt(scanResult.id, pkg.id, signatory.trim());
      if (result) {
        alert('收货成功！系统已自动创建质检单。');
        setShowScanModal(false);
        setScanInput('');
        setScanResult(null);
        setSignatory('');
        fetchLogisticsList();
      }
    } finally {
      setConfirming(false);
    }
  };

  const getTimelineItems = (logistics: Logistics) => {
    return logistics.trackingEvents
      .slice()
      .reverse()
      .map((event, index) => {
        const isLatest = index === 0;
        const status = event.isException
          ? 'failed'
          : isLatest
          ? 'current'
          : 'completed';

        return {
          id: event.id,
          title: event.status,
          description: event.description,
          time: event.timestamp,
          status: status as 'completed' | 'current' | 'pending' | 'failed',
          user: event.operator,
          extra: event.isException ? (
            <Badge variant="danger" size="sm">
              <AlertCircle className="w-3 h-3 mr-1" />
              {event.exceptionType}
            </Badge>
          ) : null,
        };
      });
  };

  const getCountdown = (expectedDate: string) => {
    const remaining = getRemainingDays(expectedDate);
    if (remaining < 0) {
      return { text: `已延误 ${Math.abs(remaining)} 天`, variant: 'danger' as const };
    }
    if (remaining === 0) {
      return { text: '今日到达', variant: 'warning' as const };
    }
    return { text: `预计 ${remaining} 天后到达`, variant: 'primary' as const };
  };

  const filterFields = [
    {
      key: 'status',
      label: '状态',
      type: 'select' as const,
      options: statusTabs.filter(t => t.key).map(t => ({ label: t.label, value: t.key })),
    },
    {
      key: 'transportMethod',
      label: '运输方式',
      type: 'select' as const,
      options: transportMethodOptions.map(o => ({ label: o.label, value: o.value })),
    },
    {
      key: 'dateRange',
      label: '发货日期',
      type: 'daterange' as const,
    },
  ];

  const columns: TableColumn<Logistics>[] = [
    {
      key: 'trackingNo',
      title: '物流单号',
      dataIndex: 'trackingNo',
      sortable: true,
      render: (value, record) => (
        <div className="flex items-center gap-2">
          {(() => {
            const Icon = getTransportIcon(record.transportMode);
            return <Icon className="w-4 h-4 text-primary-500" />;
          })()}
          <span className="font-medium text-primary-600">{value as string}</span>
          {record.hasException && (
            <Badge variant="danger" size="sm" dot>
              异常
            </Badge>
          )}
        </div>
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
      key: 'carrier',
      title: '承运商',
      dataIndex: 'carrier',
    },
    {
      key: 'transportModeName',
      title: '运输方式',
      dataIndex: 'transportModeName',
      render: (value, record) => {
        const Icon = getTransportIcon(record.transportMode);
        return (
          <span className="flex items-center gap-1">
            <Icon className="w-3.5 h-3.5 text-slate-400" />
            {value as string}
          </span>
        );
      },
    },
    {
      key: 'originCity',
      title: '出发港',
      dataIndex: 'originCity',
    },
    {
      key: 'destinationCity',
      title: '目的港',
      dataIndex: 'destinationCity',
    },
    {
      key: 'expectedDeliveryDate',
      title: '预计到达',
      dataIndex: 'expectedDeliveryDate',
      sortable: true,
      render: (value) => formatDate(value as string),
    },
    {
      key: 'actualDeliveryDate',
      title: '实际到达',
      dataIndex: 'actualDeliveryDate',
      render: (value) => value ? formatDate(value as string) : '-',
    },
    {
      key: 'progress',
      title: '运输状态',
      width: 180,
      render: (_, record) => (
        <div className="min-w-[180px]">
          <div className="flex items-center justify-between mb-1">
            <Badge variant={getStatusConfig(record.status).variant} size="sm">
              {getStatusConfig(record.status).label}
            </Badge>
            <span className="text-xs text-slate-500">{record.progress}%</span>
          </div>
          <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
            <div
              className={cn(
                'h-full rounded-full transition-all duration-500',
                'bg-gradient-to-r',
                getProgressColor(record.progress, record.hasException)
              )}
              style={{ width: `${record.progress}%` }}
            />
          </div>
        </div>
      ),
    },
    {
      key: 'actions',
      title: '操作',
      width: 200,
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
          <Button
            variant="ghost"
            size="sm"
            icon={<MapPin className="w-4 h-4" />}
            onClick={() => handleViewDetail(record)}
          >
            跟踪
          </Button>
          {(record.status === 'out_for_delivery' || record.status === 'customs_clearance') && (
            <Button
              variant="ghost"
              size="sm"
              icon={<CheckCircle className="w-4 h-4 text-success-500" />}
              onClick={() => {
                setSelectedLogistics(record);
                setScanResult(record);
                setShowScanModal(true);
              }}
            >
              收货
            </Button>
          )}
        </div>
      ),
    },
  ];

  const stats = useMemo(() => {
    return statusTabs.map(tab => {
      const count = tab.key
        ? logisticsList.filter(l => l.status === tab.key).length
        : logisticsList.length;
      return { ...tab, count };
    });
  }, [logisticsList]);

  const exceptionCount = useMemo(() => {
    return logisticsList.filter(l => l.hasException).length;
  }, [logisticsList]);

  function renderDetailModal() {
    if (!selectedLogistics) return null;
    const countdown = selectedLogistics.status !== 'delivered' && selectedLogistics.expectedDeliveryDate
      ? getCountdown(selectedLogistics.expectedDeliveryDate)
      : null;

    return (
      <Modal
        open={showDetailModal}
        onClose={() => setShowDetailModal(false)}
        title="物流详情"
        width="xl"
        footer={
          <div className="flex items-center justify-end gap-2">
            <Button variant="secondary" onClick={() => setShowDetailModal(false)}>
              关闭
            </Button>
            {(selectedLogistics.status === 'out_for_delivery' || selectedLogistics.status === 'customs_clearance') && (
              <Button
                variant="primary"
                icon={<CheckCircle className="w-4 h-4" />}
                onClick={() => {
                  setShowDetailModal(false);
                  setScanResult(selectedLogistics);
                  setShowScanModal(true);
                }}
              >
                确认收货
              </Button>
            )}
          </div>
        }
      >
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-sm text-slate-500 mb-1">物流单号</div>
              <div className="font-semibold text-slate-900 flex items-center gap-2">
                {(() => {
                  const Icon = getTransportIcon(selectedLogistics.transportMode);
                  return <Icon className="w-4 h-4 text-primary-500" />;
                })()}
                {selectedLogistics.trackingNo}
              </div>
            </div>
            <div>
              <div className="text-sm text-slate-500 mb-1">关联订单号</div>
              <div className="font-medium text-slate-700">{selectedLogistics.orderCode}</div>
            </div>
            <div>
              <div className="text-sm text-slate-500 mb-1">供应商</div>
              <div className="font-medium text-slate-700">{selectedLogistics.supplierName}</div>
            </div>
            <div>
              <div className="text-sm text-slate-500 mb-1">状态</div>
              <div className="flex items-center gap-2">
                <Badge variant={getStatusConfig(selectedLogistics.status).variant} dot>
                  {getStatusConfig(selectedLogistics.status).label}
                </Badge>
                {selectedLogistics.hasException && (
                  <Badge variant="danger" size="sm">
                    <AlertTriangle className="w-3 h-3 mr-1" />
                    异常
                  </Badge>
                )}
              </div>
            </div>
          </div>

          {countdown && (
            <div className={cn(
              'p-4 rounded-lg',
              countdown.variant === 'danger' ? 'bg-danger-50' :
              countdown.variant === 'warning' ? 'bg-warning-50' : 'bg-primary-50'
            )}>
              <div className="flex items-center gap-3">
                <div className={cn(
                  'w-10 h-10 rounded-full flex items-center justify-center',
                  countdown.variant === 'danger' ? 'bg-danger-100' :
                  countdown.variant === 'warning' ? 'bg-warning-100' : 'bg-primary-100'
                )}>
                  <Clock className={cn(
                    'w-5 h-5',
                    countdown.variant === 'danger' ? 'text-danger-500' :
                    countdown.variant === 'warning' ? 'text-warning-500' : 'text-primary-500'
                  )} />
                </div>
                <div>
                  <div className={cn(
                    'font-semibold',
                    countdown.variant === 'danger' ? 'text-danger-700' :
                    countdown.variant === 'warning' ? 'text-warning-700' : 'text-primary-700'
                  )}>
                    {countdown.text}
                  </div>
                  <div className="text-sm text-slate-500">
                    预计到达日期：{formatDate(selectedLogistics.expectedDeliveryDate)}
                  </div>
                </div>
              </div>
            </div>
          )}

          {selectedLogistics.hasException && (
            <div className="p-4 bg-danger-50 rounded-lg">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-danger-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-danger-800">{selectedLogistics.exceptionType}</p>
                  <p className="text-sm text-danger-600 mt-1">{selectedLogistics.exceptionDescription}</p>
                </div>
              </div>
            </div>
          )}

          <Card padding="sm">
            <div className="flex items-center gap-2 mb-3">
              <Truck className="w-4 h-4 text-primary-500" />
              <span className="font-medium text-slate-800">物流信息</span>
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-slate-500">承运商：</span>
                <span className="text-slate-700">{selectedLogistics.carrier}</span>
              </div>
              <div>
                <span className="text-slate-500">联系方式：</span>
                <span className="text-slate-700">{selectedLogistics.carrierContact}</span>
              </div>
              <div>
                <span className="text-slate-500">运输方式：</span>
                <span className="text-slate-700">{selectedLogistics.transportModeName}</span>
              </div>
              <div>
                <span className="text-slate-500">计划编号：</span>
                <span className="text-slate-700">{selectedLogistics.planNo || '-'}</span>
              </div>
              <div>
                <span className="text-slate-500">起运地：</span>
                <span className="text-slate-700">{selectedLogistics.originCity}, {selectedLogistics.originCountry}</span>
              </div>
              <div>
                <span className="text-slate-500">目的地：</span>
                <span className="text-slate-700">{selectedLogistics.destinationCity}, {selectedLogistics.destinationCountry}</span>
              </div>
              <div>
                <span className="text-slate-500">当前位置：</span>
                <span className="text-slate-700 font-medium text-primary-600">{selectedLogistics.currentLocation}</span>
              </div>
              <div>
                <span className="text-slate-500">运输进度：</span>
                <span className="text-slate-700">{selectedLogistics.progress}%</span>
              </div>
            </div>
          </Card>

          <div className="grid grid-cols-2 gap-4">
            <Card padding="sm">
              <div className="flex items-center gap-2 mb-3">
                <Calendar className="w-4 h-4 text-primary-500" />
                <span className="font-medium text-slate-800">时间信息</span>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-500">提货日期</span>
                  <span className="text-slate-700">{formatDate(selectedLogistics.pickupDate)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">预计送达</span>
                  <span className="text-slate-700">{formatDate(selectedLogistics.expectedDeliveryDate)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">实际送达</span>
                  <span className="text-slate-700">{selectedLogistics.actualDeliveryDate ? formatDate(selectedLogistics.actualDeliveryDate) : '-'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">预计天数</span>
                  <span className="text-slate-700">{selectedLogistics.estimatedDays} 天</span>
                </div>
                {selectedLogistics.actualDays > 0 && (
                  <div className="flex justify-between">
                    <span className="text-slate-500">实际天数</span>
                    <span className="text-slate-700">{selectedLogistics.actualDays} 天</span>
                  </div>
                )}
              </div>
            </Card>

            <Card padding="sm">
              <div className="flex items-center gap-2 mb-3">
                <User className="w-4 h-4 text-primary-500" />
                <span className="font-medium text-slate-800">收件信息</span>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex items-start gap-2">
                  <User className="w-3.5 h-3.5 text-slate-400 mt-0.5" />
                  <span className="text-slate-700">{selectedLogistics.receiverName}</span>
                </div>
                <div className="flex items-start gap-2">
                  <Phone className="w-3.5 h-3.5 text-slate-400 mt-0.5" />
                  <span className="text-slate-700">{selectedLogistics.receiverPhone}</span>
                </div>
                <div className="flex items-start gap-2">
                  <MapPin className="w-3.5 h-3.5 text-slate-400 mt-0.5" />
                  <span className="text-slate-700">{selectedLogistics.destinationAddress}</span>
                </div>
              </div>
            </Card>
          </div>

          <Card padding="sm">
            <div className="flex items-center gap-2 mb-3">
              <Package className="w-4 h-4 text-primary-500" />
              <span className="font-medium text-slate-800">包裹信息</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-200">
                    <th className="text-left py-2 px-3 font-medium text-slate-600">包裹号</th>
                    <th className="text-left py-2 px-3 font-medium text-slate-600">类型</th>
                    <th className="text-left py-2 px-3 font-medium text-slate-600">内容</th>
                    <th className="text-right py-2 px-3 font-medium text-slate-600">重量</th>
                    <th className="text-right py-2 px-3 font-medium text-slate-600">状态</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedLogistics.packages.map((pkg) => (
                    <tr key={pkg.id} className="border-b border-slate-100">
                      <td className="py-2 px-3 text-slate-700 font-mono">{pkg.packageNo}</td>
                      <td className="py-2 px-3 text-slate-700">{pkg.type}</td>
                      <td className="py-2 px-3 text-slate-700">{pkg.items}</td>
                      <td className="py-2 px-3 text-slate-700 text-right">{pkg.weight} {pkg.weightUnit}</td>
                      <td className="py-2 px-3 text-right">
                        <Badge variant={pkg.isReceived ? 'success' : 'default'} size="sm">
                          {pkg.isReceived ? '已签收' : '待签收'}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="mt-3 pt-3 border-t border-slate-100 flex justify-between text-sm">
              <span className="text-slate-500">合计：{selectedLogistics.packages?.length || 0} 件包裹，{selectedLogistics.totalWeight} kg</span>
              <span className="text-slate-500">运费：{formatCurrency(selectedLogistics.totalCost, selectedLogistics.currency)}</span>
            </div>
          </Card>

          <Card padding="sm">
            <div className="flex items-center gap-2 mb-4">
              <Clock className="w-4 h-4 text-primary-500" />
              <span className="font-medium text-slate-800">物流跟踪</span>
            </div>
            <Timeline items={getTimelineItems(selectedLogistics)} reverse />
          </Card>

          {selectedLogistics.remarks && (
            <div className="p-4 bg-slate-50 rounded-lg">
              <div className="text-sm text-slate-500 mb-1">备注</div>
              <div className="text-sm text-slate-700">{selectedLogistics.remarks}</div>
            </div>
          )}
        </div>
      </Modal>
    );
  }

  function renderScanModal() {
    return (
      <Modal
        open={showScanModal}
        onClose={() => {
          setShowScanModal(false);
          setScanInput('');
          setScanResult(null);
          setSignatory('');
        }}
        title="扫码收货"
        width="lg"
        footer={
          <>
            <Button
              variant="secondary"
              onClick={() => {
                setShowScanModal(false);
                setScanInput('');
                setScanResult(null);
                setSignatory('');
              }}
            >
              取消
            </Button>
            {scanResult && scanResult.status !== 'delivered' && (
              <Button
                variant="primary"
                onClick={handleConfirmReceipt}
                loading={confirming}
                disabled={!signatory.trim()}
                icon={<CheckCircle className="w-4 h-4" />}
              >
                确认收货
              </Button>
            )}
          </>
        }
      >
        <div className="space-y-6">
          <div className="text-center py-8 bg-slate-50 rounded-xl">
            <div className="w-24 h-24 mx-auto mb-4 bg-white rounded-full flex items-center justify-center shadow-lg">
              <QrCode className="w-12 h-12 text-primary-500" />
            </div>
            <p className="text-slate-600 mb-4">扫描物流单二维码或输入物流单号</p>
          </div>

          <div className="flex gap-3">
            <Input
              placeholder="请输入或扫描物流单号"
              value={scanInput}
              onChange={(e) => setScanInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleScan()}
              wrapperClassName="flex-1"
            />
            <Button variant="primary" onClick={handleScan} loading={scanning}>
              查询
            </Button>
          </div>

          {scanResult && (
            <Card padding="sm" className={cn(
              scanResult.hasException ? 'border-danger-200 bg-danger-50/30' : ''
            )}>
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="font-semibold text-slate-900 text-lg">{scanResult.trackingNo}</div>
                  <div className="text-sm text-slate-500 mt-1">订单号：{scanResult.orderCode}</div>
                </div>
                <Badge variant={getStatusConfig(scanResult.status).variant} size="lg">
                  {getStatusConfig(scanResult.status).label}
                </Badge>
              </div>

              {scanResult.hasException && (
                <div className="mb-4 p-3 bg-danger-50 rounded-lg">
                  <div className="flex items-start gap-2">
                    <AlertTriangle className="w-4 h-4 text-danger-500 flex-shrink-0 mt-0.5" />
                    <div className="text-sm text-danger-700">
                      <p className="font-medium">{scanResult.exceptionType}</p>
                      <p className="mt-1">{scanResult.exceptionDescription}</p>
                    </div>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4 text-sm mb-4">
                <div>
                  <span className="text-slate-500">供应商：</span>
                  <span className="text-slate-700">{scanResult.supplierName}</span>
                </div>
                <div>
                  <span className="text-slate-500">承运商：</span>
                  <span className="text-slate-700">{scanResult.carrier}</span>
                </div>
                <div>
                  <span className="text-slate-500">运输方式：</span>
                  <span className="text-slate-700">{scanResult.transportModeName}</span>
                </div>
                <div>
                  <span className="text-slate-500">当前位置：</span>
                  <span className="text-slate-700 font-medium text-primary-600">{scanResult.currentLocation}</span>
                </div>
              </div>

              <div className="p-4 bg-primary-50 rounded-lg">
                <div className="text-sm font-medium text-primary-800 mb-2">货物信息</div>
                <div className="space-y-2 text-sm">
                  {scanResult.packages.map((pkg, index) => (
                    <div key={pkg.id} className="flex justify-between">
                      <span className="text-slate-600">{pkg.items}</span>
                      <span className="text-slate-700 font-medium">数量：{pkg.quantity}</span>
                    </div>
                  ))}
                  <div className="pt-2 mt-2 border-t border-primary-100 flex justify-between font-medium">
                    <span className="text-primary-700">合计</span>
                    <span className="text-primary-700">{scanResult.packages?.length || 0} 件包裹</span>
                  </div>
                </div>
              </div>

              {scanResult.status === 'delivered' ? (
                <div className="mt-4 p-4 bg-success-50 rounded-lg">
                  <div className="flex items-center gap-2 text-success-700">
                    <CheckCircle className="w-5 h-5" />
                    <span className="font-medium">该货物已签收</span>
                  </div>
                  <div className="text-sm text-success-600 mt-1">
                    签收人：{scanResult.packages[0]?.receivedBy || scanResult.signedBy}，签收时间：{formatDateTime(scanResult.packages[0]?.receivedAt || scanResult.signedAt)}
                  </div>
                </div>
              ) : (
                <div className="mt-4">
                  <label className="block text-sm font-medium text-slate-700 mb-2">签收人</label>
                  <Input
                    placeholder="请输入签收人姓名"
                    value={signatory}
                    onChange={(e) => setSignatory(e.target.value)}
                  />
                  <p className="mt-2 text-xs text-slate-500">
                    <AlertCircle className="w-3.5 h-3.5 inline mr-1" />
                    确认收货后，系统将自动创建质检单并通知质检部门。
                  </p>
                </div>
              )}
            </Card>
          )}
        </div>
      </Modal>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h1 className="text-2xl font-bold text-slate-900">物流计划</h1>
          <Button
            variant="primary"
            icon={<Plus className="w-4 h-4" />}
            onClick={() => setShowCreateModal(true)}
          >
            生成物流计划
          </Button>
          <Button
            variant="secondary"
            icon={<QrCode className="w-4 h-4" />}
            onClick={() => setShowScanModal(true)}
          >
            扫码收货
          </Button>
          {exceptionCount > 0 && (
            <Badge variant="danger" className="flex items-center gap-1">
              <Bell className="w-3 h-3" />
              {exceptionCount} 个异常
            </Badge>
          )}
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
        searchPlaceholder="搜索物流单号、承运商、订单号..."
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
            dataSource={logisticsList}
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
      {renderScanModal()}

      <Modal
        open={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="生成物流计划"
        footer={
          <>
            <Button variant="secondary" onClick={() => setShowCreateModal(false)}>
              取消
            </Button>
            <Button variant="primary" onClick={() => {
              alert('物流计划生成功能开发中');
              setShowCreateModal(false);
            }}>
              生成
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <div className="text-sm text-slate-500">
            系统将根据订单信息自动生成物流计划，选择合适的运输方式和承运商。
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">关联订单</label>
              <Select
                options={[
                  { label: '请选择订单', value: '' },
                  { label: 'PO-2024-0016 - 华为技术', value: 'O016' },
                  { label: 'PO-2024-0017 - 三星电子', value: 'O017' },
                ]}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">运输方式</label>
              <Select
                options={[
                  { label: '请选择运输方式', value: '' },
                  ...transportMethodOptions,
                ]}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">预计发货日期</label>
              <Input type="date" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">预计到达日期</label>
              <Input type="date" />
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
}
