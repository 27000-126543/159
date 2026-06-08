import { logistics as logisticsData, Logistics, Package, TrackingEvent } from '../data/logistics';

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export interface LogisticsQueryParams {
  keyword?: string;
  status?: string;
  transportMethod?: string;
  orderId?: string;
  supplierId?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  pageSize?: number;
}

export interface LogisticsCreateData {
  orderId: string;
  orderCode: string;
  supplierId: string;
  supplierName: string;
  transportMethod: 'air' | 'sea' | 'land' | 'rail' | 'express';
  carrierName: string;
  originAddress: string;
  originCity: string;
  originCountry: string;
  destinationAddress: string;
  destinationCity: string;
  destinationCountry: string;
  expectedDepartureDate: string;
  expectedArrivalDate: string;
  packages: Omit<Package, 'id' | 'trackingEvents' | 'status'>[];
  contactPerson: string;
  contactPhone: string;
  remark?: string;
}

export interface TrackingSubmitData {
  logisticsId: string;
  packageId: string;
  status: string;
  location: string;
  operator: string;
  description: string;
  temperature?: number;
  humidity?: number;
  isException: boolean;
  exceptionType?: string;
  exceptionDescription?: string;
}

export const logisticsService = {
  async getLogisticsList(params?: LogisticsQueryParams): Promise<{
    list: Logistics[];
    total: number;
    page: number;
    pageSize: number;
  }> {
    await delay(600);
    
    let result = [...logisticsData];
    
    if (params?.keyword) {
      const keyword = params.keyword.toLowerCase();
      result = result.filter(
        l => l.trackingNo.toLowerCase().includes(keyword) ||
             l.carrier.toLowerCase().includes(keyword) ||
             l.orderCode.toLowerCase().includes(keyword)
      );
    }
    
    if (params?.status) {
      result = result.filter(l => l.status === params.status);
    }
    
    if (params?.transportMethod) {
      result = result.filter(l => l.transportMode === params.transportMethod);
    }
    
    if (params?.orderId) {
      result = result.filter(l => l.orderId === params.orderId);
    }
    
    if (params?.supplierId) {
      result = result.filter(l => l.supplierId === params.supplierId);
    }
    
    if (params?.startDate) {
      result = result.filter(l => l.createdAt >= params.startDate!);
    }
    
    if (params?.endDate) {
      result = result.filter(l => l.createdAt <= params.endDate!);
    }
    
    const total = result.length;
    const page = params?.page || 1;
    const pageSize = params?.pageSize || 10;
    const start = (page - 1) * pageSize;
    const list = result.slice(start, start + pageSize);
    
    return { list, total, page, pageSize };
  },
  
  async getLogisticsById(id: string): Promise<Logistics | null> {
    await delay(300);
    const logistics = logisticsData.find(l => l.id === id);
    return logistics || null;
  },
  
  async getLogisticsByOrderId(orderId: string): Promise<Logistics | null> {
    await delay(300);
    const logistics = logisticsData.find(l => l.orderId === orderId);
    return logistics || null;
  },
  
  async createLogisticsPlan(data: LogisticsCreateData): Promise<Logistics> {
    await delay(800);
    
    const newId = `L${String(logisticsData.length + 1).padStart(3, '0')}`;
    const newCode = `LOG-${new Date().getFullYear()}-${String(logisticsData.length + 1).padStart(3, '0')}`;
    const newTrackingNo = `TRK${Date.now()}${Math.random().toString(36).substr(2, 4).toUpperCase()}`;
    
    const transportModeNames: Record<string, string> = {
      air: '空运',
      sea: '海运',
      land: '陆运',
      rail: '铁路',
      express: '快递',
    };
    
    const packages: Package[] = data.packages.map((pkg, index) => ({
      id: `PKG${newId}-${index + 1}`,
      ...pkg,
      packageNo: `${newTrackingNo}-${index + 1}`,
      type: '标准',
      weightUnit: 'kg',
      volumeUnit: 'm³',
      items: '',
      quantity: 1,
      isReceived: false,
      receivedAt: '',
      receivedBy: '',
      qrCode: `https://qr.example.com/track/${newTrackingNo}-${index + 1}`,
    }));
    
    const newLogistics: Logistics = {
      id: newId,
      code: newCode,
      trackingNo: newTrackingNo,
      orderId: data.orderId,
      orderCode: data.orderCode,
      supplierId: data.supplierId,
      supplierName: data.supplierName,
      planNo: '',
      planName: '',
      transportMode: data.transportMethod,
      transportModeName: transportModeNames[data.transportMethod] || data.transportMethod,
      carrier: data.carrierName,
      carrierContact: '',
      originAddress: data.originAddress,
      originCity: data.originCity,
      originCountry: data.originCountry,
      destinationAddress: data.destinationAddress,
      destinationCity: data.destinationCity,
      destinationCountry: data.destinationCountry,
      pickupDate: data.expectedDepartureDate,
      expectedDeliveryDate: data.expectedArrivalDate,
      actualDeliveryDate: '',
      estimatedDays: 0,
      actualDays: 0,
      status: 'planning',
      statusName: '计划中',
      progress: 0,
      currentLocation: '',
      currentCity: '',
      currentCountry: '',
      temperatureControl: false,
      temperatureRange: '',
      insurance: true,
      insuranceAmount: 0,
      packages,
      totalWeight: packages.reduce((sum, p) => sum + p.weight, 0),
      totalVolume: 0,
      trackingEvents: [],
      freightCost: 0,
      currency: 'CNY',
      customsClearanceCost: 0,
      otherCost: 0,
      totalCost: 0,
      receiverName: data.contactPerson,
      receiverPhone: data.contactPhone,
      receiverEmail: '',
      signProof: '',
      signType: '',
      signedBy: '',
      signedAt: '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      operatorId: '',
      operatorName: '',
      remarks: data.remark || '',
      hasException: false,
      exceptionType: '',
      exceptionDescription: '',
    };
    
    logisticsData.push(newLogistics);
    return newLogistics;
  },
  
  async updateLogistics(id: string, data: Partial<Logistics>): Promise<Logistics | null> {
    await delay(600);
    
    const index = logisticsData.findIndex(l => l.id === id);
    if (index === -1) {
      return null;
    }
    
    const logistics = logisticsData[index];
    if (['delivered', 'cancelled', 'returned'].includes(logistics.status)) {
      return null;
    }
    
    logisticsData[index] = { ...logistics, ...data, updatedAt: new Date().toISOString() };
    return logisticsData[index];
  },
  
  async updateStatus(id: string, newStatus: Logistics['status']): Promise<Logistics | null> {
    await delay(400);
    
    const logistics = logisticsData.find(l => l.id === id);
    if (!logistics) {
      return null;
    }
    
    const statusNames: Record<Logistics['status'], string> = {
      planning: '计划中',
      picked_up: '已揽收',
      in_transit: '运输中',
      customs_clearance: '清关中',
      out_for_delivery: '派送中',
      delivered: '已送达',
      exception: '异常',
      returned: '退回',
    };
    
    const progressValues: Record<Logistics['status'], number> = {
      planning: 0,
      picked_up: 10,
      in_transit: 40,
      customs_clearance: 60,
      out_for_delivery: 85,
      delivered: 100,
      exception: 50,
      returned: 30,
    };
    
    logistics.status = newStatus;
    logistics.statusName = statusNames[newStatus];
    logistics.progress = progressValues[newStatus];
    
    if (newStatus === 'in_transit' && !logistics.pickupDate) {
      logistics.pickupDate = new Date().toISOString().split('T')[0];
    }
    
    if (newStatus === 'delivered') {
      logistics.actualDeliveryDate = new Date().toISOString().split('T')[0];
    }
    
    logistics.updatedAt = new Date().toISOString();
    return logistics;
  },
  
  async addTrackingEvent(data: TrackingSubmitData): Promise<TrackingEvent | null> {
    await delay(500);
    
    const logistics = logisticsData.find(l => l.id === data.logisticsId);
    if (!logistics) {
      return null;
    }
    
    const pkg = logistics.packages.find(p => p.id === data.packageId);
    if (!pkg) {
      return null;
    }
    
    const newEvent: TrackingEvent = {
      id: `EVT${Date.now()}`,
      timestamp: new Date().toISOString(),
      status: data.status,
      statusCode: data.status,
      location: data.location,
      operator: data.operator,
      description: data.description,
      temperature: data.temperature,
      humidity: data.humidity,
      isException: data.isException,
      exceptionType: data.exceptionType,
      exceptionDescription: data.exceptionDescription
    };
    
    logistics.trackingEvents.push(newEvent);
    
    const statusMapping: Record<string, Package['isReceived']> = {
      '已签收': true,
    };
    
    if (statusMapping[data.status] !== undefined) {
      pkg.isReceived = statusMapping[data.status];
    }
    
    if (data.status === '已签收') {
      pkg.receivedAt = new Date().toISOString();
      pkg.receivedBy = data.operator;
    }
    
    if (data.isException) {
      logistics.hasException = true;
      logistics.exceptionType = data.exceptionType || '';
      logistics.exceptionDescription = data.exceptionDescription || '';
    }
    
    const allReceived = logistics.packages.every(p => p.isReceived);
    if (allReceived) {
      logistics.status = 'delivered';
      logistics.statusName = '已送达';
      logistics.progress = 100;
      logistics.actualDeliveryDate = new Date().toISOString().split('T')[0];
    } else if (data.status === '运输中' && logistics.status === 'planning') {
      logistics.status = 'in_transit';
      logistics.statusName = '运输中';
      logistics.progress = 40;
      logistics.pickupDate = new Date().toISOString().split('T')[0];
    }
    
    logistics.currentLocation = data.location;
    
    logistics.updatedAt = new Date().toISOString();
    return newEvent;
  },
  
  async scanReceipt(logisticsId: string, packageId: string, signatory: string): Promise<Package | null> {
    await delay(500);
    
    const logistics = logisticsData.find(l => l.id === logisticsId);
    if (!logistics) {
      return null;
    }
    
    const pkg = logistics.packages.find(p => p.id === packageId);
    if (!pkg) {
      return null;
    }
    
    pkg.isReceived = true;
    pkg.receivedAt = new Date().toISOString();
    pkg.receivedBy = signatory;
    
    const lastEvent = logistics.trackingEvents[logistics.trackingEvents.length - 1];
    const newEvent: TrackingEvent = {
      id: `EVT${Date.now()}`,
      timestamp: new Date().toISOString(),
      status: '已签收',
      statusCode: 'delivered',
      location: lastEvent?.location || '目的地',
      operator: signatory,
      description: '扫码签收完成',
      isException: false
    };
    
    logistics.trackingEvents.push(newEvent);
    
    const allReceived = logistics.packages.every(p => p.isReceived);
    if (allReceived) {
      logistics.status = 'delivered';
      logistics.statusName = '已送达';
      logistics.progress = 100;
      logistics.actualDeliveryDate = new Date().toISOString().split('T')[0];
      logistics.signedBy = signatory;
      logistics.signedAt = new Date().toISOString();
      logistics.signType = '扫码签收';
    }
    
    logistics.updatedAt = new Date().toISOString();
    return pkg;
  },
  
  async getTrackingInfo(trackingNo: string): Promise<Logistics | null> {
    await delay(300);
    
    let logistics = logisticsData.find(l => l.trackingNo === trackingNo);
    if (!logistics) {
      logistics = logisticsData.find(l => l.packages.some(p => p.packageNo === trackingNo));
    }
    
    return logistics || null;
  },
  
  async getDeliveryStatistics(params?: {
    startDate?: string;
    endDate?: string;
  }): Promise<{
    total: number;
    onTimeCount: number;
    onTimeRate: number;
    delayedCount: number;
    avgDeliveryDays: number;
    byTransportMethod: Array<{ method: string; count: number; onTimeRate: number }>;
  }> {
    await delay(400);
    
    let result = [...logisticsData];
    
    if (params?.startDate) {
      result = result.filter(l => l.createdAt >= params.startDate!);
    }
    if (params?.endDate) {
      result = result.filter(l => l.createdAt <= params.endDate!);
    }
    
    const total = result.length;
    const onTimeCount = result.filter(l => {
      if (!l.actualDeliveryDate || !l.expectedDeliveryDate) return false;
      return new Date(l.actualDeliveryDate) <= new Date(l.expectedDeliveryDate);
    }).length;
    
    const delayedCount = total - onTimeCount;
    const onTimeRate = total > 0 ? (onTimeCount / total) * 100 : 0;
    
    const methodMap = new Map<string, { count: number; onTime: number }>();
    result.forEach(l => {
      if (!methodMap.has(l.transportMode)) {
        methodMap.set(l.transportMode, { count: 0, onTime: 0 });
      }
      const stat = methodMap.get(l.transportMode)!;
      stat.count++;
      if (l.actualDeliveryDate && l.expectedDeliveryDate && new Date(l.actualDeliveryDate) <= new Date(l.expectedDeliveryDate)) {
        stat.onTime++;
      }
    });
    
    const byTransportMethod = Array.from(methodMap.entries()).map(([method, stat]) => ({
      method,
      count: stat.count,
      onTimeRate: stat.count > 0 ? (stat.onTime / stat.count) * 100 : 0
    }));
    
    const deliveryDays = result
      .filter(l => l.actualDeliveryDate && l.pickupDate)
      .map(l => {
        const start = new Date(l.pickupDate!);
        const end = new Date(l.actualDeliveryDate!);
        return Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
      });
    
    const avgDeliveryDays = deliveryDays.length > 0
      ? deliveryDays.reduce((a, b) => a + b, 0) / deliveryDays.length
      : 0;
    
    return {
      total,
      onTimeCount,
      onTimeRate,
      delayedCount,
      avgDeliveryDays,
      byTransportMethod
    };
  }
};
