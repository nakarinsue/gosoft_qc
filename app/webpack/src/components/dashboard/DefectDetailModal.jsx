import React, { useState, useEffect } from 'react';
import { X, Save, Edit2, Link2, FileText, History, Lock, AlertTriangle, Check } from 'lucide-react';
import { cn } from '../../utils/cn';
import { STATUS_CONFIG, TYPE_OPTIONS } from '../../utils/config';
import ImageGallery from './ImageGallery';

// 📍 เปลี่ยนมาใช้ API Service กลางแทน defectService 
import apiService from '../../services/apiServices';

const ExitConfirmModal = ({ onConfirm, onCancel }) => (
  <div className="fixed inset-0 z-[160] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in zoom-in-95">
    <div className="bg-white dark:bg-slate-800 p-8 rounded-[2rem] shadow-2xl max-w-sm w-full text-center border border-slate-100 dark:border-slate-700">
      <div className="size-16 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center mx-auto mb-4"><AlertTriangle size={32} /></div>
      <h4 className="text-xl font-black text-slate-900 dark:text-white mb-2">ยืนยันการปิด?</h4>
      <div className="flex flex-col gap-2 mt-4">
        <button onClick={onConfirm} className="w-full py-3 bg-red-500 text-white rounded-xl font-bold">ปิด (ไม่บันทึก)</button>
        <button onClick={onCancel} className="w-full py-3 text-slate-500 font-bold hover:bg-slate-100 rounded-xl">กลับไปแก้ไขต่อ</button>
      </div>
    </div>
  </div>
);

export default function DefectDetailModal({ defect, onClose, onSave, onViewChange }) {
  const isLocked = defect.STATUS == 4 || defect.STATUS == 0;
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({ ...defect });
  const [isDirty, setIsDirty] = useState(false);
  const [showExitConfirm, setShowExitConfirm] = useState(false);
  const [previewImg, setPreviewImg] = useState(null);
  const [images, setImages] = useState([]);
  const [loadingImg, setLoadingImg] = useState(false);

  useEffect(() => {
    if (defect?.ID) {
      setLoadingImg(true);
      // 📍 เรียกใช้ apiService กลาง สำหรับดึงรูปภาพ
      apiService.defects.getImages(defect.ID)
        .then(res => {
          // สมมติว่า res หรือ res.data เป็น Array รูปภาพ
          setImages(res.data || res || []);
        })
        .catch(err => console.error("Error loading images:", err))
        .finally(() => setLoadingImg(false));
    }
  }, [defect.ID]);

  const handleCloseAttempt = () => isDirty ? setShowExitConfirm(true) : onClose();
  const handleChange = (f, v) => { setFormData(p => ({ ...p, [f]: v })); setIsDirty(true); };
  
  const handleTypeToggle = (label) => {
    let current = formData.TYPE ? formData.TYPE.split(',').map(t => t.trim()).filter(Boolean) : [];
    if (current.includes(label)) current = current.filter(t => t !== label); else current.push(label);
    handleChange('TYPE', current.join(', '));
  };
  const selectedTypes = formData.TYPE ? formData.TYPE.split(',').map(t => t.trim()) : [];

  return (
    <div className="fixed inset-0 bg-slate-950/80 z-[100] flex items-center justify-center p-4 backdrop-blur-md animate-in fade-in">
      <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-2xl w-full max-w-6xl h-[90vh] overflow-hidden flex flex-col border border-slate-200 dark:border-slate-800 animate-in zoom-in-95">
        
        {/* Header */}
        <div className="px-8 py-5 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-white dark:bg-slate-900">
          <div className="flex items-center gap-4 overflow-hidden">
            <div className="p-3 bg-brand-primary/10 rounded-2xl text-brand-primary"><FileText size={24} /></div>
            <div className="truncate">
              <h3 className="font-black text-xl text-slate-900 dark:text-white truncate flex items-center gap-3">
                Defect Details : {defect.PRO_CODE} 
                {isLocked && <span className="px-2 py-1 bg-slate-100 text-slate-500 text-xs font-bold rounded flex items-center gap-1"><Lock size={12}/> READ ONLY</span>}
              </h3>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => onViewChange('search')} className="p-2.5 text-brand-primary hover:bg-slate-100 rounded-xl"><Link2 size={22} /></button>
            <button onClick={handleCloseAttempt} className="p-2.5 text-slate-400 hover:text-red-500 rounded-xl"><X size={28} /></button>
          </div>
        </div>
        
        {/* Content Body */}
        <div className="flex-1 overflow-hidden grid grid-cols-1 lg:grid-cols-12 bg-slate-50/50 dark:bg-slate-950/50">
          
          {/* Left Panel: Sidebar */}
          <div className="lg:col-span-4 p-6 overflow-y-auto border-r border-slate-100 dark:border-slate-800 scrollbar-hide">
             <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm mb-6">
                 <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-4">Evidence</label>
                 {loadingImg ? <div className="h-20 animate-pulse bg-slate-100 rounded-xl"/> : <ImageGallery images={images} onPreview={setPreviewImg} />}
             </div>
             
             <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm">
               <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-4 flex items-center gap-2">
                 <History size={14}/> Info
               </label>
               <div className="text-xs text-slate-500 space-y-2">
                 <p>Created: <span className="font-bold text-slate-700 dark:text-slate-300">{defect.USER_CREATE || 'System'}</span></p>
                 <p>Update: <span className="font-mono">{defect.UPDATE_DATE}</span></p>
               </div>
             </div>
          </div>
          
          {/* Right Panel: Form Fields */}
          <div className="lg:col-span-8 p-6 overflow-y-auto scrollbar-hide">
            {isLocked && <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/30 rounded-2xl flex items-center gap-3 text-red-600 dark:text-red-400"><AlertTriangle size={20} /><span className="text-sm font-bold">รายการนี้ถูกปิดงานแล้ว ไม่สามารถแก้ไขข้อมูลได้</span></div>}
            <div className={`bg-white dark:bg-slate-900 p-8 rounded-[2rem] border border-slate-100 dark:border-slate-800 space-y-8 shadow-sm ${isLocked ? 'opacity-80 pointer-events-none grayscale-[0.5]' : ''}`}>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <span className="text-xs font-black text-slate-600 mb-2 block">Status</span>
                    <select disabled={!isEditing} className="w-full p-3.5 rounded-xl border border-slate-200 bg-slate-50 dark:bg-slate-800 dark:border-slate-700 outline-none focus:ring-2 focus:ring-brand-primary/20" value={formData.STATUS} onChange={e => handleChange('STATUS', e.target.value)}>
                      {Object.entries(STATUS_CONFIG).map(([k,v]) => <option key={k} value={k}>{v.label} - {v.desc}</option>)}
                    </select>
                  </div>
                  <div>
                    <span className="text-xs font-black text-slate-600 mb-2 block">User MK</span>
                    <input disabled={!isEditing} className="w-full p-3.5 rounded-xl border border-slate-200 bg-slate-50 dark:bg-slate-800 dark:border-slate-700 outline-none focus:ring-2 focus:ring-brand-primary/20" value={formData.USER_MK} onChange={e => handleChange('USER_MK', e.target.value)} />
                  </div>
               </div>
               
               <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-black text-slate-600 block">Defect Type</span>
                    <span className="text-[10px] text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">Selected: {selectedTypes.length}</span>
                  </div>
                  {isEditing ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
                      {TYPE_OPTIONS.map((opt) => {
                        const isActive = selectedTypes.includes(opt.label);
                        return (
                          <div key={opt.value} onClick={() => handleTypeToggle(opt.label)} className={cn("cursor-pointer p-3 rounded-xl border transition-all flex items-start gap-3", isActive ? "bg-brand-primary/5 border-brand-primary" : "bg-slate-50 border-transparent hover:border-slate-300")}>
                            <div className={cn("size-5 mt-0.5 rounded-md border flex-shrink-0 flex items-center justify-center transition-all", isActive ? "bg-brand-primary border-brand-primary text-white" : "bg-white border-slate-300")}>
                              {isActive && <Check size={14} strokeWidth={3} />}
                            </div>
                            <div>
                              <p className={cn("text-xs font-bold", isActive ? "text-brand-primary" : "text-slate-700")}>{opt.label}</p>
                              <p className="text-[10px] text-slate-400 mt-0.5">{opt.Desc}</p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="flex flex-wrap gap-2 p-4 bg-slate-50 rounded-2xl border border-slate-100 min-h-[60px]">
                      {selectedTypes.map((t, i) => <span key={i} className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-700 shadow-sm">{t}</span>)}
                    </div>
                  )}
               </div>
               
               <div className="space-y-4">
                  <div>
                    <span className="text-xs font-black text-slate-600 mb-2 block">Detail</span>
                    <textarea disabled={!isEditing} rows={3} className="w-full p-4 rounded-2xl border border-slate-200 bg-slate-50 dark:bg-slate-800 dark:border-slate-700 outline-none focus:ring-2 focus:ring-brand-primary/20 resize-none custom-scrollbar" value={formData.DETAIL} onChange={e => handleChange('DETAIL', e.target.value)} />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                      <span className="text-xs font-black text-slate-600 mb-2 block">QTY</span>
                      <input type="number" disabled={!isEditing} className="w-full p-3.5 rounded-xl border border-slate-200 bg-slate-50 dark:bg-slate-800 dark:border-slate-700 outline-none focus:ring-2 focus:ring-brand-primary/20" value={formData.QTY} onChange={e => handleChange('QTY', e.target.value)} />
                    </div>
                    <div className="md:col-span-2">
                      <span className="text-xs font-black text-slate-600 mb-2 block">Remark</span>
                      <input disabled={!isEditing} className="w-full p-3.5 rounded-xl border border-slate-200 bg-slate-50 dark:bg-slate-800 dark:border-slate-700 outline-none focus:ring-2 focus:ring-brand-primary/20" value={formData.REMARK} onChange={e => handleChange('REMARK', e.target.value)} />
                    </div>
                  </div>
               </div>
            </div>
          </div>
        </div>
        
        {/* Footer */}
        <div className="px-8 py-5 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-3 bg-white dark:bg-slate-900">
           {isLocked ? (
             <button onClick={onClose} className="px-8 py-3 bg-slate-100 text-slate-500 rounded-2xl font-bold hover:bg-slate-200 transition-colors">ปิดหน้าต่าง</button>
           ) : !isEditing ? (
             <button onClick={() => setIsEditing(true)} className="px-8 py-3 bg-brand-primary text-white rounded-2xl font-black hover:brightness-110 shadow-lg shadow-brand-primary/20 flex items-center gap-2 transition-all">
               <Edit2 size={18}/> แก้ไขข้อมูล
             </button>
           ) : (
             <>
               <button onClick={() => setIsEditing(false)} className="px-6 py-3 text-slate-500 font-bold hover:bg-slate-100 rounded-2xl transition-colors">ยกเลิก</button>
               {/* หมายเหตุ: onSave ยังรับ formData กลับไปให้ component แม่จัดการต่อ หากจะรวมศูนย์ให้อยู่ที่ apiService.defects.update ต้องทำที่ฟังก์ชันแม่ครับ */}
               <button onClick={() => { onSave(formData); setIsDirty(false); setIsEditing(false); }} className="px-10 py-3 bg-emerald-500 text-white rounded-2xl font-black hover:brightness-110 shadow-lg shadow-emerald-500/20 flex items-center gap-2 transition-all active:scale-95">
                 <Save size={18}/> บันทึกข้อมูล
               </button>
             </>
           )}
        </div>
      </div>
      
      {showExitConfirm && <ExitConfirmModal onConfirm={onClose} onCancel={() => setShowExitConfirm(false)} />}
      
      {/* Image Preview Overlay */}
      {previewImg && (
        <div className="fixed inset-0 z-[150] bg-black/95 flex items-center justify-center p-4 animate-in fade-in" onClick={() => setPreviewImg(null)}>
          <button className="absolute top-10 right-10 text-white opacity-70 hover:opacity-100 transition-opacity"><X size={40}/></button>
          <img src={previewImg} className="max-w-full max-h-full rounded-lg shadow-2xl animate-in zoom-in-95" alt="Preview" />
        </div>
      )}
    </div>
  );
}