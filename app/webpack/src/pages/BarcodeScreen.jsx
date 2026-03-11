
import React, { useState, useEffect } from 'react';
import { 
  ScanBarcode, QrCode, RefreshCw, Copy, Wifi, Loader2, 
  Wallet, AlertCircle, Smartphone, CreditCard, User, Hash, Check
} from 'lucide-react';

// กำหนด URL API โดยตรง หรือแก้ไขให้ตรงกับ Server ของคุณ
import { API_BASE_URL } from '../config';

export default function BarcodeScreen({ user }) {
  const [activeTab, setActiveTab] = useState('barcode');
  const [timeLeft, setTimeLeft] = useState(300); 
  const [codeValue, setCodeValue] = useState('102938475610'); 
  const [typepayment, setPayment] = useState('truewallet');
  
  // --- State สำหรับ All Member ---
  const [allMemberType, setAllMemberType] = useState('3'); 
  const [allMemberValue, setAllMemberValue] = useState('');
  // -----------------------------

  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [isCopied, setIsCopied] = useState(false);

  // Timer Countdown
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Reset ค่าเมื่อเปลี่ยนช่องทางชำระเงิน
  useEffect(() => {
    setErrorMsg('');
    setAllMemberValue('');
    if (typepayment === 'allmember') {
        setCodeValue('กรุณากรอกข้อมูลและกด Generate'); 
        setTimeLeft(0);
    }
  }, [typepayment]);

  // ฟังก์ชันตรวจสอบความถูกต้องข้อมูล All Member
  const validateAllMember = () => {
    if (typepayment !== 'allmember') return true;

    if (!allMemberValue) {
        setErrorMsg('กรุณากรอกข้อมูลให้ครบถ้วน');
        return false;
    }

    if (allMemberType === '3' && allMemberValue.length !== 10) {
        setErrorMsg('เบอร์โทรศัพท์ต้องมี 10 หลัก');
        return false;
    }
    if (allMemberType === '4' && allMemberValue.length !== 13) {
        setErrorMsg('เลขบัตรประชาชนต้องมี 13 หลัก');
        return false;
    }
    if (allMemberType === '0' && allMemberValue.length < 4) {
        setErrorMsg('กรุณาระบุ ALL ID ให้ถูกต้อง');
        return false;
    }
    
    return true;
  };

  const handleRefresh = async () => {
    if (isLoading) return;
    setErrorMsg('');

    if (typepayment === 'allmember' && !validateAllMember()) {
        return; 
    }

    setIsLoading(true);

    try {
        let endpoint = '';
        let payload = {};

        // แยก Logic ตาม Type Payment
        if (typepayment === 'allmember') {
            // API: /PAYMENT/AMB
            endpoint = `${API_BASE_URL}/PAYMENT/AMB`;
            payload = {
                identifyId: allMemberType,   // ส่ง string เช่น "3"
                identifyValue: allMemberValue // ส่ง string เช่น "081xxxxxxx"
            };
        } else {
            // API: /PAYMENT/TMN
            endpoint = `${API_BASE_URL}/PAYMENT/TMN`;
            payload = { 
                type: typepayment, // "truewallet" หรือ "allwallet"
                user: user?.id || 0 
            };
        }

        const response = await fetch(endpoint, { 
            method: 'POST', 
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (!response.ok) { 
            throw new Error(`API Error: ${response.status}`); 
        }

        const data = await response.json();
        
        if (typepayment === 'allmember') {
            // Response: { returnCode: "00000", barcodeId: "...", ... }
            if (data.returnCode === '00000') {
                setCodeValue(data.barcodeId);
                setTimeLeft((data.expiredMinute || 15) * 60); 
            } else {
                throw new Error(data.returnDescTH || data.returnDesc || 'เกิดข้อผิดพลาดจากระบบ All Member');
            }
        } else {
            // Response: { paycode: "...", pay_id: ... }
            if (data.paycode) { 
                setCodeValue(data.paycode); 
                setTimeLeft(300); // Reset timer 5 นาที
            } else { 
                throw new Error(data.message || 'ไม่พบข้อมูล Code'); 
            }
        }

    } catch (error) { 
        console.error("Refresh Error:", error);
        setErrorMsg(error.message); 
    } finally {
        setIsLoading(false);
    }
  };

  const handleCopy = () => {
    if (!codeValue || codeValue.includes('กรุณา')) return;
    navigator.clipboard.writeText(codeValue)
      .then(() => {
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000);
      })
      .catch(() => {
         setIsCopied(true);
         setTimeout(() => setIsCopied(false), 2000);
      });
  };

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const handleInputChange = (e) => {
      const val = e.target.value.replace(/[^0-9]/g, ''); 
      // ปรับ Max Length ตาม Type
      let maxLength = 20; // Default (ALL ID)
      if (allMemberType === '3') maxLength = 10;
      if (allMemberType === '4') maxLength = 13;

      if (val.length <= maxLength) {
          setAllMemberValue(val);
      }
  };

  // Helper สำหรับเลือก Placeholder และ Icon
  const getInputConfig = () => {
      switch(allMemberType) {
          case '3': return { placeholder: '08xxxxxxxx (10 หลัก)', icon: <Smartphone className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />, label: 'เบอร์โทรศัพท์' };
          case '4': return { placeholder: 'เลขบัตรประชาชน (13 หลัก)', icon: <CreditCard className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />, label: 'เลขบัตร ปชช.' };
          case '0': return { placeholder: 'ระบุเลขสมาชิก ALL ID', icon: <Hash className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />, label: 'ALL ID' };
          default: return { placeholder: '', icon: null, label: '' };
      }
  };

  const config = getInputConfig();

  return (
    <div className="max-w-md mx-auto animate-fadeIn mt-4 space-y-4 pb-10">

      {/* Payment Selector */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
        <div className="flex flex-col gap-4">
            
            {/* เลือกประเภท Wallet */}
            <div>
                <label className="text-xs font-bold text-gray-500 block mb-1">ช่องทางการชำระเงิน</label>
                <div className="relative">
                    <Wallet className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                    <select 
                        className="w-full border pl-9 pr-3 py-2 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50 hover:bg-white transition" 
                        value={typepayment} 
                        onChange={e => setPayment(e.target.value)}
                    >
                      <option value="truewallet">TrueMoney Wallet</option>
                        <option value="allwallet">All Wallet (7-Eleven)</option>
                        <option value="allmember">All Member (7-Eleven)</option>
                    </select>
                </div>
            </div>

            {/* ส่วนเสริมสำหรับ All Member */}
            {typepayment === 'allmember' && (
                <div className="bg-blue-50/50 p-3 rounded-lg border border-blue-100 space-y-3 animate-fadeIn">
                    <div className="flex gap-2">
                        {/* Dropdown ประเภทข้อมูล */}
                        <div className="w-1/3">
                            <label className="text-[10px] font-bold text-gray-500 block mb-1">ประเภท</label>
                            <div className="relative">
                                <User className="absolute left-2 top-2.5 w-3 h-3 text-gray-400" />
                                <select 
                                    className="w-full pl-6 pr-1 py-2 border rounded-lg text-xs outline-none focus:border-blue-500"
                                    value={allMemberType}
                                    onChange={(e) => {
                                        setAllMemberType(e.target.value);
                                        setAllMemberValue(''); // เคลียร์ค่าเมื่อเปลี่ยนประเภท
                                    }}
                                >
                                    <option value="3">เบอร์โทร</option>
                                    <option value="4">บัตร ปชช.</option>
                                    <option value="0">ALL ID</option>
                                </select>
                            </div>
                        </div>

                        {/* Input กรอกข้อมูล (Dynamic) */}
                        <div className="flex-1">
                            <label className="text-[10px] font-bold text-gray-500 block mb-1">{config.label}</label>
                            <div className="relative">
                                {config.icon}
                                <input 
                                    type="text" 
                                    className="w-full pl-9 pr-3 py-2 border rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder={config.placeholder}
                                    value={allMemberValue}
                                    onChange={handleInputChange}
                                    inputMode="numeric"
                                />
                                <div className="absolute right-2 top-2.5 text-[10px] text-gray-400">
                                    {allMemberValue.length}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
      </div>

      {/* Card Container */}
      <div className={`rounded-2xl p-1 shadow-2xl relative transition-colors duration-500 ${typepayment === 'allmember' ? 'bg-gradient-to-br from-green-600 to-teal-800' : 'bg-gradient-to-br from-blue-600 to-indigo-800'}`}>
        <div className="bg-white rounded-xl p-6 relative overflow-hidden min-h-[450px] flex flex-col">
          
          {/* User Info */}
          <div className="flex justify-between items-start mb-6 border-b border-gray-100 pb-4">
            <div>
              <p className="text-xs text-gray-400 uppercase font-bold tracking-wider">Member Name</p>
              <h3 className="text-lg font-bold text-gray-800 truncate max-w-[150px]">{user?.name || 'Guest User'}</h3>
              <div className="flex items-center gap-2 mt-1">
                 <span className={`text-xs font-medium px-2 py-0.5 rounded flex items-center gap-1 ${typepayment === 'allmember' ? 'text-green-600 bg-green-50' : 'text-orange-600 bg-orange-50'}`}>
                    <Wallet className="w-3 h-3" /> {typepayment === 'allmember' ? 'All Member' : (typepayment === 'truewallet' ? 'True Wallet' : 'All Wallet')}
                 </span>
              </div>
            </div>
            <div className="text-right">
               <div className="flex items-center gap-1 text-green-500 text-xs font-bold mb-1 justify-end"><Wifi className="w-3 h-3" /> Online</div>
               <p className="text-xs text-gray-400">ID: {user?.id || '---'}</p>
            </div>
          </div>

          {errorMsg && <div className="mb-4 bg-red-50 text-red-600 px-3 py-2 rounded-lg text-sm flex items-center gap-2 animate-pulse"><AlertCircle className="w-4 h-4" /> {errorMsg}</div>}

          {/* Toggle Tabs */}
          <div className="flex bg-gray-100 p-1 rounded-lg mb-6">
            <button onClick={() => setActiveTab('barcode')} className={`flex-1 flex items-center justify-center gap-2 py-2 text-sm font-medium rounded-md transition ${activeTab === 'barcode' ? 'bg-white shadow-sm text-blue-700' : 'text-gray-500 hover:text-gray-700'}`}>
              <ScanBarcode className="w-4 h-4" /> Barcode
            </button>
            <button onClick={() => setActiveTab('qr')} className={`flex-1 flex items-center justify-center gap-2 py-2 text-sm font-medium rounded-md transition ${activeTab === 'qr' ? 'bg-white shadow-sm text-blue-700' : 'text-gray-500 hover:text-gray-700'}`}>
              <QrCode className="w-4 h-4" /> QR Code
            </button>
          </div>

          {/* Display Area */}
          <div className="flex flex-col items-center justify-center py-4 flex-grow relative">
            
            {isLoading && (
               <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/90 z-10 backdrop-blur-[1px]">
                  <Loader2 className="w-10 h-10 text-blue-600 animate-spin mb-2" />
                  <span className="text-sm text-gray-500 font-medium">กำลังทำรายการ...</span>
               </div>
            )}

            <div className="animate-fadeIn w-full text-center">
              <div className="relative min-h-[140px] flex items-center justify-center">
                
                {typepayment === 'allmember' && !codeValue.match(/^[0-9]+$/) ? (
                    <div className="text-gray-400 text-sm flex flex-col items-center">
                        <ScanBarcode className="w-16 h-16 opacity-20 mb-2" />
                        <p>กรอกข้อมูลด้านบนแล้วกดปุ่ม Generate</p>
                    </div>
                ) : (
                    <>
                        {activeTab === 'barcode' ? (
                        // ใช้ API สร้างภาพ Barcode แทนไลบรารี
                        <img 
                            src={`https://bwipjs-api.metafloor.com/?bcid=code128&text=${codeValue}&scale=3&height=10&incltext=false`} 
                            alt="Barcode" 
                            className="h-24 max-w-full object-contain mx-auto mix-blend-multiply"
                        />
                        ) : (
                        // ใช้ API สร้างภาพ QR Code แทนไลบรารี
                        <img 
                            src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${codeValue}`} 
                            alt="QR Code" 
                            className="h-28 max-w-full object-contain mx-auto mix-blend-multiply"
                        />
                        )}
                    </>
                )}
              </div>
              
              {codeValue.match(/^[0-9]+$/) && (
                <div className="mt-6 flex items-center justify-center gap-3 bg-gray-50 px-4 py-3 rounded border border-dashed border-gray-300 mx-auto max-w-[95%]">
                    <span className="font-mono text-xl sm:text-2xl font-bold text-gray-700 tracking-widest break-all">
                        {codeValue}
                    </span>
                    <button onClick={handleCopy} className="text-gray-400 hover:text-blue-600 transition p-1 hover:bg-blue-50 rounded" title="Copy">
                    {isCopied ? <Check className="w-5 h-5 text-green-500" /> : <Copy className="w-5 h-5" />}
                    </button>
                </div>
              )}
            </div>
          </div>

          {/* Timer & Button */}
          <div className="mt-auto flex justify-between items-center text-xs text-gray-400 border-t border-gray-100 pt-4">
             <span className="flex items-center gap-1">
               Expires in: <span className={`font-mono font-bold ${timeLeft < 60 ? 'text-red-500 animate-pulse' : 'text-blue-600'}`}>{formatTime(timeLeft)}</span>
             </span>
             <button 
               onClick={handleRefresh} 
               disabled={isLoading} 
               className={`flex items-center gap-1 transition disabled:opacity-50 disabled:cursor-not-allowed font-medium px-4 py-2 rounded shadow-sm text-white ${typepayment === 'allmember' ? 'bg-green-600 hover:bg-green-700' : 'bg-blue-600 hover:bg-blue-700'}`}
             >
               <RefreshCw className={`w-3 h-3 ${isLoading ? 'animate-spin' : ''}`} /> 
               {isLoading ? 'Processing...' : (typepayment === 'allmember' ? 'Generate Barcode' : 'Refresh Code')}
             </button>
          </div>

        </div>
      </div>
      
      {/* <p className="text-center text-xs text-gray-300 mt-4">Powered by Promotion System &copy; 2025</p> */}
    </div>
  );
}