import { useEffect } from 'react';

/**
 * useScanDetection Hook
 * ดักจับสัญญาณจาก Barcode Scanner โดยแยกแยะความเร็วในการพิมพ์
 * * @param {Function} onScan - ฟังก์ชัน Callback ที่จะทำงานเมื่อสแกนสำเร็จ ส่งค่า barcode กลับไป
 * @param {Object} options - ตัวเลือกเพิ่มเติม { minLength: 3, timeGap: 50 }
 */
export const useScanDetection = (onScan, options = {}) => {
  const { minLength = 3, timeGap = 50 } = options;

  useEffect(() => {
    let buffer = ''; // ตัวแปรพักข้อมูลชั่วคราว
    let lastKeyTime = Date.now(); // เวลาที่กดปุ่มล่าสุด

    const handleKeyDown = (e) => {
      // 1. ถ้า User กำลังพิมพ์ในช่อง Input หรือ Textarea ให้หยุดทำงาน (จะได้ไม่แย่ง Focus)
      const targetTag = e.target.tagName.toUpperCase();
      if (targetTag === 'INPUT' || targetTag === 'TEXTAREA') {
        return; 
      }

      const currentTime = Date.now();
      const gap = currentTime - lastKeyTime;
      lastKeyTime = currentTime;

      // 2. Logic: แยก "คน" vs "เครื่อง" ด้วยความเร็ว (Time Gap)
      // Scanner จะยิงตัวอักษรมาเร็วมาก (Gap < 30ms)
      // คนพิมพ์จะช้ากว่า (Gap > 50ms)
      if (gap > timeGap) { 
        // ถ้า gap นานเกินไป ถือว่าเริ่มรอบใหม่ ล้างค่าเก่าทิ้ง
        buffer = ''; 
      }

      // 3. Logic: ตรวจจับปุ่ม
      if (e.key === 'Enter') {
        // Scanner จะส่ง Enter ปิดท้ายเสมอ
        if (buffer.length >= minLength) {
          // ถ้า buffer มีค่าและยาวพอ -> ส่งค่ากลับไป
          e.preventDefault(); // กัน Form Submit ถ้ามี
          onScan(buffer);
          buffer = ''; // ล้างค่าหลังส่งเสร็จ
        }
      } else if (e.key.length === 1) { 
        // เก็บสะสมตัวอักษรเข้า Buffer (กรองปุ่ม Shift, Ctrl, Alt ออก)
        // รับเฉพาะ a-z, 0-9, และสัญลักษณ์
        buffer += e.key;
      }
    };

    // เริ่มดักจับ Event
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [onScan, minLength, timeGap]);
};