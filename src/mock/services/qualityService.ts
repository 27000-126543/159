import { qualityData, QualityInspection, QualityReturnDetail } from '../data/quality';

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export interface QualityQueryParams {
  keyword?: string;
  status?: string;
  overallResult?: string;
  supplierId?: string;
  orderId?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  pageSize?: number;
}

export interface QualityCreateData {
  orderId: string;
  orderCode: string;
  supplierId: string;
  supplierName: string;
  productName: string;
  productSpec: string;
  batchNo: string;
  productionDate: string;
  expiryDate?: string;
  receivedDate: string;
  receivedQuantity: number;
  inspectedQuantity: number;
  inspectionType: 'incoming' | 'in_process' | 'final' | 're-inspection';
  inspectionStandard: string;
  inspectorId: string;
  inspectorName: string;
  items: Array<{
    name: string;
    standard: string;
    unit: string;
    sampleSize: number;
    passSize: number;
    failSize: number;
    measuredValue: string;
    result: 'pass' | 'fail' | 'pending';
    remark: string;
  }>;
  remark?: string;
}

export interface ReturnProcessData {
  qualityId: string;
  returnQuantity: number;
  returnReason: string;
  returnAmount: number;
  processingMethod: 'refund' | 'replacement' | 'rework' | 'discount';
  remark: string;
}

export const qualityService = {
  async getQualityList(params?: QualityQueryParams): Promise<{
    list: QualityInspection[];
    total: number;
    page: number;
    pageSize: number;
  }> {
    await delay(600);
    
    let result = [...qualityData];
    
    if (params?.keyword) {
      const keyword = params.keyword.toLowerCase();
      result = result.filter(
        q => q.code.toLowerCase().includes(keyword) ||
             q.productName.toLowerCase().includes(keyword) ||
             q.batchNo.toLowerCase().includes(keyword)
      );
    }
    
    if (params?.status) {
      result = result.filter(q => q.status === params.status);
    }
    
    if (params?.overallResult) {
      result = result.filter(q => q.overallResult === params.overallResult);
    }
    
    if (params?.supplierId) {
      result = result.filter(q => q.supplierId === params.supplierId);
    }
    
    if (params?.orderId) {
      result = result.filter(q => q.orderId === params.orderId);
    }
    
    if (params?.startDate) {
      result = result.filter(q => q.createdAt >= params.startDate!);
    }
    
    if (params?.endDate) {
      result = result.filter(q => q.createdAt <= params.endDate!);
    }
    
    const total = result.length;
    const page = params?.page || 1;
    const pageSize = params?.pageSize || 10;
    const start = (page - 1) * pageSize;
    const list = result.slice(start, start + pageSize);
    
    return { list, total, page, pageSize };
  },
  
  async getQualityById(id: string): Promise<QualityInspection | null> {
    await delay(300);
    const quality = qualityData.find(q => q.id === id);
    return quality || null;
  },
  
  async getQualityByOrderId(orderId: string): Promise<QualityInspection | null> {
    await delay(300);
    const quality = qualityData.find(q => q.orderId === orderId);
    return quality || null;
  },
  
  async createQuality(data: QualityCreateData): Promise<QualityInspection> {
    await delay(800);
    
    const newId = `QI${String(qualityData.length + 1).padStart(3, '0')}`;
    const newCode = `QI-${new Date().getFullYear()}-${String(qualityData.length + 1).padStart(3, '0')}`;
    
    const passQuantity = data.items.reduce((sum, item) => sum + item.passSize, 0);
    const failQuantity = data.items.reduce((sum, item) => sum + item.failSize, 0);
    
    let overallResult: QualityInspection['overallResult'] = 'pass';
    if (failQuantity > 0) {
      const failRate = failQuantity / data.inspectedQuantity;
      if (failRate > 0.05) {
        overallResult = 'fail';
      } else {
        overallResult = 'conditional_pass';
      }
    }
    
    const newQuality: QualityInspection = {
      id: newId,
      code: newCode,
      orderId: data.orderId,
      orderCode: data.orderCode,
      supplierId: data.supplierId,
      supplierName: data.supplierName,
      productName: data.productName,
      productSpec: data.productSpec,
      batchNo: data.batchNo,
      productionDate: data.productionDate,
      expiryDate: data.expiryDate,
      receivedDate: data.receivedDate,
      receivedQuantity: data.receivedQuantity,
      inspectedQuantity: data.inspectedQuantity,
      passQuantity,
      failQuantity,
      overallResult,
      inspectionType: data.inspectionType,
      inspectionStandard: data.inspectionStandard,
      inspectorId: data.inspectorId,
      inspectorName: data.inspectorName,
      inspectionDate: new Date().toISOString().split('T')[0],
      items: data.items.map((item, index) => ({
        id: `II${newId}-${index + 1}`,
        ...item
      })),
      hasReturn: false,
      status: 'inspecting',
      remark: data.remark || '',
      attachments: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    qualityData.push(newQuality);
    return newQuality;
  },
  
  async updateQuality(id: string, data: Partial<QualityInspection>): Promise<QualityInspection | null> {
    await delay(600);
    
    const index = qualityData.findIndex(q => q.id === id);
    if (index === -1) {
      return null;
    }
    
    const quality = qualityData[index];
    if (!['draft', 'inspecting'].includes(quality.status)) {
      return null;
    }
    
    qualityData[index] = { ...quality, ...data, updatedAt: new Date().toISOString() };
    return qualityData[index];
  },
  
  async submitQuality(id: string): Promise<QualityInspection | null> {
    await delay(500);
    
    const quality = qualityData.find(q => q.id === id);
    if (!quality || quality.status !== 'inspecting') {
      return null;
    }
    
    quality.status = 'completed';
    
    if (quality.overallResult === 'fail' || quality.failQuantity > 0) {
      quality.hasReturn = true;
    }
    
    quality.updatedAt = new Date().toISOString();
    return quality;
  },
  
  async processReturn(data: ReturnProcessData): Promise<QualityReturnDetail | null> {
    await delay(600);
    
    const quality = qualityData.find(q => q.id === data.qualityId);
    if (!quality) {
      return null;
    }
    
    const returnDetail: QualityReturnDetail = {
      id: `RET${Date.now()}`,
      returnQuantity: data.returnQuantity,
      returnReason: data.returnReason,
      returnAmount: data.returnAmount,
      returnDate: new Date().toISOString().split('T')[0],
      processingMethod: data.processingMethod,
      processingStatus: 'pending',
      remark: data.remark
    };
    
    quality.returnDetail = returnDetail;
    quality.hasReturn = true;
    quality.status = 'returned';
    quality.updatedAt = new Date().toISOString();
    
    return returnDetail;
  },
  
  async updateReturnStatus(qualityId: string, status: 'processing' | 'completed', completedDate?: string): Promise<QualityReturnDetail | null> {
    await delay(500);
    
    const quality = qualityData.find(q => q.id === qualityId);
    if (!quality || !quality.returnDetail) {
      return null;
    }
    
    quality.returnDetail.processingStatus = status;
    if (status === 'completed' && completedDate) {
      quality.returnDetail.completedDate = completedDate;
    }
    
    if (status === 'completed') {
      quality.status = 'completed';
    }
    
    quality.updatedAt = new Date().toISOString();
    return quality.returnDetail;
  },
  
  async getQualityStatistics(params?: {
    startDate?: string;
    endDate?: string;
  }): Promise<{
    total: number;
    passCount: number;
    passRate: number;
    failCount: number;
    failRate: number;
    conditionalPassCount: number;
    conditionalPassRate: number;
    returnCount: number;
    returnRate: number;
    bySupplier: Array<{ supplierId: string; supplierName: string; total: number; passRate: number }>;
    byCategory: Array<{ category: string; total: number; passRate: number }>;
  }> {
    await delay(400);
    
    let result = [...qualityData];
    
    if (params?.startDate) {
      result = result.filter(q => q.createdAt >= params.startDate!);
    }
    if (params?.endDate) {
      result = result.filter(q => q.createdAt <= params.endDate!);
    }
    
    const total = result.length;
    const passCount = result.filter(q => q.overallResult === 'pass').length;
    const failCount = result.filter(q => q.overallResult === 'fail').length;
    const conditionalPassCount = result.filter(q => q.overallResult === 'conditional_pass').length;
    const returnCount = result.filter(q => q.hasReturn).length;
    
    const passRate = total > 0 ? (passCount / total) * 100 : 0;
    const failRate = total > 0 ? (failCount / total) * 100 : 0;
    const conditionalPassRate = total > 0 ? (conditionalPassCount / total) * 100 : 0;
    const returnRate = total > 0 ? (returnCount / total) * 100 : 0;
    
    const supplierMap = new Map<string, { supplierName: string; total: number; pass: number }>();
    result.forEach(q => {
      if (!supplierMap.has(q.supplierId)) {
        supplierMap.set(q.supplierId, { supplierName: q.supplierName, total: 0, pass: 0 });
      }
      const stat = supplierMap.get(q.supplierId)!;
      stat.total++;
      if (q.overallResult === 'pass') stat.pass++;
    });
    
    const bySupplier = Array.from(supplierMap.entries()).map(([supplierId, stat]) => ({
      supplierId,
      supplierName: stat.supplierName,
      total: stat.total,
      passRate: stat.total > 0 ? (stat.pass / stat.total) * 100 : 0
    }));
    
    return {
      total,
      passCount,
      passRate,
      failCount,
      failRate,
      conditionalPassCount,
      conditionalPassRate,
      returnCount,
      returnRate,
      bySupplier,
      byCategory: []
    };
  },
  
  async addAttachment(qualityId: string, fileName: string): Promise<QualityInspection | null> {
    await delay(400);
    
    const quality = qualityData.find(q => q.id === qualityId);
    if (!quality) {
      return null;
    }
    
    quality.attachments.push(fileName);
    quality.updatedAt = new Date().toISOString();
    
    return quality;
  }
};
