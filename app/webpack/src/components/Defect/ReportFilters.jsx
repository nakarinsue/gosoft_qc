import React from 'react';
import { User, SlidersHorizontal, Search } from 'lucide-react';

export default function ReportFilters({ 
    userGroups, activeUserKey, setActiveUserKey, 
    isFilterOpen, setIsFilterOpen, 
    pendingFilters, setPendingFilters, 
    handleApplyFilters, handleClearFilters, FILTER_FIELDS 
}) {
    return (
        <>
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
                {/* User Groups Filter */}
                <div className="w-full lg:flex-1 bg-white p-2 rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                    <div className="flex items-center gap-2 overflow-x-auto pb-1 px-1 custom-scrollbar">
                        <span className="text-xs font-bold text-slate-400 uppercase mr-2 flex-shrink-0 flex items-center gap-1">
                            <User className="w-3 h-3"/> Reporter:
                        </span>
                        <button onClick={() => setActiveUserKey('all')} className={`flex-shrink-0 px-4 py-2 rounded-xl text-sm font-bold transition-all border ${activeUserKey === 'all' ? 'bg-slate-800 text-white border-slate-800 shadow-md' : 'bg-white text-slate-500 border-transparent hover:bg-slate-50'}`}>All</button>
                        {userGroups.map(group => (
                            <button key={group.key} onClick={() => setActiveUserKey(group.key)} className={`flex-shrink-0 px-4 py-2 rounded-xl text-sm font-bold transition-all border flex items-center gap-2 ${activeUserKey === group.key ? 'bg-blue-600 text-white border-blue-600 shadow-md' : 'bg-slate-50 text-slate-600 border-slate-100 hover:bg-white hover:border-blue-200 hover:text-blue-600'}`}>
                                {group.label} <span className={`text-[10px] px-1.5 py-0.5 rounded-md ${activeUserKey === group.key ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-500'}`}>{group.count}</span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Advanced Filter Toggle */}
                <button onClick={() => setIsFilterOpen(!isFilterOpen)} className={`flex-shrink-0 flex items-center gap-2 px-6 py-4 rounded-2xl font-bold shadow-sm border transition-all ${isFilterOpen ? 'bg-blue-50 border-blue-200 text-blue-600' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'}`}>
                    <SlidersHorizontal className="w-5 h-5" /> {isFilterOpen ? 'Hide Filters' : 'Advanced Filters'}
                </button>
            </div>

            {/* Advanced Filters Panel */}
            {isFilterOpen && (
                <div className="bg-white p-8 rounded-3xl shadow-xl border border-slate-100 animate-in slide-in-from-top-4">
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
                        {FILTER_FIELDS.map(col => (
                            <div key={col.key}>
                                <label className="text-xs font-bold text-slate-400 uppercase tracking-wide block mb-2">{col.label}</label>
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                                    <input 
                                        type="text" 
                                        className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-700 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all" 
                                        placeholder={`Search...`} 
                                        value={pendingFilters[col.key] || ''} 
                                        onChange={(e) => setPendingFilters(prev => ({...prev, [col.key]: e.target.value}))}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className="mt-8 flex justify-end gap-3 pt-6 border-t border-slate-50">
                        <button onClick={handleClearFilters} className="text-sm font-bold text-red-500 hover:bg-red-50 px-4 py-2 rounded-lg transition-colors mr-auto">Reset</button>
                        <button onClick={() => setIsFilterOpen(false)} className="px-6 py-3 rounded-xl text-slate-500 font-bold hover:bg-slate-100">Cancel</button>
                        <button onClick={handleApplyFilters} className="px-8 py-3 bg-blue-600 text-white rounded-xl font-bold shadow-lg shadow-blue-600/30 hover:bg-blue-700">Apply Filters</button>
                    </div>
                </div>
            )}
        </>
    );
}