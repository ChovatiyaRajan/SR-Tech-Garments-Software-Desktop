import React, { useState } from 'react';
import { UserCheck, Scissors, ArrowUpRight, Eye, CheckCircle2, AlertTriangle, Clock, Plus, History, Layers } from 'lucide-react';
import { erpService } from '../../services/storage';
import { CutPieces, Tailor } from '../../types/erp';
import { PageHeader } from '../common/PageHeader';
import { DataTable, Column } from '../common/DataTable';
import { Drawer } from '../common/Drawer';
import { Modal } from '../common/Modal';
import { FormSection, InputField, SelectField } from '../common/FormControls';
import { QuickAddModal } from '../common/QuickAddModal';

interface CutPiecesViewProps {
  showToast: (msg: string) => void;
  onViewLot: (lotNumber: string) => void;
  onNavigateToStitching?: () => void;
}

export const CutPiecesView: React.FC<CutPiecesViewProps> = ({ showToast, onViewLot, onNavigateToStitching }) => {
  const [cutPiecesList, setCutPiecesList] = useState<CutPieces[]>(erpService.getCutPieces());
  const [tailors, setTailors] = useState<Tailor[]>(erpService.getTailors());

  const [selectedCp, setSelectedCp] = useState<CutPieces | null>(null);
  const [viewRecord, setViewRecord] = useState<CutPieces | null>(null);
  const [assignDrawerOpen, setAssignDrawerOpen] = useState(false);
  const [quickAddOpen, setQuickAddOpen] = useState(false);

  // Tracking Progress Modal State
  const [trackModalOpen, setTrackModalOpen] = useState(false);
  const [selectedTrackCp, setSelectedTrackCp] = useState<CutPieces | null>(null);
  const [trackFormData, setTrackFormData] = useState({
    addedCutPieces: '',
    cuttingStatus: 'CUTTING_IN_PROGRESS' as 'CUTTING_IN_PROGRESS' | 'CUTTING_COMPLETED',
    cuttingMasterName: '',
    cuttingNotes: ''
  });
  const [trackError, setTrackError] = useState('');

  // Validation Alert Modal State
  const [validationModalData, setValidationModalData] = useState<{
    isOpen: boolean;
    cp: CutPieces | null;
    message: string;
  }>({
    isOpen: false,
    cp: null,
    message: ''
  });

  const [assignData, setAssignData] = useState({
    tailorId: '',
    assignedPiecesQty: '',
    ratePerPiece: '45',
    assignmentDate: new Date().toISOString().split('T')[0],
    targetCompletionDate: '',
    notes: ''
  });
  const [error, setError] = useState('');

  const refreshData = () => {
    setCutPiecesList(erpService.getCutPieces());
    setTailors(erpService.getTailors());
  };

  const getReadyQty = (cp: CutPieces): number => {
    if (cp.readyCutPieces !== undefined) return cp.readyCutPieces;
    if (cp.cuttingStatus === 'CUTTING_COMPLETED') return cp.totalCutPieces;
    if (cp.cuttingStatus === 'CUTTING_IN_PROGRESS') return 0;
    return cp.totalCutPieces;
  };

  const getUnassignedReadyQty = (cp: CutPieces): number => {
    const ready = getReadyQty(cp);
    return Math.max(0, ready - cp.assignedToTailorQty);
  };

  const handleOpenTrackCutting = (cp: CutPieces) => {
    setSelectedTrackCp(cp);
    const existingReady = getReadyQty(cp);
    const status = cp.cuttingStatus || (existingReady >= cp.totalCutPieces ? 'CUTTING_COMPLETED' : 'CUTTING_IN_PROGRESS');

    setTrackFormData({
      addedCutPieces: '',
      cuttingStatus: status,
      cuttingMasterName: cp.cuttingMasterName || 'Cutting Master',
      cuttingNotes: ''
    });
    setTrackError('');
    setTrackModalOpen(true);
  };

  const handleSaveTrackCutting = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTrackCp) return;

    const existingReady = getReadyQty(selectedTrackCp);
    const totalPlanned = selectedTrackCp.totalCutPieces;
    const remainingToCut = Math.max(0, totalPlanned - existingReady);

    const addedNum = Number(trackFormData.addedCutPieces || 0);

    if (isNaN(addedNum) || addedNum < 0) {
      setTrackError('Delivered cut pieces quantity cannot be negative.');
      return;
    }

    if (addedNum > remainingToCut) {
      setTrackError(`Real-Time Validation Failure: Cannot add ${addedNum} pieces. Only ${remainingToCut} pieces are remaining to be cut out of ${totalPlanned} total planned pieces for Lot ${selectedTrackCp.lotNumber}!`);
      return;
    }

    if (addedNum === 0 && trackFormData.cuttingStatus === selectedTrackCp.cuttingStatus) {
      setTrackError(`Please enter the number of new completed cut pieces delivered by the master (max ${remainingToCut} pcs).`);
      return;
    }

    try {
      const updated = erpService.updateCutPiecesProgress({
        lotNumber: selectedTrackCp.lotNumber,
        addedCutPieces: addedNum,
        cuttingStatus: trackFormData.cuttingStatus,
        cuttingMasterName: trackFormData.cuttingMasterName,
        cuttingNotes: trackFormData.cuttingNotes
      });

      const readyMsg = addedNum > 0 ? `+${addedNum} new pieces added! ` : '';
      showToast(`Updated cutting progress for Lot ${selectedTrackCp.lotNumber}: ${readyMsg}${updated.readyCutPieces}/${updated.totalCutPieces} pcs cut & ready.`);
      refreshData();
      setTrackModalOpen(false);
    } catch (err: any) {
      setTrackError(err.message || 'Failed to update cutting progress');
    }
  };

  const handleOpenAssign = (cp: CutPieces) => {
    const unassignedReady = getUnassignedReadyQty(cp);
    const readyQty = getReadyQty(cp);

    if (unassignedReady <= 0) {
      const isProgressing = cp.cuttingStatus === 'CUTTING_IN_PROGRESS' || readyQty < cp.totalCutPieces;
      const msg = isProgressing
        ? `Real-Time Validation Block: Cutting for Lot ${cp.lotNumber} is currently IN PROGRESS by Cutting Master (${cp.cuttingMasterName || 'Master'}). Only ${readyQty} of ${cp.totalCutPieces} pieces are cut & ready. You cannot assign unready pieces to tailors. Please click 'Track Cutting' to mark cut pieces ready first.`
        : `All ${cp.totalCutPieces} cut pieces for Lot ${cp.lotNumber} have already been assigned to tailors.`;

      setValidationModalData({
        isOpen: true,
        cp,
        message: msg
      });
      return;
    }

    setSelectedCp(cp);
    const firstTailor = tailors.length > 0 ? tailors[0] : null;
    setAssignData({
      tailorId: firstTailor ? firstTailor.id : '',
      assignedPiecesQty: String(unassignedReady),
      ratePerPiece: firstTailor ? String(firstTailor.ratePerPiece) : '45',
      assignmentDate: new Date().toISOString().split('T')[0],
      targetCompletionDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      notes: ''
    });
    setError('');
    setAssignDrawerOpen(true);
  };

  const handleSaveAssignment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCp) return;
    if (!assignData.tailorId) {
      setError('Please select a tailor');
      return;
    }

    const qty = Number(assignData.assignedPiecesQty);
    if (!qty || qty <= 0) {
      setError('Assigned pieces quantity must be greater than zero');
      return;
    }

    const unassignedReady = getUnassignedReadyQty(selectedCp);
    const readyQty = getReadyQty(selectedCp);

    if (qty > unassignedReady) {
      setError(`Real-Time Validation Failure: Cannot assign ${qty} pieces. Cutting Master (${selectedCp.cuttingMasterName || 'Master'}) has only finished ${readyQty} of ${selectedCp.totalCutPieces} total pieces, leaving ${unassignedReady} unassigned ready pieces.`);
      return;
    }

    const tailor = tailors.find(t => t.id === assignData.tailorId);

    try {
      erpService.assignToTailor({
        tailorId: assignData.tailorId,
        tailorName: tailor ? tailor.name : 'Unknown Tailor',
        lotNumber: selectedCp.lotNumber,
        assignedPiecesQty: qty,
        ratePerPiece: Number(assignData.ratePerPiece || 45),
        assignmentDate: assignData.assignmentDate,
        targetCompletionDate: assignData.targetCompletionDate,
        notes: assignData.notes
      });

      showToast(`Assigned ${qty} cut pieces of Lot ${selectedCp.lotNumber} to tailor ${tailor?.name}`);
      refreshData();
      setAssignDrawerOpen(false);
      if (onNavigateToStitching) onNavigateToStitching();
    } catch (err: any) {
      setError(err.message || 'Failed to assign cut pieces to tailor');
    }
  };

  const columns: Column<CutPieces>[] = [
    {
      key: 'lotNumber',
      header: 'Lot No.',
      sortable: true,
      accessor: (cp) => (
        <button
          type="button"
          onClick={() => onViewLot(cp.lotNumber)}
          className="font-mono font-bold text-slate-900 hover:text-indigo-600 hover:underline cursor-pointer flex items-center gap-1"
        >
          {cp.lotNumber}
          <ArrowUpRight className="w-3 h-3 text-slate-400" />
        </button>
      )
    },
    {
      key: 'pieceType',
      header: 'Pattern / Style',
      accessor: (cp) => <span className="font-semibold text-slate-900">{cp.pieceType}</span>
    },
    {
      key: 'cuttingStatus',
      header: 'Cutting Process Status',
      accessor: (cp) => {
        const ready = getReadyQty(cp);
        const isCompleted = cp.cuttingStatus === 'CUTTING_COMPLETED' || ready >= cp.totalCutPieces;
        return (
          <div className="flex flex-col gap-1">
            {isCompleted ? (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 text-xs font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200 rounded-full w-fit">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                Cutting Completed
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 text-xs font-semibold text-amber-800 bg-amber-50 border border-amber-200 rounded-full w-fit">
                <Scissors className="w-3.5 h-3.5 text-amber-600 animate-pulse" />
                Cutting In Progress
              </span>
            )}
            <span className="text-[11px] text-slate-500 font-medium">
              Master: <span className="font-semibold text-slate-800">{cp.cuttingMasterName || 'Unassigned'}</span>
            </span>
          </div>
        );
      }
    },
    {
      key: 'readyCutPieces',
      header: 'Ready Cut Pieces',
      align: 'right',
      accessor: (cp) => {
        const ready = getReadyQty(cp);
        const isFull = ready >= cp.totalCutPieces;
        return (
          <div className="flex flex-col items-end">
            <span className={`font-mono font-bold ${isFull ? 'text-emerald-700' : 'text-amber-700'}`}>
              {ready} / {cp.totalCutPieces} pcs
            </span>
            <span className="text-[10px] font-medium text-slate-500">
              {isFull ? '100% Complete' : `${Math.round((ready / (cp.totalCutPieces || 1)) * 100)}% Cut`}
            </span>
          </div>
        );
      }
    },
    {
      key: 'assignedToTailorQty',
      header: 'Assigned to Tailors',
      align: 'right',
      accessor: (cp) => <span className="font-mono text-slate-700">{cp.assignedToTailorQty} pcs</span>
    },
    {
      key: 'remainingCutPieces',
      header: 'Unassigned Ready',
      align: 'right',
      accessor: (cp) => {
        const unassignedReady = getUnassignedReadyQty(cp);
        return (
          <span className={`font-mono font-bold ${unassignedReady > 0 ? 'text-indigo-700' : 'text-slate-400'}`}>
            {unassignedReady} pcs
          </span>
        );
      }
    }
  ];

  return (
    <div>
      <PageHeader
        title="Cut Pieces Inventory & Tailor Assignment"
        description="Track active cutting process by Cutting Masters, log incremental piece handovers, and assign ready cut pieces to tailors for stitching."
      />

      <DataTable
        data={cutPiecesList}
        columns={columns}
        searchPlaceholder="Search cut pieces by Lot No., Pattern, or Cutting Master..."
        searchKeys={['lotNumber', 'pieceType', 'cuttingMasterName']}
        onRowClick={(cp) => onViewLot(cp.lotNumber)}
        actions={(cp) => {
          const unassignedReady = getUnassignedReadyQty(cp);

          return (
            <div className="flex items-center justify-end gap-1.5">
              <button
                type="button"
                onClick={() => handleOpenTrackCutting(cp)}
                className="px-2.5 py-1 text-xs font-semibold text-amber-900 bg-amber-50 hover:bg-amber-100 border border-amber-300 rounded transition-colors cursor-pointer flex items-center gap-1 shadow-2xs"
                title="Track master cutting progress & log completed pieces"
              >
                <Scissors className="w-3.5 h-3.5 text-amber-600" />
                Track Cutting
              </button>

              <button
                type="button"
                onClick={() => handleOpenAssign(cp)}
                className={`px-2.5 py-1 text-xs font-semibold rounded transition-colors cursor-pointer flex items-center gap-1 ${
                  unassignedReady > 0
                    ? 'text-white bg-slate-900 hover:bg-slate-800'
                    : 'text-slate-600 bg-slate-100 border border-slate-200 hover:bg-slate-200'
                }`}
              >
                <UserCheck className="w-3 h-3" />
                Assign Tailor
              </button>

              <button
                type="button"
                onClick={() => setViewRecord(cp)}
                className="px-2 py-1 text-xs font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 rounded transition-colors cursor-pointer flex items-center gap-1"
                title="View inventory details"
              >
                <Eye className="w-3.5 h-3.5 text-indigo-600" />
              </button>
            </div>
          );
        }}
      />

      {/* Track Cutting Progress Modal */}
      {selectedTrackCp && (() => {
        const existingReady = getReadyQty(selectedTrackCp);
        const totalTarget = selectedTrackCp.totalCutPieces;
        const remainingToCut = Math.max(0, totalTarget - existingReady);

        const addedNum = Number(trackFormData.addedCutPieces || 0);
        const liveNewReady = Math.min(totalTarget, existingReady + addedNum);
        const liveNewRemaining = Math.max(0, totalTarget - liveNewReady);
        const isFinished = liveNewReady >= totalTarget;

        return (
          <Modal
            isOpen={trackModalOpen}
            onClose={() => setTrackModalOpen(false)}
            title={`Track Cutting Progress — Lot ${selectedTrackCp.lotNumber}`}
            subtitle={`Garment Pattern / Style: ${selectedTrackCp.pieceType}`}
          >
            <form onSubmit={handleSaveTrackCutting} className="space-y-4 text-xs sm:text-sm">
              {trackError && (
                <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold rounded-lg flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  <div>{trackError}</div>
                </div>
              )}

              {/* Status Summary Card */}
              <div className="grid grid-cols-3 gap-2 bg-slate-50 p-3 rounded-lg border border-slate-200 text-center">
                <div>
                  <span className="text-slate-500 text-[10px] uppercase block font-semibold">Total Planned</span>
                  <span className="font-mono font-bold text-slate-900 text-xs sm:text-sm">{totalTarget} pcs</span>
                </div>
                <div>
                  <span className="text-slate-500 text-[10px] uppercase block font-semibold">Completed So Far</span>
                  <span className="font-mono font-bold text-emerald-700 text-xs sm:text-sm">{existingReady} pcs</span>
                </div>
                <div>
                  <span className="text-slate-500 text-[10px] uppercase block font-semibold">Remaining To Cut</span>
                  <span className={`font-mono font-bold text-xs sm:text-sm ${remainingToCut > 0 ? 'text-amber-700' : 'text-slate-400'}`}>
                    {remainingToCut} pcs
                  </span>
                </div>
              </div>

              <FormSection title="Log Cut Pieces Handover">
                <InputField
                  label="Cutting Master / Workshop Staff"
                  required
                  colSpan={2}
                  value={trackFormData.cuttingMasterName}
                  onChange={(e) => setTrackFormData({ ...trackFormData, cuttingMasterName: e.target.value })}
                  placeholder="e.g. Ramesh Master"
                />

                {/* Single Input for New Completed Cut Pieces Delivered */}
                <div className="col-span-2 space-y-2 bg-emerald-50/70 p-3.5 rounded-lg border border-emerald-200">
                  <div className="flex justify-between items-center flex-wrap gap-1">
                    <label className="block text-xs font-bold text-emerald-950">
                      ➕ Enter New Completed Cut Pieces Delivered Today
                    </label>
                    <span className="text-[11px] font-bold text-emerald-800 bg-white px-2 py-0.5 rounded border border-emerald-200">
                      Max allowed: {remainingToCut} pcs
                    </span>
                  </div>

                  <div className="relative">
                    <input
                      type="number"
                      min="0"
                      max={remainingToCut}
                      value={trackFormData.addedCutPieces}
                      onChange={(e) => {
                        const val = e.target.value;
                        setTrackFormData({ ...trackFormData, addedCutPieces: val });
                      }}
                      className="w-full h-10 px-3 text-sm font-mono font-bold text-emerald-950 bg-white border border-emerald-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      placeholder={remainingToCut > 0 ? `e.g. 50 (max ${remainingToCut} pcs remaining)` : 'All pieces already completed'}
                      disabled={remainingToCut <= 0}
                      autoFocus
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-emerald-700">
                      new pcs
                    </span>
                  </div>

                  {remainingToCut > 0 ? (
                    <div className="flex justify-end pt-1">
                      <button
                        type="button"
                        onClick={() => setTrackFormData({
                          ...trackFormData,
                          addedCutPieces: String(remainingToCut),
                          cuttingStatus: 'CUTTING_COMPLETED'
                        })}
                        className="text-xs font-bold text-emerald-800 hover:text-emerald-950 hover:underline flex items-center gap-1 cursor-pointer"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        Fill All Remaining ({remainingToCut} pcs)
                      </button>
                    </div>
                  ) : (
                    <p className="text-xs text-emerald-800 font-semibold">
                      ✓ All {totalTarget} cut pieces for this lot are 100% completed.
                    </p>
                  )}
                </div>

                <div className="col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Overall Cutting Process Status
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setTrackFormData({ ...trackFormData, cuttingStatus: 'CUTTING_IN_PROGRESS' })}
                      className={`p-2.5 text-xs font-semibold rounded-lg border text-left transition-colors flex items-center justify-between cursor-pointer ${
                        trackFormData.cuttingStatus === 'CUTTING_IN_PROGRESS' && !isFinished
                          ? 'bg-amber-50 border-amber-400 text-amber-900 ring-2 ring-amber-400/20'
                          : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-amber-600" />
                        <div>
                          <div className="font-bold">Cutting In Progress</div>
                          <div className="text-[10px] text-slate-500 font-normal">More pieces remaining to cut</div>
                        </div>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setTrackFormData({
                          ...trackFormData,
                          cuttingStatus: 'CUTTING_COMPLETED',
                          addedCutPieces: String(remainingToCut)
                        });
                      }}
                      className={`p-2.5 text-xs font-semibold rounded-lg border text-left transition-colors flex items-center justify-between cursor-pointer ${
                        trackFormData.cuttingStatus === 'CUTTING_COMPLETED' || isFinished
                          ? 'bg-emerald-50 border-emerald-400 text-emerald-900 ring-2 ring-emerald-400/20'
                          : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        <div>
                          <div className="font-bold">Cutting Completed</div>
                          <div className="text-[10px] text-slate-500 font-normal">Master finished 100% cutting</div>
                        </div>
                      </div>
                    </button>
                  </div>
                </div>

                {/* Real-Time Live Calculation Banner */}
                <div className="col-span-2 bg-slate-900 text-white p-3.5 rounded-lg space-y-1.5 shadow-2xs">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-semibold text-slate-300">Updated Live Total Ready Pieces:</span>
                    <span className="font-mono font-bold text-emerald-400 text-sm">{liveNewReady} / {totalTarget} pcs</span>
                  </div>
                  <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                    <div
                      className={`h-full transition-all duration-300 ${isFinished ? 'bg-emerald-400' : 'bg-amber-400'}`}
                      style={{ width: `${Math.min(100, Math.round((liveNewReady / (totalTarget || 1)) * 100))}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-[11px] text-slate-400 pt-0.5">
                    <span>Remaining balance to cut: <strong className="text-amber-300">{liveNewRemaining} pcs</strong></span>
                    <span>Status: <strong className={isFinished ? 'text-emerald-400' : 'text-amber-300'}>{isFinished ? 'Complete' : 'In Progress'}</strong></span>
                  </div>
                </div>

                <InputField
                  label="Handover Remarks / Batch Notes"
                  colSpan={2}
                  value={trackFormData.cuttingNotes}
                  onChange={(e) => setTrackFormData({ ...trackFormData, cuttingNotes: e.target.value })}
                  placeholder="e.g. Master delivered 50 shirt pieces today. Remaining 30 pieces tomorrow."
                />
              </FormSection>

              {/* Handover History Log */}
              {selectedTrackCp.handoverLogs && selectedTrackCp.handoverLogs.length > 0 && (
                <div className="space-y-1.5 pt-1">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
                    <History className="w-3.5 h-3.5 text-slate-600" />
                    Previous Handover History for Lot {selectedTrackCp.lotNumber}
                  </div>
                  <div className="max-h-28 overflow-y-auto border border-slate-200 rounded-lg text-[11px]">
                    <table className="w-full text-left border-collapse">
                      <thead className="bg-slate-100 text-slate-600 sticky top-0">
                        <tr>
                          <th className="p-1.5 font-semibold">Date & Time</th>
                          <th className="p-1.5 font-semibold text-right">Added</th>
                          <th className="p-1.5 font-semibold text-right">Total Ready</th>
                          <th className="p-1.5 font-semibold">Remarks</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 text-slate-700">
                        {selectedTrackCp.handoverLogs.map(log => (
                          <tr key={log.id} className="hover:bg-slate-50">
                            <td className="p-1.5 font-mono text-slate-500">{log.date}</td>
                            <td className="p-1.5 font-mono font-bold text-emerald-700 text-right">+{log.addedQty} pcs</td>
                            <td className="p-1.5 font-mono font-semibold text-slate-900 text-right">{log.totalReadyAfter} pcs</td>
                            <td className="p-1.5 text-slate-600 truncate max-w-[150px]">{log.notes || '—'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setTrackModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-md transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-md transition-colors cursor-pointer shadow-2xs flex items-center gap-1.5"
                >
                  <Scissors className="w-3.5 h-3.5" />
                  Save Cutting Progress
                </button>
              </div>
            </form>
          </Modal>
        );
      })()}

      {/* Real-time Validation Alert Modal */}
      {validationModalData.isOpen && validationModalData.cp && (
        <Modal
          isOpen={validationModalData.isOpen}
          onClose={() => setValidationModalData({ isOpen: false, cp: null, message: '' })}
          title="Real-Time Validation Block: Pieces Not Ready"
          subtitle={`Lot Number: ${validationModalData.cp.lotNumber}`}
        >
          <div className="space-y-4 text-xs sm:text-sm">
            <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-lg flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="font-bold text-rose-900 text-xs sm:text-sm">
                  Cannot Assign Cut Pieces to Tailor
                </p>
                <p className="text-rose-800 text-xs">
                  {validationModalData.message}
                </p>
              </div>
            </div>

            <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 space-y-1 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>Garment Style:</span>
                <span className="font-semibold text-slate-900">{validationModalData.cp.pieceType}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Cutting Master:</span>
                <span className="font-semibold text-slate-900">{validationModalData.cp.cuttingMasterName || 'Unassigned'}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Current Ready Pieces:</span>
                <span className="font-mono font-bold text-amber-700">{getReadyQty(validationModalData.cp)} / {validationModalData.cp.totalCutPieces} pcs</span>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-200">
              <button
                type="button"
                onClick={() => setValidationModalData({ isOpen: false, cp: null, message: '' })}
                className="px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-200 hover:bg-slate-300 rounded-md transition-colors cursor-pointer"
              >
                Close
              </button>
              <button
                type="button"
                onClick={() => {
                  const cp = validationModalData.cp;
                  setValidationModalData({ isOpen: false, cp: null, message: '' });
                  if (cp) handleOpenTrackCutting(cp);
                }}
                className="px-4 py-2 text-xs font-semibold text-white bg-amber-600 hover:bg-amber-700 rounded-md transition-colors cursor-pointer flex items-center gap-1.5 shadow-2xs"
              >
                <Scissors className="w-3.5 h-3.5" />
                Track Cutting Progress Now
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* View Record Modal */}
      {viewRecord && (
        <Modal
          isOpen={Boolean(viewRecord)}
          onClose={() => setViewRecord(null)}
          title={`Cut Pieces Inventory - Lot ${viewRecord.lotNumber}`}
          subtitle={`Pattern/Style: ${viewRecord.pieceType}`}
        >
          <div className="space-y-4 text-xs sm:text-sm">
            <div className="grid grid-cols-2 gap-3 bg-slate-50 p-3.5 rounded-lg border border-slate-200">
              <div>
                <span className="text-slate-500 text-xs block">Lot Number</span>
                <span className="font-mono font-bold text-slate-900 text-sm">{viewRecord.lotNumber}</span>
              </div>
              <div>
                <span className="text-slate-500 text-xs block">Cutting Master</span>
                <span className="font-semibold text-slate-900">{viewRecord.cuttingMasterName || 'Unassigned'}</span>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="bg-slate-100 p-2.5 rounded border border-slate-200">
                <span className="text-[11px] text-slate-500 font-semibold block">Total Planned</span>
                <span className="font-mono font-bold text-slate-800 text-sm">{viewRecord.totalCutPieces} pcs</span>
              </div>
              <div className="bg-amber-50 p-2.5 rounded border border-amber-200">
                <span className="text-[11px] text-amber-800 font-semibold block">Ready Cut Pieces</span>
                <span className="font-mono font-bold text-amber-700 text-sm">{getReadyQty(viewRecord)} pcs</span>
              </div>
              <div className="bg-indigo-50 p-2.5 rounded border border-indigo-200">
                <span className="text-[11px] text-indigo-800 font-semibold block">Assigned to Tailors</span>
                <span className="font-mono font-bold text-indigo-700 text-sm">{viewRecord.assignedToTailorQty} pcs</span>
              </div>
            </div>

            {viewRecord.cuttingNotes && (
              <div className="bg-slate-50 p-2.5 rounded border border-slate-200 text-xs text-slate-700">
                <span className="font-bold block text-slate-800 mb-0.5">Master Notes:</span>
                {viewRecord.cuttingNotes}
              </div>
            )}

            {/* View Handover Log */}
            {viewRecord.handoverLogs && viewRecord.handoverLogs.length > 0 && (
              <div className="space-y-1.5 border-t border-slate-200 pt-3">
                <span className="font-bold text-slate-800 block text-xs">Handover Log History:</span>
                <div className="max-h-32 overflow-y-auto border border-slate-200 rounded text-[11px]">
                  <table className="w-full text-left">
                    <thead className="bg-slate-100 text-slate-600 sticky top-0">
                      <tr>
                        <th className="p-1.5 font-semibold">Date</th>
                        <th className="p-1.5 font-semibold text-right">Added</th>
                        <th className="p-1.5 font-semibold text-right">Total Ready</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-slate-700">
                      {viewRecord.handoverLogs.map(log => (
                        <tr key={log.id}>
                          <td className="p-1.5 font-mono text-slate-500">{log.date}</td>
                          <td className="p-1.5 font-mono font-bold text-emerald-700 text-right">+{log.addedQty} pcs</td>
                          <td className="p-1.5 font-mono font-semibold text-slate-900 text-right">{log.totalReadyAfter} pcs</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-200">
              <button
                type="button"
                onClick={() => {
                  const record = viewRecord;
                  setViewRecord(null);
                  handleOpenTrackCutting(record);
                }}
                className="px-3 py-1.5 text-xs font-semibold text-amber-900 bg-amber-50 hover:bg-amber-100 border border-amber-300 rounded transition-colors cursor-pointer flex items-center gap-1"
              >
                <Scissors className="w-3.5 h-3.5 text-amber-600" />
                Track Cutting
              </button>

              <button
                type="button"
                onClick={() => {
                  const record = viewRecord;
                  setViewRecord(null);
                  handleOpenAssign(record);
                }}
                className="px-3 py-1.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded transition-colors cursor-pointer flex items-center gap-1"
              >
                <UserCheck className="w-3.5 h-3.5" />
                Assign Tailor
              </button>

              <button
                type="button"
                onClick={() => setViewRecord(null)}
                className="px-4 py-1.5 text-xs font-semibold text-slate-700 bg-slate-200 hover:bg-slate-300 rounded transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Assign to Tailor Drawer */}
      {selectedCp && (
        <Drawer
          isOpen={assignDrawerOpen}
          onClose={() => setAssignDrawerOpen(false)}
          title={`Assign Cut Pieces to Tailor — ${selectedCp.lotNumber}`}
          subtitle={`Pattern / Style: ${selectedCp.pieceType}`}
          footer={
            <>
              <button
                type="button"
                onClick={() => setAssignDrawerOpen(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-200/60 rounded-md transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveAssignment}
                className="px-4 py-2 text-xs font-semibold text-white bg-slate-900 rounded-md hover:bg-slate-800 transition-colors cursor-pointer shadow-2xs"
              >
                Save Tailor Assignment
              </button>
            </>
          }
        >
          <form onSubmit={handleSaveAssignment} className="space-y-4">
            {error && <p className="text-xs text-rose-600 font-medium bg-rose-50 p-2.5 rounded border border-rose-200">{error}</p>}

            {/* Real-Time Cutting Readiness Banner in Drawer */}
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-xs text-amber-900 space-y-1">
              <div className="flex items-center gap-1.5 font-bold text-amber-900">
                <Scissors className="w-4 h-4 text-amber-700" />
                Real-Time Readiness: Master {selectedCp.cuttingMasterName || 'Cutting Staff'}
              </div>
              <p>
                Ready cut pieces so far: <span className="font-mono font-bold">{getReadyQty(selectedCp)} / {selectedCp.totalCutPieces} pcs</span>.
              </p>
              <p className="text-[11px] text-amber-800 font-medium">
                Maximum unassigned ready pieces available to assign right now: <span className="font-bold underline">{getUnassignedReadyQty(selectedCp)} pcs</span>.
              </p>
            </div>

            <FormSection title="Tailor Selection">
              <SelectField
                label="Select Tailor"
                required
                colSpan={2}
                value={assignData.tailorId}
                onChange={(e) => {
                  const id = e.target.value;
                  const t = tailors.find(tl => tl.id === id);
                  setAssignData(prev => ({
                    ...prev,
                    tailorId: id,
                    ratePerPiece: t ? String(t.ratePerPiece) : prev.ratePerPiece
                  }));
                }}
                options={tailors.map(t => ({
                  value: t.id,
                  label: `${t.name} (${t.specialization || 'Stitching'}) — ₹${t.ratePerPiece}/pc`
                }))}
                onQuickAdd={() => setQuickAddOpen(true)}
                quickAddTitle="Add Tailor"
              />

              <InputField
                label="Assigned Pieces Quantity"
                type="number"
                required
                unit="pcs"
                value={assignData.assignedPiecesQty}
                onChange={(e) => setAssignData({ ...assignData, assignedPiecesQty: e.target.value })}
                helperText={`Max assignable ready balance: ${getUnassignedReadyQty(selectedCp)} pcs`}
              />

              <InputField
                label="Agreed Stitching Rate per Piece"
                type="number"
                required
                unit="₹"
                value={assignData.ratePerPiece}
                onChange={(e) => setAssignData({ ...assignData, ratePerPiece: e.target.value })}
              />
            </FormSection>

            <FormSection title="Assignment Schedule & Notes">
              <InputField
                label="Assignment Date"
                type="date"
                required
                value={assignData.assignmentDate}
                onChange={(e) => setAssignData({ ...assignData, assignmentDate: e.target.value })}
              />

              <InputField
                label="Target Completion Date"
                type="date"
                value={assignData.targetCompletionDate}
                onChange={(e) => setAssignData({ ...assignData, targetCompletionDate: e.target.value })}
              />

              <InputField
                label="Instructions / Notes"
                colSpan={2}
                value={assignData.notes}
                onChange={(e) => setAssignData({ ...assignData, notes: e.target.value })}
                placeholder="e.g. Include contrast stitching on collar"
              />
            </FormSection>
          </form>
        </Drawer>
      )}

      <QuickAddModal
        isOpen={quickAddOpen}
        onClose={() => setQuickAddOpen(false)}
        type="tailor"
        showToast={showToast}
        onSuccess={(newId) => {
          refreshData();
          const newT = erpService.getTailors().find(t => t.id === newId);
          setAssignData(prev => ({
            ...prev,
            tailorId: newId,
            ratePerPiece: newT ? String(newT.ratePerPiece) : prev.ratePerPiece
          }));
        }}
      />
    </div>
  );
};
