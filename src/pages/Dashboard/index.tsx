import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import ReactECharts from 'echarts-for-react';
import type { EChartsOption } from 'echarts';
import {
  Calendar,
  RefreshCw,
  Download,
  TrendingUp,
  DollarSign,
  Clock,
  CheckCircle,
  Users,
  ChevronDown,
  Search,
  X,
  AlertTriangle,
  AlertCircle,
  Info,
  CheckCircle2,
  Crown,
  Medal,
  Award,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useDashboardStore } from '@/store';
import KpiCard from '@/components/business/KpiCard';
import { PieChart, BarChart } from '@/components/charts';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import StatusBadge from '@/components/business/StatusBadge';
import { formatCurrency, formatDate } from '@/utils/format';
import { formatDateTime } from '@/utils/format';
import { useTheme } from '@/hooks/useTheme';
import type {
  DashboardFilterParams,
  BuyerPerformance,
  AlertMessage,
} from '@/types';

type TimeRange = 'today' | 'week' | 'month' | 'quarter' | 'year' | 'custom';

const timeRangeOptions = [
  { label: '今日', value: 'today' },
  { label: '本周', value: 'week' },
  { label: '本月', value: 'month' },
  { label: '本季度', value: 'quarter' },
  { label: '本年', value: 'year' },
  { label: '自定义', value: 'custom' },
];

const categoryOptions = [
  { label: '电子元器件', value: '电子元器件' },
  { label: '机械设备', value: '机械设备' },
  { label: '原材料', value: '原材料' },
  { label: '电气设备', value: '电气设备' },
  { label: '其他', value: '其他' },
];

const regionOptions = [
  { label: '亚太', value: '亚太' },
  { label: '欧洲', value: '欧洲' },
  { label: '亚洲', value: '亚洲' },
  { label: '北美', value: '北美' },
];

const supplierOptions = [
  { label: '华为数字能源技术有限公司', value: 'S001' },
  { label: '中铝集团', value: 'S002' },
  { label: '武汉凡谷电子技术股份有限公司', value: 'S003' },
  { label: '施耐德电气(中国)有限公司', value: 'S004' },
  { label: '宝钢股份有限公司', value: 'S005' },
];

const CHART_COLORS = [
  '#3B82F6',
  '#10B981',
  '#F59E0B',
  '#EF4444',
  '#8B5CF6',
  '#EC4899',
  '#06B6D4',
  '#84CC16',
];

const performanceLevelConfig: Record<
  BuyerPerformance['performanceLevel'],
  { label: string; color: string; bg: string }
> = {
  excellent: { label: '优秀', color: 'text-amber-400', bg: 'bg-amber-500/20' },
  good: { label: '良好', color: 'text-success-400', bg: 'bg-success-500/20' },
  average: { label: '一般', color: 'text-primary-400', bg: 'bg-primary-500/20' },
  poor: { label: '待提升', color: 'text-danger-400', bg: 'bg-danger-500/20' },
};

const alertTypeConfig: Record<
  AlertMessage['type'],
  { icon: typeof AlertTriangle; color: string; bg: string }
> = {
  warning: { icon: AlertTriangle, color: 'text-warning-400', bg: 'bg-warning-500/20' },
  error: { icon: AlertCircle, color: 'text-danger-400', bg: 'bg-danger-500/20' },
  info: { icon: Info, color: 'text-primary-400', bg: 'bg-primary-500/20' },
  success: { icon: CheckCircle2, color: 'text-success-400', bg: 'bg-success-500/20' },
};

function getRankIcon(rank: number) {
  if (rank === 1) return <Crown className="w-5 h-5 text-amber-400" />;
  if (rank === 2) return <Medal className="w-5 h-5 text-slate-400" />;
  if (rank === 3) return <Award className="w-5 h-5 text-amber-600" />;
  return <span className="w-5 h-5 flex items-center justify-center text-sm font-bold text-slate-400">{rank}</span>;
}

export default function Dashboard() {
  const navigate = useNavigate();
  const { isDark } = useTheme();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [timeRange, setTimeRange] = useState<TimeRange>('year');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedRegions, setSelectedRegions] = useState<string[]>([]);
  const [supplierSearch, setSupplierSearch] = useState('');
  const [selectedSupplier, setSelectedSupplier] = useState('');
  const [showSupplierDropdown, setShowSupplierDropdown] = useState(false);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const [showRegionDropdown, setShowRegionDropdown] = useState(false);

  const {
    fetchDashboardData,
    fetchComparisonData,
    markAlertAsRead,
    exportData,
    loading,
    data,
    trends,
    categoryAnalysis,
    regionAnalysis,
    buyerPerformance,
    orderStatus,
    recentOrders,
    alertMessages,
    comparisonData,
  } = useDashboardStore();

  useEffect(() => {
    const params: DashboardFilterParams = {
      periodType: timeRange === 'custom' ? 'custom' : timeRange === 'today' || timeRange === 'week' ? 'month' : timeRange,
    };
    if (timeRange === 'custom' && startDate && endDate) {
      params.startDate = startDate;
      params.endDate = endDate;
    }
    if (selectedCategories.length > 0) {
      params.category = selectedCategories[0];
    }
    if (selectedRegions.length > 0) {
      params.region = selectedRegions[0];
    }
    if (selectedSupplier) {
      params.buyerId = selectedSupplier;
    }
    fetchDashboardData(params);
    fetchComparisonData('year');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeRange, startDate, endDate, selectedCategories, selectedRegions, selectedSupplier]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      const params: DashboardFilterParams = {
        periodType: timeRange === 'custom' ? 'custom' : timeRange === 'today' || timeRange === 'week' ? 'month' : timeRange,
      };
      if (timeRange === 'custom' && startDate && endDate) {
        params.startDate = startDate;
        params.endDate = endDate;
      }
      await fetchDashboardData(params);
    } finally {
      setTimeout(() => setIsRefreshing(false), 1000);
    }
  };

  const handleExport = async (format: 'excel' | 'csv') => {
    setShowExportMenu(false);
    const result = await exportData({
      type: 'all',
      format: format,
      filterParams: {},
    });
    if (result) {
      console.log(`Exported as ${format}`);
    }
  };

  const handleAlertClick = async (alert: AlertMessage) => {
    if (!alert.isRead) {
      await markAlertAsRead(alert.id);
    }
  };

  const handleOrderClick = (orderId: string) => {
    navigate(`/orders/${orderId}`);
  };

  const toggleCategory = (value: string) => {
    setSelectedCategories((prev) =>
      prev.includes(value) ? prev.filter((c) => c !== value) : [...prev, value]
    );
  };

  const toggleRegion = (value: string) => {
    setSelectedRegions((prev) =>
      prev.includes(value) ? prev.filter((r) => r !== value) : [...prev, value]
    );
  };

  const filteredSuppliers = useMemo(() => {
    if (!supplierSearch) return supplierOptions;
    return supplierOptions.filter((s) =>
      s.label.toLowerCase().includes(supplierSearch.toLowerCase())
    );
  }, [supplierSearch]);

  const trendChartOption: EChartsOption = useMemo(() => {
    const months = trends.map((t) => t.month);
    const purchaseAmounts = trends.map((t) => t.purchaseAmount);
    const orderCounts = trends.map((t) => t.orderCount);

    return {
      tooltip: {
        trigger: 'axis',
        backgroundColor: isDark ? 'rgba(15, 23, 42, 0.95)' : 'rgba(255, 255, 255, 0.95)',
        borderColor: isDark ? '#334155' : '#E2E8F0',
        textStyle: {
          color: isDark ? '#E2E8F0' : '#1E293B',
        },
        axisPointer: {
          type: 'cross',
        },
      },
      legend: {
        data: ['采购金额', '订单数量'],
        textStyle: {
          color: isDark ? '#94A3B8' : '#64748B',
        },
        top: 0,
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '3%',
        top: 40,
        containLabel: true,
      },
      xAxis: {
        type: 'category',
        boundaryGap: false,
        data: months,
        axisLine: {
          lineStyle: {
            color: isDark ? '#334155' : '#E2E8F0',
          },
        },
        axisLabel: {
          color: isDark ? '#94A3B8' : '#64748B',
          fontSize: 11,
        },
      },
      yAxis: [
        {
          type: 'value',
          name: '采购金额',
          nameTextStyle: {
            color: isDark ? '#94A3B8' : '#64748B',
            fontSize: 11,
          },
          axisLine: {
            show: false,
          },
          axisLabel: {
            color: isDark ? '#94A3B8' : '#64748B',
            fontSize: 11,
            formatter: (value: number) => {
              if (value >= 10000) {
                return (value / 10000).toFixed(0) + '万';
              }
              return value.toString();
            },
          },
          splitLine: {
            lineStyle: {
              color: isDark ? '#1E293B' : '#F1F5F9',
              type: 'dashed',
            },
          },
        },
        {
          type: 'value',
          name: '订单数量',
          nameTextStyle: {
            color: isDark ? '#94A3B8' : '#64748B',
            fontSize: 11,
          },
          axisLine: {
            show: false,
          },
          axisLabel: {
            color: isDark ? '#94A3B8' : '#64748B',
            fontSize: 11,
          },
          splitLine: {
            show: false,
          },
        },
      ],
      series: [
        {
          name: '采购金额',
          type: 'line',
          smooth: true,
          symbol: 'circle',
          symbolSize: 8,
          data: purchaseAmounts,
          lineStyle: {
            width: 3,
            color: '#3B82F6',
          },
          itemStyle: {
            color: '#3B82F6',
            borderWidth: 2,
            borderColor: isDark ? '#0F172A' : '#FFFFFF',
          },
          areaStyle: {
            color: {
              type: 'linear',
              x: 0,
              y: 0,
              x2: 0,
              y2: 1,
              colorStops: [
                { offset: 0, color: 'rgba(59, 130, 246, 0.3)' },
                { offset: 1, color: 'rgba(59, 130, 246, 0.05)' },
              ],
            },
          },
          yAxisIndex: 0,
        },
        {
          name: '订单数量',
          type: 'line',
          smooth: true,
          symbol: 'circle',
          symbolSize: 8,
          data: orderCounts,
          lineStyle: {
            width: 3,
            color: '#10B981',
          },
          itemStyle: {
            color: '#10B981',
            borderWidth: 2,
            borderColor: isDark ? '#0F172A' : '#FFFFFF',
          },
          areaStyle: {
            color: {
              type: 'linear',
              x: 0,
              y: 0,
              x2: 0,
              y2: 1,
              colorStops: [
                { offset: 0, color: 'rgba(16, 185, 129, 0.3)' },
                { offset: 1, color: 'rgba(16, 185, 129, 0.05)' },
              ],
            },
          },
          yAxisIndex: 1,
        },
      ],
    };
  }, [trends, isDark]);

  const categoryPieData = useMemo(() => {
    return categoryAnalysis.map((c) => ({
      name: c.category,
      value: c.purchaseAmount,
    }));
  }, [categoryAnalysis]);

  const regionBarData = useMemo(() => {
    return [...regionAnalysis]
      .sort((a, b) => b.purchaseAmount - a.purchaseAmount)
      .map((r) => ({
        name: r.country,
        value: r.purchaseAmount,
      }));
  }, [regionAnalysis]);



  const orderStatusPieData = useMemo(() => {
    return orderStatus.map((s) => ({
      name: s.statusName,
      value: s.count,
    }));
  }, [orderStatus]);

  const kpiData = useMemo(() => {
    if (!data?.kpis || data.kpis.length === 0) {
      return [
        {
          id: '1',
          name: '采购总金额',
          value: 125800000,
          unit: '¥',
          growthRate: 15.8,
          comparedToLastPeriod: 17200000,
          trend: 'up' as const,
        },
        {
          id: '2',
          name: '到货准时率',
          value: 94.6,
          unit: '%',
          growthRate: 2.1,
          comparedToLastPeriod: 92.5,
          trend: 'up' as const,
        },
        {
          id: '3',
          name: '质量合格率',
          value: 97.2,
          unit: '%',
          growthRate: 0.8,
          comparedToLastPeriod: 96.5,
          trend: 'up' as const,
        },
        {
          id: '4',
          name: '采购员效能',
          value: 52,
          unit: '单/人',
          growthRate: 12.3,
          comparedToLastPeriod: 46,
          trend: 'up' as const,
        },
      ];
    }
    const kpi1 = data.kpis.find((k) => k.name.includes('采购')) || data.kpis[0];
    const kpi2 = data.kpis.find((k) => k.name.includes('准时')) || data.kpis[1];
    const kpi3 = data.kpis.find((k) => k.name.includes('质检')) || data.kpis[2];
    const kpi4 = {
      id: '4',
      name: '采购员效能',
      value: data.summary ? Math.round(data.summary.totalOrders / 3) : 52,
      unit: '单/人',
      growthRate: comparisonData?.growth?.orderCount || 12.3,
      comparedToLastPeriod: comparisonData?.lastPeriod?.orderCount
        ? Math.round(comparisonData.lastPeriod.orderCount / 3)
        : 46,
      trend: 'up' as const,
    };
    return [kpi1, kpi2, kpi3, kpi4];
  }, [data, comparisonData]);

  return (
    <div className="min-h-screen dashboard-bg p-4 sm:p-6 lg:p-8">
      <div className="max-w-[1920px] mx-auto space-y-6 animate-slide-up">
        <div className="backdrop-blur-xl bg-white/5 rounded-2xl border border-white/10 p-4 sm:p-6 shadow-2xl">
          <div className="flex flex-col lg:flex-row lg:items-center gap-4">
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-primary-400" />
                <span className="text-sm font-medium text-slate-300">时间范围</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {timeRangeOptions.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => setTimeRange(option.value as TimeRange)}
                    className={cn(
                      'px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200',
                      timeRange === option.value
                        ? 'bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-lg shadow-primary-500/30'
                        : 'bg-white/5 text-slate-400 hover:bg-white/10 hover:text-white border border-white/10'
                    )}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>

            {timeRange === 'custom' && (
              <div className="flex items-center gap-3">
                <Input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="bg-white/5 border-white/20 text-white"
                  wrapperClassName="w-40"
                />
                <span className="text-slate-400">至</span>
                <Input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="bg-white/5 border-white/20 text-white"
                  wrapperClassName="w-40"
                />
              </div>
            )}

            <div className="flex-1" />

            <div className="flex flex-wrap items-center gap-3">
              <div className="relative">
                <button
                  onClick={() => {
                    setShowCategoryDropdown(!showCategoryDropdown);
                    setShowRegionDropdown(false);
                    setShowSupplierDropdown(false);
                  }}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-slate-300 hover:bg-white/10 hover:text-white transition-all duration-200"
                >
                  <span className="text-sm">
                    品类 {selectedCategories.length > 0 ? `(${selectedCategories.length})` : ''}
                  </span>
                  <ChevronDown
                    className={cn(
                      'w-4 h-4 transition-transform',
                      showCategoryDropdown && 'rotate-180'
                    )}
                  />
                </button>
                {showCategoryDropdown && (
                  <div className="absolute top-full mt-2 left-0 z-50 w-56 rounded-xl bg-[#1E293B] border border-white/10 shadow-2xl py-2 animate-slide-in">
                    <div className="px-3 py-2 border-b border-white/10">
                      <span className="text-sm font-medium text-white">选择品类</span>
                    </div>
                    <div className="max-h-60 overflow-y-auto">
                      {categoryOptions.map((option) => (
                        <button
                          key={option.value}
                          onClick={() => toggleCategory(option.value)}
                          className="w-full px-3 py-2.5 text-left text-sm text-slate-300 hover:bg-white/5 flex items-center gap-2"
                        >
                          <div
                            className={cn(
                              'w-4 h-4 rounded border flex items-center justify-center transition-colors',
                              selectedCategories.includes(option.value)
                                ? 'bg-primary-500 border-primary-500'
                                : 'border-slate-500'
                            )}
                          >
                            {selectedCategories.includes(option.value) && (
                              <CheckCircle2 className="w-3 h-3 text-white" />
                            )}
                          </div>
                          {option.label}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="relative">
                <button
                  onClick={() => {
                    setShowRegionDropdown(!showRegionDropdown);
                    setShowCategoryDropdown(false);
                    setShowSupplierDropdown(false);
                  }}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-slate-300 hover:bg-white/10 hover:text-white transition-all duration-200"
                >
                  <span className="text-sm">
                    区域 {selectedRegions.length > 0 ? `(${selectedRegions.length})` : ''}
                  </span>
                  <ChevronDown
                    className={cn(
                      'w-4 h-4 transition-transform',
                      showRegionDropdown && 'rotate-180'
                    )}
                  />
                </button>
                {showRegionDropdown && (
                  <div className="absolute top-full mt-2 left-0 z-50 w-56 rounded-xl bg-[#1E293B] border border-white/10 shadow-2xl py-2 animate-slide-in">
                    <div className="px-3 py-2 border-b border-white/10">
                      <span className="text-sm font-medium text-white">选择区域</span>
                    </div>
                    <div className="max-h-60 overflow-y-auto">
                      {regionOptions.map((option) => (
                        <button
                          key={option.value}
                          onClick={() => toggleRegion(option.value)}
                          className="w-full px-3 py-2.5 text-left text-sm text-slate-300 hover:bg-white/5 flex items-center gap-2"
                        >
                          <div
                            className={cn(
                              'w-4 h-4 rounded border flex items-center justify-center transition-colors',
                              selectedRegions.includes(option.value)
                                ? 'bg-primary-500 border-primary-500'
                                : 'border-slate-500'
                            )}
                          >
                            {selectedRegions.includes(option.value) && (
                              <CheckCircle2 className="w-3 h-3 text-white" />
                            )}
                          </div>
                          {option.label}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="relative w-64">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    placeholder="搜索供应商..."
                    value={supplierSearch}
                    onChange={(e) => setSupplierSearch(e.target.value)}
                    onFocus={() => {
                      setShowSupplierDropdown(true);
                      setShowCategoryDropdown(false);
                      setShowRegionDropdown(false);
                    }}
                    className="w-full pl-10 pr-10 py-2 rounded-lg bg-white/5 border border-white/10 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500 transition-all"
                  />
                  {supplierSearch && (
                    <button
                      onClick={() => setSupplierSearch('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 rounded hover:bg-white/10"
                    >
                      <X className="w-3.5 h-3.5 text-slate-400" />
                    </button>
                  )}
                </div>
                {showSupplierDropdown && filteredSuppliers.length > 0 && (
                  <div className="absolute top-full mt-2 left-0 z-50 w-full rounded-xl bg-[#1E293B] border border-white/10 shadow-2xl py-2 animate-slide-in max-h-60 overflow-y-auto">
                    {filteredSuppliers.map((option) => (
                      <button
                        key={option.value}
                        onClick={() => {
                          setSelectedSupplier(
                            selectedSupplier === option.value ? '' : option.value
                          );
                          setSupplierSearch('');
                          setShowSupplierDropdown(false);
                        }}
                        className={cn(
                          'w-full px-3 py-2.5 text-left text-sm hover:bg-white/5 transition-colors',
                          selectedSupplier === option.value
                            ? 'text-primary-400'
                            : 'text-slate-300'
                        )}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <Button
                variant="primary"
                onClick={handleRefresh}
                icon={
                  <RefreshCw
                    className={cn('w-4 h-4', isRefreshing && 'animate-spin')}
                  />
                }
                className="bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700"
              >
                刷新
              </Button>

              <div className="relative">
                <Button
                  variant="secondary"
                  onClick={() => {
                    setShowExportMenu(!showExportMenu);
                    setShowCategoryDropdown(false);
                    setShowRegionDropdown(false);
                    setShowSupplierDropdown(false);
                  }}
                  icon={<Download className="w-4 h-4" />}
                  className="bg-white/5 border-white/10 text-white hover:bg-white/10"
                >
                  导出
                </Button>
                {showExportMenu && (
                  <div className="absolute top-full mt-2 right-0 z-50 w-40 rounded-xl bg-[#1E293B] border border-white/10 shadow-2xl py-2 animate-slide-in">
                    <button
                      onClick={() => handleExport('excel')}
                      className="w-full px-4 py-2.5 text-left text-sm text-slate-300 hover:bg-white/5 flex items-center gap-2"
                    >
                      <span className="text-green-400">📊</span>
                      导出 Excel
                    </button>
                    <button
                      onClick={() => handleExport('csv')}
                      className="w-full px-4 py-2.5 text-left text-sm text-slate-300 hover:bg-white/5 flex items-center gap-2"
                    >
                      <span className="text-blue-400">📄</span>
                      导出 CSV
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6"
          style={{ '--stagger': 1 } as React.CSSProperties}
        >
          <div
            className="animate-stagger animate-slide-up"
            style={{ '--stagger': 0 } as React.CSSProperties}
          >
            <KpiCard
              title="采购总金额"
              value={kpiData[0].value}
              previousValue={kpiData[0].comparedToLastPeriod}
              format="currency"
              currency="CNY"
              decimals={0}
              variant="primary"
              trend={kpiData[0].trend === 'flat' ? undefined : kpiData[0].trend}
              trendValue={kpiData[0].growthRate}
              icon={<DollarSign className="w-5 h-5" />}
              glow={true}
              loading={loading}
              className="bg-gradient-to-br from-[#1E293B] to-[#0F172A] border-white/10 text-white"
            />
          </div>

          <div
            className="animate-stagger animate-slide-up"
            style={{ '--stagger': 1 } as React.CSSProperties}
          >
            <KpiCard
              title="到货准时率"
              value={kpiData[1].value}
              previousValue={kpiData[1].comparedToLastPeriod}
              format="percent"
              decimals={1}
              variant="success"
              trend={kpiData[1].trend === 'flat' ? undefined : kpiData[1].trend}
              trendValue={kpiData[1].growthRate}
              icon={<Clock className="w-5 h-5" />}
              glow={true}
              loading={loading}
              className="bg-gradient-to-br from-[#1E293B] to-[#0F172A] border-white/10 text-white"
            />
          </div>

          <div
            className="animate-stagger animate-slide-up"
            style={{ '--stagger': 2 } as React.CSSProperties}
          >
            <KpiCard
              title="质量合格率"
              value={kpiData[2].value}
              previousValue={kpiData[2].comparedToLastPeriod}
              format="percent"
              decimals={1}
              variant="warning"
              trend={kpiData[2].trend === 'flat' ? undefined : kpiData[2].trend}
              trendValue={kpiData[2].growthRate}
              icon={<CheckCircle className="w-5 h-5" />}
              glow={true}
              loading={loading}
              className="bg-gradient-to-br from-[#1E293B] to-[#0F172A] border-white/10 text-white"
            />
          </div>

          <div
            className="animate-stagger animate-slide-up"
            style={{ '--stagger': 3 } as React.CSSProperties}
          >
            <KpiCard
              title="采购员效能"
              value={kpiData[3].value}
              previousValue={kpiData[3].comparedToLastPeriod}
              format="number"
              unit="单/人"
              decimals={0}
              variant="info"
              trend={kpiData[3].trend === 'flat' ? undefined : kpiData[3].trend}
              trendValue={kpiData[3].growthRate}
              icon={<Users className="w-5 h-5" />}
              glow={true}
              loading={loading}
              className="bg-gradient-to-br from-[#1E293B] to-[#0F172A] border-white/10 text-white"
            />
          </div>
        </div>

        <div
          className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6"
          style={{ '--stagger': 4 } as React.CSSProperties}
        >
          <div
            className="lg:col-span-2 bg-gradient-to-br from-[#1E293B] to-[#0F172A] rounded-2xl border border-white/10 p-5 sm:p-6 backdrop-blur-xl shadow-xl animate-stagger animate-slide-up"
            style={{ '--stagger': 4 } as React.CSSProperties}
          >
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-primary-400" />
              采购金额趋势
            </h3>
            <ReactECharts
              option={trendChartOption}
              style={{ height: 350 }}
              opts={{ renderer: 'canvas' }}
              theme={isDark ? 'dark' : undefined}
            />
          </div>

          <div
            className="bg-gradient-to-br from-[#1E293B] to-[#0F172A] rounded-2xl border border-white/10 p-5 sm:p-6 backdrop-blur-xl shadow-xl animate-stagger animate-slide-up"
            style={{ '--stagger': 5 } as React.CSSProperties}
          >
            <h3 className="text-lg font-semibold text-white mb-4">品类分析</h3>
            <PieChart
              data={categoryPieData}
              colors={CHART_COLORS}
              showLegend={true}
              height={320}
              radius={['40%', '70%']}
              labelFormatter={(params) => `${params.name}\n${params.percent}%`}
            />
          </div>
        </div>

        <div
          className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6"
          style={{ '--stagger': 6 } as React.CSSProperties}
        >
          <div
            className="bg-gradient-to-br from-[#1E293B] to-[#0F172A] rounded-2xl border border-white/10 p-5 sm:p-6 backdrop-blur-xl shadow-xl animate-stagger animate-slide-up"
            style={{ '--stagger': 6 } as React.CSSProperties}
          >
            <h3 className="text-lg font-semibold text-white mb-4">区域分布</h3>
            <BarChart
              data={regionBarData}
              xField="name"
              yField="value"
              color="#3B82F6"
              horizontal={true}
              height={350}
              yAxisFormatter={(value: number) => {
                if (value >= 10000) {
                  return (value / 10000).toFixed(0) + '万';
                }
                return value.toString();
              }}
            />
          </div>

          <div
            className="bg-gradient-to-br from-[#1E293B] to-[#0F172A] rounded-2xl border border-white/10 p-5 sm:p-6 backdrop-blur-xl shadow-xl animate-stagger animate-slide-up"
            style={{ '--stagger': 7 } as React.CSSProperties}
          >
            <h3 className="text-lg font-semibold text-white mb-4">采购员效能排行榜</h3>
            <div className="space-y-3">
              {buyerPerformance.slice(0, 5).map((buyer) => (
                <div
                  key={buyer.buyerId}
                  className="flex items-center gap-3 p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-all duration-200 cursor-pointer group"
                >
                  <div className="flex-shrink-0 w-8 flex justify-center">
                    {getRankIcon(buyer.ranking)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-medium text-white truncate">
                        {buyer.buyerName}
                      </span>
                      <span
                        className={cn(
                          'px-2 py-0.5 rounded-full text-xs font-medium',
                          performanceLevelConfig[buyer.performanceLevel].bg,
                          performanceLevelConfig[buyer.performanceLevel].color
                        )}
                      >
                        {performanceLevelConfig[buyer.performanceLevel].label}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-sm">
                      <span className="text-slate-400">
                        订单数: <span className="text-white">{buyer.orderCount}</span>
                      </span>
                      <span className="text-slate-400">
                        金额:{' '}
                        <span className="text-white">
                          {formatCurrency(buyer.purchaseAmount, 'CNY', 0)}
                        </span>
                      </span>
                    </div>
                    <div className="mt-2 h-2 bg-white/5 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-primary-500 to-primary-400 rounded-full transition-all duration-1000"
                        style={{
                          width: `${(buyer.performanceScore / 100) * 100}%`,
                        }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div
          className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6"
          style={{ '--stagger': 8 } as React.CSSProperties}
        >
          <div
            className="bg-gradient-to-br from-[#1E293B] to-[#0F172A] rounded-2xl border border-white/10 p-5 sm:p-6 backdrop-blur-xl shadow-xl animate-stagger animate-slide-up"
            style={{ '--stagger': 8 } as React.CSSProperties}
          >
            <h3 className="text-lg font-semibold text-white mb-4">订单状态分布</h3>
            <PieChart
              data={orderStatusPieData}
              colors={CHART_COLORS}
              showLegend={true}
              height={320}
              radius={['40%', '70%']}
              labelFormatter={(params) => `${params.name}\n${params.value}单`}
            />
          </div>

          <div
            className="bg-gradient-to-br from-[#1E293B] to-[#0F172A] rounded-2xl border border-white/10 p-5 sm:p-6 backdrop-blur-xl shadow-xl animate-stagger animate-slide-up"
            style={{ '--stagger': 9 } as React.CSSProperties}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">最近订单</h3>
              <button
                onClick={() => navigate('/orders')}
                className="text-sm text-primary-400 hover:text-primary-300 transition-colors"
              >
                查看全部 →
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="text-left py-3 px-2 text-xs font-medium text-slate-400 uppercase tracking-wider">
                      订单号
                    </th>
                    <th className="text-left py-3 px-2 text-xs font-medium text-slate-400 uppercase tracking-wider">
                      供应商
                    </th>
                    <th className="text-right py-3 px-2 text-xs font-medium text-slate-400 uppercase tracking-wider">
                      金额
                    </th>
                    <th className="text-center py-3 px-2 text-xs font-medium text-slate-400 uppercase tracking-wider">
                      状态
                    </th>
                    <th className="text-right py-3 px-2 text-xs font-medium text-slate-400 uppercase tracking-wider">
                      时间
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {recentOrders.slice(0, 10).map((order) => (
                    <tr
                      key={order.id}
                      onClick={() => handleOrderClick(order.id)}
                      className="border-b border-white/5 hover:bg-white/5 cursor-pointer transition-colors"
                    >
                      <td className="py-3 px-2">
                        <span className="text-sm font-medium text-primary-400 hover:text-primary-300">
                          {order.code}
                        </span>
                      </td>
                      <td className="py-3 px-2">
                        <span className="text-sm text-white truncate block max-w-[150px]">
                          {order.supplierName}
                        </span>
                      </td>
                      <td className="py-3 px-2 text-right">
                        <span className="text-sm font-medium text-white">
                          {formatCurrency(order.amount, 'CNY', 0)}
                        </span>
                      </td>
                      <td className="py-3 px-2 text-center">
                        <StatusBadge
                          type="order"
                          status={order.status}
                          showDot={false}
                        />
                      </td>
                      <td className="py-3 px-2 text-right">
                        <span className="text-sm text-slate-400">
                          {formatDate(order.createdAt)}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div
          className="bg-gradient-to-br from-[#1E293B] to-[#0F172A] rounded-2xl border border-white/10 p-5 sm:p-6 backdrop-blur-xl shadow-xl animate-stagger animate-slide-up"
          style={{ '--stagger': 10 } as React.CSSProperties}
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-warning-400" />
              告警消息
            </h3>
            <button
              onClick={() => useDashboardStore.getState().markAllAlertsAsRead()}
              className="text-sm text-primary-400 hover:text-primary-300 transition-colors"
            >
              全部标为已读
            </button>
          </div>
          <div className="space-y-3">
            {alertMessages.map((alert) => {
              const config = alertTypeConfig[alert.type];
              const IconComponent = config.icon;
              return (
                <div
                  key={alert.id}
                  onClick={() => handleAlertClick(alert)}
                  className={cn(
                    'flex items-start gap-3 p-4 rounded-xl cursor-pointer transition-all duration-200',
                    alert.isRead
                      ? 'bg-white/5 hover:bg-white/10'
                      : 'bg-white/10 hover:bg-white/15 border-l-4 border-warning-400'
                  )}
                >
                  <div
                    className={cn(
                      'flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center',
                      config.bg
                    )}
                  >
                    <IconComponent className={cn('w-5 h-5', config.color)} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span
                        className={cn(
                          'font-medium',
                          alert.isRead ? 'text-slate-400' : 'text-white'
                        )}
                      >
                        {alert.title}
                      </span>
                      {!alert.isRead && (
                        <span className="w-2 h-2 rounded-full bg-warning-400 animate-pulse" />
                      )}
                    </div>
                    <p
                      className={cn(
                        'text-sm line-clamp-2',
                        alert.isRead ? 'text-slate-500' : 'text-slate-300'
                      )}
                    >
                      {alert.content}
                    </p>
                    <p className="text-xs text-slate-500 mt-1">
                      {formatDateTime(alert.timestamp)}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {(showCategoryDropdown ||
        showRegionDropdown ||
        showSupplierDropdown ||
        showExportMenu) && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => {
            setShowCategoryDropdown(false);
            setShowRegionDropdown(false);
            setShowSupplierDropdown(false);
            setShowExportMenu(false);
          }}
        />
      )}
    </div>
  );
}
