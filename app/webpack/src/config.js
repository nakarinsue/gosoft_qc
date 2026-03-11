// src/config.js
export const BACKEND_API_PORT = import.meta.env.BACKEND_API_PORT || '8000';
export const PORT_MINIO = import.meta.env.PORT_MINIO || '9000';
export const preview = import.meta.env.BACKEND_API_PREFIX || '/API/V1';
import { 
  CheckSquare,CheckCircle2, AlertCircle, Clock,XCircle,User,RefreshCw,X
} from 'lucide-react';
export const INPUT_TARGET = `${window.location.protocol}//${window.location.hostname}:${PORT_MINIO}`;
export const BASE_URL = `${window.location.protocol}//${window.location.hostname}:${BACKEND_API_PORT}`;

export const API_BASE_URL = `${BASE_URL}${preview}`;
export const MINIO_BASE_URL = `${INPUT_TARGET}`;
// Status Config: 0-6
export const STATUS_CONFIG = {
  1: { label: 'Open', color: 'bg-blue-50 text-blue-600 border-blue-200', icon: AlertCircle, desc: 'รอการแก้ไข' },
  2: { label: 'Reject', color: 'bg-red-50 text-red-600 border-red-200', icon: XCircle, desc: 'ส่งกลับ' },
  3: { label: 'Assign', color: 'bg-orange-50 text-orange-600 border-orange-200', icon: User , desc: 'ส่งให้ MK.' },
  4: { label: 'Close', color: 'bg-emerald-50 text-emerald-600 border-emerald-200', icon: CheckCircle2 , desc: 'สำเร็จ' },
  5: { label: 'Retest', color: 'bg-cyan-50 text-cyan-600 border-cyan-200', icon: RefreshCw, desc: 'ทดสอบใหม่' },
  6: { label: 'Resolved', color: 'bg-indigo-50 text-indigo-600 border-indigo-200', icon: CheckSquare, desc: 'แก้ไขแล้ว' },
  0: { label: 'CANCEL', color: 'bg-slate-100 text-slate-500 border-slate-200', icon: X , desc: 'ยกเลิก' }
};

// export const STATUS_CONFIG = {
//   1: { label: 'Open', color: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500/30', icon: CheckCircle2, desc: 'รอการแก้ไข' },
//   2: { label: 'Reject', color: 'bg-red-50 text-red-700 border-red-200 dark:bg-red-500/10 dark:text-red-400 dark:border-red-500/30', icon: CheckCircle2, desc: 'ส่งกลับ' },
//   3: { label: 'Assign', color: 'bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-500/10 dark:text-orange-400 dark:border-orange-500/30', icon: Clock , desc: 'ส่งให้ MK.' },
//   4: { label: 'Close', color: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/30', icon: Clock , desc: 'สำเร็จ' },
//   5: { label: 'Retest', color: 'bg-cyan-50 text-cyan-700 border-cyan-200 dark:bg-cyan-500/10 dark:text-cyan-400 dark:border-cyan-500/30', icon: AlertCircle, desc: 'ทดสอบใหม่' },
//   6: { label: 'Resolved', color: 'bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-500/10 dark:text-indigo-400 dark:border-indigo-500/30', icon: AlertCircle, desc: 'แก้ไขแล้ว' },
//   0: { label: 'CANCEL', color: 'bg-slate-100 text-slate-500 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700', icon: CheckSquare , desc: 'ยกเลิก' }
// };
// Defect Type Options
export const TYPE_OPTIONS = [
  { value: 1, label: 'Limit ในการทำงาน', Desc: 'DF ที่เกี่ยวกับ การจำกัดทั้งหมด เช่น จำกัดจำนวนครั้ง,จำนวนสินค้า, จำกัดยอดซื้อขั้นต่ำ' },
  { value: 2, label: 'รายการสินค้า', Desc: 'DF ที่เกี่ยวกับ รายการสินค้า เช่น ชื่อสินค้าผิดหรือ ราคาไม่ตรง, ไม่มีสินค้า' },
  { value: 3, label: 'เข้าโปรโมชั่นอื่น', Desc: 'DF ที่เกี่ยวกับ การเข้าโปรโมชั่นอื่น เช่น สินค้าอยู่ในโปรโมชั่นอื่น, โปรโมชั่นทับซ้อนกัน' },
  { value: 4, label: 'Pack Sale', Desc: 'DF ที่เกี่ยวกับ Pack Sale เช่น สินค้า Pack Sale ทำงานโปรโมชั่นอื่นทำงาน หรือ ทำงานได้ไม่ตามเงื่อนไข' },
  { value: 5, label: 'เงื่อนไข วัน เเละ เวลา', Desc: 'DF ที่เกี่ยวกับ เงื่อนไข วัน และ เวลา เช่น โปรโมชั่นไม่ทำงานตามวันและเวลาที่กำหนด' },
  { value: 6, label: 'การคำนวณส่วนลด', Desc: 'DF ที่เกี่ยวกับ การคำนวณส่วนลด เช่น ส่วนลดไม่ตรงตามเงื่อนไข, คำนวณส่วนลดผิดพลาด' },
  { value: 7, label: 'การบันทึกข้อมูล Database', Desc: 'DF ที่เกี่ยวกับ การบันทึกข้อมูลลง Database หรือ Textfile ผิดพลาด' },
  { value: 8, label: 'รายละเอียดเอกสาร', Desc: 'DF ที่เกี่ยวกับ รายละเอียดในเอกสาร ไม่ตรงกัน หรือ ไม่สอดคล้องกัน' },
  { value: 9, label: 'เงื่อนไขอื่นๆ', Desc: 'DF ที่เกี่ยวกับ เงื่อนไขอื่นๆ ที่ไม่ตรงกับข้ออื่น' }
];

export const STATUS_OPTIONS = {
  1: { 
    label: 'Open', 
    color: 'bg-blue-50 text-blue-700 border border-blue-200', 
    hex: '#3b82f6',
    Desc: 'รอการแก้ไข', 
    MK: true, 
    User: true 
  },
  2: { 
    label: 'Reject', 
    color: 'bg-red-50 text-red-700 border border-red-200', 
    hex: '#ef4444',
    Desc: 'ส่งกลับ', 
    MK: true, 
    User: true 
  },
  3: { 
    label: 'Assign', 
    color: 'bg-orange-50 text-orange-700 border border-orange-200', 
    hex: '#f97316', 
    Desc: 'ส่งให้ MK.', 
    MK: true, 
    User: true 
  },
  4: { 
    label: 'Close', 
    color: 'bg-emerald-50 text-emerald-700 border border-emerald-200', 
    hex: '#10b981',
    Desc: 'สำเร็จ', 
    MK: true, 
    User: true 
  },
  5: { 
    label: 'Retest', 
    color: 'bg-cyan-50 text-cyan-700 border border-cyan-200', 
    hex: '#06b6d4',
    Desc: 'ทดสอบใหม่', 
    MK: true, 
    User: true 
  },
  6: { 
    label: 'Resolved', 
    color: 'bg-indigo-50 text-indigo-700 border border-indigo-200', 
    hex: '#6366f1',
    Desc: 'เเก้ไขเเล้ว ให้ทดสอบใหม่', 
    MK: true, 
    User: true 
  },
  0: { 
    label: 'CANCEL', 
    color: 'bg-slate-100 text-slate-500 border border-slate-200', 
    hex: '#94a3b8',
    Desc: 'ยกเลิก', 
    MK: true, 
    User: true 
  }
};
