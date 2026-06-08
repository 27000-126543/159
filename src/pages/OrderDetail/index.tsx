import { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  FileText,
  ClipboardCheck,
  Truck,
  ShieldCheck,
  DollarSign,
  XCircle,
  PackageCheck,
  FileBarChart,
  MapPin,
  Calendar,
  Banknote,
  Download,
  QrCode,
  CheckCircle,
  X,
  Clock,
  AlertTriangle,
  Camera,
  FileCheck,
  Plus,
  ChevronRight,
} from 'lucide-react';
import { OrderRelations } from '@/store/orderStore';
import { cn } from '@/lib/utils';
import { useOrderStore } from '@/store/orderStore';
import { formatCurrency, formatDate, formatDateTime } from '@/utils/format';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Table, { TableColumn } from '@/components/ui/Table';
import StatusBadge from '@/components/business/StatusBadge';
import ApprovalFlow, { ApprovalNode } from '@/components/business/ApprovalFlow';
import Timeline from '@/components/business/Timeline';
import Badge from '@/components/ui/Badge';
import Modal from '@/components/ui/Modal';
import Input from '@/components/ui/Input';
import { Order, OrderItem, ApprovalRecord } from '@/mock/data/orders';
import { logistics } from '@/mock/data/logistics';
import { qualityData } from '@/mock/data/quality';

const tabs = [
  { key: 'info', label: '订单信息', icon: FileText },
  { key: 'approval', label: '审批流程', icon: ClipboardCheck },
  { key: 'logistics', label: '物流信息', icon: Truck },
  { key: 'quality', label: '质检记录', icon: ShieldCheck },
  { key: 'finance', label: '财务信息', icon: DollarSign },
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

export default function OrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { currentOrder, loading, fetchOrderById, updateOrderStatus, fetchOrderRelations, orderRelations } = useOrderStore();
  const [activeTab, setActiveTab] = useState('info');
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showQrModal, setShowQrModal] = useState(false);
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [relations, setRelations] = useState<OrderRelations>({});

  useEffect(() => {
    if (id) {
      fetchOrderById(id);
      fetchOrderRelations(id).then(setRelations);
    }
  }, [id]);

  useEffect(() => {
    if (id && orderRelations[id]) {
      setRelations(orderRelations[id]);
    }
  }, [id, orderRelations]);

  const orderLogistics = useMemo(() => {
    return logistics.find(l => l.orderId === id);
  }, [id]);

  const orderQuality = useMemo(() => {
    return qualityData.filter(q => q.orderId === id);
  }, [id]);

  const orderItems: TableColumn<OrderItem>[] = [
    {
      key: 'productName',
      title: '产品名称',
      dataIndex: 'productName',
    },
    {
      key: 'productSpec',
      title: '规格',
      dataIndex: 'productSpec',
    },
    {
      key: 'quantity',
      title: '数量',
      dataIndex: 'quantity',
      align: 'right',
      render: (value, record) => `${value} ${record.unit}`,
    },
    {
      key: 'unitPrice',
      title: '单价',
      dataIndex: 'unitPrice',
      align: 'right',
      render: (value, record) => formatCurrency(value as number, record.currency),
    },
    {
      key: 'totalPrice',
      title: '金额',
      dataIndex: 'totalPrice',
      align: 'right',
      render: (value, record) => formatCurrency(value as number, record.currency),
    },
  ];

  const handleCancelOrder = async () => {
    if (!currentOrder) return;
    const result = await updateOrderStatus(currentOrder.id, 'cancelled');
    if (result) {
      setShowCancelModal(false);
    }
  };

  const handleConfirmDelivery = async () => {
    if (!currentOrder) return;
    const result = await updateOrderStatus(currentOrder.id, 'delivered');
    if (result) {
      setShowReceiptModal(false);
      if (id) {
        fetchOrderRelations(id).then(setRelations);
      }
    }
  };

  const handleViewCustoms = () => {
    if (relations.customs) {
      navigate(`/customs`);
    }
  };

  const handleViewLogistics = () => {
    if (relations.logistics) {
      navigate(`/logistics`);
    }
  };

  const handleCreateLogistics = () => {
    alert('生成物流计划功能开发中');
  };

  const handleCreateQuality = () => {
    navigate(`/quality/new?orderId=${id}`);
  };

  const handleViewQuality = () => {
    if (relations.inspection) {
      navigate(`/quality`);
    }
  };

  const handleViewOrCreateSettlement = async () => {
    if (!currentOrder) return;
    
    if (relations.settlement) {
      navigate(`/settlement`);
    } else {
      const result = await updateOrderStatus(currentOrder.id, 'completed');
      if (result && id) {
        fetchOrderRelations(id).then(setRelations);
        navigate(`/settlement`);
      }
    }
  };

  const handleMarkCompleted = async () => {
    if (!currentOrder) return;
    const result = await updateOrderStatus(currentOrder.id, 'completed');
    if (result && id) {
      fetchOrderRelations(id).then(setRelations);
    }
  };

  const approvalNodes = currentOrder ? getApprovalNodes(currentOrder) : [];

  if (!currentOrder && !loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="text-slate-400 mb-4">
          <FileText className="w-16 h-16 mx-auto" />
        </div>
        <p className="text-slate-500 mb-4">订单不存在或已被删除</p>
        <Button variant="primary" onClick={() => navigate('/orders')}>
          返回订单列表
        </Button>
      </div>
    );
  }

  const taxAmount = currentOrder ? currentOrder.totalAmount * 0.13 : 0;
  const grandTotal = currentOrder ? currentOrder.totalAmount + taxAmount : 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="sm"
          icon={<ArrowLeft className="w-4 h-4" />}
          onClick={() => navigate('/orders')}
        >
          返回列表
        </Button>
        <h1 className="text-2xl font-bold text-slate-900">订单详情</h1>
      </div>

      <Card>
        <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6">
          <div className="flex-1 space-y-4">
            <div className="flex items-center gap-4 flex-wrap">
              <div>
                <span className="text-sm text-slate-500">订单号</span>
                <p className="font-semibold text-lg text-slate-900">{currentOrder?.code}</p>
              </div>
              <div className="h-10 w-px bg-slate-200 hidden sm:block" />
              <div>
                <span className="text-sm text-slate-500">供应商</span>
                <p className="font-medium text-slate-900">{currentOrder?.supplierName}</p>
              </div>
              <div className="h-10 w-px bg-slate-200 hidden sm:block" />
              <div>
                <span className="text-sm text-slate-500">总金额</span>
                <p className={cn(
                  'font-bold text-xl',
                  currentOrder && currentOrder.totalAmount > 100000 ? 'text-warning-600' : 'text-primary-600'
                )}>
                  {formatCurrency(grandTotal, currentOrder?.currency || 'CNY')}
                </p>
              </div>
              <div className="h-10 w-px bg-slate-200 hidden sm:block" />
              <StatusBadge
                type="order"
                status={currentOrder ? mapOrderStatus(currentOrder.status) : 'pending'}
                className="text-sm"
              />
              {currentOrder && currentOrder.totalAmount > 100000 && (
                <Badge variant="warning" className="text-sm">
                  <AlertTriangle className="w-3 h-3 mr-1" />
                  大额订单
                </Badge>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 pt-4 border-t border-slate-100">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-primary-50 flex items-center justify-center flex-shrink-0">
                  <MapPin className="w-4 h-4 text-primary-500" />
                </div>
                <div>
                  <p className="text-sm text-slate-500">收货地址</p>
                  <p className="text-sm text-slate-700">{currentOrder?.deliveryAddress}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-success-50 flex items-center justify-center flex-shrink-0">
                  <Calendar className="w-4 h-4 text-success-500" />
                </div>
                <div>
                  <p className="text-sm text-slate-500">交货日期</p>
                  <p className="text-sm text-slate-700">{formatDate(currentOrder?.expectedDeliveryDate)}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-info-50 flex items-center justify-center flex-shrink-0">
                  <Banknote className="w-4 h-4 text-sky-500" />
                </div>
                <div>
                  <p className="text-sm text-slate-500">付款条款</p>
                  <p className="text-sm text-slate-700">{currentOrder?.paymentTerms}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-warning-50 flex items-center justify-center flex-shrink-0">
                  <Clock className="w-4 h-4 text-warning-500" />
                </div>
                <div>
                  <p className="text-sm text-slate-500">创建时间</p>
                  <p className="text-sm text-slate-700">{formatDateTime(currentOrder?.createdAt)}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            {currentOrder?.status === 'pending_approval' && (
              <Button
                variant="outline"
                icon={<XCircle className="w-4 h-4 text-danger-500" />}
                onClick={() => setShowCancelModal(true)}
              >
                取消订单
              </Button>
            )}
            {currentOrder?.status === 'shipping' && (
              <Button
                variant="success"
                icon={<PackageCheck className="w-4 h-4" />}
                onClick={() => setShowReceiptModal(true)}
              >
                确认收货
              </Button>
            )}
            {(currentOrder?.status === 'approved' || currentOrder?.status === 'production') && (
              <Button
                variant="primary"
                icon={<FileBarChart className="w-4 h-4" />}
                onClick={() => alert('生成报关单功能开发中')}
              >
                生成报关单
              </Button>
            )}
            {(currentOrder?.status === 'approved' || currentOrder?.status === 'production') && (
              <Button
                variant="primary"
                icon={<Truck className="w-4 h-4" />}
                onClick={() => alert('生成物流计划功能开发中')}
              >
                生成物流计划
              </Button>
            )}
          </div>
        </div>
      </Card>

      <Card>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
            <FileBarChart className="w-5 h-5 text-primary-500" />
            关联进度
          </h3>
        </div>

        {currentOrder?.status === 'pending_approval' && (
          <div className="space-y-4">
            <div className="p-4 bg-primary-50 rounded-lg">
              <div className="flex items-center gap-3 mb-2">
                <ClipboardCheck className="w-5 h-5 text-primary-500" />
                <span className="font-medium text-slate-900">审批进度</span>
                {currentOrder.isLargeAmount && (
                  <Badge variant="warning" className="text-xs">
                    <AlertTriangle className="w-3 h-3 mr-1" />
                    大额订单
                  </Badge>
                )}
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-3">
                <div className="bg-white p-3 rounded-lg">
                  <p className="text-xs text-slate-500 mb-1">当前节点</p>
                  <p className="font-medium text-slate-900">{currentOrder.currentApprovalNode || '-'}</p>
                </div>
                <div className="bg-white p-3 rounded-lg">
                  <p className="text-xs text-slate-500 mb-1">下一节点</p>
                  <p className="font-medium text-slate-700">{currentOrder.nextApprovalNode || '-'}</p>
                </div>
                <div className="bg-white p-3 rounded-lg">
                  <p className="text-xs text-slate-500 mb-1">审批进度</p>
                  <p className="font-medium text-primary-600">{currentOrder.progress}%</p>
                </div>
                <div className="bg-white p-3 rounded-lg">
                  <p className="text-xs text-slate-500 mb-1">大额标识</p>
                  <p className={`font-medium ${currentOrder.isLargeAmount ? 'text-warning-600' : 'text-slate-600'}`}>
                    {currentOrder.isLargeAmount ? '是' : '否'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {(currentOrder?.status === 'approved' || currentOrder?.status === 'production' || 
          currentOrder?.status === 'shipping' || currentOrder?.status === 'delivered' ||
          currentOrder?.status === 'completed') && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div 
              className={`p-4 rounded-lg border-2 cursor-pointer transition-all hover:shadow-md ${
                relations.customs 
                  ? 'bg-success-50 border-success-200 hover:border-success-400' 
                  : 'bg-slate-50 border-slate-200'
              }`}
              onClick={relations.customs ? handleViewCustoms : undefined}
            >
              <div className="flex items-center justify-between mb-2">
                <FileText className={`w-6 h-6 ${relations.customs ? 'text-success-500' : 'text-slate-400'}`} />
                {relations.customs && (
                  <CheckCircle className="w-5 h-5 text-success-500" />
                )}
              </div>
              <p className={`font-medium ${relations.customs ? 'text-slate-900' : 'text-slate-500'}`}>
                报关单
              </p>
              <p className="text-xs text-slate-500 mt-1">
                {relations.customs ? relations.customs.code : '未生成'}
              </p>
              {relations.customs && (
                <div className="flex items-center gap-1 mt-2 text-xs text-success-600">
                  <span>查看详情</span>
                  <ChevronRight className="w-3 h-3" />
                </div>
              )}
            </div>

            {currentOrder.status === 'approved' && !relations.logistics && (
              <div 
                className="p-4 rounded-lg border-2 border-dashed border-primary-300 bg-primary-50 cursor-pointer hover:bg-primary-100 transition-all hover:shadow-md"
                onClick={handleCreateLogistics}
              >
                <div className="flex items-center justify-between mb-2">
                  <Truck className="w-6 h-6 text-primary-500" />
                  <Plus className="w-5 h-5 text-primary-500" />
                </div>
                <p className="font-medium text-primary-700">生成物流计划</p>
                <p className="text-xs text-primary-500 mt-1">待生产</p>
                <div className="flex items-center gap-1 mt-2 text-xs text-primary-600">
                  <span>点击生成</span>
                  <ChevronRight className="w-3 h-3" />
                </div>
              </div>
            )}

            {(currentOrder.status === 'production' || currentOrder.status === 'shipping' || 
              currentOrder.status === 'delivered' || currentOrder.status === 'completed') && (
              <div 
                className={`p-4 rounded-lg border-2 cursor-pointer transition-all hover:shadow-md ${
                  relations.logistics 
                    ? 'bg-success-50 border-success-200 hover:border-success-400' 
                    : 'bg-slate-50 border-slate-200'
                }`}
                onClick={relations.logistics ? handleViewLogistics : undefined}
              >
                <div className="flex items-center justify-between mb-2">
                  <Truck className={`w-6 h-6 ${relations.logistics ? 'text-success-500' : 'text-slate-400'}`} />
                  {relations.logistics && (
                    <CheckCircle className="w-5 h-5 text-success-500" />
                  )}
                </div>
                <p className={`font-medium ${relations.logistics ? 'text-slate-900' : 'text-slate-500'}`}>
                  物流计划
                </p>
                <p className="text-xs text-slate-500 mt-1">
                  {relations.logistics ? relations.logistics.code : '未生成'}
                </p>
                {relations.logistics && (
                  <div className="flex items-center gap-1 mt-2 text-xs text-success-600">
                    <span>查看详情</span>
                    <ChevronRight className="w-3 h-3" />
                  </div>
                )}
              </div>
            )}

            {currentOrder.status === 'delivered' && (
              <div 
                className="p-4 rounded-lg border-2 border-dashed border-warning-300 bg-warning-50 cursor-pointer hover:bg-warning-100 transition-all hover:shadow-md"
                onClick={handleCreateQuality}
              >
                <div className="flex items-center justify-between mb-2">
                  <ShieldCheck className="w-6 h-6 text-warning-600" />
                  <Plus className="w-5 h-5 text-warning-600" />
                </div>
                <p className="font-medium text-warning-700">发起质检</p>
                <p className="text-xs text-warning-500 mt-1">待质检</p>
                <div className="flex items-center gap-1 mt-2 text-xs text-warning-600">
                  <span>点击发起</span>
                  <ChevronRight className="w-3 h-3" />
                </div>
              </div>
            )}

            {(currentOrder.status === 'delivered' || currentOrder.status === 'completed') && 
              relations.inspection && (
              <div 
                className="p-4 rounded-lg border-2 bg-success-50 border-success-200 cursor-pointer hover:border-success-400 transition-all hover:shadow-md"
                onClick={handleViewQuality}
              >
                <div className="flex items-center justify-between mb-2">
                  <ShieldCheck className="w-6 h-6 text-success-500" />
                  <CheckCircle className="w-5 h-5 text-success-500" />
                </div>
                <p className="font-medium text-slate-900">质检报告</p>
                <p className="text-xs text-slate-500 mt-1">
                  {relations.inspection.code}
                </p>
                <div className="flex items-center gap-1 mt-2 text-xs text-success-600">
                  <span>查看详情</span>
                  <ChevronRight className="w-3 h-3" />
                </div>
              </div>
            )}

            {currentOrder.status === 'completed' && (
              <div 
                className={`p-4 rounded-lg border-2 cursor-pointer transition-all hover:shadow-md ${
                  relations.settlement 
                    ? 'bg-success-50 border-success-200 hover:border-success-400' 
                    : 'bg-primary-50 border-dashed border-primary-300 hover:bg-primary-100'
                }`}
                onClick={handleViewOrCreateSettlement}
              >
                <div className="flex items-center justify-between mb-2">
                  <DollarSign className={`w-6 h-6 ${relations.settlement ? 'text-success-500' : 'text-primary-500'}`} />
                  {relations.settlement ? (
                    <CheckCircle className="w-5 h-5 text-success-500" />
                  ) : (
                    <Plus className="w-5 h-5 text-primary-500" />
                  )}
                </div>
                <p className={`font-medium ${relations.settlement ? 'text-slate-900' : 'text-primary-700'}`}>
                  {relations.settlement ? '查看结算单' : '生成结算单'}
                </p>
                <p className="text-xs text-slate-500 mt-1">
                  {relations.settlement ? relations.settlement.code : '待生成'}
                </p>
                <div className={`flex items-center gap-1 mt-2 text-xs ${
                  relations.settlement ? 'text-success-600' : 'text-primary-600'
                }`}>
                  <span>{relations.settlement ? '查看详情' : '点击生成'}</span>
                  <ChevronRight className="w-3 h-3" />
                </div>
              </div>
            )}

            {currentOrder.status === 'delivered' && !relations.inspection && (
              <div 
                className="p-4 rounded-lg border-2 border-dashed border-success-300 bg-success-50 cursor-pointer hover:bg-success-100 transition-all hover:shadow-md"
                onClick={handleMarkCompleted}
              >
                <div className="flex items-center justify-between mb-2">
                  <FileCheck className="w-6 h-6 text-success-600" />
                  <CheckCircle className="w-5 h-5 text-success-600" />
                </div>
                <p className="font-medium text-success-700">标记完成</p>
                <p className="text-xs text-success-500 mt-1">无需质检</p>
                <div className="flex items-center gap-1 mt-2 text-xs text-success-600">
                  <span>点击完成</span>
                  <ChevronRight className="w-3 h-3" />
                </div>
              </div>
            )}
          </div>
        )}
      </Card>

      <Card padding="none">
        <div className="flex items-center border-b border-slate-100 overflow-x-auto">
          {tabs.map(tab => (
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
              <tab.icon className="w-4 h-4" />
              {tab.label}
              {activeTab === tab.key && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-500" />
              )}
            </button>
          ))}
        </div>

        <div className="p-6">
          {activeTab === 'info' && currentOrder && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-slate-900 mb-4">订单明细</h3>
                <Table
                  columns={orderItems}
                  dataSource={currentOrder.items}
                  rowKey="productName"
                  showHeader={true}
                />
              </div>

              <div className="flex flex-col lg:flex-row gap-6">
                <Card className="flex-1" padding="sm">
                  <h4 className="font-medium text-slate-900 mb-4">金额汇总</h4>
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-500">商品金额</span>
                      <span className="text-slate-700">{formatCurrency(currentOrder.totalAmount, currentOrder.currency)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-500">税费 (13%)</span>
                      <span className="text-slate-700">{formatCurrency(taxAmount, currentOrder.currency)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-500">运费</span>
                      <span className="text-slate-700">{formatCurrency(0, currentOrder.currency)}</span>
                    </div>
                    <div className="pt-3 border-t border-slate-100">
                      <div className="flex justify-between">
                        <span className="font-medium text-slate-900">总金额</span>
                        <span className="font-bold text-lg text-primary-600">{formatCurrency(grandTotal, currentOrder.currency)}</span>
                      </div>
                    </div>
                  </div>
                </Card>

                <Card className="flex-1" padding="sm">
                  <h4 className="font-medium text-slate-900 mb-4">附件下载</h4>
                  {currentOrder.attachments && currentOrder.attachments.length > 0 ? (
                    <div className="space-y-2">
                      {currentOrder.attachments.map((file, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between p-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            <FileText className="w-5 h-5 text-primary-500" />
                            <span className="text-sm text-slate-700">{file}</span>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            icon={<Download className="w-4 h-4" />}
                            onClick={() => alert(`下载 ${file}`)}
                          >
                            下载
                          </Button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-slate-400 text-center py-4">暂无附件</p>
                  )}
                </Card>
              </div>
            </div>
          )}

          {activeTab === 'approval' && currentOrder && (
            <div className="space-y-8">
              <div>
                <h3 className="text-lg font-semibold text-slate-900 mb-4">审批流程图</h3>
                <Card padding="lg">
                  <ApprovalFlow nodes={approvalNodes} direction="horizontal" />
                </Card>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-slate-900 mb-4">审批历史</h3>
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
                          <Badge variant={record.status === 'approved' ? 'success' : 'danger'} className="text-xs">
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
              </div>
            </div>
          )}

          {activeTab === 'logistics' && (
            <div className="space-y-6">
              {orderLogistics ? (
                <>
                  <Card padding="sm">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-semibold text-slate-900">{orderLogistics.planName}</h3>
                        <p className="text-sm text-slate-500 mt-1">物流单号：{orderLogistics.trackingNo}</p>
                      </div>
                      <StatusBadge type="order" status={orderLogistics.status === 'delivered' ? 'delivered' : orderLogistics.status === 'in_transit' ? 'shipped' : 'processing'} />
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                      <div>
                        <p className="text-sm text-slate-500">运输方式</p>
                        <p className="text-sm font-medium text-slate-700">{orderLogistics.transportModeName}</p>
                      </div>
                      <div>
                        <p className="text-sm text-slate-500">承运商</p>
                        <p className="text-sm font-medium text-slate-700">{orderLogistics.carrier}</p>
                      </div>
                      <div>
                        <p className="text-sm text-slate-500">预计送达</p>
                        <p className="text-sm font-medium text-slate-700">{formatDate(orderLogistics.expectedDeliveryDate)}</p>
                      </div>
                      <div>
                        <p className="text-sm text-slate-500">当前位置</p>
                        <p className="text-sm font-medium text-slate-700">{orderLogistics.currentLocation}</p>
                      </div>
                    </div>
                  </Card>

                  <div>
                    <h3 className="text-lg font-semibold text-slate-900 mb-4">物流跟踪</h3>
                    <Card padding="sm">
                      <Timeline
                        items={orderLogistics.trackingEvents.map(event => ({
                          id: event.id,
                          title: event.status,
                          description: event.description,
                          time: event.timestamp,
                          user: event.operator,
                          status: event.isException ? 'failed' : 'completed',
                          extra: event.isException && (
                            <Badge variant="danger" className="text-xs">
                              异常
                            </Badge>
                          ),
                        }))}
                      />
                    </Card>
                  </div>

                  <div className="flex gap-3">
                    <Button
                      variant="primary"
                      icon={<QrCode className="w-4 h-4" />}
                      onClick={() => setShowQrModal(true)}
                    >
                      扫码收货
                    </Button>
                    <Button
                      variant="outline"
                      icon={<Download className="w-4 h-4" />}
                      onClick={() => alert('下载物流单功能开发中')}
                    >
                      下载物流单
                    </Button>
                  </div>
                </>
              ) : (
                <div className="text-center py-12">
                  <Truck className="w-16 h-16 mx-auto text-slate-300 mb-4" />
                  <p className="text-slate-500 mb-4">暂无物流信息</p>
                  <Button
                    variant="primary"
                    icon={<FileBarChart className="w-4 h-4" />}
                    onClick={() => alert('生成物流计划功能开发中')}
                  >
                    生成物流计划
                  </Button>
                </div>
              )}
            </div>
          )}

          {activeTab === 'quality' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-slate-900">质检记录</h3>
              </div>

              {orderQuality.length > 0 ? (
                <>
                  <div className="space-y-4">
                    {orderQuality.map(inspection => (
                      <Card key={inspection.id} padding="sm">
                        <div className="flex items-start justify-between mb-4">
                          <div>
                            <div className="flex items-center gap-3">
                              <span className="font-semibold text-slate-900">{inspection.code}</span>
                              <Badge
                                variant={inspection.overallResult === 'pass' ? 'success' : inspection.overallResult === 'fail' ? 'danger' : 'warning'}
                                className="text-xs"
                              >
                                {inspection.overallResult === 'pass' ? '合格' : inspection.overallResult === 'fail' ? '不合格' : '有条件合格'}
                              </Badge>
                            </div>
                            <p className="text-sm text-slate-500 mt-1">
                              {inspection.productName} - {inspection.productSpec}
                            </p>
                          </div>
                          <span className="text-sm text-slate-400">{formatDate(inspection.inspectionDate)}</span>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                          <div>
                            <p className="text-xs text-slate-500">送检数量</p>
                            <p className="font-medium text-slate-700">{inspection.receivedQuantity}</p>
                          </div>
                          <div>
                            <p className="text-xs text-slate-500">抽检数量</p>
                            <p className="font-medium text-slate-700">{inspection.inspectedQuantity}</p>
                          </div>
                          <div>
                            <p className="text-xs text-slate-500">合格数量</p>
                            <p className="font-medium text-success-600">{inspection.passQuantity}</p>
                          </div>
                          <div>
                            <p className="text-xs text-slate-500">不合格数量</p>
                            <p className="font-medium text-danger-600">{inspection.failQuantity}</p>
                          </div>
                        </div>

                        {inspection.items && inspection.items.length > 0 && (
                          <div className="mb-4">
                            <p className="text-sm font-medium text-slate-700 mb-2">质检项目</p>
                            <div className="space-y-2">
                              {inspection.items.map(item => (
                                <div key={item.id} className="flex items-center justify-between text-sm p-2 bg-slate-50 rounded">
                                  <span className="text-slate-600">{item.name}</span>
                                  <div className="flex items-center gap-2">
                                    <span className="text-slate-500">{item.measuredValue}</span>
                                    <Badge
                                      variant={item.result === 'pass' ? 'success' : 'danger'}
                                      className="text-xs"
                                    >
                                      {item.result === 'pass' ? '合格' : '不合格'}
                                    </Badge>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {inspection.hasReturn && inspection.returnDetail && (
                          <div className="p-4 bg-warning-50 rounded-lg">
                            <h4 className="font-medium text-warning-800 mb-2">退货记录</h4>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                              <div>
                                <p className="text-warning-600">退货数量</p>
                                <p className="font-medium text-warning-800">{inspection.returnDetail.returnQuantity}</p>
                              </div>
                              <div>
                                <p className="text-warning-600">退货金额</p>
                                <p className="font-medium text-warning-800">{formatCurrency(inspection.returnDetail.returnAmount)}</p>
                              </div>
                              <div>
                                <p className="text-warning-600">处理方式</p>
                                <p className="font-medium text-warning-800">
                                  {inspection.returnDetail.processingMethod === 'refund' ? '退款' :
                                   inspection.returnDetail.processingMethod === 'replacement' ? '换货' :
                                   inspection.returnDetail.processingMethod === 'rework' ? '返修' : '折扣'}
                                </p>
                              </div>
                              <div>
                                <p className="text-warning-600">处理状态</p>
                                <Badge
                                  variant={inspection.returnDetail.processingStatus === 'completed' ? 'success' : 'warning'}
                                  className="text-xs"
                                >
                                  {inspection.returnDetail.processingStatus === 'completed' ? '已完成' :
                                   inspection.returnDetail.processingStatus === 'processing' ? '处理中' : '待处理'}
                                </Badge>
                              </div>
                            </div>
                            <p className="text-sm text-warning-700 mt-2">
                              原因：{inspection.returnDetail.returnReason}
                            </p>
                          </div>
                        )}

                        <p className="text-sm text-slate-500 mt-3">备注：{inspection.remark}</p>
                      </Card>
                    ))}
                  </div>
                </>
              ) : (
                <div className="text-center py-12">
                  <ShieldCheck className="w-16 h-16 mx-auto text-slate-300 mb-4" />
                  <p className="text-slate-500">暂无质检记录</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'finance' && currentOrder && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card padding="sm">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-primary-50 flex items-center justify-center">
                      <Banknote className="w-5 h-5 text-primary-500" />
                    </div>
                    <div>
                      <p className="text-sm text-slate-500">订单总金额</p>
                      <p className="text-xl font-bold text-primary-600">
                        {formatCurrency(grandTotal, currentOrder.currency)}
                      </p>
                    </div>
                  </div>
                </Card>

                <Card padding="sm">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-success-50 flex items-center justify-center">
                      <CheckCircle className="w-5 h-5 text-success-500" />
                    </div>
                    <div>
                      <p className="text-sm text-slate-500">已付款金额</p>
                      <p className="text-xl font-bold text-success-600">
                        {formatCurrency(currentOrder.status === 'completed' ? grandTotal : 0, currentOrder.currency)}
                      </p>
                    </div>
                  </div>
                </Card>

                <Card padding="sm">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-warning-50 flex items-center justify-center">
                      <Clock className="w-5 h-5 text-warning-500" />
                    </div>
                    <div>
                      <p className="text-sm text-slate-500">待付款金额</p>
                      <p className="text-xl font-bold text-warning-600">
                        {formatCurrency(currentOrder.status === 'completed' ? 0 : grandTotal, currentOrder.currency)}
                      </p>
                    </div>
                  </div>
                </Card>
              </div>

              <Card padding="sm">
                <h3 className="font-semibold text-slate-900 mb-4">付款计划</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                    <div>
                      <p className="font-medium text-slate-700">预付款 (30%)</p>
                      <p className="text-sm text-slate-500">订单下达后支付</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-slate-900">{formatCurrency(grandTotal * 0.3, currentOrder.currency)}</p>
                      <Badge variant={currentOrder.status !== 'draft' && currentOrder.status !== 'pending_approval' ? 'success' : 'warning'} className="text-xs">
                        {currentOrder.status !== 'draft' && currentOrder.status !== 'pending_approval' ? '已支付' : '待支付'}
                      </Badge>
                    </div>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                    <div>
                      <p className="font-medium text-slate-700">发货款 (60%)</p>
                      <p className="text-sm text-slate-500">供应商发货前支付</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-slate-900">{formatCurrency(grandTotal * 0.6, currentOrder.currency)}</p>
                      <Badge variant={currentOrder.status === 'shipping' || currentOrder.status === 'delivered' || currentOrder.status === 'completed' ? 'success' : 'warning'} className="text-xs">
                        {currentOrder.status === 'shipping' || currentOrder.status === 'delivered' || currentOrder.status === 'completed' ? '已支付' : '待支付'}
                      </Badge>
                    </div>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                    <div>
                      <p className="font-medium text-slate-700">质保金 (10%)</p>
                      <p className="text-sm text-slate-500">验收合格后3个月支付</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-slate-900">{formatCurrency(grandTotal * 0.1, currentOrder.currency)}</p>
                      <Badge variant={currentOrder.status === 'completed' ? 'success' : 'warning'} className="text-xs">
                        {currentOrder.status === 'completed' ? '已支付' : '待支付'}
                      </Badge>
                    </div>
                  </div>
                </div>
              </Card>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card padding="sm">
                  <h3 className="font-semibold text-slate-900 mb-4">结算单关联</h3>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <FileBarChart className="w-5 h-5 text-primary-500" />
                        <div>
                          <p className="text-sm font-medium text-slate-700">SET-2024-0001</p>
                          <p className="text-xs text-slate-500">2024年1月结算</p>
                        </div>
                      </div>
                      <Badge variant="success" className="text-xs">已结算</Badge>
                    </div>
                  </div>
                </Card>

                <Card padding="sm">
                  <h3 className="font-semibold text-slate-900 mb-4">发票信息</h3>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                      <div>
                        <p className="text-sm font-medium text-slate-700">增值税专用发票</p>
                        <p className="text-xs text-slate-500">发票号：INV-2024-0001</p>
                      </div>
                      <Badge variant="success" className="text-xs">已开具</Badge>
                    </div>
                    <div className="text-sm text-slate-600 mt-2">
                      <p>开票金额：{formatCurrency(grandTotal, currentOrder.currency)}</p>
                      <p>税率：13%</p>
                      <p>税额：{formatCurrency(taxAmount, currentOrder.currency)}</p>
                    </div>
                  </div>
                </Card>
              </div>
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
                订单号：{currentOrder?.code}
              </p>
              <p className="text-sm text-warning-600">
                取消后将无法恢复，请谨慎操作。
              </p>
            </div>
          </div>
        </div>
      </Modal>

      <Modal
        open={showQrModal}
        onClose={() => setShowQrModal(false)}
        title="扫码收货"
        width="md"
      >
        <div className="flex flex-col items-center py-8">
          <div className="w-64 h-64 bg-slate-100 rounded-xl flex items-center justify-center mb-6">
            <div className="text-center">
              <QrCode className="w-32 h-32 mx-auto text-slate-400 mb-3" />
              <p className="text-sm text-slate-500">扫描包装上的二维码</p>
            </div>
          </div>
          <div className="flex gap-3 w-full max-w-xs">
            <Button
              variant="outline"
              className="flex-1"
              icon={<Camera className="w-4 h-4" />}
              onClick={() => alert('模拟扫码成功')}
            >
              模拟扫码
            </Button>
            <Button
              variant="primary"
              className="flex-1"
              icon={<PackageCheck className="w-4 h-4" />}
              onClick={() => {
                setShowQrModal(false);
                setShowReceiptModal(true);
              }}
            >
              手动确认
            </Button>
          </div>
        </div>
      </Modal>

      <Modal
        open={showReceiptModal}
        onClose={() => setShowReceiptModal(false)}
        title="确认收货"
        footer={
          <>
            <Button variant="secondary" onClick={() => setShowReceiptModal(false)}>
              取消
            </Button>
            <Button variant="success" onClick={handleConfirmDelivery}>
              确认收货
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <div className="flex items-start gap-3 p-4 bg-success-50 rounded-lg">
            <PackageCheck className="w-5 h-5 text-success-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-success-800">确认已收到货物？</p>
              <p className="text-sm text-success-600 mt-1">
                订单号：{currentOrder?.code}
              </p>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-slate-500">供应商</span>
              <span className="text-slate-700">{currentOrder?.supplierName}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-500">收货地址</span>
              <span className="text-slate-700">{currentOrder?.deliveryAddress}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-500">商品数量</span>
              <span className="text-slate-700">
                {currentOrder?.items.reduce((sum, item) => sum + item.quantity, 0)} 件
              </span>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
}
