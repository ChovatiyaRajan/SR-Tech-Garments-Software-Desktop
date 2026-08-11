import React from 'react';
import {
  Package,
  ShoppingCart,
  Scissors,
  Users,
  FileText,
  AlertTriangle,
  ArrowRight,
  Plus,
  IndianRupee,
  Building2,
  CheckCircle2,
  TrendingUp,
  Boxes
} from 'lucide-react';
import { erpService } from '../../services/storage';
import { PageHeader } from '../common/PageHeader';
import { StatusBadge } from '../common/StatusBadge';
import { NavModule } from '../common/ERPLayout';

interface DashboardViewProps {
  onNavigate: (module: NavModule, param?: string) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({ onNavigate }) => {
  const purchases = erpService.getPurchases();
  const rawMaterials = erpService.getRawMaterials();
  const cutPieces = erpService.getCutPieces();
  const finishedProducts = erpService.getFinishedProducts();
  const invoices = erpService.getInvoices();
  const employees = erpService.getEmployees();
  const salaryRecords = erpService.getSalaryRecords();

  const totalRawStock = rawMaterials.reduce((sum, rm) => sum + rm.availableQuantity, 0);
  const totalCutStock = cutPieces.reduce((sum, cp) => sum + cp.remainingCutPieces, 0);
  const totalFinishedStock = finishedProducts.reduce((sum, fp) => sum + fp.availableForAssignmentQty, 0);

  const totalUnpaidInvoices = invoices.filter(i => i.paymentStatus !== 'PAID');
  const totalDueAmount = totalUnpaidInvoices.reduce((sum, i) => sum + i.dueAmount, 0);

  const pendingSalaries = salaryRecords.filter(s => s.status !== 'PAID');
  const pendingSalaryAmount = pendingSalaries.reduce((sum, s) => sum + s.remainingAmount, 0);

  // Attention Required: Lots ready for invoice or with unassigned finished goods
  const lotsWithUnassignedGoods = finishedProducts.filter(fp => fp.availableForAssignmentQty > 0);
  const readyForInvoiceLots = finishedProducts.filter(fp => fp.status === 'READY_FOR_INVOICE' || fp.availableForAssignmentQty === 0);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Business Operations Dashboard"
        description="Real-time overview of purchases, production inventory, wholesaler accounts, and workforce."
        primaryAction={{
          label: "New Purchase",
          onClick: () => onNavigate('purchases'),
          icon: <Plus className="w-4 h-4" />
        }}
        secondaryActions={[
          {
            label: "All Lots & Progress",
            onClick: () => onNavigate('all_lots'),
            icon: <Boxes className="w-4 h-4" />
          }
        ]}
      />

      {/* Top Operational Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div
          onClick={() => onNavigate('raw_materials')}
          className="bg-white border border-slate-200 rounded-lg p-4 shadow-2xs hover:border-slate-300 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Raw Material Stock</span>
            <div className="p-2 bg-slate-100 text-slate-700 rounded-md group-hover:bg-slate-900 group-hover:text-white transition-colors">
              <ShoppingCart className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900">{totalRawStock.toLocaleString()}</span>
            <span className="text-xs font-medium text-slate-500">meters</span>
          </div>
          <p className="mt-2 text-xs text-slate-500 flex items-center gap-1">
            <span>Across {rawMaterials.length} active lots</span>
            <ArrowRight className="w-3 h-3 text-slate-400 ml-auto group-hover:translate-x-0.5 transition-transform" />
          </p>
        </div>

        <div
          onClick={() => onNavigate('cut_pieces')}
          className="bg-white border border-slate-200 rounded-lg p-4 shadow-2xs hover:border-slate-300 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Cut Pieces Stock</span>
            <div className="p-2 bg-slate-100 text-slate-700 rounded-md group-hover:bg-slate-900 group-hover:text-white transition-colors">
              <Scissors className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900">{totalCutStock.toLocaleString()}</span>
            <span className="text-xs font-medium text-slate-500">pieces</span>
          </div>
          <p className="mt-2 text-xs text-slate-500 flex items-center gap-1">
            <span>Ready for tailor assignment</span>
            <ArrowRight className="w-3 h-3 text-slate-400 ml-auto group-hover:translate-x-0.5 transition-transform" />
          </p>
        </div>

        <div
          onClick={() => onNavigate('finished_products')}
          className="bg-white border border-slate-200 rounded-lg p-4 shadow-2xs hover:border-slate-300 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Finished Goods</span>
            <div className="p-2 bg-slate-100 text-slate-700 rounded-md group-hover:bg-slate-900 group-hover:text-white transition-colors">
              <Package className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900">{totalFinishedStock.toLocaleString()}</span>
            <span className="text-xs font-medium text-slate-500">items</span>
          </div>
          <p className="mt-2 text-xs text-slate-500 flex items-center gap-1">
            <span>Available for employee dispatch</span>
            <ArrowRight className="w-3 h-3 text-slate-400 ml-auto group-hover:translate-x-0.5 transition-transform" />
          </p>
        </div>

        <div
          onClick={() => onNavigate('invoices')}
          className="bg-white border border-slate-200 rounded-lg p-4 shadow-2xs hover:border-slate-300 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Payables Due</span>
            <div className="p-2 bg-slate-100 text-slate-700 rounded-md group-hover:bg-slate-900 group-hover:text-white transition-colors">
              <IndianRupee className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-1">
            <span className="text-2xl font-bold text-slate-900">₹{totalDueAmount.toLocaleString()}</span>
          </div>
          <p className="mt-2 text-xs text-slate-500 flex items-center gap-1">
            <span>{totalUnpaidInvoices.length} outstanding invoices</span>
            <ArrowRight className="w-3 h-3 text-slate-400 ml-auto group-hover:translate-x-0.5 transition-transform" />
          </p>
        </div>
      </div>

      {/* Main Grid: Attention Required + Workflow Quick Access */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Attention Required */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white border border-slate-200 rounded-lg shadow-2xs overflow-hidden">
            <div className="p-4 border-b border-slate-200 bg-slate-50/70 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-600" />
                <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                  Attention Required
                </h2>
              </div>
              <span className="text-xs font-semibold text-slate-500">Action items</span>
            </div>

            <div className="divide-y divide-slate-200">
              {lotsWithUnassignedGoods.length > 0 && lotsWithUnassignedGoods.map((fp) => (
                <div key={fp.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50 transition-colors">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded border border-slate-300">
                        {fp.lotNumber}
                      </span>
                      <span className="text-xs font-medium text-slate-700">{fp.productName}</span>
                    </div>
                    <p className="text-xs text-slate-500 mt-1">
                      <strong className="text-slate-800">{fp.availableForAssignmentQty}</strong> finished items unassigned. Assign to employees to proceed towards invoice generation.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => onNavigate('finished_products')}
                    className="inline-flex items-center justify-center gap-1 px-3 py-1.5 text-xs font-semibold text-white bg-slate-900 rounded hover:bg-slate-800 transition-colors cursor-pointer shrink-0"
                  >
                    Assign Goods
                  </button>
                </div>
              ))}

              {totalUnpaidInvoices.length > 0 && totalUnpaidInvoices.map((inv) => (
                <div key={inv.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50 transition-colors">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded border border-slate-300">
                        {inv.invoiceNumber}
                      </span>
                      <span className="text-xs font-medium text-slate-700">{inv.wholesalerName}</span>
                      <StatusBadge status={inv.paymentStatus} size="sm" />
                    </div>
                    <p className="text-xs text-slate-500 mt-1">
                      Outstanding due amount: <strong className="text-slate-900">₹{inv.dueAmount.toLocaleString()}</strong> for Lot {inv.lotNumber}.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => onNavigate('wholesaler_payments')}
                    className="inline-flex items-center justify-center gap-1 px-3 py-1.5 text-xs font-semibold text-slate-800 bg-slate-100 border border-slate-300 rounded hover:bg-slate-200 transition-colors cursor-pointer shrink-0"
                  >
                    Record Payment
                  </button>
                </div>
              ))}

              {lotsWithUnassignedGoods.length === 0 && totalUnpaidInvoices.length === 0 && (
                <div className="p-8 text-center text-slate-500 text-xs">
                  <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
                  All lot assignments and invoice payments are up to date!
                </div>
              )}
            </div>
          </div>

          {/* Recent Purchases & Lots Summary */}
          <div className="bg-white border border-slate-200 rounded-lg shadow-2xs overflow-hidden">
            <div className="p-4 border-b border-slate-200 bg-slate-50/70 flex items-center justify-between">
              <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                Recent Purchase Lots
              </h2>
              <button
                type="button"
                onClick={() => onNavigate('purchases')}
                className="text-xs font-semibold text-slate-700 hover:text-slate-900 cursor-pointer"
              >
                View All →
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-slate-100/60 border-b border-slate-200 font-semibold text-slate-600 uppercase">
                    <th className="py-2.5 px-4">Lot No.</th>
                    <th className="py-2.5 px-4">Wholesaler</th>
                    <th className="py-2.5 px-4">Material</th>
                    <th className="py-2.5 px-4 text-right">Quantity</th>
                    <th className="py-2.5 px-4 text-right">Amount</th>
                    <th className="py-2.5 px-4 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 text-slate-700">
                  {purchases.slice(0, 5).map((pur) => (
                    <tr key={pur.id} className="hover:bg-slate-50">
                      <td className="py-3 px-4 font-mono font-bold text-slate-900">{pur.lotNumber}</td>
                      <td className="py-3 px-4">{pur.wholesalerName}</td>
                      <td className="py-3 px-4">{pur.materialName}</td>
                      <td className="py-3 px-4 text-right font-mono">{pur.totalQuantity} {pur.unit}</td>
                      <td className="py-3 px-4 text-right font-mono">₹{pur.purchaseAmount.toLocaleString()}</td>
                      <td className="py-3 px-4 text-center">
                        <button
                          type="button"
                          onClick={() => onNavigate('lot_detail', pur.lotNumber)}
                          className="text-slate-700 font-semibold hover:underline cursor-pointer"
                        >
                          View Lot
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right Column: Workflow Steps & Quick Navigation */}
        <div className="space-y-6">
          <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-2xs">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3 pb-2 border-b border-slate-200">
              Software Workflow Shortcuts
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Execute steps in the frozen manufacturing process:
            </p>

            <div className="space-y-2">
              <button
                type="button"
                onClick={() => onNavigate('purchases')}
                className="w-full flex items-center justify-between p-2.5 rounded-md border border-slate-200 hover:bg-slate-50 transition-colors text-left text-xs font-semibold text-slate-800 cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded bg-slate-900 text-white text-[10px] flex items-center justify-center font-bold">1</span>
                  <span>Purchases & Wholesalers</span>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
              </button>

              <button
                type="button"
                onClick={() => onNavigate('cutting')}
                className="w-full flex items-center justify-between p-2.5 rounded-md border border-slate-200 hover:bg-slate-50 transition-colors text-left text-xs font-semibold text-slate-800 cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded bg-slate-900 text-white text-[10px] flex items-center justify-center font-bold">2</span>
                  <span>Start Cutting & Pieces</span>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
              </button>

              <button
                type="button"
                onClick={() => onNavigate('cut_pieces')}
                className="w-full flex items-center justify-between p-2.5 rounded-md border border-slate-200 hover:bg-slate-50 transition-colors text-left text-xs font-semibold text-slate-800 cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded bg-slate-900 text-white text-[10px] flex items-center justify-center font-bold">3</span>
                  <span>Tailor Assignment</span>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
              </button>

              <button
                type="button"
                onClick={() => onNavigate('stitching')}
                className="w-full flex items-center justify-between p-2.5 rounded-md border border-slate-200 hover:bg-slate-50 transition-colors text-left text-xs font-semibold text-slate-800 cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded bg-slate-900 text-white text-[10px] flex items-center justify-center font-bold">4</span>
                  <span>Record Stitching Output</span>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
              </button>

              <button
                type="button"
                onClick={() => onNavigate('finished_products')}
                className="w-full flex items-center justify-between p-2.5 rounded-md border border-slate-200 hover:bg-slate-50 transition-colors text-left text-xs font-semibold text-slate-800 cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded bg-slate-900 text-white text-[10px] flex items-center justify-center font-bold">5</span>
                  <span>Employee Goods Dispatch</span>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
              </button>

              <button
                type="button"
                onClick={() => onNavigate('invoices')}
                className="w-full flex items-center justify-between p-2.5 rounded-md border border-slate-200 hover:bg-slate-50 transition-colors text-left text-xs font-semibold text-slate-800 cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded bg-slate-900 text-white text-[10px] flex items-center justify-center font-bold">6</span>
                  <span>Final Invoice & Settlement</span>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
              </button>
            </div>
          </div>

          <div className="bg-slate-900 text-white rounded-lg p-5 shadow-2xs">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
              Workforce Overview
            </h3>
            <div className="space-y-3 my-3 text-xs">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <span className="text-slate-400">Total Active Employees</span>
                <span className="font-bold text-white">{employees.length}</span>
              </div>
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <span className="text-slate-400">Pending Salary Balance</span>
                <span className="font-bold text-emerald-400">₹{pendingSalaryAmount.toLocaleString()}</span>
              </div>
            </div>
            <button
              type="button"
              onClick={() => onNavigate('salary')}
              className="w-full mt-2 py-2 text-xs font-semibold text-slate-900 bg-white rounded hover:bg-slate-100 transition-colors cursor-pointer"
            >
              Manage Salary & Upaad
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
