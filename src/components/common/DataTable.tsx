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
  searchPlaceholder = 'Search records...',
  searchKeys = [],
  onRowClick,
  actions,
  emptyTitle = 'No records found',
  emptyDescription = 'There are no items matching the criteria.',
  primaryAction
}: DataTableProps<T>) {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

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

  const handleSort = (key: string) => {
    if (sortKey === key) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortDirection('asc');
    }
  };

  return (
    <div className="bg-white border border-slate-200 rounded-lg shadow-2xs overflow-hidden">
      {/* Top Search & Filter Bar */}
      <div className="p-4 border-b border-slate-200 bg-slate-50/50 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder={searchPlaceholder}
            className="w-full h-9 pl-9 pr-3 text-xs sm:text-sm text-slate-900 bg-white border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-slate-800 transition-colors"
          />
        </div>

        <div className="text-xs text-slate-500 font-medium self-end sm:self-center">
          Showing <span className="font-bold text-slate-900">{sortedData.length}</span> of <span className="font-bold text-slate-900">{data.length}</span> records
        </div>
      </div>

      {/* Table Container with Horizontal Scrolling */}
      <div className="overflow-x-auto min-w-full">
        <table className="w-full border-collapse text-left text-sm">
          <thead>
            <tr className="bg-slate-100/80 border-b border-slate-200 text-xs font-semibold text-slate-600 uppercase tracking-wider">
              {columns.map((col) => (
                <th
                  key={col.key}
                  style={{ width: col.width }}
                  onClick={() => col.sortable && handleSort(col.key)}
                  className={`py-3 px-4 select-none ${col.sortable ? 'cursor-pointer hover:bg-slate-200/60' : ''} ${
                    col.align === 'right' ? 'text-right' : col.align === 'center' ? 'text-center' : 'text-left'
                  }`}
                >
                  <div className={`inline-flex items-center gap-1 ${col.align === 'right' ? 'justify-end' : col.align === 'center' ? 'justify-center' : 'justify-start'}`}>
                    <span>{col.header}</span>
                    {col.sortable && sortKey === col.key && (
                      sortDirection === 'asc' ? <ChevronUp className="w-3.5 h-3.5 text-slate-700" /> : <ChevronDown className="w-3.5 h-3.5 text-slate-700" />
                    )}
                  </div>
                </th>
              ))}
              {actions && (
                <th className="py-3 px-4 text-right font-semibold text-xs text-slate-600 uppercase tracking-wider w-24">
                  Actions
                </th>
              )}
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-200/90 text-slate-800">
            {sortedData.length === 0 ? (
              <tr>
                <td colSpan={columns.length + (actions ? 1 : 0)} className="py-12 px-4 text-center">
                  <div className="max-w-xs mx-auto">
                    <p className="text-sm font-semibold text-slate-800">{emptyTitle}</p>
                    <p className="text-xs text-slate-500 mt-1">{emptyDescription}</p>
                    {primaryAction && (
                      <button
                        type="button"
                        onClick={primaryAction.onClick}
                        className="mt-3 px-3.5 py-1.5 text-xs font-semibold text-white bg-slate-900 rounded-md hover:bg-slate-800 transition-colors shadow-2xs cursor-pointer"
                      >
                        {primaryAction.label}
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ) : (
              sortedData.map((item: any, idx) => (
                <tr
                  key={item.id || item.lotNumber || idx}
                  onClick={() => onRowClick && onRowClick(item)}
                  className={`hover:bg-slate-50/80 transition-colors ${onRowClick ? 'cursor-pointer' : ''}`}
                >
                  {columns.map((col) => {
                    const value = item[col.key];
                    return (
                      <td
                        key={col.key}
                        className={`py-3.5 px-4 text-xs sm:text-sm whitespace-nowrap text-slate-700 ${
                          col.align === 'right' ? 'text-right font-mono' : col.align === 'center' ? 'text-center' : 'text-left'
                        }`}
                      >
                        {col.accessor ? col.accessor(item) : (
                          col.key.toLowerCase().includes('status') ? (
                            <StatusBadge status={String(value)} />
                          ) : (
                            value !== undefined && value !== null ? String(value) : '-'
                          )
                        )}
                      </td>
                    );
                  })}

                  {actions && (
                    <td
                      className="py-3.5 px-4 text-right whitespace-nowrap text-xs font-medium"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="flex items-center justify-end gap-1">
                        {actions(item)}
                      </div>
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
