import React, { useState } from 'react';
import { AlertCircle, Layers, ArrowUpRight, Eye, Package, ShieldAlert } from 'lucide-react';
import { erpService } from '../../services/storage';
import { RawMaterial, RawMaterialDamage } from '../../types/erp';
import { PageHeader } from '../common/PageHeader';
import { DataTable, Column } from '../common/DataTable';
import { Modal } from '../common/Modal';
import { FormSection, InputField } from '../common/FormControls';
import { useKeyboardShortcuts } from '../../hooks/useKeyboardShortcuts';

interface RawMaterialViewProps {
  showToast: (msg: string) => void;
  onViewLot: (lotNumber: string) => void;
  onNavigateToCutting?: () => void;
}

export const RawMaterialView: React.FC<RawMaterialViewProps> = ({ showToast, onViewLot, onNavigateToCutting }) => {
  const [rawMaterials, setRawMaterials] = useState<RawMaterial[]>(erpService.getRawMaterials());
  const [damages, setDamages] = useState<RawMaterialDamage[]>(erpService.getRawMaterialDamages());

  const [selectedRm, setSelectedRm] = useState<RawMaterial | null>(null);
  const [viewRecordRm, setViewRecordRm] = useState<RawMaterial | null>(null);
  const [damageModalOpen, setDamageModalOpen] = useState(false);

  useKeyboardShortcuts({
    onNew: () => {
      if (onNavigateToCutting) onNavigateToCutting();
    },
    onClose: () => {
      setDamageModalOpen(false);
      setViewRecordRm(null);
      setSelectedRm(null);
    }
  });

  const [damageData, setDamageData] = useState({
    damageQuantity: '',
    reason: '',
    damageDate: new Date().toISOString().split('T')[0]
  });
  const [error, setError] = useState('');

  const refreshData = () => {
    setRawMaterials(erpService.getRawMaterials());
    setDamages(erpService.getRawMaterialDamages());
  };

  const handleOpenDamage = (rm: RawMaterial) => {
    setSelectedRm(rm);
    setDamageData({
      damageQuantity: '',
      reason: 'Fabric roll defect / Water damage',
      damageDate: new Date().toISOString().split('T')[0]
    });
    setError('');
    setDamageModalOpen(true);
  };

  const handleSaveDamage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRm) return;

    const qty = Number(damageData.damageQuantity);
    if (!qty || qty <= 0) {
      setError('Damage quantity must be greater than zero');
      return;
    }
    if (qty > selectedRm.availableQuantity) {
      setError(`Damage quantity (${qty}) cannot exceed available quantity (${selectedRm.availableQuantity})`);
      return;
    }

    try {
      erpService.addRawMaterialDamage({
        rawMaterialId: selectedRm.id,
        lotNumber: selectedRm.lotNumber,
        damageQuantity: qty,
        reason: damageData.reason || 'General fabric damage',
        damageDate: damageData.damageDate
      });

      showToast(`Recorded damage of ${qty} ${selectedRm.unit} for Lot ${selectedRm.lotNumber}`);
      refreshData();
      setDamageModalOpen(false);
    } catch (err: any) {
      setError(err.message || 'Failed to record damage');
    }
  };

  const columns: Column<RawMaterial>[] = [
    {
      key: 'lotNumber',
      header: 'Lot No.',
      sortable: true,
      accessor: (rm) => (
        <button
          type="button"
          onClick={() => onViewLot(rm.lotNumber)}
          className="font-mono font-bold text-slate-900 hover:text-indigo-600 hover:underline cursor-pointer flex items-center gap-1"
        >
          {rm.lotNumber}
          <ArrowUpRight className="w-3 h-3 text-slate-400" />
        </button>
      )
    },
    {
      key: 'materialName',
      header: 'Material Quality',
      sortable: true,
      accessor: (rm) => (
        <div>
          <div className="font-semibold text-slate-900">{rm.materialName}</div>
          <div className="text-xs text-slate-500">{rm.wholesalerName}</div>
        </div>
      )
    },
    {
      key: 'totalQuantity',
      header: 'Total Purchased',
      align: 'right',
      accessor: (rm) => <span className="font-mono font-semibold text-slate-800">{rm.totalQuantity} {rm.unit}</span>
    },
    {
      key: 'damagedQuantity',
      header: 'Damaged Qty',
      align: 'right',
      accessor: (rm) => (
        <span className={`font-mono font-semibold ${rm.damagedQuantity > 0 ? 'text-rose-600' : 'text-slate-400'}`}>
          {rm.damagedQuantity} {rm.unit}
        </span>
      )
    },
    {
      key: 'usedQuantity',
      header: 'Used in Cutting',
      align: 'right',
      accessor: (rm) => <span className="font-mono text-slate-700">{rm.usedQuantity} {rm.unit}</span>
    },
    {
      key: 'availableQuantity',
      header: 'Available for Cutting',
      align: 'right',
      accessor: (rm) => (
        <span className={`font-mono font-bold ${rm.availableQuantity > 0 ? 'text-emerald-700' : 'text-slate-400'}`}>
          {rm.availableQuantity} {rm.unit}
        </span>
      )
    },
    {
      key: 'status',
      header: 'Stock Status',
      align: 'center'
    }
  ];

  return (
    <div className="space-y-3">
      <PageHeader
        title="RAW MATERIAL & FABRIC ROLLS STOCK"
        description="Track purchased cloth rolls, available material balance for cutting masters, and damage logs."
        primaryAction={onNavigateToCutting ? {
          label: "Issue to Cutting Section (F2)",
          onClick: onNavigateToCutting,
          icon: <ArrowUpRight className="w-3.5 h-3.5" />
        } : undefined}
      />

      <DataTable
        data={rawMaterials}
        columns={columns}
        searchPlaceholder="Search raw materials by Lot No. or material name..."
        searchKeys={['lotNumber', 'materialName', 'wholesalerName']}
        onRowClick={(rm) => onViewLot(rm.lotNumber)}
        actions={(rm) => (
          <div className="flex items-center justify-end gap-1.5">
            <button
              type="button"
              onClick={() => setViewRecordRm(rm)}
              className="px-2.5 py-1 text-xs font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 rounded transition-colors cursor-pointer flex items-center gap-1"
            >
              <Eye className="w-3.5 h-3.5 text-indigo-600" />
              View
            </button>
            {rm.availableQuantity > 0 && (
              <button
                type="button"
                onClick={() => handleOpenDamage(rm)}
                className="px-2.5 py-1 text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded transition-colors cursor-pointer flex items-center gap-1"
              >
                <AlertCircle className="w-3 h-3" />
                Add Damage
              </button>
            )}
            <button
              type="button"
              onClick={() => onViewLot(rm.lotNumber)}
              className="px-2.5 py-1 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded transition-colors cursor-pointer"
            >
              Audit
            </button>
          </div>
        )}
      />

      {/* View Record Modal */}
      {viewRecordRm && (
        <Modal
          isOpen={Boolean(viewRecordRm)}
          onClose={() => setViewRecordRm(null)}
          title={`Raw Material Record - Lot ${viewRecordRm.lotNumber}`}
          subtitle={`Fabric: ${viewRecordRm.materialName} • Wholesaler: ${viewRecordRm.wholesalerName}`}
        >
          <div className="space-y-4 text-xs sm:text-sm">
            <div className="grid grid-cols-2 gap-3 bg-slate-50 p-3.5 rounded-lg border border-slate-200">
              <div>
                <span className="text-slate-500 text-xs block">Lot Number</span>
                <span className="font-mono font-bold text-slate-900 text-sm">{viewRecordRm.lotNumber}</span>
              </div>
              <div>
                <span className="text-slate-500 text-xs block">Material Quality</span>
                <span className="font-semibold text-slate-900">{viewRecordRm.materialName}</span>
              </div>
              <div>
                <span className="text-slate-500 text-xs block">Wholesaler / Supplier</span>
                <span className="font-medium text-slate-800">{viewRecordRm.wholesalerName}</span>
              </div>
              <div>
                <span className="text-slate-500 text-xs block">Unit Measurement</span>
                <span className="font-mono text-slate-800">{viewRecordRm.unit}</span>
              </div>
            </div>

            <div className="grid grid-cols-4 gap-2 text-center">
              <div className="bg-slate-100 p-2.5 rounded border border-slate-200">
                <span className="text-[11px] text-slate-500 font-semibold block">Total Purchased</span>
                <span className="font-mono font-bold text-slate-800 text-sm">{viewRecordRm.totalQuantity} {viewRecordRm.unit}</span>
              </div>
              <div className="bg-rose-50 p-2.5 rounded border border-rose-200">
                <span className="text-[11px] text-rose-700 font-semibold block">Damaged Qty</span>
                <span className="font-mono font-bold text-rose-700 text-sm">{viewRecordRm.damagedQuantity} {viewRecordRm.unit}</span>
              </div>
              <div className="bg-blue-50 p-2.5 rounded border border-blue-200">
                <span className="text-[11px] text-blue-700 font-semibold block">Used in Cutting</span>
                <span className="font-mono font-bold text-blue-800 text-sm">{viewRecordRm.usedQuantity} {viewRecordRm.unit}</span>
              </div>
              <div className="bg-emerald-50 p-2.5 rounded border border-emerald-200">
                <span className="text-[11px] text-emerald-800 font-semibold block">Available</span>
                <span className="font-mono font-bold text-emerald-700 text-sm">{viewRecordRm.availableQuantity} {viewRecordRm.unit}</span>
              </div>
            </div>

            {/* Damage Logs for this Lot */}
            {damages.filter(d => d.lotNumber === viewRecordRm.lotNumber).length > 0 && (
              <div className="space-y-1.5 border-t pt-2">
                <span className="font-bold text-slate-800 text-xs flex items-center gap-1">
                  <ShieldAlert className="w-3.5 h-3.5 text-rose-600" />
                  Damage Records History
                </span>
                <div className="space-y-1">
                  {damages.filter(d => d.lotNumber === viewRecordRm.lotNumber).map(d => (
                    <div key={d.id} className="bg-rose-50/70 p-2 rounded border border-rose-200 text-xs flex justify-between">
                      <div>
                        <span className="font-bold text-rose-900">{d.damageQuantity} {viewRecordRm.unit}</span> - {d.reason}
                      </div>
                      <span className="font-mono text-slate-500 text-[11px]">{d.damageDate}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-200">
              <button
                type="button"
                onClick={() => {
                  const lot = viewRecordRm.lotNumber;
                  setViewRecordRm(null);
                  onViewLot(lot);
                }}
                className="px-3 py-1.5 text-xs font-semibold text-slate-800 bg-slate-100 hover:bg-slate-200 rounded transition-colors cursor-pointer flex items-center gap-1"
              >
                <ArrowUpRight className="w-3.5 h-3.5" />
                View Full Lot Audit
              </button>
              <button
                type="button"
                onClick={() => setViewRecordRm(null)}
                className="px-4 py-1.5 text-xs font-semibold text-white bg-slate-900 rounded hover:bg-slate-800 transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Add Raw Material Damage Modal */}
      {selectedRm && (
        <Modal
          isOpen={damageModalOpen}
          onClose={() => setDamageModalOpen(false)}
          title={`Record Damage - ${selectedRm.lotNumber}`}
          subtitle={`Available for cutting: ${selectedRm.availableQuantity} ${selectedRm.unit}`}
          footer={
            <>
              <button
                type="button"
                onClick={() => setDamageModalOpen(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-200/60 rounded-md transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveDamage}
                className="px-4 py-2 text-xs font-semibold text-white bg-rose-700 rounded-md hover:bg-rose-800 transition-colors cursor-pointer shadow-2xs"
              >
                Confirm Damage
              </button>
            </>
          }
        >
          <form onSubmit={handleSaveDamage} className="space-y-4">
            {error && <p className="text-xs text-rose-600 font-medium bg-rose-50 p-2.5 rounded border border-rose-200">{error}</p>}

            <InputField
              label="Damaged Quantity"
              type="number"
              required
              unit={selectedRm.unit}
              value={damageData.damageQuantity}
              onChange={(e) => setDamageData({ ...damageData, damageQuantity: e.target.value })}
              placeholder="e.g. 15"
              helperText={`Cannot exceed available quantity of ${selectedRm.availableQuantity} ${selectedRm.unit}`}
            />

            <InputField
              label="Damage Date"
              type="date"
              required
              value={damageData.damageDate}
              onChange={(e) => setDamageData({ ...damageData, damageDate: e.target.value })}
            />

            <InputField
              label="Reason / Notes"
              value={damageData.reason}
              onChange={(e) => setDamageData({ ...damageData, reason: e.target.value })}
              placeholder="Describe flaw, water stain, tear, etc."
            />
          </form>
        </Modal>
      )}
    </div>
  );
};
