import React, { useState, useEffect, useCallback } from 'react';
import { 
  ChevronRight, ChevronLeft, Upload, X, FileText, AlertCircle, Save, 
  Search, Loader2, CheckCircle2, ShoppingBag, Square, CheckSquare,
  Copy, History, RefreshCw, Edit3, Layers, FileSpreadsheet
} from 'lucide-react';


import { API_BASE_URL, TYPE_OPTIONS } from '../utils/config';

// --- Helper Functions ---
const generateDetailFormat = (promo, items, types) => {
    const proText = promo ? `${promo.PRO_CODE} (${promo.PRO_NAME})` : 'ไม่ระบุ';
    
    let itemText = '-';
    if (items && items.length > 0) {
        const codes = items.map(i => i.ENTITY_CODE);
        if (codes.length > 3) {
            itemText = `${codes.slice(0, 3).join(', ')} และอื่นๆรวม ${codes.length} รายการ`;
        } else {
            itemText = codes.join(', ');
        }
    }

    const typeText = types && types.length > 0 ? types.join(', ') : '...';

    return `เมื่อทำรายการขาย promotion : ${proText} ทำการขาย สินค้า ${itemText} พบ ปัญหา ${typeText}`;
};