import React, { useEffect } from 'react';
import { X } from 'lucide-react';

interface DrawerProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  size?: 'md' | 'lg' | 'xl';
}

export const Drawer: React.FC<DrawerProps> = ({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  footer,
  size = 'lg'
}) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const sizeMap = {
    md: 'sm:max-w-md',
    lg: 'sm:max-w-xl',
    xl: 'sm:max-w-2xl'
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-0 sm:pl-10">
        <div className={`w-screen ${sizeMap[size]} bg-white shadow-2xl flex flex-col border-l border-slate-400`}>
          {/* Header Bar */}
          <div className="px-3.5 py-2 border-b border-slate-800 bg-slate-900 text-white flex items-center justify-between select-none">
            <div>
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-100 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-indigo-400" />
                {title}
              </h2>
              {subtitle && <p className="text-[10px] text-slate-400 font-normal">{subtitle}</p>}
            </div>
            <button
              type="button"
              onClick={onClose}
              className="p-1 text-slate-300 hover:text-white rounded hover:bg-slate-800 focus:outline-none transition-colors cursor-pointer"
              title="Close (Esc)"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4 bg-slate-50/20">
            {children}
          </div>

          {/* Footer */}
          {footer && (
            <div className="px-4 py-2.5 border-t border-slate-300 bg-slate-100 flex items-center justify-end gap-2">
              {footer}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
