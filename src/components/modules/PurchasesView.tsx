import React, { useState } from 'react';
import { Plus, ShoppingCart, ArrowUpRight, Eye, FileText, Calendar, Building2, Tag } from 'lucide-react';
import { erpService } from '../../services/storage';
import { Purchase, Wholesaler } from '../../types/erp';
import { PageHeader } from '../common/PageHeader';
import { DataTable, Column } from '../common/DataTable';
import { Drawer } from '../common/Drawer';
import { Modal } from '../common/Modal';
import { FormSection, InputField, SelectField } from '../common/FormControls';
import { QuickAddModal } from '../common/QuickAddModal';

interface PurchasesViewProps {
  showToast: (msg: string) => void;
  onViewLot: (lotNumber: string) => void;
  onNavigateToRawMaterial?: () => void;
}

export const PurchasesView: React.FC<PurchasesViewProps> = ({ showToast, onViewLot, onNavigateToRawMaterial }) => {
  const [purchases, setPurchases] = useState<Purchase[]>(erpService.getPurchases());
  const [wholesalers, setWholesalers] = useState<Wholesaler[]>(erpService.getWholesalers());

  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [quickAddOpen, setQuickAddOpen] = useState(false);
  const [viewRecord, setViewRecord] = useState<Purchase | null>(null);

  const [formData, setFormData] = useState({
    wholesalerId: '',
    purchaseDate: new Date().toISOString().split('T')[0],
    challanNumber: '',
    lotNumber: '',
    materialName: '',
    unit: 'meters',
    totalQuantity: '',
    ratePerUnit: '',
    purchaseAmount: '',
    notes: ''
  });
  const [error, setError] = useState('');

  const refreshData = () => {
    setPurchases(erpService.getPurchases());
    setWholesalers(erpService.getWholesalers());
  };

  const handleOpenNew = () => {
    const nextLotNum = `LOT-2026-${100 + purchases.length + 1}`;
    setFormData({
      wholesalerId: wholesalers.length > 0 ? wholesalers[0].id : '',
      purchaseDate: new Date().toISOString().split('T')[0],
      challanNumber: `CH-${Math.floor(1000 + Math.random() * 9000)}`,
      lotNumber: nextLotNum,
      materialName: '100% Cotton Print Fabric',
      unit: 'meters',
      totalQuantity: '500',
      ratePerUnit: '100',
      purchaseAmount: '50000',
      notes: ''
    });
    setError('');
    setIsDrawerOpen(true);
  };

  const calculateAmount = (qtyStr: string, rateStr: string) => {
    const qty = Number(qtyStr) || 0;
    const rate = Number(rateStr) || 0;
    return qty * rate;
  };

  const handleQtyChange = (val: string) => {
    const amt = calculateAmount(val, formData.ratePerUnit);
    setFormData(prev => ({
      ...prev,
      totalQuantity: val,
      purchaseAmount: String(amt)
    }));
  };

  const handleRateChange = (val: string) => {
    const amt = calculateAmount(formData.totalQuantity, val);
    setFormData(prev => ({
      ...prev,
      ratePerUnit: val,
      purchaseAmount: String(amt)
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.wholesalerId) {
      setError('Please select a wholesaler');
      return;
    }
    if (!formData.challanNumber.trim()) {
      setError('Challan number is required');
      return;
    }
    if (!formData.lotNumber.trim()) {
      setError('Lot number is required');
      return;
    }
    if (!formData.materialName.trim()) {
      setError('Material name is required');
      return;
    }
    const qty = Number(formData.totalQuantity);
    if (!qty || qty <= 0) {
      setError('Quantity must be greater than zero');
      return;
    }

    const ws = wholesalers.find(w => w.id === formData.wholesalerId);

    try {
      erpService.createPurchase({
        wholesalerId: formData.wholesalerId,
        wholesalerName: ws ? ws.name : 'Unknown Wholesaler',
        purchaseDate: formData.purchaseDate,
        challanNumber: formData.challanNumber,
        lotNumber: formData.lotNumber,
        materialName: formData.materialName,
        unit: formData.unit,
        ratePerUnit: Number(formData.ratePerUnit || 0),
        totalQuantity: qty,
        purchaseAmount: Number(formData.purchaseAmount || 0),
        notes: formData.notes
      });

      showToast(`Purchase recorded for Lot "${formData.lotNumber}". Raw material created in inventory.`);
      refreshData();
      setIsDrawerOpen(false);
      if (onNavigateToRawMaterial) onNavigateToRawMaterial();
    } catch (err: any) {
      setError(err.message || 'Failed to save purchase');
    }
  };

  const columns: Column<Purchase>[] = [
    {
      key: 'lotNumber',
      header: 'Lot No.',
      sortable: true,
      accessor: (p) => (
        <button
          type="button"
          onClick={() => onViewLot(p.lotNumber)}
          className="font-mono font-bold text-slate-900 hover:text-indigo-600 hover:underline cursor-pointer flex items-center gap-1"
        >
          {p.lotNumber}
          <ArrowUpRight className="w-3 h-3 text-slate-400" />
        </button>
      )
    },
    {
      key: 'challanNumber',
      header: 'Challan No.',
      accessor: (p) => <span className="font-mono text-xs text-slate-700">{p.challanNumber}</span>
    },
    {
      key: 'wholesalerName',
      header: 'Wholesaler',
      sortable: true,
      accessor: (p) => <span className="font-medium text-slate-900">{p.wholesalerName}</span>
    },
    {
      key: 'materialName',
      header: 'Material Name',
      accessor: (p) => <span className="text-slate-700">{p.materialName}</span>
    },
    {
      key: 'totalQuantity',
      header: 'Purchased Qty',
      align: 'right',
      accessor: (p) => <span className="font-mono font-semibold">{p.totalQuantity} {p.unit}</span>
    },
    {
      key: 'purchaseAmount',
      header: 'Total Amount',
      align: 'right',
      accessor: (p) => <span className="font-mono font-bold text-slate-900">₹{p.purchaseAmount.toLocaleString()}</span>
    },
    {
      key: 'purchaseDate',
      header: 'Date',
      align: 'center',
      accessor: (p) => <span className="text-xs text-slate-500">{p.purchaseDate}</span>
    }
  ];

  return (
    <div>
      <PageHeader
        title="Fabric Purchases"
        description="Record incoming material challans and automatically generate Lot tracking records."
        primaryAction={{
          label: "Create Purchase",
          onClick: handleOpenNew,
          icon: <Plus className="w-4 h-4" />
        }}
      />

      <DataTable
        data={purchases}
        columns={columns}
        searchPlaceholder="Search purchases by Lot Number, Challan, or Wholesaler..."
        searchKeys={['lotNumber', 'challanNumber', 'wholesalerName', 'materialName']}
        onRowClick={(p) => onViewLot(p.lotNumber)}
        actions={(p) => (
          <div className="flex items-center justify-end gap-1.5">
            <button
              type="button"
              onClick={() => setViewRecord(p)}
              className="px-2.5 py-1 text-xs font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 rounded transition-colors cursor-pointer flex items-center gap-1"
            >
              <Eye className="w-3.5 h-3.5 text-indigo-600" />
              View
            </button>
            <button
              type="button"
              onClick={() => onViewLot(p.lotNumber)}
              className="px-2.5 py-1 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded transition-colors cursor-pointer"
            >
              Audit Lot
            </button>
          </div>
        )}
      />

      {/* View Record Modal */}
      {viewRecord && (
        <Modal
          isOpen={Boolean(viewRecord)}
          onClose={() => setViewRecord(null)}
          title={`Purchase Record - Lot ${viewRecord.lotNumber}`}
          subtitle={`Challan: ${viewRecord.challanNumber} • Date: ${viewRecord.purchaseDate}`}
        >
          <div className="space-y-4 text-xs sm:text-sm">
            <div className="grid grid-cols-2 gap-3 bg-slate-50 p-3.5 rounded-lg border border-slate-200">
              <div>
                <span className="text-slate-500 text-xs block">Lot Number</span>
                <span className="font-mono font-bold text-slate-900 text-sm">{viewRecord.lotNumber}</span>
              </div>
              <div>
                <span className="text-slate-500 text-xs block">Challan Number</span>
                <span className="font-mono font-bold text-slate-800">{viewRecord.challanNumber}</span>
              </div>
              <div>
                <span className="text-slate-500 text-xs block">Wholesaler / Supplier</span>
                <span className="font-medium text-slate-900">{viewRecord.wholesalerName}</span>
              </div>
              <div>
                <span className="text-slate-500 text-xs block">Purchase Date</span>
                <span className="font-mono text-slate-800">{viewRecord.purchaseDate}</span>
              </div>
            </div>

            <div className="bg-indigo-50/60 p-3.5 rounded-lg border border-indigo-100 space-y-2">
              <span className="font-bold text-indigo-950 text-xs block">Material Specifications</span>
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <span className="text-[11px] text-slate-500 block">Quality Name</span>
                  <span className="font-semibold text-slate-900">{viewRecord.materialName}</span>
                </div>
                <div>
                  <span className="text-[11px] text-slate-500 block">Total Quantity</span>
                  <span className="font-mono font-bold text-slate-900">{viewRecord.totalQuantity} {viewRecord.unit}</span>
                </div>
                <div>
                  <span className="text-[11px] text-slate-500 block">Rate per Unit</span>
                  <span className="font-mono font-semibold text-slate-800">₹{viewRecord.ratePerUnit || 0} / {viewRecord.unit}</span>
                </div>
              </div>
            </div>

            <div className="bg-slate-900 text-white p-3.5 rounded-lg flex items-center justify-between">
              <div>
                <span className="text-slate-400 text-xs block">Total Purchase Cost</span>
                <span className="font-mono font-bold text-emerald-400 text-lg">₹{viewRecord.purchaseAmount.toLocaleString()}</span>
              </div>
              <button
                type="button"
                onClick={() => {
                  const lot = viewRecord.lotNumber;
                  setViewRecord(null);
                  onViewLot(lot);
                }}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded transition-colors flex items-center gap-1 cursor-pointer"
              >
                <ArrowUpRight className="w-3.5 h-3.5 text-indigo-400" />
                Track Lot Audit
              </button>
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

      {/* Create Purchase Drawer */}
      <Drawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        title="Create Material Purchase"
        subtitle="Enter challan & lot details from wholesaler."
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
              Save Purchase & Lot
            </button>
          </>
        }
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && <p className="text-xs text-rose-600 font-medium bg-rose-50 p-2.5 rounded border border-rose-200">{error}</p>}

          <FormSection title="Purchase & Challan Information">
            <SelectField
              label="Wholesaler"
              required
              colSpan={2}
              value={formData.wholesalerId}
              onChange={(e) => setFormData({ ...formData, wholesalerId: e.target.value })}
              options={wholesalers.map(w => ({ value: w.id, label: `${w.name} (${w.phone})` }))}
              onQuickAdd={() => setQuickAddOpen(true)}
              quickAddTitle="Add Wholesaler"
            />

            <InputField
              label="Purchase Date"
              type="date"
              required
              value={formData.purchaseDate}
              onChange={(e) => setFormData({ ...formData, purchaseDate: e.target.value })}
            />

            <InputField
              label="Challan Number"
              required
              value={formData.challanNumber}
              onChange={(e) => setFormData({ ...formData, challanNumber: e.target.value })}
              placeholder="e.g. CH-4587"
            />

            <InputField
              label="Lot Number"
              required
              colSpan={2}
              value={formData.lotNumber}
              onChange={(e) => setFormData({ ...formData, lotNumber: e.target.value })}
              placeholder="e.g. LOT-2026-145"
              helperText="Unique Lot identifier used across cutting, stitching, & final invoice."
            />
          </FormSection>

          <FormSection title="Material Specifications">
            <InputField
              label="Material Name / Quality"
              required
              colSpan={2}
              value={formData.materialName}
              onChange={(e) => setFormData({ ...formData, materialName: e.target.value })}
              placeholder="e.g. 100% Pure Cotton Canvas"
            />

            <InputField
              label="Quantity"
              type="number"
              required
              value={formData.totalQuantity}
              onChange={(e) => handleQtyChange(e.target.value)}
              placeholder="1000"
            />

            <SelectField
              label="Unit of Measurement"
              value={formData.unit}
              onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
              options={[
                { value: 'meters', label: 'Meters (m)' },
                { value: 'yards', label: 'Yards (yd)' },
                { value: 'kg', label: 'Kilograms (kg)' },
                { value: 'rolls', label: 'Rolls' }
              ]}
            />

            <InputField
              label="Rate per Unit"
              type="number"
              unit="₹"
              value={formData.ratePerUnit}
              onChange={(e) => handleRateChange(e.target.value)}
              placeholder="120"
            />

            <InputField
              label="Total Purchase Amount"
              type="number"
              unit="₹"
              required
              value={formData.purchaseAmount}
              onChange={(e) => setFormData({ ...formData, purchaseAmount: e.target.value })}
            />
          </FormSection>
        </form>
      </Drawer>

      <QuickAddModal
        isOpen={quickAddOpen}
        onClose={() => setQuickAddOpen(false)}
        type="wholesaler"
        showToast={showToast}
        onSuccess={(newId) => {
          refreshData();
          setFormData(prev => ({ ...prev, wholesalerId: newId }));
        }}
      />
    </div>
  );
};
