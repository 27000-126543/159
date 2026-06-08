import { ordersData, Order, OrderItem, ApprovalRecord } from '../data/orders';
import { customsService, CustomsCreateData } from './customsService';
import { logisticsService, LogisticsCreateData } from './logisticsService';
import { settlementService, SettlementCreateData } from './settlementService';
import { userService } from './userService';
import { User } from '../data/users';
import { suppliersData } from '../data/suppliers';
import { 
  getRegionByCountry, 
  STANDARD_REGIONS, 
  getCarrierByRegion, 
  getOriginCityByCountry, 
  determineTransportMethod, 
  extractCityFromAddress 
} from '../../utils/constants';
import type { Region } from '../../utils/constants';

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const inferRegionFromSupplier = (supplierId: string): Region => {
  const supplier = suppliersData.find(s => s.id === supplierId);
  if (supplier) {
    return getRegionByCountry(supplier.country);
  }
  return '其他';
};

const generateCustomsDeclaration = (order: Order): CustomsCreateData => {
  const totalQuantity = order.items.reduce((sum, item) => sum + item.quantity, 0);
  
  return {
    orderId: order.id,
    orderCode: order.code,
    supplierId: order.supplierId,
    supplierName: order.supplierName,
    hsCode: '85423100',
    productName: order.items.map(item => item.productName).join(', '),
    productSpec: order.items.map(item => `${item.productName}: ${item.productSpec}`).join('; '),
    quantity: totalQuantity,
    unitPrice: order.totalAmount / totalQuantity,
    currency: order.currency,
    customsType: 'import',
    customsMethod: 'general_trade',
    originCountry: '中国',
    destinationCountry: '中国',
    portOfLoading: '上海港',
    portOfDischarge: '上海港',
    invoiceNo: `INV-${order.code}`,
    invoiceDate: new Date().toISOString().split('T')[0],
    packingListNo: `PL-${order.code}`,
    remark: `系统自动生成，包含${order.items.length}种商品，总金额${order.totalAmount}${order.currency}`
  };
};

const generateLogisticsPlan = (order: Order): LogisticsCreateData => {
  const supplier = suppliersData.find(s => s.id === order.supplierId);
  const originCountry = supplier?.country || '中国';
  const originRegion = getRegionByCountry(originCountry);
  const destinationCountry = '中国';
  const destinationCity = extractCityFromAddress(order.deliveryAddress);
  
  const transportMethod = determineTransportMethod(originCountry, destinationCountry, originRegion);
  const carrierName = getCarrierByRegion(originRegion);
  const originCity = getOriginCityByCountry(originCountry);
  
  let deliveryDays = 14;
  switch (transportMethod) {
    case 'air':
      deliveryDays = 7;
      break;
    case 'express':
      deliveryDays = 5;
      break;
    case 'rail':
      deliveryDays = 21;
      break;
    case 'sea':
      deliveryDays = 30;
      break;
    case 'land':
      deliveryDays = 10;
      break;
  }
  
  return {
    orderId: order.id,
    orderCode: order.code,
    supplierId: order.supplierId,
    supplierName: order.supplierName,
    transportMethod,
    carrierName,
    originAddress: `${supplier?.address || order.supplierName}`,
    originCity,
    originCountry,
    destinationAddress: order.deliveryAddress,
    destinationCity,
    destinationCountry,
    expectedDepartureDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    expectedArrivalDate: new Date(Date.now() + (3 + deliveryDays) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    packages: [{
      weight: 100,
      volume: 1,
      items: order.items.map(item => `${item.productName} x${item.quantity}`).join(', '),
      packageNo: '',
      type: '标准',
      weightUnit: 'kg',
      volumeUnit: 'm³',
      quantity: 1,
      isReceived: false,
      receivedAt: '',
      receivedBy: '',
      qrCode: ''
    }],
    contactPerson: order.buyerName,
    contactPhone: '13800000000',
    remark: `系统自动生成，包含${order.items.length}种商品，运输方式：${transportMethod}`
  };
};

const generateSettlementFromOrder = (order: Order): SettlementCreateData => {
  return {
    supplierId: order.supplierId,
    supplierName: order.supplierName,
    settlementType: 'normal',
    currency: order.currency as 'CNY' | 'USD' | 'EUR' | 'JPY',
    items: order.items.map(item => ({
      orderId: order.id,
      orderCode: order.code,
      productName: item.productName,
      productSpec: item.productSpec,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      taxRate: 0.13,
      remark: ''
    })),
    creditPeriod: 30,
    creditStartDate: new Date().toISOString().split('T')[0],
    creditDueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    operatorId: order.buyerId,
    operatorName: order.buyerName,
    remark: `订单${order.code}自动生成结算单`,
  };
};

const applyPermissionFilter = async (list: Order[], currentUserRole?: string, currentUserRegions?: string[]): Promise<Order[]> => {
  try {
    const user = currentUserRole ? { role: currentUserRole as User['role'], regions: currentUserRegions } : await userService.getCurrentUser();
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
        return list.filter(order =>
          user.regions!.includes(order.region)
        );

      case 'supplier':
        const currentUser = await userService.getCurrentUser();
        if (!currentUser?.supplierId) return [];
        return list.filter(order => order.supplierId === currentUser.supplierId);

      case 'buyer':
        const buyerUser = await userService.getCurrentUser();
        if (!buyerUser?.categories || buyerUser.categories.length === 0) return [];
        return list.filter(order =>
          buyerUser.categories!.includes(order.category)
        );

      case 'manager':
        const managerUser = await userService.getCurrentUser();
        if (!managerUser?.department) return list;
        return list.filter(order =>
          order.department === managerUser.department
        );

      default:
        return list;
    }
  } catch {
    return list;
  }
};

export interface OrderQueryParams {
  keyword?: string;
  status?: string;
  supplierId?: string;
  buyerId?: string;
  startDate?: string;
  endDate?: string;
  minAmount?: number;
  maxAmount?: number;
  region?: string;
  page?: number;
  pageSize?: number;
}

export interface OrderCreateData {
  supplierId: string;
  supplierName: string;
  inquiryId?: string;
  category: string;
  items: Omit<OrderItem, 'id' | 'amount'>[];
  deliveryAddress: string;
  contactPerson: string;
  contactPhone: string;
  remark?: string;
  buyerId: string;
  buyerName: string;
  region?: Region;
}

export interface ApprovalSubmitData {
  orderId: string;
  nodeName: string;
  approverId: string;
  approverName: string;
  approverRole: string;
  status: 'approved' | 'rejected';
  opinion: string;
}

export const orderService = {
  async getOrderList(params?: OrderQueryParams, currentUserRole?: string, currentUserRegions?: string[]): Promise<{
    list: Order[];
    total: number;
    page: number;
    pageSize: number;
  }> {
    await delay(600);
    
    let result = [...ordersData];
    
    if (params?.keyword) {
      const keyword = params.keyword.toLowerCase();
      result = result.filter(
        o => o.code.toLowerCase().includes(keyword) ||
             o.supplierName.toLowerCase().includes(keyword)
      );
    }
    
    if (params?.status) {
      result = result.filter(o => o.status === params.status);
    }
    
    if (params?.supplierId) {
      result = result.filter(o => o.supplierId === params.supplierId);
    }
    
    if (params?.buyerId) {
      result = result.filter(o => o.buyerId === params.buyerId);
    }
    
    if (params?.startDate) {
      result = result.filter(o => o.createdAt >= params.startDate!);
    }
    
    if (params?.endDate) {
      result = result.filter(o => o.createdAt <= params.endDate!);
    }
    
    if (params?.minAmount !== undefined) {
      result = result.filter(o => o.totalAmount >= params.minAmount!);
    }
    
    if (params?.maxAmount !== undefined) {
      result = result.filter(o => o.totalAmount <= params.maxAmount!);
    }
    
    if (params?.region) {
      result = result.filter(o => o.region === params.region);
    }
    
    result = await applyPermissionFilter(result, currentUserRole, currentUserRegions);
    
    const total = result.length;
    const page = params?.page || 1;
    const pageSize = params?.pageSize || 10;
    const start = (page - 1) * pageSize;
    const list = result.slice(start, start + pageSize);
    
    return { list, total, page, pageSize };
  },
  
  async getOrderById(id: string): Promise<Order | null> {
    await delay(300);
    const order = ordersData.find(o => o.id === id);
    return order || null;
  },
  
  async createOrder(data: OrderCreateData): Promise<Order> {
    await delay(800);
    
    const newId = `O${String(ordersData.length + 1).padStart(3, '0')}`;
    const newCode = `PO-${new Date().getFullYear()}-${String(ordersData.length + 1).padStart(3, '0')}`;
    
    let totalAmount = 0;
    const orderItems: OrderItem[] = data.items.map((item, index) => {
      const amount = item.quantity * item.unitPrice;
      totalAmount += amount;
      return {
        ...item,
        totalPrice: amount,
      };
    });
    
    const newOrder: Order = {
      id: newId,
      code: newCode,
      title: `${data.category}采购订单`,
      inquiryId: data.inquiryId || '',
      inquiryCode: '',
      category: data.category,
      subCategory: '',
      region: data.region || inferRegionFromSupplier(data.supplierId),
      supplierId: data.supplierId,
      supplierName: data.supplierName,
      buyerId: data.buyerId,
      buyerName: data.buyerName,
      department: '采购部',
      items: orderItems,
      totalAmount,
      currency: 'CNY',
      amountRMB: totalAmount,
      exchangeRate: 1,
      paymentTerms: '30%预付款，70%发货前付清',
      deliveryAddress: data.deliveryAddress,
      expectedDeliveryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      actualDeliveryDate: '',
      warrantyPeriod: '12个月',
      status: 'draft',
      statusName: '草稿',
      progress: 0,
      approvalRecords: [],
      currentApprovalNode: '',
      nextApprovalNode: '',
      isLargeAmount: totalAmount > 100000,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      remarks: data.remark || '',
      attachments: [],
      hasQualityIssue: false,
      hasCustomsIssue: false,
      hasLogisticsIssue: false,
      completedAt: '',
    };
    
    ordersData.push(newOrder);
    return newOrder;
  },
  
  async updateOrder(id: string, data: Partial<Order>): Promise<Order | null> {
    await delay(600);
    
    const index = ordersData.findIndex(o => o.id === id);
    if (index === -1) {
      return null;
    }
    
    const order = ordersData[index];
    if (!['draft', 'rejected'].includes(order.status)) {
      return null;
    }
    
    ordersData[index] = { ...order, ...data, updatedAt: new Date().toISOString() };
    return ordersData[index];
  },
  
  async deleteOrder(id: string): Promise<{ success: boolean; message: string }> {
    await delay(500);
    
    const index = ordersData.findIndex(o => o.id === id);
    if (index === -1) {
      return { success: false, message: '订单不存在' };
    }
    
    const order = ordersData[index];
    if (!['draft', 'rejected'].includes(order.status)) {
      return { success: false, message: '只能删除草稿或已驳回的订单' };
    }
    
    ordersData.splice(index, 1);
    return { success: true, message: '删除成功' };
  },
  
  async submitApproval(id: string): Promise<Order | null> {
    await delay(600);
    
    const index = ordersData.findIndex(o => o.id === id);
    if (index === -1) {
      return null;
    }
    
    const order = ordersData[index];
    if (order.status !== 'draft') {
      return null;
    }
    
    const amount = order.totalAmount;
    order.isLargeAmount = amount > 100000;
    
    let approvalNodes: string[] = ['采购经理审批', '财务复核'];
    if (amount > 100000) {
      approvalNodes = ['采购经理审批', '财务复核', '总经理审批'];
    }
    if (amount > 500000) {
      approvalNodes = ['采购经理审批', '财务复核', '总经理审批', 'CEO审批'];
    }
    
    const progressSteps: Record<number, number> = {
      2: 25,
      3: 20,
      4: 15
    };
    const initialProgress = progressSteps[approvalNodes.length] || 25;
    
    order.status = 'pending_approval';
    order.statusName = '待审批';
    order.progress = initialProgress;
    order.currentApprovalNode = approvalNodes[0];
    order.nextApprovalNode = approvalNodes.length > 1 ? approvalNodes[1] : '';
    order.updatedAt = new Date().toISOString();
    
    order.approvalRecords = approvalNodes.map((nodeName, idx) => ({
      id: `AP${order.id}-${idx + 1}`,
      nodeName,
      approverId: '',
      approverName: '',
      approverRole: '',
      status: 'pending' as const,
      opinion: '',
      approvedAt: '',
      signature: ''
    }));
    
    return order;
  },
  
  async approveOrder(data: ApprovalSubmitData): Promise<Order | null> {
    await delay(500);
    
    const order = ordersData.find(o => o.id === data.orderId);
    if (!order || order.status !== 'pending_approval') {
      return null;
    }
    
    const currentApproval = order.approvalRecords.find(
      a => a.nodeName === order.currentApprovalNode && a.status === 'pending'
    );
    if (!currentApproval) {
      return null;
    }
    
    currentApproval.approverId = data.approverId;
    currentApproval.approverName = data.approverName;
    currentApproval.approverRole = data.approverRole;
    currentApproval.status = data.status;
    currentApproval.opinion = data.opinion;
    currentApproval.approvedAt = new Date().toISOString();
    currentApproval.signature = `SIG-${Date.now()}`;
    
    if (data.status === 'rejected') {
      order.status = 'rejected';
      order.statusName = '已驳回';
      order.progress = 10;
      order.currentApprovalNode = '';
      order.nextApprovalNode = '';
      order.updatedAt = new Date().toISOString();
      return order;
    }
    
    const totalNodes = order.approvalRecords.length;
    const approvedCount = order.approvalRecords.filter(a => a.status === 'approved').length;
    const pendingApprovals = order.approvalRecords.filter(a => a.status === 'pending');
    
    const progressSteps: Record<number, number[]> = {
      2: [0, 25, 50, 100],
      3: [0, 20, 40, 60, 100],
      4: [0, 15, 30, 45, 60, 100]
    };
    
    const steps = progressSteps[totalNodes] || progressSteps[2];
    const progressIndex = Math.min(approvedCount + 1, steps.length - 1);
    
    if (pendingApprovals.length > 0) {
      order.currentApprovalNode = pendingApprovals[0].nodeName;
      order.nextApprovalNode = pendingApprovals.length > 1 ? pendingApprovals[1].nodeName : '';
      order.progress = steps[progressIndex];
    } else {
      order.status = 'approved';
      order.statusName = '已批准';
      order.progress = steps[steps.length - 1];
      order.currentApprovalNode = '';
      order.nextApprovalNode = '';
      
      if (order.items.length > 0) {
        const customsData = generateCustomsDeclaration(order);
        await customsService.createCustoms(customsData);
      }
    }
    
    order.updatedAt = new Date().toISOString();
    return order;
  },
  
  async updateOrderStatus(id: string, newStatus: Order['status']): Promise<Order | null> {
    await delay(400);
    
    const order = ordersData.find(o => o.id === id);
    if (!order) {
      return null;
    }
    
    const oldStatus = order.status;
    
    const validTransitions: Record<Order['status'], Order['status'][]> = {
      draft: ['pending_approval', 'cancelled'],
      pending_approval: ['approved', 'rejected', 'cancelled'],
      approved: ['production', 'cancelled'],
      production: ['shipping', 'cancelled'],
      shipping: ['delivered', 'cancelled'],
      delivered: ['completed', 'cancelled'],
      completed: [],
      rejected: ['draft', 'cancelled'],
      cancelled: []
    };
    
    if (!validTransitions[order.status]?.includes(newStatus)) {
      return null;
    }
    
    const statusNames: Record<Order['status'], string> = {
      draft: '草稿',
      pending_approval: '待审批',
      approved: '已批准',
      rejected: '已驳回',
      production: '生产中',
      shipping: '运输中',
      delivered: '已送达',
      completed: '已完成',
      cancelled: '已取消'
    };
    
    const progressValues: Record<Order['status'], number> = {
      draft: 0,
      pending_approval: 20,
      approved: 30,
      rejected: 10,
      production: 60,
      shipping: 75,
      delivered: 90,
      completed: 100,
      cancelled: 0
    };
    
    order.status = newStatus;
    order.statusName = statusNames[newStatus];
    order.progress = progressValues[newStatus];
    
    if (newStatus === 'delivered') {
      order.actualDeliveryDate = new Date().toISOString().split('T')[0];
    }
    
    if (newStatus === 'completed') {
      order.completedAt = new Date().toISOString();
    }
    
    order.updatedAt = new Date().toISOString();
    
    if (oldStatus === 'pending_approval' && newStatus === 'approved') {
      if (order.items.length > 0) {
        const customsData = generateCustomsDeclaration(order);
        await customsService.createCustoms(customsData);
      }
    }
    
    if (oldStatus === 'approved' && newStatus === 'production') {
      const logisticsData = generateLogisticsPlan(order);
      await logisticsService.createLogistics(logisticsData);
    }
    
    if (oldStatus !== 'completed' && newStatus === 'completed') {
      const existingSettlement = await settlementService.getSettlementByOrderId(order.id);
      if (!existingSettlement) {
        const settlementData = generateSettlementFromOrder(order);
        await settlementService.createSettlement(settlementData);
      }
    }
    
    return order;
  },
  
  async getOrderStatistics(params?: {
    startDate?: string;
    endDate?: string;
  }): Promise<{
    total: number;
    totalAmount: number;
    byStatus: Array<{ status: string; count: number; amount: number }>;
    byCategory: Array<{ category: string; count: number; amount: number }>;
  }> {
    await delay(400);
    
    let result = [...ordersData];
    
    if (params?.startDate) {
      result = result.filter(o => o.createdAt >= params.startDate!);
    }
    if (params?.endDate) {
      result = result.filter(o => o.createdAt <= params.endDate!);
    }
    
    const total = result.length;
    const totalAmount = result.reduce((sum, o) => sum + o.totalAmount, 0);
    
    const byStatusMap = new Map<string, { count: number; amount: number }>();
    const byCategoryMap = new Map<string, { count: number; amount: number }>();
    
    result.forEach(order => {
      if (!byStatusMap.has(order.status)) {
        byStatusMap.set(order.status, { count: 0, amount: 0 });
      }
      const statusStat = byStatusMap.get(order.status)!;
      statusStat.count++;
      statusStat.amount += order.totalAmount;
      
      if (!byCategoryMap.has(order.category)) {
        byCategoryMap.set(order.category, { count: 0, amount: 0 });
      }
      const categoryStat = byCategoryMap.get(order.category)!;
      categoryStat.count++;
      categoryStat.amount += order.totalAmount;
    });
    
    return {
      total,
      totalAmount,
      byStatus: Array.from(byStatusMap.entries()).map(([status, stat]) => ({ status, ...stat })),
      byCategory: Array.from(byCategoryMap.entries()).map(([category, stat]) => ({ category, ...stat }))
    };
  }
};
