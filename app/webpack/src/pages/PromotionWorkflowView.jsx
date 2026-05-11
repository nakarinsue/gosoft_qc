import React, { useState } from 'react';
import { 
  Search, ChevronRight, ChevronLeft, Upload, 
  CheckCircle, AlertCircle, Loader2, Package, Save 
} from 'lucide-react';
// นำเข้า apiService ตามมาตรฐาน (ปรับ Path ให้ตรงกับโครงสร้างของคุณ)
import apiService from '../services/apiservices'; 

const PromotionWorkflowView = () => {
  // ==========================================
  // 1. State Management (จัดการสถานะของหน้าจอ)
  // ==========================================
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // ข้อมูลจากการค้นหาและการเลือก
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [selectedPromoData, setSelectedPromoData] = useState(null); // เก็บ Object ก้อนใหญ่ (promotion, bucket_entities, etc.)
  const [selectedBuckets, setSelectedBuckets] = useState([]);
  
  // ข้อมูลฟอร์ม Defect
  const [defectForm, setDefectForm] = useState({
    types: [], // เก็บเป็น Array ตาม Payload สเปก
    title: '',
    description: '',
    remark: '',
    image: null // สำหรับ UI อัปโหลดรูป
  });

  // รหัสอ้างอิงเมื่อสร้างสำเร็จ
  const [successId, setSuccessId] = useState(null);

  const TYPE_OPTIONS = [
      { id: 1, label: 'Limit ในการทำงาน', Desc: 'DF ที่เกี่ยวกับ การจำกัดทั้งหมด เช่น จำกัดจำนวนครั้ง,จำนวนสินค้า, จำกัดยอดซื้อขั้นต่ำ' },
      { id: 2, label: 'รายการสินค้า', Desc: 'DF ที่เกี่ยวกับ รายการสินค้า เช่น ชื่อสินค้าผิดหรือ ราคาไม่ตรง, ไม่มีสินค้า' },
      { id: 3, label: 'เข้าโปรโมชั่นอื่น', Desc: 'DF ที่เกี่ยวกับ การเข้าโปรโมชั่นอื่น เช่น สินค้าอยู่ในโปรโมชั่นอื่น, โปรโมชั่นทับซ้อนกัน' },
      { id: 4, label: 'Pack Sale', Desc: 'DF ที่เกี่ยวกับ Pack Sale เช่น สินค้า Pack Sale ทำงานโปรโมชั่นอื่นทำงาน หรือ ทำงานได้ไม่ตามเงื่อนไข' },
      { id: 5, label: 'เงื่อนไข วัน เเละ เวลา', Desc: 'DF ที่เกี่ยวกับ เงื่อนไข วัน และ เวลา เช่น โปรโมชั่นไม่ทำงานตามวันและเวลาที่กำหนด' },
      { id: 6, label: 'การคำนวณส่วนลด', Desc: 'DF ที่เกี่ยวกับ การคำนวณส่วนลด เช่น ส่วนลดไม่ตรงตามเงื่อนไข, คำนวณส่วนลดผิดพลาด' },
      { id: 7, label: 'การบันทึกข้อมูล Database', Desc: 'DF ที่เกี่ยวกับ การบันทึกข้อมูลลง Database หรือ Textfile ผิดพลาด' },
      { id: 8, label: 'รายละเอียดเอกสาร', Desc: 'DF ที่เกี่ยวกับ รายละเอียดในเอกสาร ไม่ตรงกัน หรือ ไม่สอดคล้องกัน' },
      { id: 9, label: 'เงื่อนไขอื่นๆ', Desc: 'DF ที่เกี่ยวกับ เงื่อนไขอื่นๆ ที่ไม่ตรงกับข้ออื่น' }
  ];
  // ข้อมูล Mock สำหรับ Types (นำไปผูก API Master Data ได้ในอนาคต)
  // const TYPE_OPTIONS = [
  //   { id: 1, label: 'ปัญหาเงื่อนไขไม่ตรง' },
  //   { id: 2, label: 'ปัญหาสินค้าไม่ร่วมรายการ' },
  //   { id: 3, label: 'ส่วนลดไม่ถูกต้อง' }
  // ];

  // ==========================================
  // 2. API & Event Handlers (ฟังก์ชันจัดการการทำงาน)
  // ==========================================

  // Step 1: ค้นหา Promotion
  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    
    setIsLoading(true);
    setErrorMessage('');
    setSearchResults([]);

    try {
      // เรียก API ค้นหา
      const response = await apiService.defect.inquiry(searchQuery);

      const dataList = response?.data || [];

      if (dataList.length === 0) {
        setErrorMessage(response?.detail || 'ไม่พบข้อมูลโปรโมชัน');
      } else if (dataList.length === 1) {
        // กรณีเจอ 1 รายการ ข้ามไป Step 2 อัตโนมัติ
        setSelectedPromoData(dataList[0]);
        setCurrentStep(2);
      } else {
        // กรณีเจอมากกว่า 1 ให้แสดง List ใน Step 1
        setSearchResults(dataList);
      }
    } catch (error) {
      // จัดการ Error ตามที่ตกลงไว้
      const msg = response?.detail || "มีปัญหาในการเชื่อมต่อ";
      setErrorMessage(msg);
    } finally {
      setIsLoading(false);
    }
  };

  // Step 1: เลือก Promotion จาก List
  const handleSelectPromotion = (promoData) => {
    setSelectedPromoData(promoData);
    setCurrentStep(2);
  };

  // Step 2: เลือก Bucket Entities
  const handleToggleBucket = (bucketId) => {
    setSelectedBuckets(prev => 
      prev.includes(bucketId) 
        ? prev.filter(id => id !== bucketId) 
        : [...prev, bucketId]
    );
  };

  // Step 3: จัดการ Input Form
  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setDefectForm(prev => ({ ...prev, [name]: value }));
  };

  const handleTypeSelect = (e) => {
    // แปลงค่าที่เลือกเป็นตัวเลขและเก็บลง Array
    const options = Array.from(e.target.selectedOptions, option => Number(option.value));
    setDefectForm(prev => ({ ...prev, types: options }));
  };



  const handleTypeToggle = (typeId) => {
    setDefectForm(prev => {
      // 1. อัปเดตรายการ Types ที่เลือก
      const newTypes = prev.types.includes(typeId)
        ? prev.types.filter(id => id !== typeId)
        : [...prev.types, typeId];

      let newTitle = prev.title;
      let newDescription = prev.description;

      // 2. ถ้ามีการเลือก Types ให้ทำการ Auto-generate ข้อความ
      if (newTypes.length > 0) {
        // หา Type ID ที่น้อยที่สุด สำหรับ Title
        const minTypeId = Math.min(...newTypes);
        const minTypeLabel = TYPE_OPTIONS.find(t => t.id === minTypeId)?.label || '';
        
        if (newTypes.length > 1) {
          newTitle = `${minTypeLabel} เเละอื่นๆอีก ${newTypes.length - 1} รายการ`;
        } else {
          newTitle = minTypeLabel;
        }

        // จัดเตรียมตัวแปรสำหรับ Description
        const proCode = selectedPromoData?.promotion?.pro_code || '';
        const proName = selectedPromoData?.promotion?.pro_name || '';
        const entityCodes = selectedBuckets.length > 0 ? selectedBuckets.join(', ') : 'ไม่ระบุสินค้า';
        const selectedTypeLabels = newTypes
          .map(id => TYPE_OPTIONS.find(t => t.id === id)?.label)
          .filter(Boolean)
          .join(', ');

        newDescription = `Promotion Code ${proCode} ${proName} พบว่า เมื่อทำรายการ ${entityCodes} พบว่า ${selectedTypeLabels}. ทำงานไม่ตรงเอกสาร`;
      } else {
        // ถ้าเอาติ๊กออกหมด ให้เคลียร์ค่าที่เคย Auto-generate
        newTitle = '';
        newDescription = '';
      }

      return {
        ...prev,
        types: newTypes,
        title: newTitle,
        description: newDescription
      };
    });
  };
  // Step 4: ยืนยันการสร้าง Defect
  const handleSubmitDefect = async () => {
    setIsLoading(true);
    setErrorMessage('');

    try {
      const payload = {
        pro_id: selectedPromoData.promotion.id,
        types: defectForm.types,
        title: defectForm.title,
        status: 0, // ค่าเริ่มต้นตามสเปก
        description: defectForm.description,
        remark: defectForm.remark
      };

      const response = await  apiService.defect.create(payload);
      
      // สมมติว่า API คืนค่า { id: 123, message: "..." }
      if (response.message && response.defect_id) {
        setSuccessId(response.defect_id);
        setCurrentStep(5);
      } else {
        throw new Error("ไม่ได้รับรหัสอ้างอิงจากระบบ");
      }
    } catch (error) {
      const msg = error.response?.data?.message || "เกิดข้อผิดพลาดในการบันทึกข้อมูล";
      setErrorMessage(msg);
    } finally {
      setIsLoading(false);
    }
  };

  // ==========================================
  // 3. Render Steps (แยกการแสดงผลแต่ละหน้าจอ)
  // ==========================================

const renderStep1 = () => (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-gray-800">ค้นหาโปรโมชันเพื่อแจ้งปัญหา</h2>
        {/* <p className="text-sm text-gray-500">กรอกรหัส หรือ ชื่อโปรโมชันที่พบปัญหา</p> */}
      </div>

      <div className="flex gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input 
            type="text" 
            placeholder="รหัส หรือ ชื่อโปรโมชัน..."
            className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          />
        </div>
        <button 
          onClick={handleSearch}
          disabled={isLoading || !searchQuery}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 flex items-center gap-2"
        >
          {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'ค้นหา'}
        </button>
      </div>

      {errorMessage && (
        <div className="p-4 bg-red-50 text-red-600 border border-red-200 rounded-lg flex items-center gap-2">
          <AlertCircle className="w-5 h-5" />
          {errorMessage}
        </div>
      )}

      {searchResults.length > 0 && (
        <div className="mt-6">
          <h3 className="font-semibold text-gray-700 mb-3">พบ {searchResults.length} รายการ - กรุณาเลือก:</h3>
          <div className="space-y-3">
            {searchResults.map((item, idx) => (
              <div 
                key={idx} 
                className="p-4 border rounded-lg hover:border-blue-500 hover:bg-blue-50 cursor-pointer transition-colors"
                onClick={() => handleSelectPromotion(item)}
              >
                <div className="flex justify-between items-center">
                  <div>
                    <span className="font-bold text-blue-700">[{item.import_file.description}]</span>
                    <span className="ml-2 font-medium text-gray-800">{item.version_control.title} {item.version_control.sub_title} </span>
                    <p className="text-sm text-gray-500 mt-1">Sheet  : {item.file_master.sheet}</p>
                    <p className="text-sm text-gray-500 mt-1">file : {item.file_master.file_name}</p>

                  </div>
                  <ChevronRight className="text-gray-400 w-5 h-5" />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6">
      <div className="flex items-center gap-2 mb-4">
        <button onClick={() => setCurrentStep(1)} className="p-2 hover:bg-gray-100 rounded-full text-gray-500">
          <ChevronLeft className="w-5 h-5" />
        </button>
        <div>
          <h2 className="text-xl font-bold text-gray-800">เลือกสินค้า/เงื่อนไข (Bucket) ที่พบปัญหา</h2>
          <p className="text-sm text-gray-500">โปรโมชัน: {selectedPromoData?.promotion?.pro_name}</p>
        </div>
      </div>

      <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
        {selectedPromoData?.bucket_entities?.map((bucket, idx) => (
          <label key={idx} className="flex items-start gap-3 p-4 border rounded-lg cursor-pointer hover:bg-gray-50">
            <input 
              type="checkbox" 
              className="mt-1 w-5 h-5 text-blue-600 rounded"
              checked={selectedBuckets.includes(bucket.entity_code)}
              onChange={() => handleToggleBucket(bucket.entity_code)}
            />
            <div>
              <p className="font-semibold text-gray-800"> {bucket.entity_code}  :  {bucket.entity_name}</p>
              <p className="text-sm text-gray-500">
                mode: {bucket.mode} | Type: {bucket.entity_type} | barcode: {bucket.barcode}
              </p>
            </div>
          </label>
        ))}
      </div>

      <div className="flex justify-end pt-4">
        <button 
          onClick={() => setCurrentStep(3)}
          disabled={selectedBuckets.length === 0}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 flex items-center gap-2"
        >
          ถัดไป <ChevronRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-6">
      <div className="flex items-center gap-2 mb-4">
        <button onClick={() => setCurrentStep(2)} className="p-2 hover:bg-gray-100 rounded-full text-gray-500">
          <ChevronLeft className="w-5 h-5" />
        </button>
        <h2 className="text-xl font-bold text-gray-800">ระบุรายละเอียดปัญหา</h2>
      </div>

      <div className="space-y-5 bg-white p-6 rounded-xl border">
        
        {/* ประเภทปัญหา ปรับเป็น Checkbox แบบ Grid */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">ประเภทปัญหา (Types) *</label>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {TYPE_OPTIONS.map(opt => (
              <label 
                key={opt.id} 
                className={`flex items-center gap-3 p-3 border rounded-lg cursor-pointer transition-all ${
                  defectForm.types.includes(opt.id) 
                    ? 'border-blue-500 bg-blue-50 ring-1 ring-blue-500' 
                    : 'hover:bg-gray-50 border-gray-200'
                }`}
              >
                <input 
                  type="checkbox"
                  className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500 cursor-pointer"
                  checked={defectForm.types.includes(opt.id)}
                  onChange={() => handleTypeToggle(opt.id)}
                />
                <span className="text-sm font-medium text-gray-800">{opt.label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* หัวข้อ (Auto-filled แต่แก้ได้) */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">หัวข้อปัญหา (Title) *</label>
          <input 
            type="text" name="title" value={defectForm.title} onChange={handleFormChange}
            className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-blue-500 bg-gray-50 focus:bg-white transition-colors"
            placeholder="ระบบจะสร้างให้อัตโนมัติ หรือระบุด้วยตนเอง..."
            required
          />
        </div>

        {/* รายละเอียด (Auto-filled แต่แก้ได้) */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">รายละเอียด (Description) *</label>
          <textarea 
            name="description" value={defectForm.description} onChange={handleFormChange} rows={4}
            className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-blue-500 bg-gray-50 focus:bg-white transition-colors"
            placeholder="ระบบจะสร้างให้อัตโนมัติ หรือระบุด้วยตนเอง..."
            required
          />
        </div>

        {/* หมายเหตุ */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">หมายเหตุ (Remark)</label>
          <input 
            type="text" name="remark" value={defectForm.remark} onChange={handleFormChange}
            className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* อัปโหลดรูป */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">รูปภาพประกอบ (ถ้ามี)</label>
          <div className="border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center text-gray-500 hover:bg-gray-50 cursor-pointer transition-colors">
            <Upload className="w-8 h-8 mb-2 text-gray-400" />
            <span className="text-sm">คลิกเพื่ออัปโหลดไฟล์ภาพ</span>
          </div>
        </div>
      </div>

      <div className="flex justify-end pt-4">
        <button 
          onClick={() => setCurrentStep(4)}
          disabled={!defectForm.title || !defectForm.description || defectForm.types.length === 0}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 flex items-center gap-2"
        >
          ตรวจสอบข้อมูล <ChevronRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );

  const renderStep4 = () => (
    <div className="space-y-6">
      <div className="flex items-center gap-2 mb-4">
        <button onClick={() => setCurrentStep(3)} className="p-2 hover:bg-gray-100 rounded-full text-gray-500">
          <ChevronLeft className="w-5 h-5" />
        </button>
        <h2 className="text-xl font-bold text-gray-800">ตรวจสอบความถูกต้องก่อนยืนยัน</h2>
      </div>

      <div className="bg-gray-50 p-6 rounded-xl border space-y-6 text-sm">
        <div>
          <h3 className="font-bold text-blue-800 border-b pb-2 mb-3 flex items-center gap-2"><Package className="w-4 h-4"/> ข้อมูลโปรโมชัน</h3>
          <div className="grid grid-cols-2 gap-2 text-gray-700">
            <p><span className="font-medium">รหัสโปรโมชัน:</span> {selectedPromoData?.promotion?.pro_code}</p>
            <p><span className="font-medium">ชื่อโปรโมชัน:</span> {selectedPromoData?.promotion?.pro_name}</p>
            <p><span className="font-medium">วันที่เริ่ม:</span> {selectedPromoData?.promotion?.start_date}</p>
            <p><span className="font-medium">ไฟล์นำเข้า:</span> {selectedPromoData?.file_master?.file_name || '-'}</p>
          </div>
        </div>

        <div>
          <h3 className="font-bold text-blue-800 border-b pb-2 mb-3">รายการสินค้า/เงื่อนไข ที่พบปัญหา</h3>
          <ul className="list-disc pl-5 text-gray-700 space-y-1">
            {selectedPromoData?.bucket_entities
              ?.filter(b => selectedBuckets.includes(b.entity_code))
              .map((b, idx) => <li key={idx}>[{b.entity_code}] {b.condition_name || b.entity_name}</li>)
            }
          </ul>
        </div>

        <div>
          <h3 className="font-bold text-blue-800 border-b pb-2 mb-3">รายละเอียดการแจ้งปัญหา</h3>
          <div className="space-y-2 text-gray-700">
            <p><span className="font-medium text-gray-900 block mb-1">ประเภทปัญหา:</span> 
              {TYPE_OPTIONS.filter(t => defectForm.types.includes(t.id)).map(t => t.label).join(', ')}
            </p>
            <p><span className="font-medium text-gray-900 block mb-1">หัวข้อ:</span> {defectForm.title}</p>
            <p><span className="font-medium text-gray-900 block mb-1">รายละเอียด:</span> {defectForm.description}</p>
            <p><span className="font-medium text-gray-900 block mb-1">หมายเหตุ:</span> {defectForm.remark || '-'}</p>
          </div>
        </div>
      </div>

      {errorMessage && (
        <div className="p-4 bg-red-50 text-red-600 border border-red-200 rounded-lg flex items-center gap-2">
          <AlertCircle className="w-5 h-5" />
          {errorMessage}
        </div>
      )}

      <div className="flex justify-end pt-4">
        <button 
          onClick={handleSubmitDefect}
          disabled={isLoading}
          className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 flex items-center gap-2 shadow-lg"
        >
          {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
          ยืนยันการบันทึก
        </button>
      </div>
    </div>
  );

  const renderStep5 = () => (
    <div className="flex flex-col items-center justify-center py-12 text-center space-y-6">
      <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
        <CheckCircle className="w-12 h-12 text-green-600" />
      </div>
      <div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">บันทึกข้อมูลปัญหาสำเร็จ!</h2>
        <p className="text-gray-500">รหัสอ้างอิงการแจ้งปัญหาของคุณคือ</p>
        <p className="text-3xl font-mono font-bold text-blue-600 mt-2">#{successId}</p>
      </div>
      
      <button 
        onClick={() => {
          setCurrentStep(1);
          setSearchQuery('');
          setSelectedPromoData(null);
          setSelectedBuckets([]);
          setDefectForm({ types: [], title: '', description: '', remark: '', image: null });
        }}
        className="mt-6 px-6 py-2 border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 transition-colors"
      >
        กลับสู่หน้าค้นหา
      </button>
    </div>
  );

  return (
    // เปลี่ยนความกว้างจาก max-w-4xl เป็น max-w-6xl เพื่อขยายพื้นที่ด้านข้าง
    <div className="max-w-6xl mx-auto p-6">
      {currentStep < 5 && (
        <div className="mb-8 border-b pb-4">
          <div className="flex items-center gap-2 text-sm">
            <span className={`font-medium ${currentStep >= 1 ? 'text-blue-600' : 'text-gray-400'}`}>1. ค้นหาโปรโมชัน</span>
            <ChevronRight className="w-4 h-4 text-gray-300" />
            <span className={`font-medium ${currentStep >= 2 ? 'text-blue-600' : 'text-gray-400'}`}>2. เลือกสินค้า</span>
            <ChevronRight className="w-4 h-4 text-gray-300" />
            <span className={`font-medium ${currentStep >= 3 ? 'text-blue-600' : 'text-gray-400'}`}>3. กรอกรายละเอียด</span>
            <ChevronRight className="w-4 h-4 text-gray-300" />
            <span className={`font-medium ${currentStep >= 4 ? 'text-blue-600' : 'text-gray-400'}`}>4. ยืนยัน</span>
          </div>
        </div>
      )}

      <div className="bg-white rounded-2xl shadow-sm border p-6">
        {currentStep === 1 && renderStep1()}
        {currentStep === 2 && renderStep2()}
        {currentStep === 3 && renderStep3()}
        {currentStep === 4 && renderStep4()}
        {currentStep === 5 && renderStep5()}
      </div>
    </div>
  );
};

export default PromotionWorkflowView;