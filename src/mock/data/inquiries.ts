export interface QuoteItem {
  productName: string;
  productSpec: string;
  quantity: number;
  unit: string;
  targetPrice: number;
  currency: string;
}

export interface Quote {
  id: string;
  supplierId: string;
  supplierName: string;
  quoteItems: {
    productName: string;
    productSpec: string;
    quantity: number;
    unit: string;
    unitPrice: number;
    totalPrice: number;
    currency: string;
    deliveryTime: number;
  }[];
  totalAmount: number;
  deliveryDate: string;
  paymentTerms: string;
  warrantyPeriod: string;
  quoteDate: string;
  status: 'submitted' | 'negotiating' | 'accepted' | 'rejected';
  remarks: string;
}

export interface NegotiationRecord {
  id: string;
  quoteId?: string;
  round: number;
  operatorId: string;
  operatorName: string;
  content: string;
  proposedPrice: number;
  timestamp: string;
}

export interface Inquiry {
  id: string;
  code: string;
  title: string;
  category: string;
  subCategory: string;
  requesterId: string;
  requesterName: string;
  department: string;
  items: QuoteItem[];
  totalTargetAmount: number;
  currency: string;
  deliveryAddress: string;
  requiredDate: string;
  quotationDeadline: string;
  status: 'draft' | 'published' | 'quoting' | 'negotiating' | 'completed' | 'cancelled';
  statusName: string;
  quotes: Quote[];
  negotiations: NegotiationRecord[];
  negotiationRecords?: NegotiationRecord[];
  selectedSupplierId: string;
  selectedSupplierName: string;
  selectedQuoteId?: string;
  finalAmount: number;
  createdAt: string;
  updatedAt: string;
  publishedAt?: string;
  approvedBy: string;
  approvedAt: string;
  remarks: string;
  attachments: string[];
}

export const inquiries: Inquiry[] = [
  {
    id: 'I001',
    code: 'INQ-2024-0001',
    title: '工业控制芯片采购项目',
    category: '电子元器件',
    subCategory: '芯片/集成电路',
    requesterId: 'U002',
    requesterName: '李明华',
    department: '采购部',
    items: [
      {
        productName: 'STM32F103ZET6',
        productSpec: 'ARM Cortex-M3 72MHz 512KB',
        quantity: 5000,
        unit: '个',
        targetPrice: 45,
        currency: 'CNY',
      },
      {
        productName: 'STM32F407VET6',
        productSpec: 'ARM Cortex-M4 168MHz 512KB',
        quantity: 3000,
        unit: '个',
        targetPrice: 68,
        currency: 'CNY',
      },
    ],
    totalTargetAmount: 429000,
    currency: 'CNY',
    deliveryAddress: '上海市浦东新区张江高科技园区',
    requiredDate: '2024-02-28',
    quotationDeadline: '2024-01-20',
    status: 'completed',
    statusName: '已完成',
    quotes: [
      {
        id: 'Q001',
        supplierId: 'S001',
        supplierName: '深圳华为技术有限公司',
        quoteItems: [
          { productName: 'STM32F103ZET6', productSpec: 'ARM Cortex-M3 72MHz 512KB', quantity: 5000, unit: '个', unitPrice: 42, totalPrice: 210000, currency: 'CNY', deliveryTime: 15 },
          { productName: 'STM32F407VET6', productSpec: 'ARM Cortex-M4 168MHz 512KB', quantity: 3000, unit: '个', unitPrice: 65, totalPrice: 195000, currency: 'CNY', deliveryTime: 15 },
        ],
        totalAmount: 405000,
        deliveryDate: '2024-02-10',
        paymentTerms: 'T/T 60天',
        warrantyPeriod: '24个月',
        quoteDate: '2024-01-18',
        status: 'accepted',
        remarks: '报价合理，交期可接受',
      },
      {
        id: 'Q002',
        supplierId: 'S004',
        supplierName: '意法半导体',
        quoteItems: [
          { productName: 'STM32F103ZET6', productSpec: 'ARM Cortex-M3 72MHz 512KB', quantity: 5000, unit: '个', unitPrice: 44, totalPrice: 220000, currency: 'CNY', deliveryTime: 20 },
          { productName: 'STM32F407VET6', productSpec: 'ARM Cortex-M4 168MHz 512KB', quantity: 3000, unit: '个', unitPrice: 67, totalPrice: 201000, currency: 'CNY', deliveryTime: 20 },
        ],
        totalAmount: 421000,
        deliveryDate: '2024-02-15',
        paymentTerms: 'L/C 90天',
        warrantyPeriod: '18个月',
        quoteDate: '2024-01-17',
        status: 'rejected',
        remarks: '价格偏高，交期较长',
      },
    ],
    negotiations: [
      {
        id: 'N001',
        round: 1,
        operatorId: 'U002',
        operatorName: '李明华',
        content: '请贵司考虑一下我们的目标价格，能否再降低一些？我们的目标价是429,000',
        proposedPrice: 429000,
        timestamp: '2024-01-18T10:30:00Z',
      },
      {
        id: 'N002',
        round: 2,
        operatorId: 'S001',
        operatorName: '张伟',
        content: '考虑到长期合作，我们可以给到415,000，这已经是我们的底价了',
        proposedPrice: 415000,
        timestamp: '2024-01-18T14:20:00Z',
      },
      {
        id: 'N003',
        round: 3,
        operatorId: 'U003',
        operatorName: '王芳',
        content: '同意这个价格，确认合作',
        proposedPrice: 415000,
        timestamp: '2024-01-19T09:00:00Z',
      },
    ],
    selectedSupplierId: 'S001',
    selectedSupplierName: '深圳华为技术有限公司',
    finalAmount: 415000,
    createdAt: '2024-01-10T00:00:00Z',
    updatedAt: '2024-01-19T10:00:00Z',
    approvedBy: '王芳',
    approvedAt: '2024-01-19T10:00:00Z',
    remarks: '首次与华为合作，价格经过三轮议价，最终成交',
    attachments: ['技术规格书.pdf', '需求说明书.docx'],
  },
  {
    id: 'I002',
    code: 'INQ-2024-0002',
    title: 'PLC控制器年度采购项目',
    category: '机械设备',
    subCategory: '工业自动化设备',
    requesterId: 'U002',
    requesterName: '李明华',
    department: '采购部',
    items: [
      {
        productName: 'S7-1500 PLC控制器',
        productSpec: 'Siemens S7-1517F-3 PN/DP',
        quantity: 50,
        unit: '台',
        targetPrice: 18000,
        currency: 'CNY',
      },
    ],
    totalTargetAmount: 900000,
    currency: 'CNY',
    deliveryAddress: '苏州市工业园区',
    requiredDate: '2024-03-15',
    quotationDeadline: '2024-02-05',
    status: 'negotiating',
    statusName: '议价中',
    quotes: [
      {
        id: 'Q003',
        supplierId: 'S002',
        supplierName: '西门子（中国）有限公司',
        quoteItems: [
          { productName: 'S7-1500 PLC控制器', productSpec: 'Siemens S7-1517F-3 PN/DP', quantity: 50, unit: '台', unitPrice: 17500, totalPrice: 875000, currency: 'CNY', deliveryTime: 30 },
        ],
        totalAmount: 875000,
        deliveryDate: '2024-02-25',
        paymentTerms: 'T/T 90天',
        warrantyPeriod: '24个月',
        quoteDate: '2024-01-28',
        status: 'negotiating',
        remarks: '',
      },
    ],
    negotiations: [
      {
        id: 'N004',
        round: 1,
        operatorId: 'U002',
        operatorName: '李明华',
        content: '希望价格能再优惠3%，采购量后续还有增加',
        proposedPrice: 848750,
        timestamp: '2024-01-29T11:00:00Z',
      },
    ],
    selectedSupplierId: '',
    selectedSupplierName: '',
    finalAmount: 0,
    createdAt: '2024-01-20T00:00:00Z',
    updatedAt: '2024-01-29T15:00:00Z',
    approvedBy: '',
    approvedAt: '',
    remarks: '生产线扩建项目，后续还有采购',
    attachments: ['PLC技术参数.pdf'],
  },
  {
    id: 'I003',
    code: 'INQ-2024-0003',
    title: '工业机器人采购项目',
    category: '机械设备',
    subCategory: '工业机器人',
    requesterId: 'U002',
    requesterName: '李明华',
    department: '采购部',
    items: [
      {
        productName: '六轴工业机器人',
        productSpec: '负载20kg 臂展1800mm',
        quantity: 10,
        unit: '台',
        targetPrice: 280000,
        currency: 'CNY',
      },
    ],
    totalTargetAmount: 2800000,
    currency: 'CNY',
    deliveryAddress: '杭州市萧山区经济技术开发区',
    requiredDate: '2024-04-01',
    quotationDeadline: '2024-02-15',
    status: 'quoting',
    statusName: '报价中',
    quotes: [
      {
        id: 'Q004',
        supplierId: 'S012',
        supplierName: 'ABB集团',
        quoteItems: [
          { productName: 'IRB 6700', productSpec: '负载20kg 臂展2.55m', quantity: 10, unit: '台', unitPrice: 320000, totalPrice: 3200000, currency: 'CNY', deliveryTime: 60 },
        ],
        totalAmount: 3200000,
        deliveryDate: '2024-03-20',
        paymentTerms: 'L/C 120天',
        warrantyPeriod: '36个月',
        quoteDate: '2024-02-01',
        status: 'submitted',
        remarks: '高端型号，性能优异',
      },
      {
        id: 'Q005',
        supplierId: 'S010',
        supplierName: '三菱电机',
        quoteItems: [
          { productName: 'MELFA RV-20FR', productSpec: '负载20kg 臂展1.85m', quantity: 10, unit: '台', unitPrice: 290000, totalPrice: 2900000, currency: 'CNY', deliveryTime: 45 },
        ],
        totalAmount: 2900000,
        deliveryDate: '2024-03-10',
        paymentTerms: 'T/T 90天',
        warrantyPeriod: '24个月',
        quoteDate: '2024-02-02',
        status: 'submitted',
        remarks: '性价比高',
      },
    ],
    negotiations: [],
    selectedSupplierId: '',
    selectedSupplierName: '',
    finalAmount: 0,
    createdAt: '2024-01-25T00:00:00Z',
    updatedAt: '2024-02-02T18:00:00Z',
    approvedBy: '',
    approvedAt: '',
    remarks: '新生产线自动化升级项目',
    attachments: ['机器人技术要求.pdf', '现场布局图.dwg'],
  },
  {
    id: 'I004',
    code: 'INQ-2024-0004',
    title: '特种钢材采购项目',
    category: '原材料',
    subCategory: '钢材',
    requesterId: 'U002',
    requesterName: '李明华',
    department: '采购部',
    items: [
      {
        productName: '不锈钢板材 316L',
        productSpec: '3mm x 1220mm x 2440mm',
        quantity: 500,
        unit: '张',
        targetPrice: 1200,
        currency: 'CNY',
      },
    ],
    totalTargetAmount: 600000,
    currency: 'CNY',
    deliveryAddress: '宁波市镇海区',
    requiredDate: '2024-02-20',
    quotationDeadline: '2024-01-25',
    status: 'published',
    statusName: '已发布',
    quotes: [],
    negotiations: [],
    selectedSupplierId: '',
    selectedSupplierName: '',
    finalAmount: 0,
    createdAt: '2024-01-20T00:00:00Z',
    updatedAt: '2024-01-20T00:00:00Z',
    approvedBy: '',
    approvedAt: '',
    remarks: '食品设备制造用',
    attachments: ['材质标准.pdf'],
  },
  {
    id: 'I005',
    code: 'INQ-2024-0005',
    title: '图像传感器批量采购',
    category: '电子元器件',
    subCategory: '图像传感器',
    requesterId: 'U002',
    requesterName: '李明华',
    department: '采购部',
    items: [
      {
        productName: '12MP CMOS图像传感器',
        productSpec: 'Sony IMX577',
        quantity: 10000,
        unit: '个',
        targetPrice: 128,
        currency: 'CNY',
      },
    ],
    totalTargetAmount: 1280000,
    currency: 'CNY',
    deliveryAddress: '深圳市南山区',
    requiredDate: '2024-03-01',
    quotationDeadline: '2024-02-10',
    status: 'completed',
    statusName: '已完成',
    quotes: [
      {
        id: 'Q006',
        supplierId: 'S004',
        supplierName: '索尼集团',
        quoteItems: [
          { productName: '12MP CMOS图像传感器', productSpec: 'Sony IMX577', quantity: 10000, unit: '个', unitPrice: 125, totalPrice: 1250000, currency: 'CNY', deliveryTime: 25 },
        ],
        totalAmount: 1250000,
        deliveryDate: '2024-02-25',
        paymentTerms: 'T/T 75天',
        warrantyPeriod: '18个月',
        quoteDate: '2024-02-05',
        status: 'accepted',
        remarks: '原厂直供，品质保证',
      },
    ],
    negotiations: [],
    selectedSupplierId: 'S004',
    selectedSupplierName: '索尼集团',
    finalAmount: 1250000,
    createdAt: '2024-01-28T00:00:00Z',
    updatedAt: '2024-02-08T10:00:00Z',
    approvedBy: '王芳',
    approvedAt: '2024-02-08T10:00:00Z',
    remarks: '摄像头模组生产用',
    attachments: ['传感器规格书.pdf'],
  },
  {
    id: 'I006',
    code: 'INQ-2024-0006',
    title: '功率半导体器件采购',
    category: '电子元器件',
    subCategory: '功率半导体',
    requesterId: 'U002',
    requesterName: '李明华',
    department: '采购部',
    items: [
      {
        productName: 'IGBT模块',
        productSpec: 'Infineon FF450R12ME4',
        quantity: 200,
        unit: '个',
        targetPrice: 2500,
        currency: 'CNY',
      },
    ],
    totalTargetAmount: 500000,
    currency: 'CNY',
    deliveryAddress: '东莞市松山湖产业园',
    requiredDate: '2024-03-10',
    quotationDeadline: '2024-02-20',
    status: 'quoting',
    statusName: '报价中',
    quotes: [
      {
        id: 'Q007',
        supplierId: 'S008',
        supplierName: '英飞凌科技',
        quoteItems: [
          { productName: 'IGBT模块', productSpec: 'Infineon FF450R12ME4', quantity: 200, unit: '个', unitPrice: 2450, totalPrice: 490000, currency: 'CNY', deliveryTime: 20 },
        ],
        totalAmount: 490000,
        deliveryDate: '2024-02-28',
        paymentTerms: 'T/T 75天',
        warrantyPeriod: '24个月',
        quoteDate: '2024-02-12',
        status: 'submitted',
        remarks: '',
      },
    ],
    negotiations: [],
    selectedSupplierId: '',
    selectedSupplierName: '',
    finalAmount: 0,
    createdAt: '2024-02-01T00:00:00Z',
    updatedAt: '2024-02-12T12:00:00Z',
    approvedBy: '',
    approvedAt: '',
    remarks: '新能源汽车逆变器用',
    attachments: ['IGBT参数要求.pdf'],
  },
  {
    id: 'I007',
    code: 'INQ-2024-0007',
    title: '无缝钢管采购项目',
    category: '原材料',
    subCategory: '无缝钢管',
    requesterId: 'U002',
    requesterName: '李明华',
    department: '采购部',
    items: [
      {
        productName: '无缝钢管',
        productSpec: '20# 108x6mm',
        quantity: 10000,
        unit: '米',
        targetPrice: 85,
        currency: 'CNY',
      },
    ],
    totalTargetAmount: 850000,
    currency: 'CNY',
    deliveryAddress: '广州市黄埔区',
    requiredDate: '2024-03-20',
    quotationDeadline: '2024-02-25',
    status: 'draft',
    statusName: '草稿',
    quotes: [],
    negotiations: [],
    selectedSupplierId: '',
    selectedSupplierName: '',
    finalAmount: 0,
    createdAt: '2024-02-10T00:00:00Z',
    updatedAt: '2024-02-10T00:00:00Z',
    approvedBy: '',
    approvedAt: '',
    remarks: '石化管道项目用',
    attachments: [],
  },
  {
    id: 'I008',
    code: 'INQ-2024-0008',
    title: '汽车电子部件采购',
    category: '电子元器件',
    subCategory: '汽车电子',
    requesterId: 'U002',
    requesterName: '李明华',
    department: '采购部',
    items: [
      {
        productName: 'ESP控制器',
        productSpec: 'Bosch 8.1',
        quantity: 2000,
        unit: '套',
        targetPrice: 1200,
        currency: 'CNY',
      },
    ],
    totalTargetAmount: 2400000,
    currency: 'CNY',
    deliveryAddress: '重庆市两江新区',
    requiredDate: '2024-04-15',
    quotationDeadline: '2024-03-01',
    status: 'negotiating',
    statusName: '议价中',
    quotes: [
      {
        id: 'Q008',
        supplierId: 'S018',
        supplierName: '博世集团',
        quoteItems: [
          { productName: 'ESP控制器', productSpec: 'Bosch 8.1', quantity: 2000, unit: '套', unitPrice: 1180, totalPrice: 2360000, currency: 'CNY', deliveryTime: 50 },
        ],
        totalAmount: 2360000,
        deliveryDate: '2024-04-01',
        paymentTerms: 'T/T 90天',
        warrantyPeriod: '36个月',
        quoteDate: '2024-02-20',
        status: 'negotiating',
        remarks: '高端配置，原厂品质',
      },
    ],
    negotiations: [
      {
        id: 'N005',
        round: 1,
        operatorId: 'U003',
        operatorName: '王芳',
        content: '年采购量预计5000套，希望价格能再降5%吗？',
        proposedPrice: 2242000,
        timestamp: '2024-02-21T15:30:00Z',
      },
    ],
    selectedSupplierId: '',
    selectedSupplierName: '',
    finalAmount: 0,
    createdAt: '2024-02-15T00:00:00Z',
    updatedAt: '2024-02-22T10:00:00Z',
    approvedBy: '',
    approvedAt: '',
    remarks: '新能源汽车项目',
    attachments: ['ESP技术规范.pdf'],
  },
  {
    id: 'I009',
    code: 'INQ-2024-0009',
    title: '半导体存储器采购',
    category: '电子元器件',
    subCategory: '存储器芯片',
    requesterId: 'U002',
    requesterName: '李明华',
    department: '采购部',
    items: [
      {
        productName: 'DDR4 16GB',
        productSpec: 'DDR4-3200 SDRAM',
        quantity: 5000,
        unit: '颗',
        targetPrice: 280,
        currency: 'CNY',
      },
    ],
    totalTargetAmount: 1400000,
    currency: 'CNY',
    deliveryAddress: '合肥市高新区',
    requiredDate: '2024-03-25',
    quotationDeadline: '2024-02-28',
    status: 'completed',
    statusName: '已完成',
    quotes: [
      {
        id: 'Q009',
        supplierId: 'S005',
        supplierName: '三星电子',
        quoteItems: [
          { productName: 'DDR4 16GB', productSpec: 'DDR4-3200 SDRAM', quantity: 5000, unit: '颗', unitPrice: 275, totalPrice: 1375000, currency: 'CNY', deliveryTime: 30 },
        ],
        totalAmount: 1375000,
        deliveryDate: '2024-03-15',
        paymentTerms: 'T/T 60天',
        warrantyPeriod: '24个月',
        quoteDate: '2024-02-22',
        status: 'accepted',
        remarks: '长期合作伙伴，价格优惠',
      },
      {
        id: 'Q010',
        supplierId: 'S013',
        supplierName: 'SK海力士',
        quoteItems: [
          { productName: 'DDR4 16GB', productSpec: 'DDR4-3200 SDRAM', quantity: 5000, unit: '颗', unitPrice: 278, totalPrice: 1390000, currency: 'CNY', deliveryTime: 28 },
        ],
        totalAmount: 1390000,
        deliveryDate: '2024-03-12',
        paymentTerms: 'T/T 60天',
        warrantyPeriod: '24个月',
        quoteDate: '2024-02-23',
        status: 'rejected',
        remarks: '价格略高',
      },
    ],
    negotiations: [],
    selectedSupplierId: 'S005',
    selectedSupplierName: '三星电子',
    finalAmount: 1375000,
    createdAt: '2024-02-18T00:00:00Z',
    updatedAt: '2024-02-25T11:00:00Z',
    approvedBy: '王芳',
    approvedAt: '2024-02-25T11:00:00Z',
    remarks: '服务器内存条生产用',
    attachments: ['存储器规格书.pdf'],
  },
  {
    id: 'I010',
    code: 'INQ-2024-0010',
    title: '低压电器采购项目',
    category: '机械设备',
    subCategory: '低压电器',
    requesterId: 'U002',
    requesterName: '李明华',
    department: '采购部',
    items: [
      {
        productName: '断路器',
        productSpec: 'Schneider NSX100N',
        quantity: 100,
        unit: '个',
        targetPrice: 850,
        currency: 'CNY',
      },
      {
        productName: '接触器',
        productSpec: 'Schneider LC1D50',
        quantity: 200,
        unit: '个',
        targetPrice: 450,
        currency: 'CNY',
      },
    ],
    totalTargetAmount: 175000,
    currency: 'CNY',
    deliveryAddress: '济南市高新区',
    requiredDate: '2024-03-05',
    quotationDeadline: '2024-02-18',
    status: 'completed',
    statusName: '已完成',
    quotes: [
      {
        id: 'Q011',
        supplierId: 'S007',
        supplierName: '施耐德电气',
        quoteItems: [
          { productName: '断路器', productSpec: 'Schneider NSX100N', quantity: 100, unit: '个', unitPrice: 820, totalPrice: 82000, currency: 'CNY', deliveryTime: 10 },
          { productName: '接触器', productSpec: 'Schneider LC1D50', quantity: 200, unit: '个', unitPrice: 430, totalPrice: 86000, currency: 'CNY', deliveryTime: 10 },
        ],
        totalAmount: 168000,
        deliveryDate: '2024-02-25',
        paymentTerms: 'T/T 90天',
        warrantyPeriod: '18个月',
        quoteDate: '2024-02-15',
        status: 'accepted',
        remarks: '价格合理，快速交货',
      },
    ],
    negotiations: [],
    selectedSupplierId: 'S007',
    selectedSupplierName: '施耐德电气',
    finalAmount: 168000,
    createdAt: '2024-02-10T00:00:00Z',
    updatedAt: '2024-02-16T14:00:00Z',
    approvedBy: '王芳',
    approvedAt: '2024-02-16T14:00:00Z',
    remarks: '设备检修用',
    attachments: ['电器清单.xlsx'],
  },
];

export const inquiriesData = inquiries;
export default inquiries;
