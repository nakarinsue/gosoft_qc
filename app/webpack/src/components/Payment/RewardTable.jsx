import React, { useState } from 'react';
import { usePayment } from './PaymentProvider';
import ConfirmModal from './ConfirmModal';
import { fetchPaymentCode } from './apiService';

const RewardTable = () => {
    const { currentRewards, setCurrentRewards, previousRewards, isEdited, setIsEdited, memberValue } = usePayment();
    const [showModal, setShowModal] = useState(false);

    // ฟังก์ชันเปรียบเทียบเพื่อแสดงลูกศร
    const renderTrend = (current, previous) => {
        if (previous === undefined || previous === null) return null; // ครั้งแรกไม่เทียบ
        if (current > previous) return <span style={{ color: 'green' }}> ⬆️</span>;
        if (current < previous) return <span style={{ color: 'red' }}> ⬇️</span>;
        return null; // เท่าเดิมไม่แสดง
    };

    // อัปเดตข้อมูลเมื่อมีการพิมพ์แก้ไข
    const handleInputChange = (id, field, value) => {
        const updated = currentRewards.map(item => 
            item.reward_id === id ? { ...item, [field]: Number(value) } : item
        );
        setCurrentRewards(updated);
        setIsEdited(true);
    };

    // กดยืนยัน (เปิด Modal)
    const handleSubmit = () => {
        setShowModal(true);
    };

    // ยืนยันจาก Modal (ส่ง API)
    const confirmAction = async () => {
        // หาตัวที่ถูกแก้ไข (ตัวอย่าง: ส่งทีละรายการ หรือจัดการตาม Logic องค์กร)
        for (let i = 0; i < currentRewards.length; i++) {
            const current = currentRewards[i];
            const previous = previousRewards.find(p => p.reward_id === current.reward_id);
            
            if (previous && current.reward_qty !== previous.reward_qty) {
                const diff = current.reward_qty - previous.reward_qty;
                const payload = {
                    member: memberValue,
                    reward_id: current.reward_id,
                    value: Math.abs(diff) // ส่งค่า value ที่เปลี่ยนแปลง
                };
                await fetchPaymentCode(diff, payload);
            }
        }
        setShowModal(false);
        setIsEdited(false);
        // TODO: นำ Return ที่ได้มา อัปเดตเข้า State อีกครั้ง
    };

    if (currentRewards.length === 0) return null;

    return (
        <div className="table-widget bg-white p-4 rounded shadow-md dark:bg-gray-800">
            <h3 className="text-lg font-bold mb-4">ข้อมูล Rewards</h3>
            <table className="w-full text-left border-collapse">
                <thead>
                    <tr className="border-b">
                        <th>ID</th>
                        <th>Name</th>
                        <th>Qty</th>
                        <th>Total Earn</th>
                        <th>Total Redeem</th>
                    </tr>
                </thead>
                <tbody>
                    {currentRewards.map((item, index) => {
                        const prevItem = previousRewards.find(p => p.reward_id === item.reward_id) || {};
                        return (
                            <tr key={item.reward_id} className="border-b">
                                <td>{item.reward_id}</td>
                                <td>{item.reward_name}</td>
                                <td>
                                    <input 
                                        type="number" 
                                        className="border p-1 w-24 text-black"
                                        value={item.reward_qty} 
                                        onChange={(e) => handleInputChange(item.reward_id, 'reward_qty', e.target.value)}
                                    />
                                    {renderTrend(item.reward_qty, prevItem.reward_qty)}
                                </td>
                                <td>{item.reward_total_earn}</td>
                                <td>{item.reward_total_redeem}</td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>

            {isEdited && (
                <button onClick={handleSubmit} className="mt-4 bg-blue-600 text-white px-4 py-2 rounded w-full">
                    ยืนยันการแก้ไข
                </button>
            )}

            {/* Modal บังคับการกระทำ ไม่ให้ Back */}
            {showModal && (
                <ConfirmModal 
                    onConfirm={confirmAction} 
                    onCancel={() => setShowModal(false)} 
                    data={currentRewards} 
                />
            )}
        </div>
    );
};

export default RewardTable;