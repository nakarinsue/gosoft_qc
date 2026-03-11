import React, { useState, useMemo, useEffect } from 'react';
import { 
  Search, Database, AlertTriangle, ChevronDown, ChevronUp, 
  Loader2, AlertCircle, Box, Receipt, FileText, X,  Settings2,
  Save, Edit2, RotateCcw, List, FileSpreadsheet, Barcode, Laptop,
  Monitor, Calendar, Hash, Layers, Tag,  History, Info, ShoppingCart,
  Filter, CheckCircle2, Clock, GitMerge, ArrowRightCircle
} from 'lucide-react';
import { cn } from '../cn'; 
import { API_BASE_URL } from '../config'; 

// --- Helper Functions ---

// 1. จัดการแสดงผลวัน (Day Flags)
const processMasterInfo = (info) => {
    if (!info) return {};
    const processed = { ...info };
    const dayMap = [
        { key: 'SUN_FG', label: 'อาทิตย์' }, { key: 'MON_FG', label: 'จันทร์' },
        { key: 'TUE_FG', label: 'อังคาร' }, { key: 'WED_FG', label: 'พุธ' },
        { key: 'THU_FG', label: 'พฤหัสบดี' }, { key: 'FRI_FG', label: 'ศุกร์' },
        { key: 'SAT_FG', label: 'เสาร์' },
    ];
    const isTrue = (val) => val === true || val === 'True' || val === 1;
    const trueDays = dayMap.filter(d => isTrue(info[d.key]));
    const falseDays = dayMap.filter(d => !isTrue(info[d.key]));

    let dayString = '-';
    if (trueDays.length === 7) dayString = 'ทุกวัน';
    else if (trueDays.length === 0) dayString = 'ไม่ระบุวัน';
    else if (falseDays.length < trueDays.length) dayString = 'ยกเว้นวัน ' + falseDays.map(d => d.label).join(', ');
    else dayString = 'เฉพาะวัน ' + trueDays.map(d => d.label).join(', ');

    dayMap.forEach(d => delete processed[d.key]);
    processed['ACTIVE_DAYS'] = dayString;
    return processed;
};

// 2. ตรวจสอบว่าข้อมูลว่างเปล่าหรือไม่ (สำหรับเคส master_info: null และ array ว่างหมด)
const isValidResult = (item) => {
    if (!item) return false;
    // ถือว่า "มีข้อมูล" ถ้าอย่างน้อยหนึ่งเงื่อนไขเป็นจริง
    const hasMaster = !!item.master_info;
    const hasSubPro = item['Sub-Pro'] && item['Sub-Pro'].length > 0;
    const hasProducts = item.products && item.products.length > 0;
    const hasHistory = item.import_history && item.import_history.length > 0;
    const hasDefects = item.defects && item.defects.length > 0;
    const hasPayments = item.payments && item.payments.summary && item.payments.summary.length > 0;

    return hasMaster || hasSubPro || hasProducts || hasHistory || hasDefects || hasPayments;
};

// --- Components (คงเดิม) ---

const ProductDetailModal = ({ item, onClose }) => {
  const [isSmartMode, setIsSmartMode] = useState(true);
  if (!item) return null;

  const getProcessedBarcode = () => {
    if (!isSmartMode) return item.BARCODE && item.BARCODE !== "null" ? item.BARCODE : "";
    const type = item.TRIGGER_TYPE || '';
    const val = parseFloat(item.TRIGGER_VALUE) || 0;
    const price = parseFloat(item.PRICE) || 1;
    const baseBarcode = item.BARCODE && item.BARCODE !== "null" ? item.BARCODE :"";
    if (type.includes('Quantity')) return `${val}*${baseBarcode}`;
    else if (type.includes('Ticket')) {
      const qty = price > 0 ? Math.floor(val / price) : 1;
      return `${qty}*${baseBarcode}`;
    }
    return baseBarcode;
  };
  const processedBC = getProcessedBarcode();

  return (
    <div className="fixed inset-0 bg-slate-900/80 z-[80] flex items-center justify-center p-4 backdrop-blur-md animate-in fade-in" onClick={onClose}>
      <div className="bg-white dark:bg-slate-900 rounded-[3rem] w-full max-w-xl overflow-hidden shadow-2xl border border-slate-200 dark:border-slate-800 animate-in zoom-in-95" onClick={e => e.stopPropagation()}>
        <div className="bg-gradient-to-br from-slate-800 to-slate-950 p-8 text-white relative">
          <button onClick={onClose} className="absolute top-6 right-6 p-2 bg-white/10 hover:bg-white/20 rounded-full transition"><X size={20}/></button>
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-white/10 rounded-2xl backdrop-blur-sm"><Box size={32}/></div>
            <div>
              <h3 className="text-2xl font-black tracking-tight">{item.ENTITY_NAME}</h3>
              <p className="text-slate-400 font-mono text-sm">{item.ENTITY_CODE}</p>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3">
             <div className="bg-white/5 p-3 rounded-2xl border border-white/10">
                <p className="text-[10px] font-black text-slate-500 uppercase">Mode</p>
                <p className="font-bold text-sm">{item.MODE}</p>
             </div>
             <div className="bg-white/5 p-3 rounded-2xl border border-white/10">
                <p className="text-[10px] font-black text-slate-500 uppercase">Bucket</p>
                <p className="font-bold text-sm">{item.BUCKET}</p>
             </div>
             <div className="bg-white/5 p-3 rounded-2xl border border-white/10">
                <p className="text-[10px] font-black text-slate-500 uppercase">Trigger</p>
                <p className="font-bold text-sm">{item.TRIGGER_VALUE} ({item.TRIGGER_TYPE})</p>
             </div>
          </div>
        </div>
        <div className="p-8 space-y-8">
           <div className="flex items-center justify-between bg-slate-50 dark:bg-slate-950 p-4 rounded-3xl border border-slate-100 dark:border-slate-800">
             <div className="flex items-center gap-3">
                <div className={cn("p-2 rounded-xl", isSmartMode ? "bg-blue-600 text-white" : "bg-slate-200 text-slate-500")}>
                   <Settings2 size={18}/>
                </div>
                <div>
                   <p className="text-sm font-black dark:text-white">Smart Integration Mode</p>
                   <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{isSmartMode ? "Logic Pattern On" : "Direct Barcode Off"}</p>
                </div>
             </div>
             <button onClick={() => setIsSmartMode(!isSmartMode)} className={cn("w-14 h-8 rounded-full relative transition-all duration-300 shadow-inner", isSmartMode ? "bg-blue-600" : "bg-slate-300")}>
                <div className={cn("absolute top-1 w-6 h-6 bg-white rounded-full shadow-md transition-all duration-300", isSmartMode ? "left-7" : "left-1")}></div>
             </button>
          </div>
          <div className="space-y-6">
             <div className="text-center p-6 bg-white dark:bg-slate-800 rounded-[2rem] border-2 border-dashed border-slate-200 dark:border-slate-700 hover:border-blue-400 transition-colors">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Product Barcode Output</p>
                <div className="flex flex-col items-center">
                   {processedBC ? (
                     <>
                        <img src={`https://bwipjs-api.metafloor.com/?bcid=code128&text=${processedBC}&scale=2&height=12&incltext=y&textxalign=center`} alt="Product Barcode" className="max-w-full h-auto mix-blend-multiply dark:mix-blend-normal mb-2" />
                        <p className="text-xs font-mono font-bold text-blue-600 dark:text-blue-400">{processedBC}</p>
                     </>
                   ) : <p className="text-slate-300 text-xs italic py-4">No Barcode Data</p>}
                </div>
             </div>
             {item.COUPON && item.COUPON !== "null" && (
               <div className="text-center p-6 bg-amber-50/50 dark:bg-amber-900/10 rounded-[2rem] border border-amber-100 dark:border-amber-900/30">
                  <p className="text-[10px] font-black text-amber-600 uppercase tracking-[0.2em] mb-4">Coupon Barcode</p>
                  <div className="flex flex-col items-center">
                    <img src={`https://bwipjs-api.metafloor.com/?bcid=code128&text=${item.COUPON}&scale=2&height=10&incltext=y&textxalign=center`} alt="Coupon Barcode" className="max-w-full h-auto mix-blend-multiply dark:mix-blend-normal mb-2" />
                    <p className="text-xs font-mono font-bold text-amber-700">{item.COUPON}</p>
                  </div>
               </div>
             )}
          </div>
        </div>
      </div>
    </div>
  );
};

const GenericListSection = ({ title, icon, dataList, isOpenDefault = true }) => {
  const [isOpen, setIsOpen] = useState(isOpenDefault);
  if (!dataList || dataList.length === 0) return null;

  return (
    <div className="bg-white dark:bg-slate-950 rounded-[2.5rem] shadow-xl border border-slate-200 dark:border-slate-800 overflow-hidden mb-6">
      <button onClick={() => setIsOpen(!isOpen)} className="w-full px-8 py-6 flex justify-between items-center hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-blue-50 dark:bg-blue-900/30 rounded-2xl text-blue-600 dark:text-blue-400">{icon}</div>
          <span className="font-bold text-lg text-slate-800 dark:text-white">
            {title} <span className="text-xs text-slate-400 ml-2 font-normal">({dataList.length} items)</span>
          </span>
        </div>
        {isOpen ? <ChevronUp className="text-slate-400"/> : <ChevronDown className="text-slate-400"/>}
      </button>
      {isOpen && (
        <div className="px-8 pb-8 pt-2 space-y-6 animate-in slide-in-from-top-2">
          {dataList.map((item, index) => {
            const { NOTES, ...otherData } = item;
            const validData = Object.fromEntries(
                Object.entries(otherData).filter(([_, v]) => v !== null && v !== undefined && v !== '' && v !== 'null')
            );
            return (
                <div key={index} className="p-6 rounded-3xl bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800 transition-all shadow-sm">
                    <div className="flex items-center gap-2 mb-4">
                        <span className="bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 text-[10px] font-black px-2 py-0.5 rounded-full">#{index + 1}</span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-4">
                        {Object.entries(validData).map(([key, value]) => (
                            <div key={key} className="overflow-hidden">
                                <span className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-0.5">{key.replace(/_/g, ' ')}</span>
                                <span className={cn("block text-sm font-bold break-words leading-snug", 
                                    (value === true || value === 'true' || value === 'True') ? 'text-emerald-600' : 
                                    (value === false || value === 'false' || value === 'False') ? 'text-rose-500' : 
                                    (key === 'ACTIVE_DAYS') ? 'text-blue-600 dark:text-blue-400 font-black' : 
                                    'text-slate-700 dark:text-slate-300'
                                )}>
                                    {typeof value === 'boolean' ? (value ? 'TRUE' : 'FALSE') : String(value)}
                                </span>
                            </div>
                        ))}
                    </div>
                    {NOTES && NOTES !== 'null' && (
                        <div className="mt-6 pt-4 border-t border-dashed border-slate-200 dark:border-slate-700">
                             <div className="flex items-start gap-3">
                                 <div className="mt-0.5"><FileText size={16} className="text-slate-400"/></div>
                                 <div className="flex-1">
                                    <span className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">NOTES</span>
                                    <p className="text-sm text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-800 p-3 rounded-xl border border-slate-100 dark:border-slate-700 leading-relaxed whitespace-pre-wrap">{NOTES}</p>
                                 </div>
                             </div>
                        </div>
                    )}
                </div>
            )
          })}
        </div>
      )}
    </div>
  );
};

const SubPromotionSection = ({ subList, onTriggerSearch }) => {
    const [isOpen, setIsOpen] = useState(true);
    if (!subList || subList.length === 0) return null;

    return (
        <div className="bg-gradient-to-r from-violet-50 to-indigo-50 dark:from-slate-900 dark:to-slate-950 rounded-[2.5rem] shadow-xl border border-indigo-100 dark:border-slate-800 overflow-hidden mb-6">
            <button onClick={() => setIsOpen(!isOpen)} className="w-full px-8 py-6 flex justify-between items-center hover:bg-white/50 transition-colors">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-violet-100 dark:bg-violet-900/30 rounded-2xl text-violet-600 dark:text-violet-400"><GitMerge size={24}/></div>
                    <span className="font-bold text-lg text-slate-800 dark:text-white">
                        Sub-Promotions (Linked) <span className="text-xs text-violet-500 ml-2 font-normal">({subList.length} items)</span>
                    </span>
                </div>
                {isOpen ? <ChevronUp className="text-slate-400"/> : <ChevronDown className="text-slate-400"/>}
            </button>
            {isOpen && (
                <div className="px-8 pb-8 pt-2 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 animate-in slide-in-from-top-2">
                    {subList.map((sub, idx) => (
                        <div key={idx} onClick={() => onTriggerSearch(sub.PROMOTION_CODE)} className="group relative bg-white dark:bg-slate-900 p-5 rounded-3xl border border-indigo-100 dark:border-slate-700 hover:border-violet-500 dark:hover:border-violet-500 hover:shadow-lg hover:shadow-violet-500/10 transition-all cursor-pointer overflow-hidden">
                            <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity transform translate-x-2 group-hover:translate-x-0">
                                <ArrowRightCircle className="text-violet-500" size={20}/>
                            </div>
                            <div className="mb-3">
                                <span className="inline-block px-2 py-1 rounded-lg bg-violet-50 dark:bg-violet-900/20 text-violet-600 dark:text-violet-300 text-[10px] font-black uppercase tracking-wider mb-1">{sub.TYPE}</span>
                                <h4 className="font-bold text-slate-800 dark:text-white leading-tight line-clamp-2 pr-4">{sub.NAME}</h4>
                            </div>
                            <div className="flex justify-between items-end border-t border-slate-50 dark:border-slate-800 pt-3">
                                <div>
                                    <p className="text-[9px] text-slate-400 uppercase font-bold">Code</p>
                                    <p className="font-mono text-sm font-bold text-slate-600 dark:text-slate-300">{sub.CODE}</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-[9px] text-slate-400 uppercase font-bold">Price</p>
                                    <p className="font-mono text-sm font-bold text-emerald-600">{sub.PRICE} ฿</p>
                                </div>
                            </div>
                            <div className="absolute inset-0 bg-violet-500/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"/>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

const ProductSection = ({ rawProducts }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedItem, setSelectedItem] = useState(null);
  const [showHistory, setShowHistory] = useState(false); 
  const [activeTab, setActiveTab] = useState('ALL'); 

  const maxID = useMemo(() => {
    if (!rawProducts || rawProducts.length === 0) return 0;
    return Math.max(...rawProducts.map(p => p.ID || 0));
  }, [rawProducts]);

  const { latestProducts, allProducts } = useMemo(() => {
    if (!rawProducts) return { latestProducts: [], allProducts: [] };
    const flatten = (versions) => versions.flatMap(version => 
      (version.PRODUCTS || []).flatMap(group => 
         (group.ENTITY || []).map(entity => ({
            ...entity, COUPON: version.COUPON, VERSION_NO: version.VERSION_NO,
            ID: version.ID, BUCKET: group.BUCKET, ENTITY_TYPE: group.ENTITY_TYPE || 'Unknown' 
         }))
      )
    );
    const all = flatten(rawProducts);
    const latest = all.filter(p => p.ID === maxID);
    return { latestProducts: latest, allProducts: all };
  }, [rawProducts, maxID]);

  const activeDataSource = showHistory ? allProducts : latestProducts;
  const filteredProducts = useMemo(() => activeDataSource.filter(p => 
      p.ENTITY_NAME?.toLowerCase().includes(searchTerm.toLowerCase()) || 
      p.ENTITY_CODE?.toLowerCase().includes(searchTerm.toLowerCase())
  ), [activeDataSource, searchTerm]);

  const groupedData = useMemo(() => {
    const groups = { 'ALL': filteredProducts };
    filteredProducts.forEach(item => {
        const key = `Bucket ${item.BUCKET} (${item.ENTITY_TYPE})`;
        if (!groups[key]) groups[key] = [];
        groups[key].push(item);
    });
    return groups;
  }, [filteredProducts]);
  const availableTabs = Object.keys(groupedData).sort();
  useEffect(() => { if (!groupedData[activeTab]) setActiveTab('ALL'); }, [groupedData, activeTab]);

  return (
    <div className="bg-white dark:bg-slate-950 rounded-[2.5rem] shadow-xl border border-slate-200 dark:border-slate-800 overflow-hidden mb-6">
      <div className="px-8 py-6 border-b dark:border-slate-800 flex flex-col md:flex-row justify-between items-center gap-4 bg-slate-50/50 dark:bg-slate-950/50">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-brand-primary/10 rounded-2xl text-brand-primary"><ShoppingCart size={24}/></div>
          <div>
             <h3 className="font-bold text-lg dark:text-white flex items-center gap-2">
                 Product Condition List
                 {!showHistory && <span className="text-[10px] bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full border border-emerald-200">Latest Ver. (ID: {maxID})</span>}
                 {showHistory && <span className="text-[10px] bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full border border-amber-200">All History ({rawProducts.length} Versions)</span>}
             </h3>
             <p className="text-xs text-slate-400 font-medium">{showHistory ? "Viewing all versions data" : "Viewing only the latest version data"}</p>
          </div>
        </div>
        <div className="flex items-center gap-3 w-full md:w-auto">
            <button onClick={() => setShowHistory(!showHistory)} className={cn("flex items-center gap-2 px-4 py-3 rounded-2xl text-xs font-black transition-all border", showHistory ? "bg-slate-800 text-white border-slate-800 hover:bg-slate-700" : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50")}>
                {showHistory ? <CheckCircle2 size={14}/> : <Clock size={14}/>}
                {showHistory ? "Hide History" : "Show History (Other)"}
            </button>
            <div className="relative flex-1 md:w-64 group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-brand-primary" size={16}/>
                <input type="text" placeholder="Filter products..." className="w-full pl-10 pr-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl text-sm font-bold outline-none focus:ring-4 ring-brand-primary/5" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
            </div>
        </div>
      </div>
      {availableTabs.length > 1 && (
        <div className="px-8 pt-4 pb-0 overflow-x-auto custom-scrollbar flex gap-2">
            {availableTabs.map(tabKey => (
                <button key={tabKey} onClick={() => setActiveTab(tabKey)} className={cn("px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all border", activeTab === tabKey ? "bg-brand-primary text-white border-brand-primary shadow-md shadow-brand-primary/20" : "bg-white dark:bg-slate-900 text-slate-500 border-slate-200 dark:border-slate-700 hover:bg-slate-50")}>
                    {tabKey === 'ALL' ? 'View All' : tabKey} <span className="ml-1 opacity-70">({groupedData[tabKey]?.length})</span>
                </button>
            ))}
        </div>
      )}
      <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-4 animate-in fade-in slide-in-from-bottom-2">
        {(groupedData[activeTab] || []).length === 0 ? (
            <div className="col-span-full text-center py-12 text-slate-400 italic bg-slate-50 dark:bg-slate-900/50 rounded-3xl border border-dashed border-slate-200">No products found in this category</div>
        ) : (
            (groupedData[activeTab] || []).map((item, idx) => (
            <div key={`${item.ID}-${idx}`} onClick={() => setSelectedItem(item)} className="flex items-center gap-6 p-6 bg-slate-50/50 dark:bg-slate-900/50 rounded-[2rem] border border-slate-100 dark:border-slate-800 hover:border-brand-primary hover:bg-white dark:hover:bg-slate-800 transition-all cursor-pointer relative group">
                {(item.STATUS === true || item.STATUS === 'True' || item.STATUS === 1) && (
                   <div className="absolute top-4 right-4 bg-rose-500 text-white size-6 rounded-full flex items-center justify-center font-black text-[10px] shadow-lg shadow-rose-500/20">!</div>
                )}
                {showHistory && (
                    <div className="absolute top-4 left-4 bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 text-[9px] font-black px-2 py-0.5 rounded-full">ID: {item.ID}</div>
                )}
                <div className="size-14 bg-white dark:bg-slate-800 rounded-2xl flex items-center justify-center text-slate-400 group-hover:text-brand-primary transition-colors border border-slate-100 dark:border-slate-700"><Barcode size={28}/></div>
                <div className="flex-1 min-w-0">
                   <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5">{item.ENTITY_CODE}</p>
                   <h4 className="font-black text-slate-800 dark:text-white leading-tight line-clamp-2">{item.ENTITY_NAME}</h4>
                   <div className="flex flex-wrap items-center gap-2 mt-2">
                      <span className={cn("text-[9px] font-black px-2 py-0.5 rounded uppercase", item.MODE === 'Exclude' ? 'bg-rose-100 text-rose-600' : 'bg-emerald-100 text-emerald-600')}>{item.MODE}</span>
                      <span className="text-[9px] font-bold text-slate-400 bg-white dark:bg-slate-800 px-2 py-0.5 rounded border border-slate-100 dark:border-slate-700">Bucket: {item.BUCKET}</span>
                      <span className="text-[9px] font-bold text-slate-400 bg-white dark:bg-slate-800 px-2 py-0.5 rounded border border-slate-100 dark:border-slate-700">Type: {item.ENTITY_TYPE}</span>
                   </div>
                </div>
            </div>
            ))
        )}
      </div>
      {selectedItem && <ProductDetailModal item={selectedItem} onClose={() => setSelectedItem(null)} />}
    </div>
  );
};

const EJSection = ({ summary, details }) => {
  const [selected, setSelected] = useState(null);
  const [tab, setTab] = useState('detail');
  if (!summary || summary.length === 0) return null;
  const getFullSlipText = () => {
    if (!details || details.length === 0) return "No E-Journal details found.";
    return details.sort((a, b) => a.EJ_LINE_NO - b.EJ_LINE_NO).map(line => line.EJ_LINE).join('\n');
  };
  return (
    <div className="bg-white dark:bg-slate-950 rounded-[2.5rem] shadow-xl border border-slate-200 dark:border-slate-800 overflow-hidden mb-6">
      <div className="px-8 py-6 border-b dark:border-slate-800 flex items-center gap-4">
        <div className="p-3 bg-teal-50 dark:bg-teal-900/30 rounded-2xl text-teal-600 dark:text-teal-400"><FileSpreadsheet size={24}/></div>
        <h3 className="font-bold text-lg dark:text-white">EJ Summary Transactions</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-slate-50 dark:bg-slate-900 text-[10px] font-black text-slate-500 uppercase tracking-wider">
            <tr>
              <th className="px-8 py-4">Store/POS</th><th className="px-6 py-4">Date/Time</th><th className="px-6 py-4">Receipt</th><th className="px-6 py-4">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {summary.map((row, i) => (
              <tr key={i} className="hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                <td className="px-8 py-4 font-bold dark:text-white">{row.STORE_CODE} - {row.POS_NO} <span className="text-[10px] text-slate-400 ml-2">Shift: {row.SHIFT_NO}</span></td>
                <td className="px-6 py-4 text-xs font-medium text-slate-600 dark:text-slate-400">{row.CREATE_DATE}</td>
                <td className="px-6 py-4 font-mono text-teal-600 font-bold">{row.RECEIPT_NO}</td>
                <td className="px-6 py-4"><button onClick={() => setSelected(row)} className="px-4 py-2 bg-slate-100 dark:bg-slate-800 rounded-xl text-xs font-black hover:bg-teal-500 hover:text-white transition-all">VIEW</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {selected && (
        <div className="fixed inset-0 bg-slate-900/80 z-[70] flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] w-full max-w-2xl h-[75vh] flex flex-col shadow-2xl overflow-hidden animate-in zoom-in-95">
            <div className="px-8 py-6 border-b dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-950/50">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-teal-500 text-white rounded-lg"><Receipt size={20}/></div>
                <h3 className="text-xl font-black dark:text-white">Receipt Info: {selected.RECEIPT_NO}</h3>
              </div>
              <button onClick={() => setSelected(null)} className="p-2 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-full transition"><X/></button>
            </div>
            <div className="flex bg-slate-100 dark:bg-slate-950 p-1.5 m-4 rounded-2xl">
              <button onClick={() => setTab('detail')} className={cn("flex-1 py-2.5 rounded-xl font-bold text-xs transition-all", tab === 'detail' ? 'bg-white dark:bg-slate-800 shadow text-teal-600' : 'text-slate-400')}>TRANSACTION DATA</button>
              <button onClick={() => setTab('slip')} className={cn("flex-1 py-2.5 rounded-xl font-bold text-xs transition-all", tab === 'slip' ? 'bg-white dark:bg-slate-800 shadow text-teal-600' : 'text-slate-400')}>E-JOURNAL SLIP</button>
            </div>
            <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
              {tab === 'detail' ? (
                <div className="grid grid-cols-2 gap-3">
                  {Object.entries(selected).map(([k,v]) => (
                    <div key={k} className="p-4 bg-slate-50 dark:bg-slate-800/50 border dark:border-slate-700 rounded-2xl">
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-tighter">{k.replace(/_/g,' ')}</p>
                      <p className="text-xs font-bold dark:text-white break-words">{String(v || '-')}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-white p-10 shadow-inner max-w-sm mx-auto font-mono text-[11px] leading-tight text-slate-900 border-t-8 border-slate-900">
                  <div className="text-center font-black text-sm mb-4">*** 7-ELEVEN THAILAND ***</div>
                  <div className="space-y-0.5">
                    <p>STORE: {selected.STORE_CODE}  POS: {selected.POS_NO}</p>
                    <p>DATE: {selected.CREATE_DATE}</p>
                    <p className="border-t border-dashed my-2"></p>
                    <div className="whitespace-pre-wrap">{getFullSlipText()}</div>
                    <p className="border-t border-dashed my-2"></p>
                    <p className="text-center italic">--- THANK YOU ---</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// --- [MAIN SCREEN] ---
export default function SearchScreen({ actions }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [allResults, setAllResults] = useState([]); 
  const [selectedIndex, setSelectedIndex] = useState(0); 
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const activeData = useMemo(() => allResults[selectedIndex] || null, [allResults, selectedIndex]);

  // Pre-process Master Info
  const masterInfoWithDays = useMemo(() => processMasterInfo(activeData?.master_info), [activeData]);

  // --- Core Search Function (Reusable) ---
  const triggerSearch = async (code) => {
    if (!code) {
      actions?.showWarning("Warning", "กรุณาระบุ Promotion Code");
      return;
    }
    setSearchQuery(code);
    setLoading(true);
    setHasSearched(true);
    setAllResults([]);

    try {
      const response = await fetch(`V2/transactions/promotion-detail/${code}`, {
        method: 'GET',
        headers: { 'Accept'         : 'application/json'}
        });
      
      if (!response.ok) {
         if (response.status === 404) throw new Error("ไม่พบข้อมูลรหัสโปรโมชั่นนี้");
         throw new Error(`Server Error: ${response.status}`);
      }

      const data = await response.json();
      let normalizedData = Array.isArray(data) ? data : [data];
      
      // --- แก้ไข: Filter out empty results ---
      normalizedData = normalizedData.filter(item => isValidResult(item));

      setAllResults(normalizedData);
      setSelectedIndex(0);
      
      if (normalizedData.length > 0) {
         actions?.showSuccess("Success", `พบข้อมูล ${normalizedData.length} รายการ`);
      } else {
         actions?.showWarning("Not Found", "ไม่พบข้อมูลรายการ");
      }

    } catch (err) {
      actions?.showError("Search Failed", err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleFormSubmit = (e) => {
    if (e) e.preventDefault();
    triggerSearch(searchQuery.trim());
  };

  return (
    <div className="max-w-[1600px] overflow-x-auto mx-auto space-y-8 animate-in fade-in duration-500 pb-24 p-6">

      <div className="bg-white dark:bg-slate-950 p-8 rounded-[2.5rem] shadow-xl border border-slate-200 dark:border-slate-800 max-w-4xl mx-auto">
        <form onSubmit={handleFormSubmit} className="flex gap-4 items-center">
          <div className="relative flex-1 group">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 h-6 w-6 text-slate-400 group-focus-within:text-brand-primary transition-colors" />
            <input 
              type="text" 
              placeholder="ระบุ PRO_CODE (เช่น 301165)..." 
              className="w-full pl-14 pr-4 py-5 text-xl font-bold bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl outline-none focus:ring-4 ring-brand-primary/10 dark:text-white"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              autoFocus
            />
          </div>
          <button type="submit" disabled={loading} className="bg-brand-primary text-white px-10 py-5 rounded-2xl font-black text-lg shadow-lg shadow-brand-primary/30 hover:brightness-110 active:scale-95 transition-all">
            {loading ? <Loader2 className="animate-spin w-6 h-6" /> : "SEARCH"}
          </button>
        </form>
      </div>

      {allResults.length > 1 && (
        <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-[2rem] border border-blue-100 dark:border-blue-800 flex items-center gap-6 animate-in slide-in-from-top-4 overflow-hidden">
          <div className="flex items-center gap-2 text-blue-600 font-black text-xs ml-4 whitespace-nowrap"><Layers size={18}/> RECORDS:</div>
          <div className="flex gap-2 overflow-x-auto pb-1 custom-scrollbar">
            {allResults.map((item, idx) => (
              <button key={idx} onClick={() => setSelectedIndex(idx)} className={cn("px-4 py-2 rounded-xl text-[10px] font-black transition-all whitespace-nowrap border", selectedIndex === idx ? "bg-brand-primary text-white border-brand-primary shadow-md" : "bg-white dark:bg-slate-800 text-slate-500 border-slate-200 dark:border-slate-700")}>
                {item.master_info?.PRO_CODE} - {item.master_info?.PRO_NAME}
              </button>
            ))}
          </div>
        </div>
      )}

      {!loading && activeData && (
        <div className="space-y-8 animate-in slide-in-from-bottom-8 duration-700">
          <GenericListSection title="Promotion Master Info" icon={<Database size={24}/>} dataList={[masterInfoWithDays]} />
          <SubPromotionSection subList={activeData['Sub-Pro']} onTriggerSearch={triggerSearch} />
          <ProductSection rawProducts={activeData.products} />
          <GenericListSection title="Defect Log Summary" icon={<AlertTriangle size={24}/>} dataList={activeData.defects} />
          <GenericListSection title="Import History" icon={<History size={24}/>} dataList={activeData.import_history} />
          <GenericListSection title="Payment Items" icon={<Tag size={24}/>} dataList={activeData.payments?.items} />
          <EJSection summary={activeData.payments?.summary || []} details={activeData.payments?.details || []} />
        </div>
      )}

      {!loading && !activeData && hasSearched && (
        <div className="flex flex-col items-center justify-center py-32 opacity-20"><AlertCircle size={80} /><p className="text-xl font-black mt-4 uppercase tracking-widest">No matching results</p></div>
      )}
    </div>
  );
}