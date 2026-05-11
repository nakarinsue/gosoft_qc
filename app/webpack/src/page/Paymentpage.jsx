import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  ScanBarcode, QrCode, RefreshCw, Copy, Wifi, Loader2, 
  Wallet, AlertCircle, Check, Info, ChevronDown, UserIcon, 
  Search, ArrowUpRight, ArrowDownRight, Minus, Save
} from 'lucide-react';
import Barcode from 'react-barcode';
import { QRCodeSVG } from 'qrcode.react';

import EnterpriseDataTable from '../components/EnterpriseDataTable';
const  API_BASE_URL ='V2'

export default function BarcodeScreen({ user }) {
  // ----------------------------------------------------------------
  // 📍 1. State หลัก
  // ----------------------------------------------------------------
  const [allMemberValue, setAllMemberValue] = useState(''); 
  const [typepayment, setPayment] = useState('wallet');
  
  const [activeTab, setActiveTab] = useState('barcode');
  const [timeLeft, setTimeLeft] = useState(0); 
  const [codeValue, setCodeValue] = useState(''); 
  const [isGenerating, setIsGenerating] = useState(false);

  const [rewards, setRewards] = useState([]);
  const [previousRewards, setPreviousRewards] = useState(null);
  const [isTableLoading, setIsTableLoading] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [modifiedRows, setModifiedRows] = useState([]);
  const [showAllRewards, setShowAllRewards] = useState(false);

  const [toast, setToast] = useState({ show: false, msg: '', type: 'success' });

  const showToast = useCallback((msg, type = 'success') => {
    setToast({ show: true, msg, type });
    setTimeout(() => setToast({ show: false, msg: '', type: 'success' }), 3000);
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const savedMemberId = localStorage.getItem('allmember') || '';
    if (savedMemberId) {
      setAllMemberValue(savedMemberId);
    }
  }, []);

  useEffect(() => {
    setCodeValue('');
    setTimeLeft(0);
  }, [typepayment]);

  const getAuthHeaders = () => ({
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${localStorage.getItem('access_token')}`
  });

  // ================================================================
  // 🚀 Logic: ระบบ Generate Barcode
  // ================================================================
  const handleGenerate = useCallback(async () => {
    if (isGenerating) return;
    if (typepayment === 'allmember' && !allMemberValue) {
      return showToast("กรุณากรอกข้อมูลสมาชิกก่อนสร้างรหัส", "error");
    }

    setIsGenerating(true);
    try {
      let endpoint = '';
      if (typepayment === 'allmember') {
        endpoint = `${API_BASE_URL}/payment/allmember/${allMemberValue}`;
      } else if (typepayment === 'wallet') {
        endpoint = `${API_BASE_URL}/payment/wallet`;
      } else if (typepayment === 'allwallet') {
        endpoint = `${API_BASE_URL}/payment/allwallet`;
      }

      const response = await fetch(endpoint, { method: 'GET', headers: getAuthHeaders() });
      if (!response.ok) throw new Error("ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้");
      const data = await response.json();
      
      if (typepayment === 'allmember') {
        if (data.returnCode === '00000') {
          setCodeValue(data.barcodeId);
          setTimeLeft((data.expiredMinute || 15) * 60);
          showToast("สร้างรหัส All Member สำเร็จ", "success");
        } else {
          throw new Error(data.returnDescTH || 'ไม่พบข้อมูลสมาชิก');
        }
      } else {
        if (data.status === 'success' && data.paycode) {
          setCodeValue(data.paycode);
          setTimeLeft(5 * 60); 
          showToast(data.message || "สร้างรหัสชำระเงินสำเร็จ", "success");
        } else {
          throw new Error(data.message || 'รหัสในระบบหมดหรือเกิดข้อผิดพลาด');
        }
      }
    } catch (error) {
      showToast(error.message, "error");
    } finally {
      setIsGenerating(false);
    }
  }, [isGenerating, typepayment, allMemberValue, showToast]);

  const handleCopy = () => {
    if (!codeValue) return;
    navigator.clipboard.writeText(codeValue);
    showToast("คัดลอกรหัสสำเร็จแล้ว", "success");
  };

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  // ================================================================
  // 🚀 Logic: ระบบ Reward Table
  // ================================================================
  const fetchRewards = async () => {
    if (!allMemberValue) return showToast("กรุณาระบุรหัสสมาชิกเพื่อค้นหา Reward", "warning");
    setIsTableLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/payment/reward/${allMemberValue}`, {
        method: 'GET',
        headers: getAuthHeaders()
      });
      const data = await response.json();
      
      if (data.status?.status_code === '00000' && data.data?.rewards) {
        if (rewards.length > 0) {
          setPreviousRewards([...rewards]); 
        } else {
          setPreviousRewards(JSON.parse(JSON.stringify(data.data.rewards)));
        }
        setRewards(data.data.rewards);
        showToast("ดึงข้อมูล Reward สำเร็จ", "success");
      } else {
        throw new Error(data.status?.message_th || "ไม่สามารถดึงข้อมูลได้");
      }
    } catch (err) {
      showToast(err.message, "error");
    } finally {
      setIsTableLoading(false);
    }
  };

  const handleValueChange = (rewardId, field, newValue) => {
    const numValue = parseInt(newValue) || 0;
    setRewards(prev => prev.map(item => {
      if (item.reward_id === rewardId) {
        return { ...item, [field]: numValue, isModified: true };
      }
      return item;
    }));
  };

  const getTrend = (current, field) => {
    if (!previousRewards) return null;
    const prev = previousRewards.find(p => p.reward_id === current.reward_id);
    if (!prev) return null;
    const diff = current[field] - prev[field];
    if (diff > 0) return <ArrowUpRight className="text-emerald-500 w-4 h-4 shrink-0" />;
    if (diff < 0) return <ArrowDownRight className="text-rose-500 w-4 h-4 shrink-0" />;
    return <Minus className="text-slate-300 w-4 h-4 shrink-0" />;
  };

  const prepareUpdate = () => {
    if (!previousRewards) return;
    const modified = rewards.map(current => {
      const prev = previousRewards.find(p => p.reward_id === current.reward_id);
      if (!prev) return null;
      const diffQty = current.reward_qty - prev.reward_qty;
      if (diffQty !== 0) {
        return { 
          ...current, diffQty, actionType: diffQty > 0 ? 'issue' : 'deduct', absoluteValue: Math.abs(diffQty) 
        };
      }
      return null;
    }).filter(Boolean);

    if (modified.length === 0) return showToast("ไม่พบการเปลี่ยนแปลง", "warning");
    setModifiedRows(modified);
    setIsConfirmOpen(true);
  };

  const processUpdate = async () => {
    setIsConfirmOpen(false);
    setIsTableLoading(true);
    try {
      for (const row of modifiedRows) {
        const endpoint = row.actionType === 'issue' 
          ? `${API_BASE_URL}/payment/issue/reward` : `${API_BASE_URL}/payment/deduct/reward`;
        const payload = { member: allMemberValue, reward_id: row.reward_id, value: row.absoluteValue };
        const res = await fetch(endpoint, { method: 'POST', headers: getAuthHeaders(), body: JSON.stringify(payload) });
        if (!res.ok) throw new Error(`ล้มเหลวในการบันทึก Reward ID: ${row.reward_id}`);
      }
      showToast("บันทึกการเปลี่ยนแปลงสำเร็จ", "success");
      await fetchRewards(); 
    } catch (error) {
      showToast(error.message, "error");
    } finally {
      setIsTableLoading(false);
    }
  };

  const displayRewards = useMemo(() => {
    if (showAllRewards) return rewards;
    return rewards.filter(row => row.reward_qty !== 0 || row.reward_total_earn !== 0 || row.reward_total_redeem !== 0);
  }, [rewards, showAllRewards]);

  const tableColumns = useMemo(() => [
    { field: "reward_id", header: "ID", sortable: true, style: { width: '15%' }, body: (r) => <span className="font-mono font-bold text-slate-400">{r.reward_id}</span> },
    { field: "reward_name", header: "Reward Name", sortable: true, style: { width: '35%' }, body: (r) => <span className="font-black text-slate-700 dark:text-slate-200">{r.reward_name}</span> },
    { 
      field: "reward_qty", header: "QTY", style: { width: '15%', textAlign: 'right' },
      body: (row) => (
        <div className="flex items-center justify-end gap-2">
          {getTrend(row, 'reward_qty')}
          <input type="number" value={row.reward_qty} onChange={(e) => handleValueChange(row.reward_id, 'reward_qty', e.target.value)} className="w-20 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2 py-1 text-right font-bold text-emerald-600 dark:text-emerald-400 outline-none focus:ring-2 ring-emerald-500/20" />
        </div>
      )
    }
  ], [previousRewards, displayRewards]); 

  return (
    // 📍 ปรับขยายจาก max-w-[1200px] เป็น max-w-[1536px] เพื่อให้พื้นที่กางออกสุดสำหรับตาราง
    <div className="w-full max-w-[1536px] mx-auto p-4 sm:p-6 flex flex-col h-[calc(100vh-2rem)] overflow-hidden animate-in fade-in duration-700">
      
      {toast.show && (
        <div className={`fixed top-6 left-1/2 -translate-x-1/2 z-[500] flex items-center gap-3 px-6 py-3.5 rounded-full shadow-2xl animate-in slide-in-from-top-full duration-300 border backdrop-blur-md ${
          toast.type === 'success' ? 'bg-emerald-500/95 border-emerald-400 text-white' : 
          toast.type === 'warning' ? 'bg-amber-500/95 border-amber-400 text-white' : 'bg-rose-500/95 border-rose-400 text-white'
        }`}>
          {toast.type === 'success' ? <Check size={18} /> : <AlertCircle size={18} />}
          <span className="text-xs font-black uppercase tracking-widest whitespace-nowrap">{toast.msg}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 flex-1 min-h-0">
        
        {/* ========================================================= */}
        {/* 💳 LEFT COLUMN: Control & Barcode Generator */}
        {/* ========================================================= */}
        <div className="lg:col-span-4 flex flex-col gap-6 h-full overflow-y-auto custom-scrollbar pr-2 pb-2">
          <div className="bg-white dark:bg-slate-900 rounded-[2rem] p-6 shadow-sm border border-slate-200 dark:border-slate-800 space-y-6 shrink-0">
            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2 mb-3">
                <UserIcon size={14} className="text-emerald-500" /> Member Information
              </label>
              <div className="flex gap-2 relative">
                <input 
                  type="text"
                  inputMode="numeric"
                  placeholder="Enter ID Card, Phone..."
                  value={allMemberValue}
                  onChange={(e) => setAllMemberValue(e.target.value.replace(/[^0-9]/g, ''))}
                  className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-[1.25rem] py-4 px-5 text-sm font-black outline-none focus:ring-2 ring-emerald-500/20 shadow-inner text-slate-800 dark:text-slate-100 placeholder:text-slate-400"
                />
                <button 
                  onClick={fetchRewards}
                  disabled={isTableLoading || !allMemberValue}
                  className="px-5 bg-emerald-600 text-white rounded-[1.25rem] hover:bg-emerald-700 transition-all active:scale-95 disabled:opacity-50 shrink-0"
                >
                  {isTableLoading ? <Loader2 className="animate-spin" size={20}/> : <Search size={20}/>}
                </button>
              </div>
            </div>

            <div>
              <div className="relative">
                <select 
                  className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-[1.25rem] py-4 px-5 text-sm font-black appearance-none outline-none focus:ring-2 ring-indigo-500/20 transition-all cursor-pointer text-slate-700 dark:text-slate-200 shadow-inner"
                  value={typepayment}
                  onChange={e => setPayment(e.target.value)}
                > <option value="allmember">All Member (7-Eleven)</option>
                  <option value="wallet">TrueMoney Wallet</option>
                  <option value="allwallet">All Wallet (7-Eleven)</option>
                  
                </select>
                <ChevronDown className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={18} />
              </div>
            </div>
          </div>

          <div className={`relative rounded-[2.5rem] p-2 shadow-xl transition-all duration-700 shrink-0 ${typepayment === 'allmember' ? 'bg-gradient-to-br from-emerald-400 to-teal-600' : 'bg-gradient-to-br from-indigo-500 to-blue-700'}`}>
            <div className="bg-white dark:bg-slate-900 rounded-[2.2rem] p-6 sm:p-8 flex flex-col items-center min-h-[400px]">
              <div className="flex p-1.5 bg-slate-50 dark:bg-slate-800 rounded-2xl mb-8 w-full max-w-[280px] border border-slate-100 dark:border-slate-700/50">
                <button onClick={() => setActiveTab('barcode')} className={`flex-1 py-3 rounded-xl text-[10px] font-black flex justify-center gap-2 transition-all ${activeTab === 'barcode' ? 'bg-white dark:bg-slate-700 text-indigo-600 shadow-sm' : 'text-slate-400'}`}><ScanBarcode size={16} /> BARCODE</button>
                <button onClick={() => setActiveTab('qr')} className={`flex-1 py-3 rounded-xl text-[10px] font-black flex justify-center gap-2 transition-all ${activeTab === 'qr' ? 'bg-white dark:bg-slate-700 text-indigo-600 shadow-sm' : 'text-slate-400'}`}><QrCode size={16} /> QR CODE</button>
              </div>

              <div className="flex-1 w-full flex flex-col items-center justify-center relative">
                {isGenerating && (
                  <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-white/80 dark:bg-slate-900/80 backdrop-blur-md rounded-3xl animate-in fade-in">
                    <Loader2 className="animate-spin text-indigo-600" size={40} />
                    <span className="mt-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Processing</span>
                  </div>
                )}
                {!codeValue ? (
                  <div className="flex flex-col items-center text-slate-300 dark:text-slate-700 py-6">
                     <ScanBarcode size={80} className="mb-4 opacity-40" strokeWidth={1} />
                     <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-60">Ready to Generate</p>
                  </div>
                ) : (
                  <div className="animate-in zoom-in-95 duration-500 w-full flex flex-col items-center">
                    <div className="bg-white p-4 sm:p-6 rounded-[2rem] shadow-lg border border-slate-100 w-full max-w-[320px] flex justify-center overflow-hidden">
                      {activeTab === 'barcode' ? (
                        <Barcode value={codeValue} width={1.8} height={80} displayValue={false} background="transparent" />
                      ) : (
                        <QRCodeSVG value={codeValue} size={150} />
                      )}
                    </div>
                    <div className="mt-8 flex items-center gap-3 bg-slate-50 dark:bg-slate-800/50 pl-6 pr-2 py-2 rounded-[1.5rem] border-2 border-dashed border-slate-200 dark:border-slate-700 w-full max-w-[320px]">
                      <span className="font-mono text-lg font-black text-slate-800 dark:text-slate-100 tracking-[0.15em] flex-1 text-center truncate">{codeValue}</span>
                      <button onClick={handleCopy} className="p-3.5 bg-white dark:bg-slate-700 text-slate-400 hover:text-indigo-600 rounded-xl shadow-sm transition-all active:scale-90"><Copy size={18} /></button>
                    </div>
                  </div>
                )}
              </div>

              <div className="w-full mt-8 pt-6 border-t border-slate-100 dark:border-slate-800 flex flex-col gap-5">
                 <button 
                    onClick={handleGenerate}
                    disabled={isGenerating}
                    className={`w-full py-4.5 rounded-[1.5rem] font-black text-xs tracking-[0.2em] uppercase flex items-center justify-center gap-3 transition-all active:scale-[0.98] shadow-lg ${typepayment === 'allmember' ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/20' : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-600/20'} disabled:opacity-50`}
                    style={{ minHeight: '56px' }}
                 >
                   {isGenerating ? <Loader2 className="animate-spin" size={20} /> : <><RefreshCw size={18} className={codeValue ? '' : 'animate-pulse'} /> {codeValue ? 'Get New Code' : 'Generate Code'}</>}
                 </button>
              </div>
            </div>
          </div>
        </div>

        {/* ========================================================= */}
        {/* 🏆 RIGHT COLUMN: Reward Management Table */}
        {/* ========================================================= */}
        <div className="lg:col-span-8 flex flex-col h-full min-h-0">
          <div className="h-full flex flex-col relative animate-in fade-in duration-500 min-h-0">
            
            <div className="flex-1 min-h-0 flex flex-col bg-white dark:bg-slate-900 rounded-[2.5rem] p-6 shadow-sm border border-slate-100 dark:border-slate-800">
              <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar pr-2">
                <EnterpriseDataTable 
                  data={displayRewards} 
                  columns={tableColumns} 
                  loading={isTableLoading} 
                  searchPlaceholder="Search reward name..." 
                  dataKey="reward_id"
                  globalFilterFields={['reward_id', 'reward_name']}
                  actionButtons={
                    <div className="flex items-center gap-6">
                      <label className="flex items-center gap-2 cursor-pointer group">
                        <span className={`text-[10px] font-black uppercase tracking-wider transition-colors ${showAllRewards ? 'text-slate-400' : 'text-indigo-600'}`}>Filter Active</span>
                        <div className="relative">
                          <input type="checkbox" className="sr-only" checked={showAllRewards} onChange={() => setShowAllRewards(!showAllRewards)} />
                          <div className={`block w-10 h-6 rounded-full transition-colors duration-300 ${showAllRewards ? 'bg-emerald-500' : 'bg-slate-200 dark:bg-slate-700'}`}></div>
                          <div className={`absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform duration-300 shadow-sm ${showAllRewards ? 'transform translate-x-4' : ''}`}></div>
                        </div>
                        <span className={`text-[10px] font-black uppercase tracking-wider transition-colors ${showAllRewards ? 'text-emerald-600' : 'text-slate-400'}`}>Show All</span>
                      </label>

                      <button 
                        onClick={prepareUpdate}
                        disabled={!rewards.some(r => r.isModified) || isTableLoading}
                        className="px-6 py-3 bg-emerald-600 text-white rounded-xl font-black flex items-center gap-2 hover:bg-emerald-700 disabled:opacity-30 disabled:grayscale transition-all shadow-md shadow-emerald-600/20 active:scale-95 text-xs uppercase"
                      >
                        <Save size={16}/> CONFIRM
                      </button>
                    </div>
                  }
                />
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* MODAL */}
      {isConfirmOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-[2.5rem] shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95">
            <div className="p-8 border-b border-slate-100 dark:border-slate-800 bg-emerald-50 dark:bg-emerald-900/20">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-emerald-500 text-white rounded-2xl"><Info size={24}/></div>
                <div><h4 className="text-xl font-black text-slate-800 dark:text-white">Summary of Changes</h4></div>
              </div>
            </div>
            <div className="p-8 space-y-4 max-h-[40vh] overflow-y-auto custom-scrollbar">
              {modifiedRows.map(row => (
                <div key={row.reward_id} className="flex justify-between items-center p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl">
                  <div><p className="text-[10px] font-black text-slate-400 uppercase">{row.reward_id}</p><p className="font-bold text-slate-700 dark:text-slate-200">{row.reward_name}</p></div>
                  <div className="text-right"><p className="text-xs font-black text-slate-400">Adjustment</p><p className={`text-lg font-black ${row.actionType === 'issue' ? 'text-emerald-500' : 'text-rose-500'}`}>{row.actionType === 'issue' ? '+' : '-'}{row.absoluteValue}</p></div>
                </div>
              ))}
            </div>
            <div className="p-8 flex gap-3 bg-slate-50 dark:bg-slate-800/30 border-t border-slate-100 dark:border-slate-800">
              <button onClick={() => setIsConfirmOpen(false)} className="flex-1 py-4 text-slate-400 font-black text-xs uppercase hover:bg-slate-100 dark:hover:bg-slate-800 rounded-2xl transition-all">Go Back</button>
              <button onClick={processUpdate} className="flex-[2] py-4 bg-emerald-600 text-white rounded-2xl font-black text-xs uppercase shadow-xl shadow-emerald-600/20 active:scale-95 transition-all">Process Transaction</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}