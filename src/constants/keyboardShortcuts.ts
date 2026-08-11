export interface ShortcutDefinition {
  key: string;            // Standardized key name e.g. "F2", "F3", "F4", "F5", "F6", "F7", "F8", "F9", "Escape", "s", "f", "p", "r", "h", "l", "/", "Enter"
  ctrl?: boolean;
  alt?: boolean;
  shift?: boolean;
  displayKey: string;     // E.g. "F2", "Ctrl + S", "Alt + H", "Ctrl + /"
  description: string;
  category: 'Global Functions' | 'Navigation' | 'Data Entry & Forms' | 'Table Navigation';
  scope?: string;         // 'global' | 'form' | 'table' | module name
}

export const SHORTCUT_REGISTRY: ShortcutDefinition[] = [
  // Global Function Keys
  { key: 'F2', displayKey: 'F2', description: 'Focus Search / Find Records', category: 'Global Functions', scope: 'global' },
  { key: 'F3', displayKey: 'F3', description: 'New Record / Add Item (Context-aware)', category: 'Global Functions', scope: 'global' },
  { key: 'F4', displayKey: 'F4', description: 'Edit Selected Record', category: 'Global Functions', scope: 'global' },
  { key: 'F5', displayKey: 'F5', description: 'Refresh Data / Reload View', category: 'Global Functions', scope: 'global' },
  { key: 'F6', displayKey: 'F6', description: 'Record Payment / Settlement', category: 'Global Functions', scope: 'global' },
  { key: 'F7', displayKey: 'F7', description: 'Print Document / Report / Invoice', category: 'Global Functions', scope: 'global' },
  { key: 'F8', displayKey: 'F8', description: 'Delete Selected Record', category: 'Global Functions', scope: 'global' },
  { key: 'F9', displayKey: 'F9', description: 'Save / Submit Active Form', category: 'Global Functions', scope: 'global' },
  { key: 'Escape', displayKey: 'Esc', description: 'Close Dialog / Drawer / Cancel Operation', category: 'Global Functions', scope: 'global' },

  // System & Command Shortcuts
  { key: 's', ctrl: true, displayKey: 'Ctrl + S', description: 'Save Current Form', category: 'Data Entry & Forms', scope: 'form' },
  { key: 'f', ctrl: true, displayKey: 'Ctrl + F', description: 'Focus Search Input', category: 'Global Functions', scope: 'global' },
  { key: 'p', ctrl: true, displayKey: 'Ctrl + P', description: 'Print Current Page / Document', category: 'Global Functions', scope: 'global' },
  { key: 'r', ctrl: true, displayKey: 'Ctrl + R', description: 'Refresh Current Page Safely', category: 'Global Functions', scope: 'global' },
  { key: '/', ctrl: true, displayKey: 'Ctrl + /', description: 'Toggle Keyboard Shortcuts Help', category: 'Global Functions', scope: 'global' },

  // Navigation Shortcuts
  { key: 'h', alt: true, displayKey: 'Alt + H', description: 'Go to Dashboard / Home', category: 'Navigation', scope: 'global' },
  { key: 'l', alt: true, displayKey: 'Alt + L', description: 'Sign Out / Logout', category: 'Navigation', scope: 'global' },
  { key: 'ArrowLeft', alt: true, displayKey: 'Alt + ←', description: 'Navigate Back', category: 'Navigation', scope: 'global' },
  { key: 'ArrowRight', alt: true, displayKey: 'Alt + →', description: 'Navigate Forward', category: 'Navigation', scope: 'global' },

  // Data Entry & Forms
  { key: 'Tab', displayKey: 'Tab', description: 'Move to Next Input Field', category: 'Data Entry & Forms', scope: 'form' },
  { key: 'Tab', shift: true, displayKey: 'Shift + Tab', description: 'Move to Previous Input Field', category: 'Data Entry & Forms', scope: 'form' },
  { key: 'Enter', displayKey: 'Enter', description: 'Move to Next Field / Confirm Action', category: 'Data Entry & Forms', scope: 'form' },
  { key: 'Enter', ctrl: true, displayKey: 'Ctrl + Enter', description: 'Add Size Row (In Cutting Lay Sheet Form)', category: 'Data Entry & Forms', scope: 'form' },

  // Table Navigation
  { key: 'ArrowUp', displayKey: '↑ (Up)', description: 'Select Previous Table Row', category: 'Table Navigation', scope: 'table' },
  { key: 'ArrowDown', displayKey: '↓ (Down)', description: 'Select Next Table Row', category: 'Table Navigation', scope: 'table' },
  { key: 'Enter', displayKey: 'Enter', description: 'Open Selected Table Record Detail', category: 'Table Navigation', scope: 'table' },
  { key: 'Delete', displayKey: 'Delete', description: 'Delete Selected Table Record', category: 'Table Navigation', scope: 'table' }
];

export const MODULE_SHORTCUT_HINTS: Record<string, { newLabel?: string; primaryShortcut?: string; secondaryShortcut?: string }> = {
  dashboard: { newLabel: 'F3: New Action', primaryShortcut: 'F3', secondaryShortcut: 'F2' },
  wholesalers: { newLabel: 'F3: Add Wholesaler', primaryShortcut: 'F3', secondaryShortcut: 'F2' },
  purchases: { newLabel: 'F3: Record Purchase', primaryShortcut: 'F3', secondaryShortcut: 'F2' },
  raw_materials: { newLabel: 'F3: Issue to Cutting', primaryShortcut: 'F3', secondaryShortcut: 'F2' },
  cutting: { newLabel: 'F3: New Cutting Entry', primaryShortcut: 'F3', secondaryShortcut: 'F2' },
  cut_pieces: { newLabel: 'F3: Assign Cut Pieces', primaryShortcut: 'F3', secondaryShortcut: 'F2' },
  tailors: { newLabel: 'F3: Add Tailor Master', primaryShortcut: 'F3', secondaryShortcut: 'F2' },
  stitching: { newLabel: 'F3: Record Stitching', primaryShortcut: 'F3', secondaryShortcut: 'F2' },
  finished_products: { newLabel: 'F3: Dispatch to Staff', primaryShortcut: 'F3', secondaryShortcut: 'F2' },
  invoices: { newLabel: 'F3: Generate Invoice', primaryShortcut: 'F3', secondaryShortcut: 'F2' },
  wholesaler_payments: { newLabel: 'F3: Record Payment', primaryShortcut: 'F3', secondaryShortcut: 'F6' },
  employees: { newLabel: 'F3: Add Employee', primaryShortcut: 'F3', secondaryShortcut: 'F2' },
  salary: { newLabel: 'F3: Issue Upaad', primaryShortcut: 'F3', secondaryShortcut: 'F2' },
  reports: { newLabel: 'F7: Print Report', primaryShortcut: 'F7', secondaryShortcut: 'F2' }
};
