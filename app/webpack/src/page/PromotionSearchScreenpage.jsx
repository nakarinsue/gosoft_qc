import React, { useState, useEffect, useMemo } from 'react';
import { X, RefreshCw, Activity, Download, Save, Link as LinkIcon, Search, FileSpreadsheet } from 'lucide-react';
import { Dropdown } from 'primereact/dropdown';

import { STATUS_CONFIG } from '../config';
import EnterpriseDataTable from '../components/EnterpriseDataTable';
import PromotionDetailModal from '../components/PromotionDetailModal';
import { promotionService } from '../services/promotionService';

export default function PromotionSearchScreen({ selectedVersion }) {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    
    // PrimeReact & Toolbar States
    const [selectedItems, setSelectedItems] = useState([]); 
    const [detailItem, setDetailItem] = useState(null);
    const [isUpdating, setIsUpdating] = useState(false);
    const [targetStatus, setTargetStatus] = useState('1'); 

    useEffect(() => { 
        if (selectedVersion === -1 || selectedVersion === undefined) {
            setData([]);
            setLoading(false);
            return;
        }

        const fetchData = async () => {
            setLoading(true);
            const apiData = await promotionService.getSearch(selectedVersion);
            
            // 📍 Data Pipeline: ดึง file_name และ sheet มาเตรียมไว้
            const formattedData = apiData.map((item, index) => {
                return {
                    ...item,
                    id: item.id || `temp_id_${index}`,
                    pro_id: item.pro_id,
                    title: item.title || '-',
                    PROMOTION_CODE: item.promotion_code || item.PROMOTION_CODE || '-',
                    PROMOTION_NAME: item.promotion_name || item.PROMOTION_NAME || '-',
                    system: item.POS || item.system || 'POS', 
                    status: item.status !== undefined ? item.status : 1,
                    user_mk: item.user_mk || '-', // 📍 ดึง user_mk
                    userLog: item.user_upde || item.userLog || '-',
                    file_name: item.file_name || '-', // 📍 ดึง file_name
                    sheet: item.sheet || '-', // 📍 ดึง sheet
                    
                    // เก็บค่าเดิมไว้เผื่อส่งตอน Save Update (แม้จะไม่ได้แสดงในตารางแล้ว)
                    types: Array.isArray(item.types) ? item.types : [],
                    entity: Array.isArray(item.entity) ? item.entity : [],
                };
            });

            setData(formattedData);
            setLoading(false);
        };

        fetchData(); 
    }, [selectedVersion]); 

    // --- Action Handlers ---
    const handleBulkUpdate = async () => {
        if (!selectedItems || selectedItems.length === 0) return;
        if (!window.confirm(`Confirm update status for ${selectedItems.length} items?`)) return;
        
        setIsUpdating(true);
        const ids = selectedItems.map(item => item.id);
        const isSuccess = await promotionService.updateStatus(ids, targetStatus);
        
        if(isSuccess) {
            setData(prev => prev.map(item => ids.includes(item.id) ? { ...item, status: parseInt(targetStatus) } : item));
            setSelectedItems([]); 
            alert("Status updated successfully!");
        } else {
            alert("Failed to update status.");
        }
        setIsUpdating(false);
    };

    const handleExport = async () => {
        if(!selectedItems || selectedItems.length === 0) return;
        setIsUpdating(true);
        const ids = selectedItems.map(item => item.id);
        await promotionService.exportDefect(ids, "admin");
        setIsUpdating(false);
    };

    const handleSaveDetail = async (updatedData) => {
        const payload = {
            ...updatedData,
            types: Array.isArray(updatedData.types) ? updatedData.types : [updatedData.types].filter(Boolean)
        };

        const isSuccess = await promotionService.updateDetail(payload);
        if(isSuccess) {
            setData(prev => prev.map(item => item.id === payload.id ? payload : item));
            alert("Promotion details updated successfully!");
        } else {
            alert("Failed to update details.");
        }
    };

    // --- Column Definitions ---
    const statusOptions = useMemo(() => {
        if (!STATUS_CONFIG) return [];
        return Object.entries(STATUS_CONFIG).map(([k, v]) => ({ label: v.label, value: Number(k) }));
    }, []);

    const tableColumns = useMemo(() => [
        { selectionMode: 'multiple', headerStyle: { width: '3rem' } },
        {
            header: "Edit",
            style: { width: '4rem', textAlign: 'center' },
            body: (rowData) => (
                <button onClick={() => setDetailItem(rowData)} className="p-2 bg-slate-100 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all">
                    <LinkIcon size={18} />
                </button>
            )
        },
        { 
            field: "PROMOTION_CODE", 
            header: "Code", 
            sortable: true, filter: true, 
            style: { width: '10%' },
            body: (rowData) => (
                <span className="font-mono font-black text-slate-700 bg-slate-100 px-2 py-1 rounded-md text-sm border border-slate-200">
                    {rowData.PROMOTION_CODE}
                </span>
            )
        },
        { 
            field: "PROMOTION_NAME", 
            header: "Name & Title", 
            sortable: true, filter: true, 
            style: { width: '20%' },
            body: (rowData) => (
                <div>
                    <p className="font-bold text-slate-800 text-sm truncate max-w-[200px]" title={rowData.PROMOTION_NAME}>
                        {rowData.PROMOTION_NAME}
                    </p>
                    {rowData.title !== '-' && (
                        <p className="text-[11px] text-slate-500 truncate max-w-[200px] mt-0.5">{rowData.title}</p>
                    )}
                </div>
            )
        },
        // 📍 แสดง File Name และ Sheet (แทน Types เดิม)
        {
            field: "file_name",
            header: "File & Sheet",
            sortable: true, filter: true,
            style: { width: '15%' },
            body: (rowData) => (
                <div className="flex flex-col max-w-[180px]">
                    <div className="flex items-center gap-1.5 text-indigo-700">
                        <FileSpreadsheet size={12} className="shrink-0"/>
                        <span className="text-xs font-bold truncate" title={rowData.file_name}>
                            {rowData.file_name !== '-' ? rowData.file_name : 'No File'}
                        </span>
                    </div>
                    {rowData.sheet !== '-' && (
                        <span className="text-[10px] text-slate-500 truncate ml-4" title={rowData.sheet}>
                            Sheet: {rowData.sheet}
                        </span>
                    )}
                </div>
            )
        },
        // 📍 แสดง User MK (แทน Image เดิม)
        {
            field: "user_mk",
            header: "User MK",
            sortable: true, filter: true,
            style: { width: '15%' },
            body: (rowData) => {
                const isUnassigned = !rowData.user_mk || rowData.user_mk === '-';
                return (
                    <div className="flex items-center gap-2 max-w-[150px]">
                        <div className="size-8 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center text-xs font-black text-emerald-600 shadow-sm shrink-0">
                            {!isUnassigned ? rowData.user_mk.charAt(0).toUpperCase() : '?'}
                        </div>
                        <div className="truncate">
                            <p className="text-xs font-bold text-slate-700 truncate" title={rowData.user_mk}>
                                {!isUnassigned ? rowData.user_mk : 'Unassigned'}
                            </p>
                            <p className="text-[10px] text-slate-400 font-medium">Owner</p>
                        </div>
                    </div>
                );
            }
        },
        { 
            field: "status", 
            header: "Status", 
            sortable: true, filter: true, 
            style: { width: '10%' },
            filterElement: (options) => (
                <Dropdown value={options.value} options={statusOptions} onChange={(e) => options.filterCallback(e.value, options.index)} placeholder="All" className="p-column-filter w-full" showClear />
            ),
            body: (rowData) => {
                const statusConfig = STATUS_CONFIG?.[rowData.status] || { color: 'text-slate-600 border-slate-200 bg-slate-50', label: 'Unknown', icon: Activity };
                const StatusIcon = statusConfig.icon || Activity;
                return (
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border shadow-sm ${statusConfig.color}`}>
                        <StatusIcon size={12} className="stroke-[3px]" /> {statusConfig.label}
                    </span>
                );
            }
        },
        { 
            field: "userLog", 
            header: "User Log", 
            sortable: true, filter: true, 
            style: { width: '12%' },
            body: (rowData) => (
                <div className="flex flex-col max-w-[120px]">
                    <span className="text-xs font-bold text-slate-700 truncate" title={rowData.userLog}>{rowData.userLog || '-'}</span>
                    <span className="text-[10px] text-slate-400 font-medium">Updated by</span>
                </div>
            )
        }
    ], [statusOptions]);

    const renderActionButtons = (
        <div className="flex flex-wrap items-center gap-3">
            {selectedItems.length > 0 && (
                <span className="hidden sm:inline-flex items-center text-xs font-black text-purple-600 bg-purple-50 px-3 py-2 rounded-xl border border-purple-100">
                    {selectedItems.length} Selected
                </span>
            )}

            <div className="flex items-center gap-2 bg-slate-50 p-1.5 rounded-2xl border border-slate-200">
                <select 
                    value={targetStatus} 
                    onChange={(e) => setTargetStatus(e.target.value)} 
                    className="bg-transparent border-none text-slate-700 text-sm font-bold py-2 pl-3 pr-8 outline-none appearance-none cursor-pointer disabled:opacity-50"
                    disabled={selectedItems.length === 0 || isUpdating}
                >
                    {STATUS_CONFIG && Object.entries(STATUS_CONFIG).map(([val, config]) => (
                        <option key={val} value={val}>{config.label}</option>
                    ))}
                </select>
                <button 
                    onClick={handleBulkUpdate} 
                    disabled={selectedItems.length === 0 || isUpdating} 
                    className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-sm font-black transition-all shadow-md shadow-purple-600/20 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {isUpdating ? <RefreshCw size={16} className="animate-spin"/> : <Save size={16} />} Update
                </button>
            </div>

            <div className="w-px h-8 bg-slate-200 mx-1 hidden lg:block"></div>

            <button 
                onClick={handleExport} 
                disabled={selectedItems.length === 0 || isUpdating} 
                className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-black transition-all shadow-md shadow-emerald-600/20 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
            >
                <Download size={16} /> Export
            </button>
            
            {selectedItems.length > 0 && (
                <button 
                    onClick={() => setSelectedItems([])} 
                    className="p-2.5 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all"
                    title="Clear Selection"
                >
                    <X size={20}/>
                </button>
            )}
        </div>
    );

    if (selectedVersion === -1 || selectedVersion === undefined) {
        return (
            <div className="flex flex-col items-center justify-center h-full min-h-[500px] text-slate-400 bg-slate-50">
                <Search size={64} className="mb-4 opacity-20" />
                <p className="font-bold">กรุณาเลือก Version เพื่อดูข้อมูลโปรโมชัน</p>
            </div>
        );
    }

    return (
        <div className="p-4 sm:p-6 bg-slate-50 h-screen font-sans text-slate-800 flex flex-col relative overflow-hidden">
            <div className="max-w-[1600px] w-full mx-auto flex flex-col h-full gap-4">
                
                {/* 📍 อัปเดต Global Filter ให้รวมการค้นหาด้วยชื่อไฟล์และ user_mk ด้วย (ย้ายคอมเมนต์มาไว้ตรงนี้) */}
                <EnterpriseDataTable 
                    data={data}
                    columns={tableColumns}
                    loading={loading}
                    dataKey="id"
                    globalFilterFields={['PROMOTION_CODE', 'PROMOTION_NAME', 'system', 'user_mk', 'userLog', 'file_name', 'sheet']} 
                    searchPlaceholder="Search Promotions, Files, or Users..."
                    selection={selectedItems}                          
                    onSelectionChange={(e) => setSelectedItems(e.value)} 
                    actionButtons={renderActionButtons} 
                />

            </div>

            <PromotionDetailModal 
                data={detailItem} 
                onClose={() => setDetailItem(null)} 
                onSave={handleSaveDetail} 
            />
        </div>
    );
}