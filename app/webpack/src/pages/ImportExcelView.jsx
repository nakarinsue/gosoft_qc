import React, { useState, useEffect, useMemo } from 'react';
import { 
  FileSpreadsheet, AlertCircle, ArrowUpDown, ArrowUp, ArrowDown, 
  CloudUpload, Download, Eye, X, Search 
} from 'lucide-react';
import ImportFileModal from '../components/import/ImportFileModal'; 

const transformApiDataToTableFormat = (apiData) => {
  if (!apiData || typeof apiData !== 'object') return [];
  return Object.values(apiData).map((group, index) => ({
    id: group.id,
    user: group.user || 'Unknown',
    remark: group.remark||'-',
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
  const [error, setError] = useState(null);
  const [outerSearch, setOuterSearch] = useState('');
  const [innerSearch, setInnerSearch] = useState('');
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [viewingBatch, setViewingBatch] = useState(null); 
  const [refreshTrigger, setRefreshTrigger] = useState(0); 
  const [sortConfig, setSortConfig] = useState({ key: 'id', direction: 'desc' });

  useEffect(() => {
    if (selectedVersion === -1) {
      setTableData([]);
      return;
    }
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const token = localStorage.getItem('access_token');
        const response = await fetch(`/V2/import/show/${selectedVersion}`, {
            method: 'GET',
            headers: { 'Accept': 'application/json',
                       'Authorization': `Bearer ${token}`
             }
        });
        if (!response.ok) throw new Error(`Server status: ${response.status}`);
        const result = await response.json();
        if (result.success && result.data) {
          setTableData(transformApiDataToTableFormat(result.data));
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [selectedVersion, refreshTrigger]);

  const filteredOuterData = useMemo(() => {
    return tableData.filter(item => 
      item.id.toString().includes(outerSearch) || 
      item.user.toLowerCase().includes(outerSearch.toLowerCase())
    );
  }, [tableData, outerSearch]);

  const filteredInnerData = useMemo(() => {
    if (!viewingBatch) return [];
    return viewingBatch.details.filter(file => 
      file.file_name.toLowerCase().includes(innerSearch.toLowerCase())
    );
  }, [viewingBatch, innerSearch]);

  const sortedData = useMemo(() => {
    let sortableItems = [...filteredOuterData];
    if (sortConfig.key) {
      sortableItems.sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) return sortConfig.direction === 'asc' ? -1 : 1;
        if (a[sortConfig.key] > b[sortConfig.key]) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }
    return sortableItems;
  }, [filteredOuterData, sortConfig]);

  // 📍 ปรับปรุง: ฟังก์ชัน handleExport
  const handleExport = async (e, fileId = 0, versionId = 0) => {
    e.stopPropagation();
    try {
      const token = localStorage.getItem('access_token'); // ดึง Token
      const payload = {
        version_id: [versionId],
        file_id: [fileId]
      };

      const response = await fetch('/V2/export/promotion-detail', { // ใช้ endpoint ตามที่คุณระบุ
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` // แนบ Auth Header
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Export failed with status: ${response.status}`);
      }

      // จัดการ Blob และสร้างไฟล์ดาวน์โหลด
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url; 
      a.download = `Export_File_${fileId}.xlsx`; 
      document.body.appendChild(a); 
      a.click(); 
      a.remove();
      window.URL.revokeObjectURL(url);

    } catch (err) { 
      alert(`Export Error: ${err.message}`); 
    }
  }

  if (selectedVersion === -1) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-slate-400">
        <FileSpreadsheet size={64} className="mb-4 opacity-20" />
        <p className="font-bold">กรุณาเลือก Version เพื่อดูข้อมูล</p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-slate-950 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden h-full flex flex-col relative animate-in fade-in">
      
      {/* --- Toolbar --- */}
      <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-white dark:bg-slate-950">
        <div className="flex items-center gap-4">
          <h3 className="font-black text-slate-800 dark:text-white text-xl">Import Workspace</h3>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input 
              type="text" placeholder="Search ID or User..." value={outerSearch}
              onChange={(e) => setOuterSearch(e.target.value)}
              className="bg-slate-50 dark:bg-slate-900 border-none rounded-xl py-2 pl-10 pr-4 w-60 text-sm font-bold outline-none ring-2 ring-transparent focus:ring-indigo-500/20 transition-all"
            />
          </div>
        </div>
        <button 
          onClick={() => setIsImportModalOpen(true)}
          className="px-6 py-3 bg-indigo-600 text-white font-black rounded-2xl hover:bg-indigo-700 flex items-center gap-2 shadow-lg shadow-indigo-600/20 active:scale-95 transition-all"
        >
          <CloudUpload size={20} /> IMPORT NEW
        </button>
      </div>

      {/* --- Table --- */}
      <div className="flex-1 overflow-auto custom-scrollbar">
        <table className="w-full text-left">
          <thead className="sticky top-0 z-10 bg-slate-50/80 dark:bg-slate-900/80 backdrop-blur-md text-[10px] font-black uppercase text-slate-400 tracking-widest border-b dark:border-slate-800">
            <tr>
              <th className="p-4 cursor-pointer" onClick={() => setSortConfig({key:'id', direction: sortConfig.direction==='asc'?'desc':'asc'})}>ID</th>
              <th className="p-4">Date</th>
              <th className="p-4">User</th>
              <th className="p-4">ENV.</th>
              <th className="p-4 text-center">Files</th>
              <th className="p-4 text-center">sheet</th>
              <th className="p-4 text-right">Read sheet excel</th>
              <th className="p-4 text-right">write Database</th>
              <th className="p-4 text-center">Diff</th>
              <th className="p-4 text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50 dark:divide-slate-900">
            {sortedData.map((row) => (
              <tr key={row.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/50 transition-colors">
                <td className="p-4 font-bold text-slate-900 dark:text-white">{row.id}</td>
                <td className="p-4 text-slate-500 text-[11px] font-medium">{new Date(row.date).toLocaleString()}</td>
                <td className="p-4 font-bold text-indigo-600">{row.user}</td>
                <td className="p-4 font-bold text-indigo-600">{row.remark}</td>
                <td className="p-4 text-center font-bold">{row.fileCount}</td>
                <td className="p-4 text-center font-bold">{row.sheetCount}</td>
                <td className="p-4 text-right font-mono text-emerald-600 font-bold">{row.sumRRow.toLocaleString()}</td>
                <td className="p-4 text-right font-mono text-blue-600 font-bold">{row.sumWRow.toLocaleString()}</td>
                <td className="p-4 text-center">
                  <span className={`px-2 py-1 rounded-lg text-[10px] font-black ${row.diffRow === 0 ? 'bg-slate-100 text-slate-500' : 'bg-rose-100 text-rose-600'}`}>
                    {row.diffRow}
                  </span>
                </td>
                <td className="p-4 text-center">
                  <div className="flex justify-center gap-2">
                    <button onClick={() => { setInnerSearch(''); setViewingBatch(row); }} className="p-2 bg-slate-100 dark:bg-slate-800 text-slate-600 hover:bg-indigo-100 hover:text-indigo-600 rounded-xl transition-all"><Eye size={18} /></button>
                    {/* 📍 ปรับปรุง: แก้ไข Argument ในการส่งข้อมูล */}
                    <button onClick={(e) => handleExport(e,0, row.id)} className="p-2 bg-slate-100 dark:bg-slate-800 text-slate-600 hover:bg-emerald-100 hover:text-emerald-600 rounded-xl transition-all"><Download size={18} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* --- Detail Popup (ลูกตา) --- */}
      {viewingBatch && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 w-full max-w-5xl max-h-[85vh] rounded-[2.5rem] shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95">
            <div className="p-8 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
              <div className="flex items-center gap-6">
                <div>
                  <h4 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">ID #{viewingBatch.id} Batch Details</h4>
                </div>
                <div className="relative group">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                  <input 
                    type="text" placeholder="Search file name..." value={innerSearch}
                    onChange={(e) => setInnerSearch(e.target.value)}
                    className="bg-slate-50 dark:bg-slate-800 border-none rounded-xl py-2 pl-10 pr-4 w-64 text-sm font-bold outline-none focus:ring-2 ring-indigo-500/20 transition-all"
                  />
                </div>
              </div>
              <button onClick={() => setViewingBatch(null)} className="p-3 bg-slate-50 dark:bg-slate-800 text-slate-400 hover:text-rose-500 rounded-full transition-all"><X size={24} /></button>
            </div>
            <div className="flex-1 overflow-auto px-8 pb-8 pt-0 custom-scrollbar">
              <table className="w-full table-fixed text-left text-sm border-separate border-spacing-y-2">
                <thead className="sticky top-0 z-20 bg-white/95 dark:bg-slate-900/95 backdrop-blur-sm">
                  <tr className="text-[10px] font-black uppercase text-slate-400 tracking-widest">
                    <th className="px-4 py-4 w-[10%] border-b border-slate-100 dark:border-slate-800">File Id.</th>
                    <th className="px-4 py-4 w-[22%] border-b border-slate-100 dark:border-slate-800">File Name</th>
                    <th className="px-4 py-4 w-[18%] border-b border-slate-100 dark:border-slate-800">Sheet Name</th>
                    <th className="px-4 py-4 w-[8%] text-right border-b border-slate-100 dark:border-slate-800">Read</th>
                    <th className="px-4 py-4 w-[8%] text-right border-b border-slate-100 dark:border-slate-800">write</th>
                    <th className="px-4 py-4 w-[10%] text-center border-b border-slate-100 dark:border-slate-800">Status</th>
                    <th className="px-4 py-4 w-[18%] text-center border-b border-slate-100 dark:border-slate-800">Remark</th>
                    <th className="px-4 py-4 w-[18%] text-center border-b border-slate-100 dark:border-slate-800">description</th>
                    <th className="px-4 py-4 w-[6%] text-right border-b border-slate-100 dark:border-slate-800">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredInnerData.map((detail, idx) => {
                    const isSuccess = detail.status === 4;

                    return (
                      <tr key={idx} className="bg-slate-50/50 dark:bg-slate-800/30 rounded-2xl overflow-hidden hover:bg-indigo-50/50 dark:hover:bg-indigo-900/20 transition-colors">
                        
                        <td className="py-4 px-4 font-bold text-slate-500 dark:text-slate-400 truncate rounded-l-2xl" title={detail.id || detail.file_id}>
                          {detail.id || detail.file_id || '-'} 
                        </td>

                        <td className="py-4 px-4 font-bold text-slate-700 dark:text-slate-200 truncate" title={detail.file_name}>
                          {detail.file_name || '-'}
                        </td>
                        
                        <td className="py-4 px-4 font-medium text-slate-500 dark:text-slate-400 truncate" title={detail.sheet}>
                          {detail.sheet || '-'}
                        </td>

                        <td className="py-4 px-4 text-right font-mono text-emerald-600 font-bold">
                          {detail.r_row?.toLocaleString() || '0'}
                        </td>
                        
                        <td className="py-4 px-4 text-right font-mono text-blue-600 font-bold">
                          {detail.w_row?.toLocaleString() || '0'}
                        </td>
                        
                        <td className="py-4 px-4 text-center">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${
                            isSuccess ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'
                          }`}>
                            {isSuccess ? 'SUCCESS' : 'FAILED'}
                          </span>
                        </td>

                        <td className="py-4 px-4 text-xs text-slate-500 dark:text-slate-400 truncate text-center" title={detail.remark}>
                          {detail.remark || '-'}
                        </td>
                       <td className="py-4 px-4 text-xs text-slate-500 dark:text-slate-400 truncate text-center" title={detail.Remark}>
                          {detail.Remark || '-'}
                        </td>
                        <td className="py-4 px-4 text-right rounded-r-2xl">
                          {/* 📍 ปรับปรุง: แก้ไข Argument ในการส่งข้อมูลระดับ Sheet */}
                          <button 
                            onClick={(e) => isSuccess && handleExport(e, detail.id || detail.file_id ||0)} 
                            className={`p-2 transition-all ${
                              isSuccess 
                              ? 'text-slate-400 hover:text-emerald-500 cursor-pointer active:scale-90' 
                              : 'text-slate-200 dark:text-slate-700 cursor-not-allowed opacity-50'
                            }`}
                            disabled={!isSuccess}
                            title={isSuccess ? 'Download File' : 'Cannot download: status is not success'}
                          >
                            <Download size={18} />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      <ImportFileModal isOpen={isImportModalOpen} onClose={() => setIsImportModalOpen(false)} onSuccess={() => setRefreshTrigger(prev => prev + 1)} />
    </div>
  );
}