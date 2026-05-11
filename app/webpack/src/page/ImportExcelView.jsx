import React, { useState, useEffect, useMemo } from 'react';
import { 
  FileSpreadsheet, CloudUpload, Download, Eye, X, Activity, Layers, Check, FileText
} from 'lucide-react';
import ImportFileModal from '../components/import/ImportFileModal'; 

// 📍 นำเข้า API Service กลาง
import apiService from '../services/apiServices'; 

// 📍 นำเข้าตารางกลาง
import EnterpriseDataTable from '../components/EnterpriseDataTable';

const transformApiDataToTableFormat = (apiData) => {
  const dataArray = Array.isArray(apiData) ? apiData : (apiData && typeof apiData === 'object' ? Object.values(apiData) : []);
  return dataArray.map((group, index) => {
    const readRow = group.read_row || group.r_row || 0; 
    const writeRow = group.ww_row || 0;
    return {
      no:index+1,
      id: group.version_id , // ใช้ version_id เป็น ID หลัก
      user: group.title || '-', 
      remark: group.description || '-',
      date: group.date || new Date().toISOString(), // 💡 API ไม่มี date ส่งมา จึงใส่ Fallback ไว้
      fileCount: group.file_name || 0, // ตาม API: file_name เก็บค่าตัวเลข
      sheetCount: group.sheet || 0,
      sumRRow: group.r_row || 0,
      sumWRow: writeRow,
      diffRow: readRow - writeRow, // ✅ แก้ไข Bug ตัวแปรแล้ว
      details: Array.isArray(group.data) ? group.data.map(detail => ({
        ...detail,
        file_id: detail.id,
        Remark: detail.description || '-', // นำ description มาแสดงในช่อง Description
        remark: detail.name || detail.user_mk || '-' // นำ name/user_mk มาแสดงในช่อง Remark
      })) : []
    };
  });
};

export default function ImportExcelView({ selectedVersion }) {
  const [tableData, setTableData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [viewingBatch, setViewingBatch] = useState(null); 
  const [refreshTrigger, setRefreshTrigger] = useState(0); 

  useEffect(() => {
    if (selectedVersion === -1) {
      setTableData([]);
      return;
    }
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        // 📍 เรียกใช้ API ผ่าน Service กลาง
        // ใช้ endpoint สำหรับดึงข้อมูล Import (เช่น apiService.upload.getFileInformation)
        const result = await apiService.upload.getFileInformation(selectedVersion);
        
        const dataToTransform = result?.data || result || {};
        setTableData(transformApiDataToTableFormat(dataToTransform));

      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [selectedVersion, refreshTrigger]);

  const handleExport = async (e, fileId = null, versionId = null) => {
    e.stopPropagation();
    try {
      setIsLoading(true);
      // 1. เรียก API ของเรา
      const response = await apiService.upload.getexportfileexcel(versionId, fileId);
      const url = window.URL.createObjectURL(response);
      const link = document.createElement('a');
      link.href = url;
      link.download = `Promotion.xlsx`; 
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      
    } catch (error) {
      console.error("Download failed:", error);
      alert("ไม่สามารถดาวน์โหลดไฟล์ได้");
    }finally {
        setIsLoading(false);
      }
  }

  // -------------------------------------------------------------
  // 📍 1. โครงสร้างคอลัมน์ตารางหลัก (Main Table)
  // -------------------------------------------------------------
  const mainColumns = useMemo(() => [
    { field: "id", header: "No.", style: { width: '8%' }, body: (r) => <span className="font-bold text-slate-900">{r.no}</span> },
    { field: "date", header: "ID", style: { width: '8%' }, body: (r) => <span className="ont-bold text-slate-900">{r.id}</span> },
    { field: "user", header: "VERSION", style: { width: '15%' }, body: (r) => <span className="font-bold text-indigo-600">{r.user}</span> },
    { field: "remark", header: "ENV.", style: { width: '10%' }, body: (r) => <span className="font-bold text-slate-600">{r.remark}</span> },
    { field: "fileCount", header: "Files", style: { width: '8%', textAlign: 'center' }, body: (r) => <span className="font-bold">{r.fileCount}</span> },
    { field: "sheetCount", header: "Sheet", style: { width: '8%', textAlign: 'center' }, body: (r) => <span className="font-bold">{r.sheetCount}</span> },
    { field: "sumRRow", header: "Read Excel", style: { width: '12%', textAlign: 'right' }, body: (r) => <span className="font-mono text-emerald-600 font-bold">{r.sumRRow?.toLocaleString()}</span> },
    { field: "sumWRow", header: "Write DB", style: { width: '12%', textAlign: 'right' }, body: (r) => <span className="font-mono text-blue-600 font-bold">{r.sumWRow?.toLocaleString()}</span> },
    { 
        field: "diffRow", 
        header: "Diff", 
        style: { width: '8%', textAlign: 'center' }, 
        body: (r) => (
            <span className={`px-2.5 py-1 rounded-lg text-[11px] font-black ${r.diffRow === 0 ? 'bg-slate-100 text-slate-500' : 'bg-rose-100 text-rose-600'}`}>
                {r.diffRow}
            </span>
        ) 
    },
    {
        header: "Actions",
        style: { width: '10%', textAlign: 'center' },
        body: (r) => (
            <div className="flex justify-center gap-2">
                <button onClick={() => setViewingBatch(r)} className="p-2 bg-slate-100 text-slate-600 hover:bg-indigo-100 hover:text-indigo-600 rounded-xl transition-all" title="View Details"><Eye size={18} /></button>
                <button onClick={(e) => handleExport(e, null, r.id)} className="p-2 bg-slate-100 text-slate-600 hover:bg-emerald-100 hover:text-emerald-600 rounded-xl transition-all" title="Export Batch"><Download size={18} /></button>
            </div>
        )
    }
  ], []);

  // -------------------------------------------------------------
  // 📍 2. โครงสร้างคอลัมน์ตารางย่อย (Detail Table ใน Modal)
  // -------------------------------------------------------------
  const detailColumns = useMemo(() => [
    { field: "file_id", header: "File ID", style: { width: '10%' }, body: (r) => <span className="font-bold text-slate-500">{r.id || r.file_id || '-'}</span> },
    { field: "file_name", header: "File Name", style: { width: '20%' }, body: (r) => <span className="font-bold text-slate-700 truncate block max-w-[200px]" title={r.file_name}>{r.file_name || '-'}</span> },
    { field: "sheet", header: "Sheet Name", style: { width: '15%' }, body: (r) => <span className="font-medium text-slate-500 truncate block max-w-[150px]" title={r.sheet}>{r.sheet || '-'}</span> },
    { field: "r_row", header: "Read", style: { width: '8%', textAlign: 'right' }, body: (r) => <span className="font-mono text-emerald-600 font-bold">{r.r_row?.toLocaleString() || '0'}</span> },
    { field: "w_row", header: "Write", style: { width: '8%', textAlign: 'right' }, body: (r) => <span className="font-mono text-blue-600 font-bold">{r.w_row?.toLocaleString() || '0'}</span> },
{ 
        field: "status", 
        header: "Status", 
        style: { width: '12%', textAlign: 'center' }, 
        body: (r) => {
            const hasRemark = r.Remark && r.Remark.trim() !== '' && r.Remark !== '-';
            if (hasRemark) {
                return (
                    <span className="px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-wider bg-slate-100 text-slate-500">
                        N/A
                    </span>
                );
            }
            const isSuccess = r.status === 4;
            return (
                <span className={`px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-wider ${isSuccess ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'}`}>
                    {isSuccess ? 'SUCCESS' : 'FAILED'}
                </span>
            );
        }
    },
    { field: "remark", header: "USER", style: { width: '15%', textAlign: 'center' }, body: (r) => <span className="text-xs text-slate-500 truncate block max-w-[150px]" title={r.remark}>{r.remark || '-'}</span> },
    { field: "Remark", header: "Description", style: { width: '15%', textAlign: 'center' }, body: (r) => <span className="text-xs text-slate-500 truncate block max-w-[150px]" title={r.Remark}>{r.Remark || '-'}</span> },
    {
        header: "Action",
        style: { width: '8%', textAlign: 'center' },
        body: (r) => {
            const isSuccess = r.status === 4;
            return (
                <button 
                    onClick={(e) => isSuccess && handleExport(e, r.id || r.file_id)} 
                    className={`p-2 rounded-xl transition-all flex mx-auto ${isSuccess ? 'bg-slate-100 text-slate-600 hover:bg-emerald-100 hover:text-emerald-600 active:scale-90' : 'text-slate-200 cursor-not-allowed'}`}
                    disabled={!isSuccess}
                    title={isSuccess ? 'Download File' : 'Cannot download: status is not success'}
                >
                    <Download size={18} />
                </button>
            )
        }
    }
  ], []);

  // -------------------------------------------------------------
  // 📍 3. ปุ่ม Action ของ Main Table
  // -------------------------------------------------------------
  const mainActionButtons = (
    <button 
      onClick={() => setIsImportModalOpen(true)}
      className="px-6 py-3 bg-indigo-600 text-white font-black rounded-2xl hover:bg-indigo-700 flex items-center gap-2 shadow-lg shadow-indigo-600/20 active:scale-95 transition-all"
    >
      <CloudUpload size={20} /> IMPORT NEW
    </button>
  );

  // --- Empty State ---
  if (selectedVersion === -1) {
    return (
      <div className="flex flex-col items-center justify-center h-full min-h-[500px] text-slate-400">
        <FileSpreadsheet size={64} className="mb-4 opacity-20" />
        <p className="font-bold">กรุณาเลือก Version เพื่อดูข้อมูล</p>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 bg-slate-50 h-screen font-sans text-slate-800 flex flex-col relative overflow-hidden animate-in fade-in duration-500">
        
      <div className="max-w-[1600px] w-full mx-auto flex flex-col h-full gap-4">
        {/* 📍 เรียกใช้ตารางหลัก */}
        <EnterpriseDataTable 
            data={tableData}
            columns={mainColumns}
            loading={isLoading}
            dataKey="id"
            globalFilterFields={['user']} // ค้นหาจาก ID และ User
            searchPlaceholder="Search ID or User..."
            actionButtons={mainActionButtons}
            emptyMessage="ไม่พบประวัติการ Import"
            rows={10}
            rowsPerPageOptions={[10, 20, 50]}
        />
      </div>

      {/* --- Detail Popup (ลูกตา) --- */}
      {viewingBatch && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white w-full max-w-[1400px] h-[85vh] rounded-[2.5rem] shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95">
            
            <div className="p-6 sm:p-8 border-b border-slate-100 flex justify-between items-center bg-white shrink-0">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl"><FileText size={24} /></div>
                <div>
                  <h4 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">Batch Details: #{viewingBatch.id}</h4>
                  <p className="text-xs font-bold text-slate-400 mt-1 uppercase tracking-wider">File Processing Results</p>
                </div>
              </div>
              <button onClick={() => setViewingBatch(null)} className="p-3 bg-slate-50 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-full transition-all"><X size={24} /></button>
            </div>
            
            <div className="flex-1 p-4 sm:p-6 bg-slate-50 flex flex-col overflow-hidden">
                {/* 📍 เรียกใช้ตารางย่อย ภายใน Modal */}
                <EnterpriseDataTable 
                    data={viewingBatch.details}
                    columns={detailColumns}
                    loading={false}
                    dataKey="file_name"
                    globalFilterFields={['file_name', 'sheet', 'remark']} // ค้นหาจากชื่อไฟล์, sheet
                    searchPlaceholder="Search file name, sheet..."
                    rows={10}
                    rowsPerPageOptions={[10, 20, 50]}
                />
            </div>

          </div>
        </div>
      )}

      {/* Import Modal */}
      <ImportFileModal isOpen={isImportModalOpen} onClose={() => setIsImportModalOpen(false)} onSuccess={() => setRefreshTrigger(prev => prev + 1)} />
    </div>
  );
}