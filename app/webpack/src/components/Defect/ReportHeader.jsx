import React from 'react';
import { LayoutDashboard, LogIn } from 'lucide-react';

export default function ReportHeader({ onLoginClick }) {
    return (
        <div className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-slate-200 shadow-sm">
            <div className="max-w-[1920px] mx-auto px-6 py-4 flex justify-between items-center">
                <div className="flex items-center gap-4">
                    <div className="p-2.5 bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl text-white shadow-lg">
                        <LayoutDashboard className="w-6 h-6" />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold text-slate-800 leading-none">Defect Monitoring</h1>
                        <p className="text-xs text-slate-500 font-medium mt-1">Real-time Data & Analytics</p>
                    </div>
                </div>
                
                <button 
                    onClick={onLoginClick} 
                    className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold rounded-xl transition-all shadow-lg shadow-indigo-600/20 active:scale-95"
                >
                    <LogIn size={16} /> Login
                </button>
            </div>
        </div>
    );
}