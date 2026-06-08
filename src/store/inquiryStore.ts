import { create } from 'zustand';
import {
  inquiryService,
  InquiryQueryParams,
  QuoteSubmitData,
  NegotiationSubmitData,
  PriceComparisonResult,
} from '@/mock/services/inquiryService';
import { Inquiry, Quote, NegotiationRecord } from '@/mock/data/inquiries';
import { useUserStore } from '@/store/userStore';

export interface InquiryState {
  inquiries: Inquiry[];
  total: number;
  page: number;
  pageSize: number;
  currentInquiry: Inquiry | null;
  quotes: Quote[];
  priceComparison: PriceComparisonResult[];
  negotiations: NegotiationRecord[];
  loading: boolean;
  error: string | null;
  filterParams: InquiryQueryParams;
}

export interface InquiryActions {
  fetchInquiries: (params?: InquiryQueryParams) => Promise<void>;
  fetchInquiryById: (id: string) => Promise<Inquiry | null>;
  createInquiry: (data: Omit<Inquiry, 'id' | 'code' | 'status' | 'quotes' | 'negotiations' | 'createdAt' | 'updatedAt'>) => Promise<Inquiry | null>;
  updateInquiry: (id: string, data: Partial<Inquiry>) => Promise<Inquiry | null>;
  deleteInquiry: (id: string) => Promise<{ success: boolean; message: string }>;
  publishInquiry: (id: string) => Promise<Inquiry | null>;
  submitQuote: (data: QuoteSubmitData) => Promise<Quote | null>;
  getPriceComparison: (inquiryId: string) => Promise<PriceComparisonResult[]>;
  submitNegotiation: (data: NegotiationSubmitData) => Promise<NegotiationRecord | null>;
  selectSupplier: (inquiryId: string, quoteId: string) => Promise<{ success: boolean; message: string; orderId?: string }>;
  setFilterParams: (params: Partial<InquiryQueryParams>) => void;
  setCurrentInquiry: (inquiry: Inquiry | null) => void;
  clearError: () => void;
  resetState: () => void;
}

const initialState: InquiryState = {
  inquiries: [],
  total: 0,
  page: 1,
  pageSize: 10,
  currentInquiry: null,
  quotes: [],
  priceComparison: [],
  negotiations: [],
  loading: false,
  error: null,
  filterParams: {},
};

export const useInquiryStore = create<InquiryState & InquiryActions>((set, get) => ({
  ...initialState,

  fetchInquiries: async (params) => {
    set({ loading: true, error: null });
    try {
      const mergedParams = { ...get().filterParams, ...params };
      const currentUser = useUserStore.getState().user;
      const currentUserRole = currentUser?.role;
      const currentUserRegions = currentUser?.regions;
      const result = await inquiryService.getInquiryList(mergedParams, currentUserRole, currentUserRegions);
      set({
        inquiries: result.list,
        total: result.total,
        page: result.page,
        pageSize: result.pageSize,
        filterParams: mergedParams,
        loading: false,
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '获取询价单列表失败';
      set({ error: errorMessage, loading: false });
    }
  },

  fetchInquiryById: async (id) => {
    set({ loading: true, error: null });
    try {
      const inquiry = await inquiryService.getInquiryById(id);
      if (inquiry) {
        set({
          currentInquiry: inquiry,
          quotes: inquiry.quotes || [],
          negotiations: inquiry.negotiations || [],
          loading: false,
        });
      } else {
        set({ error: '询价单不存在', loading: false });
      }
      return inquiry;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '获取询价单详情失败';
      set({ error: errorMessage, loading: false });
      return null;
    }
  },

  createInquiry: async (data) => {
    set({ loading: true, error: null });
    try {
      const newInquiry = await inquiryService.createInquiry(data);
      set({ loading: false });
      return newInquiry;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '创建询价单失败';
      set({ error: errorMessage, loading: false });
      return null;
    }
  },

  updateInquiry: async (id, data) => {
    set({ loading: true, error: null });
    try {
      const updatedInquiry = await inquiryService.updateInquiry(id, data);
      if (updatedInquiry) {
        set((state) => ({
          currentInquiry: updatedInquiry,
          inquiries: state.inquiries.map((i) =>
            i.id === id ? updatedInquiry : i
          ),
          loading: false,
        }));
      } else {
        set({ error: '更新失败，询价单不存在', loading: false });
      }
      return updatedInquiry;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '更新询价单失败';
      set({ error: errorMessage, loading: false });
      return null;
    }
  },

  deleteInquiry: async (id) => {
    set({ loading: true, error: null });
    try {
      const result = await inquiryService.deleteInquiry(id);
      if (result.success) {
        set((state) => ({
          inquiries: state.inquiries.filter((i) => i.id !== id),
          total: state.total - 1,
          loading: false,
        }));
      } else {
        set({ error: result.message, loading: false });
      }
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '删除询价单失败';
      set({ error: errorMessage, loading: false });
      return { success: false, message: errorMessage };
    }
  },

  publishInquiry: async (id) => {
    set({ loading: true, error: null });
    try {
      const result = await inquiryService.publishInquiry(id);
      if (result) {
        set((state) => ({
          currentInquiry: result,
          inquiries: state.inquiries.map((i) =>
            i.id === id ? result : i
          ),
          loading: false,
        }));
      } else {
        set({ error: '发布失败，询价单状态不允许', loading: false });
      }
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '发布询价单失败';
      set({ error: errorMessage, loading: false });
      return null;
    }
  },

  submitQuote: async (data) => {
    set({ loading: true, error: null });
    try {
      const result = await inquiryService.submitQuote(data);
      if (result) {
        set((state) => ({
          quotes: [...state.quotes, result],
          loading: false,
        }));
      }
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '提交报价失败';
      set({ error: errorMessage, loading: false });
      return null;
    }
  },

  getPriceComparison: async (inquiryId) => {
    set({ loading: true, error: null });
    try {
      const result = await inquiryService.getPriceComparison(inquiryId);
      set({ priceComparison: result, loading: false });
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '获取比价分析失败';
      set({ error: errorMessage, loading: false });
      return [];
    }
  },

  submitNegotiation: async (data) => {
    set({ loading: true, error: null });
    try {
      const result = await inquiryService.submitNegotiation(data);
      if (result) {
        const updatedInquiry = await inquiryService.getInquiryById(data.inquiryId);
        if (updatedInquiry) {
          set((state) => ({
            negotiations: updatedInquiry.negotiations || [],
            currentInquiry: updatedInquiry,
            inquiries: state.inquiries.map((i) =>
              i.id === data.inquiryId ? updatedInquiry : i
            ),
            loading: false,
          }));
        } else {
          set((state) => ({
            negotiations: [...state.negotiations, result],
            loading: false,
          }));
        }
      }
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '提交议价失败';
      set({ error: errorMessage, loading: false });
      return null;
    }
  },

  selectSupplier: async (inquiryId, quoteId) => {
    set({ loading: true, error: null });
    try {
      const result = await inquiryService.selectSupplier(inquiryId, quoteId);
      if (result) {
        const updatedQuotes: Quote[] = result.quotes.map((q) => ({
          ...q,
          status: (q.id === quoteId ? 'accepted' : 'rejected') as Quote['status'],
        }));
        const updatedPriceComparison = await inquiryService.getPriceComparison(inquiryId);
        set((state) => ({
          currentInquiry: result,
          inquiries: state.inquiries.map((i) =>
            i.id === inquiryId ? result : i
          ),
          quotes: updatedQuotes,
          priceComparison: updatedPriceComparison,
          loading: false,
        }));
        return { success: true, message: '选择供应商成功' };
      }
      set({ error: '选择供应商失败', loading: false });
      return { success: false, message: '选择供应商失败' };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '选择供应商失败';
      set({ error: errorMessage, loading: false });
      return { success: false, message: errorMessage };
    }
  },

  setFilterParams: (params) => {
    set((state) => ({
      filterParams: { ...state.filterParams, ...params },
    }));
  },

  setCurrentInquiry: (inquiry) => {
    set({ currentInquiry: inquiry });
  },

  clearError: () => set({ error: null }),

  resetState: () => set(initialState),
}));

export const inquirySelectors = {
  selectInquiries: (state: InquiryState & InquiryActions) => state.inquiries,
  selectTotal: (state: InquiryState & InquiryActions) => state.total,
  selectPage: (state: InquiryState & InquiryActions) => state.page,
  selectPageSize: (state: InquiryState & InquiryActions) => state.pageSize,
  selectCurrentInquiry: (state: InquiryState & InquiryActions) => state.currentInquiry,
  selectQuotes: (state: InquiryState & InquiryActions) => state.quotes,
  selectPriceComparison: (state: InquiryState & InquiryActions) => state.priceComparison,
  selectNegotiations: (state: InquiryState & InquiryActions) => state.negotiations,
  selectLoading: (state: InquiryState & InquiryActions) => state.loading,
  selectError: (state: InquiryState & InquiryActions) => state.error,
  selectFilterParams: (state: InquiryState & InquiryActions) => state.filterParams,
};
