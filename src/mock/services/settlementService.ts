import { settlementData, Settlement } from '../data/settlement';

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export interface SettlementQueryParams {
  keyword?: string;
  status?: string;
  supplierId?: string;
  currency?: string;
  startDate?: string;
  endDate?: string;
  minAmount?: number;
  maxAmount?: number;
  page?: number;
  pageSize?: number;
}

export interface SettlementCreateData {
  supplierId: string;
  supplierName: string;
  settlementType: 'normal' | 'return' | 'discount' | 'advance';
  currency: 'CNY' | 'USD' | 'EUR' | 'JPY';
  exchangeRate?: number;
  items: Array<{
    orderId: string;
    orderCode: string;
    productName: string;
    productSpec: string;
    quantity: number;
    unitPrice: number;
    taxRate: number;
    remark: string;
  }>;
  creditPeriod: number;
  creditStartDate: string;
  creditDueDate: string;
  operatorId: string;
  operatorName: string;
  remark?: string;
}

export interface PaymentSubmitData {
  settlementId: string;
  paymentPlanId: string;
  actualAmount: number;
  voucherNo: string;
  remark?: string;
}

export const settlementService = {
  async getSettlementList(params?: SettlementQueryParams): Promise<{
    list: Settlement[];
    total: number;
    page: number;
    pageSize: number;
  }> {
    await delay(600);
    
    let result = [...settlementData];
    
    if (params?.keyword) {
      const keyword = params.keyword.toLowerCase();
      result = result.filter(
        s => s.code.toLowerCase().includes(keyword) ||
             s.supplierName.toLowerCase().includes(keyword)
      );
    }
    
    if (params?.status) {
      result = result.filter(s => s.status === params.status);
    }
    
    if (params?.supplierId) {
      result = result.filter(s => s.supplierId === params.supplierId);
    }
    
    if (params?.currency) {
      result = result.filter(s => s.currency === params.currency);
    }
    
    if (params?.startDate) {
      result = result.filter(s => s.createdAt >= params.startDate!);
    }
    
    if (params?.endDate) {
      result = result.filter(s => s.createdAt <= params.endDate!);
    }
    
    if (params?.minAmount !== undefined) {
      result = result.filter(s => s.grandTotal >= params.minAmount!);
    }
    
    if (params?.maxAmount !== undefined) {
      result = result.filter(s => s.grandTotal <= params.maxAmount!);
    }
    
    const total = result.length;
    const page = params?.page || 1;
    const pageSize = params?.pageSize || 10;
    const start = (page - 1) * pageSize;
    const list = result.slice(start, start + pageSize);
    
    return { list, total, page, pageSize };
  },
  
  async getSettlementById(id: string): Promise<Settlement | null> {
    await delay(300);
    const settlement = settlementData.find(s => s.id === id);
    return settlement || null;
  },
  
  async getSettlementBySupplier(supplierId: string): Promise<Settlement[]> {
    await delay(400);
    return settlementData.filter(s => s.supplierId === supplierId);
  },
  
  async createSettlement(data: SettlementCreateData): Promise<Settlement> {
    await delay(800);
    
    const newId = `SET${String(settlementData.length + 1).padStart(3, '0')}`;
    const newCode = `SET-${new Date().getFullYear()}-${String(settlementData.length + 1).padStart(3, '0')}`;
    
    let totalAmount = 0;
    let totalTaxAmount = 0;
    
    const settlementItems = data.items.map((item, index) => {
      const amount = item.quantity * item.unitPrice;
      const taxAmount = amount * item.taxRate;
      totalAmount += amount;
      totalTaxAmount += taxAmount;
      
      return {
        id: `SI${newId}-${index + 1}`,
        ...item,
        amount,
        taxAmount,
        totalAmount: amount + taxAmount
      };
    });
    
    const grandTotal = totalAmount + totalTaxAmount;
    
    const newSettlement: Settlement = {
      id: newId,
      code: newCode,
      supplierId: data.supplierId,
      supplierName: data.supplierName,
      settlementType: data.settlementType,
      status: 'draft',
      currency: data.currency,
      exchangeRate: data.exchangeRate,
      items: settlementItems,
      totalAmount,
      totalTaxAmount,
      grandTotal,
      paidAmount: 0,
      unpaidAmount: grandTotal,
      creditPeriod: data.creditPeriod,
      creditStartDate: data.creditStartDate,
      creditDueDate: data.creditDueDate,
      invoices: [],
      paymentPlans: [],
      hasDeduction: false,
      deductionAmount: 0,
      operatorId: data.operatorId,
      operatorName: data.operatorName,
      remark: data.remark || '',
      attachments: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    settlementData.push(newSettlement);
    return newSettlement;
  },
  
  async updateSettlement(id: string, data: Partial<Settlement>): Promise<Settlement | null> {
    await delay(600);
    
    const index = settlementData.findIndex(s => s.id === id);
    if (index === -1) {
      return null;
    }
    
    const settlement = settlementData[index];
    if (!['draft', 'rejected'].includes(settlement.status)) {
      return null;
    }
    
    settlementData[index] = { ...settlement, ...data, updatedAt: new Date().toISOString() };
    return settlementData[index];
  },
  
  async deleteSettlement(id: string): Promise<{ success: boolean; message: string }> {
    await delay(500);
    
    const index = settlementData.findIndex(s => s.id === id);
    if (index === -1) {
      return { success: false, message: '结算单不存在' };
    }
    
    const settlement = settlementData[index];
    if (!['draft', 'rejected'].includes(settlement.status)) {
      return { success: false, message: '只能删除草稿或已驳回的结算单' };
    }
    
    settlementData.splice(index, 1);
    return { success: true, message: '删除成功' };
  },
  
  async submitVerification(id: string): Promise<Settlement | null> {
    await delay(500);
    
    const settlement = settlementData.find(s => s.id === id);
    if (!settlement || settlement.status !== 'draft') {
      return null;
    }
    
    settlement.status = 'verifying';
    settlement.updatedAt = new Date().toISOString();
    
    return settlement;
  },
  
  async verifySettlement(id: string, status: 'verified' | 'rejected', accountantId: string, accountantName: string, opinion: string): Promise<Settlement | null> {
    await delay(500);
    
    const settlement = settlementData.find(s => s.id === id);
    if (!settlement || settlement.status !== 'verifying') {
      return null;
    }
    
    settlement.status = status;
    settlement.accountantId = accountantId;
    settlement.accountantName = accountantName;
    
    if (status === 'verified') {
      settlement.status = 'accounting';
    }
    
    settlement.updatedAt = new Date().toISOString();
    return settlement;
  },
  
  async completeSettlement(id: string, managerId: string, managerName: string): Promise<Settlement | null> {
    await delay(500);
    
    const settlement = settlementData.find(s => s.id === id);
    if (!settlement || settlement.status !== 'accounting') {
      return null;
    }
    
    settlement.status = 'completed';
    settlement.managerId = managerId;
    settlement.managerName = managerName;
    settlement.settlementDate = new Date().toISOString().split('T')[0];
    settlement.updatedAt = new Date().toISOString();
    
    return settlement;
  },
  
  async submitPayment(data: PaymentSubmitData): Promise<Settlement | null> {
    await delay(600);
    
    const settlement = settlementData.find(s => s.id === data.settlementId);
    if (!settlement) {
      return null;
    }
    
    const paymentPlan = settlement.paymentPlans.find(p => p.id === data.paymentPlanId);
    if (!paymentPlan || paymentPlan.status !== 'pending') {
      return null;
    }
    
    paymentPlan.status = 'paid';
    paymentPlan.actualDate = new Date().toISOString().split('T')[0];
    paymentPlan.actualAmount = data.actualAmount;
    paymentPlan.voucherNo = data.voucherNo;
    paymentPlan.remark = data.remark || '';
    
    settlement.paidAmount += data.actualAmount;
    settlement.unpaidAmount -= data.actualAmount;
    
    if (settlement.unpaidAmount <= 0) {
      settlement.status = 'completed';
      settlement.actualPaymentDate = new Date().toISOString().split('T')[0];
    }
    
    settlement.updatedAt = new Date().toISOString();
    return settlement;
  },
  
  async updateCreditPeriod(supplierId: string, creditPeriod: number): Promise<{ success: boolean; message: string }> {
    await delay(400);
    
    const settlements = settlementData.filter(s => s.supplierId === supplierId && ['draft', 'verifying'].includes(s.status));
    
    settlements.forEach(s => {
      s.creditPeriod = creditPeriod;
      const startDate = new Date(s.creditStartDate);
      const dueDate = new Date(startDate.getTime() + creditPeriod * 24 * 60 * 60 * 1000);
      s.creditDueDate = dueDate.toISOString().split('T')[0];
      s.updatedAt = new Date().toISOString();
    });
    
    return { success: true, message: `已更新${settlements.length}个结算单的信用期` };
  },
  
  async getSettlementStatistics(params?: {
    startDate?: string;
    endDate?: string;
  }): Promise<{
    total: number;
    totalAmount: number;
    paidAmount: number;
    unpaidAmount: number;
    overdueAmount: number;
    byStatus: Array<{ status: string; count: number; amount: number }>;
    bySupplier: Array<{ supplierId: string; supplierName: string; totalAmount: number; unpaidAmount: number }>;
    byCurrency: Array<{ currency: string; totalAmount: number; count: number }>;
  }> {
    await delay(400);
    
    let result = [...settlementData];
    
    if (params?.startDate) {
      result = result.filter(s => s.createdAt >= params.startDate!);
    }
    if (params?.endDate) {
      result = result.filter(s => s.createdAt <= params.endDate!);
    }
    
    const total = result.length;
    const totalAmount = result.reduce((sum, s) => sum + s.grandTotal, 0);
    const paidAmount = result.reduce((sum, s) => sum + s.paidAmount, 0);
    const unpaidAmount = result.reduce((sum, s) => sum + s.unpaidAmount, 0);
    
    const now = new Date();
    const overdueAmount = result
      .filter(s => new Date(s.creditDueDate) < now && s.unpaidAmount > 0)
      .reduce((sum, s) => sum + s.unpaidAmount, 0);
    
    const statusMap = new Map<string, { count: number; amount: number }>();
    const supplierMap = new Map<string, { supplierName: string; totalAmount: number; unpaidAmount: number }>();
    const currencyMap = new Map<string, { totalAmount: number; count: number }>();
    
    result.forEach(s => {
      if (!statusMap.has(s.status)) {
        statusMap.set(s.status, { count: 0, amount: 0 });
      }
      const statusStat = statusMap.get(s.status)!;
      statusStat.count++;
      statusStat.amount += s.grandTotal;
      
      if (!supplierMap.has(s.supplierId)) {
        supplierMap.set(s.supplierId, { supplierName: s.supplierName, totalAmount: 0, unpaidAmount: 0 });
      }
      const supplierStat = supplierMap.get(s.supplierId)!;
      supplierStat.totalAmount += s.grandTotal;
      supplierStat.unpaidAmount += s.unpaidAmount;
      
      if (!currencyMap.has(s.currency)) {
        currencyMap.set(s.currency, { totalAmount: 0, count: 0 });
      }
      const currencyStat = currencyMap.get(s.currency)!;
      currencyStat.totalAmount += s.grandTotal;
      currencyStat.count++;
    });
    
    return {
      total,
      totalAmount,
      paidAmount,
      unpaidAmount,
      overdueAmount,
      byStatus: Array.from(statusMap.entries()).map(([status, stat]) => ({ status, ...stat })),
      bySupplier: Array.from(supplierMap.entries()).map(([supplierId, stat]) => ({ supplierId, ...stat })),
      byCurrency: Array.from(currencyMap.entries()).map(([currency, stat]) => ({ currency, ...stat }))
    };
  }
};
