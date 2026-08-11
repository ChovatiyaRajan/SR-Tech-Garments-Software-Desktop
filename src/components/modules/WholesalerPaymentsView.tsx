import React, { useState } from 'react';
import { Plus, CreditCard, CheckCircle2, Eye } from 'lucide-react';
import { erpService } from '../../services/storage';
import { WholesalerPayment, Invoice } from '../../types/erp';
import { PageHeader } from '../common/PageHeader';
import { DataTable, Column } from '../common/DataTable';
import { Modal } from '../common/Modal';
import { FormSection, InputField, SelectField } from '../common/FormControls';
import { StatusBadge } from '../common/StatusBadge';
import { useKeyboardShortcuts } from '../../hooks/useKeyboardShortcuts';

interface WholesalerPaymentsViewProps {
  showToast: (msg: string) => void;
  onViewLot: (lotNumber: string) => void;
}

export const WholesalerPaymentsView: React.FC<WholesalerPaymentsViewProps> = ({
  showToast,
  onViewLot
}) => {
  const [payments, setPayments] = useState<WholesalerPayment[]>(erpService.getWholesalerPayments());
  const [invoices, setInvoices] = useState<Invoice[]>(erpService.getInvoices());

  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [viewRecord, setViewRecord] = useState<WholesalerPayment | null>(null);

  useKeyboardShortcuts({
    onNew: () => {
      const target = pendingInvoices.length > 0 ? pendingInvoices[0] : null;
      setSelectedInvoice(target);
      setFormData({
        invoiceId: target ? target.id : '',
        amountPaid: target ? String(target.dueAmount) : '50000',
        paymentDate: new Date().toISOString().split('T')[0],
        paymentMethod: 'BANK_TRANSFER',
        referenceNumber: `TXN-${Math.floor(100000 + Math.random() * 900000)}`,
        notes: 'Payment received against tax invoice'
      });
      setError('');
      setPaymentModalOpen(true);
    },
    onClose: () => {
      setPaymentModalOpen(false);
      setViewRecord(null);
    }
  });

  const pendingInvoices = invoices.filter(i => i.paymentStatus !== 'PAID');

  const [formData, setFormData] = useState({
    invoiceId: '',
    amountPaid: '',
    paymentDate: new Date().toISOString().split('T')[0],
    paymentMethod: 'BANK_TRANSFER',
    referenceNumber: '',
    notes: ''
  });
  const [error, setError] = useState('');

  const refreshData = () => {
    setPayments(erpService.getWholesalerPayments());
    setInvoices(erpService.getInvoices());
  };

  const handleOpenNew = (inv?: Invoice) => {
    const target = inv || (pendingInvoices.length > 0 ? pendingInvoices[0] : null);
    setSelectedInvoice(target);

    setFormData({
      invoiceId: target ? target.id : '',
      amountPaid: target ? String(target.dueAmount) : '50000',
      paymentDate: new Date().toISOString().split('T')[0],
      paymentMethod: 'BANK_TRANSFER',
      referenceNumber: `TXN-${Math.floor(100000 + Math.random() * 900000)}`,
      notes: ''
    });
    setError('');
    setPaymentModalOpen(true);
  };

  const handleInvoiceSelect = (invId: string) => {
    const inv = invoices.find(i => i.id === invId);
    setSelectedInvoice(inv || null);
    setFormData(prev => ({
      ...prev,
      invoiceId: invId,
      amountPaid: inv ? String(inv.dueAmount) : prev.amountPaid
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.invoiceId) {
      setError('Please select an invoice');
      return;
    }
    const payAmt = Number(formData.amountPaid);
    if (!payAmt || payAmt <= 0) {
      setError('Payment amount must be greater than zero');
      return;
    }

    if (selectedInvoice && payAmt > selectedInvoice.dueAmount) {
      setError(`Payment amount (₹${payAmt}) cannot exceed outstanding due (₹${selectedInvoice.dueAmount})`);
      return;
    }

    try {
      const inv = invoices.find(i => i.id === formData.invoiceId);
      erpService.recordWholesalerPayment({
        invoiceId: formData.invoiceId,
        wholesalerId: inv ? inv.wholesalerId : '',
        wholesalerName: inv ? inv.wholesalerName : 'Wholesaler',
        paymentDate: formData.paymentDate,
        amountPaid: payAmt,
        paymentMethod: formData.paymentMethod as any,
        referenceNumber: formData.referenceNumber,
        notes: formData.notes
      });

      showToast(`Payment of ₹${payAmt.toLocaleString()} recorded for Invoice ${inv?.invoiceNumber}`);
      refreshData();
      setPaymentModalOpen(false);
    } catch (err: any) {
      setError(err.message || 'Failed to record payment');
    }
  };

  const columns: Column<WholesalerPayment>[] = [
    {
      key: 'wholesalerName',
      header: 'Wholesaler',
      sortable: true,
      accessor: (p) => <span className="font-bold text-slate-900">{p.wholesalerName}</span>
    },
    {
      key: 'amountPaid',
      header: 'Amount Paid',
      align: 'right',
      sortable: true,
      accessor: (p) => <span className="font-mono font-bold text-emerald-800">₹{p.amountPaid.toLocaleString()}</span>
    },
    {
      key: 'paymentMethod',
      header: 'Method',
      align: 'center',
      accessor: (p) => <span className="text-xs font-semibold uppercase bg-slate-100 px-2 py-0.5 rounded text-slate-700">{p.paymentMethod}</span>
    },
    {
      key: 'referenceNumber',
      header: 'Reference / Ref No.',
      accessor: (p) => <span className="font-mono text-xs text-slate-700">{p.referenceNumber || '-'}</span>
    },
    {
      key: 'paymentDate',
      header: 'Payment Date',
      align: 'center',
      accessor: (p) => <span className="text-xs text-slate-500 font-mono">{p.paymentDate}</span>
    }
  ];

  return (
    <div className="space-y-3">
      <PageHeader
        title="WHOLESALER PAYMENTS & SETTLEMENTS LEDGER"
        description="Record payment vouchers, bank transfers, and complete supplier lot settlements."
        primaryAction={{
          label: "Record Supplier Payment (F2)",
          onClick: () => handleOpenNew(),
          icon: <Plus className="w-3.5 h-3.5" />
        }}
      />

      <DataTable
        data={payments}
        columns={columns}
        searchPlaceholder="Search payments by Wholesaler or Reference No..."
        searchKeys={['wholesalerName', 'referenceNumber', 'paymentMethod']}
        actions={(p) => (
          <button
            type="button"
            onClick={() => setViewRecord(p)}
            className="px-2.5 py-1 text-xs font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 rounded transition-colors cursor-pointer flex items-center gap-1"
          >
            <Eye className="w-3.5 h-3.5 text-indigo-600" />
            View
          </button>
        )}
      />

      {/* View Record Modal */}
      {viewRecord && (
        <Modal
          isOpen={Boolean(viewRecord)}
          onClose={() => setViewRecord(null)}
          title={`Wholesaler Payment - ${viewRecord.wholesalerName}`}
          subtitle={`Reference: ${viewRecord.referenceNumber || 'N/A'} • Date: ${viewRecord.paymentDate}`}
        >
          <div className="space-y-4 text-xs sm:text-sm">
            <div className="grid grid-cols-2 gap-3 bg-slate-50 p-3.5 rounded-lg border border-slate-200">
              <div>
                <span className="text-slate-500 text-xs block">Wholesaler Name</span>
                <span className="font-bold text-slate-900 text-sm">{viewRecord.wholesalerName}</span>
              </div>
              <div>
                <span className="text-slate-500 text-xs block">Payment Date</span>
                <span className="font-mono text-slate-800">{viewRecord.paymentDate}</span>
              </div>
              <div>
                <span className="text-slate-500 text-xs block">Payment Method</span>
                <span className="font-semibold text-slate-900 uppercase bg-slate-100 px-2 py-0.5 rounded border border-slate-200 text-xs">
                  {viewRecord.paymentMethod}
                </span>
              </div>
              <div>
                <span className="text-slate-500 text-xs block">Reference / Txn ID</span>
                <span className="font-mono font-bold text-slate-800">{viewRecord.referenceNumber || '—'}</span>
              </div>
            </div>

            <div className="bg-emerald-50 p-3.5 rounded-lg border border-emerald-200 flex items-center justify-between">
              <div>
                <span className="text-emerald-800 font-semibold text-xs block">Amount Settled</span>
                <span className="font-mono font-bold text-emerald-950 text-base">₹{viewRecord.amountPaid.toLocaleString()}</span>
              </div>
              <div className="text-right">
                <span className="text-emerald-700 text-xs font-semibold block">Status</span>
                <span className="font-mono text-xs font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded">
                  RECORDED
                </span>
              </div>
            </div>

            {viewRecord.notes && (
              <div className="bg-slate-50 p-2.5 rounded border border-slate-200 text-xs">
                <span className="font-bold text-slate-700 block">Notes:</span>
                <span className="text-slate-600">{viewRecord.notes}</span>
              </div>
            )}

            <div className="flex justify-end pt-2 border-t border-slate-200">
              <button
                type="button"
                onClick={() => setViewRecord(null)}
                className="px-4 py-1.5 text-xs font-semibold text-white bg-slate-900 rounded hover:bg-slate-800 transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Record Wholesaler Payment Modal */}
      <Modal
        isOpen={paymentModalOpen}
        onClose={() => setPaymentModalOpen(false)}
        title="Record Wholesaler Payment"
        subtitle="Apply payment against an outstanding final invoice."
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
              onClick={handleSubmit}
              className="px-4 py-2 text-xs font-semibold text-white bg-slate-900 rounded-md hover:bg-slate-800 transition-colors cursor-pointer shadow-2xs"
            >
              Confirm Payment
            </button>
          </>
        }
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && <p className="text-xs text-rose-600 font-medium bg-rose-50 p-2.5 rounded border border-rose-200">{error}</p>}

          <SelectField
            label="Select Pending Invoice"
            required
            value={formData.invoiceId}
            onChange={(e) => handleInvoiceSelect(e.target.value)}
            options={pendingInvoices.map(i => ({
              value: i.id,
              label: `${i.invoiceNumber} — ${i.wholesalerName} (Due: ₹${i.dueAmount.toLocaleString()})`
            }))}
          />

          {selectedInvoice && (
            <div className="bg-slate-50 border border-slate-200 p-3 rounded text-xs space-y-1">
              <div className="flex justify-between">
                <span className="text-slate-500">Invoice Total:</span>
                <span className="font-mono font-bold">₹{selectedInvoice.finalNetPayableAmount.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Previously Paid:</span>
                <span className="font-mono text-emerald-700">₹{selectedInvoice.paidAmount.toLocaleString()}</span>
              </div>
              <div className="flex justify-between font-bold text-rose-700 border-t pt-1">
                <span>Outstanding Due:</span>
                <span className="font-mono">₹{selectedInvoice.dueAmount.toLocaleString()}</span>
              </div>
            </div>
          )}

          <InputField
            label="Payment Amount"
            type="number"
            required
            unit="₹"
            value={formData.amountPaid}
            onChange={(e) => setFormData({ ...formData, amountPaid: e.target.value })}
          />

          <SelectField
            label="Payment Method"
            required
            value={formData.paymentMethod}
            onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
            options={[
              { value: 'BANK_TRANSFER', label: 'Bank Transfer / RTGS' },
              { value: 'CASH', label: 'Cash' },
              { value: 'UPI', label: 'UPI' },
              { value: 'CHEQUE', label: 'Cheque' }
            ]}
          />

          <InputField
            label="Payment Date"
            type="date"
            required
            value={formData.paymentDate}
            onChange={(e) => setFormData({ ...formData, paymentDate: e.target.value })}
          />

          <InputField
            label="Reference / Transaction Number"
            value={formData.referenceNumber}
            onChange={(e) => setFormData({ ...formData, referenceNumber: e.target.value })}
            placeholder="e.g. Bank UTR number"
          />
        </form>
      </Modal>
    </div>
  );
};
