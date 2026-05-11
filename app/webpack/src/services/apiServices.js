import axios from 'axios';
import { API_BASE_URL } from '../config';

// ==========================================
// 1. AXIOS INSTANCE & CONFIGURATION
// ==========================================
const apiClient = axios.create({
  baseURL: API_BASE_URL || '/API/V1', // ปรับ URL ตามจริง
  timeout: 60000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  }
});

// ==========================================
// 2. INTERCEPTORS
// ==========================================
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => Promise.reject(error));

apiClient.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.code === 'ECONNABORTED') {
      return Promise.reject(new Error('การเชื่อมต่อใช้เวลานานเกินกำหนด (Timeout)'));
    }
    const message = error.response?.data?.detail || error.response?.data?.message || error.message || 'Unknown API Error';
    return Promise.reject(new Error(message));
  }
);

// ==========================================
// 3. API MODULES
// ==========================================

export const apiService = {
  // --- 1. AUTHENTICATION ---
  auth: {
    // ใช้ x-www-form-urlencoded สำหรับ OAuth2
    login: (username, password) => {
      const params = new URLSearchParams();
      params.append('username', username);
      params.append('password', password);
      params.append('grant_type', 'password');
      return apiClient.post('/auth/login', params, {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
      });
    },
    getUsers: (skip = 0, limit = 100) => apiClient.get('/auth/users', { params: { skip, limit } }),
    createUser: (data) => apiClient.post('/auth/users', data), // Body: UserCreate
    updateUser: (userId, data) => apiClient.patch(`/auth/users/${userId}`, data), // Body: UserUpdate
    deleteUser: (userId) => apiClient.delete(`/auth/users/${userId}`),
  },

  // --- 2. UPLOAD / IMPORT FILE ---
  upload: {
    // อัปโหลดไฟล์ Excel พร้อมระบุ Version (multipart/form-data)
    uploadFileExcel: (versionId, file) => {
      const formData = new FormData();
      formData.append('version_id', versionId);
      formData.append('file', file);
      return apiClient.post('/upload/fileexcel', formData, {
        headers: { 'Content-Type': undefined } // ให้เบราว์เซอร์จัดการ boundary
      });
    },
    updatestatus:(id) => apiClient.put(`/upload/update-status/${id}`),
    insertInfo: (data) => apiClient.post(`/upload/insert`, data), // Body: InfoImportCreate
    getFileInformation: (versionId = 0, skip = 0, limit = 100) => 
      apiClient.get('/upload/fileinformation', { params: { version_id: versionId, skip, limit } }),
    getexportfileexcel: (versionId = null, fileId = null, isExportPdf = false) => 
      apiClient.get('/upload/export', { 
        params: { 
          versionid: versionId, 
          fileid: fileId, 
          export_pdf: isExportPdf 
        },
        responseType: 'blob' // 🔴 สำคัญมาก! ขาดตัวนี้ไฟล์ที่โหลดมาจะพัง เปิดไม่ได้
      }),
  },

  // --- 3. VERSION CONTROL ---
  versions: {
    getAll: (skip = 0, limit = 100) => apiClient.get('/versions/', { params: { skip, limit } }),
    create: (data) => apiClient.post('/versions/', data), // Body: VersionCreate
    update: (versionId, data) => apiClient.put(`/versions/${versionId}`, data), // Body: VersionUpdate
  },

  // --- 4. ASSIGN USER FILE ---
  assign: {
    // 1. GET: รับค่า version_id, skip, limit
    getAssign: (versionId = 0, skip = 0, limit = 9999) => 
      apiClient.get('/assign', null, { params: { version_id: versionId, skip, limit } }),
    
    // 2. POST: Auto Assign รับค่า {"file_id": [0]}
    autoAssign: (data) => 
      apiClient.post('/assign/auto', data), 
      
    // 3. PUT: Update Assign รับค่า [{ "file_id": 0, "user_assign": 0 }]
    updateAssign: (data) => 
      apiClient.put('/assign', data),  
  },

  // --- 5. DEFECT CONTROL ---
  // defect: {
  //   showAll: (versionId, skip,limit) => 
  //     apiClient.get('/defect/showall', null, { params: { version_id: versionId, skip, limit } }),
  //   inquiry: (value) => apiClient.get('/defect/inquiry', { params: { value } }), // ค้นหาด้วยรหัส หรือ ชื่อโปรโมชั่น
  //   create: (data) => apiClient.post('/defect/create', data), // Body: DefectCreateRequest
  //   update: (data) => apiClient.put('/defect/update', data),  // Body: DefectUpdateRequest
  // },
  defect: {
    // 📍 ลบ null ออก และเพิ่ม Default Parameters ป้องกัน Error หากไม่ได้ส่งค่ามา
    showAll: (versionId = 0, skip = 0, limit = 100) => 
      apiClient.get('/defect/showall', { 
        params: { version_id: versionId, skip, limit } 
      }),

    // ค้นหาด้วยรหัส หรือ ชื่อโปรโมชั่น
    inquiry: (value) => 
      apiClient.get('/defect/inquiry', { 
        params: { value } 
      }), 

    // 📍 สร้าง Defect ใหม่ (Body: DefectCreateRequest)
    create: (data) => 
      apiClient.post('/defect/create', data), 

    // 📍 อัปเดตข้อมูล Defect (Body: DefectUpdateRequest)
    update: (data) => 
      apiClient.put('/defect/update', data),  
  },
  // --- 6. MAPPING DATA ---
  mapping: {
    updatePromotion: (data) => apiClient.put('/mapping/promotion', data),
    getPromotion: (data) => apiClient.post('/mapping/promotion', data),
    updateProduct: (data) => apiClient.put('/mapping/product', data),
    getProduct: (data) => apiClient.post('/mapping/product', data),
  },

  // --- 7. OPTION & REPORT ---
  option: {
    updateNotProcess: (data) => apiClient.post('/option/notprocess', data),
    getDashboard: (data) => apiClient.post('/option/deshbord', data),
  },

  // --- 8. PAYMENT & REWARDS ---
  payment: {
    getTwnWallet: () => apiClient.get('/payment/wallet'),
    getAllWallet: () => apiClient.get('/payment/allwallet'),
    getAllmemberByValue: (value) => apiClient.get(`/payment/allmember/${value}`),
    getRewardByValue: (value) => apiClient.get(`/payment/reward/${value}`),
    issueReward: (data) => apiClient.post('/payment/issue/reward', data),   // Body: RewardTransactionRequest
    deductReward: (data) => apiClient.post('/payment/deduct/reward', data), // Body: RewardTransactionRequest
  },

  // --- 9. PROMOTION CONTROL ---
  promotion: {
    inquiry: (value) => apiClient.get('/promotion/inquiry', { params: { value } }), // ค้นหาด้วยรหัส หรือ ชื่อโปรโมชั่น
    getCoupon: (versionId = 0, skip = 0, limit = 100) => 
      apiClient.post('/promotion/coupon', null, { params: { version_id: versionId, skip, limit } }),
    updateCouponRemark: (id, remark) => 
      apiClient.post('/promotion/coupon-update', { id, remark }), // Body: CouponRemarkRequest
    getTransactionAll: (versionId = 0, skip = 0, limit = 100) => 
      apiClient.post('/promotion/transationall', null, { params: { version_id: versionId, skip, limit } }),
    getEntityErrors: () => apiClient.get('/promotion/entity_error'),

  }

};

export default apiService;