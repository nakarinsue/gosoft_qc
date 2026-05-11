import React, { useState } from 'react';
import Barcode from 'react-barcode';
import { QRCodeSVG } from 'qrcode.react';
import { usePayment } from './PaymentProvider';
import { fetchPaymentCode } from './apiService';

const CodeWidget = () => {
    // ดึง Context มาใช้งาน
    const { 
        memberValue, setMemberValue, 
        codeData, setCodeData, 
        setCurrentRewards, setPreviousRewards 
    } = usePayment();

    const [selectedApi, setSelectedApi] = useState('/payment/wallet');
    const [displayType, setDisplayType] = useState('BARCODE'); // BARCODE หรือ QRCODE
    const [loading, setLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');

    // ตรวจสอบเงื่อนไข Input (ว่าง หรือ 10, 12, 13 หลัก)
    const validateInput = (val) => {
        if (!val) return true; // ยอมรับค่าว่าง
        const regex = /^[0-9]+$/;
        if (!regex.test(val)) return false; // ต้องเป็นตัวเลขเท่านั้น
        return [10, 12, 13].includes(val.length);
    };

    const handleGenerate = async () => {
        setErrorMsg('');
        if (memberValue && !validateInput(memberValue)) {
            setErrorMsg('กรุณากรอกตัวเลข 10, 12 หรือ 13 หลักเท่านั้น');
            return;
        }

        setLoading(true);
        try {
            const res = await fetchPaymentCode(selectedApi, memberValue);
            
            // แยก Logic การเก็บค่าตาม API ที่ User เลือก
            if (selectedApi === '/payment/allmember/{value}') {
                if (res.status?.status_code === "00000") {
                    setCodeData(res.data.barcodeId);
                    setCurrentRewards(res.data.rewards || []);
                    setPreviousRewards(res.data.rewards || []); // เก็บเป็นค่าเริ่มต้นไว้เทียบ
                } else {
                    setErrorMsg('ไม่สามารถดึงข้อมูล Member ได้');
                }
            } else {
                // สำหรับเส้น /payment/wallet และ /payment/allwallet
                if (res.status === "success") {
                    setCodeData(res.paycode);
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
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg w-full max-w-md mx-auto transition-colors duration-300">
            <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white">สร้าง Payment Code</h2>
            
            {/* ส่วนรับค่า Input */}
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

            {/* ส่วนเลือก API */}
            <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    เลือกบริการ
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

            {errorMsg && <p className="text-red-500 text-sm mb-4">{errorMsg}</p>}

            <button 
                onClick={handleGenerate}
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-md transition duration-200 disabled:opacity-50"
            >
                {loading ? 'กำลังดึงข้อมูล...' : 'สร้าง Code'}
            </button>

            {/* ส่วนแสดงผล Barcode / QR Code */}
            {codeData && (
                <div className="mt-8 flex flex-col items-center">
                    <div className="flex space-x-2 mb-4">
                        <button 
                            onClick={() => setDisplayType('BARCODE')}
                            className={`px-3 py-1 text-sm rounded-full ${displayType === 'BARCODE' ? 'bg-gray-800 text-white dark:bg-gray-200 dark:text-gray-800' : 'bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300'}`}
                        >
                            Barcode
                        </button>
                        <button 
                            onClick={() => setDisplayType('QRCODE')}
                            className={`px-3 py-1 text-sm rounded-full ${displayType === 'QRCODE' ? 'bg-gray-800 text-white dark:bg-gray-200 dark:text-gray-800' : 'bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300'}`}
                        >
                            QR Code
                        </button>
                    </div>

                    <div className="bg-white p-4 rounded-lg shadow-inner flex justify-center items-center min-h-[150px] w-full">
                        {displayType === 'BARCODE' ? (
                            <Barcode value={codeData} width={2} height={80} displayValue={true} />
                        ) : (
                            <QRCodeSVG value={codeData} size={150} level="H" />
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default CodeWidget;