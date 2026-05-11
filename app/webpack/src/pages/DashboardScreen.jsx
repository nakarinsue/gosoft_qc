import React, { useState, useEffect, useMemo } from 'react';
import { 
  Search, Link, ChevronLeft, ChevronRight, CheckSquare, Square, Save, X, 
  RefreshCw, Monitor, ShoppingBag, Edit3, Image as ImageIcon, User, 
  FileText, Activity, Info, Check, Download, Layers, Link as LinkIcon, Filter
} from 'lucide-react';
import { API_BASE_URL, MINIO_BASE_URL, STATUS_CONFIG, TYPE_OPTIONS } from '../config';

// --- Service ---
const promotionService = {
  getSearch: async () => {
    try {
        const res = await fetch(`${API_BASE_URL}/promotions/search`);
        if (!res.ok) throw new Error('Failed to fetch data');
        return await res.json();
    } catch (e) {
        console.error("API Error (getSearch):", e);
        return [];
    }
  },
  updateStatus: async (ids, newStatus) => {
    try {
        const res = await fetch(`${API_BASE_URL}/DEFECT/STATUS`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ "ids": ids, "status": newStatus })
        });
        if (!res.ok) throw new Error('Update status failed');
        return true;
    } catch (e) { 
        console.error("API Error (updateStatus):", e); 
        return false;
    }
  },
  updateDetail: async (id, data) => {
     try {
        const res = await fetch(`${API_BASE_URL}/DEFECT/UPDATE`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                "id": data.id,
                "system": data.system,
                "detail": data.detail,
                "types": data.types,
                "remark": data.remark,
                "status": data.status,
                "user_mk": data.user_mk
            })
        });
        if (!res.ok) throw new Error('Update detail failed');
        return true;
    } catch (e) { 
        console.error("API Error (updateDetail):", e); 
        return false;
    }
  },
  exportDefect: async (ids, userLogin) => {
    try {
        const response = await fetch(`${API_BASE_URL}/exportfile/defect`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                user_login: userLogin, 
                ids: ids 
            })
        });

        if (!response.ok) throw new Error('Export failed');

        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `Export_Defect_${new Date().getTime()}.xlsx`; 
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        return true;
    } catch (e) {
        console.error("Export Error:", e);
        alert("เกิดข้อผิดพลาดในการ Export ไฟล์");
        return false;
    }
  }
};

// --- Editable Detail Modal ---
const DetailModal = ({ data, onClose, onSave }) => {
    const [formData, setFormData] = useState(null);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        if (data) {
            let initialTypes = '';
            if (Array.isArray(data.TYPE) && data.TYPE.length > 0) {
                initialTypes = data.TYPE.join(',');
            } else if (data.types) {
                initialTypes = String(data.types);
            }
            setFormData({ ...data, types: initialTypes });
        }
    }, [data]);

    if (!data || !formData) return null;

    const handleChange = (key, value) => setFormData(prev => ({ ...prev, [key]: value }));

    const toggleType = (optionLabel) => {
        let currentTypes = formData.types ? String(formData.types).split(',').map(t => t.trim()).filter(Boolean) : [];
        if (currentTypes.includes(optionLabel)) {
            currentTypes = currentTypes.filter(t => t !== optionLabel);
        } else {
            currentTypes.push(optionLabel);
        }
        handleChange('types', currentTypes.join(','));
    };

    const isTypeSelected = (optionLabel) => {
        if (!formData.types) return false;
        return String(formData.types).split(',').map(t => t.trim()).includes(optionLabel);
    };

    const handleSubmit = async () => {
        setIsSaving(true);
        await onSave(formData); 
        setIsSaving(false);
        onClose();
    };

    const images = Array.isArray(formData.IMAGE) ? formData.IMAGE : [];
    const hasImages = images.length > 0;

    return (
        <div className="fixed inset-0 bg-slate-900/60 z-[60] flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-[2rem] w-full max-w-4xl max-h-[90vh] overflow-hidden shadow-2xl flex flex-col border border-slate-200">
                {/* Header */}
                <div className="px-8 py-6 border-b border-slate-100 flex justify-between items-center bg-white sticky top-0 z-10">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl border border-blue-100 shadow-sm">
                            <Edit3 size={24} />
                        </div>
                        <div>
                            <h3 className="text-xl font-black text-slate-800 tracking-tight">Edit Promotion Details</h3>
                            <div className="flex items-center gap-2 text-xs font-mono text-slate-400 mt-0.5">
                                <span>ID: {formData.id}</span>
                            </div>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2.5 hover:bg-slate-100 rounded-full transition-colors text-slate-400 hover:text-slate-600">
                        <X size={24} />
                    </button>
                </div>
                
                {/* Body */}
                <div className="p-8 overflow-y-auto custom-scrollbar bg-slate-50/50 flex-1">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {/* LEFT COLUMN */}
                        <div className="space-y-6">
                            <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm space-y-4">
                                <h4 className="text-xs font-black text-slate-400 uppercase tracking-wider flex items-center gap-2">
                                    <FileText size={14}/> Core Information (Read Only)
                                </h4>
                                <div className="space-y-3">
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold text-slate-600 ml-1">Promotion Name</label>
                                        <div className="w-full px-4 py-3 bg-slate-100 border border-slate-200 rounded-xl font-bold text-slate-500 cursor-not-allowed">
                                            {formData.PROMOTION_NAME}
                                        </div>
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold text-slate-600 ml-1">Promotion Code</label>
                                        <div className="w-full px-4 py-3 bg-slate-100 border border-slate-200 rounded-xl font-mono font-bold text-slate-500 cursor-not-allowed">
                                            {formData.PROMOTION_CODE}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm space-y-4">
                                <h4 className="text-xs font-black text-slate-400 uppercase tracking-wider flex items-center gap-2">
                                    <Activity size={14}/> Status & System
                                </h4>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold text-slate-600 ml-1">System</label>
                                        <select 
                                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-700 focus:ring-2 focus:ring-blue-500 outline-none appearance-none cursor-pointer"
                                            value={formData.system || 'POS'}
                                            onChange={(e) => handleChange('system', e.target.value)}
                                        >
                                            <option value="POS">POS</option>
                                            <option value="DELIVERY">DELIVERY</option>
                                        </select>
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold text-slate-600 ml-1">Status</label>
                                        <select 
                                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-700 focus:ring-2 focus:ring-blue-500 outline-none appearance-none cursor-pointer"
                                            value={formData.status || 1}
                                            onChange={(e) => handleChange('status', parseInt(e.target.value))}
                                        >
                                            {STATUS_CONFIG && Object.entries(STATUS_CONFIG).map(([k, v]) => (
                                                <option key={k} value={k}>{v.label}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-slate-600 ml-1">Details</label>
                                    <textarea 
                                        rows={4}
                                        className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl font-medium text-slate-600 focus:ring-2 focus:ring-blue-500 outline-none resize-none"
                                        value={formData.detail || ''}
                                        onChange={(e) => handleChange('detail', e.target.value)}
                                        placeholder="Enter details..."
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-slate-600 ml-1">Remark</label>
                                    <input 
                                        type="text" 
                                        className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl font-medium text-slate-600 focus:ring-2 focus:ring-blue-500 outline-none"
                                        value={formData.remark || ''}
                                        onChange={(e) => handleChange('remark', e.target.value)}
                                        placeholder="Add remark..."
                                    />
                                </div>
                            </div>
                        </div>

                        {/* RIGHT COLUMN */}
                        <div className="space-y-6">
                            {hasImages && (
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-600 ml-1 flex justify-between">
                                        Attached Evidence
                                        <span className="text-slate-400 font-normal text-[10px]">{images.length} Files</span>
                                    </label>
                                    <div className={`grid gap-3 ${images.length === 1 ? 'grid-cols-1' : 'grid-cols-2'}`}>
                                        {images.map((img, index) => (
                                            <div key={index} className="group relative aspect-video bg-slate-100 rounded-2xl border border-slate-200 overflow-hidden cursor-pointer">
                                                <img 
                                                    src={img.valuer} 
                                                    alt={`Evidence ${index + 1}`}
                                                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                                                />
                                                <div className="absolute bottom-0 inset-x-0 bg-black/50 p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <p className="text-[10px] text-white truncate text-center">
                                                        {img.valuer.split('/').pop()}
                                                    </p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-600 ml-1 flex items-center gap-2 justify-between">
                                    <span className="flex items-center gap-2"><Layers size={14}/> Defect Types</span>
                                </label>
                                <div className="grid grid-cols-1 gap-2 max-h-[300px] overflow-y-auto custom-scrollbar p-1">
                                    {TYPE_OPTIONS && TYPE_OPTIONS.map((option) => {
                                        const active = isTypeSelected(option.label);
                                        return (
                                            <button
                                                key={option.value}
                                                onClick={() => toggleType(option.label)}
                                                className={`group relative flex items-start gap-3 p-3 rounded-xl border text-left transition-all duration-200 ${active ? 'bg-purple-50 border-purple-500 shadow-sm' : 'bg-white border-slate-200 hover:border-purple-200 hover:bg-slate-50'}`}
                                            >
                                                <div className={`mt-0.5 size-4 rounded border flex items-center justify-center flex-shrink-0 transition-colors ${active ? 'bg-purple-600 border-purple-600' : 'bg-white border-slate-300'}`}>
                                                    {active && <Check size={12} className="text-white"/>}
                                                </div>
                                                <div>
                                                    <p className={`text-xs font-bold ${active ? 'text-purple-700' : 'text-slate-700'}`}>
                                                        {option.label}
                                                    </p>
                                                </div>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            <div className="bg-slate-100 p-4 rounded-2xl border border-slate-200 flex items-center justify-between opacity-80 cursor-not-allowed">
                                <div>
                                    <p className="text-xs font-bold text-slate-500">Assigned To (Read-Only)</p>
                                    <p className="font-bold text-slate-700">{formData.user_mk || 'Unassigned'}</p>
                                </div>
                                <User size={20} className="text-slate-400"/>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-slate-100 bg-white flex justify-end gap-3 z-10">
                    <button onClick={onClose} className="px-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold rounded-xl transition-colors">Cancel</button>
                    <button onClick={handleSubmit} disabled={isSaving} className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-lg shadow-blue-500/30 flex items-center gap-2 active:scale-95 transition-all disabled:opacity-70 disabled:cursor-not-allowed">
                        {isSaving ? <RefreshCw size={18} className="animate-spin"/> : <Save size={18}/>}
                        Save Changes
                    </button>
                </div>
            </div>
        </div>
    );
};

// --- Main Screen Component ---
export default function PromotionSearchScreen() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [columnFilters, setColumnFilters] = useState({ code: '', name: '', system: '', status: '', user_mk: '', userLog: '' });
  const [selectedIds, setSelectedIds] = useState([]);
  const [detailItem, setDetailItem] = useState(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [targetStatus, setTargetStatus] = useState('1'); 
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10; 

  // ดึงข้อมูลผ่าน API
  const fetchData = async () => {
    setLoading(true);
    const res = await promotionService.getSearch();
    setData(res || []);
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  const filteredData = useMemo(() => {
      let res = data;

      if (searchTerm) {
          const q = searchTerm.toLowerCase();
          res = res.filter(item =>
              String(item.PROMOTION_CODE).toLowerCase().includes(q) ||
              String(item.PROMOTION_NAME).toLowerCase().includes(q) ||
              String(item.user_mk).toLowerCase().includes(q)
          );
      } else {
          res = res.filter(item => String(item.status) !== '4');
      }

      if (columnFilters.code) res = res.filter(item => String(item.PROMOTION_CODE).toLowerCase().includes(columnFilters.code.toLowerCase()));
      if (columnFilters.name) res = res.filter(item => String(item.PROMOTION_NAME).toLowerCase().includes(columnFilters.name.toLowerCase()));
      if (columnFilters.system) res = res.filter(item => String(item.system).toLowerCase().includes(columnFilters.system.toLowerCase()));
      if (columnFilters.status) res = res.filter(item => String(item.status) === columnFilters.status);
      if (columnFilters.user_mk) res = res.filter(item => String(item.user_mk).toLowerCase().includes(columnFilters.user_mk.toLowerCase()));
      if (columnFilters.userLog) res = res.filter(item => String(item.userLog).toLowerCase().includes(columnFilters.userLog.toLowerCase()));

      return res;
  }, [data, searchTerm, columnFilters]);

  const { currentItems, totalPages } = useMemo(() => {
      const indexOfLastItem = currentPage * itemsPerPage;
      const indexOfFirstItem = indexOfLastItem - itemsPerPage;
      const currentItems = filteredData.slice(indexOfFirstItem, indexOfLastItem);
      const totalPages = Math.ceil(filteredData.length / itemsPerPage);
      return { currentItems, totalPages };
  }, [filteredData, currentPage]);

  useEffect(() => { setCurrentPage(1); }, [searchTerm, columnFilters]);

  const handleColumnFilterChange = (field, value) => {
      setColumnFilters(prev => ({ ...prev, [field]: value }));
  };

  const handleSelectAll = () => {
      const currentIds = currentItems.map(d => d.id);
      const allSelected = currentIds.length > 0 && currentIds.every(id => selectedIds.includes(id));
      if (allSelected) {
          setSelectedIds(prev => prev.filter(id => !currentIds.includes(id)));
      } else {
          setSelectedIds(prev => [...new Set([...prev, ...currentIds])]);
      }
  };

  const handleSelectRow = (id) => {
      if (selectedIds.includes(id)) setSelectedIds(prev => prev.filter(pid => pid !== id));
      else setSelectedIds(prev => [...prev, id]);
  };

  // เรียก API เพื่อ Update สถานะทีละหลายรายการ
  const handleBulkUpdate = async () => {
      if (!window.confirm(`Confirm update status for ${selectedIds.length} items?`)) return;
      setIsUpdating(true);
      
      const isSuccess = await promotionService.updateStatus(selectedIds, targetStatus);
      if(isSuccess) {
         setData(prev => prev.map(item => 
            selectedIds.includes(item.id) ? { ...item, status: parseInt(targetStatus) } : item
         ));
         setSelectedIds([]); 
      } else {
         alert("Failed to update status.");
      }
      setIsUpdating(false);
  };

  // เรียก API เพื่อ Export ไฟล์ Excel
  const handleExport = async () => {
      if(selectedIds.length === 0) return;
      setIsUpdating(true);
      const userLogin = "admin"; // Mock ไว้ตามบริบทเดิม
      await promotionService.exportDefect(selectedIds, userLogin);
      setIsUpdating(false);
  };

  // ฟังก์ชันใหม่: รับข้อมูลที่ถูกแก้จาก Modal แล้วยิง API เพื่อ Update Detail
  const handleSaveDetail = async (updatedData) => {
      const isSuccess = await promotionService.updateDetail(updatedData.id, updatedData);
      if(isSuccess) {
          setData(prev => prev.map(item => item.id === updatedData.id ? updatedData : item));
          alert("Promotion details updated successfully!");
      } else {
          alert("Failed to update details.");
      }
  };

  return (
    <div className="p-6 space-y-6 min-h-screen bg-slate-50 pb-24 font-sans text-slate-800 flex flex-col h-screen">
      

      {/* Main Table Section */}
      <div className="bg-white rounded-[2.5rem] shadow-xl border border-slate-200 flex flex-col flex-1 overflow-hidden">
        <div className="overflow-auto flex-1 custom-scrollbar">
            <table className="w-full text-left whitespace-nowrap min-w-max">
                <thead className="sticky top-0 z-20 bg-slate-50 shadow-sm border-b border-slate-200">
                    <tr className="text-slate-900 text-[11px] uppercase font-black tracking-[0.2em]">
                        <th className="px-6 py-4 text-center w-16 align-middle">
                            <button onClick={handleSelectAll} className="hover:text-purple-600 transition-colors mt-1">
                                <Square className={`w-5 h-5 ${currentItems.length > 0 && currentItems.every(d => selectedIds.includes(d.id)) ? 'text-purple-600 fill-purple-600' : 'text-slate-300'}`}/>
                            </button>
                        </th>
                        <th className="px-4 py-4 text-center w-16 align-middle">Edit</th>
                        <th className="px-6 py-4 align-middle">Promotion Code</th>
                        <th className="px-6 py-4 w-1/4 align-middle">Name</th>
                        <th className="px-6 py-4 align-middle">System</th>
                        <th className="px-6 py-4 text-center align-middle">Status</th>
                        <th className="px-6 py-4 align-middle">User MK</th>
                        <th className="px-6 py-4 align-middle">User Log</th>
                    </tr>
                    <tr className="bg-white border-t border-slate-100">
                        <th className="px-2 py-2"></th>
                        <th className="px-2 py-2"></th>
                        <th className="px-2 py-2">
                            <input type="text" placeholder="Filter Code..." className="w-full text-xs p-2 border border-slate-200 rounded-lg outline-none focus:border-purple-400 font-medium" 
                            value={columnFilters.code} onChange={(e) => handleColumnFilterChange('code', e.target.value)} />
                        </th>
                        <th className="px-2 py-2">
                            <input type="text" placeholder="Filter Name..." className="w-full text-xs p-2 border border-slate-200 rounded-lg outline-none focus:border-purple-400 font-medium" 
                            value={columnFilters.name} onChange={(e) => handleColumnFilterChange('name', e.target.value)} />
                        </th>
                        <th className="px-2 py-2">
                            <input type="text" placeholder="Filter System..." className="w-full text-xs p-2 border border-slate-200 rounded-lg outline-none focus:border-purple-400 font-medium" 
                            value={columnFilters.system} onChange={(e) => handleColumnFilterChange('system', e.target.value)} />
                        </th>
                        <th className="px-2 py-2">
                            <select className="w-full text-xs p-2 border border-slate-200 rounded-lg outline-none focus:border-purple-400 font-medium bg-white"
                            value={columnFilters.status} onChange={(e) => handleColumnFilterChange('status', e.target.value)}>
                                <option value="">All Status</option>
                                {STATUS_CONFIG && Object.entries(STATUS_CONFIG).map(([k, v]) => (
                                    <option key={k} value={k}>{v.label}</option>
                                ))}
                            </select>
                        </th>
                        <th className="px-2 py-2">
                            <input type="text" placeholder="Filter User..." className="w-full text-xs p-2 border border-slate-200 rounded-lg outline-none focus:border-purple-400 font-medium" 
                            value={columnFilters.user_mk} onChange={(e) => handleColumnFilterChange('user_mk', e.target.value)} />
                        </th>
                        <th className="px-2 py-2">
                            <input type="text" placeholder="Filter Log..." className="w-full text-xs p-2 border border-slate-200 rounded-lg outline-none focus:border-purple-400 font-medium" 
                            value={columnFilters.userLog} onChange={(e) => handleColumnFilterChange('userLog', e.target.value)} />
                        </th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                    {loading ? (
                        <tr><td colSpan="8" className="py-20 text-center text-slate-400 font-bold animate-pulse">Loading Data...</td></tr>
                    ) : currentItems.length === 0 ? (
                        <tr><td colSpan="8" className="py-20 text-center text-slate-400 font-bold">No data found.</td></tr>
                    ) : (
                        currentItems.map((item) => {
                            const isSelected = selectedIds.includes(item.id);
                            
                            // ดึง Config ของ Status ป้องกันกรณีค่าไม่มีใน Config
                            const statusConfig = STATUS_CONFIG?.[item.status] || { color: 'text-slate-600 border-slate-200 bg-slate-50', label: 'Unknown', icon: Activity };
                            const StatusIcon = statusConfig.icon || Activity;

                            return (
                                <tr key={item.id} className={`hover:bg-slate-50 transition-colors group ${isSelected ? 'bg-purple-50/30' : ''}`}>
                                    <td className="px-6 py-4 text-center">
                                        <button onClick={() => handleSelectRow(item.id)}>
                                            {isSelected 
                                                ? <CheckSquare className="w-5 h-5 text-purple-600"/> 
                                                : <Square className="w-5 h-5 text-slate-200 group-hover:text-slate-300"/>}
                                        </button>
                                    </td>
                                    <td className="px-4 py-4 text-center">
                                        <button 
                                            onClick={() => setDetailItem(item)}
                                            className="p-2 bg-slate-100 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                                        >
                                            <LinkIcon size={18} />
                                        </button>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="font-mono font-black text-slate-700 bg-slate-100 px-2 py-1 rounded-md text-sm border border-slate-200">
                                            {item.PROMOTION_CODE}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <p className="font-bold text-slate-800 text-sm truncate max-w-[250px]" title={item.PROMOTION_NAME}>
                                            {item.PROMOTION_NAME}
                                        </p>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2">
                                            {item.system === 'POS' 
                                                ? <Monitor size={14} className="text-blue-500"/> 
                                                : <ShoppingBag size={14} className="text-orange-500"/>
                                            }
                                            <span className="font-bold text-slate-600 text-xs">{item.system}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border shadow-sm ${statusConfig.color}`}>
                                            <StatusIcon size={12} className="stroke-[3px]" />
                                            {statusConfig.label}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2">
                                            <div className="size-8 rounded-full bg-indigo-50 border border-indigo-100 flex items-center justify-center text-xs font-black text-indigo-600 shadow-sm">
                                                {item.user_mk ? item.user_mk.charAt(0).toUpperCase() : '?'}
                                            </div>
                                            <div>
                                                <p className="text-xs font-bold text-slate-700">{item.user_mk || 'Unassigned'}</p>
                                                <p className="text-[10px] text-slate-400 font-medium">Owner</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2 max-w-[150px]">
                                            <Activity size={14} className="text-slate-300 flex-shrink-0"/>
                                            <p className="text-[11px] font-mono text-slate-500 truncate" title={item.userLog}>
                                                {item.userLog || '-'}
                                            </p>
                                        </div>
                                    </td>
                                </tr>
                            );
                        })
                    )}
                </tbody>
            </table>
        </div>

        {/* Footer: Stats & Pagination */}
        <div className="bg-slate-50 px-6 py-4 border-t border-slate-200 flex flex-col sm:flex-row justify-between items-center gap-4 shrink-0">
            <div className="text-xs font-bold text-slate-500 flex items-center gap-4">
                <span>Showing {currentItems.length} of {filteredData.length} records</span>
                {selectedIds.length > 0 && <span className="text-purple-600 bg-purple-50 px-2 py-0.5 rounded border border-purple-100">{selectedIds.length} Selected</span>}
            </div>
            <div className="flex items-center gap-2">
                <button 
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))} 
                  disabled={currentPage === 1 || totalPages === 0} 
                  className="p-2 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
                  <ChevronLeft size={16} />
                </button>
                <span className="text-xs font-black text-slate-700 px-4 py-2 bg-white border border-slate-200 rounded-lg">
                  Page {totalPages === 0 ? 0 : currentPage} of {totalPages}
                </span>
                <button 
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} 
                  disabled={currentPage === totalPages || totalPages === 0} 
                  className="p-2 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
                  <ChevronRight size={16} />
                </button>
            </div>
        </div>
      </div>

      {/* Floating Bulk Action Bar */}
      {selectedIds.length > 0 && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-slate-900/95 backdrop-blur-xl shadow-2xl rounded-[2rem] p-4 pl-6 flex flex-col sm:flex-row items-center gap-6 z-40 animate-in slide-in-from-bottom-10 border border-slate-700">
            <div className="flex items-center gap-3 border-r border-slate-700 pr-6">
                <span className="bg-purple-600 text-white text-sm font-black size-8 flex items-center justify-center rounded-lg">{selectedIds.length}</span>
                <div>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Selected</p>
                    <p className="text-xs font-bold text-white">Items</p>
                </div>
            </div>
            <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                    <div className="relative">
                        <select value={targetStatus} onChange={(e) => setTargetStatus(e.target.value)} className="bg-slate-800 text-white text-sm font-bold py-2.5 pl-4 pr-10 rounded-xl outline-none border border-slate-700 focus:border-purple-500 appearance-none cursor-pointer">
                            {STATUS_CONFIG && Object.entries(STATUS_CONFIG).map(([val, config]) => (
                                <option key={val} value={val}>{config.label}</option>
                            ))}
                        </select>
                        <ChevronLeft className="absolute right-3 top-1/2 -translate-y-1/2 rotate-90 text-slate-400 pointer-events-none" size={14}/>
                    </div>
                    <button onClick={handleBulkUpdate} disabled={isUpdating} className="flex items-center gap-2 px-4 py-2.5 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-black uppercase tracking-wide transition-all shadow-lg shadow-purple-600/20 active:scale-95 disabled:opacity-50">
                        {isUpdating ? <RefreshCw size={16} className="animate-spin"/> : <Save size={16} />} Update
                    </button>
                </div>

                <div className="w-px h-8 bg-slate-700 mx-2"></div>

                <button onClick={handleExport} disabled={isUpdating} className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-black uppercase tracking-wide transition-all shadow-lg shadow-emerald-600/20 active:scale-95 disabled:opacity-50">
                    <Download size={16} /> Export
                </button>

                <button onClick={() => setSelectedIds([])} className="p-2.5 hover:bg-slate-800 text-slate-400 hover:text-white rounded-xl transition-all ml-2">
                    <X size={20}/>
                </button>
            </div>
        </div>
      )}

      {/* Editable Detail Modal */}
      <DetailModal data={detailItem} onClose={() => setDetailItem(null)} onSave={handleSaveDetail} />
    </div>
  );
}