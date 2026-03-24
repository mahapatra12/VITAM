import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Download, ChevronLeft, ChevronRight, Filter, ChevronDown, ChevronUp } from 'lucide-react';

export default function AdvancedDataGrid({ title, subtitle, columns, data, searchable = true, exportable = true }) {
  const [query, setQuery] = useState('');
  const [sortCol, setSortCol] = useState(null);
  const [sortAsc, setSortAsc] = useState(true);
  const [page, setPage] = useState(0);
  const rowsPerPage = 7;

  // Search
  const filtered = data.filter(row => 
    Object.values(row).some(val => 
      String(val).toLowerCase().includes(query.toLowerCase())
    )
  );

  // Sort
  const sorted = [...filtered].sort((a, b) => {
    if (!sortCol) return 0;
    const aVal = a[sortCol];
    const bVal = b[sortCol];
    if (typeof aVal === 'number' && typeof bVal === 'number') {
      return sortAsc ? aVal - bVal : bVal - aVal;
    }
    return sortAsc ? String(aVal).localeCompare(String(bVal)) : String(bVal).localeCompare(String(aVal));
  });

  // Paginate
  const maxPage = Math.max(0, Math.ceil(sorted.length / rowsPerPage) - 1);
  const paginated = sorted.slice(page * rowsPerPage, (page + 1) * rowsPerPage);

  const handleSort = (key) => {
    if (sortCol === key) {
      setSortAsc(!sortAsc);
    } else {
      setSortCol(key);
      setSortAsc(true);
    }
  };

  const exportCSV = () => {
    if (!data.length) return;
    const keys = columns.map(c => c.key);
    const headers = columns.map(c => c.label).join(',');
    const csvContent = [
      headers,
      ...sorted.map(row => keys.map(k => `"${String(row[k] || '').replace(/"/g, '""')}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${title.replace(/\s+/g, '_').toLowerCase()}_report.csv`;
    link.click();
  };

  return (
    <div className="bg-slate-900/40 backdrop-blur-3xl border border-white/5 rounded-[32px] shadow-2xl overflow-hidden flex flex-col w-full">
      {/* Header controls */}
      <div className="p-6 border-b border-white/5 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h3 className="text-xl font-black text-white">{title}</h3>
          {subtitle && <p className="text-xs text-slate-400 mt-1">{subtitle}</p>}
        </div>
        
        <div className="flex items-center gap-3">
          {searchable && (
             <div className="relative">
               <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
               <input 
                 value={query}
                 onChange={(e) => { setQuery(e.target.value); setPage(0); }}
                 placeholder="Search registry..."
                 className="bg-slate-800/50 border border-slate-700 text-white pl-10 pr-4 py-2 rounded-xl text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none w-full lg:w-64 transition-all"
               />
             </div>
          )}
          {exportable && (
            <button onClick={exportCSV} className="flex items-center gap-2 px-4 py-2 bg-slate-800 text-white text-sm font-bold rounded-xl border border-slate-700 hover:bg-slate-700 hover:text-blue-400 transition-all flex-shrink-0">
              <Download size={14} />
              <span className="hidden sm:inline">Export CSV</span>
            </button>
          )}
        </div>
      </div>

      {/* Table grid */}
      <div className="overflow-x-auto w-full">
        <table className="w-full text-left border-collapse min-w-[600px]">
          <thead>
            <tr className="bg-slate-800/30 border-b border-white/5 text-[10px] uppercase font-black tracking-widest text-slate-400">
              {columns.map(col => (
                <th key={col.key} onClick={() => handleSort(col.key)} className="px-6 py-4 cursor-pointer hover:bg-slate-800/50 transition-colors group">
                  <div className="flex items-center gap-2">
                    {col.label}
                    {sortCol === col.key && (
                      <span className="text-blue-400">{sortAsc ? <ChevronUp size={12}/> : <ChevronDown size={12}/>}</span>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            <AnimatePresence>
              {paginated.length > 0 ? paginated.map((row, i) => (
                <motion.tr 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  key={row.id || i}
                  className="border-b border-white/5 hover:bg-white/5 transition-colors group"
                >
                  {columns.map(col => (
                    <td key={col.key} className="px-6 py-4 whitespace-nowrap">
                      {col.render ? col.render(row[col.key], row) : (
                        <span className="text-sm font-medium text-slate-300 group-hover:text-white transition-colors">{row[col.key]}</span>
                      )}
                    </td>
                  ))}
                </motion.tr>
              )) : (
                <tr>
                  <td colSpan={columns.length} className="px-6 py-12 text-center text-slate-500 text-sm font-medium">
                    No records found matching your current filters.
                  </td>
                </tr>
              )}
            </AnimatePresence>
          </tbody>
        </table>
      </div>

      {/* Footer / Pagination */}
      <div className="p-4 border-t border-white/5 flex items-center justify-between bg-slate-800/20">
        <p className="text-xs text-slate-500 font-medium">
          Showing {sorted.length === 0 ? 0 : page * rowsPerPage + 1} to {Math.min((page + 1) * rowsPerPage, sorted.length)} of {sorted.length} entries
        </p>
        <div className="flex items-center gap-2">
          <button 
            disabled={page === 0} 
            onClick={() => setPage(p => p - 1)}
            className="w-8 h-8 rounded-lg flex items-center justify-center bg-slate-800 border border-slate-700 text-white disabled:opacity-30 hover:bg-slate-700 transition-all"
          >
            <ChevronLeft size={16} />
          </button>
          <span className="text-xs font-bold text-slate-400 w-10 text-center">
            {sorted.length > 0 ? page + 1 : 0} / {maxPage + 1}
          </span>
          <button 
            disabled={page >= maxPage} 
            onClick={() => setPage(p => p + 1)}
            className="w-8 h-8 rounded-lg flex items-center justify-center bg-slate-800 border border-slate-700 text-white disabled:opacity-30 hover:bg-slate-700 transition-all"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
