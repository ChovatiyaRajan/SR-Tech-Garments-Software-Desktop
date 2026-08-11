import React from 'react';
import { PackageOpen } from 'lucide-react';

interface EmptyStateProps {
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
    icon?: React.ReactNode;
  };
}

export const EmptyState: React.FC<EmptyStateProps> = ({ title, description, action }) => {
  return (
    <div className="bg-white border border-slate-200 border-dashed rounded-lg p-8 sm:p-12 text-center my-4">
      <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-3 text-slate-400">
        <PackageOpen className="w-6 h-6" />
      </div>
      <h3 className="text-base font-semibold text-slate-900">{title}</h3>
      <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-sm mx-auto">{description}</p>
      {action && (
        <button
          type="button"
          onClick={action.onClick}
          className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-slate-900 rounded-md hover:bg-slate-800 transition-colors cursor-pointer shadow-2xs"
        >
          {action.icon}
          {action.label}
        </button>
      )}
    </div>
  );
};
