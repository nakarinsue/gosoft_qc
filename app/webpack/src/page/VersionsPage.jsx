import React, { useState, useEffect, useCallback, useMemo } from 'react';
import CreateVersionModal from '../components/versions/CreateVersionModal';
import EditVersionModal from '../components/versions/EditVersionModal';
import { Plus, Edit3, AlignLeft, Hash } from 'lucide-react';

// 📍 นำเข้าตารางกลาง
import EnterpriseDataTable from '../components/EnterpriseDataTable';

// 📍 นำเข้า API Service กลาง (แทน versionApi)
import apiService from '../services/apiServices';

export default function VersionsPage() {
  const [versions, setVersions] = useState([]);
  const [users, setUsers] = useState([]); 
  const [isLoading, setIsLoading] = useState(true);
  
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editModalState, setEditModalState] = useState({ isOpen: false, data: null });

  const fetchInitialData = useCallback(async () => {
    setIsLoading(true);
    try {
      // 📍 เรียกใช้ apiService กลาง
      // (ถ้าหน้าคุณต้องการรายชื่อ user ด้วย ให้เรียก apiService.auth.getUsers() หรือ API ที่เกี่ยวข้องเพิ่มตรงนี้นะครับ)
      const versionsRes = await apiService.versions.getAll();
      
      // ดึงข้อมูลออกมา (รองรับทั้งเคสที่ Axios รีเทิร์นเป็น {data: [...]} หรือ [...] เปล่าๆ)
      const versionsData = versionsRes?.data || versionsRes || [];

      // 📍 เรียงลำดับ ID จากมากไปน้อย (ใหม่ไปเก่า) ตาม Logic เดิมของคุณ
      const sortedVersions = versionsData.sort((a, b) => b.id - a.id);
      
      setVersions(sortedVersions);
      
      // ตอนนี้ตั้ง mock user ไว้เหมือนเดิม ถ้ามี API ค่อยดึงมาใส่
      setUsers([]); 
      
      window.dispatchEvent(new CustomEvent('version-data-updated'));
    } catch (error) {
      console.error("Failed to load initial data", error);
      alert("ไม่สามารถดึงข้อมูล Versions ได้: " + (error.message || "เกิดข้อผิดพลาด"));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { 
    fetchInitialData(); 
  }, [fetchInitialData]);

  const handleEditClick = (versionData) => {
    setEditModalState({ isOpen: true, data: versionData });
  };

  // -------------------------------------------------------------
  // 📍 1. โครงสร้างคอลัมน์ (อิงจาก VersionsTable เดิมเป๊ะๆ)
  // -------------------------------------------------------------
  const tableColumns = useMemo(() => [
    {
        header: "No.",
        style: { width: '5rem', textAlign: 'center' },
        // ใช้ options.rowIndex เพื่อรันเลขลำดับอัตโนมัติ
        body: (rowData, options) => (
            <span className="font-bold text-slate-400">
                {options.rowIndex + 1}
            </span>
        )
    },
    { 
        field: "title", 
        header: "Title", 
        sortable: true, filter: true, 
        style: { width: '20%' },
        body: (rowData) => (
            <span className="font-black text-slate-900 text-sm hover:text-blue-600 transition-colors">
                {rowData.title || '-'}
            </span>
        )
    },
    { 
        field: "sub_title", 
        header: "Sub Title", 
        sortable: true, filter: true, 
        style: { width: '20%' },
        body: (rowData) => (
            <span className="font-medium text-slate-600 text-sm">
                {rowData.sub_title || '-'}
            </span>
        )
    },
    { 
        field: "detail", 
        header: "Detail", 
        sortable: true, 
        style: { width: '30%' },
        body: (rowData) => (
            <div className="flex items-start gap-2 text-slate-500 text-sm">
                <AlignLeft size={14} className="mt-0.5 shrink-0 text-slate-400" />
                <p className="truncate max-w-[250px]" title={rowData.detail}>
                    {rowData.detail || '-'}
                </p>
            </div>
        )
    },
    { 
        field: "sr_no", 
        header: "SR No", 
        sortable: true, filter: true, 
        style: { width: '15%' },
        body: (rowData) => (
            <div className="flex items-center gap-1.5 text-slate-700 font-bold bg-slate-100 px-2.5 py-1 rounded-lg w-fit border border-slate-200">
                <Hash size={14} className="text-slate-400" />
                {rowData.sr_no || '-'}
            </div>
        )
    },
    {
        header: "Action",
        style: { width: '5rem', textAlign: 'center' },
        body: (rowData) => (
            <button 
                onClick={() => handleEditClick(rowData)} 
                className="p-2 bg-slate-100 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all shadow-sm active:scale-90"
                title="Edit Version"
            >
                <Edit3 size={18} />
            </button>
        )
    }
  ], []);

  // -------------------------------------------------------------
  // 📍 2. ปุ่ม Action ด้านขวาบน (สร้าง Version ใหม่)
  // -------------------------------------------------------------
  const renderActionButtons = (
      <button 
        onClick={() => setIsCreateOpen(true)} 
        className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl text-sm font-black transition-all shadow-lg shadow-blue-600/30 active:scale-95"
      >
        <Plus size={18} /> สร้าง Version ใหม่
      </button>
  );

  return (
    <div className="p-4 sm:p-6 bg-slate-50 h-screen font-sans text-slate-800 flex flex-col relative overflow-hidden animate-in fade-in duration-500">
      <div className="max-w-[1600px] w-full mx-auto flex flex-col h-full gap-4">
        
        {/* 📍 3. เรียกใช้ตารางกลางแทน VersionsTable */}
        <EnterpriseDataTable 
            data={versions}
            columns={tableColumns}
            loading={isLoading}
            dataKey="id"
            // กำหนดให้ค้นหาจาก Title และ SR No แบบที่คุณเคยเขียนไว้
            globalFilterFields={['title', 'sr_no']} 
            searchPlaceholder="ค้นหา Title หรือ SR No..."
            actionButtons={renderActionButtons}
            filterDisplay="row"
        />

        <CreateVersionModal 
          isOpen={isCreateOpen} 
          onClose={() => setIsCreateOpen(false)} 
          onSuccess={fetchInitialData} 
          usersList={users} 
        />

        <EditVersionModal 
          isOpen={editModalState.isOpen} 
          versionData={editModalState.data}
          onClose={() => setEditModalState({ isOpen: false, data: null })} 
          onSuccess={fetchInitialData} 
          usersList={users} 
        />

      </div>
    </div>
  );
}