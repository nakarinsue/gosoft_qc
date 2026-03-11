import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { workspaceApi } from '../services/api/workspace.api';
import AssignUserModal from '../components/assign/AssignUserModal';
import { Layers, UserPlus, Save, FileSpreadsheet, Search, Loader2, BarChart2, X, Users } from 'lucide-react';

const AssignFilePage = ({ selectedVersion }) => {
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);
  
  const [originalData, setOriginalData] = useState([]);
  const [editingData, setEditingData] = useState([]); 
  const [allUsers, setAllUsers] = useState([]); 
  
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSummaryOpen, setIsSummaryOpen] = useState(false); // 📍 State เปิด/ปิด Popup สรุป
  const [activeUsers, setActiveUsers] = useState([]);

  const initPage = useCallback(async () => {
    if (selectedVersion === -1) {
      setOriginalData([]);
      setEditingData([]);
      return;
    }

    setLoading(true);
    try {
      const [filesRes, usersRes] = await Promise.all([
        workspaceApi.getFilesByVersion(selectedVersion),
        workspaceApi.getUsers()
      ]);
      
      const safeFilesRes = filesRes?.success ? (filesRes?.data || []) : (Array.isArray(filesRes) ? filesRes : []);
      const safeUsersRes = usersRes?.success ? (usersRes?.data || []) : (Array.isArray(usersRes) ? usersRes : []);

      setOriginalData(safeFilesRes);
      setEditingData(JSON.parse(JSON.stringify(safeFilesRes))); 
      setAllUsers(safeUsersRes);
      setStep(1);
    } catch (error) {
      console.error("Failed to load assignment data:", error);
    } finally {
      setLoading(false);
    }
  }, [selectedVersion]);

  useEffect(() => { 
    initPage(); 
  }, [initPage]);

  const displayData = useMemo(() => {
    const sourceData = step === 1 ? originalData : editingData;
    if (!Array.isArray(sourceData)) return [];
    if (!searchTerm) return sourceData;
    
    return sourceData.filter(item => 
      item?.WORKSHEET?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item?.FILE_NAME?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [originalData, editingData, searchTerm, step]);

  const hasAnyAssignment = useMemo(() => {
    return Array.isArray(editingData) && editingData.some(item => item.ASSIGNED_TO);
  }, [editingData]);

  // 📍 แก้ไข: ส่ง targetItem มาเทียบตรงๆ ป้องกันการแก้ผิด Row เวลามีการ Filter (Search)
  const handleManualChange = (targetItem, newUserId) => {
    const newData = [...editingData];
    const dataIndex = newData.findIndex(item => item === targetItem);
    
    if (dataIndex !== -1) {
      newData[dataIndex] = { 
        ...newData[dataIndex], 
        ASSIGNED_TO: newUserId ? (isNaN(newUserId) ? newUserId : Number(newUserId)) : null 
      };
      setEditingData(newData);
      if (step === 1) setStep(2);
    }
  };

  const handleFinalSave = async () => {
    setLoading(true);
    try {
      await workspaceApi.updateUserAssign({
        version: selectedVersion,
        assignments: editingData
      });
      alert('บันทึกการแจกจ่ายงานสำเร็จ!');
      initPage(); 
    } catch (error) {
      alert('เกิดข้อผิดพลาดในการบันทึก: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  // 📍 คำนวณข้อมูลสำหรับหน้า Summary Modal
  const summaryData = useMemo(() => {
    const summary = {};
    editingData.forEach(item => {
      const userId = item.ASSIGNED_TO;
      if (!userId) return; 

      if (!summary[userId]) {
        // ค้นหาข้อมูลพนักงานจาก ID หรือ Username
        const userInfo = allUsers.find(u => String(u.user_id || u.id) === String(userId));
        
        summary[userId] = {
          userId,
          // 📍 แก้ไข: ไล่ลำดับความสำคัญ Name -> Username -> ค่าที่บันทึกไว้ในระบบ (ตัดคำว่า User ID ทิ้ง)
          userName: userInfo?.name || userInfo?.username || userId, 
          totalFiles: 0, 
          sheets: new Set(),
          dates: new Set(),
          totalValue: 0
        };
      }
      
      // บวกจำนวนไฟล์ (แถวข้อมูล)
      summary[userId].totalFiles += 1;
      
      if (item.SHEET) summary[userId].sheets.add(item.SHEET);
      if (item.START_DATE) summary[userId].dates.add(item.START_DATE);
      summary[userId].totalValue += (Number(item.VALUE) || 0);
    });

    return Object.values(summary).map(userStats => ({
      ...userStats,
      fileCount: userStats.totalFiles, 
      sheetCount: userStats.sheets.size,
      dateCount: userStats.dates.size
    })).sort((a, b) => b.totalValue - a.totalValue); 
  }, [editingData, allUsers]);

  const maxSummaryValue = summaryData.length > 0 ? Math.max(...summaryData.map(d => d.totalValue)) : 1;
  
  if (selectedVersion === -1) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-slate-400">
        <FileSpreadsheet size={64} className="mb-4 opacity-20" />
        <p className="font-bold text-lg tracking-widest uppercase">กรุณาเลือก Version</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6 bg-slate-50 min-h-screen animate-in fade-in duration-500">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header Section */}
        <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-200 flex flex-col lg:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-4">
            <div className="p-4 bg-gradient-to-tr from-blue-600 to-indigo-600 rounded-2xl text-white shadow-lg">
              {loading ? <Loader2 className="animate-spin" size={32} /> : <FileSpreadsheet size={32} />}
            </div>
            <div>
              <h1 className="text-2xl font-black text-slate-900 tracking-tight">Workload Assignment</h1>
              <p className="text-blue-600 text-xs font-black uppercase tracking-widest mt-1">Version: {selectedVersion}</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
            <div className="relative group flex-1 lg:flex-none">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input 
                type="text" placeholder="Search Worksheet..."
                className="w-full lg:w-64 bg-slate-50 border border-slate-200 rounded-2xl py-3.5 pl-11 pr-4 outline-none focus:ring-4 ring-blue-500/10 focus:border-blue-500 text-sm font-bold transition-all"
                value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            {/* 📍 เพิ่มปุ่ม Summary */}
            <button 
              onClick={() => setIsSummaryOpen(true)}
              className="px-5 py-3.5 bg-indigo-50 text-indigo-600 hover:bg-indigo-100 font-black rounded-2xl transition-all flex items-center gap-2"
            >
              <BarChart2 size={18} /> SUMMARY
            </button>

            <button 
              onClick={() => setIsModalOpen(true)}
              className="px-5 py-3.5 bg-slate-900 text-white font-black rounded-2xl hover:bg-slate-800 transition-all flex items-center gap-2 shadow-xl active:scale-95"
            >
              <UserPlus size={18} /> AUTO ASSIGN
            </button>

            <button 
              disabled={!hasAnyAssignment || loading}
              onClick={handleFinalSave}
              className={`px-8 py-3.5 font-black rounded-2xl transition-all flex items-center gap-2 active:scale-95 shadow-xl ${
                hasAnyAssignment && !loading
                ? 'bg-emerald-500 text-white shadow-emerald-500/30 hover:bg-emerald-600' 
                : 'bg-slate-100 text-slate-400 cursor-not-allowed shadow-none'
              }`}
            >
              <Save size={18} /> CONFIRM
            </button>
          </div>
        </div>

        {/* 📍 Table Section (เพิ่ม Overflow และ Sticky Header) */}
        <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-200 overflow-hidden">
          <div className="max-h-[60vh] overflow-y-auto custom-scrollbar relative">
            <table className="w-full text-left">
              <thead className="sticky top-0 z-20 bg-slate-50/95 backdrop-blur-md shadow-sm">
                <tr className="text-slate-400 text-[10px] uppercase font-black tracking-widest border-b border-slate-200">
                  <th className="p-6 w-1/2">Details</th>
                  <th className="p-6 text-center">Total Value</th>
                  <th className="p-6">Assigned To</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {loading ? (
                  <tr><td colSpan="3" className="p-20 text-center text-slate-400 font-bold">กำลังประมวลผลข้อมูล...</td></tr>
                ) : displayData.length === 0 ? (
                  <tr><td colSpan="3" className="p-20 text-center text-slate-400 font-bold">ไม่พบข้อมูลในเวอร์ชันนี้</td></tr>
                ) : displayData.map((item, index) => (
                  <tr key={index} className="hover:bg-blue-50/30 transition-colors group">
                    <td className="p-6">
                      <p className="font-black text-slate-800 text-sm mb-1">{item.WORKSHEET || '-'}</p>
                      <div className="flex gap-4">
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">SHEET: <span className="text-slate-600">{item.SHEET || '-'}</span></p>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">DATE: <span className="text-slate-600">{item.START_DATE || '-'}</span></p>
                      </div>
                    </td>
                    <td className="p-6 text-center text-sm font-black text-emerald-600 font-mono">
                      {(Number(item.VALUE) || 0).toLocaleString()}
                    </td>
                    <td className="p-6">
                      {/* 📍 ส่งค่า item ตัวจริงเข้าไป ไม่ใช่ index */}
                      <select 
                        className={`w-full max-w-[200px] border-2 rounded-xl py-2.5 px-4 outline-none focus:ring-2 ring-blue-500/20 text-sm font-black cursor-pointer transition-all ${
                          item.ASSIGNED_TO ? 'bg-blue-50 border-blue-200 text-blue-700' : 'bg-slate-50 border-slate-100 text-slate-500'
                        }`}
                        value={item.ASSIGNED_TO || ''}
                        onChange={(e) => handleManualChange(item, e.target.value)}
                      >
                        <option value="">-- UNASSIGNED --</option>
                        {allUsers.map(u => (
                          <option key={u.user_id || u.id} value={u.user_id || u.id}>
                            {u.username || u.name}
                          </option>
                        ))}
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* --- 📍 SUMMARY MODAL POPUP --- */}
      {isSummaryOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 w-full max-w-5xl rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 flex flex-col max-h-[90vh]">
            <div className="p-8 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-900">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-indigo-100 text-indigo-600 rounded-xl"><BarChart2 size={24} /></div>
                <div>
                  <h4 className="text-xl font-black text-slate-800 dark:text-white">Assignment Summary</h4>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Workload Distribution & Overview</p>
                </div>
              </div>
              <button onClick={() => setIsSummaryOpen(false)} className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-all"><X size={24}/></button>
            </div>
            
            <div className="p-8 overflow-y-auto custom-scrollbar flex-1 space-y-8">
              
              {/* ส่วนที่ 1: กราฟเปรียบเทียบ (Tailwind CSS Bar Chart) */}
              <div className="bg-slate-50 dark:bg-slate-800/50 rounded-[2rem] p-6 border border-slate-100 dark:border-slate-800">
                <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-6 flex items-center gap-2"><Users size={14}/> Value Distribution by User</h5>
                <div className="space-y-4">
                  {summaryData.length === 0 ? (
                    <p className="text-center text-slate-400 font-bold text-sm">ยังไม่มีการจ่ายงาน</p>
                  ) : summaryData.map(data => (
                    <div key={data.userId} className="flex items-center gap-4">
                      <div className="w-32 truncate text-xs font-black text-slate-700 dark:text-slate-300 text-right">{data.userName}</div>
                      <div className="flex-1 h-4 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden flex items-center">
                        <div 
                          className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full transition-all duration-1000"
                          style={{ width: `${(data.totalValue / maxSummaryValue) * 100}%` }}
                        />
                      </div>
                      <div className="w-24 text-right text-xs font-mono font-black text-indigo-600 dark:text-indigo-400">
                        {data.totalValue.toLocaleString()}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* ส่วนที่ 2: ตารางสรุปข้อมูลเชิงลึก */}
              <table className="w-full text-left border-separate border-spacing-y-2">
                <thead>
                  <tr className="text-[10px] font-black uppercase text-slate-400 tracking-widest">
                    <th className="px-4 pb-2">Assigned User</th>
                    <th className="px-4 pb-2 text-center">Diff Files</th>
                    <th className="px-4 pb-2 text-center">Diff Sheets</th>
                    <th className="px-4 pb-2 text-center">Diff Start-Dates</th>
                    <th className="px-4 pb-2 text-right">Total Value</th>
                  </tr>
                </thead>
                <tbody>
                  {summaryData.map(data => (
                    <tr key={data.userId} className="bg-slate-50 dark:bg-slate-800/30 rounded-2xl">
                      <td className="py-4 px-4 font-bold text-slate-800 dark:text-slate-200 rounded-l-2xl">{data.userName}</td>
                      <td className="py-4 px-4 text-center font-bold text-slate-600">{data.fileCount}</td>
                      <td className="py-4 px-4 text-center font-bold text-slate-600">{data.sheetCount}</td>
                      <td className="py-4 px-4 text-center font-bold text-slate-600">{data.dateCount}</td>
                      <td className="py-4 px-4 text-right font-mono text-emerald-600 font-black rounded-r-2xl">{data.totalValue.toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

            </div>
          </div>
        </div>
      )}

      {/* Auto Assign Modal (คงเดิม) */}
      <AssignUserModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onConfirm={(res, users) => {
          setEditingData(res);
          setActiveUsers(users);
          setStep(2);
        }}
        allUsers={allUsers} 
      />
    </div>
  );
};

export default AssignFilePage;