import React, { useEffect } from 'react';
import { X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl';
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  footer,
  maxWidth = 'md'
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

  const widthMap = {
    sm: 'sm:max-w-sm',
    md: 'sm:max-w-md',
    lg: 'sm:max-w-lg',
    xl: 'sm:max-w-xl'
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="min-h-screen px-4 text-center flex items-center justify-center">
        {/* Backdrop */}
        <div
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity"
          onClick={onClose}
        />

        {/* Modal Window */}
        <div className={`inline-block w-full ${widthMap[maxWidth]} p-0 my-6 text-left align-middle bg-white rounded shadow-2xl transform transition-all relative z-10 border border-slate-400 overflow-hidden`}>
          {/* Header Bar */}
          <div className="px-3.5 py-2 border-b border-slate-800 bg-slate-900 text-white flex items-center justify-between select-none">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-100 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-indigo-400" />
                {title}
              </h3>
              {subtitle && <p className="text-[10px] text-slate-400 font-normal">{subtitle}</p>}
            </div>
            <button
              type="button"
              onClick={onClose}
              className="p-1 text-slate-300 hover:text-white rounded hover:bg-slate-800 focus:outline-none transition-colors cursor-pointer"
              title="Close Dialog (Esc)"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Content */}
          <div className="p-4 sm:p-5 max-h-[78vh] overflow-y-auto bg-slate-50/30">
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
