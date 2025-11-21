import React, { HTMLAttributes, memo } from "react";
import { cn } from "@/lib/utils";

export interface Column<T = any> {
  key: string;
  header: string;
  render?: (value: any, row: T) => React.ReactNode;
  sortable?: boolean;
  width?: string;
}

export interface TableProps<T = any> extends HTMLAttributes<HTMLTableElement> {
  columns: Column<T>[];
  data: T[];
  variant?: "default" | "striped" | "bordered";
  hoverable?: boolean;
  loading?: boolean;
  emptyMessage?: string;
  onRowClick?: (row: T) => void;
}

function TableComponent<T extends Record<string, any>>({
  columns,
  data,
  variant = "default",
  hoverable = true,
  loading = false,
  emptyMessage = "No data available",
  onRowClick,
  className,
  ...props
}: TableProps<T>) {
  const baseStyles = "w-full text-left border-collapse";

  const variantStyles = {
    default: "",
    striped: "[&_tbody_tr:nth-child(odd)]:bg-[var(--muted)]",
    bordered: "border border-[var(--border)]",
  };

  if (loading) {
    return (
      <div className="w-full overflow-x-auto rounded-xl border border-[var(--border)] transition-colors duration-300">
        <table className={cn(baseStyles, className)}>
          <thead className="bg-[var(--muted)] transition-colors duration-300">
            <tr>
              {columns.map((col) => (
                <th
                  key={col.key}
                  className="px-6 py-4 text-[13px] font-semibold text-[var(--foreground-secondary)] tracking-wide transition-colors duration-300"
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {[...Array(5)].map((_, idx) => (
              <tr key={idx} className="animate-pulse">
                {columns.map((col) => (
                  <td key={col.key} className="px-6 py-4">
                    <div className="h-4 bg-[var(--muted)] rounded-lg w-3/4 animate-shimmer transition-colors duration-300" />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  return (
    <div className="w-full overflow-x-auto rounded-xl border border-[var(--border)] shadow-lg animate-fade-in transition-colors duration-300">
      <table
        className={cn(baseStyles, variantStyles[variant], className)}
        {...props}
      >
        <thead className="bg-[var(--muted)] border-b-2 border-[var(--border)] transition-colors duration-300">
          <tr>
            {columns.map((col) => (
              <th
                key={col.key}
                style={{ width: col.width }}
                className={cn(
                  "px-6 py-4 text-[13px] font-bold text-[var(--foreground)] tracking-wide uppercase transition-colors duration-300",
                  col.sortable &&
                    "cursor-pointer hover:text-[var(--primary)] transition-colors"
                )}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-[var(--card-background)] divide-y divide-[var(--border)] transition-colors duration-300">
          {data.length === 0 ? (
            <tr>
              <td
                colSpan={columns.length}
                className="px-6 py-12 text-center text-[var(--foreground-secondary)] transition-colors duration-300"
              >
                {emptyMessage}
              </td>
            </tr>
          ) : (
            data.map((row, rowIndex) => (
              <tr
                key={rowIndex}
                onClick={() => onRowClick?.(row)}
                className={cn(
                  "transition-all duration-300",
                  hoverable && "hover:bg-[var(--muted)]",
                  onRowClick &&
                    "cursor-pointer active:scale-[0.98] will-change-transform"
                )}
              >
                {columns.map((col) => (
                  <td
                    key={col.key}
                    className="px-6 py-4 text-[15px] font-medium text-[var(--foreground)] transition-colors duration-300"
                  >
                    {col.render ? col.render(row[col.key], row) : row[col.key]}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

const Table = memo(TableComponent) as typeof TableComponent;

export default Table;
