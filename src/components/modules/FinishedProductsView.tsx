import React, { useState } from 'react';
import { Package, Users, ArrowUpRight, Plus, Send, Trash2, Layers, Eye } from 'lucide-react';
import { erpService } from '../../services/storage';
import { FinishedProduct, Employee, EmployeeAssignment } from '../../types/erp';
import { PageHeader } from '../common/PageHeader';
import { DataTable, Column } from '../common/DataTable';
import { Drawer } from '../common/Drawer';
import { Modal } from '../common/Modal';
import { FormSection, InputField, SelectField } from '../common/FormControls';
import { QuickAddModal } from '../common/QuickAddModal';
import { StatusBadge } from '../common/StatusBadge';

interface FinishedProductsViewProps {
  showToast: (msg: string) => void;
  onViewLot: (lotNumber: string) => void;
  onNavigateToInvoice?: () => void;
}

interface DispatchItemRow {
  id: string;
  finishedProductId: string;
  assignedFinishedQty: string;
}

export const FinishedProductsView: React.FC<FinishedProductsViewProps> = ({
  showToast,
  onViewLot,
  onNavigateToInvoice
}) => {
  const [finishedProducts, setFinishedProducts] = useState<FinishedProduct[]>(erpService.getFinishedProducts());
  const [employees, setEmployees] = useState<Employee[]>(erpService.getEmployees());
  const [employeeAssignments, setEmployeeAssignments] = useState<EmployeeAssignment[]>(erpService.getEmployeeAssignments());

  const [selectedFp, setSelectedFp] = useState<FinishedProduct | null>(null);
  const [viewRecordFp, setViewRecordFp] = useState<FinishedProduct | null>(null);
  const [viewRecordEa, setViewRecordEa] = useState<EmployeeAssignment | null>(null);
  const [assignDrawerOpen, setAssignDrawerOpen] = useState(false);
  const [damageModalOpen, setDamageModalOpen] = useState(false);
  const [quickAddOpen, setQuickAddOpen] = useState(false);

  // Multi-item dispatch state
  const [selectedEmployeeId, setSelectedEmployeeId] = useState('');
  const [assignmentDate, setAssignmentDate] = useState(new Date().toISOString().split('T')[0]);
  const [dispatchNotes, setDispatchNotes] = useState('');
  const [dispatchItems, setDispatchItems] = useState<DispatchItemRow[]>([]);

  // Damage modal state
  const [damageData, setDamageData] = useState({
    damageQuantity: '',
    reason: 'Packaging tear / Quality defect',
    damageDate: new Date().toISOString().split('T')[0]
  });

  const [error, setError] = useState('');

  const refreshData = () => {
    setFinishedProducts(erpService.getFinishedProducts());
    setEmployees(erpService.getEmployees());
    setEmployeeAssignments(erpService.getEmployeeAssignments());
  };

  const availableFinishedProducts = finishedProducts.filter(fp => fp.availableForAssignmentQty > 0);

  const handleOpenGeneralAssign = () => {
    if (availableFinishedProducts.length === 0) {
      showToast('No finished goods with available inventory stock.');
      return;
    }
    const firstEmp = employees.length > 0 ? employees[0].id : '';
    const defaultFp = availableFinishedProducts[0];

    setSelectedEmployeeId(firstEmp);
    setAssignmentDate(new Date().toISOString().split('T')[0]);
    setDispatchNotes('');
    setDispatchItems([
      {
        id: 'item_1',
        finishedProductId: defaultFp.id,
        assignedFinishedQty: String(defaultFp.availableForAssignmentQty)
      }
    ]);
    setError('');
    setAssignDrawerOpen(true);
  };

  const handleOpenRowAssign = (fp: FinishedProduct) => {
    const firstEmp = employees.length > 0 ? employees[0].id : '';

    setSelectedEmployeeId(firstEmp);
    setAssignmentDate(new Date().toISOString().split('T')[0]);
    setDispatchNotes('');
    setDispatchItems([
      {
        id: 'item_1',
        finishedProductId: fp.id,
        assignedFinishedQty: String(fp.availableForAssignmentQty)
      }
    ]);
    setError('');
    setAssignDrawerOpen(true);
  };

  const handleAddDispatchItemRow = () => {
    // Find next available FP not yet used in dispatchItems
    const usedIds = new Set(dispatchItems.map(item => item.finishedProductId));
    const nextFp = availableFinishedProducts.find(fp => !usedIds.has(fp.id)) || availableFinishedProducts[0];

    if (!nextFp) {
      showToast('No additional finished product items available in stock.');
      return;
    }

    setDispatchItems(prev => [
      ...prev,
      {
        id: `item_${Date.now()}_${Math.random().toString(36).substring(2, 5)}`,
        finishedProductId: nextFp.id,
        assignedFinishedQty: String(nextFp.availableForAssignmentQty)
      }
    ]);
  };

  const handleRemoveDispatchItemRow = (rowId: string) => {
    if (dispatchItems.length <= 1) {
      setError('At least one item must be included in the dispatch voucher.');
      return;
    }
    setDispatchItems(prev => prev.filter(r => r.id !== rowId));
  };

  const handleItemProductChange = (rowId: string, newFpId: string) => {
    const targetFp = finishedProducts.find(f => f.id === newFpId);
    setDispatchItems(prev =>
      prev.map(row => {
        if (row.id === rowId) {
          return {
            ...row,
            finishedProductId: newFpId,
            assignedFinishedQty: targetFp ? String(targetFp.availableForAssignmentQty) : '0'
          };
        }
        return row;
      })
    );
  };

  const handleItemQtyChange = (rowId: string, qtyStr: string) => {
    setDispatchItems(prev =>
      prev.map(row => (row.id === rowId ? { ...row, assignedFinishedQty: qtyStr } : row))
    );
  };

  const handleSaveAssignment = (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedEmployeeId) {
      setError('Please select an employee / staff member.');
      return;
    }

    if (dispatchItems.length === 0) {
      setError('Please add at least one garment item to dispatch.');
      return;
    }

    // Check for duplicate items selected
    const selectedFpIds = dispatchItems.map(i => i.finishedProductId);
    const hasDuplicates = new Set(selectedFpIds).size !== selectedFpIds.length;
    if (hasDuplicates) {
      setError('Duplicate garment items selected. Please combine quantities into a single row.');
      return;
    }

    // Validate each item
    for (let index = 0; index < dispatchItems.length; index++) {
      const item = dispatchItems[index];
      const targetFp = finishedProducts.find(f => f.id === item.finishedProductId);
      if (!targetFp) {
        setError(`Row #${index + 1}: Selected garment item not found.`);
        return;
      }

      const qty = Number(item.assignedFinishedQty);
      if (!qty || qty <= 0) {
        setError(`Row #${index + 1} (${targetFp.productName}): Quantity must be greater than 0.`);
        return;
      }

      if (qty > targetFp.availableForAssignmentQty) {
        setError(
          `Row #${index + 1} (${targetFp.productName}): Cannot dispatch ${qty} pcs. Maximum available stock is ${targetFp.availableForAssignmentQty} pcs.`
        );
        return;
      }
    }

    const emp = employees.find(e => e.id === selectedEmployeeId);
    const empName = emp ? emp.name : 'Staff Member';

    try {
      const dispatchedSummaries: string[] = [];
      let totalQty = 0;

      // Dispatch each item
      for (const item of dispatchItems) {
        const targetFp = finishedProducts.find(f => f.id === item.finishedProductId)!;
        const qty = Number(item.assignedFinishedQty);

        erpService.assignFinishedProductsToEmployee({
          finishedProductId: targetFp.id,
          employeeId: selectedEmployeeId,
          employeeName: empName,
          lotNumber: targetFp.lotNumber,
          productName: targetFp.productName,
          tailorName: targetFp.tailorName || 'Tailor N/A',
          assignedFinishedQty: qty,
          assignmentDate: assignmentDate,
          notes: dispatchNotes
        });

        dispatchedSummaries.push(`${targetFp.productName} (${qty} pcs)`);
        totalQty += qty;
      }

      showToast(`Dispatched ${totalQty} pcs (${dispatchedSummaries.join(', ')}) to ${empName}`);
      refreshData();
      setAssignDrawerOpen(false);
      if (onNavigateToInvoice) onNavigateToInvoice();
    } catch (err: any) {
      setError(err.message || 'Failed to dispatch finished products to employee');
    }
  };

  const handleOpenDamage = (fp: FinishedProduct) => {
    setSelectedFp(fp);
    setDamageData({
      damageQuantity: '',
      reason: 'Stain during quality inspection',
      damageDate: new Date().toISOString().split('T')[0]
    });
    setError('');
    setDamageModalOpen(true);
  };

  const handleSaveDamage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFp) return;

    const qty = Number(damageData.damageQuantity);
    if (!qty || qty <= 0) {
      setError('Damage quantity must be greater than zero');
      return;
    }
    if (qty > selectedFp.availableForAssignmentQty) {
      setError(`Damage quantity (${qty}) cannot exceed available quantity (${selectedFp.availableForAssignmentQty})`);
      return;
    }

    try {
      erpService.addFinishedProductDamage({
        finishedProductId: selectedFp.id,
        lotNumber: selectedFp.lotNumber,
        damageQuantity: qty,
        reason: damageData.reason || 'Finishing defect',
        damageDate: damageData.damageDate
      });

      showToast(`Recorded damage of ${qty} pcs for ${selectedFp.productName} (Lot ${selectedFp.lotNumber})`);
      refreshData();
      setDamageModalOpen(false);
    } catch (err: any) {
      setError(err.message || 'Failed to record damage');
    }
  };

  // Total pcs in dispatch items currently
  const totalDispatchPcs = dispatchItems.reduce((sum, item) => sum + (Number(item.assignedFinishedQty) || 0), 0);

  const fpColumns: Column<FinishedProduct>[] = [
    {
      key: 'lotNumber',
      header: 'Lot No.',
      sortable: true,
      accessor: (fp) => (
        <button
          type="button"
          onClick={() => onViewLot(fp.lotNumber)}
          className="font-mono font-bold text-slate-900 hover:text-indigo-600 hover:underline cursor-pointer flex items-center gap-1"
        >
          {fp.lotNumber}
          <ArrowUpRight className="w-3 h-3 text-slate-400" />
        </button>
      )
    },
    {
      key: 'productName',
      header: 'Garment Item',
      accessor: (fp) => (
        <div>
          <span className="font-bold text-slate-900 block">{fp.productName}</span>
        </div>
      )
    },
    {
      key: 'tailorName',
      header: 'Stitched By (Tailor)',
      accessor: (fp) => (
        <span className="text-slate-800 font-semibold bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
          {fp.tailorName || 'Tailor N/A'}
        </span>
      )
    },
    {
      key: 'totalStitchedQty',
      header: 'Total Stitched',
      align: 'right',
      accessor: (fp) => <span className="font-mono text-slate-800">{fp.totalStitchedQty} pcs</span>
    },
    {
      key: 'damagedQuantity',
      header: 'Damaged',
      align: 'right',
      accessor: (fp) => (
        <span className={`font-mono font-semibold ${fp.damagedQuantity > 0 ? 'text-rose-600' : 'text-slate-400'}`}>
          {fp.damagedQuantity} pcs
        </span>
      )
    },
    {
      key: 'assignedToEmployeeQty',
      header: 'Assigned Staff',
      align: 'right',
      accessor: (fp) => <span className="font-mono text-slate-700">{fp.assignedToEmployeeQty} pcs</span>
    },
    {
      key: 'availableForAssignmentQty',
      header: 'Available Stock',
      align: 'right',
      accessor: (fp) => (
        <span className={`font-mono font-bold ${fp.availableForAssignmentQty > 0 ? 'text-emerald-700' : 'text-slate-400'}`}>
          {fp.availableForAssignmentQty} pcs
        </span>
      )
    },
    {
      key: 'status',
      header: 'Status',
      align: 'center',
      accessor: (fp) => <StatusBadge status={fp.status} size="sm" />
    }
  ];

  const dispatchColumns: Column<EmployeeAssignment>[] = [
    {
      key: 'employeeName',
      header: 'Staff / Employee',
      sortable: true,
      accessor: (ea) => (
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-[10px]">
            {ea.employeeName.charAt(0)}
          </div>
          <span className="font-bold text-slate-900">{ea.employeeName}</span>
        </div>
      )
    },
    {
      key: 'lotNumber',
      header: 'Lot No.',
      accessor: (ea) => (
        <button
          type="button"
          onClick={() => onViewLot(ea.lotNumber)}
          className="font-mono font-bold text-slate-800 hover:text-indigo-600 cursor-pointer"
        >
          {ea.lotNumber}
        </button>
      )
    },
    {
      key: 'productName',
      header: 'Garment Item',
      accessor: (ea) => (
        <span className="font-semibold text-slate-900">{ea.productName || 'Garment Item'}</span>
      )
    },
    {
      key: 'tailorName',
      header: 'Stitched By (Tailor)',
      accessor: (ea) => (
        <span className="text-slate-700 font-medium text-xs bg-slate-50 px-2 py-0.5 rounded border border-slate-200">
          {ea.tailorName || 'Tailor N/A'}
        </span>
      )
    },
    {
      key: 'assignedFinishedQty',
      header: 'Dispatched Qty',
      align: 'right',
      accessor: (ea) => (
        <span className="font-mono font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100">
          {ea.assignedFinishedQty} pcs
        </span>
      )
    },
    {
      key: 'assignmentDate',
      header: 'Dispatch Date',
      align: 'center',
      accessor: (ea) => <span className="font-mono text-slate-600 text-xs">{ea.assignmentDate}</span>
    },
    {
      key: 'notes',
      header: 'Notes / Purpose',
      accessor: (ea) => <span className="text-slate-500 text-xs">{ea.notes || '—'}</span>
    }
  ];

  return (
    <div className="space-y-8">
      <PageHeader
        title="Finished Products & Employee Dispatch"
        description="Track finished items by tailor source, and dispatch specific items (e.g. 50 Pants & 20 Shirts) to staff members dynamically."
        action={
          <button
            type="button"
            onClick={handleOpenGeneralAssign}
            className="px-3.5 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-md transition-colors cursor-pointer flex items-center gap-1.5 shadow-2xs"
          >
            <Send className="w-3.5 h-3.5" />
            New Dispatch to Staff
          </button>
        }
      />

      {/* 1. Finished Goods Stock Inventory Table */}
      <div className="space-y-3">
        <div className="flex items-center justify-between border-b border-slate-200 pb-2">
          <div className="flex items-center gap-2">
            <Package className="w-4 h-4 text-slate-700" />
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              Finished Goods Inventory (By Item & Tailor)
            </h2>
          </div>
          <span className="text-xs text-slate-500">
            {finishedProducts.length} Inventory Batches
          </span>
        </div>

        <DataTable
          data={finishedProducts}
          columns={fpColumns}
          searchPlaceholder="Search finished goods by Lot No., Item Name, or Tailor..."
          searchKeys={['lotNumber', 'productName', 'tailorName']}
          onRowClick={(fp) => onViewLot(fp.lotNumber)}
          actions={(fp) => (
            <div className="flex items-center justify-end gap-1.5">
              <button
                type="button"
                onClick={() => setViewRecordFp(fp)}
                className="px-2.5 py-1 text-xs font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 rounded transition-colors cursor-pointer flex items-center gap-1"
              >
                <Eye className="w-3.5 h-3.5 text-indigo-600" />
                View
              </button>
              {fp.availableForAssignmentQty > 0 && (
                <>
                  <button
                    type="button"
                    onClick={() => handleOpenRowAssign(fp)}
                    className="px-2.5 py-1 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded transition-colors cursor-pointer flex items-center gap-1"
                  >
                    <Users className="w-3 h-3" />
                    Assign Staff
                  </button>
                  <button
                    type="button"
                    onClick={() => handleOpenDamage(fp)}
                    className="px-2.5 py-1 text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded transition-colors cursor-pointer"
                  >
                    Damage
                  </button>
                </>
              )}
              <button
                type="button"
                onClick={() => onViewLot(fp.lotNumber)}
                className="px-2.5 py-1 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded transition-colors cursor-pointer"
              >
                Audit
              </button>
            </div>
          )}
        />
      </div>

      {/* 2. Employee Dispatch History Log */}
      <div className="space-y-3 pt-4">
        <div className="flex items-center justify-between border-b border-slate-200 pb-2">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-slate-700" />
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              Employee Goods Dispatch Log ({employeeAssignments.length})
            </h2>
          </div>
          <span className="text-xs text-slate-500">
            Real-time tracking of item dispatches to staff members
          </span>
        </div>

        <DataTable
          data={employeeAssignments}
          columns={dispatchColumns}
          searchPlaceholder="Search dispatches by staff name, item, tailor, or lot..."
          searchKeys={['employeeName', 'lotNumber', 'productName', 'tailorName', 'notes']}
          actions={(ea) => (
            <button
              type="button"
              onClick={() => setViewRecordEa(ea)}
              className="px-2.5 py-1 text-xs font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 rounded transition-colors cursor-pointer flex items-center gap-1"
            >
              <Eye className="w-3.5 h-3.5 text-indigo-600" />
              View
            </button>
          )}
        />
      </div>

      {/* View Finished Product Record Modal */}
      {viewRecordFp && (
        <Modal
          isOpen={Boolean(viewRecordFp)}
          onClose={() => setViewRecordFp(null)}
          title={`Finished Product Record - Lot ${viewRecordFp.lotNumber}`}
          subtitle={`Product: ${viewRecordFp.productName} • Stitched by: ${viewRecordFp.tailorName || 'N/A'}`}
        >
          <div className="space-y-4 text-xs sm:text-sm">
            <div className="grid grid-cols-2 gap-3 bg-slate-50 p-3.5 rounded-lg border border-slate-200">
              <div>
                <span className="text-slate-500 text-xs block">Lot Number</span>
                <span className="font-mono font-bold text-slate-900 text-sm">{viewRecordFp.lotNumber}</span>
              </div>
              <div>
                <span className="text-slate-500 text-xs block">Garment Product Name</span>
                <span className="font-bold text-slate-900">{viewRecordFp.productName}</span>
              </div>
              <div>
                <span className="text-slate-500 text-xs block">Stitched By Tailor</span>
                <span className="font-semibold text-slate-800">{viewRecordFp.tailorName || 'N/A'}</span>
              </div>
              <div>
                <span className="text-slate-500 text-xs block">Current Status</span>
                <StatusBadge status={viewRecordFp.status} size="sm" />
              </div>
            </div>

            <div className="grid grid-cols-4 gap-2 text-center">
              <div className="bg-slate-100 p-2.5 rounded border border-slate-200">
                <span className="text-[11px] text-slate-500 font-semibold block">Total Stitched</span>
                <span className="font-mono font-bold text-slate-800 text-sm">{viewRecordFp.totalStitchedQty} pcs</span>
              </div>
              <div className="bg-rose-50 p-2.5 rounded border border-rose-200">
                <span className="text-[11px] text-rose-800 font-semibold block">Damaged</span>
                <span className="font-mono font-bold text-rose-700 text-sm">{viewRecordFp.damagedQuantity} pcs</span>
              </div>
              <div className="bg-indigo-50 p-2.5 rounded border border-indigo-200">
                <span className="text-[11px] text-indigo-800 font-semibold block">Dispatched Staff</span>
                <span className="font-mono font-bold text-indigo-700 text-sm">{viewRecordFp.assignedToEmployeeQty} pcs</span>
              </div>
              <div className="bg-emerald-50 p-2.5 rounded border border-emerald-200">
                <span className="text-[11px] text-emerald-800 font-semibold block">Available Stock</span>
                <span className="font-mono font-bold text-emerald-700 text-sm">{viewRecordFp.availableForAssignmentQty} pcs</span>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-200">
              <button
                type="button"
                onClick={() => {
                  const lot = viewRecordFp.lotNumber;
                  setViewRecordFp(null);
                  onViewLot(lot);
                }}
                className="px-3 py-1.5 text-xs font-semibold text-slate-800 bg-slate-100 hover:bg-slate-200 rounded transition-colors cursor-pointer flex items-center gap-1"
              >
                <ArrowUpRight className="w-3.5 h-3.5" />
                View Full Lot Audit
              </button>
              <button
                type="button"
                onClick={() => setViewRecordFp(null)}
                className="px-4 py-1.5 text-xs font-semibold text-white bg-slate-900 rounded hover:bg-slate-800 transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* View Employee Goods Dispatch Record Modal */}
      {viewRecordEa && (
        <Modal
          isOpen={Boolean(viewRecordEa)}
          onClose={() => setViewRecordEa(null)}
          title={`Dispatch Voucher - Lot ${viewRecordEa.lotNumber}`}
          subtitle={`Staff Member: ${viewRecordEa.employeeName} • Date: ${viewRecordEa.assignmentDate}`}
        >
          <div className="space-y-4 text-xs sm:text-sm">
            <div className="grid grid-cols-2 gap-3 bg-slate-50 p-3.5 rounded-lg border border-slate-200">
              <div>
                <span className="text-slate-500 text-xs block">Staff Member</span>
                <span className="font-bold text-slate-900 text-sm">{viewRecordEa.employeeName}</span>
              </div>
              <div>
                <span className="text-slate-500 text-xs block">Garment Item</span>
                <span className="font-semibold text-slate-900">{viewRecordEa.productName}</span>
              </div>
              <div>
                <span className="text-slate-500 text-xs block">Lot Number</span>
                <span className="font-mono font-bold text-slate-800">{viewRecordEa.lotNumber}</span>
              </div>
              <div>
                <span className="text-slate-500 text-xs block">Stitched By Tailor</span>
                <span className="font-medium text-slate-800">{viewRecordEa.tailorName || 'N/A'}</span>
              </div>
            </div>

            <div className="bg-indigo-50 p-3.5 rounded-lg border border-indigo-100 flex items-center justify-between">
              <div>
                <span className="text-indigo-800 font-semibold text-xs block">Dispatched Quantity</span>
                <span className="font-mono font-bold text-indigo-950 text-base">{viewRecordEa.assignedFinishedQty} pcs</span>
              </div>
              <div>
                <span className="text-slate-500 text-xs block">Dispatch Date</span>
                <span className="font-mono font-semibold text-slate-800">{viewRecordEa.assignmentDate}</span>
              </div>
            </div>

            {viewRecordEa.notes && (
              <div className="bg-slate-50 p-2.5 rounded border border-slate-200 text-xs">
                <span className="font-bold text-slate-700 block">Notes / Purpose:</span>
                <span className="text-slate-600">{viewRecordEa.notes}</span>
              </div>
            )}

            <div className="flex justify-end pt-2 border-t border-slate-200">
              <button
                type="button"
                onClick={() => setViewRecordEa(null)}
                className="px-4 py-1.5 text-xs font-semibold text-white bg-slate-900 rounded hover:bg-slate-800 transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Assign Finished Products to Employee Drawer (Multi-Item Dynamic) */}
      <Drawer
        isOpen={assignDrawerOpen}
        onClose={() => setAssignDrawerOpen(false)}
        title="Dispatch Finished Goods to Staff"
        subtitle={`Select staff member and add specific products (e.g., 50x Pants, 20x Shirts)`}
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
              className="px-4 py-2 text-xs font-semibold text-white bg-slate-900 rounded-md hover:bg-slate-800 transition-colors cursor-pointer shadow-2xs flex items-center gap-1.5"
            >
              <Send className="w-3.5 h-3.5" />
              Confirm Employee Dispatch ({totalDispatchPcs} pcs)
            </button>
          </>
        }
      >
        <form onSubmit={handleSaveAssignment} className="space-y-5">
          {error && <p className="text-xs text-rose-600 font-medium bg-rose-50 p-2.5 rounded border border-rose-200">{error}</p>}

          <FormSection title="1. Select Employee & Dispatch Info">
            <SelectField
              label="Select Employee / Staff Member"
              required
              colSpan={2}
              value={selectedEmployeeId}
              onChange={(e) => setSelectedEmployeeId(e.target.value)}
              options={employees.map(emp => ({
                value: emp.id,
                label: `${emp.name} (${emp.designation})`
              }))}
              onQuickAdd={() => setQuickAddOpen(true)}
              quickAddTitle="Add Employee"
            />

            <InputField
              label="Dispatch Date"
              type="date"
              required
              value={assignmentDate}
              onChange={(e) => setAssignmentDate(e.target.value)}
            />

            <InputField
              label="Dispatch Purpose / Notes"
              value={dispatchNotes}
              onChange={(e) => setDispatchNotes(e.target.value)}
              placeholder="e.g. Retail outlet stock distribution"
            />
          </FormSection>

          <FormSection title="2. Select Products & Quantities to Dispatch">
            <div className="col-span-2 space-y-3">
              {/* Summary Header Bar */}
              <div className="flex items-center justify-between bg-slate-50 border border-slate-200 rounded p-2.5 text-xs text-slate-700">
                <div className="flex items-center gap-2 font-semibold text-slate-900">
                  <Layers className="w-4 h-4 text-indigo-600" />
                  <span>Items to Dispatch ({dispatchItems.length})</span>
                </div>
                <div className="font-mono font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100">
                  Total Dispatched: {totalDispatchPcs} pcs
                </div>
              </div>

              {/* Dynamic Product Item Rows */}
              <div className="space-y-3">
                {dispatchItems.map((itemRow, index) => {
                  const currentFp = finishedProducts.find(f => f.id === itemRow.finishedProductId);
                  const availStock = currentFp ? currentFp.availableForAssignmentQty : 0;

                  return (
                    <div
                      key={itemRow.id}
                      className="bg-white border border-slate-200 rounded-lg p-3 space-y-3 shadow-2xs relative hover:border-slate-300 transition-colors"
                    >
                      <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-700">
                          Garment Item #{index + 1}
                        </span>

                        {dispatchItems.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveDispatchItemRow(itemRow.id)}
                            className="text-slate-400 hover:text-rose-600 p-1 rounded transition-colors cursor-pointer"
                            title="Remove item row"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div className="sm:col-span-2">
                          <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                            Garment Item Batch <span className="text-rose-500">*</span>
                          </label>
                          <select
                            value={itemRow.finishedProductId}
                            onChange={(e) => handleItemProductChange(itemRow.id, e.target.value)}
                            className="w-full text-xs bg-slate-50 border border-slate-300 rounded px-2.5 py-1.5 font-medium text-slate-900 focus:outline-none focus:border-slate-500"
                          >
                            {availableFinishedProducts.map(fp => (
                              <option key={fp.id} value={fp.id}>
                                [{fp.lotNumber}] {fp.productName} ({fp.tailorName || 'Tailor N/A'}) — {fp.availableForAssignmentQty} pcs avail
                              </option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                            Dispatch Qty <span className="text-rose-500">*</span>
                          </label>
                          <div className="relative">
                            <input
                              type="number"
                              min="1"
                              max={availStock}
                              value={itemRow.assignedFinishedQty}
                              onChange={(e) => handleItemQtyChange(itemRow.id, e.target.value)}
                              placeholder="e.g. 50"
                              className="w-full text-xs font-mono font-bold border border-slate-300 rounded px-2.5 py-1.5 focus:outline-none focus:border-slate-500"
                            />
                            <span className="absolute right-2.5 top-2 text-[10px] font-medium text-slate-400">pcs</span>
                          </div>
                        </div>
                      </div>

                      {/* Selected Item Info Box */}
                      {currentFp && (
                        <div className="bg-slate-50 p-2 rounded border border-slate-100 text-[11px] flex flex-wrap justify-between items-center text-slate-600">
                          <div>
                            <span className="font-bold text-slate-900 mr-2">{currentFp.productName}</span>
                            <span className="font-mono text-slate-500">[{currentFp.lotNumber}]</span>
                          </div>
                          <div>
                            Tailor: <span className="font-semibold text-slate-800 mr-3">{currentFp.tailorName || 'N/A'}</span>
                            Available: <span className="font-mono font-bold text-emerald-700">{currentFp.availableForAssignmentQty} pcs</span>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Add Item Row Button */}
              <button
                type="button"
                onClick={handleAddDispatchItemRow}
                disabled={availableFinishedProducts.length === 0}
                className="w-full py-2 px-3 text-xs font-semibold text-slate-700 bg-slate-50 hover:bg-slate-100 border border-dashed border-slate-300 rounded-lg transition-colors cursor-pointer flex items-center justify-center gap-1.5 disabled:opacity-50"
              >
                <Plus className="w-3.5 h-3.5" />
                Add Another Product Item (e.g. Pent, Cotton Shirt)
              </button>
            </div>
          </FormSection>
        </form>
      </Drawer>

      {/* Finished Product Damage Modal */}
      {selectedFp && (
        <Modal
          isOpen={damageModalOpen}
          onClose={() => setDamageModalOpen(false)}
          title={`Record Damage — ${selectedFp.productName}`}
          subtitle={`Lot: ${selectedFp.lotNumber} • Tailor: ${selectedFp.tailorName || 'N/A'}`}
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
                Save Damage
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
              unit="pcs"
              value={damageData.damageQuantity}
              onChange={(e) => setDamageData({ ...damageData, damageQuantity: e.target.value })}
              placeholder="e.g. 5"
              helperText={`Available for damage reporting: ${selectedFp.availableForAssignmentQty} pcs`}
            />

            <InputField
              label="Damage Date"
              type="date"
              required
              value={damageData.damageDate}
              onChange={(e) => setDamageData({ ...damageData, damageDate: e.target.value })}
            />

            <InputField
              label="Reason / Quality Notes"
              value={damageData.reason}
              onChange={(e) => setDamageData({ ...damageData, reason: e.target.value })}
              placeholder="e.g. Fabric tear during packaging"
            />
          </form>
        </Modal>
      )}

      <QuickAddModal
        isOpen={quickAddOpen}
        onClose={() => setQuickAddOpen(false)}
        type="employee"
        showToast={showToast}
        onSuccess={(newId) => {
          refreshData();
          setSelectedEmployeeId(newId);
        }}
      />
    </div>
  );
};
