import React, { useState } from 'react';
import { Plus, FileText, Printer, ArrowUpRight, CreditCard, CheckCircle2, IndianRupee, Eye } from 'lucide-react';
import { erpService } from '../../services/storage';
import { Invoice, FinishedProduct, Wholesaler } from '../../types/erp';
import { PageHeader } from '../common/PageHeader';
import { DataTable, Column } from '../common/DataTable';
import { Drawer } from '../common/Drawer';
import { Modal } from '../common/Modal';
import { FormSection, InputField, SelectField } from '../common/FormControls';
import { StatusBadge } from '../common/StatusBadge';
import { printInvoiceHtml } from '../../utils/printHelper';
import { useKeyboardShortcuts } from '../../hooks/useKeyboardShortcuts';

interface FinalInvoicesViewProps {
  showToast: (msg: string) => void;
  onViewLot: (lotNumber: string) => void;
  onNavigateToPayments?: () => void;
}

export const FinalInvoicesView: React.FC<FinalInvoicesViewProps> = ({
  showToast,
  onViewLot,
  onNavigateToPayments
}) => {
  const [invoices, setInvoices] = useState<Invoice[]>(erpService.getInvoices());
  const [finishedProducts, setFinishedProducts] = useState<FinishedProduct[]>(erpService.getFinishedProducts());
  const [wholesalers, setWholesalers] = useState<Wholesaler[]>(erpService.getWholesalers());

  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);

  // Payment modal state
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [targetPaymentInvoice, setTargetPaymentInvoice] = useState<Invoice | null>(null);
  const [paymentFormData, setPaymentFormData] = useState({
    amountPaid: '',
    paymentDate: new Date().toISOString().split('T')[0],
    paymentMethod: 'BANK_TRANSFER',
    referenceNumber: '',
    notes: ''
  });
  const [paymentError, setPaymentError] = useState('');

  const purchases = erpService.getPurchases();

  // All unique lots from finished products where ALL finished items are assigned to employees and do NOT have an invoice yet
  const availableLots = React.useMemo(() => {
    const map = new Map<string, { lotNumber: string; label: string; wholesalerId: string; qty: number }>();
    
    // Group finished products by lotNumber
    const fpMap = new Map<string, FinishedProduct[]>();
    finishedProducts.forEach(fp => {
      const list = fpMap.get(fp.lotNumber) || [];
      list.push(fp);
      fpMap.set(fp.lotNumber, list);
    });

    fpMap.forEach((fps, lotNum) => {
      if (!invoices.some(inv => inv.lotNumber === lotNum)) {
        const totalStitched = fps.reduce((sum, f) => sum + f.totalStitchedQty, 0);
        const damaged = fps.reduce((sum, f) => sum + f.damagedQuantity, 0);
        const assigned = fps.reduce((sum, f) => sum + f.assignedToEmployeeQty, 0);
        const avail = fps.reduce((sum, f) => sum + f.availableForAssignmentQty, 0);

        // RULE: Lot is eligible for invoice IF AND ONLY IF all finished items are assigned to employees (avail === 0)
        if (totalStitched > 0 && (damaged + assigned === totalStitched) && avail === 0 && assigned > 0) {
          const pur = purchases.find(p => p.lotNumber === lotNum);
          map.set(lotNum, {
            lotNumber: lotNum,
            label: `${lotNum} — ${fps[0]?.productName || 'Garments'} (${assigned} pcs assigned - 100% READY)`,
            wholesalerId: pur?.wholesalerId || '',
            qty: assigned
          });
        }
      }
    });

    return Array.from(map.values());
  }, [finishedProducts, purchases, invoices]);

  const [formData, setFormData] = useState({
    lotNumber: '',
    invoiceNumber: '',
    invoiceDate: new Date().toISOString().split('T')[0],
    wholesalerId: '',
    totalItemsQuantity: '',
    ratePerItem: '350',
    subtotalAmount: '',
    taxAmount: '0',
    discountAmount: '0',
    finalNetPayableAmount: '',
    initialPaidAmount: '0',
    notes: ''
  });
  const [error, setError] = useState('');

  const refreshData = () => {
    setInvoices(erpService.getInvoices());
    setFinishedProducts(erpService.getFinishedProducts());
    setWholesalers(erpService.getWholesalers());
  };

  const handleOpenPaymentModal = (inv: Invoice) => {
    setTargetPaymentInvoice(inv);
    setPaymentFormData({
      amountPaid: String(inv.dueAmount),
      paymentDate: new Date().toISOString().split('T')[0],
      paymentMethod: 'BANK_TRANSFER',
      referenceNumber: `TXN-${Math.floor(100000 + Math.random() * 900000)}`,
      notes: 'Final invoice settlement payment'
    });
    setPaymentError('');
    setPaymentModalOpen(true);
  };

  const handlePaymentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetPaymentInvoice) return;
    const payAmt = Number(paymentFormData.amountPaid);
    if (!payAmt || payAmt <= 0) {
      setPaymentError('Payment amount must be greater than zero');
      return;
    }
    if (payAmt > targetPaymentInvoice.dueAmount) {
      setPaymentError(`Payment amount (₹${payAmt}) cannot exceed outstanding due (₹${targetPaymentInvoice.dueAmount})`);
      return;
    }

    try {
      erpService.recordWholesalerPayment({
        invoiceId: targetPaymentInvoice.id,
        wholesalerId: targetPaymentInvoice.wholesalerId,
        wholesalerName: targetPaymentInvoice.wholesalerName,
        paymentDate: paymentFormData.paymentDate,
        amountPaid: payAmt,
        paymentMethod: paymentFormData.paymentMethod as any,
        referenceNumber: paymentFormData.referenceNumber,
        notes: paymentFormData.notes
      });

      showToast(`Payment of ₹${payAmt.toLocaleString()} recorded for Invoice ${targetPaymentInvoice.invoiceNumber}`);
      refreshData();
      setPaymentModalOpen(false);
      if (selectedInvoice && selectedInvoice.id === targetPaymentInvoice.id) {
        setSelectedInvoice(erpService.getInvoices().find(i => i.id === targetPaymentInvoice.id) || null);
      }
    } catch (err: any) {
      setPaymentError(err.message || 'Failed to record payment');
    }
  };

  const handleOpenNew = () => {
    const selectedLot = availableLots.length > 0 ? availableLots[0] : null;
    const pur = selectedLot ? erpService.getPurchases().find(p => p.lotNumber === selectedLot.lotNumber) : null;
    const nextInvNum = `INV-2026-${100 + invoices.length + 1}`;

    const qty = selectedLot ? selectedLot.qty : 400;
    const rate = 350;
    const sub = qty * rate;

    setFormData({
      lotNumber: selectedLot ? selectedLot.lotNumber : '',
      invoiceNumber: nextInvNum,
      invoiceDate: new Date().toISOString().split('T')[0],
      wholesalerId: pur ? pur.wholesalerId : (selectedLot ? selectedLot.wholesalerId : (wholesalers.length > 0 ? wholesalers[0].id : '')),
      totalItemsQuantity: String(qty),
      ratePerItem: String(rate),
      subtotalAmount: String(sub),
      taxAmount: String(Math.round(sub * 0.05)),
      discountAmount: '0',
      finalNetPayableAmount: String(sub + Math.round(sub * 0.05)),
      initialPaidAmount: '0',
      notes: ''
    });
    setError('');
    setIsDrawerOpen(true);
  };

  useKeyboardShortcuts({
    onNew: handleOpenNew,
    onPrint: () => {
      if (selectedInvoice) {
        printInvoiceHtml(selectedInvoice);
      } else if (invoices.length > 0) {
        printInvoiceHtml(invoices[0]);
      }
    },
    onPayment: () => {
      if (selectedInvoice) {
        handleOpenPaymentModal(selectedInvoice);
      } else if (invoices.length > 0) {
        handleOpenPaymentModal(invoices[0]);
      }
    },
    onClose: () => {
      setIsDrawerOpen(false);
      setPaymentModalOpen(false);
      setSelectedInvoice(null);
    }
  });

  const handleLotChange = (lotNum: string) => {
    const foundLot = availableLots.find(l => l.lotNumber === lotNum);
    const fp = finishedProducts.find(f => f.lotNumber === lotNum);
    const pur = erpService.getPurchases().find(p => p.lotNumber === lotNum);
    const qty = foundLot ? foundLot.qty : (fp ? (fp.assignedToEmployeeQty || fp.totalStitchedQty) : 400);
    const rate = Number(formData.ratePerItem) || 350;
    const sub = qty * rate;
    const tax = Math.round(sub * 0.05);

    setFormData(prev => ({
      ...prev,
      lotNumber: lotNum,
      wholesalerId: pur ? pur.wholesalerId : (foundLot?.wholesalerId || prev.wholesalerId),
      totalItemsQuantity: String(qty),
      subtotalAmount: String(sub),
      taxAmount: String(tax),
      finalNetPayableAmount: String(sub + tax - Number(prev.discountAmount || 0))
    }));
  };

  const recalculateAmounts = (qtyStr: string, rateStr: string, taxStr: string, discStr: string) => {
    const qty = Number(qtyStr) || 0;
    const rate = Number(rateStr) || 0;
    const sub = qty * rate;
    const tax = Number(taxStr) || 0;
    const disc = Number(discStr) || 0;
    const net = sub + tax - disc;

    setFormData(prev => ({
      ...prev,
      totalItemsQuantity: qtyStr,
      ratePerItem: rateStr,
      subtotalAmount: String(sub),
      taxAmount: taxStr,
      discountAmount: discStr,
      finalNetPayableAmount: String(net)
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.lotNumber) {
      setError('Please select a Lot Number');
      return;
    }
    if (!formData.invoiceNumber.trim()) {
      setError('Invoice Number is required');
      return;
    }
    if (!formData.wholesalerId) {
      setError('Please select a Wholesaler');
      return;
    }

    const ws = wholesalers.find(w => w.id === formData.wholesalerId);

    try {
      erpService.generateFinalInvoice({
        invoiceNumber: formData.invoiceNumber,
        invoiceDate: formData.invoiceDate,
        wholesalerId: formData.wholesalerId,
        wholesalerName: ws ? ws.name : 'Unknown Wholesaler',
        lotNumber: formData.lotNumber,
        totalItemsQuantity: Number(formData.totalItemsQuantity),
        ratePerItem: Number(formData.ratePerItem),
        subtotalAmount: Number(formData.subtotalAmount),
        taxAmount: Number(formData.taxAmount || 0),
        discountAmount: Number(formData.discountAmount || 0),
        finalNetPayableAmount: Number(formData.finalNetPayableAmount),
        initialPaidAmount: Number(formData.initialPaidAmount || 0),
        notes: formData.notes
      });

      showToast(`Final Invoice ${formData.invoiceNumber} generated for Lot ${formData.lotNumber}`);
      refreshData();
      setIsDrawerOpen(false);
      if (onNavigateToPayments) onNavigateToPayments();
    } catch (err: any) {
      setError(err.message || 'Failed to generate final invoice');
    }
  };

  const columns: Column<Invoice>[] = [
    {
      key: 'invoiceNumber',
      header: 'Invoice No.',
      sortable: true,
      accessor: (inv) => (
        <div>
          <button
            type="button"
            onClick={() => setSelectedInvoice(inv)}
            className="font-mono font-bold text-slate-900 hover:text-indigo-600 hover:underline cursor-pointer"
          >
            {inv.invoiceNumber}
          </button>
          <div className="text-xs text-slate-500">Date: {inv.invoiceDate}</div>
        </div>
      )
    },
    {
      key: 'lotNumber',
      header: 'Lot No.',
      accessor: (inv) => (
        <button
          type="button"
          onClick={() => onViewLot(inv.lotNumber)}
          className="font-mono font-semibold text-slate-800 hover:underline cursor-pointer flex items-center gap-1"
        >
          {inv.lotNumber}
          <ArrowUpRight className="w-3 h-3 text-slate-400" />
        </button>
      )
    },
    {
      key: 'wholesalerName',
      header: 'Wholesaler / Client',
      sortable: true,
      accessor: (inv) => <span className="font-semibold text-slate-900">{inv.wholesalerName}</span>
    },
    {
      key: 'finalNetPayableAmount',
      header: 'Final Invoice Amount',
      align: 'right',
      accessor: (inv) => <span className="font-mono font-bold text-slate-900">₹{inv.finalNetPayableAmount.toLocaleString()}</span>
    },
    {
      key: 'dueAmount',
      header: 'Outstanding Due',
      align: 'right',
      accessor: (inv) => (
        <span className={`font-mono font-bold ${inv.dueAmount > 0 ? 'text-rose-700' : 'text-slate-400'}`}>
          ₹{inv.dueAmount.toLocaleString()}
        </span>
      )
    },
    {
      key: 'paymentStatus',
      header: 'Payment Status',
      align: 'center'
    }
  ];

  return (
    <div className="space-y-3">
      <PageHeader
        title="FINAL TAX INVOICES & BILLING LEDGER"
        description="Generate official GST manufacturing settlement invoices for finished lot goods and record payment collections."
        primaryAction={{
          label: "Generate Final Invoice (F2)",
          onClick: handleOpenNew,
          icon: <Plus className="w-3.5 h-3.5" />
        }}
      />

      {/* Financial KPI Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-5">
        <div className="bg-white p-3.5 rounded-lg border border-slate-200 shadow-2xs">
          <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wider block">Total Invoiced</span>
          <span className="text-lg font-mono font-bold text-slate-900 mt-0.5 block">
            ₹{invoices.reduce((sum, i) => sum + i.finalNetPayableAmount, 0).toLocaleString()}
          </span>
          <span className="text-[11px] text-slate-500 mt-1 block">{invoices.length} Invoices Issued</span>
        </div>

        <div className="bg-white p-3.5 rounded-lg border border-slate-200 shadow-2xs">
          <span className="text-[11px] font-medium text-emerald-700 uppercase tracking-wider block">Total Received</span>
          <span className="text-lg font-mono font-bold text-emerald-700 mt-0.5 block">
            ₹{invoices.reduce((sum, i) => sum + i.paidAmount, 0).toLocaleString()}
          </span>
          <span className="text-[11px] text-slate-500 mt-1 block">Collected Payments</span>
        </div>

        <div className="bg-white p-3.5 rounded-lg border border-slate-200 shadow-2xs">
          <span className="text-[11px] font-medium text-rose-700 uppercase tracking-wider block">Outstanding Balance Due</span>
          <span className="text-lg font-mono font-bold text-rose-700 mt-0.5 block">
            ₹{invoices.reduce((sum, i) => sum + i.dueAmount, 0).toLocaleString()}
          </span>
          <span className="text-[11px] text-rose-600 font-semibold mt-1 block">
            {invoices.filter(i => i.dueAmount > 0).length} Unsettled Invoices
          </span>
        </div>

        <div className="bg-white p-3.5 rounded-lg border border-slate-200 shadow-2xs">
          <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wider block">Payment Status</span>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-xs font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
              {invoices.filter(i => i.paymentStatus === 'PAID').length} Paid
            </span>
            <span className="text-xs font-semibold text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
              {invoices.filter(i => i.paymentStatus === 'PARTIALLY_PAID').length} Partial
            </span>
            <span className="text-xs font-semibold text-rose-800 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
              {invoices.filter(i => i.paymentStatus === 'UNPAID').length} Unpaid
            </span>
          </div>
        </div>
      </div>

      <DataTable
        data={invoices}
        columns={columns}
        searchPlaceholder="Search invoice by Invoice No., Lot No., or Wholesaler..."
        searchKeys={['invoiceNumber', 'lotNumber', 'wholesalerName']}
        onRowClick={(inv) => setSelectedInvoice(inv)}
        actions={(inv) => (
          <div className="flex items-center justify-end gap-1.5">
            {inv.dueAmount > 0 && (
              <button
                type="button"
                onClick={() => handleOpenPaymentModal(inv)}
                className="px-2.5 py-1 text-xs font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded transition-colors cursor-pointer flex items-center gap-1 shadow-2xs"
                title="Record partial or full payment"
              >
                <CreditCard className="w-3 h-3 text-emerald-700" />
                Record Payment
              </button>
            )}
            <button
              type="button"
              onClick={() => setSelectedInvoice(inv)}
              className="px-2.5 py-1 text-xs font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 rounded transition-colors cursor-pointer flex items-center gap-1"
            >
              <Eye className="w-3.5 h-3.5 text-indigo-600" />
              View
            </button>
            <button
              type="button"
              onClick={() => printInvoiceHtml(inv)}
              className="px-2.5 py-1 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded transition-colors cursor-pointer flex items-center gap-1 shadow-2xs"
            >
              <Printer className="w-3 h-3" />
              Print
            </button>
          </div>
        )}
      />

      {/* Generate Invoice Drawer */}
      <Drawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        title="Generate Final Invoice"
        subtitle="Create official settlement invoice for ready lot."
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
              Generate Final Invoice
            </button>
          </>
        }
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && <p className="text-xs text-rose-600 font-medium bg-rose-50 p-2.5 rounded border border-rose-200">{error}</p>}

          <FormSection title="Lot & Wholesaler Selection">
            <SelectField
              label="Select Lot for Final Invoice"
              required
              colSpan={2}
              value={formData.lotNumber}
              onChange={(e) => handleLotChange(e.target.value)}
              options={
                availableLots.length > 0
                  ? availableLots.map(lot => ({
                      value: lot.lotNumber,
                      label: lot.label
                    }))
                  : [{ value: '', label: 'No pending lots available for invoice' }]
              }
            />

            <SelectField
              label="Wholesaler"
              required
              colSpan={2}
              value={formData.wholesalerId}
              onChange={(e) => setFormData({ ...formData, wholesalerId: e.target.value })}
              options={wholesalers.map(w => ({ value: w.id, label: w.name }))}
            />

            <InputField
              label="Invoice Number"
              required
              value={formData.invoiceNumber}
              onChange={(e) => setFormData({ ...formData, invoiceNumber: e.target.value })}
              placeholder="e.g. INV-2026-001"
            />

            <InputField
              label="Invoice Date"
              type="date"
              required
              value={formData.invoiceDate}
              onChange={(e) => setFormData({ ...formData, invoiceDate: e.target.value })}
            />
          </FormSection>

          <FormSection title="Invoice Financial Calculation">
            <InputField
              label="Accounted Garments Quantity"
              type="number"
              required
              unit="pcs"
              value={formData.totalItemsQuantity}
              onChange={(e) => recalculateAmounts(e.target.value, formData.ratePerItem, formData.taxAmount, formData.discountAmount)}
            />

            <InputField
              label="Wholesale Rate per Item"
              type="number"
              required
              unit="₹"
              value={formData.ratePerItem}
              onChange={(e) => recalculateAmounts(formData.totalItemsQuantity, e.target.value, formData.taxAmount, formData.discountAmount)}
            />

            <InputField
              label="Subtotal Amount"
              type="number"
              unit="₹"
              value={formData.subtotalAmount}
              onChange={(e) => setFormData({ ...formData, subtotalAmount: e.target.value })}
            />

            <InputField
              label="GST / Tax Amount"
              type="number"
              unit="₹"
              value={formData.taxAmount}
              onChange={(e) => recalculateAmounts(formData.totalItemsQuantity, formData.ratePerItem, e.target.value, formData.discountAmount)}
            />

            <InputField
              label="Discount"
              type="number"
              unit="₹"
              value={formData.discountAmount}
              onChange={(e) => recalculateAmounts(formData.totalItemsQuantity, formData.ratePerItem, formData.taxAmount, e.target.value)}
            />

            <InputField
              label="Final Net Payable Amount"
              type="number"
              required
              unit="₹"
              value={formData.finalNetPayableAmount}
              onChange={(e) => setFormData({ ...formData, finalNetPayableAmount: e.target.value })}
            />

            <InputField
              label="Initial / Advance Paid Amount Received"
              type="number"
              unit="₹"
              value={formData.initialPaidAmount}
              onChange={(e) => setFormData({ ...formData, initialPaidAmount: e.target.value })}
              placeholder="0 (Unpaid / Full Payment Remaining)"
            />

            <InputField
              label="Notes"
              colSpan={2}
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Final settlement remarks"
            />
          </FormSection>
        </form>
      </Drawer>

      {/* Invoice Print & Audit Modal */}
      {selectedInvoice && (
        <Modal
          isOpen={Boolean(selectedInvoice)}
          onClose={() => setSelectedInvoice(null)}
          title={`INVOICE — ${selectedInvoice.invoiceNumber}`}
          subtitle={`Lot Number: ${selectedInvoice.lotNumber} • Date: ${selectedInvoice.invoiceDate}`}
          maxWidth="lg"
        >
          <div className="printable-invoice space-y-4 p-2 font-sans">
            {/* Invoice Header */}
            <div className="flex justify-between items-start border-b pb-3">
              <div>
                <h2 className="text-base font-bold text-slate-900">SR TECH GARMENT SOFTWARE</h2>
                <p className="text-xs text-slate-500">Official Garment Manufacturing Settlement Invoice</p>
              </div>
              <div className="text-right">
                <StatusBadge status={selectedInvoice.paymentStatus} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs bg-slate-50 p-3 rounded border border-slate-200">
              <div>
                <span className="text-slate-500 font-semibold block">Billed To:</span>
                <span className="font-bold text-slate-900 text-sm">{selectedInvoice.wholesalerName}</span>
              </div>
              <div>
                <span className="text-slate-500 font-semibold block">Invoice Details:</span>
                <span className="text-slate-800 block">Number: {selectedInvoice.invoiceNumber}</span>
                <span className="text-slate-800 block">Lot Reference: {selectedInvoice.lotNumber}</span>
              </div>
            </div>

            {/* Line Items */}
            <table className="w-full text-left text-xs border border-slate-200 divide-y divide-slate-200">
              <thead className="bg-slate-100 font-semibold text-slate-700 uppercase">
                <tr>
                  <th className="py-2 px-3">Description</th>
                  <th className="py-2 px-3 text-right">Quantity</th>
                  <th className="py-2 px-3 text-right">Rate</th>
                  <th className="py-2 px-3 text-right">Total</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="py-2 px-3">Garment Finished Goods (Lot {selectedInvoice.lotNumber})</td>
                  <td className="py-2 px-3 text-right font-mono">{selectedInvoice.totalItemsQuantity} pcs</td>
                  <td className="py-2 px-3 text-right font-mono">₹{selectedInvoice.ratePerItem}</td>
                  <td className="py-2 px-3 text-right font-mono font-bold">₹{selectedInvoice.subtotalAmount.toLocaleString()}</td>
                </tr>
              </tbody>
            </table>

            {/* Totals */}
            <div className="flex justify-end text-xs">
              <div className="w-64 space-y-1 text-right bg-slate-50 p-3 rounded border border-slate-200">
                <div className="flex justify-between">
                  <span className="text-slate-500">Subtotal:</span>
                  <span className="font-mono">₹{selectedInvoice.subtotalAmount.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Tax / GST:</span>
                  <span className="font-mono">₹{selectedInvoice.taxAmount.toLocaleString()}</span>
                </div>
                {selectedInvoice.discountAmount > 0 && (
                  <div className="flex justify-between text-rose-600">
                    <span>Discount:</span>
                    <span className="font-mono">-₹{selectedInvoice.discountAmount.toLocaleString()}</span>
                  </div>
                )}
                <div className="flex justify-between font-bold text-sm text-slate-900 border-t pt-1">
                  <span>Final Net Payable:</span>
                  <span className="font-mono">₹{selectedInvoice.finalNetPayableAmount.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-emerald-700 font-semibold">
                  <span>Paid Amount:</span>
                  <span className="font-mono">₹{selectedInvoice.paidAmount.toLocaleString()}</span>
                </div>
                {selectedInvoice.dueAmount > 0 ? (
                  <div className="flex justify-between font-bold text-rose-700 border-t pt-1">
                    <span>Outstanding Due:</span>
                    <span className="font-mono">₹{selectedInvoice.dueAmount.toLocaleString()}</span>
                  </div>
                ) : (
                  <div className="flex justify-between font-bold text-emerald-800 border-t pt-1 uppercase tracking-wider text-[11px]">
                    <span>Payment Status:</span>
                    <span className="font-mono text-emerald-700">PAID IN FULL ✓</span>
                  </div>
                )}
              </div>
            </div>

            {/* Quick Payment Settlement Section in Modal */}
            {selectedInvoice.dueAmount > 0 ? (
              <div className="bg-amber-50/80 border border-amber-200 p-3.5 rounded-lg no-print flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <div className="text-xs font-bold text-amber-900">Outstanding Payment Due</div>
                  <div className="text-xs text-amber-800">
                    ₹{selectedInvoice.dueAmount.toLocaleString()} remaining to settle this invoice.
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleOpenPaymentModal(selectedInvoice)}
                    className="px-3 py-1.5 text-xs font-semibold text-white bg-emerald-700 hover:bg-emerald-800 rounded transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs"
                  >
                    <CreditCard className="w-3.5 h-3.5" />
                    Record Payment
                  </button>
                </div>
              </div>
            ) : (
              <div className="bg-emerald-50 border border-emerald-200 p-3 rounded-lg no-print flex items-center gap-2 text-xs text-emerald-900 font-semibold">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                This invoice is fully paid and settled.
              </div>
            )}

            <div className="pt-3 flex justify-end gap-2 no-print border-t border-slate-200">
              <button
                type="button"
                onClick={() => printInvoiceHtml(selectedInvoice)}
                className="px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs"
              >
                <Printer className="w-3.5 h-3.5" />
                Print / Save Invoice PDF
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Record Payment Modal */}
      {targetPaymentInvoice && (
        <Modal
          isOpen={paymentModalOpen}
          onClose={() => setPaymentModalOpen(false)}
          title={`Record Payment for Invoice ${targetPaymentInvoice.invoiceNumber}`}
          subtitle={`Client: ${targetPaymentInvoice.wholesalerName} • Lot ${targetPaymentInvoice.lotNumber}`}
        >
          <form onSubmit={handlePaymentSubmit} className="space-y-4">
            {paymentError && (
              <p className="text-xs text-rose-600 font-medium bg-rose-50 p-2.5 rounded border border-rose-200">
                {paymentError}
              </p>
            )}

            <div className="bg-slate-50 border border-slate-200 p-3 rounded text-xs space-y-1">
              <div className="flex justify-between">
                <span className="text-slate-500">Invoice Total:</span>
                <span className="font-mono font-bold">₹{targetPaymentInvoice.finalNetPayableAmount.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Previously Paid:</span>
                <span className="font-mono text-emerald-700">₹{targetPaymentInvoice.paidAmount.toLocaleString()}</span>
              </div>
              <div className="flex justify-between font-bold text-rose-700 border-t pt-1">
                <span>Outstanding Balance Due:</span>
                <span className="font-mono">₹{targetPaymentInvoice.dueAmount.toLocaleString()}</span>
              </div>
            </div>

            <InputField
              label="Amount to Pay"
              type="number"
              required
              unit="₹"
              value={paymentFormData.amountPaid}
              onChange={(e) => setPaymentFormData({ ...paymentFormData, amountPaid: e.target.value })}
            />

            <SelectField
              label="Payment Method"
              required
              value={paymentFormData.paymentMethod}
              onChange={(e) => setPaymentFormData({ ...paymentFormData, paymentMethod: e.target.value })}
              options={[
                { value: 'BANK_TRANSFER', label: 'Bank Transfer / RTGS / NEFT' },
                { value: 'CASH', label: 'Cash' },
                { value: 'UPI', label: 'UPI / GPay / PhonePe' },
                { value: 'CHEQUE', label: 'Cheque' }
              ]}
            />

            <InputField
              label="Payment Date"
              type="date"
              required
              value={paymentFormData.paymentDate}
              onChange={(e) => setPaymentFormData({ ...paymentFormData, paymentDate: e.target.value })}
            />

            <InputField
              label="Reference / Transaction Number"
              value={paymentFormData.referenceNumber}
              onChange={(e) => setPaymentFormData({ ...paymentFormData, referenceNumber: e.target.value })}
              placeholder="e.g. UTR / Transaction Ref ID"
            />

            <InputField
              label="Remarks / Notes"
              value={paymentFormData.notes}
              onChange={(e) => setPaymentFormData({ ...paymentFormData, notes: e.target.value })}
              placeholder="e.g. Partial / Full settlement note"
            />

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-200">
              <button
                type="button"
                onClick={() => setPaymentModalOpen(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-200/60 rounded transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-xs font-semibold text-white bg-slate-900 rounded hover:bg-slate-800 transition-colors cursor-pointer shadow-2xs flex items-center gap-1.5"
              >
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                Confirm Payment
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
