import React, { useState, useMemo } from 'react';
import { X, Search, Download, ChevronLeft, ChevronRight, ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';
import { Button } from "@/components/ui/button";

export default function BatchDetailModal({ batch, onClose }) {
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState({ key: 'id', direction: 'asc' });
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  const { paginatedData, totalPages, totalItems } = useMemo(() => {
    if (!batch) return { paginatedData: [], totalPages: 0, totalItems: 0 };
    let filtered = batch.details.filter(f => f.file_name?.toLowerCase().includes(search.toLowerCase()));
    
    filtered.sort((a, b) => {
      const aVal = a[sort.key] ?? '';
      const bVal = b[sort.key] ?? '';
      if (aVal < bVal) return sort.direction === 'asc' ? -1 : 1;
      if (aVal > bVal) return sort.direction === 'asc' ? 1 : -1;
      return 0;
    });

    const total = Math.ceil(filtered.length / itemsPerPage);
    const start = (currentPage - 1) * itemsPerPage;
    return { paginatedData: filtered.slice(start, start + itemsPerPage), totalPages: total, totalItems: filtered.length };
  }, [batch, search, sort, currentPage]);

  if (!batch) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-[5px] bg-slate-900/60 backdrop-blur-md animate-in fade-in transition-all">
      <div className="bg-white dark:bg-slate-900 w-fit max-w-[calc(100vw-10px)] max-h-[94vh] rounded-[3rem] shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 border border-white/20">
        
        <div className="p-8 border-b dark:border-slate-800 flex justify-between items-center gap-12 bg-white dark:bg-slate-900 shrink-0">
          <div className="flex items-center gap-6">
            <h4 className="text-2xl font-black text-slate-900 dark:text-white tracking-tighter">ID #{batch.id} Batch Details</h4>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input 
                placeholder="Search file name..." value={search}
                onChange={e => { setSearch(e.target.value); setCurrentPage(1); }}
                className="bg-slate-50 dark:bg-slate-800 border-none rounded-2xl py-3 pl-10 pr-6 w-80 text-sm font-bold focus:ring-2 ring-indigo-500/20 outline-none shadow-inner"
              />
            </div>
          </div>
          <button onClick={onClose} className="p-4 bg-slate-50 dark:bg-slate-800 text-slate-400 hover:text-rose-500 rounded-full transition-all active:scale-90"><X size={24} /></button>
        </div>

        <div className="flex-1 overflow-auto px-10 py-6 custom-scrollbar bg-white dark:bg-slate-900">
          <table className="w-max min-w-full text-left text-sm border-separate border-spacing-y-3">
            <thead className="sticky top-0 z-20 bg-white/95 dark:bg-slate-900/95 backdrop-blur-sm">
              <tr className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em]">
                <th className="px-6 py-4 cursor-pointer" onClick={() => setSort({key:'id', direction: sort.direction==='asc'?'desc':'asc'})}>ID {sort.key === 'id' && (sort.direction === 'asc' ? '↑' : '↓')}</th>
                <th className="px-6 py-4 min-w-[300px] cursor-pointer" onClick={() => setSort({key:'file_name', direction: sort.direction==='asc'?'desc':'asc'})}>File Name {sort.key === 'file_name' && (sort.direction === 'asc' ? '↑' : '↓')}</th>
                <th className="px-6 py-4 min-w-[200px]">Sheet Name</th>
                <th className="px-6 py-4 text-right">Read</th>
                <th className="px-6 py-4 text-right">Write</th>
                <th className="px-6 py-4 text-center">Status</th>
                <th className="px-6 py-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {paginatedData.map((detail, idx) => (
                <tr key={idx} className="bg-slate-50/50 dark:bg-slate-800/30 hover:bg-indigo-50/60 transition-all shadow-sm">
                  <td className="py-5 px-6 font-bold text-slate-400 rounded-l-[1.5rem]">{detail.file_id || detail.id}</td>
                  <td className="py-5 px-6 font-bold text-slate-700 dark:text-slate-200">{detail.file_name}</td>
                  <td className="py-5 px-6 font-medium text-slate-500 italic">{detail.sheet}</td>
                  <td className="py-5 px-6 text-right font-mono text-emerald-600 font-bold">{detail.r_row?.toLocaleString()}</td>
                  <td className="py-5 px-6 text-right font-mono text-blue-600 font-bold">{detail.w_row?.toLocaleString()}</td>
                  <td className="py-5 px-6 text-center">
                    <span className={`px-4 py-1 rounded-full text-[9px] font-black ${detail.status === 4 ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'}`}>
                      {detail.status === 4 ? 'SUCCESS' : 'FAILED'}
                    </span>
                  </td>
                  <td className="py-5 px-6 text-right rounded-r-[1.5rem]">
                    <Button variant="ghost" size="icon" className="text-indigo-500 hover:bg-white active:scale-90 shadow-sm rounded-xl"><Download size={18} /></Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="p-8 border-t dark:border-slate-800 flex justify-between items-center bg-slate-50/50 shrink-0">
          <span className="text-sm font-bold text-slate-400">Page <span className="text-indigo-600">{currentPage}</span> of {totalPages} ({totalItems} records)</span>
          <div className="flex gap-2">
            <Button disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)} variant="outline" className="rounded-2xl px-6 font-black border-slate-200">PREV</Button>
            <Button disabled={currentPage === totalPages} onClick={() => setCurrentPage(p => p + 1)} variant="outline" className="rounded-2xl px-6 font-black border-slate-200">NEXT</Button>
          </div>
        </div>
      </div>
    </div>
  );
}