import React, { useState } from 'react';
import { Search, ChevronDown, ChevronUp, Eye } from 'lucide-react';
import { StatusBadge } from './StatusBadge';

export interface Column<T> {
  key: string;
  header: string;
  accessor?: (item: T) => React.ReactNode;
  sortable?: boolean;
  align?: 'left' | 'center' | 'right';
  width?: string;
}

interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  searchPlaceholder?: string;
  searchKeys?: string[];
  onRowClick?: (item: T) => void;
  onRowDelete?: (item: T) => void;
  actions?: (item: T) => React.ReactNode;
  emptyTitle?: string;
  emptyDescription?: string;
  primaryAction?: {
    label: string;
    onClick: () => void;
  };
}

export function DataTable<T extends { id?: string; lotNumber?: string }>({
  data,
  columns,
  searchPlaceholder = 'Search records (F2)...',
  searchKeys = [],
  onRowClick,
  onRowDelete,
  actions,
  emptyTitle = 'No records found',
  emptyDescription = 'There are no items matching the criteria.',
  primaryAction
}: DataTableProps<T>) {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [selectedRowIndex, setSelectedRowIndex] = useState<number | null>(0);

  // Filter
  const filteredData = data.filter((item: any) => {
    if (!searchTerm.trim()) return true;
    const query = searchTerm.toLowerCase();

    if (searchKeys.length > 0) {
      return searchKeys.some((key) => {
        const val = item[key];
        return val && String(val).toLowerCase().includes(query);
      });
    }

    return Object.values(item).some((val) =>
      val && String(val).toLowerCase().includes(query)
    );
  });

  // Sort
  const sortedData = [...filteredData].sort((a: any, b: any) => {
    if (!sortKey) return 0;
    const valA = a[sortKey];
    const valB = b[sortKey];

    if (valA === undefined || valB === undefined) return 0;

    let comparison = 0;
    if (typeof valA === 'number' && typeof valB === 'number') {
      comparison = valA - valB;
    } else {
      comparison = String(valA).localeCompare(String(valB));
    }

    return sortDirection === 'asc' ? comparison : -comparison;
  });

  // Reset or adjust row selection when sortedData changes
  React.useEffect(() => {
    if (sortedData.length === 0) {
      setSelectedRowIndex(null);
    } else if (selectedRowIndex === null || selectedRowIndex >= sortedData.length) {
      setSelectedRowIndex(0);
    }
  }, [sortedData.length]);

  // Global arrow key navigation for table when focus is not inside form input
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const activeEl = document.activeElement;
      const isInput = activeEl && (
        activeEl.tagName === 'INPUT' ||
        activeEl.tagName === 'TEXTAREA' ||
        activeEl.tagName === 'SELECT'
      );

      // If user is typing in a non-search text input, do not hijack arrows unless search bar
      if (isInput && activeEl?.getAttribute('type') !== 'text') {
        return;
      }

      if (sortedData.length === 0) return;

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedRowIndex((prev) => (prev === null ? 0 : Math.min(prev + 1, sortedData.length - 1)));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedRowIndex((prev) => (prev === null ? 0 : Math.max(prev - 1, 0)));
      } else if (e.key === 'Enter' && !isInput && selectedRowIndex !== null && sortedData[selectedRowIndex]) {
        if (onRowClick) {
          e.preventDefault();
          onRowClick(sortedData[selectedRowIndex]);
        }
      } else if (e.key === 'Delete' && !isInput && selectedRowIndex !== null && sortedData[selectedRowIndex]) {
        if (onRowDelete) {
          e.preventDefault();
          onRowDelete(sortedData[selectedRowIndex]);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [sortedData, selectedRowIndex, onRowClick, onRowDelete]);

  const handleSort = (key: string) => {
    if (sortKey === key) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortDirection('asc');
    }
  };

  return (
    <div className="bg-white border border-slate-300 rounded shadow-2xs overflow-hidden">
      {/* Top Search & Filter Bar */}
      <div className="p-2 sm:p-2.5 border-b border-slate-300 bg-slate-50 flex flex-col sm:flex-row items-center justify-between gap-2">
        <div className="relative w-full sm:w-72">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder={searchPlaceholder}
            className="w-full h-8 pl-8 pr-3 text-xs text-slate-900 bg-white border border-slate-300 rounded focus:outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 transition-colors"
          />
        </div>

        <div className="text-[11px] text-slate-600 font-mono self-end sm:self-center">
          Records: <span className="font-bold text-slate-900">{sortedData.length}</span> / <span className="font-bold text-slate-700">{data.length}</span>
        </div>
      </div>

      {/* Table Container with Horizontal Scrolling */}
      <div className="overflow-x-auto min-w-full">
        <table className="w-full border-collapse text-left text-xs">
          <thead>
            <tr className="bg-slate-200/90 border-b border-slate-300 text-[11px] font-bold text-slate-800 uppercase tracking-wide">
              {columns.map((col) => (
                <th
                  key={col.key}
                  style={{ width: col.width }}
                  onClick={() => col.sortable && handleSort(col.key)}
                  className={`py-2 px-3 select-none border-r border-slate-300/70 last:border-r-0 ${
                    col.sortable ? 'cursor-pointer hover:bg-slate-300/80' : ''
                  } ${
                    col.align === 'right' ? 'text-right' : col.align === 'center' ? 'text-center' : 'text-left'
                  }`}
                >
                  <div className={`inline-flex items-center gap-1 ${col.align === 'right' ? 'justify-end' : col.align === 'center' ? 'justify-center' : 'justify-start'}`}>
                    <span>{col.header}</span>
                    {col.sortable && sortKey === col.key && (
                      sortDirection === 'asc' ? <ChevronUp className="w-3 h-3 text-slate-800" /> : <ChevronDown className="w-3 h-3 text-slate-800" />
                    )}
                  </div>
                </th>
              ))}
              {actions && (
                <th className="py-2 px-3 text-right font-bold text-[11px] text-slate-800 uppercase tracking-wide w-24">
                  Actions
                </th>
              )}
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-200 text-slate-800">
            {sortedData.length === 0 ? (
              <tr>
                <td colSpan={columns.length + (actions ? 1 : 0)} className="py-8 px-4 text-center">
                  <div className="max-w-xs mx-auto">
                    <p className="text-xs font-semibold text-slate-700">{emptyTitle}</p>
                    <p className="text-[11px] text-slate-500 mt-0.5">{emptyDescription}</p>
                    {primaryAction && (
                      <button
                        type="button"
                        onClick={primaryAction.onClick}
                        className="mt-2.5 px-3 py-1 text-xs font-bold text-white bg-slate-900 rounded hover:bg-indigo-700 transition-colors shadow-2xs cursor-pointer"
                      >
                        {primaryAction.label}
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ) : (
              sortedData.map((item: any, idx) => {
                const isSelected = selectedRowIndex === idx;
                return (
                  <tr
                    key={item.id || item.lotNumber || idx}
                    onClick={() => {
                      setSelectedRowIndex(idx);
                      if (onRowClick) onRowClick(item);
                    }}
                    className={`transition-colors ${
                      isSelected
                        ? 'bg-indigo-100/90 text-indigo-950 font-medium border-l-4 border-l-indigo-600 shadow-2xs'
                        : 'even:bg-slate-50/70 hover:bg-indigo-50/60 text-slate-800'
                    } ${
                      onRowClick ? 'cursor-pointer' : ''
                    }`}
                  >
                    {columns.map((col) => {
                      const value = item[col.key];
                      return (
                        <td
                          key={col.key}
                          className={`py-2 px-3 text-xs whitespace-nowrap border-r border-slate-200/60 last:border-r-0 ${
                            col.align === 'right' ? 'text-right font-mono' : col.align === 'center' ? 'text-center' : 'text-left'
                          }`}
                        >
                          {col.accessor ? col.accessor(item) : (
                            col.key.toLowerCase().includes('status') ? (
                              <StatusBadge status={String(value)} size="sm" />
                            ) : (
                              value !== undefined && value !== null ? String(value) : '-'
                            )
                          )}
                        </td>
                      );
                    })}

                    {actions && (
                      <td
                        className="py-1.5 px-3 text-right whitespace-nowrap text-xs font-medium"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="flex items-center justify-end gap-1">
                          {actions(item)}
                        </div>
                      </td>
                    )}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
