// components/assign/AssignChart.jsx
import React, { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

const AssignChart = ({ data, activeUsers }) => {
  // คำนวณผลรวม VALUE ตาม ASSIGNED_TO
  const chartData = useMemo(() => {
    const sums = {};
    // เตรียมข้อมูลเริ่มต้นให้ User ทุกคนมีค่า 0 (ใช้ username แสดงผล)
    activeUsers.forEach(u => sums[u.id] = { username: u.username, value: 0 });
    
    // บวกรวมค่า VALUE
    data.forEach(item => {
      if (item.ASSIGNED_TO && sums[item.ASSIGNED_TO]) {
        sums[item.ASSIGNED_TO].value += item.VALUE;
      }
    });

    return Object.values(sums);
  }, [data, activeUsers]);

  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData} margin={{ top: 20, right: 20, left: -20, bottom: 0 }}>
          <XAxis dataKey="username" tick={{ fontSize: 12, fill: '#64748b', fontWeight: 'bold' }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} tickLine={false} />
          <Tooltip 
            cursor={{ fill: '#f1f5f9' }}
            contentStyle={{ borderRadius: '1rem', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
          />
          <Bar dataKey="value" radius={[6, 6, 0, 0]}>
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.value > 0 ? '#3b82f6' : '#cbd5e1'} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default AssignChart;