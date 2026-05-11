import React, { createContext, useState, useContext } from 'react';

const PaymentContext = createContext();

export const PaymentProvider = ({ children }) => {
    const [memberValue, setMemberValue] = useState(''); // ค่าที่ User กรอก
    const [codeData, setCodeData] = useState(null); // เก็บ paycode หรือ barcodeId
    const [previousRewards, setPreviousRewards] = useState([]); // ข้อมูลรอบก่อนหน้า (เพื่อเปรียบเทียบ)
    const [currentRewards, setCurrentRewards] = useState([]); // ข้อมูลปัจจุบัน (แก้ไขได้)
    const [isEdited, setIsEdited] = useState(false); // เช็คว่ามีการแก้ไขหรือไม่

    return (
        <PaymentContext.Provider value={{
            memberValue, setMemberValue,
            codeData, setCodeData,
            previousRewards, setPreviousRewards,
            currentRewards, setCurrentRewards,
            isEdited, setIsEdited
        }}>
            {children}
        </PaymentContext.Provider>
    );
};

export const usePayment = () => useContext(PaymentContext);