import { ReactNode, useMemo } from 'react';
import { cn } from '@/lib/utils';
import { ChevronUp, ChevronDown, ChevronsUpDown } from 'lucide-react';

export interface TableColumn<T = any> {
  key: keyof T | string;
  title: ReactNode;
  dataIndex?: keyof T;
  width?: number | string;
  sortable?: boolean;
  render?: (value: unknown, record: T, index: number) => ReactNode;
  align?: 'left' | 'center' | 'right';
}

export interface TableProps<T = Record<string, unknown>> {
  columns: TableColumn<T>[];
  dataSource: T[];
  rowKey?: keyof T | ((record: T) => string);
  loading?: boolean;
  emptyText?: ReactNode;
  onSort?: (key: keyof T | string, direction: 'asc' | 'desc' | null) => void;
  sortField?: keyof T | string;
  sortOrder?: 'asc' | 'desc' | null;
  className?: string;
  headerClassName?: string;
  rowClassName?: string | ((record: T, index: number) => string);
  onRowClick?: (record: T, index: number) => void;
  showHeader?: boolean;
  bordered?: boolean;
  size?: 'small' | 'medium' | 'large';
}

export default function Table<T extends Record<string, any> = Record<string, any>>({
  columns,
  dataSource,
  rowKey = 'id' as keyof T,
  loading = false,
  emptyText = '暂无数据',
  onSort,
  sortField,
  sortOrder,
  className,
  headerClassName,
  rowClassName,
  onRowClick,
  showHeader = true,
  bordered = false,
  size = 'medium',
}: TableProps<T>) {
  const sizeStyles = {
    small: 'px-3 py-2 text-xs',
    medium: 'px-4 py-3 text-sm',
    large: 'px-6 py-4 text-base',
  };

  const getRowKey = (record: T, index: number): string => {
    if (typeof rowKey === 'function') {
      return rowKey(record);
    }
    return String(record[rowKey] ?? index);
  };

  const handleSort = (col: TableColumn<T>) => {
    if (!col.sortable || !onSort) return;

    const key = col.key;
    let newDirection: 'asc' | 'desc' | null = 'asc';

    if (sortField === key) {
      if (sortOrder === 'asc') newDirection = 'desc';
      else if (sortOrder === 'desc') newDirection = null;
    }

    onSort(key, newDirection);
  };

  const SortIcon = ({ col }: { col: TableColumn<T> }) => {
    if (!col.sortable) return null;

    const isActive = sortField === col.key;

    if (isActive && sortOrder === 'asc') {
      return <ChevronUp className="w-4 h-4 text-primary-500" />;
    }
    if (isActive && sortOrder === 'desc') {
      return <ChevronDown className="w-4 h-4 text-primary-500" />;
    }
    return <ChevronsUpDown className="w-4 h-4 text-slate-300" />;
  };

  const alignStyles: Record<string, string> = {
    left: 'text-left',
    center: 'text-center',
    right: 'text-right',
  };

  const processedData = useMemo(() => {
    if (!sortField || !sortOrder) return dataSource;

    const sorted = [...dataSource].sort((a, b) => {
      const col = columns.find((c) => c.key === sortField);
      if (!col) return 0;

      const dataIndex = col.dataIndex || (col.key as keyof T);
      const aVal = a[dataIndex];
      const bVal = b[dataIndex];

      if (typeof aVal === 'number' && typeof bVal === 'number') {
        return sortOrder === 'asc' ? aVal - bVal : bVal - aVal;
      }

      const aStr = String(aVal ?? '');
      const bStr = String(bVal ?? '');
      return sortOrder === 'asc' ? aStr.localeCompare(bStr) : bStr.localeCompare(aStr);
    });

    return sorted;
  }, [dataSource, sortField, sortOrder, columns]);

  return (
    <div className={cn('overflow-x-auto scrollbar-thin', className)}>
      <table
        className={cn(
          'data-table',
          bordered && 'border border-slate-200',
        )}
      >
        {showHeader && (
          <thead className={headerClassName}>
            <tr>
              {columns.map((col) => (
                <th
                  key={String(col.key)}
                  className={cn(
                    sizeStyles[size],
                    alignStyles[col.align || 'left'],
                    col.sortable && 'cursor-pointer hover:bg-slate-100 select-none',
                  )}
                  style={{ width: col.width }}
                  onClick={() => handleSort(col)}
                >
                  <div className="flex items-center gap-1">
                    {col.title}
                    <SortIcon col={col} />
                  </div>
                </th>
              ))}
            </tr>
          </thead>
        )}
        <tbody>
          {loading ? (
            <tr>
              <td colSpan={columns.length} className="text-center py-12">
                <div className="flex flex-col items-center gap-2">
                  <div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
                  <span className="text-slate-500">加载中...</span>
                </div>
              </td>
            </tr>
          ) : processedData.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="text-center py-12">
                <div className="flex flex-col items-center gap-2 text-slate-400">
                  <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                  </svg>
                  <span>{emptyText}</span>
                </div>
              </td>
            </tr>
          ) : (
            processedData.map((record, index) => {
              const key = getRowKey(record, index);
              const className =
                typeof rowClassName === 'function'
                  ? rowClassName(record, index)
                  : rowClassName;

              return (
                <tr
                  key={key}
                  className={cn(
                    onRowClick && 'cursor-pointer hover:bg-slate-50',
                    className,
                  )}
                  onClick={() => onRowClick?.(record, index)}
                >
                  {columns.map((col) => {
                    const dataIndex = col.dataIndex || (col.key as keyof T);
                    const value = record[dataIndex];
                    const content = col.render
                      ? col.render(value, record, index)
                      : value;

                    return (
                      <td
                        key={String(col.key)}
                        className={cn(
                          sizeStyles[size],
                          alignStyles[col.align || 'left'],
                        )}
                      >
                        {content as ReactNode}
                      </td>
                    );
                  })}
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
}
