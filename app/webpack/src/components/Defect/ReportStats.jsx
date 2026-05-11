import React, { useMemo } from 'react';
import { 
    BarChart, Bar, XAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell 
} from 'recharts';

export default function ReportStats({ filteredData, STATUS_OPTIONS }) {
    const stats = useMemo(() => {
        const total = filteredData.length;
        const resolved = filteredData.filter(d => d.status === 4 || d.status === 6).length;
        const pending = total - resolved;
        return { total, resolved, pending };
    }, [filteredData]);

    const pieChartData = useMemo(() => {
        const counts = {};
        filteredData.forEach(d => {
            counts[d.status] = (counts[d.status] || 0) + 1;
        });
        return Object.entries(STATUS_OPTIONS || {}).map(([key, config]) => ({
            name: config.label,
            value: counts[key] || 0,
            color: config.hex || '#ccc'
        })).filter(item => item.value > 0);
    }, [filteredData, STATUS_OPTIONS]);

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Total Stats */}
            <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 relative overflow-hidden group">
                <div className="absolute right-0 top-0 w-32 h-32 bg-blue-50 rounded-full -mr-10 -mt-10 group-hover:scale-110 transition-transform duration-500"></div>
                <div className="relative z-10">
                    <p className="text-slate-500 text-sm font-bold uppercase tracking-wider mb-1">Total Defects</p>
                    <h2 className="text-4xl font-black text-slate-800">{stats.total}</h2>
                    <div className="mt-6 flex gap-4">
                        <div className="flex-1 p-3 bg-emerald-50 rounded-xl border border-emerald-100">
                            <div className="text-xs text-emerald-600 font-bold uppercase mb-1">Resolved</div>
                            <div className="text-2xl font-bold text-emerald-700">{stats.resolved}</div>
                        </div>
                        <div className="flex-1 p-3 bg-rose-50 rounded-xl border border-rose-100">
                            <div className="text-xs text-rose-600 font-bold uppercase mb-1">Pending</div>
                            <div className="text-2xl font-bold text-rose-700">{stats.pending}</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Status Breakdown */}
            <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex flex-col">
                <div className="flex items-center gap-2 mb-4">
                    <div className="w-1.5 h-6 bg-purple-500 rounded-full"></div>
                    <h3 className="text-sm font-bold text-slate-700 uppercase">Status Breakdown</h3>
                </div>
                <div className="flex-1 min-h-[160px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie data={pieChartData} innerRadius={55} outerRadius={75} paddingAngle={5} dataKey="value" stroke="none">
                                {pieChartData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                ))}
                            </Pie>
                            <Tooltip contentStyle={{borderRadius:'12px', border:'none', boxShadow:'0 10px 25px -5px rgba(0,0,0,0.1)'}} itemStyle={{color:'#1e293b', fontWeight:'bold'}} />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* System Overview */}
            <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex flex-col">
                <div className="flex items-center gap-2 mb-4">
                    <div className="w-1.5 h-6 bg-orange-500 rounded-full"></div>
                    <h3 className="text-sm font-bold text-slate-700 uppercase">System Overview</h3>
                </div>
                <div className="flex-1 min-h-[160px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={[
                            { name: 'POS', value: filteredData.filter(d => d.system === 'POS').length }, 
                            { name: 'Delivery', value: filteredData.filter(d => d.system === 'DELIVERY').length }
                        ]}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize:12, fill:'#64748b', fontWeight:'600'}} dy={10} />
                            <Tooltip cursor={{fill:'#f8fafc', radius:8}} contentStyle={{borderRadius:'12px', border:'none', boxShadow:'0 4px 6px -1px rgb(0 0 0 / 0.1)'}} />
                            <Bar dataKey="value" fill="#6366f1" radius={[8, 8, 0, 0]} barSize={40}>
                                    <Cell fill="#6366f1" />
                                    <Cell fill="#8b5cf6" />
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
}