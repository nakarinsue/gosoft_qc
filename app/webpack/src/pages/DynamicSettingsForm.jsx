import React, { useState, useEffect } from 'react';
import TextInput from '../components/dynamic/TextInput';
import ToggleSwitch from '../components/dynamic/ToggleSwitch';
import DropdownSelect from '../components/dynamic/DropdownSelect';

const DynamicSettingsForm = () => {
  const [formData, setFormData] = useState([]);
  const [originalData, setOriginalData] = useState([]); // เก็บค่าเริ่มต้นเพื่อเปรียบเทียบ
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false); // สถานะตอนกดบันทึก

  const API_BASE_URL = 'V2/UI'; // ปรับ URL ให้ตรงกับ FastAPI ของคุณ

  // 1. ดึงข้อมูลจาก API เมื่อเปิดหน้าจอ
  useEffect(() => {
    fetchUIValues();
  }, []);

  const fetchUIValues = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}`);
      if (!response.ok) throw new Error('Failed to fetch data');
      
      const data = await response.json();
      setFormData(data);
      // ทำ Deep Copy เพื่อเก็บเป็นค่าดั้งเดิมไว้เช็คการเปลี่ยนแปลง
      setOriginalData(JSON.parse(JSON.stringify(data))); 
    } catch (error) {
      console.error("Error fetching UI values:", error);
      alert("ไม่สามารถดึงข้อมูลการตั้งค่าได้");
    } finally {
      setIsLoading(false);
    }
  };

  // 2. จัดการเมื่อค่าใน Widget เปลี่ยนแปลง (อัปเดตแค่ State ยังไม่ส่ง API)
  const handleValueChange = (id, newValue) => {
    setFormData(prevData =>
      prevData.map(item => (item.id === id ? { ...item, value: newValue } : item))
    );
  };

  // 3. ฟังก์ชันบันทึกข้อมูล (เช็คค่าที่เปลี่ยน และยิง PUT API)
  const handleSave = async () => {
    setIsSaving(true);
    try {
      // กรองหาเฉพาะ Item ที่ค่า value ไม่ตรงกับ originalData
      const changedItems = formData.filter(item => {
        const originalItem = originalData.find(orig => orig.id === item.id);
        return originalItem && originalItem.value !== item.value;
      });

      if (changedItems.length === 0) {
        alert("ไม่มีการเปลี่ยนแปลงข้อมูล");
        setIsSaving(false);
        return;
      }

      // สร้าง Array ของ Promise เพื่อยิง API อัปเดตพร้อมกัน
      const updatePromises = changedItems.map(item =>
        fetch(`${API_BASE_URL}/${item.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          // ส่งไปแค่อ็อบเจกต์ที่มี value ที่ต้องการอัปเดต ตาม schema UIValueUpdate
          body: JSON.stringify({ value: String(item.value) }) 
        }).then(res => {
          if (!res.ok) throw new Error(`Update failed for ID: ${item.id}`);
          return res.json();
        })
      );

      // รอให้ API ทุกตัวทำงานเสร็จสิ้น
      await Promise.all(updatePromises);

      // อัปเดต originalData ใหม่ให้ตรงกับข้อมูลที่เพิ่งบันทึกไป
      setOriginalData(JSON.parse(JSON.stringify(formData)));
      alert("บันทึกการตั้งค่าเรียบร้อยแล้ว!");
      
    } catch (error) {
      console.error("Save error:", error);
      alert("เกิดข้อผิดพลาดในการบันทึกข้อมูล กรุณาลองใหม่อีกครั้ง");
    } finally {
      setIsSaving(false);
    }
  };

  // 4. จัดกลุ่มข้อมูลตาม group_name
  const groupedData = formData.reduce((groups, item) => {
    const group = item.group_name || 'การตั้งค่าทั่วไป';
    if (!groups[group]) groups[group] = [];
    groups[group].push(item);
    return groups;
  }, {});

  // 5. ตัวเลือกว่าจะใช้ Widget ไหนตาม type
  const renderWidget = (item) => {
    switch (item.type) {
      case 'text':
        return <TextInput key={item.id} item={item} onChange={handleValueChange} />;
      case 'boolean':
        return <ToggleSwitch key={item.id} item={item} onChange={handleValueChange} />;
      case 'dropdown':
        return <DropdownSelect key={item.id} item={item} onChange={handleValueChange} />;
      default:
        return null;
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white dark:bg-gray-900 rounded-xl shadow-md">
      <h2 className="text-2xl font-bold mb-6 text-gray-800 dark:text-white">ตั้งค่าระบบ</h2>
      
      {Object.keys(groupedData).map((groupName) => (
        <div key={groupName} className="mb-8">
          <h3 className="text-lg font-semibold mb-4 text-blue-600 dark:text-blue-400 border-b pb-2">
            {groupName}
          </h3>
          <div className="grid grid-cols-12 gap-4">
            {groupedData[groupName].map(item => renderWidget(item))}
          </div>
        </div>
      ))}

      <div className="mt-8 flex justify-end">
        <button
          onClick={handleSave}
          disabled={isSaving}
          className={`px-6 py-2 text-white font-medium rounded-lg shadow-sm transition-colors flex items-center ${
            isSaving ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
          }`}
        >
          {isSaving ? (
            <>
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              กำลังบันทึก...
            </>
          ) : (
            'บันทึกการตั้งค่า'
          )}
        </button>
      </div>
    </div>
  );
};

export default DynamicSettingsForm;