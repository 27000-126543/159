import { dashboardData, DashboardData } from '../data/dashboard';

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export interface DashboardFilterParams {
  startDate?: string;
  endDate?: string;
  periodType?: 'month' | 'quarter' | 'year' | 'custom';
  category?: string;
  region?: string;
  buyerId?: string;
}

export interface ExportParams {
  type: 'kpi' | 'trend' | 'category' | 'region' | 'buyer' | 'all';
  format: 'excel' | 'pdf' | 'csv';
  filterParams?: DashboardFilterParams;
}

export const dashboardService = {
  async getDashboardData(params?: DashboardFilterParams): Promise<DashboardData> {
    await delay(800);
    
    let data = JSON.parse(JSON.stringify(dashboardData)) as DashboardData;
    
    if (params?.startDate && params?.endDate) {
      data.period = {
        startDate: params.startDate,
        endDate: params.endDate,
        periodType: params.periodType || 'custom'
      };
      
      const start = new Date(params.startDate);
      const end = new Date(params.endDate);
      
      data.trends = data.trends.filter(t => {
        const monthDate = new Date(t.month + '-01');
        return monthDate >= start && monthDate <= end;
      });
    }
    
    if (params?.category) {
      data.categoryAnalysis = data.categoryAnalysis.filter(c => c.category === params.category);
      data.summary.topCategory = params.category;
    }
    
    if (params?.region) {
      data.regionAnalysis = data.regionAnalysis.filter(r => r.region === params.region || r.country === params.region);
      data.summary.topRegion = params.region;
    }
    
    if (params?.buyerId) {
      data.buyerPerformance = data.buyerPerformance.filter(b => b.buyerId === params.buyerId);
      data.summary.topBuyer = data.buyerPerformance[0]?.buyerName || '';
    }
    
    return data;
  },
  
  async getKPIData(params?: DashboardFilterParams): Promise<DashboardData['kpis']> {
    await delay(400);
    const data = await this.getDashboardData(params);
    return data.kpis;
  },
  
  async getTrendData(params?: DashboardFilterParams): Promise<DashboardData['trends']> {
    await delay(400);
    const data = await this.getDashboardData(params);
    return data.trends;
  },
  
  async getCategoryAnalysis(params?: DashboardFilterParams): Promise<DashboardData['categoryAnalysis']> {
    await delay(400);
    const data = await this.getDashboardData(params);
    return data.categoryAnalysis;
  },
  
  async getRegionAnalysis(params?: DashboardFilterParams): Promise<DashboardData['regionAnalysis']> {
    await delay(400);
    const data = await this.getDashboardData(params);
    return data.regionAnalysis;
  },
  
  async getBuyerPerformance(params?: DashboardFilterParams): Promise<DashboardData['buyerPerformance']> {
    await delay(400);
    const data = await this.getDashboardData(params);
    return data.buyerPerformance;
  },
  
  async getOrderStatus(params?: DashboardFilterParams): Promise<DashboardData['orderStatus']> {
    await delay(300);
    const data = await this.getDashboardData(params);
    return data.orderStatus;
  },
  
  async getSupplierRating(params?: DashboardFilterParams): Promise<DashboardData['supplierRating']> {
    await delay(300);
    const data = await this.getDashboardData(params);
    return data.supplierRating;
  },
  
  async getRecentOrders(limit?: number): Promise<DashboardData['recentOrders']> {
    await delay(300);
    const orders = [...dashboardData.recentOrders];
    return limit ? orders.slice(0, limit) : orders;
  },
  
  async getAlertMessages(unreadOnly?: boolean): Promise<DashboardData['alertMessages']> {
    await delay(300);
    let messages = [...dashboardData.alertMessages];
    if (unreadOnly) {
      messages = messages.filter(m => !m.isRead);
    }
    return messages;
  },
  
  async getSummary(params?: DashboardFilterParams): Promise<DashboardData['summary']> {
    await delay(300);
    const data = await this.getDashboardData(params);
    return data.summary;
  },
  
  async markAlertAsRead(alertId: string): Promise<{ success: boolean; message: string }> {
    await delay(300);
    
    const alert = dashboardData.alertMessages.find(a => a.id === alertId);
    if (!alert) {
      return { success: false, message: '消息不存在' };
    }
    
    alert.isRead = true;
    return { success: true, message: '已标记为已读' };
  },
  
  async markAllAlertsAsRead(): Promise<{ success: boolean; count: number }> {
    await delay(400);
    
    const unreadCount = dashboardData.alertMessages.filter(a => !a.isRead).length;
    dashboardData.alertMessages.forEach(a => {
      a.isRead = true;
    });
    
    return { success: true, count: unreadCount };
  },
  
  async exportData(params: ExportParams): Promise<{
    success: boolean;
    downloadUrl: string;
    filename: string;
    message: string;
  }> {
    await delay(1500);
    
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const formatExtensions: Record<string, string> = {
      excel: 'xlsx',
      pdf: 'pdf',
      csv: 'csv'
    };
    
    const typeNames: Record<string, string> = {
      kpi: 'KPI指标',
      trend: '趋势数据',
      category: '品类分析',
      region: '区域分析',
      buyer: '采购员效能',
      all: '完整报表'
    };
    
    const filename = `采购数据分析_${typeNames[params.type]}_${timestamp}.${formatExtensions[params.format]}`;
    const downloadUrl = `/exports/${filename}`;
    
    return {
      success: true,
      downloadUrl,
      filename,
      message: `${typeNames[params.type]}导出成功`
    };
  },
  
  async getComparisonData(period: 'week' | 'month' | 'quarter' | 'year'): Promise<{
    currentPeriod: {
      purchaseAmount: number;
      orderCount: number;
      supplierCount: number;
      onTimeDeliveryRate: number;
      qualityPassRate: number;
    };
    lastPeriod: {
      purchaseAmount: number;
      orderCount: number;
      supplierCount: number;
      onTimeDeliveryRate: number;
      qualityPassRate: number;
    };
    growth: {
      purchaseAmount: number;
      orderCount: number;
      supplierCount: number;
      onTimeDeliveryRate: number;
      qualityPassRate: number;
    };
  }> {
    await delay(500);
    
    const multipliers: Record<string, number> = {
      week: 0.25,
      month: 1,
      quarter: 3,
      year: 12
    };
    
    const m = multipliers[period] || 1;
    
    const currentPeriod = {
      purchaseAmount: 125800000 * m,
      orderCount: 156 * m,
      supplierCount: 20,
      onTimeDeliveryRate: 94.6,
      qualityPassRate: 97.2
    };
    
    const lastPeriod = {
      purchaseAmount: 108600000 * m,
      orderCount: 139 * m,
      supplierCount: 19,
      onTimeDeliveryRate: 92.5,
      qualityPassRate: 96.5
    };
    
    const growth = {
      purchaseAmount: ((currentPeriod.purchaseAmount - lastPeriod.purchaseAmount) / lastPeriod.purchaseAmount) * 100,
      orderCount: ((currentPeriod.orderCount - lastPeriod.orderCount) / lastPeriod.orderCount) * 100,
      supplierCount: ((currentPeriod.supplierCount - lastPeriod.supplierCount) / lastPeriod.supplierCount) * 100,
      onTimeDeliveryRate: currentPeriod.onTimeDeliveryRate - lastPeriod.onTimeDeliveryRate,
      qualityPassRate: currentPeriod.qualityPassRate - lastPeriod.qualityPassRate
    };
    
    return { currentPeriod, lastPeriod, growth };
  },
  
  async refreshData(): Promise<{ success: boolean; timestamp: string; message: string }> {
    await delay(600);
    
    return {
      success: true,
      timestamp: new Date().toISOString(),
      message: '数据已刷新'
    };
  }
};
