import React, { useState, useEffect, useMemo } from 'react';
import { 
  Save, Search, RefreshCw, FileText, Calendar, Layers, 
  AlertCircle, Filter, Trash2, CheckCircle, XCircle, 
  ChevronDown, LayoutGrid, Monitor, ShoppingBag
} from 'lucide-react';
import { API_BASE_URL } from '../config';

const SalePaymentScreen = () => {
  // --- State Management ---
  const [rawData, setRawData] = useState([]);
  const [loading, setLoading] = useState(false);
  
  // Filter States
  const [filters, setFilters] = useState({
    version: '', // Dropdown
    status: '',  // Dropdown
    system: '',  // Dropdown
    search: ''   // Text Input
  });

  // --- 1. Fetch Data ---
  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/DASHBOARD/SALEPAYMENT`);
      const data = await response.json();
      setRawData(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error fetching data:", error);
      setRawData([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // --- 2. Extract Unique Options for Dropdowns (Dynamic) ---
  const options = useMemo(() => {
    if (!rawData.length) return { versions: [], systems: [], statuses: [] };

    const versions = [...new Set(rawData.map(d => d.VERSION_NO).filter(Boolean))].sort((a, b) => b - a);
    const systems = [...new Set(rawData.map(d => d.SYSTEM).filter(Boolean))].sort();
    const statuses = [...new Set(rawData.map(d => d.STATUS).filter(Boolean))].sort();

    return { versions, systems, statuses };
  }, [rawData]);

  // ตั้งค่า Default Version เป็นล่าสุดเมื่อโหลดข้อมูลเสร็จ
  useEffect(() => {
    if (options.versions.length > 0 && !filters.version) {
        setFilters(prev => ({ ...prev, version: options.versions[0] }));
    }
  }, [options.versions]);

  // --- 3. Filter Logic ---
  const filteredData = useMemo(() => {
    return rawData.filter(item => {
      // 1. Version Filter
      if (filters.version && String(item.VERSION_NO) !== String(filters.version)) return false;
      
      // 2. Status Filter
      if (filters.status && item.STATUS !== filters.status) return false;

      // 3. System Filter
      if (filters.system && item.SYSTEM !== filters.system) return false;

      // 4. Text Search (Pro Name, Pro Code, Worksheet)
      if (filters.search) {
        const q = filters.search.toLowerCase();
        const textMatch = 
          (item.PRO_NAME || '').toLowerCase().includes(q) ||
          (item.PRO_CODE || '').toString().includes(q) ||
          (item.worksheet || '').toLowerCase().includes(q);
        if (!textMatch) return false;
      }

      return true;
    });
  }, [rawData, filters]);

  // --- Handlers ---
  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters({
      version: options.versions[0] || '', // Reset กลับไปเวอร์ชั่นล่าสุด
      status: '',
      system: '',
      search: ''
    });
  };

  // Helper สำหรับสี Status
  const getStatusColor = (status) => {
    if (status === 'PAY') return 'bg-emerald-100 text-emerald-700 border-emerald-200';
    if (status === 'NO PAY') return 'bg-rose-100 text-rose-700 border-rose-200';
    return 'bg-gray-100 text-gray-700 border-gray-200';
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800 p-6 pb-20 animate-in fade-in duration-500">
      
      {/* --- Header Section --- */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div>
           <div className="flex items-center gap-3 mb-1">
                <div className="p-2.5 bg-blue-600 rounded-xl text-white shadow-lg shadow-blue-500/30">
                    <LayoutGrid className="w-6 h-6" />
                </div>
                <h1 className="text-2xl font-black text-slate-800 tracking-tight">Sale Payment Dashboard</h1>
           </div>
           <p className="text-slate-500 font-medium ml-1">ตรวจสอบรายการชำระเงินและสถานะ Promotion</p>
        </div>
        
        <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-xl border border-slate-200 shadow-sm">
                <span className="size-2 rounded-full bg-emerald-500 animate-pulse"></span>
                <span className="text-xs font-bold text-slate-600 uppercase">Live Data</span>
            </div>
        </div>
      </div>

      {/* --- Filter Bar (Coupon Style) --- */}
      <div className="bg-white p-4 rounded-[2rem] shadow-sm border border-slate-200 mb-6 flex flex-col xl:flex-row gap-4 items-center">
         
         <div className="flex flex-col md:flex-row items-center gap-3 w-full flex-1">
             
             {/* 1. Version Dropdown */}
             <div className="relative w-full md:w-48 z-20 group">
                <Layers className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors" size={18} />
                <select 
                    className="w-full bg-slate-100 border border-slate-200 rounded-2xl py-3.5 pl-11 pr-8 outline-none focus:ring-2 ring-blue-500/50 transition-all text-sm font-black text-slate-800 cursor-pointer appearance-none"
                    value={filters.version}
                    onChange={(e) => handleFilterChange('version', e.target.value)}
                >
                    <option value="">All Versions</option>
                    {options.versions.map((v) => (
                        <option key={v} value={v}>Ver. {v}</option>
                    ))}
                </select>
                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
                {filters.version && <div className="absolute -top-2 right-4 bg-blue-600 text-white text-[9px] font-bold px-1.5 py-0.5 rounded shadow">SELECTED</div>}
             </div>

             {/* 2. System Dropdown */}
             <div className="relative w-full md:w-48 z-20 group">
                <Monitor className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors" size={18} />
                <select 
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-3.5 pl-11 pr-8 outline-none focus:ring-2 ring-blue-500/50 transition-all text-sm font-bold text-slate-700 cursor-pointer appearance-none"
                    value={filters.system}
                    onChange={(e) => handleFilterChange('system', e.target.value)}
                >
                    <option value="">All Systems</option>
                    {options.systems.map((s) => (
                        <option key={s} value={s}>{s}</option>
                    ))}
                </select>
                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
             </div>

             {/* 3. Status Dropdown */}
             <div className="relative w-full md:w-48 z-20 group">
                <CheckCircle className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors" size={18} />
                <select 
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-3.5 pl-11 pr-8 outline-none focus:ring-2 ring-blue-500/50 transition-all text-sm font-bold text-slate-700 cursor-pointer appearance-none"
                    value={filters.status}
                    onChange={(e) => handleFilterChange('status', e.target.value)}
                >
                    <option value="">All Status</option>
                    {options.statuses.map((s) => (
                        <option key={s} value={s}>{s}</option>
                    ))}
                </select>
                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
             </div>

             {/* 4. Search Input */}
             <div className="relative w-full group flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors" size={20} />
                <input 
                    type="text" 
                    placeholder="Search Code, Name, Worksheet..."
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-3.5 pl-12 pr-4 outline-none focus:ring-2 ring-blue-500/50 transition-all text-sm font-bold text-slate-700"
                    value={filters.search}
                    onChange={(e) => handleFilterChange('search', e.target.value)}
                />
             </div>
         </div>

         <div className="flex items-center gap-2">
            <button 
                onClick={clearFilters}
                className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-slate-400 hover:text-red-500 hover:bg-red-50 hover:border-red-200 transition-all"
                title="Reset Filters"
            >
                <Trash2 size={20} />
            </button>
            <button 
                onClick={fetchData} 
                className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-slate-400 hover:text-blue-600 hover:bg-blue-50 hover:border-blue-200 transition-all"
                title="Reload Data"
            >
                <RefreshCw size={20} className={loading ? 'animate-spin' : ''} />
            </button>
         </div>
      </div>

      {/* --- Data Table --- */}
      <div className="bg-white rounded-[2.5rem] shadow-xl border border-slate-200 overflow-hidden min-h-[500px] flex flex-col">
        <div className="overflow-x-auto flex-1">
            <table className="w-full text-left whitespace-nowrap">
                <thead>
                    <tr className="bg-slate-50 text-slate-900 text-[11px] uppercase font-black tracking-[0.2em] border-b border-slate-200 sticky top-0 z-10 shadow-sm">
                        <th className="p-6">System / Store</th>
                        <th className="p-6">Promotion Info</th>
                        <th className="p-6">Dates</th>
                        <th className="p-6">File Reference</th>
                        <th className="p-6 text-center">Status</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                    {!filteredData || filteredData.length === 0 ? (
                        <tr>
                            <td colSpan="5" className="p-20 text-center text-slate-400 font-bold flex flex-col items-center">
                                <Search size={48} className="mb-4 opacity-20"/>
                                No data matching your filters.
                            </td>
                        </tr>
                    ) : (
                        filteredData.map((item, idx) => (
                            <tr key={idx} className="group hover:bg-slate-50 transition-colors">
                                <td className="p-6">
                                    <div className="flex flex-col gap-1.5">
                                        <span className={`inline-flex items-center w-fit px-2 py-0.5 rounded text-[10px] font-bold border ${item.SYSTEM === 'DELIVERY' ? 'bg-orange-50 text-orange-600 border-orange-100' : 'bg-blue-50 text-blue-600 border-blue-100'}`}>
                                            {item.SYSTEM === 'DELIVERY' ? <ShoppingBag size={10} className="mr-1"/> : <Monitor size={10} className="mr-1"/>}
                                            {item.SYSTEM}
                                        </span>
                                        <div className="flex items-center gap-2">
                                            <span className="text-slate-400 text-xs font-bold uppercase">Store:</span>
                                            {item.STORE_CODE ? (
                                                <span className="font-mono font-bold text-slate-700 bg-slate-100 px-1.5 rounded">{item.STORE_CODE}</span>
                                            ) : (
                                                <span className="text-rose-500 text-[10px] font-bold bg-rose-50 px-1.5 rounded border border-rose-100 flex items-center gap-1">
                                                    <AlertCircle size={10}/> Empty
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </td>
                                <td className="p-6">
                                    <div className="max-w-xs">
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="text-[10px] font-bold text-slate-400 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded">
                                                #{item.PRO_CODE}
                                            </span>
                                            <span className="text-[10px] text-slate-400 font-mono">Ver.{item.VERSION_NO}</span>
                                        </div>
                                        <p className="font-bold text-slate-800 text-sm truncate" title={item.PRO_NAME}>
                                            {item.PRO_NAME}
                                        </p>
                                    </div>
                                </td>
                                <td className="p-6">
                                    <div className="flex flex-col gap-1 text-xs">
                                        <div className="flex items-center gap-2 text-slate-500">
                                            <Calendar size={12} className="text-emerald-500"/>
                                            <span>Start: <span className="font-mono font-bold text-slate-700">{item.START_DATE}</span></span>
                                        </div>
                                        <div className="flex items-center gap-2 text-slate-500">
                                            <Calendar size={12} className="text-rose-500"/>
                                            <span>End: <span className="font-mono font-bold text-slate-700">{item.END_DATE}</span></span>
                                        </div>
                                    </div>
                                </td>
                                <td className="p-6">
                                    <div className="max-w-[200px]">
                                        <div className="flex items-center gap-2 text-slate-500 text-xs mb-1">
                                            <FileText size={12}/>
                                            <span className="font-bold">{item.sheet}</span>
                                        </div>
                                        <p className="text-[10px] text-slate-400 truncate leading-relaxed" title={item.worksheet}>
                                            {item.worksheet}
                                        </p>
                                    </div>
                                </td>
                                <td className="p-6 text-center">
                                    <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-black border shadow-sm ${getStatusColor(item.STATUS)}`}>
                                        {item.STATUS === 'PAY' ? <CheckCircle size={14}/> : <XCircle size={14}/>}
                                        {item.STATUS}
                                    </span>
                                </td>
                            </tr>
                        ))
                    )}
                </tbody>
            </table>
        </div>
        <div className="bg-slate-50 px-6 py-3 border-t border-slate-200 text-xs font-bold text-slate-500 flex justify-between">
            <span>Showing {filteredData.length} records</span>
            <span>Total: {rawData.length}</span>
        </div>
      </div>
    </div>
  );
};

export default SalePaymentScreen;