// pages/VersionsPage.jsx
import React, { useState, useEffect, useCallback } from 'react';
import VersionsTable from '../components/versions/VersionsTable';
import CreateVersionModal from '../components/versions/CreateVersionModal';
import EditVersionModal from '../components/versions/EditVersionModal';
import { versionApi } from '../services/api/version.api';
// สมมติว่ามี API สำหรับดึงข้อมูล User ให้ import มาใช้งานที่นี่
// import { userApi } from '../services/api/user.api'; 

const VersionsPage = () => {
  const [versions, setVersions] = useState([]);
  const [users, setUsers] = useState([]); // State สำหรับเก็บรายชื่อ User
  const [isLoading, setIsLoading] = useState(true);
  
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editModalState, setEditModalState] = useState({ isOpen: false, data: null });

  // ฟังก์ชันดึงข้อมูลทั้งหมด (Versions และ Users)
  const fetchInitialData = useCallback(async () => {
    setIsLoading(true);
    try {
      // ใช้ Promise.all เพื่อดึงข้อมูลพร้อมกัน (ลดเวลาโหลด)
      const [versionsData, usersData] = await Promise.all([
        versionApi.getAll(),
      ]);
      
      setVersions(versionsData);
      window.dispatchEvent(new CustomEvent('version-data-updated'));
      // MOCK DATA สำหรับทดสอบ Map ID (ลบออกเมื่อต่อ API จริง)
      // setUsers([]);
      setUsers(usersData); // ใช้บรรทัดนี้เมื่อต่อ API จริง

    } catch (error) {
      console.error("Failed to load initial data");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { fetchInitialData(); }, [fetchInitialData]);

  const handleEditClick = (id) => {
    const selectedVersion = versions.find(v => v.id === id);
    if (selectedVersion) {
      setEditModalState({ isOpen: true, data: selectedVersion });
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-20 p-6 bg-slate-50 min-h-screen">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {isLoading ? (
          <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-200 min-h-[400px] flex items-center justify-center">
            <div className="text-slate-400 flex flex-col items-center gap-3">
               <div className="size-10 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
               <p className="font-bold tracking-widest uppercase text-sm animate-pulse">Loading Data...</p>
            </div>
          </div>
        ) : (
          <VersionsTable 
            data={versions} 
            onEditRow={handleEditClick} 
            onOpenCreate={() => setIsCreateOpen(true)}
          />
        )}

        {/* ส่งข้อมูล users เข้าไปใน Props */}
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
};

export default VersionsPage;