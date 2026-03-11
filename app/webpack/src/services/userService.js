import { API_BASE_URL } from '../config';

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