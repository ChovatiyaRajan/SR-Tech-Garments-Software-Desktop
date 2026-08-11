import React from 'react';

interface StatusBadgeProps {
  status: string;
  size?: 'sm' | 'md';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, size = 'md' }) => {
  const getStyle = (st: string) => {
    const s = st.toUpperCase();
    switch (s) {
      case 'PAID':
      case 'COMPLETED':
      case 'FULLY_USED':
      case 'FULLY_ASSIGNED':
      case 'READY_FOR_INVOICE':
        return 'bg-emerald-50 text-emerald-800 border-emerald-200 font-medium';

      case 'PARTIALLY_PAID':
      case 'PARTIALLY_USED':
      case 'PARTIALLY_ASSIGNED':
      case 'IN_STITCHING':
      case 'STITCHING_IN_PROGRESS':
      case 'CUTTING_IN_PROGRESS':
        return 'bg-amber-50 text-amber-800 border-amber-200 font-medium';

      case 'UNPAID':
      case 'PENDING':
      case 'DUE':
        return 'bg-rose-50 text-rose-800 border-rose-200 font-medium';

      case 'IN_STOCK':
      case 'READY':
      case 'AVAILABLE':
      case 'RAW_MATERIAL':
      case 'CUT_PIECES_READY':
      case 'TAILOR_ASSIGNED':
      case 'FINISHED_GOODS':
      case 'EMPLOYEE_ASSIGNED':
        return 'bg-sky-50 text-sky-800 border-sky-200 font-medium';

      case 'INVOICED':
      case 'PURCHASED':
      default:
        return 'bg-slate-100 text-slate-700 border-slate-300 font-medium';
    }
  };

  const formatText = (text: string) => {
    return text.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase());
  };

  const sizeClass = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs';

  return (
    <span className={`inline-flex items-center rounded-md border ${sizeClass} ${getStyle(status)} transition-colors`}>
      <span className="w-1.5 h-1.5 rounded-full bg-current mr-1.5 opacity-70" />
      {formatText(status)}
    </span>
  );
};
