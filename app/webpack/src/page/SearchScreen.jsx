import React, { useState, useMemo } from 'react';
import { 
  Search, Database, AlertTriangle, ChevronDown, ChevronUp, 
  Loader2, AlertCircle, Box, Receipt, FileText, X, Settings2,
  Layers, History, Info, Tag, Calendar, CheckCircle2, Ticket, Barcode as BarcodeIcon,
  MousePointerClick, User, Monitor, Percent, ShieldCheck, Clock
} from 'lucide-react';
import { cn } from '../cn'; 
import apiService from '../services/apiServices';

// --- 📍 1. Helper Components & Functions ---

const InfoCard = ({ label, value, icon: Icon, colorClass = "text-slate-500" }) => (
  <div className="space-y-1.5 p-1">
    <div className="flex items-center gap-1.5">
      {Icon && <Icon size={12} className={colorClass} />}
      <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider leading-none">{label}</p>
    </div>
    <p className="font-bold text-slate-700 dark:text-slate-200 text-[13px] leading-tight break-words">
      {value !== null && value !== undefined && value !== "" ? value : '-'}
    </p>
  </div>
);

const processMasterInfo = (info) => {
  if (!info) return {};
  const processed = { ...info };
  const dayMap = [
    { key: 'SUN', label: 'อาทิตย์' }, { key: 'MON', label: 'จันทร์' },
    { key: 'TUE', label: 'อังคาร' }, { key: 'WED', label: 'พุธ' },
    { key: 'THU', label: 'พฤหัสบดี' }, { key: 'FRI', label: 'ศุกร์' },
    { key: 'SAT', label: 'เสาร์' },
  ];
  
  if (info.FLAGS) {
    const flags = info.FLAGS;
    const isTrue = (val) => val === true || val === 'True' || val === 1;
    const trueDays = dayMap.filter(d => isTrue(flags[d.key]));
    const falseDays = dayMap.filter(d => flags[d.key] === false || flags[d.key] === 'False' || flags[d.key] === 0 || flags[d.key] === null);

    let dayString = '-';
    if (trueDays.length === 7) dayString = 'ทุกวัน';
    else if (trueDays.length === 0) dayString = 'ไม่ระบุวัน';
    else if (falseDays.length > 0 && falseDays.length < 4) dayString = 'ยกเว้นวัน ' + falseDays.map(d => d.label).join(', ');
    else dayString = 'เฉพาะวัน ' + trueDays.map(d => d.label).join(', ');

    processed['ACTIVE_DAYS_TEXT'] = dayString;
  }
  return processed;
};

// --- 📍 2. Sub-Components ---

const ESlipModal = ({ isOpen, onClose, txn }) => {
  if (!isOpen || !txn) return null;
  const headerInfo = txn.ejs && txn.ejs.length > 0 ? txn.ejs[0] : {};
  const sortedEjs = [...(txn.ejs || [])].sort((a, b) => (a.EJ_LINE_NO || 0) - (b.EJ_LINE_NO || 0));

  return (
    <div className="fixed inset-0 bg-slate-900/90 z-[150] flex items-center justify-center p-4 backdrop-blur-md animate-in fade-in duration-200" onClick={onClose}>
      <div className="bg-slate-200 dark:bg-slate-800 rounded-[2.5rem] w-full max-w-md overflow-hidden shadow-2xl flex flex-col max-h-[85vh] animate-in zoom-in-95" onClick={e => e.stopPropagation()}>
        <div className="bg-slate-800 p-5 text-white flex justify-between items-center shrink-0">
          <div className="flex items-center gap-2">
            <Receipt size={18} className="text-blue-400" />
            <span className="font-black tracking-widest text-xs">ELECTRONIC SLIP VIEWER</span>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors"><X size={20}/></button>
        </div>
        <div className="p-6 overflow-y-auto custom-scrollbar flex-1 bg-slate-200">
          <div className="bg-white p-8 shadow-xl font-mono text-[11px] text-slate-800 relative mx-auto border border-slate-300" style={{ maxWidth: '350px' }}>
            <div className="border-b border-dashed border-slate-400 pb-4 mb-4 space-y-1 text-[10px]">
              <div className="text-center font-black text-sm mb-3">** REPRINT SLIP **</div>
              <p><b>SYSTEM_DATE:</b> {headerInfo.SYSTEM_DATE?.replace('T', ' ')}</p>
              <p><b>BUSINESS_DATE:</b> {headerInfo.BUSINESS_DATE?.replace('T', ' ')}</p>
              <p><b>Store Code:</b> {headerInfo.STORE_ID}</p>
              <p><b>Receipt:</b> {headerInfo.RECEIPT_NO}</p>
              <p><b>Common Trans:</b> {headerInfo.COMMON_TRN_NO}</p>
            </div>
            <div className="space-y-0.5">
              {sortedEjs.map((line, idx) => (
                <div key={idx} className="break-words leading-tight">{line.EJ_LINE}</div>
              ))}
            </div>
            <div className="mt-8 pt-4 border-t border-dashed border-slate-300 text-center text-[9px] text-slate-400 font-bold uppercase">
              *** End of Transaction ***
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const MasterInfoSection = ({ info, products }) => {
  const data = processMasterInfo(info);
  const firstProd = products?.[0] || {};
  if (!data.PRO_CODE) return null;

  return (
    <div className="bg-white dark:bg-slate-950 rounded-[3rem] shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
      {/* Header Gradient */}
      <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-700 px-8 py-8 text-white relative">
        <div className="absolute right-0 top-0 p-8 opacity-10"><Database size={120} /></div>
        <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <div className="p-4 bg-white/10 rounded-3xl backdrop-blur-xl border border-white/20 shadow-inner">
              <Tag size={32} />
            </div>
            <div>
              <h2 className="text-3xl font-black tracking-tight leading-none">{data.PRO_NAME}</h2>
              <p className="text-blue-100/80 font-bold mt-2 flex items-center gap-2">
                <span className="bg-white/20 px-3 py-0.5 rounded-full text-xs">Code: {data.PRO_CODE}</span>
                <span className="text-xs uppercase tracking-widest opacity-70">Group: {data.PRO_GROUP}</span>
              </p>
            </div>
          </div>
          <div className="flex gap-3">
             <div className="bg-white/10 px-4 py-2 rounded-2xl backdrop-blur-md border border-white/10 text-center min-w-[100px]">
                <p className="text-[10px] font-black uppercase opacity-60">Status</p>
                <p className="text-sm font-black">{data.PRO_STATUS}</p>
             </div>
             <div className="bg-white/10 px-4 py-2 rounded-2xl backdrop-blur-md border border-white/10 text-center min-w-[100px]">
                <p className="text-[10px] font-black uppercase opacity-60">Level</p>
                <p className="text-sm font-black">{data.PRO_LEVEL}</p>
             </div>
          </div>
        </div>
      </div>

      <div className="p-8 lg:p-10 space-y-10">
        {/* Row 1: General Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <div className="space-y-5">
            <h4 className="text-xs font-black text-blue-600 uppercase tracking-[0.2em] mb-4 border-l-4 border-blue-600 pl-3">Basic Information</h4>
            <InfoCard label="Promotion Code" value={data.PRO_CODE} icon={BarcodeIcon} />
            <InfoCard label="Promotion Name" value={data.PRO_NAME} icon={Tag} />
            <InfoCard label="Promotion Group" value={data.PRO_GROUP} icon={Layers} />
          </div>
          <div className="space-y-5">
            <h4 className="text-xs font-black text-indigo-600 uppercase tracking-[0.2em] mb-4 border-l-4 border-indigo-600 pl-3">System & Staff</h4>
            <InfoCard label="Promotion Show On Receipt" value={data.PRO_RECEIPT_NAME} icon={FileText} />
            <InfoCard label="ผู้รับผิดชอบ" value={firstProd.USER_MK} icon={User} />
            <InfoCard label="ระบบทดสอบ" value={firstProd.SYSTEM} icon={Monitor} />
          </div>
          <div className="space-y-5">
            <h4 className="text-xs font-black text-violet-600 uppercase tracking-[0.2em] mb-4 border-l-4 border-violet-600 pl-3">Type & Status</h4>
            <InfoCard label="Promotion Types" value={data.PRO_TYPE} icon={Settings2} />
            <InfoCard label="Promotion Status" value={data.PRO_STATUS} icon={ShieldCheck} />
            <InfoCard label="Promotion Level" value={data.PRO_LEVEL} icon={Layers} />
          </div>
        </div>

        <hr className="border-slate-100 dark:border-slate-800" />

        {/* Notes Section */}
        <div className="bg-slate-50 dark:bg-slate-900/50 p-6 rounded-[2rem] border border-slate-100 dark:border-slate-800 flex gap-4 items-start">
           <Info className="text-slate-400 shrink-0 mt-1" size={20} />
           <InfoCard label="Notes" value={data.NOTES} className="flex-1 italic text-slate-600 dark:text-slate-400" />
        </div>

        {/* Reward & Duration */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-emerald-50/50 dark:bg-emerald-900/10 p-8 rounded-[2.5rem] border border-emerald-100 dark:border-emerald-900/30">
            <h4 className="text-xs font-black text-emerald-600 uppercase tracking-[0.2em] mb-6 flex items-center gap-2"><Percent size={16}/> Reward Setup</h4>
            <div className="grid grid-cols-2 gap-x-6 gap-y-6">
              <InfoCard label="Reward Type" value={data.REWARD_TYPE} colorClass="text-emerald-500" />
              <InfoCard label="Reward Value" value={data.REWARD_VALUE} colorClass="text-emerald-500" />
              <InfoCard label="Reward MA ID" value={data.REWARD_MA} colorClass="text-emerald-500" />
              <InfoCard label="Reward MA Name" value={data.REWARD_NAME} colorClass="text-emerald-500" />
            </div>
          </div>
          <div className="bg-amber-50/50 dark:bg-amber-900/10 p-8 rounded-[2.5rem] border border-amber-100 dark:border-amber-900/30">
            <h4 className="text-xs font-black text-amber-600 uppercase tracking-[0.2em] mb-6 flex items-center gap-2"><Clock size={16}/> Validity Period</h4>
            <div className="grid grid-cols-2 gap-x-6 gap-y-6">
              <InfoCard label="Active From" value={data.START_DATE} icon={Calendar} colorClass="text-amber-500" />
              <InfoCard label="Active To" value={data.END_DATE} icon={Calendar} colorClass="text-amber-500" />
              <div className="col-span-2">
                <InfoCard label="วัน" value={data.ACTIVE_DAYS_TEXT} icon={CheckCircle2} colorClass="text-amber-500" />
              </div>
            </div>
          </div>
        </div>

        {/* Limits & Members */}
        <div className="space-y-6">
          <h4 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] px-1">Limits & Member Requirements</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-y-8 gap-x-4 bg-slate-50 dark:bg-slate-900/30 p-8 rounded-[2.5rem]">
            <InfoCard label="Redemption Limit Per Transaction" value={data.LIMIT_TRAN} />
            <InfoCard label="Redemption Limit Per Day" value={data.LIMIT_DAY} />
            <InfoCard label="Limit Number of Items to" value={data.LIMIT_ITEM} />
            <InfoCard label="Maximum Redemption Limit" value={data.LIMIT_REDEMP} />
            <InfoCard label="Member Segments / Tiers" value={data.MEMBER_TIER} />
            <div className="md:col-span-2"><InfoCard label="Member Segmentation" value={data.MEMBER_SEGM} /></div>
            <InfoCard label="All Members (card required)" value={data.MEMBER_REQU} />
          </div>
        </div>
      </div>
    </div>
  );
};

const ProductsSection = ({ products }) => {
  if (!products || products.length === 0) return null;

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between px-4">
        <h3 className="text-2xl font-black text-slate-800 dark:text-white flex items-center gap-3">
          <div className="p-2 bg-blue-100 dark:bg-blue-900/30 text-blue-600 rounded-xl"><Box size={24}/></div>
          Products & Conditions Setup
        </h3>
      </div>
      
      {products.map((prod, pIdx) => (
        <div key={pIdx} className="bg-white dark:bg-slate-950 rounded-[2.5rem] shadow-xl border border-slate-200 dark:border-slate-800 overflow-hidden animate-in slide-in-from-bottom-4 duration-500">
          <div className="bg-slate-50 dark:bg-slate-900 px-8 py-5 border-b border-slate-100 dark:border-slate-800 flex flex-wrap justify-between items-center gap-4">
            <div className="flex items-center gap-3">
              <FileText className="text-slate-400" size={20} />
              <span className="font-black text-slate-800 dark:text-white uppercase tracking-wider">{prod.sheet}</span>
            </div>
            <div className="flex gap-4 text-[10px] font-black text-slate-400 uppercase">
               <span>System: <b className="text-slate-600 dark:text-slate-200">{prod.SYSTEM}</b></span>
               <span>Version: <b className="text-slate-600 dark:text-slate-200">{prod.VERSION_NAME}</b></span>
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[1000px]">
              <thead>
                <tr className="bg-slate-50/50 dark:bg-slate-900/50 text-[10px] font-black uppercase text-slate-400 tracking-widest border-b border-slate-100 dark:border-slate-800">
                  <th className="p-5">BucketID</th>
                  <th className="p-5">Entity Type</th>
                  <th className="p-5">Entity Code</th>
                  <th className="p-5">Entity Name</th>
                  <th className="p-5">AttachmentMode</th>
                  <th className="p-5">Trigger Value</th>
                  <th className="p-5">Condition Details</th>
                  <th className="p-5 text-right">Price</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
                {prod.PRODUCTS_DETAIL?.map(detail => 
                  detail.ENTITY?.map((ent, eIdx) => (
                    <tr key={eIdx} className="hover:bg-blue-50/40 dark:hover:bg-blue-900/10 transition-colors group">
                      <td className="p-5 font-bold text-slate-400">{ent.BUCKET}</td>
                      <td className="p-5"><span className="text-[10px] font-black bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-md text-slate-500 uppercase">{ent.ENTITY_TYPE}</span></td>
                      <td className="p-5 font-mono font-bold text-blue-600">{ent.ENTITY_CODE}</td>
                      <td className="p-5 text-sm font-bold text-slate-700 dark:text-slate-300">{ent.ENTITY_NAME || '-'}</td>
                      <td className="p-5">
                        <span className={cn(
                          "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter", 
                          ent.MODE === 'Include' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
                        )}>
                          {ent.MODE}
                        </span>
                      </td>
                      <td className="p-5">
                         <p className="font-black text-slate-700 dark:text-slate-200">{ent.TRIGGER_VALUE}</p>
                         <p className="text-[10px] font-bold text-slate-400 uppercase leading-none">{ent.TRIGGER_TYPE}</p>
                      </td>
                      <td className="p-5 max-w-[200px]">
                         <p className="text-xs font-bold text-slate-700 dark:text-slate-300 truncate" title={ent.CONDITION_NAME}>{ent.CONDITION_NAME}</p>
                         <div className="flex gap-2 mt-1">
                            <span className="text-[9px] font-bold text-slate-400 uppercase">MA Name: {ent.CONDITION || '-'}</span>
                            <span className="text-[9px] font-bold text-slate-400 uppercase">ID: {ent.CONDITION_ID || '-'}</span>
                         </div>
                      </td>
                      <td className="p-5 text-right font-mono font-black text-indigo-600 text-base">{ent.PRICE}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      ))}
    </div>
  );
};

const LogSection = ({ transactions, defects }) => {
  const [eSlip, setESlip] = useState({ isOpen: false, data: null });

  return (
    <>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Transactions */}
        <div className="bg-white dark:bg-slate-950 rounded-[2.5rem] shadow-xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col">
          <div className="px-8 py-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-900">
            <div className="flex items-center gap-3">
              <Receipt className="text-blue-500" size={24}/>
              <h2 className="text-xl font-black text-slate-800 dark:text-white">Transactions</h2>
            </div>
            <span className="text-xs font-black text-blue-600 bg-blue-50 dark:bg-blue-900/30 px-3 py-1 rounded-full uppercase">{transactions?.length || 0} Records</span>
          </div>
          <div className="p-6 overflow-y-auto max-h-[600px] custom-scrollbar space-y-4 bg-slate-50/30 dark:bg-slate-950/30">
            {transactions?.map((txn, idx) => (
              <div key={idx} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-3xl p-5 shadow-sm group hover:border-blue-400 transition-all">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h4 className="font-black text-slate-800 dark:text-white group-hover:text-blue-600 transition-colors">Title: {txn.title}</h4>
                    <p className="text-[10px] font-bold text-slate-400 uppercase mt-1">Common Trans: <span className="text-slate-600 dark:text-slate-300">{txn.common_tran}</span></p>
                  </div>
                  <button 
                    onClick={() => setESlip({ isOpen: true, data: txn })}
                    className="p-2.5 bg-blue-50 text-blue-600 rounded-2xl hover:bg-blue-600 hover:text-white transition-all shadow-sm active:scale-95"
                  >
                    <Receipt size={18} />
                  </button>
                </div>
                <div className="grid grid-cols-3 gap-3 bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-100 dark:border-slate-700">
                  <InfoCard label="Store Code" value={txn.store_code} />
                  <InfoCard label="Pos No." value={txn.pos_no} />
                  <InfoCard label="Receipt" value={txn.receipt_no} />
                  <InfoCard label="Shift" value={txn.shift_no} />
                  <div className="col-span-2"><InfoCard label="Update By" value={txn.user_update} /></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Defects */}
        <div className="bg-white dark:bg-slate-950 rounded-[2.5rem] shadow-xl border border-rose-100 dark:border-rose-900/20 overflow-hidden flex flex-col">
          <div className="px-8 py-6 border-b border-slate-100 dark:border-slate-800 flex items-center gap-3 bg-rose-50 dark:bg-rose-900/10">
            <AlertTriangle className="text-rose-500" size={24}/>
            <h2 className="text-xl font-black text-rose-700 dark:text-rose-400">Defects Log</h2>
          </div>
          <div className="p-6 overflow-y-auto max-h-[600px] custom-scrollbar space-y-4">
            {defects?.map((def, idx) => (
              <div key={idx} className="bg-white dark:bg-slate-900 border border-rose-50 dark:border-rose-900/30 rounded-3xl p-6 shadow-sm relative overflow-hidden group">
                <div className="absolute top-0 left-0 w-1.5 h-full bg-rose-500"></div>
                <div className="flex justify-between items-center mb-3">
                  <span className="text-[10px] font-black text-rose-500 uppercase tracking-widest">No. {def.id}</span>
                  <span className={cn("text-[10px] font-black px-3 py-1 rounded-full uppercase", def.status === 1 ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700')}>
                    Status: {def.status}
                  </span>
                </div>
                <h4 className="font-black text-slate-800 dark:text-white mb-2 underline decoration-rose-200 decoration-4 underline-offset-4">Title: {def.title}</h4>
                <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed mb-4">Description: {def.description}</p>
                {def.remark && <p className="text-xs bg-slate-50 dark:bg-slate-800 p-3 rounded-xl text-slate-500 mb-4 border-l-2 border-slate-300 italic">Remark: {def.remark}</p>}
                <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase">
                  <Clock size={12}/> Last Update: {new Date(def.date_update).toLocaleString()}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      <ESlipModal isOpen={eSlip.isOpen} onClose={() => setESlip({ isOpen: false, data: null })} txn={eSlip.data} />
    </>
  );
};

// --- 📍 3. Main Screen ---

export default function SearchScreen({ actions }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [allResults, setAllResults] = useState([]); 
  const [selectedIndex, setSelectedIndex] = useState(0); 
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const activeData = useMemo(() => allResults[selectedIndex] || null, [allResults, selectedIndex]);

  const triggerSearch = async (val) => {
    if (!val) return;
    setLoading(true);
    setHasSearched(true);
    try {
      const responseData = await apiService.promotion.inquiry(val);
      const data = responseData?.data || responseData;
      let normalizedData = Array.isArray(data) ? data : [data];
      // Filter เฉพาะที่มีข้อมูลจริง
      normalizedData = normalizedData.filter(item => item?.master_info);
      setAllResults(normalizedData);
      setSelectedIndex(0);
      if (normalizedData.length > 0) actions?.showSuccess("พบข้อมูล", `ดึงข้อมูลสำเร็จ ${normalizedData.length} รายการ`);
      else actions?.showWarning("ไม่พบข้อมูล", "ลองใช้เงื่อนไขอื่นในการค้นหา");
    } catch (err) {
      actions?.showError("Error", "ไม่สามารถดึงข้อมูลได้");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 p-4 md:p-8 custom-scrollbar overflow-y-auto">
      <div className="max-w-[1400px] mx-auto space-y-10 pb-20">
        
        {/* Search Engine UI */}
        <div className="max-w-3xl mx-auto pt-10">
          <div className="bg-white dark:bg-slate-900 p-3 rounded-[2.5rem] shadow-2xl shadow-blue-500/10 border border-slate-200 dark:border-slate-800 flex items-center">
            <div className="flex-1 flex items-center px-6">
              <Search className="text-blue-500 shrink-0" size={24} />
              <input 
                type="text"
                placeholder="Search Promotion Code, Name..."
                className="w-full bg-transparent border-none outline-none px-4 py-4 text-xl font-bold placeholder:text-slate-300"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && triggerSearch(searchQuery)}
              />
            </div>
            <button 
              onClick={() => triggerSearch(searchQuery)}
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-[2rem] font-black tracking-widest shadow-lg shadow-blue-600/20 transition-all active:scale-95 disabled:opacity-50"
            >
              {loading ? <Loader2 className="animate-spin" size={20}/> : "SEARCH"}
            </button>
          </div>
        </div>

        {/* Multi-Result Tabs */}
        {!loading && allResults.length > 1 && (
          <div className="flex gap-3 overflow-x-auto py-4 px-2 no-scrollbar justify-center">
            {allResults.map((res, idx) => (
              <button 
                key={idx}
                onClick={() => setSelectedIndex(idx)}
                className={cn(
                  "px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest transition-all whitespace-nowrap border shadow-sm",
                  selectedIndex === idx ? "bg-blue-600 text-white border-blue-600 scale-105" : "bg-white dark:bg-slate-900 text-slate-400 border-slate-200 dark:border-slate-800 hover:bg-blue-50"
                )}
              >
                #{res.master_info.PRO_CODE} - {res.master_info.PRO_NAME?.substring(0, 15)}
              </button>
            ))}
          </div>
        )}

        {/* Dynamic Content */}
        {!loading && activeData && (
          <div className="space-y-12 animate-in fade-in slide-in-from-bottom-10 duration-700">
            <MasterInfoSection info={activeData.master_info} products={activeData.products} />
            <ProductsSection products={activeData.products} />
            <LogSection transactions={activeData.transactions} defects={activeData.defects} />
          </div>
        )}

        {/* Empty State */}
        {!loading && hasSearched && allResults.length === 0 && (
          <div className="flex flex-col items-center justify-center py-40 text-slate-300">
            <div className="p-8 bg-slate-100 dark:bg-slate-900 rounded-full mb-6">
              <AlertCircle size={80} />
            </div>
            <p className="text-2xl font-black uppercase tracking-widest">No matching results</p>
          </div>
        )}
      </div>
    </div>
  );
}