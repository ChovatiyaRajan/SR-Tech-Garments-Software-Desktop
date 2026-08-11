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
    <div className="bg-white border border-slate-300 rounded px-3 py-2.5 mb-3 shadow-2xs">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div>
          <h1 className="text-base font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <span>{title}</span>
          </h1>
          {description && (
            <p className="text-xs text-slate-500 font-normal">{description}</p>
          )}
        </div>

        {(primaryAction || (secondaryActions && secondaryActions.length > 0)) && (
          <div className="flex flex-wrap items-center gap-2 sm:self-center">
            {secondaryActions?.map((act, i) => (
              <button
                key={i}
                type="button"
                onClick={act.onClick}
                className="inline-flex items-center justify-center gap-1 px-2.5 py-1 text-xs font-semibold text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-300 rounded focus:outline-none transition-colors cursor-pointer"
              >
                {act.icon}
                <span>{act.label}</span>
              </button>
            ))}

            {primaryAction && (
              <button
                type="button"
                onClick={primaryAction.onClick}
                className="inline-flex items-center justify-center gap-1 px-3 py-1 text-xs font-bold text-white bg-slate-900 border border-slate-900 rounded hover:bg-indigo-700 hover:border-indigo-700 focus:outline-none transition-colors shadow-2xs cursor-pointer"
              >
                {primaryAction.icon}
                <span>{primaryAction.label}</span>
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
