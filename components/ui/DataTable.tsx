'use client';
import { type ReactNode } from 'react';

export interface Column<T> {
  key: string;
  header: ReactNode;
  render: (row: T) => ReactNode;
  className?: string;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  rows: T[];
  rowKey: (row: T) => string;
  emptyMessage?: string;
  loading?: boolean;
}

export function DataTable<T>({
  columns,
  rows,
  rowKey,
  emptyMessage = 'No records found',
  loading,
}: DataTableProps<T>): React.ReactElement {
  if (loading) {
    return (
      <div className="glass-card p-1">
        <div className="space-y-2 p-4">
          {[0, 1, 2, 3, 4].map((i) => (
            <div key={i} className="h-10 bg-white/5 rounded-lg animate-pulse" />
          ))}
        </div>
      </div>
    );
  }
  if (rows.length === 0) {
    return (
      <div className="glass-card p-12 text-center text-white/60 text-sm">
        {emptyMessage}
      </div>
    );
  }
  return (
    <div className="glass-card overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/10 bg-white/5">
              {columns.map((c) => (
                <th
                  key={c.key}
                  scope="col"
                  className={`text-left px-4 py-3 font-medium text-white/70 ${c.className ?? ''}`}
                >
                  {c.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr
                key={rowKey(row)}
                className="border-b border-white/5 last:border-0 hover:bg-white/5 transition-colors"
              >
                {columns.map((c) => (
                  <td key={c.key} className={`px-4 py-3 ${c.className ?? ''}`}>
                    {c.render(row)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
