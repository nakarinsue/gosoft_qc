// ส่วนหนึ่งของไฟล์ ProductSearchPage.jsx

  // ... (State และ ส่วนอื่นๆ เหมือนเดิม)

  const handleSearch = async (e) => {
    e.preventDefault();
    
    // Validate ว่ามีการกรอกข้อมูลครบ
    if (!inputs.storeId || !inputs.productCode) {
      setError("กรุณากรอกข้อมูลให้ครบทั้ง 2 ช่อง");
      return;
    }

    setLoading(true);
    setError(null);
    setProductData(null);

    try {
      // เรียกใช้ function ที่ปรับปรุงแล้ว
      // ข้อมูล inputs.productCode จะถูกนำไปใส่ [] ใน service เอง
      const result = await fetchProductDetail(inputs.storeId, inputs.productCode);
      
      setProductData(result);
    } catch (err) {
      setError(err.message || "เกิดข้อผิดพลาดในการเชื่อมต่อ");
    } finally {
      setLoading(false);
    }
  };

  // ... (ส่วน Return JSX เหมือนเดิม)