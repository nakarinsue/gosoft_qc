import React, { useState, useEffect, useMemo } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip } from 'recharts';
import { 
  Check, UserPlus, ChevronDown, FileText, 
  Loader2, AlertCircle, Search, RefreshCw, X, Ticket, Filter, Layers, User,
  Banknote, Clock, AlertTriangle, FileSpreadsheet
} from 'lucide-react';
import { cn } from '../cn';
import couponService from '../services/couponService';

export default function CouponManagement({ actions }) {
  // Data States
  const [allVersions, setAllVersions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Filter States
  const [selectedVersion, setSelectedVersion] = useState('');
  const [statusFilter, setStatusFilter] = useState('All'); // All, Completed, Pending
  const [searchTerm, setSearchTerm] = useState('');

  // Interaction States
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [expandedFile, setExpandedFile] = useState(null);
  
  // Modal States
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [assignName, setAssignName] = useState('');

  // --- Helpers ---
  const getAllItems = (file) => {
    if (!file || !file.sheets) return [];
    return file.sheets.flatMap(sheet => 
        sheet.items.map(item => ({...item, _sheetName: sheet.sheet_name}))
    );
  };

  // Logic: ตรวจสอบว่า Status เป็น "PAY" หรือไม่
  const isPaid = (status) => status === 'PAY';

  const calculateStats = (items) => {
    if (!items || items.length === 0) return { success: 0, total: 0, percent: 0 };
    const successCount = items.filter(i => isPaid(i.status)).length;
    return {
        success: successCount,
        total: items.length,
        percent: (successCount / items.length) * 100
    };
  };

  // --- Fetch Data ---
  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await couponService.getData();
      
      if (Array.isArray(res) && res.length > 0) {
        // เรียงลำดับจาก Version มากไปน้อย
        const sortedData = res.sort((a, b) => Number(b.version) - Number(a.version));
        setAllVersions(sortedData);
        
        // เลือก Version สูงสุดเป็นค่าเริ่มต้น ถ้ายังไม่ได้เลือก
        if (!selectedVersion) {
            setSelectedVersion(String(sortedData[0].version));
        }
      } else {
        setAllVersions([]);
      }
    } catch (err) {
      setError("ไม่สามารถเชื่อมต่อ API หรือโครงสร้างข้อมูลไม่ถูกต้อง");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  // --- Derived State ---
  const currentVersionData = useMemo(() => {
    if (!allVersions.length || !selectedVersion) return null;
    return allVersions.find(v => String(v.version) === String(selectedVersion));
  }, [allVersions, selectedVersion]);

  // --- Filter Logic ---
  const filteredDetail = useMemo(() => {
    if (!currentVersionData || !currentVersionData.detail) return [];

    return currentVersionData.detail.filter(file => {
      // 1. Text Search
      const matchesSearch = file.file_name.toLowerCase().includes(searchTerm.toLowerCase());
      
      // 2. Status Filter
      let matchesStatus = true;
      const allItems = getAllItems(file);
      const stats = calculateStats(allItems);
      const isCompleted = stats.percent === 100;

      if (statusFilter === 'Completed') matchesStatus = isCompleted;
      if (statusFilter === 'Pending') matchesStatus = !isCompleted;

      return matchesSearch && matchesStatus;
    });
  }, [currentVersionData, searchTerm, statusFilter]);

  // --- Global Stats for Chart ---
  const globalStats = useMemo(() => {
    if (!currentVersionData || !currentVersionData.detail) return { success: 0, total: 0, percent: 0 };
    let success = 0, total = 0;
    
    currentVersionData.detail.forEach(file => {
        const items = getAllItems(file);
        total += items.length;
        success += items.filter(i => isPaid(i.status)).length;
    });
    
    return { 
        success, 
        total, 
        percent: total > 0 ? ((success/total)*100).toFixed(0) : 0 
    };
  }, [currentVersionData]);

  const chartData = [
    { name: 'PAY', value: globalStats.success },
    { name: 'NO PAY', value: globalStats.total - globalStats.success },
  ];

  // --- Actions ---
  const toggleSelect = (fileName) => {
    setSelectedFiles(prev => prev.includes(fileName) ? prev.filter(f => f !== fileName) : [...prev, fileName]);
  };

  const handleAssign = async () => {
    if (!assignName.trim()) return alert("กรุณาระบุชื่อผู้รับงาน");
    
    const selectedPromoCodes = currentVersionData.detail
      .filter(f => selectedFiles.includes(f.file_name))
      .flatMap(f => getAllItems(f))
      .map(i => i.promotion_code);

    try {
      await couponService.assignOwner(assignName, selectedPromoCodes);
      alert(`มอบหมายงานให้ ${assignName} เรียบร้อยแล้ว`);
      setShowAssignModal(false);
      setAssignName('');
      setSelectedFiles([]);
      fetchData(); 
    } catch (err) {
      alert("เกิดข้อผิดพลาดในการบันทึกข้อมูล");
    }
  };

  if (loading) return <div className="h-[60vh] flex flex-col items-center justify-center text-slate-400"><Loader2 size={48} className="animate-spin mb-4 text-blue-600"/><p className="text-sm font-bold uppercase tracking-widest animate-pulse">Loading Coupons...</p></div>;

  if (error) return (
    <div className="h-[60vh] flex flex-col items-center justify-center p-6 text-center">
        <div className="bg-white p-10 rounded-[2rem] shadow-xl border border-slate-200">
            <AlertCircle size={64} className="mb-4 mx-auto text-rose-500" />
            <h2 className="text-2xl font-black mb-2 text-slate-800">Connection Failed</h2>
            <p className="mb-6 text-slate-400 font-medium">{error}</p>
            <button onClick={fetchData} className="px-8 py-3 bg-blue-600 text-white rounded-xl font-bold hover:brightness-110 flex items-center justify-center gap-2 mx-auto"><RefreshCw size={20}/> Try Again</button>
        </div>
    </div>
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-20 p-6 bg-slate-50 min-h-screen">
      
      {/* --- Header Section --- */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Title & Info */}
        <div className="md:col-span-2 bg-white rounded-[2rem] p-8 shadow-sm border border-slate-200 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-10 opacity-5 pointer-events-none">
                <Layers size={200} className="text-blue-600"/>
            </div>

            <div className="relative z-10">
                <div className="flex items-center gap-3 mb-2">
                    <div className="p-3 bg-blue-50 rounded-2xl text-blue-600"><Ticket size={24} /></div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight">Coupon Dashboard</h1>
                </div>
                <p className="text-slate-500 font-medium ml-1">
                    System Version: <span className="text-blue-600 font-bold text-lg">{selectedVersion}</span>
                </p>
            </div>

            <div className="mt-8 flex flex-wrap items-center gap-4 relative z-10">
                <div className="flex items-center gap-2 px-4 py-2 bg-slate-100 rounded-xl border border-slate-200">
                    <span className="size-2 rounded-full bg-emerald-500 animate-pulse"></span>
                    <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">Live</span>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 bg-blue-50 rounded-xl border border-blue-100 text-blue-700">
                    <User size={14} />
                    <span className="text-xs font-black uppercase tracking-wider">
                        Owner: {currentVersionData?.MKname || 'Unassigned'}
                    </span>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 bg-orange-50 rounded-xl border border-orange-100 text-orange-700">
                    <span className="text-xs font-black uppercase tracking-wider">
                        SYSTEM: {currentVersionData?.SYSTEM || '-'}
                    </span>
                </div>
            </div>
        </div>

        {/* Stats Card */}
        <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-slate-200 flex items-center gap-6">
            <div className="size-32 relative flex-shrink-0">
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie data={chartData} innerRadius={40} outerRadius={55} dataKey="value" stroke="none" paddingAngle={5}>
                            <Cell fill="#10B981" /> {/* PAY - Green */}
                            <Cell fill="#F43F5E" /> {/* NO PAY - Red */}
                        </Pie>
                        <RechartsTooltip />
                    </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex items-center justify-center flex-col">
                    <span className="text-2xl font-black text-slate-800">{globalStats.percent}%</span>
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Paid</span>
                </div>
            </div>
            <div>
                <p className="text-[10px] text-slate-400 uppercase font-black tracking-widest mb-2">Summary</p>
                <div className="space-y-2">
                    <div className="flex items-center gap-2">
                        <div className="size-2 rounded-full bg-emerald-500"></div>
                        <p className="text-sm font-bold text-slate-700">{globalStats.success.toLocaleString()} <span className="text-slate-400 font-normal">Paid</span></p>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="size-2 rounded-full bg-rose-500"></div>
                        <p className="text-sm font-bold text-slate-700">{(globalStats.total - globalStats.success).toLocaleString()} <span className="text-slate-400 font-normal">Pending</span></p>
                    </div>
                </div>
            </div>
        </div>
      </div>

      {/* --- Filter Bar --- */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-white p-4 rounded-[2rem] shadow-sm border border-slate-200">
         <div className="flex flex-col md:flex-row items-center gap-3 w-full md:w-auto flex-1">
             <div className="relative w-full md:w-48 z-20">
                <Layers className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                <select 
                    className="w-full bg-slate-100 border border-slate-200 rounded-2xl py-3.5 pl-10 pr-8 outline-none focus:ring-2 ring-blue-500/50 transition-all text-sm font-black text-slate-800 cursor-pointer appearance-none"
                    value={selectedVersion}
                    onChange={(e) => setSelectedVersion(e.target.value)}
                >
                    {allVersions.map((v) => (
                        <option key={v.version} value={v.version}>Ver. {v.version}</option>
                    ))}
                </select>
                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
             </div>

             <div className="relative w-full group flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors" size={20} />
                <input 
                    type="text" 
                    placeholder="Search file name..."
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-3.5 pl-12 pr-4 outline-none focus:ring-2 ring-blue-500/50 transition-all text-sm font-bold text-slate-700"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
             </div>

             <div className="relative min-w-[160px] w-full md:w-auto">
                <Filter className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                <select 
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-3.5 pl-10 pr-8 outline-none focus:ring-2 ring-blue-500/50 transition-all text-sm font-bold text-slate-700 cursor-pointer appearance-none"
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                >
                    <option value="All">All Files</option>
                    <option value="Completed">Completed (100% Pay)</option>
                    <option value="Pending">Pending (No Pay)</option>
                </select>
                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
             </div>
         </div>

         <button onClick={fetchData} className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-slate-400 hover:text-blue-600 hover:bg-slate-100 transition-all flex-shrink-0">
            <RefreshCw size={20} className={loading ? 'animate-spin' : ''} />
         </button>
      </div>

      {/* --- Main Data Table --- */}
      <div className="bg-white rounded-[2.5rem] shadow-xl border border-slate-200 overflow-hidden min-h-[500px]">
        <div className="overflow-x-auto">
            <table className="w-full text-left">
                <thead>
                    <tr className="bg-slate-50 text-slate-900 text-[11px] uppercase font-black tracking-[0.2em] border-b border-slate-200">
                        <th className="p-6 w-20 text-center">#</th>
                        <th className="p-6">File Name / Sheets</th>
                        <th className="p-6 text-center">Progress (PAY)</th>
                        <th className="p-6 text-center">Status</th>
                        <th className="p-6 text-right">View Detail</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                    {!filteredDetail || filteredDetail.length === 0 ? (
                        <tr>
                            <td colSpan="5" className="p-20 text-center text-slate-400 font-bold">
                                No files found matching criteria.
                            </td>
                        </tr>
                    ) : (
                        filteredDetail.map((file, idx) => {
                            const allItems = getAllItems(file);
                            const stats = calculateStats(allItems);
                            const is100 = stats.percent === 100;
                            const isSelected = selectedFiles.includes(file.file_name);
                            const isExpanded = expandedFile === idx;

                            return (
                                <React.Fragment key={idx}>
                                    <tr className={`group transition-all ${is100 ? 'bg-white' : 'bg-rose-50/10'}`}>
                                        <td className="p-6 text-center">
                                            <input 
                                                type="checkbox" 
                                                checked={isSelected}
                                                onChange={() => toggleSelect(file.file_name)}
                                                className="size-5 rounded-md border-slate-300 text-blue-600 focus:ring-blue-600 cursor-pointer accent-blue-600"
                                            />
                                        </td>
                                        <td className="p-6">
                                            <div className="flex items-start gap-4">
                                                <div className={cn("p-3 rounded-xl flex-shrink-0", is100 ? "bg-emerald-100 text-emerald-600" : "bg-rose-100 text-rose-600")}>
                                                    <FileSpreadsheet size={24} />
                                                </div>
                                                <div>
                                                    <span className="text-sm font-bold text-slate-800 block mb-1 break-words max-w-md">{file.file_name}</span>
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded flex items-center gap-1">
                                                            <Layers size={10}/> {file.sheets.length} Sheets
                                                        </span>
                                                        <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded flex items-center gap-1">
                                                            <Ticket size={10}/> {stats.total} Promotions
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-6 w-1/4">
                                            <div className="flex items-center justify-between mb-1">
                                                <span className="text-xs font-bold text-slate-500">Paid: {stats.success}/{stats.total}</span>
                                                <span className={cn("text-xs font-black", is100 ? "text-emerald-600" : "text-rose-600")}>{stats.percent.toFixed(0)}%</span>
                                            </div>
                                            <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden">
                                                <div 
                                                    className={cn("h-full rounded-full transition-all duration-500", is100 ? "bg-emerald-500" : "bg-rose-500")} 
                                                    style={{ width: `${stats.percent}%` }}
                                                />
                                            </div>
                                        </td>
                                        <td className="p-6 text-center">
                                            {is100 ? (
                                                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-100 text-emerald-700 text-xs font-black border border-emerald-200">
                                                    <Check size={14}/> PAY COMPLETE
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-rose-100 text-rose-700 text-xs font-black border border-rose-200 animate-pulse">
                                                    <AlertTriangle size={14}/> PENDING {stats.total - stats.success}
                                                </span>
                                            )}
                                        </td>
                                        <td className="p-6 text-right">
                                            <button 
                                                onClick={() => setExpandedFile(isExpanded ? null : idx)}
                                                className={cn("p-3 rounded-xl transition-all border", isExpanded ? "bg-slate-900 text-white border-slate-900" : "bg-white text-slate-500 border-slate-200 hover:border-blue-400 hover:text-blue-600")}
                                            >
                                                <ChevronDown size={18} className={cn("transition-transform", isExpanded && "rotate-180")}/>
                                            </button>
                                        </td>
                                    </tr>
                                    
                                    {/* --- Expanded Detail (Split View) --- */}
                                    {isExpanded && (
                                        <tr className="bg-slate-50 border-y-2 border-slate-100 shadow-inner">
                                            <td colSpan="5" className="p-6 md:p-10">
                                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                                    
                                                    {/* LEFT: Unpaid / Pending (Priority) */}
                                                    <div className="bg-white rounded-3xl p-6 border border-rose-100 shadow-sm">
                                                        <div className="flex justify-between items-center mb-6 pb-4 border-b border-rose-50">
                                                            <div className="flex items-center gap-3">
                                                                <div className="p-2 bg-rose-100 text-rose-600 rounded-lg"><AlertTriangle size={20}/></div>
                                                                <div>
                                                                    <h4 className="text-rose-600 font-black text-sm uppercase">Pending / No Pay</h4>
                                                                    <p className="text-xs text-rose-400 font-bold">Requires Action</p>
                                                                </div>
                                                            </div>
                                                            <span className="text-2xl font-black text-rose-500">{stats.total - stats.success}</span>
                                                        </div>

                                                        <div className="space-y-3 max-h-[400px] overflow-y-auto custom-scrollbar pr-2">
                                                            {allItems.filter(i => !isPaid(i.status)).length === 0 ? (
                                                                <div className="text-center py-12">
                                                                    <Check size={48} className="mx-auto text-emerald-200 mb-2"/>
                                                                    <p className="text-emerald-400 font-bold text-sm">All items are paid!</p>
                                                                </div>
                                                            ) : (
                                                                allItems.filter(i => !isPaid(i.status)).map((item, i) => (
                                                                    <div key={i} className="p-4 bg-rose-50/50 rounded-2xl border border-rose-100 flex justify-between items-start group hover:bg-rose-50 transition-colors">
                                                                        <div>
                                                                            <div className="flex items-center gap-2 mb-1">
                                                                                <span className="px-2 py-0.5 bg-white border border-rose-200 text-rose-500 text-[10px] font-bold rounded uppercase">{item._sheetName}</span>
                                                                                <span className="text-[10px] text-slate-400 font-mono">#{item.promotion_code}</span>
                                                                            </div>
                                                                            <p className="font-bold text-slate-700 text-sm">{item.promotion_name}</p>
                                                                            <p className="text-xs text-slate-400 mt-1">Date: {item.START_DATE} - {item.END_DATE}</p>
                                                                        </div>
                                                                        <div className="text-right">
                                                                            <span className="inline-block px-3 py-1 bg-white border border-rose-200 text-rose-600 text-[10px] font-bold rounded-lg uppercase shadow-sm">
                                                                                {item.status || 'NO PAY'}
                                                                            </span>
                                                                        </div>
                                                                    </div>
                                                                ))
                                                            )}
                                                        </div>
                                                    </div>

                                                    {/* RIGHT: Paid / Completed */}
                                                    <div className="bg-white rounded-3xl p-6 border border-emerald-100 shadow-sm opacity-80 hover:opacity-100 transition-opacity">
                                                        <div className="flex justify-between items-center mb-6 pb-4 border-b border-emerald-50">
                                                            <div className="flex items-center gap-3">
                                                                <div className="p-2 bg-emerald-100 text-emerald-600 rounded-lg"><Banknote size={20}/></div>
                                                                <div>
                                                                    <h4 className="text-emerald-600 font-black text-sm uppercase">Completed / Paid</h4>
                                                                    <p className="text-xs text-emerald-400 font-bold">Processed Items</p>
                                                                </div>
                                                            </div>
                                                            <span className="text-2xl font-black text-emerald-500">{stats.success}</span>
                                                        </div>

                                                        <div className="space-y-3 max-h-[400px] overflow-y-auto custom-scrollbar pr-2">
                                                            {allItems.filter(i => isPaid(i.status)).map((item, i) => (
                                                                <div key={i} className="p-4 bg-emerald-50/30 rounded-2xl border border-emerald-100 flex justify-between items-center">
                                                                    <div>
                                                                        <div className="flex items-center gap-2 mb-1">
                                                                            <span className="px-2 py-0.5 bg-white border border-emerald-200 text-emerald-600 text-[10px] font-bold rounded uppercase">{item._sheetName}</span>
                                                                            <span className="text-[10px] text-slate-400 font-mono">#{item.promotion_code}</span>
                                                                        </div>
                                                                        <p className="font-bold text-slate-700 text-sm truncate max-w-[200px]">{item.promotion_name}</p>
                                                                    </div>
                                                                    <div className="text-right">
                                                                        <span className="inline-flex items-center gap-1 px-3 py-1 bg-emerald-100 text-emerald-700 text-[10px] font-bold rounded-lg uppercase">
                                                                            <Check size={10}/> PAY
                                                                        </span>
                                                                    </div>
                                                                </div>
                                                            ))}
                                                            {allItems.filter(i => isPaid(i.status)).length === 0 && (
                                                                <div className="text-center py-12 text-slate-400 text-xs">No paid items yet.</div>
                                                            )}
                                                        </div>
                                                    </div>

                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </React.Fragment>
                            );
                        })
                    )}
                </tbody>
            </table>
        </div>
      </div>

      {/* Floating Action Bar (Code เดิม) */}
      {selectedFiles.length > 0 && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-slate-900/90 backdrop-blur-xl shadow-2xl rounded-[2rem] p-3 pl-6 flex items-center gap-6 z-50 animate-in slide-in-from-bottom-10 border border-slate-800">
            <div className="flex items-center gap-3 border-r border-slate-700 pr-6">
                <span className="bg-blue-600 text-white text-sm font-black size-8 flex items-center justify-center rounded-lg">{selectedFiles.length}</span>
                <div><p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Selected</p><p className="text-xs font-bold text-white">Files Queue</p></div>
            </div>
            <div className="flex items-center gap-2">
                <button onClick={() => setShowAssignModal(true)} className="flex items-center gap-2 px-5 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-black uppercase tracking-wide transition-all shadow-lg shadow-blue-600/20 active:scale-95"><UserPlus size={16} /> Assign</button>
                <button onClick={() => setSelectedFiles([])} className="p-3 hover:bg-slate-800 text-slate-400 hover:text-white rounded-xl transition-all ml-2"><X size={20}/></button>
            </div>
        </div>
      )}

      {/* Assign Modal (Code เดิม) */}
      {showAssignModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
            <div className="bg-white rounded-[2.5rem] p-10 w-full max-w-md shadow-2xl border border-slate-100 animate-in zoom-in-95">
                <div className="text-center">
                    <div className="size-20 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-6"><UserPlus size={32}/></div>
                    <h3 className="text-2xl font-black text-slate-900 mb-2">Assign Workload</h3>
                    <p className="text-slate-500 text-sm mb-8">Assigning <strong className="text-blue-600">{selectedFiles.length} files</strong> to a marketing officer.</p>
                    <input autoFocus type="text" className="w-full text-center text-xl font-bold bg-slate-50 border-none rounded-2xl py-4 mb-6 focus:ring-2 ring-blue-500 placeholder:text-slate-300" placeholder="Enter Name..." value={assignName} onChange={e => setAssignName(e.target.value)} />
                    <div className="flex gap-3">
                        <button onClick={() => setShowAssignModal(false)} className="flex-1 py-4 bg-slate-100 text-slate-500 font-bold rounded-2xl hover:bg-slate-200 transition-colors">Cancel</button>
                        <button onClick={handleAssign} className="flex-1 py-4 bg-blue-600 text-white font-bold rounded-2xl hover:bg-blue-700 shadow-lg shadow-blue-600/30 transition-all active:scale-95">Confirm</button>
                    </div>
                </div>
            </div>
        </div>
      )}
    </div>
  );
}