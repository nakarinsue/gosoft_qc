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