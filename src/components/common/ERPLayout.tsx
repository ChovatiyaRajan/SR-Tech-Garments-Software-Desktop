import React, { useState } from 'react';
import {
  LayoutDashboard,
  Building2,
  Users,
  UserCheck,
  ShoppingCart,
  Layers,
  Scissors,
  Grid,
  CheckSquare,
  Package,
  IndianRupee,
  FileText,
  CreditCard,
  BarChart3,
  Menu,
  X,
  ChevronLeft,
  ChevronRight,
  Search,
  Building,
  Bell,
  HelpCircle,
  FileSpreadsheet,
  LogOut,
  Maximize2,
  Minimize2
} from 'lucide-react';
import { AuthUser } from '../../services/auth';
import { TopDesktopMenuBar } from './TopDesktopMenuBar';
import { DesktopStatusBar } from './DesktopStatusBar';
import { KeyboardShortcutsHelp } from '../shortcuts/KeyboardShortcutsHelp';
import { useFullscreen } from '../../hooks/useFullscreen';

export type NavModule =
  | 'login'
  | 'dashboard'
  | 'all_lots'
  | 'wholesalers'
  | 'tailors'
  | 'employees'
  | 'purchases'
  | 'raw_materials'
  | 'cutting'
  | 'cut_pieces'
  | 'stitching'
  | 'finished_products'
  | 'salary'
  | 'invoices'
  | 'wholesaler_payments'
  | 'reports'
  | 'lot_detail';

interface NavGroup {
  groupName: string;
  items: Array<{
    id: NavModule;
    label: string;
    icon: React.ReactNode;
  }>;
}

const NAV_GROUPS: NavGroup[] = [
  {
    groupName: 'WORKSPACE',
    items: [
      { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard className="w-3.5 h-3.5" /> },
      { id: 'all_lots', label: 'All Lots & Progress', icon: <Layers className="w-3.5 h-3.5" /> }
    ]
  },
  {
    groupName: 'MASTERS',
    items: [
      { id: 'wholesalers', label: 'Wholesalers', icon: <Building2 className="w-3.5 h-3.5" /> },
      { id: 'tailors', label: 'Tailors Master', icon: <UserCheck className="w-3.5 h-3.5" /> },
      { id: 'employees', label: 'Employees Master', icon: <Users className="w-3.5 h-3.5" /> }
    ]
  },
  {
    groupName: 'PURCHASE',
    items: [
      { id: 'purchases', label: 'Fabric Purchase', icon: <ShoppingCart className="w-3.5 h-3.5" /> },
      { id: 'raw_materials', label: 'Raw Fabric Stock', icon: <Layers className="w-3.5 h-3.5" /> }
    ]
  },
  {
    groupName: 'PRODUCTION',
    items: [
      { id: 'cutting', label: 'Cutting Lay Sheet', icon: <Scissors className="w-3.5 h-3.5" /> },
      { id: 'cut_pieces', label: 'Cut Pieces Stock', icon: <Grid className="w-3.5 h-3.5" /> },
      { id: 'stitching', label: 'Stitching Allocation', icon: <CheckSquare className="w-3.5 h-3.5" /> },
      { id: 'finished_products', label: 'Finished Goods', icon: <Package className="w-3.5 h-3.5" /> }
    ]
  },
  {
    groupName: 'SALES & ACCOUNTS',
    items: [
      { id: 'invoices', label: 'Tax Invoices', icon: <FileText className="w-3.5 h-3.5" /> },
      { id: 'wholesaler_payments', label: 'Wholesaler Receipts', icon: <CreditCard className="w-3.5 h-3.5" /> },
      { id: 'salary', label: 'Salary & Upaad', icon: <IndianRupee className="w-3.5 h-3.5" /> }
    ]
  },
  {
    groupName: 'REPORTS',
    items: [
      { id: 'reports', label: 'Reports & Audit', icon: <BarChart3 className="w-3.5 h-3.5" /> }
    ]
  }
];

interface ERPLayoutProps {
  activeModule: NavModule;
  onNavigate: (module: NavModule, param?: string) => void;
  selectedLotNumber?: string | null;
  currentUser?: AuthUser | null;
  onLogout?: () => void;
  children: React.ReactNode;
}

export const ERPLayout: React.FC<ERPLayoutProps> = ({
  activeModule,
  onNavigate,
  selectedLotNumber,
  currentUser,
  onLogout,
  children
}) => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isShortcutHelpOpen, setIsShortcutHelpOpen] = useState(false);
  const { isFullscreen, toggleFullscreen } = useFullscreen();

  // Global event listener for keyboard shortcut help window
  React.useEffect(() => {
    const handleOpenHelp = () => setIsShortcutHelpOpen(true);
    window.addEventListener('erp-open-shortcut-help', handleOpenHelp);

    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === '/') {
        e.preventDefault();
        setIsShortcutHelpOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('erp-open-shortcut-help', handleOpenHelp);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const getModuleTitle = (mod: NavModule) => {
    if (mod === 'lot_detail') return `Lot Detail (${selectedLotNumber || 'Overview'})`;
    for (const group of NAV_GROUPS) {
      const found = group.items.find(i => i.id === mod);
      if (found) return found.label;
    }
    return 'SR Tech Garment Software';
  };

  return (
    <div className="h-screen w-screen bg-slate-200 text-slate-800 flex flex-col font-sans antialiased overflow-hidden">
      {/* Top Main Header */}
      <header className="bg-slate-900 text-white h-11 border-b border-slate-800 flex items-center justify-between px-2 sm:px-4 select-none shrink-0 z-40">
        <div className="flex items-center gap-2">
          {/* Mobile Drawer Trigger */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-1 text-slate-300 hover:text-white rounded hover:bg-slate-800 lg:hidden focus:outline-none cursor-pointer"
            aria-label="Toggle Navigation Menu"
          >
            <Menu className="w-4 h-4" />
          </button>

          {/* Desktop Sidebar Toggle */}
          <button
            type="button"
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="p-1 text-slate-300 hover:text-white rounded hover:bg-slate-800 hidden lg:flex items-center justify-center focus:outline-none cursor-pointer"
            title={sidebarCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
          >
            {sidebarCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>

          {/* Brand Logo & Name */}
          <div
            onClick={() => onNavigate('dashboard')}
            className="flex items-center gap-2 cursor-pointer"
          >
            <div className="w-6 h-6 rounded bg-indigo-600 flex items-center justify-center text-white font-bold text-xs border border-indigo-400/40">
              <Building className="w-3.5 h-3.5 text-white" />
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="font-extrabold text-xs tracking-tight text-white uppercase">SR TECH GARMENTS</span>
              <span className="text-[10px] text-slate-400 font-medium hidden sm:inline">| Garment Manufacturing ERP</span>
            </div>
          </div>

          <div className="h-4 w-px bg-slate-700 hidden sm:block mx-1" />

          {/* Active Module Title */}
          <div className="text-xs font-semibold text-slate-200 hidden md:flex items-center gap-1.5">
            <span className="text-indigo-300 bg-indigo-950/80 px-2 py-0.5 rounded border border-indigo-800/80 font-mono text-[11px]">
              {getModuleTitle(activeModule)}
            </span>
          </div>
        </div>

        {/* Right Header Utilities */}
        <div className="flex items-center gap-2 text-xs">
          <div className="hidden sm:flex items-center text-[11px] font-mono bg-slate-800 px-2 py-0.5 rounded border border-slate-700 text-slate-300">
            FY 2026-27
          </div>

          {/* Fullscreen Toggle Button */}
          <button
            type="button"
            onClick={toggleFullscreen}
            className="px-2 py-0.5 text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded transition-colors flex items-center gap-1.5 cursor-pointer text-xs font-semibold border border-slate-700"
            title={isFullscreen ? "Exit Fullscreen Mode" : "Enter Fullscreen Mode"}
          >
            {isFullscreen ? (
              <>
                <Minimize2 className="w-3.5 h-3.5 text-amber-400" />
                <span className="hidden sm:inline text-[11px]">⛶ Exit Fullscreen</span>
              </>
            ) : (
              <>
                <Maximize2 className="w-3.5 h-3.5 text-indigo-400" />
                <span className="hidden sm:inline text-[11px]">⛶ Fullscreen</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={() => onNavigate('reports')}
            className="p-1 text-slate-300 hover:text-white hover:bg-slate-800 rounded transition-colors hidden sm:block cursor-pointer"
            title="Reports & Analytics"
          >
            <FileSpreadsheet className="w-4 h-4" />
          </button>

          <div className="h-4 w-px bg-slate-700 hidden sm:block" />

          <div className="flex items-center gap-1.5 pl-1">
            <div className="w-6 h-6 rounded bg-slate-800 border border-slate-700 text-indigo-300 font-bold text-[10px] flex items-center justify-center">
              {currentUser?.avatarInitials || 'AD'}
            </div>
            <span className="text-xs font-medium text-slate-200 hidden xl:inline">{currentUser?.name || 'Admin User'}</span>
          </div>

          {onLogout && (
            <button
              type="button"
              onClick={onLogout}
              className="ml-1 p-1 text-slate-400 hover:text-rose-300 hover:bg-rose-950/40 rounded transition-all cursor-pointer flex items-center gap-1 text-xs"
              title="Sign Out"
            >
              <LogOut className="w-3.5 h-3.5 text-rose-400" />
              <span className="hidden sm:inline text-[11px]">Logout</span>
            </button>
          )}
        </div>
      </header>

      {/* Desktop Menu Dropdowns */}
      <TopDesktopMenuBar
        onNavigate={onNavigate}
        activeModule={activeModule}
        onLogout={onLogout}
      />

      {/* Main Content Workspace Container */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Desktop Sidebar */}
        <aside
          className={`bg-slate-900 border-r border-slate-800 text-slate-300 transition-all duration-150 hidden lg:flex flex-col select-none shrink-0 ${
            sidebarCollapsed ? 'w-12' : 'w-52'
          }`}
        >
          <div className="flex-1 overflow-y-auto py-2 space-y-3 px-1.5">
            {NAV_GROUPS.map((group) => (
              <div key={group.groupName} className="space-y-0.5">
                {!sidebarCollapsed ? (
                  <h3 className="px-2 text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1 mb-0.5">
                    {group.groupName}
                  </h3>
                ) : (
                  <div className="h-px bg-slate-800 my-1 mx-1" />
                )}

                {group.items.map((item) => {
                  const isActive = activeModule === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => onNavigate(item.id)}
                      title={sidebarCollapsed ? item.label : undefined}
                      className={`w-full flex items-center gap-2 px-2 py-1.5 rounded text-xs font-medium transition-all cursor-pointer ${
                        isActive
                          ? 'bg-indigo-600 text-white font-bold shadow-xs'
                          : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                      } ${sidebarCollapsed ? 'justify-center px-0' : 'justify-start'}`}
                    >
                      <span className={isActive ? 'text-white' : 'text-slate-400'}>{item.icon}</span>
                      {!sidebarCollapsed && <span className="truncate text-[11px]">{item.label}</span>}
                    </button>
                  );
                })}
              </div>
            ))}
          </div>
        </aside>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <div
              className="fixed inset-0 bg-slate-900/60"
              onClick={() => setMobileMenuOpen(false)}
            />
            <div className="fixed inset-y-0 left-0 w-64 bg-slate-900 text-white shadow-xl flex flex-col z-10">
              <div className="p-3 border-b border-slate-800 flex items-center justify-between bg-slate-950">
                <div className="flex items-center gap-2">
                  <Building className="w-4 h-4 text-indigo-400" />
                  <span className="font-bold text-xs">SR TECH GARMENTS</span>
                </div>
                <button
                  type="button"
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-1 text-slate-400 hover:text-white rounded hover:bg-slate-800"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-2 space-y-3">
                {NAV_GROUPS.map((group) => (
                  <div key={group.groupName} className="space-y-1">
                    <h3 className="px-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      {group.groupName}
                    </h3>
                    {group.items.map((item) => {
                      const isActive = activeModule === item.id;
                      return (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => {
                            onNavigate(item.id);
                            setMobileMenuOpen(false);
                          }}
                          className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded text-xs font-medium transition-colors ${
                            isActive
                              ? 'bg-indigo-600 text-white font-bold'
                              : 'text-slate-300 hover:bg-slate-800'
                          }`}
                        >
                          {item.icon}
                          <span className="text-xs">{item.label}</span>
                        </button>
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Main Workspace Content Area */}
        <main className="flex-1 overflow-y-auto bg-slate-100 p-2 sm:p-4 lg:p-5">
          <div className="w-full max-w-[1600px] mx-auto space-y-4">
            {children}
          </div>
        </main>
      </div>

      {/* Desktop Windows-style Bottom Status Bar */}
      <DesktopStatusBar
        activeModule={activeModule}
        currentUser={currentUser}
      />

      {/* Global Keyboard Shortcuts Help Reference Dialog */}
      <KeyboardShortcutsHelp
        isOpen={isShortcutHelpOpen}
        onClose={() => setIsShortcutHelpOpen(false)}
      />
    </div>
  );
};

