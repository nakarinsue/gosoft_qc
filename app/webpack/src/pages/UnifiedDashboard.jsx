// pages/UnifiedDashboard.jsx
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { FileSpreadsheet, CloudUpload, Search, ChevronLeft, ChevronRight, Eye, X, FileText, Database } from 'lucide-react';
import { workspaceApi } from '../services/api/workspace.api';
import ImportFileModal from '../components/import/ImportFileModal';

// ----------------------------------------------------------------------
// Sub-component: Read-Only Detail Modal
// ----------------------------------------------------------------------
const ImportDetailModal = ({ isOpen, onClose, data }) => {
  if (!isOpen || !data) return null;

  // Mock รายละเอียดไฟล์ย่อย (กรณี API ไม่ได้ส่งมาให้) 
  // คุณสามารถแทนที่ data.details ด้วยข้อมูลจริงจาก API ได้
  const mockDetails = data.details || [
    { file_name: 'promo_q1.xlsx', sheet: 'POS_Data', status: 'Pass', read_row: 1500, wri_row: 1500, error_row: 0, user_mk: 'Admin01', desc: '-' },
    { file_name: 'promo_q1.xlsx', sheet: 'Delivery_Data', status: 'Skip', read_row: 500, wri_row: 480, error_row: 20, user_mk: 'Admin01', desc: 'Invalid Date format at row 481' },
  ];

  return (
    <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm z-[200] flex items-center justify-center p-4 animate-in fade-in">
      <div className="bg-white rounded-[2rem] w-full max-w-6xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">
        
        {/* Header Data (สรุปข้อมูลด้านบน) */}
        <div className="bg-slate-50 p-6 border-b border-slate-200 flex justify-between items-start">
          <div className="flex gap-4 items-center">
            <div className="p-3 bg-blue-100 text-blue-600 rounded-xl"><Database size={28}/></div>
            <div>
              <h2 className="text-xl font-black text-slate-800">Import Details (Read-only)</h2>
              <div className="flex flex-wrap gap-x-6 gap-y-2 mt-2 text-sm font-medium text-slate-500">
                <p>No: <span className="text-slate-800 font-bold">{data.id || '-'}</span></p>
                <p>User: <span className="text-slate-800 font-bold">{data.user || 'Unknown'}</span></p>
                <p>Version: <span className="text-slate-800 font-bold">{data.version || '-'}</span></p>
                <p>Date: <span className="text-slate-800 font-bold">{data.date || '-'}</span></p>
                <p>Status: <span className={`font-bold ${data.status === 'Pass' ? 'text-emerald-500' : 'text-rose-500'}`}>{data.status}</span></p>
                <p>Export: <span className="text-slate-800 font-bold">{data.export || '-'}</span></p>
              </div>
            </div>
          </div>
          <button onClick={onClose} className="p-2 bg-white hover:bg-slate-200 text-slate-400 rounded-full transition-colors border border-slate-200 shadow-sm"><X size={20}/></button>
        </div>

        {/* Detail Table (ข้อมูลไฟล์ย่อยด้านล่าง) */}
        <div className="flex-1 overflow-auto p-6 bg-white">
          <div className="border border-slate-200 rounded-2xl overflow-hidden">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-slate-50 text-[10px] font-black text-slate-500 uppercase tracking-widest border-b border-slate-200">
                <tr>
                  <th className="p-4">File Name</th>
                  <th className="p-4">Sheet</th>
                  <th className="p-4 text-center">Status</th>
                  <th className="p-4 text-right">Read Row</th>
                  <th className="p-4 text-right">Wri Row</th>
                  <th className="p-4 text-right">Error Row</th>
                  <th className="p-4">User_MK</th>
                  <th className="p-4">Description</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {mockDetails.map((det, idx) => (
                  <tr key={idx} className="hover:bg-slate-50 transition-colors">
                    <td className="p-4 font-bold text-slate-700 flex items-center gap-2"><FileText size={16} className="text-slate-400"/> {det.file_name}</td>
                    <td className="p-4 text-slate-600">{det.sheet}</td>
                    <td className="p-4 text-center">
                      <span className={`text-[10px] px-2 py-1 rounded-md font-bold uppercase ${det.status === 'Pass' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
                        {det.status}
                      </span>
                    </td>
                    <td className="p-4 text-right font-mono text-slate-600">{det.read_row}</td>
                    <td className="p-4 text-right font-mono text-emerald-600">{det.wri_row}</td>
                    <td className="p-4 text-right font-mono text-rose-600">{det.error_row}</td>
                    <td className="p-4 font-medium text-slate-600">{det.user_mk}</td>
                    <td className="p-4 text-slate-500 text-xs truncate max-w-[200px]" title={det.desc}>{det.desc}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
};

// ----------------------------------------------------------------------
// Main Dashboard Component
// ----------------------------------------------------------------------
const UnifiedDashboard = () => {
  const [historyData, setHistoryData] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // States สำหรับ View และ Pagination
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // State สำหรับ Modal รายละเอียด
  const [selectedDetailRow, setSelectedDetailRow] = useState(null);

  // ดึงข้อมูล
  const fetchHistoryData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await workspaceApi.getHistory();
      // สมมติว่าโครงสร้างคือ Array ของ object. ปรับ key ตาม API จริงของคุณ
      setHistoryData(res?.data || res || []);
    } catch (error) {
      console.error("Failed to load history data", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchHistoryData(); }, [fetchHistoryData]);

  // Reset หน้าเป็น 1 เมื่อมีการค้นหาใหม่
  useEffect(() => { setCurrentPage(1); }, [searchTerm]);

  // ----------------------------------------------------------------
  // Data Transformation & Filtering (Global Search & Sorting)
  // ----------------------------------------------------------------
  const processedData = useMemo(() => {
    // 1. กรองด้วย Search Term (Global Search)
    const filtered = historyData.filter(item => {
      const searchString = `${item.user} ${item.version} ${item.file} ${item.status}`.toLowerCase();
      return searchString.includes(searchTerm.toLowerCase());
    });

    // 2. จัดเรียงตาม Date (ล่าสุดไปเก่า)
    const sorted = filtered.sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0));
    return sorted;
  }, [historyData, searchTerm]);

  // 3. แบ่งหน้า (Pagination)
  const totalPages = Math.max(1, Math.ceil(processedData.length / itemsPerPage));
  const currentTableData = processedData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const handleNextPage = () => setCurrentPage(p => Math.min(totalPages, p + 1));
  const handlePrevPage = () => setCurrentPage(p => Math.max(1, p - 1));

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-20 p-6 bg-slate-50 min-h-screen font-sans">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header Section */}
        <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-200 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="flex items-center gap-4">
            <div className="p-4 bg-blue-50 rounded-2xl text-blue-600 shadow-inner"><FileSpreadsheet size={36} /></div>
            <div>
              <h1 className="text-3xl font-black text-slate-900 tracking-tight">Import Workspace</h1>
              <p className="text-slate-500 font-medium mt-1">จัดการนำเข้าไฟล์และตรวจสอบประวัติย้อนหลัง</p>
            </div>
          </div>
          
          <button 
            onClick={() => setIsImportModalOpen(true)}
            className="px-8 py-4 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 shadow-lg shadow-blue-600/30 transition-all flex items-center justify-center gap-3 active:scale-95 w-full md:w-auto text-lg"
          >
            <CloudUpload size={24} /> Import File
          </button>
        </div>

        {/* Search & Table Section */}
        <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-200 overflow-hidden min-h-[500px] flex flex-col">
          
          {/* Toolbar (Search) */}
          <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
            <h2 className="text-xl font-black text-slate-800">Import History</h2>
            <div className="relative w-full max-w-sm">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input 
                type="text" 
                placeholder="ค้นหา User, Version, File..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-xl outline-none focus:ring-2 ring-blue-500/50 text-sm font-bold text-slate-700 shadow-sm"
              />
            </div>
          </div>

          {/* Data Table */}
          <div className="flex-1 overflow-x-auto">
            {loading ? (
              <div className="flex justify-center items-center h-64 text-slate-400 font-bold uppercase tracking-widest">
                <div className="size-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mr-3"></div> Loading...
              </div>
            ) : (
              <table className="w-full text-left text-sm whitespace-nowrap">
                <thead className="bg-white text-slate-400 font-black uppercase text-[10px] tracking-widest border-b border-slate-200">
                  <tr>
                    <th className="p-6 w-16 text-center">No.</th>
                    <th className="p-6">User</th>
                    <th className="p-6">Version</th>
                    <th className="p-6">File</th>
                    <th className="p-6">Date</th>
                    <th className="p-6 text-center">Status</th>
                    <th className="p-6">Export</th>
                    <th className="p-6 text-center w-16">View</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {currentTableData.length === 0 ? (
                    <tr>
                      <td colSpan="8" className="p-16 text-center text-slate-400 font-bold border-2 border-dashed border-slate-100 m-4 rounded-xl">
                        ไม่พบข้อมูลประวัติการนำเข้า
                      </td>
                    </tr>
                  ) : (
                    currentTableData.map((item, idx) => (
                      <tr 
                        key={idx} 
                        onClick={() => setSelectedDetailRow(item)}
                        className="hover:bg-blue-50/50 transition-colors cursor-pointer group"
                      >
                        <td className="p-6 text-center font-bold text-slate-400">{(currentPage - 1) * itemsPerPage + idx + 1}</td>
                        <td className="p-6 font-bold text-slate-700">{item.user || '-'}</td>
                        <td className="p-6 text-slate-600 font-medium">{item.version || '-'}</td>
                        <td className="p-6 font-bold text-slate-700 truncate max-w-[200px]">{item.file || '-'}</td>
                        <td className="p-6 text-slate-500 font-mono text-xs">{item.date || '-'}</td>
                        <td className="p-6 text-center">
                           <span className={`text-[10px] px-3 py-1.5 rounded-lg font-black uppercase tracking-wider
                             ${item.status === 'Pass' ? 'bg-emerald-100 text-emerald-700' : 
                               item.status === 'Skip' ? 'bg-rose-100 text-rose-700' : 'bg-slate-100 text-slate-600'}`}>
                             {item.status || 'Wait'}
                           </span>
                        </td>
                        <td className="p-6 text-slate-600">{item.export || '-'}</td>
                        <td className="p-6 text-center">
                           <button className="p-2 text-slate-300 group-hover:text-blue-500 group-hover:bg-blue-100 rounded-lg transition-all">
                             <Eye size={18}/>
                           </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            )}
          </div>

          {/* Pagination */}
          {!loading && processedData.length > 0 && (
            <div className="p-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between">
              <span className="text-xs font-bold text-slate-400">
                Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, processedData.length)} of {processedData.length} entries
              </span>
              <div className="flex gap-2">
                <button onClick={handlePrevPage} disabled={currentPage === 1} className="p-2 bg-white border border-slate-200 rounded-lg text-slate-500 hover:bg-slate-100 disabled:opacity-50 transition-colors">
                  <ChevronLeft size={16}/>
                </button>
                <div className="px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-bold text-slate-700">
                  Page {currentPage} / {totalPages}
                </div>
                <button onClick={handleNextPage} disabled={currentPage === totalPages} className="p-2 bg-white border border-slate-200 rounded-lg text-slate-500 hover:bg-slate-100 disabled:opacity-50 transition-colors">
                  <ChevronRight size={16}/>
                </button>
              </div>
            </div>
          )}
        </div>

      </div>

      {/* Modals */}
      <ImportFileModal 
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onSuccess={fetchHistoryData}
        currentUserId={1}
      />

      <ImportDetailModal 
        isOpen={!!selectedDetailRow}
        data={selectedDetailRow}
        onClose={() => setSelectedDetailRow(null)}
      />

    </div>
  );
};

export default UnifiedDashboard;