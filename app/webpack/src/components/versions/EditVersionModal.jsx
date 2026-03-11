// components/versions/EditVersionModal.jsx
import React, { useState, useEffect } from 'react';
import { versionApi } from '../../services/api/version.api';
import { ExternalLink, X, Save } from 'lucide-react';

const EditVersionModal = ({ isOpen, onClose, onSuccess, versionData }) => {
  const [formData, setFormData] = useState({ 
    sub_title: '', 
    status: 0, 
    detail: '',
    lp_no: '',
    sr_link_url: '',
    date_create: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen && versionData) {
      setFormData({
        sub_title: versionData.sub_title || '',
        status: versionData.status !== undefined ? versionData.status : 0,
        detail: versionData.detail || '',
        lp_no: versionData.lp_no || '00000',
        sr_link_url: versionData.sr_link_url || '',
        date_create: versionData.date_create ? new Date(versionData.date_create).toLocaleString('th-TH') : '-'
      });
    }
  }, [isOpen, versionData]);

  if (!isOpen || !versionData) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ 
      ...prev, 
      [name]: name === 'status' ? Number(value) : value 
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const payload = {
        title: versionData.title, // ส่ง title เดิมกลับไปด้วยเพื่อป้องกัน error
        sub_title: formData.sub_title,
        status: formData.status,
        detail: formData.detail
      };
      await versionApi.update(versionData.id, payload);
      onSuccess();
      onClose();
    } catch (error) {
      alert('เกิดข้อผิดพลาดในการอัปเดตข้อมูล');
    } finally {
      setIsSubmitting(false);
    }
  };

  const Label = ({ text, required }) => (
    <label className="block text-xs font-black text-slate-500 uppercase tracking-wider mb-2">
      {text} {required && <span className="text-rose-500">*</span>}
    </label>
  );

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex justify-center items-center z-[100] p-4 animate-in fade-in duration-200">
      <div className="bg-white p-8 rounded-[2rem] w-full max-w-lg shadow-2xl border border-slate-100 animate-in zoom-in-95">
        
        <div className="flex justify-between items-center border-b border-slate-100 pb-4 mb-6">
          <div>
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">แก้ไข Version</h2>
            <p className="text-blue-600 font-bold text-sm mt-1">{versionData.title}</p>
          </div>
          <button onClick={onClose} className="p-2 bg-slate-50 hover:bg-slate-100 text-slate-400 hover:text-slate-600 rounded-full transition-colors">
            <X size={20} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <div>
            <Label text="Detail" required/>
            <textarea name="detail" value={formData.detail} onChange={handleChange} required
              className="w-full border border-slate-200 rounded-2xl p-4 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 focus:outline-none resize-y min-h-[100px] max-h-[300px] text-sm font-medium text-slate-700 transition-all" 
              placeholder="ระบุรายละเอียดเพิ่มเติม..." />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label text="Other (Sub Title)" required />
              <input type="text" name="sub_title" value={formData.sub_title} onChange={handleChange} required
                className="w-full border border-slate-200 rounded-xl p-3 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 focus:outline-none text-sm font-medium text-slate-700 transition-all" />
            </div> 
            <div>
              <Label text="Status" required/>
              <select name="status" value={formData.status} onChange={handleChange} required
                className="w-full border border-slate-200 rounded-xl p-3 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 focus:outline-none text-sm font-bold text-slate-700 cursor-pointer transition-all">
                <option value={0}>Draft</option>
                <option value={1}>Import document</option>
                <option value={2}>Test process</option>
                <option value={3}>Retest</option>
                <option value={4}>Close</option>
                <option value={5}>Cancel</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 border-t border-slate-100 pt-5 mt-2">
            <div>
              <Label text="LP No." />
              <input type="text" value={formData.lp_no} disabled 
                className="w-full border border-slate-200 rounded-xl p-3 bg-slate-100/70 text-slate-400 font-medium cursor-not-allowed text-sm" />
            </div>
            <div>
              <Label text="Create Date" />
              <input type="text" value={formData.date_create} disabled 
                className="w-full border border-slate-200 rounded-xl p-3 bg-slate-100/70 text-slate-400 font-medium cursor-not-allowed text-sm" />
            </div>
          </div>

          <div>
            <Label text="Link (SR Link URL)" />
            <div className="flex gap-2">
              <input type="text" value={formData.sr_link_url} disabled 
                className="w-full border border-slate-200 rounded-xl p-3 bg-slate-100/70 text-slate-400 font-medium cursor-not-allowed text-sm" />
              <button 
                type="button" 
                onClick={() => window.open(formData.sr_link_url, '_blank')}
                disabled={!formData.sr_link_url}
                className="p-3 bg-slate-50 border border-slate-200 text-blue-600 rounded-xl hover:bg-blue-50 hover:border-blue-200 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex-shrink-0 shadow-sm"
                title="เปิดลิงก์ในหน้าต่างใหม่"
              >
                <ExternalLink size={20} />
              </button>
            </div>
          </div>

          <div className="flex justify-end gap-3 mt-4 pt-6 border-t border-slate-100">
            <button type="button" onClick={onClose} 
              className="px-6 py-3 bg-slate-100 text-slate-500 font-bold rounded-xl hover:bg-slate-200 transition-colors">
              ยกเลิก
            </button>
            <button type="submit" disabled={isSubmitting} 
              className="px-6 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 shadow-lg shadow-blue-600/30 transition-all disabled:opacity-50 flex items-center gap-2">
              {isSubmitting ? 'กำลังบันทึก...' : <><Save size={18}/> อัปเดตข้อมูล</>}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};

export default EditVersionModal;