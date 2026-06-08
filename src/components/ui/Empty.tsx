import { ReactNode } from 'react';
import { Inbox, Search, FileX, Ban } from 'lucide-react';
import { cn } from '@/lib/utils';
import Button from './Button';

type EmptyType = 'default' | 'search' | 'no-data' | 'no-permission';

export interface EmptyProps {
  type?: EmptyType;
  title?: string;
  description?: string;
  icon?: ReactNode;
  action?: {
    text: string;
    onClick: () => void;
  };
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export default function Empty({
  type = 'default',
  title,
  description,
  icon,
  action,
  className,
  size = 'md',
}: EmptyProps) {
  const typeConfig: Record<EmptyType, { icon: ReactNode; title: string; description: string }> = {
    default: {
      icon: <Inbox className="w-full h-full" />,
      title: '暂无数据',
      description: '这里还没有任何内容',
    },
    search: {
      icon: <Search className="w-full h-full" />,
      title: '未找到相关结果',
      description: '请尝试调整搜索条件或关键词',
    },
    'no-data': {
      icon: <FileX className="w-full h-full" />,
      title: '没有数据记录',
      description: '请添加数据后再查看',
    },
    'no-permission': {
      icon: <Ban className="w-full h-full" />,
      title: '无访问权限',
      description: '您没有权限查看此内容，请联系管理员',
    },
  };

  const sizeStyles: Record<string, string> = {
    sm: 'w-12 h-12',
    md: 'w-16 h-16',
    lg: 'w-24 h-24',
  };

  const config = typeConfig[type];

  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center py-12 px-4 text-center',
        className,
      )}
    >
      <div className={cn(sizeStyles[size], 'text-slate-300 mb-4')}>
        {icon || config.icon}
      </div>
      <h3 className="text-base font-medium text-slate-700 mb-1">
        {title || config.title}
      </h3>
      <p className="text-sm text-slate-400 mb-4 max-w-md">
        {description || config.description}
      </p>
      {action && (
        <Button variant="primary" size="sm" onClick={action.onClick}>
          {action.text}
        </Button>
      )}
    </div>
  );
}
