import React, { useState, useEffect, useRef } from 'react';
import { 
  CloudUpload, FileText, CheckCircle2, RefreshCw, Database, 
  Server, User, Settings2, Clock, AlertCircle, Download, 
  Trash2, Search, LayoutDashboard, Calendar, Timer
} from 'lucide-react';
import axios from 'axios';
import { API_BASE_URL } from '../config';

// --- Components ---
const StatusBadge = ({ type }) => {
  const styles = type === 'POS' 
    ? 'bg-blue-50 text-blue-700 border-blue-100 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800'
    : type === 'DELIVERY'
    ? 'bg-purple-50 text-purple-700 border-purple-100 dark:bg-purple-900/30 dark:text-purple-300 dark:border-purple-800'
    : 'bg-slate-100 text-slate-500 border-slate-200';
  
  return (
    <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${styles} shadow-sm`}>
      {type}
    </span>
  );
};

const ExcelImportPage = () => {
  // --- States ---
  const [userId, setUserId] = useState("1");
  const [system, setSystem] = useState("POS");
  const [uploadFiles, setUploadFiles] = useState([]); 
  const [historyData, setHistoryData] = useState([]); 
  const [selectedItems, setSelectedItems] = useState([]); 
  const [isLoading, setIsLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  
  // Modal States
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [confirmDetails, setConfirmDetails] = useState({ date: '', time: '' });
  
  // Summary States
  const [uploadSummary, setUploadSummary] = useState(null);
  const [summarySearch, setSummarySearch] = useState(""); // Search for Error Log
  
  // Loading Estimation State
  const [estimatedTimeMsg, setEstimatedTimeMsg] = useState("Calculating...");

  // Search Main Table
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => { fetchHistory(); }, []);

  const fetchHistory = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/IMAGE/History`);
      if (res.data.success && res.data.data.length > 0) setHistoryData(res.data.data[0]);
    } catch (e) { console.error(e); }
  };

  // --- Handlers ---
  const handleFileChange = (e) => {
    if (e.target.files) {
      setUploadFiles((prev) => [...prev, ...Array.from(e.target.files)]);
    }
  };

  const removeFile = (index) => {
    setUploadFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const toggleSelectItem = (item) => {
    const isExist = selectedItems.find(x => x.sub_id === item.sub_id);
    setSelectedItems(isExist ? selectedItems.filter(x => x.sub_id !== item.sub_id) : [...selectedItems, item]);
  };

  const toggleSelectAll = (e) => {
    if (e.target.checked) setSelectedItems(filteredData);
    else setSelectedItems([]);
  };

  // Open Confirm Modal and capture current time
  const handleOpenConfirm = () => {
    const now = new Date();
    setConfirmDetails({
        date: now.toLocaleDateString('th-TH'),
        time: now.toLocaleTimeString('th-TH')
    });
    setShowConfirmModal(true);
  };

  const handleExport = async () => {
    if (selectedItems.length === 0) return;
    setIsLoading(true);
    setEstimatedTimeMsg("Generating Excel File...");
    try {
      const payload = { 
        id: selectedItems.map(x => String(x.ID)), 
      };
      const res = await axios.post(`${API_BASE_URL}/IMAGE/export-History`, payload, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Export_${new Date().toISOString().slice(0,10)}.xlsx`);
      document.body.appendChild(link);
      link.click();
      
      setSelectedItems([]);
      fetchHistory(); 
    } catch (e) { alert("Export Failed"); } finally { setIsLoading(false); }
  };

  const startUploadProcess = async () => {
    setShowConfirmModal(false); 
    setIsLoading(true); 
    setUploadProgress(0);
    setEstimatedTimeMsg("Initializing process...");

    const totalFiles = uploadFiles.length;
    const startTotalTime = performance.now();
    let pass = 0, fail = 0, failDetails = [];

    for (let i = 0; i < totalFiles; i++) {
      const file = uploadFiles[i];
      const startFileTime = performance.now(); // จับเวลาเริ่มไฟล์นี้

      try {
        const fd = new FormData(); fd.append("file", file);
        const res = await axios.post(`${API_BASE_URL}/IMAGE/upload-and-import?user_id=${userId}&system=${system}`, fd);
        if (res.data.success) pass++; else throw new Error();
      } catch { fail++; failDetails.push(file.name); }

      const endFileTime = performance.now();
      
      // --- Logic คำนวณเวลา ---
      // เวลาที่ใช้ไปสำหรับไฟล์ล่าสุด (ms) -> แปลงเป็นวินาที
      const durationLastFile = (endFileTime - startFileTime) / 1000;
      
      // ไฟล์ที่เหลือ
      const remainingFiles = totalFiles - (i + 1);

      if (remainingFiles > 0) {
          // สูตร: (เวลาไฟล์ล่าสุด + 2 วินาที) * จำนวนไฟล์ที่เหลือ
          const estimatedSeconds = (durationLastFile + 2) * remainingFiles;
          setEstimatedTimeMsg(`Estimated remaining time: ~${estimatedSeconds.toFixed(1)} seconds`);
      } else {
          setEstimatedTimeMsg("Finalizing...");
      }

      setUploadProgress(Math.round(((i + 1) / totalFiles) * 100));
    }
    
    setUploadSummary({ 
        pass, 
        fail, 
        failDetails, 
        duration: ((performance.now() - startTotalTime) / 1000).toFixed(2) 
    });
    
    setIsLoading(false); 
    setUploadFiles([]); 
    fetchHistory(); 
  };

  const filteredData = historyData.filter(item => 
    item.WORKSHEET.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const isUploadMode = uploadFiles.length > 0;
  const tableData = isUploadMode ? uploadFiles : filteredData;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0B1120] text-slate-900 dark:text-slate-100 font-sans selection:bg-blue-100 selection:text-blue-900 p-8">
      
      <main className="max-w-7xl mx-auto">
        
        {/* Header Section */}
        <div className="mb-10 flex items-center justify-between">
            <div className="flex items-center gap-4">
                <div className="bg-gradient-to-tr from-blue-600 to-indigo-600 p-3 rounded-2xl shadow-lg shadow-blue-500/20">
                    <LayoutDashboard className="text-white" size={24} />
                </div>
                <div>
                    <h1 className="text-2xl font-black tracking-tight text-slate-800 dark:text-white">Data Sync <span className="text-blue-600">Pro</span></h1>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Enterprise Edition</p>
                </div>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-100 dark:border-slate-800">
                <div className={`size-2.5 rounded-full ${isLoading ? 'bg-orange-500 animate-pulse' : 'bg-green-500'} `}></div>
                <span className="text-xs font-bold text-slate-500">{isLoading ? 'Processing...' : 'System Online'}</span>
            </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* --- Left Panel: Action Center --- */}
          <div className="lg:col-span-4 space-y-6 sticky top-8">
            <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-1 border border-slate-100 dark:border-slate-800 shadow-xl shadow-slate-200/50 dark:shadow-none">
              <div className="bg-slate-50 dark:bg-[#0F1629] rounded-[2.3rem] p-8">
                
                <div className="flex items-center gap-3 mb-8">
                  <div className="p-2.5 bg-blue-100 dark:bg-blue-900/30 rounded-xl">
                    <Settings2 className="text-blue-600" size={20}/>
                  </div>
                  <h2 className="font-bold text-lg">Control Panel</h2>
                </div>

                {/* Condition: Show Dropzone OR Export Info */}
                {!isUploadMode && selectedItems.length > 0 ? (
                    // --- EXPORT MODE ---
                    <div className="animate-in fade-in zoom-in duration-300">
                        <div className="bg-emerald-50 dark:bg-emerald-900/10 p-6 rounded-3xl mb-6 border border-emerald-100 dark:border-emerald-800">
                            <h3 className="text-emerald-700 dark:text-emerald-400 font-bold text-lg mb-1">Ready to Export</h3>
                            <p className="text-emerald-600/70 text-xs mb-4">Selected items from history</p>
                            <div className="flex items-center gap-2 text-3xl font-black text-emerald-600">
                                <FileText size={28}/> {selectedItems.length}
                            </div>
                        </div>
                        <button 
                            onClick={handleExport}
                            className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-4 rounded-2xl shadow-lg shadow-emerald-500/20 hover:shadow-xl hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2"
                        >
                            <Download size={20} /> Export Excel
                        </button>
                        <button 
                            onClick={() => setSelectedItems([])}
                            className="w-full mt-4 text-xs font-bold text-slate-400 hover:text-slate-600 py-2"
                        >
                            Clear Selection
                        </button>
                    </div>
                ) : (
                    // --- UPLOAD MODE ---
                    <>
                        <label className={`group relative flex flex-col items-center justify-center p-10 border-2 border-dashed ${isUploadMode ? 'border-blue-500 bg-blue-50/20' : 'border-slate-300 dark:border-slate-700'} rounded-[2rem] cursor-pointer hover:border-blue-500 hover:bg-blue-50/50 dark:hover:bg-blue-500/5 transition-all duration-300 mb-6`}>
                        <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl shadow-sm mb-4 group-hover:scale-110 transition-transform duration-300">
                            <CloudUpload size={32} className="text-blue-500" />
                        </div>
                        <h3 className="font-bold text-slate-700 dark:text-slate-200 z-10 text-center">
                            {isUploadMode ? 'Add More Files' : 'Upload Excel'}
                        </h3>
                        <p className="text-[10px] text-slate-400 mt-2 z-10 text-center font-bold uppercase tracking-wider">Drag & drop or Click</p>
                        <input type="file" hidden multiple onChange={handleFileChange} />
                        </label>

                        {isUploadMode && (
                        <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
                            <div className="flex justify-between items-center mb-4 px-2">
                                <span className="text-xs font-bold text-slate-400 uppercase">Queue Status</span>
                                <span className="bg-blue-600 text-white text-[10px] px-2 py-0.5 rounded-full font-bold">{uploadFiles.length} Pending</span>
                            </div>
                            <button 
                            onClick={handleOpenConfirm}
                            className="w-full bg-slate-900 dark:bg-blue-600 text-white font-bold py-4 rounded-2xl shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2"
                            >
                            <Server size={18} /> Start Process
                            </button>
                            <button 
                            onClick={() => setUploadFiles([])}
                            className="w-full mt-3 text-xs font-bold text-slate-400 hover:text-red-500 transition-colors"
                            >
                            Cancel All
                            </button>
                        </div>
                        )}
                    </>
                )}
              </div>
            </div>
          </div>

          {/* --- Right Panel: Data Table --- */}
          <div className="lg:col-span-8 space-y-6">
            
            {/* Table Controls */}
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4 bg-white dark:bg-slate-900 p-3 pl-6 pr-3 rounded-[2rem] shadow-sm border border-slate-100 dark:border-slate-800">
               <div className="flex items-center gap-3 text-slate-500">
                 <div className={`p-2 rounded-xl ${isUploadMode ? "bg-orange-100 text-orange-600" : "bg-blue-100 text-blue-600"}`}>
                    <Database size={18} />
                 </div>
                 <div className="flex flex-col">
                    <span className="font-bold text-sm text-slate-700 dark:text-white">
                        {isUploadMode ? "File Queue Preview" : "Import History"}
                    </span>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                        {tableData.length} Records
                    </span>
                 </div>
               </div>
               
               {!isUploadMode && (
                 <div className="flex items-center gap-2 w-full sm:w-auto animate-in fade-in">
                   <div className="relative group w-full sm:w-64">
                     <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                     <input 
                       type="text" 
                       placeholder="Search worksheet..." 
                       value={searchTerm}
                       onChange={(e) => setSearchTerm(e.target.value)}
                       className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-2xl py-3 pl-11 pr-4 text-xs font-bold focus:ring-2 focus:ring-blue-500/20 transition-all"
                     />
                   </div>
                   <button onClick={fetchHistory} className="p-3 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-2xl transition-colors text-slate-400 hover:text-blue-500">
                      <RefreshCw size={18} className={isLoading ? "animate-spin" : ""} />
                   </button>
                 </div>
               )}
            </div>

            {/* Premium Table */}
            <div className={`bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-sm border ${isUploadMode ? 'border-orange-200 dark:border-orange-900/30' : 'border-slate-200 dark:border-slate-800'} overflow-hidden min-h-[500px] flex flex-col transition-colors duration-500`}>
              <div className="overflow-x-auto flex-1 custom-scrollbar">
                <table className="w-full text-left border-collapse">
                  <thead className="sticky top-0 bg-slate-50/90 dark:bg-slate-900/90 backdrop-blur-md z-10 border-b border-slate-100 dark:border-slate-800">
                    <tr className="text-[11px] font-black text-slate-400 uppercase tracking-widest">
                      <th className="px-8 py-6 text-center w-20">
                        {!isUploadMode ? (
                          <input 
                            type="checkbox" 
                            onChange={toggleSelectAll}
                            checked={selectedItems.length === filteredData.length && filteredData.length > 0}
                            className="rounded-md border-slate-300 text-blue-600 focus:ring-offset-0 focus:ring-2 focus:ring-blue-500/20 w-4 h-4 cursor-pointer transition-all"
                          />
                        ) : (
                           <span>#</span>
                        )}
                      </th>
                      <th className="px-6 py-6">Worksheet / File</th>
                      {/* <th className="px-6 py-6">System</th> */}
                      <th className="px-6 py-6">{isUploadMode ? 'DATE' : 'Timestamp'}</th>
                      {isUploadMode && <th className="px-6 py-6 text-right">Action</th>}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
                    {tableData.length === 0 ? (
                      <tr>
                        <td colSpan="5" className="px-6 py-32 text-center">
                          <div className="flex flex-col items-center justify-center gap-4 opacity-40">
                             <div className="bg-slate-100 p-6 rounded-full"><Database size={40} /></div>
                             <p className="font-bold text-sm text-slate-500">No data available</p>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      tableData.map((item, index) => {
                        if (isUploadMode) {
                          return (
                             <tr key={index} className="group hover:bg-orange-50/50 dark:hover:bg-orange-900/10 transition-colors">
                                <td className="px-8 py-5 text-center text-xs font-bold text-slate-300">{index + 1}</td>
                                <td className="px-6 py-5">
                                  <div className="flex items-center gap-4">
                                    <div className="p-2.5 rounded-xl bg-orange-100 text-orange-600 shadow-sm">
                                      <FileText size={18} />
                                    </div>
                                    <span className="font-bold text-sm text-slate-700 dark:text-slate-200 truncate max-w-[240px]">{item.name}</span>
                                  </div>
                                </td>
                                <td className="px-6 py-5"><StatusBadge type="Pending" /></td>
                                <td className="px-6 py-5 text-xs font-mono text-slate-500">{(item.size / 1024).toFixed(2)} KB</td>
                                <td className="px-6 py-5 text-right pr-8">
                                   <button onClick={() => removeFile(index)} className="p-2 hover:bg-red-50 text-slate-300 hover:text-red-500 rounded-xl transition-colors">
                                      <Trash2 size={18} />
                                   </button>
                                </td>
                             </tr>
                          );
                        } else {
                          const isSelected = !!selectedItems.find(x => x.ID === item.ID);
                          return (
                            <tr 
                              key={item.ID} 
                              onClick={() => toggleSelectItem(item)}
                              className={`group cursor-pointer transition-all duration-200 border-l-[6px] ${
                                isSelected 
                                ? 'bg-blue-50/50 dark:bg-blue-900/10 border-l-blue-500' 
                                : 'hover:bg-slate-50 dark:hover:bg-slate-800/50 border-l-transparent'
                              }`}
                            >
                              <td className="px-8 py-5 text-center">
                                <input 
                                  type="checkbox" 
                                  checked={isSelected}
                                  readOnly
                                  className="rounded-md border-slate-300 text-blue-600 focus:ring-0 w-4 h-4 cursor-pointer pointer-events-none"
                                />
                              </td>
                              <td className="px-6 py-5">
                                <div className="flex items-center gap-4">
                                  <div className={`p-2.5 rounded-xl transition-colors shadow-sm ${isSelected ? 'bg-blue-100 text-blue-600' : 'bg-slate-100 text-slate-400 group-hover:text-slate-600'}`}>
                                    <FileText size={18} />
                                  </div>
                                  <div className="flex flex-col">
                                     <span className="font-bold text-sm text-slate-700 dark:text-slate-200 truncate max-w-[240px]">{item.WORKSHEET}</span>
                                     <span className="text-[10px] text-slate-400 font-mono mt-0.5">SHEET: {item.SHEET}</span>
                                  </div>
                                </div>
                              </td>
                              {/* <td className="px-6 py-5">
                                <StatusBadge type={item.SYSTEM} />
                              </td> */}
                              <td className="px-6 py-5">
                                <div className="flex flex-col">
                                  <span className="text-xs font-bold text-slate-600 dark:text-slate-300">{item.R_ROW}</span>
                                  <span className="text-[10px] text-slate-400">ROW: {item.W_ROW}</span>
                                </div>
                              </td>
                            </tr>
                          );
                        }
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* --- CONFIRMATION MODAL --- */}
      {showConfirmModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[100] flex items-center justify-center p-4">
           <div className="bg-white dark:bg-[#0F1629] w-full max-w-lg rounded-[2.5rem] p-10 shadow-2xl border border-white/20 animate-in zoom-in-95">
              <div className="text-center mb-10">
                <div className="mx-auto size-20 bg-blue-50 dark:bg-blue-900/20 rounded-full flex items-center justify-center mb-5">
                  <Settings2 className="text-blue-600" size={40}/>
                </div>
                <h3 className="text-3xl font-black text-slate-800 dark:text-white tracking-tight">Confirm Import</h3>
                <p className="text-slate-500 font-medium mt-2">Please review your configuration</p>
              </div>
              
              <div className="bg-slate-50 dark:bg-slate-900/50 rounded-3xl p-8 mb-8 border border-slate-100 dark:border-slate-800 grid grid-cols-2 gap-6">
                 {/* Username */}
                 <div className="space-y-1">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Username</span>
                    <div className="flex items-center gap-2 font-bold text-slate-700 dark:text-white">
                        <User size={16} className="text-blue-500"/> {userId}
                    </div>
                 </div>
                 {/* Files */}
                 <div className="space-y-1">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Files</span>
                    <div className="flex items-center gap-2 font-bold text-slate-700 dark:text-white">
                        <FileText size={16} className="text-blue-500"/> {uploadFiles.length}
                    </div>
                 </div>
                 {/* Date */}
                 <div className="space-y-1">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Date</span>
                    <div className="flex items-center gap-2 font-bold text-slate-700 dark:text-white">
                        <Calendar size={16} className="text-blue-500"/> {confirmDetails.date}
                    </div>
                 </div>
                 {/* Time */}
                 <div className="space-y-1">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Time</span>
                    <div className="flex items-center gap-2 font-bold text-slate-700 dark:text-white">
                        <Clock size={16} className="text-blue-500"/> {confirmDetails.time}
                    </div>
                 </div>

                 {/* System Dropdown (Full Width) */}
                 <div className="col-span-2 mt-2 pt-6 border-t border-slate-200 dark:border-slate-700">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 block">Target System</label>
                    <div className="relative">
                        <select 
                            value={system} 
                            onChange={(e) => setSystem(e.target.value)} 
                            className="w-full appearance-none bg-white dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 rounded-2xl p-4 font-bold text-slate-700 dark:text-white outline-none focus:border-blue-500 transition-colors cursor-pointer"
                        >
                            <option value="POS">POS System</option>
                            <option value="DELIVERY">Delivery System</option>
                        </select>
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                            <Server size={18} />
                        </div>
                    </div>
                 </div>
              </div>

              <div className="flex gap-4">
                 <button onClick={() => setShowConfirmModal(false)} className="flex-1 py-4 rounded-2xl font-bold text-slate-500 hover:bg-slate-100 transition-colors">Cancel</button>
                 <button onClick={startUploadProcess} className="flex-[2] bg-slate-900 dark:bg-white dark:text-slate-900 text-white py-4 rounded-2xl font-black shadow-xl shadow-slate-900/20 hover:scale-[1.02] transition-transform">Confirm & Start</button>
              </div>
           </div>
        </div>
      )}

      {/* --- LOADING SCREEN --- */}
      {isLoading && uploadFiles.length > 0 && (
          <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-xl z-[150] flex items-center justify-center">
            <div className="bg-white dark:bg-[#0F1629] p-12 rounded-[3rem] shadow-2xl flex flex-col items-center max-w-sm w-full border border-white/10 text-center">
               <div className="relative size-32 mb-8">
                  <svg className="size-full -rotate-90" viewBox="0 0 36 36">
                    <path className="text-slate-100 dark:text-slate-800" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="3" />
                    <path className="text-blue-600 transition-all duration-500 ease-out" strokeDasharray={`${uploadProgress}, 100`} d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="3" />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center font-black text-3xl text-slate-800 dark:text-white">{uploadProgress}%</div>
               </div>
               
               <h4 className="font-black text-2xl text-slate-800 dark:text-white mb-2">Synchronizing...</h4>
               <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-6">Writing data to SQL Server</p>
               
               {/* Time Estimation */}
               <div className="bg-slate-50 dark:bg-slate-900 rounded-2xl p-4 w-full flex items-center justify-center gap-2 text-slate-500 border border-slate-100 dark:border-slate-800">
                    <Timer size={16} className="animate-pulse text-blue-500"/>
                    <span className="text-xs font-bold">{estimatedTimeMsg}</span>
               </div>
            </div>
          </div>
      )}

      {/* --- SUMMARY MODAL --- */}
      {uploadSummary && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[150] flex items-center justify-center p-4">
             <div className="bg-white dark:bg-[#0F1629] w-full max-w-md rounded-[2.5rem] p-10 shadow-2xl animate-in zoom-in-95">
                <div className="text-center mb-8">
                   <div className="size-20 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6">
                      <CheckCircle2 size={40} />
                   </div>
                   <h3 className="text-3xl font-black text-slate-800 dark:text-white">Completed!</h3>
                   <div className="flex items-center justify-center gap-2 mt-2 text-slate-500 font-bold">
                       <Clock size={16}/> <span>{uploadSummary.duration}s</span>
                   </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4 mb-8">
                   <div className="bg-emerald-50 dark:bg-emerald-900/10 p-5 rounded-3xl border border-emerald-100 dark:border-emerald-800/30 text-center">
                      <span className="text-3xl font-black text-emerald-600">{uploadSummary.pass}</span>
                      <span className="block text-[10px] font-black text-emerald-400 uppercase mt-1">Pass</span>
                   </div>
                   <div className="bg-red-50 dark:bg-red-900/10 p-5 rounded-3xl border border-red-100 dark:border-red-800/30 text-center">
                      <span className="text-3xl font-black text-red-600">{uploadSummary.fail}</span>
                      <span className="block text-[10px] font-black text-red-400 uppercase mt-1">Fail</span>
                   </div>
                </div>

                {/* Error Log with Search */}
                {uploadSummary.failDetails.length > 0 && (
                    <div className="mb-6">
                        <div className="flex items-center justify-between mb-3">
                            <h5 className="text-[10px] font-black text-red-500 uppercase flex items-center gap-2"><AlertCircle size={12}/> Error Log</h5>
                            {uploadSummary.failDetails.length > 5 && (
                                <div className="relative">
                                    <input 
                                        type="text" 
                                        placeholder="Search error..." 
                                        className="bg-slate-50 dark:bg-slate-800 text-[10px] py-1 pl-6 pr-2 rounded-full border-none focus:ring-1 focus:ring-red-200"
                                        onChange={(e) => setSummarySearch(e.target.value)}
                                    />
                                    <Search size={10} className="absolute left-2 top-1/2 -translate-y-1/2 text-slate-400"/>
                                </div>
                            )}
                        </div>
                        <div className="bg-red-50 dark:bg-red-900/10 p-4 rounded-2xl max-h-40 overflow-y-auto custom-scrollbar border border-red-100 dark:border-red-800/30">
                            {uploadSummary.failDetails
                                .filter(f => f.toLowerCase().includes(summarySearch.toLowerCase()))
                                .map((f, i) => (
                                <div key={i} className="text-xs font-bold text-slate-600 dark:text-slate-400 border-b border-red-100 dark:border-red-800/50 last:border-0 py-2 flex items-center gap-2">
                                    <div className="size-1.5 rounded-full bg-red-400"></div> {f}
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                <button onClick={() => setUploadSummary(null)} className="w-full bg-slate-900 dark:bg-white dark:text-slate-900 text-white font-bold py-4 rounded-2xl shadow-xl hover:scale-[1.02] transition-transform">
                   Close Report
                </button>
             </div>
          </div>
      )}

    </div>
  );
};

export default ExcelImportPage;