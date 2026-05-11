import React, { useState, useEffect, useMemo } from 'react';
import { 
  Search, X, Download, Eye, CloudUpload, 
  FileSpreadsheet, ChevronLeft, ChevronRight,
  ArrowUpDown, ArrowUp, ArrowDown 
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";

// --- 📍 นำเข้า API Service กลาง ---
import apiService from '../services/apiServices'; // ปรับ path ให้ตรงกับที่เก็บไฟล์ของคุณ

// --- Helper Function: Transform Data ---
const transformApiDataToTableFormat = (apiData) => {
  if (!apiData || typeof apiData !== 'object') return [];
  return Object.values(apiData).map((group) => ({
    id: group.id,
    user: group.user || 'Unknown',
    remark: group.remark || '-',
    date: group.date || '-',
    fileCount: group.file_name || 0,
    sheetCount: group.sheet || 0,
    sumRRow: group.r_row || 0,
    sumWRow: group.w_row || 0,
    diffRow: group.error_row || 0,
    details: Array.isArray(group.value) ? group.value : []
  }));
};

export default function ImportExcelView({ selectedVersion }) {
  const [tableData, setTableData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [outerSearch, setOuterSearch] = useState('');
  const [innerSearch, setInnerSearch] = useState('');
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [viewingBatch, setViewingBatch] = useState(null); 
  const [refreshTrigger, setRefreshTrigger] = useState(0); 
  
  // Sorting & Pagination States
  const [outerSort, setOuterSort] = useState({ key: 'id', direction: 'desc' });
  const [innerSort, setInnerSort] = useState({ key: 'id', direction: 'asc' });
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  // --- 1. Fetch Data ---
  useEffect(() => {
    if (selectedVersion === -1) {
      setTableData([]);
      return;
    }
    const fetchData = async () => {
      setIsLoading(true);
      try {
        // 📍 เรียกใช้ API ผ่าน Service กลาง
        // หมายเหตุ: ใช้ endpoint ที่ตรงกับ /import/show/${selectedVersion} ใน apiService ของคุณ
        // (อ้างอิงจากโครงสร้างก่อนหน้า อาจจะเป็น apiService.upload.getFileInformation)
        const result = await apiService.upload.getFileInformation(selectedVersion);
        
        // Axios interceptor จะส่ง data กลับมาตรงๆ ดังนั้นดึง .data หรือตัวมันเองไปใช้ต่อได้เลย
        const dataToTransform = result?.data || result || {};
        setTableData(transformApiDataToTableFormat(dataToTransform));

      } catch (err) {
        console.error('Fetch Data Error:', err.message);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [selectedVersion, refreshTrigger]);

  // --- 2. Outer Table Logic ---
  const sortedOuterData = useMemo(() => {
    let filtered = tableData.filter(item => 
      item.id.toString().includes(outerSearch) || 
      item.user.toLowerCase().includes(outerSearch.toLowerCase())
    );
    return filtered.sort((a, b) => {
      if (a[outerSort.key] < b[outerSort.key]) return outerSort.direction === 'asc' ? -1 : 1;
      if (a[outerSort.key] > b[outerSort.key]) return outerSort.direction === 'asc' ? 1 : -1;
      return 0;
    });
  }, [tableData, outerSearch, outerSort]);

  // --- 3. Inner Modal Logic (Sort & Paginate 20 items) ---
  const { paginatedData, totalPages, totalItems } = useMemo(() => {
    if (!viewingBatch) return { paginatedData: [], totalPages: 0, totalItems: 0 };

    let filtered = viewingBatch.details.filter(file => 
      file.file_name?.toLowerCase().includes(innerSearch.toLowerCase())
    );

    // Sorting Logic
    if (innerSort.key) {
      filtered.sort((a, b) => {
        const aVal = a[innerSort.key] ?? '';
        const bVal = b[innerSort.key] ?? '';
        if (aVal < bVal) return innerSort.direction === 'asc' ? -1 : 1;
        if (aVal > bVal) return innerSort.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }

    const total = Math.ceil(filtered.length / itemsPerPage);
    const start = (currentPage - 1) * itemsPerPage;
    return {
      paginatedData: filtered.slice(start, start + itemsPerPage),
      totalPages: total,
      totalItems: filtered.length
    };
  }, [viewingBatch, innerSearch, innerSort, currentPage]);

  const requestSort = (target, key) => {
    const setSort = target === 'outer' ? setOuterSort : setInnerSort;
    const currentSort = target === 'outer' ? outerSort : innerSort;
    const direction = currentSort.key === key && currentSort.direction === 'asc' ? 'desc' : 'asc';
    setSort({ key, direction });
    if (target === 'inner') setCurrentPage(1);
  };

  const renderSortIcon = (currentSort, key) => (
    <ArrowUpDown size={12} className={`ml-1 transition-colors ${currentSort.key === key ? 'text-indigo-500' : 'opacity-20'}`} />
  );

  return (
    <div className="bg-white dark:bg-slate-950 rounded-[2.5rem] shadow-sm border border-slate-200 dark:border-slate-800 h-full flex flex-col relative overflow-hidden transition-all">
      
      {/* Main Header */}
      <div className="p-8 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center shrink-0">
        <div className="flex items-center gap-8">
          <h3 className="font-black text-slate-900 dark:text-white text-2xl tracking-tight">Import Workspace</h3>
          <div className="relative w-80">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <Input 
              placeholder="Search ID or User..." value={outerSearch}
              onChange={(e) => setOuterSearch(e.target.value)}
              className="pl-12 h-12 bg-slate-50 dark:bg-slate-900 border-none rounded-2xl font-bold shadow-inner"
            />
          </div>
        </div>
        <Button onClick={() => setIsImportModalOpen(true)} className="bg-indigo-600 hover:bg-indigo-700 text-white font-black rounded-2xl px-6 h-12 gap-2 shadow-xl shadow-indigo-600/20">
          <CloudUpload size={20} /> IMPORT NEW
        </Button>
      </div>

      {/* Main Table Content */}
      <div className="flex-1 overflow-auto custom-scrollbar p-4">
        <Table>
          <TableHeader className="bg-slate-50/50 dark:bg-slate-900/50 sticky top-0 z-10">
            <TableRow className="border-none">
              <TableHead className="cursor-pointer font-black" onClick={() => requestSort('outer', 'id')}>
                <div className="flex items-center">ID {renderSortIcon(outerSort, 'id')}</div>
              </TableHead>
              <TableHead className="font-black">Date</TableHead>
              <TableHead className="font-black">User</TableHead>
              <TableHead className="text-right font-black">Read</TableHead>
              <TableHead className="text-right font-black">Write</TableHead>
              <TableHead className="text-center font-black">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedOuterData.map((row) => (
              <TableRow key={row.id} className="hover:bg-slate-50 dark:hover:bg-slate-900/50 border-none group transition-all">
                <TableCell className="font-bold text-slate-900 dark:text-slate-100">{row.id}</TableCell>
                <TableCell className="text-xs text-slate-500">{new Date(row.date).toLocaleString()}</TableCell>
                <TableCell className="font-bold text-indigo-600">{row.user}</TableCell>
                <TableCell className="text-right font-mono font-bold text-emerald-600">{row.sumRRow?.toLocaleString()}</TableCell>
                <TableCell className="text-right font-mono font-bold text-blue-600">{row.sumWRow?.toLocaleString()}</TableCell>
                <TableCell>
                  <div className="flex justify-center gap-2">
                    <Button variant="ghost" size="icon" onClick={() => { setViewingBatch(row); setCurrentPage(1); }} className="h-10 w-10 bg-slate-100 dark:bg-slate-800 rounded-xl hover:bg-indigo-100 transition-all">
                      <Eye size={20} />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* --- 📍 Batch Detail Modal --- */}
      {viewingBatch && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-[5px] bg-slate-900/60 backdrop-blur-md animate-in fade-in">
          <div className="bg-white dark:bg-slate-950 w-fit max-w-[calc(100vw-10px)] max-h-[94vh] rounded-[3rem] shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 border border-white/20">
            
            {/* Modal Header */}
            <div className="p-8 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center gap-12 shrink-0">
              <div className="flex items-center gap-6">
                <h4 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">ID #{viewingBatch.id} Batch Details</h4>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                  <input 
                    type="text" placeholder="Search file name..." value={innerSearch}
                    onChange={(e) => { setInnerSearch(e.target.value); setCurrentPage(1); }}
                    className="bg-slate-50 dark:bg-slate-800 border-none rounded-2xl py-3 pl-10 pr-6 w-80 text-sm font-bold focus:ring-2 ring-indigo-500/20 outline-none shadow-inner"
                  />
                </div>
              </div>
              <button onClick={() => setViewingBatch(null)} className="p-4 bg-slate-50 dark:bg-slate-800 text-slate-400 hover:text-rose-500 rounded-full transition-all active:scale-90 shadow-sm">
                <X size={24} />
              </button>
            </div>

            {/* Modal Table Content */}
            <div className="flex-1 overflow-auto px-10 py-6 custom-scrollbar bg-white dark:bg-slate-950">
              <table className="w-max min-w-full text-left text-sm border-separate border-spacing-y-3">
                <thead className="sticky top-0 z-20 bg-white/95 dark:bg-slate-950/95 backdrop-blur-sm">
                  <tr className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em]">
                    <th className="px-6 py-4 cursor-pointer hover:text-indigo-600 transition-colors" onClick={() => requestSort('inner', 'file_id')}>
                       <div className="flex items-center">File ID {renderSortIcon(innerSort, 'file_id')}</div>
                    </th>
                    <th className="px-6 py-4 min-w-[300px] cursor-pointer" onClick={() => requestSort('inner', 'file_name')}>
                       <div className="flex items-center">File Name {renderSortIcon(innerSort, 'file_name')}</div>
                    </th>
                    <th className="px-6 py-4 min-w-[200px]">Sheet Name</th>
                    <th className="px-6 py-4 text-right cursor-pointer" onClick={() => requestSort('inner', 'r_row')}>
                       <div className="flex items-center justify-end">Read {renderSortIcon(innerSort, 'r_row')}</div>
                    </th>
                    <th className="px-6 py-4 text-right cursor-pointer" onClick={() => requestSort('inner', 'w_row')}>
                       <div className="flex items-center justify-end">Write {renderSortIcon(innerSort, 'w_row')}</div>
                    </th>
                    <th className="px-6 py-4 text-center">Status</th>
                    <th className="px-6 py-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedData.map((detail, idx) => (
                    <tr key={idx} className="bg-slate-50/50 dark:bg-slate-900/50 hover:bg-indigo-50 dark:hover:bg-indigo-500/5 transition-all group shadow-sm">
                      <td className="py-5 px-6 font-bold text-slate-400 rounded-l-[1.5rem]">{detail.id || detail.file_id || '-'}</td>
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
                        <button className="p-3 text-indigo-500 hover:bg-white dark:hover:bg-slate-800 rounded-xl transition-all shadow-sm active:scale-90">
                          <Download size={18} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination Footer */}
            <div className="p-8 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex items-center justify-between shrink-0">
              <span className="text-sm font-bold text-slate-400">
                Page <span className="text-indigo-600">{currentPage}</span> of {totalPages} ({totalItems} records)
              </span>
              <div className="flex items-center gap-3">
                <Button disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)} variant="outline" className="rounded-2xl px-6 font-black border-slate-200">
                  <ChevronLeft size={18} className="mr-2" /> PREVIOUS
                </Button>
                <div className="flex gap-2">
                  {[...Array(totalPages)].map((_, i) => (
                    <button key={i} onClick={() => setCurrentPage(i + 1)} className={`w-11 h-11 rounded-2xl text-sm font-black transition-all ${currentPage === i + 1 ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200 scale-110' : 'text-slate-400 hover:text-indigo-600 hover:bg-white'}`}>
                      {i + 1}
                    </button>
                  ))}
                </div>
                <Button disabled={currentPage === totalPages} onClick={() => setCurrentPage(p => p + 1)} variant="outline" className="rounded-2xl px-6 font-black border-slate-200">
                  NEXT <ChevronRight size={18} className="ml-2" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}