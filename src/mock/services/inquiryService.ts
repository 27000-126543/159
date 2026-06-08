import { inquiries as inquiriesData, Inquiry, Quote, NegotiationRecord } from '../data/inquiries';

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export interface InquiryQueryParams {
  keyword?: string;
  status?: string;
  category?: string;
  buyerId?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  pageSize?: number;
}

export interface QuoteSubmitData {
  inquiryId: string;
  supplierId: string;
  supplierName: string;
  items: Array<{
    productName: string;
    productSpec: string;
    quantity: number;
    unitPrice: number;
    deliveryDays: number;
  }>;
  remark?: string;
}

export interface NegotiationSubmitData {
  inquiryId: string;
  quoteId: string;
  round: number;
  operatorId: string;
  operatorName: string;
  content: string;
  proposedPrice: number;
}

export interface PriceComparisonResult {
  quoteId: string;
  supplierId: string;
  supplierName: string;
  totalAmount: number;
  avgUnitPrice: number;
  deliveryDays: number;
  paymentTerms: string;
  warrantyPeriod: number;
  rating: number;
  score: number;
  rank: number;
}

export const inquiryService = {
  async getInquiryList(params?: InquiryQueryParams): Promise<{
    list: Inquiry[];
    total: number;
    page: number;
    pageSize: number;
  }> {
    await delay(600);
    
    let result = [...inquiriesData];
    
    if (params?.keyword) {
      const keyword = params.keyword.toLowerCase();
      result = result.filter(
        i => i.title.toLowerCase().includes(keyword) ||
             i.code.toLowerCase().includes(keyword)
      );
    }
    
    if (params?.status) {
      result = result.filter(i => i.status === params.status);
    }
    
    if (params?.category) {
      result = result.filter(i => i.category === params.category);
    }
    
    if (params?.buyerId) {
      result = result.filter(i => i.requesterId === params.buyerId);
    }
    
    if (params?.startDate) {
      result = result.filter(i => i.createdAt >= params.startDate!);
    }
    
    if (params?.endDate) {
      result = result.filter(i => i.createdAt <= params.endDate!);
    }
    
    const total = result.length;
    const page = params?.page || 1;
    const pageSize = params?.pageSize || 10;
    const start = (page - 1) * pageSize;
    const list = result.slice(start, start + pageSize);
    
    return { list, total, page, pageSize };
  },
  
  async getInquiryById(id: string): Promise<Inquiry | null> {
    await delay(300);
    const inquiry = inquiriesData.find(i => i.id === id);
    return inquiry || null;
  },
  
  async createInquiry(data: Omit<Inquiry, 'id' | 'code' | 'status' | 'statusName' | 'quotes' | 'negotiations' | 'createdAt' | 'updatedAt'>): Promise<Inquiry> {
    await delay(800);
    
    const newId = `I${String(inquiriesData.length + 1).padStart(3, '0')}`;
    const newCode = `INQ-${new Date().getFullYear()}-${String(inquiriesData.length + 1).padStart(3, '0')}`;
    
    const newInquiry: Inquiry = {
      ...data,
      id: newId,
      code: newCode,
      status: 'draft',
      statusName: '草稿',
      quotes: [],
      negotiations: [],
      selectedSupplierId: '',
      selectedSupplierName: '',
      finalAmount: 0,
      approvedBy: '',
      approvedAt: '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    inquiriesData.push(newInquiry);
    return newInquiry;
  },
  
  async updateInquiry(id: string, data: Partial<Inquiry>): Promise<Inquiry | null> {
    await delay(600);
    
    const index = inquiriesData.findIndex(i => i.id === id);
    if (index === -1) {
      return null;
    }
    
    inquiriesData[index] = { ...inquiriesData[index], ...data, updatedAt: new Date().toISOString() };
    return inquiriesData[index];
  },
  
  async deleteInquiry(id: string): Promise<{ success: boolean; message: string }> {
    await delay(500);
    
    const index = inquiriesData.findIndex(i => i.id === id);
    if (index === -1) {
      return { success: false, message: '询价单不存在' };
    }
    
    const inquiry = inquiriesData[index];
    if (inquiry.status !== 'draft') {
      return { success: false, message: '只能删除草稿状态的询价单' };
    }
    
    inquiriesData.splice(index, 1);
    return { success: true, message: '删除成功' };
  },
  
  async publishInquiry(id: string): Promise<Inquiry | null> {
    await delay(500);
    
    const index = inquiriesData.findIndex(i => i.id === id);
    if (index === -1) {
      return null;
    }
    
    const inquiry = inquiriesData[index];
    if (inquiry.status !== 'draft') {
      return null;
    }
    
    inquiry.status = 'published';
    inquiry.statusName = '已发布';
    inquiry.publishedAt = new Date().toISOString();
    inquiry.updatedAt = new Date().toISOString();
    
    return inquiry;
  },
  
  async submitQuote(data: QuoteSubmitData): Promise<Quote | null> {
    await delay(800);
    
    const inquiry = inquiriesData.find(i => i.id === data.inquiryId);
    if (!inquiry) {
      return null;
    }
    
    let totalAmount = 0;
    const quoteItems = data.items.map(item => {
      const amount = item.quantity * item.unitPrice;
      totalAmount += amount;
      return {
        productName: item.productName,
        productSpec: item.productSpec,
        quantity: item.quantity,
        unit: '件',
        unitPrice: item.unitPrice,
        totalPrice: amount,
        currency: 'CNY',
        deliveryTime: item.deliveryDays,
      };
    });
    
    const newQuote: Quote = {
      id: `Q${Date.now()}`,
      supplierId: data.supplierId,
      supplierName: data.supplierName,
      quoteItems,
      totalAmount,
      deliveryDate: new Date(Date.now() + Math.min(...data.items.map(i => i.deliveryDays)) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      paymentTerms: '30%预付款，70%发货前付清',
      warrantyPeriod: '12个月',
      quoteDate: new Date().toISOString().split('T')[0],
      status: 'submitted',
      remarks: data.remark || '',
    };
    
    inquiry.quotes.push(newQuote);
    if (inquiry.status === 'published') {
      inquiry.status = 'quoting';
      inquiry.statusName = '报价中';
    }
    inquiry.updatedAt = new Date().toISOString();
    
    return newQuote;
  },
  
  async getPriceComparison(inquiryId: string): Promise<PriceComparisonResult[]> {
    await delay(600);
    
    const inquiry = inquiriesData.find(i => i.id === inquiryId);
    if (!inquiry || inquiry.quotes.length === 0) {
      return [];
    }
    
    const getDeliveryDays = (quote: Quote): number => {
      const deliveryDate = new Date(quote.deliveryDate);
      const quoteDate = new Date(quote.quoteDate);
      return Math.ceil((deliveryDate.getTime() - quoteDate.getTime()) / (1000 * 60 * 60 * 24));
    };
    
    const getWarrantyMonths = (warrantyPeriod: string): number => {
      const match = warrantyPeriod.match(/(\d+)/);
      return match ? parseInt(match[1]) : 12;
    };
    
    const results: PriceComparisonResult[] = inquiry.quotes.map((quote, index) => {
      const totalQuantity = quote.quoteItems.reduce((sum, item) => sum + item.quantity, 0);
      const avgUnitPrice = quote.totalAmount / totalQuantity;
      
      const minAvgPrice = Math.min(...inquiry.quotes.map(q => q.totalAmount / q.quoteItems.reduce((s, i) => s + i.quantity, 0)));
      const minDeliveryDays = Math.min(...inquiry.quotes.map(q => getDeliveryDays(q)));
      
      const priceScore = Math.max(0, 100 - ((avgUnitPrice / minAvgPrice) - 1) * 100);
      const deliveryDays = getDeliveryDays(quote);
      const deliveryScore = Math.max(0, 100 - (deliveryDays - minDeliveryDays) * 5);
      const overallScore = priceScore * 0.6 + deliveryScore * 0.3 + 4.8 * 10;
      
      return {
        quoteId: quote.id,
        supplierId: quote.supplierId,
        supplierName: quote.supplierName,
        totalAmount: quote.totalAmount,
        avgUnitPrice,
        deliveryDays,
        paymentTerms: quote.paymentTerms,
        warrantyPeriod: getWarrantyMonths(quote.warrantyPeriod),
        rating: 4.8,
        score: overallScore,
        rank: index + 1
      };
    });
    
    results.sort((a, b) => b.score - a.score);
    results.forEach((r, i) => r.rank = i + 1);
    
    return results;
  },
  
  async submitNegotiation(data: NegotiationSubmitData): Promise<NegotiationRecord | null> {
    await delay(500);
    
    const inquiry = inquiriesData.find(i => i.id === data.inquiryId);
    if (!inquiry) {
      return null;
    }
    
    const quote = inquiry.quotes.find(q => q.id === data.quoteId);
    if (!quote) {
      return null;
    }
    
    const newNegotiation: NegotiationRecord = {
      id: `NEG${Date.now()}`,
      quoteId: data.quoteId,
      round: data.round,
      operatorId: data.operatorId,
      operatorName: data.operatorName,
      content: data.content,
      proposedPrice: data.proposedPrice,
      timestamp: new Date().toISOString()
    };
    
    inquiry.negotiations.push(newNegotiation);
    if (inquiry.status === 'quoting') {
      inquiry.status = 'negotiating';
      inquiry.statusName = '议价中';
    }
    inquiry.updatedAt = new Date().toISOString();
    
    return newNegotiation;
  },
  
  async selectSupplier(inquiryId: string, quoteId: string): Promise<Inquiry | null> {
    await delay(500);
    
    const inquiry = inquiriesData.find(i => i.id === inquiryId);
    if (!inquiry) {
      return null;
    }
    
    const quote = inquiry.quotes.find(q => q.id === quoteId);
    if (!quote) {
      return null;
    }
    
    inquiry.quotes.forEach(q => {
      q.status = q.id === quoteId ? 'accepted' : 'rejected';
    });
    
    inquiry.selectedQuoteId = quoteId;
    inquiry.selectedSupplierId = quote.supplierId;
    inquiry.selectedSupplierName = quote.supplierName;
    inquiry.finalAmount = quote.totalAmount;
    inquiry.status = 'completed';
    inquiry.statusName = '已完成';
    inquiry.updatedAt = new Date().toISOString();
    
    return inquiry;
  }
};
