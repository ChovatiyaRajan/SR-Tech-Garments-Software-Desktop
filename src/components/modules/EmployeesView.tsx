import React, { useState } from 'react';
import { Plus, Users, Phone, Calendar, CreditCard, QrCode, Building2, Copy, Check, Sparkles, Pencil, Trash2, AlertTriangle, Eye } from 'lucide-react';
import { erpService } from '../../services/storage';
import { Employee, EmployeeAssignment } from '../../types/erp';
import { PageHeader } from '../common/PageHeader';
import { DataTable, Column } from '../common/DataTable';
import { Drawer } from '../common/Drawer';
import { Modal } from '../common/Modal';
import { FormSection, InputField } from '../common/FormControls';
import { useKeyboardShortcuts } from '../../hooks/useKeyboardShortcuts';

interface EmployeesViewProps {
  showToast: (msg: string) => void;
  onViewLot: (lotNumber: string) => void;
}

export const EmployeesView: React.FC<EmployeesViewProps> = ({ showToast, onViewLot }) => {
  const [employees, setEmployees] = useState<Employee[]>(erpService.getEmployees());
  const [selectedEmp, setSelectedEmp] = useState<Employee | null>(null);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [deletingEmployee, setDeletingEmployee] = useState<Employee | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  useKeyboardShortcuts({
    onNew: () => {
      setEditingEmployee(null);
      setFormData({
        name: '',
        phone: '',
        designation: 'Sales & Dispatch Manager',
        baseSalary: '25000',
        joiningDate: new Date().toISOString().split('T')[0],
        bankName: 'State Bank of India',
        accountNumber: '',
        ifscCode: 'SBIN0001020',
        accountHolderName: '',
        upiId: ''
      });
      setError('');
      setIsDrawerOpen(true);
    },
    onClose: () => {
      setIsDrawerOpen(false);
      setSelectedEmp(null);
      setEditingEmployee(null);
      setDeletingEmployee(null);
      setQrModalEmp(null);
    }
  });

  // QR Modal State
  const [qrModalEmp, setQrModalEmp] = useState<Employee | null>(null);
  const [qrAmount, setQrAmount] = useState('2000');
  const [qrNote, setQrNote] = useState('Advance Salary');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    designation: 'Sales & Dispatch Manager',
    baseSalary: '25000',
    joiningDate: new Date().toISOString().split('T')[0],
    bankName: 'State Bank of India',
    accountNumber: '',
    ifscCode: 'SBIN0001020',
    accountHolderName: '',
    upiId: ''
  });
  const [error, setError] = useState('');

  const refreshData = () => {
    setEmployees(erpService.getEmployees());
  };

  const handleOpenAdd = () => {
    setEditingEmployee(null);
    setFormData({
      name: '',
      phone: '',
      designation: 'Sales & Dispatch Staff',
      baseSalary: '20000',
      joiningDate: new Date().toISOString().split('T')[0],
      bankName: 'State Bank of India',
      accountNumber: '',
      ifscCode: 'SBIN0001020',
      accountHolderName: '',
      upiId: ''
    });
    setError('');
    setIsDrawerOpen(true);
  };

  const handleOpenEdit = (emp: Employee) => {
    setEditingEmployee(emp);
    setFormData({
      name: emp.name,
      phone: emp.phone === '-' ? '' : emp.phone,
      designation: emp.designation,
      baseSalary: String(emp.baseSalary),
      joiningDate: emp.joiningDate,
      bankName: emp.bankName || 'State Bank of India',
      accountNumber: emp.accountNumber || '',
      ifscCode: emp.ifscCode || '',
      accountHolderName: emp.accountHolderName || emp.name,
      upiId: emp.upiId || ''
    });
    setError('');
    setIsDrawerOpen(true);
  };

  const handleAutoGenerateUpi = () => {
    const cleanPhone = formData.phone.replace(/\D/g, '');
    if (cleanPhone.length >= 10) {
      setFormData(prev => ({
        ...prev,
        upiId: `${cleanPhone.slice(-10)}@upi`,
        accountHolderName: prev.accountHolderName || prev.name
      }));
      showToast('Generated UPI ID from phone number');
    } else if (formData.name.trim()) {
      const cleanName = formData.name.toLowerCase().replace(/[^a-z0-9]/g, '');
      setFormData(prev => ({
        ...prev,
        upiId: `${cleanName}@okicici`,
        accountHolderName: prev.accountHolderName || prev.name
      }));
      showToast('Generated UPI ID from employee name');
    } else {
      showToast('Please enter Employee Name or Phone first');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      setError('Employee name is required');
      return;
    }

    try {
      if (editingEmployee) {
        erpService.updateEmployee(editingEmployee.id, {
          name: formData.name,
          phone: formData.phone || '-',
          designation: formData.designation || 'Staff',
          baseSalary: Number(formData.baseSalary || 20000),
          joiningDate: formData.joiningDate,
          bankName: formData.bankName,
          accountNumber: formData.accountNumber,
          ifscCode: formData.ifscCode,
          accountHolderName: formData.accountHolderName || formData.name,
          upiId: formData.upiId
        });
        showToast(`Employee "${formData.name}" updated successfully.`);
      } else {
        erpService.addEmployee({
          name: formData.name,
          phone: formData.phone || '-',
          designation: formData.designation || 'Staff',
          baseSalary: Number(formData.baseSalary || 20000),
          joiningDate: formData.joiningDate,
          bankName: formData.bankName,
          accountNumber: formData.accountNumber,
          ifscCode: formData.ifscCode,
          accountHolderName: formData.accountHolderName || formData.name,
          upiId: formData.upiId
        });
        showToast(`Employee "${formData.name}" added with Bank & UPI details.`);
      }
      refreshData();
      setIsDrawerOpen(false);
      setEditingEmployee(null);
    } catch (err: any) {
      setError(err.message || 'Failed to save employee');
    }
  };

  const handleConfirmDelete = () => {
    if (!deletingEmployee) return;
    try {
      erpService.deleteEmployee(deletingEmployee.id);
      showToast(`Employee "${deletingEmployee.name}" deleted successfully.`);
      if (selectedEmp?.id === deletingEmployee.id) {
        setSelectedEmp(null);
      }
      setDeletingEmployee(null);
      refreshData();
    } catch (err: any) {
      showToast('Failed to delete employee');
    }
  };

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(label);
    showToast(`Copied ${label} to clipboard!`);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const assignments = erpService.getEmployeeAssignments();
  const getAssignmentsForEmp = (eId: string) => assignments.filter(a => a.employeeId === eId);

  const columns: Column<Employee>[] = [
    {
      key: 'name',
      header: 'Employee Name',
      sortable: true,
      accessor: (e) => (
        <div>
          <div className="font-bold text-slate-900">{e.name}</div>
          <div className="text-xs text-slate-500">{e.designation}</div>
        </div>
      )
    },
    {
      key: 'phone',
      header: 'Contact Phone',
      accessor: (e) => <span className="font-mono text-xs">{e.phone}</span>
    },
    {
      key: 'bankDetails',
      header: 'Bank & UPI Payment Info',
      accessor: (e) => {
        const hasUpi = Boolean(e.upiId);
        const hasBank = Boolean(e.accountNumber);
        return (
          <div className="text-xs">
            {hasUpi ? (
              <div className="flex items-center gap-1 font-mono font-bold text-indigo-700 bg-indigo-50/80 px-2 py-0.5 rounded border border-indigo-200/60 w-fit">
                <QrCode className="w-3 h-3 text-indigo-600" />
                {e.upiId}
              </div>
            ) : hasBank ? (
              <div className="text-slate-700 font-mono text-[11px]">
                {e.bankName || 'Bank'} A/C: ••••{e.accountNumber?.slice(-4)}
              </div>
            ) : (
              <span className="text-slate-400 italic text-[11px]">No online bank added</span>
            )}
          </div>
        );
      }
    },
    {
      key: 'baseSalary',
      header: 'Monthly Base Salary',
      align: 'right',
      sortable: true,
      accessor: (e) => <span className="font-mono font-bold text-slate-900">₹{e.baseSalary.toLocaleString()}</span>
    },
    {
      key: 'joiningDate',
      header: 'Joining Date',
      align: 'center',
      accessor: (e) => <span className="text-xs text-slate-500">{e.joiningDate}</span>
    }
  ];

  return (
    <div className="space-y-3">
      <PageHeader
        title="EMPLOYEES MASTER DIRECTORY"
        description="Staff directory, designations, bank accounts, UPI payment details, and monthly base salaries."
        primaryAction={{
          label: "Add Employee (F2)",
          onClick: handleOpenAdd,
          icon: <Plus className="w-3.5 h-3.5" />
        }}
      />

      <DataTable
        data={employees}
        columns={columns}
        searchPlaceholder="Search employees by name, designation, phone, or UPI ID..."
        searchKeys={['name', 'designation', 'phone', 'upiId', 'bankName']}
        onRowClick={(e) => setSelectedEmp(e)}
        actions={(e) => (
          <div className="flex items-center justify-end gap-1.5">
            <button
              type="button"
              onClick={() => setSelectedEmp(e)}
              className="px-2.5 py-1 text-xs font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 rounded transition-colors cursor-pointer flex items-center gap-1"
            >
              <Eye className="w-3.5 h-3.5 text-indigo-600" />
              View
            </button>
            <button
              type="button"
              onClick={() => {
                setQrModalEmp(e);
                setQrAmount('2000');
                setQrNote('Advance Salary');
              }}
              className="px-2.5 py-1 text-xs font-semibold text-indigo-800 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 rounded transition-colors cursor-pointer flex items-center gap-1"
              title="Show Online Payment QR & Bank Details"
            >
              <QrCode className="w-3 h-3 text-indigo-600" />
              Pay QR
            </button>
            <button
              type="button"
              onClick={() => handleOpenEdit(e)}
              className="px-2 py-1 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-amber-100 hover:text-amber-900 border border-slate-200 rounded transition-colors cursor-pointer flex items-center gap-1"
              title="Edit Employee Details"
            >
              <Pencil className="w-3 h-3 text-amber-600" />
              Edit
            </button>
            <button
              type="button"
              onClick={() => setDeletingEmployee(e)}
              className="p-1 text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded transition-colors cursor-pointer"
              title="Remove Employee"
            >
              <Trash2 className="w-3.5 h-3.5 text-rose-600" />
            </button>
          </div>
        )}
      />

      {/* Add / Edit Employee Drawer */}
      <Drawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        title={editingEmployee ? `Edit Employee - ${editingEmployee.name}` : "Add New Employee"}
        subtitle={editingEmployee ? "Update staff member profile, base salary & bank details." : "Register staff member, monthly base salary & bank details for online payments."}
        footer={
          <>
            <button
              type="button"
              onClick={() => setIsDrawerOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-200/60 rounded-md transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              className="px-4 py-2 text-xs font-semibold text-white bg-slate-900 rounded-md hover:bg-slate-800 transition-colors cursor-pointer shadow-2xs"
            >
              {editingEmployee ? "Update Employee" : "Save Employee"}
            </button>
          </>
        }
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && <p className="text-xs text-rose-600 font-medium bg-rose-50 p-2.5 rounded border border-rose-200">{error}</p>}

          <FormSection title="Employee Basic Details">
            <InputField
              label="Full Name"
              required
              colSpan={2}
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g. Rajesh Sharma"
            />

            <InputField
              label="Phone Number"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              placeholder="+91 98765 43210"
            />

            <InputField
              label="Designation / Role"
              value={formData.designation}
              onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
              placeholder="e.g. Sales & Dispatch Manager"
            />

            <InputField
              label="Monthly Base Salary"
              type="number"
              required
              unit="₹"
              value={formData.baseSalary}
              onChange={(e) => setFormData({ ...formData, baseSalary: e.target.value })}
            />

            <InputField
              label="Joining Date"
              type="date"
              required
              value={formData.joiningDate}
              onChange={(e) => setFormData({ ...formData, joiningDate: e.target.value })}
            />
          </FormSection>

          <FormSection title="Bank Account & Online Payment (UPI) Details">
            <div className="col-span-2 bg-indigo-50/60 border border-indigo-200/70 p-3 rounded-lg text-xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-indigo-900 flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5 text-indigo-700" />
                  Real-time Online Payment Integration
                </span>
                <button
                  type="button"
                  onClick={handleAutoGenerateUpi}
                  className="px-2 py-1 bg-white hover:bg-indigo-100 border border-indigo-300 text-indigo-800 text-[11px] font-semibold rounded cursor-pointer transition-colors flex items-center gap-1 shadow-2xs"
                >
                  <Sparkles className="w-3 h-3 text-indigo-600" />
                  Auto-fill UPI ID
                </button>
              </div>
              <p className="text-indigo-800/80 text-[11px] leading-relaxed">
                Add bank details and UPI ID for instant scan-and-pay QR code generation during advance salary (Upaad) and monthly salary settlements.
              </p>
            </div>

            <InputField
              label="UPI ID / VPA Address"
              colSpan={2}
              value={formData.upiId}
              onChange={(e) => setFormData({ ...formData, upiId: e.target.value })}
              placeholder="e.g. 9876543210@upi or rajesh@okicici"
            />

            <InputField
              label="Bank Name"
              value={formData.bankName}
              onChange={(e) => setFormData({ ...formData, bankName: e.target.value })}
              placeholder="e.g. State Bank of India"
            />

            <InputField
              label="Account Number"
              value={formData.accountNumber}
              onChange={(e) => setFormData({ ...formData, accountNumber: e.target.value })}
              placeholder="e.g. 30123456789"
            />

            <InputField
              label="IFSC Code"
              value={formData.ifscCode}
              onChange={(e) => setFormData({ ...formData, ifscCode: e.target.value })}
              placeholder="e.g. SBIN0001020"
            />

            <InputField
              label="Account Holder Name"
              value={formData.accountHolderName}
              onChange={(e) => setFormData({ ...formData, accountHolderName: e.target.value })}
              placeholder="Name as registered in bank"
            />
          </FormSection>
        </form>
      </Drawer>

      {/* Online Payment QR Code Modal */}
      {qrModalEmp && (
        <Modal
          isOpen={Boolean(qrModalEmp)}
          onClose={() => setQrModalEmp(null)}
          title={`Online Payment Details - ${qrModalEmp.name}`}
          subtitle={`UPI & Bank Transfer Portal • Phone: ${qrModalEmp.phone}`}
        >
          <div className="space-y-4 text-xs sm:text-sm">
            <div className="bg-slate-900 text-white p-4 rounded-xl shadow-sm text-center relative overflow-hidden">
              <div className="relative z-10 space-y-2">
                <span className="text-[10px] font-bold tracking-widest text-emerald-400 uppercase bg-slate-800 px-2.5 py-0.5 rounded-full border border-slate-700">
                  Real-time Scan & Pay
                </span>

                <div className="bg-white p-3.5 rounded-xl w-48 h-48 mx-auto flex items-center justify-center shadow-lg border-2 border-slate-200 my-2">
                  {qrModalEmp.upiId ? (
                    <img
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(
                        `upi://pay?pa=${qrModalEmp.upiId}&pn=${encodeURIComponent(qrModalEmp.name)}&am=${qrAmount || '0'}&tn=${encodeURIComponent(qrNote)}&cu=INR`
                      )}`}
                      alt="UPI Payment QR Code"
                      className="w-full h-full object-contain"
                    />
                  ) : (
                    <div className="text-center p-2 text-slate-500">
                      <QrCode className="w-10 h-10 mx-auto text-slate-300 mb-1" />
                      <p className="text-[11px] leading-tight">No UPI ID registered for this employee.</p>
                    </div>
                  )}
                </div>

                <div className="font-mono text-sm font-bold text-white flex items-center justify-center gap-2">
                  <span>{qrModalEmp.upiId || 'No UPI ID'}</span>
                  {qrModalEmp.upiId && (
                    <button
                      type="button"
                      onClick={() => handleCopy(qrModalEmp.upiId!, 'UPI ID')}
                      className="p-1 hover:bg-slate-800 rounded transition-colors text-slate-300 cursor-pointer"
                      title="Copy UPI ID"
                    >
                      {copiedKey === 'UPI ID' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  )}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 bg-slate-50 p-3 rounded-lg border border-slate-200">
              <div>
                <label className="text-[11px] font-bold text-slate-600 block mb-1">Set Test/Payment Amount</label>
                <div className="relative">
                  <span className="absolute left-2.5 top-2 text-slate-400 text-xs font-bold">₹</span>
                  <input
                    type="number"
                    value={qrAmount}
                    onChange={(e) => setQrAmount(e.target.value)}
                    className="w-full pl-6 pr-2 py-1.5 text-xs font-mono font-bold bg-white border border-slate-300 rounded focus:outline-none focus:border-slate-800"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-600 block mb-1">Payment Reason / Remarks</label>
                <input
                  type="text"
                  value={qrNote}
                  onChange={(e) => setQrNote(e.target.value)}
                  className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-300 rounded focus:outline-none focus:border-slate-800"
                />
              </div>
            </div>

            <div className="border-t pt-3 space-y-2">
              <h5 className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-slate-600" />
                Registered Bank Account Details
              </h5>
              <div className="bg-white p-3 rounded border border-slate-200 text-xs space-y-1.5 font-mono">
                <div className="flex justify-between">
                  <span className="text-slate-500 font-sans">Bank Name:</span>
                  <span className="font-bold text-slate-800">{qrModalEmp.bankName || 'Not specified'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 font-sans">Account Number:</span>
                  <span className="font-bold text-slate-900">{qrModalEmp.accountNumber || '—'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 font-sans">IFSC Code:</span>
                  <span className="font-bold text-slate-800">{qrModalEmp.ifscCode || '—'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 font-sans">Account Holder:</span>
                  <span className="text-slate-800">{qrModalEmp.accountHolderName || qrModalEmp.name}</span>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setQrModalEmp(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded transition-colors cursor-pointer"
              >
                Close Portal
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Delete Confirmation Modal */}
      {deletingEmployee && (
        <Modal
          isOpen={Boolean(deletingEmployee)}
          onClose={() => setDeletingEmployee(null)}
          title={`Remove Employee - ${deletingEmployee.name}`}
          subtitle="Are you sure you want to delete this staff member?"
        >
          <div className="space-y-4 text-xs sm:text-sm">
            <div className="bg-rose-50 border border-rose-200 p-3.5 rounded-lg text-rose-900 flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <span className="font-bold block">Permanent Removal Warning</span>
                <p className="text-xs text-rose-800 leading-relaxed">
                  You are about to remove <strong className="font-bold">{deletingEmployee.name}</strong> ({deletingEmployee.designation}). This action cannot be undone.
                </p>
              </div>
            </div>

            <div className="bg-slate-50 border border-slate-200 p-3 rounded-lg text-xs space-y-1">
              <div className="flex justify-between text-slate-600">
                <span>Phone:</span>
                <span className="font-mono font-bold text-slate-800">{deletingEmployee.phone}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Monthly Base Salary:</span>
                <span className="font-mono font-bold text-slate-800">₹{deletingEmployee.baseSalary.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>UPI ID:</span>
                <span className="font-mono font-bold text-indigo-700">{deletingEmployee.upiId || 'None'}</span>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-200">
              <button
                type="button"
                onClick={() => setDeletingEmployee(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="px-4 py-2 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded transition-colors cursor-pointer shadow-2xs flex items-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Confirm Delete
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Employee Detail Modal */}
      {selectedEmp && (
        <Modal
          isOpen={Boolean(selectedEmp)}
          onClose={() => setSelectedEmp(null)}
          title={selectedEmp.name}
          subtitle={`${selectedEmp.designation} • Base Salary: ₹${selectedEmp.baseSalary.toLocaleString()}/mo`}
          maxWidth="lg"
        >
          <div className="space-y-4 text-xs sm:text-sm">
            {/* Quick Actions Header */}
            <div className="flex items-center justify-between bg-slate-50 p-2.5 rounded-lg border border-slate-200">
              <span className="text-xs font-bold text-slate-700">Employee Actions:</span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    const empToEdit = selectedEmp;
                    setSelectedEmp(null);
                    handleOpenEdit(empToEdit);
                  }}
                  className="px-3 py-1.5 bg-amber-50 hover:bg-amber-100 border border-amber-300 text-amber-900 font-semibold text-xs rounded transition-colors flex items-center gap-1 cursor-pointer"
                >
                  <Pencil className="w-3 h-3 text-amber-700" />
                  Edit Profile
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const empToDelete = selectedEmp;
                    setSelectedEmp(null);
                    setDeletingEmployee(empToDelete);
                  }}
                  className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 border border-rose-300 text-rose-800 font-semibold text-xs rounded transition-colors flex items-center gap-1 cursor-pointer"
                >
                  <Trash2 className="w-3 h-3 text-rose-600" />
                  Remove Staff
                </button>
              </div>
            </div>

            {/* Bank Card Summary */}
            <div className="bg-gradient-to-r from-slate-900 to-slate-800 text-white p-3.5 rounded-lg flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase font-mono tracking-widest text-slate-400 block">Bank Account & UPI</span>
                <span className="font-mono font-bold text-sm text-emerald-400 block mt-0.5">
                  {selectedEmp.upiId || 'No UPI ID'}
                </span>
                <span className="text-xs text-slate-300 block mt-0.5 font-mono">
                  {selectedEmp.bankName} • A/C: {selectedEmp.accountNumber || 'N/A'} • IFSC: {selectedEmp.ifscCode || 'N/A'}
                </span>
              </div>
              <button
                type="button"
                onClick={() => {
                  const emp = selectedEmp;
                  setSelectedEmp(null);
                  setQrModalEmp(emp);
                  setQrAmount('2000');
                  setQrNote('Advance Salary');
                }}
                className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs rounded transition-colors flex items-center gap-1 cursor-pointer shadow-2xs"
              >
                <QrCode className="w-3.5 h-3.5" />
                Scan & Pay QR
              </button>
            </div>

            <h4 className="font-bold text-slate-900 uppercase tracking-wider text-xs border-b pb-1">
              Assigned Finished Goods History ({getAssignmentsForEmp(selectedEmp.id).length})
            </h4>

            <div className="max-h-60 overflow-y-auto divide-y divide-slate-200 border rounded-md">
              {getAssignmentsForEmp(selectedEmp.id).map((a) => (
                <div key={a.id} className="p-3 flex items-center justify-between text-xs hover:bg-slate-50">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-slate-900">{a.lotNumber}</span>
                      <span className="font-bold text-slate-900">{a.productName || 'Garment Item'}</span>
                      {a.tailorName && (
                        <span className="text-[11px] font-medium text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">
                          Tailor: {a.tailorName}
                        </span>
                      )}
                    </div>
                    <span className="text-slate-700 font-semibold mt-1 block">{a.assignedFinishedQty} pcs assigned</span>
                    <p className="text-slate-500 mt-0.5">{a.notes || 'Dispatched for retail'}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-slate-500 text-[11px] font-mono block">{a.assignmentDate}</span>
                  </div>
                </div>
              ))}

              {getAssignmentsForEmp(selectedEmp.id).length === 0 && (
                <p className="p-4 text-center text-slate-500 text-xs">No finished goods assigned to this employee yet.</p>
              )}
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

