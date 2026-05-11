import React, { useState, useEffect } from 'react';
import { Eye } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

// --- นำเข้า API Service กลาง ---
import apiService from '../../services/apiServices'; // ปรับ path ให้ตรงกับตำแหน่งไฟล์ของคุณ

export default function ImportExcelTable({ selectedVersion, refreshTrigger, onOpenImport }) {
  const [tableData, setTableData] = useState([]);
  
  // สมมติว่ามีฟังก์ชัน transform ข้อมูลอยู่แล้วตามที่คุณแจ้งในคอมเมนต์
  const transformApiDataToTableFormat = (data) => {
    // ใส่ Logic การแปลงข้อมูลเดิมของคุณที่นี่ (ถ้ามี)
    return data || []; 
  };

  // ดึงข้อมูลใหม่ทุกครั้งที่ Version เปลี่ยน (Auto-Filter by Version)
  useEffect(() => {
    // ป้องกันการยิง API ถ้ายังไม่ได้เลือก Version หรือ Version ติดลบ
    if (selectedVersion === undefined || selectedVersion === -1) return;

    const fetchData = async () => {
      try {
        // 📍 เรียกใช้ API ผ่าน Service กลาง 
        // อ้างอิงจากโครงสร้าง API กลาง ที่ดึงข้อมูล History/Report ของ Import
        // หากใน apiService.js ของคุณฟังก์ชันชื่ออื่น ให้เปลี่ยนตรงนี้ให้ตรงกันครับ
        const data = await apiService.upload.getFileInformation(selectedVersion);
        
        // 📍 กรณีที่ backend ส่งข้อมูลมาใน data.result หรือ data.data
        // ขึ้นอยู่กับโครงสร้าง Response จริง ให้คุณปรับแก้ตรงนี้นิดหน่อยครับ
        const resultData = data?.data || data || []; 

        setTableData(transformApiDataToTableFormat(resultData));
      } catch (error) {
        console.error('Failed to fetch table data:', error);
      }
    };
    
    fetchData();
  }, [selectedVersion, refreshTrigger]);

  return (
    <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-sm border border-slate-200 dark:border-slate-800 flex flex-col h-full overflow-hidden">
      {/* Header Toolbar */}
      <div className="p-8 border-b dark:border-slate-800 flex justify-between items-center bg-white dark:bg-slate-900 z-20">
        <h3 className="font-black text-2xl tracking-tighter">Workspace Ver: {selectedVersion || 'ALL'}</h3>
        <button onClick={onOpenImport} className="bg-indigo-600 text-white px-8 py-3 rounded-2xl font-black shadow-lg hover:bg-indigo-700 transition-all">
          IMPORT TO VER: {selectedVersion || '...'}
        </button>
      </div>

      {/* ตารางข้อมูล */}
      <div className="flex-1 overflow-auto custom-scrollbar relative">
        <Table className="border-separate border-spacing-y-2 px-4">
          <TableHeader className="sticky top-0 z-30">
            <TableRow className="border-none hover:bg-transparent">
              <TableHead className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-md font-black py-5 shadow-sm">ID</TableHead>
              <TableHead className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-md font-black py-5 shadow-sm">Date</TableHead>
              <TableHead className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-md font-black py-5 shadow-sm">User</TableHead>
              <TableHead className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-md font-black py-5 shadow-sm text-right">Read</TableHead>
              <TableHead className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-md font-black py-5 shadow-sm text-right">Write</TableHead>
              <TableHead className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-md font-black py-5 shadow-sm text-center">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {tableData.length === 0 ? (
               <TableRow>
                 <TableCell colSpan="6" className="text-center py-8 text-slate-400 font-bold">ไม่มีข้อมูลนำเข้า</TableCell>
               </TableRow>
            ) : (
              tableData.map(row => (
                <TableRow key={row.id} className="bg-slate-50/50 dark:bg-slate-800/20 border-none group transition-all">
                  <TableCell className="font-bold py-4 rounded-l-2xl">{row.id}</TableCell>
                  <TableCell className="text-slate-500 text-xs">{row.date}</TableCell>
                  <TableCell className="font-bold text-indigo-600">{row.user}</TableCell>
                  <TableCell className="text-right font-mono font-bold text-emerald-600">{row.sumRRow}</TableCell>
                  <TableCell className="text-right font-mono font-bold text-blue-600">{row.sumWRow}</TableCell>
                  <TableCell className="text-center rounded-r-2xl">
                     <button className="p-2 bg-white dark:bg-slate-700 rounded-xl shadow-sm hover:scale-110 transition-transform"><Eye size={18}/></button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}