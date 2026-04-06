"use client"

/**
 * data-table.tsx
 * WAT:    Compact herbruikbare tabel component
 * WAAROM: Consistente data weergave in alle modules
 */

import { cn } from "@/lib/utils"

export interface Column<T> {
  key: string
  label: string
  render?: (item: T) => React.ReactNode
  align?: "left" | "right" | "center"
  width?: string
}

interface DataTableProps<T> {
  columns: Column<T>[]
  data: T[]
  onRowClick?: (item: T) => void
  emptyMessage?: string
}

export function DataTable<T = Record<string, unknown>>({
  columns,
  data,
  onRowClick,
  emptyMessage = "No data found",
}: DataTableProps<T>) {
  return (
    <div className="overflow-x-auto">
      <table className="table-compact">
        <thead>
          <tr>
            {columns.map((col) => (
              <th
                key={col.key}
                className={cn(col.align === "right" && "text-right", col.align === "center" && "text-center")}
                style={col.width ? { width: col.width } : undefined}
              >
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="py-8 text-center text-surface-400">
                {emptyMessage}
              </td>
            </tr>
          ) : (
            data.map((item, idx) => (
              <tr
                key={idx}
                onClick={() => onRowClick?.(item)}
                className={cn(onRowClick && "cursor-pointer")}
              >
                {columns.map((col) => (
                  <td
                    key={col.key}
                    className={cn(col.align === "right" && "text-right", col.align === "center" && "text-center")}
                  >
                    {col.render ? col.render(item) : ((item as any)[col.key] as React.ReactNode)}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  )
}
