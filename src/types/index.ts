export type UserRole = 'supplier' | 'buyer' | 'manager' | 'director' | 'ceo' | 'finance' | 'quality' | 'admin';

export interface UserInfo {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  department?: string;
  region?: string;
  avatar?: string;
  supplierId?: string;
  categories?: string[];
  regions?: string[];
}

export interface LoginRequest {
  username: string;
  password: string;
  role: UserRole;
}

export interface LoginResponse {
  token: string;
  user: UserInfo;
}

export type SupplierStatus = 'pending' | 'approved' | 'rejected' | 'suspended';

export interface SupplierQualification {
  id: string;
  type: string;
  name: string;
  issueDate: string;
  expiryDate: string;
  issuer: string;
  fileUrl: string;
  verified: boolean;
}

export interface SupplierCapacity {
  id: string;
  category: string;
  monthlyCapacity: number;
  unit: string;
  currentUtilization: number;
  peakSeasonCapacity: number;
  offSeasonCapacity: number;
  leadTime: number;
  minOrderQuantity: number;
}

export interface Supplier {
  id: string;
  name: string;
  category: string;
  region: string;
  country: string;
  qualification: string[];
  qualifications?: SupplierQualification[];
  capacity: number;
  capacities?: SupplierCapacity[];
  score: number;
  historicalOrders: number;
  totalAmount: number;
  onTimeRate: number;
  qualityRate: number;
  status: SupplierStatus;
  creditPeriod: number;
  creditLimit: number;
  contactPerson?: string;
  contactPhone?: string;
  contactEmail?: string;
  address?: string;
  createdAt: string;
}

export type InquiryStatus = 'draft' | 'published' | 'closed';

export type QuoteStatus = 'pending' | 'submitted' | 'accepted' | 'rejected' | 'negotiating';

export interface Negotiation {
  id: string;
  round: number;
  proposedPrice: number;
  counterPrice: number;
  message: string;
  sender: string;
  createdAt: string;
}

export interface Quote {
  id: string;
  inquiryId: string;
  supplierId: string;
  supplierName: string;
  unitPrice: number;
  totalPrice: number;
  deliveryTime: number;
  paymentTerms: string;
  warranty: string;
  remarks: string;
  status?: QuoteStatus;
  createdAt: string;
  negotiations: Negotiation[];
}

export interface Inquiry {
  id: string;
  title: string;
  category: string;
  description: string;
  quantity: number;
  specifications: string;
  deadline: string;
  createdBy: string;
  createdAt: string;
  status: InquiryStatus;
  quotes: Quote[];
}

export type OrderStatus = 'draft' | 'pending_approval' | 'approved' | 'rejected' | 'production' | 'shipping' | 'in_progress' | 'shipped' | 'delivered' | 'completed' | 'cancelled';

export type ApprovalStatus = 'pending' | 'approved' | 'rejected' | 'escalated';

export interface OrderItem {
  id: string;
  productName: string;
  specification: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface Approval {
  id: string;
  orderId: string;
  approverId: string;
  approverName: string;
  role: UserRole;
  status: ApprovalStatus;
  comments: string;
  createdAt: string;
  approvedAt?: string;
}

export interface ApprovalRecord {
  id: string;
  nodeName: string;
  approverId: string;
  approverName: string;
  approverRole: string;
  status: 'pending' | 'approved' | 'rejected';
  opinion: string;
  approvedAt: string;
  signature: string;
}

export interface Order {
  id: string;
  orderNo: string;
  inquiryId?: string;
  quoteId?: string;
  supplierId: string;
  supplierName: string;
  items: OrderItem[];
  totalAmount: number;
  currency: string;
  deliveryDate: string;
  shippingAddress: string;
  paymentTerms: string;
  status: OrderStatus;
  approvalRecords: ApprovalRecord[];
  createdAt: string;
  createdBy: string;
}

export type CustomsStatus = 'draft' | 'submitted' | 'cleared' | 'pending_tax' | 'completed';

export type CustomsDocumentType = 'invoice' | 'packing_list' | 'bill_of_lading' | 'certificate_of_origin' | 'other';

export interface CustomsDocument {
  id: string;
  type: CustomsDocumentType;
  name: string;
  url: string;
  uploadedAt?: string;
}

export interface CustomsDeclaration {
  id: string;
  orderId: string;
  declarationNo: string;
  goodsDescription: string;
  hsCode: string;
  declaredValue: number;
  currency: string;
  originCountry: string;
  destinationCountry: string;
  status: CustomsStatus;
  documents: CustomsDocument[];
  createdAt: string;
  declaredAt?: string;
  clearedAt?: string;
}

export type ShipmentStatus = 'pending' | 'in_transit' | 'arrived' | 'customs_clearance' | 'delivered';

export interface TrackingEvent {
  id: string;
  status: string;
  location: string;
  timestamp: string;
  description: string;
}

export interface Shipment {
  id: string;
  orderId: string;
  trackingNo: string;
  carrier: string;
  shippingMethod: string;
  departurePort: string;
  destinationPort: string;
  estimatedDeparture: string;
  estimatedArrival: string;
  actualDeparture?: string;
  actualArrival?: string;
  status: ShipmentStatus;
  trackingEvents: TrackingEvent[];
  createdAt: string;
}

export type InspectionResult = 'passed' | 'failed' | 'partial';

export type ReturnStatus = 'pending_confirmation' | 'confirmed' | 'in_transit' | 'received' | 'completed';

export interface InspectionItem {
  id: string;
  productName: string;
  quantityInspected: number;
  quantityPassed: number;
  quantityFailed: number;
  failureReasons: string[];
  result: 'passed' | 'failed';
}

export interface QualityInspection {
  id: string;
  orderId: string;
  shipmentId: string;
  inspectedBy: string;
  inspectionDate: string;
  items: InspectionItem[];
  overallResult: InspectionResult;
  remarks: string;
  createdAt: string;
}

export interface ReturnItem {
  id: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  reason?: string;
}

export interface ReturnOrder {
  id: string;
  orderId: string;
  inspectionId: string;
  supplierId: string;
  reason: string;
  items: ReturnItem[];
  status: ReturnStatus;
  createdAt: string;
  confirmedAt?: string;
  receivedAt?: string;
  completedAt?: string;
}

export type SettlementStatus = 'pending' | 'confirmed' | 'partial_paid' | 'paid' | 'overdue';

export interface Payment {
  id: string;
  settlementId: string;
  amount: number;
  paymentDate: string;
  paymentMethod: string;
  referenceNo: string;
  createdAt: string;
}

export interface Settlement {
  id: string;
  settlementNo: string;
  supplierId: string;
  supplierName?: string;
  orderIds: string[];
  periodStart: string;
  periodEnd: string;
  totalAmount: number;
  paidAmount: number;
  unpaidAmount: number;
  dueDate: string;
  status: SettlementStatus;
  payments?: Payment[];
  createdAt: string;
}

export interface DashboardStats {
  totalPurchaseAmount: number;
  totalPurchaseAmountYoY: number;
  totalPurchaseAmountMoM: number;
  onTimeDeliveryRate: number;
  onTimeDeliveryRateYoY: number;
  qualityPassRate: number;
  qualityPassRateYoY: number;
  pendingApprovals: number;
  pendingOrders: number;
  activeSuppliers: number;
}

export interface TrendData {
  date: string;
  amount: number;
  category: string;
}

export interface CategoryData {
  category: string;
  amount: number;
  percentage: number;
  count: number;
  trend?: number;
}

export interface RegionData {
  region: string;
  country?: string;
  amount: number;
  percentage: number;
  supplierCount: number;
  orderCount: number;
}

export interface BuyerEfficiency {
  buyerId: string;
  buyerName: string;
  department: string;
  orderCount: number;
  totalAmount: number;
  avgApprovalTime: number;
  costSaving: number;
}

export interface FilterParams {
  startDate?: string;
  endDate?: string;
  category?: string;
  region?: string;
  supplierId?: string;
  status?: string;
  buyerId?: string;
  department?: string;
  page?: number;
  pageSize?: number;
  keyword?: string;
}

export interface KPI {
  id: string;
  name: string;
  value: number;
  unit: string;
  growthRate: number;
  comparedToLastPeriod: number;
  trend: 'up' | 'down' | 'flat';
  icon: string;
  color: string;
}

export interface DashboardTrendData {
  month: string;
  purchaseAmount: number;
  orderCount: number;
  supplierCount: number;
  onTimeDeliveryRate: number;
  qualityPassRate: number;
}

export interface CategoryAnalysis {
  category: string;
  subCategory: string;
  purchaseAmount: number;
  orderCount: number;
  supplierCount: number;
  avgPrice: number;
  growthRate: number;
  proportion: number;
}

export interface RegionAnalysis {
  region: string;
  country: string;
  countryCode: string;
  purchaseAmount: number;
  orderCount: number;
  supplierCount: number;
  avgDeliveryDays: number;
  proportion: number;
  lat: number;
  lng: number;
}

export interface BuyerPerformance {
  buyerId: string;
  buyerName: string;
  department: string;
  orderCount: number;
  purchaseAmount: number;
  avgOrderAmount: number;
  costSaving: number;
  costSavingRate: number;
  onTimeRate: number;
  qualityPassRate: number;
  supplierCount: number;
  ranking: number;
  performanceScore: number;
  performanceLevel: 'excellent' | 'good' | 'average' | 'poor';
}

export interface OrderStatusStat {
  status: string;
  statusName: string;
  count: number;
  amount: number;
  proportion: number;
}

export interface SupplierRating {
  rating: number;
  count: number;
  proportion: number;
}

export interface AlertMessage {
  id: string;
  type: 'warning' | 'error' | 'info' | 'success';
  title: string;
  content: string;
  relatedId: string;
  relatedType: 'order' | 'settlement' | 'settlement_overdue' | 'logistics' | 'supplier' | 'system';
  timestamp: string;
  isRead: boolean;
}

export interface RecentOrder {
  id: string;
  code: string;
  supplierName: string;
  productName: string;
  amount: number;
  status: string;
  statusName: string;
  createdAt: string;
}

export interface DashboardSummary {
  totalSuppliers: number;
  approvedSuppliers: number;
  pendingSuppliers: number;
  totalOrders: number;
  completedOrders: number;
  totalInquiries: number;
  avgResponseTime: number;
  topCategory: string;
  topRegion: string;
  topBuyer: string;
}

export interface DashboardData {
  period: {
    startDate: string;
    endDate: string;
    periodType: 'month' | 'quarter' | 'year' | 'custom';
  };
  kpis: KPI[];
  trends: DashboardTrendData[];
  categoryAnalysis: CategoryAnalysis[];
  regionAnalysis: RegionAnalysis[];
  buyerPerformance: BuyerPerformance[];
  orderStatus: OrderStatusStat[];
  supplierRating: SupplierRating[];
  recentOrders: RecentOrder[];
  alertMessages: AlertMessage[];
  summary: DashboardSummary;
}

export interface DashboardFilterParams extends FilterParams {
  periodType?: 'month' | 'quarter' | 'year' | 'custom';
}
