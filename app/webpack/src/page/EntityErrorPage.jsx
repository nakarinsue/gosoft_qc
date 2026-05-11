// 1. ย้าย Import ทั้งหมดมาไว้บนสุดของไฟล์
import React, { useState, useEffect, useMemo } from 'react';
import { 
    X, RefreshCw, Activity, Download, Save, Link as LinkIcon, 
    AlertCircle, FileSpreadsheet, Calendar, Tag, Gift 
} from 'lucide-react';
import { Dropdown } from 'primereact/dropdown';

import { STATUS_CONFIG } from '../config';
import EnterpriseDataTable from '../components/EnterpriseDataTable';
import PromotionDetailModal from '../components/PromotionDetailModal';
import apiService from '../services/apiServices';

// --- Helper Function ---
// สร้างฟังก์ชันแยกสำหรับจัดการ Data Mapping เพื่อให้ง่ายต่อการอ่านและบำรุงรักษา
const formatEntityErrorData = (apiData) => {
    if (!Array.isArray(apiData)) return [];
    
    return apiData.map((item, index) => ({
        ...item,
        id: item.id || `err_${index}`,
        PROMOTION_CODE: item.pro_code || '-',
        PROMOTION_NAME: item.pro_name || '-',
        status: item.state !== undefined ? item.state : 1,
        userLog: item.user_update || '-',
        // จัดฟอร์แมตเงินรางวัล
        reward_display: item.reward_value ? `${parseFloat(item.reward_value).toLocaleString()} ฿` : '-',
        // รวมวันที่ให้อยู่ในฟิลด์เดียวเพื่อง่ายต่อการเรียกใช้
        period_display: (item.start_date && item.end_date) ? `${item.start_date} to ${item.end_date}` : 'No Date Set'
    }));
};

export default function EntityErrorPage() {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedItems, setSelectedItems] = useState([]); 
    const [detailItem, setDetailItem] = useState(null);
    const [isUpdating, setIsUpdating] = useState(false);
    const [targetStatus, setTargetStatus] = useState('1'); 

    useEffect(() => { 
        fetchData();
    }, []); 

    const fetchData = async () => {
        setLoading(true);
        try {
            const response = await apiService.promotion.getEntityErrors();
            const apiData = response.data || response;

            // เรียกใช้งาน Helper Function
            const formattedData = formatEntityErrorData(apiData);
            setData(formattedData);
        } catch (error) {
            console.error("API Error:", error);
        } finally {
            setLoading(false);
        }
    };

    // --- Column Definitions ---
    const tableColumns = useMemo(() => [
        {   selectionMode: 'multiple', 
            headerStyle: { width: '5%' },
            style: { width: '5%' },
},

        { 
            field: "PROMOTION_CODE", 
            header: "Code", 
            sortable: true, filter: true, 
            style: { width: '10%' },
            body: (rowData) => (
                <span className="font-mono font-black text-indigo-700 bg-indigo-50 px-2.5 py-1.5 rounded-lg text-sm border border-indigo-100 shadow-sm">
                    {rowData.PROMOTION_CODE}
                </span>
            )
        },
        { 
            field: "PROMOTION_NAME", 
            header: "Promotion & Type", 
            sortable: true, filter: true, 
            style: { width: '22%' },
            body: (rowData) => (
                <div className="flex flex-col gap-1.5">
                    <p className="font-bold text-slate-800 text-sm truncate" title={rowData.PROMOTION_NAME}>
                        {rowData.PROMOTION_NAME}
                    </p>
                    <span className="text-[10px] bg-slate-200 text-slate-600 px-1.5 py-0.5 rounded font-bold w-fit uppercase">
                        {rowData.pro_type || 'N/A'}
                    </span>
                </div>
            )
        },
        {
            field: "pro_group",
            header: "Group & Phase",
            sortable: true, filter: true,
            style: { width: '15%' },
            body: (rowData) => (
                <div className="flex flex-col gap-1.5">
                    <div className="flex items-center gap-1 text-[11px] text-slate-700 font-bold">
                        <Tag size={12} className="text-slate-400" />
                        <span className="truncate" title={rowData.pro_group}>{rowData.pro_group || '-'}</span>
                    </div>
                    {rowData.pro_status && (
                        <span className="text-[10px] bg-blue-50 text-blue-600 border border-blue-100 px-2 py-0.5 rounded-full font-bold w-fit uppercase shadow-sm">
                            {rowData.pro_status}
                        </span>
                    )}
                </div>
            )
        },
        {
            field: "start_date",
            header: "Period",
            sortable: true,
            style: { width: '14%' },
            body: (rowData) => (
                <div className="flex items-center gap-2 text-[11px] font-bold text-slate-600 bg-white border border-slate-200 shadow-sm px-2.5 py-1.5 rounded-lg w-fit">
                    <Calendar size={14} className="text-indigo-500" />
                    <div className="flex flex-col">
                        <span>{rowData.start_date || '-'}</span>
                        <span className="text-[9px] text-slate-400">to {rowData.end_date || '-'}</span>
                    </div>
                </div>
            )
        },
        {
            field: "reward_type",
            header: "Reward",
            style: { width: '13%' },
            body: (rowData) => (
                <div className="flex flex-col gap-1">
                    <span className="text-[12px] font-black text-emerald-600 flex items-center gap-1">
                        <Gift size={14} className="text-emerald-500" /> {rowData.reward_display}
                    </span>
                    <span className="text-[10px] text-slate-500 truncate w-full font-medium" title={rowData.reward_type}>
                        {rowData.reward_type || '-'}
                    </span>
                </div>
            )
        },
    ], []);

    const renderActionButtons = (
        <div className="flex items-center gap-3">
            <button 
                disabled={selectedItems.length === 0}
                className="flex items-center gap-2 px-5 py-2.5 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-sm font-black disabled:opacity-50 transition-all shadow-sm"
            >
                <Download size={16} /> pass
            </button>
        </div>
    );

    return (
        <div className="p-4 sm:p-8 bg-slate-50 min-h-screen flex flex-col gap-6">
            <div className="max-w-[1600px] w-full mx-auto flex flex-col h-full gap-6">
                <EnterpriseDataTable 
                    data={data}
                    columns={tableColumns}
                    loading={loading}
                    dataKey="id"
                    globalFilterFields={['PROMOTION_CODE', 'PROMOTION_NAME', 'pro_group','reward_type']} 
                    searchPlaceholder="Search promotion, code or error..."
                    selection={selectedItems}
                    onSelectionChange={(e) => setSelectedItems(e.value)} 
                    actionButtons={renderActionButtons} 
                />
            </div>

            {/* ใช้ Conditional Rendering ป้องกัน Modal render ฟรีๆ ตอนที่ไม่มีข้อมูล */}
            {detailItem && (
                <PromotionDetailModal 
                    data={detailItem} 
                    onClose={() => setDetailItem(null)} 
                    onSave={() => { fetchData(); setDetailItem(null); }} 
                />
            )}
        </div>
    );
}