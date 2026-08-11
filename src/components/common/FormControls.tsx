import React from 'react';

interface FormSectionProps {
  title: string;
  description?: string;
  children: React.ReactNode;
}

export const FormSection: React.FC<FormSectionProps> = ({ title, description, children }) => (
  <div className="bg-slate-50 border border-slate-300 rounded p-3 sm:p-4 mb-4">
    <div className="border-b border-slate-300 pb-2 mb-3 flex items-baseline justify-between">
      <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">{title}</h3>
      {description && <p className="text-[11px] text-slate-500">{description}</p>}
    </div>
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
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
      <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wide mb-1">
        {label} {required && <span className="text-rose-600">*</span>}
      </label>
      <div className="relative rounded shadow-2xs">
        <input
          {...props}
          className={`w-full h-8.5 px-2.5 py-1 text-xs text-slate-900 bg-white border ${
            error ? 'border-rose-500 focus:ring-1 focus:ring-rose-500' : 'border-slate-300 focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600'
          } rounded focus:outline-none disabled:bg-slate-100 disabled:text-slate-500 font-medium transition-colors ${
            unit ? 'pr-12' : ''
          } ${className}`}
        />
        {unit && (
          <div className="absolute inset-y-0 right-0 pr-2 flex items-center pointer-events-none text-[11px] text-slate-600 bg-slate-100 border-l border-slate-300 rounded-r px-2 font-mono font-bold">
            {unit}
          </div>
        )}
      </div>
      {helperText && !error && (
        <p className="mt-0.5 text-[10px] text-slate-500">{helperText}</p>
      )}
      {error && (
        <p className="mt-0.5 text-[11px] font-bold text-rose-600">{error}</p>
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
      <div className="flex items-center justify-between mb-1">
        <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wide">
          {label} {required && <span className="text-rose-600">*</span>}
        </label>
        {onQuickAdd && (
          <button
            type="button"
            onClick={onQuickAdd}
            className="text-[10px] font-bold text-indigo-700 hover:text-indigo-900 hover:underline cursor-pointer"
          >
            + {quickAddTitle}
          </button>
        )}
      </div>
      <div className="relative rounded shadow-2xs">
        <select
          {...props}
          className={`w-full h-8.5 px-2.5 py-1 text-xs text-slate-900 bg-white border ${
            error ? 'border-rose-500 focus:ring-1 focus:ring-rose-500' : 'border-slate-300 focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600'
          } rounded focus:outline-none disabled:bg-slate-100 disabled:text-slate-500 font-medium transition-colors ${className}`}
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
        <p className="mt-0.5 text-[11px] font-bold text-rose-600">{error}</p>
      )}
    </div>
  );
};

