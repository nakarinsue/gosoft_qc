import React, { useState, useEffect } from 'react';
import { X, Save, User, Mail, Shield, Lock, ToggleLeft } from 'lucide-react';

export default function UserModal({ isOpen, onClose, user, onSuccess }) {
  const isEdit = !!user;
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    name: '',
    email: '',
    role: 'USER',
    is_active: true
  });
  
  const [isChanged, setIsChanged] = useState(false);

  // โหลดข้อมูลเข้าฟอร์มกรณี Edit
  useEffect(() => {
    if (isOpen) {
      if (user) {
        setFormData({
          name: user.name || '',
          email: user.email || '',
          role: user.role || 'USER',
          is_active: user.is_active ?? true
        });
      } else {
        setFormData({
          username: '',
          password: '',
          name: '',
          email: '',
          role: 'USER',
          is_active: true
        });
      }
      setIsChanged(false);
    }
  }, [isOpen, user]);

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setIsChanged(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const url = isEdit ? `V2/auth/users/${user.user_id}` : 'V2/auth/users';
    const method = isEdit ? 'PATCH' : 'POST';

    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch(url, {
        method: method,
        headers: { 'Accept'         : 'application/json',
                    'Content-Type'  : 'application/json',
                    'Authorization' : `Bearer ${token}`},
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        onSuccess();
        onClose();
      }
    } catch (error) {
      alert("ไม่สามารถบันทึกข้อมูลได้");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-[2.5rem] shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95">
        
        {/* Modal Header */}
        <div className="p-8 border-b dark:border-slate-800 flex justify-between items-center bg-white dark:bg-slate-900">
          <div>
            <h2 className="text-2xl font-black text-slate-800 dark:text-white">
              {isEdit ? 'Edit User' : 'Create New User'}
            </h2>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">
              {isEdit ? `ID: #${user.user_id}` : 'ระบุข้อมูลผู้ใช้ใหม่'}
            </p>
          </div>
          <button onClick={onClose} className="p-2 bg-slate-50 dark:bg-slate-800 text-slate-400 hover:text-rose-500 rounded-full transition-all">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-5">
          {/* ข้อมูลพื้นฐาน (โชว์เฉพาะตอน Create) */}
          {!isEdit && (
            <>
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase ml-2">Username</label>
                <div className="relative">
                  <User size={16} className="absolute left-4 top-3.5 text-slate-400" />
                  <input required value={formData.username} onChange={(e) => handleChange('username', e.target.value)} className="w-full bg-slate-50 dark:bg-slate-800 rounded-2xl py-3 pl-11 pr-4 text-sm font-bold border-none outline-none focus:ring-2 ring-indigo-500/20" />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase ml-2">Password</label>
                <div className="relative">
                  <Lock size={16} className="absolute left-4 top-3.5 text-slate-400" />
                  <input type="password" required value={formData.password} onChange={(e) => handleChange('password', e.target.value)} className="w-full bg-slate-50 dark:bg-slate-800 rounded-2xl py-3 pl-11 pr-4 text-sm font-bold border-none outline-none focus:ring-2 ring-indigo-500/20" />
                </div>
              </div>
            </>
          )}

          {/* ข้อมูลที่แก้ไขได้เสมอ */}
          <div className="space-y-1">
            <label className="text-[10px] font-black text-slate-400 uppercase ml-2">Full Name</label>
            <div className="relative">
              <User size={16} className="absolute left-4 top-3.5 text-slate-400" />
              <input required value={formData.name} onChange={(e) => handleChange('name', e.target.value)} className="w-full bg-slate-50 dark:bg-slate-800 rounded-2xl py-3 pl-11 pr-4 text-sm font-bold border-none outline-none focus:ring-2 ring-indigo-500/20" />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-black text-slate-400 uppercase ml-2">Email</label>
            <div className="relative">
              <Mail size={16} className="absolute left-4 top-3.5 text-slate-400" />
              <input type="email" required value={formData.email} onChange={(e) => handleChange('email', e.target.value)} className="w-full bg-slate-50 dark:bg-slate-800 rounded-2xl py-3 pl-11 pr-4 text-sm font-bold border-none outline-none focus:ring-2 ring-indigo-500/20" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-400 uppercase ml-2">Role</label>
              <select value={formData.role} onChange={(e) => handleChange('role', e.target.value)} className="w-full bg-slate-50 dark:bg-slate-800 rounded-2xl py-3 px-4 text-sm font-bold border-none outline-none focus:ring-2 ring-indigo-500/20">
                <option value="USER">USER</option>
                <option value="admin">ADMIN</option>
              </select>
            </div>
            {isEdit && (
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase ml-2">Account Status</label>
                <button 
                  type="button"
                  onClick={() => handleChange('is_active', !formData.is_active)}
                  className={`w-full py-3 rounded-2xl text-[10px] font-black transition-all ${formData.is_active ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-400'}`}
                >
                  {formData.is_active ? 'ACTIVE' : 'INACTIVE'}
                </button>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="pt-4">
            {(!isEdit || isChanged) && (
              <button 
                type="submit" 
                className="w-full py-4 bg-indigo-600 text-white font-black rounded-2xl hover:bg-indigo-700 shadow-xl shadow-indigo-600/20 transition-all flex items-center justify-center gap-2 active:scale-95"
              >
                <Save size={18} /> {isEdit ? 'UPDATE CHANGES' : 'CREATE ACCOUNT'}
              </button>
            )}
            <button 
              type="button" 
              onClick={onClose}
              className="w-full mt-2 py-3 text-slate-400 text-xs font-bold hover:text-slate-600 transition-colors"
            >
              CANCEL
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}