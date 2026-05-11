/**
 * ฟังก์ชันสำหรับแปลงข้อมูลจาก API (Raw) ให้เป็นรูปแบบที่ Component ตารางพร้อมใช้งาน
 * @param {Object|Array} apiData - ข้อมูลดิบจาก Backend
 * @returns {Array} ข้อมูลที่ผ่านการ Transform แล้ว
 */
export const transformApiDataToTableFormat = (apiData) => {
      // 1. Validation: ตรวจสอบเบื้องต้นว่ามีข้อมูลส่งมาไหม
  if (!apiData || typeof apiData !== 'object') {
    console.warn("Transform Warning: apiData is empty or not an object");
    return [];
  }

  // 2. แปลง Object ให้เป็น Array และ Map ข้อมูลตามความต้องการของ UI
  return Object.values(apiData).map((group) => {
    // คำนวณความต่าง (Diff) ระหว่าง Read และ Write ภายใน Function เลย
    const rRow = Number(group.r_row) || 0;
    const wRow = Number(group.w_row) || 0;
    const diff = rRow - wRow;

    return {
      // --- ข้อมูลสำหรับตารางหลัก (Outer Table) ---
      id: group.id,
      user: group.user || 'System',
      remark: group.remark || '-',
      date: group.date ? new Date(group.date).toLocaleString('th-TH') : '-',
      fileCount: Number(group.file_name) || 0,
      sheetCount: Number(group.sheet) || 0,
      sumRRow: rRow,
      sumWRow: wRow,
      diffRow: diff,
      
      // --- ข้อมูลสำหรับตารางใน Modal (Inner Table) ---
      // ตรวจสอบว่ามีข้อมูลรายละเอียด (Value) ส่งมาไหม ถ้าไม่มีให้เป็น Array ว่าง
      details: Array.isArray(group.value) 
        ? group.value.map(detail => ({
            file_id: detail.file_id || detail.id,
            file_name: detail.file_name || 'Unnamed File',
            sheet: detail.sheet || '-',
            r_row: Number(detail.r_row) || 0,
            w_row: Number(detail.w_row) || 0,
            status: Number(detail.status) || 0, // เช่น 4 = Success
            remark: detail.remark || '-',
            description: detail.Remark || '-' // รองรับ Case sensitive จาก API
          }))
        : []
    };
  });
};