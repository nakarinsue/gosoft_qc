// services/productService.js

import { API_BASE_URL } from '../config';

/**
 * ฟังก์ชันดึงข้อมูลสินค้า (ปรับปรุง Payload)
 * @param {string} store - รหัสสาขา
 * @param {string} productCode - รหัสสินค้า (รับมา 1 ค่า เเต่ส่งไปเป็น Array)
 */
export const fetchProductDetail = async (store, productCode) => {
  try {
    // เตรียม Payload ตาม Format ใหม่
    const payload = {
      store: store,
      product: [productCode] // ห่อ productCode ใน Array []
    };

    const response = await fetch(`${API_BASE_URL}/PROMOTION/INFO`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload), // ส่ง payload ที่เตรียมไว้
    });

    const data = await response.json();

    // ตรวจสอบ Return Code ("0000")
    if (data.returnCode === "0000" && data.result && data.result.length > 0) {
      // เนื่องจาก API อาจส่งกลับมาหลายตัว (เพราะส่ง request เป็น array) 
      // ในที่นี้เราดึงตัวแรกสุดที่ตรงกับที่ค้นหามาแสดง
      return data.result[0];
    } else {
      throw new Error(data.returnMessage || "ไม่พบข้อมูลสินค้า");
    }
  } catch (error) {
    console.error("API Error:", error);
    throw error;
  }
};