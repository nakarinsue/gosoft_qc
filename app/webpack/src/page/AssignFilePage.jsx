import React, { useState, useEffect, useMemo, useCallback } from 'react';
// import AssignUserModal from '../components/assign/AssignUserModal'; // 📍 ปิดไว้เนื่องจาก Auto Assign โฉมใหม่ให้ Backend จัดการ
import { Save, FileSpreadsheet, BarChart2, X, Users, UserPlus } from 'lucide-react';
import { Dropdown } from 'primereact/dropdown';
import { MultiSelect } from 'primereact/multiselect'; // 📍 เพิ่ม Import MultiSelect
import EnterpriseDataTable from '../components/EnterpriseDataTable'; 
import apiService from '../services/apiServices';

export default function AssignFilePage({ selectedVersion }) {
    const [loading, setLoading] = useState(false);
    const [editingData, setEditingData] = useState([]); 
    const [allUsers, setAllUsers] = useState([]); 
    const [isSummaryOpen, setIsSummaryOpen] = useState(false); 
    const [selectedAutoUsers, setSelectedAutoUsers] = useState([]); // 📍 เพิ่ม State นี้
    // 1. จัด Format User สำหรับ Dropdown
    const userOptions = useMemo(() => {
        return allUsers.map(u => ({
            label: u.username || u.name || `User ${u.id || u.user_id}`, 
            value: String(u.user_id || u.id) 
        }));
    }, [allUsers]);

    // 2. โหลดข้อมูล (GET)
    const initPage = useCallback(async () => {
        if (selectedVersion === -1) {
            setEditingData([]);
            return;
        }
        setLoading(true);
        try {
            // 📍 ดึงข้อมูลไฟล์ 100 รายการแรก (ปรับ skip/limit ได้ตามต้องการ)
            const [filesRes, usersRes] = await Promise.all([
                apiService.assign.getAssign(selectedVersion, 0, 1000), 
                apiService.auth.getUsers()                            
            ]);
            
            const safeFilesRes = filesRes?.data || filesRes || [];
            
            // 📍 สร้าง Unique Key และจัดเตรียม Data
            const processedFiles = safeFilesRes.map((item, index) => ({
                ...item,
                unique_row_key: `file_${item.file_id}_${index}` 
            }));

            // จัดการรายชื่อ User
            let parsedUsers = [];
            if (Array.isArray(usersRes)) parsedUsers = usersRes;
            else if (usersRes?.data && Array.isArray(usersRes.data)) parsedUsers = usersRes.data;
            else if (usersRes?.users && Array.isArray(usersRes.users)) parsedUsers = usersRes.users;

            const uniqueUsersMap = new Map();
            parsedUsers.forEach(u => {
                const uid = String(u.user_id || u.id || u.USER_ID);
                if (!uniqueUsersMap.has(uid)) uniqueUsersMap.set(uid, u);
            });

            setEditingData(processedFiles); 
            setAllUsers(Array.from(uniqueUsersMap.values()));
        } catch (error) {
            alert("ไม่สามารถโหลดข้อมูลได้: " + (error.message || "เกิดข้อผิดพลาด"));
        } finally {
            setLoading(false);
        }
    }, [selectedVersion]);

    useEffect(() => { initPage(); }, [initPage]);

    // 3. ฟังก์ชันอัปเดตข้อมูล (Manual Assign ฝั่ง Client)
    const handleManualChange = useCallback((targetItem, newUserId) => {
        setEditingData(prevData => {
            const newData = [...prevData];
            const dataIndex = newData.findIndex(item => item.unique_row_key === targetItem.unique_row_key);
            if (dataIndex !== -1) {
                // 📍 อัปเดต field user_assign ตาม API ใหม่
                newData[dataIndex] = { ...newData[dataIndex], user_assign: newUserId ? Number(newUserId) : null };
            }
            return newData;
        });
    }, []);

    // 📍 4. ฟังก์ชัน Auto Assign (POST)
const handleAutoAssign = async () => {
        // 📍 1. ตรวจสอบว่ามีการเลือก User สำหรับ Auto Assign หรือยัง
        if (!selectedAutoUsers || selectedAutoUsers.length === 0) {
            return alert('กรุณาเลือกรายชื่อผู้ใช้งานสำหรับทำ Auto Assign อย่างน้อย 1 คน');
        }

        const fileIdsToAssign = editingData.map(item => item.file_id);
        if (fileIdsToAssign.length === 0) return alert('ไม่มีไฟล์ให้ดำเนินการแจกจ่าย');

        setLoading(true);
        try {
            // 📍 2. แปลง Array ของ value ที่เลือกมา (String) ให้เป็น Number
            const userIdsToAssign = selectedAutoUsers.map(id => Number(id));

            const payload = { user_id: userIdsToAssign };
            const response = await apiService.assign.autoAssign(payload);
            
            const assignedResult = response?.data || response || [];

            // 📍 3. นำ Result มา Map อัปเดตใน State ตารางตาม file_id (Logic เดิม)
            setEditingData(prevData => prevData.map(item => {
                const match = assignedResult.find(r => Number(r.file_id) === Number(item.file_id));
                if (match && match.user_assign !== undefined && match.user_assign !== null) {
                    return { ...item, user_assign: Number(match.user_assign) };
                }
                return item;
            }));

            alert('ดำเนินการ Auto Assign สำเร็จ กรุณากด Confirm เพื่อบันทึก');
        } catch (error) {
            alert('เกิดข้อผิดพลาดในการ Auto Assign: ' + (error.message || "Unknown error"));
        } finally {
            setLoading(false);
        }
    };

    // 📍 5. ฟังก์ชัน Confirm บันทึกข้อมูล (PUT)
    const handleFinalSave = async () => {
        setLoading(true);
        try {
            // 📍 เตรียม Payload: กรองเอาเฉพาะที่มี user_assign และไม่ส่งค่า null
            const payload = editingData
                .filter(item => item.user_assign !== null && item.user_assign !== undefined)
                .map(item => ({
                    file_id: Number(item.file_id),
                    user_assign: Number(item.user_assign)
                }));

            if (payload.length === 0) {
                alert('ไม่พบข้อมูลการมอบหมายงานที่ต้องบันทึก');
                return;
            }

            await apiService.assign.updateAssign(payload);
            
            alert('บันทึกการแจกจ่ายงานสำเร็จ!');
            initPage(); 
        } catch (error) {
            alert('เกิดข้อผิดพลาดในการบันทึก: ' + (error.message || "Unknown error"));
        } finally {
            setLoading(false);
        }
    };

    const hasAnyAssignment = useMemo(() => {
        return Array.isArray(editingData) && editingData.some(item => item.user_assign != null);
    }, [editingData]);

    // -------------------------------------------------------------
    // 📍 กำหนด Column ของตาราง
    // -------------------------------------------------------------
    const tableColumns = useMemo(() => [
        {
            field: "file_name",
            header: "Worksheet Details",
            style: { minWidth: '350px' },
            body: (rowData) => (
                <div className="flex flex-col py-1 min-w-0">
                    <p className="font-black text-slate-800 text-[14px] mb-2 truncate hover:text-indigo-600 transition-colors" title={rowData.file_name}>
                        {rowData.file_name || '-'}
                    </p>
                    <div className="flex flex-wrap gap-2">
                        <span className="text-[10px] font-bold text-slate-600 bg-slate-100 px-2.5 py-1 rounded-md border border-slate-200 uppercase tracking-wider">
                            SHEET: {rowData.sheet || '-'}
                        </span>
                        <span className="text-[10px] font-bold text-slate-600 bg-slate-100 px-2.5 py-1 rounded-md border border-slate-200 uppercase tracking-wider">
                            VERSION NO: {rowData.version_no || '-'}
                        </span>
                    </div>
                </div>
            )
        },
        {
            field: "pro_code_count",
            header: "Total Value",
            style: { width: '20%', minWidth: '150px', textAlign: 'center' },
            body: (rowData) => (
                <span className="font-mono font-black text-emerald-600 text-[16px] bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-100">
                    {(Number(rowData.pro_code_count) || 0).toLocaleString()}
                </span>
            )
        },
        {
            field: "user_assign",
            header: "Assigned To",
            style: { width: '30%', minWidth: '250px' },
            body: (rowData) => (
                <Dropdown 
                    value={rowData.user_assign ? String(rowData.user_assign) : null} 
                    options={userOptions} 
                    onChange={(e) => handleManualChange(rowData, e.value)} 
                    placeholder="-- UNASSIGNED --" 
                    className="custom-dropdown w-full min-w-[200px]" 
                    showClear filter filterPlaceholder="Search user..."
                />
            )
        }
    ], [userOptions, handleManualChange]);

    // 📍 ปุ่ม Toolbar ขวาบน
    const actionButtons = (
        <>
            <button onClick={() => setIsSummaryOpen(true)} disabled={!hasAnyAssignment} className={`px-6 py-3 font-black rounded-2xl transition-all flex items-center gap-2 text-sm ${hasAnyAssignment ? 'bg-indigo-50 text-indigo-600 hover:bg-indigo-100' : 'bg-slate-50 text-slate-400 opacity-60 cursor-not-allowed'}`}>
                <BarChart2 size={18} /> SUMMARY
            </button>

            <div className="w-px h-8 bg-slate-200 mx-1 hidden lg:block"></div>

            {/* 📍 เพิ่มช่องตัวเลือก MultiSelect สำหรับ Auto Assign */}
            <MultiSelect 
                value={selectedAutoUsers} 
                options={userOptions} 
                onChange={(e) => setSelectedAutoUsers(e.value)} 
                placeholder="เลือก User เพื่อแจกงาน..." 
                maxSelectedLabels={2}
                filter 
                className="w-full sm:w-[240px] rounded-2xl border-slate-200" 
            />

            <button onClick={handleAutoAssign} disabled={loading} className={`px-6 py-3 font-black rounded-2xl transition-all flex items-center gap-2 shadow-lg text-sm ${loading ? 'bg-slate-400 text-slate-200 cursor-wait' : 'bg-slate-900 text-white hover:bg-slate-800'}`}>
                <UserPlus size={18} /> AUTO ASSIGN
            </button>

            <div className="w-px h-8 bg-slate-200 mx-1 hidden lg:block"></div>

            <button onClick={handleFinalSave} disabled={!hasAnyAssignment || loading} className={`px-8 py-3 font-black rounded-2xl transition-all flex items-center gap-2 text-sm ${hasAnyAssignment && !loading ? 'bg-emerald-500 text-white shadow-emerald-500/30 hover:bg-emerald-600 shadow-lg' : 'bg-slate-50 text-slate-400 opacity-60 cursor-not-allowed'}`}>
                <Save size={18} /> CONFIRM
            </button>
        </>
    );
    // -------------------------------------------------------------
    // 📍 Summary Calculation (ปรับ field ให้ตรง API)
    // -------------------------------------------------------------
    const summaryData = useMemo(() => {
        const summary = {};
        editingData.forEach(item => {
            const userId = item.user_assign;
            if (!userId) return; 
            if (!summary[userId]) {
                const userInfo = allUsers.find(u => String(u.user_id || u.id) === String(userId));
                summary[userId] = { userId, userName: userInfo?.username || userInfo?.name || `User ID: ${userId}`, totalFiles: 0, sheets: new Set(), totalValue: 0 };
            }
            summary[userId].totalFiles += 1;
            if (item.sheet) summary[userId].sheets.add(item.sheet);
            summary[userId].totalValue += (Number(item.pro_code_count) || 0);
        });
        return Object.values(summary).map(u => ({...u, fileCount: u.totalFiles, sheetCount: u.sheets.size})).sort((a, b) => b.totalValue - a.totalValue); 
    }, [editingData, allUsers]);
    
    const maxSummaryValue = summaryData.length > 0 ? Math.max(...summaryData.map(d => d.totalValue)) : 1;

    // --- Empty State ---
    if (selectedVersion === -1) {
        return (
            <div className="flex flex-col items-center justify-center h-[calc(100vh-4rem)] text-slate-400 bg-white rounded-[3rem] m-6 border border-slate-200 border-dashed shadow-sm">
                <FileSpreadsheet size={64} className="mb-4 opacity-20" />
                <p className="font-black text-lg tracking-[0.2em] uppercase">กรุณาเลือก Version</p>
            </div>
        );
    }

    return (
        <div className="p-4 sm:p-6 bg-slate-50 h-screen flex flex-col overflow-hidden animate-in fade-in duration-500">            
            <div className="max-w-[1600px] w-full mx-auto flex-1 flex flex-col min-h-0 gap-4">                
                <EnterpriseDataTable 
                    data={editingData}
                    columns={tableColumns}
                    loading={loading}
                    dataKey="unique_row_key"
                    globalFilterFields={['file_name', 'sheet']}
                    searchPlaceholder="Search File, Sheet..."
                    actionButtons={actionButtons}
                />
            </div>

            {/* --- SUMMARY POPUP --- */}
            {isSummaryOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in transition-all">
                    <div className="bg-white w-full max-w-5xl rounded-[3rem] shadow-2xl overflow-hidden animate-in zoom-in-95 flex flex-col max-h-[90vh] border border-white/20">
                        <div className="p-6 sm:p-8 border-b border-slate-100 flex justify-between items-center shrink-0">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl"><BarChart2 size={28} /></div>
                                <div>
                                    <h4 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">Assignment Summary</h4>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mt-1">Workload Distribution Overview</p>
                                </div>
                            </div>
                            <button onClick={() => setIsSummaryOpen(false)} className="p-3 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-full transition-all active:scale-90"><X size={24}/></button>
                        </div>
                        
                        <div className="p-6 sm:p-8 overflow-y-auto custom-scrollbar flex-1 space-y-8 bg-slate-50/50">
                            {/* กราฟแท่งแนวนอน */}
                            <div className="bg-white rounded-[2rem] p-6 sm:p-8 border border-slate-100 shadow-sm">
                                <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
                                    <Users size={16} className="text-indigo-500"/> Value Distribution by User
                                </h5>
                                <div className="space-y-4">
                                    {summaryData.map(data => (
                                        <div key={data.userId} className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-6 group">
                                            <div className="w-full sm:w-32 truncate text-xs font-black text-slate-700 sm:text-right group-hover:text-indigo-600 transition-colors">{data.userName}</div>
                                            <div className="flex-1 h-3 bg-slate-100 rounded-full overflow-hidden flex items-center shadow-inner">
                                                <div className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full transition-all duration-1000 ease-out relative" style={{ width: `${(data.totalValue / maxSummaryValue) * 100}%` }} />
                                            </div>
                                            <div className="w-full sm:w-28 sm:text-right text-sm font-mono font-black text-indigo-600">{data.totalValue.toLocaleString()}</div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* ตารางสรุปยอด */}
                            <div className="bg-white rounded-[2rem] border border-slate-100 overflow-hidden shadow-sm flex flex-col">
                                <div className="bg-slate-50/50 border-b border-slate-100 pr-2 shrink-0 overflow-x-auto">
                                    <table className="w-full text-left table-fixed min-w-[600px]">
                                        <thead>
                                            <tr className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em]">
                                                <th className="py-4 pl-6 pr-4 w-[40%]">Assigned User</th>
                                                <th className="py-4 px-4 w-[20%] text-center">Files</th>
                                                <th className="py-4 px-4 w-[20%] text-center">Sheets</th>
                                                <th className="py-4 pl-4 pr-6 w-[20%] text-right">Value</th>
                                            </tr>
                                        </thead>
                                    </table>
                                </div>
                                <div className="overflow-y-auto custom-scrollbar p-2 max-h-[30vh] overflow-x-auto">
                                    <table className="w-full text-left border-separate border-spacing-y-2 table-fixed min-w-[600px]">
                                        <tbody>
                                            {summaryData.map(data => (
                                                <tr key={data.userId} className="bg-white rounded-2xl shadow-sm border border-slate-100 hover:border-indigo-200 transition-all">
                                                    <td className="w-[40%] py-4 px-4 font-bold text-slate-800 rounded-l-2xl truncate" title={data.userName}>{data.userName}</td>
                                                    <td className="w-[20%] py-4 px-4 text-center font-black text-slate-500 bg-slate-50/50">{data.fileCount}</td>
                                                    <td className="w-[20%] py-4 px-4 text-center font-black text-slate-500">{data.sheetCount}</td>
                                                    <td className="w-[20%] py-4 px-4 text-right font-mono text-emerald-600 font-black rounded-r-2xl bg-emerald-50/30 truncate">{data.totalValue.toLocaleString()}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}