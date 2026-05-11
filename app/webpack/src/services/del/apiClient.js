import axios from 'axios';
import { API_BASE_URL } from '../utils/config';

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