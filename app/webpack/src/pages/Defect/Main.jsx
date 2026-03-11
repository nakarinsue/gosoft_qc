import React, { useState, useEffect, useCallback } from 'react';
import { 
  ChevronRight, ChevronLeft, Upload, X, FileText, AlertCircle, Save, 
  Search, Loader2, CheckCircle2, ShoppingBag, Square, CheckSquare,
  Copy, History, RefreshCw, Edit3
} from 'lucide-react';

// --- Configuration (Mock for Preview) ---
// ในสภาพแวดล้อมจริง ให้นำส่วนนี้ออกและ uncomment บรรทัด import ข้างล่าง
import { API_BASE_URL, TYPE_OPTIONS } from '../utils/config';


// --- Helper Functions ---

const generateDetailFormat = (promo, items, types) => {
    const proText = promo ? `${promo.PRO_CODE} (${promo.PRO_NAME})` : 'ไม่ระบุ';
    
    let itemText = '-';
    if (items && items.length > 0) {
        const codes = items.map(i => i.ENTITY_CODE);
        if (codes.length > 3) {
            itemText = `${codes.slice(0, 3).join(', ')} และอื่นๆรวม ${codes.length} รายการ`;
        } else {
            itemText = codes.join(', ');
        }
    }

    const typeText = types && types.length > 0 ? types.join(', ') : '...';

    return `เมื่อทำรายการขาย promotion : ${proText} ทำการขาย สินค้า ${itemText} พบ ปัญหา ${typeText}`;
};

// --- Sub-components ---

function StepBadge({ step, current, label }) {
  const isActive = current === step;
  const isPast = current > step;
  return (
    <div className={`flex items-center gap-2 ${isActive ? 'text-blue-600 dark:text-blue-400' : isPast ? 'text-green-600 dark:text-green-400' : 'text-gray-400 dark:text-slate-500'}`}>
        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all
            ${isActive 
                ? 'bg-blue-600 border-blue-600 text-white dark:bg-blue-500 dark:border-blue-500' 
                : isPast 
                    ? 'bg-green-100 border-green-200 text-green-700 dark:bg-green-900/30 dark:border-green-800 dark:text-green-300' 
                    : 'bg-white border-gray-200 text-gray-400 dark:bg-slate-800 dark:border-slate-700'
            }`}
        >
            {isPast ? <CheckCircle2 className="w-5 h-5"/> : step}
        </div>
        <span className="hidden md:inline text-sm font-medium whitespace-nowrap">{label}</span>
    </div>
  );
}
  
function InfoItem({ label, value, full = false }) {
  return (
    <div className={`p-4 rounded-lg bg-gray-50 dark:bg-slate-700/30 border border-gray-100 dark:border-slate-700 ${full ? "col-span-2 md:col-span-4" : ""}`}>
      <span className="block text-[10px] uppercase tracking-wider font-bold text-gray-400 dark:text-slate-400 mb-1">{label}</span>
      <span className={`block font-medium text-gray-800 dark:text-slate-200 ${full ? "whitespace-normal break-words" : "truncate"}`} title={value}>
          {value || '-'}
      </span>
    </div>
  );
}
  
function DisplayField({ label, value, highlight }) {
  return (
    <div className={`p-4 rounded-lg border transition-colors ${
        highlight 
        ? 'bg-blue-50 border-blue-100 text-blue-900 dark:bg-blue-900/20 dark:border-blue-800 dark:text-blue-100' 
        : 'bg-gray-50 border-gray-100 text-gray-900 dark:bg-slate-700/50 dark:border-slate-600 dark:text-slate-200'
    }`}>
      <span className="block text-xs font-bold opacity-70 mb-1 uppercase tracking-wide">{label}</span>
      <span className="block text-sm font-medium leading-relaxed">{value || '-'}</span>
    </div>
  );
}

// --- History Modal ---
const HistoryModal = ({ isOpen, onClose, onSelect }) => {
  const [historyList, setHistoryList] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchHistory();
    }
  }, [isOpen]);

  const fetchHistory = async () => {
    setLoading(true);
    

    try {
      // MOCK DATA
      const response = await fetch(`${API_BASE_URL}/PROMOTION/SEARCH`);
      if (!response.ok) {
         if (response.status === 404) throw new Error('ติดต่อ Server ไม่ได้');
         throw new Error(`Error: ${response.status}`);
      }

      const data = await response.json();
      setHistoryList(data);

    } catch (error) {
      console.error("Failed to fetch history", error);
      const mockData = [
          { UPDATE_DATE: '2025-01-10', PRO_CODE: '299321', DETAIL: 'เมื่อทำรายการขาย promotion : 299321 (Discount 50%) ทำการขาย สินค้า 88511234001 พบ ปัญหา โปรโมชั่นไม่ลด', TYPE: 'โปรโมชั่นไม่ลด', USER_MK: 'Somsri.Ja', QTY: 2, REMARK: 'ลูกค้า complain หน้าสาขา' },
          { UPDATE_DATE: '2025-01-09', PRO_CODE: '110023', DETAIL: 'เมื่อทำรายการขาย promotion : 110023 (Buy 1 Get 1) ทำการขาย สินค้า 88511234002 พบ ปัญหา ราคาผิด', TYPE: 'ราคาผิด', USER_MK: 'Admin01', QTY: 1, REMARK: '' }
      ];
      setHistoryList(mockData);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl w-full max-w-4xl max-h-[80vh] flex flex-col border border-gray-200 dark:border-slate-700">
        <div className="px-6 py-4 border-b dark:border-slate-700 flex justify-between items-center bg-gray-50 dark:bg-slate-700/50 rounded-t-xl">
          <h3 className="font-bold text-lg text-gray-800 dark:text-white flex items-center gap-2">
            <History className="w-5 h-5 text-blue-600 dark:text-blue-400"/> เลือกข้อมูลจากประวัติ (Copy Data)
          </h3>
          <button onClick={onClose} className="p-2 hover:bg-gray-200 dark:hover:bg-slate-600 rounded-full transition"><X className="w-5 h-5 text-gray-500 dark:text-slate-400" /></button>
        </div>
        
        <div className="overflow-auto p-0 flex-grow custom-scrollbar">
          <table className="w-full text-sm text-left">
            <thead className="bg-white dark:bg-slate-800 text-gray-500 dark:text-slate-400 border-b dark:border-slate-700 sticky top-0 shadow-sm z-10">
              <tr>
                <th className="px-6 py-3 font-semibold">Date</th>
                <th className="px-6 py-3 font-semibold">Code</th>
                <th className="px-6 py-3 font-semibold">Issue Detail</th>
                <th className="px-6 py-3 font-semibold">Type</th>
                <th className="px-6 py-3 font-semibold">MK Name</th>
                <th className="px-6 py-3 text-right font-semibold">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-slate-700 bg-white dark:bg-slate-800">
              {loading ? (
                <tr><td colSpan="6" className="px-6 py-12 text-center"><Loader2 className="w-8 h-8 animate-spin mx-auto text-blue-500" /></td></tr>
              ) : historyList.length === 0 ? (
                <tr><td colSpan="6" className="px-6 py-12 text-center text-gray-400">ไม่พบประวัติรายการ</td></tr>
              ) : (
                historyList.map((item, idx) => (
                  <tr key={idx} className="hover:bg-blue-50 dark:hover:bg-slate-700/50 transition group">
                    <td className="px-6 py-3 text-gray-500 dark:text-slate-400 text-xs whitespace-nowrap">{item.UPDATE_DATE}</td>
                    <td className="px-6 py-3 font-mono font-medium text-gray-800 dark:text-slate-200">{item.PRO_CODE}</td>
                    <td className="px-6 py-3 text-gray-600 dark:text-slate-300 max-w-xs truncate" title={item.DETAIL}>{item.DETAIL}</td>
                    <td className="px-6 py-3 text-blue-600 dark:text-blue-400 font-medium">{item.TYPE}</td>
                    <td className="px-6 py-3 text-gray-600 dark:text-slate-300">{item.USER_MK}</td>
                    <td className="px-6 py-3 text-right">
                      <button 
                        onClick={() => onSelect(item)}
                        className="bg-white border border-gray-200 text-gray-700 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200 dark:bg-slate-700 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-blue-900/30 dark:hover:text-blue-300 px-3 py-1.5 rounded-md text-xs font-bold transition shadow-sm"
                      >
                        Select
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

// --- Main Component ---

export default function PromotionWorkflowView({ onBack, user }) {
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchError, setSearchError] = useState('');
  
  // Data States
  const [foundPromotion, setFoundPromotion] = useState(null);
  const [itemsList, setItemsList] = useState([]); 
  const [selectedItems, setSelectedItems] = useState([]);
  
  // Modal States
  const [isCopyModalOpen, setIsCopyModalOpen] = useState(false);
  const [isAutoFormatEnabled, setIsAutoFormatEnabled] = useState(true); // Toggle for auto-formatting

  const [formData, setFormData] = useState({
    detail: '', 
    status: 'open', 
    user_mk: '', 
    qty: '1', 
    types: [], 
    type_other: '', 
    remark: '', 
    images: [] 
  });

  // --- Auto-Format Effect ---
  // เมื่อมีการเปลี่ยนแปลง items หรือ types และอยู่ใน Step 4
  useEffect(() => {
    if (currentStep === 4 && isAutoFormatEnabled && foundPromotion) {
        const newDetail = generateDetailFormat(foundPromotion, selectedItems, formData.types);
        
        setFormData(prev => ({ ...prev, detail: newDetail }));
    }
  }, [formData.types, selectedItems, foundPromotion, currentStep, isAutoFormatEnabled]);

  const handleSearch = async () => {
      setSearchError(''); 
      setFoundPromotion(null); 
      setItemsList([]);
      
      if (!searchQuery.trim()) { 
          setSearchError('กรุณากรอก Promotion Code'); 
          return; 
      }
      
      setIsLoading(true);
      try {
        const response = await fetch(`${API_BASE_URL}/PROMOTION/ALL/${searchQuery.trim()}`);
        if (!response.ok) { 
          setIsLoading(false);
          throw new Error(`ไม่สามารถ เพิ่ม Promotion Code ซ้ำได้`);
        }
        
        const data = await response.json();  
      
        if (data.master_info) { 
            setFoundPromotion(data.master_info); 
            
            // --- จุดที่แก้ไข 1: การดึงรายการสินค้า (List) ---
            // JSON ใหม่: products เป็น Array -> ต้องเข้าถึง index [0] ก่อน แล้วค่อยดึง .Product
            const productList = (data.products && data.products.length > 0) 
                                ? data.products[0].Product 
                                : [];
            
            setItemsList(productList || []); 
            
            // --- จุดที่แก้ไข 2: การดึง User MK ---
            // ตรวจสอบ import_history
            const historyItem = data.import_history && data.import_history.length > 0 
                                ? data.import_history[0] 
                                : null;
            
            // ถ้ามี historyItem ให้ดึง USER_MK ถ้าค่าเป็น null หรือไม่มี ให้ใช้ '' (ค่าว่าง)
            const defaultMK = historyItem?.USER_MK || ''; 

            setFormData(prev => ({ ...prev, user_mk: defaultMK }));

            setCurrentStep(2); 
        } else { 
            throw new Error('ไม่พบข้อมูลโปรโมชั่น'); 
        }
      } catch (error) { 
          console.error(error); 
          setSearchError(error.message); 
      } finally { 
          setIsLoading(false); 
      }
  };
  const handleCopySelect = (oldDefect) => {
    // เมื่อ Copy ข้อมูล ปิด Auto Format ชั่วคราว เพื่อไม่ให้ Logic มันทับข้อความที่ Copy มา
    setIsAutoFormatEnabled(false);
    
    setFormData(prev => ({
        ...prev,
        detail: oldDefect.DETAIL || '',
        qty: oldDefect.QTY ? String(oldDefect.QTY) : '1',
        user_mk: oldDefect.user_mk || prev.user_mk ,
        remark: oldDefect.REMARK || '',
        type_other: oldDefect.TYPE_OTHER || '',
        types: oldDefect.TYPE ? [oldDefect.TYPE] : []
    }));
    setIsCopyModalOpen(false);
  };
  const handleSubmit = async () => {
      setIsLoading(true);
      try {
          // --- STEP 1: บันทึกข้อมูลหลัก (Create Defect Record) ---
          const payload = {
              pro_id: foundPromotion?.PRO_CODE || '',
              pro_name: foundPromotion?.PRO_NAME || '',
              detail: formData.detail,
              user_login: String(user?.id || 'Unknown'),
              user_mk: formData.user_mk,
              qty: Number(formData.qty),
              types: formData.types.join(', '),
              type_other: formData.type_other || '',
              link_url: '', // ไม่ต้องส่งชื่อไฟล์แล้ว เพราะจะไปอัปเดตตอน Upload
              remark: formData.remark,
              selected_items: selectedItems.map(item => item.ENTITY_CODE).join(', ')
          };

          // 1.1 Call API Create Defect
          const createResponse = await fetch(`${API_BASE_URL}/DEFECT/CREATE`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(payload)
          });

          if (!createResponse.ok) {
              const errorData = await createResponse.json().catch(() => ({}));
              throw new Error(errorData.message || 'บันทึกข้อมูลหลักไม่สำเร็จ');
          }

          // 1.2 รับค่า ID ที่ตอบกลับมาจาก API (สำคัญมาก! ต้องใช้ ID นี้ในการอัปโหลดรูป)
          const createResult = await createResponse.json();
          
          // **สมมติว่า API ตอบกลับมาเป็น { id: "1045", ... } หรือ { data: { id: "1045" } }**
          // กรุณาตรวจสอบ Structure ของ Response จริง แล้วแก้บรรทัดด้านล่างให้ตรง
          const newDefectId = createResult.defect_id; 

          if (!newDefectId) {
              throw new Error('ไม่พบ ID จากการบันทึกข้อมูล ไม่สามารถอัปโหลดรูปภาพต่อได้');
          }

          // --- STEP 2: อัปโหลดรูปภาพ (Upload Images) ---
          if (formData.images && formData.images.length > 0) {
              
              // สร้าง Promise สำหรับการอัปโหลดแต่ละรูป
              const uploadPromises = formData.images.map(imageItem => {
                  const uploadFormData = new FormData();
                  
                  // ใส่ ID ที่ได้จาก Step 1
                  uploadFormData.append('id', newDefectId); 
                  
                  // ใส่ไฟล์รูปภาพ (imageItem.file ต้องเป็น File Object)
                  uploadFormData.append('file', imageItem.file); 

                  // ยิง API Upload (ตาม URL ที่คุณให้มา)
                  return fetch(`${API_BASE_URL}/IMAGE/upload-image`, { // หรือใช้ `${API_BASE_URL}/IMAGE/upload-image`
                      method: 'POST',
                      // ไม่ต้องใส่ Content-Type header เพราะ browser จะจัดการ boundary ของ multipart/form-data ให้เอง
                      body: uploadFormData
                  });
              });

              // รอให้ทุกรููปอัปโหลดเสร็จ (Parallel Upload)
              const uploadResponses = await Promise.all(uploadPromises);

              // ตรวจสอบว่ามีรูปไหนพังไหม (Optional)
              const failedUploads = uploadResponses.filter(res => !res.ok);
              if (failedUploads.length > 0) {
                  console.warn(`มีรูปภาพจำนวน ${failedUploads.length} รูป อัปโหลดไม่สำเร็จ แต่ข้อมูลหลักบันทึกแล้ว`);
                  // อาจจะแจ้งเตือน User เพิ่มเติมตรงนี้ว่า "บันทึกข้อมูลแล้ว แต่รูปบางส่วนไม่มา"
              }
          }

          // --- STEP 3: เสร็จสิ้น (Success) ---
          // alert('บันทึกข้อมูลและอัปโหลดรูปภาพสำเร็จ');
          if (onBack) onBack();

      } catch (error) {
          console.error("Submit Error:", error);
          alert(`เกิดข้อผิดพลาด: ${error.message}`);
      } finally {
          setIsLoading(false);
      }
  };


  const toggleItem = (item) => {
    const itemId = item.PROD_ID || item.ENTITY_CODE; 
    if (selectedItems.find(i => (i.PROD_ID || i.ENTITY_CODE) === itemId)) { 
        setSelectedItems(selectedItems.filter(i => (i.PROD_ID || i.ENTITY_CODE) !== itemId)); 
    } else { 
        setSelectedItems([...selectedItems, item]); 
    }
  };

  const selectAllItems = () => { 
      if (selectedItems.length === itemsList.length) { 
          setSelectedItems([]); 
      } else { 
          setSelectedItems([...itemsList]); 
      } 
  };

  const handleInputChange = (e) => { 
      const { name, value } = e.target; 
      
      // ถ้า User แก้ไข Detail เอง -> ปิด Auto Format เพื่อไม่ให้ระบบแก้ทับ
      if (name === 'detail') setIsAutoFormatEnabled(false);

      setFormData(prev => ({ ...prev, [name]: value })); 
  };

  const toggleType = (value) => { 
      // เมื่อมีการเปลี่ยน Type -> เปิด Auto Format ให้ทำงาน (ถ้า user ไม่ได้ปิดถาวร)
      // หรือถ้าต้องการบังคับจัด Format เสมอเมื่อคลิก Type ก็ set true ได้
      setIsAutoFormatEnabled(true);

      setFormData(prev => { 
          const currentTypes = prev.types; 
          let newTypes;
          if (currentTypes.includes(value)) { 
             newTypes = currentTypes.filter(t => t !== value); 
          } else { 
             newTypes = [...currentTypes, value]; 
          } 
          return { ...prev, types: newTypes };
      }); 
  };
  
  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    const remainingSlots = 10 - formData.images.length;
    if (files.length > remainingSlots) { 
        alert(`อัปโหลดได้อีกเพียง ${remainingSlots} รูป`); 
        return; 
    }
    const newImages = files.slice(0, remainingSlots).map(file => ({ 
        file, 
        previewUrl: URL.createObjectURL(file) 
    }));
    setFormData(prev => ({ ...prev, images: [...prev.images, ...newImages] }));
  };

  const removeImage = (index) => { 
      setFormData(prev => ({ ...prev, images: prev.images.filter((_, i) => i !== index) })); 
  };

  const nextStep = () => { 
      if (currentStep === 3 && selectedItems.length === 0) { 
          alert('กรุณาเลือกสินค้าอย่างน้อย 1 รายการ'); 
          return; 
      }
      if (currentStep === 4 && (!formData.detail || !formData.user_mk || formData.types.length === 0)) {
          alert('กรุณากรอกข้อมูลที่มีเครื่องหมาย * ให้ครบถ้วน');
          return;
      }
      
      // ถ้ากำลังจะเข้า Step 4 ให้เปิด Auto Format ครั้งแรก
      if (currentStep === 3) {
          setIsAutoFormatEnabled(true);
      }
      
      setCurrentStep(prev => prev + 1); 
  };

  const prevStep = () => setCurrentStep(prev => prev - 1);

  // Custom function to manual trigger format
  const handleManualFormat = () => {
      const formatted = generateDetailFormat(foundPromotion, selectedItems, formData.types);
      setFormData(prev => ({ ...prev, detail: formatted }));
      setIsAutoFormatEnabled(true);
  };

  const renderBreadcrumb = () => (
    <div className="flex items-center gap-1 md:gap-3 overflow-x-auto pb-2 scrollbar-hide py-2 px-2">
       <StepBadge step={1} current={currentStep} label="Search" />
       <ChevronRight className="w-4 h-4 text-gray-300 flex-shrink-0" />
       <StepBadge step={2} current={currentStep} label="Verify" />
       <ChevronRight className="w-4 h-4 text-gray-300 flex-shrink-0" />
       <StepBadge step={3} current={currentStep} label="Select" />
       <ChevronRight className="w-4 h-4 text-gray-300 flex-shrink-0" />
       <StepBadge step={4} current={currentStep} label="Input" />
       <ChevronRight className="w-4 h-4 text-gray-300 flex-shrink-0" />
       <StepBadge step={5} current={currentStep} label="Confirm" />
    </div>
  );

  return (
    <div className="animate-in fade-in duration-500 relative pb-10 min-h-screen bg-slate-50 dark:bg-slate-900 p-4 md:p-6">
      
      {/* Loading Overlay */}
      {isLoading && (
        <div className="fixed inset-0 bg-white/60 dark:bg-slate-900/60 z-[60] flex items-center justify-center backdrop-blur-sm">
            <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-2xl flex flex-col items-center gap-4 border border-gray-100 dark:border-slate-700 animate-bounce-in">
                <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
                <span className="font-bold text-gray-700 dark:text-white text-lg">กำลังประมวลผล...</span>
            </div>
        </div>
      )}
      
      {/* Header Bar */}
      <div className="bg-white dark:bg-slate-800 shadow-sm border border-gray-200 dark:border-slate-700 rounded-xl overflow-hidden mb-6 sticky top-4 z-30">
        <div className="px-6 py-4 flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-50 dark:bg-blue-900/30 rounded-lg">
                    <FileText className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                    <h2 className="font-bold text-gray-800 dark:text-white text-lg">Add Defect / Issue</h2>
                    <p className="text-xs text-gray-500 dark:text-slate-400">สร้างรายการแจ้งปัญหาโปรโมชั่นใหม่</p>
                </div>
            </div>
            {renderBreadcrumb()}
        </div>
      </div>

      {/* --- Step 1: Search --- */}
      {currentStep === 1 && (
        <div className="max-w-2xl mx-auto bg-white dark:bg-slate-800 p-8 rounded-2xl shadow-lg border border-gray-100 dark:border-slate-700 text-center mt-10 animate-in slide-in-from-bottom-8">
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">ค้นหาโปรโมชั่น</h2>
            <p className="text-gray-500 dark:text-slate-400 mb-8">กรอกรหัส Promotion Code เพื่อเริ่มต้นกระบวนการ</p>
            
            <div className="relative max-w-lg mx-auto group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
              </div>
              <input 
                type="text" 
                className={`w-full pl-12 pr-12 py-4 border-2 rounded-xl text-lg outline-none transition-all bg-white dark:bg-slate-700 dark:text-white font-mono shadow-sm
                    ${searchError 
                        ? 'border-red-300 focus:border-red-500 focus:ring-4 focus:ring-red-500/10' 
                        : 'border-gray-200 dark:border-slate-600 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10'}`} 
                placeholder="ระบุ Code (เช่น 299321)" 
                value={searchQuery} 
                onChange={(e) => setSearchQuery(e.target.value)} 
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()} 
                disabled={isLoading} 
                autoFocus
              />
              <button onClick={handleSearch} disabled={isLoading} className="absolute right-3 top-3 bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-lg transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:shadow-none">
                {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <ChevronRight className="w-5 h-5" />}
              </button>
            </div>

            {searchError && (
                <div className="mt-6 flex items-center justify-center gap-2 text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 p-4 rounded-xl animate-in fade-in slide-in-from-top-2 border border-red-100 dark:border-red-800">
                    <AlertCircle className="w-5 h-5 flex-shrink-0" />
                    <span className="font-medium">{searchError}</span>
                </div>
            )}
        </div>
      )}

      {/* --- Step 2: Verify Master --- */}
      {currentStep === 2 && foundPromotion && (
        <div className="space-y-6 animate-in slide-in-from-right-8">
           <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-gray-200 dark:border-slate-700">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8 pb-6 border-b border-gray-200 dark:border-slate-800">
                {/* Left Side: Icon & Title */}
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 rounded-xl shadow-sm">
                        <CheckCircle2 className="w-6 h-6" />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white tracking-tight">
                            ตรวจสอบข้อมูลหลัก
                        </h2>
                        <p className="text-sm text-gray-500 dark:text-slate-400 mt-0.5">
                            Master Info Verification
                        </p>
                    </div>
                </div>

                {/* Right Side: Action Buttons */}
                <div className="flex items-center gap-3 w-full sm:w-auto">
                    <button 
                        onClick={prevStep} 
                        className="flex-1 sm:flex-none justify-center px-4 py-2.5 rounded-lg text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 dark:text-slate-400 dark:hover:text-slate-200 dark:hover:bg-slate-800 transition-all flex items-center gap-2"
                    >
                        <ChevronLeft className="w-4 h-4" /> 
                        ค้นหาใหม่
                    </button>
                    
                    <button 
                        onClick={nextStep} 
                        className="flex-1 sm:flex-none justify-center bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-xl shadow-lg shadow-blue-600/20 font-semibold flex items-center gap-2 transition-all transform hover:scale-105 active:scale-95"
                    >
                        ถัดไป 
                        <ChevronRight className="w-4 h-4" />
                    </button>
                </div>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <InfoItem label="PRO_CODE" value={foundPromotion.PRO_CODE} />
              <InfoItem label="PRO_NAME" value={foundPromotion.PRO_NAME} />
              <InfoItem label="START_DATE" value={foundPromotion.START_DATE} />
              <InfoItem label="END_DATE" value={foundPromotion.END_DATE} />
              <InfoItem label="PRO_TYPE" value={foundPromotion.PRO_TYPE} />
              <InfoItem label="STATUS" value={foundPromotion.PRO_STATUS} />
              <InfoItem label="NOTES" value={foundPromotion.NOTES} full />
            </div>
          </div>
        </div>
      )}

      {/* --- Step 3: Select Products --- */}
      {currentStep === 3 && (
        <div className="space-y-6 animate-in slide-in-from-right-8">
           <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-gray-200 dark:border-slate-700 flex flex-col h-[70vh]">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8 pb-6 border-b border-gray-200 dark:border-slate-800">
                  
                  {/* Left Side: Icon & Title */}
                  <div className="flex items-center gap-4 w-full sm:w-auto">
                      <div className="p-3 bg-purple-100 dark:bg-purple-500/20 text-purple-600 dark:text-purple-400 rounded-xl shadow-sm">
                          <ShoppingBag className="w-6 h-6" />
                      </div>
                      <div className="flex-1 sm:flex-none">
                          <h2 className="text-xl font-bold text-gray-900 dark:text-white tracking-tight">
                              เลือกสินค้าที่มีปัญหา
                          </h2>
                          <p className="text-sm text-gray-500 dark:text-slate-400 mt-0.5">
                              Select Defective Items
                          </p>
                      </div>
                  </div>

                  {/* Right Side: Action Toolbar */}
                  <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto mt-2 sm:mt-0">
                      
                      {/* Tool: Select All */}
                      <button 
                          onClick={selectAllItems} 
                          className={`
                              px-3 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2
                              ${selectedItems.length === itemsList.length && itemsList.length > 0 
                                  ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300' 
                                  : 'bg-gray-50 text-gray-600 hover:bg-gray-100 dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-slate-700'}
                          `}
                      >
                          {/* Optional: Add a small icon for Check/Uncheck if you want */}
                          {selectedItems.length === itemsList.length && itemsList.length > 0 ? 'Deselect All' : 'Select All'}
                      </button>

                      {/* Divider (Hidden on mobile if needed, but looks good) */}
                      <div className="h-6 w-px bg-gray-200 dark:bg-slate-700 mx-1 hidden sm:block"></div>

                      {/* Navigation Buttons */}
                      <div className="flex items-center gap-3 flex-1 sm:flex-none justify-end">
                          <button 
                              onClick={prevStep} 
                              className="px-4 py-2 rounded-lg text-sm font-medium text-gray-500 hover:text-gray-800 hover:bg-gray-50 dark:text-slate-400 dark:hover:text-slate-200 dark:hover:bg-slate-800 transition-all flex items-center gap-2"
                          >
                              <ChevronLeft className="w-4 h-4" /> 
                              ย้อนกลับ
                          </button>
                          
                          <button 
                              onClick={nextStep} 
                              className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2.5 rounded-xl shadow-lg shadow-purple-600/20 font-semibold flex items-center gap-2 transition-all transform hover:scale-105 active:scale-95 whitespace-nowrap"
                          >
                              ระบุปัญหา 
                              <ChevronRight className="w-4 h-4" />
                          </button>
                      </div>
                  </div>
              </div>
             
             <div className="flex-1 overflow-hidden border border-gray-200 dark:border-slate-700 rounded-xl relative">
                <div className="absolute inset-0 overflow-y-auto custom-scrollbar">
                    <table className="w-full text-sm text-left">
                    <thead className="bg-gray-50 dark:bg-slate-700/50 text-gray-500 dark:text-slate-400 uppercase text-xs sticky top-0 z-10 backdrop-blur-sm">
                        <tr>
                        <th className="px-4 py-3 text-center w-16">Select</th>
                        <th className="px-4 py-3 font-semibold">Entity Code</th>
                        <th className="px-4 py-3 font-semibold">Product Name</th>
                        <th className="px-4 py-3 font-semibold">BARCODE</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-slate-700/50">
                        {itemsList.map((item, idx) => {
                        const itemId = item.PROD_ID || item.ENTITY_CODE;
                        const isSelected = selectedItems.find(i => (i.PROD_ID || i.ENTITY_CODE) === itemId);
                        return (
                            <tr 
                                key={idx} 
                                onClick={() => toggleItem(item)}
                                className={`
                                    cursor-pointer transition duration-200
                                    ${isSelected 
                                        ? 'bg-blue-50/80 dark:bg-blue-900/20' 
                                        : 'hover:bg-gray-50 dark:hover:bg-slate-700/30'}
                                `} 
                            >
                            <td className="px-4 py-3 text-center">
                                {isSelected 
                                    ? <CheckSquare className="w-5 h-5 text-blue-600 dark:text-blue-400 mx-auto fill-blue-100 dark:fill-blue-900" /> 
                                    : <Square className="w-5 h-5 text-gray-300 dark:text-slate-600 mx-auto hover:text-gray-400" />}
                            </td>
                            <td className="px-4 py-3 font-mono font-medium text-gray-700 dark:text-slate-300">{item.ENTITY_CODE}</td>
                            <td className="px-4 py-3 text-gray-800 dark:text-slate-200 font-medium">{item.ENTITY_NAME}</td>
                            <td className="px-4 py-3 text-gray-500 dark:text-slate-400">{item.BARCODE || '-'}</td>
                            </tr>
                        );
                        })}
                    </tbody>
                    </table>
                </div>
             </div>
             <p className="text-right text-gray-500 dark:text-slate-400 text-xs mt-3 font-medium">
                Selected: <span className="text-blue-600 dark:text-blue-400 font-bold text-sm">{selectedItems.length}</span> items
             </p>
           </div>
           

        </div>
      )}

      {/* --- Step 4: Input Issue --- */}
      {currentStep === 4 && (
        <div className="space-y-6 animate-in slide-in-from-right-8">
          <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-lg border border-gray-200 dark:border-slate-700 relative">
            
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8 pb-6 border-b border-gray-200 dark:border-slate-800">
                
                {/* Left Side: Icon & Title */}
                <div className="flex items-center gap-4 w-full sm:w-auto">
                    <div className="p-3 bg-red-100 dark:bg-red-500/20 text-red-600 dark:text-red-400 rounded-xl shadow-sm animate-pulse-slow">
                        <AlertCircle className="w-6 h-6" />
                    </div>
                    <div className="flex-1 sm:flex-none">
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white tracking-tight">
                            ระบุรายละเอียด
                        </h2>
                        <p className="text-sm text-gray-500 dark:text-slate-400 mt-0.5">
                            Issue Details
                        </p>
                    </div>
                </div>

                {/* Right Side: Action Toolbar */}
                <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto mt-2 sm:mt-0">
                    
                    {/* Tool: Copy History */}
                    <button 
                        onClick={() => setIsCopyModalOpen(true)}
                        className="px-3 py-2 rounded-lg text-sm font-medium text-gray-600 bg-gray-50 hover:bg-white hover:shadow-md hover:text-red-600 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 dark:hover:text-red-400 transition-all flex items-center gap-2 border border-transparent hover:border-gray-200 dark:hover:border-slate-600"
                        title="Copy Previous History"
                    >
                        <Copy className="w-4 h-4" />
                        <span className="hidden sm:inline">Copy History</span>
                        <span className="sm:hidden">Copy</span>
                    </button>

                    {/* Divider */}
                    <div className="h-6 w-px bg-gray-200 dark:bg-slate-700 mx-1 hidden sm:block"></div>

                    {/* Navigation Buttons */}
                    <div className="flex items-center gap-3 flex-1 sm:flex-none justify-end">
                        <button 
                            onClick={prevStep} 
                            className="px-4 py-2 rounded-lg text-sm font-medium text-gray-500 hover:text-gray-800 hover:bg-gray-50 dark:text-slate-400 dark:hover:text-slate-200 dark:hover:bg-slate-800 transition-all flex items-center gap-2"
                        >
                            <ChevronLeft className="w-4 h-4" /> 
                            ย้อนกลับ
                        </button>
                        
                        <button 
                            onClick={nextStep} 
                            className="bg-red-600 hover:bg-red-700 text-white px-6 py-2.5 rounded-xl shadow-lg shadow-red-600/20 font-semibold flex items-center gap-2 transition-all transform hover:scale-105 active:scale-95 whitespace-nowrap"
                        >
                            สรุปข้อมูล 
                            <ChevronRight className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              
              {/* Type Selection */}
              <div className="md:col-span-2">
                <label className="block text-sm font-bold text-gray-700 dark:text-slate-300 mb-3 uppercase tracking-wide">
                    ประเภทปัญหา (Type) <span className="text-red-500">*</span>
                </label>
                <div className="flex flex-wrap gap-3">
                    {TYPE_OPTIONS.map(option => {
                        const isSelected = formData.types.includes(option.label);
                        return (
                            <button 
                                key={option.label} 
                                type="button"
                                title={option.Desc}
                                onClick={() => toggleType(option.label)} 
                                className={`px-5 py-2.5 rounded-xl border text-sm font-medium transition-all duration-200 shadow-sm
                                    ${isSelected 
                                    ? 'bg-blue-600 text-white border-blue-600 ring-4 ring-blue-600/20 transform scale-105' 
                                    : 'bg-white dark:bg-slate-700 text-gray-600 dark:text-slate-300 border-gray-200 dark:border-slate-600 hover:bg-gray-50 dark:hover:bg-slate-600 hover:border-gray-300'
                                }`}
                            >
                                {option.label}
                            </button>
                        );
                    })}
                </div>
              </div>
              
              {/* Other Type Input */}
              {formData.types.includes('เงื่อนไขอื่นๆ') && (
                <div className="md:col-span-2 animate-in fade-in slide-in-from-top-2">
                  <label className="block text-sm font-bold text-gray-700 dark:text-slate-300 mb-2">ระบุรายละเอียดเพิ่มเติม</label>
                  <input 
                    type="text" 
                    name="type_other" 
                    value={formData.type_other} 
                    onChange={handleInputChange} 
                    className="w-full p-3 border rounded-xl border-blue-300 dark:border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500/50" 
                    placeholder="เช่น ป้ายราคาหาย, สินค้าเสียหาย..." 
                  />
                </div>
              )}

              {/* Inputs Group */}
              <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 dark:text-slate-300 mb-2">MK_NAME (ผู้ดูแล) <span className="text-red-500">*</span></label>
                    <input 
                        type="text" 
                        name="user_mk" 
                        value={formData.user_mk} 
                        onChange={handleInputChange} 
                        className="w-full p-3 border border-gray-200 dark:border-slate-600 bg-gray-50 dark:bg-slate-700 text-gray-900 dark:text-white rounded-xl focus:border-blue-500 focus:bg-white dark:focus:bg-slate-800 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all" 
                        placeholder="ระบุชื่อ MK" 
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 dark:text-slate-300 mb-2">จำนวน (QTY) <span className="text-red-500">*</span></label>
                    <input 
                        type="number" 
                        name="qty" 
                        value={formData.qty} 
                        onChange={handleInputChange} 
                        className="w-full p-3 border border-gray-200 dark:border-slate-600 bg-gray-50 dark:bg-slate-700 text-gray-900 dark:text-white rounded-xl focus:border-blue-500 focus:bg-white dark:focus:bg-slate-800 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all" 
                    />
                  </div>
              </div>

              {/* Detail Textarea (Auto-Format) */}
              <div className="md:col-span-2">
                <div className="flex justify-between items-center mb-2">
                    <label className="block text-sm font-bold text-gray-700 dark:text-slate-300">
                        รายละเอียดปัญหา (Detail) <span className="text-red-500">*</span>
                    </label>
                    <div className="flex gap-2">
                         <button 
                            type="button" 
                            onClick={handleManualFormat}
                            className="text-xs flex items-center gap-1 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 font-medium bg-blue-50 dark:bg-blue-900/20 px-2 py-1 rounded transition"
                            title="จัดรูปแบบข้อความใหม่ตามข้อมูลปัจจุบัน"
                         >
                            <RefreshCw className="w-3 h-3" /> Auto Format
                         </button>
                    </div>
                </div>
                <textarea 
                    name="detail" 
                    rows="3" 
                    value={formData.detail} 
                    onChange={handleInputChange} 
                    className={`w-full p-3 border rounded-xl outline-none transition-all font-medium leading-relaxed
                        ${isAutoFormatEnabled 
                            ? 'bg-blue-50/50 border-blue-200 text-blue-900 dark:bg-blue-900/10 dark:border-blue-800 dark:text-blue-100' 
                            : 'bg-white border-gray-200 text-gray-900 dark:bg-slate-700 dark:border-slate-600 dark:text-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10'
                        }`}
                    placeholder="รายละเอียดจะถูกสร้างอัตโนมัติเมื่อเลือกประเภทปัญหา..." 
                />
                <p className="text-xs text-gray-400 mt-1 flex items-center gap-1">
                    {isAutoFormatEnabled ? <RefreshCw className="w-3 h-3 animate-spin-slow"/> : <Edit3 className="w-3 h-3"/>}
                    {isAutoFormatEnabled ? 'Auto-formatting enabled' : 'Manual editing mode'}
                </p>
              </div>

              {/* Remark */}
              <div className="md:col-span-2">
                <label className="block text-sm font-bold text-gray-700 dark:text-slate-300 mb-2">หมายเหตุเพิ่มเติม (Remark)</label>
                <textarea 
                    name="remark" 
                    rows="2" 
                    value={formData.remark} 
                    onChange={handleInputChange} 
                    className="w-full p-3 border border-gray-200 dark:border-slate-600 bg-gray-50 dark:bg-slate-700 text-gray-900 dark:text-white rounded-xl focus:border-blue-500 focus:bg-white dark:focus:bg-slate-800 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all" 
                    placeholder="ระบุข้อมูลเพิ่มเติมถ้ามี..."
                />
              </div>

              {/* Image Upload */}
              <div className="md:col-span-2">
                <label className="block text-sm font-bold text-gray-700 dark:text-slate-300 mb-3">รูปภาพประกอบ ({formData.images.length}/10)</label>
                <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-4">
                    {/* Upload Button */}
                    <div className="aspect-square">
                        <input type="file" id="file-upload" multiple accept="image/*" onChange={handleImageUpload} className="hidden" disabled={formData.images.length >= 10} />
                        <label 
                            htmlFor="file-upload" 
                            className={`flex flex-col items-center justify-center w-full h-full border-2 border-dashed rounded-xl cursor-pointer transition-all
                                ${formData.images.length >= 10 
                                    ? 'bg-gray-100 border-gray-300 cursor-not-allowed opacity-50' 
                                    : 'border-blue-300 bg-blue-50 hover:bg-blue-100 hover:border-blue-400 dark:bg-slate-700/50 dark:border-slate-600 dark:hover:bg-slate-700'}`}
                        >
                            <Upload className="w-6 h-6 text-blue-500 mb-1" />
                            <span className="text-xs font-bold text-blue-600 dark:text-blue-400">Add Photo</span>
                        </label>
                    </div>
                    
                    {/* Image Previews */}
                    {formData.images.map((img, idx) => (
                        <div key={idx} className="relative group aspect-square bg-white dark:bg-slate-800 rounded-xl overflow-hidden border border-gray-200 dark:border-slate-600 shadow-sm">
                            <img src={img.previewUrl} alt="preview" className="w-full h-full object-cover transition-transform group-hover:scale-110" />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                <button onClick={() => removeImage(idx)} className="bg-red-500 text-white p-1.5 rounded-full hover:bg-red-600 shadow-lg transform hover:scale-110 transition">
                                    <X className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
              </div>

            </div>
          </div>
          

        </div>
      )}

      {/* --- Step 5: Confirm --- */}
      {currentStep === 5 && (
        <div className="space-y-6 animate-in slide-in-from-right-8">
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-yellow-400 dark:border-yellow-600 p-4 rounded-xl shadow-sm flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-yellow-500 dark:text-yellow-400 mt-0.5 flex-shrink-0" />
              <div>
                 <h4 className="font-bold text-yellow-800 dark:text-yellow-200 text-sm">ตรวจสอบความถูกต้อง</h4>
                 <p className="text-sm text-yellow-700 dark:text-yellow-300/80 mt-1">กรุณาตรวจสอบข้อมูลเป็นครั้งสุดท้ายก่อนกดยืนยัน ข้อมูลที่บันทึกแล้วจะไม่สามารถแก้ไขผ่านหน้าจอนี้ได้</p>
              </div>
          </div>
          
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl shadow-slate-200/50 dark:shadow-slate-900/50 border border-gray-100 dark:border-slate-700 overflow-hidden">
              
              {/* Card Header & Action Bar */}
              <div className="bg-white/50 dark:bg-slate-800/50 p-6 border-b border-gray-100 dark:border-slate-700 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
                  
                  {/* Left Side: Title */}
                  <div className="flex items-center gap-4">
                      <div className="p-3 bg-green-100 dark:bg-green-500/20 text-green-600 dark:text-green-400 rounded-2xl shadow-sm ring-1 ring-green-100 dark:ring-green-900/50">
                          <CheckCircle2 className="w-7 h-7" />
                      </div>
                      <div>
                          <h2 className="text-xl font-bold text-gray-900 dark:text-white tracking-tight">
                              ยืนยันการบันทึกข้อมูล
                          </h2>
                          <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">
                              Final Confirmation
                          </p>
                      </div>
                  </div>

                  {/* Right Side: Actions */}
                  <div className="flex items-center gap-3 w-full sm:w-auto">
                      <button 
                          onClick={prevStep} 
                          disabled={isLoading}
                          className="flex-1 sm:flex-none justify-center px-5 py-2.5 rounded-xl text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 dark:text-slate-400 dark:hover:text-slate-200 dark:hover:bg-slate-700/50 transition-all border border-transparent hover:border-gray-200 dark:hover:border-slate-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                      >
                          <ChevronLeft className="w-4 h-4" /> 
                          แก้ไขข้อมูล
                      </button>
                      
                      <button 
                          onClick={handleSubmit} 
                          disabled={isLoading}
                          className="flex-1 sm:flex-none justify-center bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-xl shadow-lg shadow-green-600/20 font-bold flex items-center gap-2 transition-all transform hover:scale-105 active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none disabled:hover:bg-green-600"
                      >
                          {isLoading ? (
                              <>
                                  <Loader2 className="w-5 h-5 animate-spin" />
                                  <span>กำลังบันทึก...</span>
                              </>
                          ) : (
                              <>
                                  <Save className="w-5 h-5" />
                                  <span>ยืนยันการบันทึก</span>
                              </>
                          )}
                      </button>
                  </div>
              </div>

              {/* Content Body Placeholder */}
           <div> 

          </div>
            
            <div className="p-8 space-y-8">
              <section>
                <h3 className="text-sm font-bold text-gray-400 dark:text-slate-500 uppercase tracking-wider border-b border-gray-100 dark:border-slate-700 pb-2 mb-4">1. ข้อมูลโปรโมชั่น</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-sm">
                    <InfoItem label="PRO_CODE" value={foundPromotion.PRO_CODE} />
                    <InfoItem label="PRO_NAME" value={foundPromotion.PRO_NAME} />
                    <InfoItem label="START_DATE" value={foundPromotion.START_DATE} />
                    <InfoItem label="END_DATE" value={foundPromotion.END_DATE} />
                </div>
              </section>

              <section>
                <h3 className="text-sm font-bold text-gray-400 dark:text-slate-500 uppercase tracking-wider border-b border-gray-100 dark:border-slate-700 pb-2 mb-4">2. รายการสินค้า ({selectedItems.length})</h3>
                <div className="bg-gray-50 dark:bg-slate-700/30 p-4 rounded-xl border border-gray-100 dark:border-slate-700 max-h-48 overflow-y-auto custom-scrollbar">
                  <ul className="space-y-2 text-sm text-gray-700 dark:text-slate-300">
                    {selectedItems.map((item, idx) => (
                      <li key={idx} className="flex gap-3 items-center">
                        <span className="w-6 h-6 flex items-center justify-center bg-white dark:bg-slate-600 rounded-full text-xs font-bold shadow-sm border border-gray-100 dark:border-slate-500">{idx+1}</span>
                        <span className="font-mono font-bold text-blue-600 dark:text-blue-400">{item.ENTITY_CODE}</span>
                        <span className="truncate">{item.ENTITY_NAME}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </section>

              <section>
                <h3 className="text-sm font-bold text-gray-400 dark:text-slate-500 uppercase tracking-wider border-b border-gray-100 dark:border-slate-700 pb-2 mb-4">3. รายละเอียดปัญหา</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
                  <DisplayField label="ประเภทปัญหา" value={formData.types.join(', ')} highlight />
                  <DisplayField label="ผู้ดูแล (MK_NAME)" value={formData.user_mk} />
                  <DisplayField label="จำนวน (QTY)" value={formData.qty} />
                  <div className="md:col-span-3">
                    <DisplayField label="รายละเอียด" value={formData.detail} />
                  </div>
                  {formData.type_other && <DisplayField label="อื่นๆ" value={formData.type_other} />}
                  <div className="md:col-span-3">
                    <DisplayField label="หมายเหตุ" value={formData.remark} />
                  </div>
                </div>
              </section>

              <section>
                <h3 className="text-sm font-bold text-gray-400 dark:text-slate-500 uppercase tracking-wider border-b border-gray-100 dark:border-slate-700 pb-2 mb-4">4. รูปภาพแนบ</h3>
                <div className="flex flex-wrap gap-4">
                    {formData.images.length > 0 ? (
                        formData.images.map((img, idx) => (
                            <div key={idx} className="w-24 h-24 bg-white dark:bg-slate-700 rounded-xl border border-gray-200 dark:border-slate-600 overflow-hidden shadow-sm">
                                <img src={img.previewUrl} className="w-full h-full object-cover" alt={`preview-${idx}`} />
                            </div>
                        ))
                    ) : (
                        <div className="w-full py-4 text-center border-2 border-dashed border-gray-100 dark:border-slate-700 rounded-xl text-gray-400">
                            ไม่ได้แนบรูปภาพ
                        </div>
                    )}
                </div>
              </section>
            </div>
          </div>
        </div>
      )}
      
      {/* --- Modal Component Instance --- */}
      <HistoryModal 
        isOpen={isCopyModalOpen} 
        onClose={() => setIsCopyModalOpen(false)} 
        onSelect={handleCopySelect} 
      />
    </div>
  );
}