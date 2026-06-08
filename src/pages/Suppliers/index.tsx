import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  Plus,
  Sparkles,
  Grid3X3,
  List,
  Star,
  MapPin,
  Package,
  Clock,
  CheckCircle2,
  Eye,
  Edit,
  Trash2,
  Filter,
  X,
  Loader2,
} from 'lucide-react';
import { useSupplierStore, supplierSelectors } from '@/store/supplierStore';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Badge from '@/components/ui/Badge';
import Table from '@/components/ui/Table';
import StatusBadge from '@/components/business/StatusBadge';
import Pagination from '@/components/business/Pagination';
import { formatCurrency, formatPercent, formatNumber } from '@/utils/format';
import { cn } from '@/lib/utils';
import type { Supplier } from '@/mock/data/suppliers';
import type { TableColumn } from '@/components/ui/Table';

const statusOptions = [
  { label: '全部', value: '' },
  { label: '待审核', value: 'pending' },
  { label: '已通过', value: 'approved' },
  { label: '已拒绝', value: 'rejected' },
  { label: '已暂停', value: 'suspended' },
];

const ratingOptions = [
  { label: '全部星级', value: '' },
  { label: '5星及以上', value: '5' },
  { label: '4星及以上', value: '4' },
  { label: '3星及以上', value: '3' },
  { label: '2星及以上', value: '2' },
];

const categoryOptions = [
  { label: '全部品类', value: '' },
  { label: '电子元器件', value: '电子元器件' },
  { label: '机械设备', value: '机械设备' },
  { label: '原材料', value: '原材料' },
];

const regionOptions = [
  { label: '全部区域', value: '' },
  { label: '亚洲', value: '亚洲' },
  { label: '欧洲', value: '欧洲' },
  { label: '北美洲', value: '北美洲' },
];

const countryOptions = [
  { label: '全部国家', value: '' },
  { label: '中国', value: '中国' },
  { label: '美国', value: '美国' },
  { label: '德国', value: '德国' },
  { label: '日本', value: '日本' },
  { label: '韩国', value: '韩国' },
  { label: '法国', value: '法国' },
  { label: '瑞士', value: '瑞士' },
  { label: '意大利', value: '意大利' },
];

const StarRating = ({ rating }: { rating: number }) => {
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 >= 0.5;

  return (
    <div className="flex items-center gap-0.5">
      {[...Array(5)].map((_, i) => (
        <Star
          key={i}
          className={cn(
            'w-4 h-4',
            i < fullStars
              ? 'text-warning-500 fill-warning-500'
              : i === fullStars && hasHalfStar
              ? 'text-warning-500 fill-warning-500'
              : 'text-slate-300',
          )}
        />
      ))}
      <span className="ml-1 text-sm font-medium text-slate-700">{rating.toFixed(1)}</span>
    </div>
  );
};

const SupplierCard = ({
  supplier,
  isRecommended = false,
  onView,
  onEdit,
  onDelete,
}: {
  supplier: Supplier;
  isRecommended?: boolean;
  onView: (id: string) => void;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
}) => {
  return (
    <Card hoverable className="relative overflow-hidden">
      {isRecommended && (
        <div className="absolute top-3 right-3 z-10">
          <Badge variant="primary" className="flex items-center gap-1">
            <Sparkles className="w-3 h-3" />
            推荐
          </Badge>
        </div>
      )}
      <div className="flex items-start gap-4 mb-4">
        <img
          src={supplier.logo}
          alt={supplier.name}
          className="w-14 h-14 rounded-xl object-cover bg-slate-100"
        />
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-slate-800 truncate">{supplier.name}</h3>
          <div className="flex items-center gap-2 mt-1 text-sm text-slate-500">
            <MapPin className="w-3.5 h-3.5" />
            <span className="truncate">{supplier.country}</span>
          </div>
          <div className="mt-2">
            <StarRating rating={supplier.rating} />
          </div>
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-center gap-2 flex-wrap">
          <Badge variant="primary" className="text-xs">
            {supplier.category}
          </Badge>
          {supplier.certification.slice(0, 2).map((cert) => (
            <Badge key={cert} variant="default" className="text-xs">
              {cert}
            </Badge>
          ))}
          {supplier.certification.length > 2 && (
            <Badge variant="default" className="text-xs">
              +{supplier.certification.length - 2}
            </Badge>
          )}
        </div>

        <div className="grid grid-cols-2 gap-3 py-3 border-y border-slate-100">
          <div>
            <div className="flex items-center gap-1 text-xs text-slate-500 mb-1">
              <Package className="w-3 h-3" />
              月产能
            </div>
            <div className="text-sm font-semibold text-slate-800">
              {formatNumber(Math.floor(Math.random() * 500000 + 100000))}
            </div>
          </div>
          <div>
            <div className="flex items-center gap-1 text-xs text-slate-500 mb-1">
              <Clock className="w-3 h-3" />
              历史订单
            </div>
            <div className="text-sm font-semibold text-slate-800">
              {supplier.orderCount} 单
            </div>
          </div>
          <div>
            <div className="flex items-center gap-1 text-xs text-slate-500 mb-1">
              <CheckCircle2 className="w-3 h-3" />
              准时率
            </div>
            <div className="text-sm font-semibold text-slate-800">
              {formatPercent(supplier.onTimeDeliveryRate, 1)}
            </div>
          </div>
          <div>
            <div className="flex items-center gap-1 text-xs text-slate-500 mb-1">
              <CheckCircle2 className="w-3 h-3" />
              合格率
            </div>
            <div className="text-sm font-semibold text-slate-800">
              {formatPercent(supplier.qualityPassRate, 1)}
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <StatusBadge type="supplier" status={supplier.qualificationStatus} />
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              icon={<Eye className="w-4 h-4" />}
              onClick={() => onView(supplier.id)}
            />
            <Button
              variant="ghost"
              size="sm"
              icon={<Edit className="w-4 h-4" />}
              onClick={() => onEdit(supplier.id)}
            />
            <Button
              variant="ghost"
              size="sm"
              icon={<Trash2 className="w-4 h-4 text-danger-500" />}
              onClick={() => onDelete(supplier.id)}
            />
          </div>
        </div>
      </div>
    </Card>
  );
};

export default function Suppliers() {
  const navigate = useNavigate();
  const [viewMode, setViewMode] = useState<'card' | 'table'>('card');
  const [showRecommendations, setShowRecommendations] = useState(true);
  const [keyword, setKeyword] = useState('');
  const [filters, setFilters] = useState({
    category: '',
    region: '',
    country: '',
    rating: '',
    status: '',
  });
  const [sortField, setSortField] = useState<string | null>(null);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc' | null>(null);

  const {
    suppliers,
    total,
    page,
    pageSize,
    loading,
    categories,
    countries,
    recommendations,
    fetchSuppliers,
    fetchSmartRecommendations,
    fetchCategories,
    fetchCountries,
    deleteSupplier,
    setFilterParams,
  } = useSupplierStore();

  useEffect(() => {
    fetchCategories();
    fetchCountries();
  }, [fetchCategories, fetchCountries]);

  useEffect(() => {
    fetchSuppliers({
      page: 1,
      pageSize,
      keyword: keyword || undefined,
      category: filters.category || undefined,
      country: filters.country || undefined,
      rating: filters.rating ? Number(filters.rating) : undefined,
      qualificationStatus: filters.status || undefined,
    });
  }, [keyword, filters, pageSize, fetchSuppliers]);

  useEffect(() => {
    fetchSmartRecommendations({ category: filters.category || '电子元器件' });
  }, [filters.category, fetchSmartRecommendations]);

  const handlePageChange = (newPage: number, newPageSize: number) => {
    fetchSuppliers({
      page: newPage,
      pageSize: newPageSize,
      keyword: keyword || undefined,
      category: filters.category || undefined,
      country: filters.country || undefined,
      rating: filters.rating ? Number(filters.rating) : undefined,
      qualificationStatus: filters.status || undefined,
    });
  };

  const handleFilterChange = (key: string, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const handleReset = () => {
    setKeyword('');
    setFilters({
      category: '',
      region: '',
      country: '',
      rating: '',
      status: '',
    });
    setFilterParams({});
  };

  const handleSearch = () => {
    fetchSuppliers({
      page: 1,
      pageSize,
      keyword: keyword || undefined,
      category: filters.category || undefined,
      country: filters.country || undefined,
      rating: filters.rating ? Number(filters.rating) : undefined,
      qualificationStatus: filters.status || undefined,
    });
  };

  const handleView = (id: string) => {
    navigate(`/suppliers/${id}`);
  };

  const handleEdit = (id: string) => {
    navigate(`/suppliers/${id}`);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('确定要删除该供应商吗？')) {
      await deleteSupplier(id);
    }
  };

  const handleSort = (key: string | number | symbol, direction: 'asc' | 'desc' | null) => {
    setSortField(String(key));
    setSortOrder(direction);
  };

  const tableColumns: TableColumn<Supplier>[] = [
    {
      key: 'name',
      title: '供应商名称',
      dataIndex: 'name',
      sortable: true,
      render: (_, record) => (
        <div className="flex items-center gap-3">
          <img
            src={record.logo}
            alt={record.name}
            className="w-10 h-10 rounded-lg object-cover bg-slate-100"
          />
          <div>
            <div className="font-medium text-slate-800">{record.name}</div>
            <div className="text-xs text-slate-500">{record.code}</div>
          </div>
        </div>
      ),
    },
    {
      key: 'country',
      title: '国家',
      dataIndex: 'country',
      sortable: true,
      render: (value) => (
        <div className="flex items-center gap-1">
          <MapPin className="w-3.5 h-3.5 text-slate-400" />
          <span>{value as string}</span>
        </div>
      ),
    },
    {
      key: 'category',
      title: '品类',
      dataIndex: 'category',
      sortable: true,
    },
    {
      key: 'rating',
      title: '评分',
      dataIndex: 'rating',
      sortable: true,
      render: (value) => <StarRating rating={value as number} />,
    },
    {
      key: 'certification',
      title: '资质',
      dataIndex: 'certification',
      render: (value) => (
        <div className="flex flex-wrap gap-1">
          {(value as string[]).slice(0, 2).map((cert) => (
            <Badge key={cert} variant="default" className="text-xs">
              {cert}
            </Badge>
          ))}
          {(value as string[]).length > 2 && (
            <Badge variant="default" className="text-xs">
              +{(value as string[]).length - 2}
            </Badge>
          )}
        </div>
      ),
    },
    {
      key: 'capacity',
      title: '月产能',
      render: () => formatNumber(Math.floor(Math.random() * 500000 + 100000)),
    },
    {
      key: 'onTimeDeliveryRate',
      title: '准时率',
      dataIndex: 'onTimeDeliveryRate',
      sortable: true,
      render: (value) => formatPercent(value as number, 1),
    },
    {
      key: 'qualityPassRate',
      title: '合格率',
      dataIndex: 'qualityPassRate',
      sortable: true,
      render: (value) => formatPercent(value as number, 1),
    },
    {
      key: 'qualificationStatus',
      title: '状态',
      dataIndex: 'qualificationStatus',
      sortable: true,
      render: (value) => <StatusBadge type="supplier" status={value as string} />,
    },
    {
      key: 'actions',
      title: '操作',
      align: 'center',
      width: 140,
      render: (_, record) => (
        <div className="flex items-center justify-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            icon={<Eye className="w-4 h-4" />}
            onClick={() => handleView(record.id)}
          />
          <Button
            variant="ghost"
            size="sm"
            icon={<Edit className="w-4 h-4" />}
            onClick={() => handleEdit(record.id)}
          />
          <Button
            variant="ghost"
            size="sm"
            icon={<Trash2 className="w-4 h-4 text-danger-500" />}
            onClick={() => handleDelete(record.id)}
          />
        </div>
      ),
    },
  ];

  const hasActiveFilters =
    keyword ||
    filters.category ||
    filters.region ||
    filters.country ||
    filters.rating ||
    filters.status;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">供应商管理</h1>
          <p className="text-slate-500 mt-1">管理和查看所有供应商信息</p>
        </div>
        <Button
          variant="primary"
          icon={<Plus className="w-4 h-4" />}
          onClick={() => navigate('/suppliers/register')}
        >
          新增供应商
        </Button>
      </div>

      <Card glass className="p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-primary-500" />
            <span className="font-medium text-slate-800">筛选条件</span>
            {hasActiveFilters && (
              <Badge variant="primary" className="text-xs">
                已筛选
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant={showRecommendations ? 'primary' : 'secondary'}
              size="sm"
              icon={<Sparkles className="w-4 h-4" />}
              onClick={() => setShowRecommendations(!showRecommendations)}
            >
              智能推荐
            </Button>
            <div className="flex items-center bg-slate-100 rounded-lg p-1">
              <button
                className={cn(
                  'px-3 py-1.5 rounded-md text-sm font-medium transition-all',
                  viewMode === 'card'
                    ? 'bg-white text-slate-800 shadow-sm'
                    : 'text-slate-500 hover:text-slate-700',
                )}
                onClick={() => setViewMode('card')}
              >
                <Grid3X3 className="w-4 h-4" />
              </button>
              <button
                className={cn(
                  'px-3 py-1.5 rounded-md text-sm font-medium transition-all',
                  viewMode === 'table'
                    ? 'bg-white text-slate-800 shadow-sm'
                    : 'text-slate-500 hover:text-slate-700',
                )}
                onClick={() => setViewMode('table')}
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="搜索供应商名称、联系人..."
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                className="w-full pl-10 pr-10 py-2.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all"
              />
              {keyword && (
                <button
                  onClick={() => setKeyword('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 rounded hover:bg-slate-100"
                >
                  <X className="w-3.5 h-3.5 text-slate-400" />
                </button>
              )}
            </div>
            <Button variant="primary" onClick={handleSearch} icon={<Search className="w-4 h-4" />}>
              搜索
            </Button>
          </div>

          <div className="flex flex-wrap items-end gap-4">
            <Select
              label="品类筛选"
              value={filters.category}
              onChange={(e) => handleFilterChange('category', e.target.value)}
              options={categoryOptions}
              wrapperClassName="flex-1 min-w-[180px]"
            />
            <Select
              label="区域筛选"
              value={filters.region}
              onChange={(e) => handleFilterChange('region', e.target.value)}
              options={regionOptions}
              wrapperClassName="flex-1 min-w-[180px]"
            />
            <Select
              label="国家筛选"
              value={filters.country}
              onChange={(e) => handleFilterChange('country', e.target.value)}
              options={countryOptions}
              wrapperClassName="flex-1 min-w-[180px]"
            />
            <Select
              label="评分筛选"
              value={filters.rating}
              onChange={(e) => handleFilterChange('rating', e.target.value)}
              options={ratingOptions}
              wrapperClassName="flex-1 min-w-[180px]"
            />
            <Select
              label="状态筛选"
              value={filters.status}
              onChange={(e) => handleFilterChange('status', e.target.value)}
              options={statusOptions}
              wrapperClassName="flex-1 min-w-[180px]"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
            <Button variant="secondary" size="sm" onClick={handleReset}>
              重置
            </Button>
            <Button variant="primary" size="sm" onClick={handleSearch}>
              应用筛选
            </Button>
          </div>
        </div>
      </Card>

      {showRecommendations && recommendations.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-gradient-to-br from-primary-500 to-primary-600">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-slate-800">智能推荐优质供应商</h2>
              <p className="text-sm text-slate-500">基于历史交易、评分、产能等多维度智能推荐</p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {recommendations.slice(0, 4).map((supplier) => (
              <SupplierCard
                key={supplier.id}
                supplier={supplier}
                isRecommended
                onView={handleView}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            ))}
          </div>
        </div>
      )}

      <Card>
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 text-primary-500 animate-spin" />
          </div>
        ) : viewMode === 'card' ? (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {suppliers.map((supplier) => (
                <SupplierCard
                  key={supplier.id}
                  supplier={supplier}
                  onView={handleView}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                />
              ))}
            </div>
          </div>
        ) : (
          <Table
            columns={tableColumns as any}
            dataSource={suppliers as any[]}
            rowKey="id"
            loading={loading}
            onSort={handleSort}
            sortField={sortField}
            sortOrder={sortOrder}
            onRowClick={(record) => handleView((record as any).id)}
          />
        )}

        {suppliers.length > 0 && (
          <div className="pt-4 border-t border-slate-100">
            <Pagination
              current={page}
              pageSize={pageSize}
              total={total}
              onChange={handlePageChange}
            />
          </div>
        )}
      </Card>
    </div>
  );
}
