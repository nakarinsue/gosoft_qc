// src/components/StatCard.jsx
import React from 'react';
import { cn } from '../utils/cn';

export default function StatCard({ title, value, color, icon }) {
  // 1. กำหนด Color Tokens ให้รองรับทุกเฉดที่ระบุมา
  const colorMap = {
    blue: "text-blue-600 bg-blue-50 dark:bg-blue-500/10 dark:text-blue-400",
    orange: "text-orange-600 bg-orange-50 dark:bg-orange-500/10 dark:text-orange-400",
    green: "text-emerald-600 bg-emerald-50 dark:bg-emerald-500/10 dark:text-emerald-400",
    purple: "text-purple-600 bg-purple-50 dark:bg-purple-500/10 dark:text-purple-400",
  };

  return (
    <div className="group bg-white dark:bg-dark-card p-6 rounded-2xl border border-slate-200 dark:border-dark-border shadow-sm hover:shadow-md transition-all duration-300">
      <div className="flex justify-between items-start">
        <div className="space-y-2">
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400 tracking-wide uppercase">
            {title}
          </p>
          <div className="flex items-baseline gap-1">
            <h3 className="text-3xl font-bold dark:text-white tracking-tight">
              {value}
            </h3>
          </div>
        </div>

        {/* 2. Icon Container พร้อมสีแบบ Dynamic */}
        <div className={cn(
          "p-3 rounded-xl transition-transform group-hover:scale-110 duration-300",
          colorMap[color] || colorMap.blue
        )}>
          {React.cloneElement(icon, { size: 24, strokeWidth: 2.5 })}
        </div>
      </div>

      {/* 3. Decorative element เพื่อความทันสมัย (Optional) */}
      <div className="mt-4 flex items-center gap-2">
        <span className="flex h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
        <span className="text-[10px] font-medium text-slate-400 uppercase tracking-widest">
          Live Updates
        </span>
      </div>
    </div>
  );
}