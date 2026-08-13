import React, { useState } from 'react';
import {
  ArrowLeft,
  ArrowUpRight,
  ShoppingCart,
  Layers,
  Scissors,
  Grid,
  UserCheck,
  CheckSquare,
  Package,
  Users,
  FileText,
  CreditCard,
  Building2,
  Calendar,
  AlertTriangle
} from 'lucide-react';
import { erpService } from '../../services/storage';
import { PageHeader } from '../common/PageHeader';
import { ProcessTracker, getActiveModuleForStatus } from '../common/ProcessTracker';
import { StatusBadge } from '../common/StatusBadge';
import { NavModule } from '../common/ERPLayout';
import { printLotSummaryHtml } from '../../utils/printHelper';
import { useKeyboardShortcuts } from '../../hooks/useKeyboardShortcuts';

interface LotDetailViewProps {
  lotNumber: string;
  onBack: () => void;
  onNavigate: (module: NavModule, param?: string) => void;
}

export const LotDetailView: React.FC<LotDetailViewProps> = ({ lotNumber, onBack, onNavigate }) => {
  const lifecycle = erpService.getLotLifecycle(lotNumber);

  useKeyboardShortcuts({
    onClose: onBack,
    onPrint: () => {
      if (lifecycle) {
        printLotSummaryHtml(lifecycle);
      }
    }
  });

  if (!lifecycle || !lifecycle.purchase) {
    return (
      <div className="space-y-4">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded hover:bg-slate-50 cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Purchases
        </button>
        <div className="bg-white border border-slate-200 rounded-lg p-8 text-center">
          <p className="text-sm font-bold text-slate-900">Lot Number "{lotNumber}" not found.</p>
        </div>
      </div>
    );
  }

  const { purchase, rawMaterial, rawMaterialDamages, cuttings, cutPieces, tailorAssignments, stitchings, finishedProduct, finishedProducts = [], finishedProductDamages, employeeAssignments, invoice, wholesalerPayments } = lifecycle;
  const activeModule = getActiveModuleForStatus(lifecycle.status);

  return (
    <div className="space-y-6">
      {/* Top Bar with Back Button and Active Stage Navigation */}
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-md hover:bg-slate-50 transition-colors shadow-2xs cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>

        <button
          type="button"
          onClick={() => onNavigate(activeModule, lotNumber)}
          title="Click to navigate to active stage section"
          className="inline-flex items-center gap-2 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded-md transition-colors cursor-pointer group"
        >
          <span className="text-xs font-semibold text-slate-600">Active Stage:</span>
          <StatusBadge status={lifecycle.status} />
          <ArrowUpRight className="w-3.5 h-3.5 text-slate-500 group-hover:translate-x-0.5 transition-transform" />
        </button>
      </div>

      <PageHeader
        title={`LOT AUDIT & LIFECYCLE: ${lotNumber}`}
        description={`Challan: ${purchase.challanNumber} • Wholesaler: ${purchase.wholesalerName} • Quantity: ${purchase.totalQuantity} ${purchase.unit}`}
      />

      {/* Visual Workflow Progress Tracker */}
      <ProcessTracker
        status={lifecycle.status}
        lotNumber={lotNumber}
        onNavigateStep={(mod) => onNavigate(mod, lotNumber)}
      />

      {/* Grid of Lifecycle Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 1. Purchase & Wholesaler Section */}
        <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-2xs">
          <div className="flex items-center justify-between border-b border-slate-200 pb-3 mb-4">
            <div className="flex items-center gap-2">
              <ShoppingCart className="w-4 h-4 text-slate-700" />
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">1. Purchase & Wholesaler</h3>
            </div>
            <button
              type="button"
              onClick={() => onNavigate('purchases', lotNumber)}
              className="inline-flex items-center gap-1 text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
            >
              Go to Section <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div>
              <span className="text-slate-500 block">Wholesaler:</span>
              <span className="font-bold text-slate-900">{purchase.wholesalerName}</span>
            </div>
            <div>
              <span className="text-slate-500 block">Purchase Date:</span>
              <span className="font-mono text-slate-800">{purchase.purchaseDate}</span>
            </div>
            <div>
              <span className="text-slate-500 block">Challan Number:</span>
              <span className="font-mono font-bold text-slate-900">{purchase.challanNumber}</span>
            </div>
            <div>
              <span className="text-slate-500 block">Material Name:</span>
              <span className="font-medium text-slate-800">{purchase.materialName}</span>
            </div>
            <div>
              <span className="text-slate-500 block">Quantity & Rate:</span>
              <span className="font-mono text-slate-800">{purchase.totalQuantity} {purchase.unit} @ ₹{purchase.ratePerUnit}/unit</span>
            </div>
            <div>
              <span className="text-slate-500 block">Total Purchase Cost:</span>
              <span className="font-mono font-bold text-slate-900 text-sm">₹{purchase.purchaseAmount.toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* 2. Raw Material & Damage Section */}
        <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-2xs">
          <div className="flex items-center justify-between border-b border-slate-200 pb-3 mb-4">
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-slate-700" />
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">2. Raw Material Stock</h3>
            </div>
            <div className="flex items-center gap-2">
              {rawMaterial && <StatusBadge status={rawMaterial.status} size="sm" />}
              <button
                type="button"
                onClick={() => onNavigate('raw_materials', lotNumber)}
                className="inline-flex items-center gap-1 text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
              >
                Go to Section <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {rawMaterial ? (
            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-3 gap-2 bg-slate-50 p-2.5 rounded border border-slate-200 text-center">
                <div>
                  <span className="text-slate-500 text-[10px] uppercase font-semibold block">Purchased</span>
                  <span className="font-mono font-bold text-slate-900">{rawMaterial.totalQuantity} m</span>
                </div>
                <div>
                  <span className="text-slate-500 text-[10px] uppercase font-semibold block">Damaged</span>
                  <span className="font-mono font-bold text-rose-600">{rawMaterial.damagedQuantity} m</span>
                </div>
                <div>
                  <span className="text-slate-500 text-[10px] uppercase font-semibold block">Available</span>
                  <span className="font-mono font-bold text-emerald-700">{rawMaterial.availableQuantity} m</span>
                </div>
              </div>

              {rawMaterialDamages.length > 0 && (
                <div>
                  <span className="font-semibold text-slate-700 block mb-1">Damage Logs:</span>
                  <ul className="space-y-1 text-[11px] text-slate-600">
                    {rawMaterialDamages.map(d => (
                      <li key={d.id} className="bg-rose-50 text-rose-900 p-1.5 rounded border border-rose-200 flex justify-between">
                        <span>{d.reason}</span>
                        <span className="font-mono font-bold">{d.damageQuantity} {rawMaterial.unit}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ) : (
            <p className="text-xs text-slate-500">No raw material stock initialized.</p>
          )}
        </div>

        {/* 3. Cutting & Cut Pieces Section */}
        <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-2xs">
          <div className="flex items-center justify-between border-b border-slate-200 pb-3 mb-4">
            <div className="flex items-center gap-2">
              <Scissors className="w-4 h-4 text-slate-700" />
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">3. Cutting & Pieces</h3>
            </div>
            <div className="flex items-center gap-2">
              {cutPieces && <StatusBadge status={cutPieces.status} size="sm" />}
              <button
                type="button"
                onClick={() => onNavigate('cutting', lotNumber)}
                className="inline-flex items-center gap-1 text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
              >
                Go to Section <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          <div className="space-y-3 text-xs">
            {cuttings.map(c => (
              <div key={c.id} className="bg-slate-50 p-2.5 rounded border border-slate-200 space-y-1">
                <div className="flex justify-between font-medium">
                  <span>Pattern: <strong>{c.pieceType}</strong></span>
                  <span className="font-mono text-slate-500">{c.cuttingDate}</span>
                </div>
                <div className="grid grid-cols-3 gap-1 pt-1 border-t border-slate-200/80 text-[11px] text-slate-700">
                  <span>Cloth: <strong className="font-mono">{c.materialUsedMeters}m</strong></span>
                  <span>Waste Material: <strong className="font-mono text-amber-700 font-bold">{c.wasteMeters}m</strong></span>
                  <span className="text-right">Master: <strong className="text-slate-900">{c.cuttingMasterName || 'Cutter'}</strong></span>
                </div>
              </div>
            ))}

            {cutPieces && (
              <div className="grid grid-cols-3 gap-2 bg-slate-100 p-2.5 rounded text-center">
                <div>
                  <span className="text-[10px] text-slate-500 uppercase block font-semibold">Total Cut</span>
                  <span className="font-mono font-bold text-slate-900">{cutPieces.totalCutPieces} pcs</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 uppercase block font-semibold">Assigned</span>
                  <span className="font-mono font-bold text-slate-800">{cutPieces.assignedToTailorQty} pcs</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 uppercase block font-semibold">Unassigned</span>
                  <span className="font-mono font-bold text-indigo-700">{cutPieces.remainingCutPieces} pcs</span>
                </div>
              </div>
            )}

            {cuttings.length === 0 && <p className="text-slate-500">Cutting operation not started yet.</p>}
          </div>
        </div>

        {/* 4. Tailor Assignment & Stitching Output */}
        <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-2xs">
          <div className="flex items-center justify-between border-b border-slate-200 pb-3 mb-4">
            <div className="flex items-center gap-2">
              <UserCheck className="w-4 h-4 text-slate-700" />
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">4. Tailor & Stitching</h3>
            </div>
            <button
              type="button"
              onClick={() => onNavigate('stitching', lotNumber)}
              className="inline-flex items-center gap-1 text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
            >
              Go to Section <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3 text-xs">
            {tailorAssignments.map(ta => {
              const completed = ta.completedPiecesQty !== undefined
                ? ta.completedPiecesQty
                : stitchings.filter(s => s.tailorAssignmentId === ta.id).reduce((sum, s) => sum + s.stitchedGoodPiecesQty + s.defectivePiecesQty, 0);
              const remaining = Math.max(0, ta.assignedPiecesQty - completed);

              return (
                <div key={ta.id} className="border border-slate-200 p-2.5 rounded bg-slate-50/50">
                  <div className="flex justify-between font-bold text-slate-900">
                    <span>{ta.tailorName}</span>
                    <span className="font-mono">Rate: ₹{ta.ratePerPiece}/pc</span>
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-slate-600 mt-1">
                    <span>Assigned: <strong>{ta.assignedPiecesQty} pcs</strong></span>
                    <span>Delivered: <strong className="text-slate-900">{completed} pcs</strong></span>
                    <span>Remaining: <strong className={remaining > 0 ? "text-amber-700" : "text-emerald-700"}>{remaining} pcs</strong></span>
                  </div>
                  <div className="flex items-center justify-between mt-1 text-[10px]">
                    <span className="text-slate-500">Date: {ta.assignmentDate}</span>
                    <span className={`font-bold uppercase px-1.5 py-0.5 rounded ${
                      remaining === 0 ? "text-emerald-700 bg-emerald-100" : "text-amber-800 bg-amber-100"
                    }`}>
                      {remaining === 0 ? "COMPLETED" : `IN STITCHING (${remaining} REM)`}
                    </span>
                  </div>
                </div>
              );
            })}

            {stitchings.map(s => (
              <div key={s.id} className="bg-emerald-50/80 border border-emerald-200 p-2.5 rounded text-emerald-950">
                <div className="flex justify-between font-bold">
                  <span>Stitching Output ({s.tailorName})</span>
                  <span className="font-mono">Wage: ₹{s.totalWageAmount.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-[11px] mt-1 text-emerald-800">
                  <span>Good Stitched: <strong>{s.stitchedGoodPiecesQty} pcs</strong></span>
                  <span>Defective: {s.defectivePiecesQty} pcs</span>
                </div>
              </div>
            ))}

            {tailorAssignments.length === 0 && <p className="text-slate-500">Not assigned to tailors yet.</p>}
          </div>
        </div>

        {/* 5. Finished Goods & Employee Dispatch */}
        <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-2xs">
          <div className="flex items-center justify-between border-b border-slate-200 pb-3 mb-4">
            <div className="flex items-center gap-2">
              <Package className="w-4 h-4 text-slate-700" />
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">5. Finished Goods & Dispatch</h3>
            </div>
            <div className="flex items-center gap-2">
              {finishedProduct && <StatusBadge status={finishedProduct.status} size="sm" />}
              <button
                type="button"
                onClick={() => onNavigate('finished_products', lotNumber)}
                className="inline-flex items-center gap-1 text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
              >
                Go to Section <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {(finishedProducts.length > 0 || finishedProduct) ? (
            <div className="space-y-3 text-xs">
              {(finishedProducts.length > 0 ? finishedProducts : [finishedProduct!]).map(fp => (
                <div key={fp.id} className="bg-slate-50/80 p-2.5 rounded border border-slate-200">
                  <div className="flex justify-between items-center font-bold text-slate-900 mb-1">
                    <span>{fp.productName}</span>
                    <span className="text-[11px] font-medium text-slate-700 bg-white px-2 py-0.5 rounded border border-slate-200">
                      Tailor: {fp.tailorName || 'Tailor N/A'}
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-center text-xs mt-2">
                    <div>
                      <span className="text-[10px] text-slate-500 uppercase block font-semibold">Stitched Good</span>
                      <span className="font-mono font-bold text-slate-900">{fp.totalStitchedQty} pcs</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 uppercase block font-semibold">Staff Assigned</span>
                      <span className="font-mono font-bold text-slate-800">{fp.assignedToEmployeeQty} pcs</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 uppercase block font-semibold">Available</span>
                      <span className="font-mono font-bold text-emerald-700">{fp.availableForAssignmentQty} pcs</span>
                    </div>
                  </div>
                </div>
              ))}

              {employeeAssignments.length > 0 && (
                <div className="pt-2">
                  <span className="font-semibold text-slate-700 block mb-1">Employee Dispatches:</span>
                  <ul className="space-y-1 text-[11px]">
                    {employeeAssignments.map(ea => (
                      <li key={ea.id} className="bg-slate-100 p-2 rounded flex justify-between items-center">
                        <div>
                          <span className="font-semibold text-slate-900">{ea.employeeName}</span>
                          <span className="text-slate-500 text-[10px] ml-1">
                            ({ea.productName || 'Garment'} {ea.tailorName ? `by ${ea.tailorName}` : ''})
                          </span>
                        </div>
                        <span className="font-mono font-bold text-indigo-700">{ea.assignedFinishedQty} pcs ({ea.assignmentDate})</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ) : (
            <p className="text-xs text-slate-500">Finished goods not produced yet.</p>
          )}
        </div>

        {/* 6. Final Invoice & Wholesaler Settlement */}
        <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-2xs">
          <div className="flex items-center justify-between border-b border-slate-200 pb-3 mb-4">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-slate-700" />
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">6. Invoice & Payments</h3>
            </div>
            <div className="flex items-center gap-2">
              {invoice && <StatusBadge status={invoice.paymentStatus} size="sm" />}
              <button
                type="button"
                onClick={() => onNavigate('invoices', lotNumber)}
                className="inline-flex items-center gap-1 text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
              >
                Go to Section <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {invoice ? (
            <div className="space-y-3 text-xs">
              <div className="bg-slate-50 p-3 rounded border border-slate-200 space-y-1">
                <div className="flex justify-between">
                  <span className="text-slate-500 font-semibold">Invoice Number:</span>
                  <span className="font-mono font-bold text-slate-900">{invoice.invoiceNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Final Net Amount:</span>
                  <span className="font-mono font-bold text-slate-900">₹{invoice.finalNetPayableAmount.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-emerald-700">
                  <span>Total Paid:</span>
                  <span className="font-mono font-bold">₹{invoice.paidAmount.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-rose-700 font-bold border-t pt-1">
                  <span>Balance Due:</span>
                  <span className="font-mono">₹{invoice.dueAmount.toLocaleString()}</span>
                </div>
              </div>

              {invoice.dueAmount > 0 && (
                <button
                  type="button"
                  onClick={() => onNavigate('invoices', lotNumber)}
                  className="w-full py-2 px-3 bg-emerald-700 hover:bg-emerald-800 text-white font-semibold text-xs rounded transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs"
                >
                  <CreditCard className="w-3.5 h-3.5 text-emerald-200" />
                  Update Payment Status (Due: ₹{invoice.dueAmount.toLocaleString()})
                </button>
              )}

              {wholesalerPayments.length > 0 && (
                <div>
                  <span className="font-semibold text-slate-700 block mb-1">Payment Transactions:</span>
                  <ul className="space-y-1 text-[11px]">
                    {wholesalerPayments.map(p => (
                      <li key={p.id} className="bg-emerald-50 text-emerald-900 p-1.5 rounded flex justify-between border border-emerald-200 font-mono">
                        <span>{p.paymentDate} — {p.paymentMethod}</span>
                        <span className="font-bold">₹{p.amountPaid.toLocaleString()}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ) : (
            <div className="text-xs text-slate-500">
              <p>Invoice not generated yet.</p>
              {lifecycle.isAllGoodFinishedAccountedFor && (
                <button
                  type="button"
                  onClick={() => onNavigate('invoices', lotNumber)}
                  className="mt-2 px-3 py-1 text-xs font-semibold text-white bg-slate-900 rounded hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  Generate Final Invoice
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
