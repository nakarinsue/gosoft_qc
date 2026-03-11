import React, { useState, useEffect } from 'react';
import { 
  X, FileText, User, Tag, Calendar, ImageIcon, 
  AlertCircle, Edit2, Save, CheckCircle2, Check, Eye, Loader2,
  ExternalLink, Package // เพิ่ม icon ที่ต้องใช้
} from 'lucide-react';
import { API_BASE_URL, TYPE_OPTIONS } from '../config';

const MINIO_BASE_URL = ""; 

// --- ส่วนที่ 1: สร้าง Component ใหม่สำหรับ Popup แสดงรายละเอียด Promotion ---
const PromotionPopup = ({ proCode, onClose }) => {
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState(null);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchPromotionDetail = async () => {
            if (!proCode) return;
            setLoading(true);
            try {
                // TODO: แก้ไข URL API ตรงนี้ให้ตรงกับ Backend ของคุณ
                // เช่น: `${API_BASE_URL}/MASTER/PROMOTION/${proCode}`
                const response = await fetch(`${API_BASE_URL}/PROMOTION/${proCode}`);
                
                if (response.ok) {
                    const result = await response.json();
                    setData(result); // หรือ result.data ตาม structure ของคุณ
                } else {
                    throw new Error('Promotion not found');
                }
            } catch (err) {
                console.error("Error fetching promotion:", err);
                setError(err.message);
                // Mock Data (ข้อมูลจำลองกรณีต่อ API ไม่ได้ เพื่อให้เห็นภาพหน้าจอ)
                setData({
                    PRO_CODE: proCode,
                    PRO_NAME: "Example Promotion Name",
                    START_DATE: "2023-01-01",
                    END_DATE: "2023-12-31",
                    DESCRIPTION: "รายละเอียดโปรโมชั่นตัวอย่าง...",
                    CONDITION: "ซื้อครบ 500 บาท ลด 50 บาท"
                });
            } finally {
                setLoading(false);
            }
        };

        fetchPromotionDetail();
    }, [proCode]);

    return (
        <div className="fixed inset-0 z-[70] bg-black/70 flex items-center justify-center p-4 animate-in fade-in duration-200">
            <div className="bg-white dark:bg-slate-800 w-full max-w-lg rounded-xl shadow-2xl overflow-hidden border border-gray-200 dark:border-slate-700 flex flex-col max-h-[80vh]">
                
                {/* Header Popup */}
                <div className="px-5 py-4 border-b border-gray-100 dark:border-slate-700 flex justify-between items-center bg-blue-50 dark:bg-slate-900">
                    <h3 className="font-bold text-lg text-blue-700 dark:text-blue-400 flex items-center gap-2">
                        <Package className="w-5 h-5" /> Promotion Details
                    </h3>
                    <button onClick={onClose} className="p-1 hover:bg-white/50 rounded-full transition text-gray-500">
                        <X size={20} />
                    </button>
                </div>

                {/* Content Popup */}
                <div className="p-6 overflow-y-auto">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-8 space-y-3">
                            <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
                            <p className="text-sm text-gray-500">Loading Promotion Info...</p>
                        </div>
                    ) : error && !data ? (
                        <div className="text-center py-8 text-red-500">
                            <AlertCircle className="w-10 h-10 mx-auto mb-2" />
                            <p>{error}</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            <div>
                                <label className="text-xs font-bold text-gray-400 uppercase">Pro Code</label>
                                <p className="text-xl font-mono font-bold text-gray-800 dark:text-white">{data.PRO_CODE}</p>
                            </div>
                            <div>
                                <label className="text-xs font-bold text-gray-400 uppercase">Promotion Name</label>
                                <p className="text-gray-700 dark:text-gray-200 font-medium">{data.PRO_NAME}</p>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-xs font-bold text-gray-400 uppercase">Start Date</label>
                                    <p className="text-sm">{data.START_DATE || '-'}</p>
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-gray-400 uppercase">End Date</label>
                                    <p className="text-sm">{data.END_DATE || '-'}</p>
                                </div>
                            </div>
                            {/* แสดงข้อมูลอื่นๆ เพิ่มเติมตาม API */}
                            <div className="bg-gray-50 dark:bg-slate-700/30 p-3 rounded-lg border border-gray-100 dark:border-slate-600">
                                <label className="text-xs font-bold text-gray-400 uppercase mb-1 block">Condition / Detail</label>
                                <p className="text-sm text-gray-600 dark:text-gray-300">{data.CONDITION || data.DESCRIPTION || 'No details provided.'}</p>
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer Popup */}
                <div className="p-4 border-t border-gray-100 dark:border-slate-700 bg-gray-50 dark:bg-slate-800 flex justify-end">
                    <button 
                        onClick={onClose}
                        className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-bold text-gray-600 hover:bg-gray-50 transition"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};

// --- ส่วนที่ 2: Main Component (DefectDetailModal) ---
const DefectDetailModal = ({ defect, onClose, onSave }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);
  
  // New State: สำหรับเปิด Popup Promotion
  const [selectedProCode, setSelectedProCode] = useState(null);
  
  const [formData, setFormData] = useState({ 
    DETAIL: defect?.DETAIL || '',
    TYPE: defect?.TYPE || '',
    TYPE_OTHER: defect?.TYPE_OTHER || '',
    QTY: defect?.QTY || 0,
    STATUS: defect?.STATUS || '1',
    REMARK: defect?.REMARK || ''
  });

  const [defectImages, setDefectImages] = useState([]);
  const [isImageLoading, setIsImageLoading] = useState(false);

  useEffect(() => {
    let isMounted = true;
    const fetchImages = async () => {
        if (!defect?.ID ) return;
        setIsImageLoading(true);
        try {
            const response = await fetch(`${API_BASE_URL}/IMAGE/defect/${defect.ID}/images`);
            if (response.ok && isMounted) {
                const data = await response.json();
                setDefectImages(data.images || []);
            }
        } catch (error) {
            console.error("Error fetching images:", error);
        } finally {
            if (isMounted) setIsImageLoading(false);
        }
    };
    fetchImages();
    return () => { isMounted = false; };
  }, [defect?.ID]);

  if (!defect) return null;

  const isClosed = String(defect.STATUS) === '4';

  const getImageUrl = (imgObj) => {
      if (!imgObj || !imgObj.image_url) return null;
      return imgObj.image_url.startsWith('http') 
        ? imgObj.image_url 
        : `${MINIO_BASE_URL}/${imgObj.image_url}`;
  };

  const handleSaveClick = async () => { 
      setIsSaving(true);
      try {
          await onSave({ ...defect, ...formData }); 
          setIsEditing(false); 
      } catch (error) {
          alert("Failed to save changes. Please try again.");
      } finally {
          setIsSaving(false);
      }
  };

  const handleTypeToggle = (typeLabel) => {
    let currentTypes = formData.TYPE ? formData.TYPE.split(',').map(t => t.trim()).filter(Boolean) : [];
    currentTypes = currentTypes.includes(typeLabel)
        ? currentTypes.filter(t => t !== typeLabel)
        : [...currentTypes, typeLabel];
    setFormData({ ...formData, TYPE: currentTypes.join(',') });
  };

  const isTypeSelected = (typeLabel) => {
    const currentTypes = formData.TYPE ? formData.TYPE.split(',').map(t => t.trim()) : [];
    return currentTypes.includes(typeLabel);
  };

  const getStatusColor = (status) => {
    const s = parseInt(status);
    const colors = {
        1: 'text-red-700 bg-red-100 border-red-200 dark:bg-red-900/30 dark:text-red-300',
        2: 'text-yellow-700 bg-yellow-100 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-300',
        3: 'text-green-700 bg-green-100 border-green-200 dark:bg-green-900/30 dark:text-green-300',
        4: 'text-gray-600 bg-gray-100 border-gray-200 dark:bg-slate-700 dark:text-slate-300'
    };
    return colors[s] || colors[4];
  };

  const inputClass = "w-full p-2.5 border rounded-lg text-sm bg-white dark:bg-slate-700 border-gray-200 dark:border-slate-600 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all disabled:opacity-50";
  const labelClass = "block text-xs font-bold text-gray-500 dark:text-slate-400 mb-1.5 uppercase tracking-wider";

  return (
    <div className="fixed inset-0 bg-black/60 dark:bg-black/80 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in duration-200">
        
        {/* Promotion Popup (จะแสดงเมื่อ state selectedProCode มีค่า) */}
        {selectedProCode && (
            <PromotionPopup 
                proCode={selectedProCode} 
                onClose={() => setSelectedProCode(null)} 
            />
        )}

        {/* Image Preview Overlay */}
        {previewImage && (
            <div className="fixed inset-0 z-[60] bg-black/90 flex items-center justify-center p-4" onClick={() => setPreviewImage(null)}>
                <button className="absolute top-4 right-4 text-white hover:text-gray-300"><X size={32}/></button>
                <img src={previewImage} className="max-w-full max-h-full object-contain rounded-lg shadow-2xl animate-in zoom-in-95" alt="Preview" />
            </div>
        )}

        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-hidden flex flex-col border border-gray-100 dark:border-slate-700">
          {/* Header */}
          <div className="px-6 py-4 border-b border-gray-100 dark:border-slate-700 flex justify-between items-center bg-white dark:bg-slate-800 sticky top-0 z-10">
              <div className="flex items-center gap-4">
                 <div className="p-2.5 bg-blue-50 dark:bg-blue-900/30 rounded-xl text-blue-600 dark:text-blue-400">
                    <FileText className="w-6 h-6"/>
                 </div>
                 <div>
                    <h3 className="font-bold text-xl text-gray-800 dark:text-white">Defect Details</h3>
                    <p className="text-xs text-gray-500 dark:text-slate-400 flex items-center gap-2 mt-0.5">
                        <span className="bg-gray-100 dark:bg-slate-700 px-1.5 rounded text-gray-600 dark:text-slate-300 font-mono">ID: {defect.ID}</span>
                        <span>•</span>
                        <span className="flex items-center gap-1"><User className="w-3 h-3"/> {defect.USER_MK}</span>
                    </p>
                 </div>
              </div>
              <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-full transition text-gray-500 dark:text-slate-400">
                 <X className="w-6 h-6" />
              </button>
          </div>

          {/* Body */}
          <div className="p-6 overflow-y-auto flex-grow bg-gray-50/50 dark:bg-slate-900/50">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                  
                  {/* Left Column: Promotion & Image */}
                  <div className="lg:col-span-4 space-y-6">
                     <div className="bg-white dark:bg-slate-800 p-5 rounded-xl border border-gray-200 dark:border-slate-700 shadow-sm">
                        <h4 className="font-bold text-gray-700 dark:text-slate-200 border-b border-gray-100 dark:border-slate-700 pb-3 mb-3 flex items-center gap-2">
                            <Tag className="w-4 h-4 text-blue-500"/> Promotion Info
                        </h4>
                        <div className="space-y-4">
                            <div>
                                <span className={labelClass}>Promotion Code</span>
                                
                                {/* --- ส่วนที่แก้ไข: เปลี่ยนเป็นปุ่มกดเรียก Popup --- */}
                                <button 
                                    onClick={() => setSelectedProCode(defect.PRO_CODE)}
                                    className="w-full text-left font-mono font-bold text-lg text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 p-2 rounded border border-blue-100 dark:border-blue-800 hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-colors flex items-center justify-between group"
                                    title="Click to view details"
                                >
                                    {defect.PRO_CODE}
                                    <ExternalLink className="w-4 h-4 opacity-50 group-hover:opacity-100" />
                                </button>
                                {/* ------------------------------------------------ */}

                            </div>
                            <div>
                                <span className={labelClass}>Promotion Name</span>
                                <p className="font-medium text-gray-700 dark:text-slate-300 leading-snug">{defect.PRO_NAME || 'N/A'}</p>
                            </div>
                            <div>
                                <span className={labelClass}>Last Update</span>
                                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-slate-400">
                                    <Calendar className="w-4 h-4"/> {defect.UPDATE_DATE}
                                </div>
                            </div>
                        </div>
                     </div>

                     {/* Image Section (เหมือนเดิม) */}
                     <div className="bg-white dark:bg-slate-800 p-5 rounded-xl border border-gray-200 dark:border-slate-700 shadow-sm min-h-[200px] flex flex-col">
                        <h4 className="font-bold text-gray-700 dark:text-slate-200 border-b border-gray-100 dark:border-slate-700 pb-3 mb-3 flex items-center gap-2">
                             <ImageIcon className="w-4 h-4 text-purple-500"/> Evidence Images
                        </h4>
                        
                        {isImageLoading ? (
                             <div className="flex-1 flex flex-col items-center justify-center text-gray-400 py-8">
                                 <Loader2 className="w-8 h-8 animate-spin text-blue-500 mb-2"/>
                                 <span className="text-xs">Loading images...</span>
                             </div>
                        ) : defectImages.length > 0 ? (
                            <div className="grid grid-cols-2 gap-2">
                                {defectImages.map((img, idx) => {
                                    const src = getImageUrl(img);
                                    return (
                                        <div key={idx} className="relative group aspect-square rounded-lg overflow-hidden border border-gray-100 dark:border-slate-700 bg-gray-50 shadow-inner">
                                            <img 
                                                src={src} 
                                                alt={`Defect ${idx}`} 
                                                className="w-full h-full object-cover transition-transform group-hover:scale-110 cursor-zoom-in"
                                                onClick={() => setPreviewImage(src)}
                                                onError={(e) => {e.target.src = 'https://placehold.co/200x200?text=Error';}}
                                            />
                                            <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none flex items-center justify-center">
                                                <Eye className="text-white w-6 h-6" />
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        ) : (
                            <div className="flex-1 flex flex-col items-center justify-center text-gray-400 dark:text-slate-500 py-8">
                                <ImageIcon className="w-10 h-10 opacity-20 mb-2"/>
                                <span className="text-sm">No Image Attached</span>
                            </div>
                        )}
                     </div>
                  </div>

                  {/* Right Column: Defect Form (เหมือนเดิม) */}
                  <div className="lg:col-span-8 space-y-6">
                    <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-gray-200 dark:border-slate-700 shadow-sm h-full">
                        <div className="flex justify-between items-center border-b border-gray-100 dark:border-slate-700 pb-4 mb-6">
                           <h4 className="font-bold text-gray-800 dark:text-white flex items-center gap-2 text-lg">
                               <AlertCircle className="w-5 h-5 text-orange-500"/> Defect Information
                           </h4>
                           
                           {!isClosed ? (
                               !isEditing ? (
                                   <button onClick={() => setIsEditing(true)} className="text-sm bg-blue-50 hover:bg-blue-100 dark:bg-blue-900/30 dark:hover:bg-blue-900/50 text-blue-600 dark:text-blue-400 px-4 py-2 rounded-lg transition border border-blue-200 dark:border-blue-800 flex items-center gap-2 font-medium">
                                           <Edit2 className="w-4 h-4"/> Edit Data
                                   </button>
                               ) : (
                                   <div className="flex gap-2">
                                           <button disabled={isSaving} onClick={() => setIsEditing(false)} className="text-sm text-gray-500 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-slate-700 px-4 py-2 rounded-lg transition">Cancel</button>
                                           <button 
                                                    disabled={isSaving}
                                                    onClick={handleSaveClick} 
                                                    className="text-sm bg-blue-600 text-white hover:bg-blue-700 px-4 py-2 rounded-lg transition flex items-center gap-2 shadow-sm font-medium min-w-[120px] justify-center"
                                            >
                                                    {isSaving ? <Loader2 className="w-4 h-4 animate-spin"/> : <Save className="w-4 h-4"/>}
                                                    {isSaving ? 'Saving...' : 'Save Changes'}
                                           </button>
                                   </div>
                               )
                           ) : (
                                <span className="text-xs font-bold text-gray-500 bg-gray-100 dark:bg-slate-700 px-3 py-1 rounded-full flex items-center gap-1">
                                    <Eye className="w-3 h-3"/> Read Only (Closed)
                                </span>
                           )}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                           <div className="md:col-span-2">
                               <label className={labelClass}>Current Status</label>
                               {isEditing ? (
                                   <select disabled={isSaving} className={inputClass} value={formData.STATUS} onChange={(e) => setFormData({...formData, STATUS: e.target.value})}>
                                                   <option value="1">Open (รอการแก้ไข)</option>
                                                   <option value="2">In Progress (กำลังดำเนินการ)</option>
                                                   <option value="3">Resolved (แก้ไขแล้ว)</option>
                                                   <option value="4">Closed (ปิดงาน)</option>
                                   </select>
                               ) : (
                                   <div className={`inline-flex px-3 py-1.5 rounded-lg border text-sm font-bold items-center gap-2 ${getStatusColor(defect.STATUS)}`}>
                                                   <CheckCircle2 className="w-4 h-4"/> {['Open','In Progress','Resolved','Closed'][parseInt(defect.STATUS)-1]}
                                   </div>
                               )}
                           </div>

                           <div className="md:col-span-2">
                               <label className={labelClass}>Defect Type (Multi-select)</label>
                               {isEditing ? (
                                   <div className="p-3 border rounded-lg bg-gray-50 dark:bg-slate-700/50 border-gray-200 dark:border-slate-600 max-h-48 overflow-y-auto grid grid-cols-1 sm:grid-cols-2 gap-2">
                                           {TYPE_OPTIONS.map(opt => {
                                                const isSelected = isTypeSelected(opt.label);
                                                return (
                                                     <div 
                                                          key={opt.label} 
                                                          onClick={() => !isSaving && handleTypeToggle(opt.label)}
                                                          className={`flex items-center gap-2 p-2 rounded cursor-pointer transition select-none ${isSelected ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300' : 'hover:bg-gray-200 dark:hover:bg-slate-600'}`}
                                                     >
                                                          <div className={`w-4 h-4 border rounded flex items-center justify-center ${isSelected ? 'bg-blue-600 border-blue-600 text-white' : 'border-gray-400 bg-white'}`}>
                                                               {isSelected && <Check className="w-3 h-3" />}
                                                          </div>
                                                          <span className="text-sm">{opt.label}</span>
                                                     </div>
                                                )
                                           })}
                                   </div>
                               ) : (
                                   <div className="flex flex-wrap gap-2">
                                           {defect.TYPE ? defect.TYPE.split(',').map((t, i) => (
                                                <span key={i} className="text-sm text-gray-800 dark:text-white font-medium px-3 py-1 bg-gray-100 dark:bg-slate-700 rounded-lg border border-gray-200 dark:border-slate-600">
                                                     {t.trim()}
                                                </span>
                                           )) : <span className="text-gray-400 italic">No types selected</span>}
                                   </div>
                               )}
                           </div>

                           <div>
                               <label className={labelClass}>Quantity (QTY)</label>
                               {isEditing ? (
                                   <input disabled={isSaving} type="number" className={inputClass} value={formData.QTY} onChange={(e) => setFormData({...formData, QTY: e.target.value})} />
                               ) : (
                                   <p className="text-base text-gray-800 dark:text-white font-medium p-2">{defect.QTY} Units</p>
                               )}
                           </div>

                           {(isEditing || formData.TYPE_OTHER) && (
                               <div>
                                   <label className={labelClass}>Specify Other Type</label>
                                   {isEditing ? (
                                           <input disabled={isSaving} type="text" className={inputClass} value={formData.TYPE_OTHER} onChange={(e) => setFormData({...formData, TYPE_OTHER: e.target.value})} placeholder="ระบุสาเหตุ..." />
                                   ) : (
                                           <p className="text-sm text-gray-700 dark:text-slate-300 border-l-4 border-orange-300 pl-3 py-1 bg-orange-50 dark:bg-orange-900/10">{defect.TYPE_OTHER || '-'}</p>
                                   )}
                               </div>
                           )}

                           <div className="md:col-span-2">
                               <label className={labelClass}>Issue Detail</label>
                               {isEditing ? (
                                   <input disabled={isSaving} type="text" className={inputClass} value={formData.DETAIL} onChange={(e) => setFormData({...formData, DETAIL: e.target.value})} />
                               ) : (
                                   <p className="text-base text-gray-800 dark:text-white leading-relaxed p-3 bg-gray-50 dark:bg-slate-700/30 rounded-lg border border-gray-100 dark:border-slate-700 shadow-inner">{defect.DETAIL}</p>
                               )}
                           </div>

                           <div className="md:col-span-2">
                               <label className={labelClass}>Remarks / Notes</label>
                               {isEditing ? (
                                   <textarea disabled={isSaving} rows="3" className={inputClass} value={formData.REMARK || ''} onChange={(e) => setFormData({...formData, REMARK: e.target.value})} placeholder="หมายเหตุเพิ่มเติม..." />
                               ) : (
                                   <p className="text-sm text-gray-600 dark:text-slate-400 italic p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg">{defect.REMARK || 'No remarks provided.'}</p>
                               )}
                           </div>
                        </div>
                    </div>
                  </div>
              </div>
          </div>
        </div>
    </div>
  );
};

export default DefectDetailModal;