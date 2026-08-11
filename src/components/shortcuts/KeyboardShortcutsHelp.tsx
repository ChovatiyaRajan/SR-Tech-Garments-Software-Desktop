import React, { useState } from 'react';
import { X, Keyboard, Search, Sparkles } from 'lucide-react';
import { SHORTCUT_REGISTRY, ShortcutDefinition } from '../../constants/keyboardShortcuts';

interface KeyboardShortcutsHelpProps {
  isOpen: boolean;
  onClose: () => void;
}

export const KeyboardShortcutsHelp: React.FC<KeyboardShortcutsHelpProps> = ({
  isOpen,
  onClose
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('ALL');

  if (!isOpen) return null;

  const categories = ['ALL', 'Global Functions', 'Navigation', 'Data Entry & Forms', 'Table Navigation'];

  const filteredShortcuts = SHORTCUT_REGISTRY.filter(item => {
    const matchesCategory = activeCategory === 'ALL' || item.category === activeCategory;
    const matchesSearch = !searchTerm || 
      item.displayKey.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.category.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="min-h-screen px-4 text-center flex items-center justify-center">
        {/* Backdrop */}
        <div
          className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs transition-opacity"
          onClick={onClose}
        />

        {/* Modal Window */}
        <div className="inline-block w-full max-w-2xl my-6 text-left align-middle bg-white rounded shadow-2xl transform transition-all relative z-10 border border-slate-700 overflow-hidden">
          {/* Header Bar */}
          <div className="px-4 py-3 border-b border-slate-800 bg-slate-900 text-white flex items-center justify-between select-none">
            <div className="flex items-center gap-2.5">
              <div className="p-1.5 rounded bg-indigo-600 text-white">
                <Keyboard className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold uppercase tracking-wider text-slate-100 flex items-center gap-2">
                  KEYBOARD SHORTCUTS REFERENCE
                  <span className="text-[10px] bg-indigo-950 text-indigo-300 font-mono px-2 py-0.5 rounded border border-indigo-800">TALLY / MARG ERP SPEED KEYS</span>
                </h3>
                <p className="text-[11px] text-slate-400 font-normal">Operate the SR Tech Garment ERP effortlessly without touching your mouse</p>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="p-1 text-slate-300 hover:text-white rounded hover:bg-slate-800 focus:outline-none transition-colors cursor-pointer"
              title="Close Reference (Esc)"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Search & Category Tabs */}
          <div className="p-3 border-b border-slate-200 bg-slate-50 flex flex-col sm:flex-row items-center justify-between gap-2.5">
            <div className="relative w-full sm:w-64">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search shortcut key or action..."
                className="w-full h-8 pl-8 pr-3 text-xs text-slate-900 bg-white border border-slate-300 rounded focus:outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600"
                autoFocus
              />
            </div>

            <div className="flex items-center gap-1 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
              {categories.map(cat => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setActiveCategory(cat)}
                  className={`px-2 py-1 text-[11px] font-semibold rounded whitespace-nowrap transition-colors ${
                    activeCategory === cat
                      ? 'bg-slate-900 text-white'
                      : 'text-slate-600 hover:bg-slate-200 bg-slate-100'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Body Content */}
          <div className="p-4 max-h-[60vh] overflow-y-auto space-y-3 bg-slate-50/40">
            {filteredShortcuts.length === 0 ? (
              <div className="text-center py-8 text-slate-500 text-xs">
                No matching shortcuts found for &quot;{searchTerm}&quot;.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {filteredShortcuts.map((item, idx) => (
                  <div
                    key={idx}
                    className="p-2.5 bg-white border border-slate-200 rounded flex items-center justify-between gap-2 shadow-2xs hover:border-indigo-300 transition-colors"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="text-xs font-semibold text-slate-900 truncate">
                        {item.description}
                      </div>
                      <div className="text-[10px] font-mono text-slate-500 uppercase mt-0.5">
                        {item.category}
                      </div>
                    </div>

                    <kbd className="shrink-0 px-2.5 py-1 bg-slate-900 text-amber-300 font-mono text-xs font-bold rounded border border-slate-700 shadow-2xs">
                      {item.displayKey}
                    </kbd>
                  </div>
                ))}
              </div>
            )}

            <div className="mt-4 p-3 rounded bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-start gap-2">
              <Sparkles className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold">Pro Tip:</span> Press <kbd className="px-1.5 py-0.5 bg-amber-200 rounded text-amber-900 font-mono font-bold">Tab</kbd> and <kbd className="px-1.5 py-0.5 bg-amber-200 rounded text-amber-900 font-mono font-bold">Enter</kbd> to jump between fields seamlessly during rapid data entry. Press <kbd className="px-1.5 py-0.5 bg-amber-200 rounded text-amber-900 font-mono font-bold">F9</kbd> or <kbd className="px-1.5 py-0.5 bg-amber-200 rounded text-amber-900 font-mono font-bold">Ctrl+S</kbd> anytime inside a form to submit directly.
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="px-4 py-2.5 border-t border-slate-300 bg-slate-100 flex items-center justify-between">
            <span className="text-[11px] text-slate-500 font-mono">
              Press <kbd className="px-1 py-0.5 bg-slate-200 rounded font-bold">Esc</kbd> anytime to close
            </span>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-1.5 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded transition-colors"
            >
              Close Reference
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
