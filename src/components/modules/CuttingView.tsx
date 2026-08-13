import React, { useState } from 'react';
import { Plus, Scissors, ArrowUpRight, Trash2, Eye } from 'lucide-react';
import { erpService } from '../../services/storage';
import { Cutting, RawMaterial } from '../../types/erp';
import { PageHeader } from '../common/PageHeader';
import { DataTable, Column } from '../common/DataTable';
import { Drawer } from '../common/Drawer';
import { Modal } from '../common/Modal';
import { FormSection, InputField, SelectField } from '../common/FormControls';
import { useKeyboardShortcuts } from '../../hooks/useKeyboardShortcuts';

interface CuttingViewProps {
  showToast: (msg: string) => void;
  onViewLot: (lotNumber: string) => void;
  onNavigateToCutPieces?: () => void;
}

interface SizeRow {
  id: string;
  sizeName: string; // Target final product name (e.g. "Men Formal Shirt", "Slim Fit Denim Jeans")
  perPieceLength: string;
  meterUsed: string;
}

const PRODUCT_SUGGESTIONS = [
  'T-shirt',
  'Pant',
  'Men Formal Shirt',
  'Cotton Casual Shirt',
  'Slim Fit Denim Jeans',
  'Casual Linen Kurta',
  'Chino Trousers',
  'Polo T-Shirt',
  'Ladies Designer Kurti',
  'Kidswear Set',
  'Blazer / Waistcoat'
];

export const CuttingView: React.FC<CuttingViewProps> = ({ showToast, onViewLot, onNavigateToCutPieces }) => {
  const [cuttings, setCuttings] = useState<Cutting[]>(erpService.getCuttings());
  const [rawMaterials, setRawMaterials] = useState<RawMaterial[]>(
    erpService.getRawMaterials().filter(rm => rm.availableQuantity > 0)
  );

  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [viewRecord, setViewRecord] = useState<Cutting | null>(null);

  const [formData, setFormData] = useState({
    lotNumber: '',
    cuttingDate: new Date().toISOString().split('T')[0],
    wasteMeters: '0',
    cuttingMasterName: 'Master Cutter',
    notes: ''
  });

  const [sizeRows, setSizeRows] = useState<SizeRow[]>([
    { id: 'row_1', sizeName: 'Men Formal Shirt', perPieceLength: '4', meterUsed: '800' }
  ]);

  const [error, setError] = useState('');

  const refreshData = () => {
    setCuttings(erpService.getCuttings());
    setRawMaterials(erpService.getRawMaterials().filter(rm => rm.availableQuantity > 0));
  };

  const handleOpenNew = () => {
    const availableRms = erpService.getRawMaterials().filter(rm => rm.availableQuantity > 0);
    const selected = availableRms.length > 0 ? availableRms[0] : null;
    const availQty = selected ? selected.availableQuantity : 1000;

    setFormData({
      lotNumber: selected ? selected.lotNumber : '',
      cuttingDate: new Date().toISOString().split('T')[0],
      wasteMeters: '0',
      cuttingMasterName: 'Master Aslam',
      notes: ''
    });

    const initUsed = availQty >= 800 ? '800' : String(availQty);
    setSizeRows([
      { id: 'row_1', sizeName: 'Men Formal Shirt', perPieceLength: '4', meterUsed: initUsed }
    ]);

    setError('');
    setIsDrawerOpen(true);
  };

  useKeyboardShortcuts({
    onNew: handleOpenNew,
    onAddRow: () => {
      if (isDrawerOpen) {
        const nextId = `row_${Date.now()}`;
        setSizeRows(prev => [
          ...prev,
          { id: nextId, sizeName: PRODUCT_SUGGESTIONS[prev.length % PRODUCT_SUGGESTIONS.length], perPieceLength: '2.5', meterUsed: '100' }
        ]);
      }
    },
    onClose: () => {
      setIsDrawerOpen(false);
      setViewRecord(null);
    }
  });

  const selectedRm = rawMaterials.find(rm => rm.lotNumber === formData.lotNumber);
  const availableMeters = selectedRm ? selectedRm.availableQuantity : 0;

  const totalUsedMeters = sizeRows.reduce((sum, r) => sum + (parseFloat(r.meterUsed) || 0), 0);

  const totalPiecesGenerated = sizeRows.reduce((sum, r) => {
    const m = parseFloat(r.meterUsed) || 0;
    const len = parseFloat(r.perPieceLength) || 0;
    return sum + (len > 0 ? Math.floor(m / len) : 0);
  }, 0);

  // Calculate net cloth consumed directly in cut pieces
  const totalNetClothInPieces = sizeRows.reduce((sum, r) => {
    const m = parseFloat(r.meterUsed) || 0;
    const len = parseFloat(r.perPieceLength) || 0;
    const pcs = len > 0 ? Math.floor(m / len) : 0;
    return sum + (pcs * len);
  }, 0);

  // Waste Material = Extra remained cloth that remains after piece is cutted
  const totalCalculatedWasteMeters = Math.max(
    0,
    Math.round((totalUsedMeters - totalNetClothInPieces) * 100) / 100
  );

  const remainingMeters = availableMeters - totalUsedMeters;

  // Auto-sync calculated waste meters when drawer is open and calculation updates
  React.useEffect(() => {
    if (isDrawerOpen) {
      setFormData(prev => ({
        ...prev,
        wasteMeters: String(totalCalculatedWasteMeters)
      }));
    }
  }, [totalCalculatedWasteMeters, isDrawerOpen]);

  const updateSizeRow = (id: string, field: keyof SizeRow, value: string) => {
    setSizeRows(prevRows =>
      prevRows.map(row => {
        if (row.id !== id) return row;

        if (field === 'meterUsed') {
          if (value === '') {
            return { ...row, meterUsed: '' };
          }
          const otherRowsUsed = prevRows
            .filter(r => r.id !== id)
            .reduce((sum, r) => sum + (parseFloat(r.meterUsed) || 0), 0);

          const maxAllowed = Math.max(0, availableMeters - otherRowsUsed);
          let numVal = parseFloat(value);
          if (isNaN(numVal)) return { ...row, meterUsed: '' };
          if (numVal < 0) numVal = 0;
          if (numVal > maxAllowed) {
            numVal = maxAllowed;
          }
          return { ...row, meterUsed: String(numVal) };
        }

        return { ...row, [field]: value };
      })
    );
  };

  const handleAddSizeRow = () => {
    const currentTotalUsed = sizeRows.reduce((sum, r) => sum + (parseFloat(r.meterUsed) || 0), 0);
    const remaining = Math.max(0, availableMeters - currentTotalUsed);

    const suggestedName = PRODUCT_SUGGESTIONS[sizeRows.length % PRODUCT_SUGGESTIONS.length];
    const newRow: SizeRow = {
      id: `row_${Date.now()}`,
      sizeName: suggestedName,
      perPieceLength: '3.5',
      meterUsed: remaining > 0 ? String(remaining) : '0'
    };

    setSizeRows(prev => [...prev, newRow]);
  };

  const handleRemoveSizeRow = (id: string) => {
    if (sizeRows.length <= 1) return;
    setSizeRows(prev => prev.filter(r => r.id !== id));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.lotNumber) {
      setError('Please select a Lot Number for cutting');
      return;
    }
    if (totalUsedMeters <= 0) {
      setError('Material used must be greater than zero');
      return;
    }
    if (totalUsedMeters > availableMeters) {
      setError(`Total meter used (${totalUsedMeters}m) cannot exceed available Lot stock (${availableMeters}m)`);
      return;
    }
    if (totalPiecesGenerated <= 0) {
      setError('Total cut pieces produced must be greater than zero. Please check Per Piece Length.');
      return;
    }

    const pieceTypeDesc = sizeRows.map(r => {
      const len = parseFloat(r.perPieceLength) || 0;
      const m = parseFloat(r.meterUsed) || 0;
      const pcs = len > 0 ? Math.floor(m / len) : 0;
      return sizeRows.length === 1
        ? (r.sizeName || 'Garment Item')
        : `${r.sizeName || 'Garment Item'} (${pcs} pcs)`;
    }).join(' | ');

    try {
      erpService.startCutting({
        lotNumber: formData.lotNumber,
        cuttingDate: formData.cuttingDate,
        materialUsedMeters: totalUsedMeters,
        totalCutPiecesProduced: totalPiecesGenerated,
        pieceType: pieceTypeDesc,
        wasteMeters: Number(formData.wasteMeters || 0),
        cuttingMasterName: formData.cuttingMasterName,
        notes: formData.notes
      });

      showToast(`Cutting completed for Lot ${formData.lotNumber}: ${totalPiecesGenerated} pieces generated.`);
      refreshData();
      setIsDrawerOpen(false);
      if (onNavigateToCutPieces) onNavigateToCutPieces();
    } catch (err: any) {
      setError(err.message || 'Failed to record cutting operation');
    }
  };

  const columns: Column<Cutting>[] = [
    {
      key: 'lotNumber',
      header: 'Lot No.',
      sortable: true,
      accessor: (c) => (
        <button
          type="button"
          onClick={() => onViewLot(c.lotNumber)}
          className="font-mono font-bold text-slate-900 hover:text-indigo-600 hover:underline cursor-pointer flex items-center gap-1"
        >
          {c.lotNumber}
          <ArrowUpRight className="w-3 h-3 text-slate-400" />
        </button>
      )
    },
    {
      key: 'pieceType',
      header: 'Garment Style / Pattern',
      accessor: (c) => <span className="font-medium text-slate-900">{c.pieceType}</span>
    },
    {
      key: 'materialUsedMeters',
      header: 'Allocated Cloth',
      align: 'right',
      accessor: (c) => <span className="font-mono text-slate-800">{c.materialUsedMeters} meters</span>
    },
    {
      key: 'totalCutPiecesProduced',
      header: 'Pieces Output',
      align: 'right',
      accessor: (c) => <span className="font-mono font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">{c.totalCutPiecesProduced} pcs</span>
    },
    {
      key: 'wasteMeters',
      header: 'Waste Material',
      align: 'right',
      accessor: (c) => (
        <span className="font-mono font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
          {c.wasteMeters} meters
        </span>
      )
    },
    {
      key: 'cuttingMasterName',
      header: 'Master Cutter',
      accessor: (c) => <span className="text-slate-700">{c.cuttingMasterName || '-'}</span>
    },
    {
      key: 'cuttingDate',
      header: 'Cut Date',
      align: 'center',
      accessor: (c) => <span className="text-xs text-slate-500">{c.cuttingDate}</span>
    }
  ];

  return (
    <div className="space-y-3">
      <PageHeader
        title="CUTTING MASTERS & FABRIC CUTTING ENTRY"
        description="Record cloth cutting calculations, size-wise piece generation, and waste metrics per Lot."
        primaryAction={{
          label: "New Cutting Entry (F2)",
          onClick: handleOpenNew,
          icon: <Plus className="w-3.5 h-3.5" />
        }}
      />

      <DataTable
        data={cuttings}
        columns={columns}
        searchPlaceholder="Search cuttings by Lot No., Piece Type, or Master Cutter..."
        searchKeys={['lotNumber', 'pieceType', 'cuttingMasterName']}
        onRowClick={(c) => onViewLot(c.lotNumber)}
        actions={(c) => (
          <div className="flex items-center justify-end gap-1.5">
            <button
              type="button"
              onClick={() => setViewRecord(c)}
              className="px-2.5 py-1 text-xs font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 rounded transition-colors cursor-pointer flex items-center gap-1"
            >
              <Eye className="w-3.5 h-3.5 text-indigo-600" />
              View
            </button>
            <button
              type="button"
              onClick={() => onViewLot(c.lotNumber)}
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
          title={`Cutting Record - Lot ${viewRecord.lotNumber}`}
          subtitle={`Master Cutter: ${viewRecord.cuttingMasterName || 'Standard'} • Date: ${viewRecord.cuttingDate}`}
        >
          <div className="space-y-4 text-xs sm:text-sm">
            <div className="grid grid-cols-2 gap-3 bg-slate-50 p-3.5 rounded-lg border border-slate-200">
              <div>
                <span className="text-slate-500 text-xs block">Lot Number</span>
                <span className="font-mono font-bold text-slate-900 text-sm">{viewRecord.lotNumber}</span>
              </div>
              <div>
                <span className="text-slate-500 text-xs block">Cutting Master</span>
                <span className="font-semibold text-slate-800">{viewRecord.cuttingMasterName || 'Master Cutter'}</span>
              </div>
              <div>
                <span className="text-slate-500 text-xs block">Garment Style / Pattern</span>
                <span className="font-medium text-slate-900">{viewRecord.pieceType}</span>
              </div>
              <div>
                <span className="text-slate-500 text-xs block">Cutting Date</span>
                <span className="font-mono text-slate-800">{viewRecord.cuttingDate}</span>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center">
              <div className="bg-slate-100 p-2.5 rounded border border-slate-200">
                <span className="text-[11px] text-slate-500 font-semibold block">Allocated Cloth</span>
                <span className="font-mono font-bold text-slate-800 text-sm">{viewRecord.materialUsedMeters} meters</span>
              </div>
              <div className="bg-indigo-50 p-2.5 rounded border border-indigo-200">
                <span className="text-[11px] text-indigo-800 font-semibold block">Cloth in Pieces</span>
                <span className="font-mono font-bold text-indigo-900 text-sm">
                  {Math.max(0, Math.round((viewRecord.materialUsedMeters - viewRecord.wasteMeters) * 100) / 100)} meters
                </span>
              </div>
              <div className="bg-amber-50 p-2.5 rounded border border-amber-200">
                <span className="text-[11px] text-amber-800 font-semibold block">Waste Material (Remained)</span>
                <span className="font-mono font-bold text-amber-900 text-sm">{viewRecord.wasteMeters} meters</span>
              </div>
              <div className="bg-emerald-50 p-2.5 rounded border border-emerald-200">
                <span className="text-[11px] text-emerald-800 font-semibold block">Cut Pieces Output</span>
                <span className="font-mono font-bold text-emerald-700 text-sm">{viewRecord.totalCutPiecesProduced} pcs</span>
              </div>
            </div>

            {viewRecord.notes && (
              <div className="bg-slate-50 p-2.5 rounded border border-slate-200 text-xs">
                <span className="font-bold text-slate-700 block">Notes:</span>
                <span className="text-slate-600">{viewRecord.notes}</span>
              </div>
            )}

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-200">
              <button
                type="button"
                onClick={() => {
                  const lot = viewRecord.lotNumber;
                  setViewRecord(null);
                  onViewLot(lot);
                }}
                className="px-3 py-1.5 text-xs font-semibold text-slate-800 bg-slate-100 hover:bg-slate-200 rounded transition-colors cursor-pointer flex items-center gap-1"
              >
                <ArrowUpRight className="w-3.5 h-3.5" />
                View Full Lot Audit
              </button>
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

      {/* Start Cutting Drawer */}
      <Drawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        title="Start Cutting Process"
        subtitle="Deduct cloth from raw material stock and generate cut pieces."
        size="xl"
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
              Confirm Cutting & Generate Pieces
            </button>
          </>
        }
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && <p className="text-xs text-rose-600 font-medium bg-rose-50 p-2.5 rounded border border-rose-200">{error}</p>}

          <FormSection title="Source Lot & Dates">
            <SelectField
              label="Select Available Lot"
              required
              colSpan={2}
              value={formData.lotNumber}
              onChange={(e) => {
                const lot = e.target.value;
                const rm = rawMaterials.find(r => r.lotNumber === lot);
                const avail = rm ? rm.availableQuantity : 0;
                setFormData(prev => ({
                  ...prev,
                  lotNumber: lot
                }));
                const initUsed = avail >= 800 ? '800' : String(avail);
                setSizeRows([
                  { id: 'row_1', sizeName: 'T-shirt', perPieceLength: '2.5', meterUsed: initUsed }
                ]);
              }}
              options={rawMaterials.map(rm => ({
                value: rm.lotNumber,
                label: `${rm.lotNumber} — ${rm.materialName} (${rm.availableQuantity} ${rm.unit} avail)`
              }))}
            />

            <InputField
              label="Cutting Date"
              type="date"
              required
              value={formData.cuttingDate}
              onChange={(e) => setFormData({ ...formData, cuttingDate: e.target.value })}
            />

            <InputField
              label="Cutting Master / Operator"
              value={formData.cuttingMasterName}
              onChange={(e) => setFormData({ ...formData, cuttingMasterName: e.target.value })}
              placeholder="e.g. Master Aslam"
            />
          </FormSection>

          <FormSection title="Cutting Output & Material Usage">
            <div className="col-span-2 space-y-3">
              <p className="text-[11px] text-slate-600 font-medium bg-indigo-50/70 p-2.5 rounded-lg border border-indigo-100/80">
                💡 <strong>Target Product Tracking & Waste Calculation:</strong> Specify the target product item (e.g. <em>T-shirt</em>, <em>Pant</em>, <em>Men Formal Shirt</em>). Extra remained cloth that remains after pieces are cut is automatically calculated as waste: <strong>Meter Used - (Pieces Produced × Per Piece Length)</strong>.
              </p>

              {/* Stock Meter Summary Bar */}
              <div className="flex flex-wrap items-center justify-between gap-2 text-xs bg-slate-50 border border-slate-200 rounded-lg px-3.5 py-2.5 text-slate-700">
                <div>Total Available: <strong className="font-mono text-slate-900">{availableMeters}m</strong></div>
                <div>Allocated: <strong className="font-mono text-slate-900">{totalUsedMeters}m</strong></div>
                <div>In Cut Pieces: <strong className="font-mono text-indigo-700 font-semibold">{totalNetClothInPieces.toFixed(2)}m</strong></div>
                <div>Remained Waste: <strong className="font-mono text-amber-700 font-bold">{totalCalculatedWasteMeters}m</strong></div>
                <div>Remaining Uncut: <strong className={`font-mono ${remainingMeters < 0 ? 'text-red-600 font-bold' : 'text-emerald-700 font-semibold'}`}>{remainingMeters}m</strong></div>
              </div>

              {/* Suggestions Datalist */}
              <datalist id="product-suggestions">
                {PRODUCT_SUGGESTIONS.map((item) => (
                  <option key={item} value={item} />
                ))}
              </datalist>

              {/* Mobile View: Cards Layout (sm:hidden) */}
              <div className="block sm:hidden space-y-3">
                {sizeRows.map((row, idx) => {
                  const meterVal = parseFloat(row.meterUsed) || 0;
                  const perPieceLenVal = parseFloat(row.perPieceLength) || 0;
                  const pcsGenerated = perPieceLenVal > 0 ? Math.floor(meterVal / perPieceLenVal) : 0;
                  const netClothUsedInPieces = pcsGenerated * perPieceLenVal;
                  const rowWasteMeters = Math.max(0, Math.round((meterVal - netClothUsedInPieces) * 100) / 100);

                  const otherRowsUsed = sizeRows
                    .filter(r => r.id !== row.id)
                    .reduce((sum, r) => sum + (parseFloat(r.meterUsed) || 0), 0);
                  const maxAllowedRowMeters = Math.max(0, availableMeters - otherRowsUsed);

                  return (
                    <div key={row.id} className="p-3.5 bg-slate-50 border border-slate-200 rounded-lg space-y-3 shadow-2xs">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">Target Item #{idx + 1}</span>
                        {sizeRows.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveSizeRow(row.id)}
                            className="text-rose-600 hover:text-rose-700 text-xs font-semibold flex items-center gap-1 cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" /> Remove
                          </button>
                        )}
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-800 mb-1">
                          Final Product Name / Item <span className="text-rose-500">*</span>
                        </label>
                        <input
                          type="text"
                          list="product-suggestions"
                          value={row.sizeName}
                          onChange={(e) => updateSizeRow(row.id, 'sizeName', e.target.value)}
                          placeholder="e.g. T-shirt, Pant, Shirt"
                          className="w-full border border-slate-300 bg-white rounded-md px-3 py-2 text-xs sm:text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-2.5">
                        <div>
                          <label className="block text-[11px] font-semibold text-slate-600 mb-1">Per Piece Length (m)</label>
                          <div className="relative">
                            <input
                              type="number"
                              min="0.1"
                              step="0.1"
                              required
                              value={row.perPieceLength}
                              onChange={(e) => updateSizeRow(row.id, 'perPieceLength', e.target.value)}
                              placeholder="2.5"
                              className="w-full border border-slate-300 bg-white rounded-md px-2.5 py-1.5 pr-6 text-xs font-mono font-bold focus:outline-none focus:border-indigo-500"
                            />
                            <span className="absolute right-2 top-1.5 text-slate-400 text-2xs font-semibold">m</span>
                          </div>
                        </div>

                        <div>
                          <label className="block text-[11px] font-semibold text-slate-600 mb-1">Meter Used (m)</label>
                          <div className="relative">
                            <input
                              type="number"
                              min="0"
                              max={maxAllowedRowMeters}
                              step="any"
                              required
                              value={row.meterUsed}
                              onChange={(e) => updateSizeRow(row.id, 'meterUsed', e.target.value)}
                              placeholder="800"
                              className="w-full border border-slate-300 bg-white rounded-md px-2.5 py-1.5 pr-6 text-xs font-mono font-bold focus:outline-none focus:border-indigo-500"
                            />
                            <span className="absolute right-2 top-1.5 text-slate-400 text-2xs font-semibold">m</span>
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-200/80 text-xs">
                        <div>
                          <span className="text-slate-500 text-[10px] block">In Pieces</span>
                          <span className="font-mono text-slate-800 font-medium">{netClothUsedInPieces.toFixed(2)}m</span>
                        </div>
                        <div>
                          <span className="text-amber-800 text-[10px] block font-semibold">Remained Waste</span>
                          <span className="font-mono font-bold text-amber-700">{rowWasteMeters}m</span>
                        </div>
                        <div className="text-right">
                          <span className="text-slate-500 text-[10px] block">Pieces Output</span>
                          <span className="font-mono font-bold text-emerald-800 bg-emerald-100/80 px-2 py-0.5 rounded border border-emerald-200 inline-block">
                            {pcsGenerated} pcs
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}

                <button
                  type="button"
                  onClick={handleAddSizeRow}
                  disabled={remainingMeters <= 0}
                  className="w-full flex items-center justify-center gap-1.5 text-xs font-bold text-slate-800 bg-white hover:bg-slate-100 border border-slate-300 rounded-lg py-2 disabled:opacity-50 transition-colors cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  Add Target Product Row
                </button>
              </div>

              {/* Desktop View: Table Layout (hidden sm:block) */}
              <div className="hidden sm:block border border-slate-200 rounded-lg overflow-x-auto shadow-2xs bg-white">
                <table className="w-full min-w-[730px] text-left text-xs border-collapse">
                  <thead className="bg-slate-100 text-slate-800 font-bold border-b border-slate-200">
                    <tr>
                      <th className="py-2.5 px-3 min-w-[180px]">Final Product Name / Item</th>
                      <th className="py-2.5 px-2.5 w-36">Per Piece Length</th>
                      <th className="py-2.5 px-2.5 w-32">Meter Used</th>
                      <th className="py-2.5 px-3 w-32 text-right">Pieces Output</th>
                      <th className="py-2.5 px-2.5 w-28 text-right">Net Cloth in Pcs</th>
                      <th className="py-2.5 px-2.5 w-28 text-right">Remained Waste</th>
                      <th className="py-2.5 px-2 w-10 text-center"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 bg-white">
                    {sizeRows.map((row) => {
                      const meterVal = parseFloat(row.meterUsed) || 0;
                      const perPieceLenVal = parseFloat(row.perPieceLength) || 0;
                      const pcsGenerated = perPieceLenVal > 0 ? Math.floor(meterVal / perPieceLenVal) : 0;
                      const netClothUsedInPieces = pcsGenerated * perPieceLenVal;
                      const rowWasteMeters = Math.max(0, Math.round((meterVal - netClothUsedInPieces) * 100) / 100);

                      const otherRowsUsed = sizeRows
                        .filter(r => r.id !== row.id)
                        .reduce((sum, r) => sum + (parseFloat(r.meterUsed) || 0), 0);
                      const maxAllowedRowMeters = Math.max(0, availableMeters - otherRowsUsed);

                      return (
                        <tr key={row.id}>
                          <td className="py-2 px-3">
                            <input
                              type="text"
                              list="product-suggestions"
                              value={row.sizeName}
                              onChange={(e) => updateSizeRow(row.id, 'sizeName', e.target.value)}
                              placeholder="e.g. T-shirt, Pant, Men Formal Shirt"
                              className="w-full border border-slate-300 rounded-md px-3 py-1.5 text-xs font-semibold text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all placeholder:text-slate-400 placeholder:font-normal"
                            />
                          </td>
                          <td className="py-2 px-2.5">
                            <div className="relative">
                              <input
                                type="number"
                                min="0.1"
                                step="0.1"
                                required
                                value={row.perPieceLength}
                                onChange={(e) => updateSizeRow(row.id, 'perPieceLength', e.target.value)}
                                placeholder="2.5"
                                className="w-full border border-slate-300 rounded-md px-2.5 py-1.5 pr-6 text-xs font-mono font-bold focus:outline-none focus:border-indigo-500"
                              />
                              <span className="absolute right-2 top-1.5 text-slate-400 text-2xs font-semibold">m</span>
                            </div>
                          </td>
                          <td className="py-2 px-2.5">
                            <div className="relative">
                              <input
                                type="number"
                                min="0"
                                max={maxAllowedRowMeters}
                                step="any"
                                required
                                value={row.meterUsed}
                                onChange={(e) => updateSizeRow(row.id, 'meterUsed', e.target.value)}
                                placeholder="800"
                                className="w-full border border-slate-300 rounded-md px-2.5 py-1.5 pr-6 text-xs font-mono font-bold focus:outline-none focus:border-indigo-500"
                              />
                              <span className="absolute right-2 top-1.5 text-slate-400 text-2xs font-semibold">m</span>
                            </div>
                          </td>
                          <td className="py-2 px-3 text-right font-mono font-bold text-slate-900">
                            <span className="bg-emerald-50 text-emerald-800 border border-emerald-200 px-2 py-0.5 rounded-md inline-block">
                              {pcsGenerated} pcs
                            </span>
                          </td>
                          <td className="py-2 px-2.5 text-right font-mono text-slate-700">
                            {netClothUsedInPieces.toFixed(2)} m
                          </td>
                          <td className="py-2 px-2.5 text-right font-mono font-bold text-amber-700">
                            {rowWasteMeters} m
                          </td>
                          <td className="py-2 px-2 text-center">
                            {sizeRows.length > 1 && (
                              <button
                                type="button"
                                onClick={() => handleRemoveSizeRow(row.id)}
                                className="text-slate-400 hover:text-rose-600 p-1 transition-colors cursor-pointer"
                                title="Remove row"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                  <tfoot className="bg-slate-50 border-t border-slate-200 text-xs">
                    <tr>
                      <td colSpan={2} className="py-2.5 px-3.5">
                        <button
                          type="button"
                          onClick={handleAddSizeRow}
                          disabled={remainingMeters <= 0}
                          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-800 bg-white hover:bg-slate-100 border border-slate-300 rounded-md px-3 py-1.5 disabled:opacity-50 cursor-pointer shadow-2xs"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          Add Target Product
                        </button>
                      </td>
                      <td className="py-2.5 px-2.5 font-mono font-bold text-slate-900">{totalUsedMeters} m</td>
                      <td className="py-2.5 px-3 text-right font-mono font-bold text-emerald-800 text-sm">
                        {totalPiecesGenerated} pcs
                      </td>
                      <td className="py-2.5 px-2.5 text-right font-mono text-slate-700">{totalNetClothInPieces.toFixed(2)} m</td>
                      <td className="py-2.5 px-2.5 text-right font-mono font-bold text-amber-700">{totalCalculatedWasteMeters} m</td>
                      <td></td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>

            <div className="col-span-2 space-y-1">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  Waste Material / Leftover Cloth (meters)
                  <span className="text-[10px] font-semibold text-amber-800 bg-amber-100 border border-amber-200 px-1.5 py-0.5 rounded">
                    🔒 Auto-Calculated
                  </span>
                </label>
              </div>
              <div className="relative">
                <input
                  type="number"
                  disabled
                  readOnly
                  value={totalCalculatedWasteMeters}
                  className="w-full border border-slate-200 bg-slate-100 rounded-md px-3 py-2 pr-16 text-xs font-mono font-bold text-slate-800 cursor-not-allowed select-none"
                  placeholder="0"
                />
                <span className="absolute right-3 top-2 text-slate-400 text-xs font-semibold">meters</span>
              </div>
              <p className="text-[11px] text-slate-500">
                System calculated leftover cloth remaining after pieces are cutted: <strong className="font-mono text-slate-800">{totalCalculatedWasteMeters} meters</strong> (Allocated - Net Pieces Cloth).
              </p>
            </div>

            <InputField
              label="Notes"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Optional remarks"
            />
          </FormSection>
        </form>
      </Drawer>
    </div>
  );
};

