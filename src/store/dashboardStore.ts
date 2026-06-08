import { create } from 'zustand';
import { dashboardService } from '@/mock/services';
import type {
  DashboardData,
  KPI,
  DashboardTrendData,
  CategoryAnalysis,
  RegionAnalysis,
  BuyerPerformance,
  OrderStatusStat,
  SupplierRating,
  DashboardFilterParams,
} from '@/types';

export interface DashboardState {
  data: DashboardData | null;
  kpis: KPI[];
  trends: DashboardTrendData[];
  categoryAnalysis: CategoryAnalysis[];
  regionAnalysis: RegionAnalysis[];
  buyerPerformance: BuyerPerformance[];
  orderStatus: OrderStatusStat[];
  supplierRating: SupplierRating[];
  recentOrders: DashboardData['recentOrders'];
  alertMessages: DashboardData['alertMessages'];
  summary: DashboardData['summary'] | null;
  comparisonData: any | null;
  filterParams: DashboardFilterParams;
  loading: boolean;
  error: string | null;
}

export interface DashboardActions {
  fetchDashboardData: (params?: DashboardFilterParams) => Promise<void>;
  fetchKPIData: (params?: DashboardFilterParams) => Promise<void>;
  fetchTrendData: (params?: DashboardFilterParams) => Promise<void>;
  fetchCategoryAnalysis: (params?: DashboardFilterParams) => Promise<void>;
  fetchRegionAnalysis: (params?: DashboardFilterParams) => Promise<void>;
  fetchBuyerPerformance: (params?: DashboardFilterParams) => Promise<void>;
  fetchOrderStatus: (params?: DashboardFilterParams) => Promise<void>;
  fetchSupplierRating: (params?: DashboardFilterParams) => Promise<void>;
  fetchRecentOrders: (limit?: number) => Promise<void>;
  fetchAlertMessages: (unreadOnly?: boolean) => Promise<void>;
  fetchSummary: (params?: DashboardFilterParams) => Promise<void>;
  fetchComparisonData: (period: 'week' | 'month' | 'quarter' | 'year') => Promise<void>;
  markAlertAsRead: (id: string) => Promise<void>;
  markAllAlertsAsRead: () => Promise<void>;
  exportData: (params: ExportParams) => Promise<boolean>;
  refreshData: (params?: DashboardFilterParams) => Promise<void>;
  setFilterParams: (params: Partial<DashboardFilterParams>) => void;
  clearError: () => void;
  resetState: () => void;
}

const initialState: DashboardState = {
  data: null,
  kpis: [],
  trends: [],
  categoryAnalysis: [],
  regionAnalysis: [],
  buyerPerformance: [],
  orderStatus: [],
  supplierRating: [],
  recentOrders: [],
  alertMessages: [],
  summary: null,
  comparisonData: null,
  filterParams: {},
  loading: false,
  error: null,
};

export type ExportParams = {
  type: 'kpi' | 'trend' | 'category' | 'region' | 'buyer' | 'all';
  format: 'excel' | 'pdf' | 'csv';
  filterParams?: DashboardFilterParams;
};

export const useDashboardStore = create<DashboardState & DashboardActions>((set, get) => ({
  ...initialState,

  fetchDashboardData: async (params) => {
    set({ loading: true, error: null });
    try {
      const mergedParams = { ...get().filterParams, ...params };
      const data = await dashboardService.getDashboardData(mergedParams);
      set({
        data,
        alertMessages: data.alertMessages,
        kpis: data.kpis,
        trends: data.trends,
        categoryAnalysis: data.categoryAnalysis,
        regionAnalysis: data.regionAnalysis,
        buyerPerformance: data.buyerPerformance,
        orderStatus: data.orderStatus,
        supplierRating: data.supplierRating,
        recentOrders: data.recentOrders,
        summary: data.summary,
        filterParams: mergedParams,
        loading: false
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '获取大屏数据失败';
      set({ error: errorMessage, loading: false });
    }
  },

  fetchKPIData: async (params) => {
    set({ loading: true, error: null });
    try {
      const mergedParams = { ...get().filterParams, ...params };
      const kpis = await dashboardService.getKPIData(mergedParams);
      set({ kpis, loading: false });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '获取KPI数据失败';
      set({ error: errorMessage, loading: false });
    }
  },

  fetchTrendData: async (params) => {
    set({ loading: true, error: null });
    try {
      const mergedParams = { ...get().filterParams, ...params };
      const trends = await dashboardService.getTrendData(mergedParams);
      set({ trends, loading: false });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '获取趋势数据失败';
      set({ error: errorMessage, loading: false });
    }
  },

  fetchCategoryAnalysis: async (params) => {
    set({ loading: true, error: null });
    try {
      const mergedParams = { ...get().filterParams, ...params };
      const categoryAnalysis = await dashboardService.getCategoryAnalysis(mergedParams);
      set({ categoryAnalysis, loading: false });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '获取品类分析失败';
      set({ error: errorMessage, loading: false });
    }
  },

  fetchRegionAnalysis: async (params) => {
    set({ loading: true, error: null });
    try {
      const mergedParams = { ...get().filterParams, ...params };
      const regionAnalysis = await dashboardService.getRegionAnalysis(mergedParams);
      set({ regionAnalysis, loading: false });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '获取区域分析失败';
      set({ error: errorMessage, loading: false });
    }
  },

  fetchBuyerPerformance: async (params) => {
    set({ loading: true, error: null });
    try {
      const mergedParams = { ...get().filterParams, ...params };
      const buyerPerformance = await dashboardService.getBuyerPerformance(mergedParams);
      set({ buyerPerformance, loading: false });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '获取采购员绩效失败';
      set({ error: errorMessage, loading: false });
    }
  },

  fetchOrderStatus: async (params) => {
    set({ loading: true, error: null });
    try {
      const mergedParams = { ...get().filterParams, ...params };
      const orderStatus = await dashboardService.getOrderStatus(mergedParams);
      set({ orderStatus, loading: false });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '获取订单状态失败';
      set({ error: errorMessage, loading: false });
    }
  },

  fetchSupplierRating: async (params) => {
    set({ loading: true, error: null });
    try {
      const mergedParams = { ...get().filterParams, ...params };
      const supplierRating = await dashboardService.getSupplierRating(mergedParams);
      set({ supplierRating, loading: false });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '获取供应商评级失败';
      set({ error: errorMessage, loading: false });
    }
  },

  fetchRecentOrders: async (limit = 10) => {
    set({ loading: true, error: null });
    try {
      const recentOrders = await dashboardService.getRecentOrders(limit);
      set({ recentOrders, loading: false });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '获取最近订单失败';
      set({ error: errorMessage, loading: false });
    }
  },

  fetchAlertMessages: async (unreadOnly) => {
    set({ loading: true, error: null });
    try {
      const alertMessages = await dashboardService.getAlertMessages(unreadOnly);
      set({ alertMessages, loading: false });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '获取告警消息失败';
      set({ error: errorMessage, loading: false });
    }
  },

  fetchSummary: async (params) => {
    set({ loading: true, error: null });
    try {
      const mergedParams = { ...get().filterParams, ...params };
      const summary = await dashboardService.getSummary(mergedParams);
      set({ summary, loading: false });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '获取汇总数据失败';
      set({ error: errorMessage, loading: false });
    }
  },

  fetchComparisonData: async (period) => {
    set({ loading: true, error: null });
    try {
      const comparisonData = await dashboardService.getComparisonData(period);
      set({ comparisonData, loading: false });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '获取对比数据失败';
      set({ error: errorMessage, loading: false });
    }
  },

  markAlertAsRead: async (id) => {
    try {
      await dashboardService.markAlertAsRead(id);
      set((state) => ({
        alertMessages: state.alertMessages.map((alert) =>
          alert.id === id ? { ...alert, isRead: true } : alert
        ),
      }));
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '标记告警失败';
      set({ error: errorMessage });
    }
  },

  markAllAlertsAsRead: async () => {
    try {
      await dashboardService.markAllAlertsAsRead();
      set((state) => ({
        alertMessages: state.alertMessages.map((alert) => ({ ...alert, isRead: true })),
      }));
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '标记全部告警失败';
      set({ error: errorMessage });
    }
  },

  exportData: async (params) => {
    set({ loading: true, error: null });
    try {
      const result = await dashboardService.exportData(params);
      set({ loading: false });
      return result.success;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '导出数据失败';
      set({ error: errorMessage, loading: false });
      return false;
    }
  },

  refreshData: async (params) => {
    set({ loading: true, error: null });
    try {
      const mergedParams = { ...get().filterParams, ...params };
      const data = await dashboardService.getDashboardData(mergedParams);
      set({ data, filterParams: mergedParams, loading: false });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '刷新数据失败';
      set({ error: errorMessage, loading: false });
    }
  },

  setFilterParams: (params) => {
    set((state) => ({
      filterParams: { ...state.filterParams, ...params },
    }));
  },

  clearError: () => set({ error: null }),

  resetState: () => set(initialState),
}));

export const dashboardSelectors = {
  selectData: (state: DashboardState & DashboardActions) => state.data,
  selectKPIs: (state: DashboardState & DashboardActions) => state.kpis,
  selectTrends: (state: DashboardState & DashboardActions) => state.trends,
  selectCategoryAnalysis: (state: DashboardState & DashboardActions) => state.categoryAnalysis,
  selectRegionAnalysis: (state: DashboardState & DashboardActions) => state.regionAnalysis,
  selectBuyerPerformance: (state: DashboardState & DashboardActions) => state.buyerPerformance,
  selectOrderStatus: (state: DashboardState & DashboardActions) => state.orderStatus,
  selectSupplierRating: (state: DashboardState & DashboardActions) => state.supplierRating,
  selectRecentOrders: (state: DashboardState & DashboardActions) => state.recentOrders,
  selectAlertMessages: (state: DashboardState & DashboardActions) => state.alertMessages,
  selectSummary: (state: DashboardState & DashboardActions) => state.summary,
  selectComparisonData: (state: DashboardState & DashboardActions) => state.comparisonData,
  selectFilterParams: (state: DashboardState & DashboardActions) => state.filterParams,
  selectLoading: (state: DashboardState & DashboardActions) => state.loading,
  selectError: (state: DashboardState & DashboardActions) => state.error,
  selectUnreadAlertCount: (state: DashboardState & DashboardActions) =>
    state.alertMessages.filter((a) => !a.isRead).length,
};
