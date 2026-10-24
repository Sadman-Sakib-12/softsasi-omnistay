'use client';

import React, { useState } from 'react';
import { Search, ChevronLeft, ChevronRight, Inbox, Filter } from 'lucide-react';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { cn } from '@/lib/utils';

export interface Column<T> {
  header: string;
  accessorKey?: keyof T;
  cell?: (item: T) => React.ReactNode;
  className?: string;
}

interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  isLoading?: boolean;
  searchPlaceholder?: string;
  searchKey?: keyof T;
  onRowClick?: (item: T) => void;
  actions?: React.ReactNode;
  emptyTitle?: string;
  emptySubtitle?: string;
}

export function DataTable<T extends { id?: string | number }>({
  data,
  columns,
  isLoading = false,
  searchPlaceholder = 'Search records...',
  searchKey,
  onRowClick,
  actions,
  emptyTitle = 'No records found',
  emptySubtitle = 'Get started by creating your first entry.',
}: DataTableProps<T>) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedIds, setSelectedIds] = useState<Set<string | number>>(new Set());
  const [page, setPage] = useState(1);
  const pageSize = 10;

  const filteredData = React.useMemo(() => {
    if (!searchTerm || !searchKey) return data;
    return data.filter((item) => {
      const val = item[searchKey];
      if (val === undefined || val === null) return false;
      return String(val).toLowerCase().includes(searchTerm.toLowerCase());
    });
  }, [data, searchTerm, searchKey]);

  const totalPages = Math.max(1, Math.ceil(filteredData.length / pageSize));
  const paginatedData = React.useMemo(() => {
    const start = (page - 1) * pageSize;
    return filteredData.slice(start, start + pageSize);
  }, [filteredData, page, pageSize]);

  const toggleSelectAll = () => {
    if (selectedIds.size === paginatedData.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(paginatedData.map((d) => d.id || Math.random())));
    }
  };

  const toggleSelect = (id: string | number) => {
    const next = new Set(selectedIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedIds(next);
  };

  return (
    <div className="space-y-4">
      {/* Table Toolbar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-3 w-full sm:w-auto">
          {searchKey && (
            <div className="w-full sm:w-72">
              <Input
                placeholder={searchPlaceholder}
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setPage(1);
                }}
                icon={<Search className="w-4 h-4" />}
              />
            </div>
          )}
          {selectedIds.size > 0 && (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-blue-50 border border-blue-200 text-xs text-blue-700">
              <span className="font-medium">{selectedIds.size} selected</span>
              <Button size="sm" variant="ghost" onClick={() => setSelectedIds(new Set())} className="h-6 px-2 text-xs">
                Clear
              </Button>
            </div>
          )}
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          {actions}
        </div>
      </div>

      {/* Table Container - Clean White Card Layout matching PDF Figure 3.1 & 4.1 */}
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-800">
            <thead className="bg-slate-50 text-xs uppercase tracking-wider text-slate-600 font-bold border-b border-slate-200">
              <tr>
                <th className="px-4 py-3.5 w-10">
                  <input
                    type="checkbox"
                    className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                    checked={paginatedData.length > 0 && selectedIds.size === paginatedData.length}
                    onChange={toggleSelectAll}
                  />
                </th>
                {columns.map((col, index) => (
                  <th key={index} className={cn('px-4 py-3.5 font-bold', col.className)}>
                    {col.header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td className="px-4 py-4"><div className="h-4 w-4 bg-slate-200 rounded" /></td>
                    {columns.map((_, j) => (
                      <td key={j} className="px-4 py-4">
                        <div className="h-4 bg-slate-200/70 rounded w-24" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : paginatedData.length === 0 ? (
                <tr>
                  <td colSpan={columns.length + 1} className="py-16 text-center">
                    <div className="flex flex-col items-center justify-center max-w-sm mx-auto">
                      <div className="w-12 h-12 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center mb-3 text-slate-400">
                        <Inbox className="w-6 h-6" />
                      </div>
                      <h4 className="text-sm font-semibold text-slate-800 mb-1">{emptyTitle}</h4>
                      <p className="text-xs text-slate-500">{emptySubtitle}</p>
                    </div>
                  </td>
                </tr>
              ) : (
                paginatedData.map((item, rowIdx) => {
                  const id = item.id || rowIdx;
                  const isSelected = selectedIds.has(id);
                  return (
                    <tr
                      key={id}
                      onClick={() => onRowClick?.(item)}
                      className={cn(
                        'transition-colors hover:bg-slate-50/80 cursor-pointer',
                        isSelected && 'bg-blue-50/40'
                      )}
                    >
                      <td className="px-4 py-3.5 w-10" onClick={(e) => e.stopPropagation()}>
                        <input
                          type="checkbox"
                          className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                          checked={isSelected}
                          onChange={() => toggleSelect(id)}
                        />
                      </td>
                      {columns.map((col, colIdx) => (
                        <td key={colIdx} className={cn('px-4 py-3.5 text-xs text-slate-700', col.className)}>
                          {col.cell ? col.cell(item) : (col.accessorKey ? String(item[col.accessorKey] ?? '—') : '—')}
                        </td>
                      ))}
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="flex items-center justify-between px-4 py-3 border-t border-slate-200 bg-slate-50/70 text-xs text-slate-600">
          <div>
            Showing {filteredData.length === 0 ? 0 : (page - 1) * pageSize + 1} to{' '}
            {Math.min(page * pageSize, filteredData.length)} of {filteredData.length} records
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="bg-white"
            >
              <ChevronLeft className="w-3.5 h-3.5 mr-1" /> Prev
            </Button>
            <span className="text-slate-700 font-semibold px-2">
              Page {page} of {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              className="bg-white"
            >
              Next <ChevronRight className="w-3.5 h-3.5 ml-1" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
