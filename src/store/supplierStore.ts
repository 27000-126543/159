import { create } from 'zustand';
import {
  supplierService,
  SupplierQueryParams,
  PaginatedResult,
} from '@/mock/services/supplierService';
import { Supplier } from '@/mock/data/suppliers';

export interface SupplierState {
  suppliers: Supplier[];
  total: number;
  page: number;
  pageSize: number;
  currentSupplier: Supplier | null;
  filterParams: SupplierQueryParams;
  loading: boolean;
  error: string | null;
  categories: string[];
  countries: string[];
  recommendations: Supplier[];
}

export interface SupplierActions {
  fetchSuppliers: (params?: SupplierQueryParams) => Promise<void>;
  fetchSupplierById: (id: string) => Promise<Supplier | null>;
  createSupplier: (data: Omit<Supplier, 'id' | 'createdAt' | 'updatedAt'>) => Promise<Supplier | null>;
  updateSupplier: (id: string, data: Partial<Supplier>) => Promise<Supplier | null>;
  deleteSupplier: (id: string) => Promise<{ success: boolean; message: string }>;
  fetchSmartRecommendations: (params: {
    category: string;
    minRating?: number;
    maxPrice?: number;
    region?: string;
  }) => Promise<void>;
  reviewQualification: (id: string, reviewData: {
    status: 'approved' | 'rejected' | 'suspended';
    level: 'A' | 'B' | 'C' | 'D';
    remark: string;
    reviewerId: string;
    reviewerName: string;
  }) => Promise<Supplier | null>;
  updateCreditInfo: (id: string, creditData: {
    creditPeriod?: number;
    creditLimit?: number;
    creditScore?: number;
  }) => Promise<Supplier | null>;
  fetchCategories: () => Promise<void>;
  fetchCountries: () => Promise<void>;
  freezeSupplier: (supplierId: string) => Promise<{ success: boolean; message: string }>;
  unfreezeSupplier: (supplierId: string) => Promise<{ success: boolean; message: string }>;
  setFilterParams: (params: Partial<SupplierQueryParams>) => void;
  setCurrentSupplier: (supplier: Supplier | null) => void;
  clearError: () => void;
  resetState: () => void;
}

const initialState: SupplierState = {
  suppliers: [],
  total: 0,
  page: 1,
  pageSize: 10,
  currentSupplier: null,
  filterParams: {},
  loading: false,
  error: null,
  categories: [],
  countries: [],
  recommendations: [],
};

export const useSupplierStore = create<SupplierState & SupplierActions>((set, get) => ({
  ...initialState,

  fetchSuppliers: async (params) => {
    set({ loading: true, error: null });
    try {
      const mergedParams = { ...get().filterParams, ...params };
      const result: PaginatedResult<Supplier> = await supplierService.getSupplierList(mergedParams);
      set({
        suppliers: result.list,
        total: result.total,
        page: result.page,
        pageSize: result.pageSize,
        filterParams: mergedParams,
        loading: false,
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '获取供应商列表失败';
      set({ error: errorMessage, loading: false });
    }
  },

  fetchSupplierById: async (id) => {
    set({ loading: true, error: null });
    try {
      const supplier = await supplierService.getSupplierById(id);
      if (supplier) {
        set({ currentSupplier: supplier, loading: false });
      } else {
        set({ error: '供应商不存在', loading: false });
      }
      return supplier;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '获取供应商详情失败';
      set({ error: errorMessage, loading: false });
      return null;
    }
  },

  createSupplier: async (data) => {
    set({ loading: true, error: null });
    try {
      const newSupplier = await supplierService.createSupplier(data);
      set({ loading: false });
      return newSupplier;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '创建供应商失败';
      set({ error: errorMessage, loading: false });
      return null;
    }
  },

  updateSupplier: async (id, data) => {
    set({ loading: true, error: null });
    try {
      const updatedSupplier = await supplierService.updateSupplier(id, data);
      if (updatedSupplier) {
        set((state) => ({
          currentSupplier: updatedSupplier,
          suppliers: state.suppliers.map((s) =>
            s.id === id ? updatedSupplier : s
          ),
          loading: false,
        }));
      } else {
        set({ error: '更新失败，供应商不存在', loading: false });
      }
      return updatedSupplier;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '更新供应商失败';
      set({ error: errorMessage, loading: false });
      return null;
    }
  },

  deleteSupplier: async (id) => {
    set({ loading: true, error: null });
    try {
      const result = await supplierService.deleteSupplier(id);
      if (result.success) {
        set((state) => ({
          suppliers: state.suppliers.filter((s) => s.id !== id),
          total: state.total - 1,
          loading: false,
        }));
      } else {
        set({ error: result.message, loading: false });
      }
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '删除供应商失败';
      set({ error: errorMessage, loading: false });
      return { success: false, message: errorMessage };
    }
  },

  fetchSmartRecommendations: async (params) => {
    set({ loading: true, error: null });
    try {
      const recommendations = await supplierService.getSmartRecommendations(params);
      set({ recommendations, loading: false });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '获取智能推荐失败';
      set({ error: errorMessage, loading: false });
    }
  },

  reviewQualification: async (id, reviewData) => {
    set({ loading: true, error: null });
    try {
      const result = await supplierService.reviewQualification(id, reviewData);
      if (result) {
        set((state) => ({
          currentSupplier: result,
          suppliers: state.suppliers.map((s) =>
            s.id === id ? result : s
          ),
          loading: false,
        }));
      }
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '资质审核失败';
      set({ error: errorMessage, loading: false });
      return null;
    }
  },

  updateCreditInfo: async (id, creditData) => {
    set({ loading: true, error: null });
    try {
      const result = await supplierService.updateCreditInfo(id, creditData);
      if (result) {
        set((state) => ({
          currentSupplier: result,
          suppliers: state.suppliers.map((s) =>
            s.id === id ? result : s
          ),
          loading: false,
        }));
      }
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '更新信用信息失败';
      set({ error: errorMessage, loading: false });
      return null;
    }
  },

  fetchCategories: async () => {
    try {
      const categories = await supplierService.getSupplierCategories();
      set({ categories });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '获取分类失败';
      set({ error: errorMessage });
    }
  },

  fetchCountries: async () => {
    try {
      const countries = await supplierService.getSupplierCountries();
      set({ countries });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '获取国家列表失败';
      set({ error: errorMessage });
    }
  },

  freezeSupplier: async (supplierId) => {
    set({ loading: true, error: null });
    try {
      const result = await supplierService.freezeSupplier(supplierId);
      if (result.success && result.supplier) {
        set(state => ({
          suppliers: state.suppliers.map(s =>
            s.id === supplierId ? result.supplier! : s
          ),
          currentSupplier: state.currentSupplier?.id === supplierId ? result.supplier : state.currentSupplier,
          loading: false,
        }));
        return { success: true, message: result.message };
      }
      set({ error: result.message, loading: false });
      return { success: false, message: result.message };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '冻结供应商失败';
      set({ error: errorMessage, loading: false });
      return { success: false, message: errorMessage };
    }
  },

  unfreezeSupplier: async (supplierId) => {
    set({ loading: true, error: null });
    try {
      const result = await supplierService.unfreezeSupplier(supplierId);
      if (result.success && result.supplier) {
        set(state => ({
          suppliers: state.suppliers.map(s =>
            s.id === supplierId ? result.supplier! : s
          ),
          currentSupplier: state.currentSupplier?.id === supplierId ? result.supplier : state.currentSupplier,
          loading: false,
        }));
        return { success: true, message: result.message };
      }
      set({ error: result.message, loading: false });
      return { success: false, message: result.message };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '解冻供应商失败';
      set({ error: errorMessage, loading: false });
      return { success: false, message: errorMessage };
    }
  },

  setFilterParams: (params) => {
    set((state) => ({
      filterParams: { ...state.filterParams, ...params },
    }));
  },

  setCurrentSupplier: (supplier) => {
    set({ currentSupplier: supplier });
  },

  clearError: () => set({ error: null }),

  resetState: () => set(initialState),
}));

export const supplierSelectors = {
  selectSuppliers: (state: SupplierState & SupplierActions) => state.suppliers,
  selectTotal: (state: SupplierState & SupplierActions) => state.total,
  selectPage: (state: SupplierState & SupplierActions) => state.page,
  selectPageSize: (state: SupplierState & SupplierActions) => state.pageSize,
  selectCurrentSupplier: (state: SupplierState & SupplierActions) => state.currentSupplier,
  selectFilterParams: (state: SupplierState & SupplierActions) => state.filterParams,
  selectLoading: (state: SupplierState & SupplierActions) => state.loading,
  selectError: (state: SupplierState & SupplierActions) => state.error,
  selectCategories: (state: SupplierState & SupplierActions) => state.categories,
  selectCountries: (state: SupplierState & SupplierActions) => state.countries,
  selectRecommendations: (state: SupplierState & SupplierActions) => state.recommendations,
  selectFrozenSuppliers: (state: SupplierState & SupplierActions) => state.suppliers.filter(s => s.isFrozen),
  selectFrozenCount: (state: SupplierState & SupplierActions) => state.suppliers.filter(s => s.isFrozen).length,
};
