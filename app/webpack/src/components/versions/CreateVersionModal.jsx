// components/versions/CreateVersionModal.jsx
import React, { useState, useEffect } from 'react';
import { X, PlusCircle } from 'lucide-react';

// 📍 นำเข้า API Service กลาง (แทน versionApi)
import apiService from '../../services/apiServices';

// ฟังก์ชันคำนวณค่าเริ่มต้นของวันที่
const getDefaultValues = () => {
  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();
  
  const thaiMonths = [
    "มกราคม", "กุมภาพันธ์", "มีนาคม", "เมษายน", "พฤษภาคม", "มิถุนายน",
    "กรกฎาคม", "สิงหาคม", "กันยายน", "ตุลาคม", "พฤศจิกายน", "ธันวาคม"
  ];
  
  const nextMonthIndex = (currentDate.getMonth() + 1) % 12;
  const nextMonthName = thaiMonths[nextMonthIndex];

  return {
    sr_no: `${currentYear} / `,
    // แก้ไข: แปลงปีเป็น String แล้วใช้ .slice(-2) เพื่อดึงตัวเลข 2 หลักสุดท้าย
    title: `${currentYear.toString().slice(-2)}00${nextMonthIndex+1}`,
    sub_title: `โปรโมชั่น รอบเดือน ${nextMonthName}`,
    detail: 'โปรโมชั่น',
    sr_link_url: '',
    lp_no: '00000'
  };
};

const CreateVersionModal = ({ isOpen, onClose, onSuccess }) => {
  const [formData, setFormData] = useState(getDefaultValues());
  const [isSubmitting, setIsSubmitting] = useState(false);

  // รีเซ็ตค่าฟอร์มทุกครั้งที่เปิด Modal ขึ้นมาใหม่
  useEffect(() => {
    if (isOpen) {
      setFormData(getDefaultValues());
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // ตรวจสอบเฉพาะช่อง lp_no ให้รับเฉพาะตัวเลข
    if (name === 'lp_no') {
      const numericValue = value.replace(/\D/g, ''); 
      setFormData(prev => ({ ...prev, [name]: numericValue }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      // 📍 เรียกใช้ apiService กลาง สำหรับสร้าง Version
      await apiService.versions.create(formData);
      
      onSuccess();
      onClose();
    } catch (error) {
      alert(`เกิดข้อผิดพลาดในการบันทึกข้อมูล: ${error.message || ''}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Component สำหรับแสดง Label สไตล์ Modern
  const Label = ({ text, required }) => (
    <label className="block text-xs font-black text-slate-500 uppercase tracking-wider mb-2">
      {text} {required && <span className="text-rose-500">*</span>}
    </label>
  );

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex justify-center items-center z-[100] p-4 animate-in fade-in duration-200">
      <div className="bg-white p-8 rounded-[2rem] w-full max-w-lg shadow-2xl border border-slate-100 animate-in zoom-in-95">
        
        {/* Header */}
        <div className="flex justify-between items-center border-b border-slate-100 pb-4 mb-6">
          <div>
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">สร้าง Version ใหม่</h2>
            <p className="text-slate-500 font-bold text-sm mt-1">กรอกข้อมูลเพื่อเปิดรอบโปรโมชั่นใหม่</p>
          </div>
          <button onClick={onClose} className="p-2 bg-slate-50 hover:bg-slate-100 text-slate-400 hover:text-slate-600 rounded-full transition-colors">
            <X size={20} />
          </button>
        </div>
        
        {/* Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label text="SR No." required />
              <input type="text" name="sr_no" value={formData.sr_no} onChange={handleChange} required
                className="w-full border border-slate-200 rounded-xl p-3 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 focus:outline-none text-sm font-bold text-slate-700 transition-all" />
            </div>
            <div>
              <Label text="LP No." />
              <input type="text" name="lp_no" value={formData.lp_no} onChange={handleChange} 
                className="w-full border border-slate-200 rounded-xl p-3 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 focus:outline-none text-sm font-bold text-slate-700 transition-all" />
            </div>
          </div>

          <div>
            <Label text="Title" required />
            <input type="text" name="title" value={formData.title} onChange={handleChange} required
              className="w-full border border-slate-200 rounded-xl p-3 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 focus:outline-none text-sm font-medium text-slate-700 transition-all" />
          </div>

          <div>
            <Label text="Sub Title" required />
            <input type="text" name="sub_title" value={formData.sub_title} onChange={handleChange} required
              className="w-full border border-slate-200 rounded-xl p-3 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 focus:outline-none text-sm font-medium text-slate-700 transition-all" />
          </div>

          <div>
            <Label text="Detail" />
            <textarea name="detail" value={formData.detail} onChange={handleChange} 
              className="w-full border border-slate-200 rounded-2xl p-4 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 focus:outline-none resize-y min-h-[80px] max-h-[250px] text-sm font-medium text-slate-700 transition-all custom-scrollbar" 
              placeholder="ระบุรายละเอียดเพิ่มเติม..." />
          </div>

          <div>
            <Label text="Link (SR Link URL)" />
            <input type="text" name="sr_link_url" value={formData.sr_link_url} onChange={handleChange} 
              placeholder="Notes://......"
              className="w-full border border-slate-200 rounded-xl p-3 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 focus:outline-none text-sm font-medium text-slate-700 transition-all" />
          </div>

          {/* Footer Buttons */}
          <div className="flex justify-end gap-3 mt-4 pt-6 border-t border-slate-100">
            <button type="button" onClick={onClose} 
              className="px-6 py-3 bg-slate-100 text-slate-500 font-bold rounded-xl hover:bg-slate-200 transition-colors">
              ยกเลิก
            </button>
            <button type="submit" disabled={isSubmitting} 
              className="px-6 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 shadow-lg shadow-blue-600/30 transition-all disabled:opacity-50 flex items-center gap-2">
              {isSubmitting ? 'กำลังบันทึก...' : <><PlusCircle size={18}/> ยืนยันการสร้าง</>}
            </button>
          </div>
          
        </form>
      </div>
    </div>
  );
};

export default CreateVersionModal;