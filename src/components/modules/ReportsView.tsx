import React, { useState } from 'react';
import { BarChart3, FileSpreadsheet, Printer, Download } from 'lucide-react';
import { erpService } from '../../services/storage';
import { PageHeader } from '../common/PageHeader';
import { useKeyboardShortcuts } from '../../hooks/useKeyboardShortcuts';

export const ReportsView: React.FC = () => {
  const [reportType, setReportType] = useState<'stock' | 'wholesalers' | 'production' | 'payroll'>('stock');

  useKeyboardShortcuts({
    onPrint: () => {
      window.print();
    }
  });

  const purchases = erpService.getPurchases();
  const rawMaterials = erpService.getRawMaterials();
  const cutPieces = erpService.getCutPieces();
  const finishedProducts = erpService.getFinishedProducts();
  const wholesalers = erpService.getWholesalers();
  const invoices = erpService.getInvoices();
  const stitchings = erpService.getStitchings();
  const employees = erpService.getEmployees();
  const salaryRecords = erpService.getSalaryRecords();
  const upaadRecords = erpService.getUpaadRecords();

  return (
    <div className="space-y-3">
      <PageHeader
        title="STATUTORY REPORTS & FINANCIAL AUDIT STATEMENTS"
        description="Comprehensive accounting, inventory balance, tailor wage, GST invoicing, and payroll audit statements."
        secondaryActions={[
          {
            label: "Print Statement (Ctrl+P)",
            onClick: () => window.print(),
            icon: <Printer className="w-3.5 h-3.5" />
          }
        ]}
      />

      {/* Report Type Selector */}
      <div className="flex flex-wrap gap-2 bg-white p-2 rounded-lg border border-slate-200">
        <button
          type="button"
          onClick={() => setReportType('stock')}
          className={`px-3.5 py-2 text-xs font-bold rounded-md transition-colors cursor-pointer ${
            reportType === 'stock' ? 'bg-slate-900 text-white' : 'text-slate-700 hover:bg-slate-100'
          }`}
        >
          Stock & Inventory Ledger
        </button>

        <button
          type="button"
          onClick={() => setReportType('wholesalers')}
          className={`px-3.5 py-2 text-xs font-bold rounded-md transition-colors cursor-pointer ${
            reportType === 'wholesalers' ? 'bg-slate-900 text-white' : 'text-slate-700 hover:bg-slate-100'
          }`}
        >
          Wholesaler Payable Accounts
        </button>

        <button
          type="button"
          onClick={() => setReportType('production')}
          className={`px-3.5 py-2 text-xs font-bold rounded-md transition-colors cursor-pointer ${
            reportType === 'production' ? 'bg-slate-900 text-white' : 'text-slate-700 hover:bg-slate-100'
          }`}
        >
          Production & Tailor Wages
        </button>

        <button
          type="button"
          onClick={() => setReportType('payroll')}
          className={`px-3.5 py-2 text-xs font-bold rounded-md transition-colors cursor-pointer ${
            reportType === 'payroll' ? 'bg-slate-900 text-white' : 'text-slate-700 hover:bg-slate-100'
          }`}
        >
          Salary & Upaad Statement
        </button>
      </div>

      {/* Report Content */}
      <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-2xs space-y-4">
        {reportType === 'stock' && (
          <div>
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-3">
              Inventory Balance Report by Lot
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border border-slate-200">
                <thead className="bg-slate-100 font-semibold text-slate-700 uppercase">
                  <tr>
                    <th className="py-2.5 px-3">Lot No.</th>
                    <th className="py-2.5 px-3">Raw Material Avail.</th>
                    <th className="py-2.5 px-3">Cut Pieces Avail.</th>
                    <th className="py-2.5 px-3">Finished Goods Avail.</th>
                    <th className="py-2.5 px-3 text-right">Raw Damage</th>
                    <th className="py-2.5 px-3 text-right">Finished Damage</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 text-slate-800">
                  {rawMaterials.map(rm => {
                    const cp = cutPieces.find(c => c.lotNumber === rm.lotNumber);
                    const fp = finishedProducts.find(f => f.lotNumber === rm.lotNumber);
                    return (
                      <tr key={rm.id} className="hover:bg-slate-50">
                        <td className="py-2.5 px-3 font-mono font-bold text-slate-900">{rm.lotNumber}</td>
                        <td className="py-2.5 px-3 font-mono">{rm.availableQuantity} {rm.unit}</td>
                        <td className="py-2.5 px-3 font-mono">{cp ? `${cp.remainingCutPieces} pcs` : '0 pcs'}</td>
                        <td className="py-2.5 px-3 font-mono font-bold text-emerald-800">{fp ? `${fp.availableForAssignmentQty} pcs` : '0 pcs'}</td>
                        <td className="py-2.5 px-3 font-mono text-right text-rose-600">{rm.damagedQuantity} {rm.unit}</td>
                        <td className="py-2.5 px-3 font-mono text-right text-rose-600">{fp ? `${fp.damagedQuantity} pcs` : '0 pcs'}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {reportType === 'wholesalers' && (
          <div>
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-3">
              Wholesalers Outstanding Accounts Ledger
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border border-slate-200">
                <thead className="bg-slate-100 font-semibold text-slate-700 uppercase">
                  <tr>
                    <th className="py-2.5 px-3">Wholesaler</th>
                    <th className="py-2.5 px-3 text-right">Total Invoiced</th>
                    <th className="py-2.5 px-3 text-right">Total Paid</th>
                    <th className="py-2.5 px-3 text-right">Outstanding Due</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 text-slate-800">
                  {wholesalers.map(ws => {
                    const wsInvoices = invoices.filter(i => i.wholesalerId === ws.id);
                    const totalInv = wsInvoices.reduce((sum, i) => sum + i.finalNetPayableAmount, 0);
                    const totalPaid = wsInvoices.reduce((sum, i) => sum + i.paidAmount, 0);
                    const totalDue = wsInvoices.reduce((sum, i) => sum + i.dueAmount, 0);

                    return (
                      <tr key={ws.id} className="hover:bg-slate-50">
                        <td className="py-2.5 px-3 font-bold text-slate-900">{ws.name}</td>
                        <td className="py-2.5 px-3 font-mono text-right">₹{totalInv.toLocaleString()}</td>
                        <td className="py-2.5 px-3 font-mono text-right text-emerald-700 font-semibold">₹{totalPaid.toLocaleString()}</td>
                        <td className="py-2.5 px-3 font-mono text-right text-rose-700 font-bold">₹{totalDue.toLocaleString()}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {reportType === 'production' && (
          <div>
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-3">
              Stitching Output & Tailor Wages Audit
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border border-slate-200">
                <thead className="bg-slate-100 font-semibold text-slate-700 uppercase">
                  <tr>
                    <th className="py-2.5 px-3">Lot No.</th>
                    <th className="py-2.5 px-3">Tailor Name</th>
                    <th className="py-2.5 px-3 text-right">Good Stitched</th>
                    <th className="py-2.5 px-3 text-right">Defective</th>
                    <th className="py-2.5 px-3 text-right">Wage Rate</th>
                    <th className="py-2.5 px-3 text-right">Total Wage</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 text-slate-800">
                  {stitchings.map(s => (
                    <tr key={s.id} className="hover:bg-slate-50">
                      <td className="py-2.5 px-3 font-mono font-bold text-slate-900">{s.lotNumber}</td>
                      <td className="py-2.5 px-3 font-semibold">{s.tailorName}</td>
                      <td className="py-2.5 px-3 font-mono text-right font-bold text-emerald-800">{s.stitchedGoodPiecesQty} pcs</td>
                      <td className="py-2.5 px-3 font-mono text-right text-rose-600">{s.defectivePiecesQty} pcs</td>
                      <td className="py-2.5 px-3 font-mono text-right">₹{s.ratePerPiece}/pc</td>
                      <td className="py-2.5 px-3 font-mono text-right font-bold text-slate-900">₹{s.totalWageAmount.toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {reportType === 'payroll' && (
          <div>
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-3">
              Employee Payroll & Upaad Advance Ledger
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border border-slate-200">
                <thead className="bg-slate-100 font-semibold text-slate-700 uppercase">
                  <tr>
                    <th className="py-2.5 px-3">Employee</th>
                    <th className="py-2.5 px-3">Designation</th>
                    <th className="py-2.5 px-3 text-right">Base Monthly Salary</th>
                    <th className="py-2.5 px-3 text-right">Total Upaad Deducted</th>
                    <th className="py-2.5 px-3 text-right">Net Payable</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 text-slate-800">
                  {employees.map(emp => {
                    const empSalaries = salaryRecords.filter(s => s.employeeId === emp.id);
                    const totalUpaad = upaadRecords.filter(u => u.employeeId === emp.id).reduce((sum, u) => sum + u.amount, 0);

                    return (
                      <tr key={emp.id} className="hover:bg-slate-50">
                        <td className="py-2.5 px-3 font-bold text-slate-900">{emp.name}</td>
                        <td className="py-2.5 px-3 text-slate-600">{emp.designation}</td>
                        <td className="py-2.5 px-3 font-mono text-right font-semibold">₹{emp.baseSalary.toLocaleString()}</td>
                        <td className="py-2.5 px-3 font-mono text-right text-amber-700 font-semibold">₹{totalUpaad.toLocaleString()}</td>
                        <td className="py-2.5 px-3 font-mono text-right font-bold text-slate-900">₹{Math.max(0, emp.baseSalary - totalUpaad).toLocaleString()}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
