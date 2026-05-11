import api from '../lib/axios';

/**
 * Service สำหรับจัดการข้อมูลการผลิตและวิเคราะห์การทับซ้อน (Overlap)
 */
const productionService = {
  
  /**
   * ส่งข้อมูลรอบการผลิตไปให้ Python Backend วิเคราะห์
   * @param {Array} productionData - รายการข้อมูล [ {round_id, item_id, start_date, end_date}, ... ]
   * @returns {Promise} - ผลลัพธ์การวิเคราะห์ช่วงที่ทับซ้อน
   */
  analyzeOverlap: async (productionData) => {
    try {
      // เรียกใช้ Instance ของ axios จากที่เราตั้งค่าไว้ใน lib
      const response = await api.post('/API/analyze-overlap', productionData);
      
      // คืนค่าข้อมูลที่ประมวลผลเสร็จแล้วกลับไปให้ Component
      return response.data;
    } catch (error) {
      // จัดการ Error เฉพาะส่วนของ Service นี้
      throw new Error(error.response?.data?.message || "Failed to analyze production overlap");
    }
  },

  /**
   * (ตัวอย่าง) ฟังก์ชันดึงประวัติการผลิตย้อนหลัง
   */
  getProductionHistory: async () => {
    const response = await api.get('/API/production-history');
    return response.data;
  }
};

export default productionService;