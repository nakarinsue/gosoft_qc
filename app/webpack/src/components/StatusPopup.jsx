import React from 'react';
import { cn } from '../utils/cn';
import { CheckCircle2, AlertCircle, XCircle, X } from 'lucide-react';

export default function StatusPopup({ isOpen, onClose, type, title, message }) {
  if (!isOpen) return null;

  const config = {
    success: { icon: <CheckCircle2 className="size-6" />, color: "text-emerald-500", bg: "bg-emerald-500/10" },
    error: { icon: <XCircle className="size-6" />, color: "text-red-500", bg: "bg-red-500/10" },
    warning: { icon: <AlertCircle className="size-6" />, color: "text-amber-500", bg: "bg-amber-500/10" },
    info: { icon: <AlertCircle className="size-6" />, color: "text-blue-500", bg: "bg-blue-500/10" },
  };

  const current = config[type] || config.info;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div className={cn(
        "relative w-full max-w-sm bg-white dark:bg-dark-card rounded-2xl shadow-2xl border border-slate-100 dark:border-dark-border p-6 overflow-hidden animate-in zoom-in-95 duration-300"
      )}>
        {/* แถบสีด้านข้างเพื่อบอกสถานะ */}
        <div className={cn("absolute left-0 top-0 bottom-0 w-1.5", current.color.replace('text', 'bg'))} />

        <div className="flex justify-between items-start">
          <div className={cn("p-2 rounded-xl mb-4 inline-block", current.bg, current.color)}>
            {current.icon}
          </div>
          <button onClick={onClose} className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors">
            <X className="size-5 text-slate-400" />
          </button>
        </div>

        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">
          {title}
        </h3>
        <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed">
          {message}
        </p>

        <button 
          onClick={onClose}
          className={cn(
            "w-full mt-6 py-2.5 rounded-xl font-semibold transition-all active:scale-95",
            "bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:opacity-90"
          )}
        >
          Close
        </button>
      </div>
    </div>
  );
}