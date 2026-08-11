import React, { useState, useRef, useEffect } from 'react';
import { 
  FileText, 
  FolderTree, 
  ShoppingCart, 
  Scissors, 
  Tag, 
  CreditCard, 
  Users, 
  BarChart3, 
  Settings, 
  HelpCircle,
  ChevronDown,
  Building2,
  UserCheck,
  Layers,
  Grid,
  CheckSquare,
  Package,
  IndianRupee,
  LogOut,
  RefreshCw,
  Search,
  Plus,
  Maximize2,
  Minimize2
} from 'lucide-react';
import { NavModule } from './ERPLayout';
import { useFullscreen } from '../../hooks/useFullscreen';

interface TopDesktopMenuBarProps {
  onNavigate: (module: NavModule, param?: string) => void;
  activeModule: NavModule;
  onLogout?: () => void;
}

interface MenuItem {
  id?: NavModule;
  label: string;
  icon?: React.ReactNode;
  shortcut?: string;
  divider?: boolean;
  action?: () => void;
}

interface MenuGroup {
  title: string;
  items: MenuItem[];
}

export const TopDesktopMenuBar: React.FC<TopDesktopMenuBarProps> = ({
  onNavigate,
  activeModule,
  onLogout
}) => {
  const [openGroup, setOpenGroup] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const { isFullscreen, toggleFullscreen } = useFullscreen();

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpenGroup(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleItemClick = (item: MenuItem) => {
    setOpenGroup(null);
    if (item.id) {
      onNavigate(item.id);
    } else if (item.action) {
      item.action();
    }
  };

  const menuGroups: MenuGroup[] = [
    {
      title: 'File',
      items: [
        { id: 'dashboard', label: 'Go to Dashboard', icon: <Layers className="w-3.5 h-3.5" />, shortcut: 'Alt+D' },
        { id: 'all_lots', label: 'All Production Lots', icon: <Grid className="w-3.5 h-3.5" />, shortcut: 'F2' },
        { divider: true, label: '' },
        { label: 'Refresh Data', icon: <RefreshCw className="w-3.5 h-3.5" />, shortcut: 'F5', action: () => window.location.reload() },
        { divider: true, label: '' },
        { label: 'Sign Out', icon: <LogOut className="w-3.5 h-3.5 text-rose-500" />, action: onLogout }
      ]
    },
    {
      title: 'Masters',
      items: [
        { id: 'wholesalers', label: 'Wholesalers Directory', icon: <Building2 className="w-3.5 h-3.5" /> },
        { id: 'tailors', label: 'Tailors Master Roster', icon: <UserCheck className="w-3.5 h-3.5" /> },
        { id: 'employees', label: 'Employees Master Directory', icon: <Users className="w-3.5 h-3.5" /> }
      ]
    },
    {
      title: 'Purchase',
      items: [
        { id: 'purchases', label: 'Fabric Purchase Register', icon: <ShoppingCart className="w-3.5 h-3.5" />, shortcut: 'F3' },
        { id: 'raw_materials', label: 'Raw Material Stock Warehouse', icon: <Layers className="w-3.5 h-3.5" /> }
      ]
    },
    {
      title: 'Production',
      items: [
        { id: 'cutting', label: 'Cutting Operations & Lay Sheet', icon: <Scissors className="w-3.5 h-3.5" />, shortcut: 'F4' },
        { id: 'cut_pieces', label: 'Cut Pieces Inventory', icon: <Grid className="w-3.5 h-3.5" /> },
        { id: 'stitching', label: 'Stitching & Tailor Allocation', icon: <CheckSquare className="w-3.5 h-3.5" /> },
        { id: 'finished_products', label: 'Finished Goods Warehouse', icon: <Package className="w-3.5 h-3.5" /> }
      ]
    },
    {
      title: 'Sales',
      items: [
        { id: 'invoices', label: 'Final Tax Invoices', icon: <FileText className="w-3.5 h-3.5" />, shortcut: 'F6' },
        { id: 'wholesaler_payments', label: 'Wholesaler Payments & Receipts', icon: <CreditCard className="w-3.5 h-3.5" /> }
      ]
    },
    {
      title: 'Accounts',
      items: [
        { id: 'salary', label: 'Salary, Wages & Upaad', icon: <IndianRupee className="w-3.5 h-3.5" /> },
        { id: 'wholesaler_payments', label: 'Party Ledgers & Receipts', icon: <CreditCard className="w-3.5 h-3.5" /> }
      ]
    },
    {
      title: 'Reports',
      items: [
        { id: 'reports', label: 'Financial & Operational Reports', icon: <BarChart3 className="w-3.5 h-3.5" />, shortcut: 'F7' },
        { id: 'all_lots', label: 'Lot Audit Trail Master', icon: <Grid className="w-3.5 h-3.5" /> }
      ]
    },
    {
      title: 'Utilities',
      items: [
        { 
          label: 'Keyboard Shortcuts Reference', 
          icon: <HelpCircle className="w-3.5 h-3.5 text-amber-400" />, 
          shortcut: 'Ctrl+/', 
          action: () => window.dispatchEvent(new CustomEvent('erp-open-shortcut-help')) 
        },
        { 
          label: isFullscreen ? 'Exit Fullscreen' : 'Fullscreen', 
          icon: isFullscreen ? <Minimize2 className="w-3.5 h-3.5 text-indigo-400" /> : <Maximize2 className="w-3.5 h-3.5 text-indigo-400" />, 
          action: toggleFullscreen 
        },
        { divider: true, label: '' },
        { label: 'Reload System Memory', icon: <RefreshCw className="w-3.5 h-3.5" />, shortcut: 'F5', action: () => window.location.reload() },
        { label: 'Print Screen View', icon: <FileText className="w-3.5 h-3.5" />, shortcut: 'Ctrl+P', action: () => window.print() }
      ]
    }
  ];

  return (
    <div ref={menuRef} className="bg-slate-950 text-slate-200 border-b border-slate-800 text-[11px] font-medium flex items-center justify-between px-1 py-0.5 select-none relative z-30">
      <div className="flex items-center gap-0.5">
        {menuGroups.map((group) => {
          const isOpen = openGroup === group.title;
          return (
            <div key={group.title} className="relative">
              <button
                type="button"
                onClick={() => setOpenGroup(isOpen ? null : group.title)}
                onMouseEnter={() => {
                  if (openGroup && openGroup !== group.title) {
                    setOpenGroup(group.title);
                  }
                }}
                className={`px-2.5 py-1 rounded hover:bg-slate-800 text-slate-200 cursor-pointer transition-colors inline-flex items-center gap-1 ${
                  isOpen ? 'bg-slate-800 font-bold text-white' : ''
                }`}
              >
                <span>{group.title}</span>
              </button>

              {/* Dropdown Menu */}
              {isOpen && (
                <div className="absolute left-0 top-full mt-0.5 w-56 bg-slate-900 border border-slate-700 shadow-2xl rounded-sm py-1 z-50 text-slate-200">
                  {group.items.map((item, idx) => {
                    if (item.divider) {
                      return <div key={idx} className="h-px bg-slate-800 my-1" />;
                    }

                    const isActive = activeModule === item.id;

                    return (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => handleItemClick(item)}
                        className={`w-full text-left px-3 py-1.5 flex items-center justify-between text-xs hover:bg-indigo-600 hover:text-white transition-colors cursor-pointer ${
                          isActive ? 'bg-indigo-950 text-indigo-300 font-bold' : ''
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          {item.icon}
                          <span>{item.label}</span>
                        </div>
                        {item.shortcut && (
                          <span className="text-[10px] font-mono text-amber-300 bg-slate-800 px-1 rounded border border-slate-700">
                            {item.shortcut}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="flex items-center gap-1.5 mr-1">
        <button
          type="button"
          onClick={toggleFullscreen}
          className="px-2 py-0.5 text-[11px] font-semibold text-indigo-300 bg-slate-900 hover:bg-slate-800 border border-indigo-500/30 rounded flex items-center gap-1.5 cursor-pointer transition-colors"
          title={isFullscreen ? "Exit Fullscreen Mode" : "Enter Fullscreen Mode"}
        >
          {isFullscreen ? (
            <>
              <Minimize2 className="w-3.5 h-3.5 text-indigo-400" />
              <span className="hidden sm:inline">⛶ Exit Fullscreen</span>
            </>
          ) : (
            <>
              <Maximize2 className="w-3.5 h-3.5 text-indigo-400" />
              <span className="hidden sm:inline">⛶ Fullscreen</span>
            </>
          )}
        </button>

        {/* Quick Shortcut Help Launcher Button */}
        <button
          type="button"
          onClick={() => window.dispatchEvent(new CustomEvent('erp-open-shortcut-help'))}
          className="px-2 py-0.5 text-[11px] font-semibold text-amber-300 bg-slate-900 hover:bg-slate-800 border border-amber-500/30 rounded flex items-center gap-1.5 cursor-pointer transition-colors"
          title="View ERP Speed Keys (Ctrl+/)"
        >
          <HelpCircle className="w-3.5 h-3.5 text-amber-400" />
          <span className="hidden sm:inline">Shortcuts</span>
          <kbd className="px-1 py-0.2 bg-slate-800 text-[10px] text-amber-200 rounded font-mono border border-slate-700">Ctrl+/</kbd>
        </button>
      </div>
    </div>
  );
};
