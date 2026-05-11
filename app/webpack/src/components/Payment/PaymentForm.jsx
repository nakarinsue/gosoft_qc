import React, { useState } from 'react';
import { usePayment } from './PaymentProvider';
import { fetchPaymentCode } from './apiService';

const PaymentForm = () => {
    // ดึง State และ Setter จาก Context ส่วนกลาง
    const { 
        memberValue, setMemberValue, 
        setCodeData, 
        setCurrentRewards, setPreviousRewards 
    } = usePayment();

    const [selectedApi, setSelectedApi] = useState('/payment/wallet');
    const [loading, setLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');

    // ฟังก์ชันตรวจสอบความถูกต้องของข้อมูล (Validation)
    const validateInput = (val) => {
        if (!val) return true; // ยอมรับค่าว่าง (Null)
        const regex = /^[0-9]+$/;
        if (!regex.test(val)) return false; // ต้องเป็นตัวเลขเท่านั้น
        return [10, 12, 13].includes(val.length);
    };

    // ฟังก์ชันจัดการเมื่อกดปุ่มยืนยัน
    const handleSubmit = async (e) => {
        e.preventDefault(); // ป้องกันการ Refresh หน้าเว็บ
        setErrorMsg('');

        if (memberValue && !validateInput(memberValue)) {
            setErrorMsg('กรุณากรอกตัวเลข 10, 12 หรือ 13 หลักเท่านั้น');
            return;
        }

        setLoading(true);
        try {
            // เรียกใช้ API Service
            const res = await fetchPaymentCode(selectedApi, memberValue);
            
            // จัดการข้อมูล Response ตามเส้น API ที่เลือก
            if (selectedApi === '/payment/allmember/{value}') {
                if (res.status?.status_code === "00000") {
                    setCodeData(res.data.barcodeId); // ส่งรหัสไปให้ CodeWidget สร้าง Barcode
                    setCurrentRewards(res.data.rewards || []); // ส่งข้อมูลให้ RewardTable
                    setPreviousRewards(res.data.rewards || []);
                } else {
                    setErrorMsg('ไม่สามารถดึงข้อมูล Member ได้');
                }
            } else {
                if (res.status === "success") {
                    setCodeData(res.paycode); // ส่งรหัสไปให้ CodeWidget สร้าง Barcode
                } else {
                    setErrorMsg('ไม่สามารถดึงข้อมูล Wallet ได้');
                }
            }
        } catch (err) {
            setErrorMsg('เกิดข้อผิดพลาดในการเชื่อมต่อเซิร์ฟเวอร์');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md mb-6 transition-colors duration-300">
            <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white">กรอกข้อมูลระบบ Payment</h2>
            
            <form onSubmit={handleSubmit}>
                {/* ช่องรับค่าอ้างอิง */}
                <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        รหัสอ้างอิง (10, 12, 13 หลัก หรือเว้นว่าง)
                    </label>
                    <input 
                        type="text"
                        value={memberValue}
                        onChange={(e) => setMemberValue(e.target.value)}
                        placeholder="กรอกตัวเลข..."
                        className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    />
                </div>

                {/* Dropdown เลือกเส้น API */}
                <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        เลือกบริการ API
                    </label>
                    <select 
                        value={selectedApi}
                        onChange={(e) => setSelectedApi(e.target.value)}
                        className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    >
                        <option value="/payment/wallet">Wallet (/payment/wallet)</option>
                        <option value="/payment/allwallet">All Wallet (/payment/allwallet)</option>
                        <option value="/payment/allmember/{value}">All Member (/payment/allmember)</option>
                    </select>
                </div>

                {/* แสดงข้อความ Error (ถ้ามี) */}
                {errorMsg && (
                    <div className="mb-4 p-3 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded text-sm">
                        {errorMsg}
                    </div>
                )}

                {/* ปุ่ม Submit */}
                <button 
                    type="submit"
                    disabled={loading}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-md transition duration-200 disabled:opacity-50 flex justify-center items-center"
                >
                    {loading ? (
                        <>
                            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            กำลังดึงข้อมูล...
                        </>
                    ) : 'ดึงข้อมูล / สร้าง Code'}
                </button>
            </form>
        </div>
    );
};

export default PaymentForm;