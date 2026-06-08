export interface KPI {
  id: string;
  name: string;
  value: number;
  unit: string;
  growthRate: number;
  comparedToLastPeriod: number;
  trend: 'up' | 'down' | 'flat';
  icon: string;
  color: string;
}

export interface TrendData {
  month: string;
  purchaseAmount: number;
  orderCount: number;
  supplierCount: number;
  onTimeDeliveryRate: number;
  qualityPassRate: number;
}

export interface CategoryAnalysis {
  category: string;
  subCategory: string;
  purchaseAmount: number;
  orderCount: number;
  supplierCount: number;
  avgPrice: number;
  growthRate: number;
  proportion: number;
}

export interface RegionAnalysis {
  region: string;
  country: string;
  countryCode: string;
  purchaseAmount: number;
  orderCount: number;
  supplierCount: number;
  avgDeliveryDays: number;
  proportion: number;
  lat: number;
  lng: number;
}

export interface BuyerPerformance {
  buyerId: string;
  buyerName: string;
  department: string;
  orderCount: number;
  purchaseAmount: number;
  avgOrderAmount: number;
  costSaving: number;
  costSavingRate: number;
  onTimeRate: number;
  qualityPassRate: number;
  supplierCount: number;
  ranking: number;
  performanceScore: number;
  performanceLevel: 'excellent' | 'good' | 'average' | 'poor';
}

export interface OrderStatus {
  status: string;
  statusName: string;
  count: number;
  amount: number;
  proportion: number;
}

export interface SupplierRating {
  rating: number;
  count: number;
  proportion: number;
}

export interface DashboardData {
  period: {
    startDate: string;
    endDate: string;
    periodType: 'month' | 'quarter' | 'year' | 'custom';
  };
  kpis: KPI[];
  trends: TrendData[];
  categoryAnalysis: CategoryAnalysis[];
  regionAnalysis: RegionAnalysis[];
  buyerPerformance: BuyerPerformance[];
  orderStatus: OrderStatus[];
  supplierRating: SupplierRating[];
  recentOrders: Array<{
    id: string;
    code: string;
    supplierName: string;
    productName: string;
    amount: number;
    status: string;
    statusName: string;
    createdAt: string;
  }>;
  alertMessages: Array<{
    id: string;
    type: 'warning' | 'error' | 'info' | 'success';
    title: string;
    content: string;
    relatedId: string;
    relatedType: string;
    timestamp: string;
    isRead: boolean;
  }>;
  summary: {
    totalSuppliers: number;
    approvedSuppliers: number;
    pendingSuppliers: number;
    totalOrders: number;
    completedOrders: number;
    totalInquiries: number;
    avgResponseTime: number;
    topCategory: string;
    topRegion: string;
    topBuyer: string;
  };
}

export const dashboard: DashboardData = {
  period: {
    startDate: '2024-01-01',
    endDate: '2024-07-31',
    periodType: 'year'
  },
  kpis: [
    {
      id: 'kpi001',
      name: '采购总金额',
      value: 125800000,
      unit: '¥',
      growthRate: 15.8,
      comparedToLastPeriod: 17200000,
      trend: 'up',
      icon: 'money-collect',
      color: '#1890ff'
    },
    {
      id: 'kpi002',
      name: '订单总数',
      value: 156,
      unit: '笔',
      growthRate: 12.3,
      comparedToLastPeriod: 17,
      trend: 'up',
      icon: 'file-text',
      color: '#52c41a'
    },
    {
      id: 'kpi003',
      name: '供应商总数',
      value: 20,
      unit: '家',
      growthRate: 5.3,
      comparedToLastPeriod: 1,
      trend: 'up',
      icon: 'team',
      color: '#722ed1'
    },
    {
      id: 'kpi004',
      name: '准时交付率',
      value: 94.6,
      unit: '%',
      growthRate: 2.1,
      comparedToLastPeriod: 1.9,
      trend: 'up',
      icon: 'clock-circle',
      color: '#fa8c16'
    },
    {
      id: 'kpi005',
      name: '质检合格率',
      value: 97.2,
      unit: '%',
      growthRate: 0.8,
      comparedToLastPeriod: 0.7,
      trend: 'up',
      icon: 'check-circle',
      color: '#13c2c2'
    },
    {
      id: 'kpi006',
      name: '成本节约率',
      value: 8.5,
      unit: '%',
      growthRate: 1.2,
      comparedToLastPeriod: 0.9,
      trend: 'up',
      icon: 'red-envelope',
      color: '#f5222d'
    }
  ],
  trends: [
    { month: '2024-01', purchaseAmount: 15800000, orderCount: 22, supplierCount: 18, onTimeDeliveryRate: 92.5, qualityPassRate: 96.8 },
    { month: '2024-02', purchaseAmount: 13200000, orderCount: 18, supplierCount: 18, onTimeDeliveryRate: 93.1, qualityPassRate: 97.1 },
    { month: '2024-03', purchaseAmount: 18500000, orderCount: 25, supplierCount: 19, onTimeDeliveryRate: 94.2, qualityPassRate: 96.9 },
    { month: '2024-04', purchaseAmount: 16800000, orderCount: 23, supplierCount: 19, onTimeDeliveryRate: 95.0, qualityPassRate: 97.5 },
    { month: '2024-05', purchaseAmount: 21300000, orderCount: 28, supplierCount: 20, onTimeDeliveryRate: 94.8, qualityPassRate: 97.2 },
    { month: '2024-06', purchaseAmount: 19600000, orderCount: 26, supplierCount: 20, onTimeDeliveryRate: 95.5, qualityPassRate: 97.8 },
    { month: '2024-07', purchaseAmount: 20600000, orderCount: 28, supplierCount: 20, onTimeDeliveryRate: 96.2, qualityPassRate: 98.1 }
  ],
  categoryAnalysis: [
    { category: '电子元器件', subCategory: '芯片/模块', purchaseAmount: 45200000, orderCount: 48, supplierCount: 6, avgPrice: 941667, growthRate: 22.5, proportion: 35.9 },
    { category: '机械设备', subCategory: '工业自动化', purchaseAmount: 38500000, orderCount: 35, supplierCount: 5, avgPrice: 1100000, growthRate: 18.3, proportion: 30.6 },
    { category: '原材料', subCategory: '钢材/有色金属', purchaseAmount: 22800000, orderCount: 28, supplierCount: 4, avgPrice: 814286, growthRate: 12.1, proportion: 18.1 },
    { category: '电气设备', subCategory: '低压电器', purchaseAmount: 12500000, orderCount: 22, supplierCount: 3, avgPrice: 568182, growthRate: 8.7, proportion: 9.9 },
    { category: '其他', subCategory: '办公耗材', purchaseAmount: 6800000, orderCount: 23, supplierCount: 2, avgPrice: 295652, growthRate: 5.2, proportion: 5.4 }
  ],
  regionAnalysis: [
    { region: '亚太', country: '中国', countryCode: 'CN', purchaseAmount: 68500000, orderCount: 82, supplierCount: 10, avgDeliveryDays: 12, proportion: 54.5, lat: 35.8617, lng: 104.1954 },
    { region: '欧洲', country: '德国', countryCode: 'DE', purchaseAmount: 18500000, orderCount: 18, supplierCount: 3, avgDeliveryDays: 35, proportion: 14.7, lat: 51.1657, lng: 10.4515 },
    { region: '亚洲', country: '日本', countryCode: 'JP', purchaseAmount: 12800000, orderCount: 15, supplierCount: 2, avgDeliveryDays: 28, proportion: 10.2, lat: 36.2048, lng: 138.2529 },
    { region: '北美', country: '美国', countryCode: 'US', purchaseAmount: 10500000, orderCount: 12, supplierCount: 2, avgDeliveryDays: 42, proportion: 8.3, lat: 37.0902, lng: -95.7129 },
    { region: '亚洲', country: '韩国', countryCode: 'KR', purchaseAmount: 8500000, orderCount: 10, supplierCount: 1, avgDeliveryDays: 25, proportion: 6.8, lat: 35.9078, lng: 127.7669 },
    { region: '欧洲', country: '瑞士', countryCode: 'CH', purchaseAmount: 5200000, orderCount: 8, supplierCount: 1, avgDeliveryDays: 38, proportion: 4.1, lat: 46.8182, lng: 8.2275 },
    { region: '欧洲', country: '法国', countryCode: 'FR', purchaseAmount: 1800000, orderCount: 6, supplierCount: 1, avgDeliveryDays: 36, proportion: 1.4, lat: 46.2276, lng: 2.2137 }
  ],
  buyerPerformance: [
    {
      buyerId: 'U002',
      buyerName: '李采购',
      department: '采购部',
      orderCount: 85,
      purchaseAmount: 68500000,
      avgOrderAmount: 805882,
      costSaving: 6200000,
      costSavingRate: 9.1,
      onTimeRate: 95.8,
      qualityPassRate: 97.6,
      supplierCount: 12,
      ranking: 1,
      performanceScore: 95.2,
      performanceLevel: 'excellent'
    },
    {
      buyerId: 'U006',
      buyerName: '陈采购',
      department: '采购部',
      orderCount: 45,
      purchaseAmount: 35200000,
      avgOrderAmount: 782222,
      costSaving: 2980000,
      costSavingRate: 8.5,
      onTimeRate: 94.2,
      qualityPassRate: 96.8,
      supplierCount: 8,
      ranking: 2,
      performanceScore: 91.5,
      performanceLevel: 'excellent'
    },
    {
      buyerId: 'U007',
      buyerName: '刘采购',
      department: '采购部',
      orderCount: 26,
      purchaseAmount: 22100000,
      avgOrderAmount: 850000,
      costSaving: 1520000,
      costSavingRate: 6.9,
      onTimeRate: 93.5,
      qualityPassRate: 97.0,
      supplierCount: 6,
      ranking: 3,
      performanceScore: 87.8,
      performanceLevel: 'good'
    }
  ],
  orderStatus: [
    { status: 'draft', statusName: '草稿', count: 8, amount: 12500000, proportion: 5.1 },
    { status: 'pending_approval', statusName: '待审批', count: 12, amount: 28600000, proportion: 11.6 },
    { status: 'approved', statusName: '已审批', count: 15, amount: 35800000, proportion: 14.5 },
    { status: 'production', statusName: '生产中', count: 18, amount: 42500000, proportion: 17.2 },
    { status: 'shipping', statusName: '运输中', count: 22, amount: 52800000, proportion: 21.4 },
    { status: 'delivered', statusName: '已送达', count: 35, amount: 68200000, proportion: 27.6 },
    { status: 'completed', statusName: '已完成', count: 46, amount: 65800000, proportion: 22.6 }
  ],
  supplierRating: [
    { rating: 5, count: 8, proportion: 40.0 },
    { rating: 4, count: 7, proportion: 35.0 },
    { rating: 3, count: 4, proportion: 20.0 },
    { rating: 2, count: 1, proportion: 5.0 },
    { rating: 1, count: 0, proportion: 0.0 }
  ],
  recentOrders: [
    { id: 'O015', code: 'PO-2024-015', supplierName: '华为数字能源技术有限公司', productName: '智能光伏逆变器', amount: 3164000, status: 'shipping', statusName: '运输中', createdAt: '2024-07-20' },
    { id: 'O014', code: 'PO-2024-014', supplierName: '中铝集团', productName: 'A00铝锭', amount: 9250000, status: 'production', statusName: '生产中', createdAt: '2024-07-18' },
    { id: 'O013', code: 'PO-2024-013', supplierName: '武汉凡谷电子技术股份有限公司', productName: '电子元件套装', amount: 51415, status: 'delivered', statusName: '已送达', createdAt: '2024-07-05' },
    { id: 'O012', code: 'PO-2024-012', supplierName: '施耐德电气(中国)有限公司', productName: '低压电器元件', amount: 325000, status: 'completed', statusName: '已完成', createdAt: '2024-06-28' },
    { id: 'O011', code: 'PO-2024-011', supplierName: '宝钢股份有限公司', productName: '无缝钢管', amount: 2580000, status: 'completed', statusName: '已完成', createdAt: '2024-06-25' }
  ],
  alertMessages: [
    {
      id: 'alert001',
      type: 'error',
      title: '质检不合格',
      content: '订单O010的1台VMC850立式加工中心精度不达标，需处理退货返修',
      relatedId: 'O010',
      relatedType: 'order',
      timestamp: '2024-06-17T10:00:00Z',
      isRead: false
    },
    {
      id: 'alert002',
      type: 'warning',
      title: '付款即将到期',
      content: '结算单SET005的到货款CHF254,250将于2024-06-15到期，请及时安排付款',
      relatedId: 'SET005',
      relatedType: 'settlement',
      timestamp: '2024-06-10T09:00:00Z',
      isRead: false
    },
    {
      id: 'alert003',
      type: 'warning',
      title: '物流异常',
      content: '物流单号LG004因台风延误，预计晚到3天',
      relatedId: 'LG004',
      relatedType: 'logistics',
      timestamp: '2024-05-18T14:00:00Z',
      isRead: true
    },
    {
      id: 'alert004',
      type: 'info',
      title: '供应商资质到期',
      content: '供应商S018的ISO9001认证将于2024-08-15到期，请提醒更新',
      relatedId: 'S018',
      relatedType: 'supplier',
      timestamp: '2024-07-15T09:00:00Z',
      isRead: false
    },
    {
      id: 'alert005',
      type: 'success',
      title: '成本节约达标',
      content: '本月采购成本节约率达8.5%，超额完成目标',
      relatedId: '',
      relatedType: 'system',
      timestamp: '2024-07-25T16:00:00Z',
      isRead: true
    }
  ],
  summary: {
    totalSuppliers: 20,
    approvedSuppliers: 17,
    pendingSuppliers: 3,
    totalOrders: 156,
    completedOrders: 46,
    totalInquiries: 38,
    avgResponseTime: 24,
    topCategory: '电子元器件',
    topRegion: '中国',
    topBuyer: '李采购'
  }
};

export const dashboardData = dashboard;
export default dashboard;
