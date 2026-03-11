import React from 'react';
import { X, CheckCircle2, AlertOctagon } from 'lucide-react';

export const ErrorModal = ({ isOpen, title, message, onClose }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white dark:bg-slate-900 rounded-[2rem] shadow-2xl w-full max-w-md border border-red-100 dark:border-red-900/30 animate-in zoom-in-95">
        <div className="p-8 text-center">
          <div className="size-20 bg-red-100 dark:bg-red-900/20 text-red-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner"><AlertOctagon size={40} strokeWidth={3} /></div>
          <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-2">{title}</h3>
          <p className="text-slate-500 dark:text-slate-400 mb-8">{message}</p>
          <button onClick={onClose} className="w-full py-3.5 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold shadow-lg shadow-red-600/20 active:scale-95 transition-all">ตกลง / Close</button>
        </div>
      </div>
    </div>
  );
};

export const ToastContainer = ({ toasts, removeToast }) => (
  <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-3 pointer-events-none">
    {toasts.map((toast) => (
      <div key={toast.id} className="pointer-events-auto flex items-center gap-4 bg-white dark:bg-slate-800 border border-emerald-100 dark:border-emerald-900/30 p-4 rounded-2xl shadow-xl min-w-[320px] animate-in slide-in-from-right-full">
        <div className="size-10 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 rounded-full flex items-center justify-center flex-shrink-0"><CheckCircle2 size={20} strokeWidth={3} /></div>
        <div className="flex-1"><h4 className="font-bold text-slate-900 dark:text-white text-sm">{toast.title}</h4><p className="text-xs text-slate-500 dark:text-slate-400">{toast.message}</p></div>
        <button onClick={() => removeToast(toast.id)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"><X size={18} /></button>
      </div>
    ))}
  </div>
);