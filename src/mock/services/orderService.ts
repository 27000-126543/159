import { ordersData, Order, OrderItem, ApprovalRecord } from '../data/orders';

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export interface OrderQueryParams {
  keyword?: string;
  status?: string;
  supplierId?: string;
  buyerId?: string;
  startDate?: string;
  endDate?: string;
  minAmount?: number;
  maxAmount?: number;
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
  async getOrderList(params?: OrderQueryParams): Promise<{
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
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      remarks: data.remark || '',
      attachments: [],
      hasQualityIssue: false,
      hasCustomsIssue: false,
      hasLogisticsIssue: false,
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
    
    order.status = 'pending_approval';
    order.statusName = '待审批';
    order.progress = 20;
    order.currentApprovalNode = '采购经理审批';
    order.updatedAt = new Date().toISOString();
    
    order.approvalRecords.push({
      id: `AP${order.id}-1`,
      nodeName: '采购经理审批',
      approverId: '',
      approverName: '',
      approverRole: '',
      status: 'pending',
      opinion: '',
      approvedAt: '',
      signature: ''
    });
    
    order.approvalRecords.push({
      id: `AP${order.id}-2`,
      nodeName: '财务复核',
      approverId: '',
      approverName: '',
      approverRole: '',
      status: 'pending',
      opinion: '',
      approvedAt: '',
      signature: ''
    });
    
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
      order.updatedAt = new Date().toISOString();
      return order;
    }
    
    const pendingApprovals = order.approvalRecords.filter(a => a.status === 'pending');
    if (pendingApprovals.length > 0) {
      order.currentApprovalNode = pendingApprovals[0].nodeName;
      order.progress = 50;
    } else {
      order.status = 'approved';
      order.statusName = '已批准';
      order.progress = 30;
      order.currentApprovalNode = '';
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
    
    order.updatedAt = new Date().toISOString();
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
