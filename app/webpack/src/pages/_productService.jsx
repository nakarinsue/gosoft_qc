import React, { useState } from 'react';
import { Search, Store, Barcode, Loader2, AlertCircle } from 'lucide-react';
import { fetchProductDetail } from '../services/productService';
import ProductDetailView from './_ProductDetailView'; // แยกส่วนแสดงผลไปไว้อีกไฟล์

const ProductSearchPage = () => {
  // State สำหรับ Form
  const [inputs, setInputs] = useState({
    storeId: '',
    productCode: ''
  });

  // State สำหรับ Data และ UI Status
  const [productData, setProductData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Handle Input Change
  const handleChange = (e) => {
    setInputs({
      ...inputs,
      [e.target.name]: e.target.value
    });
  };

  // Handle Search Action
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


  return (
    <div className="min-h-screen bg-gray-100 py-10 px-4">
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* --- ส่วนที่ 1: Search Form Card --- */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
          <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
            <Search className="w-5 h-5 text-blue-600" />
            ค้นหาสินค้า
          </h2>
          
          <form onSubmit={handleSearch} className="grid grid-cols-1 md:grid-cols-3 gap-4">
            
            {/* Input Store ID */}
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Store className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                name="storeId"
                value={inputs.storeId}
                onChange={handleChange}
                placeholder="รหัสสาขา (Store ID)"
                className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
              />
            </div>

            {/* Input Product Code */}
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Barcode className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                name="productCode"
                value={inputs.productCode}
                onChange={handleChange}
                placeholder="รหัสสินค้า (Product Code)"
                className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
              />
            </div>

            {/* Search Button */}
            <button
              type="submit"
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg shadow-md hover:shadow-lg transition-all flex justify-center items-center gap-2 disabled:bg-blue-300 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin h-5 w-5" /> กำลังค้นหา...
                </>
              ) : (
                <>
                  <Search className="h-5 w-5" /> ค้นหา
                </>
              )}
            </button>
          </form>

          {/* Error Message Display */}
          {error && (
            <div className="mt-4 p-3 bg-red-50 text-red-600 rounded-lg flex items-center gap-2 text-sm border border-red-100 animate-fade-in">
              <AlertCircle className="h-5 w-5" />
              {error}
            </div>
          )}
        </div>

        {/* --- ส่วนที่ 2: Result Display Area --- */}
        {productData && (
           <div className="animate-fade-in-up">
              <ProductDetailView product={productData} />
           </div>
        )}
        
      </div>
    </div>
  );
};

export default ProductSearchPage;