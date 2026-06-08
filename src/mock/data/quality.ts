export interface QualityInspectionItem {
  id: string;
  name: string;
  standard: string;
  unit: string;
  sampleSize: number;
  passSize: number;
  failSize: number;
  measuredValue: string;
  result: 'pass' | 'fail' | 'pending';
  remark: string;
}

export interface QualityReturnDetail {
  id: string;
  returnQuantity: number;
  returnReason: string;
  returnAmount: number;
  returnDate: string;
  processingMethod: 'refund' | 'replacement' | 'rework' | 'discount';
  processingStatus: 'pending' | 'processing' | 'completed';
  completedDate?: string;
  remark: string;
}

export interface QualityInspection {
  id: string;
  code: string;
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
  passQuantity: number;
  failQuantity: number;
  overallResult: 'pass' | 'fail' | 'conditional_pass' | 'pending';
  inspectionType: 'incoming' | 'in_process' | 'final' | 're-inspection';
  inspectionStandard: string;
  inspectorId: string;
  inspectorName: string;
  inspectionDate: string;
  items: QualityInspectionItem[];
  hasReturn: boolean;
  returnDetail?: QualityReturnDetail;
  status: 'draft' | 'inspecting' | 'completed' | 'returned' | 'closed';
  remark: string;
  attachments: string[];
  createdAt: string;
  updatedAt: string;
}

export const quality: QualityInspection[] = [
  {
    id: 'QI001',
    code: 'QI-2024-001',
    orderId: 'O001',
    orderCode: 'PO-2024-001',
    supplierId: 'S001',
    supplierName: '深圳华为技术有限公司',
    productName: '5G通信模块',
    productSpec: 'MH5000-31',
    batchNo: 'B202401001',
    productionDate: '2024-01-15',
    receivedDate: '2024-01-20',
    receivedQuantity: 1000,
    inspectedQuantity: 100,
    passQuantity: 98,
    failQuantity: 2,
    overallResult: 'conditional_pass',
    inspectionType: 'incoming',
    inspectionStandard: 'GB/T 2423.1-2008',
    inspectorId: 'U005',
    inspectorName: '王质检',
    inspectionDate: '2024-01-21',
    items: [
      {
        id: 'II001',
        name: '外观检查',
        standard: '无明显划痕、变形',
        unit: 'pcs',
        sampleSize: 100,
        passSize: 100,
        failSize: 0,
        measuredValue: '合格',
        result: 'pass',
        remark: '外观良好'
      },
      {
        id: 'II002',
        name: '尺寸测量',
        standard: '50±0.5mm',
        unit: 'mm',
        sampleSize: 50,
        passSize: 48,
        failSize: 2,
        measuredValue: '49.8-50.3mm',
        result: 'pass',
        remark: '2件尺寸偏差在允许范围内'
      },
      {
        id: 'II003',
        name: '功能测试',
        standard: '5G通信正常',
        unit: 'pcs',
        sampleSize: 30,
        passSize: 30,
        failSize: 0,
        measuredValue: '通信正常',
        result: 'pass',
        remark: '全部通过'
      }
    ],
    hasReturn: false,
    status: 'completed',
    remark: '有2件尺寸超差，但在让步接收范围内',
    attachments: ['quality_report_001.pdf', 'inspection_photos_001.zip'],
    createdAt: '2024-01-21T09:00:00Z',
    updatedAt: '2024-01-21T14:30:00Z'
  },
  {
    id: 'QI002',
    code: 'QI-2024-002',
    orderId: 'O002',
    orderCode: 'PO-2024-002',
    supplierId: 'S004',
    supplierName: '德国西门子股份公司',
    productName: 'S7-1500 PLC控制器',
    productSpec: '6ES7511-1AK02-0AB0',
    batchNo: 'B202402001',
    productionDate: '2024-02-01',
    receivedDate: '2024-02-15',
    receivedQuantity: 50,
    inspectedQuantity: 50,
    passQuantity: 48,
    failQuantity: 2,
    overallResult: 'fail',
    inspectionType: 'incoming',
    inspectionStandard: 'IEC 61131-2',
    inspectorId: 'U005',
    inspectorName: '王质检',
    inspectionDate: '2024-02-16',
    items: [
      {
        id: 'II004',
        name: '包装检查',
        standard: '原包装完好',
        unit: 'box',
        sampleSize: 50,
        passSize: 50,
        failSize: 0,
        measuredValue: '包装完好',
        result: 'pass',
        remark: ''
      },
      {
        id: 'II005',
        name: '外观检查',
        standard: '无破损、无氧化',
        unit: 'pcs',
        sampleSize: 50,
        passSize: 48,
        failSize: 2,
        measuredValue: '2件外壳破损',
        result: 'fail',
        remark: '2件外壳有明显裂痕'
      },
      {
        id: 'II006',
        name: '通电测试',
        standard: '正常启动',
        unit: 'pcs',
        sampleSize: 10,
        passSize: 10,
        failSize: 0,
        measuredValue: '启动正常',
        result: 'pass',
        remark: ''
      }
    ],
    hasReturn: true,
    returnDetail: {
      id: 'RET001',
      returnQuantity: 2,
      returnReason: '运输过程中包装破损导致外壳损坏',
      returnAmount: 15600,
      returnDate: '2024-02-18',
      processingMethod: 'replacement',
      processingStatus: 'completed',
      completedDate: '2024-02-25',
      remark: '供应商已补发2件新设备'
    },
    status: 'returned',
    remark: '2件外壳破损，已退回供应商补发',
    attachments: ['quality_report_002.pdf', 'damage_photos_002.zip', 'return_form_001.pdf'],
    createdAt: '2024-02-16T10:00:00Z',
    updatedAt: '2024-02-25T16:00:00Z'
  },
  {
    id: 'QI003',
    code: 'QI-2024-003',
    orderId: 'O003',
    orderCode: 'PO-2024-003',
    supplierId: 'S005',
    supplierName: '日本三菱电机株式会社',
    productName: 'MR-J4伺服驱动器',
    productSpec: 'MR-J4-100B',
    batchNo: 'B202403001',
    productionDate: '2024-02-20',
    receivedDate: '2024-03-10',
    receivedQuantity: 100,
    inspectedQuantity: 20,
    passQuantity: 20,
    failQuantity: 0,
    overallResult: 'pass',
    inspectionType: 'incoming',
    inspectionStandard: 'JIS C 60068',
    inspectorId: 'U005',
    inspectorName: '王质检',
    inspectionDate: '2024-03-11',
    items: [
      {
        id: 'II007',
        name: '外观检查',
        standard: '无损伤、无变形',
        unit: 'pcs',
        sampleSize: 20,
        passSize: 20,
        failSize: 0,
        measuredValue: '合格',
        result: 'pass',
        remark: ''
      },
      {
        id: 'II008',
        name: '参数设置测试',
        standard: '参数可正常设置和读取',
        unit: 'pcs',
        sampleSize: 10,
        passSize: 10,
        failSize: 0,
        measuredValue: '正常',
        result: 'pass',
        remark: ''
      },
      {
        id: 'II009',
        name: '运行测试',
        standard: '运行平稳无异常',
        unit: 'pcs',
        sampleSize: 10,
        passSize: 10,
        failSize: 0,
        measuredValue: '运行正常',
        result: 'pass',
        remark: ''
      }
    ],
    hasReturn: false,
    status: 'completed',
    remark: '全部合格，准予入库',
    attachments: ['quality_report_003.pdf'],
    createdAt: '2024-03-11T09:00:00Z',
    updatedAt: '2024-03-11T15:00:00Z'
  },
  {
    id: 'QI004',
    code: 'QI-2024-004',
    orderId: 'O006',
    orderCode: 'PO-2024-006',
    supplierId: 'S012',
    supplierName: '鞍钢股份有限公司',
    productName: '冷轧钢板',
    productSpec: '1.5mm×1250mm×2500mm',
    batchNo: 'B202404001',
    productionDate: '2024-03-25',
    receivedDate: '2024-04-05',
    receivedQuantity: 500,
    inspectedQuantity: 50,
    passQuantity: 47,
    failQuantity: 3,
    overallResult: 'conditional_pass',
    inspectionType: 'incoming',
    inspectionStandard: 'GB/T 708-2019',
    inspectorId: 'U005',
    inspectorName: '王质检',
    inspectionDate: '2024-04-06',
    items: [
      {
        id: 'II010',
        name: '厚度测量',
        standard: '1.5±0.05mm',
        unit: 'mm',
        sampleSize: 50,
        passSize: 47,
        failSize: 3,
        measuredValue: '1.42-1.58mm',
        result: 'fail',
        remark: '3张钢板厚度超差'
      },
      {
        id: 'II011',
        name: '表面质量',
        standard: '无氧化皮、无划痕',
        unit: 'sheet',
        sampleSize: 50,
        passSize: 50,
        failSize: 0,
        measuredValue: '表面良好',
        result: 'pass',
        remark: ''
      },
      {
        id: 'II012',
        name: '硬度测试',
        standard: 'HRB 60-70',
        unit: 'HRB',
        sampleSize: 20,
        passSize: 20,
        failSize: 0,
        measuredValue: 'HRB 62-68',
        result: 'pass',
        remark: ''
      }
    ],
    hasReturn: true,
    returnDetail: {
      id: 'RET002',
      returnQuantity: 3,
      returnReason: '厚度不达标',
      returnAmount: 2340,
      returnDate: '2024-04-08',
      processingMethod: 'discount',
      processingStatus: 'completed',
      completedDate: '2024-04-10',
      remark: '3张不合格钢板按8折计价，扣款468元'
    },
    status: 'completed',
    remark: '3张厚度超差，已做折扣处理',
    attachments: ['quality_report_004.pdf', 'test_report_004.pdf'],
    createdAt: '2024-04-06T10:00:00Z',
    updatedAt: '2024-04-10T14:00:00Z'
  },
  {
    id: 'QI005',
    code: 'QI-2024-005',
    orderId: 'O007',
    orderCode: 'PO-2024-007',
    supplierId: 'S014',
    supplierName: '瑞士ABB集团',
    productName: '工业机器人',
    productSpec: 'IRB 6700-200/2.6',
    batchNo: 'B202405001',
    productionDate: '2024-04-10',
    receivedDate: '2024-05-15',
    receivedQuantity: 5,
    inspectedQuantity: 5,
    passQuantity: 5,
    failQuantity: 0,
    overallResult: 'pass',
    inspectionType: 'incoming',
    inspectionStandard: 'ISO 10218-1',
    inspectorId: 'U005',
    inspectorName: '王质检',
    inspectionDate: '2024-05-16',
    items: [
      {
        id: 'II013',
        name: '外观检查',
        standard: '无损伤、无变形',
        unit: 'unit',
        sampleSize: 5,
        passSize: 5,
        failSize: 0,
        measuredValue: '完好',
        result: 'pass',
        remark: ''
      },
      {
        id: 'II014',
        name: '重复定位精度',
        standard: '±0.1mm',
        unit: 'mm',
        sampleSize: 5,
        passSize: 5,
        failSize: 0,
        measuredValue: '±0.05mm',
        result: 'pass',
        remark: '优于标准要求'
      },
      {
        id: 'II015',
        name: '负载测试',
        standard: '200kg满载运行正常',
        unit: 'kg',
        sampleSize: 2,
        passSize: 2,
        failSize: 0,
        measuredValue: '正常',
        result: 'pass',
        remark: ''
      },
      {
        id: 'II016',
        name: '安全功能测试',
        standard: '急停、安全门功能正常',
        unit: 'item',
        sampleSize: 5,
        passSize: 5,
        failSize: 0,
        measuredValue: '正常',
        result: 'pass',
        remark: ''
      }
    ],
    hasReturn: false,
    status: 'completed',
    remark: '全部合格，性能优良',
    attachments: ['quality_report_005.pdf', 'calibration_certificate_005.pdf'],
    createdAt: '2024-05-16T09:00:00Z',
    updatedAt: '2024-05-16T17:00:00Z'
  },
  {
    id: 'QI006',
    code: 'QI-2024-006',
    orderId: 'O008',
    orderCode: 'PO-2024-008',
    supplierId: 'S001',
    supplierName: '深圳华为技术有限公司',
    productName: '办公打印耗材',
    productSpec: 'HP LaserJet Pro',
    batchNo: 'B202405002',
    productionDate: '2024-05-01',
    receivedDate: '2024-05-20',
    receivedQuantity: 200,
    inspectedQuantity: 20,
    passQuantity: 20,
    failQuantity: 0,
    overallResult: 'pass',
    inspectionType: 'incoming',
    inspectionStandard: 'GB/T 17497-2012',
    inspectorId: 'U005',
    inspectorName: '王质检',
    inspectionDate: '2024-05-21',
    items: [
      {
        id: 'II017',
        name: '包装检查',
        standard: '密封完好',
        unit: 'box',
        sampleSize: 20,
        passSize: 20,
        failSize: 0,
        measuredValue: '完好',
        result: 'pass',
        remark: ''
      },
      {
        id: 'II018',
        name: '打印质量测试',
        standard: '清晰、无漏印',
        unit: 'page',
        sampleSize: 10,
        passSize: 10,
        failSize: 0,
        measuredValue: '清晰',
        result: 'pass',
        remark: ''
      }
    ],
    hasReturn: false,
    status: 'completed',
    remark: '全部合格',
    attachments: ['quality_report_006.pdf'],
    createdAt: '2024-05-21T10:00:00Z',
    updatedAt: '2024-05-21T11:30:00Z'
  },
  {
    id: 'QI007',
    code: 'QI-2024-007',
    orderId: 'O009',
    orderCode: 'PO-2024-009',
    supplierId: 'S007',
    supplierName: '韩国三星电子',
    productName: 'DDR4服务器内存条',
    productSpec: '32GB DDR4-3200 ECC',
    batchNo: 'B202406001',
    productionDate: '2024-05-15',
    receivedDate: '2024-06-10',
    receivedQuantity: 500,
    inspectedQuantity: 50,
    passQuantity: 50,
    failQuantity: 0,
    overallResult: 'pass',
    inspectionType: 'incoming',
    inspectionStandard: 'JEDEC DDR4',
    inspectorId: 'U005',
    inspectorName: '王质检',
    inspectionDate: '2024-06-11',
    items: [
      {
        id: 'II019',
        name: '外观检查',
        standard: '金手指无氧化、PCB无变形',
        unit: 'pcs',
        sampleSize: 50,
        passSize: 50,
        failSize: 0,
        measuredValue: '完好',
        result: 'pass',
        remark: ''
      },
      {
        id: 'II020',
        name: '容量检测',
        standard: '32GB±5%',
        unit: 'GB',
        sampleSize: 30,
        passSize: 30,
        failSize: 0,
        measuredValue: '32GB',
        result: 'pass',
        remark: ''
      },
      {
        id: 'II021',
        name: '兼容性测试',
        standard: '服务器正常识别',
        unit: 'pcs',
        sampleSize: 20,
        passSize: 20,
        failSize: 0,
        measuredValue: '正常识别',
        result: 'pass',
        remark: ''
      },
      {
        id: 'II022',
        name: 'ECC功能测试',
        standard: 'ECC纠错功能正常',
        unit: 'pcs',
        sampleSize: 20,
        passSize: 20,
        failSize: 0,
        measuredValue: '正常',
        result: 'pass',
        remark: ''
      }
    ],
    hasReturn: false,
    status: 'completed',
    remark: '全部合格',
    attachments: ['quality_report_007.pdf', 'test_report_007.pdf'],
    createdAt: '2024-06-11T09:00:00Z',
    updatedAt: '2024-06-11T16:00:00Z'
  },
  {
    id: 'QI008',
    code: 'QI-2024-008',
    orderId: 'O010',
    orderCode: 'PO-2024-010',
    supplierId: 'S003',
    supplierName: '沈阳机床股份有限公司',
    productName: 'VMC850立式加工中心',
    productSpec: 'VMC850E',
    batchNo: 'B202406002',
    productionDate: '2024-05-20',
    receivedDate: '2024-06-15',
    receivedQuantity: 2,
    inspectedQuantity: 2,
    passQuantity: 1,
    failQuantity: 1,
    overallResult: 'fail',
    inspectionType: 'incoming',
    inspectionStandard: 'JB/T 8801-2010',
    inspectorId: 'U005',
    inspectorName: '王质检',
    inspectionDate: '2024-06-17',
    items: [
      {
        id: 'II023',
        name: '外观检查',
        standard: '无损伤',
        unit: 'unit',
        sampleSize: 2,
        passSize: 2,
        failSize: 0,
        measuredValue: '完好',
        result: 'pass',
        remark: ''
      },
      {
        id: 'II024',
        name: '几何精度检验',
        standard: '定位精度±0.008mm',
        unit: 'mm',
        sampleSize: 2,
        passSize: 1,
        failSize: 1,
        measuredValue: '0.012mm（不合格）',
        result: 'fail',
        remark: '1台定位精度超差'
      },
      {
        id: 'II025',
        name: '工作精度检验',
        standard: '圆度≤0.005mm',
        unit: 'mm',
        sampleSize: 2,
        passSize: 1,
        failSize: 1,
        measuredValue: '0.008mm（不合格）',
        result: 'fail',
        remark: '同上设备'
      },
      {
        id: 'II026',
        name: '空运转试验',
        standard: '主轴转速正常、无异常噪音',
        unit: 'unit',
        sampleSize: 2,
        passSize: 2,
        failSize: 0,
        measuredValue: '正常',
        result: 'pass',
        remark: ''
      }
    ],
    hasReturn: true,
    returnDetail: {
      id: 'RET003',
      returnQuantity: 1,
      returnReason: '几何精度和工作精度不达标',
      returnAmount: 580000,
      returnDate: '2024-06-20',
      processingMethod: 'rework',
      processingStatus: 'processing',
      remark: '供应商已派工程师上门调试，预计7月5日前完成'
    },
    status: 'returned',
    remark: '1台设备精度不达标，正在返修中',
    attachments: ['quality_report_008.pdf', 'precision_test_report_008.pdf', 'return_form_003.pdf'],
    createdAt: '2024-06-17T10:00:00Z',
    updatedAt: '2024-06-25T14:00:00Z'
  },
  {
    id: 'QI009',
    code: 'QI-2024-009',
    orderId: 'O013',
    orderCode: 'PO-2024-013',
    supplierId: 'S010',
    supplierName: '武汉凡谷电子技术股份有限公司',
    productName: '电子元件套装',
    productSpec: 'RES-CAP-001',
    batchNo: 'B202407001',
    productionDate: '2024-06-25',
    receivedDate: '2024-07-05',
    receivedQuantity: 10000,
    inspectedQuantity: 200,
    passQuantity: 196,
    failQuantity: 4,
    overallResult: 'conditional_pass',
    inspectionType: 'incoming',
    inspectionStandard: 'GB/T 2423.1-2008',
    inspectorId: 'U005',
    inspectorName: '王质检',
    inspectionDate: '2024-07-06',
    items: [
      {
        id: 'II027',
        name: '阻值测量',
        standard: '±1%公差范围',
        unit: 'Ω',
        sampleSize: 100,
        passSize: 98,
        failSize: 2,
        measuredValue: '合格',
        result: 'pass',
        remark: '2个电阻超差'
      },
      {
        id: 'II028',
        name: '电容值测量',
        standard: '±5%公差范围',
        unit: 'μF',
        sampleSize: 100,
        passSize: 98,
        failSize: 2,
        measuredValue: '合格',
        result: 'pass',
        remark: '2个电容超差'
      },
      {
        id: 'II029',
        name: '外观检查',
        standard: '无损伤、标识清晰',
        unit: 'pcs',
        sampleSize: 100,
        passSize: 100,
        failSize: 0,
        measuredValue: '完好',
        result: 'pass',
        remark: ''
      }
    ],
    hasReturn: false,
    status: 'completed',
    remark: '不良率2%，在AQL允许范围内，让步接收',
    attachments: ['quality_report_009.pdf'],
    createdAt: '2024-07-06T10:00:00Z',
    updatedAt: '2024-07-06T15:00:00Z'
  },
  {
    id: 'QI010',
    code: 'QI-2024-010',
    orderId: 'O015',
    orderCode: 'PO-2024-015',
    supplierId: 'S020',
    supplierName: '华为数字能源技术有限公司',
    productName: '智能光伏逆变器',
    productSpec: 'SUN2000-100KTL-M1',
    batchNo: 'B202407002',
    productionDate: '2024-07-01',
    receivedDate: '2024-07-20',
    receivedQuantity: 10,
    inspectedQuantity: 10,
    passQuantity: 10,
    failQuantity: 0,
    overallResult: 'pass',
    inspectionType: 'incoming',
    inspectionStandard: 'GB/T 19064-2003',
    inspectorId: 'U005',
    inspectorName: '王质检',
    inspectionDate: '2024-07-21',
    items: [
      {
        id: 'II030',
        name: '外观检查',
        standard: '无损伤、无变形',
        unit: 'unit',
        sampleSize: 10,
        passSize: 10,
        failSize: 0,
        measuredValue: '完好',
        result: 'pass',
        remark: ''
      },
      {
        id: 'II031',
        name: '绝缘电阻测试',
        standard: '≥2MΩ',
        unit: 'MΩ',
        sampleSize: 10,
        passSize: 10,
        failSize: 0,
        measuredValue: '≥500MΩ',
        result: 'pass',
        remark: ''
      },
      {
        id: 'II032',
        name: '逆变效率测试',
        standard: '≥98%',
        unit: '%',
        sampleSize: 5,
        passSize: 5,
        failSize: 0,
        measuredValue: '98.6-98.8%',
        result: 'pass',
        remark: '优于标准要求'
      },
      {
        id: 'II033',
        name: 'MPPT效率测试',
        standard: '≥99.5%',
        unit: '%',
        sampleSize: 5,
        passSize: 5,
        failSize: 0,
        measuredValue: '99.8-99.9%',
        result: 'pass',
        remark: '优于标准要求'
      }
    ],
    hasReturn: false,
    status: 'completed',
    remark: '全部合格，性能优异',
    attachments: ['quality_report_010.pdf', 'efficiency_test_report_010.pdf'],
    createdAt: '2024-07-21T09:00:00Z',
    updatedAt: '2024-07-21T17:00:00Z'
  }
];

export const qualityData = quality;
export default quality;
