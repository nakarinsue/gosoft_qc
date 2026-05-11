import React, { useState } from 'react';
import { 
  Search, ChevronRight, ChevronLeft, Upload, 
  CheckCircle, AlertCircle, Loader2, Package, Save,
  Database, Tag, Layers, Settings2, Info, FileText,
  AlertTriangle, CheckCircle2, Ticket, X
} from 'lucide-react';
import { cn } from '../cn'; 
import apiService from '../services/apiServices'; 

const PromotionWorkflowView = () => {
  // ==========================================
  // 1. State Management
  // ==========================================
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [selectedPromoData, setSelectedPromoData] = useState(null);
  const [selectedBuckets, setSelectedBuckets] = useState([]);
  const [successId, setSuccessId] = useState(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  
  const [defectForm, setDefectForm] = useState({
    types: [],
    title: '',
    description: '',
    remark: '',
    image: null
  });

  const TYPE_OPTIONS = [
      { id: 1, label: 'Limit ในการทำงาน' },
      { id: 2, label: 'รายการสินค้า' },
      { id: 3, label: 'เข้าโปรโมชั่นอื่น' },
      { id: 4, label: 'Pack Sale' },
      { id: 5, label: 'เงื่อนไข วัน เเละ เวลา' },
      { id: 6, label: 'การคำนวณส่วนลด' },
      { id: 7, label: 'การบันทึกข้อมูล Database' },
      { id: 8, label: 'รายละเอียดเอกสาร' },
      { id: 9, label: 'เงื่อนไขอื่นๆ' }
  ];

  // ==========================================
  // 2. Handlers
  // ==========================================

  const resetToHome = () => {
    setCurrentStep(1);
    setSearchQuery('');
    setSearchResults([]);
    setSelectedPromoData(null);
    setSelectedBuckets([]);
    setDefectForm({ types: [], title: '', description: '', remark: '', image: null });
    setShowSuccessModal(false);
    setSuccessId(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectPromotion = (item) => {
    setSelectedPromoData(item);
    setSelectedBuckets([]);
    setCurrentStep(2);
    setSearchResults([]);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    setIsLoading(true);
    setErrorMessage('');
    try {
      const response = await apiService.defect.inquiry(searchQuery);
      const dataList = response?.data || [];
      if (dataList.length === 0) {
        setErrorMessage(response?.detail || 'ไม่พบข้อมูลโปรโมชัน');
        setSearchResults([]);
      } else if (dataList.length === 1) {
        handleSelectPromotion(dataList[0]);
      } else {
        setSearchResults(dataList);
      }
    } catch (error) {
      setErrorMessage("มีปัญหาในการเชื่อมต่อกับเซิร์ฟเวอร์");
    } finally {
      setIsLoading(false);
    }
  };

  const handleTypeToggle = (typeId) => {
    setDefectForm(prev => {
      const newTypes = prev.types.includes(typeId)
        ? prev.types.filter(id => id !== typeId)
        : [...prev.types, typeId];

      let newTitle = '';
      let newDescription = '';

      if (newTypes.length > 0) {
        const minTypeId = Math.min(...newTypes);
        const minTypeLabel = TYPE_OPTIONS.find(t => t.id === minTypeId)?.label || '';
        newTitle = newTypes.length > 1 ? `${minTypeLabel} เเละอื่นๆอีก ${newTypes.length - 1} รายการ` : minTypeLabel;

        const proCode = selectedPromoData?.promotion?.pro_code || '';
        const proName = selectedPromoData?.promotion?.pro_name || '';
        const entityCodes = selectedBuckets.length > 0 ? selectedBuckets.join(', ') : 'ไม่ระบุสินค้า';
        const selectedTypeLabels = newTypes.map(id => TYPE_OPTIONS.find(t => t.id === id)?.label).join(', ');

        newDescription = `Promotion Code ${proCode} ${proName} พบว่า เมื่อทำรายการ ${entityCodes} พบว่า ${selectedTypeLabels}. ทำงานไม่ตรงเอกสาร`;
      }
      return { ...prev, types: newTypes, title: newTitle, description: newDescription };
    });
  };

  const handleSubmitDefect = async () => {
    setIsLoading(true);
    try {
      const payload = {
        pro_id: selectedPromoData.promotion.id,
        types: defectForm.types,
        title: defectForm.title,
        status: 0,
        description: defectForm.description,
        remark: defectForm.remark
      };
      const response = await apiService.defect.create(payload);
      if (response.defect_id) {
        setSuccessId(response.defect_id);
        setShowSuccessModal(true); // 📍 เปิด Pop-up แทนการเปลี่ยน Step
      }
    } catch (error) {
      setErrorMessage("เกิดข้อผิดพลาดในการบันทึกข้อมูล");
    } finally {
      setIsLoading(false);
    }
  };

  // ==========================================
  // 3. UI Components
  // ==========================================

  // 📍 Success Pop-up Modal
  const SuccessModal = () => {
    if (!showSuccessModal) return null;
    return (
      <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 backdrop-blur-xl bg-slate-900/60 animate-in fade-in duration-300">
        <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-[3.5rem] shadow-2xl p-10 text-center animate-in zoom-in-95 duration-300 border border-white dark:border-slate-800">
          <div className="w-24 h-24 bg-emerald-100 dark:bg-emerald-900/30 rounded-[2.5rem] flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="text-emerald-500" size={56} />
          </div>
          <h2 className="text-3xl font-black text-slate-800 dark:text-white mb-2 tracking-tight">บันทึกสำเร็จ!</h2>
          <p className="text-slate-500 font-bold mb-8">ข้อมูลของคุณถูกส่งเข้าระบบเรียบร้อยแล้ว</p>
          
          <div className="bg-slate-50 dark:bg-slate-800/50 p-6 rounded-[2rem] border border-slate-100 dark:border-slate-700 mb-8">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Reference ID</p>
            <p className="text-4xl font-black text-blue-600 tracking-tighter">#{successId}</p>
          </div>

          <button 
            onClick={resetToHome}
            className="w-full bg-slate-900 hover:bg-slate-800 text-white py-5 rounded-[2rem] font-black tracking-widest shadow-xl transition-all active:scale-95"
          >
            กลับสู่หน้าหลัก
          </button>
        </div>
      </div>
    );
  };

  const StepIndicator = () => (
    <div className="sticky top-0 z-30 bg-slate-50/90 dark:bg-slate-950/90 backdrop-blur-md pt-6 pb-6">
      <div className="flex items-center justify-center gap-4 max-w-[1200px] mx-auto px-4">
        {[1, 2, 3, 4].map(step => (
          <React.Fragment key={step}>
            <div className="flex items-center gap-2">
              <div className={cn(
                "w-10 h-10 rounded-2xl flex items-center justify-center font-black transition-all shadow-lg",
                currentStep === step ? "bg-blue-600 text-white scale-110 shadow-blue-500/40" : 
                currentStep > step ? "bg-emerald-500 text-white" : "bg-white dark:bg-slate-800 text-slate-400 border border-slate-200 dark:border-slate-700"
              )}>
                {currentStep > step ? <CheckCircle2 size={20} /> : step}
              </div>
              <span className={cn(
                "text-[10px] font-black uppercase tracking-widest hidden sm:block",
                currentStep === step ? "text-blue-600" : "text-slate-400"
              )}>
                {step === 1 ? "Search" : step === 2 ? "Bucket" : step === 3 ? "Detail" : "Confirm"}
              </span>
            </div>
            {step < 4 && <div className="w-10 h-[2px] bg-slate-200 dark:bg-slate-800" />}
          </React.Fragment>
        ))}
      </div>
    </div>
  );

  return (
    <div className="h-screen w-full bg-slate-50 dark:bg-slate-950 overflow-y-auto custom-scrollbar flex flex-col font-sans">
      <StepIndicator />
      
      <main className="flex-1 max-w-[1200px] w-full mx-auto px-4 pb-24 pt-4">
        <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-2xl rounded-[3.5rem] border border-white dark:border-slate-800 p-8 md:p-12 shadow-2xl transition-all duration-500">
          
          {/* STEP 1: SEARCH */}
          {currentStep === 1 && (
            <div className="space-y-10 animate-in fade-in zoom-in-95 duration-500">
              <div className="text-center space-y-3">
                <h2 className="text-4xl font-black text-slate-800 dark:text-white tracking-tight">แจ้งปัญหาโปรโมชัน</h2>
                <p className="text-slate-500 font-medium">ระบุรหัสโปรโมชันหรือชื่อเพื่อเริ่มการวิเคราะห์ปัญหา</p>
              </div>
              <div className="max-w-3xl mx-auto bg-white dark:bg-slate-800 p-3 rounded-[2.5rem] shadow-2xl border border-slate-100 dark:border-slate-700 flex items-center">
                <div className="flex-1 flex items-center px-6">
                  <Search className="text-blue-500" size={24} />
                  <input 
                    type="text" 
                    placeholder="ค้นหา Promotion..."
                    className="w-full bg-transparent border-none outline-none px-4 py-4 text-xl font-bold dark:text-white"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                  />
                </div>
                <button onClick={handleSearch} className="bg-blue-600 text-white px-10 py-4 rounded-[2rem] font-black tracking-widest shadow-lg active:scale-95 transition-all">SEARCH</button>
              </div>
              
              <div className="grid gap-4 max-w-2xl mx-auto">
                {searchResults.map((item, idx) => (
                  <div key={idx} onClick={() => handleSelectPromotion(item)} className="p-6 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-[2rem] hover:border-blue-500 cursor-pointer transition-all flex justify-between items-center group shadow-sm">
                    <div className="flex items-center gap-4">
                      <div className="p-4 bg-blue-50 dark:bg-blue-900/20 text-blue-600 rounded-2xl group-hover:bg-blue-600 group-hover:text-white transition-colors"><FileText size={24}/></div>
                      <div>
                        <p className="text-xs font-black text-blue-600 uppercase tracking-widest">{item.promotion.pro_code}</p>
                        <h4 className="text-lg font-black text-slate-800 dark:text-white">{item.promotion.pro_name}</h4>
                      </div>
                    </div>
                    <ChevronRight size={24} className="text-slate-300 group-hover:text-blue-500 transition-transform group-hover:translate-x-2" />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* STEP 2: BUCKET */}
          {currentStep === 2 && (
            <div className="space-y-8 animate-in fade-in slide-in-from-right-8 duration-500">
               <h2 className="text-3xl font-black text-slate-800 dark:text-white">เลือกสินค้าที่พบปัญหา</h2>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {selectedPromoData?.bucket_entities?.map((b, i) => (
                    <label key={i} className={cn(
                      "p-6 rounded-[2.5rem] border-2 cursor-pointer transition-all flex items-start gap-4 group",
                      selectedBuckets.includes(b.entity_code) ? "border-blue-600 bg-blue-50 dark:bg-blue-900/20" : "border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900"
                    )}>
                       <input type="checkbox" className="hidden" checked={selectedBuckets.includes(b.entity_code)} onChange={() => {
                          const code = b.entity_code;
                          setSelectedBuckets(prev => prev.includes(code) ? prev.filter(c => c !== code) : [...prev, code]);
                       }} />
                       <div className={cn("w-6 h-6 rounded-lg border-2 flex items-center justify-center mt-1", selectedBuckets.includes(b.entity_code) ? "bg-blue-600 border-blue-600 text-white" : "border-slate-300")}>
                          {selectedBuckets.includes(b.entity_code) && <CheckCircle2 size={14}/>}
                       </div>
                       <div>
                          <p className="font-black text-slate-800 dark:text-white">{b.entity_name}</p>
                          <p className="text-[10px] font-black text-slate-400 mt-1 uppercase">CODE: {b.entity_code} | TYPE: {b.entity_type}</p>
                       </div>
                    </label>
                  ))}
               </div>
               <div className="flex justify-between pt-8 border-t border-slate-100 dark:border-slate-800">
                  <button onClick={() => setCurrentStep(1)} className="px-8 py-4 font-black text-slate-400 hover:text-slate-600">ย้อนกลับ</button>
                  <button onClick={() => { window.scrollTo({top:0, behavior:'smooth'}); setCurrentStep(3); }} disabled={selectedBuckets.length === 0} className="bg-blue-600 text-white px-12 py-4 rounded-[2rem] font-black shadow-xl shadow-blue-600/30">ถัดไป</button>
               </div>
            </div>
          )}

          {/* STEP 3: DETAIL */}
          {currentStep === 3 && (
            <div className="space-y-10 animate-in fade-in slide-in-from-right-8 duration-500">
               <h2 className="text-3xl font-black text-slate-800 dark:text-white">ระบุรายละเอียดปัญหา</h2>
               <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  <div className="space-y-4">
                     <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 px-2"><Settings2 size={16}/> ประเภทปัญหา *</h3>
                     <div className="grid gap-2">
                        {TYPE_OPTIONS.map(opt => (
                          <label key={opt.id} className={cn(
                            "p-4 rounded-2xl border transition-all cursor-pointer flex items-center gap-3",
                            defectForm.types.includes(opt.id) ? "border-indigo-600 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700" : "bg-white dark:bg-slate-900 text-slate-500"
                          )}>
                             <input type="checkbox" className="hidden" checked={defectForm.types.includes(opt.id)} onChange={() => handleTypeToggle(opt.id)} />
                             <div className={cn("w-5 h-5 rounded-md border-2", defectForm.types.includes(opt.id) ? "bg-indigo-600 border-indigo-600" : "border-slate-300")} />
                             <span className="text-sm font-bold">{opt.label}</span>
                          </label>
                        ))}
                     </div>
                  </div>
                  <div className="lg:col-span-2 space-y-6 bg-slate-50 dark:bg-slate-950 p-8 rounded-[3rem] border border-slate-100 dark:border-slate-800">
                     <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase ml-4">หัวข้อปัญหา (Title)</label>
                        <input value={defectForm.title} onChange={e => setDefectForm({...defectForm, title: e.target.value})} className="w-full p-5 bg-white dark:bg-slate-800 rounded-3xl border-none font-bold text-slate-700 dark:text-white shadow-sm" />
                     </div>
                     <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase ml-4">รายละเอียด (Description)</label>
                        <textarea value={defectForm.description} onChange={e => setDefectForm({...defectForm, description: e.target.value})} rows={6} className="w-full p-5 bg-white dark:bg-slate-800 rounded-[2.5rem] border-none font-bold text-slate-700 dark:text-white shadow-sm" />
                     </div>
                  </div>
               </div>
               <div className="flex justify-between pt-8 border-t border-slate-100 dark:border-slate-800">
                  <button onClick={() => setCurrentStep(2)} className="px-8 py-4 font-black text-slate-400">ย้อนกลับ</button>
                  <button onClick={() => { window.scrollTo({top:0, behavior:'smooth'}); setCurrentStep(4); }} disabled={defectForm.types.length === 0} className="bg-indigo-600 text-white px-12 py-4 rounded-[2rem] font-black shadow-xl">ตรวจสอบข้อมูล</button>
               </div>
            </div>
          )}

          {/* STEP 4: CONFIRM */}
          {currentStep === 4 && (
            <div className="space-y-10 animate-in fade-in zoom-in-95 duration-500">
               <h2 className="text-3xl font-black text-slate-800 dark:text-white">ยืนยันข้อมูล Defect</h2>
               <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <div className="space-y-6">
                    <div className="bg-blue-50 dark:bg-blue-900/10 p-8 rounded-[3rem] border border-blue-100 dark:border-blue-800/30">
                       <h3 className="text-xs font-black text-blue-600 uppercase mb-4 flex items-center gap-2"><Database size={16}/> Promotion Info</h3>
                       <p className="text-xl font-black text-slate-800 dark:text-white">{selectedPromoData?.promotion?.pro_name}</p>
                       <p className="text-xs font-bold text-slate-400 mt-1">CODE: {selectedPromoData?.promotion?.pro_code}</p>
                    </div>
                    <div className="bg-slate-50 dark:bg-slate-800 p-8 rounded-[3rem] border border-slate-100 dark:border-slate-700">
                       <h3 className="text-xs font-black text-slate-400 uppercase mb-4 flex items-center gap-2"><Package size={16}/> Affected Buckets</h3>
                       <div className="flex flex-wrap gap-2">
                          {selectedBuckets.map(code => (
                            <span key={code} className="bg-white dark:bg-slate-900 px-3 py-1.5 rounded-xl text-xs font-black text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">#{code}</span>
                          ))}
                       </div>
                    </div>
                  </div>
                  <div className="bg-slate-900 text-white p-10 rounded-[3.5rem] shadow-2xl relative overflow-hidden">
                     <AlertTriangle className="absolute right-[-30px] top-[-30px] text-white/5" size={180} />
                     <div className="relative z-10 space-y-6">
                        <div className="space-y-1">
                          <p className="text-[10px] font-black text-slate-500 uppercase">Title</p>
                          <p className="text-xl font-black">{defectForm.title}</p>
                        </div>
                        <div className="space-y-1">
                          <p className="text-[10px] font-black text-slate-500 uppercase">Description</p>
                          <p className="text-sm text-slate-300 leading-relaxed italic">"{defectForm.description}"</p>
                        </div>
                        <button onClick={handleSubmitDefect} disabled={isLoading} className="w-full bg-emerald-500 hover:bg-emerald-600 text-white py-5 rounded-[2rem] font-black text-lg shadow-2xl shadow-emerald-500/40 transition-all active:scale-95 flex items-center justify-center gap-3 mt-4">
                           {isLoading ? <Loader2 className="animate-spin" /> : <Save />} ยืนยันและบันทึก
                        </button>
                     </div>
                  </div>
               </div>
            </div>
          )}
        </div>
      </main>

      {/* 📍 เรียกใช้ Success Modal */}
      <SuccessModal />
    </div>
  );
};

export default PromotionWorkflowView;