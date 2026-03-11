// components/versions/VersionsTable.jsx
import React, { useState, useMemo } from 'react';
import { LayoutGrid, Plus, Search } from 'lucide-react'; // เพิ่ม Icons เพื่อความสวยงาม

const VersionsTable = ({ data, onEditRow, onOpenCreate }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // กรองและเรียงลำดับข้อมูล
  const filteredData = useMemo(() => {
    let filtered = data.filter(item => 
      (item.title && item.title.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (item.sr_no && item.sr_no.toLowerCase().includes(searchTerm.toLowerCase()))
    );
    // เรียง ID จากมากไปน้อย (ใหม่ไปเก่า)
    return filtered.sort((a, b) => b.id - a.id);
  }, [data, searchTerm]);

  // คำนวณข้อมูลสำหรับ Pagination
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const currentTableData = useMemo(() => {
    const firstPageIndex = (currentPage - 1) * itemsPerPage;
    const lastPageIndex = firstPageIndex + itemsPerPage;
    return filteredData.slice(firstPageIndex, lastPageIndex);
  }, [currentPage, filteredData]);

  return (
    <div className="bg-white shadow-sm border border-slate-200 rounded-[2rem] p-6">
      
      {/* Header / Toolbar Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        
        {/* ฝั่งซ้าย: ปุ่ม App และ ปุ่มสร้าง Version */}
        <div className="flex items-center gap-3">
          
          {onOpenCreate && (
            <button 
              onClick={onOpenCreate}
              className="px-5 py-2.5 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 shadow-lg shadow-blue-600/30 transition-all flex items-center gap-2 active:scale-95"
            >
              <Plus size={18} /> สร้าง Version ใหม่
            </button>
          )}
        </div>

        {/* ฝั่งขวา: ช่องค้นหา */}
        <div className="relative w-full md:w-80">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Search size={18} className="text-slate-400" />
          </div>
          <input 
            type="text" 
            placeholder="ค้นหา Title หรือ SR No..." 
            className="w-full pl-11 pr-4 py-2.5 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 focus:outline-none text-sm font-medium text-slate-700 transition-all"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1); // รีเซ็ตกลับไปหน้าแรกเมื่อค้นหา
            }}
          />
        </div>
      </div>

      {/* Table Section */}
      <div className="overflow-x-auto rounded-2xl border border-slate-100">
        <table className="min-w-full table-auto">
          <thead className="bg-slate-50 border-b border-slate-100">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-black text-slate-500 uppercase tracking-wider">No.</th>
              <th className="px-6 py-4 text-left text-xs font-black text-slate-500 uppercase tracking-wider">Title</th>
              <th className="px-6 py-4 text-left text-xs font-black text-slate-500 uppercase tracking-wider">Sub Title</th>
              <th className="px-6 py-4 text-left text-xs font-black text-slate-500 uppercase tracking-wider">Detail</th>
              <th className="px-6 py-4 text-left text-xs font-black text-slate-500 uppercase tracking-wider">SR No</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {currentTableData.map((item, index) => (
              <tr 
                key={item.id} 
                className="hover:bg-blue-50/50 cursor-pointer transition-colors group"
                onClick={() => onEditRow(item.id)}
              >
                <td className="px-6 py-4 text-sm font-medium text-slate-500">{(currentPage - 1) * itemsPerPage + index + 1}</td>
                <td className="px-6 py-4 text-sm font-bold text-slate-900 group-hover:text-blue-600 transition-colors">{item.title}</td>
                <td className="px-6 py-4 text-sm text-slate-600">{item.sub_title}</td>
                <td className="px-6 py-4 text-sm text-slate-600 max-w-xs truncate">{item.detail}</td>
                <td className="px-6 py-4 text-sm font-medium text-slate-700">{item.sr_no}</td>
              </tr>
            ))}
            {currentTableData.length === 0 && (
              <tr>
                <td colSpan="5" className="text-center py-12">
                  <p className="text-slate-500 font-medium">ไม่พบข้อมูลที่ค้นหา</p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex justify-between items-center mt-6 pt-4 border-t border-slate-100">
          <button 
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(prev => prev - 1)}
            className="px-5 py-2.5 border border-slate-200 bg-white text-slate-600 font-bold rounded-xl hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            ก่อนหน้า
          </button>
          <span className="text-sm font-bold text-slate-500 bg-slate-50 px-4 py-2 rounded-lg">
            หน้า {currentPage} จาก {totalPages}
          </span>
          <button 
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage(prev => prev + 1)}
            className="px-5 py-2.5 border border-slate-200 bg-white text-slate-600 font-bold rounded-xl hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            ถัดไป
          </button>
        </div>
      )}
    </div>
  );
};

export default VersionsTable;