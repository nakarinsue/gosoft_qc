import React, { useState, useEffect } from 'react';
import { X, Edit3, FileText, Activity, Layers, Image as ImageIcon, Save, RefreshCw, Maximize2 } from 'lucide-react';
import Barcode from 'react-barcode'; // 📍 ต้อง npm install react-barcode
import { STATUS_CONFIG } from '../config';

export default function PromotionDetailModal({ data, onClose, onSave }) {
    const [formData, setFormData] = useState(null);
    const [isSaving, setIsSaving] = useState(false);
    
    // State สำหรับเช็คว่ามีการแก้ไขข้อมูลหรือไม่ (Dirty Check)
    const [initialStateStr, setInitialStateStr] = useState('');
    
    // State สำหรับขยายรูปภาพ
    const [enlargedImage, setEnlargedImage] = useState(null);

    // ฟังก์ชันดึงเฉพาะฟิลด์ที่อนุญาตให้แก้ไขได้ เพื่อนำมาเปรียบเทียบว่าข้อมูลเปลี่ยนหรือไม่
    const getEditableFields = (d) => ({
        title: d?.title || '',
        detail: d?.detail || '',
        remark: d?.remark || '',
        status: d?.status || 1,
        POS: d?.POS || d?.system || 'POS'
    });

    useEffect(() => {
        if (data) {
            setFormData({ ...data, POS: data.POS || data.system || 'POS' });
            setInitialStateStr(JSON.stringify(getEditableFields(data)));
        }
    }, [data]);

    if (!data || !formData) return null;

    const handleChange = (key, value) => setFormData(prev => ({ ...prev, [key]: value }));
    
    // ตรวจสอบว่ามีการแก้ไขข้อมูลหรือไม่
    const isModified = JSON.stringify(getEditableFields(formData)) !== initialStateStr;

    const handleSubmit = async () => {
        setIsSaving(true);
        // ส่งกลับไปพร้อมปรับ map ค่า POS กลับเป็น system หาก API ของคุณต้องการ
        await onSave({ ...formData, system: formData.POS }); 
        setIsSaving(false);
        onClose();
    };

    const images = Array.isArray(formData.IMAGE) ? formData.IMAGE : (Array.isArray(formData.image) ? formData.image : (formData.image ? [{ valuer: formData.image }] : []));
    
    return (
        <div className="fixed inset-0 bg-slate-900/60 z-[60] flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-[2rem] w-full max-w-5xl max-h-[90vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden relative">
                
                {/* Header */}
                <div className="px-8 py-6 border-b border-slate-100 flex justify-between items-center bg-white shrink-0">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl border border-blue-100 shadow-sm"><Edit3 size={24} /></div>
                        <div>
                            <h3 className="text-xl font-black text-slate-800 tracking-tight">Promotion Details</h3>
                            <p className="text-xs font-bold text-slate-400 mt-1 uppercase tracking-wider">View and edit promotion information</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2.5 hover:bg-slate-100 rounded-full transition-colors text-slate-400 hover:text-slate-600"><X size={24} /></button>
                </div>
                
                {/* Body (Scrollable) */}
                <div className="p-6 sm:p-8 overflow-y-auto custom-scrollbar bg-slate-50/50 flex-1 space-y-6">
                    
                    {/* 📍 Section 1: Basic Information */}
                    <section className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
                        <h4 className="text-sm font-black text-indigo-600 uppercase tracking-wider mb-4 flex items-center gap-2">
                            <FileText size={16}/> 1. Basic Information
                        </h4>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                            <div>
                                <label className="text-[10px] font-bold text-slate-400 uppercase">ID</label>
                                <p className="font-bold text-slate-800">{formData.id || '-'}</p>
                            </div>
                            <div>
                                <label className="text-[10px] font-bold text-slate-400 uppercase">Promotion Code</label>
                                <p className="font-mono font-black text-slate-700 bg-slate-100 px-2 py-0.5 rounded inline-block">{formData.PROMOTION_CODE || formData.promotion_code || '-'}</p>
                            </div>
                            <div>
                                <label className="text-[10px] font-bold text-slate-400 uppercase">Promotion Name</label>
                                <p className="font-bold text-slate-800">{formData.PROMOTION_NAME || formData.promotion_name || '-'}</p>
                            </div>
                            <div>
                                <label className="text-[10px] font-bold text-slate-400 uppercase">System (POS)</label>
                                <select className="w-full mt-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg font-bold text-slate-700 outline-none" value={formData.POS} onChange={(e) => handleChange('POS', e.target.value)}>
                                    <option value="POS">POS</option>
                                    <option value="DELIVERY">DELIVERY</option>
                                </select>
                            </div>
                            <div className="col-span-2 md:col-span-1">
                                <label className="text-[10px] font-bold text-slate-400 uppercase">File Name & Sheet</label>
                                <p className="font-bold text-slate-800 truncate" title={formData.file_name}>{formData.file_name || '-'}</p>
                                <p className="text-xs text-slate-500">Sheet: {formData.sheet || '-'}</p>
                            </div>
                        </div>
                    </section>

                    {/* 📍 Section 2: Details & Status */}
                    <section className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
                        <h4 className="text-sm font-black text-emerald-600 uppercase tracking-wider mb-4 flex items-center gap-2">
                            <Activity size={16}/> 2. Details & Tracking
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-4">
                                <div>
                                    <label className="text-xs font-bold text-slate-600 ml-1">Title</label>
                                    <input type="text" className="w-full mt-1 px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-700 outline-none focus:border-emerald-500 transition-colors" value={formData.title || ''} onChange={(e) => handleChange('title', e.target.value)} />
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-slate-600 ml-1">Detail</label>
                                    <textarea rows={3} className="w-full mt-1 px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-700 outline-none resize-none focus:border-emerald-500 transition-colors" value={formData.detail || ''} onChange={(e) => handleChange('detail', e.target.value)} />
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-slate-600 ml-1">Remark</label>
                                    <input type="text" className="w-full mt-1 px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-700 outline-none focus:border-emerald-500 transition-colors" value={formData.remark || ''} onChange={(e) => handleChange('remark', e.target.value)} />
                                </div>
                            </div>
                            
                            <div className="space-y-4 bg-slate-50 p-5 rounded-2xl border border-slate-100">
                                <div>
                                    <label className="text-[10px] font-bold text-slate-400 uppercase">Status</label>
                                    <select className="w-full mt-1 px-4 py-2.5 bg-white border border-slate-200 rounded-xl font-black text-slate-700 outline-none shadow-sm" value={formData.status || 1} onChange={(e) => handleChange('status', parseInt(e.target.value))}>
                                        {STATUS_CONFIG && Object.entries(STATUS_CONFIG).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
                                    </select>
                                </div>
                                <div className="pt-2 border-t border-slate-200 grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-[10px] font-bold text-slate-400 uppercase">User MK (Owner)</label>
                                        <p className="font-bold text-slate-800">{formData.user_mk || '-'}</p>
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-bold text-slate-400 uppercase">Created By</label>
                                        <p className="font-bold text-slate-800">{formData.user_create || '-'}</p>
                                    </div>
                                    <div className="col-span-2">
                                        <label className="text-[10px] font-bold text-slate-400 uppercase">Last Updated By</label>
                                        <p className="font-bold text-slate-800">{formData.user_upde || '-'}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* 📍 Section 3: Entity Table (with Barcode 39) */}
                    <section className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
                        <h4 className="text-sm font-black text-purple-600 uppercase tracking-wider mb-4 flex items-center gap-2">
                            <Layers size={16}/> 3. Entities Configuration
                        </h4>
                        <div className="overflow-x-auto rounded-xl border border-slate-200">
                            <table className="w-full text-left text-sm">
                                <thead className="bg-slate-50 text-slate-500 font-bold uppercase text-[10px] tracking-wider border-b border-slate-200">
                                    <tr>
                                        <th className="px-4 py-3">Code</th>
                                        <th className="px-4 py-3">Name</th>
                                        <th className="px-4 py-3 text-center">Mode</th>
                                        <th className="px-4 py-3">Barcode (Code 39)</th>
                                        <th className="px-4 py-3">Coupon (Code 39)</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {formData.entity && formData.entity.length > 0 ? (
                                        formData.entity.map((ent, i) => (
                                            <tr key={i} className="hover:bg-slate-50/50">
                                                <td className="px-4 py-3 font-black text-slate-700 bg-slate-50/30">{ent.entity_code || '-'}</td>
                                                <td className="px-4 py-3 font-medium text-slate-800">{ent.entity_name || '-'}</td>
                                                <td className="px-4 py-3 text-center">
                                                    <span className="px-2 py-1 bg-slate-100 text-slate-600 text-[10px] font-bold rounded">{ent.mode || '-'}</span>
                                                </td>
                                                <td className="px-4 py-2">
                                                    {ent.barcode ? (
                                                        <div className="scale-75 origin-left">
                                                            <Barcode value={ent.barcode} format="CODE39" height={30} displayValue={true} fontSize={14} background="transparent" />
                                                        </div>
                                                    ) : <span className="text-xs text-slate-400">N/A</span>}
                                                </td>
                                                <td className="px-4 py-2">
                                                    {ent.coupon ? (
                                                        <div className="scale-75 origin-left">
                                                            <Barcode value={ent.coupon} format="CODE39" height={30} displayValue={true} fontSize={14} background="transparent" />
                                                        </div>
                                                    ) : <span className="text-xs text-slate-400">N/A</span>}
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr><td colSpan="5" className="px-4 py-8 text-center text-slate-400">No entities found</td></tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </section>

                    {/* 📍 Section 4: Images */}
                    <section className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
                        <h4 className="text-sm font-black text-rose-500 uppercase tracking-wider mb-4 flex items-center gap-2">
                            <ImageIcon size={16}/> 4. Attached Images
                        </h4>
                        {images.length > 0 ? (
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                {images.map((img, index) => {
                                    const imgSource = typeof img === 'string' ? img : (img.valuer || img.url);
                                    if (!imgSource) return null;
                                    return (
                                        <div 
                                            key={index} 
                                            onClick={() => setEnlargedImage(imgSource)}
                                            className="group relative aspect-video bg-slate-100 rounded-xl border border-slate-200 overflow-hidden cursor-zoom-in shadow-sm"
                                        >
                                            <img src={imgSource} alt={`Attachment ${index + 1}`} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"/>
                                            <div className="absolute inset-0 bg-slate-900/0 group-hover:bg-slate-900/20 transition-colors flex items-center justify-center">
                                                <Maximize2 className="text-white opacity-0 group-hover:opacity-100 drop-shadow-md transition-opacity" size={24}/>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        ) : (
                            <p className="text-sm text-slate-400 italic">No images attached.</p>
                        )}
                    </section>

                </div>

                {/* Footer (Save button shows ONLY if modified) */}
                <div className="p-6 border-t border-slate-100 bg-white flex justify-end gap-3 shrink-0">
                    <button onClick={onClose} className="px-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold rounded-xl transition-colors">Close</button>
                    
                    {/* 📍 แสดงปุ่ม Confirm ก็ต่อเมื่อ isModified เป็น true */}
                    {isModified && (
                        <button 
                            onClick={handleSubmit} 
                            disabled={isSaving} 
                            className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-lg shadow-blue-500/30 flex items-center gap-2 active:scale-95 disabled:opacity-70 animate-in zoom-in"
                        >
                            {isSaving ? <RefreshCw size={18} className="animate-spin"/> : <Save size={18}/>} Confirm Changes
                        </button>
                    )}
                </div>
            </div>

            {/* 📍 Modal สำหรับดูรูปภาพขนาดใหญ่ */}
            {enlargedImage && (
                <div className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-900/95 backdrop-blur-md p-4" onClick={() => setEnlargedImage(null)}>
                    <button className="absolute top-6 right-6 p-3 bg-white/10 text-white hover:bg-white/20 rounded-full transition-colors">
                        <X size={32} />
                    </button>
                    <img 
                        src={enlargedImage} 
                        alt="Enlarged view" 
                        className="max-w-full max-h-[90vh] object-contain rounded-xl shadow-2xl animate-in zoom-in-95 duration-200"
                        onClick={(e) => e.stopPropagation()} // ป้องกันการปิดเมื่อคลิกที่ตัวรูป
                    />
                </div>
            )}
        </div>
    );
}