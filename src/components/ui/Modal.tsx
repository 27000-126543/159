import { ReactNode, useEffect } from 'react';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';
import Button from './Button';

export interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
  width?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  maskClosable?: boolean;
  closable?: boolean;
}

export default function Modal({
  open,
  onClose,
  title,
  children,
  footer,
  width = 'md',
  maskClosable = true,
  closable = true,
}: ModalProps) {
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && open) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [open, onClose]);

  if (!open) return null;

  const widthStyles: Record<string, string> = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-2xl',
    full: 'max-w-6xl',
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className={cn(
          'absolute inset-0 bg-slate-900/50 backdrop-blur-sm transition-opacity duration-300',
          open ? 'opacity-100' : 'opacity-0',
        )}
        onClick={() => maskClosable && onClose()}
      />
      <div
        className={cn(
          'relative z-10 bg-white rounded-xl shadow-2xl w-full mx-4 overflow-hidden transition-all duration-300 animate-slide-up',
          widthStyles[width],
        )}
      >
        {(title || closable) && (
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
            {title && <h3 className="text-lg font-semibold text-slate-900">{title}</h3>}
            {closable && (
              <button
                onClick={onClose}
                className="p-1 rounded-lg hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5 text-slate-400" />
              </button>
            )}
          </div>
        )}
        <div className="px-6 py-5 max-h-[70vh] overflow-y-auto scrollbar-thin">
          {children}
        </div>
        {footer && (
          <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-slate-100 bg-slate-50/50">
            {footer !== true ? (
              footer
            ) : (
              <>
                <Button variant="secondary" onClick={onClose}>
                  取消
                </Button>
                <Button variant="primary">确定</Button>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
