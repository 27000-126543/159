export interface SettlementItem {
  id: string;
  orderId: string;
  orderCode: string;
  productName: string;
  productSpec: string;
  quantity: number;
  unitPrice: number;
  amount: number;
  taxRate: number;
  taxAmount: number;
  totalAmount: number;
  remark: string;
}

export interface PaymentPlan {
  id: string;
  paymentType: 'prepayment' | 'progress' | 'final' | 'deposit';
  paymentName: string;
  dueDate: string;
  dueAmount: number;
  actualDate?: string;
  actualAmount?: number;
  status: 'pending' | 'partial' | 'paid' | 'overdue';
  voucherNo?: string;
  remark: string;
}

export interface Invoice {
  id: string;
  invoiceNo: string;
  invoiceType: 'special' | 'general' | 'electronic';
  invoiceDate: string;
  invoiceAmount: number;
  taxAmount: number;
  totalAmount: number;
  status: 'pending' | 'issued' | 'received' | 'verified' | 'rejected';
  issuedBy: string;
  receivedDate?: string;
  verifiedDate?: string;
  remark: string;
}

export interface Settlement {
  id: string;
  code: string;
  supplierId: string;
  supplierName: string;
  settlementType: 'normal' | 'return' | 'discount' | 'advance';
  status: 'draft' | 'verifying' | 'verified' | 'accounting' | 'completed' | 'rejected';
  paymentStatus: 'unpaid' | 'paid' | 'overdue';
  currency: 'CNY' | 'USD' | 'EUR' | 'JPY' | 'CHF';
  exchangeRate?: number;
  items: SettlementItem[];
  totalAmount: number;
  totalTaxAmount: number;
  grandTotal: number;
  paidAmount: number;
  unpaidAmount: number;
  creditPeriod: number;
  creditStartDate: string;
  creditDueDate: string;
  dueDate: string;
  actualPaymentDate?: string;
  invoices: Invoice[];
  paymentPlans: PaymentPlan[];
  hasDeduction: boolean;
  deductionAmount: number;
  deductionReason?: string;
  operatorId: string;
  operatorName: string;
  accountantId?: string;
  accountantName?: string;
  managerId?: string;
  managerName?: string;
  settlementDate?: string;
  remark: string;
  attachments: string[];
  createdAt: string;
  updatedAt: string;
}

export const settlement: Settlement[] = [
  {
    id: 'SET001',
    code: 'SET-2024-001',
    supplierId: 'S001',
    supplierName: '深圳华为技术有限公司',
    settlementType: 'normal',
    status: 'completed',
    paymentStatus: 'paid',
    currency: 'CNY',
    items: [
      {
        id: 'SI001',
        orderId: 'O001',
        orderCode: 'PO-2024-001',
        productName: '5G通信模块',
        productSpec: 'MH5000-31',
        quantity: 1000,
        unitPrice: 1280,
        amount: 1280000,
        taxRate: 0.13,
        taxAmount: 166400,
        totalAmount: 1446400,
        remark: ''
      }
    ],
    totalAmount: 1280000,
    totalTaxAmount: 166400,
    grandTotal: 1446400,
    paidAmount: 1446400,
    unpaidAmount: 0,
    creditPeriod: 30,
    creditStartDate: '2024-01-20',
    creditDueDate: '2024-02-19',
    dueDate: '2024-02-19',
    actualPaymentDate: '2024-02-15',
    invoices: [
      {
        id: 'INV001',
        invoiceNo: '240100123456',
        invoiceType: 'special',
        invoiceDate: '2024-01-22',
        invoiceAmount: 1280000,
        taxAmount: 166400,
        totalAmount: 1446400,
        status: 'verified',
        issuedBy: '深圳华为技术有限公司',
        receivedDate: '2024-01-25',
        verifiedDate: '2024-01-26',
        remark: ''
      }
    ],
    paymentPlans: [
      {
        id: 'PP001',
        paymentType: 'prepayment',
        paymentName: '预付款30%',
        dueDate: '2024-01-18',
        dueAmount: 433920,
        actualDate: '2024-01-18',
        actualAmount: 433920,
        status: 'paid',
        voucherNo: 'PAY202401001',
        remark: ''
      },
      {
        id: 'PP002',
        paymentType: 'final',
        paymentName: '尾款70%',
        dueDate: '2024-02-19',
        dueAmount: 1012480,
        actualDate: '2024-02-15',
        actualAmount: 1012480,
        status: 'paid',
        voucherNo: 'PAY202402001',
        remark: '提前4天付款'
      }
    ],
    hasDeduction: false,
    deductionAmount: 0,
    operatorId: 'U002',
    operatorName: '李采购',
    accountantId: 'U004',
    accountantName: '赵财务',
    managerId: 'U003',
    managerName: '张经理',
    settlementDate: '2024-02-15',
    remark: '已全部结清',
    attachments: ['settlement_report_001.pdf', 'invoice_001.pdf', 'payment_voucher_001.pdf'],
    createdAt: '2024-01-25T09:00:00Z',
    updatedAt: '2024-02-15T16:00:00Z'
  },
  {
    id: 'SET002',
    code: 'SET-2024-002',
    supplierId: 'S004',
    supplierName: '德国西门子股份公司',
    settlementType: 'return',
    status: 'completed',
    paymentStatus: 'paid',
    currency: 'EUR',
    exchangeRate: 7.85,
    items: [
      {
        id: 'SI002',
        orderId: 'O002',
        orderCode: 'PO-2024-002',
        productName: 'S7-1500 PLC控制器',
        productSpec: '6ES7511-1AK02-0AB0',
        quantity: 48,
        unitPrice: 1250,
        amount: 60000,
        taxRate: 0.13,
        taxAmount: 7800,
        totalAmount: 67800,
        remark: '原订单50台，退回2台损坏设备'
      }
    ],
    totalAmount: 60000,
    totalTaxAmount: 7800,
    grandTotal: 67800,
    paidAmount: 67800,
    unpaidAmount: 0,
    creditPeriod: 60,
    creditStartDate: '2024-02-15',
    creditDueDate: '2024-04-15',
    dueDate: '2024-04-15',
    actualPaymentDate: '2024-04-10',
    invoices: [
      {
        id: 'INV002',
        invoiceNo: 'DE-2024-00123',
        invoiceType: 'electronic',
        invoiceDate: '2024-02-20',
        invoiceAmount: 60000,
        taxAmount: 7800,
        totalAmount: 67800,
        status: 'verified',
        issuedBy: 'Siemens AG',
        receivedDate: '2024-02-22',
        verifiedDate: '2024-02-23',
        remark: '已扣减退回2台的金额'
      }
    ],
    paymentPlans: [
      {
        id: 'PP003',
        paymentType: 'final',
        paymentName: '100%货款（扣除退货）',
        dueDate: '2024-04-15',
        dueAmount: 67800,
        actualDate: '2024-04-10',
        actualAmount: 67800,
        status: 'paid',
        voucherNo: 'PAY202404001',
        remark: ''
      }
    ],
    hasDeduction: true,
    deductionAmount: 2500,
    deductionReason: '退回2台损坏设备，扣款€2500',
    operatorId: 'U002',
    operatorName: '李采购',
    accountantId: 'U004',
    accountantName: '赵财务',
    managerId: 'U003',
    managerName: '张经理',
    settlementDate: '2024-04-10',
    remark: '退货处理完成，已按实际收货结算',
    attachments: ['settlement_report_002.pdf', 'return_proof_002.pdf', 'invoice_002.pdf'],
    createdAt: '2024-02-25T10:00:00Z',
    updatedAt: '2024-04-10T15:00:00Z'
  },
  {
    id: 'SET003',
    code: 'SET-2024-003',
    supplierId: 'S005',
    supplierName: '日本三菱电机株式会社',
    settlementType: 'normal',
    status: 'completed',
    paymentStatus: 'paid',
    currency: 'JPY',
    exchangeRate: 0.048,
    items: [
      {
        id: 'SI003',
        orderId: 'O003',
        orderCode: 'PO-2024-003',
        productName: 'MR-J4伺服驱动器',
        productSpec: 'MR-J4-100B',
        quantity: 100,
        unitPrice: 125000,
        amount: 12500000,
        taxRate: 0.13,
        taxAmount: 1625000,
        totalAmount: 14125000,
        remark: ''
      }
    ],
    totalAmount: 12500000,
    totalTaxAmount: 1625000,
    grandTotal: 14125000,
    paidAmount: 14125000,
    unpaidAmount: 0,
    creditPeriod: 45,
    creditStartDate: '2024-03-10',
    creditDueDate: '2024-04-24',
    dueDate: '2024-04-24',
    actualPaymentDate: '2024-04-20',
    invoices: [
      {
        id: 'INV003',
        invoiceNo: 'JP-2024-00456',
        invoiceType: 'electronic',
        invoiceDate: '2024-03-12',
        invoiceAmount: 12500000,
        taxAmount: 1625000,
        totalAmount: 14125000,
        status: 'verified',
        issuedBy: 'Mitsubishi Electric',
        receivedDate: '2024-03-15',
        verifiedDate: '2024-03-16',
        remark: ''
      }
    ],
    paymentPlans: [
      {
        id: 'PP004',
        paymentType: 'prepayment',
        paymentName: '预付款30%',
        dueDate: '2024-03-08',
        dueAmount: 4237500,
        actualDate: '2024-03-08',
        actualAmount: 4237500,
        status: 'paid',
        voucherNo: 'PAY202403001',
        remark: ''
      },
      {
        id: 'PP005',
        paymentType: 'final',
        paymentName: '尾款70%',
        dueDate: '2024-04-24',
        dueAmount: 9887500,
        actualDate: '2024-04-20',
        actualAmount: 9887500,
        status: 'paid',
        voucherNo: 'PAY202404002',
        remark: ''
      }
    ],
    hasDeduction: false,
    deductionAmount: 0,
    operatorId: 'U002',
    operatorName: '李采购',
    accountantId: 'U004',
    accountantName: '赵财务',
    managerId: 'U003',
    managerName: '张经理',
    settlementDate: '2024-04-20',
    remark: '已全部结清',
    attachments: ['settlement_report_003.pdf', 'invoice_003.pdf'],
    createdAt: '2024-03-15T09:00:00Z',
    updatedAt: '2024-04-20T14:00:00Z'
  },
  {
    id: 'SET004',
    code: 'SET-2024-004',
    supplierId: 'S012',
    supplierName: '鞍钢股份有限公司',
    settlementType: 'discount',
    status: 'completed',
    paymentStatus: 'paid',
    currency: 'CNY',
    items: [
      {
        id: 'SI004',
        orderId: 'O006',
        orderCode: 'PO-2024-006',
        productName: '冷轧钢板',
        productSpec: '1.5mm×1250mm×2500mm',
        quantity: 497,
        unitPrice: 780,
        amount: 387660,
        taxRate: 0.13,
        taxAmount: 50395.8,
        totalAmount: 438055.8,
        remark: '原500张，3张不合格按8折计算'
      }
    ],
    totalAmount: 387660,
    totalTaxAmount: 50395.8,
    grandTotal: 438055.8,
    paidAmount: 438055.8,
    unpaidAmount: 0,
    creditPeriod: 30,
    creditStartDate: '2024-04-05',
    creditDueDate: '2024-05-05',
    dueDate: '2024-05-05',
    actualPaymentDate: '2024-05-02',
    invoices: [
      {
        id: 'INV004',
        invoiceNo: '240400123789',
        invoiceType: 'special',
        invoiceDate: '2024-04-08',
        invoiceAmount: 387660,
        taxAmount: 50395.8,
        totalAmount: 438055.8,
        status: 'verified',
        issuedBy: '鞍钢股份有限公司',
        receivedDate: '2024-04-10',
        verifiedDate: '2024-04-11',
        remark: '已扣除3张不合格品的折扣金额'
      }
    ],
    paymentPlans: [
      {
        id: 'PP006',
        paymentType: 'final',
        paymentName: '100%货款（含质量扣款）',
        dueDate: '2024-05-05',
        dueAmount: 438055.8,
        actualDate: '2024-05-02',
        actualAmount: 438055.8,
        status: 'paid',
        voucherNo: 'PAY202405001',
        remark: ''
      }
    ],
    hasDeduction: true,
    deductionAmount: 468,
    deductionReason: '3张钢板厚度不合格，按8折计价，扣款468元',
    operatorId: 'U002',
    operatorName: '李采购',
    accountantId: 'U004',
    accountantName: '赵财务',
    managerId: 'U003',
    managerName: '张经理',
    settlementDate: '2024-05-02',
    remark: '质量扣款处理完成，已结算',
    attachments: ['settlement_report_004.pdf', 'quality_report_004.pdf', 'invoice_004.pdf'],
    createdAt: '2024-04-10T10:00:00Z',
    updatedAt: '2024-05-02T16:00:00Z'
  },
  {
    id: 'SET005',
    code: 'SET-2024-005',
    supplierId: 'S014',
    supplierName: '瑞士ABB集团',
    settlementType: 'normal',
    status: 'verifying',
    paymentStatus: 'unpaid',
    currency: 'CHF',
    exchangeRate: 8.2,
    items: [
      {
        id: 'SI005',
        orderId: 'O007',
        orderCode: 'PO-2024-007',
        productName: '工业机器人',
        productSpec: 'IRB 6700-200/2.6',
        quantity: 5,
        unitPrice: 75000,
        amount: 375000,
        taxRate: 0.13,
        taxAmount: 48750,
        totalAmount: 423750,
        remark: ''
      }
    ],
    totalAmount: 375000,
    totalTaxAmount: 48750,
    grandTotal: 423750,
    paidAmount: 127125,
    unpaidAmount: 296625,
    creditPeriod: 90,
    creditStartDate: '2024-05-15',
    creditDueDate: '2024-08-13',
    dueDate: '2024-08-13',
    invoices: [
      {
        id: 'INV005',
        invoiceNo: 'CH-2024-00789',
        invoiceType: 'electronic',
        invoiceDate: '2024-05-18',
        invoiceAmount: 375000,
        taxAmount: 48750,
        totalAmount: 423750,
        status: 'received',
        issuedBy: 'ABB Ltd',
        receivedDate: '2024-05-20',
        remark: ''
      }
    ],
    paymentPlans: [
      {
        id: 'PP007',
        paymentType: 'prepayment',
        paymentName: '预付款30%',
        dueDate: '2024-05-13',
        dueAmount: 127125,
        actualDate: '2024-05-13',
        actualAmount: 127125,
        status: 'paid',
        voucherNo: 'PAY202405001',
        remark: ''
      },
      {
        id: 'PP008',
        paymentType: 'progress',
        paymentName: '到货款60%',
        dueDate: '2024-06-15',
        dueAmount: 254250,
        status: 'pending',
        remark: ''
      },
      {
        id: 'PP009',
        paymentType: 'final',
        paymentName: '质保金10%',
        dueDate: '2024-11-15',
        dueAmount: 42375,
        status: 'pending',
        remark: ''
      }
    ],
    hasDeduction: false,
    deductionAmount: 0,
    operatorId: 'U002',
    operatorName: '李采购',
    accountantId: 'U004',
    accountantName: '赵财务',
    remark: '对账中，等待财务审核',
    attachments: ['settlement_report_005.pdf', 'invoice_005.pdf'],
    createdAt: '2024-05-20T09:00:00Z',
    updatedAt: '2024-06-01T10:00:00Z'
  },
  {
    id: 'SET006',
    code: 'SET-2024-006',
    supplierId: 'S001',
    supplierName: '深圳华为技术有限公司',
    settlementType: 'normal',
    status: 'completed',
    paymentStatus: 'paid',
    currency: 'CNY',
    items: [
      {
        id: 'SI006',
        orderId: 'O008',
        orderCode: 'PO-2024-008',
        productName: '办公打印耗材',
        productSpec: 'HP LaserJet Pro',
        quantity: 200,
        unitPrice: 120,
        amount: 24000,
        taxRate: 0.13,
        taxAmount: 3120,
        totalAmount: 27120,
        remark: ''
      }
    ],
    totalAmount: 24000,
    totalTaxAmount: 3120,
    grandTotal: 27120,
    paidAmount: 27120,
    unpaidAmount: 0,
    creditPeriod: 15,
    creditStartDate: '2024-05-20',
    creditDueDate: '2024-06-04',
    dueDate: '2024-06-04',
    actualPaymentDate: '2024-06-03',
    invoices: [
      {
        id: 'INV006',
        invoiceNo: '240500123456',
        invoiceType: 'electronic',
        invoiceDate: '2024-05-22',
        invoiceAmount: 24000,
        taxAmount: 3120,
        totalAmount: 27120,
        status: 'verified',
        issuedBy: '深圳华为技术有限公司',
        receivedDate: '2024-05-23',
        verifiedDate: '2024-05-24',
        remark: ''
      }
    ],
    paymentPlans: [
      {
        id: 'PP010',
        paymentType: 'final',
        paymentName: '100%货款',
        dueDate: '2024-06-04',
        dueAmount: 27120,
        actualDate: '2024-06-03',
        actualAmount: 27120,
        status: 'paid',
        voucherNo: 'PAY202406001',
        remark: '小额采购，一次性付款'
      }
    ],
    hasDeduction: false,
    deductionAmount: 0,
    operatorId: 'U002',
    operatorName: '李采购',
    accountantId: 'U004',
    accountantName: '赵财务',
    managerId: 'U003',
    managerName: '张经理',
    settlementDate: '2024-06-03',
    remark: '小额采购，已结清',
    attachments: ['settlement_report_006.pdf', 'invoice_006.pdf'],
    createdAt: '2024-05-23T10:00:00Z',
    updatedAt: '2024-06-03T15:00:00Z'
  },
  {
    id: 'SET007',
    code: 'SET-2024-007',
    supplierId: 'S007',
    supplierName: '韩国三星电子',
    settlementType: 'normal',
    status: 'accounting',
    paymentStatus: 'unpaid',
    currency: 'USD',
    exchangeRate: 7.25,
    items: [
      {
        id: 'SI007',
        orderId: 'O009',
        orderCode: 'PO-2024-009',
        productName: 'DDR4服务器内存条',
        productSpec: '32GB DDR4-3200 ECC',
        quantity: 500,
        unitPrice: 280,
        amount: 140000,
        taxRate: 0.13,
        taxAmount: 18200,
        totalAmount: 158200,
        remark: ''
      }
    ],
    totalAmount: 140000,
    totalTaxAmount: 18200,
    grandTotal: 158200,
    paidAmount: 47460,
    unpaidAmount: 110740,
    creditPeriod: 60,
    creditStartDate: '2024-06-10',
    creditDueDate: '2024-08-09',
    dueDate: '2024-08-09',
    invoices: [
      {
        id: 'INV007',
        invoiceNo: 'KR-2024-00123',
        invoiceType: 'electronic',
        invoiceDate: '2024-06-12',
        invoiceAmount: 140000,
        taxAmount: 18200,
        totalAmount: 158200,
        status: 'verified',
        issuedBy: 'Samsung Electronics',
        receivedDate: '2024-06-13',
        verifiedDate: '2024-06-14',
        remark: ''
      }
    ],
    paymentPlans: [
      {
        id: 'PP011',
        paymentType: 'prepayment',
        paymentName: '预付款30%',
        dueDate: '2024-06-08',
        dueAmount: 47460,
        actualDate: '2024-06-08',
        actualAmount: 47460,
        status: 'paid',
        voucherNo: 'PAY202406002',
        remark: ''
      },
      {
        id: 'PP012',
        paymentType: 'final',
        paymentName: '尾款70%',
        dueDate: '2024-08-09',
        dueAmount: 110740,
        status: 'pending',
        remark: ''
      }
    ],
    hasDeduction: false,
    deductionAmount: 0,
    operatorId: 'U002',
    operatorName: '李采购',
    accountantId: 'U004',
    accountantName: '赵财务',
    managerId: 'U003',
    managerName: '张经理',
    remark: '财务记账中',
    attachments: ['settlement_report_007.pdf', 'invoice_007.pdf'],
    createdAt: '2024-06-13T09:00:00Z',
    updatedAt: '2024-06-20T14:00:00Z'
  },
  {
    id: 'SET008',
    code: 'SET-2024-008',
    supplierId: 'S003',
    supplierName: '沈阳机床股份有限公司',
    settlementType: 'return',
    status: 'verifying',
    paymentStatus: 'unpaid',
    currency: 'CNY',
    items: [
      {
        id: 'SI008',
        orderId: 'O010',
        orderCode: 'PO-2024-010',
        productName: 'VMC850立式加工中心',
        productSpec: 'VMC850E',
        quantity: 1,
        unitPrice: 580000,
        amount: 580000,
        taxRate: 0.13,
        taxAmount: 75400,
        totalAmount: 655400,
        remark: '原订单2台，1台精度不合格待返修'
      }
    ],
    totalAmount: 580000,
    totalTaxAmount: 75400,
    grandTotal: 655400,
    paidAmount: 196620,
    unpaidAmount: 458780,
    creditPeriod: 90,
    creditStartDate: '2024-06-15',
    creditDueDate: '2024-09-13',
    dueDate: '2024-09-13',
    invoices: [
      {
        id: 'INV008',
        invoiceNo: '240600123456',
        invoiceType: 'special',
        invoiceDate: '2024-06-18',
        invoiceAmount: 580000,
        taxAmount: 75400,
        totalAmount: 655400,
        status: 'received',
        issuedBy: '沈阳机床股份有限公司',
        receivedDate: '2024-06-20',
        remark: '待返修完成后重新确认'
      }
    ],
    paymentPlans: [
      {
        id: 'PP013',
        paymentType: 'prepayment',
        paymentName: '预付款30%',
        dueDate: '2024-06-13',
        dueAmount: 196620,
        actualDate: '2024-06-13',
        actualAmount: 196620,
        status: 'paid',
        voucherNo: 'PAY202406003',
        remark: ''
      },
      {
        id: 'PP014',
        paymentType: 'final',
        paymentName: '尾款70%（待返修完成）',
        dueDate: '2024-09-13',
        dueAmount: 458780,
        status: 'pending',
        remark: '1台设备返修中，待验收合格后支付'
      }
    ],
    hasDeduction: true,
    deductionAmount: 580000,
    deductionReason: '1台设备精度不合格，暂不支付，待返修完成验收合格后结算',
    operatorId: 'U002',
    operatorName: '李采购',
    accountantId: 'U004',
    accountantName: '赵财务',
    remark: '退货返修处理中，对账审核中',
    attachments: ['settlement_report_008.pdf', 'quality_report_008.pdf', 'return_agreement_008.pdf'],
    createdAt: '2024-06-20T10:00:00Z',
    updatedAt: '2024-06-28T16:00:00Z'
  },
  {
    id: 'SET009',
    code: 'SET-2024-009',
    supplierId: 'S010',
    supplierName: '武汉凡谷电子技术股份有限公司',
    settlementType: 'normal',
    status: 'accounting',
    paymentStatus: 'unpaid',
    currency: 'CNY',
    items: [
      {
        id: 'SI009',
        orderId: 'O013',
        orderCode: 'PO-2024-013',
        productName: '电子元件套装',
        productSpec: 'RES-CAP-001',
        quantity: 10000,
        unitPrice: 4.55,
        amount: 45500,
        taxRate: 0.13,
        taxAmount: 5915,
        totalAmount: 51415,
        remark: ''
      }
    ],
    totalAmount: 45500,
    totalTaxAmount: 5915,
    grandTotal: 51415,
    paidAmount: 0,
    unpaidAmount: 51415,
    creditPeriod: 30,
    creditStartDate: '2024-07-05',
    creditDueDate: '2024-08-04',
    dueDate: '2024-08-04',
    invoices: [
      {
        id: 'INV009',
        invoiceNo: '240700123456',
        invoiceType: 'special',
        invoiceDate: '2024-07-08',
        invoiceAmount: 45500,
        taxAmount: 5915,
        totalAmount: 51415,
        status: 'received',
        issuedBy: '武汉凡谷电子技术股份有限公司',
        receivedDate: '2024-07-10',
        remark: ''
      }
    ],
    paymentPlans: [
      {
        id: 'PP015',
        paymentType: 'final',
        paymentName: '100%货款',
        dueDate: '2024-08-04',
        dueAmount: 51415,
        status: 'pending',
        remark: ''
      }
    ],
    hasDeduction: false,
    deductionAmount: 0,
    operatorId: 'U002',
    operatorName: '李采购',
    accountantId: 'U004',
    accountantName: '赵财务',
    remark: '财务记账中',
    attachments: ['settlement_report_009.pdf', 'invoice_009.pdf'],
    createdAt: '2024-07-10T09:00:00Z',
    updatedAt: '2024-07-15T10:00:00Z'
  },
  {
    id: 'SET010',
    code: 'SET-2024-010',
    supplierId: 'S020',
    supplierName: '华为数字能源技术有限公司',
    settlementType: 'normal',
    status: 'draft',
    paymentStatus: 'unpaid',
    currency: 'CNY',
    items: [
      {
        id: 'SI010',
        orderId: 'O015',
        orderCode: 'PO-2024-015',
        productName: '智能光伏逆变器',
        productSpec: 'SUN2000-100KTL-M1',
        quantity: 10,
        unitPrice: 280000,
        amount: 2800000,
        taxRate: 0.13,
        taxAmount: 364000,
        totalAmount: 3164000,
        remark: ''
      }
    ],
    totalAmount: 2800000,
    totalTaxAmount: 364000,
    grandTotal: 3164000,
    paidAmount: 949200,
    unpaidAmount: 2214800,
    creditPeriod: 90,
    creditStartDate: '2024-07-20',
    creditDueDate: '2024-10-18',
    dueDate: '2024-10-18',
    invoices: [
      {
        id: 'INV010',
        invoiceNo: '240700123789',
        invoiceType: 'special',
        invoiceDate: '2024-07-22',
        invoiceAmount: 2800000,
        taxAmount: 364000,
        totalAmount: 3164000,
        status: 'pending',
        issuedBy: '华为数字能源技术有限公司',
        remark: '待开票'
      }
    ],
    paymentPlans: [
      {
        id: 'PP016',
        paymentType: 'prepayment',
        paymentName: '预付款30%',
        dueDate: '2024-07-18',
        dueAmount: 949200,
        actualDate: '2024-07-18',
        actualAmount: 949200,
        status: 'paid',
        voucherNo: 'PAY202407001',
        remark: ''
      },
      {
        id: 'PP017',
        paymentType: 'progress',
        paymentName: '到货款60%',
        dueDate: '2024-08-20',
        dueAmount: 1898400,
        status: 'pending',
        remark: ''
      },
      {
        id: 'PP018',
        paymentType: 'final',
        paymentName: '质保金10%',
        dueDate: '2025-01-20',
        dueAmount: 316400,
        status: 'pending',
        remark: ''
      }
    ],
    hasDeduction: false,
    deductionAmount: 0,
    operatorId: 'U002',
    operatorName: '李采购',
    remark: '待供应商开票后发起对账',
    attachments: ['settlement_report_010.pdf'],
    createdAt: '2024-07-20T09:00:00Z',
    updatedAt: '2024-07-22T10:00:00Z'
  }
];

export const settlementData = settlement;
export default settlement;
