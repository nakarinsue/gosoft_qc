import React, { useState, useEffect } from 'react';
import { Moon, Sun, AlertCircle } from 'lucide-react';
import UserTable from './UserTable';
import UserEditModal from './UserEditModal';

// **กำหนด URL ของ API Backend ของคุณที่นี่**
const API_BASE_URL = 'V2/api/users'; // เปลี่ยนเป็น URL จริงตอนใช้งาน

export default function UserDashboard() {
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingUser, setEditingUser] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(true);

  // 1. ดึงข้อมูลเมื่อโหลดหน้าจอ
  const fetchUsers = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(API_BASE_URL);
      if (!response.ok) throw new Error('ไม่สามารถดึงข้อมูลผู้ใช้งานได้');
      const data = await response.json();
      setUsers(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // 2. ฟังก์ชันอัปเดตข้อมูล User
  const handleSaveUser = async (updatedUser) => {
    setIsSubmitting(true);
    try {
      const response = await fetch(`${API_BASE_URL}/${updatedUser.username}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedUser)
      });

      if (!response.ok) throw new Error('เกิดข้อผิดพลาดในการบันทึกข้อมูล');
      
      const savedData = await response.json();
      
      // อัปเดต State ในตารางโดยไม่ต้องโหลดหน้าใหม่
      setUsers(users.map(u => u.username === savedData.username ? savedData : u));
      setEditingUser(null);
      alert('บันทึกข้อมูลสำเร็จ');
    } catch (err) {
      alert(`Error: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  // 3. ฟังก์ชัน Reset Password
  const handleResetPassword = async (username) => {
    if (!window.confirm(`คุณต้องการรีเซ็ตรหัสผ่านของ ${username} ใช่หรือไม่?\nรหัสผ่านใหม่จะถูกตั้งเป็น: ${username}today`)) return;

    try {
      // ส่งคำสั่งไป Backend เพื่อให้ Backend จัดการเข้ารหัส (Hash) และเซ็ตค่าบังคับเปลี่ยนรหัส
      const response = await fetch(`${API_BASE_URL}/${username}/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      if (!response.ok) throw new Error('ไม่สามารถรีเซ็ตรหัสผ่านได้');
      
      alert(`รีเซ็ตรหัสผ่านสำเร็จ!\nผู้ใช้งาน ${username} ต้องเปลี่ยนรหัสผ่านในการเข้าสู่ระบบครั้งถัดไป`);
    } catch (err) {
      alert(`Error: ${err.message}`);
    }
  };

  return (
    <div className={`${isDarkMode ? 'dark' : ''} min-h-screen transition-colors duration-300 font-sans`}>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 p-4 md:p-8">
        
        {/* Header & Theme Toggle */}
        <div className="max-w-7xl mx-auto flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-gray-800 dark:text-white">User Management</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">จัดการข้อมูลผู้ใช้งานและสิทธิ์การเข้าถึงระบบ</p>
          </div>
          <button 
            onClick={() => setIsDarkMode(!isDarkMode)}
            className="p-2 rounded-full bg-white dark:bg-gray-800 shadow-sm border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700 transition"
          >
            {isDarkMode ? <Sun size={20} className="text-yellow-400" /> : <Moon size={20} className="text-gray-600" />}
          </button>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="max-w-7xl mx-auto mb-6 p-4 bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 rounded-md flex items-center text-red-700 dark:text-red-400">
            <AlertCircle className="mr-2" size={20} />
            <p>{error}</p>
            <button onClick={fetchUsers} className="ml-auto underline text-sm hover:text-red-800 dark:hover:text-red-300">ลองใหม่</button>
          </div>
        )}

        {/* Table Container */}
        <div className="max-w-7xl mx-auto bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
          <UserTable 
            users={users} 
            isLoading={isLoading} 
            onEdit={(user) => setEditingUser(user)} 
            onResetPassword={handleResetPassword} 
          />
        </div>
      </div>

      {/* Render Edit Modal */}
      {editingUser && (
        <UserEditModal 
          user={editingUser} 
          onClose={() => setEditingUser(null)} 
          onSave={handleSaveUser}
          isSubmitting={isSubmitting}
        />
      )}
    </div>
  );
}