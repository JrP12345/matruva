"use client";

import React, { useState, useMemo } from "react";
import { cn } from "@/lib/utils";
import Input from "./Input";
import Button from "./Button";
import Checkbox from "./Checkbox";
import Select from "./Select";

export interface DataTableColumn<T = any> {
  key: string;
  header: string;
  cell?: (row: T) => React.ReactNode;
  sortable?: boolean;
  filterable?: boolean;
  width?: string;
}

export interface DataTableAction<T = any> {
  label: string;
  icon?: React.ReactNode;
  onClick: (rows: T[]) => void;
  variant?: "primary" | "secondary" | "danger" | "ghost";
  disabled?: (rows: T[]) => boolean;
}

export interface DataTableRowAction<T = any> {
  label: string;
  icon?: React.ReactNode;
  onClick: (row: T) => void;
  variant?: "primary" | "secondary" | "danger" | "ghost";
  disabled?: (row: T) => boolean;
}

export interface DataTableProps<T = any> {
  columns: DataTableColumn<T>[];
  data: T[];
  actions?: DataTableAction<T>[];
  rowActions?: DataTableRowAction<T>[];
  searchable?: boolean;
  searchPlaceholder?: string;
  selectable?: boolean;
  filterable?: boolean;
  pagination?: boolean;
  pageSize?: number;
  onRowClick?: (row: T) => void;
  loading?: boolean;
  emptyMessage?: string;
  className?: string;
}

const DataTable = <T extends Record<string, any>>({
  columns,
  data,
  actions = [],
  rowActions = [],
  searchable = true,
  searchPlaceholder = "Search...",
  selectable = true,
  filterable = false,
  pagination = true,
  pageSize = 10,
  onRowClick,
  loading = false,
  emptyMessage = "No data available",
  className,
}: DataTableProps<T>) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRows, setSelectedRows] = useState<Set<number>>(new Set());
  const [currentPage, setCurrentPage] = useState(1);
  const [sortConfig, setSortConfig] = useState<{
    key: string;
    direction: "asc" | "desc";
  } | null>(null);
  const [filters, setFilters] = useState<Record<string, string>>({});

  // Filter data based on search
  const filteredData = useMemo(() => {
    let filtered = [...data];

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter((row) =>
        Object.values(row).some((value) =>
          String(value).toLowerCase().includes(searchQuery.toLowerCase())
        )
      );
    }

    // Column filters
    Object.keys(filters).forEach((key) => {
      if (filters[key]) {
        filtered = filtered.filter((row) =>
          String(row[key]).toLowerCase().includes(filters[key].toLowerCase())
        );
      }
    });

    return filtered;
  }, [data, searchQuery, filters]);

  // Sort data
  const sortedData = useMemo(() => {
    if (!sortConfig) return filteredData;

    return [...filteredData].sort((a, b) => {
      const aValue = a[sortConfig.key];
      const bValue = b[sortConfig.key];

      if (aValue < bValue) return sortConfig.direction === "asc" ? -1 : 1;
      if (aValue > bValue) return sortConfig.direction === "asc" ? 1 : -1;
      return 0;
    });
  }, [filteredData, sortConfig]);

  // Paginate data
  const paginatedData = useMemo(() => {
    if (!pagination) return sortedData;
    const start = (currentPage - 1) * pageSize;
    return sortedData.slice(start, start + pageSize);
  }, [sortedData, currentPage, pageSize, pagination]);

  const totalPages = Math.ceil(sortedData.length / pageSize);

  const handleSort = (key: string) => {
    setSortConfig((prev) => {
      if (prev?.key === key) {
        return prev.direction === "asc" ? { key, direction: "desc" } : null;
      }
      return { key, direction: "asc" };
    });
  };

  const handleSelectAll = () => {
    if (selectedRows.size === paginatedData.length) {
      setSelectedRows(new Set());
    } else {
      setSelectedRows(
        new Set(
          paginatedData.map((_, idx) => (currentPage - 1) * pageSize + idx)
        )
      );
    }
  };

  const handleSelectRow = (index: number) => {
    const newSelected = new Set(selectedRows);
    if (newSelected.has(index)) {
      newSelected.delete(index);
    } else {
      newSelected.add(index);
    }
    setSelectedRows(newSelected);
  };

  const getSelectedData = () => {
    return Array.from(selectedRows).map((idx) => data[idx]);
  };

  if (loading) {
    return (
      <div
        className={cn(
          "w-full rounded-xl border border-[var(--border)] transition-colors duration-300",
          className
        )}
      >
        <div className="p-6">
          <div className="animate-pulse space-y-4">
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                className="h-12 bg-[var(--muted)] transition-colors duration-300 rounded-lg animate-shimmer"
              />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("w-full space-y-4", className)}>
      {/* Header with Search and Actions */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex-1 w-full sm:w-auto">
          {searchable && (
            <Input
              placeholder={searchPlaceholder}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="max-w-sm"
              icon={
                <svg
                  className="w-4 h-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              }
            />
          )}
        </div>

        {/* Actions */}
        {actions.length > 0 && selectedRows.size > 0 && (
          <div className="flex gap-2 flex-wrap">
            {actions.map((action, idx) => (
              <Button
                key={idx}
                variant={action.variant || "secondary"}
                size="sm"
                onClick={() => action.onClick(getSelectedData())}
                disabled={action.disabled?.(getSelectedData())}
              >
                {action.icon && <span className="mr-2">{action.icon}</span>}
                {action.label}
                {selectedRows.size > 0 && ` (${selectedRows.size})`}
              </Button>
            ))}
          </div>
        )}
      </div>

      {/* Table */}
      <div className="w-full overflow-x-auto rounded-xl border border-[var(--border)] transition-colors duration-300 shadow-lg">
        <table className="w-full text-left border-collapse">
          <thead className="bg-[var(--muted)] border-b-2 border-[var(--border)] transition-colors duration-300">
            <tr>
              {selectable && (
                <th className="px-6 py-4 w-12">
                  <Checkbox
                    checked={
                      selectedRows.size === paginatedData.length &&
                      paginatedData.length > 0
                    }
                    onChange={handleSelectAll}
                  />
                </th>
              )}
              {columns.map((col) => (
                <th
                  key={col.key}
                  style={{ width: col.width }}
                  className={cn(
                    "px-6 py-4 text-[13px] font-bold text-[var(--foreground)] transition-colors duration-300 tracking-wide uppercase",
                    col.sortable &&
                      "cursor-pointer select-none hover:text-[var(--primary)] transition-colors"
                  )}
                  onClick={() => col.sortable && handleSort(col.key)}
                >
                  <div className="flex items-center gap-2">
                    {col.header}
                    {col.sortable && sortConfig?.key === col.key && (
                      <span className="text-[var(--primary)] transition-colors duration-300">
                        {sortConfig.direction === "asc" ? "↑" : "↓"}
                      </span>
                    )}
                  </div>
                </th>
              ))}
              {rowActions.length > 0 && (
                <th className="px-6 py-4 text-[13px] font-bold text-[var(--foreground)] transition-colors duration-300 tracking-wide uppercase text-right">
                  Actions
                </th>
              )}
            </tr>
          </thead>
          <tbody className="bg-[var(--card-background)] transition-colors duration-300 divide-y divide-[var(--border)]">
            {paginatedData.length === 0 ? (
              <tr>
                <td
                  colSpan={
                    columns.length +
                    (selectable ? 1 : 0) +
                    (rowActions.length > 0 ? 1 : 0)
                  }
                  className="px-6 py-12 text-center text-[var(--foreground-secondary)] transition-colors duration-300"
                >
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              paginatedData.map((row, rowIndex) => {
                const actualIndex = (currentPage - 1) * pageSize + rowIndex;
                const isSelected = selectedRows.has(actualIndex);

                return (
                  <tr
                    key={actualIndex}
                    onClick={() => {
                      if (onRowClick) onRowClick(row);
                      else if (selectable) handleSelectRow(actualIndex);
                    }}
                    className={cn(
                      "transition-all duration-300",
                      "hover:bg-[var(--muted)]",
                      isSelected && "bg-[var(--primary)]/10",
                      (onRowClick || selectable) && "cursor-pointer"
                    )}
                  >
                    {selectable && (
                      <td
                        className="px-6 py-4"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Checkbox
                          checked={isSelected}
                          onChange={() => handleSelectRow(actualIndex)}
                        />
                      </td>
                    )}
                    {columns.map((col) => (
                      <td
                        key={col.key}
                        className="px-6 py-4 text-[15px] font-medium text-[var(--foreground)] transition-colors duration-300"
                      >
                        {col.cell ? col.cell(row) : row[col.key]}
                      </td>
                    ))}
                    {rowActions.length > 0 && (
                      <td
                        className="px-6 py-4"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="flex items-center justify-end gap-2">
                          {rowActions.map((action, actionIdx) => (
                            <Button
                              key={actionIdx}
                              variant={action.variant || "ghost"}
                              size="sm"
                              onClick={() => action.onClick(row)}
                              disabled={action.disabled?.(row)}
                              className="min-w-[32px] h-8 px-2"
                              title={action.label}
                            >
                              {action.icon || action.label}
                            </Button>
                          ))}
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

      {/* Footer with Pagination */}
      {pagination && sortedData.length > 0 && (
        <div className="flex flex-col sm:flex-row gap-4 items-center justify-between text-sm text-[var(--foreground-secondary)] transition-colors duration-300">
          <div>
            Showing{" "}
            {Math.min((currentPage - 1) * pageSize + 1, sortedData.length)} to{" "}
            {Math.min(currentPage * pageSize, sortedData.length)} of{" "}
            {sortedData.length} results
            {selectedRows.size > 0 && ` (${selectedRows.size} selected)`}
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
            >
              Previous
            </Button>
            <div className="flex items-center gap-1">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum;
                if (totalPages <= 5) {
                  pageNum = i + 1;
                } else if (currentPage <= 3) {
                  pageNum = i + 1;
                } else if (currentPage >= totalPages - 2) {
                  pageNum = totalPages - 4 + i;
                } else {
                  pageNum = currentPage - 2 + i;
                }

                return (
                  <Button
                    key={pageNum}
                    variant={currentPage === pageNum ? "primary" : "ghost"}
                    size="sm"
                    onClick={() => setCurrentPage(pageNum)}
                    className="min-w-[40px]"
                  >
                    {pageNum}
                  </Button>
                );
              })}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default DataTable;
