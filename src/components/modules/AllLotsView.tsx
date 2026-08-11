import React, { useState } from 'react';
import {
  Layers,
  CheckCircle2,
  Clock,
  Printer,
  Plus,
  ArrowUpRight,
  Search,
  SlidersHorizontal,
  LayoutGrid,
  List,
  Building2,
  Package,
  Scissors,
  CheckSquare,
  FileText,
  IndianRupee,
  ShoppingBag,
  CreditCard,
  Eye
} from 'lucide-react';
import { erpService } from '../../services/storage';
import { LotLifecycle, LotStatus } from '../../types/erp';
import { PageHeader } from '../common/PageHeader';
import { StatusBadge } from '../common/StatusBadge';
import { ProcessTracker, getActiveModuleForStatus } from '../common/ProcessTracker';
import { printLotSummaryHtml } from '../../utils/printHelper';
import { NavModule } from '../common/ERPLayout';
import { useKeyboardShortcuts } from '../../hooks/useKeyboardShortcuts';

interface AllLotsViewProps {
  showToast: (msg: string) => void;
  onViewLot: (lotNumber: string) => void;
  onNavigate: (module: NavModule, param?: string) => void;
}

export const AllLotsView: React.FC<AllLotsViewProps> = ({
  showToast,
  onViewLot,
  onNavigate
}) => {
  const [lifecycles] = useState<LotLifecycle[]>(erpService.getAllLotLifecycles());

  useKeyboardShortcuts({
    onNew: () => {
      onNavigate('purchases');
    },
    onPrint: () => {
      if (lifecycles.length > 0) {
        printLotSummaryHtml(lifecycles[0]);
      }
    }
  });
  const [activeTab, setActiveTab] = useState<'all' | 'ongoing' | 'completed'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedWholesaler, setSelectedWholesaler] = useState<string>('ALL');
  const [selectedStage, setSelectedStage] = useState<string>('ALL');
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');

  // Helper to determine if a lot is completed vs ongoing
  const isLotCompleted = (lc: LotLifecycle) => {
    return lc.status === 'INVOICED' || lc.status === 'PAID';
  };

  // Filter lifecycles based on tab, search, wholesaler, stage
  const filteredLifecycles = lifecycles.filter(lc => {
    // 1. Tab filter
    if (activeTab === 'ongoing' && isLotCompleted(lc)) return false;
    if (activeTab === 'completed' && !isLotCompleted(lc)) return false;

    // 2. Wholesaler filter
    if (selectedWholesaler !== 'ALL' && lc.purchase?.wholesalerName !== selectedWholesaler) {
      return false;
    }

    // 3. Stage filter
    if (selectedStage !== 'ALL') {
      if (selectedStage === 'PURCHASED' && lc.status !== 'PURCHASED') return false;
      if (selectedStage === 'RAW_MATERIAL' && lc.status !== 'RAW_MATERIAL') return false;
      if (selectedStage === 'CUTTING' && !['CUTTING_IN_PROGRESS', 'CUT_PIECES_READY'].includes(lc.status)) return false;
      if (selectedStage === 'STITCHING' && !['TAILOR_ASSIGNED', 'STITCHING_IN_PROGRESS'].includes(lc.status)) return false;
      if (selectedStage === 'FINISHED' && !['FINISHED_GOODS', 'EMPLOYEE_ASSIGNED', 'READY_FOR_INVOICE'].includes(lc.status)) return false;
      if (selectedStage === 'INVOICED' && !['INVOICED', 'PAID'].includes(lc.status)) return false;
    }

    // 4. Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchLot = lc.lotNumber.toLowerCase().includes(q);
      const matchWholesaler = lc.purchase?.wholesalerName.toLowerCase().includes(q);
      const matchChallan = lc.purchase?.challanNumber.toLowerCase().includes(q);
      const matchMaterial = lc.purchase?.materialName.toLowerCase().includes(q);
      const matchInvoice = lc.invoice?.invoiceNumber.toLowerCase().includes(q);

      // Check product names in cut pieces or finished goods
      const matchProducts = lc.finishedProducts?.some(fp => fp.productName.toLowerCase().includes(q)) ||
        (lc.cutPieces?.pieceType && lc.cutPieces.pieceType.toLowerCase().includes(q));

      // Check tailor names
      const matchTailors = lc.tailorAssignments?.some(ta => ta.tailorName.toLowerCase().includes(q));

      return matchLot || matchWholesaler || matchChallan || matchMaterial || matchInvoice || matchProducts || matchTailors;
    }

    return true;
  });

  // Calculate High-level Executive KPIs
  const totalLots = lifecycles.length;
  const ongoingLots = lifecycles.filter(lc => !isLotCompleted(lc));
  const completedLots = lifecycles.filter(lc => isLotCompleted(lc));

  const totalFabricMeters = lifecycles.reduce((sum, lc) => sum + (lc.purchase?.totalQuantity || 0), 0);
  const totalFinishedPcs = lifecycles.reduce((sum, lc) => {
    return sum + (lc.finishedProducts?.reduce((pSum, fp) => pSum + fp.totalStitchedQty, 0) || 0);
  }, 0);

  const totalBilledValue = lifecycles.reduce((sum, lc) => sum + (lc.invoice?.finalNetPayableAmount || 0), 0);

  // Unique wholesalers for dropdown filter
  const uniqueWholesalers = Array.from(
    new Set(lifecycles.map(lc => lc.purchase?.wholesalerName).filter(Boolean))
  ) as string[];

  // Helper to construct narrative story for a lot
  const generateLotDescription = (lc: LotLifecycle) => {
    const p = lc.purchase;
    if (!p) return 'No purchase details available.';

    const parts: string[] = [];
    parts.push(`Purchased ${p.totalQuantity} ${p.unit} of ${p.materialName} from ${p.wholesalerName} (Challan #${p.challanNumber}) on ${p.purchaseDate}.`);

    if (lc.rawMaterial) {
      if (lc.rawMaterial.usedQuantity > 0) {
        parts.push(`Used ${lc.rawMaterial.usedQuantity} ${p.unit} in cutting (${lc.rawMaterial.availableQuantity} ${p.unit} remaining).`);
      } else {
        parts.push(`Raw material stored in stock (${lc.rawMaterial.availableQuantity} ${p.unit} available).`);
      }
    }

    if (lc.cutPieces) {
      parts.push(`Generated total ${lc.cutPieces.totalCutPieces} cut pieces [Garment Type: ${lc.cutPieces.pieceType || 'Standard Pieces'}].`);
    }

    if (lc.tailorAssignments && lc.tailorAssignments.length > 0) {
      const tailors = Array.from(new Set(lc.tailorAssignments.map(ta => ta.tailorName))).join(', ');
      const totalAssigned = lc.tailorAssignments.reduce((s, ta) => s + ta.assignedPiecesQty, 0);
      parts.push(`Assigned ${totalAssigned} pcs for stitching to Tailors (${tailors}).`);
    }

    if (lc.finishedProducts && lc.finishedProducts.length > 0) {
      const totalStitched = lc.finishedProducts.reduce((s, fp) => s + fp.totalStitchedQty, 0);
      parts.push(`${totalStitched} pcs completed & moved to Finished Goods stock.`);
    }

    if (lc.employeeAssignments && lc.employeeAssignments.length > 0) {
      const totalDispatched = lc.employeeAssignments.reduce((s, ea) => s + ea.assignedFinishedQty, 0);
      parts.push(`Dispatched ${totalDispatched} pcs to retail sales employees.`);
    }

    if (lc.invoice) {
      parts.push(`Billed to wholesaler via Invoice #${lc.invoice.invoiceNumber} for ₹${lc.invoice.finalNetPayableAmount.toLocaleString()} [Status: ${lc.invoice.paymentStatus}].`);
    }

    return parts.join(' ');
  };

  return (
    <div className="space-y-3">
      <PageHeader
        title="LOTS MASTER DIRECTORY & STAGE METRICS"
        description="Comprehensive directory of all ongoing and completed manufacturing lots, stage metrics, tailor assignments, and billing status."
        primaryAction={{
          label: "New Purchase Lot (F2)",
          onClick: () => onNavigate('purchases'),
          icon: <Plus className="w-3.5 h-3.5" />
        }}
      />

      {/* Top Executive KPI Overview Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="bg-white border border-slate-200 rounded-lg p-3 shadow-2xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">Total Lots</span>
          <span className="text-xl font-bold font-mono text-slate-900">{totalLots}</span>
          <span className="text-[10px] text-slate-400 block mt-0.5">Purchased to date</span>
        </div>

        <div className="bg-amber-50/60 border border-amber-200 rounded-lg p-3 shadow-2xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800 block">Ongoing Lots</span>
          <span className="text-xl font-bold font-mono text-amber-900">{ongoingLots.length}</span>
          <span className="text-[10px] text-amber-700 block mt-0.5">Active in production</span>
        </div>

        <div className="bg-emerald-50/60 border border-emerald-200 rounded-lg p-3 shadow-2xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 block">Completed Lots</span>
          <span className="text-xl font-bold font-mono text-emerald-900">{completedLots.length}</span>
          <span className="text-[10px] text-emerald-700 block mt-0.5">Invoiced & settled</span>
        </div>

        <div className="bg-white border border-slate-200 rounded-lg p-3 shadow-2xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">Fabric Processed</span>
          <span className="text-xl font-bold font-mono text-slate-900">{totalFabricMeters.toLocaleString()} <span className="text-xs font-normal">Mtr</span></span>
          <span className="text-[10px] text-slate-400 block mt-0.5">Total raw material</span>
        </div>

        <div className="bg-white border border-slate-200 rounded-lg p-3 shadow-2xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">Finished Goods</span>
          <span className="text-xl font-bold font-mono text-indigo-700">{totalFinishedPcs.toLocaleString()} <span className="text-xs font-normal">pcs</span></span>
          <span className="text-[10px] text-slate-400 block mt-0.5">Garments produced</span>
        </div>

        <div className="bg-white border border-slate-200 rounded-lg p-3 shadow-2xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">Billed Invoices</span>
          <span className="text-xl font-bold font-mono text-slate-900">₹{totalBilledValue.toLocaleString()}</span>
          <span className="text-[10px] text-slate-400 block mt-0.5">Total net value</span>
        </div>
      </div>

      {/* Tabs & Filter Controls */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-200 pb-3">
          {/* Main Status Tabs */}
          <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-lg">
            <button
              type="button"
              onClick={() => setActiveTab('all')}
              className={`px-3.5 py-1.5 text-xs font-bold rounded-md transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'all'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              All Lots ({totalLots})
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('ongoing')}
              className={`px-3.5 py-1.5 text-xs font-bold rounded-md transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'ongoing'
                  ? 'bg-amber-500 text-white shadow-xs'
                  : 'text-amber-700 hover:bg-amber-100/50'
              }`}
            >
              <Clock className="w-3.5 h-3.5" />
              Ongoing Lots ({ongoingLots.length})
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('completed')}
              className={`px-3.5 py-1.5 text-xs font-bold rounded-md transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'completed'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-emerald-700 hover:bg-emerald-100/50'
              }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              Completed Lots ({completedLots.length})
            </button>
          </div>

          {/* View Toggle */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500 font-medium">View:</span>
            <div className="flex items-center bg-slate-100 p-0.5 rounded border border-slate-200">
              <button
                type="button"
                onClick={() => setViewMode('cards')}
                className={`p-1.5 rounded text-xs font-medium cursor-pointer ${
                  viewMode === 'cards' ? 'bg-white text-slate-900 shadow-2xs font-bold' : 'text-slate-500 hover:text-slate-800'
                }`}
                title="Detailed Cards View"
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setViewMode('table')}
                className={`p-1.5 rounded text-xs font-medium cursor-pointer ${
                  viewMode === 'table' ? 'bg-white text-slate-900 shadow-2xs font-bold' : 'text-slate-500 hover:text-slate-800'
                }`}
                title="Compact Table View"
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Sub-Filters: Search, Wholesaler, Production Stage */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search Lot #, Wholesaler, Item (e.g. Pent, Shirt), Tailor..."
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-300 rounded-md focus:outline-none focus:border-slate-500"
            />
          </div>

          <div className="flex items-center gap-1.5">
            <SlidersHorizontal className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <select
              value={selectedWholesaler}
              onChange={(e) => setSelectedWholesaler(e.target.value)}
              className="w-full text-xs bg-slate-50 border border-slate-300 rounded-md px-2.5 py-1.5 font-medium text-slate-800 focus:outline-none focus:border-slate-500"
            >
              <option value="ALL">All Wholesalers ({uniqueWholesalers.length})</option>
              {uniqueWholesalers.map(w => (
                <option key={w} value={w}>{w}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-1.5">
            <select
              value={selectedStage}
              onChange={(e) => setSelectedStage(e.target.value)}
              className="w-full text-xs bg-slate-50 border border-slate-300 rounded-md px-2.5 py-1.5 font-medium text-slate-800 focus:outline-none focus:border-slate-500"
            >
              <option value="ALL">All Production Stages</option>
              <option value="PURCHASED">1. Purchased</option>
              <option value="RAW_MATERIAL">2. Raw Material Stock</option>
              <option value="CUTTING">3. Cutting In Progress / Cut Pieces</option>
              <option value="STITCHING">4. Tailor Stitching</option>
              <option value="FINISHED">5. Finished Goods Stock</option>
              <option value="INVOICED">6. Invoiced & Settled</option>
            </select>
          </div>
        </div>
      </div>

      {/* Lot Directory Listings */}
      {filteredLifecycles.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-xl p-12 text-center space-y-3">
          <Layers className="w-10 h-10 text-slate-300 mx-auto" />
          <h3 className="text-sm font-bold text-slate-800">No matching lots found</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            Try adjusting your search criteria or switching tabs between Ongoing and Completed lots.
          </p>
        </div>
      ) : viewMode === 'cards' ? (
        <div className="space-y-6">
          {filteredLifecycles.map((lc) => {
            const isCompleted = isLotCompleted(lc);
            const activeMod = getActiveModuleForStatus(lc.status);
            const lotStory = generateLotDescription(lc);

            return (
              <div
                key={lc.lotNumber}
                className={`bg-white border rounded-xl overflow-hidden shadow-2xs hover:shadow-md transition-shadow ${
                  isCompleted ? 'border-emerald-200/80' : 'border-slate-200'
                }`}
              >
                {/* Card Top Header */}
                <div className={`p-4 border-b flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                  isCompleted ? 'bg-emerald-50/40 border-emerald-200/60' : 'bg-slate-50 border-slate-200'
                }`}>
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => onViewLot(lc.lotNumber)}
                      className="font-mono font-black text-slate-900 text-base hover:text-indigo-600 cursor-pointer flex items-center gap-1.5"
                    >
                      {lc.lotNumber}
                      <ArrowUpRight className="w-4 h-4 text-slate-400" />
                    </button>
                    <StatusBadge status={lc.status} />
                  </div>

                  <div className="flex items-center gap-3 text-xs text-slate-600">
                    <span className="flex items-center gap-1 font-semibold text-slate-900">
                      <Building2 className="w-3.5 h-3.5 text-slate-500" />
                      {lc.purchase?.wholesalerName || 'Wholesaler N/A'}
                    </span>
                    <span>•</span>
                    <span className="font-mono text-slate-500">Challan: #{lc.purchase?.challanNumber}</span>
                    <span>•</span>
                    <span className="font-mono text-slate-500">{lc.purchase?.purchaseDate}</span>
                  </div>
                </div>

                {/* Card Body: Story Narrative Description & Progress Bar */}
                <div className="p-5 space-y-4">
                  {/* Human-Readable Narrative Story */}
                  <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 text-xs text-slate-700 space-y-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
                      Lot Progress Summary & Description
                    </span>
                    <p className="leading-relaxed font-medium text-slate-800">{lotStory}</p>
                  </div>

                  {/* Workflow Process Stage Tracker */}
                  <div className="bg-white rounded-lg p-2 border border-slate-100">
                    <ProcessTracker
                      status={lc.status}
                      lotNumber={lc.lotNumber}
                      onNavigateStep={(mod) => onNavigate(mod, lc.lotNumber)}
                    />
                  </div>

                  {/* Grid Breakdown of Lot Specs */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
                    {/* 1. Raw Fabric */}
                    <div className="border border-slate-200 rounded-lg p-3 bg-slate-50/50 space-y-1">
                      <div className="flex items-center gap-1.5 text-slate-700 font-bold border-b border-slate-200 pb-1 mb-1">
                        <ShoppingBag className="w-3.5 h-3.5 text-slate-500" />
                        <span>Fabric Material</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Material:</span>
                        <span className="font-semibold text-slate-900">{lc.purchase?.materialName}</span>
                      </div>
                      <div className="flex justify-between font-mono">
                        <span className="text-slate-500">Bought / Cost:</span>
                        <span className="font-bold text-slate-900">{lc.purchase?.totalQuantity}m (₹{lc.purchase?.purchaseAmount.toLocaleString()})</span>
                      </div>
                      <div className="flex justify-between font-mono">
                        <span className="text-slate-500">Cutting Used:</span>
                        <span className="text-slate-800">{lc.rawMaterial?.usedQuantity || 0}m used</span>
                      </div>
                    </div>

                    {/* 2. Cut Pieces & Products */}
                    <div className="border border-slate-200 rounded-lg p-3 bg-slate-50/50 space-y-1">
                      <div className="flex items-center gap-1.5 text-slate-700 font-bold border-b border-slate-200 pb-1 mb-1">
                        <Scissors className="w-3.5 h-3.5 text-slate-500" />
                        <span>Cut Pieces Generated</span>
                      </div>
                      <div className="flex justify-between font-mono">
                        <span className="text-slate-500">Total Cut Pieces:</span>
                        <span className="font-bold text-slate-900">{lc.cutPieces ? lc.cutPieces.totalCutPieces : 0} pcs</span>
                      </div>
                      <div className="text-[11px] text-slate-600 truncate">
                        {lc.cutPieces?.pieceType || 'Standard Lot Pieces'}
                      </div>
                    </div>

                    {/* 3. Stitching & Tailors */}
                    <div className="border border-slate-200 rounded-lg p-3 bg-slate-50/50 space-y-1">
                      <div className="flex items-center gap-1.5 text-slate-700 font-bold border-b border-slate-200 pb-1 mb-1">
                        <CheckSquare className="w-3.5 h-3.5 text-slate-500" />
                        <span>Tailor Stitching</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Tailors:</span>
                        <span className="font-semibold text-slate-900">
                          {lc.tailorAssignments && lc.tailorAssignments.length > 0
                            ? Array.from(new Set(lc.tailorAssignments.map(t => t.tailorName))).join(', ')
                            : 'Unassigned'}
                        </span>
                      </div>
                      <div className="flex justify-between font-mono">
                        <span className="text-slate-500">Finished Goods:</span>
                        <span className="font-bold text-emerald-700">
                          {lc.finishedProducts ? lc.finishedProducts.reduce((sum, fp) => sum + fp.totalStitchedQty, 0) : 0} pcs
                        </span>
                      </div>
                    </div>

                    {/* 4. Invoice & Billing */}
                    <div className="border border-slate-200 rounded-lg p-3 bg-slate-50/50 space-y-1">
                      <div className="flex items-center gap-1.5 text-slate-700 font-bold border-b border-slate-200 pb-1 mb-1">
                        <FileText className="w-3.5 h-3.5 text-slate-500" />
                        <span>Wholesaler Invoice</span>
                      </div>
                      {lc.invoice ? (
                        <>
                          <div className="flex justify-between font-mono">
                            <span className="text-slate-500">Invoice #:</span>
                            <span className="font-bold text-slate-900">{lc.invoice.invoiceNumber}</span>
                          </div>
                          <div className="flex justify-between font-mono">
                            <span className="text-slate-500">Net Amount:</span>
                            <span className="font-bold text-slate-900">₹{lc.invoice.finalNetPayableAmount.toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between items-center pt-0.5">
                            <span className="text-[10px] uppercase font-bold text-slate-500">Payment:</span>
                            <span className={`font-mono text-[11px] font-bold ${
                              lc.invoice.paymentStatus === 'PAID' ? 'text-emerald-700' : 'text-amber-700'
                            }`}>
                              {lc.invoice.paymentStatus} (Due: ₹{lc.invoice.dueAmount.toLocaleString()})
                            </span>
                          </div>
                        </>
                      ) : (
                        <div className="text-slate-400 italic py-2 text-center">Not Invoiced Yet</div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Card Action Footer Bar */}
                <div className="bg-slate-50 p-3 border-t border-slate-200 flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => onViewLot(lc.lotNumber)}
                      className="px-3 py-1.5 text-xs font-semibold text-indigo-700 bg-indigo-50 border border-indigo-200 rounded hover:bg-indigo-100 transition-colors cursor-pointer flex items-center gap-1"
                    >
                      <Eye className="w-3.5 h-3.5 text-indigo-600" />
                      View Audit Trail
                    </button>
                    {lc.invoice && lc.invoice.dueAmount > 0 && (
                      <button
                        type="button"
                        onClick={() => onNavigate('invoices', lc.lotNumber)}
                        className="px-3 py-1.5 text-xs font-semibold text-white bg-emerald-700 hover:bg-emerald-800 rounded transition-colors cursor-pointer flex items-center gap-1 shadow-2xs"
                      >
                        <CreditCard className="w-3.5 h-3.5 text-emerald-200" />
                        Record Payment (Due: ₹{lc.invoice.dueAmount.toLocaleString()})
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => onNavigate(activeMod, lc.lotNumber)}
                      className="px-3 py-1.5 text-xs font-semibold text-indigo-700 bg-indigo-50 border border-indigo-200 rounded hover:bg-indigo-100 transition-colors cursor-pointer flex items-center gap-1"
                    >
                      Jump to Active Stage ({activeMod.toUpperCase()})
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={() => printLotSummaryHtml(lc)}
                    className="px-3 py-1.5 text-xs font-semibold text-slate-700 hover:text-slate-900 hover:bg-slate-200/60 rounded transition-colors cursor-pointer flex items-center gap-1"
                  >
                    <Printer className="w-3.5 h-3.5 text-slate-500" />
                    Print Summary Report
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Compact Table View */
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[11px]">
                  <th className="p-3">Lot No.</th>
                  <th className="p-3">Wholesaler & Date</th>
                  <th className="p-3">Material Purchased</th>
                  <th className="p-3">Active Stage</th>
                  <th className="p-3">Cut Goods</th>
                  <th className="p-3 text-right">Finished Pcs</th>
                  <th className="p-3 text-right">Invoice Value</th>
                  <th className="p-3 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {filteredLifecycles.map((lc) => {
                  const finishedPcs = lc.finishedProducts?.reduce((s, fp) => s + fp.totalStitchedQty, 0) || 0;
                  const activeMod = getActiveModuleForStatus(lc.status);

                  return (
                    <tr key={lc.lotNumber} className="hover:bg-slate-50 transition-colors">
                      <td className="p-3">
                        <button
                          type="button"
                          onClick={() => onViewLot(lc.lotNumber)}
                          className="font-mono font-bold text-slate-900 hover:text-indigo-600 cursor-pointer flex items-center gap-1"
                        >
                          {lc.lotNumber}
                        </button>
                      </td>
                      <td className="p-3">
                        <span className="font-bold text-slate-900 block">{lc.purchase?.wholesalerName}</span>
                        <span className="font-mono text-[11px] text-slate-500">Challan: #{lc.purchase?.challanNumber} • {lc.purchase?.purchaseDate}</span>
                      </td>
                      <td className="p-3">
                        <span className="font-medium text-slate-800">{lc.purchase?.materialName}</span>
                        <span className="font-mono text-[11px] text-slate-500 block">{lc.purchase?.totalQuantity} {lc.purchase?.unit}</span>
                      </td>
                      <td className="p-3">
                        <StatusBadge status={lc.status} size="sm" />
                      </td>
                      <td className="p-3">
                        <span className="font-mono font-semibold text-slate-800">
                          {lc.cutPieces ? `${lc.cutPieces.totalCutPieces} pcs` : '—'}
                        </span>
                      </td>
                      <td className="p-3 text-right font-mono font-bold text-emerald-700">
                        {finishedPcs > 0 ? `${finishedPcs} pcs` : '—'}
                      </td>
                      <td className="p-3 text-right font-mono">
                        {lc.invoice ? (
                          <div>
                            <span className="font-bold text-slate-900 block">₹{lc.invoice.finalNetPayableAmount.toLocaleString()}</span>
                            <span className="text-[10px] text-slate-500">{lc.invoice.paymentStatus}</span>
                          </div>
                        ) : (
                          <span className="text-slate-400">—</span>
                        )}
                      </td>
                      <td className="p-3 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => onViewLot(lc.lotNumber)}
                            className="px-2 py-1 text-xs font-semibold text-indigo-700 bg-indigo-50 border border-indigo-200 hover:bg-indigo-100 rounded cursor-pointer flex items-center gap-1"
                          >
                            <Eye className="w-3.5 h-3.5 text-indigo-600" />
                            View
                          </button>
                          <button
                            type="button"
                            onClick={() => onNavigate(activeMod, lc.lotNumber)}
                            className="px-2 py-1 text-xs font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded cursor-pointer"
                          >
                            Jump
                          </button>
                          <button
                            type="button"
                            onClick={() => printLotSummaryHtml(lc)}
                            className="p-1 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded cursor-pointer"
                            title="Print Lot Summary"
                          >
                            <Printer className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
