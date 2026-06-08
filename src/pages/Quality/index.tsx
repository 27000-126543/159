import { useState, useEffect, useMemo } from 'react';
import {
  Search,
  Eye,
  RefreshCw,
  Plus,
  Package,
  User,
  Calendar,
  AlertTriangle,
  CheckCircle,
  XCircle,
  RotateCcw,
  ArrowLeftRight,
  FileText,
  Upload,
  Download,
  TrendingUp,
  Clock,
  MapPin,
  Phone,
  Mail,
  ChevronDown,
  ChevronRight,
  X,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { qualityService } from '@/mock/services/qualityService';
import { QualityInspection, QualityReturnDetail } from '@/mock/data/quality';
import { formatCurrency, formatDate, formatDateTime, formatPercent } from '@/utils/format';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Table, { TableColumn } from '@/components/ui/Table';
import StatusBadge from '@/components/business/StatusBadge';
import FilterPanel from '@/components/business/FilterPanel';
import Badge from '@/components/ui/Badge';
import Modal from '@/components/ui/Modal';
import Pagination from '@/components/business/Pagination';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';

const statusTabs = [
  { key: '', label: '全部', status: 'default' },
  { key: 'pending', label: '待质检', status: 'warning' },
  { key: 'inspecting', label: '质检中', status: 'primary' },
  { key: 'passed', label: '已通过', status: 'success' },
  { key: 'failed', label: '不合格', status: 'danger' },
  { key: 'conditional_pass', label: '部分合格', status: 'warning' },
];

const resultOptions = [
  { label: '合格', value: 'pass' },
  { label: '不合格', value: 'fail' },
  { label: '部分合格', value: 'conditional_pass' },
];

const supplierOptions = [
  { label: '深圳华为技术有限公司', value: 'S001' },
  { label: '德国西门子股份公司', value: 'S004' },
  { label: '日本三菱电机株式会社', value: 'S005' },
  { label: '鞍钢股份有限公司', value: 'S012' },
  { label: '瑞士ABB集团', value: 'S014' },
  { label: '韩国三星电子', value: 'S007' },
  { label: '沈阳机床股份有限公司', value: 'S003' },
  { label: '武汉凡谷电子技术股份有限公司', value: 'S010' },
  { label: '华为数字能源技术有限公司', value: 'S020' },
];

const returnStatusOptions = [
  { label: '待确认', value: 'pending' },
  { label: '已确认', value: 'confirmed' },
  { label: '运输中', value: 'in_transit' },
  { label: '已收到', value: 'received' },
  { label: '已完成', value: 'completed' },
];

const processingMethodOptions = [
  { label: '退款', value: 'refund' },
  { label: '换货', value: 'replacement' },
  { label: '返工', value: 'rework' },
  { label: '折扣', value: 'discount' },
];

const getResultConfig = (result: string) => {
  const config: Record<string, { label: string; variant: 'primary' | 'success' | 'warning' | 'danger' | 'default' }> = {
    pass: { label: '合格', variant: 'success' },
    fail: { label: '不合格', variant: 'danger' },
    conditional_pass: { label: '部分合格', variant: 'warning' },
    pending: { label: '待判定', variant: 'default' },
  };
  return config[result] || { label: result, variant: 'default' };
};

const getReturnStatusConfig = (status: string) => {
  const config: Record<string, { label: string; variant: 'primary' | 'success' | 'warning' | 'danger' | 'default' }> = {
    pending: { label: '待确认', variant: 'warning' },
    confirmed: { label: '已确认', variant: 'primary' },
    in_transit: { label: '运输中', variant: 'primary' },
    received: { label: '已收到', variant: 'success' },
    completed: { label: '已完成', variant: 'success' },
    processing: { label: '处理中', variant: 'warning' },
  };
  return config[status] || { label: status, variant: 'default' };
};

const getProcessingMethodLabel = (method: string) => {
  const labels: Record<string, string> = {
    refund: '退款',
    replacement: '换货',
    rework: '返工',
    discount: '折扣',
  };
  return labels[method] || method;
};

const getStatusLabel = (status: string) => {
  const labels: Record<string, string> = {
    draft: '草稿',
    inspecting: '质检中',
    completed: '已完成',
    returned: '已退货',
    closed: '已关闭',
    pending: '待质检',
  };
  return labels[status] || status;
};

export default function QualityPage() {
  const [qualityList, setQualityList] = useState<QualityInspection[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('');
  const [activeMainTab, setActiveMainTab] = useState<'inspection' | 'return'>('inspection');
  const [filterParams, setFilterParams] = useState<Record<string, unknown>>({});
  const [statistics, setStatistics] = useState<any>(null);

  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showReturnModal, setShowReturnModal] = useState(false);
  const [showReturnDetailModal, setShowReturnDetailModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedQuality, setSelectedQuality] = useState<QualityInspection | null>(null);
  const [selectedReturn, setSelectedReturn] = useState<QualityReturnDetail | null>(null);
  const [processingReturn, setProcessingReturn] = useState(false);
  const [returnType, setReturnType] = useState<'full' | 'partial' | 'discount' | 'rework'>('full');
  const [returnReason, setReturnReason] = useState('');
  const [returnRemark, setReturnRemark] = useState('');
  const [discountRate, setDiscountRate] = useState(10);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);

  const returnList = useMemo(() => {
    return qualityList
      .filter(q => q.hasReturn && q.returnDetail)
      .map(q => ({
        ...q.returnDetail!,
        qualityId: q.id,
        qualityCode: q.code,
        supplierName: q.supplierName,
        orderCode: q.orderCode,
        productName: q.productName,
      }));
  }, [qualityList]);

  const fetchQualityList = async (params: Record<string, unknown> = {}) => {
    setLoading(true);
    try {
      const result = await qualityService.getQualityList({
        ...filterParams,
        ...params,
        page,
        pageSize,
      });
      setQualityList(result.list);
      setTotal(result.total);
    } catch (error) {
      console.error('获取质检列表失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStatistics = async () => {
    try {
      const stats = await qualityService.getQualityStatistics();
      setStatistics(stats);
    } catch (error) {
      console.error('获取统计数据失败:', error);
    }
  };

  useEffect(() => {
    fetchQualityList();
    fetchStatistics();
  }, [activeTab, page, pageSize]);

  const handleFilterChange = (params: Record<string, unknown>) => {
    setFilterParams(params);
    setPage(1);
    fetchQualityList({ ...params, page: 1 });
  };

  const handleTabChange = (key: string) => {
    setActiveTab(key);
    setPage(1);
  };

  const handlePageChange = (newPage: number, newPageSize?: number) => {
    const size = newPageSize || pageSize;
    setPage(newPage);
    setPageSize(size);
    fetchQualityList({ page: newPage, pageSize: size });
  };

  const handleViewDetail = async (quality: QualityInspection) => {
    setSelectedQuality(quality);
    setShowDetailModal(true);
  };

  const handleProcessReturn = (quality: QualityInspection) => {
    setSelectedQuality(quality);
    setReturnType('full');
    setReturnReason('');
    setReturnRemark('');
    setDiscountRate(10);
    setSelectedItems([]);
    setShowReturnModal(true);
  };

  const handleReinspect = async (quality: QualityInspection) => {
    if (!confirm(`确定要对质检单 ${quality.code} 发起重新质检吗？`)) return;
    try {
      const updated = await qualityService.updateQuality(quality.id, {
        status: 'inspecting',
        overallResult: 'pending',
      });
      if (updated) {
        fetchQualityList();
      }
    } catch (error) {
      console.error('重新质检失败:', error);
    }
  };

  const handleConfirmReturn = async () => {
    if (!selectedQuality) return;
    setProcessingReturn(true);
    try {
      let returnQuantity = selectedQuality.failQuantity;
      let returnReasonText = returnReason;
      let returnAmount = 0;
      let processingMethod: 'refund' | 'replacement' | 'rework' | 'discount' = 'refund';

      if (returnType === 'partial') {
        const items = selectedQuality.items.filter(item => selectedItems.includes(item.id));
        returnQuantity = items.reduce((sum, item) => sum + item.failSize, 0);
        returnAmount = returnQuantity * (selectedQuality.receivedQuantity > 0 ? 100 : 0);
        processingMethod = 'replacement';
        returnReasonText = returnReason || '部分产品不合格，退回换货';
      } else if (returnType === 'discount') {
        returnQuantity = selectedQuality.failQuantity;
        const unitPrice = 100;
        returnAmount = returnQuantity * unitPrice * (discountRate / 100);
        processingMethod = 'discount';
        returnReasonText = returnReason || `折扣接收，折扣率${discountRate}%`;
      } else if (returnType === 'rework') {
        returnQuantity = selectedQuality.failQuantity;
        processingMethod = 'rework';
        returnReasonText = returnReason || '产品不合格，退回供应商返工';
      } else {
        returnQuantity = selectedQuality.failQuantity;
        processingMethod = 'refund';
        returnReasonText = returnReason || '产品不合格，全部退货退款';
      }

      const result = await qualityService.processReturn({
        qualityId: selectedQuality.id,
        returnQuantity,
        returnReason: returnReasonText,
        returnAmount,
        processingMethod,
        remark: returnRemark,
      });

      if (result) {
        setShowReturnModal(false);
        setShowDetailModal(false);
        fetchQualityList();
        fetchStatistics();
        alert(`退货处理成功！退货单号：${result.id}`);
      }
    } catch (error) {
      console.error('退货处理失败:', error);
    } finally {
      setProcessingReturn(false);
    }
  };

  const handleViewReturnDetail = (returnDetail: QualityReturnDetail & { qualityCode: string; supplierName: string }) => {
    setSelectedReturn(returnDetail);
    setShowReturnDetailModal(true);
  };

  const handleConfirmReceived = async (returnDetail: QualityReturnDetail & { qualityId: string }) => {
    if (!confirm('确定已收到退货吗？')) return;
    try {
      const result = await qualityService.updateReturnStatus(returnDetail.qualityId, 'completed', new Date().toISOString().split('T')[0]);
      if (result) {
        fetchQualityList();
        setShowReturnDetailModal(false);
      }
    } catch (error) {
      console.error('确认收货失败:', error);
    }
  };

  const handleCompleteReturn = async (returnDetail: QualityReturnDetail & { qualityId: string }) => {
    if (!confirm('确定完成退货处理吗？')) return;
    try {
      const result = await qualityService.updateReturnStatus(returnDetail.qualityId, 'completed', new Date().toISOString().split('T')[0]);
      if (result) {
        fetchQualityList();
        setShowReturnDetailModal(false);
      }
    } catch (error) {
      console.error('完成退货失败:', error);
    }
  };

  const handleItemSelect = (itemId: string) => {
    setSelectedItems(prev =>
      prev.includes(itemId) ? prev.filter(id => id !== itemId) : [...prev, itemId]
    );
  };

  const qualityColumns: TableColumn<QualityInspection>[] = [
    {
      key: 'code',
      title: '质检单号',
      width: 140,
      render: (_value, row) => (
        <span className="font-medium text-primary-600">{row.code}</span>
      ),
    },
    {
      key: 'orderCode',
      title: '关联订单号',
      width: 140,
      render: (_value, row) => <span className="text-gray-600">{row.orderCode}</span>,
    },
    {
      key: 'supplierName',
      title: '供应商',
      width: 180,
      render: (_value, row) => <span className="text-gray-800 truncate block max-w-[160px]">{row.supplierName}</span>,
    },
    {
      key: 'productName',
      title: '产品名称',
      width: 180,
      render: (_value, row) => <span className="text-gray-800 truncate block max-w-[160px]">{row.productName}</span>,
    },
    {
      key: 'inspectorName',
      title: '质检员',
      width: 100,
      render: (_value, row) => <span className="text-gray-600">{row.inspectorName}</span>,
    },
    {
      key: 'inspectionDate',
      title: '质检日期',
      width: 120,
      render: (_value, row) => <span className="text-gray-600">{formatDate(row.inspectionDate)}</span>,
    },
    {
      key: 'overallResult',
      title: '质检结果',
      width: 120,
      render: (_value, row) => {
        const config = getResultConfig(row.overallResult);
        return <Badge variant={config.variant} dot>{config.label}</Badge>;
      },
    },
    {
      key: 'passRate',
      title: '合格率',
      width: 100,
      render: (_value, row) => {
        const rate = row.inspectedQuantity > 0 ? (row.passQuantity / row.inspectedQuantity) * 100 : 0;
        return (
          <span className={cn(
            'font-medium',
            rate >= 98 ? 'text-success-600' : rate >= 90 ? 'text-warning-600' : 'text-danger-600'
          )}>
            {formatPercent(rate)}
          </span>
        );
      },
    },
    {
      key: 'actions',
      title: '操作',
      width: 220,
      render: (_value, row) => (
        <div className="flex gap-2">
          <Button
            variant="ghost"
            size="sm"
            icon={<Eye size={16} />}
            onClick={() => handleViewDetail(row)}
          >
            详情
          </Button>
          {row.overallResult === 'fail' || row.failQuantity > 0 ? (
            !row.hasReturn && (
              <Button
                variant="ghost"
                size="sm"
                icon={<ArrowLeftRight size={16} />}
                className="text-danger-600"
                onClick={() => handleProcessReturn(row)}
              >
                退货处理
              </Button>
            )
          ) : null}
          {row.status === 'completed' && (
            <Button
              variant="ghost"
              size="sm"
              icon={<RotateCcw size={16} />}
              onClick={() => handleReinspect(row)}
            >
              重新质检
            </Button>
          )}
        </div>
      ),
    },
  ];

  const returnColumns: TableColumn<any>[] = [
    {
      key: 'id',
      title: '退货单号',
      width: 140,
      render: (_value, row: any) => (
        <span className="font-medium text-primary-600">{row.id}</span>
      ),
    },
    {
      key: 'qualityCode',
      title: '关联质检单',
      width: 140,
      render: (_value, row: any) => <span className="text-gray-600">{row.qualityCode}</span>,
    },
    {
      key: 'supplierName',
      title: '供应商',
      width: 180,
      render: (_value, row: any) => <span className="text-gray-800 truncate block max-w-[160px]">{row.supplierName}</span>,
    },
    {
      key: 'returnReason',
      title: '退货原因',
      width: 200,
      render: (_value, row: any) => <span className="text-gray-600 truncate block max-w-[180px]">{row.returnReason}</span>,
    },
    {
      key: 'processingMethod',
      title: '处理方式',
      width: 100,
      render: (_value, row: any) => <span className="text-gray-600">{getProcessingMethodLabel(row.processingMethod)}</span>,
    },
    {
      key: 'processingStatus',
      title: '状态',
      width: 100,
      render: (_value, row: any) => {
        const config = getReturnStatusConfig(row.processingStatus);
        return <Badge variant={config.variant} dot>{config.label}</Badge>;
      },
    },
    {
      key: 'returnDate',
      title: '创建时间',
      width: 120,
      render: (_value, row: any) => <span className="text-gray-600">{formatDate(row.returnDate)}</span>,
    },
    {
      key: 'actions',
      title: '操作',
      width: 180,
      render: (_value, row: any) => (
        <div className="flex gap-2">
          <Button
            variant="ghost"
            size="sm"
            icon={<Eye size={16} />}
            onClick={() => handleViewReturnDetail(row)}
          >
            详情
          </Button>
          {row.processingStatus === 'processing' && (
            <Button
              variant="ghost"
              size="sm"
              icon={<Package size={16} />}
              className="text-success-600"
              onClick={() => handleConfirmReceived(row)}
            >
              确认收到
            </Button>
          )}
          {row.processingStatus === 'received' && (
            <Button
              variant="ghost"
              size="sm"
              icon={<CheckCircle size={16} />}
              className="text-success-600"
              onClick={() => handleCompleteReturn(row)}
            >
              完成
            </Button>
          )}
        </div>
      ),
    },
  ];

  const renderDetailModal = () => {
    if (!selectedQuality) return null;
    const passRate = selectedQuality.inspectedQuantity > 0
      ? (selectedQuality.passQuantity / selectedQuality.inspectedQuantity) * 100
      : 0;

    return (
      <Modal
        open={showDetailModal}
        onClose={() => setShowDetailModal(false)}
        title="质检单详情"
        width="xl"
        footer={
          <div className="flex justify-end gap-3">
            {(selectedQuality.overallResult === 'fail' || selectedQuality.failQuantity > 0) && !selectedQuality.hasReturn && (
              <Button
                variant="danger"
                icon={<ArrowLeftRight size={16} />}
                onClick={() => {
                  setShowDetailModal(false);
                  handleProcessReturn(selectedQuality);
                }}
              >
                退货处理
              </Button>
            )}
            {selectedQuality.status === 'completed' && (
              <Button
                variant="secondary"
                icon={<RotateCcw size={16} />}
                onClick={() => {
                  handleReinspect(selectedQuality);
                }}
              >
                重新质检
              </Button>
            )}
            <Button
              variant="outline"
              onClick={() => setShowDetailModal(false)}
            >
              关闭
            </Button>
          </div>
        }
      >
        <div className="space-y-6">
          <Card>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <p className="text-sm text-gray-500 mb-1">质检单号</p>
                <p className="font-medium text-gray-800">{selectedQuality.code}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">关联订单号</p>
                <p className="font-medium text-gray-800">{selectedQuality.orderCode}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">供应商</p>
                <p className="font-medium text-gray-800 truncate">{selectedQuality.supplierName}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">质检状态</p>
                <Badge variant={selectedQuality.status === 'completed' ? 'success' : selectedQuality.status === 'returned' ? 'danger' : 'primary'} dot>
                  {getStatusLabel(selectedQuality.status)}
                </Badge>
              </div>
            </div>
          </Card>

          <Card>
            <h4 className="font-medium text-gray-800 mb-4">质检概览</h4>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <div className="text-center p-3 bg-gray-50 rounded-lg">
                <p className="text-2xl font-bold text-gray-800">{selectedQuality.receivedQuantity}</p>
                <p className="text-sm text-gray-500">收货数量</p>
              </div>
              <div className="text-center p-3 bg-gray-50 rounded-lg">
                <p className="text-2xl font-bold text-primary-600">{selectedQuality.inspectedQuantity}</p>
                <p className="text-sm text-gray-500">抽检数量</p>
              </div>
              <div className="text-center p-3 bg-success-50 rounded-lg">
                <p className="text-2xl font-bold text-success-600">{selectedQuality.passQuantity}</p>
                <p className="text-sm text-gray-500">合格数量</p>
              </div>
              <div className="text-center p-3 bg-danger-50 rounded-lg">
                <p className="text-2xl font-bold text-danger-600">{selectedQuality.failQuantity}</p>
                <p className="text-sm text-gray-500">不合格数量</p>
              </div>
              <div className="text-center p-3 bg-warning-50 rounded-lg">
                <p className="text-2xl font-bold text-warning-600">{formatPercent(passRate)}</p>
                <p className="text-sm text-gray-500">合格率</p>
              </div>
            </div>
          </Card>

          <Card>
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-medium text-gray-800">质检明细</h4>
              <Badge variant={getResultConfig(selectedQuality.overallResult).variant}>
                总体结果：{getResultConfig(selectedQuality.overallResult).label}
              </Badge>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">检验项目</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">检验标准</th>
                    <th className="text-center py-3 px-4 text-sm font-medium text-gray-600">抽检数</th>
                    <th className="text-center py-3 px-4 text-sm font-medium text-gray-600">合格数</th>
                    <th className="text-center py-3 px-4 text-sm font-medium text-gray-600">不合格数</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">测量值</th>
                    <th className="text-center py-3 px-4 text-sm font-medium text-gray-600">结果</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">备注</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedQuality.items.map((item) => (
                    <tr key={item.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-4 text-sm text-gray-800">{item.name}</td>
                      <td className="py-3 px-4 text-sm text-gray-600">{item.standard}</td>
                      <td className="py-3 px-4 text-sm text-gray-600 text-center">{item.sampleSize}</td>
                      <td className="py-3 px-4 text-sm text-success-600 text-center font-medium">{item.passSize}</td>
                      <td className="py-3 px-4 text-sm text-danger-600 text-center font-medium">{item.failSize}</td>
                      <td className="py-3 px-4 text-sm text-gray-600">{item.measuredValue}</td>
                      <td className="py-3 px-4 text-center">
                        <Badge variant={item.result === 'pass' ? 'success' : item.result === 'fail' ? 'danger' : 'default'}>
                          {item.result === 'pass' ? '合格' : item.result === 'fail' ? '不合格' : '待检'}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-500">{item.remark || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>

          <Card>
            <h4 className="font-medium text-gray-800 mb-4">质检信息</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <p className="text-sm text-gray-500 mb-1">质检类型</p>
                <p className="text-gray-800">
                  {selectedQuality.inspectionType === 'incoming' ? '来料检验' :
                   selectedQuality.inspectionType === 'in_process' ? '过程检验' :
                   selectedQuality.inspectionType === 'final' ? '最终检验' : '复检'}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">检验标准</p>
                <p className="text-gray-800">{selectedQuality.inspectionStandard}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">质检员</p>
                <p className="text-gray-800">{selectedQuality.inspectorName}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">质检日期</p>
                <p className="text-gray-800">{formatDate(selectedQuality.inspectionDate)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">批次号</p>
                <p className="text-gray-800">{selectedQuality.batchNo}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">生产日期</p>
                <p className="text-gray-800">{formatDate(selectedQuality.productionDate)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">收货日期</p>
                <p className="text-gray-800">{formatDate(selectedQuality.receivedDate)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">产品规格</p>
                <p className="text-gray-800">{selectedQuality.productSpec}</p>
              </div>
            </div>
          </Card>

          {selectedQuality.remark && (
            <Card>
              <h4 className="font-medium text-gray-800 mb-2">质检备注</h4>
              <p className="text-gray-600">{selectedQuality.remark}</p>
            </Card>
          )}

          {selectedQuality.attachments.length > 0 && (
            <Card>
              <h4 className="font-medium text-gray-800 mb-4">质检附件</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {selectedQuality.attachments.map((file, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors"
                  >
                    <FileText size={20} className="text-primary-500" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-800 truncate">{file}</p>
                    </div>
                    <Download size={16} className="text-gray-400" />
                  </div>
                ))}
              </div>
            </Card>
          )}

          {selectedQuality.returnDetail && (
            <Card className="border-danger-200 bg-danger-50/30">
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-medium text-danger-800">退货信息</h4>
                <Badge variant="danger" dot>
                  {getReturnStatusConfig(selectedQuality.returnDetail.processingStatus).label}
                </Badge>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <p className="text-sm text-gray-500 mb-1">退货单号</p>
                  <p className="font-medium text-gray-800">{selectedQuality.returnDetail.id}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">退货数量</p>
                  <p className="font-medium text-gray-800">{selectedQuality.returnDetail.returnQuantity}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">处理方式</p>
                  <p className="font-medium text-gray-800">{getProcessingMethodLabel(selectedQuality.returnDetail.processingMethod)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">退货日期</p>
                  <p className="font-medium text-gray-800">{formatDate(selectedQuality.returnDetail.returnDate)}</p>
                </div>
              </div>
              {selectedQuality.returnDetail.returnAmount > 0 && (
                <div className="mt-4 pt-4 border-t border-danger-200">
                  <p className="text-sm text-gray-500 mb-1">退货金额</p>
                  <p className="text-xl font-bold text-danger-600">
                    {formatCurrency(selectedQuality.returnDetail.returnAmount, 'CNY')}
                  </p>
                </div>
              )}
              {selectedQuality.returnDetail.remark && (
                <div className="mt-4">
                  <p className="text-sm text-gray-500 mb-1">处理备注</p>
                  <p className="text-gray-700">{selectedQuality.returnDetail.remark}</p>
                </div>
              )}
            </Card>
          )}
        </div>
      </Modal>
    );
  };

  const renderReturnModal = () => {
    if (!selectedQuality) return null;

    return (
      <Modal
        open={showReturnModal}
        onClose={() => setShowReturnModal(false)}
        title="退货处理"
        width="lg"
        footer={
          <div className="flex justify-end gap-3">
            <Button
              variant="outline"
              onClick={() => setShowReturnModal(false)}
            >
              取消
            </Button>
            <Button
              variant="danger"
              loading={processingReturn}
              onClick={handleConfirmReturn}
            >
              确认退货
            </Button>
          </div>
        }
      >
        <div className="space-y-6">
          <div className="flex items-center gap-3 p-4 bg-warning-50 rounded-lg border border-warning-200">
            <AlertTriangle className="text-warning-500 flex-shrink-0" size={24} />
            <div>
              <p className="font-medium text-warning-800">质检不合格信息</p>
              <p className="text-sm text-warning-600">
                产品：{selectedQuality.productName}，不合格数量：{selectedQuality.failQuantity}
              </p>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              请选择退货处理方式
            </label>
            <div className="grid grid-cols-2 gap-3">
              {[
                { key: 'full', label: '全部退货', icon: Package, desc: '所有不合格产品全部退回' },
                { key: 'partial', label: '部分退货', icon: ArrowLeftRight, desc: '选择部分产品退货' },
                { key: 'discount', label: '折扣接收', icon: TrendingUp, desc: '协商折扣后接收' },
                { key: 'rework', label: '返工处理', icon: RefreshCw, desc: '退回供应商返工' },
              ].map((item) => (
                <div
                  key={item.key}
                  className={cn(
                    'p-4 border-2 rounded-lg cursor-pointer transition-all',
                    returnType === item.key
                      ? 'border-primary-500 bg-primary-50'
                      : 'border-gray-200 hover:border-primary-300'
                  )}
                  onClick={() => setReturnType(item.key as any)}
                >
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      'p-2 rounded-lg',
                      returnType === item.key ? 'bg-primary-100' : 'bg-gray-100'
                    )}>
                      <item.icon size={20} className={returnType === item.key ? 'text-primary-600' : 'text-gray-500'} />
                    </div>
                    <div>
                      <p className="font-medium text-gray-800">{item.label}</p>
                      <p className="text-sm text-gray-500">{item.desc}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {returnType === 'partial' && (
            <Card>
              <h4 className="font-medium text-gray-800 mb-3">请选择需要退货的检验项</h4>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {selectedQuality.items.filter(item => item.failSize > 0).map((item) => (
                  <label
                    key={item.id}
                    className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100"
                  >
                    <input
                      type="checkbox"
                      checked={selectedItems.includes(item.id)}
                      onChange={() => handleItemSelect(item.id)}
                      className="w-4 h-4 text-primary-600 rounded"
                    />
                    <div className="flex-1">
                      <p className="font-medium text-gray-800">{item.name}</p>
                      <p className="text-sm text-gray-500">不合格数量：{item.failSize}</p>
                    </div>
                  </label>
                ))}
              </div>
            </Card>
          )}

          {returnType === 'discount' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                折扣率（%）
              </label>
              <Input
                type="number"
                value={discountRate}
                onChange={(e) => setDiscountRate(Number(e.target.value))}
                min={0}
                max={100}
                placeholder="请输入折扣率"
              />
              <p className="text-sm text-gray-500 mt-1">
                预计扣款金额：{formatCurrency(selectedQuality.failQuantity * 100 * (discountRate / 100), 'CNY')}
              </p>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              退货原因
            </label>
            <Input
              value={returnReason}
              onChange={(e) => setReturnReason(e.target.value)}
              placeholder="请输入退货原因"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              处理备注
            </label>
            <textarea
              value={returnRemark}
              onChange={(e) => setReturnRemark(e.target.value)}
              placeholder="请输入处理备注（可选）"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 min-h-[80px]"
            />
          </div>
        </div>
      </Modal>
    );
  };

  const renderReturnDetailModal = () => {
    if (!selectedReturn) return null;
    const returnDetail = selectedReturn as any;

    return (
      <Modal
        open={showReturnDetailModal}
        onClose={() => setShowReturnDetailModal(false)}
        title="退货单详情"
        width="lg"
        footer={
          <div className="flex justify-end gap-3">
            {returnDetail.processingStatus === 'processing' && (
              <Button
                variant="success"
                icon={<Package size={16} />}
                onClick={() => handleConfirmReceived(returnDetail)}
              >
                确认收到
              </Button>
            )}
            {returnDetail.processingStatus === 'received' && (
              <Button
                variant="success"
                icon={<CheckCircle size={16} />}
                onClick={() => handleCompleteReturn(returnDetail)}
              >
                完成
              </Button>
            )}
            <Button
              variant="outline"
              onClick={() => setShowReturnDetailModal(false)}
            >
              关闭
            </Button>
          </div>
        }
      >
        <div className="space-y-6">
          <Card>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <p className="text-sm text-gray-500 mb-1">退货单号</p>
                <p className="font-medium text-gray-800">{returnDetail.id}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">关联质检单</p>
                <p className="font-medium text-gray-800">{returnDetail.qualityCode}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">供应商</p>
                <p className="font-medium text-gray-800 truncate">{returnDetail.supplierName}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">状态</p>
                <Badge variant={getReturnStatusConfig(returnDetail.processingStatus).variant} dot>
                  {getReturnStatusConfig(returnDetail.processingStatus).label}
                </Badge>
              </div>
            </div>
          </Card>

          <Card>
            <h4 className="font-medium text-gray-800 mb-4">退货信息</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <p className="text-sm text-gray-500 mb-1">退货数量</p>
                <p className="font-medium text-gray-800">{returnDetail.returnQuantity}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">处理方式</p>
                <p className="font-medium text-gray-800">{getProcessingMethodLabel(returnDetail.processingMethod)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">退货日期</p>
                <p className="font-medium text-gray-800">{formatDate(returnDetail.returnDate)}</p>
              </div>
              {returnDetail.completedDate && (
                <div>
                  <p className="text-sm text-gray-500 mb-1">完成日期</p>
                  <p className="font-medium text-gray-800">{formatDate(returnDetail.completedDate)}</p>
                </div>
              )}
            </div>
            {returnDetail.returnAmount > 0 && (
              <div className="mt-4 pt-4 border-t border-gray-200">
                <p className="text-sm text-gray-500 mb-1">退货金额</p>
                <p className="text-xl font-bold text-danger-600">
                  {formatCurrency(returnDetail.returnAmount, 'CNY')}
                </p>
              </div>
            )}
          </Card>

          <Card>
            <h4 className="font-medium text-gray-800 mb-2">退货原因</h4>
            <p className="text-gray-600">{returnDetail.returnReason}</p>
          </Card>

          {returnDetail.remark && (
            <Card>
              <h4 className="font-medium text-gray-800 mb-2">处理备注</h4>
              <p className="text-gray-600">{returnDetail.remark}</p>
            </Card>
          )}
        </div>
      </Modal>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">质检管理</h1>
      </div>

      {statistics && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <div className="flex items-center gap-3">
              <div className="p-3 bg-primary-100 rounded-lg">
                <Package size={24} className="text-primary-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">总质检单</p>
                <p className="text-2xl font-bold text-gray-800">{statistics.total}</p>
              </div>
            </div>
          </Card>
          <Card>
            <div className="flex items-center gap-3">
              <div className="p-3 bg-success-100 rounded-lg">
                <CheckCircle size={24} className="text-success-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">合格率</p>
                <p className="text-2xl font-bold text-success-600">{formatPercent(statistics.passRate)}</p>
              </div>
            </div>
          </Card>
          <Card>
            <div className="flex items-center gap-3">
              <div className="p-3 bg-danger-100 rounded-lg">
                <XCircle size={24} className="text-danger-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">不合格数</p>
                <p className="text-2xl font-bold text-danger-600">{statistics.failCount}</p>
              </div>
            </div>
          </Card>
          <Card>
            <div className="flex items-center gap-3">
              <div className="p-3 bg-warning-100 rounded-lg">
                <ArrowLeftRight size={24} className="text-warning-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">退货数</p>
                <p className="text-2xl font-bold text-warning-600">{statistics.returnCount}</p>
              </div>
            </div>
          </Card>
        </div>
      )}

      <div className="border-b border-gray-200">
        <nav className="flex gap-8">
          <button
            className={cn(
              'py-4 px-1 border-b-2 font-medium text-sm transition-colors',
              activeMainTab === 'inspection'
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            )}
            onClick={() => setActiveMainTab('inspection')}
          >
            质检单列表
          </button>
          <button
            className={cn(
              'py-4 px-1 border-b-2 font-medium text-sm transition-colors flex items-center gap-2',
              activeMainTab === 'return'
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            )}
            onClick={() => setActiveMainTab('return')}
          >
            退货单列表
            {returnList.length > 0 && (
              <Badge variant="danger" size="sm">{returnList.length}</Badge>
            )}
          </button>
        </nav>
      </div>

      {activeMainTab === 'inspection' ? (
        <>
          <FilterPanel
            fields={[
              {
                key: 'keyword',
                label: '关键词',
                type: 'text',
                placeholder: '搜索质检单号、产品名称、批次号',
              },
              {
                key: 'overallResult',
                label: '质检结果',
                type: 'select',
                options: resultOptions,
                placeholder: '全部结果',
              },
              {
                key: 'supplierId',
                label: '供应商',
                type: 'select',
                options: supplierOptions,
                placeholder: '全部供应商',
              },
              {
                key: 'startDate',
                label: '开始日期',
                type: 'date',
              },
              {
                key: 'endDate',
                label: '结束日期',
                type: 'date',
              },
            ]}
            onFilter={handleFilterChange}
            onReset={() => handleFilterChange({})}
          />

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {statusTabs.map((tab) => (
                <Button
                  key={tab.key}
                  variant={activeTab === tab.key ? 'primary' : 'ghost'}
                  size="sm"
                  onClick={() => handleTabChange(tab.key)}
                >
                  {tab.label}
                </Button>
              ))}
            </div>
            <Button
              variant="primary"
              icon={<Plus size={16} />}
              onClick={() => setShowCreateModal(true)}
            >
              新建质检单
            </Button>
          </div>

          <Table
            columns={qualityColumns}
            dataSource={qualityList}
            loading={loading}
            rowKey="id"
            rowClassName={(row) =>
              row.overallResult === 'fail' ? 'bg-danger-50/50' : ''
            }
          />

          <Pagination
            current={page}
            pageSize={pageSize}
            total={total}
            onChange={handlePageChange}
          />
        </>
      ) : (
        <>
          <FilterPanel
            fields={[
              {
                key: 'keyword',
                label: '关键词',
                type: 'text',
                placeholder: '搜索退货单号、质检单号、供应商',
              },
              {
                key: 'processingStatus',
                label: '退货状态',
                type: 'select',
                options: returnStatusOptions,
                placeholder: '全部状态',
              },
              {
                key: 'processingMethod',
                label: '处理方式',
                type: 'select',
                options: processingMethodOptions,
                placeholder: '全部方式',
              },
              {
                key: 'startDate',
                label: '开始日期',
                type: 'date',
              },
              {
                key: 'endDate',
                label: '结束日期',
                type: 'date',
              },
            ]}
            onFilter={() => {}}
            onReset={() => {}}
          />

          <Table
            columns={returnColumns}
            dataSource={returnList}
            loading={loading}
            rowKey="id"
          />

          <Pagination
            current={page}
            pageSize={pageSize}
            total={returnList.length}
            onChange={handlePageChange}
          />
        </>
      )}

      {renderDetailModal()}
      {renderReturnModal()}
      {renderReturnDetailModal()}

      <Modal
        open={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="新建质检单"
        width="md"
        footer={
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setShowCreateModal(false)}>
              取消
            </Button>
            <Button variant="primary" onClick={() => setShowCreateModal(false)}>
              创建
            </Button>
          </div>
        }
      >
        <div className="space-y-4">
          <p className="text-gray-500 text-sm">
            新建质检单功能将在后续版本中提供。您也可以通过扫码收货自动创建质检单。
          </p>
          <div className="p-4 bg-primary-50 rounded-lg border border-primary-200">
            <p className="text-primary-800 font-medium">💡 提示</p>
            <p className="text-primary-700 text-sm mt-1">
              到货后，在物流管理页面点击"扫码收货"按钮，系统将自动创建对应质检单。
            </p>
          </div>
        </div>
      </Modal>
    </div>
  );
}
