import React, { useState, useEffect } from 'react';
import { X, CloudUpload, Trash2, FileSpreadsheet, PlayCircle, Loader2, CheckCircle2 } from 'lucide-react';
import { workspaceApi } from '../../services/api/workspace.api';

const ImportFileModal = ({ isOpen, onClose, onSuccess, currentUserId = 1 }) => {
  const [versions, setVersions] = useState([]);
  const [selectedVersions, setSelectedVersion] = useState('');
  const [selectedSystem, setSelectedSystem] = useState('1'); 
  const [filesData, setFilesData] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progressMsg, setProgressMsg] = useState('');

  useEffect(() => {
    if (isOpen) {
      workspaceApi.getVersions().then(data => {
        setVersions(data || []);
        if (data && data.length > 0) {
          const savedVer = localStorage.getItem('selectedVersion');
          setSelectedVersion(savedVer || String(data[0].id));
        }
      });
      setFilesData([]);
      setSelectedSystem('1');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files);
    const mappedFiles = selectedFiles.map(file => {
      const isExcel = file.name.match(/\.(xls|xlsx)$/i);
      return { rawFile: file, name: file.name, status: isExcel ? 'Wait' : 'Skip' };
    });
    setFilesData(prev => [...prev, ...mappedFiles]);
    e.target.value = ''; 
  };

const handleSubmit = async () => {
    const filesToUpload = filesData.filter(f => f.status === 'Wait');
    if (filesToUpload.length === 0 || !selectedVersions) return alert('กรุณาเตรียมไฟล์และเลือก Version');
    setIsProcessing(true);
    try {
      setProgressMsg('Initializing Batch...');
      const systemText = selectedSystem === '1' ? 'POS' : (selectedSystem === '2' ? 'DELIVERY' : selectedSystem);
      const insertRes = await workspaceApi.insertImportInfo({
        v_id: Number(selectedVersions), 
        status: 1, 
        description: systemText, 
        user_create: currentUserId
      });
      const importId = insertRes.id;
      for (let i = 0; i < filesData.length; i++) {
        if (filesData[i].status === 'Wait') {
          setProgressMsg(`Uploading: ${i + 1} / ${filesToUpload.length}`);
          const formData = new FormData();
          formData.append('version', importId); 
          formData.append('system', systemText); // เปลี่ยนจากส่ง '1' เป็น 'POS'
          formData.append('user_id', currentUserId);
          formData.append('file', filesData[i].rawFile);
          formData.append('remark', ''); // เพิ่มพารามิเตอร์ remark (ส่งค่าว่างตาม cURL)
          await workspaceApi.uploadAndImport(formData);
          setFilesData(prev => {
            const newData = [...prev]; 
            newData[i].status = 'Success'; 
            return newData;
          });
        }
      }
      setProgressMsg('Finishing...');
      await workspaceApi.updateImportStatus({ id: importId, status: 3 });
      setTimeout(() => { onSuccess(); onClose(); }, 500);
    } catch (error) { 
      alert(`เกิดข้อผิดพลาดในการนำเข้า: ${error.message || ''}`); 
    } finally { 
      setIsProcessing(false); 
      setProgressMsg(''); 
    }
  };
  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-in fade-in">
      <div className="bg-white dark:bg-slate-900 w-full max-w-4xl max-h-[90vh] rounded-[2.5rem] shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95">
        <div className="p-8 border-b dark:border-slate-800 flex justify-between items-center">
          <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter">New Import</h2>
          <button onClick={!isProcessing ? onClose : undefined} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-all"><X size={24} /></button>
        </div>
        <div className="flex-1 overflow-hidden flex flex-col md:flex-row">
          <div className="w-full md:w-80 p-8 border-r dark:border-slate-800 space-y-6 bg-slate-50/50 dark:bg-slate-900/50">
            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Version</label>
              <select value={selectedVersions} onChange={e => setSelectedVersion(e.target.value)} disabled={isProcessing} className="w-full bg-white dark:bg-slate-800 border-2 rounded-2xl p-3 text-sm font-bold outline-none focus:border-indigo-500 transition-all">
                {versions.map(v => <option key={v.id} value={v.id}>{v.title}</option>)}
              </select>
            </div>
            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">System</label>
              <div className="grid grid-cols-2 gap-2">
                {['1', '2'].map(sys => (
                  <button key={sys} onClick={() => setSelectedSystem(sys)} className={`py-3 rounded-xl font-black text-xs transition-all ${selectedSystem === sys ? 'bg-indigo-600 text-white shadow-lg' : 'bg-white dark:bg-slate-800 text-slate-400 border'}`}>
                    {sys === '1' ? 'POS' : 'DELIVERY'}
                  </button>
                ))}
              </div>
            </div>
            <label className={`flex flex-col items-center justify-center p-8 border-2 border-dashed rounded-3xl cursor-pointer hover:bg-indigo-50 transition-all ${isProcessing ? 'opacity-50 pointer-events-none' : 'border-indigo-200 bg-indigo-50/30'}`}>
              <CloudUpload size={32} className="text-indigo-500" />
              <input type="file" multiple hidden onChange={handleFileChange} accept=".xls,.xlsx" />
            </label>
          </div>
          <div className="flex-1 p-8 overflow-auto custom-scrollbar">
            {filesData.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-slate-300"><FileSpreadsheet size={48} className="opacity-20 mb-2" /><p className="font-bold">No files selected</p></div>
            ) : (
              <div className="space-y-2">
                {filesData.map((f, i) => (
                  <div key={i} className="flex items-center p-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border dark:border-slate-700">
                    <span className="flex-1 font-bold text-sm truncate pr-4">{f.name}</span>
                    <div className="flex items-center gap-3">
                      {f.status === 'Success' ? <CheckCircle2 size={18} className="text-emerald-500" /> : <span className="text-[9px] font-black uppercase text-amber-600">{f.status}</span>}
                      {!isProcessing && f.status !== 'Success' && <button onClick={() => setFilesData(prev => prev.filter((_, idx) => idx !== i))} className="text-slate-300 hover:text-rose-500"><Trash2 size={16} /></button>}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
        <div className="p-8 bg-slate-50 dark:bg-slate-950 border-t dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">{isProcessing && <><Loader2 size={20} className="animate-spin text-indigo-600" /><span className="text-sm font-bold text-indigo-600">{progressMsg}</span></>}</div>
          <div className="flex gap-4">
            <button onClick={onClose} disabled={isProcessing} className="px-6 py-4 text-slate-400 font-black text-sm">CANCEL</button>
            <button onClick={handleSubmit} disabled={isProcessing || filesData.length === 0} className="px-10 py-4 bg-indigo-600 text-white font-black text-sm rounded-2xl shadow-xl shadow-indigo-600/20 active:scale-95 disabled:opacity-50">START IMPORT</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImportFileModal;