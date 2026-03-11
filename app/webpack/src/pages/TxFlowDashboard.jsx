import React, { useState } from 'react';

// ==========================================
// 1. Widgets & Components (ใช้ชุดเดิม)
// ==========================================

const InputWidget = ({ label, name, value, onChange, placeholder }) => (
  <div className="mb-3">
    <label className="block text-xs font-semibold mb-1 opacity-80 uppercase tracking-wider">{label}</label>
    <input
      type="text"
      name={name}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className="w-full p-2 text-sm border rounded-md bg-transparent focus:ring-2 focus:ring-blue-500 outline-none transition-all dark:border-gray-600 dark:focus:ring-blue-400"
    />
  </div>
);

const ButtonWidget = ({ label, onClick, variant = "primary" }) => {
  const baseStyle = "w-full py-2 px-4 rounded-md text-sm font-semibold transition-all duration-200 active:scale-95 flex justify-center items-center gap-2";
  const variants = {
    primary: "bg-blue-600 text-white hover:bg-blue-700",
    secondary: "bg-gray-600 text-white hover:bg-gray-700",
    success: "bg-green-600 text-white hover:bg-green-700",
    warning: "bg-amber-500 text-white hover:bg-amber-600",
    outline: "border-2 border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800"
  };
  return (
    <button onClick={onClick} className={`${baseStyle} ${variants[variant]}`}>
      {label}
    </button>
  );
};

const JsonViewer = ({ title, data }) => (
  <div className="flex-1 flex flex-col h-full bg-gray-50 dark:bg-gray-900 rounded-lg border dark:border-gray-700 overflow-hidden shadow-inner">
    <div className="p-3 bg-gray-200 dark:bg-gray-800 font-semibold border-b dark:border-gray-700 text-sm flex justify-between items-center">
      <span>{title}</span>
    </div>
    <div className="flex-1 p-4 overflow-y-auto font-mono text-xs whitespace-pre-wrap text-gray-800 dark:text-green-400">
      {data ? JSON.stringify(data, null, 2) : <span className="opacity-50">รอการประมวลผล...</span>}
    </div>
  </div>
);

const DataTableWidget = ({ data }) => {
  if (!data || data.length === 0) return null;
  const headers = Object.keys(data[0]);

  return (
    <div className="flex-1 flex flex-col min-h-0 border dark:border-gray-700 rounded-lg overflow-hidden mt-4">
      <div className="overflow-x-auto overflow-y-auto flex-1">
        <table className="min-w-full text-left text-sm whitespace-nowrap">
          <thead className="sticky top-0 bg-gray-200 dark:bg-gray-800 shadow-sm z-10">
            <tr>
              {headers.map((head) => (
                <th key={head} className="px-4 py-3 font-semibold">{head}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y dark:divide-gray-700 bg-white dark:bg-gray-900">
            {data.map((row, idx) => (
              <tr key={idx} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                {headers.map((head) => (
                  <td key={head} className="px-4 py-3">{row[head] !== null ? String(row[head]) : '-'}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// ==========================================
// 2. Main Layout (OmniTx Gateway)
// ==========================================

export default function OmniTxGateway() {
  const [theme, setTheme] = useState('dark');
  const [isLoading, setIsLoading] = useState(false);
  
  // URL ของ FastAPI Backend ของเรา
  const API_BASE_URL = "http://localhost:8000/api";

  const [inputs, setInputs] = useState({
    vendor_id: "0994000164904",
    service_id: "00",
    store_id: "09884",
    item_name: "พิมพ์ใบอนุญาตกรมเจ้าท่า",
    bill_amt: "80",
    amt_min: "1",
    amt_max: "90000",
    data_1: "10180003788",
    data_3: "10",
    tx_id: "" 
  });

  const [requestData, setRequestData] = useState(null);
  const [responseData, setResponseData] = useState(null);
  const [viewMode, setViewMode] = useState('json');

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setInputs(prev => ({ ...prev, [name]: value }));
  };

  // ฟังก์ชันยิง API ของจริง
  const handleAction = async (actionPath) => {
    setIsLoading(true);
    setResponseData(null);
    setViewMode('json');

    // จัดเตรียม Payload ให้ตรงกับเส้น API ที่เรียก
    let payload = {};
    if (actionPath === 'db/transaction') {
      payload = { tx_id: inputs.tx_id }; // ใช้ TxIdRequest Model
    } else if (actionPath === 'db/show') {
      payload = { vendor_id: inputs.vendor_id, service_id: inputs.service_id }; // ใช้ ConfigRequest Model
    } else {
      // ใช้ ActionRequest Model สำหรับยิง SOAP / Workflow
      payload = { url: "V1/Test/WSCDSService", ...inputs };
    }

    setRequestData({ endpoint: `${API_BASE_URL}/${actionPath}`, payload });

    try {
      // เรียกใช้งาน API จริงผ่าน fetch
      const response = await fetch(`${API_BASE_URL}/${actionPath}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || `HTTP Error ${response.status}`);
      }

      // แสดงผลตามประเภทของ Data
      if (actionPath === 'db/transaction' && data.data) {
        setResponseData(data.data); // แปลงเป็น Table สำหรับโชว์ Database
        setViewMode('table');
      } else {
        setResponseData(data); // โชว์ JSON ปกติสำหรับ API Response และ Show Config
      }

    } catch (error) {
      setResponseData({ 
        status: "error", 
        message: "การเชื่อมต่อ API ล้มเหลว", 
        detail: error.message 
      });
    } finally {
      setIsLoading(false);
    }
  };

  const toggleTheme = () => setTheme(theme === 'dark' ? 'light' : 'dark');

  return (
    <div className={`h-screen w-full flex p-3 gap-3 transition-colors duration-300 ${theme === 'dark' ? 'bg-gray-950 text-gray-100' : 'bg-gray-100 text-gray-800'} overflow-hidden`}>
      
      {/* พาเนลซ้าย: Control Panel */}
      <div className="w-1/4 min-w-[350px] flex flex-col gap-3 h-full overflow-y-auto pr-1">
        
        <div className="flex justify-between items-center px-2">
          <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-teal-400">
            OmniTx Gateway
          </h1>
          <button onClick={toggleTheme} className="text-xs p-1.5 rounded-md border dark:border-gray-700 hover:bg-gray-200 dark:hover:bg-gray-800">
            {theme === 'dark' ? '☀️ Light' : '🌙 Dark'}
          </button>
        </div>

        {/* Input Parameters */}
        <div className="p-4 rounded-xl bg-white dark:bg-gray-900 border dark:border-gray-800 shadow-sm flex flex-col gap-2">
          <div className="grid grid-cols-2 gap-2">
            <InputWidget label="Vendor ID" name="vendor_id" value={inputs.vendor_id} onChange={handleInputChange} />
            <InputWidget label="Service ID" name="service_id" value={inputs.service_id} onChange={handleInputChange} />
          </div>
          <InputWidget label="Item Name" name="item_name" value={inputs.item_name} onChange={handleInputChange} />
          <div className="grid grid-cols-3 gap-2 border-t dark:border-gray-800 pt-2 mt-1">
            <InputWidget label="Min Amt" name="amt_min" value={inputs.amt_min} onChange={handleInputChange} />
            <InputWidget label="Max Amt" name="amt_max" value={inputs.amt_max} onChange={handleInputChange} />
            <InputWidget label="Bill Amt" name="bill_amt" value={inputs.bill_amt} onChange={handleInputChange} />
          </div>
          <div className="grid grid-cols-2 gap-2 border-t dark:border-gray-800 pt-2 mt-1">
            <InputWidget label="Data 1" name="data_1" value={inputs.data_1} onChange={handleInputChange} />
            <InputWidget label="Data 3" name="data_3" value={inputs.data_3} onChange={handleInputChange} />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="p-4 rounded-xl bg-white dark:bg-gray-900 border dark:border-gray-800 shadow-sm space-y-3">
          <h2 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Manual Actions</h2>
          <ButtonWidget label="Data Exchange" onClick={() => handleAction('action/data_exchange')} variant="primary" />
          <div className="grid grid-cols-2 gap-2">
            <ButtonWidget label="Cancel" onClick={() => handleAction('action/cancel')} variant="secondary" />
            <ButtonWidget label="Confirm" onClick={() => handleAction('action/exchange_confirm')} variant="secondary" />
          </div>

          <h2 className="text-xs font-bold text-gray-400 uppercase tracking-wider mt-4 mb-2">Auto Workflows ⚡</h2>
          <ButtonWidget label="Exchange ➡️ Cancel" onClick={() => handleAction('workflow/exchange_to_cancel')} variant="warning" />
          <ButtonWidget label="Exchange ➡️ Confirm" onClick={() => handleAction('workflow/exchange_to_confirm')} variant="success" />
        </div>

        {/* Database Section */}
        <div className="p-4 rounded-xl bg-white dark:bg-gray-900 border dark:border-gray-800 shadow-sm flex flex-col gap-2 mb-4">
           <h2 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Database Operations</h2>
           <InputWidget label="Search TX_ID" name="tx_id" value={inputs.tx_id} onChange={handleInputChange} placeholder="Ex: 14500001" />
           <div className="grid grid-cols-2 gap-2 mt-1">
             <ButtonWidget label="Check Config" onClick={() => handleAction('db/show')} variant="outline" />
             <ButtonWidget label="Search DB" onClick={() => handleAction('db/transaction')} variant="primary" />
           </div>
        </div>

      </div>

      {/* พาเนลขวา: Visualization */}
      <div className="flex-1 flex flex-col gap-3 h-full">
        <div className="h-2/5 min-h-[250px]">
          <JsonViewer title="📤 Request Payload (ส่งไปที่ FastAPI)" data={requestData} />
        </div>

        <div className="flex-1 flex flex-col bg-white dark:bg-gray-900 rounded-xl border dark:border-gray-800 shadow-sm p-4 relative overflow-hidden">
          {isLoading && (
            <div className="absolute inset-0 bg-white/60 dark:bg-gray-900/60 backdrop-blur-sm flex items-center justify-center z-20">
              <span className="font-bold text-lg animate-pulse">Processing...</span>
            </div>
          )}
          <h2 className="text-sm font-bold border-b dark:border-gray-700 pb-2 mb-2 flex justify-between">
            <span>📥 Result Output</span>
            <span className="text-xs font-normal text-gray-500">{viewMode.toUpperCase()}</span>
          </h2>
          {viewMode === 'json' ? (
             <div className="flex-1 overflow-auto bg-gray-50 dark:bg-gray-950 p-3 rounded-md border dark:border-gray-800">
               <pre className="font-mono text-sm whitespace-pre-wrap text-blue-600 dark:text-blue-400">
                 {responseData ? JSON.stringify(responseData, null, 2) : <span className="opacity-50 text-gray-500">No output</span>}
               </pre>
             </div>
          ) : (
             <DataTableWidget data={responseData} />
          )}
        </div>
      </div>
    </div>
  );
}