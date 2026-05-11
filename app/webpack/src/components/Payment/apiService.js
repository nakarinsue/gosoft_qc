const BASE_URL =  'V2';

// ฟังก์ชันเรียก API จริง
export const fetchPaymentCode = async (endpoint, value) => {
    try {
        // จัดการ URL กรณีมี Param
        const url = endpoint.includes('{value}') 
            ? `${BASE_URL}${endpoint.replace('{value}', value || '')}`
            : `${BASE_URL}${endpoint}`;

        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        console.error("API Fetch Error:", error);
        throw error;
    }
};