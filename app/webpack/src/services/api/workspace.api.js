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
// ตัวอย่างใน workspace.api.js
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