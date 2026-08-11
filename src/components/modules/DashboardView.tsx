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
    <div className="space-y-3">
      <PageHeader
        title="OPERATIONS CONTROL CENTER - DASHBOARD"
        description="Real-time operational summary of purchases, production inventory, wholesaler payables, and workforce."
        primaryAction={{
          label: "New Purchase (Alt+P)",
          onClick: () => onNavigate('purchases'),
          icon: <Plus className="w-3.5 h-3.5" />
        }}
        secondaryActions={[
          {
            label: "All Lots Progress (Alt+L)",
            onClick: () => onNavigate('all_lots'),
            icon: <Boxes className="w-3.5 h-3.5" />
          }
        ]}
      />

      {/* Top Operational Metrics - ERP Dense Panels */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
        <div
          onClick={() => onNavigate('raw_materials')}
          className="bg-white border border-slate-300 rounded p-3 shadow-2xs hover:border-indigo-600 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between border-b border-slate-100 pb-1.5 mb-2">
            <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">Raw Material Stock</span>
            <div className="p-1 bg-slate-100 text-slate-700 rounded group-hover:bg-slate-900 group-hover:text-white transition-colors">
              <ShoppingCart className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-xl font-mono font-bold text-slate-900">{totalRawStock.toLocaleString()}</span>
            <span className="text-[11px] text-slate-500 font-bold">Mtrs</span>
          </div>
          <div className="mt-1.5 text-[11px] text-slate-600 flex items-center justify-between pt-1 border-t border-slate-100">
            <span>{rawMaterials.length} Active Raw Lots</span>
            <ArrowRight className="w-3 h-3 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
          </div>
        </div>

        <div
          onClick={() => onNavigate('cut_pieces')}
          className="bg-white border border-slate-300 rounded p-3 shadow-2xs hover:border-indigo-600 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between border-b border-slate-100 pb-1.5 mb-2">
            <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">Cut Pieces Stock</span>
            <div className="p-1 bg-slate-100 text-slate-700 rounded group-hover:bg-slate-900 group-hover:text-white transition-colors">
              <Scissors className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-xl font-mono font-bold text-slate-900">{totalCutStock.toLocaleString()}</span>
            <span className="text-[11px] text-slate-500 font-bold">Pcs</span>
          </div>
          <div className="mt-1.5 text-[11px] text-slate-600 flex items-center justify-between pt-1 border-t border-slate-100">
            <span>Ready for Tailor Alloc</span>
            <ArrowRight className="w-3 h-3 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
          </div>
        </div>

        <div
          onClick={() => onNavigate('finished_products')}
          className="bg-white border border-slate-300 rounded p-3 shadow-2xs hover:border-indigo-600 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between border-b border-slate-100 pb-1.5 mb-2">
            <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">Finished Goods</span>
            <div className="p-1 bg-slate-100 text-slate-700 rounded group-hover:bg-slate-900 group-hover:text-white transition-colors">
              <Package className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-xl font-mono font-bold text-slate-900">{totalFinishedStock.toLocaleString()}</span>
            <span className="text-[11px] text-slate-500 font-bold">Items</span>
          </div>
          <div className="mt-1.5 text-[11px] text-slate-600 flex items-center justify-between pt-1 border-t border-slate-100">
            <span>Available for Dispatch</span>
            <ArrowRight className="w-3 h-3 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
          </div>
        </div>

        <div
          onClick={() => onNavigate('invoices')}
          className="bg-white border border-slate-300 rounded p-3 shadow-2xs hover:border-indigo-600 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between border-b border-slate-100 pb-1.5 mb-2">
            <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">Wholesaler Payables Due</span>
            <div className="p-1 bg-slate-100 text-slate-700 rounded group-hover:bg-slate-900 group-hover:text-white transition-colors">
              <IndianRupee className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-xl font-mono font-bold text-rose-700">₹{totalDueAmount.toLocaleString()}</span>
          </div>
          <div className="mt-1.5 text-[11px] text-slate-600 flex items-center justify-between pt-1 border-t border-slate-100">
            <span>{totalUnpaidInvoices.length} Unpaid Invoices</span>
            <ArrowRight className="w-3 h-3 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
          </div>
        </div>
      </div>

      {/* Main Grid: Attention Required + Workflow Quick Access */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
        {/* Left Column: Attention Required & Recent Purchases */}
        <div className="lg:col-span-2 space-y-3">
          {/* Action Alerts */}
          <div className="bg-white border border-slate-300 rounded shadow-2xs overflow-hidden">
            <div className="px-3 py-2 border-b border-slate-300 bg-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-amber-600" />
                <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  ACTION REQUIRED - OPERATIONAL ALERTS
                </h2>
              </div>
              <span className="text-[10px] font-bold text-slate-600 font-mono bg-amber-100 border border-amber-300 px-1.5 py-0.5 rounded">
                {lotsWithUnassignedGoods.length + totalUnpaidInvoices.length} Pending
              </span>
            </div>

            <div className="divide-y divide-slate-200">
              {lotsWithUnassignedGoods.length > 0 && lotsWithUnassignedGoods.map((fp) => (
                <div key={fp.id} className="p-2.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2 hover:bg-slate-50 transition-colors">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-slate-900 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-300">
                        {fp.lotNumber}
                      </span>
                      <span className="text-xs font-bold text-slate-800">{fp.productName}</span>
                    </div>
                    <p className="text-[11px] text-slate-600 mt-0.5">
                      <strong className="text-slate-900 font-mono">{fp.availableForAssignmentQty}</strong> finished items unassigned. Assign to employees for invoice billing.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => onNavigate('finished_products')}
                    className="inline-flex items-center justify-center gap-1 px-2.5 py-1 text-xs font-bold text-white bg-slate-900 rounded hover:bg-indigo-700 transition-colors cursor-pointer shrink-0"
                  >
                    Assign Goods
                  </button>
                </div>
              ))}

              {totalUnpaidInvoices.length > 0 && totalUnpaidInvoices.map((inv) => (
                <div key={inv.id} className="p-2.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2 hover:bg-slate-50 transition-colors">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-slate-900 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-300">
                        {inv.invoiceNumber}
                      </span>
                      <span className="text-xs font-bold text-slate-800">{inv.wholesalerName}</span>
                      <StatusBadge status={inv.paymentStatus} size="sm" />
                    </div>
                    <p className="text-[11px] text-slate-600 mt-0.5">
                      Due Amount: <strong className="text-rose-700 font-mono">₹{inv.dueAmount.toLocaleString()}</strong> for Lot {inv.lotNumber}.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => onNavigate('wholesaler_payments')}
                    className="inline-flex items-center justify-center gap-1 px-2.5 py-1 text-xs font-bold text-slate-800 bg-slate-100 border border-slate-300 rounded hover:bg-slate-200 transition-colors cursor-pointer shrink-0"
                  >
                    Pay Invoice
                  </button>
                </div>
              ))}

              {lotsWithUnassignedGoods.length === 0 && totalUnpaidInvoices.length === 0 && (
                <div className="p-6 text-center text-slate-500 text-xs">
                  <CheckCircle2 className="w-6 h-6 text-emerald-600 mx-auto mb-1" />
                  <span>All lot assignments and invoice settlements are up to date!</span>
                </div>
              )}
            </div>
          </div>

          {/* Recent Purchases Data Grid */}
          <div className="bg-white border border-slate-300 rounded shadow-2xs overflow-hidden">
            <div className="px-3 py-2 border-b border-slate-300 bg-slate-100 flex items-center justify-between">
              <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                RECENT PURCHASES & RAW MATERIAL LOTS
              </h2>
              <button
                type="button"
                onClick={() => onNavigate('purchases')}
                className="text-[11px] font-bold text-indigo-700 hover:text-indigo-900 hover:underline cursor-pointer"
              >
                View Full Purchases Master →
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-200/80 border-b border-slate-300 font-bold text-slate-800 uppercase tracking-wide text-[11px]">
                    <th className="py-1.5 px-3 border-r border-slate-300/70">Lot No.</th>
                    <th className="py-1.5 px-3 border-r border-slate-300/70">Wholesaler</th>
                    <th className="py-1.5 px-3 border-r border-slate-300/70">Material</th>
                    <th className="py-1.5 px-3 border-r border-slate-300/70 text-right">Quantity</th>
                    <th className="py-1.5 px-3 border-r border-slate-300/70 text-right">Amount</th>
                    <th className="py-1.5 px-3 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 text-slate-800">
                  {purchases.slice(0, 5).map((pur) => (
                    <tr key={pur.id} className="even:bg-slate-50/70 hover:bg-indigo-50/60 transition-colors">
                      <td className="py-1.5 px-3 font-mono font-bold text-slate-900 border-r border-slate-200/60">{pur.lotNumber}</td>
                      <td className="py-1.5 px-3 font-medium border-r border-slate-200/60">{pur.wholesalerName}</td>
                      <td className="py-1.5 px-3 border-r border-slate-200/60">{pur.materialName}</td>
                      <td className="py-1.5 px-3 text-right font-mono font-medium border-r border-slate-200/60">{pur.totalQuantity} {pur.unit}</td>
                      <td className="py-1.5 px-3 text-right font-mono font-bold border-r border-slate-200/60">₹{pur.purchaseAmount.toLocaleString()}</td>
                      <td className="py-1.5 px-3 text-center">
                        <button
                          type="button"
                          onClick={() => onNavigate('lot_detail', pur.lotNumber)}
                          className="text-xs font-bold text-indigo-700 hover:text-indigo-900 hover:underline cursor-pointer"
                        >
                          Audit Lot
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right Column: Workflow Steps & Workforce Overview */}
        <div className="space-y-3">
          <div className="bg-white border border-slate-300 rounded p-3 shadow-2xs">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2 pb-1.5 border-b border-slate-300 flex items-center justify-between">
              <span>WORKFLOW SHORTCUTS</span>
              <span className="text-[10px] text-slate-500 font-mono font-normal">F-Keys</span>
            </h3>

            <div className="space-y-1.5">
              <button
                type="button"
                onClick={() => onNavigate('purchases')}
                className="w-full flex items-center justify-between p-2 rounded border border-slate-200 bg-slate-50 hover:bg-slate-100 transition-colors text-left text-xs font-bold text-slate-800 cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <span className="w-4 h-4 rounded bg-slate-900 text-white text-[10px] flex items-center justify-center font-mono font-bold">1</span>
                  <span>Fabric Purchase (F1)</span>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
              </button>

              <button
                type="button"
                onClick={() => onNavigate('cutting')}
                className="w-full flex items-center justify-between p-2 rounded border border-slate-200 bg-slate-50 hover:bg-slate-100 transition-colors text-left text-xs font-bold text-slate-800 cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <span className="w-4 h-4 rounded bg-slate-900 text-white text-[10px] flex items-center justify-center font-mono font-bold">2</span>
                  <span>Cutting & Pieces (F2)</span>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
              </button>

              <button
                type="button"
                onClick={() => onNavigate('cut_pieces')}
                className="w-full flex items-center justify-between p-2 rounded border border-slate-200 bg-slate-50 hover:bg-slate-100 transition-colors text-left text-xs font-bold text-slate-800 cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <span className="w-4 h-4 rounded bg-slate-900 text-white text-[10px] flex items-center justify-center font-mono font-bold">3</span>
                  <span>Tailor Allocation (F3)</span>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
              </button>

              <button
                type="button"
                onClick={() => onNavigate('stitching')}
                className="w-full flex items-center justify-between p-2 rounded border border-slate-200 bg-slate-50 hover:bg-slate-100 transition-colors text-left text-xs font-bold text-slate-800 cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <span className="w-4 h-4 rounded bg-slate-900 text-white text-[10px] flex items-center justify-center font-mono font-bold">4</span>
                  <span>Stitching Output (F4)</span>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
              </button>

              <button
                type="button"
                onClick={() => onNavigate('finished_products')}
                className="w-full flex items-center justify-between p-2 rounded border border-slate-200 bg-slate-50 hover:bg-slate-100 transition-colors text-left text-xs font-bold text-slate-800 cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <span className="w-4 h-4 rounded bg-slate-900 text-white text-[10px] flex items-center justify-center font-mono font-bold">5</span>
                  <span>Finished Goods (F5)</span>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
              </button>

              <button
                type="button"
                onClick={() => onNavigate('invoices')}
                className="w-full flex items-center justify-between p-2 rounded border border-slate-200 bg-slate-50 hover:bg-slate-100 transition-colors text-left text-xs font-bold text-slate-800 cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <span className="w-4 h-4 rounded bg-slate-900 text-white text-[10px] flex items-center justify-center font-mono font-bold">6</span>
                  <span>Final Invoice (F6)</span>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
              </button>
            </div>
          </div>

          <div className="bg-slate-900 text-white rounded p-3 shadow-2xs border border-slate-800">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200 mb-2 border-b border-slate-800 pb-1">
              WORKFORCE & SALARYSUMMARY
            </h3>
            <div className="space-y-2 my-2 text-xs font-mono">
              <div className="flex items-center justify-between border-b border-slate-800 pb-1.5">
                <span className="text-slate-400 font-sans">Active Employees:</span>
                <span className="font-bold text-white">{employees.length}</span>
              </div>
              <div className="flex items-center justify-between border-b border-slate-800 pb-1.5">
                <span className="text-slate-400 font-sans">Pending Salary Balance:</span>
                <span className="font-bold text-emerald-400">₹{pendingSalaryAmount.toLocaleString()}</span>
              </div>
            </div>
            <button
              type="button"
              onClick={() => onNavigate('salary')}
              className="w-full mt-2 py-1.5 text-xs font-bold text-slate-900 bg-slate-100 hover:bg-white rounded transition-colors cursor-pointer uppercase tracking-wide"
            >
              Salary & Upaad Portal →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
