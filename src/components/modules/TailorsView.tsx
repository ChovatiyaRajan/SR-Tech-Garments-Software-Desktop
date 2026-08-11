import React, { useState } from 'react';
import { Plus, UserCheck, Phone, CheckSquare, Eye } from 'lucide-react';
import { erpService } from '../../services/storage';
import { Tailor, TailorAssignment } from '../../types/erp';
import { PageHeader } from '../common/PageHeader';
import { DataTable, Column } from '../common/DataTable';
import { Drawer } from '../common/Drawer';
import { Modal } from '../common/Modal';
import { FormSection, InputField } from '../common/FormControls';
import { useKeyboardShortcuts } from '../../hooks/useKeyboardShortcuts';

interface TailorsViewProps {
  showToast: (msg: string) => void;
  onViewLot: (lotNumber: string) => void;
}

export const TailorsView: React.FC<TailorsViewProps> = ({ showToast, onViewLot }) => {
  const [tailors, setTailors] = useState<Tailor[]>(erpService.getTailors());
  const [selectedTailor, setSelectedTailor] = useState<Tailor | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  useKeyboardShortcuts({
    onNew: () => {
      setFormData({ name: '', phone: '', specialization: 'Shirt & Kurti Stitching', ratePerPiece: '45' });
      setError('');
      setIsDrawerOpen(true);
    },
    onClose: () => {
      setIsDrawerOpen(false);
      setSelectedTailor(null);
    }
  });

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    specialization: '',
    ratePerPiece: '45'
  });
  const [error, setError] = useState('');

  const refreshData = () => {
    setTailors(erpService.getTailors());
  };

  const handleOpenAdd = () => {
    setFormData({ name: '', phone: '', specialization: 'Shirt & Kurti Stitching', ratePerPiece: '45' });
    setError('');
    setIsDrawerOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      setError('Tailor name is required');
      return;
    }

    try {
      erpService.addTailor({
        name: formData.name,
        phone: formData.phone || '-',
        specialization: formData.specialization || 'General Stitching',
        ratePerPiece: Number(formData.ratePerPiece || 45)
      });
      showToast(`Tailor "${formData.name}" added successfully.`);
      refreshData();
      setIsDrawerOpen(false);
    } catch (err: any) {
      setError(err.message || 'Failed to save tailor');
    }
  };

  const assignments = erpService.getTailorAssignments();
  const getAssignmentsForTailor = (tId: string) => assignments.filter(a => a.tailorId === tId);

  const columns: Column<Tailor>[] = [
    {
      key: 'name',
      header: 'Tailor Master Name',
      sortable: true,
      accessor: (t) => (
        <div>
          <div className="font-bold text-slate-900">{t.name}</div>
          <div className="text-xs text-slate-500">{t.specialization || 'Stitching'}</div>
        </div>
      )
    },
    {
      key: 'phone',
      header: 'Contact Phone',
      accessor: (t) => <span className="font-mono text-xs">{t.phone}</span>
    },
    {
      key: 'ratePerPiece',
      header: 'Piece Rate',
      align: 'right',
      sortable: true,
      accessor: (t) => <span className="font-mono font-bold text-slate-900">₹{t.ratePerPiece}/pc</span>
    },
    {
      key: 'assignmentCount',
      header: 'Active Lots',
      align: 'center',
      accessor: (t) => {
        const count = getAssignmentsForTailor(t.id).length;
        return <span className="px-2 py-0.5 rounded bg-slate-100 font-bold text-xs font-mono text-slate-800">{count} assigned</span>;
      }
    }
  ];

  return (
    <div className="space-y-3">
      <PageHeader
        title="TAILORS MASTER DIRECTORY"
        description="Directory of tailoring contractors, stitching piece rates, and assigned lots."
        primaryAction={{
          label: "Add Tailor Master (F2)",
          onClick: handleOpenAdd,
          icon: <Plus className="w-3.5 h-3.5" />
        }}
      />

      <DataTable
        data={tailors}
        columns={columns}
        searchPlaceholder="Search tailors by name or specialization..."
        searchKeys={['name', 'specialization', 'phone']}
        onRowClick={(t) => setSelectedTailor(t)}
        actions={(t) => (
          <button
            type="button"
            onClick={() => setSelectedTailor(t)}
            className="px-2.5 py-1 text-xs font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 rounded transition-colors cursor-pointer flex items-center gap-1"
          >
            <Eye className="w-3.5 h-3.5 text-indigo-600" />
            View
          </button>
        )}
      />

      {/* Add Tailor Drawer */}
      <Drawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        title="Add Tailor Master"
        subtitle="Register tailor contractor & default piece rate."
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
              Save Tailor
            </button>
          </>
        }
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && <p className="text-xs text-rose-600 font-medium bg-rose-50 p-2.5 rounded border border-rose-200">{error}</p>}

          <FormSection title="Tailor Information">
            <InputField
              label="Tailor / Contractor Name"
              required
              colSpan={2}
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g. Ramesh Tailors"
            />

            <InputField
              label="Phone Number"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              placeholder="+91 98765 43210"
            />

            <InputField
              label="Default Rate Per Piece"
              type="number"
              required
              unit="₹"
              value={formData.ratePerPiece}
              onChange={(e) => setFormData({ ...formData, ratePerPiece: e.target.value })}
            />

            <InputField
              label="Specialization / Craft"
              colSpan={2}
              value={formData.specialization}
              onChange={(e) => setFormData({ ...formData, specialization: e.target.value })}
              placeholder="e.g. Shirts, Trousers, Kurtis"
            />
          </FormSection>
        </form>
      </Drawer>

      {/* Tailor Detail Modal */}
      {selectedTailor && (
        <Modal
          isOpen={Boolean(selectedTailor)}
          onClose={() => setSelectedTailor(null)}
          title={selectedTailor.name}
          subtitle={`Piece Rate: ₹${selectedTailor.ratePerPiece}/pc • Phone: ${selectedTailor.phone}`}
          maxWidth="lg"
        >
          <div className="space-y-4 text-xs sm:text-sm">
            <h4 className="font-bold text-slate-900 uppercase tracking-wider text-xs border-b pb-1">
              Lot Stitching Assignments ({getAssignmentsForTailor(selectedTailor.id).length})
            </h4>

            <div className="max-h-60 overflow-y-auto divide-y divide-slate-200 border rounded-md">
              {getAssignmentsForTailor(selectedTailor.id).map((a) => {
                const completed = a.completedPiecesQty !== undefined
                  ? a.completedPiecesQty
                  : erpService.getStitchings().filter(s => s.tailorAssignmentId === a.id).reduce((sum, s) => sum + s.stitchedGoodPiecesQty + s.defectivePiecesQty, 0);
                const remaining = Math.max(0, a.assignedPiecesQty - completed);

                return (
                  <div key={a.id} className="p-3 flex items-center justify-between text-xs hover:bg-slate-50">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-slate-900">{a.lotNumber}</span>
                        <span className="text-slate-600 font-medium">Assigned: {a.assignedPiecesQty} pcs</span>
                      </div>
                      <p className="text-slate-500 mt-0.5">
                        Delivered: <strong className="text-slate-800">{completed} pcs</strong> • Remaining: <strong className={remaining > 0 ? "text-amber-700" : "text-emerald-700"}>{remaining} pcs</strong>
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="font-mono font-bold text-slate-900 block">₹{a.ratePerPiece}/pc</span>
                      <span className={`text-[10px] uppercase font-bold px-1.5 py-0.5 rounded border ${
                        remaining === 0 
                          ? 'text-emerald-700 bg-emerald-50 border-emerald-200' 
                          : 'text-amber-800 bg-amber-50 border-amber-200'
                      }`}>
                        {remaining === 0 ? 'COMPLETED' : `IN STITCHING (${remaining} REM)`}
                      </span>
                    </div>
                  </div>
                );
              })}

              {getAssignmentsForTailor(selectedTailor.id).length === 0 && (
                <p className="p-4 text-center text-slate-500 text-xs">No active stitching assignments for this tailor.</p>
              )}
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
