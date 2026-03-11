import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  History, Layers, Database, BarChart3, 
  FileText, FileDown, RefreshCcw, DownloadCloud, 
  Package, X, Plus, Trash2, Loader2, 
  CheckCircle, AlertCircle, Activity, Server, Tag,
  Calendar, Filter, Settings2, Clock
} from 'lucide-react';
import { 
  Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, 
  ResponsiveContainer, ReferenceLine, Area, ComposedChart 
} from 'recharts';

// กำหนด URL API
import { API_BASE_URL } from '../config';

// ชุดสีสำหรับแสดงกราฟเส้น POS แต่ละเครื่อง
const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#14b8a6', '#f43f5e', '#eab308', '#6366f1', '#06b6d4'];

// ==========================================
// 1. SystemStatCard: การ์ดแสดงสถานะ System
// ==========================================
const SystemStatCard = ({ data }) => {
  const isPos = data.SYSTEM === 'POS';
  
  const theme = isPos ? {
    bg: 'bg-blue-50', border: 'border-blue-200', iconColor: 'text-blue-600', iconBg: 'bg-blue-100', hoverScale: 'group-hover:scale-110'
  } : {
    bg: 'bg-orange-50', border: 'border-orange-200', iconColor: 'text-orange-600', iconBg: 'bg-orange-100', hoverScale: 'group-hover:scale-110'
  };

  return (
    <div className={`bg-white dark:bg-slate-900 rounded-2xl p-5 border ${theme.border} dark:border-slate-800 shadow-sm relative overflow-hidden group transition-all duration-300 hover:shadow-md h-full flex flex-col justify-center`}>
      <div className={`absolute top-0 right-0 w-24 h-24 ${theme.bg} rounded-bl-full opacity-50 transition-transform duration-500 ease-out ${theme.hoverScale}`} />
      
      <div className="flex justify-between items-start mb-4 relative z-10 flex-none">
        <div className="flex items-center gap-3">
          <div className={`p-2.5 ${theme.iconBg} rounded-xl ${theme.iconColor} shadow-sm`}>
            {isPos ? <Server className="w-6 h-6" /> : <Layers className="w-6 h-6" />}
          </div>
          <div>
            <h3 className="font-black text-lg text-slate-800 dark:text-white tracking-tight">{data.SYSTEM}</h3>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">System Status</span>
          </div>
        </div>

        <div className="text-right">
             <div className="flex items-center justify-end gap-1 text-purple-600 font-bold bg-purple-50 px-2.5 py-1 rounded-lg border border-purple-100 shadow-sm">
                <Tag className="w-3.5 h-3.5" />
                <span className="text-xs">{data.TOTAL_PROMOTION?.toLocaleString() || 0}</span>
             </div>
             <span className="text-[9px] text-slate-400 mt-1 block font-medium">Active Promos</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 relative z-10 flex-1">
        <div className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl border border-slate-100 dark:border-slate-800 hover:border-slate-200 transition-colors flex flex-col justify-between">
          <div className="flex items-center gap-2 mb-2">
            <Activity className="w-3.5 h-3.5 text-green-500" />
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Transactions</span>
          </div>
          <div className="flex justify-between items-end mt-auto">
            <div>
              <p className="text-[10px] text-slate-400 font-medium mb-0.5">Today</p>
              <p className="text-xl font-black text-slate-700 dark:text-slate-200 leading-none">
                {data.TS_TODAY?.toLocaleString() || 0}
              </p>
            </div>
            <div className="text-right">
              <p className="text-[10px] text-slate-400 font-medium mb-0.5">Total</p>
              <p className="text-sm font-bold text-slate-500 leading-none">
                {data.TS_ACCUMULATE?.toLocaleString() || 0}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl border border-slate-100 dark:border-slate-800 hover:border-slate-200 transition-colors flex flex-col justify-between">
          <div className="flex items-center gap-2 mb-2">
            <AlertCircle className="w-3.5 h-3.5 text-red-500" />
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Defects</span>
          </div>
          <div className="flex justify-between items-end mt-auto">
             <div>
              <p className="text-[10px] text-slate-400 font-medium mb-0.5">Today</p>
              <p className={`text-xl font-black leading-none ${data.TD_TODAY > 0 ? 'text-red-600' : 'text-slate-700'} dark:text-slate-200`}>
                {data.TD_TODAY?.toLocaleString() || 0}
              </p>
            </div>
            <div className="text-right">
              <p className="text-[10px] text-slate-400 font-medium mb-0.5">Accumulate</p>
              <p className={`text-sm font-bold leading-none ${data.TD_ACCUMULATE > 0 ? 'text-red-500' : 'text-slate-500'}`}>
                {data.TD_ACCUMULATE?.toLocaleString() || 0}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// ==========================================
// 2. PosPerformanceGraph: กราฟแท่งและเส้น
// ==========================================
const PosPerformanceGraph = ({ refreshTrigger }) => {
  const [metric, setMetric] = useState('tatal_transation');
  const [dateField, setDateField] = useState('SALES_DATE');
  const [timeframe, setTimeframe] = useState('daily');
  const [storeCode, setStoreCode] = useState('ALL');

  const [graphData, setGraphData] = useState({
    chartData: [], posList: [], overallAverage: 0, summary: { totalRecords: 0, totalValue: 0 }, stores: []
  });
  const [loading, setLoading] = useState(true);

  // ดึงข้อมูลใหม่เสมอเมื่อ Filters เปลี่ยน หรือเมื่อถูกสั่ง Refresh (refreshTrigger)
  useEffect(() => {
    const fetchGraphData = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams({ metric, dateField, timeframe, storeCode });
        const response = await fetch(`${API_BASE_URL}/DASHBOARD/dashboard-transation?${params}`);
        if (!response.ok) throw new Error("API not available");
        const json = await response.json();
        setGraphData(json);
      } catch (error) {
        // Fallback Mock Data in case API is down during development
        const mockResponse = {
          "chartData": [
            { "date": "2026-03-01", "00882-POS2": 0, "01154-POS1": 0, "01154-POS2": 0, "09894-POS1": 0, "09894-POS2": 0, "11104-POS1": 1141, "15757-POS1": 0, "18011-POS1": 0, "18011-POS2": 0, "18562-POS1": 0, "PeriodAverage": 1141 },
            { "date": "2026-03-02", "00882-POS2": 150, "01154-POS1": 200, "01154-POS2": 50, "09894-POS1": 120, "09894-POS2": 0, "11104-POS1": 900, "15757-POS1": 10, "18011-POS1": 50, "18011-POS2": 25, "18562-POS1": 80, "PeriodAverage": 158.5 }
          ],
          "posList": ["00882-POS2", "01154-POS1", "01154-POS2", "09894-POS1", "09894-POS2", "11104-POS1", "15757-POS1", "18011-POS1", "18011-POS2", "18562-POS1"],
          "overallAverage": 7.04,
          "summary": { "totalRecords": 5157, "totalValue": 36298 },
          "stores": ["00882", "01154", "09894", "11104", "15757", "18011", "18562"]
        };
        setGraphData(mockResponse);
      } finally {
        setLoading(false);
      }
    };
    fetchGraphData();
  }, [metric, dateField, timeframe, storeCode, refreshTrigger]);

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 h-full flex flex-col overflow-hidden min-h-0">
      <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800 bg-white z-10 flex flex-col gap-4 flex-none">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-blue-100 dark:bg-blue-900/30 rounded-lg text-blue-600 dark:text-blue-400">
            <BarChart3 className="w-4 h-4"/>
          </div>
          <h3 className="font-bold text-slate-800 dark:text-white text-sm">POS Performance Analytics</h3>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-bold text-slate-500 uppercase flex items-center gap-1"><Database size={12}/> Store</label>
            <select value={storeCode} onChange={(e) => setStoreCode(e.target.value)} className="w-full p-2 border border-slate-200 rounded-lg text-xs bg-slate-50 outline-none focus:ring-1 focus:ring-blue-500">
              <option value="ALL">All Stores</option>
              {graphData.stores.map(st => <option key={st} value={st}>Store: {st}</option>)}
            </select>
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-bold text-slate-500 uppercase flex items-center gap-1"><Settings2 size={12}/> Metric</label>
            <select value={metric} onChange={(e) => setMetric(e.target.value)} className="w-full p-2 border border-slate-200 rounded-lg text-xs bg-slate-50 outline-none focus:ring-1 focus:ring-blue-500">
              <option value="tatal_transation">Total Transaction</option>
              <option value="promotion_code">Promotion Code</option>
            </select>
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-bold text-slate-500 uppercase flex items-center gap-1"><Calendar size={12}/> Date Basis</label>
            <select value={dateField} onChange={(e) => setDateField(e.target.value)} className="w-full p-2 border border-slate-200 rounded-lg text-xs bg-slate-50 outline-none focus:ring-1 focus:ring-blue-500">
              <option value="SALES_DATE">Sales Date</option>
              <option value="CREATE_DATE">Create Date</option>
            </select>
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-bold text-slate-500 uppercase flex items-center gap-1"><Filter size={12}/> Timeframe</label>
            <select value={timeframe} onChange={(e) => setTimeframe(e.target.value)} className="w-full p-2 border border-slate-200 rounded-lg text-xs bg-slate-50 outline-none focus:ring-1 focus:ring-blue-500">
              <option value="daily">Daily</option>
              <option value="monthly">Monthly</option>
              <option value="yearly">Yearly</option>
            </select>
          </div>
        </div>
      </div>

      <div className="flex-1 p-4 relative min-h-0">
        {loading && (
          <div className="absolute inset-0 z-20 bg-white/60 flex items-center justify-center backdrop-blur-sm">
            <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
          </div>
        )}

        {graphData.chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={graphData.chartData} margin={{ top: 20, right: 20, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis dataKey="date" stroke="#94a3b8" tick={{ fill: '#64748b', fontSize: 11 }} tickMargin={8} />
              
              {/* แกน Y ใช้ domain=['auto', 'auto'] เพื่อให้สเกลปรับเปลี่ยนอัตโนมัติตามข้อมูลที่ Return กลับมา */}
              <YAxis stroke="#94a3b8" tick={{ fill: '#64748b', fontSize: 11 }} domain={['auto', 'auto']} />
              
              <RechartsTooltip 
                contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '12px' }}
              />
              <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />

              <ReferenceLine 
                y={graphData.overallAverage} 
                stroke="#f97316" strokeDasharray="4 4" 
                label={{ position: 'insideTopLeft', value: `Avg: ${graphData.overallAverage}`, fill: '#f97316', fontSize: 11, fontWeight: 'bold' }} 
              />

              <Area type="monotone" dataKey="PeriodAverage" name="Period Avg" fill="#cbd5e1" fillOpacity={0.2} stroke="#94a3b8" strokeDasharray="3 3" />

              {graphData.posList.map((pos, index) => (
                <Line
                  key={pos} type="monotone" dataKey={pos} name={`POS ${pos}`}
                  stroke={COLORS[index % COLORS.length]} strokeWidth={2}
                  dot={{ r: 3 }} activeDot={{ r: 5 }} connectNulls={true}
                />
              ))}
            </ComposedChart>
          </ResponsiveContainer>
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 opacity-60">
            <BarChart3 className="w-12 h-12 mb-3" />
            <p className="text-sm">No Data Found</p>
          </div>
        )}
      </div>
    </div>
  );
};

// ==========================================
// 3. DetailDataSection: ตารางแสดงรายละเอียดแบบย่อ
// ==========================================
const DetailDataSection = ({ data }) => {
    const summary = useMemo(() => {
        if (!data) return { files: 0, sheets: 0, promotion: 0, product: 0, sku: 0 };
        return data.reduce((acc, curr) => ({
            files: acc.files + (curr["Total Files"] || 0),
            sheets: acc.sheets + (curr["Total Sheet"] || 0),
            promotion: acc.promotion + (curr["PROMOTION"] || 0),
            product: acc.product + (curr["PRODUCT"] || 0),
            sku: acc.sku + (curr["SKU"] || 0)
        }), { files: 0, sheets: 0, promotion: 0, product: 0, sku: 0 });
    }, [data]);

    return (
        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 h-full flex flex-col overflow-hidden min-h-0">
            <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center gap-2 flex-none bg-white z-10">
                <div className="p-1.5 bg-orange-100 dark:bg-orange-900/30 rounded-lg text-orange-600 dark:text-orange-400">
                    <FileText className="w-4 h-4"/>
                </div>
                <h3 className="font-bold text-slate-800 dark:text-white text-sm">Import Batch Details</h3>
            </div>
            
            {/* พื้นที่ตารางที่มี Scrollbar ภายในตัวเอง */}
            <div className="flex-1 overflow-y-auto custom-scrollbar relative bg-slate-50/30 min-h-0">
                <table className="w-full text-[11px] text-left border-collapse">
                    <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 font-bold uppercase tracking-wider sticky top-0 z-20 shadow-sm backdrop-blur-sm">
                        <tr>
                            <th className="px-3 py-2 bg-slate-50">Ver/Sys</th>
                            <th className="px-3 py-2 text-center bg-slate-50">Files</th>
                            <th className="px-3 py-2 text-right bg-slate-50">Promo/SKU</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 bg-white">
                        {!data || data.length === 0 ? (
                            <tr><td colSpan={3} className="text-center py-10 text-slate-400">No Data</td></tr>
                        ) : (
                            data.map((row, i) => (
                                <tr key={i} className="hover:bg-slate-50 transition">
                                    <td className="px-3 py-2">
                                        <div className="font-mono font-bold text-blue-600">{row["Versions"]}</div>
                                        <div className={`mt-0.5 inline-block px-1.5 py-0.5 rounded font-bold text-[9px] border ${row["SYSTEM"] === 'DELIVERY' ? 'bg-orange-50 text-orange-600 border-orange-100' : 'bg-blue-50 text-blue-600 border-blue-100'}`}>
                                            {row["SYSTEM"]}
                                        </div>
                                    </td>
                                    <td className="px-3 py-2 text-center text-slate-600">
                                        <div className="font-bold text-slate-700">{row["Total Files"]}</div>
                                        <div className="text-[9px]">{row["Total Sheet"]} sheets</div>
                                    </td>
                                    <td className="px-3 py-2 text-right">
                                        <div className="font-bold text-purple-600">{(row["PROMOTION"] || 0).toLocaleString()}</div>
                                        <div className="text-[9px] text-slate-500">{(row["SKU"] || 0).toLocaleString()} SKUs</div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            <div className="bg-white border-t border-slate-200 p-3 flex-none z-10">
                <div className="flex text-[10px] font-bold text-slate-700 justify-between items-center">
                    <span className="text-slate-500">Summary</span>
                    <div className="flex gap-4 text-right">
                        <span>{summary.files.toLocaleString()} <span className="font-normal opacity-70">F</span></span>
                        <span className="text-purple-600">{summary.promotion.toLocaleString()} <span className="font-normal opacity-70">Prm</span></span>
                        <span>{summary.sku.toLocaleString()} <span className="font-normal opacity-70">SKU</span></span>
                    </div>
                </div>
            </div>
        </div>
    );
};

// ==========================================
// 4. Modals: Export & FetchData
// ==========================================
const ExportModal = ({ isOpen, onClose }) => {
    const [selectedFile, setSelectedFile] = useState("");
    const [loading, setLoading] = useState(false);
    const fileOptions = ["Daily_Summary_Report", "Promotion_Detail_Log", "System_Error_Log", "SKU_Analysis_Sheet"];

    const handleConfirm = async () => {
        if (!selectedFile) return alert("กรุณาเลือกไฟล์ที่ต้องการ Export");
        setLoading(true);
        try {
            await new Promise(res => setTimeout(res, 1000));
            alert("Export สำเร็จ!");
            onClose();
        } catch (error) {
            console.error("Export Error:", error);
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 bg-slate-900/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in">
            <div className="bg-white p-6 rounded-2xl w-full max-w-sm shadow-2xl">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="font-black text-lg text-slate-800">Export Data</h3>
                    <button onClick={onClose}><X className="w-5 h-5 text-slate-400 hover:text-red-500"/></button>
                </div>
                <div className="space-y-4">
                    <label className="block text-xs font-bold text-slate-500 mb-1">Select Document</label>
                    <select className="w-full p-2.5 border border-slate-200 rounded-lg text-sm bg-slate-50 outline-none" value={selectedFile} onChange={(e) => setSelectedFile(e.target.value)}>
                        <option value="">-- Choose File --</option>
                        {fileOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                    </select>
                </div>
                <div className="mt-6 flex justify-end gap-2">
                    <button onClick={onClose} className="px-4 py-2 bg-slate-100 text-slate-600 rounded-lg text-sm font-bold">Cancel</button>
                    <button onClick={handleConfirm} disabled={loading} className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-bold flex items-center gap-2 disabled:opacity-50">
                        {loading ? <Loader2 className="w-4 h-4 animate-spin"/> : <FileDown className="w-4 h-4"/>} Confirm Export
                    </button>
                </div>
            </div>
        </div>
    );
};

// เพิ่ม props onSuccess เพื่อใช้ Trigger กราฟให้รีเฟรชข้อมูลเมื่อทำเสร็จ
const FetchDataModal = ({ isOpen, onClose, committedData, onCommit, onSuccess }) => {
    const [step, setStep] = useState(0); 
    const [selectedType, setSelectedType] = useState(null); 
    const [productInput, setProductInput] = useState("");
    const [ipList, setIpList] = useState([""]); 
    const [progress, setProgress] = useState(0);
    const [logs, setLogs] = useState([]);
    const [isProcessing, setIsProcessing] = useState(false); 
    
    const [elapsedSeconds, setElapsedSeconds] = useState(0);

    useEffect(() => {
        if(isOpen) {
            if (committedData) {
                setIpList(committedData.ipList || [""]);
                setProductInput(committedData.productInput || "");
                setSelectedType(committedData.selectedType || null);
                setStep(1); 
            } else {
                setStep(0);
                setSelectedType(null);
                setProductInput("");
                setIpList([""]);
            }
            setProgress(0);
            setLogs([]);
            setIsProcessing(false);
            setElapsedSeconds(0);
        }
    }, [isOpen, committedData]);

    useEffect(() => {
        let interval;
        if (isProcessing) {
            interval = setInterval(() => {
                setElapsedSeconds(prev => prev + 1);
            }, 1000);
        } else {
            clearInterval(interval);
        }
        return () => clearInterval(interval);
    }, [isProcessing]);

    const formatTime = (seconds) => {
        const m = Math.floor(seconds / 60).toString().padStart(2, '0');
        const s = (seconds % 60).toString().padStart(2, '0');
        return `${m}:${s}`;
    };

    const handleIpChange = (index, value) => {
        const newList = [...ipList];
        newList[index] = value;
        setIpList(newList);
    };

    const processTransaction = async () => {
        const validIps = ipList.filter(ip => ip.trim() !== "");
        if (validIps.length === 0) return alert("กรุณาระบุ IP Address อย่างน้อย 1 ค่า");

        onCommit({ ipList: validIps, productInput, selectedType });

        setStep(2);
        setProgress(0);
        setLogs([]);
        setElapsedSeconds(0); 
        setIsProcessing(true);

        const total = validIps.length;
        let hasSuccess = false;

        // วนลูปยิง API ทีละ 1 IP ตามลำดับ
        for (let i = 0; i < total; i++) {
            const currentIp = validIps[i];
            setLogs(prev => [...prev, { type: 'info', msg: `[${i+1}/${total}] Connecting to ${currentIp}...` }]);
            
            try {
                // เรียก POST ไปที่ /EXPORT/sync/single พร้อม Payload เป็น JSON
                const response = await fetch(`${API_BASE_URL}/EXPORT/sync/single`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ ip_address: currentIp })
                });

                if (!response.ok) {
                    throw new Error(`HTTP Error: ${response.status}`);
                }
                
                hasSuccess = true;
                setLogs(prev => [...prev, { type: 'success', msg: `✓ Success: ${currentIp} Processed.` }]);
            } catch (error) {
                setLogs(prev => [...prev, { type: 'error', msg: `✗ Failed: ${currentIp} (${error.message})` }]);
            }

            setProgress(Math.round(((i + 1) / total) * 100));
        }

        setIsProcessing(false);
        setTimeout(() => {
            setStep(3);
            // หากมี IP อย่างน้อย 1 ค่าที่ดึงสำเร็จ จะสั่ง Refresh กราฟและหน้าจอ
            if (hasSuccess && onSuccess) {
                onSuccess();
            }
        }, 800); 
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-slate-900/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in">
            <div className="bg-white p-6 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden relative flex flex-col max-h-[90vh]">
                <div className="flex justify-between items-center mb-6 flex-none">
                    <h3 className="font-black text-lg text-slate-800 flex items-center gap-2">
                        <DownloadCloud className="w-5 h-5 text-purple-600"/> Pull Data System
                    </h3>
                    {step !== 2 && <button onClick={onClose}><X className="w-5 h-5 text-slate-400 hover:text-red-500"/></button>}
                </div>

                <div className="flex-1 overflow-y-auto custom-scrollbar px-1">
                    {step === 0 && (
                        <div className="grid grid-cols-2 gap-3">
                            <button onClick={() => { setSelectedType('TRANSACTION'); setStep(1); }} className="p-4 border border-slate-200 rounded-xl hover:bg-purple-50 hover:border-purple-200 transition group text-left">
                                <div className="p-2 bg-slate-100 rounded-lg w-fit mb-2 group-hover:bg-purple-200 group-hover:text-purple-700 transition"><Database className="w-5 h-5"/></div>
                                <span className="font-bold text-slate-700 group-hover:text-purple-700 block">Transaction</span>
                                <span className="text-[10px] text-slate-400">Pull by IP (Max 10)</span>
                            </button>
                             <button onClick={() => { setSelectedType('PRODUCT'); setStep(1); }} className="p-4 border border-slate-200 rounded-xl hover:bg-blue-50 hover:border-blue-200 transition group text-left">
                                <div className="p-2 bg-slate-100 rounded-lg w-fit mb-2 group-hover:bg-blue-200 group-hover:text-blue-700 transition"><Package className="w-5 h-5"/></div>
                                <span className="font-bold text-slate-700 group-hover:text-blue-700 block">Product</span>
                                <span className="text-[10px] text-slate-400">Input Single Value</span>
                            </button>
                        </div>
                    )}

                    {step === 1 && selectedType === 'PRODUCT' && (
                        <div>
                            <label className="block text-xs font-bold text-slate-500 mb-1">Product Value</label>
                            <input type="text" className="w-full p-3 border border-slate-200 rounded-xl text-sm outline-none" placeholder="Enter product code..." value={productInput} onChange={(e) => setProductInput(e.target.value)} />
                        </div>
                    )}

                    {step === 1 && selectedType === 'TRANSACTION' && (
                        <div className="space-y-4">
                            <label className="block text-xs font-bold text-slate-500 mb-1 sticky top-0 bg-white z-10">IP Address List ({ipList.length}/10)</label>
                            {ipList.map((ip, idx) => (
                                <div key={idx} className="flex gap-2">
                                    <input type="text" className="flex-1 p-2.5 border border-slate-200 rounded-lg text-sm outline-none" placeholder={`192.168.x.x`} value={ip} onChange={(e) => handleIpChange(idx, e.target.value)} />
                                    {ipList.length > 1 && <button onClick={() => setIpList(ipList.filter((_, i) => i !== idx))} className="p-2 text-red-400 hover:bg-red-50 rounded-lg"><Trash2 className="w-4 h-4"/></button>}
                                </div>
                            ))}
                            {ipList.length < 10 && (
                                <button onClick={() => setIpList([...ipList, ""])} className="w-full py-2 border border-dashed border-slate-300 rounded-lg text-slate-500 text-sm font-bold hover:bg-slate-50 flex items-center justify-center gap-2"><Plus className="w-4 h-4"/> Add IP Field</button>
                            )}
                        </div>
                    )}

                    {step === 2 && (
                        <div className="py-4 text-center space-y-4">
                            <div className="relative w-32 h-32 mx-auto">
                                <svg className="absolute inset-0 w-full h-full animate-[spin_3s_linear_infinite] opacity-40" viewBox="0 0 100 100">
                                    <circle cx="50" cy="50" r="48" fill="none" stroke="#a855f7" strokeWidth="2" strokeDasharray="10 10" />
                                </svg>
                                
                                <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 36 36">
                                    <path className="text-slate-100" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="3" />
                                    <path className="text-purple-600 transition-all duration-300 ease-out drop-shadow-md" strokeDasharray={`${progress}, 100`} d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
                                </svg>

                                <div className="absolute inset-0 flex flex-col items-center justify-center">
                                    <span className="font-black text-3xl text-purple-600 leading-none">{progress}%</span>
                                </div>
                            </div>
                            
                            <div className="flex flex-col items-center justify-center gap-2">
                                <p className="text-sm font-bold text-slate-600 animate-pulse">Syncing Data...</p>
                                <div className="flex items-center gap-1.5 font-mono text-xs font-bold bg-purple-50 text-purple-600 px-3 py-1.5 rounded-full border border-purple-100 shadow-sm">
                                    <Clock className="w-3.5 h-3.5" />
                                    Time Elapsed: {formatTime(elapsedSeconds)}
                                </div>
                            </div>
                            
                            <div className="mt-4 bg-slate-900 rounded-xl p-3 h-32 overflow-y-auto text-left custom-scrollbar border border-slate-800 shadow-inner">
                                {logs.map((log, i) => (
                                    <div key={i} className={`text-[10px] font-mono mb-1.5 ${log.type === 'error' ? 'text-red-400' : log.type === 'success' ? 'text-green-400' : 'text-slate-400'}`}>
                                        {log.msg}
                                    </div>
                                ))}
                                <div ref={(el) => el && el.scrollIntoView({ behavior: "smooth" })}></div>
                            </div>
                        </div>
                    )}

                    {step === 3 && (
                        <div className="py-6 text-center space-y-4 animate-in zoom-in">
                            <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4"><CheckCircle className="w-8 h-8"/></div>
                            <h4 className="text-xl font-black text-slate-800">Success!</h4>
                            <p className="text-sm text-slate-500 mb-2">Operation completed in {formatTime(elapsedSeconds)}.</p>
                        </div>
                    )}
                </div>

                {step === 1 && (
                    <div className="flex justify-end gap-2 pt-4 border-t border-slate-100 mt-4 flex-none">
                        <button onClick={() => setStep(0)} className="px-4 py-2 bg-slate-100 rounded-lg text-sm font-bold text-slate-600">Back</button>
                        <button onClick={processTransaction} disabled={isProcessing} className="px-4 py-2 bg-purple-600 text-white rounded-lg text-sm font-bold disabled:opacity-50 flex items-center gap-2">
                            {isProcessing && <Loader2 className="w-4 h-4 animate-spin"/>} Start Process
                        </button>
                    </div>
                )}
                
                {step === 3 && (
                     <div className="pt-4 border-t border-slate-100 mt-4 flex-none">
                        <button onClick={onClose} className="w-full py-3 bg-slate-800 text-white rounded-xl font-bold">Close Window</button>
                    </div>
                )}
            </div>
        </div>
    );
};

// ==========================================
// 5. Main Component: App (HistoryScreen)
// ==========================================
export default function App() {
  const [detailData, setDetailData] = useState([]);    
  const [systemStatusData, setSystemStatusData] = useState([]); 

  const [activeModal, setActiveModal] = useState(null); 
  const [loading, setLoading] = useState(true);

  // Trigger State สำหรับสั่ง Refresh ข้อมูลกราฟและตารางเมื่อ Pull Data สำเร็จ
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const [committedPullData, setCommittedPullData] = useState(null);

  useEffect(() => {
    fetchData();
  }, [refreshTrigger]); // ดึงข้อมูลใหม่ถ้า Trigger ถูกสั่งงาน

  const fetchData = async () => {
    try {
      setLoading(true);

      const fetchWithFallback = async (endpoint, fallbackData) => {
        try {
          const response = await fetch(`${API_BASE_URL}${endpoint}`);
          if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
          return await response.json();
        } catch (error) {
          console.warn(`Fetch failed for ${endpoint}, using fallback data.`);
          return fallbackData; 
        }
      };

      const mockDetailData = [
        { "Versions": "26001", "SYSTEM": "DELIVERY", "Total Files": 14, "Total Sheet": 22, "PROMOTION": 1578, "PRODUCT": 8564, "SKU": 26007 }
      ];

      const mockReportByDayData = [
        { "SYSTEM": "DELIVERY", "TS_TODAY": 0, "TS_LAST_AVAILABLE_DAY": 76, "TS_ACCUMULATE": 160, "TD_TODAY": 0, "TD_ACCUMULATE": 2, "TOTAL_PROMOTION": 539 },
        { "SYSTEM": "POS", "TS_TODAY": 0, "TS_LAST_AVAILABLE_DAY": 520, "TS_ACCUMULATE": 2679, "TD_TODAY": 0, "TD_ACCUMULATE": 44, "TOTAL_PROMOTION": 3525 }
      ];

      const [detailResult, reportResult] = await Promise.all([
        fetchWithFallback('/DASHBOARD/ALL', mockDetailData),
        fetchWithFallback('/DASHBOARD/REPORT-BY-DAY', mockReportByDayData)
      ]);

      setDetailData(detailResult);
      setSystemStatusData(reportResult);

    } catch (error) {
      console.error("Fetch Error:", error);
    } finally {
        setLoading(false);
    }
  };

  return (
    // จัดการ Layout ไม่ให้มี Scrollbar หลัก (h-screen overflow-hidden)
    <div className=" max-h-screen flex flex-col bg-slate-50/50 p-4 gap-4 overflow-x-auto font-sans text-slate-800">


      {/* 2. System Status Board */}
      <div className="flex-none grid grid-cols-1 md:grid-cols-2 gap-4 h-[160px]">
            {systemStatusData.map((data, index) => <SystemStatCard key={index} data={data} />)}
      </div>

      {/* 3. Main Content (Graph & Detail Table) - ใช้ flex-1 min-h-0 เพื่อรักษาสัดส่วน */}
      <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-12 gap-4 pb-1">
            {/* กราฟกินพื้นที่หลัก 8 ส่วน */}
            <div className="lg:col-span-8 h-full min-h-0">
                <PosPerformanceGraph refreshTrigger={refreshTrigger} />
            </div>
            
            {/* ตารางย่อลงกินพื้นที่ 4 ส่วน */}
            <div className="lg:col-span-4 h-full min-h-0">
                <DetailDataSection data={detailData} />
            </div>
      </div>

      <ExportModal isOpen={activeModal === 'EXPORT'} onClose={() => setActiveModal(null)} />
      
      {/* เพิ่ม Props onSuccess ให้ FetchDataModal เพื่อสั่งอัปเดตข้อมูลอัตโนมัติเมื่อทำเสร็จ */}
      <FetchDataModal 
        isOpen={activeModal === 'FETCH_DATA'} 
        onClose={() => setActiveModal(null)} 
        committedData={committedPullData}
        onCommit={(data) => setCommittedPullData(data)} 
        onSuccess={() => setRefreshTrigger(prev => prev + 1)} 
      />
    </div>
  );
}