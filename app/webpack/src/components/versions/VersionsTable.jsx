// components/versions/VersionsTable.jsx
import React, { useState, useMemo } from 'react';
import { Plus, Search, Inbox } from 'lucide-react';

// นำเข้า UI Widgets ส่วนกลาง (ปรับ path ตามโครงสร้างจริงของคุณ)
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../ui/table';

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
    <div className="bg-white shadow-sm border border-slate-200 rounded-[2rem] p-6 space-y-6">
      
      {/* Header / Toolbar Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        
        {/* ฝั่งซ้าย: ปุ่มสร้าง Version */}
        <div>
          {onOpenCreate && (
            <Button 
              onClick={onOpenCreate}
              className="px-5 py-6 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-lg shadow-blue-600/30 transition-all flex items-center gap-2 active:scale-95"
            >
              <Plus className="size-5" /> 
              <span>สร้าง Version ใหม่</span>
            </Button>
          )}
        </div>

        {/* ฝั่งขวา: ช่องค้นหา */}
        <div className="relative w-full md:w-80">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none z-10">
            <Search className="size-4 text-slate-400" />
          </div>
          <Input 
            type="text" 
            placeholder="ค้นหา Title หรือ SR No..." 
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1); // รีเซ็ตกลับไปหน้าแรกเมื่อค้นหา
            }}
            className="w-full pl-11 pr-4 py-6 border-slate-200 rounded-xl bg-slate-50 focus-visible:bg-white text-sm font-medium text-slate-700"
          />
        </div>
      </div>

      {/* Table Section */}
      <div className="rounded-2xl border border-slate-100 overflow-hidden">
        <Table>
          <TableHeader className="bg-slate-50">
            <TableRow className="hover:bg-transparent">
              <TableHead className="w-[80px] font-black text-slate-500 uppercase">No.</TableHead>
              <TableHead className="font-black text-slate-500 uppercase">Title</TableHead>
              <TableHead className="font-black text-slate-500 uppercase">Sub Title</TableHead>
              <TableHead className="font-black text-slate-500 uppercase max-w-[300px]">Detail</TableHead>
              <TableHead className="font-black text-slate-500 uppercase">SR No</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {currentTableData.map((item, index) => (
              <TableRow 
                key={item.id} 
                onClick={() => onEditRow(item.id)}
                className="cursor-pointer group hover:bg-blue-50/50 transition-colors"
              >
                <TableCell className="font-medium text-slate-500">
                  {(currentPage - 1) * itemsPerPage + index + 1}
                </TableCell>
                <TableCell className="font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                  {item.title}
                </TableCell>
                <TableCell className="text-slate-600">
                  {item.sub_title}
                </TableCell>
                <TableCell className="text-slate-600 max-w-[300px] truncate">
                  {item.detail}
                </TableCell>
                <TableCell className="font-medium text-slate-700">
                  {item.sr_no}
                </TableCell>
              </TableRow>
            ))}

            {/* Empty State */}
            {currentTableData.length === 0 && (
              <TableRow className="hover:bg-transparent">
                <TableCell colSpan={5} className="h-48 text-center">
                  <div className="flex flex-col items-center justify-center text-slate-400 gap-3">
                    <div className="p-4 bg-slate-100 rounded-full">
                      <Inbox className="size-8 text-slate-300" />
                    </div>
                    <p className="font-medium text-sm">ไม่พบข้อมูลที่ค้นหา</p>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex justify-between items-center pt-4 border-t border-slate-100">
          <Button 
            variant="outline"
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(prev => prev - 1)}
            className="rounded-xl font-bold px-5"
          >
            ก่อนหน้า
          </Button>
          
          <span className="text-sm font-bold text-slate-500 bg-slate-50 px-4 py-2 rounded-lg">
            หน้า {currentPage} จาก {totalPages}
          </span>
          
          <Button 
            variant="outline"
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage(prev => prev + 1)}
            className="rounded-xl font-bold px-5"
          >
            ถัดไป
          </Button>
        </div>
      )}

    </div>
  );
};

export default VersionsTable;