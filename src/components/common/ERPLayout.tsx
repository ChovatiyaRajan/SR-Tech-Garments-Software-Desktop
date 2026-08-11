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
  LogOut
} from 'lucide-react';
import { AuthUser } from '../../services/auth';

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
      { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard className="w-4 h-4" /> },
      { id: 'all_lots', label: 'All Lots & Progress', icon: <Layers className="w-4 h-4" /> }
    ]
  },
  {
    groupName: 'MASTERS',
    items: [
      { id: 'wholesalers', label: 'Wholesalers', icon: <Building2 className="w-4 h-4" /> },
      { id: 'tailors', label: 'Tailors', icon: <UserCheck className="w-4 h-4" /> },
      { id: 'employees', label: 'Employees', icon: <Users className="w-4 h-4" /> }
    ]
  },
  {
    groupName: 'PURCHASE',
    items: [
      { id: 'purchases', label: 'Purchases', icon: <ShoppingCart className="w-4 h-4" /> },
      { id: 'raw_materials', label: 'Raw Material', icon: <Layers className="w-4 h-4" /> }
    ]
  },
  {
    groupName: 'PRODUCTION',
    items: [
      { id: 'cutting', label: 'Cutting', icon: <Scissors className="w-4 h-4" /> },
      { id: 'cut_pieces', label: 'Cut Pieces', icon: <Grid className="w-4 h-4" /> },
      { id: 'stitching', label: 'Stitching', icon: <CheckSquare className="w-4 h-4" /> },
      { id: 'finished_products', label: 'Finished Products', icon: <Package className="w-4 h-4" /> }
    ]
  },
  {
    groupName: 'ACCOUNTS',
    items: [
      { id: 'salary', label: 'Salary & Upaad', icon: <IndianRupee className="w-4 h-4" /> },
      { id: 'invoices', label: 'Final Invoices', icon: <FileText className="w-4 h-4" /> },
      { id: 'wholesaler_payments', label: 'Wholesaler Payments', icon: <CreditCard className="w-4 h-4" /> }
    ]
  },
  {
    groupName: 'REPORTS',
    items: [
      { id: 'reports', label: 'Reports', icon: <BarChart3 className="w-4 h-4" /> }
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

  const getModuleTitle = (mod: NavModule) => {
    if (mod === 'lot_detail') return `Lot Detail (${selectedLotNumber || 'Overview'})`;
    for (const group of NAV_GROUPS) {
      const found = group.items.find(i => i.id === mod);
      if (found) return found.label;
    }
    return 'SR Tech Garment Software';
  };

  return (
    <div className="min-h-screen bg-slate-100 text-slate-800 flex flex-col font-sans antialiased">
      {/* Top Header */}
      <header className="bg-slate-900 text-white h-14 border-b border-slate-800 sticky top-0 z-40 flex items-center justify-between px-3 sm:px-5 shadow-sm select-none">
        <div className="flex items-center gap-3">
          {/* Mobile Drawer Trigger */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-1.5 text-slate-300 hover:text-white rounded-md hover:bg-slate-800 lg:hidden focus:outline-none transition-colors cursor-pointer"
            aria-label="Toggle Navigation Menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          {/* Desktop Sidebar Toggle */}
          <button
            type="button"
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="p-1.5 text-slate-300 hover:text-white rounded-md hover:bg-slate-800 hidden lg:flex items-center justify-center focus:outline-none transition-colors cursor-pointer"
            title={sidebarCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
          >
            {sidebarCollapsed ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
          </button>

          {/* Brand Logo & Name */}
          <div
            onClick={() => onNavigate('dashboard')}
            className="flex items-center gap-2 cursor-pointer group"
          >
            <div className="w-8 h-8 rounded bg-gradient-to-br from-indigo-500 to-slate-800 flex items-center justify-center text-white font-bold text-sm shadow-xs border border-indigo-400/30">
              <Building className="w-4 h-4 text-indigo-200" />
            </div>
            <div className="hidden sm:block">
              <span className="font-bold text-sm tracking-tight text-white block leading-tight">SR TECH GARMENTS</span>
              <span className="text-[10px] text-slate-400 font-medium tracking-wide uppercase block leading-none">Garment Software Suite</span>
            </div>
          </div>

          <div className="h-5 w-px bg-slate-700 hidden sm:block mx-2" />

          {/* Active Location / Breadcrumb */}
          <div className="text-xs font-semibold text-slate-200 hidden md:flex items-center gap-1.5">
            <span className="text-slate-400">SR Tech</span>
            <span className="text-slate-600">/</span>
            <span className="text-indigo-300">{getModuleTitle(activeModule)}</span>
          </div>
        </div>

        {/* Right Header Utilities */}
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="hidden sm:flex items-center text-xs font-mono bg-slate-800/80 px-2.5 py-1 rounded border border-slate-700 text-slate-300">
            FY 2026-27
          </div>

          <button
            type="button"
            onClick={() => onNavigate('reports')}
            className="p-1.5 text-slate-300 hover:text-white hover:bg-slate-800 rounded transition-colors hidden sm:block cursor-pointer"
            title="Reports & Analytics"
          >
            <FileSpreadsheet className="w-4 h-4" />
          </button>

          <div className="h-4 w-px bg-slate-700 hidden sm:block" />

          <div className="flex items-center gap-2 pl-1">
            <div className="w-7 h-7 rounded-full bg-indigo-900/80 border border-indigo-700/80 text-indigo-200 font-bold text-xs flex items-center justify-center shadow-2xs">
              {currentUser?.avatarInitials || 'AD'}
            </div>
            <div className="hidden xl:block text-left leading-tight">
              <span className="text-xs font-semibold text-slate-200 block">{currentUser?.name || 'Admin User'}</span>
              <span className="text-[10px] text-slate-400 block font-mono">{currentUser?.role || 'Super Admin'}</span>
            </div>
          </div>

          {onLogout && (
            <button
              type="button"
              onClick={onLogout}
              className="ml-1.5 p-1.5 text-slate-400 hover:text-rose-300 hover:bg-rose-950/40 border border-transparent hover:border-rose-800/60 rounded-lg transition-all cursor-pointer flex items-center gap-1 text-xs font-medium"
              title="Sign Out of Application"
            >
              <LogOut className="w-4 h-4 text-rose-400" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          )}
        </div>
      </header>

      {/* Main ERP Layout Container */}
      <div className="flex-1 flex overflow-hidden">
        {/* Desktop Sidebar */}
        <aside
          className={`bg-slate-900 border-r border-slate-800 text-slate-300 transition-all duration-200 hidden lg:flex flex-col select-none shrink-0 ${
            sidebarCollapsed ? 'w-16' : 'w-60'
          }`}
        >
          <div className="flex-1 overflow-y-auto py-3 space-y-4 px-2">
            {NAV_GROUPS.map((group) => (
              <div key={group.groupName} className="space-y-1">
                {!sidebarCollapsed ? (
                  <h3 className="px-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                    {group.groupName}
                  </h3>
                ) : (
                  <div className="h-px bg-slate-800 my-2 mx-1" />
                )}

                {group.items.map((item) => {
                  const isActive = activeModule === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => onNavigate(item.id)}
                      title={sidebarCollapsed ? item.label : undefined}
                      className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-md text-xs font-medium transition-all cursor-pointer ${
                        isActive
                          ? 'bg-indigo-600 text-white font-semibold shadow-xs'
                          : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
                      } ${sidebarCollapsed ? 'justify-center px-0' : 'justify-start'}`}
                    >
                      <span className={isActive ? 'text-white' : 'text-slate-400'}>{item.icon}</span>
                      {!sidebarCollapsed && <span className="truncate">{item.label}</span>}
                    </button>
                  );
                })}
              </div>
            ))}
          </div>

          {/* Sidebar Footer */}
          <div className="p-3 border-t border-slate-800 text-[11px] text-slate-400 bg-slate-950/40 space-y-2">
            {!sidebarCollapsed ? (
              <>
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-300">System Status</span>
                  <span className="inline-flex items-center gap-1 text-emerald-400 font-semibold text-[10px]">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    Online
                  </span>
                </div>
                {onLogout && (
                  <button
                    type="button"
                    onClick={onLogout}
                    className="w-full py-1.5 px-2 bg-slate-800/80 hover:bg-rose-950/40 hover:text-rose-300 border border-slate-700/80 hover:border-rose-800/60 rounded-md text-xs font-semibold transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <LogOut className="w-3.5 h-3.5 text-rose-400" />
                    <span>Sign Out</span>
                  </button>
                )}
              </>
            ) : (
              <div className="flex flex-col items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-emerald-400 mx-auto" title="System Online" />
                {onLogout && (
                  <button
                    type="button"
                    onClick={onLogout}
                    className="p-1.5 text-rose-400 hover:bg-rose-950/40 rounded transition-colors cursor-pointer"
                    title="Sign Out"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                )}
              </div>
            )}
          </div>
        </aside>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <div
              className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs"
              onClick={() => setMobileMenuOpen(false)}
            />
            <div className="fixed inset-y-0 left-0 w-72 bg-slate-900 text-white shadow-xl flex flex-col z-10">
              <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950">
                <div className="flex items-center gap-2">
                  <Building className="w-5 h-5 text-indigo-400" />
                  <span className="font-bold text-sm">SR TECH GARMENTS NAVIGATION</span>
                </div>
                <button
                  type="button"
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-1 text-slate-400 hover:text-white rounded hover:bg-slate-800"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-3 space-y-4">
                {NAV_GROUPS.map((group) => (
                  <div key={group.groupName} className="space-y-1">
                    <h3 className="px-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
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
                          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-xs font-medium transition-colors ${
                            isActive
                              ? 'bg-indigo-600 text-white font-semibold'
                              : 'text-slate-300 hover:bg-slate-800'
                          }`}
                        >
                          {item.icon}
                          <span>{item.label}</span>
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
        <main className="flex-1 overflow-y-auto bg-slate-100 p-3 sm:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto space-y-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};
