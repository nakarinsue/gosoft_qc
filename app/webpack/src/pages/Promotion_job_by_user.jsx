import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { 
  Search, ArrowLeft, CheckCircle, XCircle, FileSpreadsheet, 
  Tag, Calendar, FileText, Layers, CheckSquare, Square, Ticket, AlertCircle, Loader2,
  ChevronLeft, ChevronRight // 📍 เพิ่ม Icon สำหรับปุ่มเปลี่ยนหน้า
} from 'lucide-react';

// ==========================================
// 1. API Services
// ==========================================/promotions/promotions_by_procode/{pro_code}
const apiService = {
  getPromotions: async () => {
    const token = localStorage.getItem('access_token');
    const response = await fetch('V2/promotions/promotions_by_procode/?limit=10000&skip=0', { // ปรับ limit ถ้าต้องการดึงมาเยอะๆ แล้วมาแบ่งหน้าบน UI
      method: 'GET',
      headers: {
        'accept': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });
    if (!response.ok) throw new Error('Failed to fetch promotions');
    return response.json();
  },

  getPromotionDetails: async (id) => {
    const response = await fetch('V2/promotions/promotions_by_ids?limit=100&skip=0', {
      method: 'POST',
      headers: {
        'accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ header_ids: [id] })
    });
    if (!response.ok) throw new Error('Failed to fetch promotion details');
    return response.json();
  }
};

// ==========================================
// 2. Sub-Widgets (Component ย่อย)
// ==========================================
const SummaryCard = ({ icon, label, value, color, bg }) => (
  <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4">
    <div className={`p-4 rounded-xl ${bg} ${color}`}>{icon}</div>
    <div>
      <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">{label}</p>
      <p className="text-3xl font-black text-slate-800 dark:text-slate-100">{value}</p>
    </div>
  </div>
);

const CouponDisplayWidget = ({ detailData }) => {
  const couponList = useMemo(() => {
    if (!detailData) return [];
    return detailData
      .map(d => d.bucket)
      .filter(b => b && (b.coupon || b.entity_type === 'Coupon'));
  }, [detailData]);

  if (couponList.length === 0) return null;

  return (
    <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-200 mt-6">
      <h3 className="font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
        <Ticket size={18} className="text-amber-500"/> Coupon Codes
      </h3>
      <div className="flex flex-col gap-4">
        {couponList.map((item, idx) => (
          <div key={idx} className="bg-slate-50 dark:bg-slate-900 p-4 rounded-xl border border-slate-100 flex flex-col items-center justify-center text-center gap-2">
            <span className="text-sm font-bold text-slate-600 dark:text-slate-300">
              {item.entity_name || 'Coupon Barcode'}
            </span>
            {item.coupon && (
              <span className="bg-amber-100 text-amber-700 px-3 py-1 rounded-lg text-xs font-bold">
                Code: {item.coupon}
              </span>
            )}
            <div className="bg-white p-3 border-2 border-slate-100 rounded-xl shadow-sm w-full flex justify-center mt-2">
              <img 
                src={`https://barcode.tec-it.com/barcode.ashx?data=${item.barcode || item.coupon}&code=Code128&translate-esc=on`} 
                alt={item.barcode || item.coupon} 
                className="h-16 w-full max-w-[220px] object-contain"
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// ==========================================
// 3. Main Component
// ==========================================
export default function PromotionDashboard() {
  const [view, setView] = useState('list'); 
  const [listData, setListData] = useState([]);
  const [detailData, setDetailData] = useState([]);
  
  // States สำหรับค้นหาและจัดการ UI
  const [mainSearch, setMainSearch] = useState('');
  const [detailSearch, setDetailSearch] = useState('');
  const [activeMainTab, setActiveMainTab] = useState('Item');
  const [activeBucket, setActiveBucket] = useState(1);
  const [selectedRows, setSelectedRows] = useState([]);
  
  // 📍 States สำหรับ Pagination (แบ่งหน้าตารางหลัก)
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  
  // States สำหรับ Loading และ Error Handling
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadPromotions();
  }, []);

  // 📍 Reset หน้ากลับไปเป็นหน้าที่ 1 เสมอเวลาพิมพ์ค้นหา
  useEffect(() => {
    setCurrentPage(1);
  }, [mainSearch, rowsPerPage]);

  const loadPromotions = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await apiService.getPromotions();
      setListData(data);
    } catch (err) {
      console.error(err);
      setError('ไม่สามารถเชื่อมต่อระบบเพื่อดึงข้อมูลโปรโมชั่นได้');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDetail = async (id) => {
    setLoading(true);
    setError(null);
    try {
      const data = await apiService.getPromotionDetails(id);
      setDetailData(data);
      setSelectedRows([]);
      setDetailSearch('');
      setActiveMainTab('Item');
      setActiveBucket(1);
      setView('detail');
    } catch (err) {
      console.error(err);
      setError('ไม่สามารถดึงข้อมูลรายละเอียดโปรโมชั่นได้');
    } finally {
      setLoading(false);
    }
  };

  const summaryCounts = useMemo(() => {
    const uniqueCodes = new Set(listData.map(d => d.pro_code));
    const uniqueDates = new Set(listData.map(d => d.start_date));
    const uniqueFiles = new Set(listData.map(d => d.file_name));
    const uniqueSheets = new Set(listData.map(d => d.sheet));
    return { proCode: uniqueCodes.size, startDate: uniqueDates.size, fileName: uniqueFiles.size, sheet: uniqueSheets.size };
  }, [listData]);

  const filteredList = listData.filter(item => 
    Object.values(item).some(val => String(val).toLowerCase().includes(mainSearch.toLowerCase()))
  );

  // 📍 คำนวณข้อมูลสำหรับการแบ่งหน้า
  const totalPages = Math.max(1, Math.ceil(filteredList.length / rowsPerPage));
  const startIndex = (currentPage - 1) * rowsPerPage;
  const paginatedList = filteredList.slice(startIndex, startIndex + rowsPerPage);

  // ==========================================
  // Render: หน้า Detail
  // ==========================================
  if (view === 'detail') {
    const detailHeader = detailData[0]?.header || {};
    const detailFile = detailData[0]?.file || {};
    
    const filteredHeader = Object.entries(detailHeader).filter(([_, v]) => v !== "" && v !== null);
    const filteredFile = Object.entries(detailFile).filter(([_, v]) => v !== "" && v !== null);

    const itemBucketsData = detailData.filter(d => d.bucket?.entity_type === 'Item').map(d => d.bucket);
    const nonItemData = detailData.filter(d => d.bucket?.entity_type !== 'Item').map(d => d.bucket);
    const availableBuckets = [...new Set(itemBucketsData.map(b => b.bucket))].sort((a,b) => a-b);

    const currentTableData = activeMainTab === 'Item' 
      ? itemBucketsData.filter(b => b.bucket === activeBucket)
      : nonItemData;

    const filteredTableData = detailSearch
      ? currentTableData.filter(d => d.barcode?.includes(detailSearch) || d.entity_code?.includes(detailSearch) || d.entity_name?.includes(detailSearch))
      : currentTableData;

    return (
      <div className="h-full flex flex-col bg-slate-50 dark:bg-slate-900 animate-in fade-in relative">
        <div className="bg-white dark:bg-slate-950 p-4 shadow-sm border-b flex items-center justify-between sticky top-0 z-20">
          <button onClick={() => setView('list')} className="flex items-center gap-2 text-slate-600 hover:text-indigo-600 font-bold transition-colors">
            <ArrowLeft size={20} /> กลับไปหน้ารวม
          </button>
          <h2 className="text-xl font-black text-indigo-700">Promotion Detail #{detailHeader.pro_code}</h2>
        </div>

        {loading && (
          <div className="flex-1 flex flex-col items-center justify-center text-slate-500">
            <Loader2 className="animate-spin mb-4" size={40} />
            <p className="font-bold">กำลังโหลดข้อมูลรายละเอียด...</p>
          </div>
        )}

        {!loading && (
          <div className="p-6 flex-1 overflow-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8 items-start">
              
              <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-200">
                <h3 className="font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-2"><Tag size={18} className="text-indigo-500"/> Header Info</h3>
                <div className="grid grid-cols-2 gap-y-3 text-sm">
                  {filteredHeader.map(([key, val]) => (
                    <div key={key} className="flex flex-col">
                      <span className="text-slate-400 text-xs uppercase font-bold">{key.replace(/_/g, ' ')}</span>
                      <span className="font-medium text-slate-800 dark:text-slate-200 truncate pr-4" title={val}>{String(val)}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex flex-col">
                <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-200">
                  <h3 className="font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-2"><FileSpreadsheet size={18} className="text-emerald-500"/> File Info</h3>
                  <div className="grid grid-cols-1 gap-y-3 text-sm">
                    {filteredFile.map(([key, val]) => (
                      <div key={key} className="flex flex-col">
                        <span className="text-slate-400 text-xs uppercase font-bold">{key.replace(/_/g, ' ')}</span>
                        <span className="font-medium text-slate-800 dark:text-slate-200 break-words">{String(val)}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <CouponDisplayWidget detailData={detailData} />
              </div>
            </div>

            <div className="bg-white dark:bg-slate-950 rounded-2xl shadow-sm border border-slate-200 flex flex-col relative overflow-hidden">
              <div className="p-4 border-b flex items-center justify-between bg-slate-50 dark:bg-slate-900">
                <div className="flex gap-2">
                  <button onClick={() => { setActiveMainTab('Item'); setActiveBucket(availableBuckets[0] || 1); }} className={`px-6 py-2 rounded-xl font-bold transition-all ${activeMainTab === 'Item' ? 'bg-indigo-600 text-white shadow-md' : 'bg-white text-slate-500 hover:bg-slate-100'}`}>Item</button>
                  <button onClick={() => setActiveMainTab('Other')} className={`px-6 py-2 rounded-xl font-bold transition-all ${activeMainTab === 'Other' ? 'bg-indigo-600 text-white shadow-md' : 'bg-white text-slate-500 hover:bg-slate-100'}`}>Non-Item</button>
                </div>
                
                <div className="flex items-center gap-4">
                  <div className="text-sm font-bold text-slate-500 bg-slate-200/50 px-4 py-2 rounded-lg">
                    Barcodes in Tab: <span className="text-indigo-600">{filteredTableData.filter(d => d.barcode && d.barcode !== '-').length}</span>
                  </div>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                    <input type="text" placeholder="ค้นหา Barcode, Code..." value={detailSearch} onChange={(e) => setDetailSearch(e.target.value)} className="pl-9 pr-4 py-2 bg-white dark:bg-slate-800 border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 text-sm w-64" />
                  </div>
                </div>
              </div>

              {activeMainTab === 'Item' && availableBuckets.length > 0 && (
                <div className="flex gap-2 p-3 bg-white border-b overflow-x-auto">
                  {availableBuckets.map(b => (
                    <button key={b} onClick={() => setActiveBucket(b)} className={`px-4 py-1.5 rounded-lg text-sm font-bold whitespace-nowrap transition-colors ${activeBucket === b ? 'bg-indigo-100 text-indigo-700 ring-1 ring-indigo-300' : 'text-slate-500 hover:bg-slate-50'}`}>
                      Bucket {b}
                    </button>
                  ))}
                </div>
              )}

              <div className="overflow-x-auto max-h-[600px] custom-scrollbar">
                <table className="w-full text-left border-collapse">
                  <thead className="sticky top-0 bg-slate-100/95 backdrop-blur-md z-10 text-xs uppercase text-slate-500 font-black shadow-sm">
                    <tr>
                      <th className="p-4 w-12 text-center"></th>
                      <th className="p-4">Entity Code</th>
                      <th className="p-4 w-[20%]">Entity Name</th>
                      <th className="p-4 text-center">Coupon</th>
                      <th className="p-4 text-center">Mode</th>
                      <th className="p-4 text-center">Trigger Type</th>
                      <th className="p-4 text-right">Trigger Val</th>
                      <th className="p-4 text-center w-[250px]">Barcode Image</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {filteredTableData.map((row, idx) => (
                      <tr key={idx} className="hover:bg-indigo-50/50 dark:hover:bg-slate-800 transition-colors">
                        <td className="p-4 text-center align-middle">
                          <button onClick={() => {
                            setSelectedRows(prev => prev.includes(row.entity_code) ? prev.filter(c => c !== row.entity_code) : [...prev, row.entity_code]);
                          }} className={`transition-colors ${selectedRows.includes(row.entity_code) ? 'text-indigo-600' : 'text-slate-300 hover:text-indigo-400'}`}>
                            {selectedRows.includes(row.entity_code) ? <CheckSquare size={20}/> : <Square size={20}/>}
                          </button>
                        </td>
                        <td className="p-4 font-bold text-slate-700 dark:text-slate-300 align-middle">{row.entity_code}</td>
                        <td className="p-4 text-sm font-medium text-slate-600 dark:text-slate-400 truncate max-w-[200px] align-middle" title={row.entity_name}>{row.entity_name}</td>
                        <td className="p-4 text-center align-middle">
                          {row.coupon ? (
                            <span className="flex items-center justify-center gap-1 bg-amber-100 text-amber-700 px-2 py-1 rounded-lg text-xs font-bold border border-amber-200">
                              <Ticket size={14} /> {row.coupon}
                            </span>
                          ) : <span className="text-slate-300">-</span>}
                        </td>
                        <td className="p-4 text-center text-xs font-bold text-slate-500 align-middle">{row.mode}</td>
                        <td className="p-4 text-center text-xs text-slate-500 align-middle">{row.trigger_type}</td>
                        <td className="p-4 text-right font-mono font-bold text-emerald-600 align-middle">{row.trigger_value}</td>
                        <td className="p-4 flex justify-center items-center">
                          {row.barcode && row.barcode !== '-' ? (
                            <div className="bg-white p-3 border-2 border-slate-100 rounded-xl shadow-sm w-full flex justify-center">
                              <img 
                                src={`https://barcode.tec-it.com/barcode.ashx?data=${row.barcode}&code=Code128&translate-esc=on`} 
                                alt={row.barcode} 
                                className="h-16 w-full max-w-[220px] object-contain"
                              />
                            </div>
                          ) : <span className="text-slate-300 italic text-xs bg-slate-50 px-4 py-2 rounded-lg">No Barcode</span>}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {filteredTableData.length === 0 && (
                   <div className="p-10 text-center text-slate-400 font-bold">ไม่พบข้อมูลในเงื่อนไขนี้</div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // ==========================================
  // Render: หน้าหลัก (List View)
  // ==========================================
  return (
    <div className="p-6 h-full flex flex-col bg-slate-50 dark:bg-slate-900 animate-in fade-in">
      {error && (
        <div className="mb-6 p-4 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-3 text-rose-700">
          <AlertCircle size={20} />
          <span className="font-bold">{error}</span>
          <button onClick={loadPromotions} className="ml-auto underline text-sm">ลองใหม่</button>
        </div>
      )}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6 flex-none">
        <SummaryCard icon={<Tag/>} label="Unique Pro Codes" value={summaryCounts.proCode} color="text-indigo-600" bg="bg-indigo-100"/>
        <SummaryCard icon={<Calendar/>} label="Unique Start Dates" value={summaryCounts.startDate} color="text-rose-600" bg="bg-rose-100"/>
        <SummaryCard icon={<FileText/>} label="Unique Files" value={summaryCounts.fileName} color="text-emerald-600" bg="bg-emerald-100"/>
        <SummaryCard icon={<Layers/>} label="Unique Sheets" value={summaryCounts.sheet} color="text-amber-600" bg="bg-amber-100"/>
      </div>

      <div className="bg-white dark:bg-slate-950 rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex-1 flex flex-col min-h-0">
        <div className="p-4 border-b flex justify-between items-center bg-white dark:bg-slate-900 flex-none">
          <h2 className="text-lg font-black text-slate-800 dark:text-white flex items-center gap-2">
            All User Promotions
            {loading && <Loader2 className="animate-spin text-indigo-500" size={16} />}
          </h2>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input 
              type="text" placeholder="Search..." value={mainSearch} onChange={(e) => setMainSearch(e.target.value)}
              className="pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border-none rounded-xl outline-none focus:ring-2 ring-indigo-500 text-sm font-bold w-64 dark:text-white"
            />
          </div>
        </div>

        <div className="flex-1 overflow-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-50/95 backdrop-blur-sm dark:bg-slate-900/95 sticky top-0 z-10 text-xs uppercase font-black text-slate-500 shadow-sm border-b border-slate-100 dark:border-slate-800">
              <tr>
                <th className="p-4">Pro Code</th>
                <th className="p-4">Promotion Name</th>
                <th className="p-4 text-center">Start Date</th>
                <th className="p-4">File Name</th>
                <th className="p-4 text-center">Sheet</th>
                <th className="p-4 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {/* 📍 ใช้ paginatedList แทน filteredList ในการ render เพื่อแสดงเฉพาะหน้าปัจจุบัน */}
              {!loading && paginatedList.map(row => (
                <tr key={row.id} className="hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                  <td className="p-4 font-bold text-indigo-600">{row.pro_code}</td>
                  <td className="p-4 font-medium text-slate-700 dark:text-slate-300">{row.pro_name}</td>
                  <td className="p-4 text-center text-sm dark:text-slate-400">{row.start_date}</td>
                  <td className="p-4 text-sm text-slate-500 max-w-[200px] truncate" title={row.file_name}>{row.file_name}</td>
                  <td className="p-4 text-center font-bold text-slate-600 dark:text-slate-300">{row.sheet}</td>
                  <td className="p-4 text-center">
                    <button onClick={() => handleOpenDetail(row.id)} className="bg-indigo-50 text-indigo-600 hover:bg-indigo-600 hover:text-white px-4 py-2 rounded-xl font-bold text-xs transition-colors shadow-sm">
                      View Detail
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {!loading && filteredList.length === 0 && (
             <div className="p-10 text-center text-slate-400 font-bold">ไม่พบข้อมูล หรือกำลังรอการเชื่อมต่อ API</div>
          )}
        </div>

        {/* 📍 เพิ่ม Footer สำหรับระบบ Pagination */}
        {!loading && filteredList.length > 0 && (
          <div className="p-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between bg-white dark:bg-slate-900 flex-none">
            
            {/* เลือกจำนวนรายการต่อหน้า */}
            <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400 font-medium">
              <span>แสดง</span>
              <select
                value={rowsPerPage}
                onChange={(e) => setRowsPerPage(Number(e.target.value))}
                className="border border-slate-200 dark:border-slate-700 rounded-lg px-2 py-1.5 bg-slate-50 dark:bg-slate-800 outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
              >
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
              <span>รายการต่อหน้า</span>
            </div>

            {/* กลุ่มปุ่มเปลี่ยนหน้า */}
            <div className="flex items-center gap-4 text-sm text-slate-600 dark:text-slate-300">
              <span className="font-medium">
                หน้า <span className="text-indigo-600">{currentPage}</span> จาก {totalPages} 
                <span className="text-slate-400 ml-1">({filteredList.length} รายการ)</span>
              </span>
              
              <div className="flex gap-1">
                <button
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 hover:text-indigo-600 disabled:opacity-40 disabled:hover:bg-transparent disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronLeft size={20} />
                </button>
                <button
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 hover:text-indigo-600 disabled:opacity-40 disabled:hover:bg-transparent disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronRight size={20} />
                </button>
              </div>
            </div>

          </div>
        )}

      </div>
    </div>
  );
}