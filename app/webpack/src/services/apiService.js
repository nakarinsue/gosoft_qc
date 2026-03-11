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