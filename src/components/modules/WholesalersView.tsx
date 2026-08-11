import React, { useState } from 'react';
import { Plus, Building2, Phone, MapPin, FileText, Eye } from 'lucide-react';
import { erpService } from '../../services/storage';
import { Wholesaler } from '../../types/erp';
import { PageHeader } from '../common/PageHeader';
import { DataTable, Column } from '../common/DataTable';
import { Drawer } from '../common/Drawer';
import { Modal } from '../common/Modal';
import { FormSection, InputField } from '../common/FormControls';

interface WholesalersViewProps {
  showToast: (msg: string) => void;
  onViewLot?: (lotNumber: string) => void;
}

export const WholesalersView: React.FC<WholesalersViewProps> = ({ showToast, onViewLot }) => {
  const [wholesalers, setWholesalers] = useState<Wholesaler[]>(erpService.getWholesalers());
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [selectedWholesaler, setSelectedWholesaler] = useState<Wholesaler | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    address: '',
    gstNumber: ''
  });
  const [error, setError] = useState('');

  const refreshData = () => {
    setWholesalers(erpService.getWholesalers());
  };

  const handleOpenAdd = () => {
    setFormData({ name: '', phone: '', address: '', gstNumber: '' });
    setError('');
    setIsDrawerOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      setError('Wholesaler name is required');
      return;
    }

    try {
      erpService.addWholesaler({
        name: formData.name,
        phone: formData.phone || '-',
        address: formData.address || '-',
        gstNumber: formData.gstNumber
      });
      showToast(`Wholesaler "${formData.name}" saved successfully.`);
      refreshData();
      setIsDrawerOpen(false);
    } catch (err: any) {
      setError(err.message || 'Failed to save wholesaler');
    }
  };

  const purchases = erpService.getPurchases();
  const getPurchasesForWs = (wsId: string) => purchases.filter(p => p.wholesalerId === wsId);

  const columns: Column<Wholesaler>[] = [
    {
      key: 'name',
      header: 'Wholesaler Name',
      sortable: true,
      accessor: (ws) => (
        <div>
          <div className="font-bold text-slate-900">{ws.name}</div>
          <div className="text-xs text-slate-500 font-mono">GST: {ws.gstNumber || 'N/A'}</div>
        </div>
      )
    },
    {
      key: 'phone',
      header: 'Contact Phone',
      sortable: true,
      accessor: (ws) => (
        <span className="font-mono text-xs">{ws.phone}</span>
      )
    },
    {
      key: 'address',
      header: 'Market / Address',
      accessor: (ws) => (
        <span className="text-slate-600 truncate max-w-xs block">{ws.address}</span>
      )
    },
    {
      key: 'purchasesCount',
      header: 'Total Purchases',
      align: 'center',
      accessor: (ws) => {
        const count = getPurchasesForWs(ws.id).length;
        return (
          <span className="px-2 py-0.5 rounded bg-slate-100 font-bold text-xs font-mono text-slate-800">
            {count} lots
          </span>
        );
      }
    }
  ];

  return (
    <div>
      <PageHeader
        title="Wholesalers Master"
        description="Directory of fabric suppliers and wholesale material partners."
        primaryAction={{
          label: "Add Wholesaler",
          onClick: handleOpenAdd,
          icon: <Plus className="w-4 h-4" />
        }}
      />

      <DataTable
        data={wholesalers}
        columns={columns}
        searchPlaceholder="Search wholesaler by name, phone, or GST..."
        searchKeys={['name', 'phone', 'gstNumber', 'address']}
        onRowClick={(ws) => setSelectedWholesaler(ws)}
        actions={(ws) => (
          <button
            type="button"
            onClick={() => setSelectedWholesaler(ws)}
            className="px-2.5 py-1 text-xs font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 rounded transition-colors cursor-pointer flex items-center gap-1"
          >
            <Eye className="w-3.5 h-3.5 text-indigo-600" />
            View
          </button>
        )}
      />

      {/* Add Wholesaler Drawer */}
      <Drawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        title="Add New Wholesaler"
        subtitle="Register a new fabric supplier or wholesale firm."
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
              Save Wholesaler
            </button>
          </>
        }
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && <p className="text-xs text-rose-600 font-medium bg-rose-50 p-2.5 rounded border border-rose-200">{error}</p>}

          <FormSection title="Wholesaler Information" description="Primary business details for invoicing & lot tracking.">
            <InputField
              label="Wholesaler / Firm Name"
              required
              colSpan={2}
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g. Surat Cloth Traders"
            />

            <InputField
              label="Contact Phone"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              placeholder="+91 98765 43210"
            />

            <InputField
              label="GST Number"
              value={formData.gstNumber}
              onChange={(e) => setFormData({ ...formData, gstNumber: e.target.value })}
              placeholder="e.g. 24AAAAA0000A1Z5"
            />

            <InputField
              label="Market Address / Location"
              colSpan={2}
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              placeholder="e.g. Ring Road Textile Market, Surat"
            />
          </FormSection>
        </form>
      </Drawer>

      {/* Wholesaler Details Modal */}
      {selectedWholesaler && (
        <Modal
          isOpen={Boolean(selectedWholesaler)}
          onClose={() => setSelectedWholesaler(null)}
          title={selectedWholesaler.name}
          subtitle={`Wholesaler Master Card • GST: ${selectedWholesaler.gstNumber || 'N/A'}`}
          maxWidth="lg"
        >
          <div className="space-y-4 text-xs sm:text-sm">
            <div className="bg-slate-50 border border-slate-200 rounded-lg p-3.5 grid grid-cols-2 gap-3">
              <div>
                <span className="text-slate-500 font-semibold block text-xs">Phone:</span>
                <span className="font-mono text-slate-900 font-bold">{selectedWholesaler.phone}</span>
              </div>
              <div>
                <span className="text-slate-500 font-semibold block text-xs">Address:</span>
                <span className="text-slate-900">{selectedWholesaler.address}</span>
              </div>
            </div>

            <h4 className="font-bold text-slate-900 uppercase tracking-wider text-xs border-b pb-1 pt-2">
              Purchase Lots History ({getPurchasesForWs(selectedWholesaler.id).length})
            </h4>

            <div className="max-h-60 overflow-y-auto divide-y divide-slate-200 border rounded-md">
              {getPurchasesForWs(selectedWholesaler.id).map((p) => (
                <div key={p.id} className="p-3 flex items-center justify-between text-xs hover:bg-slate-50">
                  <div>
                    <span className="font-mono font-bold text-slate-900">{p.lotNumber}</span>
                    <span className="text-slate-500 ml-2">Challan: {p.challanNumber}</span>
                    <p className="text-slate-600 mt-0.5">{p.materialName} ({p.totalQuantity} {p.unit})</p>
                  </div>
                  <div className="text-right">
                    <span className="font-mono font-bold text-slate-900 block">₹{p.purchaseAmount.toLocaleString()}</span>
                    <span className="text-[11px] text-slate-400">{p.purchaseDate}</span>
                  </div>
                </div>
              ))}

              {getPurchasesForWs(selectedWholesaler.id).length === 0 && (
                <p className="p-4 text-center text-slate-500 text-xs">No purchase lots recorded yet for this wholesaler.</p>
              )}
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
