import { API_BASE_URL } from '../config';

// Helper Wrapper
const apiCall = async (endpoint, method = 'GET', body = null) => {
  try {
    const options = {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: body ? JSON.stringify(body) : null,
    };
    const response = await fetch(`${API_BASE_URL}${endpoint}`, options);
    if (!response.ok) throw new Error(`API Error: ${response.statusText}`);
    return await response.json();
  } catch (error) {
    console.error(`CouponService Error [${endpoint}]:`, error);
    throw error;
  }
};

const couponService = {
  // ดึงข้อมูลทั้งหมด
  getData: async () => {
    return await apiCall('/COUPON');
  },

  // Assign งานให้ MK
  assignOwner: async (username, promotionCodes) => {
    // API Spec: { "USERNAME": string, "FILE_ID": [string] }
    // หมายเหตุ: ในโค้ดเดิมใช้ promotion_code เป็น ID ในการส่ง
    return await apiCall('/PROMOTION/USERNAME-MK', 'PUT', {
      USERNAME: username,
      FILE_ID: promotionCodes
    });
  }
};

export default couponService;