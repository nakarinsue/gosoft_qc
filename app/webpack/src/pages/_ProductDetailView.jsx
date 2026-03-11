// ProductDetailView.jsx
import React from 'react';
import { ShoppingCart, Heart, Tag } from 'lucide-react';

const ProductDetailView = ({ product }) => {
  const IMG_BASE_URL = "https://your-image-server.com"; // แก้เป็น URL รูปจริง

  return (
    <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-0 md:gap-8">
        
        {/* Image Section */}
        <div className="p-6 bg-gray-50 flex items-center justify-center relative">
           <img 
              src={`${IMG_BASE_URL}${product.product_image_hd || product.product_image}`} 
              alt={product.product_name}
              className="max-h-[400px] object-contain mix-blend-multiply"
              onError={(e) => {e.target.src = 'https://via.placeholder.com/400?text=No+Image'}}
           />
           {/* Badges */}
           {product.promotions?.length > 0 && (
              <div className="absolute top-4 left-4">
                 {product.promotions.map((promo, i) => (
                    <span key={i} className="bg-yellow-400 text-xs font-bold px-2 py-1 rounded shadow-sm mr-1">
                      {promo.promotion_product_type_name}
                    </span>
                 ))}
              </div>
           )}
        </div>

        {/* Info Section */}
        <div className="p-6 md:p-8 flex flex-col">
           <div className="mb-2 text-sm text-gray-500 font-medium uppercase tracking-wider">
              {product.product_type_name}
           </div>
           
           <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-4">
              {product.product_name}
           </h2>

           <div className="flex items-baseline gap-3 mb-6">
              <span className="text-3xl font-bold text-blue-600">฿{product.product_sell_price}</span>
              {product.originalPrice > product.product_sell_price && (
                <span className="text-lg text-gray-400 line-through">฿{product.originalPrice}</span>
              )}
           </div>

           <div className="prose prose-sm text-gray-600 mb-6 bg-gray-50 p-4 rounded-lg">
              <div dangerouslySetInnerHTML={{ __html: product.product_description }} />
           </div>

           <div className="mt-auto pt-6 border-t border-gray-100 flex gap-3">
              <button className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-semibold shadow-lg shadow-blue-200 transition-all flex justify-center items-center gap-2">
                 <ShoppingCart className="w-5 h-5" /> เพิ่มลงตะกร้า
              </button>
              <button className="p-3 border border-gray-200 rounded-xl hover:bg-gray-50 text-gray-500 transition-colors">
                 <Heart className="w-6 h-6" />
              </button>
           </div>
           
           <div className="mt-4 flex gap-3 text-xs text-gray-400">
              <span className="flex items-center gap-1"><Tag size={12}/> รหัส: {product.product_code}</span>
              <span>•</span>
              <span>Barcode: {product.product_barcode}</span>
           </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailView;