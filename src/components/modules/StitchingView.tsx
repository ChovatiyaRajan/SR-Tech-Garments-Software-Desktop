import React, { useState } from 'react';
import { Plus, CheckSquare, ArrowUpRight, Clock, UserCheck, PackageCheck, Eye } from 'lucide-react';
import { erpService } from '../../services/storage';
import { Stitching, TailorAssignment } from '../../types/erp';
import { PageHeader } from '../common/PageHeader';
import { DataTable, Column } from '../common/DataTable';
import { Drawer } from '../common/Drawer';
import { Modal } from '../common/Modal';
import { FormSection, InputField, SelectField } from '../common/FormControls';

interface StitchingViewProps {
  showToast: (msg: string) => void;
  onViewLot: (lotNumber: string) => void;
  onNavigateToFinishedGoods?: () => void;
}

const getAssignmentRemaining = (a: TailorAssignment): number => {
  const completed = a.completedPiecesQty !== undefined
    ? a.completedPiecesQty
    : erpService.getStitchings()
        .filter(s => s.tailorAssignmentId === a.id)
        .reduce((sum, s) => sum + s.stitchedGoodPiecesQty + s.defectivePiecesQty, 0);
  return Math.max(0, a.assignedPiecesQty - completed);
};

const getAssignmentCompleted = (a: TailorAssignment): number => {
  if (a.completedPiecesQty !== undefined) return a.completedPiecesQty;
  return erpService.getStitchings()
    .filter(s => s.tailorAssignmentId === a.id)
    .reduce((sum, s) => sum + s.stitchedGoodPiecesQty + s.defectivePiecesQty, 0);
};

export const StitchingView: React.FC<StitchingViewProps> = ({ showToast, onViewLot, onNavigateToFinishedGoods }) => {
  const [stitchings, setStitchings] = useState<Stitching[]>(erpService.getStitchings());
  const [activeAssignments, setActiveAssignments] = useState<TailorAssignment[]>(
    erpService.getTailorAssignments().filter(a => getAssignmentRemaining(a) > 0)
  );

  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [viewRecord, setViewRecord] = useState<Stitching | null>(null);

  const [formData, setFormData] = useState({
    tailorAssignmentId: '',
    stitchedGoodPiecesQty: '',
    defectivePiecesQty: '0',
    ratePerPiece: '45',
    stitchingDate: new Date().toISOString().split('T')[0],
    notes: ''
  });
  const [error, setError] = useState('');

  const refreshData = () => {
    setStitchings(erpService.getStitchings());
    const active = erpService.getTailorAssignments().filter(a => getAssignmentRemaining(a) > 0);
    setActiveAssignments(active);
  };

  const handleOpenNew = (preselectedAssignmentId?: string) => {
    const active = erpService.getTailorAssignments().filter(a => getAssignmentRemaining(a) > 0);
    const selectedA = preselectedAssignmentId 
      ? active.find(a => a.id === preselectedAssignmentId) || active[0]
      : active[0] || null;

    const rem = selectedA ? getAssignmentRemaining(selectedA) : 0;

    setFormData({
      tailorAssignmentId: selectedA ? selectedA.id : '',
      stitchedGoodPiecesQty: selectedA ? String(rem) : '',
      defectivePiecesQty: '0',
      ratePerPiece: selectedA ? String(selectedA.ratePerPiece) : '45',
      stitchingDate: new Date().toISOString().split('T')[0],
      notes: ''
    });
    setError('');
    setIsDrawerOpen(true);
  };

  const selectedAssignment = activeAssignments.find(a => a.id === formData.tailorAssignmentId);

  const calculateTotalWage = () => {
    const good = Number(formData.stitchedGoodPiecesQty) || 0;
    const rate = Number(formData.ratePerPiece) || 0;
    return good * rate;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.tailorAssignmentId) {
      setError('Please select an active tailor assignment');
      return;
    }

    const goodQty = Number(formData.stitchedGoodPiecesQty);
    if (!goodQty || goodQty <= 0) {
      setError('Stitched good pieces quantity must be greater than zero');
      return;
    }

    if (!selectedAssignment) {
      setError('Selected tailor assignment not found or already completed');
      return;
    }

    const defectQty = Number(formData.defectivePiecesQty || 0);
    const currentTotal = goodQty + defectQty;
    const remaining = getAssignmentRemaining(selectedAssignment);

    if (currentTotal > remaining) {
      setError(`Total pieces (${currentTotal} pcs) exceeds remaining pending pieces with tailor (${remaining} pcs).`);
      return;
    }

    try {
      erpService.recordStitching({
        tailorAssignmentId: selectedAssignment.id,
        tailorId: selectedAssignment.tailorId,
        tailorName: selectedAssignment.tailorName,
        lotNumber: selectedAssignment.lotNumber,
        stitchedGoodPiecesQty: goodQty,
        defectivePiecesQty: defectQty,
        ratePerPiece: Number(formData.ratePerPiece),
        stitchingDate: formData.stitchingDate,
        notes: formData.notes
      });

      const newRemaining = remaining - currentTotal;
      if (newRemaining > 0) {
        showToast(`Recorded ${goodQty} pieces for Lot ${selectedAssignment.lotNumber}. ${newRemaining} pieces still remaining with tailor.`);
      } else {
        showToast(`Stitching fully completed for Lot ${selectedAssignment.lotNumber}. Finished Goods created.`);
      }

      refreshData();
      setIsDrawerOpen(false);
      if (onNavigateToFinishedGoods) onNavigateToFinishedGoods();
    } catch (err: any) {
      setError(err.message || 'Failed to record stitching');
    }
  };

  const columns: Column<Stitching>[] = [
    {
      key: 'lotNumber',
      header: 'Lot No.',
      sortable: true,
      accessor: (s) => (
        <button
          type="button"
          onClick={() => onViewLot(s.lotNumber)}
          className="font-mono font-bold text-slate-900 hover:text-indigo-600 hover:underline cursor-pointer flex items-center gap-1"
        >
          {s.lotNumber}
          <ArrowUpRight className="w-3 h-3 text-slate-400" />
        </button>
      )
    },
    {
      key: 'tailorName',
      header: 'Tailor Contractor',
      sortable: true,
      accessor: (s) => <span className="font-semibold text-slate-900">{s.tailorName}</span>
    },
    {
      key: 'stitchedGoodPiecesQty',
      header: 'Good Finished Output',
      align: 'right',
      accessor: (s) => (
        <span className="font-mono font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
          {s.stitchedGoodPiecesQty} pcs
        </span>
      )
    },
    {
      key: 'defectivePiecesQty',
      header: 'Defects',
      align: 'right',
      accessor: (s) => (
        <span className={`font-mono font-semibold ${s.defectivePiecesQty > 0 ? 'text-rose-600' : 'text-slate-400'}`}>
          {s.defectivePiecesQty} pcs
        </span>
      )
    },
    {
      key: 'ratePerPiece',
      header: 'Rate',
      align: 'right',
      accessor: (s) => <span className="font-mono text-slate-700">₹{s.ratePerPiece}/pc</span>
    },
    {
      key: 'totalWageAmount',
      header: 'Tailor Wage',
      align: 'right',
      accessor: (s) => <span className="font-mono font-bold text-slate-900">₹{s.totalWageAmount.toLocaleString()}</span>
    },
    {
      key: 'stitchingDate',
      header: 'Date',
      align: 'center',
      accessor: (s) => <span className="text-xs text-slate-500">{s.stitchingDate}</span>
    }
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Stitching Completion & Wages"
        description="Record stitched garments received from tailors, track pending piece balances, calculate wages, and update Finished Goods inventory."
        primaryAction={{
          label: "Record Stitching Output",
          onClick: () => handleOpenNew(),
          icon: <Plus className="w-4 h-4" />
        }}
      />

      {/* Pending Tailor Work In Progress Card Section */}
      {activeAssignments.length > 0 && (
        <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-2xs">
          <div className="flex items-center justify-between border-b border-slate-200 pb-2 mb-3">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-amber-600" />
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Active Tailor Assignments & Pending Balances ({activeAssignments.length})
              </h3>
            </div>
            <span className="text-[11px] text-slate-500 font-medium">Click "Record Output" to log delivered batch</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {activeAssignments.map(a => {
              const completed = getAssignmentCompleted(a);
              const remaining = getAssignmentRemaining(a);
              const percent = Math.round((completed / a.assignedPiecesQty) * 100);

              return (
                <div key={a.id} className="p-3 bg-slate-50/80 border border-slate-200 rounded-md flex flex-col justify-between space-y-2">
                  <div className="flex items-start justify-between">
                    <div>
                      <button
                        type="button"
                        onClick={() => onViewLot(a.lotNumber)}
                        className="font-mono font-bold text-xs text-slate-900 hover:text-indigo-600 flex items-center gap-1"
                      >
                        {a.lotNumber}
                        <ArrowUpRight className="w-3 h-3 text-slate-400" />
                      </button>
                      <p className="text-xs font-semibold text-slate-800 mt-0.5">{a.tailorName}</p>
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800 bg-amber-100 px-1.5 py-0.5 rounded border border-amber-200">
                      {remaining} pcs remaining
                    </span>
                  </div>

                  {/* Progress Bar */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-[11px] font-mono text-slate-600">
                      <span>Assigned: {a.assignedPiecesQty}</span>
                      <span>Done: {completed} ({percent}%)</span>
                    </div>
                    <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                      <div className="bg-emerald-500 h-full transition-all" style={{ width: `${percent}%` }} />
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleOpenNew(a.id)}
                    className="w-full mt-1 py-1 px-2 text-xs font-semibold text-slate-800 bg-white hover:bg-slate-100 border border-slate-300 rounded transition-colors cursor-pointer flex items-center justify-center gap-1"
                  >
                    <Plus className="w-3 h-3 text-slate-600" />
                    Record Received Output ({remaining} pcs)
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Main Stitching Output Logs */}
      <div>
        <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
          Stitching Output Logs & Tailor Wage Records
        </h3>
        <DataTable
          data={stitchings}
          columns={columns}
          searchPlaceholder="Search stitching logs by Lot No. or Tailor..."
          searchKeys={['lotNumber', 'tailorName']}
          onRowClick={(s) => onViewLot(s.lotNumber)}
          actions={(s) => (
            <div className="flex items-center justify-end gap-1.5">
              <button
                type="button"
                onClick={() => setViewRecord(s)}
                className="px-2.5 py-1 text-xs font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 rounded transition-colors cursor-pointer flex items-center gap-1"
              >
                <Eye className="w-3.5 h-3.5 text-indigo-600" />
                View
              </button>
              <button
                type="button"
                onClick={() => onViewLot(s.lotNumber)}
                className="px-2.5 py-1 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded transition-colors cursor-pointer"
              >
                Audit Lot
              </button>
            </div>
          )}
        />
      </div>

      {/* View Record Modal */}
      {viewRecord && (
        <Modal
          isOpen={Boolean(viewRecord)}
          onClose={() => setViewRecord(null)}
          title={`Stitching Record - Lot ${viewRecord.lotNumber}`}
          subtitle={`Tailor: ${viewRecord.tailorName} • Date: ${viewRecord.stitchingDate}`}
        >
          <div className="space-y-4 text-xs sm:text-sm">
            <div className="grid grid-cols-2 gap-3 bg-slate-50 p-3.5 rounded-lg border border-slate-200">
              <div>
                <span className="text-slate-500 text-xs block">Lot Number</span>
                <span className="font-mono font-bold text-slate-900 text-sm">{viewRecord.lotNumber}</span>
              </div>
              <div>
                <span className="text-slate-500 text-xs block">Tailor Name</span>
                <span className="font-semibold text-slate-900">{viewRecord.tailorName}</span>
              </div>
              <div>
                <span className="text-slate-500 text-xs block">Stitching Date</span>
                <span className="font-mono text-slate-800">{viewRecord.stitchingDate}</span>
              </div>
              <div>
                <span className="text-slate-500 text-xs block">Rate Per Piece</span>
                <span className="font-mono text-slate-800">₹{viewRecord.ratePerPiece}/pc</span>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="bg-emerald-50 p-2.5 rounded border border-emerald-200">
                <span className="text-[11px] text-emerald-800 font-semibold block">Good Pieces Stitched</span>
                <span className="font-mono font-bold text-emerald-700 text-sm">{viewRecord.stitchedGoodPiecesQty} pcs</span>
              </div>
              <div className="bg-rose-50 p-2.5 rounded border border-rose-200">
                <span className="text-[11px] text-rose-800 font-semibold block">Defective Pieces</span>
                <span className="font-mono font-bold text-rose-700 text-sm">{viewRecord.defectivePiecesQty} pcs</span>
              </div>
              <div className="bg-slate-900 text-white p-2.5 rounded">
                <span className="text-[11px] text-slate-300 font-semibold block">Total Wage Earned</span>
                <span className="font-mono font-bold text-emerald-400 text-sm">₹{viewRecord.totalWageAmount.toLocaleString()}</span>
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

      {/* Record Stitching Drawer */}
      <Drawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        title="Record Stitching Completion"
        subtitle="Log finished stitched garments & calculate tailor wages."
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
              Save Stitching & Finished Goods
            </button>
          </>
        }
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && <p className="text-xs text-rose-600 font-medium bg-rose-50 p-2.5 rounded border border-rose-200">{error}</p>}

          <FormSection title="Tailor Assignment Selection">
            <SelectField
              label="Active Tailor Assignment"
              required
              colSpan={2}
              value={formData.tailorAssignmentId}
              onChange={(e) => {
                const id = e.target.value;
                const a = activeAssignments.find(item => item.id === id);
                const rem = a ? getAssignmentRemaining(a) : 0;
                setFormData(prev => ({
                  ...prev,
                  tailorAssignmentId: id,
                  stitchedGoodPiecesQty: a ? String(rem) : prev.stitchedGoodPiecesQty,
                  ratePerPiece: a ? String(a.ratePerPiece) : prev.ratePerPiece
                }));
              }}
              options={activeAssignments.map(a => {
                const rem = getAssignmentRemaining(a);
                return {
                  value: a.id,
                  label: `${a.lotNumber} — ${a.tailorName} (${rem} pcs remaining of ${a.assignedPiecesQty} assigned)`
                };
              })}
            />

            <InputField
              label="Stitching Completion Date"
              type="date"
              required
              value={formData.stitchingDate}
              onChange={(e) => setFormData({ ...formData, stitchingDate: e.target.value })}
            />
          </FormSection>

          <FormSection title="Garment Output & Wages">
            <InputField
              label="Stitched Good Pieces"
              type="number"
              required
              unit="pcs"
              value={formData.stitchedGoodPiecesQty}
              onChange={(e) => setFormData({ ...formData, stitchedGoodPiecesQty: e.target.value })}
              helperText={selectedAssignment ? (
                `Assigned: ${selectedAssignment.assignedPiecesQty} pcs | Delivered: ${getAssignmentCompleted(selectedAssignment)} pcs | Remaining: ${getAssignmentRemaining(selectedAssignment)} pcs`
              ) : undefined}
            />

            <InputField
              label="Defective / Damaged Pieces"
              type="number"
              unit="pcs"
              value={formData.defectivePiecesQty}
              onChange={(e) => setFormData({ ...formData, defectivePiecesQty: e.target.value })}
            />

            <InputField
              label="Tailor Piece Rate"
              type="number"
              unit="₹"
              value={formData.ratePerPiece}
              onChange={(e) => setFormData({ ...formData, ratePerPiece: e.target.value })}
            />

            <div className="sm:col-span-1 flex flex-col justify-end">
              <div className="bg-slate-100 border border-slate-300 rounded p-2.5">
                <span className="text-[11px] font-semibold text-slate-500 uppercase block">Calculated Tailor Wage:</span>
                <span className="text-base font-bold font-mono text-slate-900">₹{calculateTotalWage().toLocaleString()}</span>
              </div>
            </div>

            <InputField
              label="Notes / Quality Remarks"
              colSpan={2}
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="e.g. Delivered partial batch of 15 pcs"
            />
          </FormSection>
        </form>
      </Drawer>
    </div>
  );
};
