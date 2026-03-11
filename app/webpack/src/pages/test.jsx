import React, { useState, useEffect, useMemo } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer 
} from 'recharts';
import { 
  Search, Moon, Sun, LayoutDashboard, Table as TableIcon, 
  BarChart3, RefreshCw, AlertCircle, FileText, Activity,
  Users, Layers, X, FolderOpen, CreditCard, ChevronRight,
  Filter, Eraser, CheckCircle
} from 'lucide-react';
import { API_BASE_URL } from '../config';

// --- 1. Constants & Utility Functions ---

const API_ENDPOINT = '/dashboard/export';

const formatCurrency = (amount) => {
  if (amount === undefined || amount === null) return '0.00';
  return new Intl.NumberFormat('th-TH', {
    style: 'decimal',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
};

// --- 2. Sub-Components (Modals) ---

/**
 * AdvancedSearchModal: Popup ค้นหาละเอียด 13 ช่อง
 */
const AdvancedSearchModal = ({ isOpen, onClose, onSearch }) => {
  // State สำหรับเก็บค่า Input ทั้ง 13 ช่อง
  const [criteria, setCriteria] = useState({
    clientName: '',
    clientId: '',
    serviceId: '',
    serviceName: '',
    billType: '',       // การคิดค่าบริการ
    paymentType: '',    // ประเภทการชำระ
    minAmount: '',      // ยอดเงินรับ Min
    maxAmount: '',      // ยอดเงินรับ Max
    decimalFormat: '',  // รูปแบบทศนิยม
    solution: '',       // Solution
    receiptType: '',    // ประเภทใบเสร็จ
    cancelCondition: '',// เงื่อนไขการยกเลิก
    taxId: ''           // Tax ID
  });

  // Reset เมื่อเปิดใหม่
  useEffect(() => {
    if (!isOpen) handleClear();
  }, [isOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCriteria(prev => ({ ...prev, [name]: value }));
  };

  const handleClear = () => {
    setCriteria({
      clientName: '', clientId: '', serviceId: '', serviceName: '',
      billType: '', paymentType: '', minAmount: '', maxAmount: '',
      decimalFormat: '', solution: '', receiptType: '', cancelCondition: '', taxId: ''
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Validate: ต้องกรอกอย่างน้อย 1 ช่อง
    const hasValue = Object.values(criteria).some(val => val.trim() !== '');
    if (!hasValue) {
      alert("กรุณากรอกข้อมูลอย่างน้อย 1 ช่องเพื่อค้นหา");
      return;
    }
    onSearch(criteria);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 w-full max-w-4xl rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 flex flex-col max-h-[90vh] overflow-hidden">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-800/50">
          <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400">
            <Filter size={20} />
            <h3 className="font-bold text-lg text-slate-900 dark:text-white">ค้นหาขั้นสูง (Advanced Search)</h3>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-full text-slate-400">
            <X size={24} />
          </button>
        </div>

        {/* Form Body */}
        <div className="p-6 overflow-y-auto custom-scrollbar bg-white dark:bg-slate-900">
          <form id="searchForm" onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            
            {/* Group 1: ข้อมูลลูกค้า */}
            <div className="col-span-full mb-2 border-b border-slate-100 dark:border-slate-800 pb-2">
              <span className="text-xs font-bold text-slate-400 uppercase">ข้อมูลลูกค้า (Client Info)</span>
            </div>
            <InputGroup label="ชื่อผู้ว่าจ้าง (Client Name)" name="clientName" value={criteria.clientName} onChange={handleChange} placeholder="ระบุชื่อลูกค้า..." />
            <InputGroup label="Client ID" name="clientId" value={criteria.clientId} onChange={handleChange} placeholder="เช่น 10001" />
            <InputGroup label="Tax ID" name="taxId" value={criteria.taxId} onChange={handleChange} placeholder="เลขประจำตัวผู้เสียภาษี" />

            {/* Group 2: ข้อมูลบริการ */}
            <div className="col-span-full mt-4 mb-2 border-b border-slate-100 dark:border-slate-800 pb-2">
              <span className="text-xs font-bold text-slate-400 uppercase">รายละเอียดบริการ (Service Details)</span>
            </div>
            <InputGroup label="Service ID" name="serviceId" value={criteria.serviceId} onChange={handleChange} placeholder="เช่น SERV_001" />
            <InputGroup label="ชื่อบริการ (Service Name)" name="serviceName" value={criteria.serviceName} onChange={handleChange} placeholder="ระบุชื่อบริการ..." />
            <InputGroup label="Solution ในการพัฒนาระบบ" name="solution" value={criteria.solution} onChange={handleChange} placeholder="เช่น API, Web App" />
            
            {/* Group 3: การเงิน & ใบเสร็จ */}
            <div className="col-span-full mt-4 mb-2 border-b border-slate-100 dark:border-slate-800 pb-2">
              <span className="text-xs font-bold text-slate-400 uppercase">การเงินและเงื่อนไข (Financial & Conditions)</span>
            </div>
            <InputGroup label="การคิดค่าบริการ (Fee Type)" name="billType" value={criteria.billType} onChange={handleChange} placeholder="ระบุรูปแบบ..." />
            <InputGroup label="ประเภทการชำระ (Payment Type)" name="paymentType" value={criteria.paymentType} onChange={handleChange} placeholder="Online / Offline" />
            <InputGroup label="ประเภทใบเสร็จ (Receipt Type)" name="receiptType" value={criteria.receiptType} onChange={handleChange} placeholder="Full / Short" />
            
            <InputGroup label="ยอดเงินรับ Min (฿)" name="minAmount" value={criteria.minAmount} onChange={handleChange} type="number" placeholder="0.00" />
            <InputGroup label="ยอดเงินรับ Max (฿)" name="maxAmount" value={criteria.maxAmount} onChange={handleChange} type="number" placeholder="0.00" />
            <InputGroup label="รูปแบบทศนิยม (Decimal)" name="decimalFormat" value={criteria.decimalFormat} onChange={handleChange} placeholder="เช่น 2 ตำแหน่ง" />
            
            <div className="col-span-full md:col-span-1 lg:col-span-3">
               <InputGroup label="เงื่อนไขการยกเลิก (Cancellation)" name="cancelCondition" value={criteria.cancelCondition} onChange={handleChange} placeholder="ระบุเงื่อนไข..." fullWidth />
            </div>

          </form>
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 flex justify-between items-center">
          <button 
            type="button"
            onClick={handleClear}
            className="flex items-center gap-2 px-4 py-2 text-slate-500 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors font-medium text-sm"
          >
            <Eraser size={18} /> ล้างค่า (Clear)
          </button>
          <div className="flex gap-3">
            <button 
              onClick={onClose}
              className="px-6 py-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-700 dark:text-white font-medium hover:bg-slate-50 dark:hover:bg-slate-600 transition-colors"
            >
              ยกเลิก
            </button>
            <button 
              type="submit"
              form="searchForm"
              className="px-8 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold shadow-lg shadow-blue-500/30 flex items-center gap-2 transition-all active:scale-95"
            >
              <Search size={18} /> ค้นหาข้อมูล
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Input Helper Component
const InputGroup = ({ label, name, value, onChange, placeholder, type = "text", fullWidth }) => (
  <div className={`space-y-1.5 ${fullWidth ? 'w-full' : ''}`}>
    <label className="text-xs font-bold text-slate-600 dark:text-slate-300 ml-1">{label}</label>
    <input 
      type={type}
      name={name}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm text-slate-800 dark:text-white placeholder:text-slate-400 transition-all"
    />
  </div>
);

/**
 * ServiceDetailModal: Popup แสดงรายละเอียด (เหมือนเดิม)
 */
const ServiceDetailModal = ({ isOpen, onClose, services, clientInfo }) => {
  const [activeTab, setActiveTab] = useState(0);

  useEffect(() => {
    if (isOpen) setActiveTab(0);
  }, [isOpen]);

  if (!isOpen || !services || services.length === 0) return null;

  const activeService = services[activeTab];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm transition-opacity">
      <div className="bg-white dark:bg-slate-900 w-full max-w-4xl rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 flex flex-col max-h-[90vh] overflow-hidden animate-in fade-in zoom-in duration-200">
        {/* Header */}
        <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-start bg-slate-50 dark:bg-slate-800/50">
          <div>
            <div className="flex items-center gap-2 text-sm text-blue-600 dark:text-blue-400 font-bold mb-1">
              <Users size={16} /> CS_CODE: {clientInfo.CS_CODE}
            </div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
              {clientInfo.CLIENT_SHORT_NAME}
            </h2>
            <p className="text-slate-500 text-sm">Client ID: {clientInfo.CLIENT_ID}</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-full transition-colors text-slate-500">
            <X size={24} />
          </button>
        </div>

        {/* Tabs (SERV_ID) */}
        <div className="px-6 pt-4 border-b border-slate-200 dark:border-slate-800 overflow-x-auto">
          <div className="flex space-x-2">
            {services.map((service, index) => (
              <button
                key={index}
                onClick={() => setActiveTab(index)}
                className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-colors border-b-2 flex items-center gap-2 whitespace-nowrap ${
                  activeTab === index
                    ? 'border-blue-500 text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20'
                    : 'border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
              >
                <FolderOpen size={14} />
                SERV_ID: {service.SERV_ID}
              </button>
            ))}
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto bg-white dark:bg-slate-900">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Service Info */}
            <div className="space-y-4">
              <h3 className="font-semibold text-lg border-l-4 border-blue-500 pl-3 dark:text-white">
                ข้อมูลบริการ (Service Info)
              </h3>
              <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl space-y-3">
                <DetailRow label="Service Name" value={activeService.SERV_NAME} />
                <DetailRow label="Workflow Code" value={activeService.WORKFLOW_CODE} isCode />
                <DetailRow label="Flow Type" value={activeService.Flow_TYPE} />
                <DetailRow label="Group Type" value={activeService.GROUP_TYPE} />
                <DetailRow label="Solution" value={activeService.SOLUTION} />
              </div>
            </div>

            {/* Payment & Status */}
            <div className="space-y-4">
              <h3 className="font-semibold text-lg border-l-4 border-emerald-500 pl-3 dark:text-white">
                การชำระเงินและสถานะ (Payment & Status)
              </h3>
              <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl space-y-3">
                <div className="flex justify-between items-center py-2 border-b border-slate-200 dark:border-slate-700">
                  <span className="text-slate-500 text-sm">Online Status</span>
                  <span className={`px-2 py-1 rounded text-xs font-bold ${activeService.ONLINE_TYPE === 'Online' ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100'}`}>
                    {activeService.ONLINE_TYPE}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-4 mt-2">
                  <div className="p-3 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
                    <p className="text-xs text-slate-400 mb-1">Max Pay (BKK)</p>
                    <p className="font-mono font-bold text-blue-600 dark:text-blue-400">
                      {formatCurrency(parseFloat(activeService.MAX_PAYMENT_BKK))}
                    </p>
                  </div>
                  <div className="p-3 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
                    <p className="text-xs text-slate-400 mb-1">Max Pay (OTH)</p>
                    <p className="font-mono font-bold text-purple-600 dark:text-purple-400">
                      {formatCurrency(parseFloat(activeService.MAX_PAYMENT_OTH))}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* System Flags */}
            <div className="col-span-1 md:col-span-2 space-y-4">
               <h3 className="font-semibold text-lg border-l-4 border-orange-500 pl-3 dark:text-white">
                การตั้งค่าระบบ (System Configuration)
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                 <FlagBox label="Bill Type" value={activeService.BILL_TYPE} />
                 <FlagBox label="Reprint Bill" value={activeService.REPRINT_BILL_TYPE} />
                 <FlagBox label="Check Dup" value={activeService.CHECK_DUP} />
                 <FlagBox label="Versions" value={activeService.VERSIONS} />
              </div>
            </div>

          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 flex justify-end">
          <button onClick={onClose} className="px-6 py-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-700 dark:text-white font-medium hover:bg-slate-50 dark:hover:bg-slate-600 transition-colors">
            ปิดหน้าต่าง
          </button>
        </div>
      </div>
    </div>
  );
};

// Sub-components
const DetailRow = ({ label, value, isCode }) => (
  <div className="flex justify-between items-start border-b border-dashed border-slate-200 dark:border-slate-700 last:border-0 pb-2 last:pb-0">
    <span className="text-slate-500 dark:text-slate-400 text-sm">{label}</span>
    <span className={`text-sm font-medium text-right ${isCode ? 'font-mono bg-slate-200 dark:bg-slate-700 px-1 rounded' : 'dark:text-slate-200'}`}>
      {value || '-'}
    </span>
  </div>
);

const FlagBox = ({ label, value }) => (
  <div className="p-3 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 text-center">
    <p className="text-xs text-slate-400 mb-1">{label}</p>
    <p className="font-bold text-slate-700 dark:text-white">{value || 'N/A'}</p>
  </div>
);

// --- 3. Main Dashboard Component ---

const ServiceDashboard = () => {
  const [rawData, setRawData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // States for search
  const [searchTerm, setSearchTerm] = useState('');
  const [isAdvancedSearchOpen, setIsAdvancedSearchOpen] = useState(false);
  const [searchStatus, setSearchStatus] = useState('ALL'); // ALL, FILTERED

  const [darkMode, setDarkMode] = useState(false);
  
  // State for Detail Modal
  const [selectedClient, setSelectedClient] = useState(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (darkMode) document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
  }, [darkMode]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/dashboard/export`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ request_time: new Date().toISOString() })
      });

      if (!response.ok) throw new Error(`HTTP Error! status: ${response.status}`);
      const result = await response.json();

      if (result.success && Array.isArray(result.data)) {
        setRawData(result.data);
      }
    } catch (err) {
      setError(err.message || 'Connection Error');
    } finally {
      setLoading(false);
    }
  };

  /**
   * ฟังก์ชันค้นหาขั้นสูง
   * จำลองการทำงานเหมือน API Search โดยการ Filter จาก rawData
   */
  const handleAdvancedSearch = async (criteria) => {
    setLoading(true);
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));

    try {
      // NOTE: ถ้ามี API จริง ให้เปลี่ยนส่วนนี้เป็นการ fetch(`${API_BASE_URL}/dashboard/search`, ...)
      
      const filtered = rawData.filter(item => {
        let match = true;

        if (criteria.clientName && !item.CLIENT_SHORT_NAME?.toLowerCase().includes(criteria.clientName.toLowerCase())) match = false;
        if (criteria.clientId && !String(item.CLIENT_ID).includes(criteria.clientId)) match = false;
        if (criteria.serviceId && !String(item.SERV_ID).toLowerCase().includes(criteria.serviceId.toLowerCase())) match = false;
        if (criteria.serviceName && !item.SERV_NAME?.toLowerCase().includes(criteria.serviceName.toLowerCase())) match = false;
        
        // Fee Type -> BILL_TYPE
        if (criteria.billType && !item.BILL_TYPE?.toLowerCase().includes(criteria.billType.toLowerCase())) match = false;
        
        // Payment Type -> ONLINE_TYPE or Flow_TYPE
        if (criteria.paymentType) {
           const pt = criteria.paymentType.toLowerCase();
           const matchOnline = item.ONLINE_TYPE?.toLowerCase().includes(pt);
           const matchFlow = item.Flow_TYPE?.toLowerCase().includes(pt);
           if (!matchOnline && !matchFlow) match = false;
        }

        // Amount Logic (Min/Max Check against MAX_PAYMENT_BKK as proxy)
        const payAmount = parseFloat(item.MAX_PAYMENT_BKK || 0);
        if (criteria.minAmount && payAmount < parseFloat(criteria.minAmount)) match = false;
        if (criteria.maxAmount && payAmount > parseFloat(criteria.maxAmount)) match = false;

        // Solution
        if (criteria.solution && !item.SOLUTION?.toLowerCase().includes(criteria.solution.toLowerCase())) match = false;
        
        // Receipt -> REPRINT_BILL_TYPE (Closest Proxy)
        if (criteria.receiptType && !item.REPRINT_BILL_TYPE?.toLowerCase().includes(criteria.receiptType.toLowerCase())) match = false;

        // Tax ID (Generic match as field might not exist in sample)
        // if (criteria.taxId && item.TAX_ID !== criteria.taxId) match = false;

        return match;
      });
      
      // Update Display Data logic handled by useMemo relying on rawData? 
      // เพื่อให้ถูกต้องตามโจทย์ "ระบบจะ Return ค่ากลับมาแบบเดียวกับ dashboard/export แล้วให้นำค่านั้นแสดง"
      // เราจะอัปเดต rawData ชั่วคราว หรือใช้ State แยกสำหรับการแสดงผล
      // แต่เพื่อให้ง่ายที่สุด ผมจะ Filter ที่ rawData โดยตรงถ้าเป็นการค้นหาแบบ Local
      // *แต่* เพื่อให้สามารถ Reset ได้ ผมจะใช้ logic ใน useMemo ด้านล่างแทน
      
      // ในที่นี้ผมจะสร้าง state 'filteredResult' ถ้ามีค่าให้ใช้ค่านี้ ถ้าไม่มีให้ใช้ rawData
      setFilteredResults(filtered);
      setSearchStatus('FILTERED');

    } catch (err) {
      console.error(err);
      alert("เกิดข้อผิดพลาดในการค้นหา");
    } finally {
      setLoading(false);
    }
  };

  const [filteredResults, setFilteredResults] = useState(null);

  const resetSearch = () => {
    setFilteredResults(null);
    setSearchStatus('ALL');
  };

  // Logic: Group Data by CS_CODE
  const groupedData = useMemo(() => {
    // 1. Determine Source Data (Original or Advanced Filtered)
    const sourceData = searchStatus === 'FILTERED' ? (filteredResults || []) : rawData;

    // 2. Apply Quick Search (Navbar)
    const filtered = sourceData.filter(item => 
      item.SERV_NAME?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.CS_CODE?.toString().includes(searchTerm) ||
      item.CLIENT_SHORT_NAME?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // 3. Group By CS_CODE
    const groups = {};
    filtered.forEach(item => {
      const key = item.CS_CODE;
      if (!groups[key]) {
        groups[key] = {
          CS_CODE: item.CS_CODE,
          CLIENT_ID: item.CLIENT_ID,
          CLIENT_SHORT_NAME: item.CLIENT_SHORT_NAME,
          services: []
        };
      }
      groups[key].services.push(item);
    });

    return Object.values(groups);
  }, [rawData, filteredResults, searchTerm, searchStatus]);

  const handleRowClick = (clientData) => {
    setSelectedClient(clientData);
    setIsDetailModalOpen(true);
  };

  const stats = {
    totalClients: groupedData.length,
    totalServices: (searchStatus === 'FILTERED' ? filteredResults : rawData)?.length || 0,
    totalMaxBKK: (searchStatus === 'FILTERED' ? filteredResults : rawData)?.reduce((acc, curr) => acc + parseFloat(curr.MAX_PAYMENT_BKK || 0), 0) || 0
  };

  if (loading) return (
    <div className="flex h-screen w-full items-center justify-center bg-slate-50 dark:bg-slate-900">
      <div className="text-center">
        <RefreshCw className="animate-spin text-blue-600 mx-auto mb-2" size={40} />
        <p className="text-slate-500">กำลังโหลดข้อมูล...</p>
      </div>
    </div>
  );

  return (
    <div className={`min-h-screen transition-colors duration-300 ${darkMode ? 'dark bg-slate-900' : 'bg-slate-50'}`}>
      
      {/* Navbar */}
      <nav className="sticky top-0 z-10 bg-white/80 dark:bg-slate-800/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-700 px-6 py-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-600 rounded-lg shadow-blue-500/20 shadow-lg">
              <LayoutDashboard className="text-white" size={20} />
            </div>
            <h1 className="text-xl font-bold text-slate-800 dark:text-white hidden md:block">Client Service Monitor</h1>
          </div>
          <div className="flex items-center gap-3">
            
            {/* Quick Search */}
            <div className="relative hidden sm:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input 
                type="text"
                placeholder="ค้นหาด่วน CS Code, ชื่อ..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 bg-slate-100 dark:bg-slate-900/50 rounded-xl focus:ring-2 focus:ring-blue-500 w-64 text-sm outline-none"
              />
            </div>

            {/* Advanced Search Button */}
            <button 
                onClick={() => setIsAdvancedSearchOpen(true)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all font-bold text-sm border ${
                    searchStatus === 'FILTERED' 
                    ? 'bg-blue-600 text-white border-blue-600 shadow-lg shadow-blue-500/30' 
                    : 'bg-white dark:bg-slate-700 text-slate-600 dark:text-slate-200 border-slate-200 dark:border-slate-600 hover:bg-slate-50'
                }`}
            >
                <Filter size={18} />
                {searchStatus === 'FILTERED' ? 'ผลการค้นหา (Active)' : 'ค้นหาขั้นสูง'}
            </button>

            {searchStatus === 'FILTERED' && (
                <button 
                    onClick={() => { resetSearch(); fetchData(); }}
                    className="p-2 rounded-xl bg-red-50 text-red-500 hover:bg-red-100 transition-colors"
                    title="ล้างการค้นหา"
                >
                    <X size={20} />
                </button>
            )}

            <button onClick={() => setDarkMode(!darkMode)} className="p-2 rounded-xl bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 transition-colors">
              {darkMode ? <Sun size={20} className="text-yellow-400" /> : <Moon size={20} className="text-slate-600" />}
            </button>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto p-6 space-y-8">
        
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <StatCard title="ลูกค้าที่พบ (Clients)" value={stats.totalClients} icon={Users} color="bg-blue-500" />
          <StatCard title="บริการที่พบ (Services)" value={stats.totalServices} icon={Layers} color="bg-emerald-500" />
          <StatCard title="วงเงินรวม (BKK)" value={formatCurrency(stats.totalMaxBKK)} icon={CreditCard} color="bg-purple-500" />
        </div>

        {/* Main Table: Grouped by Client */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
          <div className="p-6 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
            <div className="flex items-center gap-2">
                <TableIcon className="text-blue-500" size={20} />
                <h2 className="text-lg font-bold text-slate-800 dark:text-white">
                    {searchStatus === 'FILTERED' ? 'ผลลัพธ์การค้นหา' : 'รายชื่อลูกค้าทั้งหมด (Clients)'}
                </h2>
            </div>
            <span className="text-xs text-slate-400">* คลิกที่แถวเพื่อดูรายละเอียดบริการ</span>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-700/50 text-slate-500 dark:text-slate-400 text-xs uppercase tracking-wider">
                  <th className="px-6 py-4 font-semibold w-32">CS Code</th>
                  <th className="px-6 py-4 font-semibold w-32">Client ID</th>
                  <th className="px-6 py-4 font-semibold">Client Name</th>
                  <th className="px-6 py-4 font-semibold text-center w-32">Total Services</th>
                  <th className="px-6 py-4 font-semibold text-right w-16">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                {groupedData.length > 0 ? (
                  groupedData.map((client, index) => (
                    <tr 
                      key={index} 
                      onClick={() => handleRowClick(client)}
                      className="group cursor-pointer hover:bg-blue-50 dark:hover:bg-slate-700/50 transition-all duration-200"
                    >
                      <td className="px-6 py-4">
                        <span className="bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 px-2 py-1 rounded font-mono text-sm font-bold group-hover:bg-blue-200 dark:group-hover:bg-blue-900 transition-colors">
                          {client.CS_CODE}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-500 dark:text-slate-400 font-mono">
                        {client.CLIENT_ID}
                      </td>
                      <td className="px-6 py-4 font-medium text-slate-800 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400">
                        {client.CLIENT_SHORT_NAME}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 font-bold text-sm">
                          {client.services.length}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right text-slate-300 group-hover:text-blue-500">
                        <ChevronRight size={20} />
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="px-6 py-16 text-center text-slate-500 dark:text-slate-400 flex flex-col items-center justify-center">
                        <div className="bg-slate-100 dark:bg-slate-700 p-4 rounded-full mb-3">
                            <Search size={32} className="text-slate-400" />
                        </div>
                        <p className="font-medium">ไม่พบข้อมูลที่ตรงกับเงื่อนไข</p>
                        <p className="text-sm mt-1">ลองปรับเปลี่ยนคำค้นหาหรือตัวกรองใหม่อีกครั้ง</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {/* Modals */}
      <ServiceDetailModal 
        isOpen={isDetailModalOpen} 
        onClose={() => setIsDetailModalOpen(false)} 
        services={selectedClient?.services} 
        clientInfo={selectedClient}
      />

      <AdvancedSearchModal 
        isOpen={isAdvancedSearchOpen}
        onClose={() => setIsAdvancedSearchOpen(false)}
        onSearch={handleAdvancedSearch}
      />

    </div>
  );
};

// Component เสริมสำหรับ Stat Card
const StatCard = ({ title, value, icon: Icon, color }) => (
  <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 flex items-center justify-between">
    <div>
      <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">{title}</p>
      <h3 className="text-2xl font-bold text-slate-900 dark:text-white">{value}</h3>
    </div>
    <div className={`p-3 rounded-xl ${color} bg-opacity-10 text-${color.split('-')[1]}-500`}>
      <Icon size={24} />
    </div>
  </div>
);

export default ServiceDashboard;