import React, { useState, useEffect, useMemo } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell 
} from 'recharts';
import { 
  Search, Save, RefreshCcw, ArrowLeft, AlertCircle, FileSpreadsheet, CheckCircle2,
  ChevronDown, LayoutDashboard, Image as ImageIcon, X, Eye, SlidersHorizontal, AlertTriangle, Database, FileText, User, Tag, Layers
} from 'lucide-react';

// --- CONFIGURATION ---
// ปรับแก้ URL ให้ตรงกับ Environment ของคุณ
import { API_BASE_URL, MINIO_BASE_URL, STATUS_OPTIONS } from '../config';

// --- UTILITY ---
const normalizeText = (text) => {
    if (!text) return '';
    return text.toString().toLowerCase().replace(/[^a-z0-9]/g, '');
};

const COLUMN_CONFIG = [
    { key: 'action', label: 'View', width: 'w-[70px] min-w-[70px]' }, 
    { key: 'no', label: 'No.', width: 'w-[60px] min-w-[60px]' },
    { key: 'proCode', label: 'Pro. Code', width: 'w-[110px] min-w-[110px]' },
    { key: 'proName', label: 'Promotion Name', width: 'w-[200px] min-w-[200px]' },
    { key: 'types', label: 'Defect Type', width: 'w-[180px] min-w-[180px]' },
    { key: 'status', label: 'Status', width: 'w-[140px] min-w-[140px]' },
    { key: 'username', label: 'Reporter', width: 'w-[140px] min-w-[140px]' },
    { key: 'detail', label: 'Detail (Preview)', width: 'w-[250px] min-w-[250px]' },
    { key: 'image', label: 'Image', width: 'w-[90px] min-w-[90px]' },
    { key: 'sheet', label: 'Sheet', width: 'w-[120px] min-w-[120px]' },
    { key: 'file', label: 'File', width: 'w-[180px] min-w-[180px]' },   
    { key: 'remark', label: 'Remark', width: 'w-[250px] min-w-[250px]' }, 
];

export default function PublicReportScreen({ onBack }) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Filter State
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [pendingFilters, setPendingFilters] = useState({});
  const [activeFilters, setActiveFilters] = useState({});  
  const [activeUserKey, setActiveUserKey] = useState('all'); 

  // Popup & Edit State
  const [selectedRow, setSelectedRow] = useState(null);
  const [popupEdits, setPopupEdits] = useState({ status: null, remark: '' });
  const [showUnsavedAlert, setShowUnsavedAlert] = useState(false);
  const [isPopupDirty, setIsPopupDirty] = useState(false);
  
  // Image Viewer State
  const [selectedImage, setSelectedImage] = useState(null);

  // Notification States
  const [toast, setToast] = useState({ show: false, message: '' }); 
  const [errorModal, setErrorModal] = useState({ show: false, message: '' });

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    let timer;
    if (toast.show) {
        timer = setTimeout(() => {
            setToast({ show: false, message: '' });
        }, 5000);
    }
    return () => clearTimeout(timer);
  }, [toast.show]);

  // --- 1. Fetch Data Mapping (แก้ไขให้ตรงกับ API ใหม่) ---
  const fetchData = async () => {
    setLoading(true);
    try {
        const response = await fetch(`${API_BASE_URL}/DEFECT`); 
        if (!response.ok) throw new Error('Network response was not ok');
        const apiData = await response.json();
        
        const formattedData = apiData.map((item, index) => {
            let imageUrl = '';
            // ตรวจสอบ Image logic ตามเดิม
            if (item.image) {
                imageUrl = item.image.startsWith('http') ? item.image : `${MINIO_BASE_URL}/${item.image}`;
            } else if (item.file && (item.file.toLowerCase().endsWith('.png') || item.file.toLowerCase().endsWith('.jpg'))) {
                 // เผื่อกรณี image มากับ file
                 imageUrl = `${MINIO_BASE_URL}/${item.file}`;
            }

            const typeList = item.types ? String(item.types).split(',').map(t => t.trim()) : ['-'];

            return {
                id: item.id,
                no: index + 1,
                // --- MAPPING API FIELDS ---
                username: item.user_mk || 'System', // Map user_mk เป็น username
                proCode: item.PROMOTION_CODE || '-', // Map PROMOTION_CODE
                proName: item.PROMOTION_NAME || '-', // Map PROMOTION_NAME
                system: item.system || '-',
                types: typeList,
                detail: item.detail || '-',
                image: imageUrl,
                status: item.status || 1,
                remark: item.remark || '', 
                userLog: item.userLog || '-',
                sheet: item.sheet || '-',
                file: item.file || '-',
                // เก็บค่าเดิมไว้สำหรับตอน Update (Hidden Fields)
                qty: item.QTY || 0,
                type_other: item.OTHER || '',
                link_url: '' // API GET ไม่ได้ส่งมา แต่เตรียมไว้สำหรับ POST
            };
        });
        setData(formattedData);
    } catch (error) {
        console.error("Error fetching report:", error);
        setData([]); 
    } finally {
        setLoading(false);
    }
  };

  // --- Logic Grouping & Filter (คงเดิม) ---
  const userGroups = useMemo(() => {
      const groups = {};
      data.forEach(item => {
          const rawName = item.username;
          const key = normalizeText(rawName);
          if (!groups[key]) {
              groups[key] = { key: key, label: rawName, count: 0 };
          }
          groups[key].count += 1;
      });
      return Object.values(groups).sort((a, b) => a.label.localeCompare(b.label));
  }, [data]);

  const filteredData = useMemo(() => {
    return data.filter(item => {
      if (activeUserKey !== 'all') {
          if (normalizeText(item.username) !== activeUserKey) return false;
      }
      return Object.entries(activeFilters).every(([key, value]) => {
        if (!value) return true;
        if (key === 'types') {
            return item.types.some(t => t.toLowerCase().includes(value.toLowerCase()));
        }
        const itemValue = String(item[key]).toLowerCase();
        return itemValue.includes(value.toLowerCase());
      });
    });
  }, [data, activeFilters, activeUserKey]);

  const handleApplyFilters = () => { setActiveFilters(pendingFilters); setIsFilterOpen(false); };
  const handleClearFilters = () => { setPendingFilters({}); setActiveFilters({}); };

  // --- Popup Logic ---
  const handleOpenDetail = (row) => {
    setSelectedRow(row);
    setPopupEdits({ status: row.status, remark: row.remark });
    setIsPopupDirty(false);
  };

  const handlePopupChange = (field, value) => {
    const newValue = field === 'status' ? parseInt(value) : value;
    setPopupEdits(prev => {
        const newState = { ...prev, [field]: newValue };
        const isChanged = newState.status !== selectedRow.status || newState.remark !== selectedRow.remark;
        setIsPopupDirty(isChanged);
        return newState;
    });
  };

  const handleCloseAttempt = () => {
    if (isPopupDirty) { setShowUnsavedAlert(true); } else { setSelectedRow(null); }
  };
  const handleConfirmDiscard = () => { setShowUnsavedAlert(false); setSelectedRow(null); setIsPopupDirty(false); };

  // --- 2. Update Logic (ส่ง Payload แบบใหม่) ---
  const handlePopupSave = async () => {
    if (!selectedRow) return;
    try {
        // Construct Payload ตาม Format ที่กำหนด
        const payload = {
            detail: selectedRow.detail, // ส่งค่าเดิมกลับไป
            qty: selectedRow.qty,       // ส่งค่าเดิม
            types: selectedRow.types.join(','), // Join array กลับเป็น string
            type_other: selectedRow.type_other,
            link_url: selectedRow.link_url,
            remark: popupEdits.remark,  // ค่าที่แก้ไข
            status: popupEdits.status   // ค่าที่แก้ไข
        };

        const res = await fetch(`${API_BASE_URL}/DEFECT/UPDATE/${selectedRow.id}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (!res.ok) throw new Error(`Failed to update ID ${selectedRow.id}`);

        // Update Local State
        setData(prev => prev.map(item => {
            if (item.id === selectedRow.id) {
                return { ...item, remark: payload.remark, status: payload.status };
            }
            return item;
        }));

        setSelectedRow(null);
        setIsPopupDirty(false);
        setToast({ show: true, message: 'บันทึกข้อมูลสำเร็จเรียบร้อยแล้ว' });

    } catch (error) {
        console.error("Save Error:", error);
        setErrorModal({ show: true, message: 'เกิดข้อผิดพลาดในการเชื่อมต่อเซิร์ฟเวอร์ ไม่สามารถบันทึกข้อมูลได้' });
    }
  };

  // --- Stats Logic ---
  const stats = useMemo(() => {
    const total = filteredData.length;
    const resolved = filteredData.filter(d => d.status === 4 || d.status === 6).length;
    const pending = total - resolved;
    return { total, resolved, pending };
  }, [filteredData]);

  const pieChartData = useMemo(() => {
    const counts = {};
    filteredData.forEach(d => {
        counts[d.status] = (counts[d.status] || 0) + 1;
    });
    return Object.entries(STATUS_OPTIONS).map(([key, config]) => ({
        name: config.label,
        value: counts[key] || 0,
        color: config.hex
    })).filter(item => item.value > 0);
  }, [filteredData]);

  if (loading) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50">
      <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
      <p className="mt-4 text-slate-500 font-medium animate-pulse">Loading Defect Data...</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50/50 font-sans pb-24 text-slate-800">
      
      {/* Header */}
      <div className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-slate-200 shadow-sm">
        <div className="max-w-[1920px] mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
             <div className="p-2.5 bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl text-white shadow-lg">
                <LayoutDashboard className="w-6 h-6" />
             </div>
             <div>
                <h1 className="text-xl font-bold text-slate-800 leading-none">Defect Monitoring</h1>
                <p className="text-xs text-slate-500 font-medium mt-1">Real-time Data & Analytics</p>
             </div>
          </div>
          <button onClick={onBack} className="group flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-blue-600 transition-all px-4 py-2 hover:bg-blue-50 rounded-xl">
             <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> Back
          </button>
        </div>
      </div>

      <div className="max-w-[1920px] mx-auto px-6 py-8 space-y-8 animate-in fade-in duration-500">
        
        {/* --- Top Stats Cards --- */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
           <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 relative overflow-hidden group">
              <div className="absolute right-0 top-0 w-32 h-32 bg-blue-50 rounded-full -mr-10 -mt-10 group-hover:scale-110 transition-transform duration-500"></div>
              <div className="relative z-10">
                 <p className="text-slate-500 text-sm font-bold uppercase tracking-wider mb-1">Total Defects</p>
                 <h2 className="text-4xl font-black text-slate-800">{stats.total}</h2>
                 <div className="mt-6 flex gap-4">
                    <div className="flex-1 p-3 bg-emerald-50 rounded-xl border border-emerald-100">
                       <div className="text-xs text-emerald-600 font-bold uppercase mb-1">Resolved</div>
                       <div className="text-2xl font-bold text-emerald-700">{stats.resolved}</div>
                    </div>
                    <div className="flex-1 p-3 bg-rose-50 rounded-xl border border-rose-100">
                       <div className="text-xs text-rose-600 font-bold uppercase mb-1">Pending</div>
                       <div className="text-2xl font-bold text-rose-700">{stats.pending}</div>
                    </div>
                 </div>
              </div>
           </div>

           <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex flex-col">
              <div className="flex items-center gap-2 mb-4">
                 <div className="w-1.5 h-6 bg-purple-500 rounded-full"></div>
                 <h3 className="text-sm font-bold text-slate-700 uppercase">Status Breakdown</h3>
              </div>
              <div className="flex-1 min-h-[160px]">
                 <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie data={pieChartData} innerRadius={55} outerRadius={75} paddingAngle={5} dataKey="value" stroke="none">
                            {pieChartData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                        </Pie>
                        <Tooltip contentStyle={{borderRadius:'12px', border:'none', boxShadow:'0 10px 25px -5px rgba(0,0,0,0.1)'}} itemStyle={{color:'#1e293b', fontWeight:'bold'}} />
                    </PieChart>
                 </ResponsiveContainer>
              </div>
           </div>

           <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex flex-col">
              <div className="flex items-center gap-2 mb-4">
                 <div className="w-1.5 h-6 bg-orange-500 rounded-full"></div>
                 <h3 className="text-sm font-bold text-slate-700 uppercase">System Overview</h3>
              </div>
              <div className="flex-1 min-h-[160px]">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={[
                        { name: 'POS', value: filteredData.filter(d => d.system === 'POS').length }, 
                        { name: 'Delivery', value: filteredData.filter(d => d.system === 'DELIVERY').length }
                    ]}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize:12, fill:'#64748b', fontWeight:'600'}} dy={10} />
                        <Tooltip cursor={{fill:'#f8fafc', radius:8}} contentStyle={{borderRadius:'12px', border:'none', boxShadow:'0 4px 6px -1px rgb(0 0 0 / 0.1)'}} />
                        <Bar dataKey="value" fill="#6366f1" radius={[8, 8, 0, 0]} barSize={40}>
                             <Cell fill="#6366f1" />
                             <Cell fill="#8b5cf6" />
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
              </div>
           </div>
        </div>

        {/* --- Tools & Filters --- */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
            {/* User Filter */}
            <div className="w-full lg:flex-1 bg-white p-2 rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="flex items-center gap-2 overflow-x-auto pb-1 px-1 custom-scrollbar">
                    <span className="text-xs font-bold text-slate-400 uppercase mr-2 flex-shrink-0 flex items-center gap-1">
                        <User className="w-3 h-3"/> Reporter:
                    </span>
                    <button onClick={() => setActiveUserKey('all')} className={`flex-shrink-0 px-4 py-2 rounded-xl text-sm font-bold transition-all border ${activeUserKey === 'all' ? 'bg-slate-800 text-white border-slate-800 shadow-md' : 'bg-white text-slate-500 border-transparent hover:bg-slate-50'}`}>All</button>
                    {userGroups.map(group => (
                        <button key={group.key} onClick={() => setActiveUserKey(group.key)} className={`flex-shrink-0 px-4 py-2 rounded-xl text-sm font-bold transition-all border flex items-center gap-2 ${activeUserKey === group.key ? 'bg-blue-600 text-white border-blue-600 shadow-md' : 'bg-slate-50 text-slate-600 border-slate-100 hover:bg-white hover:border-blue-200 hover:text-blue-600'}`}>
                            {group.label} <span className={`text-[10px] px-1.5 py-0.5 rounded-md ${activeUserKey === group.key ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-500'}`}>{group.count}</span>
                        </button>
                    ))}
                </div>
            </div>

            <button onClick={() => setIsFilterOpen(!isFilterOpen)} className={`flex-shrink-0 flex items-center gap-2 px-6 py-4 rounded-2xl font-bold shadow-sm border transition-all ${isFilterOpen ? 'bg-blue-50 border-blue-200 text-blue-600' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'}`}>
                <SlidersHorizontal className="w-5 h-5" /> {isFilterOpen ? 'Hide Filters' : 'Advanced Filters'}
            </button>
        </div>

        {/* Filter Panel */}
        {isFilterOpen && (
            <div className="bg-white p-8 rounded-3xl shadow-xl border border-slate-100 animate-in slide-in-from-top-4">
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
                    {COLUMN_CONFIG.filter(col => !['action','image','detail'].includes(col.key)).map(col => (
                        <div key={col.key}>
                            <label className="text-xs font-bold text-slate-400 uppercase tracking-wide block mb-2">{col.label}</label>
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                                <input type="text" className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-700 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all" placeholder={`Search...`} value={pendingFilters[col.key] || ''} onChange={(e) => setPendingFilters(prev => ({...prev, [col.key]: e.target.value}))}/>
                            </div>
                        </div>
                    ))}
                </div>
                <div className="mt-8 flex justify-end gap-3 pt-6 border-t border-slate-50">
                    <button onClick={handleClearFilters} className="text-sm font-bold text-red-500 hover:bg-red-50 px-4 py-2 rounded-lg transition-colors mr-auto">Reset</button>
                    <button onClick={() => setIsFilterOpen(false)} className="px-6 py-3 rounded-xl text-slate-500 font-bold hover:bg-slate-100">Cancel</button>
                    <button onClick={handleApplyFilters} className="px-8 py-3 bg-blue-600 text-white rounded-xl font-bold shadow-lg shadow-blue-600/30 hover:bg-blue-700">Apply Filters</button>
                </div>
            </div>
        )}

        {/* --- Data Table --- */}
        <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="overflow-x-auto max-h-[750px] custom-scrollbar">
                <table className="w-full text-left border-collapse">
                    <thead className="bg-slate-50/80 backdrop-blur sticky top-0 z-20 border-b border-slate-200">
                        <tr>
                            {COLUMN_CONFIG.map((col) => (
                                <th key={col.key} className={`px-5 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider ${col.width}`}>{col.label}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-sm">
                        {filteredData.length > 0 ? (
                            filteredData.map((item) => (
                                <tr key={item.id} className="hover:bg-blue-50/30 transition-colors group">
                                    <td className="px-5 py-4 text-center">
                                        <button onClick={() => handleOpenDetail(item)} className="p-2.5 bg-white text-slate-400 border border-slate-200 rounded-xl hover:bg-blue-600 hover:text-white hover:border-blue-600 hover:shadow-lg transition-all"><Eye className="w-4 h-4" /></button>
                                    </td>
                                    <td className="px-5 py-4 font-mono text-slate-400 font-semibold">{item.no}</td>
                                    <td className="px-5 py-4 font-bold text-slate-700">{item.proCode}</td>
                                    <td className="px-5 py-4 text-slate-600 font-medium truncate max-w-[200px]" title={item.proName}>{item.proName}</td>
                                    <td className="px-5 py-4">
                                        <div className="flex flex-wrap gap-1">
                                            {item.types.map((t, idx) => (
                                                <span key={idx} className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 text-[11px] font-bold border border-slate-200">{t}</span>
                                            ))}
                                        </div>
                                    </td>
                                    <td className="px-5 py-4">
                                        <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border ${STATUS_OPTIONS[item.status]?.color || 'bg-gray-100 text-gray-500 border-gray-200'}`}>
                                            <span className="w-1.5 h-1.5 rounded-full bg-current opacity-75"></span>
                                            {STATUS_OPTIONS[item.status]?.label || 'Unknown'}
                                        </span>
                                    </td>
                                    <td className="px-5 py-4">
                                        <div className="flex items-center gap-2">
                                            <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-blue-400 to-indigo-500 text-white flex items-center justify-center text-[10px] font-bold">{item.username.charAt(0).toUpperCase()}</div>
                                            <span className="text-slate-700 font-bold">{item.username}</span>
                                        </div>
                                    </td>
                                    <td className="px-5 py-4 text-slate-500 truncate max-w-[250px]">{item.detail}</td>
                                    <td className="px-5 py-4">
                                        {item.image ? (
                                            <button onClick={() => setSelectedImage(item.image)} className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 text-indigo-600 rounded-lg text-xs font-bold border border-indigo-100 hover:bg-indigo-600 hover:text-white transition-all"><ImageIcon className="w-3.5 h-3.5" /> View</button>
                                        ) : <span className="text-slate-300 text-xs">-</span>}
                                    </td>
                                    <td className="px-5 py-4 text-slate-500 text-xs font-mono">{item.sheet}</td>
                                    <td className="px-5 py-4 text-slate-500 text-xs font-mono truncate max-w-[150px]">{item.file}</td>
                                    <td className="px-5 py-4 text-slate-500 italic text-xs truncate max-w-[200px]">{item.remark}</td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={COLUMN_CONFIG.length} className="py-20 text-center">
                                    <div className="flex flex-col items-center justify-center opacity-50">
                                        <Database className="w-16 h-16 text-slate-300 mb-4" />
                                        <p className="text-lg font-bold text-slate-400">No Data Found</p>
                                    </div>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
      </div>

      {/* --- Detail Popup (Redesigned for better data display) --- */}
      {selectedRow && (
        <div className="fixed inset-0 z-40 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300" onClick={handleCloseAttempt}></div>
            <div className="bg-white rounded-[2rem] w-full max-w-6xl max-h-[90vh] overflow-hidden shadow-2xl flex flex-col relative z-10 animate-in zoom-in-95 duration-300 border border-slate-100">
                
                {/* Modal Header */}
                <div className="px-8 py-6 border-b border-slate-100 flex justify-between items-center bg-white">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-blue-600 rounded-2xl text-white shadow-lg shadow-blue-500/30">
                            <FileSpreadsheet className="w-6 h-6" />
                        </div>
                        <div>
                            <h3 className="font-bold text-xl text-slate-800">Defect Details</h3>
                            <div className="flex items-center gap-2 mt-1">
                                <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-500 text-xs font-mono font-bold">ID: {selectedRow.id}</span>
                                <span className="text-slate-300">|</span>
                                <span className={`text-xs font-bold ${STATUS_OPTIONS[selectedRow.status]?.color?.replace('bg-', 'text-').replace('text-', 'text-opacity-80-')}`}>{STATUS_OPTIONS[selectedRow.status]?.label}</span>
                            </div>
                        </div>
                    </div>
                    <button onClick={handleCloseAttempt} className="p-2.5 bg-slate-50 hover:bg-slate-100 text-slate-400 hover:text-slate-600 rounded-full transition-all">
                        <X className="w-6 h-6" />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto custom-scrollbar bg-slate-50/50 p-8">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 h-full">
                        
                        {/* --- LEFT COLUMN: INFO (7 cols) --- */}
                        <div className="lg:col-span-7 space-y-6">
                            
                            {/* 1. Promotion Info */}
                            <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
                                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2 mb-4">
                                    <Tag className="w-4 h-4 text-blue-500"/> Promotion Information
                                </h4>
                                <div className="space-y-4">
                                    <div className="flex items-start gap-4">
                                        <div className="px-4 py-2 bg-blue-50 text-blue-700 font-mono font-bold rounded-xl border border-blue-100 text-lg">
                                            {selectedRow.proCode}
                                        </div>
                                        <div>
                                            <p className="text-lg font-bold text-slate-800 leading-snug">{selectedRow.proName}</p>
                                            <p className="text-sm text-slate-500 mt-1">System: <span className="font-bold text-slate-700">{selectedRow.system}</span></p>
                                        </div>
                                    </div>
                                    <div className="flex flex-wrap gap-2 mt-2">
                                         {selectedRow.types.map((t, i) => (
                                             <span key={i} className="px-3 py-1 bg-slate-100 text-slate-600 text-xs font-bold rounded-lg border border-slate-200 flex items-center gap-1">
                                                <AlertCircle className="w-3 h-3"/> {t}
                                             </span>
                                         ))}
                                    </div>
                                </div>
                            </div>

                            {/* 2. Full Detail (Important Update) */}
                            <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex-1">
                                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2 mb-4">
                                    <FileText className="w-4 h-4 text-orange-500"/> Full Description
                                </h4>
                                <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200">
                                    <p className="text-slate-700 font-medium leading-relaxed whitespace-pre-wrap text-base">
                                        {selectedRow.detail}
                                    </p>
                                </div>
                                <div className="mt-4 grid grid-cols-2 gap-4">
                                    <div className="p-3 border border-slate-100 rounded-xl">
                                        <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Source File</label>
                                        <p className="text-sm font-mono text-slate-600 truncate">{selectedRow.file}</p>
                                    </div>
                                    <div className="p-3 border border-slate-100 rounded-xl">
                                        <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Sheet Name</label>
                                        <p className="text-sm font-mono text-slate-600 truncate">{selectedRow.sheet}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* --- RIGHT COLUMN: ACTIONS (5 cols) --- */}
                        <div className="lg:col-span-5 space-y-6">
                            
                            {/* Evidence Image */}
                            {selectedRow.image && (
                                <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
                                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest block mb-4">Evidence</label>
                                    <div onClick={() => setSelectedImage(selectedRow.image)} className="relative h-48 rounded-2xl overflow-hidden cursor-zoom-in group border border-slate-100">
                                        <img src={selectedRow.image} alt="Defect" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                                        <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-[2px]">
                                            <div className="bg-white/20 backdrop-blur-md px-4 py-2 rounded-full text-white font-bold flex items-center gap-2 border border-white/30">
                                                <ImageIcon className="w-4 h-4" /> Click to Expand
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Update Form */}
                            <div className="bg-white p-6 rounded-3xl border border-blue-100 shadow-lg shadow-blue-500/5 relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50/50 rounded-full -mr-16 -mt-16 pointer-events-none"></div>
                                <h4 className="font-bold text-slate-800 mb-6 flex items-center gap-2 relative z-10">
                                    <div className="p-1.5 bg-blue-100 rounded-lg text-blue-600"><RefreshCcw className="w-4 h-4"/></div> 
                                    Update Status & Note
                                </h4>
                                <div className="space-y-5 relative z-10">
                                    <div>
                                        <label className="text-xs font-bold text-slate-500 mb-2 block uppercase">Current Status</label>
                                        <div className="relative">
                                            <select value={popupEdits.status} onChange={(e) => handlePopupChange('status', e.target.value)} className="w-full pl-4 pr-10 py-3.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-700 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all appearance-none cursor-pointer hover:border-blue-300">
                                                {Object.entries(STATUS_OPTIONS).map(([val, opt]) => (
                                                    <option key={val} value={val}>{opt.label} - {opt.Desc}</option>
                                                ))}
                                            </select>
                                            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none"/>
                                        </div>
                                    </div>
                                    <div>
                                        <label className="text-xs font-bold text-slate-500 mb-2 block uppercase">Remark (Notes)</label>
                                        <textarea rows={4} value={popupEdits.remark} onChange={(e) => handlePopupChange('remark', e.target.value)} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 resize-none transition-all placeholder:text-slate-400" placeholder="Enter note..."/>
                                    </div>
                                    <div className="flex items-center gap-2 text-xs text-slate-400 bg-slate-50 p-3 rounded-lg">
                                        <User className="w-3 h-3"/> Reporter: <span className="font-bold text-slate-600">{selectedRow.username}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Modal Footer */}
                <div className="p-6 border-t border-slate-100 bg-white flex justify-end gap-3 z-10">
                    <button onClick={handleCloseAttempt} className="px-6 py-3 rounded-xl text-slate-500 font-bold hover:bg-slate-50 transition-colors">Cancel</button>
                    <button onClick={handlePopupSave} disabled={!isPopupDirty} className={`px-8 py-3 rounded-xl font-bold text-white shadow-lg transition-all flex items-center gap-2 transform active:scale-95 ${isPopupDirty ? 'bg-blue-600 hover:bg-blue-700 shadow-blue-500/30 hover:-translate-y-0.5' : 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none'}`}>
                        <Save className="w-4 h-4" /> Save Changes
                    </button>
                </div>

                {/* Unsaved Alert */}
                {showUnsavedAlert && (
                    <div className="absolute inset-0 z-50 bg-white/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in">
                        <div className="bg-white p-8 rounded-3xl shadow-2xl max-w-sm w-full text-center border border-red-100 animate-in zoom-in-95 ring-1 ring-slate-900/5">
                            <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
                                <AlertCircle className="w-8 h-8 text-red-500" />
                            </div>
                            <h3 className="font-black text-xl text-slate-800 mb-2">Unsaved Changes</h3>
                            <p className="text-slate-500 font-medium mb-8">Discard your changes?</p>
                            <div className="grid grid-cols-2 gap-4">
                                <button onClick={() => setShowUnsavedAlert(false)} className="py-3 rounded-xl border-2 border-slate-100 font-bold text-slate-600 hover:bg-slate-50">Keep Editing</button>
                                <button onClick={handleConfirmDiscard} className="py-3 rounded-xl bg-red-500 text-white font-bold hover:bg-red-600 shadow-lg shadow-red-500/30">Discard</button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
      )}

      {/* --- Toast & Modals --- */}
      {toast.show && (
         <div className="fixed bottom-8 right-8 z-[70] bg-white border-l-4 border-emerald-500 pl-4 pr-6 py-4 rounded-2xl shadow-2xl animate-in slide-in-from-right-10 flex items-center gap-4 max-w-md ring-1 ring-slate-900/5">
             <div className="p-2 bg-emerald-100 rounded-full text-emerald-600"><CheckCircle2 className="w-5 h-5" /></div>
             <div><h4 className="font-bold text-slate-800 text-sm">Success</h4><p className="text-sm text-slate-500 font-medium">{toast.message}</p></div>
             <button onClick={() => setToast({ show: false, message: '' })} className="ml-auto text-slate-300 hover:text-slate-500"><X className="w-4 h-4" /></button>
         </div>
      )}

      {errorModal.show && (
         <div className="fixed inset-0 z-[80] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm animate-in fade-in p-4">
             <div className="bg-white p-8 rounded-3xl shadow-2xl max-w-md w-full animate-in zoom-in-95 relative overflow-hidden">
                 <div className="absolute top-0 left-0 w-full h-1.5 bg-red-500"></div>
                 <div className="flex flex-col items-center text-center space-y-4">
                     <div className="p-4 bg-red-50 rounded-full mb-2"><AlertTriangle className="w-10 h-10 text-red-600" /></div>
                     <h3 className="text-2xl font-black text-slate-800">Save Failed</h3>
                     <p className="text-slate-600 font-medium leading-relaxed">{errorModal.message}</p>
                     <button onClick={() => setErrorModal({ show: false, message: '' })} className="w-full py-3.5 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 transition-all shadow-lg mt-4">Close</button>
                 </div>
             </div>
         </div>
      )}

      {selectedImage && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/95 backdrop-blur-xl p-4 animate-in fade-in duration-300" onClick={() => setSelectedImage(null)}>
            <div className="relative max-w-full max-h-full transition-transform" onClick={e => e.stopPropagation()}>
                <img src={selectedImage} alt="Evidence" className="max-w-full max-h-[90vh] object-contain rounded-lg shadow-2xl" />
                <button onClick={() => setSelectedImage(null)} className="absolute -top-12 right-0 text-white hover:text-red-400 transition-colors flex items-center gap-2 font-bold uppercase tracking-widest text-sm">
                    Close <X className="w-6 h-6" />
                </button>
            </div>
        </div>
      )}

    </div>
  );
}