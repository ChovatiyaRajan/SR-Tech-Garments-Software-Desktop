import React from 'react';

interface PageHeaderProps {
  title: string;
  description?: string;
  primaryAction?: {
    label: string;
    onClick: () => void;
    icon?: React.ReactNode;
  };
  secondaryActions?: Array<{
    label: string;
    onClick: () => void;
    icon?: React.ReactNode;
  }>;
}

export const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  description,
  primaryAction,
  secondaryActions
}) => {
  return (
    <div className="bg-white border-b border-slate-200 px-4 py-4 sm:px-6 sm:py-5 mb-6 shadow-2xs">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">{title}</h1>
          {description && (
            <p className="mt-1 text-sm text-slate-500 max-w-2xl">{description}</p>
          )}
        </div>

        {(primaryAction || (secondaryActions && secondaryActions.length > 0)) && (
          <div className="flex flex-wrap items-center gap-2.5 sm:self-center">
            {secondaryActions?.map((act, i) => (
              <button
                key={i}
                type="button"
                onClick={act.onClick}
                className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-md hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-500 transition-colors shadow-2xs cursor-pointer"
              >
                {act.icon}
                {act.label}
              </button>
            ))}

            {primaryAction && (
              <button
                type="button"
                onClick={primaryAction.onClick}
                className="inline-flex items-center justify-center gap-1.5 px-4 py-2 text-sm font-semibold text-white bg-slate-900 border border-transparent rounded-md hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:ring-offset-1 transition-colors shadow-2xs cursor-pointer"
              >
                {primaryAction.icon}
                {primaryAction.label}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
