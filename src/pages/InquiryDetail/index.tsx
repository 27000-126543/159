import { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Edit3,
  Trash2,
  Send,
  XCircle,
  FileText,
  Calendar,
  Package,
  User,
  Clock,
  MapPin,
  Star,
  TrendingDown,
  Zap,
  Award,
  MessageSquare,
  ChevronRight,
  CheckCircle,
  Download,
  BarChart3,
  SendHorizontal,
} from 'lucide-react';
import { useInquiryStore, inquirySelectors } from '@/store/inquiryStore';
import { useUserStore } from '@/store/userStore';
import { Quote, NegotiationRecord } from '@/mock/data/inquiries';
import { PriceComparisonResult } from '@/mock/services/inquiryService';
import { suppliers } from '@/mock/data/suppliers';
import Card from '@/components/ui/Card';
import Table, { TableColumn } from '@/components/ui/Table';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import Modal from '@/components/ui/Modal';
import Input from '@/components/ui/Input';
import { BarChart } from '@/components/charts/BarChart';
import { RadarChart } from '@/components/charts/RadarChart';
import Timeline from '@/components/business/Timeline';
import KpiCard from '@/components/business/KpiCard';
import {
  formatCurrency,
  formatDate,
  formatPercent,
  formatNumber,
} from '@/utils/format';
import { cn } from '@/lib/utils';

type TabKey = 'comparison' | 'negotiation' | 'info';

const tabs = [
  { key: 'comparison', label: '报价对比', icon: <BarChart3 className="w-4 h-4" /> },
  { key: 'negotiation', label: '议价记录', icon: <MessageSquare className="w-4 h-4" /> },
  { key: 'info', label: '询价信息', icon: <FileText className="w-4 h-4" /> },
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

const getRecommendationReason = (result: PriceComparisonResult, allResults: PriceComparisonResult[]): {
  reason: string;
  icon: React.ReactNode;
  highlight: string;
} => {
  const minPrice = Math.min(...allResults.map(r => r.totalAmount));
  const minDelivery = Math.min(...allResults.map(r => r.deliveryDays));
  const maxScore = Math.max(...allResults.map(r => r.score));

  if (result.totalAmount === minPrice && result.score === maxScore) {
    return {
      reason: '综合最优方案：价格最低且综合评分最高',
      icon: <Award className="w-5 h-5 text-amber-500" />,
      highlight: 'bg-gradient-to-r from-amber-50 to-yellow-50 border-amber-200',
    };
  }
  if (result.totalAmount === minPrice) {
    return {
      reason: '价格最优：所有报价中总价最低',
      icon: <TrendingDown className="w-5 h-5 text-success-500" />,
      highlight: 'bg-gradient-to-r from-success-50 to-emerald-50 border-success-200',
    };
  }
  if (result.deliveryDays === minDelivery) {
    return {
      reason: '交付最快：交货周期最短',
      icon: <Zap className="w-5 h-5 text-primary-500" />,
      highlight: 'bg-gradient-to-r from-primary-50 to-blue-50 border-primary-200',
    };
  }
  if (result.score === maxScore) {
    return {
      reason: '综合评分最高：品质、服务、价格综合表现最佳',
      icon: <Star className="w-5 h-5 text-amber-500" />,
      highlight: 'bg-gradient-to-r from-amber-50 to-orange-50 border-amber-200',
    };
  }
  return {
    reason: '综合推荐方案',
    icon: <Award className="w-5 h-5 text-primary-500" />,
    highlight: 'bg-gradient-to-r from-primary-50 to-blue-50 border-primary-200',
  };
};

export default function InquiryDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useUserStore();
  const {
    fetchInquiryById,
    getPriceComparison,
    submitNegotiation,
    selectSupplier,
    publishInquiry,
    deleteInquiry,
    setCurrentInquiry,
  } = useInquiryStore();

  const currentInquiry = useInquiryStore(inquirySelectors.selectCurrentInquiry);
  const priceComparison = useInquiryStore(inquirySelectors.selectPriceComparison);
  const negotiations = useInquiryStore(inquirySelectors.selectNegotiations);
  const loading = useInquiryStore(inquirySelectors.selectLoading);

  const [activeTab, setActiveTab] = useState<TabKey>('comparison');
  const [sortField, setSortField] = useState<string | null>(null);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc' | null>(null);
  const [selectedQuoteId, setSelectedQuoteId] = useState<string | null>(null);
  const [selectedRadarSuppliers, setSelectedRadarSuppliers] = useState<string[]>([]);
  const [showPublishModal, setShowPublishModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showNegotiationModal, setShowNegotiationModal] = useState(false);
  const [showSelectModal, setShowSelectModal] = useState(false);
  const [selectedQuoteForNegotiation, setSelectedQuoteForNegotiation] = useState<Quote | null>(null);
  const [negotiationPrice, setNegotiationPrice] = useState('');
  const [negotiationMessage, setNegotiationMessage] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [selectedQuoteForSelect, setSelectedQuoteForSelect] = useState<Quote | null>(null);

  useEffect(() => {
    if (id) {
      fetchInquiryById(id);
    }
    return () => {
      setCurrentInquiry(null);
    };
  }, [id, fetchInquiryById, setCurrentInquiry]);

  useEffect(() => {
    if (id && currentInquiry?.quotes && currentInquiry.quotes.length > 0) {
      getPriceComparison(id);
    }
  }, [id, currentInquiry?.quotes?.length, getPriceComparison]);

  useEffect(() => {
    if (priceComparison.length > 0 && !selectedQuoteId) {
      const recommended = priceComparison.find(r => r.rank === 1);
      if (recommended) {
        setSelectedQuoteId(recommended.quoteId);
        const top2 = priceComparison.slice(0, 2).map(r => r.quoteId);
        setSelectedRadarSuppliers(top2);
      }
    }
  }, [priceComparison, selectedQuoteId]);

  const getSupplierInfo = (supplierName: string) => {
    return suppliers.find(s => s.name === supplierName);
  };

  const handlePublish = async () => {
    if (!currentInquiry) return;
    setActionLoading(true);
    try {
      const result = await publishInquiry(currentInquiry.id);
      if (result) {
        setShowPublishModal(false);
      }
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!currentInquiry) return;
    setActionLoading(true);
    try {
      const result = await deleteInquiry(currentInquiry.id);
      if (result.success) {
        navigate('/inquiries');
      }
    } finally {
      setActionLoading(false);
    }
  };

  const handleNegotiation = async () => {
    if (!currentInquiry || !selectedQuoteForNegotiation) return;
    setActionLoading(true);
    try {
      const round = negotiations.filter(n => n.quoteId === selectedQuoteForNegotiation.id).length + 1;
      const result = await submitNegotiation({
        inquiryId: currentInquiry.id,
        quoteId: selectedQuoteForNegotiation.id,
        round,
        operatorId: user?.id || '',
        operatorName: user?.name || '',
        content: negotiationMessage,
        proposedPrice: parseFloat(negotiationPrice),
      });
      if (result) {
        setShowNegotiationModal(false);
        setSelectedQuoteForNegotiation(null);
        setNegotiationPrice('');
        setNegotiationMessage('');
      }
    } finally {
      setActionLoading(false);
    }
  };

  const handleSelectSupplier = async () => {
    if (!currentInquiry || !selectedQuoteForSelect) return;
    setActionLoading(true);
    try {
      const result = await selectSupplier(currentInquiry.id, selectedQuoteForSelect.id);
      if (result.success) {
        setShowSelectModal(false);
        setSelectedQuoteForSelect(null);
      }
    } finally {
      setActionLoading(false);
    }
  };

  const handleSort = (key: string | number | symbol, direction: 'asc' | 'desc' | null) => {
    setSortField(key as string);
    setSortOrder(direction);
  };

  const toggleRadarSupplier = (quoteId: string) => {
    setSelectedRadarSuppliers(prev => {
      if (prev.includes(quoteId)) {
        return prev.filter(id => id !== quoteId);
      }
      if (prev.length >= 3) {
        return [...prev.slice(1), quoteId];
      }
      return [...prev, quoteId];
    });
  };

  const minValues = useMemo(() => {
    if (!currentInquiry?.quotes || currentInquiry.quotes.length === 0) return {};
    return {
      unitPrice: Math.min(...currentInquiry.quotes.map(q => q.quoteItems[0]?.unitPrice || Infinity)),
      totalAmount: Math.min(...currentInquiry.quotes.map(q => q.totalAmount)),
      deliveryTime: Math.min(...currentInquiry.quotes.map(q => q.deliveryDate ? new Date(q.deliveryDate).getTime() : Infinity)),
    };
  }, [currentInquiry?.quotes]);

  const comparisonColumns: TableColumn<Quote>[] = [
    {
      key: 'supplier',
      title: '供应商',
      dataIndex: 'supplierName',
      width: 200,
      render: (_, record) => {
        const supplier = getSupplierInfo(record.supplierName);
        return (
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary-100 to-primary-200 flex items-center justify-center">
              <span className="text-primary-600 font-bold text-sm">
                {record.supplierName.substring(0, 2)}
              </span>
            </div>
            <div>
              <div className="font-medium text-slate-800">{record.supplierName}</div>
              {supplier?.country && (
                <div className="text-xs text-slate-400">{supplier.country}</div>
              )}
            </div>
          </div>
        );
      },
    },
    {
      key: 'country',
      title: '国家',
      dataIndex: 'supplierName',
      width: 80,
      render: (_, record) => {
        const supplier = getSupplierInfo(record.supplierName);
        return <span className="text-slate-600">{supplier?.country || '-'}</span>;
      },
    },
    {
      key: 'history',
      title: '历史交易',
      dataIndex: 'supplierName',
      width: 100,
      align: 'center',
      render: (_, record) => {
        const supplier = getSupplierInfo(record.supplierName);
        return (
          <span className="font-medium text-slate-700">
            {supplier?.orderCount || 0} 单
          </span>
        );
      },
    },
    {
      key: 'rating',
      title: '评分',
      dataIndex: 'supplierName',
      width: 100,
      align: 'center',
      render: (_, record) => {
        const supplier = getSupplierInfo(record.supplierName);
        const rating = supplier?.rating || 0;
        return (
          <div className="flex items-center justify-center gap-1">
            <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
            <span className="font-medium text-slate-700">{rating.toFixed(1)}</span>
          </div>
        );
      },
    },
    {
      key: 'unitPrice',
      title: '单价',
      dataIndex: 'quoteItems',
      sortable: true,
      width: 120,
      align: 'right',
      render: (_, record) => {
        const item = record.quoteItems[0];
        const isMin = item?.unitPrice === minValues.unitPrice;
        return (
          <span className={cn(
            'font-semibold',
            isMin ? 'text-success-600 bg-success-50 px-2 py-0.5 rounded' : 'text-slate-700'
          )}>
            {formatCurrency(item?.unitPrice || 0, currentInquiry?.currency)}
          </span>
        );
      },
    },
    {
      key: 'totalAmount',
      title: '总价',
      dataIndex: 'totalAmount',
      sortable: true,
      width: 140,
      align: 'right',
      render: (value, record) => {
        const isMin = record.totalAmount === minValues.totalAmount;
        return (
          <span className={cn(
            'font-bold',
            isMin ? 'text-success-600 bg-success-50 px-2 py-0.5 rounded' : 'text-slate-800'
          )}>
            {formatCurrency(value as number, currentInquiry?.currency)}
          </span>
        );
      },
    },
    {
      key: 'deliveryTime',
      title: '交期(天)',
      dataIndex: 'deliveryDate',
      sortable: true,
      width: 100,
      align: 'center',
      render: (_, record) => {
        const deliveryDays = record.quoteItems.reduce((max, item) => Math.max(max, item.deliveryTime), 0);
        const supplier = getSupplierInfo(record.supplierName);
        const onTimeRate = supplier?.onTimeDeliveryRate || 0;
        return (
          <div className="text-center">
            <div className={cn(
              'font-semibold',
              deliveryDays === Math.min(...(currentInquiry?.quotes?.map(q => q.quoteItems.reduce((m, i) => Math.max(m, i.deliveryTime), 0)) || [Infinity]))
                ? 'text-success-600' : 'text-slate-700'
            )}>
              {deliveryDays} 天
            </div>
            <div className="text-xs text-slate-400">准时率 {formatPercent(onTimeRate, 0)}</div>
          </div>
        );
      },
    },
    {
      key: 'paymentTerms',
      title: '付款方式',
      dataIndex: 'paymentTerms',
      width: 140,
      render: (value) => (
        <span className="text-slate-600 text-sm">{value as string}</span>
      ),
    },
    {
      key: 'warranty',
      title: '质保期',
      dataIndex: 'warrantyPeriod',
      width: 100,
      align: 'center',
      render: (value) => (
        <Badge variant="default">{value as string}</Badge>
      ),
    },
    {
      key: 'remarks',
      title: '备注',
      dataIndex: 'remarks',
      width: 120,
      render: (value) => (
        <span className="text-slate-500 text-sm line-clamp-2">
          {(value as string) || '-'}
        </span>
      ),
    },
    {
      key: 'actions',
      title: '操作',
      width: 220,
      align: 'center',
      render: (_, record) => (
        <div className="flex items-center justify-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            icon={<MessageSquare className="w-4 h-4" />}
            className="text-primary-600"
            onClick={() => {
              setSelectedQuoteForNegotiation(record);
              setNegotiationPrice(String(record.totalAmount * 0.95));
              setShowNegotiationModal(true);
            }}
          >
            议价
          </Button>
          <Button
            variant="ghost"
            size="sm"
            icon={<FileText className="w-4 h-4" />}
          >
            详情
          </Button>
          {user?.role !== 'supplier' && currentInquiry?.status !== 'completed' && (
            <Button
              variant="primary"
              size="sm"
              icon={<CheckCircle className="w-4 h-4" />}
              onClick={() => {
                setSelectedQuoteForSelect(record);
                setShowSelectModal(true);
              }}
            >
              选择
            </Button>
          )}
        </div>
      ),
    },
  ];

  const barChartData = useMemo(() => {
    if (!currentInquiry?.quotes) return [];
    return currentInquiry.quotes.map(q => ({
      name: q.supplierName.length > 6 ? q.supplierName.substring(0, 6) + '...' : q.supplierName,
      value: q.totalAmount,
    }));
  }, [currentInquiry?.quotes]);

  const radarChartData = useMemo(() => {
    if (!currentInquiry?.quotes) return [];
    const colors = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444'];
    return currentInquiry.quotes
      .filter(q => selectedRadarSuppliers.includes(q.id))
      .map((q, index) => {
        const supplier = getSupplierInfo(q.supplierName);
        const totalQuantity = q.quoteItems.reduce((s, i) => s + i.quantity, 0);
        const avgUnitPrice = q.totalAmount / totalQuantity;
        const avgTargetPrice = currentInquiry.items.reduce((s, i) => s + i.targetPrice, 0) / currentInquiry.items.length;
        const priceScore = Math.max(0, Math.min(100, 100 - ((avgUnitPrice - avgTargetPrice) / avgTargetPrice) * 100));
        const deliveryScore = Math.max(0, Math.min(100, 100 - (q.quoteItems.reduce((m, i) => Math.max(m, i.deliveryTime), 0) / 60) * 50));
        const qualityScore = (supplier?.qualityPassRate || 80) * 100;
        const serviceScore = (supplier?.rating || 4) * 20;
        const historyScore = Math.min(100, (supplier?.orderCount || 0) * 2);

        return {
          name: q.supplierName,
          value: [priceScore, deliveryScore, qualityScore, serviceScore, historyScore],
          color: colors[index % colors.length],
          areaStyle: true,
        };
      });
  }, [currentInquiry?.quotes, selectedRadarSuppliers, currentInquiry?.items]);

  const radarIndicators = [
    { name: '价格优势', max: 100 },
    { name: '交付速度', max: 100 },
    { name: '品质保证', max: 100 },
    { name: '服务水平', max: 100 },
    { name: '历史合作', max: 100 },
  ];

  const negotiationTimelineItems = useMemo(() => {
    if (!currentInquiry) return [];
    const items: { id: string; title: string; description?: string; time?: string; status?: 'completed' | 'current' | 'pending'; user?: string; extra?: React.ReactNode }[] = [];

    const quoteNegotiations: Record<string, NegotiationRecord[]> = {};
    negotiations.forEach(n => {
      if (!quoteNegotiations[n.quoteId]) quoteNegotiations[n.quoteId] = [];
      quoteNegotiations[n.quoteId].push(n);
    });

    Object.entries(quoteNegotiations).forEach(([quoteId, negs]) => {
      const quote = currentInquiry.quotes.find(q => q.id === quoteId);
      if (!quote) return;

      negs.forEach((neg, index) => {
        items.push({
          id: neg.id,
          title: `第 ${neg.round} 轮议价 - ${quote.supplierName}`,
          description: neg.content,
          time: neg.timestamp,
          status: index === negs.length - 1 ? 'current' : 'completed',
          user: neg.operatorName,
          extra: (
            <div className="flex items-center gap-4 mt-2 p-3 bg-slate-50 rounded-lg">
              <div>
                <span className="text-xs text-slate-400">提议价格</span>
                <p className="font-semibold text-primary-600">
                  {formatCurrency(neg.proposedPrice, currentInquiry.currency)}
                </p>
              </div>
              <div>
                <span className="text-xs text-slate-400">原报价</span>
                <p className="font-medium text-slate-600 line-through">
                  {formatCurrency(quote.totalAmount, currentInquiry.currency)}
                </p>
              </div>
              <div>
                <span className="text-xs text-slate-400">差价</span>
                <p className="font-medium text-success-600">
                  -{formatCurrency(quote.totalAmount - neg.proposedPrice, currentInquiry.currency)}
                </p>
              </div>
            </div>
          ),
        });
      });
    });

    return items.sort((a, b) => new Date(b.time || '').getTime() - new Date(a.time || '').getTime());
  }, [negotiations, currentInquiry, user?.role]);

  if (loading && !currentInquiry) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex flex-col items-center gap-2">
          <div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
          <span className="text-slate-500">加载中...</span>
        </div>
      </div>
    );
  }

  if (!currentInquiry) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <FileText className="w-16 h-16 text-slate-300" />
        <p className="text-slate-500">询价单不存在</p>
        <Button variant="primary" onClick={() => navigate('/inquiries')}>
          返回列表
        </Button>
      </div>
    );
  }

  const recommendedResult = priceComparison.find(r => r.rank === 1);
  const recommendation = recommendedResult ? getRecommendationReason(recommendedResult, priceComparison) : null;
  const recommendedQuote = recommendedResult ? currentInquiry.quotes.find(q => q.id === recommendedResult.quoteId) : null;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="sm"
          icon={<ArrowLeft className="w-4 h-4" />}
          onClick={() => navigate('/inquiries')}
        >
          返回列表
        </Button>
        <h1 className="text-xl font-bold text-slate-800">询价单详情</h1>
      </div>

      <Card className={cn(
        'relative overflow-hidden',
        recommendation?.highlight
      )}>
        {recommendation && (
          <div className="absolute top-0 right-0 bg-gradient-to-l from-amber-400 to-amber-500 text-white px-4 py-1 text-xs font-medium rounded-bl-lg flex items-center gap-1">
            <Award className="w-3.5 h-3.5" />
            系统推荐
          </div>
        )}
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
          <div className="flex-1 space-y-4">
            <div className="flex flex-wrap items-center gap-3">
              <span className="font-mono text-lg text-primary-600 font-bold">{currentInquiry.code}</span>
              {getStatusBadge(currentInquiry.status)}
              {currentInquiry.selectedSupplierName && (
                <Badge variant="success" dot>
                  已选择：{currentInquiry.selectedSupplierName}
                </Badge>
              )}
            </div>
            <h2 className="text-xl font-bold text-slate-900">{currentInquiry.title}</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="flex items-center gap-2">
                <Package className="w-4 h-4 text-slate-400" />
                <div>
                  <p className="text-xs text-slate-400">品类</p>
                  <p className="text-sm font-medium text-slate-700">{currentInquiry.category}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-slate-400" />
                <div>
                  <p className="text-xs text-slate-400">规格描述</p>
                  <p className="text-sm font-medium text-slate-700">{currentInquiry.subCategory}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-slate-400" />
                <div>
                  <p className="text-xs text-slate-400">数量</p>
                  <p className="text-sm font-medium text-slate-700">
                    {formatNumber(currentInquiry.items.reduce((s, i) => s + i.quantity, 0))} {currentInquiry.items[0]?.unit}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-slate-400" />
                <div>
                  <p className="text-xs text-slate-400">截止日期</p>
                  <p className="text-sm font-medium text-slate-700">{formatDate(currentInquiry.quotationDeadline)}</p>
                </div>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-6 pt-2">
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-slate-400" />
                <span className="text-sm text-slate-600">采购人：{currentInquiry.requesterName}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-slate-400" />
                <span className="text-sm text-slate-600">创建时间：{formatDate(currentInquiry.createdAt, 'YYYY-MM-DD HH:mm')}</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-slate-400" />
                <span className="text-sm text-slate-600">送货地址：{currentInquiry.deliveryAddress}</span>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <div className="flex flex-wrap gap-2">
              {currentInquiry.status === 'draft' && user?.role !== 'supplier' && (
                <>
                  <Button
                    variant="primary"
                    icon={<Send className="w-4 h-4" />}
                    onClick={() => setShowPublishModal(true)}
                  >
                    发布
                  </Button>
                  <Button
                    variant="secondary"
                    icon={<Edit3 className="w-4 h-4" />}
                  >
                    编辑
                  </Button>
                </>
              )}
              {currentInquiry.status !== 'completed' && currentInquiry.status !== 'cancelled' && currentInquiry.status !== 'draft' && user?.role !== 'supplier' && (
                <Button
                  variant="secondary"
                  icon={<XCircle className="w-4 h-4" />}
                  onClick={() => setShowDeleteModal(true)}
                >
                  关闭
                </Button>
              )}
              {currentInquiry.status === 'draft' && user?.role !== 'supplier' && (
                <Button
                  variant="danger"
                  icon={<Trash2 className="w-4 h-4" />}
                  onClick={() => setShowDeleteModal(true)}
                >
                  删除
                </Button>
              )}
            </div>

            {currentInquiry.totalTargetAmount > 0 && (
              <div className="bg-gradient-to-r from-success-50 to-emerald-50 rounded-lg p-4 border border-success-100">
                <p className="text-xs text-success-600 mb-1">目标预算</p>
                <p className="text-2xl font-bold text-success-700">
                  {formatCurrency(currentInquiry.totalTargetAmount, currentInquiry.currency)}
                </p>
              </div>
            )}
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <KpiCard
          title="收到报价"
          value={currentInquiry.quotes.length}
          format="number"
          icon={<FileText className="w-5 h-5" />}
          variant="primary"
        />
        <KpiCard
          title="最低报价"
          value={currentInquiry.quotes.length > 0 ? Math.min(...currentInquiry.quotes.map(q => q.totalAmount)) : 0}
          format="currency"
          currency={currentInquiry.currency}
          icon={<TrendingDown className="w-5 h-5" />}
          variant="success"
        />
        <KpiCard
          title="平均报价"
          value={currentInquiry.quotes.length > 0
            ? currentInquiry.quotes.reduce((s, q) => s + q.totalAmount, 0) / currentInquiry.quotes.length
            : 0}
          format="currency"
          currency={currentInquiry.currency}
          icon={<BarChart3 className="w-5 h-5" />}
          variant="info"
        />
        <KpiCard
          title="议价轮次"
          value={negotiations.length}
          format="number"
          icon={<MessageSquare className="w-5 h-5" />}
          variant="warning"
        />
      </div>

      <Card padding="none">
        <div className="flex items-center gap-1 p-2 border-b border-slate-100 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as TabKey)}
              className={cn(
                'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap',
                activeTab === tab.key
                  ? 'bg-primary-50 text-primary-600'
                  : 'text-slate-500 hover:bg-slate-50'
              )}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        <div className="p-5">
          {activeTab === 'comparison' && (
            <div className="space-y-6">
              {recommendedResult && recommendedQuote && (
                <Card className={cn('border-2', recommendation?.highlight)}>
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div className="flex items-start gap-4">
                      <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-amber-100 to-amber-200 flex items-center justify-center shrink-0">
                        {recommendation?.icon}
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-amber-600 font-semibold">系统推荐最优方案</span>
                          <Badge variant="warning" size="sm">
                            {currentInquiry.quotes.length > 1 ? `已对比 ${currentInquiry.quotes.length} 家供应商` : '唯一报价'}
                          </Badge>
                        </div>
                        <p className="text-slate-600 mb-3">{recommendation?.reason}</p>
                        <div className="flex flex-wrap items-center gap-6">
                          <div>
                            <p className="text-xs text-slate-400">供应商</p>
                            <p className="font-semibold text-slate-800">{recommendedQuote.supplierName}</p>
                          </div>
                          <div>
                            <p className="text-xs text-slate-400">报价金额</p>
                            <p className="font-bold text-lg text-success-600">
                              {formatCurrency(recommendedQuote.totalAmount, currentInquiry.currency)}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-slate-400">预计交期</p>
                            <p className="font-semibold text-slate-700">
                              {recommendedQuote.quoteItems.reduce((m, i) => Math.max(m, i.deliveryTime), 0)} 天
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-slate-400">付款方式</p>
                            <p className="font-semibold text-slate-700">{recommendedQuote.paymentTerms}</p>
                          </div>
                          <div>
                            <p className="text-xs text-slate-400">质保</p>
                            <p className="font-semibold text-slate-700">{recommendedQuote.warrantyPeriod}</p>
                          </div>
                          <div>
                            <p className="text-xs text-slate-400">综合评分</p>
                            <div className="flex items-center gap-1">
                              <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                              <span className="font-semibold text-slate-700">{recommendedResult.score.toFixed(1)}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    {user?.role !== 'supplier' && currentInquiry.status !== 'completed' && (
                      <Button
                        variant="primary"
                        size="lg"
                        icon={<CheckCircle className="w-5 h-5" />}
                        onClick={() => {
                          setSelectedQuoteForSelect(recommendedQuote);
                          setShowSelectModal(true);
                        }}
                      >
                        快速生成订单
                      </Button>
                    )}
                  </div>
                </Card>
              )}

              <div className="space-y-2">
                <h3 className="font-semibold text-slate-800 flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-primary-500" />
                  报价对比
                  <span className="text-xs font-normal text-slate-400 ml-2">
                    点击列标题可排序，最小值高亮显示
                  </span>
                </h3>
                <Table<Quote>
                  columns={comparisonColumns}
                  dataSource={currentInquiry.quotes || []}
                  rowKey="id"
                  loading={loading}
                  sortField={sortField}
                  sortOrder={sortOrder}
                  onSort={handleSort}
                  emptyText="暂无报价数据"
                  rowClassName={(record) => cn(
                    record.id === selectedQuoteId && 'bg-primary-50/50',
                    record.id === currentInquiry.selectedQuoteId && 'bg-success-50/50'
                  )}
                />
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <h4 className="font-semibold text-slate-800 mb-4">供应商价格对比</h4>
                  <BarChart
                    data={barChartData}
                    xField="name"
                    yField="value"
                    color="#3B82F6"
                    height={280}
                    yAxisFormatter={(value) => formatCurrency(value, currentInquiry.currency, 0)}
                  />
                </Card>

                <Card>
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-semibold text-slate-800">供应商综合评分对比</h4>
                    <span className="text-xs text-slate-400">选择 2-3 个供应商对比（点击表格行选择）</span>
                  </div>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {currentInquiry.quotes?.map(q => {
                      const supplier = getSupplierInfo(q.supplierName);
                      const colors = ['bg-primary-100 text-primary-700 border-primary-200', 'bg-success-100 text-success-700 border-success-200', 'bg-amber-100 text-amber-700 border-amber-200'];
                      const isSelected = selectedRadarSuppliers.includes(q.id);
                      return (
                        <button
                          key={q.id}
                          onClick={() => toggleRadarSupplier(q.id)}
                          className={cn(
                            'px-3 py-1 rounded-lg text-sm font-medium border transition-all',
                            isSelected
                              ? colors[selectedRadarSuppliers.indexOf(q.id) % colors.length]
                              : 'bg-slate-50 text-slate-500 border-slate-200 hover:bg-slate-100'
                          )}
                        >
                          {supplier?.name.substring(0, 4) || q.supplierName.substring(0, 4)}
                        </button>
                      );
                    })}
                  </div>
                  {radarChartData.length > 0 ? (
                    <RadarChart
                      indicators={radarIndicators}
                      data={radarChartData}
                      height={280}
                      radius="60%"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-[280px] text-slate-400">
                      请选择至少 1 个供应商进行对比
                    </div>
                  )}
                </Card>
              </div>
            </div>
          )}

          {activeTab === 'negotiation' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-slate-800 flex items-center gap-2">
                  <MessageSquare className="w-5 h-5 text-primary-500" />
                  议价记录
                </h3>
                {user?.role !== 'supplier' && currentInquiry.quotes.length > 0 && currentInquiry.status !== 'completed' && (
                  <Button
                    variant="primary"
                    icon={<SendHorizontal className="w-4 h-4" />}
                    onClick={() => {
                      const quote = currentInquiry.quotes[0];
                      setSelectedQuoteForNegotiation(quote);
                      setNegotiationPrice(String(quote.totalAmount * 0.95));
                      setShowNegotiationModal(true);
                    }}
                  >
                    发起议价
                  </Button>
                )}
              </div>

              {negotiationTimelineItems.length > 0 ? (
                <div className="max-w-3xl">
                  <Timeline items={negotiationTimelineItems} reverse />
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 gap-3 text-slate-400">
                  <MessageSquare className="w-12 h-12" />
                  <p>暂无议价记录</p>
                  {user?.role !== 'supplier' && currentInquiry.quotes.length > 0 && currentInquiry.status !== 'completed' && (
                    <Button
                      variant="primary"
                      onClick={() => {
                        const quote = currentInquiry.quotes[0];
                        setSelectedQuoteForNegotiation(quote);
                        setNegotiationPrice(String(quote.totalAmount * 0.95));
                        setShowNegotiationModal(true);
                      }}
                    >
                      发起第一轮议价
                    </Button>
                  )}
                </div>
              )}

              {negotiations.length > 0 && (
                <Card>
                  <h4 className="font-semibold text-slate-800 mb-4">议价历史对比</h4>
                  <Table
                    columns={[
                      { key: 'round', title: '轮次', dataIndex: 'round', width: 80, align: 'center' },
                      { key: 'supplier', title: '供应商', dataIndex: 'quoteId', render: (_, record) => {
                        const quote = currentInquiry.quotes.find(q => q.id === record.quoteId);
                        return quote?.supplierName || '-';
                      }},
                      { key: 'operator', title: '发起方', dataIndex: 'operatorName' },
                      { key: 'original', title: '原报价', dataIndex: 'quoteId', align: 'right', render: (_, record) => {
                        const quote = currentInquiry.quotes.find(q => q.id === record.quoteId);
                        return formatCurrency(quote?.totalAmount || 0, currentInquiry.currency);
                      }},
                      { key: 'proposed', title: '议价价格', dataIndex: 'proposedPrice', align: 'right', render: (value) => (
                        <span className="font-semibold text-primary-600">
                          {formatCurrency(value as number, currentInquiry.currency)}
                        </span>
                      )},
                      { key: 'diff', title: '差价', dataIndex: 'proposedPrice', align: 'right', render: (_, record) => {
                        const quote = currentInquiry.quotes.find(q => q.id === record.quoteId);
                        const diff = (quote?.totalAmount || 0) - (record.proposedPrice || 0);
                        return (
                          <span className={cn(
                            'font-semibold',
                            diff > 0 ? 'text-success-600' : diff < 0 ? 'text-danger-600' : 'text-slate-600'
                          )}>
                            {diff > 0 ? '-' : ''}{formatCurrency(Math.abs(diff), currentInquiry.currency)}
                          </span>
                        );
                      }},
                      { key: 'time', title: '时间', dataIndex: 'timestamp', render: (value) => formatDate(value as string, 'YYYY-MM-DD HH:mm') },
                    ]}
                    dataSource={negotiations}
                    rowKey="id"
                    emptyText="暂无数据"
                  />
                </Card>
              )}
            </div>
          )}

          {activeTab === 'info' && (
            <div className="space-y-6">
              <Card>
                <h4 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-primary-500" />
                  询价单详细信息
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm text-slate-400 mb-1">询价单号</p>
                      <p className="font-medium text-slate-800 font-mono">{currentInquiry.code}</p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-400 mb-1">标题</p>
                      <p className="font-medium text-slate-800">{currentInquiry.title}</p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-400 mb-1">品类</p>
                      <p className="font-medium text-slate-800">{currentInquiry.category} / {currentInquiry.subCategory}</p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-400 mb-1">采购部门</p>
                      <p className="font-medium text-slate-800">{currentInquiry.department}</p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-400 mb-1">采购人</p>
                      <p className="font-medium text-slate-800">{currentInquiry.requesterName}</p>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm text-slate-400 mb-1">报价截止日期</p>
                      <p className="font-medium text-slate-800">{formatDate(currentInquiry.quotationDeadline)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-400 mb-1">要求交货日期</p>
                      <p className="font-medium text-slate-800">{formatDate(currentInquiry.requiredDate)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-400 mb-1">交货地址</p>
                      <p className="font-medium text-slate-800">{currentInquiry.deliveryAddress}</p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-400 mb-1">目标预算</p>
                      <p className="font-medium text-slate-800">
                        {formatCurrency(currentInquiry.totalTargetAmount, currentInquiry.currency)}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-400 mb-1">创建时间</p>
                      <p className="font-medium text-slate-800">
                        {formatDate(currentInquiry.createdAt, 'YYYY-MM-DD HH:mm:ss')}
                      </p>
                    </div>
                  </div>
                </div>
              </Card>

              <Card>
                <h4 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
                  <Package className="w-5 h-5 text-primary-500" />
                  规格参数
                </h4>
                <Table
                  columns={[
                    { key: 'productName', title: '产品名称', dataIndex: 'productName' },
                    { key: 'productSpec', title: '规格描述', dataIndex: 'productSpec' },
                    { key: 'quantity', title: '数量', dataIndex: 'quantity', align: 'right' },
                    { key: 'unit', title: '单位', dataIndex: 'unit', align: 'center' },
                    { key: 'targetPrice', title: '目标单价', dataIndex: 'targetPrice', align: 'right', render: (value) => formatCurrency(value as number, currentInquiry.currency) },
                    { key: 'subtotal', title: '目标小计', dataIndex: 'targetPrice', align: 'right', render: (_, record) => formatCurrency(record.targetPrice * record.quantity, currentInquiry.currency) },
                  ]}
                  dataSource={currentInquiry.items}
                  rowKey="productName"
                  emptyText="暂无产品信息"
                />
              </Card>

              {currentInquiry.attachments && currentInquiry.attachments.length > 0 && (
                <Card>
                  <h4 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
                    <Download className="w-5 h-5 text-primary-500" />
                    附件
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {currentInquiry.attachments.map((att, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-3 p-3 rounded-lg border border-slate-200 hover:border-primary-200 hover:bg-primary-50/50 transition-all cursor-pointer"
                      >
                        <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
                          <FileText className="w-5 h-5 text-slate-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-slate-700 truncate">{att}</p>
                        </div>
                        <Download className="w-4 h-4 text-slate-400" />
                      </div>
                    ))}
                  </div>
                </Card>
              )}

              <Card>
                <h4 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
                  <Clock className="w-5 h-5 text-primary-500" />
                  历史操作记录
                </h4>
                <Timeline
                  items={[
                    {
                      id: 'create',
                      title: '询价单创建',
                      description: currentInquiry.remarks || '询价单已创建',
                      time: currentInquiry.createdAt,
                      status: 'completed' as const,
                      user: currentInquiry.requesterName,
                    },
                    ...(currentInquiry.publishedAt ? [{
                      id: 'publish',
                      title: '询价单发布',
                      description: '询价单已发布，供应商可以开始报价',
                      time: currentInquiry.publishedAt,
                      status: 'completed' as const,
                      user: currentInquiry.requesterName,
                    }] : []),
                    ...currentInquiry.quotes.map((quote) => ({
                      id: `quote-${quote.id}`,
                      title: `收到报价 - ${quote.supplierName}`,
                      description: `报价金额：${formatCurrency(quote.totalAmount, currentInquiry.currency)}`,
                      time: quote.quoteDate,
                      status: 'completed' as const,
                      user: quote.supplierName,
                    })),
                    ...(currentInquiry.selectedQuoteId ? [{
                      id: 'select',
                      title: '供应商已选定',
                      description: `已选择 ${currentInquiry.selectedSupplierName}，成交金额 ${formatCurrency(currentInquiry.finalAmount, currentInquiry.currency)}`,
                      time: currentInquiry.approvedAt || currentInquiry.updatedAt,
                      status: 'completed' as const,
                      user: currentInquiry.approvedBy || currentInquiry.requesterName,
                    }] : []),
                  ].filter(item => item.time).sort((a, b) => new Date(a.time || '').getTime() - new Date(b.time || '').getTime())}
                />
              </Card>
            </div>
          )}
        </div>
      </Card>

      <Modal
        open={showPublishModal}
        onClose={() => setShowPublishModal(false)}
        title="确认发布询价单"
        width="md"
        footer={
          <>
            <Button variant="secondary" onClick={() => setShowPublishModal(false)}>
              取消
            </Button>
            <Button variant="primary" loading={actionLoading} onClick={handlePublish}>
              确认发布
            </Button>
          </>
        }
      >
        <div className="space-y-3">
          <p className="text-slate-600">
            确定要发布询价单 <span className="font-semibold text-primary-600">{currentInquiry.code}</span> 吗？
          </p>
          <p className="text-sm text-slate-500">
            发布后，供应商将可以看到该询价单并进行报价。
          </p>
        </div>
      </Modal>

      <Modal
        open={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="确认操作"
        width="md"
        footer={
          <>
            <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
              取消
            </Button>
            <Button variant="danger" loading={actionLoading} onClick={handleDelete}>
              确认{currentInquiry.status === 'draft' ? '删除' : '关闭'}
            </Button>
          </>
        }
      >
        <div className="space-y-3">
          <p className="text-slate-600">
            确定要{currentInquiry.status === 'draft' ? '删除' : '关闭'}询价单{' '}
            <span className="font-semibold text-danger-600">{currentInquiry.code}</span> 吗？
          </p>
          {currentInquiry.status === 'draft' ? (
            <p className="text-sm text-slate-500">删除后将无法恢复，请谨慎操作。</p>
          ) : (
            <p className="text-sm text-slate-500">关闭后，供应商将无法再进行报价。</p>
          )}
        </div>
      </Modal>

      <Modal
        open={showNegotiationModal}
        onClose={() => {
          setShowNegotiationModal(false);
          setSelectedQuoteForNegotiation(null);
          setNegotiationPrice('');
          setNegotiationMessage('');
        }}
        title="发起议价"
        width="md"
        footer={
          <>
            <Button
              variant="secondary"
              onClick={() => {
                setShowNegotiationModal(false);
                setSelectedQuoteForNegotiation(null);
                setNegotiationPrice('');
                setNegotiationMessage('');
              }}
            >
              取消
            </Button>
            <Button
              variant="primary"
              loading={actionLoading}
              onClick={handleNegotiation}
              disabled={!negotiationPrice || parseFloat(negotiationPrice) <= 0}
            >
              提交议价
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <div className="p-4 bg-slate-50 rounded-lg">
            <p className="text-sm text-slate-500 mb-1">与 {selectedQuoteForNegotiation?.supplierName} 议价</p>
            <div className="flex items-center gap-4 mt-2">
              <div>
                <p className="text-xs text-slate-400">当前报价</p>
                <p className="text-lg font-bold text-slate-700 line-through">
                  {formatCurrency(selectedQuoteForNegotiation?.totalAmount || 0, currentInquiry.currency)}
                </p>
              </div>
              <ChevronRight className="w-5 h-5 text-slate-300" />
              <div>
                <p className="text-xs text-slate-400">报价数量</p>
                <p className="text-lg font-bold text-primary-600">
                  {formatNumber(selectedQuoteForNegotiation?.quoteItems.reduce((s, i) => s + i.quantity, 0) || 0)}
                </p>
              </div>
            </div>
          </div>

          <Input
            label="议价价格"
            type="number"
            value={negotiationPrice}
            onChange={(e) => setNegotiationPrice(e.target.value)}
            placeholder="请输入期望的议价价格"
            prefixIcon={<span className="text-slate-400">¥</span>}
          />

          {negotiationPrice && selectedQuoteForNegotiation && (
            <div className="p-3 bg-primary-50 rounded-lg">
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-600">差价：</span>
                <span className="font-semibold text-success-600">
                  {formatCurrency(selectedQuoteForNegotiation.totalAmount - parseFloat(negotiationPrice), currentInquiry.currency)}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm mt-1">
                <span className="text-slate-600">降价幅度：</span>
                <span className="font-semibold text-success-600">
                  {formatPercent(((selectedQuoteForNegotiation.totalAmount - parseFloat(negotiationPrice)) / selectedQuoteForNegotiation.totalAmount) * 100)}
                </span>
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">议价消息</label>
            <textarea
              className="input-field min-h-[100px]"
              placeholder="请输入议价说明，例如：我们的目标价格是XX，希望贵司能考虑一下..."
              value={negotiationMessage}
              onChange={(e) => setNegotiationMessage(e.target.value)}
            />
          </div>
        </div>
      </Modal>

      <Modal
        open={showSelectModal}
        onClose={() => {
          setShowSelectModal(false);
          setSelectedQuoteForSelect(null);
        }}
        title="确认选择供应商"
        width="md"
        footer={
          <>
            <Button
              variant="secondary"
              onClick={() => {
                setShowSelectModal(false);
                setSelectedQuoteForSelect(null);
              }}
            >
              取消
            </Button>
            <Button variant="primary" loading={actionLoading} onClick={handleSelectSupplier}>
              确认选择
            </Button>
          </>
        }
      >
        <div className="space-y-3">
          <p className="text-slate-600">
            确定要选择 <span className="font-semibold text-primary-600">{selectedQuoteForSelect?.supplierName}</span> 作为中标供应商吗？
          </p>
          {selectedQuoteForSelect && (
            <div className="p-4 bg-success-50 rounded-lg border border-success-100">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-slate-500">成交金额</p>
                  <p className="font-bold text-success-600 text-lg">
                    {formatCurrency(selectedQuoteForSelect.totalAmount, currentInquiry.currency)}
                  </p>
                </div>
                <div>
                  <p className="text-slate-500">预计交期</p>
                  <p className="font-semibold text-slate-700">
                    {selectedQuoteForSelect.quoteItems.reduce((m, i) => Math.max(m, i.deliveryTime), 0)} 天
                  </p>
                </div>
                <div>
                  <p className="text-slate-500">付款方式</p>
                  <p className="font-medium text-slate-700">{selectedQuoteForSelect.paymentTerms}</p>
                </div>
                <div>
                  <p className="text-slate-500">质保期</p>
                  <p className="font-medium text-slate-700">{selectedQuoteForSelect.warrantyPeriod}</p>
                </div>
              </div>
            </div>
          )}
          <p className="text-sm text-slate-500">
            确认后将生成采购订单，其他供应商的报价将被拒绝。
          </p>
        </div>
      </Modal>
    </div>
  );
}
