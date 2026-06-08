import { ReactNode, useState } from 'react';
import { Search, Filter, X, ChevronDown, ChevronUp, RotateCcw } from 'lucide-react';
import { cn } from '@/lib/utils';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';

export interface FilterField {
  key: string;
  label: string;
  type: 'text' | 'select' | 'date' | 'daterange' | 'number';
  placeholder?: string;
  options?: { label: string; value: string | number }[];
  defaultValue?: unknown;
}

export interface FilterPanelProps {
  fields: FilterField[];
  onFilter: (values: Record<string, unknown>) => void;
  onReset?: () => void;
  className?: string;
  showSearch?: boolean;
  searchPlaceholder?: string;
  onSearch?: (keyword: string) => void;
  defaultExpanded?: boolean;
  glass?: boolean;
  extra?: ReactNode;
}

export default function FilterPanel({
  fields,
  onFilter,
  onReset,
  className,
  showSearch = true,
  searchPlaceholder = '搜索...',
  onSearch,
  defaultExpanded = true,
  glass = false,
  extra,
}: FilterPanelProps) {
  const [expanded, setExpanded] = useState(defaultExpanded);
  const [keyword, setKeyword] = useState('');
  const [filterValues, setFilterValues] = useState<Record<string, unknown>>({});

  const handleFilterChange = (key: string, value: unknown) => {
    setFilterValues((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleSearch = () => {
    onSearch?.(keyword);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const handleSubmit = () => {
    onFilter(filterValues);
  };

  const handleReset = () => {
    setFilterValues({});
    setKeyword('');
    onReset?.();
  };

  const hasActiveFilters = Object.keys(filterValues).some(
    (key) => filterValues[key] !== undefined && filterValues[key] !== '' && filterValues[key] !== null,
  );

  const renderField = (field: FilterField) => {
    const value = filterValues[field.key] ?? '';

    switch (field.type) {
      case 'text':
        return (
          <Input
            key={field.key}
            label={field.label}
            placeholder={field.placeholder}
            value={value as string}
            onChange={(e) => handleFilterChange(field.key, e.target.value)}
            wrapperClassName="flex-1 min-w-[180px]"
          />
        );
      case 'select':
        return (
          <Select
            key={field.key}
            label={field.label}
            value={value as string}
            onChange={(e) => handleFilterChange(field.key, e.target.value)}
            options={[
              { label: '全部', value: '' },
              ...(field.options || []),
            ]}
            wrapperClassName="flex-1 min-w-[180px]"
          />
        );
      case 'date':
        return (
          <Input
            key={field.key}
            type="date"
            label={field.label}
            value={value as string}
            onChange={(e) => handleFilterChange(field.key, e.target.value)}
            wrapperClassName="flex-1 min-w-[180px]"
          />
        );
      case 'number':
        return (
          <Input
            key={field.key}
            type="number"
            label={field.label}
            placeholder={field.placeholder}
            value={value as string | number}
            onChange={(e) => handleFilterChange(field.key, e.target.value)}
            wrapperClassName="flex-1 min-w-[180px]"
          />
        );
      case 'daterange':
        return (
          <div key={field.key} className="flex items-end gap-2 flex-1 min-w-[320px]">
            <Input
              type="date"
              label={`${field.label} 开始`}
              value={(value as { start?: string })?.start || ''}
              onChange={(e) =>
                handleFilterChange(field.key, {
                  ...(value as object),
                  start: e.target.value,
                })
              }
              wrapperClassName="flex-1"
            />
            <span className="text-slate-400 pb-2">至</span>
            <Input
              type="date"
              label={`${field.label} 结束`}
              value={(value as { end?: string })?.end || ''}
              onChange={(e) =>
                handleFilterChange(field.key, {
                  ...(value as object),
                  end: e.target.value,
                })
              }
              wrapperClassName="flex-1"
            />
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div
      className={cn(
        'rounded-xl border transition-all duration-300',
        glass ? 'card-glass' : 'card',
        className,
      )}
    >
      <div className="flex items-center justify-between p-4 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-primary-500" />
          <span className="font-medium text-slate-800">筛选条件</span>
          {hasActiveFilters && (
            <span className="px-1.5 py-0.5 text-xs bg-primary-100 text-primary-600 rounded-full">
              已筛选
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {extra}
          <button
            onClick={() => setExpanded(!expanded)}
            className="p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
          >
            {expanded ? (
              <ChevronUp className="w-4 h-4 text-slate-500" />
            ) : (
              <ChevronDown className="w-4 h-4 text-slate-500" />
            )}
          </button>
        </div>
      </div>

      {expanded && (
        <div className="p-4 space-y-4">
          {showSearch && (
            <div className="flex gap-3">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder={searchPlaceholder}
                  value={keyword}
                  onChange={(e) => setKeyword(e.target.value)}
                  onKeyPress={handleKeyPress}
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
              <Button variant="primary" onClick={handleSearch}>
                搜索
              </Button>
            </div>
          )}

          <div className="flex flex-wrap items-end gap-4">
            {fields.map(renderField)}
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
            <Button variant="secondary" size="sm" onClick={handleReset} icon={<RotateCcw className="w-4 h-4" />}>
              重置
            </Button>
            <Button variant="primary" size="sm" onClick={handleSubmit}>
              应用筛选
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
