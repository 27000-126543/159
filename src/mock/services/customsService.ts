import { customs as customsData, Customs } from '../data/customs';
import { orderService } from './orderService';
import { userService } from './userService';
import { suppliersData } from '../data/suppliers';
import { getRegionByCountry } from '../../utils/constants';
import type { Region } from '../../utils/constants';
import type { User } from '../data/users';

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const inferRegionFromSupplier = (supplierId: string): Region => {
  const supplier = suppliersData.find(s => s.id === supplierId);
  if (supplier) {
    return getRegionByCountry(supplier.country);
  }
  return '其他';
};

export interface CustomsQueryParams {
  keyword?: string;
  status?: string;
  customsType?: string;
  customsMethod?: string;
  orderId?: string;
  orderCode?: string;
  supplierId?: string;
  supplierName?: string;
  region?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  pageSize?: number;
}

export interface CustomsCreateData {
  orderId: string;
  orderCode: string;
  supplierId: string;
  supplierName: string;
  hsCode: string;
  productName: string;
  productSpec: string;
  quantity: number;
  unitPrice: number;
  currency: string;
  customsType: 'import' | 'export';
  customsMethod: 'general_trade' | 'processing_trade' | 'bonded';
  originCountry: string;
  destinationCountry: string;
  portOfLoading: string;
  portOfDischarge: string;
  invoiceNo: string;
  invoiceDate: string;
  packingListNo: string;
  remark?: string;
}

export interface DocumentGenerateRequest {
  customsId: string;
  documentType: 'declaration_form' | 'commercial_invoice' | 'packing_list' | 'certificate_of_origin';
}

const applyPermissionFilter = async (
  list: Customs[],
  currentUserRole?: string,
  currentUserRegions?: string[]
): Promise<Customs[]> => {
  try {
    const user = currentUserRole
      ? { role: currentUserRole as User['role'], regions: currentUserRegions }
      : await userService.getCurrentUser();
    if (!user) return list;

    switch (user.role) {
      case 'ceo':
      case 'admin':
        return list;

      case 'finance':
      case 'quality':
        return list;

      case 'director':
        if (!user.regions || user.regions.length === 0 || user.regions.includes('*')) return list;
        return list.filter(customs =>
          user.regions!.includes(customs.region)
        );

      case 'supplier':
        const currentUser = await userService.getCurrentUser();
        if (!currentUser?.supplierId) return [];
        return list.filter(customs => customs.supplierId === currentUser.supplierId);

      case 'buyer':
        const buyerUser = await userService.getCurrentUser();
        if (!buyerUser?.categories || buyerUser.categories.length === 0) return list;
        return list;

      case 'manager':
        const managerUser = await userService.getCurrentUser();
        if (!managerUser?.department) return list;
        return list;

      default:
        return list;
    }
  } catch {
    return list;
  }
};

export const customsService = {
  async getCustomsList(
    params?: CustomsQueryParams,
    currentUserRole?: string,
    currentUserRegions?: string[]
  ): Promise<{
    list: Customs[];
    total: number;
    page: number;
    pageSize: number;
  }> {
    await delay(600);

    let result = [...customsData];

    if (params?.keyword) {
      const keyword = params.keyword.toLowerCase();
      result = result.filter(
        c => c.code.toLowerCase().includes(keyword) ||
             c.hsCode.toLowerCase().includes(keyword) ||
             c.goodsName.toLowerCase().includes(keyword) ||
             c.orderCode.toLowerCase().includes(keyword) ||
             c.supplierName.toLowerCase().includes(keyword)
      );
    }

    if (params?.status) {
      result = result.filter(c => c.status === params.status);
    }

    if (params?.customsType) {
      result = result.filter(c => c.customsType === params.customsType);
    }

    if (params?.customsMethod) {
      result = result.filter(c => c.customsMethod === params.customsMethod);
    }

    if (params?.orderId) {
      result = result.filter(c => c.orderId === params.orderId);
    }

    if (params?.orderCode) {
      result = result.filter(c => c.orderCode.toLowerCase().includes(params.orderCode!.toLowerCase()));
    }

    if (params?.supplierId) {
      result = result.filter(c => c.supplierId === params.supplierId);
    }

    if (params?.supplierName) {
      result = result.filter(c => c.supplierName.toLowerCase().includes(params.supplierName!.toLowerCase()));
    }

    if (params?.region) {
      result = result.filter(c => c.region === params.region);
    }

    if (params?.startDate) {
      result = result.filter(c => c.createdAt >= params.startDate!);
    }

    if (params?.endDate) {
      result = result.filter(c => c.createdAt <= params.endDate!);
    }

    result = await applyPermissionFilter(result, currentUserRole, currentUserRegions);

    const total = result.length;
    const page = params?.page || 1;
    const pageSize = params?.pageSize || 10;
    const start = (page - 1) * pageSize;
    const list = result.slice(start, start + pageSize);

    return { list, total, page, pageSize };
  },

  async getCustomsById(id: string): Promise<Customs | null> {
    await delay(300);
    const customs = customsData.find(c => c.id === id);
    return customs || null;
  },

  async getCustomsByOrderId(orderId: string): Promise<Customs | null> {
    await delay(200);
    const customs = customsData.find(c => c.orderId === orderId);
    return customs || null;
  },

  async createCustoms(data: CustomsCreateData): Promise<Customs> {
    await delay(800);

    const existing = await this.getCustomsByOrderId(data.orderId);
    if (existing) {
      return existing;
    }

    const newId = `C${String(customsData.length + 1).padStart(3, '0')}`;
    const newCode = `CUS-${new Date().getFullYear()}-${String(customsData.length + 1).padStart(3, '0')}`;

    const totalAmount = data.quantity * data.unitPrice;
    const dutyRate = data.customsMethod === 'general_trade' ? 0.08 : 0;
    const dutyAmount = totalAmount * dutyRate;
    const vatRate = 0.13;
    const vatAmount = (totalAmount + dutyAmount) * vatRate;

    let region: Region = '其他';
    const order = await orderService.getOrderById(data.orderId);
    if (order && 'region' in order) {
      region = (order as any).region;
    } else {
      region = inferRegionFromSupplier(data.supplierId);
    }

    const newCustoms: Customs = {
      id: newId,
      code: newCode,
      orderId: data.orderId,
      orderCode: data.orderCode,
      supplierId: data.supplierId,
      supplierName: data.supplierName,
      region: region || inferRegionFromSupplier(data.supplierId),
      goodsName: data.productName,
      goodsDescription: data.productSpec,
      hsCode: data.hsCode,
      quantity: data.quantity,
      unit: '件',
      totalAmount,
      currency: data.currency,
      amountRMB: totalAmount,
      exchangeRate: 1,
      originCountry: data.originCountry,
      originCountryCode: '',
      destinationCountry: data.destinationCountry,
      destinationCountryCode: '',
      portOfLoading: data.portOfLoading,
      portOfDischarge: data.portOfDischarge,
      customsType: data.customsType,
      customsMethod: data.customsMethod,
      dutyRate,
      dutyAmount,
      vatRate,
      vatAmount,
      totalTaxAmount: dutyAmount + vatAmount,
      customsBroker: '',
      brokerContact: '',
      status: 'draft',
      statusName: '草稿',
      documents: [],
      inspections: [],
      submittedAt: '',
      clearedAt: '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      operatorId: '',
      operatorName: '',
      remarks: data.remark || '',
      taxPaymentDeadline: '',
      hasIssue: false,
      issueDescription: '',
    };

    customsData.push(newCustoms);
    return newCustoms;
  },

  async updateCustoms(id: string, data: Partial<Customs>): Promise<Customs | null> {
    await delay(600);

    const index = customsData.findIndex(c => c.id === id);
    if (index === -1) {
      return null;
    }

    const customs = customsData[index];
    if (!['draft', 'rejected'].includes(customs.status)) {
      return null;
    }

    customsData[index] = { ...customs, ...data, updatedAt: new Date().toISOString() };
    return customsData[index];
  },

  async deleteCustoms(id: string): Promise<{ success: boolean; message: string }> {
    await delay(500);

    const index = customsData.findIndex(c => c.id === id);
    if (index === -1) {
      return { success: false, message: '报关单不存在' };
    }

    const customs = customsData[index];
    if (!['draft', 'rejected'].includes(customs.status)) {
      return { success: false, message: '只能删除草稿或已驳回的报关单' };
    }

    customsData.splice(index, 1);
    return { success: true, message: '删除成功' };
  },

  async submitDeclaration(id: string): Promise<Customs | null> {
    await delay(600);

    const customs = customsData.find(c => c.id === id);
    if (!customs || customs.status !== 'draft') {
      return null;
    }

    customs.status = 'submitted';
    customs.submittedAt = new Date().toISOString();
    customs.updatedAt = new Date().toISOString();

    return customs;
  },

  async updateStatus(id: string, newStatus: Customs['status']): Promise<Customs | null> {
    await delay(400);

    const customs = customsData.find(c => c.id === id);
    if (!customs) {
      return null;
    }

    const statusNames: Record<Customs['status'], string> = {
      draft: '草稿',
      submitted: '已申报',
      under_review: '审核中',
      inspection: '查验中',
      tax_payment: '待缴税',
      cleared: '已放行',
      rejected: '被退回',
      cancelled: '已取消',
    };

    customs.status = newStatus;
    customs.statusName = statusNames[newStatus];

    if (newStatus === 'cleared') {
      customs.clearedAt = new Date().toISOString();
    }

    customs.updatedAt = new Date().toISOString();
    return customs;
  },

  async generateDocument(request: DocumentGenerateRequest): Promise<{
    success: boolean;
    documentUrl: string;
    message: string;
  }> {
    await delay(800);

    const customs = customsData.find(c => c.id === request.customsId);
    if (!customs) {
      return { success: false, documentUrl: '', message: '报关单不存在' };
    }

    const documentId = `DOC-${Date.now()}`;
    const documentUrl = `/documents/${documentId}.pdf`;

    const documentNames: Record<string, string> = {
      declaration_form: '报关单',
      commercial_invoice: '商业发票',
      packing_list: '装箱单',
      certificate_of_origin: '原产地证书'
    };

    customs.documents.push({
      type: request.documentType,
      name: `${customs.code}-${documentNames[request.documentType]}`,
      url: documentUrl,
      uploadedAt: new Date().toISOString(),
      uploadedBy: 'System'
    });

    customs.updatedAt = new Date().toISOString();

    return {
      success: true,
      documentUrl,
      message: `${documentNames[request.documentType]}生成成功`
    };
  },

  async recordInspection(id: string, inspectionData: {
    inspectionType: string;
    inspector: string;
    result: 'pass' | 'fail' | 'pending';
    remark: string;
  }): Promise<Customs | null> {
    await delay(500);

    const customs = customsData.find(c => c.id === id);
    if (!customs) {
      return null;
    }

    customs.inspections.push({
      type: inspectionData.inspectionType,
      inspector: inspectionData.inspector,
      result: inspectionData.result,
      inspectionDate: new Date().toISOString(),
      remarks: inspectionData.remark,
    });

    if (inspectionData.result === 'fail') {
      customs.hasIssue = true;
      customs.issueDescription = inspectionData.remark;
      customs.status = 'rejected';
    } else if (inspectionData.result === 'pass' && customs.status === 'inspection') {
      customs.status = 'tax_payment';
    }

    customs.updatedAt = new Date().toISOString();
    return customs;
  },

  async calculateTax(id: string): Promise<Customs | null> {
    await delay(400);

    const customs = customsData.find(c => c.id === id);
    if (!customs) {
      return null;
    }

    const dutyRate = customs.customsMethod === 'general_trade' ? 0.08 : 0;
    const dutyAmount = customs.totalAmount * dutyRate;
    const vatRate = 0.13;
    const vatAmount = (customs.totalAmount + dutyAmount) * vatRate;

    customs.dutyRate = dutyRate;
    customs.dutyAmount = dutyAmount;
    customs.vatRate = vatRate;
    customs.vatAmount = vatAmount;
    customs.totalTaxAmount = dutyAmount + vatAmount;
    customs.updatedAt = new Date().toISOString();

    return customs;
  }
};
