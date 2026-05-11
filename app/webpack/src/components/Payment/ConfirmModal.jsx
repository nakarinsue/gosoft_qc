import React from 'react';
import { usePayment } from './PaymentProvider';

const ConfirmModal = ({ onConfirm, onCancel }) => {
    // ดึง State กลางมาใช้เพื่อคำนวณส่วนต่าง
    const { previousRewards, currentRewards } = usePayment();

    // กรองหาเฉพาะรายการที่มีการแก้ไขค่า reward_qty เท่านั้น
    const changedItems = currentRewards.filter((current) => {
        const previous = previousRewards.find(p => p.reward_id === current.reward_id);
        return previous && current.reward_qty !== previous.reward_qty;
    });

    return (
        // Wrapper ตัวนี้คลุมเต็มหน้าจอ (fixed inset-0) เป็นการบล็อกไม่ให้ผู้ใช้คลิกส่วนอื่นของหน้าเว็บได้
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 backdrop-blur-sm">
            
            {/* กล่องเนื้อหา Modal */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl w-full max-w-lg p-6 relative animate-fade-in-up">
                
                <h2 className="text-xl font-bold mb-4 text-gray-800 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-3">
                    ตรวจสอบและยืนยันการแก้ไขข้อมูล
                </h2>

                {/* พื้นที่แสดงรายการที่เปลี่ยนแปลง (มี Scrollbar หากข้อมูลเยอะ) */}
                <div className="max-h-64 overflow-y-auto mb-6 pr-2">
                    {changedItems.length > 0 ? (
                        <ul className="space-y-3">
                            {changedItems.map((item) => {
                                const prev = previousRewards.find(p => p.reward_id === item.reward_id);
                                const diff = item.reward_qty - prev.reward_qty;
                                const isPositive = diff > 0;

                                return (
                                    <li key={item.reward_id} className="p-3 bg-gray-50 dark:bg-gray-700 rounded-md border border-gray-200 dark:border-gray-600">
                                        <p className="font-semibold text-gray-800 dark:text-gray-200">
                                            {item.reward_name} <span className="text-sm font-normal text-gray-500">(ID: {item.reward_id})</span>
                                        </p>
                                        <div className="flex justify-between items-center mt-2 text-sm">
                                            <span className="text-gray-600 dark:text-gray-400">เดิม: {prev.reward_qty}</span>
                                            <span className="mx-2 text-gray-400">➔</span>
                                            <span className="text-gray-800 dark:text-gray-100 font-medium">ใหม่: {item.reward_qty}</span>
                                            
                                            {/* แสดงส่วนต่าง + หรือ - พร้อมสี */}
                                            <span className={`ml-3 font-bold ${isPositive ? 'text-green-500' : 'text-red-500'}`}>
                                                ({isPositive ? '+' : ''}{diff})
                                            </span>
                                        </div>
                                    </li>
                                );
                            })}
                        </ul>
                    ) : (
                        <p className="text-gray-500 dark:text-gray-400 text-center py-6">
                            ไม่มีข้อมูลเปลี่ยนแปลง
                        </p>
                    )}
                </div>

                {/* ข้อความแจ้งเตือน */}
                <div className="bg-yellow-50 dark:bg-yellow-900/30 border border-yellow-200 dark:border-yellow-700 rounded p-3 mb-6">
                    <p className="text-sm text-yellow-700 dark:text-yellow-400 text-center">
                        ⚠️ ระบบจะทำการอัปเดตข้อมูลไปยังเซิร์ฟเวอร์ กรุณาตรวจสอบให้ถูกต้อง (ไม่สามารถกดย้อนกลับได้หลังยืนยัน)
                    </p>
                </div>

                {/* ปุ่มดำเนินการ */}
                <div className="flex justify-end space-x-3">
                    <button
                        onClick={onCancel}
                        className="px-5 py-2 rounded-md border border-gray-300 text-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700 transition duration-200 font-medium"
                    >
                        ยกเลิกและแก้ไขต่อ
                    </button>
                    <button
                        onClick={onConfirm}
                        disabled={changedItems.length === 0}
                        className="px-5 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition duration-200 font-medium shadow-sm"
                    >
                        ยืนยันส่งข้อมูล
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ConfirmModal;