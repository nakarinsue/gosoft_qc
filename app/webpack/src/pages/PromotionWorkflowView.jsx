import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { 
  ChevronRight, ChevronLeft, Upload, X, FileText, AlertCircle, Save, 
  Search, Loader2, CheckCircle2, ShoppingBag, Square, CheckSquare,
  Copy, History, RefreshCw, Edit3, Layers, FileSpreadsheet, Lock, Link,
  Check
} from 'lucide-react';

// --- Configuration (Mock) ---
import { API_BASE_URL, TYPE_OPTIONS } from '../config';

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

// StepBadge: ปรับปรุงให้รองรับสถานะ Skipped (สีเทา)
function StepBadge({ step, label, status }) {
  // status: 'current' | 'completed' | 'pending' | 'skipped'
  
  let containerClass = '';
  let textClass = '';
  let icon = null;

  switch (status) {
    case 'current':
        containerClass = 'bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-500/30';
        textClass = 'text-blue-700 dark:text-blue-400 font-bold';
        icon = step;
        break;
    case 'completed':
        containerClass = 'bg-green-500 border-green-500 text-white';
        textClass = 'text-green-600 dark:text-green-400 font-bold';
        icon = <Check className="w-4 h-4" />;
        break;
    case 'skipped': // กรณีถูกข้าม (เช่นมี Version เดียว) ให้เป็นสีเทา
    case 'pending': // กรณีอนาคต
    default:
        containerClass = 'bg-slate-100 border-slate-200 text-slate-400 dark:bg-slate-800 dark:border-slate-700';
        textClass = 'text-slate-400 dark:text-slate-500 font-medium';
        icon = step;
        break;
  }

  return (
    <div className={`flex items-center gap-2 min-w-fit`}>
        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all duration-300 ${containerClass}`}>
            {icon}
        </div>
        <span className={`hidden md:inline text-sm whitespace-nowrap ${textClass}`}>{label}</span>
    </div>
  );
}

function InfoItem({ label, value, full = false }) {
  return (
    <div className={`p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800 ${full ? "col-span-2 md:col-span-4" : ""}`}>
      <span className="block text-[10px] uppercase tracking-wider font-black text-slate-400 mb-1">{label}</span>
      <span className={`block font-bold text-slate-700 dark:text-slate-200 ${full ? "whitespace-normal break-words" : "truncate"}`} title={value}>
          {value || '-'}
      </span>
    </div>
  );
}

function DisplayField({ label, value, highlight }) {
  return (
    <div className={`p-4 rounded-2xl border transition-colors ${
        highlight 
        ? 'bg-blue-50 border-blue-100 text-blue-900 dark:bg-blue-900/20 dark:border-blue-800 dark:text-blue-100' 
        : 'bg-slate-50 border-slate-100 text-slate-800 dark:bg-slate-800/50 dark:border-slate-700 dark:text-slate-200'
    }`}>
      <span className="block text-xs font-black opacity-70 mb-1 uppercase tracking-wide">{label}</span>
      <span className="block text-sm font-medium leading-relaxed">{value || '-'}</span>
    </div>
  );
}

// HistoryModal: ปรับ Design ให้เหมือนหน้าจอหลัก (Rounded, Shadow, White BG)
const HistoryModal = ({ isOpen, onClose, onSelect }) => {
  const [historyList, setHistoryList] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => { if (isOpen) fetchHistory(); }, [isOpen]);

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/PROMOTION/SEARCH`);
      if (!response.ok) throw new Error(`Error: ${response.status}`);
      const data = await response.json();
      setHistoryList(data.slice(0, 10));
    } catch (error) {
      console.error("Failed to fetch history", error);
      setHistoryList([]); 
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/80 z-[60] flex items-center justify-center p-4 backdrop-blur-md animate-in fade-in">
      {/* Container ปรับให้โค้งมนและสวยงามเหมือน Card หลัก */}
      <div className="bg-white dark:bg-slate-950 rounded-[2.5rem] shadow-2xl w-full max-w-6xl max-h-[85vh] flex flex-col border border-slate-200 dark:border-slate-800 overflow-hidden animate-in zoom-in-95 duration-300">
        
        {/* Header */}
        <div className="px-8 py-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-white dark:bg-slate-950 sticky top-0 z-20">
          <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-50 dark:bg-blue-900/30 rounded-2xl text-blue-600 dark:text-blue-400">
                 <History className="w-6 h-6"/>
              </div>
              <div>
                  <h3 className="font-black text-xl text-slate-800 dark:text-white">เลือกข้อมูลจากประวัติ</h3>
                  <p className="text-xs text-slate-500">เลือกรายการเก่าเพื่อคัดลอกข้อมูล (10 รายการล่าสุด)</p>
              </div>
          </div>
          <button onClick={onClose} className="p-3 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors group">
              <X className="w-6 h-6 text-slate-400 group-hover:text-red-500 transition-colors" />
          </button>
        </div>

        {/* Content Table */}
        <div className="overflow-auto p-0 flex-grow custom-scrollbar bg-slate-50/50 dark:bg-slate-900/50">
          <table className="w-full text-sm text-left border-collapse">
            <thead className="bg-white dark:bg-slate-950 text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800 sticky top-0 shadow-sm z-10">
              <tr>
                <th className="px-6 py-4 font-bold text-xs uppercase tracking-wider bg-slate-50/80 dark:bg-slate-900/80 backdrop-blur-sm">Pro Code</th>
                <th className="px-6 py-4 font-bold text-xs uppercase tracking-wider bg-slate-50/80 dark:bg-slate-900/80 backdrop-blur-sm">Pro Name</th>
                <th className="px-6 py-4 font-bold text-xs uppercase tracking-wider bg-slate-50/80 dark:bg-slate-900/80 backdrop-blur-sm">MK Name</th>
                <th className="px-6 py-4 font-bold text-xs uppercase tracking-wider bg-slate-50/80 dark:bg-slate-900/80 backdrop-blur-sm">Detail</th>
                <th className="px-6 py-4 font-bold text-xs uppercase tracking-wider bg-slate-50/80 dark:bg-slate-900/80 backdrop-blur-sm text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 bg-white dark:bg-slate-950">
              {loading ? (
                <tr><td colSpan="5" className="px-6 py-24 text-center"><Loader2 className="w-10 h-10 animate-spin mx-auto text-blue-500" /></td></tr>
              ) : historyList.length === 0 ? (
                <tr><td colSpan="5" className="px-6 py-24 text-center text-slate-400 font-bold">ไม่พบประวัติรายการ</td></tr>
              ) : (
                historyList.map((item, idx) => (
                  <tr key={idx} className="hover:bg-blue-50 dark:hover:bg-slate-900 transition-colors group">
                    <td className="px-6 py-4 font-mono font-bold text-blue-600">{item.PROMOTION_CODE}</td>
                    <td className="px-6 py-4 font-bold text-slate-700 dark:text-white truncate max-w-[200px]" title={item.PROMOTION_NAME}>{item.PROMOTION_NAME}</td>
                    <td className="px-6 py-4 font-medium text-slate-600 dark:text-slate-300">{item.user_mk}</td>
                    <td className="px-6 py-4 text-slate-500 truncate max-w-[250px]" title={item.detail}>{item.detail}</td>
                    <td className="px-6 py-4 text-right">
                      <button 
                        onClick={() => onSelect(item)} 
                        className="bg-white border-2 border-slate-200 text-slate-600 hover:border-blue-500 hover:bg-blue-600 hover:text-white px-5 py-2 rounded-xl text-xs font-black transition-all shadow-sm active:scale-95"
                      >
                        SELECT
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
  const [productVersions, setProductVersions] = useState([]); 
  const [selectedVersion, setSelectedVersion] = useState(null); 
  const [itemsList, setItemsList] = useState([]); 
  const [selectedItems, setSelectedItems] = useState([]);
  const [subProList, setSubProList] = useState([]);
  const [selectedSubPros, setSelectedSubPros] = useState([]);

  // Logic States
  const [isMkLocked, setIsMkLocked] = useState(false);
  const [mkSuggestions, setMkSuggestions] = useState([]);
  const [isCopyModalOpen, setIsCopyModalOpen] = useState(false);
  const [isAutoFormatEnabled, setIsAutoFormatEnabled] = useState(true);

  const [formData, setFormData] = useState({
    detail: '', status: 'open', user_mk: '', qty: '1', types: [], type_other: '', remark: '', images: [] 
  });

  // Fetch MK Suggestions
  useEffect(() => {
    const fetchMkList = async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/PROMOTION/SEARCH`);
            if(response.ok) {
                const data = await response.json();
                const uniqueMks = [...new Set(data.map(item => item.user_mk).filter(Boolean))];
                setMkSuggestions(uniqueMks);
            }
        } catch (e) { console.error("Could not fetch MK suggestions"); }
    };
    fetchMkList();
  }, []);

  // Auto-Format Effect
  useEffect(() => {
    if (currentStep === 4 && isAutoFormatEnabled && foundPromotion) {
        const newDetail = generateDetailFormat(foundPromotion, selectedItems, formData.types);
        setFormData(prev => ({ ...prev, detail: newDetail }));
    }
  }, [formData.types, selectedItems, foundPromotion, currentStep, isAutoFormatEnabled]);

  // --- Functions ---
  const handleSearch = async () => {
      setSearchError(''); setFoundPromotion(null); setProductVersions([]);
      setSelectedVersion(null); setItemsList([]); setSubProList([]); setSelectedSubPros([]);
      
      if (!searchQuery.trim()) { setSearchError('กรุณากรอก Promotion Code'); return; }
      
      setIsLoading(true);
      try {
        const response = await fetch(`${API_BASE_URL}/PROMOTION/ALL/${searchQuery.trim()}`);
        if (response.status === 601) throw new Error('ข้อมูลซ้ำ (Error 601)');
        if (response.status === 602) throw new Error('ไม่พบข้อมูล (Error 602)');
        if (!response.ok) throw new Error(`เกิดข้อผิดพลาดในการเชื่อมต่อ (Status: ${response.status})`);
        
        const data = await response.json();  
        if (data.master_info) { 
            setFoundPromotion(data.master_info); 
            if (data['Sub-Pro'] && Array.isArray(data['Sub-Pro'])) {
                setSubProList(data['Sub-Pro']);
            }
            const productsData = data.products || [];
            setProductVersions(productsData);

            // Flow Logic: ถ้ามี Version เดียว ข้าม Step 2, ถ้าไม่มีสินค้า ข้าม Step 3
            if (productsData.length > 1) {
                setCurrentStep(2);
            } else if (productsData.length === 1) {
                handleVersionSelect(productsData[0], true);
            } else {
                setItemsList([]);
                setCurrentStep(3); // ไป Select เปล่าๆ
            }
            
            const historyItem = data.import_history?.[0];
            const defaultMK = historyItem?.USER_MK || ''; 
            setFormData(prev => ({ ...prev, user_mk: defaultMK }));
            if (defaultMK) setIsMkLocked(true);
        } else { 
            throw new Error('ไม่พบข้อมูลโปรโมชั่น (Master Info is empty)'); 
        }
      } catch (error) { 
          console.error(error); 
          setSearchError(error.message); 
      } finally { 
          setIsLoading(false); 
      }
  };

  const handleVersionSelect = (versionData) => {
      setSelectedVersion(versionData);
      let extractedItems = [];
      if (versionData.PRODUCTS && versionData.PRODUCTS.length > 0) {
          extractedItems = versionData.PRODUCTS[0].ENTITY || [];
      }
      setItemsList(extractedItems);
      setCurrentStep(3);
  };

  const handleCopySelect = (item) => {
    setIsAutoFormatEnabled(false);
    setFormData(prev => ({
        ...prev, detail: item.detail || '', remark: item.remark || '', user_mk: item.user_mk || '',
    }));
    if (item.user_mk) setIsMkLocked(true);
    setIsCopyModalOpen(false);
  };
const handleSubmit = async () => {
  setIsLoading(true);
  try {
    // --- ส่วนที่ 1: เตรียมข้อมูลรูปภาพ ---
    const preparedImages = formData.images.map((img, index) => {
      const timestamp = Date.now();
      // ลบช่องว่างและอักขระพิเศษในชื่อไฟล์
      const safeName = img.file.name.replace(/[^a-zA-Z0-9.]/g, '_'); 
      const cleanFileName = `defect_${foundPromotion?.PRO_CODE}_${timestamp}_${index}_${safeName}`;
      return { file: img.file, fileName: cleanFileName };
    });

    // เตรียม Link URL
    const linkUrls = preparedImages.map(img => img.fileName);

    // --- ส่วนที่ 2: เตรียม Payload หลัก ---
    const payload = {
      pro_id: foundPromotion?.PRO_CODE || '',
      id: selectedVersion?.ID || 0,
      VERSION_NO: selectedVersion?.VERSION_NO || 0,
      product: selectedItems.map(item => item.ENTITY_CODE),
      detail: formData.detail,
      user_login: String(user?.id || 'Unknown'),
      user_mk: formData.user_mk,
      qty: Number(formData.qty),
      types: formData.types,
      type_other: formData.type_other || '',
      link_url: linkUrls, 
      remark: formData.remark
    };

    // --- ส่วนที่ 3: ยิง API สร้าง Defect ---
    const createResponse = await axios.post(`${API_BASE_URL}/DEFECT/CREATE`, payload);
    const createResult = createResponse.data;
    
    // ดึง ID ที่ได้จาก Backend
    const newDefectId = createResult.defect_id || createResult.id;

    if (!newDefectId && newDefectId !== 0) {
        throw new Error('บันทึกสำเร็จ แต่ไม่ได้รับ ID กลับมา (newDefectId is null)');
    }

    // --- ส่วนที่ 4: ยิง API Sub Promotion (ถ้ามี) ---
    if (selectedSubPros.length > 0) {
      const subPayload = { 
        ...payload, 
        SUB: selectedSubPros.map(sp => sp.PROMOTION_CODE) 
      };
      // Note: เช็คว่าต้องส่ง parent_id หรือ defect_id ไปด้วยไหม? หรือแค่ยิงซ้ำเฉยๆ
      await axios.post(`${API_BASE_URL}/DEFECT/CREATE`, subPayload);
    }

    // --- ส่วนที่ 5: อัปโหลดรูปภาพ ---
    if (preparedImages.length > 0) {
      const uploadPromises = preparedImages.map(imgData => {
        const uploadFormData = new FormData();
        
        // parameter ที่ 3 คือชื่อไฟล์ที่ Backend จะเห็น
        uploadFormData.append('file', imgData.file, imgData.fileName); 

        // ตรวจสอบ Parameter user_id ตรงนี้ให้แน่ใจว่าคือ Defect ID หรือ User ID
        return axios.post(
            `${API_BASE_URL}/IMAGE/upload-and-import?user_id=${newDefectId}&system=IMAGE`, 
            uploadFormData,
            { headers: { 'Content-Type': 'multipart/form-data' } }
        );
      });

      await Promise.all(uploadPromises);
    }

    // --- ส่วนที่ 6: จบการทำงาน ---
    alert("บันทึกข้อมูลสำเร็จเรียบร้อยแล้ว");
    if (onBack) onBack();

  } catch (error) {
    console.error("Submit Error:", error);
    
    // ดึง Error Message จาก Server
    const serverMsg = error.response?.data?.message || error.response?.data?.error;
    const msg = serverMsg || error.message || 'เกิดข้อผิดพลาดในการบันทึก';
    
    alert(`เกิดข้อผิดพลาด: ${msg}`);
  } finally {
    setIsLoading(false);
  }
};

  const toggleSubPro = (item) => {
    if (selectedSubPros.find(sp => sp.PROMOTION_CODE === item.PROMOTION_CODE)) {
        setSelectedSubPros(selectedSubPros.filter(sp => sp.PROMOTION_CODE !== item.PROMOTION_CODE));
    } else {
        setSelectedSubPros([...selectedSubPros, item]);
    }
  };

  const nextStep = () => { 
      if (currentStep === 3 && selectedItems.length === 0) { alert('กรุณาเลือกสินค้าอย่างน้อย 1 รายการ'); return; }
      if (currentStep === 4 && (!formData.detail || !formData.user_mk || formData.types.length === 0)) {
          alert('กรุณากรอกข้อมูลที่มีเครื่องหมาย * ให้ครบถ้วน');
          return;
      }
      if (currentStep === 3) setIsAutoFormatEnabled(true);

      if (currentStep === 4) {
          if (subProList.length > 0) setCurrentStep(5);
          else setCurrentStep(6);
      } else {
          setCurrentStep(prev => prev + 1); 
      }
  };

  const prevStep = () => {
      if (currentStep === 3) {
          if (productVersions.length > 1) setCurrentStep(2);
          else { setCurrentStep(1); setFoundPromotion(null); }
      } else if (currentStep === 6) {
          if (subProList.length > 0) setCurrentStep(5);
          else setCurrentStep(4);
      } else {
          setCurrentStep(prev => prev - 1);
      }
  };

  // --- Breadcrumb Logic (Updated) ---
  const getStepStatus = (stepIndex) => {
      // stepIndex: 1...6
      if (currentStep === stepIndex) return 'current'; // สีน้ำเงิน
      if (currentStep > stepIndex) {
          // ถ้าผ่านมาแล้ว ต้องเช็คว่า "ข้าม" หรือ "ทำจริง"
          // Step 2 (Version): ถ้า products <= 1 แสดงว่าข้าม -> skipped (เทา)
          if (stepIndex === 2 && productVersions.length <= 1) return 'skipped';
          // Step 5 (Sub-Pro): ถ้าไม่มี subProList แสดงว่าข้าม -> skipped (เทา)
          if (stepIndex === 5 && subProList.length === 0) return 'skipped';
          
          return 'completed'; // สีเขียว
      }
      return 'pending'; // อนาคต (สีเทา)
  };

  const renderBreadcrumb = () => (
    <div className="flex items-center gap-1 md:gap-2 overflow-x-auto pb-2 scrollbar-hide py-2 px-2 mask-linear">
       <StepBadge step={1} current={currentStep} label="Search" status={getStepStatus(1)} />
       <ChevronRight className="w-4 h-4 text-slate-300 flex-shrink-0" />
       
       <StepBadge step={2} current={currentStep} label="Version" status={getStepStatus(2)} />
       <ChevronRight className="w-4 h-4 text-slate-300 flex-shrink-0" />
       
       <StepBadge step={3} current={currentStep} label="Select" status={getStepStatus(3)} />
       <ChevronRight className="w-4 h-4 text-slate-300 flex-shrink-0" />
       
       <StepBadge step={4} current={currentStep} label="Input" status={getStepStatus(4)} />
       <ChevronRight className="w-4 h-4 text-slate-300 flex-shrink-0" />
       
       <StepBadge step={5} current={currentStep} label="Link Pro" status={getStepStatus(5)} />
       <ChevronRight className="w-4 h-4 text-slate-300 flex-shrink-0" />

       <StepBadge step={6} current={currentStep} label="Confirm" status={getStepStatus(6)} />
    </div>
  );

  return (
    <div className="animate-in fade-in duration-500 relative pb-10 min-h-screen bg-slate-50 dark:bg-slate-900 p-4 md:p-6">
      
      {isLoading && (
        <div className="fixed inset-0 bg-white/60 dark:bg-slate-900/60 z-[70] flex items-center justify-center backdrop-blur-sm">
            <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-2xl flex flex-col items-center gap-4 border border-slate-100 dark:border-slate-700 animate-bounce-in">
                <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
                <span className="font-bold text-slate-700 dark:text-white text-lg">กำลังประมวลผล...</span>
            </div>
        </div>
      )}
      
      <div className="bg-white dark:bg-slate-800 shadow-xl shadow-slate-200/50 dark:shadow-none border border-slate-200 dark:border-slate-700 rounded-[2rem] overflow-hidden mb-8 sticky top-4 z-30">
        <div className="px-8 py-5 flex flex-col xl:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-4 w-full xl:w-auto">
                <div className="p-3 bg-blue-50 dark:bg-blue-900/30 rounded-2xl">
                    <FileText className="w-7 h-7 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                    <h2 className="font-black text-slate-800 dark:text-white text-xl">Add Defect / Issue</h2>
                    <p className="text-sm font-medium text-slate-500 dark:text-slate-400">สร้างรายการแจ้งปัญหาโปรโมชั่นใหม่</p>
                </div>
            </div>
            {renderBreadcrumb()}
        </div>
      </div>

      {/* --- Step 1: Search --- */}
      {currentStep === 1 && (
        <div className="max-w-3xl mx-auto bg-white dark:bg-slate-800 p-10 rounded-[2.5rem] shadow-xl border border-slate-100 dark:border-slate-700 text-center mt-12 animate-in slide-in-from-bottom-8 duration-500">
            <h2 className="text-3xl font-black text-slate-800 dark:text-white mb-3">ค้นหาโปรโมชั่น</h2>
            <p className="text-slate-500 dark:text-slate-400 mb-10 font-medium">กรอกรหัส Promotion Code เพื่อเริ่มต้นกระบวนการตรวจสอบ</p>
            <div className="relative max-w-xl mx-auto group">
              <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                <Search className="h-6 w-6 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
              </div>
              <input 
                type="text" 
                className={`w-full pl-14 pr-14 py-5 border-2 rounded-2xl text-xl outline-none transition-all bg-slate-50 dark:bg-slate-700 dark:text-white font-mono font-bold shadow-inner ${searchError ? 'border-red-300 focus:border-red-500 bg-red-50' : 'border-slate-200 dark:border-slate-600 focus:border-blue-500 focus:bg-white'}`} 
                placeholder="ระบุ Code (เช่น 299321)" 
                value={searchQuery} 
                onChange={(e) => setSearchQuery(e.target.value)} 
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()} 
                disabled={isLoading} 
                autoFocus
              />
              <button onClick={handleSearch} disabled={isLoading} className="absolute right-3 top-3 bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-xl transition-all shadow-lg shadow-blue-600/30 active:scale-95">
                {isLoading ? <Loader2 className="w-6 h-6 animate-spin" /> : <ChevronRight className="w-6 h-6" />}
              </button>
            </div>
            {searchError && (
                <div className="mt-8 flex items-center justify-center gap-3 text-red-600 bg-red-50 p-4 rounded-2xl border border-red-100 font-bold animate-pulse"><AlertCircle className="w-6 h-6" /><span>{searchError}</span></div>
            )}
        </div>
      )}

      {/* --- Step 2: Version Selection --- */}
      {currentStep === 2 && productVersions.length > 1 && (
        <div className="space-y-6 animate-in slide-in-from-right-8 duration-500">
           <div className="bg-white dark:bg-slate-800 p-8 rounded-[2.5rem] shadow-xl border border-slate-200 dark:border-slate-700">
            <div className="flex justify-between items-center mb-8 pb-6 border-b border-slate-100 dark:border-slate-700">
                <h2 className="text-2xl font-black text-slate-800 dark:text-white">เลือก Version เอกสาร</h2>
                <button onClick={() => { setCurrentStep(1); setFoundPromotion(null); }} className="text-sm font-bold text-slate-500 hover:bg-slate-100 px-4 py-2 rounded-xl transition-colors">ค้นหาใหม่</button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {productVersions.map((ver, idx) => (
                    <div key={idx} onClick={() => handleVersionSelect(ver)} className="group cursor-pointer border-2 border-slate-100 dark:border-slate-700 rounded-3xl p-6 hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-slate-700/50 transition-all hover:shadow-lg">
                        <div className="flex justify-between items-start mb-4">
                            <span className="bg-blue-100 text-blue-700 text-xs font-black px-3 py-1.5 rounded-lg">Ver. {ver.VERSION_NO}</span>
                            <span className="text-slate-400 text-xs font-mono">#{ver.RUNNING_NO}</span>
                        </div>
                        <div className="space-y-3 text-sm">
                             <div className="flex items-center gap-3 text-slate-700 dark:text-slate-200 font-bold"><FileSpreadsheet className="w-5 h-5 text-green-600"/><span className="font-medium">{ver.worksheet} / {ver.sheet}</span></div>
                             <div className="text-slate-500 text-xs font-medium">System: {ver.SYSTEM} | Coupon: {ver.COUPON || '-'}</div>
                        </div>
                    </div>
                ))}
            </div>
           </div>
        </div>
      )}

      {/* --- Step 3: Select Products --- */}
      {currentStep === 3 && (
        <div className="space-y-6 animate-in slide-in-from-right-8 duration-500">
           <div className="bg-white dark:bg-slate-800 p-8 rounded-[2.5rem] shadow-xl border border-slate-200 dark:border-slate-700 flex flex-col h-[75vh]">
              <div className="mb-6 pb-6 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center">
                  <div className="flex items-center gap-5">
                      <div className="p-4 bg-purple-100 dark:bg-purple-900/30 rounded-2xl"><ShoppingBag className="w-7 h-7 text-purple-600 dark:text-purple-400" /></div>
                      <div>
                          <h2 className="text-2xl font-black text-slate-800 dark:text-white">เลือกสินค้าที่มีปัญหา</h2>
                          <div className="flex gap-2 mt-1"><span className="text-xs font-bold bg-slate-100 dark:bg-slate-700 px-3 py-1 rounded-lg text-slate-600 dark:text-slate-300">Pro: {foundPromotion?.PRO_CODE}</span></div>
                      </div>
                  </div>
                  <div className="flex gap-3">
                    <button onClick={prevStep} className="px-5 py-3 border-2 border-slate-200 rounded-xl font-bold text-slate-600 hover:bg-slate-50 transition-colors">ย้อนกลับ</button>
                    <button onClick={nextStep} className="px-7 py-3 bg-purple-600 text-white rounded-xl font-bold shadow-lg shadow-purple-600/30 hover:bg-purple-700 transition-colors flex items-center gap-2">ระบุปัญหา <ChevronRight className="w-5 h-5"/></button>
                  </div>
              </div>
              <div className="flex items-center justify-between bg-slate-50 dark:bg-slate-900/50 p-3 rounded-2xl mb-4 border border-slate-100 dark:border-slate-700">
                  <button onClick={() => selectedItems.length === itemsList.length ? setSelectedItems([]) : setSelectedItems([...itemsList])} className="text-sm font-bold text-purple-600 px-4 py-2 hover:bg-purple-100 dark:hover:bg-purple-900/30 rounded-xl transition-colors">
                      {selectedItems.length === itemsList.length ? 'Deselect All' : 'Select All'}
                  </button>
                  <span className="text-xs font-medium text-slate-500 mr-4">Selected: <b className="text-purple-600 text-sm">{selectedItems.length}</b> / {itemsList.length}</span>
              </div>
              <div className="flex-1 overflow-hidden border border-slate-200 dark:border-slate-700 rounded-2xl relative">
                <div className="absolute inset-0 overflow-y-auto custom-scrollbar">
                    <table className="w-full text-sm text-left">
                    <thead className="bg-slate-50 dark:bg-slate-800 text-slate-500 uppercase text-xs sticky top-0 z-10 backdrop-blur-sm shadow-sm">
                        <tr><th className="px-6 py-4 text-center w-20 font-bold">Select</th><th className="px-6 py-4 font-bold">Code</th><th className="px-6 py-4 font-bold">Name</th><th className="px-6 py-4 font-bold">Price</th><th className="px-6 py-4 font-bold">Barcode</th></tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                        {itemsList.map((item, idx) => {
                            const isSelected = selectedItems.find(i => (i.PROD_ID || i.ENTITY_CODE) === (item.PROD_ID || item.ENTITY_CODE));
                            return (
                                <tr key={idx} onClick={() => {
                                    const id = item.PROD_ID || item.ENTITY_CODE;
                                    isSelected ? setSelectedItems(prev => prev.filter(i => (i.PROD_ID || i.ENTITY_CODE) !== id)) : setSelectedItems(prev => [...prev, item]);
                                }} className={`cursor-pointer transition-colors ${isSelected ? 'bg-purple-50 dark:bg-purple-900/20' : 'hover:bg-slate-50 dark:hover:bg-slate-800'}`}>
                                    <td className="px-6 py-4 text-center">{isSelected ? <CheckSquare className="w-6 h-6 text-purple-600 mx-auto fill-purple-100" /> : <Square className="w-6 h-6 text-slate-300 mx-auto" />}</td>
                                    <td className="px-6 py-4 font-mono font-bold text-slate-700 dark:text-slate-300">{item.ENTITY_CODE}</td>
                                    <td className="px-6 py-4 font-medium text-slate-600 dark:text-slate-400">{item.ENTITY_NAME}</td>
                                    <td className="px-6 py-4 text-slate-500">{item.PRICE}</td>
                                    <td className="px-6 py-4 font-mono text-slate-400">{item.BARCODE}</td>
                                </tr>
                            );
                        })}
                    </tbody>
                    </table>
                </div>
             </div>
           </div>
        </div>
      )}

      {/* --- Step 4: Input Issue --- */}
      {currentStep === 4 && (
        <div className="space-y-6 animate-in slide-in-from-right-8 duration-500">
          <div className="bg-white dark:bg-slate-800 p-8 rounded-[2.5rem] shadow-xl border border-slate-200 dark:border-slate-700 relative">
            <div className="flex justify-between items-center mb-8 pb-6 border-b border-slate-100 dark:border-slate-700">
                <div className="flex items-center gap-5">
                    <div className="p-4 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-2xl"><AlertCircle className="w-7 h-7" /></div>
                    <h2 className="text-2xl font-black text-slate-800 dark:text-white">ระบุรายละเอียด</h2>
                </div>
                <div className="flex gap-3">
                      <button onClick={() => setIsCopyModalOpen(true)} className="px-4 py-2 text-sm border-2 border-slate-200 rounded-xl font-bold text-slate-600 hover:bg-slate-50 flex items-center gap-2"><Copy className="w-4 h-4"/> Copy History</button>
                      <button onClick={prevStep} className="px-5 py-2 border-2 border-slate-200 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-50">Back</button>
                      <button onClick={nextStep} className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-sm font-bold shadow-lg shadow-red-600/30 flex items-center gap-2">
                        ถัดไป <ChevronRight className="w-4 h-4"/>
                      </button>
                </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="md:col-span-2">
                <label className="block text-sm font-black text-slate-700 dark:text-slate-300 mb-3 uppercase tracking-wide">ประเภทปัญหา *</label>
                <div className="flex flex-wrap gap-3">
                    {TYPE_OPTIONS.map(opt => (
                        <button key={opt.label} onClick={() => {
                             setIsAutoFormatEnabled(true);
                             setFormData(prev => ({ ...prev, types: prev.types.includes(opt.label) ? prev.types.filter(t => t !== opt.label) : [...prev.types, opt.label] }));
                        }} className={`px-5 py-3 rounded-2xl border-2 text-sm font-bold transition-all ${formData.types.includes(opt.label) ? 'bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-500/30' : 'bg-white text-slate-500 border-slate-200 hover:border-blue-300'}`}>
                            {opt.label}
                        </button>
                    ))}
                </div>
              </div>
              
              <div className="space-y-5">
                  <div>
                      <label className="block text-sm font-black text-slate-700 mb-2">MK Name (ผู้ดูแล) *</label>
                      <input type="text" list="mk-names" value={formData.user_mk} onChange={(e) => setFormData({...formData, user_mk: e.target.value})} className="w-full p-4 border-2 border-slate-200 rounded-2xl focus:border-blue-500 outline-none font-medium" placeholder="ระบุ MK" />
                      <datalist id="mk-names">{mkSuggestions.map((name, idx) => <option key={idx} value={name} />)}</datalist>
                  </div>
                  <div>
                    <label className="block text-sm font-black text-slate-700 mb-2">จำนวน (QTY) *</label>
                    <input type="number" value={formData.qty} onChange={(e) => setFormData({...formData, qty: e.target.value})} className="w-full p-4 border-2 border-slate-200 rounded-2xl focus:border-blue-500 outline-none font-medium" />
                  </div>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-black text-slate-700 mb-2">รายละเอียด (Detail) *</label>
                <textarea rows="3" value={formData.detail} onChange={(e) => { setIsAutoFormatEnabled(false); setFormData({...formData, detail: e.target.value}); }} className="w-full p-4 border-2 border-slate-200 rounded-2xl bg-slate-50 focus:bg-white focus:border-blue-500 outline-none font-medium text-slate-700" />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-black text-slate-700 mb-2">หมายเหตุ (Remark)</label>
                <textarea rows="2" value={formData.remark} onChange={(e) => setFormData({...formData, remark: e.target.value})} className="w-full p-4 border-2 border-slate-200 rounded-2xl focus:border-blue-500 outline-none font-medium" />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-black text-slate-700 mb-3">รูปภาพ ({formData.images.length}/10)</label>
                <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-4">
                    <div className="aspect-square">
                        <input type="file" id="file-upload" multiple accept="image/*" onChange={(e) => {
                             const files = Array.from(e.target.files);
                             const newImgs = files.slice(0, 10 - formData.images.length).map(f => ({ file: f, previewUrl: URL.createObjectURL(f) }));
                             setFormData({...formData, images: [...formData.images, ...newImgs]});
                        }} className="hidden" disabled={formData.images.length >= 10} />
                        <label htmlFor="file-upload" className="flex flex-col items-center justify-center w-full h-full border-2 border-dashed border-slate-300 rounded-2xl cursor-pointer hover:bg-blue-50 hover:border-blue-400 transition-all"><Upload className="w-8 h-8 text-blue-500 mb-2"/><span className="text-xs font-black text-blue-600 uppercase">Add Photo</span></label>
                    </div>
                    {formData.images.map((img, idx) => (
                        <div key={idx} className="relative group aspect-square rounded-2xl overflow-hidden border border-slate-200 shadow-sm"><img src={img.previewUrl} className="w-full h-full object-cover" alt="prev"/><button onClick={() => setFormData(prev => ({...prev, images: prev.images.filter((_, i) => i !== idx)}))} className="absolute top-2 right-2 bg-red-500 text-white p-1.5 rounded-full shadow-md hover:bg-red-600 transition-all"><X className="w-3 h-3"/></button></div>
                    ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* --- Step 5: Sub-Pro Selection (Conditional) --- */}
      {currentStep === 5 && (
        <div className="space-y-6 animate-in slide-in-from-right-8 duration-500">
            <div className="bg-white dark:bg-slate-800 p-8 rounded-[2.5rem] shadow-xl border border-slate-200 dark:border-slate-700">
                <div className="flex justify-between items-center mb-8 pb-6 border-b border-slate-100 dark:border-slate-700">
                    <div className="flex items-center gap-5">
                        <div className="p-4 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-2xl"><Link className="w-7 h-7"/></div>
                        <div>
                            <h2 className="text-2xl font-black text-slate-800 dark:text-white">เลือกโปรโมชั่นพ่วง (Sub-Pro)</h2>
                            <p className="text-sm font-medium text-slate-500">เลือกโปรโมชั่นที่ต้องการลิงก์ (ถ้ามี)</p>
                        </div>
                    </div>
                    <div className="flex gap-3">
                        <button onClick={prevStep} className="px-5 py-2 border-2 border-slate-200 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-50">Back</button>
                        <button onClick={nextStep} className="px-7 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-bold shadow-lg shadow-indigo-600/30 flex items-center gap-2">
                            ตรวจสอบ <ChevronRight className="w-4 h-4"/>
                        </button>
                    </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                    {subProList.map((item, idx) => {
                        const isSelected = selectedSubPros.find(sp => sp.PROMOTION_CODE === item.PROMOTION_CODE);
                        return (
                            <div key={idx} onClick={() => toggleSubPro(item)} 
                                className={`cursor-pointer border-2 rounded-3xl p-6 transition-all duration-300 ${isSelected ? 'bg-indigo-50 border-indigo-500 shadow-lg shadow-indigo-500/20' : 'border-slate-100 hover:border-indigo-300 hover:bg-slate-50'}`}
                            >
                                <div className="flex justify-between items-start mb-3">
                                    <span className={`px-3 py-1 rounded-lg text-xs font-black uppercase tracking-wider ${isSelected ? 'bg-indigo-200 text-indigo-800' : 'bg-slate-100 text-slate-500'}`}>{item.TYPE}</span>
                                    {isSelected ? <CheckSquare className="w-6 h-6 text-indigo-600"/> : <Square className="w-6 h-6 text-slate-300"/>}
                                </div>
                                <h3 className="font-mono font-black text-2xl text-slate-800 mb-1">{item.PROMOTION_CODE}</h3>
                                <p className="text-sm font-medium text-slate-600 mb-4 line-clamp-2 h-10">{item.NAME}</p>
                                <div className="pt-3 border-t border-dashed border-slate-200 text-xs font-mono font-bold text-slate-400 flex justify-between">
                                    <span>Code: {item.CODE}</span>
                                    <span>Price: {item.PRICE}</span>
                                </div>
                            </div>
                        )
                    })}
                </div>
            </div>
        </div>
      )}

      {/* --- Step 6: Confirm --- */}
      {currentStep === 6 && (
        <div className="space-y-6 animate-in slide-in-from-right-8 duration-500">
           <div className="bg-white dark:bg-slate-800 rounded-[2.5rem] shadow-xl overflow-hidden border border-slate-200 dark:border-slate-700">
              <div className="bg-white/50 dark:bg-slate-800/50 p-8 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center">
                  <h2 className="text-2xl font-black flex items-center gap-3 text-slate-800 dark:text-white"><CheckCircle2 className="w-8 h-8 text-green-500"/> ยืนยันข้อมูล</h2>
                  <div className="flex gap-4">
                      <button onClick={prevStep} disabled={isLoading} className="px-6 py-3 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-100 transition-colors">แก้ไขข้อมูล</button>
                      <button onClick={handleSubmit} disabled={isLoading} className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-xl shadow-lg shadow-green-600/30 font-bold flex items-center gap-2 transition-all active:scale-95">
                          {isLoading ? <Loader2 className="animate-spin w-5 h-5"/> : <Save className="w-5 h-5"/>} ยืนยันการบันทึก
                      </button>
                  </div>
              </div>

              <div className="p-10 space-y-10">
                 <section>
                    <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-5 border-b pb-2">1. ข้อมูล Promotion</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                        <InfoItem label="Code" value={foundPromotion.PRO_CODE} />
                        <InfoItem label="Name" value={foundPromotion.PRO_NAME} />
                        <InfoItem label="Version" value={selectedVersion?.VERSION_NO} />
                        <InfoItem label="Worksheet" value={selectedVersion?.worksheet} />
                    </div>
                 </section>
                 
                 <section>
                    <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-5 border-b pb-2">2. รายการสินค้า ({selectedItems.length})</h3>
                    <div className="bg-slate-50 dark:bg-slate-900/50 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 max-h-60 overflow-y-auto custom-scrollbar">
                        <ul className="space-y-3 text-sm text-slate-700 dark:text-slate-300">
                           {selectedItems.map((item, idx) => (
                               <li key={idx} className="flex gap-3 items-center">
                                   <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                                   <span className="font-mono font-bold text-blue-600 dark:text-blue-400">{item.ENTITY_CODE}</span>
                                   <span className="font-medium">{item.ENTITY_NAME}</span>
                               </li>
                           ))}
                        </ul>
                    </div>
                 </section>

                 <section>
                    <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-5 border-b pb-2">3. รายละเอียดปัญหา</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <DisplayField label="Type" value={formData.types.join(', ')} highlight />
                        <DisplayField label="MK Name" value={formData.user_mk} />
                        <div className="md:col-span-2"><DisplayField label="Detail" value={formData.detail} /></div>
                    </div>
                 </section>

                 {selectedSubPros.length > 0 && (
                     <section>
                        <h3 className="text-xs font-black text-indigo-400 uppercase tracking-widest mb-5 border-b pb-2">4. โปรโมชั่นพ่วง (Linked)</h3>
                        <div className="bg-indigo-50 dark:bg-indigo-900/20 p-6 rounded-2xl border border-indigo-100 dark:border-indigo-800">
                            <ul className="space-y-3">
                                {selectedSubPros.map((sp, idx) => (
                                    <li key={idx} className="flex items-center gap-3 text-sm text-indigo-900 dark:text-indigo-200">
                                        <div className="p-1.5 bg-indigo-200 dark:bg-indigo-800 rounded-md"><Link className="w-3 h-3"/></div>
                                        <span className="font-mono font-bold">{sp.PROMOTION_CODE}</span> 
                                        <span className="opacity-70">- {sp.NAME}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                     </section>
                 )}
              </div>
           </div>
        </div>
      )}
      
      <HistoryModal isOpen={isCopyModalOpen} onClose={() => setIsCopyModalOpen(false)} onSelect={handleCopySelect} />
    </div>
  );
}