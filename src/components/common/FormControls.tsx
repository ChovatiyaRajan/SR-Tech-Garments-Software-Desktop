import React from 'react';

interface FormSectionProps {
  title: string;
  description?: string;
  children: React.ReactNode;
}

export const FormSection: React.FC<FormSectionProps> = ({ title, description, children }) => (
  <div className="bg-slate-50/60 border border-slate-200/80 rounded-lg p-4 sm:p-5 mb-5">
    <div className="border-b border-slate-200/80 pb-3 mb-4">
      <h3 className="text-sm font-semibold text-slate-900 uppercase tracking-wider">{title}</h3>
      {description && <p className="text-xs text-slate-500 mt-0.5">{description}</p>}
    </div>
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
      {children}
    </div>
  </div>
);

interface InputFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  required?: boolean;
  unit?: string;
  colSpan?: 1 | 2;
  helperText?: string;
}

export const InputField: React.FC<InputFieldProps> = ({
  label,
  error,
  required,
  unit,
  colSpan = 1,
  helperText,
  className = '',
  ...props
}) => {
  const spanClass = colSpan === 2 ? 'sm:col-span-2' : 'sm:col-span-1';

  return (
    <div className={spanClass}>
      <label className="block text-xs font-semibold text-slate-700 mb-1.5">
        {label} {required && <span className="text-rose-600">*</span>}
      </label>
      <div className="relative rounded-md shadow-2xs">
        <input
          {...props}
          className={`w-full h-10 px-3 py-2 text-sm text-slate-900 bg-white border ${
            error ? 'border-rose-400 focus:ring-rose-500 focus:border-rose-500' : 'border-slate-300 focus:ring-slate-800 focus:border-slate-800'
          } rounded-md focus:outline-none focus:ring-2 focus:ring-offset-0 disabled:bg-slate-100 disabled:text-slate-500 transition-colors ${
            unit ? 'pr-12' : ''
          } ${className}`}
        />
        {unit && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-xs text-slate-500 bg-slate-50 border-l border-slate-300 rounded-r-md px-2.5 font-medium">
            {unit}
          </div>
        )}
      </div>
      {helperText && !error && (
        <p className="mt-1 text-xs text-slate-500">{helperText}</p>
      )}
      {error && (
        <p className="mt-1 text-xs font-medium text-rose-600">{error}</p>
      )}
    </div>
  );
};

interface SelectFieldProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  options: Array<{ value: string; label: string }>;
  error?: string;
  required?: boolean;
  colSpan?: 1 | 2;
  onQuickAdd?: () => void;
  quickAddTitle?: string;
}

export const SelectField: React.FC<SelectFieldProps> = ({
  label,
  options,
  error,
  required,
  colSpan = 1,
  onQuickAdd,
  quickAddTitle = 'Add New',
  className = '',
  ...props
}) => {
  const spanClass = colSpan === 2 ? 'sm:col-span-2' : 'sm:col-span-1';

  return (
    <div className={spanClass}>
      <div className="flex items-center justify-between mb-1.5">
        <label className="block text-xs font-semibold text-slate-700">
          {label} {required && <span className="text-rose-600">*</span>}
        </label>
        {onQuickAdd && (
          <button
            type="button"
            onClick={onQuickAdd}
            className="text-xs font-semibold text-slate-700 hover:text-slate-900 hover:underline flex items-center gap-1 cursor-pointer"
          >
            + {quickAddTitle}
          </button>
        )}
      </div>
      <div className="relative rounded-md shadow-2xs">
        <select
          {...props}
          className={`w-full h-10 px-3 py-2 text-sm text-slate-900 bg-white border ${
            error ? 'border-rose-400 focus:ring-rose-500 focus:border-rose-500' : 'border-slate-300 focus:ring-slate-800 focus:border-slate-800'
          } rounded-md focus:outline-none focus:ring-2 focus:ring-offset-0 disabled:bg-slate-100 disabled:text-slate-500 transition-colors ${className}`}
        >
          <option value="">-- Select {label} --</option>
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>
      {error && (
        <p className="mt-1 text-xs font-medium text-rose-600">{error}</p>
      )}
    </div>
  );
};
