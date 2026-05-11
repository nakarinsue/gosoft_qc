import React, { useState, useEffect } from 'react';
import { Search, RefreshCw, PieChart, AlertTriangle, Box, CheckCircle, Loader2 } from 'lucide-react';
import { PieChart as ReChartPie, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import Swal from 'sweetalert2';

// 📍 นำเข้า API Service กลาง
import apiService from '../services/apiServices'; 

export default function BarcodeManagement() {
  // --- States ---
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSummary, setShowSummary] = useState(false);
  const [summaryData, setSummaryData] = useState(null);
  
  // States สำหรับ UI และ Loading
  const [isTableLoading, setIsTableLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);

  // Mock ตัวแปร Context (สำหรับส่งให้ API)
  const versionId = 1;
  const storeCode = "00001";
  const userId = 999;

  // ---------------------------------------------------------------------------
  // 1. API GET: โหลดข้อมูลเริ่มต้น
  // ---------------------------------------------------------------------------
  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    setIsTableLoading(true);
    try {
      // 📍 เรียกใช้ apiService แทน fetch เดิม
      const result = await apiService.products.getMissingBarcodes(versionId);
      
      if (result.status === "success" && result.data) {
        const formattedData = result.data.map((item, index) => ({
          ...item,
          id: index,
          isEdited: false
        }));
        setData(formattedData);
        setFilteredData(formattedData);
      }
    } catch (error) {
      console.error("Fetch Data Error:", error.message);
    } finally {
      setIsTableLoading(false);
    }
  };

  // ---------------------------------------------------------------------------
  // ฟังก์ชันค้นหาและจัดการ UI
  // ---------------------------------------------------------------------------
  const handleSearch = (e) => {
    const query = e.target.value.toLowerCase();
    setSearchQuery(query);
    const filtered = data.filter(item => 
      item.entity_code.toLowerCase().includes(query) || 
      item.entity_name.toLowerCase().includes(query)
    );
    setFilteredData(filtered);
  };

  const handleBarcodeChange = (index, value) => {
    const numericValue = value.replace(/[^0-9]/g, '');
    const newData = [...filteredData];
    newData[index].barcode = numericValue;
    newData[index].isEdited = numericValue.length > 0;
    setFilteredData(newData);
  };

  // ---------------------------------------------------------------------------
  // 2. API PUT: อัปเดตบาร์โค้ดรายบรรทัด (ปุ่มบันทึก)
  // ---------------------------------------------------------------------------
  const handleUpdate = async (item) => {
    setUpdatingId(item.id);
    try {
      const payload = {
        entity_code: item.entity_code,
        barcode: item.barcode,
        pro_ids: item.pro_id
      };

      // 📍 เรียกใช้ apiService 
      await apiService.products.updateBarcode(payload);

      Swal.fire({
        icon: 'success',
        title: 'อัปเดตสำเร็จ!',
        text: `บาร์โค้ดของ ${item.entity_name} ถูกบันทึกแล้ว`,
        timer: 1500,
        showConfirmButton: false
      });

      const newData = filteredData.map(d => d.id === item.id ? { ...d, isEdited: false } : d);
      setFilteredData(newData);
      
      const newSourceData = data.map(d => d.id === item.id ? { ...d, barcode: item.barcode } : d);
      setData(newSourceData);

    } catch (error) {
      console.error("Update Error:", error);
      Swal.fire('ข้อผิดพลาด', error.message || 'ไม่สามารถอัปเดตบาร์โค้ดได้', 'error');
    } finally {
      setUpdatingId(null);
    }
  };

  // ---------------------------------------------------------------------------
  // 3. API POST: ตรวจสอบและดึงข้อมูลใหม่ (ปุ่ม Get Data)
  // ---------------------------------------------------------------------------
  const handleGetData = async () => {
    const itemsToCheck = data
      .filter(item => !item.barcode)
      .map(item => ({
        pro_id: item.pro_id[0] || 0,
        entity_code: item.entity_code
      }));

    if (itemsToCheck.length === 0) {
      Swal.fire('แจ้งเตือน', 'ไม่มีสินค้ารอตรวจสอบบาร์โค้ด', 'info');
      return;
    }

    Swal.fire({ title: 'กำลังตรวจสอบข้อมูล...', allowOutsideClick: false, didOpen: () => Swal.showLoading() });

    try {
      const payload = { store_code: storeCode, items: itemsToCheck };
      
      // 📍 เรียกใช้ apiService
      await apiService.products.checkBarcodes(payload);

      Swal.fire('สำเร็จ!', 'ตรวจสอบข้อมูลเรียบร้อยแล้ว', 'success');
      fetchInitialData();
    } catch (error) {
      console.error("Check Barcode Error:", error);
      Swal.fire('ข้อผิดพลาด', error.message || 'เกิดปัญหาในการตรวจสอบข้อมูล', 'error');
    }
  };

  // ---------------------------------------------------------------------------
  // 4. API GET: ดึงข้อมูล Summary (ปุ่ม Summary)
  // ---------------------------------------------------------------------------
  const handleSummary = async () => {
    Swal.fire({ title: 'กำลังประมวลผล...', allowOutsideClick: false, didOpen: () => Swal.showLoading() });
    
    try {
      // 📍 เรียกใช้ apiService
      const result = await apiService.products.getSummary(versionId);

      if (result.status === "success") {
        setSummaryData(result.data);
        Swal.close();
        setShowSummary(true);
      }
    } catch (error) {
      console.error("Summary Error:", error);
      Swal.fire('ข้อผิดพลาด', error.message || 'ไม่สามารถดึงข้อมูลสรุปได้', 'error');
    }
  };

  // ---------------------------------------------------------------------------
  // 5. API POST: ทำรายการ Defect (ปุ่ม Defect)
  // ---------------------------------------------------------------------------
  const handleDefect = () => {
    const defectItems = data
      .filter(item => !item.barcode)
      .map(item => ({
        pro_id: item.pro_id[0] || 0,
        entity_code: item.entity_code
      }));

    if (defectItems.length === 0) {
      Swal.fire('ข้อมูลครบถ้วน', 'ไม่มีสินค้าตกหล่นให้ทำรายการ Defect', 'info');
      return;
    }

    Swal.fire({
      title: 'ยืนยันการทำรายการ Defect?',
      text: `ระบบจะบันทึก Transaction สินค้าที่ตกหล่นจำนวน ${defectItems.length} รายการ`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#EF4444',
      cancelButtonColor: '#6B7280',
      confirmButtonText: 'ยืนยันการ Defect',
      cancelButtonText: 'ยกเลิก'
    }).then(async (result) => {
      if (result.isConfirmed) {
        Swal.fire({ title: 'กำลังบันทึก...', allowOutsideClick: false, didOpen: () => Swal.showLoading() });

        try {
          const payload = {
            pro_id: 0,
            is_all_items: true,
            items: defectItems,
            user_id: userId
          };

          // 📍 เรียกใช้ apiService
          await apiService.products.defectProduct(payload);

          Swal.fire('บันทึกสำเร็จ!', 'ทำรายการ Defect เรียบร้อยแล้ว', 'success');
          fetchInitialData();
        } catch (error) {
          console.error("Defect Error:", error);
          Swal.fire('ข้อผิดพลาด', error.message || 'ไม่สามารถทำรายการ Defect ได้', 'error');
        }
      }
    });
  };

  // เตรียมข้อมูลกราฟ
  const chartData = summaryData ? [
    { name: 'มี Barcode', value: summaryData.product_code_count, color: '#10B981' }, 
    { name: 'ไม่มี Barcode', value: summaryData.not_product_code, color: '#EF4444' } 
  ] : [];

  return (
    // เปลี่ยนเป็น h-screen overflow-hidden บังคับหน้าจอฟิตพอดีไม่ให้เลื่อนได้
    <div className="h-screen overflow-hidden flex flex-col bg-slate-50 p-4 md:p-6 font-sans animate-in fade-in duration-500">
      
      {/* ใส่ flex-1 min-h-0 เพื่อให้คอนเทนต์ในนี้จัดสรรพื้นที่ที่เหลือได้เต็มที่ */}
      <div className="max-w-7xl mx-auto w-full h-full flex flex-col flex-1 min-h-0 gap-4">
        
        {/* Header (ล็อคความสูงตามเนื้อหา) */}

        {/* ตรวจสอบสถานะการโหลดข้อมูล */}
        {isTableLoading ? (
          // ใช้ flex-1 เพื่อให้กล่องโหลดเต็มความสูงที่เหลืออยู่
          <div className="flex-1 bg-white rounded-[2.5rem] shadow-sm border border-slate-200 flex items-center justify-center min-h-0">
            <div className="text-slate-400 flex flex-col items-center gap-3">
               <div className="size-10 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
               <p className="font-bold tracking-widest uppercase text-sm animate-pulse">Loading Data...</p>
            </div>
          </div>
        ) : (
          // Main Card Container (flex-col ยืดเต็มพื้นที่)
          <div className="flex-1 bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex flex-col min-h-0">
            
            {/* Toolbar (ล็อคความสูงด้านบนสุดของการ์ด) */}
            <div className="flex-none p-4 border-b border-slate-100 flex flex-wrap justify-between items-center gap-4 bg-slate-50/50">
              <div className="relative w-full md:w-80">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input 
                  type="text" 
                  placeholder="ค้นหา Entity Code / ชื่อสินค้า..." 
                  value={searchQuery}
                  onChange={handleSearch}
                  className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 text-slate-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
                />
              </div>
              
              <div className="flex flex-wrap gap-2">
                <button onClick={handleGetData} className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors shadow-sm font-medium">
                  <RefreshCw size={16} /> Get Data
                </button>
                <button onClick={handleSummary} className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-indigo-600 rounded-lg hover:bg-indigo-50 transition-colors shadow-sm font-medium">
                  <PieChart size={16} /> Summary
                </button>
                <button onClick={handleDefect} className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors shadow-sm shadow-red-500/30 font-medium">
                  <AlertTriangle size={16} /> Defect
                </button>
              </div>
            </div>

            {/* Table Scrollable Container (ส่วนนี้เท่านั้นที่จะ Scroll ได้) */}
            <div className="flex-1 overflow-auto relative bg-white">
              <table className="w-full text-left text-sm text-slate-600 border-collapse">
                {/* 📌 Sticky Header ค้างด้านบนตารางเวลาสกอร์ */}
                <thead className="sticky top-0 z-10 bg-slate-50/95 backdrop-blur-sm text-slate-700 uppercase tracking-wider text-xs shadow-sm shadow-slate-200/50">
                  <tr>
                    <th className="px-6 py-4 font-semibold border-b border-slate-200">Entity Code</th>
                    <th className="px-6 py-4 font-semibold border-b border-slate-200">ชื่อสินค้า</th>
                    <th className="px-6 py-4 font-semibold border-b border-slate-200">Pro IDs</th>
                    <th className="px-6 py-4 font-semibold text-center border-b border-slate-200">Mode</th>
                    <th className="px-6 py-4 font-semibold w-64 text-center border-b border-slate-200">ระบุ Barcode</th>
                    <th className="px-6 py-4 font-semibold text-center w-32 border-b border-slate-200">จัดการ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredData.length > 0 ? (
                    filteredData.map((row, index) => (
                      <tr key={row.id} className="hover:bg-blue-50/50 transition-colors group">
                        <td className="px-6 py-4 font-medium text-slate-900">{row.entity_code}</td>
                        <td className="px-6 py-4">{row.entity_name}</td>
                        <td className="px-6 py-4">
                          <span className="px-2 py-1 bg-slate-100 rounded-md text-xs text-slate-600 font-mono">
                            {row.pro_id.join(', ')}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span className="px-2 py-1 bg-blue-50 text-blue-600 rounded-md text-xs border border-blue-100">
                            {row.mode || 'N/A'}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <input 
                            type="text" 
                            value={row.barcode || ''}
                            onChange={(e) => handleBarcodeChange(index, e.target.value)}
                            placeholder="ตัวเลขเท่านั้น"
                            className="w-full px-3 py-2 bg-white border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-center tracking-widest font-mono text-slate-800 placeholder-slate-400 transition"
                          />
                        </td>
                        <td className="px-6 py-4 text-center h-[72px] align-middle">
                          {row.isEdited && (
                            <button 
                              onClick={() => handleUpdate(row)}
                              disabled={updatingId === row.id}
                              className="flex items-center justify-center gap-1 w-full px-3 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors text-xs font-medium shadow-sm shadow-green-500/20 disabled:opacity-50"
                            >
                              {updatingId === row.id ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle size={14} />} 
                              {updatingId === row.id ? 'กำลังบันทึก' : 'บันทึก'}
                            </button>
                          )}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="6" className="px-6 py-16 text-center text-slate-400">
                        <div className="flex flex-col items-center justify-center gap-2">
                          <Search size={32} className="opacity-50" />
                          <p>ไม่พบข้อมูลสินค้าที่ค้นหา</p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            
            {/* Footer (ล็อคความสูงด้านล่างสุด) */}
            <div className="flex-none p-4 border-t border-slate-100 bg-slate-50/50 text-right text-xs text-slate-500">
              แสดงข้อมูลทั้งหมด <span className="font-bold text-slate-700">{filteredData.length}</span> รายการ
            </div>
          </div>
        )}

        {/* Modal Summary (คงเดิม) */}
        {showSummary && summaryData && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden flex flex-col border border-slate-200">
              <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/80">
                <h3 className="font-bold text-slate-800 flex items-center gap-2">
                  <PieChart className="text-indigo-500" size={20} /> สรุปผลข้อมูลบาร์โค้ด
                </h3>
                <button onClick={() => setShowSummary(false)} className="text-slate-400 hover:text-slate-600 transition-colors">
                  <span className="sr-only">Close</span>
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>
              
              <div className="p-6">
                <div className="grid grid-cols-3 gap-4 mb-6 text-center">
                  <div className="p-4 bg-blue-50 rounded-xl border border-blue-100 text-blue-800">
                    <p className="text-xs font-semibold mb-1 opacity-80 uppercase tracking-wider">ทั้งหมด</p>
                    <p className="text-2xl font-bold">{summaryData.sum_product_code}</p>
                  </div>
                  <div className="p-4 bg-green-50 rounded-xl border border-green-100 text-green-800">
                    <p className="text-xs font-semibold mb-1 opacity-80 uppercase tracking-wider">มีบาร์โค้ด</p>
                    <p className="text-2xl font-bold">{summaryData.product_code_count}</p>
                  </div>
                  <div className="p-4 bg-red-50 rounded-xl border border-red-100 text-red-800">
                    <p className="text-xs font-semibold mb-1 opacity-80 uppercase tracking-wider">ไม่มีบาร์โค้ด</p>
                    <p className="text-2xl font-bold">{summaryData.not_product_code}</p>
                  </div>
                </div>

                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <ReChartPie>
                      <Pie
                        data={chartData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                        stroke="none"
                      >
                        {chartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip 
                        cursor={{fill: 'transparent'}} 
                        contentStyle={{ backgroundColor: '#FFFFFF', borderColor: '#E5E7EB', color: '#111827', borderRadius: '8px' }}
                      />
                      <Legend verticalAlign="bottom" height={36} wrapperStyle={{ color: '#374151' }} />
                    </ReChartPie>
                  </ResponsiveContainer>
                </div>
              </div>
              
              <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/80 text-right">
                <button onClick={() => setShowSummary(false)} className="px-6 py-2 bg-white border border-slate-200 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors font-medium">
                  ปิดหน้าต่าง
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}