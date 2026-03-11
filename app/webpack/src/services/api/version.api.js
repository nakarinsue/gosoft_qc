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