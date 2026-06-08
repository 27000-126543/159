import { create } from 'zustand';
import { orderService, ApprovalSubmitData } from '@/mock/services/orderService';
import { Order } from '@/mock/data/orders';
import { useUserStore } from './userStore';

export interface ApprovalItem {
  id: string;
  businessId: string;
  businessType: 'order' | 'supplier' | 'inquiry' | 'contract';
  title: string;
  code: string;
  applicantId: string;
  applicantName: string;
  applicantDepartment: string;
  amount: number;
  currency: string;
  status: 'pending' | 'approved' | 'rejected';
  currentNode: string;
  priority: 'low' | 'medium' | 'high';
  appliedAt: string;
  details?: Partial<Order>;
}

export interface ApprovalState {
  pendingApprovals: ApprovalItem[];
  approvedApprovals: ApprovalItem[];
  rejectedApprovals: ApprovalItem[];
  currentApproval: ApprovalItem | null;
  pendingCount: number;
  approvedCount: number;
  rejectedCount: number;
  loading: boolean;
  error: string | null;
}

export interface ApprovalActions {
  fetchPendingApprovals: () => Promise<void>;
  fetchApprovedApprovals: () => Promise<void>;
  fetchRejectedApprovals: () => Promise<void>;
  fetchApprovalDetail: (id: string) => Promise<ApprovalItem | null>;
  approve: (id: string, opinion: string, signature?: string) => Promise<{ success: boolean; message: string }>;
  reject: (id: string, opinion: string, signature?: string) => Promise<{ success: boolean; message: string }>;
  batchApprove: (ids: string[], opinion: string) => Promise<{ success: boolean; message: string; approved: number; failed: number }>;
  fetchApprovalCount: () => Promise<void>;
  setCurrentApproval: (approval: ApprovalItem | null) => void;
  clearError: () => void;
  resetState: () => void;
}

const getOrderAmount = (order: Order): number => {
  return (order as any).grandTotal || order.totalAmount || 0;
};

const mapOrderToApprovalItem = (order: Order, status: 'pending' | 'approved' | 'rejected'): ApprovalItem => {
  const amount = getOrderAmount(order);
  const priority: 'low' | 'medium' | 'high' =
    amount > 500000 ? 'high' : amount > 100000 ? 'medium' : 'low';

  return {
    id: `approval-${order.id}`,
    businessId: order.id,
    businessType: 'order',
    title: order.title,
    code: order.code,
    applicantId: order.buyerId,
    applicantName: order.buyerName,
    applicantDepartment: order.department,
    amount,
    currency: order.currency,
    status,
    currentNode: String(order.currentApprovalNode || ''),
    priority,
    appliedAt: order.createdAt,
    details: order,
  };
};

const initialState: ApprovalState = {
  pendingApprovals: [],
  approvedApprovals: [],
  rejectedApprovals: [],
  currentApproval: null,
  pendingCount: 0,
  approvedCount: 0,
  rejectedCount: 0,
  loading: false,
  error: null,
};

export const useApprovalStore = create<ApprovalState & ApprovalActions>((set, get) => ({
  ...initialState,

  fetchPendingApprovals: async () => {
    set({ loading: true, error: null });
    try {
      const result = await orderService.getOrderList({ status: 'pending_approval' });
      const pendingItems: ApprovalItem[] = result.list.map((order) =>
        mapOrderToApprovalItem(order, 'pending')
      );
      set({
        pendingApprovals: pendingItems,
        pendingCount: result.total,
        loading: false,
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '获取待办审批失败';
      set({ error: errorMessage, loading: false });
    }
  },

  fetchApprovedApprovals: async () => {
    set({ loading: true, error: null });
    try {
      const result = await orderService.getOrderList({ status: 'approved' });
      const approvedItems: ApprovalItem[] = result.list.map((order) =>
        mapOrderToApprovalItem(order, 'approved')
      );
      set({
        approvedApprovals: approvedItems,
        approvedCount: result.total,
        loading: false,
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '获取已办审批失败';
      set({ error: errorMessage, loading: false });
    }
  },

  fetchRejectedApprovals: async () => {
    set({ loading: true, error: null });
    try {
      const result = await orderService.getOrderList({ status: 'rejected' });
      const rejectedItems: ApprovalItem[] = result.list.map((order) =>
        mapOrderToApprovalItem(order, 'rejected')
      );
      set({
        rejectedApprovals: rejectedItems,
        rejectedCount: result.total,
        loading: false,
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '获取已拒绝审批失败';
      set({ error: errorMessage, loading: false });
    }
  },

  fetchApprovalDetail: async (id) => {
    set({ loading: true, error: null });
    try {
      const approvalItem = get().pendingApprovals.find((a) => a.id === id) ||
        get().approvedApprovals.find((a) => a.id === id) ||
        get().rejectedApprovals.find((a) => a.id === id);

      if (approvalItem) {
        const order = await orderService.getOrderById(approvalItem.businessId);
        if (order) {
          const fullApprovalItem = mapOrderToApprovalItem(order, approvalItem.status);
          set({ currentApproval: fullApprovalItem, loading: false });
          return fullApprovalItem;
        }
      }
      set({ error: '审批详情不存在', loading: false });
      return null;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '获取审批详情失败';
      set({ error: errorMessage, loading: false });
      return null;
    }
  },

  approve: async (id, opinion, signature) => {
    set({ loading: true, error: null });
    try {
      const approvalItem = get().pendingApprovals.find((a) => a.id === id);
      if (!approvalItem) {
        set({ error: '审批记录不存在', loading: false });
        return { success: false, message: '审批记录不存在' };
      }

      const currentUser = useUserStore.getState().user;
      const approverData: ApprovalSubmitData = {
        orderId: approvalItem.businessId,
        nodeName: approvalItem.currentNode,
        opinion,
        approverId: currentUser?.id || '',
        approverName: currentUser?.name || '',
        approverRole: (currentUser as any)?.roleName || currentUser?.role || '',
        status: 'approved',
      };

      const result = await orderService.approveOrder(approverData);

      if (result) {
        set((state) => ({
          pendingApprovals: state.pendingApprovals.filter((a) => a.id !== id),
          pendingCount: state.pendingCount - 1,
          approvedApprovals: [
            { ...approvalItem, status: 'approved' as const },
            ...state.approvedApprovals,
          ],
          approvedCount: state.approvedCount + 1,
          loading: false,
        }));
        return { success: true, message: '审批通过' };
      } else {
        set({ error: '审批失败，订单不存在或状态不允许', loading: false });
        return { success: false, message: '审批失败，订单不存在或状态不允许' };
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '审批操作失败';
      set({ error: errorMessage, loading: false });
      return { success: false, message: errorMessage };
    }
  },

  reject: async (id, opinion, signature) => {
    set({ loading: true, error: null });
    try {
      const approvalItem = get().pendingApprovals.find((a) => a.id === id);
      if (!approvalItem) {
        set({ error: '审批记录不存在', loading: false });
        return { success: false, message: '审批记录不存在' };
      }

      const currentUser = useUserStore.getState().user;
      const approverData: ApprovalSubmitData = {
        orderId: approvalItem.businessId,
        nodeName: approvalItem.currentNode,
        opinion,
        approverId: currentUser?.id || '',
        approverName: currentUser?.name || '',
        approverRole: (currentUser as any)?.roleName || currentUser?.role || '',
        status: 'rejected',
      };

      const result = await orderService.approveOrder(approverData);

      if (result) {
        set((state) => ({
          pendingApprovals: state.pendingApprovals.filter((a) => a.id !== id),
          pendingCount: state.pendingCount - 1,
          rejectedApprovals: [
            { ...approvalItem, status: 'rejected' as const },
            ...state.rejectedApprovals,
          ],
          rejectedCount: state.rejectedCount + 1,
          loading: false,
        }));
        return { success: true, message: '已拒绝' };
      }
      set({ error: '拒绝失败，订单不存在或状态不允许', loading: false });
      return { success: false, message: '拒绝失败，订单不存在或状态不允许' };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '拒绝操作失败';
      set({ error: errorMessage, loading: false });
      return { success: false, message: errorMessage };
    }
  },

  batchApprove: async (ids, opinion) => {
    set({ loading: true, error: null });
    let approved = 0;
    let failed = 0;
    try {
      for (const id of ids) {
        const result = await get().approve(id, opinion);
        if (result.success) {
          approved++;
        } else {
          failed++;
        }
      }
      set({ loading: false });
      return { success: true, message: `批量审批完成：通过${approved}条，失败${failed}条`, approved, failed };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '批量审批失败';
      set({ error: errorMessage, loading: false });
      return { success: false, message: errorMessage, approved, failed };
    }
  },

  fetchApprovalCount: async () => {
    try {
      const [pendingResult, approvedResult, rejectedResult] = await Promise.all([
        orderService.getOrderList({ status: 'pending_approval', pageSize: 1 }),
        orderService.getOrderList({ status: 'approved', pageSize: 1 }),
        orderService.getOrderList({ status: 'rejected', pageSize: 1 }),
      ]);
      set({
        pendingCount: pendingResult.total,
        approvedCount: approvedResult.total,
        rejectedCount: rejectedResult.total,
      });
    } catch (err) {
      console.error('获取审批数量失败:', err);
    }
  },

  setCurrentApproval: (approval) => {
    set({ currentApproval: approval });
  },

  clearError: () => set({ error: null }),

  resetState: () => set(initialState),
}));

export const approvalSelectors = {
  selectPendingApprovals: (state: ApprovalState & ApprovalActions) => state.pendingApprovals,
  selectApprovedApprovals: (state: ApprovalState & ApprovalActions) => state.approvedApprovals,
  selectRejectedApprovals: (state: ApprovalState & ApprovalActions) => state.rejectedApprovals,
  selectCurrentApproval: (state: ApprovalState & ApprovalActions) => state.currentApproval,
  selectPendingCount: (state: ApprovalState & ApprovalActions) => state.pendingCount,
  selectApprovedCount: (state: ApprovalState & ApprovalActions) => state.approvedCount,
  selectRejectedCount: (state: ApprovalState & ApprovalActions) => state.rejectedCount,
  selectLoading: (state: ApprovalState & ApprovalActions) => state.loading,
  selectError: (state: ApprovalState & ApprovalActions) => state.error,
};
