import React, { useState } from 'react';
import { Plus, IndianRupee, CreditCard, AlertCircle, FileText, QrCode, Building2, Copy, Check, Banknote, Sparkles, CheckCircle2, Eye } from 'lucide-react';
import { erpService } from '../../services/storage';
import { SalaryRecord, UpaadRecord, Employee, SalaryPayment } from '../../types/erp';
import { PageHeader } from '../common/PageHeader';
import { DataTable, Column } from '../common/DataTable';
import { Drawer } from '../common/Drawer';
import { Modal } from '../common/Modal';
import { FormSection, InputField, SelectField } from '../common/FormControls';
import { StatusBadge } from '../common/StatusBadge';

interface SalaryViewProps {
  showToast: (msg: string) => void;
}

export const SalaryView: React.FC<SalaryViewProps> = ({ showToast }) => {
  const [activeTab, setActiveTab] = useState<'salary' | 'upaad' | 'payments'>('salary');

  const [salaryRecords, setSalaryRecords] = useState<SalaryRecord[]>(erpService.getSalaryRecords());
  const [upaadRecords, setUpaadRecords] = useState<UpaadRecord[]>(erpService.getUpaadRecords());
  const [salaryPayments, setSalaryPayments] = useState<SalaryPayment[]>(erpService.getSalaryPayments());
  const [employees, setEmployees] = useState<Employee[]>(erpService.getEmployees());

  // Modals / Drawers
  const [upaadModalOpen, setUpaadModalOpen] = useState(false);
  const [generateSalaryOpen, setGenerateSalaryOpen] = useState(false);
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);

  const [selectedSalary, setSelectedSalary] = useState<SalaryRecord | null>(null);
  const [viewRecordSal, setViewRecordSal] = useState<SalaryRecord | null>(null);
  const [viewRecordUpaad, setViewRecordUpaad] = useState<UpaadRecord | null>(null);

  // Forms State
  const [upaadForm, setUpaadForm] = useState({
    employeeId: '',
    amount: '2000',
    date: new Date().toISOString().split('T')[0],
    reason: 'Emergency advance',
    paymentMethod: 'UPI',
    referenceNumber: ''
  });

  const [genSalaryForm, setGenSalaryForm] = useState({
    employeeId: '',
    month: '2026-08'
  });

  const [payForm, setPayForm] = useState({
    amountPaid: '',
    paymentDate: new Date().toISOString().split('T')[0],
    paymentMethod: 'UPI',
    referenceNumber: '',
    notes: ''
  });

  const [error, setError] = useState('');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const refreshData = () => {
    setSalaryRecords(erpService.getSalaryRecords());
    setUpaadRecords(erpService.getUpaadRecords());
    setSalaryPayments(erpService.getSalaryPayments());
    setEmployees(erpService.getEmployees());
  };

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(label);
    showToast(`Copied ${label} to clipboard!`);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  // Selected Employee for Upaad
  const selectedUpaadEmp = employees.find(e => e.id === upaadForm.employeeId) || (employees.length > 0 ? employees[0] : null);

  // Handle Add Upaad
  const handleOpenUpaad = () => {
    const firstEmp = employees.length > 0 ? employees[0] : null;
    setUpaadForm({
      employeeId: firstEmp ? firstEmp.id : '',
      amount: '2000',
      date: new Date().toISOString().split('T')[0],
      reason: 'Personal advance / Upaad',
      paymentMethod: 'UPI',
      referenceNumber: ''
    });
    setError('');
    setUpaadModalOpen(true);
  };

  const handleSaveUpaad = (e: React.FormEvent) => {
    e.preventDefault();
    if (!upaadForm.employeeId) {
      setError('Please select an employee');
      return;
    }
    const amt = Number(upaadForm.amount);
    if (!amt || amt <= 0) {
      setError('Upaad amount must be greater than zero');
      return;
    }

    const emp = employees.find(e => e.id === upaadForm.employeeId);

    try {
      erpService.addUpaad({
        employeeId: upaadForm.employeeId,
        employeeName: emp ? emp.name : 'Unknown Employee',
        amount: amt,
        date: upaadForm.date,
        reason: upaadForm.reason,
        paymentMethod: upaadForm.paymentMethod as any,
        referenceNumber: upaadForm.referenceNumber || (upaadForm.paymentMethod === 'UPI' ? `UPI-${Date.now().toString().slice(-6)}` : undefined)
      });

      showToast(`Recorded Upaad / Advance of ₹${amt} for ${emp?.name} via ${upaadForm.paymentMethod}`);
      refreshData();
      setUpaadModalOpen(false);
    } catch (err: any) {
      setError(err.message || 'Failed to record Upaad');
    }
  };

  // Handle Generate Salary
  const handleOpenGenSalary = () => {
    setGenSalaryForm({
      employeeId: employees.length > 0 ? employees[0].id : '',
      month: '2026-08'
    });
    setError('');
    setGenerateSalaryOpen(true);
  };

  const handleSaveGenSalary = (e: React.FormEvent) => {
    e.preventDefault();
    if (!genSalaryForm.employeeId) {
      setError('Please select an employee');
      return;
    }

    try {
      const sal = erpService.generateMonthlySalary(genSalaryForm.employeeId, genSalaryForm.month);
      showToast(`Salary statement for ${sal.employeeName} (${sal.month}) generated: Net Payable ₹${sal.netPayableSalary.toLocaleString()}`);
      refreshData();
      setGenerateSalaryOpen(false);
    } catch (err: any) {
      setError(err.message || 'Failed to generate salary');
    }
  };

  // Handle Pay Salary
  const handleOpenPaySalary = (sal: SalaryRecord) => {
    setSelectedSalary(sal);
    setPayForm({
      amountPaid: String(sal.remainingAmount),
      paymentDate: new Date().toISOString().split('T')[0],
      paymentMethod: 'CASH',
      referenceNumber: '',
      notes: 'Salary disbursement'
    });
    setError('');
    setPaymentModalOpen(true);
  };

  const handleSavePaySalary = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSalary) return;

    const amt = Number(payForm.amountPaid);
    if (!amt || amt <= 0) {
      setError('Payment amount must be greater than zero');
      return;
    }
    if (amt > selectedSalary.remainingAmount) {
      setError(`Payment amount (₹${amt}) cannot exceed remaining salary balance (₹${selectedSalary.remainingAmount})`);
      return;
    }

    try {
      erpService.recordSalaryPayment({
        salaryRecordId: selectedSalary.id,
        employeeId: selectedSalary.employeeId,
        employeeName: selectedSalary.employeeName,
        paymentDate: payForm.paymentDate,
        amountPaid: amt,
        paymentMethod: payForm.paymentMethod as any,
        referenceNumber: payForm.referenceNumber,
        notes: payForm.notes
      });

      showToast(`Salary payment of ₹${amt.toLocaleString()} recorded for ${selectedSalary.employeeName}`);
      refreshData();
      setPaymentModalOpen(false);
    } catch (err: any) {
      setError(err.message || 'Failed to record salary payment');
    }
  };

  const salaryColumns: Column<SalaryRecord>[] = [
    {
      key: 'employeeName',
      header: 'Employee',
      sortable: true,
      accessor: (s) => (
        <div>
          <div className="font-bold text-slate-900">{s.employeeName}</div>
          <div className="text-xs text-slate-500 font-mono">Month: {s.month}</div>
        </div>
      )
    },
    {
      key: 'baseSalary',
      header: 'Base Salary',
      align: 'right',
      accessor: (s) => <span className="font-mono text-slate-800">₹{s.baseSalary.toLocaleString()}</span>
    },
    {
      key: 'totalUpaadDeducted',
      header: 'Upaad Deducted',
      align: 'right',
      accessor: (s) => (
        <span className={`font-mono font-semibold ${s.totalUpaadDeducted > 0 ? 'text-amber-700' : 'text-slate-400'}`}>
          -₹{s.totalUpaadDeducted.toLocaleString()}
        </span>
      )
    },
    {
      key: 'netPayableSalary',
      header: 'Net Payable',
      align: 'right',
      accessor: (s) => <span className="font-mono font-bold text-slate-900">₹{s.netPayableSalary.toLocaleString()}</span>
    },
    {
      key: 'paidAmount',
      header: 'Paid Amount',
      align: 'right',
      accessor: (s) => <span className="font-mono text-emerald-700 font-semibold">₹{s.paidAmount.toLocaleString()}</span>
    },
    {
      key: 'remainingAmount',
      header: 'Balance Due',
      align: 'right',
      accessor: (s) => (
        <span className={`font-mono font-bold ${s.remainingAmount > 0 ? 'text-rose-700' : 'text-slate-400'}`}>
          ₹{s.remainingAmount.toLocaleString()}
        </span>
      )
    },
    {
      key: 'status',
      header: 'Status',
      align: 'center'
    }
  ];

  const upaadColumns: Column<UpaadRecord>[] = [
    {
      key: 'employeeName',
      header: 'Employee Name',
      sortable: true,
      accessor: (u) => <span className="font-bold text-slate-900">{u.employeeName}</span>
    },
    {
      key: 'amount',
      header: 'Upaad Amount',
      align: 'right',
      accessor: (u) => <span className="font-mono font-bold text-rose-700">₹{u.amount.toLocaleString()}</span>
    },
    {
      key: 'paymentMethod',
      header: 'Payment Mode',
      accessor: (u) => {
        const mode = u.paymentMethod || 'CASH';
        return (
          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-bold font-mono ${
            mode === 'UPI' ? 'bg-indigo-100 text-indigo-800 border border-indigo-200' :
            mode === 'BANK_TRANSFER' ? 'bg-blue-100 text-blue-800 border border-blue-200' :
            'bg-slate-100 text-slate-800 border border-slate-200'
          }`}>
            {mode === 'UPI' && <QrCode className="w-3 h-3 text-indigo-600" />}
            {mode === 'BANK_TRANSFER' && <Building2 className="w-3 h-3 text-blue-600" />}
            {mode === 'CASH' && <Banknote className="w-3 h-3 text-emerald-600" />}
            {mode}
          </span>
        );
      }
    },
    {
      key: 'reason',
      header: 'Reason & Ref No.',
      accessor: (u) => (
        <div>
          <div className="text-slate-800 font-medium">{u.reason}</div>
          {u.referenceNumber && <div className="text-[11px] font-mono text-slate-500">Ref: {u.referenceNumber}</div>}
        </div>
      )
    },
    {
      key: 'date',
      header: 'Advance Date',
      align: 'center',
      accessor: (u) => <span className="text-xs text-slate-500 font-mono">{u.date}</span>
    }
  ];

  return (
    <div>
      <PageHeader
        title="Employee Salary & Upaad Ledger"
        description="Employee workflow: Base Monthly Salary - Upaad Advances = Net Salary Payment."
        primaryAction={{
          label: "Add Upaad / Advance",
          onClick: handleOpenUpaad,
          icon: <Plus className="w-4 h-4" />
        }}
        secondaryActions={[
          {
            label: "Generate Monthly Salary",
            onClick: handleOpenGenSalary,
            icon: <FileText className="w-4 h-4" />
          }
        ]}
      />

      {/* Tabs */}
      <div className="flex border-b border-slate-200 mb-5 bg-white rounded-t-lg px-2 pt-2">
        <button
          type="button"
          onClick={() => setActiveTab('salary')}
          className={`px-4 py-2.5 text-xs sm:text-sm font-bold border-b-2 cursor-pointer transition-colors ${
            activeTab === 'salary'
              ? 'border-slate-900 text-slate-900'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Monthly Salary Records ({salaryRecords.length})
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('upaad')}
          className={`px-4 py-2.5 text-xs sm:text-sm font-bold border-b-2 cursor-pointer transition-colors ${
            activeTab === 'upaad'
              ? 'border-slate-900 text-slate-900'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Upaad / Advance History ({upaadRecords.length})
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('payments')}
          className={`px-4 py-2.5 text-xs sm:text-sm font-bold border-b-2 cursor-pointer transition-colors ${
            activeTab === 'payments'
              ? 'border-slate-900 text-slate-900'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Salary Payment Logs ({salaryPayments.length})
        </button>
      </div>

      {activeTab === 'salary' && (
        <DataTable
          data={salaryRecords}
          columns={salaryColumns}
          searchPlaceholder="Search salary by employee or month (e.g., 2026-08)..."
          searchKeys={['employeeName', 'month']}
          actions={(s) => (
            <div className="flex items-center justify-end gap-1.5">
              <button
                type="button"
                onClick={() => setViewRecordSal(s)}
                className="px-2.5 py-1 text-xs font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 rounded transition-colors cursor-pointer flex items-center gap-1"
              >
                <Eye className="w-3.5 h-3.5 text-indigo-600" />
                View
              </button>
              {s.remainingAmount > 0 && (
                <button
                  type="button"
                  onClick={() => handleOpenPaySalary(s)}
                  className="px-2.5 py-1 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded transition-colors cursor-pointer"
                >
                  Pay Salary
                </button>
              )}
            </div>
          )}
        />
      )}

      {activeTab === 'upaad' && (
        <DataTable
          data={upaadRecords}
          columns={upaadColumns}
          searchPlaceholder="Search Upaad records..."
          searchKeys={['employeeName', 'reason', 'date']}
          actions={(u) => (
            <button
              type="button"
              onClick={() => setViewRecordUpaad(u)}
              className="px-2.5 py-1 text-xs font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 rounded transition-colors cursor-pointer flex items-center gap-1"
            >
              <Eye className="w-3.5 h-3.5 text-indigo-600" />
              View
            </button>
          )}
        />
      )}

      {activeTab === 'payments' && (
        <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead>
                <tr className="bg-slate-100 border-b border-slate-200 font-semibold text-slate-600 uppercase">
                  <th className="py-3 px-4">Employee</th>
                  <th className="py-3 px-4 text-right">Amount Paid</th>
                  <th className="py-3 px-4">Method</th>
                  <th className="py-3 px-4">Reference No.</th>
                  <th className="py-3 px-4 text-center">Payment Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 text-slate-700">
                {salaryPayments.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50">
                    <td className="py-3 px-4 font-bold text-slate-900">{p.employeeName}</td>
                    <td className="py-3 px-4 text-right font-mono font-bold text-emerald-700">₹{p.amountPaid.toLocaleString()}</td>
                    <td className="py-3 px-4 uppercase text-xs font-semibold">{p.paymentMethod}</td>
                    <td className="py-3 px-4 font-mono text-xs">{p.referenceNumber || '-'}</td>
                    <td className="py-3 px-4 text-center text-xs text-slate-500">{p.paymentDate}</td>
                  </tr>
                ))}
                {salaryPayments.length === 0 && (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-slate-500 text-xs">No salary payments recorded yet.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add Upaad Modal */}
      <Modal
        isOpen={upaadModalOpen}
        onClose={() => setUpaadModalOpen(false)}
        title="Record Upaad / Salary Advance"
        subtitle="Record salary advance taken by an employee. Automatically deducted during monthly salary generation."
        footer={
          <>
            <button
              type="button"
              onClick={() => setUpaadModalOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-200/60 rounded-md transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSaveUpaad}
              className="px-4 py-2 text-xs font-semibold text-white bg-slate-900 rounded-md hover:bg-slate-800 transition-colors cursor-pointer shadow-2xs"
            >
              Record Upaad
            </button>
          </>
        }
      >
        <form onSubmit={handleSaveUpaad} className="space-y-4">
          {error && <p className="text-xs text-rose-600 font-medium bg-rose-50 p-2.5 rounded border border-rose-200">{error}</p>}

          <SelectField
            label="Select Employee"
            required
            value={upaadForm.employeeId}
            onChange={(e) => setUpaadForm({ ...upaadForm, employeeId: e.target.value })}
            options={employees.map(e => ({ value: e.id, label: `${e.name} (${e.designation})` }))}
          />

          <InputField
            label="Upaad / Advance Amount"
            type="number"
            required
            unit="₹"
            value={upaadForm.amount}
            onChange={(e) => setUpaadForm({ ...upaadForm, amount: e.target.value })}
          />

          <SelectField
            label="Disbursement Payment Option"
            required
            value={upaadForm.paymentMethod}
            onChange={(e) => setUpaadForm({ ...upaadForm, paymentMethod: e.target.value })}
            options={[
              { value: 'UPI', label: '⚡ UPI / Online Scan & Pay QR Code' },
              { value: 'CASH', label: '💵 Cash Transaction' },
              { value: 'BANK_TRANSFER', label: '🏦 Direct Bank Transfer (NEFT/IMPS)' }
            ]}
          />

          {/* Interactive QR Code for Real-Time Online Payment */}
          {upaadForm.paymentMethod === 'UPI' && selectedUpaadEmp && (
            <div className="bg-slate-900 text-white p-3.5 rounded-xl text-center space-y-2 border border-slate-800">
              <div className="flex items-center justify-between text-[11px] font-semibold text-slate-300 border-b border-slate-800 pb-2">
                <span className="flex items-center gap-1 text-emerald-400">
                  <QrCode className="w-3.5 h-3.5" />
                  Real-time UPI Advance QR
                </span>
                <span className="font-mono text-amber-300 font-bold">
                  ₹{Number(upaadForm.amount || 0).toLocaleString()}
                </span>
              </div>

              {selectedUpaadEmp.upiId ? (
                <div className="bg-white p-2.5 rounded-lg w-40 h-40 mx-auto shadow-md border border-slate-200 my-1">
                  <img
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(
                      `upi://pay?pa=${selectedUpaadEmp.upiId}&pn=${encodeURIComponent(selectedUpaadEmp.name)}&am=${upaadForm.amount || '0'}&tn=${encodeURIComponent(upaadForm.reason || 'Upaad Advance')}&cu=INR`
                    )}`}
                    alt="UPI Payment QR Code"
                    className="w-full h-full object-contain"
                  />
                </div>
              ) : (
                <div className="bg-slate-800/80 p-3 rounded text-amber-200 text-xs">
                  ⚠️ No UPI ID registered for {selectedUpaadEmp.name}. You can add UPI ID in Employees Master.
                </div>
              )}

              <div className="flex items-center justify-center gap-2 font-mono text-xs font-bold text-slate-200">
                <span>UPI ID: {selectedUpaadEmp.upiId || 'Not set'}</span>
                {selectedUpaadEmp.upiId && (
                  <button
                    type="button"
                    onClick={() => handleCopy(selectedUpaadEmp.upiId!, 'UPI ID')}
                    className="p-1 hover:bg-slate-800 rounded transition-colors text-slate-300 cursor-pointer"
                  >
                    {copiedKey === 'UPI ID' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Cash Transaction Info */}
          {upaadForm.paymentMethod === 'CASH' && (
            <div className="bg-emerald-50/80 border border-emerald-200 p-3 rounded-lg text-xs space-y-1 text-emerald-900">
              <div className="flex items-center gap-1.5 font-bold">
                <Banknote className="w-4 h-4 text-emerald-700" />
                Handover Cash Transaction
              </div>
              <p className="text-emerald-800 text-[11px]">
                Physical cash advance handed over to {selectedUpaadEmp?.name || 'Employee'}. Will be recorded in Upaad ledger.
              </p>
            </div>
          )}

          {/* Direct Bank Transfer Details */}
          {upaadForm.paymentMethod === 'BANK_TRANSFER' && selectedUpaadEmp && (
            <div className="bg-blue-50/80 border border-blue-200 p-3 rounded-lg text-xs space-y-1.5 font-mono text-slate-800">
              <div className="font-bold font-sans text-blue-900 flex items-center justify-between">
                <span>Employee Bank Transfer Account</span>
                <button
                  type="button"
                  onClick={() => handleCopy(`${selectedUpaadEmp.accountNumber} ${selectedUpaadEmp.ifscCode}`, 'Bank Account Details')}
                  className="text-[10px] bg-white hover:bg-blue-100 border border-blue-300 px-2 py-0.5 rounded font-sans cursor-pointer text-blue-800 font-semibold"
                >
                  Copy Account Info
                </button>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 font-sans">Bank:</span>
                <span className="font-bold">{selectedUpaadEmp.bankName || 'Not recorded'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 font-sans">Account No:</span>
                <span className="font-bold">{selectedUpaadEmp.accountNumber || '—'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 font-sans">IFSC Code:</span>
                <span className="font-bold">{selectedUpaadEmp.ifscCode || '—'}</span>
              </div>
            </div>
          )}

          <InputField
            label="Advance Date"
            type="date"
            required
            value={upaadForm.date}
            onChange={(e) => setUpaadForm({ ...upaadForm, date: e.target.value })}
          />

          <InputField
            label="Reason / Notes"
            value={upaadForm.reason}
            onChange={(e) => setUpaadForm({ ...upaadForm, reason: e.target.value })}
            placeholder="e.g. Emergency medical advance"
          />

          <InputField
            label="Payment / Transaction Reference No."
            value={upaadForm.referenceNumber}
            onChange={(e) => setUpaadForm({ ...upaadForm, referenceNumber: e.target.value })}
            placeholder="e.g. UTR / URN / Receipt No."
          />
        </form>
      </Modal>

      {/* Generate Monthly Salary Modal */}
      <Modal
        isOpen={generateSalaryOpen}
        onClose={() => setGenerateSalaryOpen(false)}
        title="Generate Monthly Salary Statement"
        subtitle="Calculates Net Salary = Monthly Base Salary - Total Month Upaad Advances."
        footer={
          <>
            <button
              type="button"
              onClick={() => setGenerateSalaryOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-200/60 rounded-md transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSaveGenSalary}
              className="px-4 py-2 text-xs font-semibold text-white bg-slate-900 rounded-md hover:bg-slate-800 transition-colors cursor-pointer shadow-2xs"
            >
              Calculate & Generate
            </button>
          </>
        }
      >
        <form onSubmit={handleSaveGenSalary} className="space-y-4">
          {error && <p className="text-xs text-rose-600 font-medium bg-rose-50 p-2.5 rounded border border-rose-200">{error}</p>}

          <SelectField
            label="Select Employee"
            required
            value={genSalaryForm.employeeId}
            onChange={(e) => setGenSalaryForm({ ...genSalaryForm, employeeId: e.target.value })}
            options={employees.map(e => ({ value: e.id, label: `${e.name} (Base ₹${e.baseSalary.toLocaleString()})` }))}
          />

          <InputField
            label="Salary Month (YYYY-MM)"
            type="month"
            required
            value={genSalaryForm.month}
            onChange={(e) => setGenSalaryForm({ ...genSalaryForm, month: e.target.value })}
          />
        </form>
      </Modal>

      {/* Record Salary Payment Modal */}
      {selectedSalary && (
        <Modal
          isOpen={paymentModalOpen}
          onClose={() => setPaymentModalOpen(false)}
          title={`Disburse Salary — ${selectedSalary.employeeName}`}
          subtitle={`Month: ${selectedSalary.month} • Net Payable: ₹${selectedSalary.netPayableSalary.toLocaleString()} • Remaining: ₹${selectedSalary.remainingAmount.toLocaleString()}`}
          footer={
            <>
              <button
                type="button"
                onClick={() => setPaymentModalOpen(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-200/60 rounded-md transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSavePaySalary}
                className="px-4 py-2 text-xs font-semibold text-white bg-emerald-700 rounded-md hover:bg-emerald-800 transition-colors cursor-pointer shadow-2xs"
              >
                Confirm Salary Payment
              </button>
            </>
          }
        >
          {(() => {
            const currentSalaryEmp = employees.find(e => e.id === selectedSalary.employeeId);
            return (
              <form onSubmit={handleSavePaySalary} className="space-y-4">
                {error && <p className="text-xs text-rose-600 font-medium bg-rose-50 p-2.5 rounded border border-rose-200">{error}</p>}

                <InputField
                  label="Payment Amount"
                  type="number"
                  required
                  unit="₹"
                  value={payForm.amountPaid}
                  onChange={(e) => setPayForm({ ...payForm, amountPaid: e.target.value })}
                  helperText={`Remaining balance: ₹${selectedSalary.remainingAmount.toLocaleString()}`}
                />

                <SelectField
                  label="Payment Method"
                  required
                  value={payForm.paymentMethod}
                  onChange={(e) => setPayForm({ ...payForm, paymentMethod: e.target.value })}
                  options={[
                    { value: 'UPI', label: '⚡ UPI / Online Scan & Pay QR Code' },
                    { value: 'CASH', label: '💵 Cash Transaction' },
                    { value: 'BANK_TRANSFER', label: '🏦 Direct Bank Transfer (NEFT/RTGS)' },
                    { value: 'CHEQUE', label: '📜 Cheque' }
                  ]}
                />

                {/* UPI Dynamic QR Code */}
                {payForm.paymentMethod === 'UPI' && currentSalaryEmp && (
                  <div className="bg-slate-900 text-white p-3.5 rounded-xl text-center space-y-2 border border-slate-800">
                    <div className="flex items-center justify-between text-[11px] font-semibold text-slate-300 border-b border-slate-800 pb-2">
                      <span className="flex items-center gap-1 text-emerald-400">
                        <QrCode className="w-3.5 h-3.5" />
                        Salary Payment UPI QR
                      </span>
                      <span className="font-mono text-emerald-400 font-bold">
                        ₹{Number(payForm.amountPaid || 0).toLocaleString()}
                      </span>
                    </div>

                    {currentSalaryEmp.upiId ? (
                      <div className="bg-white p-2.5 rounded-lg w-40 h-40 mx-auto shadow-md border border-slate-200 my-1">
                        <img
                          src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(
                            `upi://pay?pa=${currentSalaryEmp.upiId}&pn=${encodeURIComponent(currentSalaryEmp.name)}&am=${payForm.amountPaid || '0'}&tn=${encodeURIComponent('Salary Payment ' + selectedSalary.month)}&cu=INR`
                          )}`}
                          alt="UPI Salary Payment QR Code"
                          className="w-full h-full object-contain"
                        />
                      </div>
                    ) : (
                      <div className="bg-slate-800/80 p-3 rounded text-amber-200 text-xs">
                        ⚠️ No UPI ID registered for {currentSalaryEmp.name}.
                      </div>
                    )}

                    <div className="flex items-center justify-center gap-2 font-mono text-xs font-bold text-slate-200">
                      <span>UPI ID: {currentSalaryEmp.upiId || 'Not set'}</span>
                      {currentSalaryEmp.upiId && (
                        <button
                          type="button"
                          onClick={() => handleCopy(currentSalaryEmp.upiId!, 'UPI ID')}
                          className="p-1 hover:bg-slate-800 rounded transition-colors text-slate-300 cursor-pointer"
                        >
                          {copiedKey === 'UPI ID' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                        </button>
                      )}
                    </div>
                  </div>
                )}

                {/* Cash Transaction */}
                {payForm.paymentMethod === 'CASH' && (
                  <div className="bg-emerald-50 border border-emerald-200 p-3 rounded-lg text-xs space-y-1 text-emerald-900">
                    <div className="flex items-center gap-1.5 font-bold">
                      <Banknote className="w-4 h-4 text-emerald-700" />
                      Physical Cash Salary Disbursal
                    </div>
                    <p className="text-emerald-800 text-[11px]">
                      Cash salary payment handed directly to {selectedSalary.employeeName}.
                    </p>
                  </div>
                )}

                {/* Bank Transfer Info */}
                {payForm.paymentMethod === 'BANK_TRANSFER' && currentSalaryEmp && (
                  <div className="bg-blue-50 border border-blue-200 p-3 rounded-lg text-xs space-y-1 font-mono text-slate-800">
                    <div className="font-bold font-sans text-blue-900 flex items-center justify-between">
                      <span>Bank Account</span>
                      <button
                        type="button"
                        onClick={() => handleCopy(`${currentSalaryEmp.accountNumber} ${currentSalaryEmp.ifscCode}`, 'Bank Account Details')}
                        className="text-[10px] bg-white hover:bg-blue-100 border border-blue-300 px-2 py-0.5 rounded font-sans cursor-pointer text-blue-800 font-semibold"
                      >
                        Copy Info
                      </button>
                    </div>
                    <div>Bank: {currentSalaryEmp.bankName || 'N/A'}</div>
                    <div>A/C No: {currentSalaryEmp.accountNumber || 'N/A'}</div>
                    <div>IFSC: {currentSalaryEmp.ifscCode || 'N/A'}</div>
                  </div>
                )}

                <InputField
                  label="Payment Date"
                  type="date"
                  required
                  value={payForm.paymentDate}
                  onChange={(e) => setPayForm({ ...payForm, paymentDate: e.target.value })}
                />

                <InputField
                  label="Reference / Transaction Number"
                  value={payForm.referenceNumber}
                  onChange={(e) => setPayForm({ ...payForm, referenceNumber: e.target.value })}
                  placeholder="e.g. UTR / Transaction ID"
                />
              </form>
            );
          })()}
        </Modal>
      )}

      {/* View Salary Record Modal */}
      {viewRecordSal && (
        <Modal
          isOpen={Boolean(viewRecordSal)}
          onClose={() => setViewRecordSal(null)}
          title={`Salary Statement — ${viewRecordSal.employeeName}`}
          subtitle={`Month: ${viewRecordSal.month} • Generated Status: ${viewRecordSal.status}`}
        >
          <div className="space-y-4 text-xs sm:text-sm">
            <div className="grid grid-cols-2 gap-3 bg-slate-50 p-3.5 rounded-lg border border-slate-200">
              <div>
                <span className="text-slate-500 text-xs block">Employee</span>
                <span className="font-bold text-slate-900 text-sm">{viewRecordSal.employeeName}</span>
              </div>
              <div>
                <span className="text-slate-500 text-xs block">Salary Month</span>
                <span className="font-mono font-bold text-slate-800">{viewRecordSal.month}</span>
              </div>
              <div>
                <span className="text-slate-500 text-xs block">Base Monthly Salary</span>
                <span className="font-mono text-slate-800">₹{viewRecordSal.baseSalary.toLocaleString()}</span>
              </div>
              <div>
                <span className="text-slate-500 text-xs block">Upaad / Advance Deductions</span>
                <span className="font-mono font-bold text-amber-800">-₹{viewRecordSal.totalUpaadDeducted.toLocaleString()}</span>
              </div>
            </div>

            <div className="bg-indigo-50/70 p-3.5 rounded-lg border border-indigo-200 grid grid-cols-3 gap-2 text-center">
              <div>
                <span className="text-indigo-800 text-[10px] font-bold uppercase block">Net Calculated</span>
                <span className="font-mono font-bold text-indigo-950 text-base">₹{viewRecordSal.netPayableSalary.toLocaleString()}</span>
              </div>
              <div>
                <span className="text-emerald-800 text-[10px] font-bold uppercase block">Paid</span>
                <span className="font-mono font-bold text-emerald-700 text-base">₹{viewRecordSal.paidAmount.toLocaleString()}</span>
              </div>
              <div>
                <span className="text-rose-800 text-[10px] font-bold uppercase block">Balance Due</span>
                <span className="font-mono font-bold text-rose-700 text-base">₹{viewRecordSal.remainingAmount.toLocaleString()}</span>
              </div>
            </div>

            <div className="flex justify-end pt-2 border-t border-slate-200">
              <button
                type="button"
                onClick={() => setViewRecordSal(null)}
                className="px-4 py-1.5 text-xs font-semibold text-white bg-slate-900 rounded hover:bg-slate-800 transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* View Upaad Record Modal */}
      {viewRecordUpaad && (
        <Modal
          isOpen={Boolean(viewRecordUpaad)}
          onClose={() => setViewRecordUpaad(null)}
          title={`Upaad / Advance Details — ${viewRecordUpaad.employeeName}`}
          subtitle={`Recorded Date: ${viewRecordUpaad.date}`}
        >
          <div className="space-y-4 text-xs sm:text-sm">
            <div className="grid grid-cols-2 gap-3 bg-slate-50 p-3.5 rounded-lg border border-slate-200">
              <div>
                <span className="text-slate-500 text-xs block">Employee Name</span>
                <span className="font-bold text-slate-900">{viewRecordUpaad.employeeName}</span>
              </div>
              <div>
                <span className="text-slate-500 text-xs block">Advance Date</span>
                <span className="font-mono text-slate-800">{viewRecordUpaad.date}</span>
              </div>
              <div>
                <span className="text-slate-500 text-xs block">Payment Mode</span>
                <span className="font-bold text-slate-800 uppercase bg-slate-100 px-2 py-0.5 rounded border text-xs inline-block">
                  {viewRecordUpaad.paymentMethod || 'CASH'}
                </span>
              </div>
              <div>
                <span className="text-slate-500 text-xs block">Reference Number</span>
                <span className="font-mono text-slate-800">{viewRecordUpaad.referenceNumber || '—'}</span>
              </div>
            </div>

            <div className="bg-rose-50 p-3.5 rounded-lg border border-rose-200 flex items-center justify-between">
              <div>
                <span className="text-rose-800 text-xs font-semibold block">Upaad / Advance Amount</span>
                <span className="font-mono font-bold text-rose-950 text-lg">₹{viewRecordUpaad.amount.toLocaleString()}</span>
              </div>
              <span className="text-xs bg-rose-100 font-bold text-rose-800 px-2.5 py-1 rounded border border-rose-200 uppercase">
                SALARY DEDUCTIBLE
              </span>
            </div>

            {viewRecordUpaad.reason && (
              <div className="bg-slate-50 p-3 rounded border border-slate-200">
                <span className="font-bold text-slate-700 block text-xs">Reason / Purpose:</span>
                <p className="text-slate-700 mt-0.5">{viewRecordUpaad.reason}</p>
              </div>
            )}

            <div className="flex justify-end pt-2 border-t border-slate-200">
              <button
                type="button"
                onClick={() => setViewRecordUpaad(null)}
                className="px-4 py-1.5 text-xs font-semibold text-white bg-slate-900 rounded hover:bg-slate-800 transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
