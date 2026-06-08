import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import Button from '@/components/ui/Button';
import Select from '@/components/ui/Select';

export interface PaginationProps {
  current: number;
  pageSize: number;
  total: number;
  onChange: (page: number, pageSize: number) => void;
  showSizeChanger?: boolean;
  showQuickJumper?: boolean;
  showTotal?: boolean;
  pageSizeOptions?: number[];
  className?: string;
  simple?: boolean;
}

export default function Pagination({
  current,
  pageSize,
  total,
  onChange,
  showSizeChanger = true,
  showQuickJumper = false,
  showTotal = true,
  pageSizeOptions = [10, 20, 50, 100],
  className,
  simple = false,
}: PaginationProps) {
  const totalPages = Math.ceil(total / pageSize);

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages && page !== current) {
      onChange(page, pageSize);
    }
  };

  const handlePageSizeChange = (newSize: number) => {
    const newPage = Math.min(current, Math.ceil(total / newSize));
    onChange(Math.max(1, newPage), newSize);
  };

  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const delta = 2;
    const left = Math.max(2, current - delta);
    const right = Math.min(totalPages - 1, current + delta);

    pages.push(1);

    if (left > 2) {
      pages.push('...');
    }

    for (let i = left; i <= right; i++) {
      pages.push(i);
    }

    if (right < totalPages - 1) {
      pages.push('...');
    }

    if (totalPages > 1) {
      pages.push(totalPages);
    }

    return pages;
  };

  const pages = getPageNumbers();

  if (simple) {
    return (
      <div className={cn('flex items-center gap-2', className)}>
        <Button
          variant="secondary"
          size="sm"
          onClick={() => handlePageChange(current - 1)}
          disabled={current === 1}
          icon={<ChevronLeft className="w-4 h-4" />}
        />
        <span className="text-sm text-slate-600">
          {current} / {totalPages}
        </span>
        <Button
          variant="secondary"
          size="sm"
          onClick={() => handlePageChange(current + 1)}
          disabled={current === totalPages}
          icon={<ChevronRight className="w-4 h-4" />}
        />
      </div>
    );
  }

  return (
    <div className={cn('flex flex-wrap items-center justify-between gap-4', className)}>
      {showTotal && (
        <div className="text-sm text-slate-500">
          共 <span className="font-medium text-slate-700">{total}</span> 条记录
          {total > 0 && (
            <span className="ml-1">
              ，第 <span className="font-medium text-slate-700">{(current - 1) * pageSize + 1}</span>-
              <span className="font-medium text-slate-700">
                {Math.min(current * pageSize, total)}
              </span>{' '}
              条
            </span>
          )}
        </div>
      )}

      <div className="flex items-center gap-2">
        {showSizeChanger && (
          <div className="flex items-center gap-2">
            <Select
              value={pageSize}
              onChange={(e) => handlePageSizeChange(Number(e.target.value))}
              options={pageSizeOptions.map((size) => ({
                label: `${size} 条/页`,
                value: size,
              }))}
              wrapperClassName="w-28"
            />
          </div>
        )}

        <div className="flex items-center gap-1">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => handlePageChange(1)}
            disabled={current === 1}
            icon={<ChevronsLeft className="w-4 h-4" />}
            className="px-2"
          />
          <Button
            variant="secondary"
            size="sm"
            onClick={() => handlePageChange(current - 1)}
            disabled={current === 1}
            icon={<ChevronLeft className="w-4 h-4" />}
            className="px-2"
          />

          {pages.map((page, index) =>
            typeof page === 'number' ? (
              <Button
                key={index}
                variant={page === current ? 'primary' : 'secondary'}
                size="sm"
                onClick={() => handlePageChange(page)}
                className="px-3 min-w-[36px]"
              >
                {page}
              </Button>
            ) : (
              <span key={index} className="px-2 text-slate-400">
                {page}
              </span>
            ),
          )}

          <Button
            variant="secondary"
            size="sm"
            onClick={() => handlePageChange(current + 1)}
            disabled={current === totalPages}
            icon={<ChevronRight className="w-4 h-4" />}
            className="px-2"
          />
          <Button
            variant="secondary"
            size="sm"
            onClick={() => handlePageChange(totalPages)}
            disabled={current === totalPages}
            icon={<ChevronsRight className="w-4 h-4" />}
            className="px-2"
          />
        </div>

        {showQuickJumper && (
          <div className="flex items-center gap-2 ml-2">
            <span className="text-sm text-slate-500">跳至</span>
            <input
              type="number"
              min={1}
              max={totalPages}
              defaultValue=""
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  const value = Number((e.target as HTMLInputElement).value);
                  if (value >= 1 && value <= totalPages) {
                    handlePageChange(value);
                    (e.target as HTMLInputElement).value = '';
                  }
                }
              }}
              className="w-16 px-2 py-1.5 text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all"
            />
            <span className="text-sm text-slate-500">页</span>
          </div>
        )}
      </div>
    </div>
  );
}
