import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Building2,
  FileText,
  Package,
  CreditCard,
  Check,
  Upload,
  Plus,
  X,
  CheckCircle2,
  Loader2,
  AlertCircle,
} from 'lucide-react';
import { useSupplierStore } from '@/store/supplierStore';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Badge from '@/components/ui/Badge';
import { cn } from '@/lib/utils';

const countryToRegion: Record<string, string> = {
  '中国': '亚太',
  '日本': '亚太',
  '韩国': '亚太',
  '新加坡': '亚太',
  '印度': '亚太',
  '澳大利亚': '亚太',
  '德国': '欧洲',
  '法国': '欧洲',
  '英国': '欧洲',
  '意大利': '欧洲',
  '西班牙': '欧洲',
  '荷兰': '欧洲',
  '瑞士': '欧洲',
  '瑞典': '欧洲',
  '美国': '北美',
  '加拿大': '北美',
  '墨西哥': '北美',
  '巴西': '南美',
  '阿根廷': '南美',
  '南非': '非洲',
  '埃及': '非洲',
};

const steps = [
  { key: 'basic', label: '基本信息', icon: Building2, description: '填写企业基本信息' },
  { key: 'qualification', label: '资质信息', icon: FileText, description: '上传企业资质文件' },
  { key: 'capacity', label: '产能配置', icon: Package, description: '配置生产能力信息' },
  { key: 'financial', label: '财务信息', icon: CreditCard, description: '提供财务相关信息' },
];

const categoryOptions = [
  { label: '请选择主营品类', value: '' },
  { label: '电子元器件', value: '电子元器件' },
  { label: '机械设备', value: '机械设备' },
  { label: '原材料', value: '原材料' },
  { label: '化工产品', value: '化工产品' },
  { label: '纺织品', value: '纺织品' },
  { label: '包装材料', value: '包装材料' },
];

const countryOptions = [
  { label: '请选择国家', value: '' },
  { label: '中国', value: '中国' },
  { label: '美国', value: '美国' },
  { label: '德国', value: '德国' },
  { label: '日本', value: '日本' },
  { label: '韩国', value: '韩国' },
  { label: '法国', value: '法国' },
  { label: '英国', value: '英国' },
  { label: '意大利', value: '意大利' },
  { label: '西班牙', value: '西班牙' },
];

const certificationOptions = [
  { label: 'ISO9001', value: 'ISO9001' },
  { label: 'ISO14001', value: 'ISO14001' },
  { label: 'ISO45001', value: 'ISO45001' },
  { label: 'IATF16949', value: 'IATF16949' },
  { label: 'CE', value: 'CE' },
  { label: 'RoHS', value: 'RoHS' },
  { label: 'UL', value: 'UL' },
  { label: 'FDA', value: 'FDA' },
];

const paymentMethodOptions = [
  { label: '请选择付款方式', value: '' },
  { label: '电汇(T/T)', value: '电汇' },
  { label: '信用证(L/C)', value: '信用证' },
  { label: '承兑汇票', value: '承兑汇票' },
  { label: '托收(D/P)', value: '托收' },
  { label: '赊销(O/A)', value: '赊销' },
];

interface FormData {
  basic: {
    name: string;
    nameEn: string;
    country: string;
    city: string;
    address: string;
    contactPerson: string;
    contactTitle: string;
    phone: string;
    email: string;
    website: string;
    businessScope: string;
  };
  qualification: {
    businessLicense: File | null;
    taxRegistration: File | null;
    organizationCode: File | null;
    industryCertifications: File[];
  };
  capacity: {
    category: string;
    subCategory: string;
    monthlyCapacity: string;
    capacityUnit: string;
    minOrderQuantity: string;
    leadTime: string;
    certifications: string[];
  };
  financial: {
    bankName: string;
    bankAccount: string;
    taxNumber: string;
    registeredCapital: string;
    creditLimitRequest: string;
    creditPeriodRequest: string;
    paymentMethodPreference: string;
  };
}

interface FormErrors {
  basic: Record<string, string>;
  qualification: Record<string, string>;
  capacity: Record<string, string>;
  financial: Record<string, string>;
}

export default function SupplierRegister() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const { createSupplier } = useSupplierStore();

  const [formData, setFormData] = useState<FormData>({
    basic: {
      name: '',
      nameEn: '',
      country: '',
      city: '',
      address: '',
      contactPerson: '',
      contactTitle: '',
      phone: '',
      email: '',
      website: '',
      businessScope: '',
    },
    qualification: {
      businessLicense: null,
      taxRegistration: null,
      organizationCode: null,
      industryCertifications: [],
    },
    capacity: {
      category: '',
      subCategory: '',
      monthlyCapacity: '',
      capacityUnit: 'PCS',
      minOrderQuantity: '',
      leadTime: '',
      certifications: [],
    },
    financial: {
      bankName: '',
      bankAccount: '',
      taxNumber: '',
      registeredCapital: '',
      creditLimitRequest: '',
      creditPeriodRequest: '',
      paymentMethodPreference: '',
    },
  });

  const [errors, setErrors] = useState<FormErrors>({
    basic: {},
    qualification: {},
    capacity: {},
    financial: {},
  });

  const validateStep = (step: number): boolean => {
    const newErrors: Record<string, string> = {};

    if (step === 0) {
      if (!formData.basic.name.trim()) newErrors.name = '请输入企业名称';
      if (!formData.basic.country) newErrors.country = '请选择国家';
      if (!formData.basic.city.trim()) newErrors.city = '请输入城市';
      if (!formData.basic.address.trim()) newErrors.address = '请输入详细地址';
      if (!formData.basic.contactPerson.trim()) newErrors.contactPerson = '请输入联系人姓名';
      if (!formData.basic.contactTitle.trim()) newErrors.contactTitle = '请输入联系人职位';
      if (!formData.basic.phone.trim()) newErrors.phone = '请输入联系电话';
      if (!formData.basic.email.trim()) {
        newErrors.email = '请输入邮箱地址';
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.basic.email)) {
        newErrors.email = '请输入有效的邮箱地址';
      }
      if (!formData.basic.businessScope.trim()) newErrors.businessScope = '请输入企业简介';
    }

    if (step === 1) {
      if (!formData.qualification.businessLicense) newErrors.businessLicense = '请上传营业执照';
      if (!formData.qualification.taxRegistration) newErrors.taxRegistration = '请上传税务登记证';
      if (!formData.qualification.organizationCode) newErrors.organizationCode = '请上传组织机构代码证';
    }

    if (step === 2) {
      if (!formData.capacity.category) newErrors.category = '请选择主营品类';
      if (!formData.capacity.subCategory.trim()) newErrors.subCategory = '请输入细分品类';
      if (!formData.capacity.monthlyCapacity.trim()) newErrors.monthlyCapacity = '请输入月产能';
      if (!formData.capacity.minOrderQuantity.trim()) newErrors.minOrderQuantity = '请输入最小订单量';
      if (!formData.capacity.leadTime.trim()) newErrors.leadTime = '请输入交货周期';
    }

    if (step === 3) {
      if (!formData.financial.bankName.trim()) newErrors.bankName = '请输入开户银行';
      if (!formData.financial.bankAccount.trim()) newErrors.bankAccount = '请输入银行账号';
      if (!formData.financial.taxNumber.trim()) newErrors.taxNumber = '请输入税号';
      if (!formData.financial.registeredCapital.trim()) newErrors.registeredCapital = '请输入注册资本';
      if (!formData.financial.paymentMethodPreference) newErrors.paymentMethodPreference = '请选择付款方式偏好';
    }

    const stepKeys = ['basic', 'qualification', 'capacity', 'financial'] as const;
    setErrors((prev) => ({
      ...prev,
      [stepKeys[step]]: newErrors,
    }));

    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      if (currentStep < steps.length - 1) {
        setCurrentStep(currentStep + 1);
      }
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    if (!validateStep(currentStep)) return;

    setSubmitting(true);
    try {
      const newSupplier = await createSupplier({
        code: `SUP-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 10000)).padStart(4, '0')}`,
        name: formData.basic.name,
        nameEn: formData.basic.nameEn,
        category: formData.capacity.category,
        subCategory: formData.capacity.subCategory,
        country: formData.basic.country,
        countryCode: formData.basic.country === '中国' ? 'CN' : 'US',
        region: countryToRegion[formData.basic.country] || '亚太',
        city: formData.basic.city,
        address: formData.basic.address,
        contactPerson: formData.basic.contactPerson,
        contactTitle: formData.basic.contactTitle,
        phone: formData.basic.phone,
        email: formData.basic.email,
        website: formData.basic.website,
        rating: 0,
        reviewCount: 0,
        orderCount: 0,
        totalAmount: 0,
        onTimeDeliveryRate: 0,
        qualityPassRate: 0,
        certification: formData.capacity.certifications,
        qualificationStatus: 'pending',
        qualificationLevel: 'C',
        isFrozen: false,
        frozenReason: '',
        frozenAt: '',
        creditPeriod: Number(formData.financial.creditPeriodRequest) || 30,
        creditLimit: Number(formData.financial.creditLimitRequest) || 1000000,
        bankName: formData.financial.bankName,
        bankAccount: formData.financial.bankAccount,
        taxNumber: formData.financial.taxNumber,
        registeredCapital: formData.financial.registeredCapital,
        establishmentDate: new Date().toISOString().split('T')[0],
        businessScope: formData.basic.businessScope,
        tags: ['新供应商'],
        logo: `https://api.dicebear.com/7.x/shapes/svg?seed=${formData.basic.name}`,
      });

      if (newSupplier) {
        setSubmitSuccess(true);
      }
    } catch (error) {
      console.error('提交失败:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const updateFormData = (step: keyof FormData, field: string, value: unknown) => {
    setFormData((prev) => ({
      ...prev,
      [step]: {
        ...prev[step],
        [field]: value,
      },
    }));

    if (errors[step][field]) {
      setErrors((prev) => ({
        ...prev,
        [step]: {
          ...prev[step],
          [field]: '',
        },
      }));
    }
  };

  const handleFileUpload = (field: keyof FormData['qualification'], file: File | null) => {
    updateFormData('qualification', field, file);
  };

  const handleCertificationToggle = (cert: string) => {
    const currentCerts = formData.capacity.certifications;
    const newCerts = currentCerts.includes(cert)
      ? currentCerts.filter((c) => c !== cert)
      : [...currentCerts, cert];
    updateFormData('capacity', 'certifications', newCerts);
  };

  const handleIndustryCertUpload = (file: File) => {
    const currentFiles = formData.qualification.industryCertifications;
    updateFormData('qualification', 'industryCertifications', [...currentFiles, file]);
  };

  const handleIndustryCertRemove = (index: number) => {
    const currentFiles = formData.qualification.industryCertifications;
    updateFormData(
      'qualification',
      'industryCertifications',
      currentFiles.filter((_, i) => i !== index)
    );
  };

  const FileUploadZone = ({
    label,
    required,
    file,
    onChange,
    error,
  }: {
    label: string;
    required?: boolean;
    file: File | null;
    onChange: (file: File | null) => void;
    error?: string;
  }) => (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-slate-700">
        {label} {required && <span className="text-danger-500">*</span>}
      </label>
      <div
        className={cn(
          'border-2 border-dashed rounded-lg p-6 text-center transition-colors cursor-pointer hover:border-primary-400 hover:bg-primary-50/30',
          error ? 'border-danger-500 bg-danger-50/30' : file ? 'border-success-500 bg-success-50/30' : 'border-slate-200'
        )}
        onClick={() => document.getElementById(label)?.click()}
      >
        <input
          id={label}
          type="file"
          accept=".pdf,.jpg,.jpeg,.png"
          className="hidden"
          onChange={(e) => onChange(e.target.files?.[0] || null)}
        />
        {file ? (
          <div className="flex items-center justify-center gap-2">
            <CheckCircle2 className="w-8 h-8 text-success-500" />
            <div className="text-left">
              <p className="font-medium text-slate-800">{file.name}</p>
              <p className="text-sm text-slate-500">{(file.size / 1024).toFixed(1)} KB</p>
            </div>
            <button
              className="ml-4 p-1 rounded-full hover:bg-slate-200"
              onClick={(e) => {
                e.stopPropagation();
                onChange(null);
              }}
            >
              <X className="w-4 h-4 text-slate-500" />
            </button>
          </div>
        ) : (
          <div>
            <Upload className="w-8 h-8 text-slate-400 mx-auto mb-2" />
            <p className="text-sm text-slate-600">点击上传 {label}</p>
            <p className="text-xs text-slate-400 mt-1">支持 PDF、JPG、PNG 格式</p>
          </div>
        )}
      </div>
      {error && <p className="text-sm text-danger-500">{error}</p>}
    </div>
  );

  if (submitSuccess) {
    return (
      <div className="max-w-2xl mx-auto">
        <Card className="text-center py-12">
          <div className="w-20 h-20 bg-success-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="w-10 h-10 text-success-500" />
          </div>
          <h2 className="text-2xl font-bold text-slate-800 mb-2">入驻申请提交成功！</h2>
          <p className="text-slate-500 mb-8 max-w-md mx-auto">
            您的供应商入驻申请已成功提交，我们将在3个工作日内完成审核。
            审核结果将通过邮件和短信通知您。
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button variant="primary" onClick={() => navigate('/suppliers')}>
              返回供应商列表
            </Button>
            <Button variant="secondary" onClick={() => navigate('/')}>
              返回首页
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" icon={<ArrowLeft className="w-4 h-4" />} onClick={() => navigate('/suppliers')}>
          返回列表
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-slate-800">供应商入驻申请</h1>
          <p className="text-slate-500">填写以下信息完成供应商入驻申请</p>
        </div>
      </div>

      <Card>
        <div className="flex items-center justify-between mb-8">
          {steps.map((step, index) => (
            <div key={step.key} className="flex-1 relative">
              <div className="flex flex-col items-center">
                <div
                  className={cn(
                    'w-12 h-12 rounded-full flex items-center justify-center transition-all',
                    index < currentStep
                      ? 'bg-success-500 text-white'
                      : index === currentStep
                      ? 'bg-primary-500 text-white ring-4 ring-primary-100'
                      : 'bg-slate-100 text-slate-400'
                  )}
                >
                  {index < currentStep ? (
                    <Check className="w-5 h-5" />
                  ) : (
                    <step.icon className="w-5 h-5" />
                  )}
                </div>
                <div className="text-center mt-3">
                  <p
                    className={cn(
                      'text-sm font-medium',
                      index <= currentStep ? 'text-slate-800' : 'text-slate-400'
                    )}
                  >
                    {step.label}
                  </p>
                  <p className="text-xs text-slate-400 mt-0.5">{step.description}</p>
                </div>
              </div>
              {index < steps.length - 1 && (
                <div
                  className={cn(
                    'absolute top-6 left-1/2 w-full h-0.5 -translate-y-1/2',
                    index < currentStep ? 'bg-success-500' : 'bg-slate-200'
                  )}
                />
              )}
            </div>
          ))}
        </div>

        {currentStep === 0 && (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
              <Building2 className="w-5 h-5 text-primary-500" />
              基本信息
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="企业名称"
                required
                value={formData.basic.name}
                onChange={(e) => updateFormData('basic', 'name', e.target.value)}
                placeholder="请输入企业全称"
                error={errors.basic.name}
              />
              <Input
                label="企业英文名称"
                value={formData.basic.nameEn}
                onChange={(e) => updateFormData('basic', 'nameEn', e.target.value)}
                placeholder="请输入企业英文名称"
              />
              <Select
                label="国家"
                required
                value={formData.basic.country}
                onChange={(e) => updateFormData('basic', 'country', e.target.value)}
                options={countryOptions}
                error={errors.basic.country}
              />
              <Input
                label="城市"
                required
                value={formData.basic.city}
                onChange={(e) => updateFormData('basic', 'city', e.target.value)}
                placeholder="请输入城市"
                error={errors.basic.city}
              />
              <Input
                label="详细地址"
                required
                value={formData.basic.address}
                onChange={(e) => updateFormData('basic', 'address', e.target.value)}
                placeholder="请输入详细地址"
                wrapperClassName="md:col-span-2"
                error={errors.basic.address}
              />
              <Input
                label="联系人姓名"
                required
                value={formData.basic.contactPerson}
                onChange={(e) => updateFormData('basic', 'contactPerson', e.target.value)}
                placeholder="请输入联系人姓名"
                error={errors.basic.contactPerson}
              />
              <Input
                label="联系人职位"
                required
                value={formData.basic.contactTitle}
                onChange={(e) => updateFormData('basic', 'contactTitle', e.target.value)}
                placeholder="请输入联系人职位"
                error={errors.basic.contactTitle}
              />
              <Input
                label="联系电话"
                required
                value={formData.basic.phone}
                onChange={(e) => updateFormData('basic', 'phone', e.target.value)}
                placeholder="请输入联系电话"
                error={errors.basic.phone}
              />
              <Input
                label="邮箱地址"
                required
                type="email"
                value={formData.basic.email}
                onChange={(e) => updateFormData('basic', 'email', e.target.value)}
                placeholder="请输入邮箱地址"
                error={errors.basic.email}
              />
              <Input
                label="公司官网"
                value={formData.basic.website}
                onChange={(e) => updateFormData('basic', 'website', e.target.value)}
                placeholder="请输入公司官网"
              />
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  企业简介 <span className="text-danger-500">*</span>
                </label>
                <textarea
                  value={formData.basic.businessScope}
                  onChange={(e) => updateFormData('basic', 'businessScope', e.target.value)}
                  placeholder="请简要介绍企业主营业务、核心优势等"
                  rows={4}
                  className={cn(
                    'w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all resize-none',
                    errors.basic.businessScope && 'border-danger-500 focus:ring-danger-500/20 focus:border-danger-500'
                  )}
                />
                {errors.basic.businessScope && (
                  <p className="mt-1 text-sm text-danger-500">{errors.basic.businessScope}</p>
                )}
              </div>
            </div>
          </div>
        )}

        {currentStep === 1 && (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
              <FileText className="w-5 h-5 text-primary-500" />
              资质信息
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FileUploadZone
                label="营业执照"
                required
                file={formData.qualification.businessLicense}
                onChange={(file) => handleFileUpload('businessLicense', file)}
                error={errors.qualification.businessLicense}
              />
              <FileUploadZone
                label="税务登记证"
                required
                file={formData.qualification.taxRegistration}
                onChange={(file) => handleFileUpload('taxRegistration', file)}
                error={errors.qualification.taxRegistration}
              />
              <FileUploadZone
                label="组织机构代码证"
                required
                file={formData.qualification.organizationCode}
                onChange={(file) => handleFileUpload('organizationCode', file)}
                error={errors.qualification.organizationCode}
              />
              <div className="space-y-2">
                <label className="block text-sm font-medium text-slate-700">
                  行业资质证书
                </label>
                <div
                  className="border-2 border-dashed border-slate-200 rounded-lg p-6 text-center transition-colors cursor-pointer hover:border-primary-400 hover:bg-primary-50/30"
                  onClick={() => document.getElementById('industryCert')?.click()}
                >
                  <input
                    id="industryCert"
                    type="file"
                    multiple
                    accept=".pdf,.jpg,.jpeg,.png"
                    className="hidden"
                    onChange={(e) => {
                      if (e.target.files) {
                        Array.from(e.target.files).forEach((file) => handleIndustryCertUpload(file));
                      }
                    }}
                  />
                  <div className="flex flex-col items-center">
                    <Plus className="w-8 h-8 text-slate-400 mb-2" />
                    <p className="text-sm text-slate-600">点击添加行业资质证书</p>
                    <p className="text-xs text-slate-400 mt-1">可上传多个文件</p>
                  </div>
                </div>
                {formData.qualification.industryCertifications.length > 0 && (
                  <div className="space-y-2 mt-3">
                    {formData.qualification.industryCertifications.map((file, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-3 bg-slate-50 rounded-lg"
                      >
                        <div className="flex items-center gap-2">
                          <FileText className="w-4 h-4 text-slate-400" />
                          <span className="text-sm text-slate-700 truncate max-w-[200px]">
                            {file.name}
                          </span>
                        </div>
                        <button
                          className="p-1 rounded-full hover:bg-slate-200"
                          onClick={() => handleIndustryCertRemove(index)}
                        >
                          <X className="w-4 h-4 text-slate-500" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {currentStep === 2 && (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
              <Package className="w-5 h-5 text-primary-500" />
              产能配置
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Select
                label="主营品类"
                required
                value={formData.capacity.category}
                onChange={(e) => updateFormData('capacity', 'category', e.target.value)}
                options={categoryOptions}
                error={errors.capacity.category}
              />
              <Input
                label="细分品类"
                required
                value={formData.capacity.subCategory}
                onChange={(e) => updateFormData('capacity', 'subCategory', e.target.value)}
                placeholder="请输入细分品类"
                error={errors.capacity.subCategory}
              />
              <Input
                label="月产能"
                required
                type="number"
                value={formData.capacity.monthlyCapacity}
                onChange={(e) => updateFormData('capacity', 'monthlyCapacity', e.target.value)}
                placeholder="请输入月产能"
                error={errors.capacity.monthlyCapacity}
              />
              <Input
                label="产能单位"
                value={formData.capacity.capacityUnit}
                onChange={(e) => updateFormData('capacity', 'capacityUnit', e.target.value)}
                placeholder="如：PCS、KG、吨等"
              />
              <Input
                label="最小订单量"
                required
                type="number"
                value={formData.capacity.minOrderQuantity}
                onChange={(e) => updateFormData('capacity', 'minOrderQuantity', e.target.value)}
                placeholder="请输入最小订单量"
                error={errors.capacity.minOrderQuantity}
              />
              <Input
                label="交货周期(天)"
                required
                type="number"
                value={formData.capacity.leadTime}
                onChange={(e) => updateFormData('capacity', 'leadTime', e.target.value)}
                placeholder="请输入交货周期"
                error={errors.capacity.leadTime}
              />
            </div>

            <div className="space-y-3">
              <label className="block text-sm font-medium text-slate-700">
                质量认证
              </label>
              <div className="flex flex-wrap gap-2">
                {certificationOptions.map((cert) => (
                  <button
                    key={cert.value}
                    type="button"
                    className={cn(
                      'px-4 py-2 rounded-lg text-sm font-medium transition-all border',
                      formData.capacity.certifications.includes(cert.value)
                        ? 'bg-primary-500 text-white border-primary-500'
                        : 'bg-white text-slate-600 border-slate-200 hover:border-primary-300'
                    )}
                    onClick={() => handleCertificationToggle(cert.value)}
                  >
                    {cert.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {currentStep === 3 && (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-primary-500" />
              财务信息
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="开户银行"
                required
                value={formData.financial.bankName}
                onChange={(e) => updateFormData('financial', 'bankName', e.target.value)}
                placeholder="请输入开户银行"
                error={errors.financial.bankName}
              />
              <Input
                label="银行账号"
                required
                value={formData.financial.bankAccount}
                onChange={(e) => updateFormData('financial', 'bankAccount', e.target.value)}
                placeholder="请输入银行账号"
                error={errors.financial.bankAccount}
              />
              <Input
                label="税号"
                required
                value={formData.financial.taxNumber}
                onChange={(e) => updateFormData('financial', 'taxNumber', e.target.value)}
                placeholder="请输入税号"
                error={errors.financial.taxNumber}
              />
              <Input
                label="注册资本"
                required
                value={formData.financial.registeredCapital}
                onChange={(e) => updateFormData('financial', 'registeredCapital', e.target.value)}
                placeholder="如：1000万元人民币"
                error={errors.financial.registeredCapital}
              />
              <Input
                label="申请信用额度(元)"
                type="number"
                value={formData.financial.creditLimitRequest}
                onChange={(e) => updateFormData('financial', 'creditLimitRequest', e.target.value)}
                placeholder="请输入申请的信用额度"
              />
              <Input
                label="申请账期(天)"
                type="number"
                value={formData.financial.creditPeriodRequest}
                onChange={(e) => updateFormData('financial', 'creditPeriodRequest', e.target.value)}
                placeholder="请输入申请的账期"
              />
              <Select
                label="付款方式偏好"
                required
                value={formData.financial.paymentMethodPreference}
                onChange={(e) => updateFormData('financial', 'paymentMethodPreference', e.target.value)}
                options={paymentMethodOptions}
                error={errors.financial.paymentMethodPreference}
                wrapperClassName="md:col-span-2"
              />
            </div>

            <div className="p-4 bg-warning-50 rounded-lg border border-warning-200">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-warning-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-slate-800">温馨提示</p>
                  <p className="text-sm text-slate-600 mt-1">
                    您提交的所有信息将用于供应商资质审核，请确保填写的信息真实有效。
                    我们将在3个工作日内完成审核，审核结果将通过邮件和短信通知。
                    如有疑问，请联系客服：400-888-8888。
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="flex items-center justify-between pt-6 mt-6 border-t border-slate-100">
          <Button
            variant="secondary"
            onClick={handlePrev}
            disabled={currentStep === 0}
          >
            上一步
          </Button>
          <div className="flex items-center gap-2">
            {currentStep === steps.length - 1 ? (
              <Button
                variant="primary"
                onClick={handleSubmit}
                loading={submitting}
                icon={submitting ? undefined : <Check className="w-4 h-4" />}
              >
                {submitting ? '提交中...' : '提交申请'}
              </Button>
            ) : (
              <Button
                variant="primary"
                onClick={handleNext}
              >
                下一步
              </Button>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
}
