import React, { useEffect } from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info';
  message: string;
}

interface ToastProps {
  message: string;
  type?: 'success' | 'error' | 'info';
  onClose: () => void;
}

export const Toast: React.FC<ToastProps> = ({ message, type = 'success', onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 4000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const styles = {
    success: 'bg-slate-900 text-white border-slate-800',
    error: 'bg-rose-900 text-white border-rose-800',
    info: 'bg-slate-800 text-white border-slate-700'
  };

  const icons = {
    success: <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />,
    error: <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />,
    info: <Info className="w-5 h-5 text-sky-400 shrink-0" />
  };

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col max-w-sm w-full pointer-events-none px-4 sm:px-0">
      <div
        className={`pointer-events-auto flex items-center justify-between p-3.5 rounded-lg border shadow-lg ${styles[type]} transition-all transform duration-200`}
      >
        <div className="flex items-center gap-3">
          {icons[type]}
          <p className="text-xs sm:text-sm font-medium pr-2">{message}</p>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="p-1 text-slate-400 hover:text-white rounded-md transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export const ToastContainer: React.FC<{ toasts: ToastMessage[]; onDismiss: (id: string) => void }> = ({
  toasts,
  onDismiss
}) => {
  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none px-4 sm:px-0">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`pointer-events-auto flex items-center justify-between p-3.5 rounded-lg border shadow-lg ${
            toast.type === 'success'
              ? 'bg-slate-900 text-white border-slate-800'
              : toast.type === 'error'
              ? 'bg-rose-900 text-white border-rose-800'
              : 'bg-slate-800 text-white border-slate-700'
          }`}
        >
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            <p className="text-xs sm:text-sm font-medium pr-2">{toast.message}</p>
          </div>
          <button
            type="button"
            onClick={() => onDismiss(toast.id)}
            className="p-1 text-slate-400 hover:text-white rounded-md transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ))}
    </div>
  );
};
