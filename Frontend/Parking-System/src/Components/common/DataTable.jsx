import { memo } from 'react';

// Memoized row — only re-renders when its data changes
const TableRow = memo(function TableRow({ row, columns }) {
  return (
    <tr className="hover:bg-slate-50/60 dark:hover:bg-slate-800/60 transition-colors duration-100">
      {columns.map((col) => (
        <td
          key={col.key}
          className="px-4 py-3.5 text-[13px] text-slate-700 dark:text-slate-300 whitespace-nowrap first:pl-5 last:pr-5"
        >
          {col.render ? col.render(row) : (row[col.key] ?? <span className="text-slate-300">—</span>)}
        </td>
      ))}
    </tr>
  );
});

export default function DataTable({ columns, data, loading, emptyMessage = 'No records found', emptyIcon }) {
  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="flex flex-col items-center gap-3">
          <div className="w-7 h-7 border-[2.5px] border-blue-100 dark:border-blue-500/20 border-t-blue-600 rounded-full animate-spin" />
          <span className="text-[13px] text-slate-400 dark:text-slate-500 font-medium">Loading...</span>
        </div>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-3">
        <div className="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-300">
          {emptyIcon || (
            <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
            </svg>
          )}
        </div>
        <div className="text-center">
          <p className="text-[13px] font-semibold text-slate-600 dark:text-slate-400">{emptyMessage}</p>
          <p className="text-[12px] text-slate-400 dark:text-slate-500 mt-0.5">Try adjusting your filters or add a new record.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto -mx-px">
      <table className="min-w-full">
        <thead>
          <tr className="border-b border-slate-100 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/60">
            {columns.map((col) => (
              <th
                key={col.key}
                className="px-4 py-3 text-left text-[11px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider whitespace-nowrap first:pl-5 last:pr-5"
              >
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-50 dark:divide-slate-800/60">
          {data.map((row) => (
            // Always use stable _id — never fall back to array index
            <TableRow key={row._id} row={row} columns={columns} />
          ))}
        </tbody>
      </table>
    </div>
  );
}
