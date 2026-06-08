import { create } from 'zustand';
import { settlementService, SettlementQueryParams, PaymentSubmitData } from '@/mock/services/settlementService';
import { Settlement } from '@/mock/data/settlement';
import { Payment } from '@/types';

export interface Statement {
  id: string;
  statementNo: string;
  supplierId: string;
  supplierName: string;
  periodStart: string;
  periodEnd: string;
  orderCount: number;
  totalAmount: number;
  confirmedAmount: number;
  pendingAmount: number;
  status: 'pending' | 'confirmed' | 'partial';
  orders: Array<{
    id: string;
    orderNo: string;
    orderDate: string;
    amount: number;
    status: string;
  }>;
  createdAt: string;
}

export interface CreditInfo {
  id: string;
  supplierId: string;
  supplierName: string;
  creditLimit: number;
  usedCredit: number;
  availableCredit: number;
  creditPeriod: number;
  overdueAmount: number;
  overdueCount: number;
  status: 'normal' | 'warning' | 'frozen';
  history: Array<{
    id: string;
    type: string;
    amount: number;
    operator: string;
    date: string;
    remark: string;
  }>;
}

export interface SettlementState {
  settlements: Settlement[];
  statements: Statement[];
  payments: Payment[];
  creditList: CreditInfo[];
  total: number;
  page: number;
  pageSize: number;
  currentSettlement: Settlement | null;
  currentStatement: Statement | null;
  statistics: any | null;
  loading: boolean;
  error: string | null;
  filterParams: SettlementQueryParams;
}

export interface SettlementActions {
  fetchSettlements: (params?: SettlementQueryParams) => Promise<void>;
  fetchSettlementById: (id: string) => Promise<Settlement | null>;
  fetchStatements: (params?: any) => Promise<void>;
  fetchStatementById: (id: string) => Promise<Statement | null>;
  confirmStatement: (id: string) => Promise<{ success: boolean; message: string }>;
  createSettlementFromStatement: (statementId: string) => Promise<Settlement | null>;
  submitPayment: (data: PaymentSubmitData) => Promise<{ success: boolean; message: string }>;
  registerPayment: (settlementId: string, data: { amount: number; paymentDate: string; paymentMethod: string; referenceNo: string }) => Promise<{ success: boolean; message: string }>;
  fetchPayments: (params?: any) => Promise<void>;
  fetchCreditList: (params?: any) => Promise<void>;
  adjustCreditLimit: (supplierId: string, newLimit: number) => Promise<{ success: boolean; message: string }>;
  adjustCreditPeriod: (supplierId: string, newPeriod: number) => Promise<{ success: boolean; message: string }>;
  suspendSupplier: (supplierId: string) => Promise<{ success: boolean; message: string }>;
  resumeSupplier: (supplierId: string) => Promise<{ success: boolean; message: string }>;
  exportStatement: (id: string) => Promise<void>;
  exportPayments: () => Promise<void>;
  fetchStatistics: (params?: { startDate?: string; endDate?: string }) => Promise<any>;
  setFilterParams: (params: Partial<SettlementQueryParams>) => void;
  setCurrentSettlement: (settlement: Settlement | null) => void;
  setCurrentStatement: (statement: Statement | null) => void;
  clearError: () => void;
  resetState: () => void;
}

const mockStatements: Statement[] = [
  {
    id: 'ST001',
    statementNo: 'ST-2024-06-001',
    supplierId: 'S001',
    supplierName: '深圳华为技术有限公司',
    periodStart: '2024-06-01',
    periodEnd: '2024-06-30',
    orderCount: 5,
    totalAmount: 1446400,
    confirmedAmount: 1446400,
    pendingAmount: 0,
    status: 'confirmed',
    orders: [
      { id: 'O001', orderNo: 'PO-2024-001', orderDate: '2024-06-05', amount: 1446400, status: 'completed' },
    ],
    createdAt: '2024-07-01T10:00:00Z',
  },
  {
    id: 'ST002',
    statementNo: 'ST-2024-06-002',
    supplierId: 'S004',
    supplierName: '德国西门子股份公司',
    periodStart: '2024-06-01',
    periodEnd: '2024-06-30',
    orderCount: 3,
    totalAmount: 458000,
    confirmedAmount: 200000,
    pendingAmount: 258000,
    status: 'partial',
    orders: [
      { id: 'O002', orderNo: 'PO-2024-002', orderDate: '2024-06-10', amount: 200000, status: 'completed' },
      { id: 'O003', orderNo: 'PO-2024-003', orderDate: '2024-06-15', amount: 258000, status: 'delivered' },
    ],
    createdAt: '2024-07-01T11:00:00Z',
  },
  {
    id: 'ST003',
    statementNo: 'ST-2024-06-003',
    supplierId: 'S012',
    supplierName: '鞍钢股份有限公司',
    periodStart: '2024-06-01',
    periodEnd: '2024-06-30',
    orderCount: 8,
    totalAmount: 2580000,
    confirmedAmount: 0,
    pendingAmount: 2580000,
    status: 'pending',
    orders: [
      { id: 'O004', orderNo: 'PO-2024-004', orderDate: '2024-06-08', amount: 860000, status: 'delivered' },
      { id: 'O005', orderNo: 'PO-2024-005', orderDate: '2024-06-18', amount: 1720000, status: 'delivered' },
    ],
    createdAt: '2024-07-01T09:00:00Z',
  },
];

const mockPayments: Payment[] = [
  {
    id: 'PAY001',
    settlementId: 'SET001',
    amount: 1446400,
    paymentDate: '2024-02-15',
    paymentMethod: '银行转账',
    referenceNo: 'BK20240215001',
    createdAt: '2024-02-15T10:00:00Z',
  },
  {
    id: 'PAY002',
    settlementId: 'SET002',
    amount: 67800,
    paymentDate: '2024-04-10',
    paymentMethod: '信用证',
    referenceNo: 'LC20240410001',
    createdAt: '2024-04-10T11:00:00Z',
  },
  {
    id: 'PAY003',
    settlementId: 'SET003',
    amount: 14125000,
    paymentDate: '2024-04-20',
    paymentMethod: '银行转账',
    referenceNo: 'BK20240420002',
    createdAt: '2024-04-20T14:00:00Z',
  },
];

const mockCreditList: CreditInfo[] = [
  {
    id: 'CR001',
    supplierId: 'S001',
    supplierName: '深圳华为技术有限公司',
    creditLimit: 5000000,
    usedCredit: 2800000,
    availableCredit: 2200000,
    creditPeriod: 30,
    overdueAmount: 0,
    overdueCount: 0,
    status: 'normal',
    history: [
      { id: 'CH001', type: '额度调整', amount: 5000000, operator: 'CEO', date: '2024-01-01', remark: '初始授信额度' },
    ],
  },
  {
    id: 'CR002',
    supplierId: 'S004',
    supplierName: '德国西门子股份公司',
    creditLimit: 3000000,
    usedCredit: 2900000,
    availableCredit: 100000,
    creditPeriod: 60,
    overdueAmount: 0,
    overdueCount: 1,
    status: 'warning',
    history: [],
  },
  {
    id: 'CR003',
    supplierId: 'S012',
    supplierName: '鞍钢股份有限公司',
    creditLimit: 8000000,
    usedCredit: 7500000,
    availableCredit: 500000,
    creditPeriod: 30,
    overdueAmount: 2580000,
    overdueCount: 3,
    status: 'frozen',
    history: [],
  },
];

const initialState: SettlementState = {
  settlements: [],
  statements: mockStatements,
  payments: mockPayments,
  creditList: mockCreditList,
  total: 0,
  page: 1,
  pageSize: 10,
  currentSettlement: null,
  currentStatement: null,
  statistics: null,
  loading: false,
  error: null,
  filterParams: {},
};

export const useSettlementStore = create<SettlementState & SettlementActions>((set, get) => ({
  ...initialState,

  fetchSettlements: async (params) => {
    set({ loading: true, error: null });
    try {
      const mergedParams = { ...get().filterParams, ...params };
      const result = await settlementService.getSettlementList(mergedParams);
      set({
        settlements: result.list,
        total: result.total,
        page: result.page,
        pageSize: result.pageSize,
        filterParams: mergedParams,
        loading: false,
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '获取结算单列表失败';
      set({ error: errorMessage, loading: false });
    }
  },

  fetchSettlementById: async (id) => {
    set({ loading: true, error: null });
    try {
      const settlement = await settlementService.getSettlementById(id);
      if (settlement) {
        set({ currentSettlement: settlement, loading: false });
      } else {
        set({ error: '结算单不存在', loading: false });
      }
      return settlement;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '获取结算单详情失败';
      set({ error: errorMessage, loading: false });
      return null;
    }
  },

  fetchStatements: async (params) => {
    set({ loading: true, error: null });
    await new Promise(resolve => setTimeout(resolve, 500));
    let result = [...mockStatements];
    if (params?.supplierId) {
      result = result.filter(s => s.supplierId === params.supplierId);
    }
    if (params?.status) {
      result = result.filter(s => s.status === params.status);
    }
    set({ statements: result, loading: false });
  },

  fetchStatementById: async (id) => {
    set({ loading: true, error: null });
    await new Promise(resolve => setTimeout(resolve, 300));
    const statement = mockStatements.find(s => s.id === id);
    if (statement) {
      set({ currentStatement: statement, loading: false });
    }
    return statement || null;
  },

  confirmStatement: async (id) => {
    set({ loading: true, error: null });
    await new Promise(resolve => setTimeout(resolve, 500));
    set(state => ({
      statements: state.statements.map(s => 
        s.id === id ? { ...s, status: 'confirmed' as const, confirmedAmount: s.totalAmount, pendingAmount: 0 } : s
      ),
      loading: false,
    }));
    return { success: true, message: '对账确认成功' };
  },

  createSettlementFromStatement: async (statementId) => {
    set({ loading: true, error: null });
    await new Promise(resolve => setTimeout(resolve, 600));
    const statement = mockStatements.find(s => s.id === statementId);
    if (!statement) {
      set({ error: '对账单不存在', loading: false });
      return null;
    }
    const newSettlement: Settlement = {
      id: `SET${Date.now()}`,
      code: `SET-${new Date().getFullYear()}-${String(get().settlements.length + 1).padStart(3, '0')}`,
      supplierId: statement.supplierId,
      supplierName: statement.supplierName,
      settlementType: 'normal',
      status: 'draft',
      currency: 'CNY',
      items: [],
      totalAmount: statement.totalAmount,
      totalTaxAmount: statement.totalAmount * 0.13,
      grandTotal: statement.totalAmount * 1.13,
      paidAmount: 0,
      unpaidAmount: statement.totalAmount * 1.13,
      creditPeriod: 30,
      creditStartDate: new Date().toISOString().split('T')[0],
      creditDueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      invoices: [],
      paymentPlans: [],
      hasDeduction: false,
      deductionAmount: 0,
      operatorId: 'U004',
      operatorName: '赵财务',
      remark: '由对账单生成',
      attachments: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    set(state => ({
      settlements: [newSettlement, ...state.settlements],
      loading: false,
    }));
    return newSettlement;
  },

  submitPayment: async (data) => {
    set({ loading: true, error: null });
    try {
      const result = await settlementService.submitPayment(data);
      if (result) {
        set(state => ({
          settlements: state.settlements.map(s =>
            s.id === data.settlementId ? result! : s
          ),
          currentSettlement: result,
          loading: false,
        }));
        return { success: true, message: '付款提交成功' };
      }
      set({ error: '付款提交失败', loading: false });
      return { success: false, message: '付款提交失败' };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '付款提交失败';
      set({ error: errorMessage, loading: false });
      return { success: false, message: errorMessage };
    }
  },

  registerPayment: async (settlementId, data) => {
    set({ loading: true, error: null });
    await new Promise(resolve => setTimeout(resolve, 500));
    const newPayment: Payment = {
      id: `PAY${Date.now()}`,
      settlementId,
      amount: data.amount,
      paymentDate: data.paymentDate,
      paymentMethod: data.paymentMethod,
      referenceNo: data.referenceNo,
      createdAt: new Date().toISOString(),
    };
    set(state => ({
      payments: [newPayment, ...state.payments],
      settlements: state.settlements.map(s => {
        if (s.id === settlementId) {
          const paidAmount = s.paidAmount + data.amount;
          const unpaidAmount = s.grandTotal - paidAmount;
          return {
            ...s,
            paidAmount,
            unpaidAmount,
            status: unpaidAmount <= 0 ? 'completed' : s.status,
            updatedAt: new Date().toISOString(),
          };
        }
        return s;
      }),
      loading: false,
    }));
    return { success: true, message: '付款登记成功' };
  },

  fetchPayments: async (params) => {
    set({ loading: true, error: null });
    await new Promise(resolve => setTimeout(resolve, 400));
    let result = [...mockPayments];
    if (params?.supplierId) {
      result = result.filter(p => {
        const settlement = get().settlements.find(s => s.id === p.settlementId);
        return settlement?.supplierId === params.supplierId;
      });
    }
    set({ payments: result, loading: false });
  },

  fetchCreditList: async (params) => {
    set({ loading: true, error: null });
    await new Promise(resolve => setTimeout(resolve, 400));
    let result = [...mockCreditList];
    if (params?.status) {
      result = result.filter(c => c.status === params.status);
    }
    set({ creditList: result, loading: false });
  },

  adjustCreditLimit: async (supplierId, newLimit) => {
    set({ loading: true, error: null });
    await new Promise(resolve => setTimeout(resolve, 500));
    set(state => ({
      creditList: state.creditList.map(c => {
        if (c.supplierId === supplierId) {
          const usedCredit = c.usedCredit;
          return {
            ...c,
            creditLimit: newLimit,
            availableCredit: newLimit - usedCredit,
            status: newLimit - usedCredit < 0 ? 'frozen' : newLimit - usedCredit < newLimit * 0.1 ? 'warning' : 'normal',
          };
        }
        return c;
      }),
      loading: false,
    }));
    return { success: true, message: '信用额度调整成功' };
  },

  adjustCreditPeriod: async (supplierId, newPeriod) => {
    set({ loading: true, error: null });
    await new Promise(resolve => setTimeout(resolve, 500));
    await settlementService.updateCreditPeriod(supplierId, newPeriod);
    set(state => ({
      creditList: state.creditList.map(c =>
        c.supplierId === supplierId ? { ...c, creditPeriod: newPeriod } : c
      ),
      loading: false,
    }));
    return { success: true, message: '信用期调整成功' };
  },

  suspendSupplier: async (supplierId) => {
    set({ loading: true, error: null });
    await new Promise(resolve => setTimeout(resolve, 500));
    set(state => ({
      creditList: state.creditList.map(c =>
        c.supplierId === supplierId ? { ...c, status: 'frozen' as const } : c
      ),
      loading: false,
    }));
    return { success: true, message: '已暂停供货' };
  },

  resumeSupplier: async (supplierId) => {
    set({ loading: true, error: null });
    await new Promise(resolve => setTimeout(resolve, 500));
    set(state => ({
      creditList: state.creditList.map(c => {
        if (c.supplierId === supplierId) {
          return {
            ...c,
            status: c.availableCredit < c.creditLimit * 0.1 ? 'warning' as const : 'normal' as const,
          };
        }
        return c;
      }),
      loading: false,
    }));
    return { success: true, message: '已恢复供货' };
  },

  exportStatement: async (id) => {
    set({ loading: true, error: null });
    await new Promise(resolve => setTimeout(resolve, 500));
    set({ loading: false });
    alert('对账单导出成功');
  },

  exportPayments: async () => {
    set({ loading: true, error: null });
    await new Promise(resolve => setTimeout(resolve, 500));
    set({ loading: false });
    alert('付款记录导出成功');
  },

  fetchStatistics: async (params) => {
    set({ loading: true, error: null });
    try {
      const result = await settlementService.getSettlementStatistics(params);
      set({ statistics: result, loading: false });
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '获取统计数据失败';
      set({ error: errorMessage, loading: false });
      return null;
    }
  },

  setFilterParams: (params) => {
    set(state => ({
      filterParams: { ...state.filterParams, ...params },
    }));
  },

  setCurrentSettlement: (settlement) => {
    set({ currentSettlement: settlement });
  },

  setCurrentStatement: (statement) => {
    set({ currentStatement: statement });
  },

  clearError: () => set({ error: null }),

  resetState: () => set(initialState),
}));

export const settlementSelectors = {
  selectSettlements: (state: SettlementState & SettlementActions) => state.settlements,
  selectStatements: (state: SettlementState & SettlementActions) => state.statements,
  selectPayments: (state: SettlementState & SettlementActions) => state.payments,
  selectCreditList: (state: SettlementState & SettlementActions) => state.creditList,
  selectTotal: (state: SettlementState & SettlementActions) => state.total,
  selectPage: (state: SettlementState & SettlementActions) => state.page,
  selectPageSize: (state: SettlementState & SettlementActions) => state.pageSize,
  selectCurrentSettlement: (state: SettlementState & SettlementActions) => state.currentSettlement,
  selectCurrentStatement: (state: SettlementState & SettlementActions) => state.currentStatement,
  selectStatistics: (state: SettlementState & SettlementActions) => state.statistics,
  selectLoading: (state: SettlementState & SettlementActions) => state.loading,
  selectError: (state: SettlementState & SettlementActions) => state.error,
  selectFilterParams: (state: SettlementState & SettlementActions) => state.filterParams,
};
