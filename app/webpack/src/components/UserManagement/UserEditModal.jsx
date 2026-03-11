import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';

const UserEditModal = ({ user, onClose, onSave, isSubmitting }) => {
  const [formData, setFormData] = useState({ ...user });

  // Update local state if user prop changes
  useEffect(() => {
    setFormData({ ...user });
  }, [user]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({ 
      ...formData, 
      [name]: type === 'checkbox' ? checked : (type === 'number' ? Number(value) : value) 
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-md p-6 relative border border-gray-200 dark:border-gray-700">
        <button 
          onClick={onClose} 
          disabled={isSubmitting}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-800 dark:hover:text-gray-200 disabled:opacity-50"
        >
          <X size={20} />
        </button>
        <h2 className="text-xl font-bold mb-4 text-gray-800 dark:text-white">แก้ไขข้อมูล User</h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-600 dark:text-gray-300">Username</label>
            <input type="text" value={formData.username} disabled className="mt-1 w-full p-2 bg-gray-100 dark:bg-gray-700/50 text-gray-500 rounded-md border border-gray-300 dark:border-gray-600 cursor-not-allowed" />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-600 dark:text-gray-300">Name</label>
              <input type="text" name="name" value={formData.name || ''} onChange={handleChange} className="mt-1 w-full p-2 bg-white dark:bg-gray-700 text-gray-800 dark:text-white rounded-md border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 outline-none transition" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 dark:text-gray-300">Role</label>
              <input type="text" name="role" value={formData.role || ''} onChange={handleChange} className="mt-1 w-full p-2 bg-white dark:bg-gray-700 text-gray-800 dark:text-white rounded-md border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 outline-none transition" required />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-600 dark:text-gray-300">Email</label>
            <input type="email" name="email" value={formData.email || ''} onChange={handleChange} className="mt-1 w-full p-2 bg-white dark:bg-gray-700 text-gray-800 dark:text-white rounded-md border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 outline-none transition" required />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-600 dark:text-gray-300">IP Address</label>
              <input type="text" name="ip_address" value={formData.ip_address || ''} onChange={handleChange} className="mt-1 w-full p-2 bg-white dark:bg-gray-700 text-gray-800 dark:text-white rounded-md border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 outline-none transition" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 dark:text-gray-300">All Member</label>
              <input type="number" name="allmember" value={formData.allmember || 0} onChange={handleChange} className="mt-1 w-full p-2 bg-white dark:bg-gray-700 text-gray-800 dark:text-white rounded-md border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 outline-none transition" />
            </div>
          </div>

          <div className="flex flex-col space-y-2 p-3 bg-gray-50 dark:bg-gray-750/50 rounded-md border border-gray-200 dark:border-gray-600 mt-4">
            <label className="flex items-center space-x-2 cursor-pointer">
              <input type="checkbox" name="is_active" checked={formData.is_active} onChange={handleChange} className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500" />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-200">Is Active (อนุญาตให้เข้าสู่ระบบ)</span>
            </label>
            <label className="flex items-center space-x-2 cursor-pointer">
              <input type="checkbox" name="is_deleted" checked={formData.is_deleted} onChange={handleChange} className="w-4 h-4 text-red-600 rounded border-gray-300 focus:ring-red-500" />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-200">Is Deleted (ระงับถาวร/ลบ)</span>
            </label>
          </div>

          <div className="flex justify-end space-x-3 mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
            <button 
              type="button" 
              onClick={onClose} 
              disabled={isSubmitting}
              className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600 transition disabled:opacity-50"
            >
              ยกเลิก
            </button>
            <button 
              type="submit" 
              disabled={isSubmitting}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition disabled:opacity-70 flex items-center"
            >
              {isSubmitting ? 'กำลังบันทึก...' : 'บันทึกข้อมูล'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UserEditModal;