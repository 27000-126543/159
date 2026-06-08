import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Globe,
  User,
  Lock,
  Eye,
  EyeOff,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  BarChart3,
  Layers,
  Truck,
  Building2,
} from 'lucide-react';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Select, { type SelectOption } from '@/components/ui/Select';
import Card from '@/components/ui/Card';
import { useUserStore } from '@/store';
import { userService } from '@/mock/services/userService';
import type { UserRole } from '@/types';
import { ROLE_NAMES } from '@/utils/permission';
import { cn } from '@/lib/utils';

const roleOptions: SelectOption[] = [
  { value: 'ceo', label: 'CEO' },
  { value: 'director', label: '采购总监' },
  { value: 'manager', label: '采购经理' },
  { value: 'buyer', label: '采购员' },
  { value: 'supplier', label: '供应商' },
];

const features = [
  { icon: <Sparkles className="w-5 h-5" />, title: '智能推荐', desc: 'AI智能匹配优质供应商' },
  { icon: <BarChart3 className="w-5 h-5" />, title: '自动比价', desc: '多维度价格对比分析' },
  { icon: <Layers className="w-5 h-5" />, title: '多级审批', desc: '灵活配置审批流程' },
  { icon: <Truck className="w-5 h-5" />, title: '全球物流', desc: '跨境物流全程追踪' },
];

export default function Login() {
  const navigate = useNavigate();
  const { login, isLoading } = useUserStore();
  const [formData, setFormData] = useState({
    role: 'buyer' as UserRole,
    username: '',
    password: '',
    rememberMe: false,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showPassword, setShowPassword] = useState(false);
  const [animateIn, setAnimateIn] = useState(false);

  useEffect(() => {
    const savedCredentials = localStorage.getItem('rememberedCredentials');
    if (savedCredentials) {
      try {
        const parsed = JSON.parse(savedCredentials);
        setFormData({
          ...formData,
          username: parsed.username || '',
          role: parsed.role || 'buyer',
          rememberMe: true,
        });
      } catch {
          // ignore
        }
    }
    setTimeout(() => setAnimateIn(true), 100);
  }, []);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.username.trim()) {
      newErrors.username = '请输入用户名';
    } else if (formData.username.length < 3) {
      newErrors.username = '用户名至少3个字符';
    }

    if (!formData.password) {
      newErrors.password = '请输入密码';
    } else if (formData.password.length < 6) {
      newErrors.password = '密码至少6个字符';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    const result = await login(formData.username, formData.password);

    if (result.success) {
      if (formData.rememberMe) {
        localStorage.setItem(
          'rememberedCredentials',
          JSON.stringify({
            username: formData.username,
            role: formData.role,
          })
        );
      } else {
        localStorage.removeItem('rememberedCredentials');
      }

      navigate('/dashboard');
    } else {
      setErrors({
        password: result.message,
      });
    }
  };

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-950 via-primary-900 to-primary-950 flex items-center justify-center p-4 sm:p-6 lg:p-8 overflow-hidden relative">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-primary-500/20 rounded-full blur-3xl animate-float" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-success-500/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-warning-500/5 rounded-full blur-3xl" />
        <div className="absolute inset-0 bg-grid-pattern opacity-30" />
      </div>

      <div
        className={cn(
          'relative w-full max-w-6xl transition-all duration-700',
          animateIn ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
        )}
      >
        <div className="grid lg:grid-cols-2 gap-0 overflow-hidden rounded-3xl shadow-2xl bg-white/5 backdrop-blur-xl border border-white/10">
          <div className="hidden lg:flex flex-col justify-between p-8 lg:p-12 bg-gradient-to-br from-primary-950/90 to-primary-900/90 relative overflow-hidden">
            <div className="absolute inset-0">
              <div className="absolute top-20 right-20 w-64 h-64 bg-primary-500/10 rounded-full blur-3xl" />
              <div className="absolute bottom-20 left-20 w-64 h-64 bg-success-500/10 rounded-full blur-3xl" />
            </div>

            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-8">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center shadow-lg shadow-primary-500/30">
                  <Globe className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-white font-display">
                    全球采购平台
                  </h1>
                  <p className="text-primary-200 text-sm">Global Procurement Platform</p>
                </div>
              </div>

              <div className="space-y-3 mb-8">
                <h2 className="text-4xl font-bold text-white font-display leading-tight">
                  智能采购

                  <br />
                  <span className="bg-gradient-to-r from-primary-300 to-success-300 bg-clip-text text-transparent">
                    协同共赢
                  </span>
                </h2>
                <p className="text-primary-200 text-lg leading-relaxed">
                  集成供应商管理、智能询价报价、多级审批采购订单、报关物流、质检退货、财务结算全流程，实现采购全链路数字化管控。
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {features.map((feature, index) => (
                  <div
                    key={index}
                    className={cn(
                      'bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10 transition-all duration-300 hover:bg-white/10 hover:border-primary-500/30 group'
                    )}
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary-500/20 to-primary-600/20 flex items-center justify-center text-primary-300 group-hover:from-primary-500 group-hover:text-white transition-all">
                        {feature.icon}
                      </div>
                      <div>
                        <h3 className="text-white font-medium text-sm">
                          {feature.title}
                        </h3>
                        <p className="text-primary-300 text-xs">
                          {feature.desc}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative z-10 flex items-center gap-6 pt-8 border-t border-white/10">
              <div className="flex -space-x-3">
                {['A', 'B', 'C', 'D'].map((letter, i) => (
                  <div
                    key={i}
                    className="w-10 h-10 rounded-full border-2 border-primary-900 bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white text-sm font-medium"
                  >
                    {letter}
                  </div>
                ))}
              </div>
              <div>
                <p className="text-white text-sm font-medium">
                  500+ 企业信赖
                </p>
                <p className="text-primary-300 text-xs">
                  超过10,000+ 供应商入驻
                </p>
              </div>
            </div>
          </div>

          <div className="p-6 sm:p-8 lg:p-12">
            <div className="max-w-md mx-auto">
              <div className="lg:hidden mb-8 text-center">
                <div className="flex items-center justify-center gap-3 mb-6">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center">
                    <Globe className="w-6 h-6 text-white" />
                  </div>
                </div>
                <h2 className="text-2xl font-bold text-white font-display">
                  全球采购平台
                </h2>
              </div>

              <div className="mb-8">
                <h2 className="text-2xl font-bold text-white font-display mb-2">
                  欢迎回来
                </h2>
                <p className="text-slate-400">
                  请登录您的账号以继续
                </p>
              </div>

              <Card className="bg-transparent border-0 shadow-none p-0">
                <form onSubmit={handleSubmit} className="space-y-5">
                  <Select
                    label="选择角色"
                    value={formData.role}
                    onChange={(e) => handleInputChange('role', e.target.value as UserRole)}
                    options={roleOptions}
                    className="!bg-white/5 !text-white !border-white/20 !placeholder:text-slate-500 focus:!border-primary-500 focus:!ring-primary-500/20"
                  />

                  <Input
                    label="用户名"
                    type="text"
                    placeholder="请输入用户名"
                    value={formData.username}
                    onChange={(e) => handleInputChange('username', e.target.value)}
                    prefixIcon={<User className="w-4 h-4" />}
                    error={errors.username}
                    className="!bg-white/5 !text-white !border-white/20 !placeholder:text-slate-500 focus:!border-primary-500 focus:!ring-primary-500/20"
                  />

                  <Input
                    label="密码"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="请输入密码"
                    value={formData.password}
                    onChange={(e) => handleInputChange('password', e.target.value)}
                    prefixIcon={<Lock className="w-4 h-4" />}
                    suffixIcon={
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="text-slate-400 hover:text-white transition-colors"
                      >
                        {showPassword ? (
                          <EyeOff className="w-4 h-4" />
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                      </button>
                    }
                    error={errors.password}
                    className="!bg-white/5 !text-white !border-white/20 !placeholder:text-slate-500 focus:!border-primary-500 focus:!ring-primary-500/20"
                  />

                  <div className="flex items-center justify-between">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.rememberMe}
                        onChange={(e) => handleInputChange('rememberMe', e.target.checked)}
                        className="w-4 h-4 rounded border-white/20 bg-white/5 text-primary-500 focus:ring-primary-500/20"
                      />
                      <span className="text-sm text-slate-400">记住我</span>
                    </label>

                    <button
                      type="button"
                      className="text-sm text-primary-400 hover:text-primary-300 transition-colors"
                    >
                      忘记密码?
                    </button>
                  </div>

                  <Button
                    type="submit"
                    size="lg"
                    fullWidth
                    loading={isLoading}
                    className="!bg-gradient-to-r !from-primary-500 !to-primary-600 hover:!from-primary-600 hover:!to-primary-700"
                  >
                    登录
                  </Button>
                </form>

                <div className="mt-6 p-4 rounded-xl bg-white/5 border border-white/10">
                  <p className="text-xs text-slate-400 mb-2">测试账号：</p>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="flex items-center gap-1.5 text-slate-400">
                      <CheckCircle2 className="w-3 h-3 text-success-400" />
                      <span>采购员: buyer1 / buyer123</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-slate-400">
                      <CheckCircle2 className="w-3 h-3 text-success-400" />
                      <span>经理: manager1 / manager123</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-slate-400">
                      <CheckCircle2 className="w-3 h-3 text-success-400" />
                      <span>管理员: admin / admin123</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-slate-400">
                      <CheckCircle2 className="w-3 h-3 text-success-400" />
                      <span>财务: finance1 / finance123</span>
                    </div>
                  </div>
                </div>
              </Card>

              <div className="mt-8">
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-white/10" />
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-4 bg-transparent text-slate-500">还没有账号?</span>
                  </div>
                </div>

                <Link
                  to="/supplier-register"
                  className="mt-4 w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg border border-primary-500/30 text-primary-400 hover:bg-primary-500/10 hover:text-primary-300 transition-all group"
                >
                  <Building2 className="w-4 h-4" />
                  <span className="text-sm font-medium">供应商入驻申请</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>

              <p className="mt-6 text-center text-xs text-slate-600">
                登录即表示您同意我们的
                <button className="text-slate-400 hover:text-slate-300 mx-1">服务条款</button>
                和
                <button className="text-slate-400 hover:text-slate-300 mx-1">隐私政策</button>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
