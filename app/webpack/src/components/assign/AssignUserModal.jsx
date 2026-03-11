import React, { useState, useMemo } from 'react';
import { X, UserPlus, Trash2, CheckCircle2, Loader2 } from 'lucide-react';

const AssignUserModal = ({ isOpen, onClose, onConfirm, allUsers = [] }) => {
  const [selectedUserIds, setSelectedUserIds] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // ป้องกัน Error กรณี props ส่งมาไม่ใช่ Array
  const safeAllUsers = Array.isArray(allUsers) ? allUsers : [];

  const availableUsers = useMemo(() => {
    return safeAllUsers.filter(user => {
      const userId = user.user_id || user.id; 
      return !selectedUserIds.includes(userId);
    });
  }, [safeAllUsers, selectedUserIds]);

  const selectedUsersData = useMemo(() => {
    return selectedUserIds
      .map(id => safeAllUsers.find(u => (u.user_id || u.id) === id))
      .filter(Boolean); // ตัดค่า undefined ออก
  }, [safeAllUsers, selectedUserIds]);

  if (!isOpen) return null;

  const handleSelectUser = (e) => {
    const selectedId = Number(e.target.value);
    if (selectedId) {
      setSelectedUserIds(prev => [...prev, selectedId]);
    }
    e.target.value = ""; 
  };

  const handleRemoveUser = (idToRemove) => {
    setSelectedUserIds(prev => prev.filter(id => id !== idToRemove));
  };

  const handleSubmit = async () => {
    if (selectedUserIds.length === 0) return alert('กรุณาเลือกผู้ใช้งานอย่างน้อย 1 คน');
    
    setIsSubmitting(true);
    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch('/V2/import/Assign/user', { 
        method: 'POST',
                headers: { 'Accept'         : 'application/json',
                    'Content-Type'  : 'application/json',
                    'Authorization' : `Bearer ${token}`
          },
        body: JSON.stringify({ id: selectedUserIds }) 
      });

      if (!response.ok) throw new Error('Network response was not ok');
      
      const result = await response.json();
      
      // Defensive: ตรวจสอบและดึง Array ออกมาเพื่อป้องกัน .some is not a function ในหน้าหลัก
      const dataToUpdate = Array.isArray(result) ? result : (result?.data || []);
      
      onConfirm(dataToUpdate, selectedUsersData); 
      onClose();
      setSelectedUserIds([]); 

    } catch (error) {
      console.error('Error assigning users:', error);
      alert('เกิดข้อผิดพลาดในการคำนวณการ Assign');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-md flex justify-center items-center z-[100] p-4 animate-in fade-in duration-200">
      <div className="bg-white p-8 rounded-[2.5rem] w-full max-w-lg shadow-2xl border border-slate-100 animate-in zoom-in-95">
        
        <div className="flex justify-between items-center border-b border-slate-100 pb-4 mb-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-600 text-white shadow-lg shadow-blue-200 rounded-2xl"><UserPlus size={24}/></div>
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">Assign Users</h2>
          </div>
          <button onClick={onClose} className="p-2 bg-slate-50 hover:bg-slate-100 text-slate-400 hover:text-slate-600 rounded-full transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="mb-6 space-y-2">
           <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">ค้นหาและเลือกผู้ใช้งาน</label>
          <select 
            className="w-full border border-slate-200 rounded-2xl p-4 bg-slate-50 focus:bg-white focus:ring-4 focus:ring-blue-500/10 outline-none text-sm font-bold text-slate-700 cursor-pointer"
            defaultValue="" 
            onChange={handleSelectUser}
            disabled={isSubmitting}
          >
            <option value="" disabled>-- กรุณาเลือก Username --</option>
            {availableUsers.map(u => (
              <option key={u.user_id || u.id} value={u.user_id || u.id}>
                {u.username}
              </option>
            ))}
          </select>
        </div>

        <div className="border border-slate-100 rounded-2xl overflow-hidden mb-6 max-h-[250px] overflow-y-auto bg-slate-50/50">
          <table className="w-full text-left text-sm">
            <thead className="bg-white/50 text-slate-400 font-black uppercase text-[10px] tracking-wider sticky top-0">
              <tr>
                <th className="p-4 w-16 text-center">No.</th>
                <th className="p-4">Username</th>
                <th className="p-4 text-center w-20">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {selectedUsersData.length === 0 ? (
                <tr><td colSpan="3" className="p-8 text-center text-slate-400 font-bold italic">ยังไม่ได้เลือกผู้ใช้งาน</td></tr>
              ) : (
                selectedUsersData.map((user, index) => (
                  <tr key={user.user_id || user.id} className="hover:bg-white transition-colors group">
                    <td className="p-4 text-center font-bold text-slate-400">{index + 1}</td>
                    <td className="p-4 font-bold text-slate-700">{user.username}</td>
                    <td className="p-4 text-center">
                      <button 
                        onClick={() => handleRemoveUser(user.user_id || user.id)}
                        className="p-2 text-rose-500 hover:bg-rose-50 rounded-xl transition-colors opacity-0 group-hover:opacity-100"
                      >
                        <Trash2 size={16}/>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="flex gap-3 pt-4">
          <button onClick={onClose} className="flex-1 py-4 bg-slate-100 text-slate-500 font-bold rounded-2xl hover:bg-slate-200 transition-colors">ยกเลิก</button>
          <button 
            onClick={handleSubmit} 
            className="flex-[2] py-4 bg-blue-600 text-white font-bold rounded-2xl hover:bg-blue-700 flex justify-center items-center gap-2 shadow-xl shadow-blue-600/20 transition-all active:scale-95 disabled:opacity-50"
            disabled={selectedUserIds.length === 0 || isSubmitting}
          >
            {isSubmitting ? <Loader2 className="animate-spin" size={20}/> : <CheckCircle2 size={18}/>} 
            ยืนยันการทำ Auto Assign
          </button>
        </div>

      </div>
    </div>
  );
};

export default AssignUserModal;