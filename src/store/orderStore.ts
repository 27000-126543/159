import { create } from 'zustand';
import { orderService, OrderQueryParams, OrderCreateData, ApprovalSubmitData } from '@/mock/services/orderService';
import { customsService } from '@/mock/services/customsService';
import { logisticsService } from '@/mock/services/logisticsService';
import { qualityService } from '@/mock/services/qualityService';
import { settlementService } from '@/mock/services/settlementService';
import { Order, OrderItem, ApprovalRecord } from '@/mock/data/orders';
import { Customs } from '@/mock/data/customs';
import { Logistics } from '@/mock/data/logistics';
import { QualityInspection } from '@/mock/data/quality';
import { Settlement } from '@/mock/data/settlement';
import { useUserStore } from '@/store/userStore';

export interface OrderRelations {
  customs?: Customs;
  logistics?: Logistics;
  inspection?: QualityInspection;
  settlement?: Settlement;
}

export interface OrderState {
  orders: Order[];
  total: number;
  page: number;
  pageSize: number;
  currentOrder: Order | null;
  approvalRecords: ApprovalRecord[];
  orderItems: OrderItem[];
  statistics: any | null;
  loading: boolean;
  error: string | null;
  filterParams: OrderQueryParams;
  orderRelations: Record<string, OrderRelations>;
}

export interface OrderActions {
  fetchOrders: (params?: OrderQueryParams) => Promise<void>;
  fetchOrderById: (id: string) => Promise<Order | null>;
  createOrder: (data: OrderCreateData) => Promise<Order | null>;
  updateOrder: (id: string, data: Partial<Order>) => Promise<Order | null>;
  deleteOrder: (id: string) => Promise<{ success: boolean; message: string }>;
  submitApproval: (id: string) => Promise<{ success: boolean; message: string }>;
  approveOrder: (data: ApprovalSubmitData) => Promise<{ success: boolean; message: string }>;
  updateOrderStatus: (id: string, status: Order['status']) => Promise<Order | null>;
  fetchStatistics: () => Promise<any>;
  fetchOrderRelations: (orderId: string) => Promise<OrderRelations>;
  setFilterParams: (params: Partial<OrderQueryParams>) => void;
  setCurrentOrder: (order: Order | null) => void;
  clearError: () => void;
  resetState: () => void;
}

const initialState: OrderState = {
  orders: [],
  total: 0,
  page: 1,
  pageSize: 10,
  currentOrder: null,
  approvalRecords: [],
  orderItems: [],
  statistics: null,
  loading: false,
  error: null,
  filterParams: {},
  orderRelations: {},
};

export const useOrderStore = create<OrderState & OrderActions>((set, get) => ({
  ...initialState,

  fetchOrders: async (params) => {
    set({ loading: true, error: null });
    try {
      const mergedParams = { ...get().filterParams, ...params };
      const currentUser = useUserStore.getState().user;
      const currentUserRole = currentUser?.role;
      const currentUserRegions = currentUser?.regions;
      const result = await orderService.getOrderList(mergedParams, currentUserRole, currentUserRegions);
      set({
        orders: result.list,
        total: result.total,
        page: result.page,
        pageSize: result.pageSize,
        filterParams: mergedParams,
        loading: false,
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '获取订单列表失败';
      set({ error: errorMessage, loading: false });
    }
  },

  fetchOrderById: async (id) => {
    set({ loading: true, error: null });
    try {
      const order = await orderService.getOrderById(id);
      if (order) {
        set({
          currentOrder: order,
          approvalRecords: order.approvalRecords || [],
          orderItems: order.items || [],
          loading: false,
        });
      } else {
        set({ error: '订单不存在', loading: false });
      }
      return order;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '获取订单详情失败';
      set({ error: errorMessage, loading: false });
      return null;
    }
  },

  createOrder: async (data) => {
    set({ loading: true, error: null });
    try {
      const newOrder = await orderService.createOrder(data);
      set({ loading: false });
      return newOrder;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '创建订单失败';
      set({ error: errorMessage, loading: false });
      return null;
    }
  },

  updateOrder: async (id, data) => {
    set({ loading: true, error: null });
    try {
      const updatedOrder = await orderService.updateOrder(id, data);
      if (updatedOrder) {
        set((state) => ({
          currentOrder: updatedOrder,
          orders: state.orders.map((o) =>
            o.id === id ? updatedOrder : o
          ),
          loading: false,
        }));
      } else {
        set({ error: '更新失败，订单不存在或状态不允许修改', loading: false });
      }
      return updatedOrder;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '更新订单失败';
      set({ error: errorMessage, loading: false });
      return null;
    }
  },

  deleteOrder: async (id) => {
    set({ loading: true, error: null });
    try {
      const result = await orderService.deleteOrder(id);
      if (result.success) {
        set((state) => ({
          orders: state.orders.filter((o) => o.id !== id),
          total: state.total - 1,
          loading: false,
        }));
      } else {
        set({ error: result.message, loading: false });
      }
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '删除订单失败';
      set({ error: errorMessage, loading: false });
      return { success: false, message: errorMessage };
    }
  },

  submitApproval: async (id) => {
    set({ loading: true, error: null });
    try {
      const result = await orderService.submitApproval(id);
      if (result) {
        set((state) => ({
          currentOrder: result,
          orders: state.orders.map((o) =>
            o.id === id ? result : o
          ),
          approvalRecords: result.approvalRecords || [],
          loading: false,
        }));
        return { success: true, message: '提交审批成功' };
      }
      set({ error: '提交审批失败，订单状态不允许', loading: false });
      return { success: false, message: '提交审批失败，订单状态不允许' };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '提交审批失败';
      set({ error: errorMessage, loading: false });
      return { success: false, message: errorMessage };
    }
  },

  approveOrder: async (data) => {
    set({ loading: true, error: null });
    try {
      const result = await orderService.approveOrder(data);
      if (result) {
        set((state) => ({
          currentOrder: result,
          orders: state.orders.map((o) =>
            o.id === data.orderId ? result : o
          ),
          approvalRecords: result.approvalRecords || [],
          loading: false,
        }));
        return { success: true, message: '审批成功' };
      }
      set({ error: '审批失败，订单不存在或状态不允许', loading: false });
      return { success: false, message: '审批失败，订单不存在或状态不允许' };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '审批操作失败';
      set({ error: errorMessage, loading: false });
      return { success: false, message: errorMessage };
    }
  },

  updateOrderStatus: async (id, status) => {
    set({ loading: true, error: null });
    try {
      const updatedOrder = await orderService.updateOrderStatus(id, status);
      if (updatedOrder) {
        set((state) => ({
          currentOrder: updatedOrder,
          orders: state.orders.map((o) =>
            o.id === id ? updatedOrder : o
          ),
          loading: false,
        }));
        return updatedOrder;
      }
      set({ error: '更新状态失败，订单不存在或状态流转不合法', loading: false });
      return null;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '更新订单状态失败';
      set({ error: errorMessage, loading: false });
      return null;
    }
  },

  fetchStatistics: async () => {
    set({ loading: true, error: null });
    try {
      const result = await orderService.getOrderStatistics();
      set({ statistics: result, loading: false });
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '获取统计数据失败';
      set({ error: errorMessage, loading: false });
      return null;
    }
  },

  fetchOrderRelations: async (orderId) => {
    set({ loading: true, error: null });
    try {
      const [customs, logistics, inspection, settlement] = await Promise.all([
        customsService.getCustomsByOrderId(orderId),
        logisticsService.getLogisticsByOrderId(orderId),
        qualityService.getQualityByOrderId(orderId),
        settlementService.getSettlementByOrderId(orderId),
      ]);

      const relations: OrderRelations = {
        customs: customs || undefined,
        logistics: logistics || undefined,
        inspection: inspection || undefined,
        settlement: settlement || undefined,
      };

      set((state) => ({
        orderRelations: {
          ...state.orderRelations,
          [orderId]: relations,
        },
        loading: false,
      }));

      return relations;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '获取关联数据失败';
      set({ error: errorMessage, loading: false });
      return {};
    }
  },

  setFilterParams: (params) => {
    set((state) => ({
      filterParams: { ...state.filterParams, ...params },
    }));
  },

  setCurrentOrder: (order) => {
    set({ currentOrder: order });
  },

  clearError: () => set({ error: null }),

  resetState: () => set(initialState),
}));

export const orderSelectors = {
  selectOrders: (state: OrderState & OrderActions) => state.orders,
  selectTotal: (state: OrderState & OrderActions) => state.total,
  selectPage: (state: OrderState & OrderActions) => state.page,
  selectPageSize: (state: OrderState & OrderActions) => state.pageSize,
  selectCurrentOrder: (state: OrderState & OrderActions) => state.currentOrder,
  selectApprovalRecords: (state: OrderState & OrderActions) => state.approvalRecords,
  selectOrderItems: (state: OrderState & OrderActions) => state.orderItems,
  selectStatistics: (state: OrderState & OrderActions) => state.statistics,
  selectLoading: (state: OrderState & OrderActions) => state.loading,
  selectError: (state: OrderState & OrderActions) => state.error,
  selectFilterParams: (state: OrderState & OrderActions) => state.filterParams,
};
