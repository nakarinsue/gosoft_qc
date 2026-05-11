import apiService from './apiServices';

export const promotionService = {
  
  getSearch: async (versionId = 0, skip = 0, limit = 100) => {
    try {
        // ส่งค่าพารามิเตอร์ที่รับมา ไปให้ฟังก์ชัน showAll ต่อ
        const res = await apiService.defect.showAll(versionId, skip, limit);
        
        return res?.data || res?.items || res || [];
    } catch (e) {
        console.error("API Error (getSearch):", e);
        return [];
    }
  },
  updateStatus: async (ids, newStatus) => {
    try {
        await apiService.defect.update({ ids, status: newStatus });
        return true;
    } catch (e) { 
        console.error("API Error (updateStatus):", e);
        return false; 
    }
  },
  
  updateDetail: async (data) => {
     try {
        await apiService.defect.update({
            id: data.id, 
            system: data.system, 
            detail: data.detail,
            types: data.types, 
            remark: data.remark, 
            status: data.status, 
            user_mk: data.user_mk
        });
        return true;
    } catch (e) { 
        console.error("API Error (updateDetail):", e);
        return false; 
    }
  },
  
  exportDefect: async (ids, userLogin) => {
    try {
        const blob = await apiService.defect.exportDefect({ user_login: userLogin, ids });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `Export_Defect_${new Date().getTime()}.xlsx`; 
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        return true;
    } catch (e) {
        console.error("API Error (exportDefect):", e);
        alert("เกิดข้อผิดพลาดในการ Export ไฟล์");
        return false;
    }
  }
};