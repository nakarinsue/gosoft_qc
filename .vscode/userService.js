// services/userService.js


import { API_BASE_URL } from '../config';
import api from '../lib/axios';


const apiCall = async (endpoint, method = 'GET', body = null) => {
  try {
    const options = {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: body ? JSON.stringify(body) : null,
    };
    const response = await fetch(`${API_BASE_URL}${endpoint}`, options);
    if (!response.ok) {
        const txt = await response.text();
        throw new Error(`API Error: ${txt}`);
    }
    const text = await response.text();
    return text ? JSON.parse(text) : null;
  } catch (error) {
    console.error(`UserService Error [${endpoint}]:`, error);
    throw error;
  }
};

const userService = {
  getAllUsers: async () => {
    const data = await apiCall('/AUTH/USERS');
    return Array.isArray(data) ? data : [];
  },

  saveUser: async (formData, isEdit) => {
    const url = isEdit ? `/AUTH/USERS/${formData.id}` : '/AUTH/USERS';
    const method = isEdit ? 'PUT' : 'POST';

    const payload = {
      first_name: formData.name,
      email: formData.email,
      role_code: formData.role === '1' ? 'ADMIN' : 'USER'
    };

    if (!isEdit) {
      payload.username = formData.username;
      payload.password = formData.password;
    }

    return await apiCall(url, method, payload);
  },

  deleteUser: async (id) => {
    return await apiCall(`/AUTH/USERS/${id}`, 'DELETE');
  }
};

export default userService;


// services/productService.js

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


// services/productionService.js

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

//  services/defectService.js

// Helper Function
const apiCall = async (endpoint, method = 'GET', body = null) => {
  try {
    const options = {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: body ? JSON.stringify(body) : null,
    };
    const response = await fetch(`${API_BASE_URL}${endpoint}`, options);
    if (!response.ok) {
        const txt = await response.text();
        throw new Error(`API Error: ${txt}`);
    }
    const text = await response.text();
    return text ? JSON.parse(text) : null;
  } catch (error) {
    console.error(`Service Error [${endpoint}]:`, error);
    throw error;
  }
};

const defectService = {
  getDashboardStats: async () => {
    try {
      const [now, report, all] = await Promise.all([
        apiCall('/DASHBOARD/NOW').catch(() => ({})),
        apiCall('/DASHBOARD/REPORT').catch(() => ({})),
        apiCall('/DASHBOARD/ALL').catch(() => ([]))
      ]);
      
      const totalReceipts = now?.summary_by_pos?.reduce((s, i) => s + (i.total_receipts || 0), 0) || 0;
      const systemStats = Array.isArray(all) ? all.find(d => d.system === true) : {};

      return {
        total_receipts: totalReceipts,
        total_defects: report?.total_defects || 0,
        total_promotions: systemStats?.PROMOTION || 0,
        total_products: systemStats?.PRODUCT || 0
      };
    } catch { return { total_receipts: 0, total_defects: 0, total_promotions: 0, total_products: 0 }; }
  },

  getDefects: async () => {
    const data = await apiCall('/promotions/search');
    return Array.isArray(data) ? data : [];
  },

  updateDefect: async (id, formData) => {
    // Mapping Payload ให้เป็นตัวเล็กตาม API Spec
    const payload = {
      detail: formData.DETAIL || "",
      qty: Number(formData.QTY) || 0,
      type: formData.TYPE || "",
      type_other: formData.TYPE_OTHER || "",
      remark: formData.REMARK || "",
      status: Number(formData.STATUS) || 1
    };
    return await apiCall(`/DEFECT/UPDATE/${id}`, 'PUT', payload);
  },

  getImages: async (id) => {
    const data = await apiCall(`/IMAGE/defect/${id}/images`);
    return data?.images || [];
  }
};

export default defectService;


// services/couponService.js

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


//  services/apiService.js
import apiClient from './apiClient';

export const apiService = {
  // --- AUTH & USERS ---
//   auth: {
//     login: (data) => apiClient.post('/auth/login', data),
//   },
  users: {
    getAll: () => apiClient.get('/users'),
    create: (data) => apiClient.post('/users', data),
    update: (id, data) => apiClient.put(`/users/${id}`, data),
    delete: (id) => apiClient.delete(`/users/${id}`),
  },

  // --- DEFECTS (Management & Workflow) ---
  defects: {
    getUserLatest: () => apiClient.get('/defects/user/latest'),
    updateUserDefect: (id, data) => apiClient.put(`/defects/user/${id}`, data),
    getMkLatest: () => apiClient.get('/defects/mk/latest'),
    updateMkDefect: (id, data) => apiClient.put(`/defects/mk/${id}`, data),
    uploadS3: (formData) => apiClient.post('/defects/upload-s3', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    }),
    getImage: (id) => apiClient.get(`/defects/images/${id}`),
    create: (data) => apiClient.post('/defects', data),
    verifyPromotion: (data) => apiClient.post('/defects/verify-promotion', data),
    updateStatus: (id, status) => apiClient.put(`/defects/${id}/status`, { status }),
    importName: (id, name) => apiClient.put(`/defects/${id}/import-name`, { name }),
    export: () => apiClient.get('/defects/export', { responseType: 'blob' }),
  },

  // --- PROMOTIONS & COUPONS ---
  promotions: {
    search: (params) => apiClient.post('/promotions/search', params),
    export: (params) => apiClient.post('/promotions/export', params, { responseType: 'blob' }),
  },
  coupons: {
    getLatest: () => apiClient.get('/coupons/latest'),
    updateRemark: (id, remark) => apiClient.put(`/coupons/${id}/remark`, { remark }),
  },

  // --- PRODUCTS & PAYMENTS ---
  products: {
    create: (data) => apiClient.post('/products/new', data),
    getList: (params) => apiClient.post('/products/list', params),
  },
  payments: {
    barcodeStmn: (data) => apiClient.post('/payments/barcode/stmn', data),
    barcodeAmb: (data) => apiClient.post('/payments/barcode/amb', data),
  },

  // --- REPORTS ---
  reports: {
    summary: () => apiClient.get('/reports/summary'),
    dailySales: () => apiClient.get('/reports/daily-sales'),
    current: () => apiClient.get('/reports/current'),
    imports: () => apiClient.get('/reports/imports'),
    performanceDays: () => apiClient.get('/reports/performance-days'),
    pendingTasks: () => apiClient.get('/reports/pending-tasks'),
    calculateTotal: () => apiClient.get('/reports/calculate-total'),
  },

  // --- STORAGE & PROCESSING (ส่วนที่คุณใช้งานล่าสุด) ---
  processing: {
    importExcel: (formData) => apiClient.post('/storage/import-excel', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    }),
    executeLogic: (filenames) => apiClient.post('/process/execute-logic', { filenames }),
  }
};


//  services/apiClient.js



const apiClient = axios.create({
  baseURL: API_BASE_URL || 'http://api.enterprise-system.local',
  timeout: 60000, // เพิ่ม timeout สำหรับงานจัดการไฟล์
  headers: {
    'Content-Type': 'application/json',
  }
});

// Interceptor สำหรับจัดการ Token (ถ้ามี)
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default apiClient;

//  services/api_lookup.js
let apiMap = {};
let loaded = false;

export async function loadApiLookup() {
  if (loaded) return apiMap;

  const res = await fetch("/APILOOKUP");
  const result = await res.json();

  if (!result.success) {
    throw new Error(result.message);
  }

  apiMap = Object.fromEntries(
    result.data.map(item => [item.KEY, item.URL])
  );

  loaded = true;
  console.log("API LOOKUP LOADED:", apiMap);

  return apiMap;
}

export function getApiUrl(key) {
  return apiMap[key];
}




// services/api/assign.api.js

export const BASE_URL = '/V2';

export const assignApi = {
  // ดึงรายชื่อ User ทั้งหมด
  getUsers: async () => {
    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch(`${BASE_URL}/auth/users`, {
        method: 'GET',
        headers: { 'Accept'         : 'application/json',
                    'Content-Type'  : 'application/json',
                    'Authorization' : `Bearer ${token}`
          }
        });
      if (!response.ok) throw new Error('Network response was not ok');
      return await response.json();
    } catch (error) {
      console.error('Error fetching users:', error);
      throw error;
    }
  },

  // ดึงข้อมูลเริ่มต้น
  getAssignFiles: async () => {
    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch(`${BASE_URL}/Assign-file`, {
        method: 'GET',
        headers: { 'Accept'         : 'application/json',
                    'Content-Type'  : 'application/json',
                    'Authorization' : `Bearer ${token}`
          }
        });
      if (!response.ok) throw new Error('Network response was not ok');
      return await response.json();
    } catch (error) {
      console.error('Error fetching assign files:', error);
      throw error;
    }
  },

  // ส่งรายชื่อ User เพื่อขอรับการคำนวณการแจกจ่ายงาน
  assignUsers: async (userIds) => {
    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch(`${BASE_URL}/assign-users`, {
        method: 'POST',
        headers: { 'Accept'         : 'application/json',
                    'Content-Type'  : 'application/json',
                    'Authorization' : `Bearer ${token}`
          },
        body: JSON.stringify({ id: userIds }),
      });
      if (!response.ok) throw new Error('Network response was not ok');
      return await response.json();
    } catch (error) {
      console.error('Error assigning users:', error);
      throw error;
    }
  },

  // ยืนยันการแก้ไขและบันทึกข้อมูล
  updateUserAssign: async (data) => {
    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch(`${BASE_URL}/update-user-assign`, {
        method: 'POST',
        headers: { 'Accept'         : 'application/json',
                    'Content-Type'  : 'application/json',
                    'Authorization' : `Bearer ${token}`
          }
        });
      if (!response.ok) throw new Error('Network response was not ok');
      return await response.json();
    } catch (error) {
      console.error('Error updating assign files:', error);
      throw error;
    }
  }
};

// services/api/version.api.js

export const BASE_URL ='/V2'
export const versionApi = {
  // ดึงข้อมูลทั้งหมด
  getAll: async () => {
    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch(`${BASE_URL}/versions/`, {
        method: 'GET',
        headers: { 'Accept'         : 'application/json',
                    'Content-Type'  : 'application/json',
                    'Authorization' : `Bearer ${token}`
          }
      });
      if (!response.ok) throw new Error('Network response was not ok');
      return await response.json();
    } catch (error) {
      console.error('Error fetching versions:', error);
      throw error;
    }
  },

  // สร้างข้อมูลใหม่
  create: async (data) => {
    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch(`${BASE_URL}/versions/`, {
        method: 'POST',
        headers: { 'Accept'         : 'application/json',
                    'Content-Type'  : 'application/json',
                    'Authorization' : `Bearer ${token}`
          },
          body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Network response was not ok');
      return await response.json();
    } catch (error) {
      console.error('Error creating version:', error);
      throw error;
    }
  },

  // อัปเดตข้อมูล
  update: async (id, data) => {
    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch(`${BASE_URL}/versions/${id}`, {
        method: 'PUT', // หรือ PATCH ตามที่ Backend กำหนด
        headers: { 'Accept'         : 'application/json',
                    'Content-Type'  : 'application/json',
                    'Authorization' : `Bearer ${token}`
          },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Network response was not ok');
      return await response.json();
    } catch (error) {
      console.error(`Error updating version ${id}:`, error);
      throw error;
    }
  }
};


// services/api/workspace.api.js

export const BASE_URL = '/V2';
export const BASE_API_URL = '/API';

export const workspaceApi = {
  // --- USER API ---
  getUsers: async () => {
    
    const token = localStorage.getItem('access_token');
    const res = await fetch(`${BASE_URL}/auth/users`, {
        method: 'GET',
        headers: { 'Accept'         : 'application/json',
                    'Authorization' : `Bearer ${token}`
          }
        });
    if (!res.ok) throw new Error('Network error');
    return await res.json();
  },

  // --- VERSION API ---
  getVersions: async () => {
    const token = localStorage.getItem('access_token');
    const res = await fetch(`${BASE_URL}/versions/`, {
        method: 'GET',
        headers: { 'Accept'         : 'application/json',
                    'Content-Type'  : 'application/json',
                    'Authorization' : `Bearer ${token}`
          }
        });
    if (!res.ok) throw new Error('Network error');
    return await res.json();
  },

  // --- ASSIGN API ---
  getFilesByVersion: async (version) => {
  const token = localStorage.getItem('access_token');
  const response = await fetch(`${BASE_URL}/import/Assign/fil-to-user/${version}`, {
        method: 'GET',
        headers: { 'Accept'         : 'application/json',
                    'Content-Type'  : 'application/json',
                    'Authorization' : `Bearer ${token}`
          }
        });
  return await response.json();
  },

  getAssignFiles: async () => {
    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch(`${BASE_URL}/import/Assign/fil-to-user`, {
        method: 'GET',
        headers: { 'Accept'         : 'application/json',
                    'Content-Type'  : 'application/json',
                    'Authorization' : `Bearer ${token}`
          }
        });
      if (!response.ok) throw new Error('Network response was not ok');
      return await response.json();
    } catch (error) {
      console.error('Error fetching assign files:', error);
      throw error;
    }
  },

   assignUsers: async (userIds) => {
      try {
        const token = localStorage.getItem('access_token');
        const response = await fetch(`${BASE_URL}/assign-users`, {
          method: 'POST',
          headers: { 'Accept'         : 'application/json',
                    'Content-Type'  : 'application/json',
                    'Authorization' : `Bearer ${token}`
          },
          body: JSON.stringify({ user: userIds }),
        });
        if (!response.ok) throw new Error('Network response was not ok');
        return await response.json();
      } catch (error) {
        console.error('Error assigning users:', error);
        throw error;
      }
    },
  updateUserAssign: async (data) => {
    const token = localStorage.getItem('access_token');
    const res = await fetch(`${BASE_URL}/import/update-user-assign`, {
      method: 'POST',
      headers: { 'Accept'         : 'application/json',
                    'Content-Type'  : 'application/json',
                    'Authorization' : `Bearer ${token}`
          },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Network error');
    return await res.json();
  },

  // --- EXPORT/HISTORY API ---
  getHistory: async () => {
    const token = localStorage.getItem('access_token');
    const res = await fetch(`${BASE_URL}/import/export/show-all`, {
        method: 'GET',
        headers: { 'Accept'         : 'application/json',
                    'Content-Type'  : 'application/json',
                    'Authorization' : `Bearer ${token}`
          }
        });
    if (!res.ok) throw new Error('Network error');
    return await res.json().data;
  },
  exportHistory: async (ids) => {
    const token = localStorage.getItem('access_token');
    const res = await fetch(`${BASE_API_URL}/IMAGE/export-History`, {
      method: 'POST',
      headers: { 'Accept'         : 'application/json',
                    'Content-Type'  : 'application/json',
                    'Authorization' : `Bearer ${token}`
          },
      body: JSON.stringify({ id: ids }),
    });
    if (!res.ok) throw new Error('Network error');
    return await res.blob(); // For downloading files
  },

  // --- IMPORT FLOW API ---
  insertImportInfo: async (data) => {
    const token = localStorage.getItem('access_token');
    const res = await fetch(`${BASE_URL}/import/info-import/insert`, {
      method: 'POST',
      headers: { 'Accept'         : 'application/json',
                    'Content-Type'  : 'application/json',
                    'Authorization' : `Bearer ${token}`
          },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Network error');
    return await res.json();
  },
  uploadAndImport: async (formData) => {
    const token = localStorage.getItem('access_token');
    const res = await fetch(`${BASE_URL}/import/upload-and-import`, {
      method: 'POST',
      headers: { 'Accept'         : 'application/json',
                  'Authorization' : `Bearer ${token}`
          },
      body: formData, // FormData doesn't need Content-Type header
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || `Network error: ${res.status}`);
    }
    return await res.json();
  },
  updateImportStatus: async (data) => {
    const token = localStorage.getItem('access_token');
    const res = await fetch(`${BASE_URL}/import/info-import/update-status`, {
      method: 'PUT',
      headers: { 'Accept'         : 'application/json',
                    'Content-Type'  : 'application/json',
                    'Authorization' : `Bearer ${token}`
          },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Network error');
    return await res.json();
  },


  assignUsersCalc: async (usernames) => {
    const res = await fetch(`${BASE_URL}/import/Assign/user`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: usernames }),
    });
    if (!res.ok) throw new Error('Network error');
    return await res.json();
  }};




























































































































