import React from 'react';
import { Check, Circle } from 'lucide-react';
import { LotStatus } from '../../types/erp';
import { NavModule } from './ERPLayout';

interface ProcessTrackerProps {
  status: LotStatus;
  currentStepIndex?: number;
  lotNumber?: string;
  onNavigateStep?: (module: NavModule, lotNumber?: string) => void;
}

const STEPS: { id: string; label: string; module: NavModule }[] = [
  { id: 'PURCHASED', label: 'Purchase', module: 'purchases' },
  { id: 'RAW_MATERIAL', label: 'Raw Material', module: 'raw_materials' },
  { id: 'CUTTING', label: 'Cutting', module: 'cutting' },
  { id: 'TAILOR', label: 'Tailor', module: 'tailors' },
  { id: 'STITCHING', label: 'Stitching', module: 'stitching' },
  { id: 'FINISHED_GOODS', label: 'Finished', module: 'finished_products' },
  { id: 'EMPLOYEE_ASSIGNED', label: 'Employee', module: 'employees' },
  { id: 'READY_FOR_INVOICE', label: 'Invoice', module: 'invoices' },
  { id: 'PAID', label: 'Payment', module: 'wholesaler_payments' }
];

export function getStepStateIndex(status: LotStatus): number {
  switch (status) {
    case 'PURCHASED': return 0;
    case 'RAW_MATERIAL': return 1;
    case 'CUTTING_IN_PROGRESS':
    case 'CUT_PIECES_READY': return 2;
    case 'TAILOR_ASSIGNED': return 3;
    case 'STITCHING_IN_PROGRESS': return 4;
    case 'FINISHED_GOODS': return 5;
    case 'EMPLOYEE_ASSIGNED': return 6;
    case 'READY_FOR_INVOICE':
    case 'INVOICED': return 7;
    case 'PAID': return 8;
    default: return 0;
  }
}

export function getActiveModuleForStatus(status: LotStatus): NavModule {
  switch (status) {
    case 'PURCHASED': return 'purchases';
    case 'RAW_MATERIAL': return 'raw_materials';
    case 'CUTTING_IN_PROGRESS': return 'cutting';
    case 'CUT_PIECES_READY': return 'cut_pieces';
    case 'TAILOR_ASSIGNED': return 'tailors';
    case 'STITCHING_IN_PROGRESS': return 'stitching';
    case 'FINISHED_GOODS': return 'finished_products';
    case 'EMPLOYEE_ASSIGNED': return 'employees';
    case 'READY_FOR_INVOICE':
    case 'INVOICED': return 'invoices';
    case 'PAID': return 'wholesaler_payments';
    default: return 'purchases';
  }
}

export const ProcessTracker: React.FC<ProcessTrackerProps> = ({ status, lotNumber, onNavigateStep }) => {
  const activeIdx = getStepStateIndex(status);

  return (
    <div className="bg-white border border-slate-200 rounded-lg p-4 sm:p-5 shadow-2xs">
      <div className="flex items-center justify-between mb-3 sm:mb-4">
        <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
          Lot Workflow Progress
        </h4>
        {onNavigateStep && (
          <span className="text-[10px] text-slate-400 font-medium">
            Click any step to open section
          </span>
        )}
      </div>

      {/* Desktop Step Pipeline */}
      <div className="hidden md:flex items-center justify-between relative">
        {/* Connector Line */}
        <div className="absolute top-1/2 left-4 right-4 -translate-y-1/2 h-0.5 bg-slate-200 -z-0" />

        {STEPS.map((step, idx) => {
          const isDone = idx < activeIdx || status === 'PAID';
          const isCurrent = idx === activeIdx && status !== 'PAID';

          return (
            <button
              type="button"
              key={step.id}
              onClick={() => onNavigateStep && onNavigateStep(step.module, lotNumber)}
              disabled={!onNavigateStep}
              title={`Navigate to ${step.label} section`}
              className="relative z-10 flex flex-col items-center group cursor-pointer border-0 bg-transparent p-0 disabled:cursor-default"
            >
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all group-hover:scale-110 ${
                  isDone
                    ? 'bg-emerald-600 text-white ring-2 ring-emerald-100 group-hover:bg-emerald-700'
                    : isCurrent
                    ? 'bg-slate-900 text-white ring-4 ring-slate-200 group-hover:bg-slate-800'
                    : 'bg-slate-100 text-slate-400 border border-slate-300 group-hover:bg-slate-200 group-hover:text-slate-600'
                }`}
              >
                {isDone ? <Check className="w-4 h-4 stroke-[3]" /> : idx + 1}
              </div>
              <span
                className={`mt-1.5 text-[11px] font-semibold tracking-tight whitespace-nowrap group-hover:underline ${
                  isDone
                    ? 'text-emerald-700'
                    : isCurrent
                    ? 'text-slate-900'
                    : 'text-slate-400'
                }`}
              >
                {step.label}
              </span>
            </button>
          );
        })}
      </div>

      {/* Mobile Process Scroll/Compact Pills */}
      <div className="flex md:hidden items-center gap-1.5 overflow-x-auto pb-1 text-xs">
        {STEPS.map((step, idx) => {
          const isDone = idx < activeIdx || status === 'PAID';
          const isCurrent = idx === activeIdx && status !== 'PAID';

          return (
            <button
              type="button"
              key={step.id}
              onClick={() => onNavigateStep && onNavigateStep(step.module, lotNumber)}
              disabled={!onNavigateStep}
              className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium border shrink-0 transition-all cursor-pointer disabled:cursor-default ${
                isDone
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100'
                  : isCurrent
                  ? 'bg-slate-900 text-white border-slate-900 hover:bg-slate-800'
                  : 'bg-slate-50 text-slate-500 border-slate-200 hover:bg-slate-100'
              }`}
            >
              {isDone ? <Check className="w-3 h-3" /> : <Circle className="w-2.5 h-2.5 fill-current" />}
              {step.label}
            </button>
          );
        })}
      </div>
    </div>
  );
};
