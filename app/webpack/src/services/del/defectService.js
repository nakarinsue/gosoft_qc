import { API_BASE_URL } from '../utils/config';

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