import React, { useState, useEffect, useMemo } from 'react';
import { UserPlus, Edit2, Trash2, Search, ShieldCheck, Mail, User, AlertCircle } from 'lucide-react';
import UserModal from '../components/UserManagement/UserModal';

// 📍 นำเข้า API Service กลาง
import apiService from '../services/apiServices';

export default function UserManagementScreen() {
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null); // null = Create, object = Edit

  // 1. Fetch All Users
  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      // 📍 เรียกใช้งานผ่าน apiService.auth.getUsers() (ไม่ต้องแนบ Token เองแล้ว)
      const response = await apiService.auth.getUsers();
      
      // ตัว Interceptor ของคุณมีการคืนค่า response.data ออกมาแล้ว
      const data = response?.data || response || [];
      setUsers(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Fetch users error:", error);
      alert(`ไม่สามารถโหลดข้อมูลผู้ใช้งานได้: ${error.message || ''}`);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchUsers(); }, []);

  // 2. Delete User
  const handleDelete = async (userId, username) => {
    if (window.confirm(`คุณแน่ใจหรือไม่ว่าต้องการลบผู้ใช้ "${username}"?`)) {
      try {
        // 📍 เรียกใช้งานผ่าน apiService.auth.deleteUser()
        await apiService.auth.deleteUser(userId);
        fetchUsers(); // Refresh data
      } catch (error) {
        alert(`ลบข้อมูลไม่สำเร็จ: ${error.message || ''}`);
      }
    }
  };

  // 3. Search Logic
  const filteredUsers = useMemo(() => {
    return users.filter(u => 
      u.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [users, searchTerm]);

  return (
    <div className="p-6 space-y-6 animate-in fade-in duration-500 flex flex-col h-full">
      {/* Header & Action Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-[2rem] shadow-sm border border-slate-100 dark:border-slate-800 shrink-0">
        <div>
          <h2 className="text-2xl font-black text-slate-800 dark:text-white">User Management</h2>
          <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">จัดการสิทธิ์และรายชื่อผู้ใช้งานระบบ</p>
        </div>
        
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="relative group flex-1 md:flex-none">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" size={18} />
            <input 
              type="text" 
              placeholder="ค้นหาชื่อ, username, email..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full md:w-72 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl py-3.5 pl-12 pr-4 text-sm font-bold outline-none focus:ring-4 ring-indigo-500/10 transition-all text-slate-700 dark:text-slate-200"
            />
          </div>
          <button 
            onClick={() => { setSelectedUser(null); setIsModalOpen(true); }}
            className="px-6 py-3.5 bg-indigo-600 text-white font-black rounded-2xl hover:bg-indigo-700 flex items-center gap-2 transition-all shadow-xl shadow-indigo-600/20 active:scale-95 whitespace-nowrap"
          >
            <UserPlus size={18} /> CREATE USER
          </button>
        </div>
      </div>

      {/* 📍 User Table (Scrollable Section) */}
      <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-sm border border-slate-100 dark:border-slate-800 overflow-hidden flex-1">
        <div className="max-h-[65vh] overflow-y-auto custom-scrollbar relative h-full">
          <table className="w-full text-left border-collapse">
            
            {/* 📍 Sticky Header */}
            <thead className="sticky top-0 z-20 bg-slate-50/95 dark:bg-slate-900/95 backdrop-blur-md shadow-sm border-b border-slate-200 dark:border-slate-800">
              <tr className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                <th className="p-6 w-[35%]">User Profile</th>
                <th className="p-6 w-[20%]">Username</th>
                <th className="p-6 w-[15%]">Role</th>
                <th className="p-6 w-[15%] text-center">Status</th>
                <th className="p-6 w-[15%] text-right">Actions</th>
              </tr>
            </thead>
            
            <tbody className="divide-y divide-slate-50 dark:divide-slate-800/50">
              {isLoading ? (
                <tr><td colSpan="5" className="p-20 text-center animate-pulse font-bold text-slate-400">กำลังโหลดข้อมูล...</td></tr>
              ) : filteredUsers.length === 0 ? (
                <tr><td colSpan="5" className="p-20 text-center font-bold text-slate-400">ไม่พบข้อมูลผู้ใช้งาน</td></tr>
              ) : (
                filteredUsers.map((u) => (
                  <tr key={u.user_id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors group">
                    <td className="p-6">
                      <div className="flex items-center gap-4">
                        <div className="size-12 rounded-2xl bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center text-white font-black text-lg shadow-md shrink-0 transition-transform group-hover:scale-105">
                          {u.name.substring(0,1).toUpperCase()}
                        </div>
                        <div className="overflow-hidden">
                          <p className="font-black text-slate-800 dark:text-white truncate">{u.name}</p>
                          <p className="text-xs text-slate-400 font-bold truncate mt-0.5">{u.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-6 font-mono text-sm text-indigo-600 dark:text-indigo-400 font-black tracking-tight">{u.username}</td>
                    <td className="p-6">
                      <span className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider ${u.role === 'admin' ? 'bg-rose-100 text-rose-600 dark:bg-rose-500/10 dark:text-rose-400' : 'bg-blue-100 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400'}`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="p-6 text-center">
                      <div className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-2xl text-[10px] font-black tracking-widest ${u.is_active ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400' : 'bg-slate-100 text-slate-400 dark:bg-slate-800 dark:text-slate-500'}`}>
                        <div className={`size-1.5 rounded-full ${u.is_active ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'}`} />
                        {u.is_active ? 'ACTIVE' : 'INACTIVE'}
                      </div>
                    </td>
                    <td className="p-6 text-right">
                      <div className="flex justify-end gap-2 opacity-80 group-hover:opacity-100 transition-opacity">
                        <button 
                          onClick={() => { setSelectedUser(u); setIsModalOpen(true); }}
                          className="p-2.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded-xl transition-all active:scale-90"
                        >
                          <Edit2 size={18} />
                        </button>
                        <button 
                          onClick={() => handleDelete(u.user_id, u.username)}
                          className="p-2.5 text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/30 rounded-xl transition-all active:scale-90"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* User Modal (Create/Edit) */}
      <UserModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        user={selectedUser} 
        onSuccess={fetchUsers}
      />
    </div>
  );
}


// import React, { useState, useEffect, useCallback } from 'react';
// import { AlertCircle } from 'lucide-react';
// import UserTable from '../components/UserManagement/UserTable';
// import UserEditModal from '../components/UserManagement/UserEditModal';

// export default function UserDashboard() {
//   const [users, setUsers] = useState([]);
//   const [isLoading, setIsLoading] = useState(true);
//   const [error, setError] = useState(null);
  
//   // จัดการ State ของ Modal ด้วยโครงสร้างแบบเดียวกับ VersionsPage
//   const [editModalState, setEditModalState] = useState({ isOpen: false, data: null });
//   const [isSubmitting, setIsSubmitting] = useState(false);

//   // 1. ฟังก์ชันดึงข้อมูล (ใช้ useCallback แบบเดียวกับ VersionsPage)
//   const fetchInitialData = useCallback(async () => {
//     setIsLoading(true);
//     setError(null);
//     try {
//       const token = localStorage.getItem('access_token');
//       const response = await fetch('V2/auth/users-all', {
//         method: 'GET',
//         headers: { 
//           'Accept': 'application/json',
//           'Content-Type': 'application/json',
//           'Authorization': `Bearer ${token}`
//         }
//       });

//       if (!response.ok) throw new Error('ไม่สามารถดึงข้อมูลผู้ใช้งานได้');
//       const data = await response.json();
//       setUsers(data);
//     } catch (err) {
//       setError(err.message);
//     } finally {
//       setIsLoading(false);
//     }
//   }, []);

//   useEffect(() => {
//     fetchInitialData();
//   }, [fetchInitialData]);

//   // ฟังก์ชันตอนกดปุ่ม Edit
//   const handleEditClick = (user) => {
//     setEditModalState({ isOpen: true, data: user });
//   };

//   // 2. ฟังก์ชันอัปเดตข้อมูล User
//   const handleSaveUser = async (updatedUser) => {
//     setIsSubmitting(true);
//     try {
//       const response = await fetch(`V2/auth/users/${updatedUser.username}`, {
//         method: 'PUT',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify(updatedUser)
//       });

//       if (!response.ok) throw new Error('เกิดข้อผิดพลาดในการบันทึกข้อมูล');
      
//       const savedData = await response.json();
      
//       // อัปเดต State ในตารางโดยไม่ต้องโหลดหน้าใหม่
//       setUsers(users.map(u => u.username === savedData.username ? savedData : u));
//       setEditModalState({ isOpen: false, data: null });
//       alert('บันทึกข้อมูลสำเร็จ');
//     } catch (err) {
//       alert(`Error: ${err.message}`);
//     } finally {
//       setIsSubmitting(false);
//     }
//   };

//   // 3. ฟังก์ชัน Reset Password
//   const handleResetPassword = async (username) => {
//     if (!window.confirm(`คุณต้องการรีเซ็ตรหัสผ่านของ ${username} ใช่หรือไม่?\nรหัสผ่านใหม่จะถูกตั้งเป็น: ${username}today`)) return;

//     try {
//       const response = await fetch(`V2/auth/users/${username}/reset-password`, {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//       });

//       if (!response.ok) throw new Error('ไม่สามารถรีเซ็ตรหัสผ่านได้');
      
//       alert(`รีเซ็ตรหัสผ่านสำเร็จ!\nผู้ใช้งาน ${username} ต้องเปลี่ยนรหัสผ่านในการเข้าสู่ระบบครั้งถัดไป`);
//     } catch (err) {
//       alert(`Error: ${err.message}`);
//     }
//   };

//   return (
//     <div className="space-y-6 animate-in fade-in duration-500 pb-20 p-6 bg-slate-50 min-h-screen">
//       <div className="max-w-7xl mx-auto space-y-6">

//         {/* แสดง Error ถ้ามี */}
//         {error && (
//           <div className="p-4 bg-red-50 border-l-4 border-red-500 rounded-md flex items-center text-red-700">
//             <AlertCircle className="mr-2" size={20} />
//             <p>{error}</p>
//           </div>
//         )}

//         {/* UI แบบเดียวกับ VersionsPage */}
//         {isLoading ? (
//           <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-200 min-h-[400px] flex items-center justify-center">
//             <div className="text-slate-400 flex flex-col items-center gap-3">
//                <div className="size-10 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
//                <p className="font-bold tracking-widest uppercase text-sm animate-pulse">Loading Data...</p>
//             </div>
//           </div>
//         ) : (
//           <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
//             <UserTable 
//               users={users} 
//               onEdit={handleEditClick} 
//               onResetPassword={handleResetPassword} 
//             />
//           </div>
//         )}

//         {/* Render Edit Modal */}
//         {editModalState.isOpen && editModalState.data && (
//           <UserEditModal 
//             user={editModalState.data} 
//             onClose={() => setEditModalState({ isOpen: false, data: null })} 
//             onSave={handleSaveUser}
//             isSubmitting={isSubmitting}
//           />
//         )}
//       </div>
//     </div>
//   );
// }