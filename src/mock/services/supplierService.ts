import { suppliers as suppliersData, Supplier } from '../data/suppliers';

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export interface SupplierQueryParams {
  keyword?: string;
  category?: string;
  country?: string;
  rating?: number;
  qualificationStatus?: string;
  page?: number;
  pageSize?: number;
}

export interface PaginatedResult<T> {
  list: T[];
  total: number;
  page: number;
  pageSize: number;
}

export const supplierService = {
  async getSupplierList(params?: SupplierQueryParams): Promise<PaginatedResult<Supplier>> {
    await delay(600);
    
    let result = [...suppliersData];
    
    if (params?.keyword) {
      const keyword = params.keyword.toLowerCase();
      result = result.filter(
        s => s.name.toLowerCase().includes(keyword) ||
             s.code.toLowerCase().includes(keyword) ||
             s.contactPerson.toLowerCase().includes(keyword)
      );
    }
    
    if (params?.category) {
      result = result.filter(s => s.category === params.category);
    }
    
    if (params?.country) {
      result = result.filter(s => s.country === params.country);
    }
    
    if (params?.rating) {
      result = result.filter(s => s.rating >= params.rating!);
    }
    
    if (params?.qualificationStatus) {
      result = result.filter(s => s.qualificationStatus === params.qualificationStatus);
    }
    
    const total = result.length;
    const page = params?.page || 1;
    const pageSize = params?.pageSize || 10;
    const start = (page - 1) * pageSize;
    const list = result.slice(start, start + pageSize);
    
    return { list, total, page, pageSize };
  },
  
  async getSupplierById(id: string): Promise<Supplier | null> {
    await delay(300);
    const supplier = suppliersData.find(s => s.id === id);
    return supplier || null;
  },
  
  async createSupplier(data: Omit<Supplier, 'id' | 'createdAt' | 'updatedAt'>): Promise<Supplier> {
    await delay(800);
    
    const newId = `S${String(suppliersData.length + 1).padStart(3, '0')}`;
    const newSupplier: Supplier = {
      ...data,
      id: newId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    suppliersData.push(newSupplier);
    return newSupplier;
  },
  
  async updateSupplier(id: string, data: Partial<Supplier>): Promise<Supplier | null> {
    await delay(600);
    
    const index = suppliersData.findIndex(s => s.id === id);
    if (index === -1) {
      return null;
    }
    
    suppliersData[index] = { ...suppliersData[index], ...data, updatedAt: new Date().toISOString() };
    return suppliersData[index];
  },
  
  async deleteSupplier(id: string): Promise<{ success: boolean; message: string }> {
    await delay(500);
    
    const index = suppliersData.findIndex(s => s.id === id);
    if (index === -1) {
      return { success: false, message: '供应商不存在' };
    }
    
    suppliersData.splice(index, 1);
    return { success: true, message: '删除成功' };
  },
  
  async getSmartRecommendations(params: {
    category: string;
    minRating?: number;
    maxPrice?: number;
    region?: string;
  }): Promise<Supplier[]> {
    await delay(800);
    
    let result = [...suppliersData];
    
    if (params.category) {
      result = result.filter(s => s.category === params.category);
    }
    
    if (params.minRating) {
      result = result.filter(s => s.rating >= params.minRating!);
    }
    
    if (params.region) {
      result = result.filter(s => s.country === params.region);
    }
    
    result.sort((a, b) => {
      if (a.rating !== b.rating) return b.rating - a.rating;
      if (a.qualificationLevel !== b.qualificationLevel) {
        const levelOrder: Record<string, number> = { 'A': 4, 'B': 3, 'C': 2, 'D': 1 };
        return levelOrder[b.qualificationLevel] - levelOrder[a.qualificationLevel];
      }
      return a.creditPeriod - b.creditPeriod;
    });
    
    return result.slice(0, 5);
  },
  
  async reviewQualification(id: string, reviewData: {
    status: 'approved' | 'rejected' | 'suspended';
    level: 'A' | 'B' | 'C' | 'D';
    remark: string;
    reviewerId: string;
    reviewerName: string;
  }): Promise<Supplier | null> {
    await delay(700);
    
    const index = suppliersData.findIndex(s => s.id === id);
    if (index === -1) {
      return null;
    }
    
    const supplier = suppliersData[index];
    supplier.qualificationStatus = reviewData.status;
    supplier.qualificationLevel = reviewData.level;
    supplier.updatedAt = new Date().toISOString();
    
    return supplier;
  },
  
  async updateCreditInfo(id: string, creditData: {
    creditPeriod?: number;
    creditLimit?: number;
  }): Promise<Supplier | null> {
    await delay(500);
    
    const index = suppliersData.findIndex(s => s.id === id);
    if (index === -1) {
      return null;
    }
    
    const supplier = suppliersData[index];
    if (creditData.creditPeriod !== undefined) supplier.creditPeriod = creditData.creditPeriod;
    if (creditData.creditLimit !== undefined) supplier.creditLimit = creditData.creditLimit;
    supplier.updatedAt = new Date().toISOString();
    
    return supplier;
  },
  
  async getSupplierCategories(): Promise<string[]> {
    await delay(200);
    const categories = [...new Set(suppliersData.map(s => s.category))];
    return categories;
  },
  
  async getSupplierCountries(): Promise<string[]> {
    await delay(200);
    const countries = [...new Set(suppliersData.map(s => s.country))];
    return countries;
  }
};
