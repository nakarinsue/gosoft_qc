import React from 'react';
import { FileSpreadsheet, X, Tag, AlertCircle, FileText, Image as ImageIcon, RefreshCcw, ChevronDown, User, Save } from 'lucide-react';

export default function DefectDetailModal({
    selectedRow, popupEdits, handlePopupChange, handleCloseAttempt, handlePopupSave, 
    isPopupDirty, showUnsavedAlert, handleConfirmDiscard, setShowUnsavedAlert, 
    setSelectedImage, STATUS_OPTIONS
}) {
    if (!selectedRow) return null;

    return (
        <div className="fixed inset-0 z-40 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300" onClick={handleCloseAttempt}></div>
            <div className="bg-white rounded-[2rem] w-full max-w-6xl max-h-[90vh] overflow-hidden shadow-2xl flex flex-col relative z-10 animate-in zoom-in-95 duration-300 border border-slate-100">
                
                <div className="px-8 py-6 border-b border-slate-100 flex justify-between items-center bg-white shrink-0">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-blue-600 rounded-2xl text-white shadow-lg shadow-blue-500/30">
                            <FileSpreadsheet className="w-6 h-6" />
                        </div>
                        <div>
                            <h3 className="font-bold text-xl text-slate-800">Defect Details</h3>
                            <div className="flex items-center gap-2 mt-1">
                                <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-500 text-xs font-mono font-bold">ID: {selectedRow.id}</span>
                                <span className="text-slate-300">|</span>
                                <span className={`text-xs font-bold ${(STATUS_OPTIONS[selectedRow.status]?.color || '').replace('bg-', 'text-').replace('text-', 'text-opacity-80-')}`}>
                                    {STATUS_OPTIONS[selectedRow.status]?.label || 'Unknown'}
                                </span>
                            </div>
                        </div>
                    </div>
                    <button onClick={handleCloseAttempt} className="p-2.5 bg-slate-50 hover:bg-slate-100 text-slate-400 hover:text-slate-600 rounded-full transition-all">
                        <X className="w-6 h-6" />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto custom-scrollbar bg-slate-50/50 p-8">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 h-full">
                        {/* Left Column: Info */}
                        <div className="lg:col-span-7 space-y-6">
                            <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
                                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2 mb-4">
                                    <Tag className="w-4 h-4 text-blue-500"/> Promotion Information
                                </h4>
                                <div className="space-y-4">
                                    <div className="flex items-start gap-4">
                                        <div className="px-4 py-2 bg-blue-50 text-blue-700 font-mono font-bold rounded-xl border border-blue-100 text-lg">
                                            {selectedRow.proCode}
                                        </div>
                                        <div>
                                            <p className="text-lg font-bold text-slate-800 leading-snug">{selectedRow.proName}</p>
                                            <p className="text-sm text-slate-500 mt-1">System: <span className="font-bold text-slate-700">{selectedRow.system}</span></p>
                                        </div>
                                    </div>
                                    <div className="flex flex-wrap gap-2 mt-2">
                                         {Array.isArray(selectedRow.types) && selectedRow.types.map((t, i) => (
                                             <span key={i} className="px-3 py-1 bg-slate-100 text-slate-600 text-xs font-bold rounded-lg border border-slate-200 flex items-center gap-1">
                                                <AlertCircle className="w-3 h-3"/> {t}
                                             </span>
                                         ))}
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex-1">
                                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2 mb-4">
                                    <FileText className="w-4 h-4 text-orange-500"/> Full Description
                                </h4>
                                <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200">
                                    <p className="text-slate-700 font-medium leading-relaxed whitespace-pre-wrap text-base">
                                        {selectedRow.detail}
                                    </p>
                                </div>
                                <div className="mt-4 grid grid-cols-2 gap-4">
                                    <div className="p-3 border border-slate-100 rounded-xl">
                                        <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Source File</label>
                                        <p className="text-sm font-mono text-slate-600 truncate">{selectedRow.file}</p>
                                    </div>
                                    <div className="p-3 border border-slate-100 rounded-xl">
                                        <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Sheet Name</label>
                                        <p className="text-sm font-mono text-slate-600 truncate">{selectedRow.sheet}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Right Column: Image & Form */}
                        <div className="lg:col-span-5 space-y-6">
                            {selectedRow.image && (
                                <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
                                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest block mb-4">Evidence</label>
                                    <div onClick={() => setSelectedImage(selectedRow.image)} className="relative h-48 rounded-2xl overflow-hidden cursor-zoom-in group border border-slate-100">
                                        <img src={selectedRow.image} alt="Defect" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                                        <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-[2px]">
                                            <div className="bg-white/20 backdrop-blur-md px-4 py-2 rounded-full text-white font-bold flex items-center gap-2 border border-white/30">
                                                <ImageIcon className="w-4 h-4" /> Click to Expand
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            <div className="bg-white p-6 rounded-3xl border border-blue-100 shadow-lg shadow-blue-500/5 relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50/50 rounded-full -mr-16 -mt-16 pointer-events-none"></div>
                                <h4 className="font-bold text-slate-800 mb-6 flex items-center gap-2 relative z-10">
                                    <div className="p-1.5 bg-blue-100 rounded-lg text-blue-600"><RefreshCcw className="w-4 h-4"/></div> 
                                    Update Status & Note
                                </h4>
                                <div className="space-y-5 relative z-10">
                                    <div>
                                        <label className="text-xs font-bold text-slate-500 mb-2 block uppercase">Current Status</label>
                                        <div className="relative">
                                            <select value={popupEdits.status || ''} onChange={(e) => handlePopupChange('status', e.target.value)} className="w-full pl-4 pr-10 py-3.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-700 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all appearance-none cursor-pointer hover:border-blue-300">
                                                {Object.entries(STATUS_OPTIONS || {}).map(([val, opt]) => (
                                                    <option key={val} value={val}>{opt.label} - {opt.Desc}</option>
                                                ))}
                                            </select>
                                            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none"/>
                                        </div>
                                    </div>
                                    <div>
                                        <label className="text-xs font-bold text-slate-500 mb-2 block uppercase">Remark (Notes)</label>
                                        <textarea rows={4} value={popupEdits.remark || ''} onChange={(e) => handlePopupChange('remark', e.target.value)} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 resize-none transition-all placeholder:text-slate-400" placeholder="Enter note..."/>
                                    </div>
                                    <div className="flex items-center gap-2 text-xs text-slate-400 bg-slate-50 p-3 rounded-lg">
                                        <User className="w-3 h-3"/> Reporter: <span className="font-bold text-slate-600">{selectedRow.username}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="p-6 border-t border-slate-100 bg-white flex justify-end gap-3 shrink-0">
                    <button onClick={handleCloseAttempt} className="px-6 py-3 rounded-xl text-slate-500 font-bold hover:bg-slate-50 transition-colors">Cancel</button>
                    <button onClick={handlePopupSave} disabled={!isPopupDirty} className={`px-8 py-3 rounded-xl font-bold text-white shadow-lg transition-all flex items-center gap-2 transform active:scale-95 ${isPopupDirty ? 'bg-blue-600 hover:bg-blue-700 shadow-blue-500/30 hover:-translate-y-0.5' : 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none'}`}>
                        <Save className="w-4 h-4" /> Save Changes
                    </button>
                </div>

                {/* Unsaved Changes Alert */}
                {showUnsavedAlert && (
                    <div className="absolute inset-0 z-50 bg-white/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in">
                        <div className="bg-white p-8 rounded-3xl shadow-2xl max-w-sm w-full text-center border border-red-100 animate-in zoom-in-95 ring-1 ring-slate-900/5">
                            <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
                                <AlertCircle className="w-8 h-8 text-red-500" />
                            </div>
                            <h3 className="font-black text-xl text-slate-800 mb-2">Unsaved Changes</h3>
                            <p className="text-slate-500 font-medium mb-8">Discard your changes?</p>
                            <div className="grid grid-cols-2 gap-4">
                                <button onClick={() => setShowUnsavedAlert(false)} className="py-3 rounded-xl border-2 border-slate-100 font-bold text-slate-600 hover:bg-slate-50">Keep Editing</button>
                                <button onClick={handleConfirmDiscard} className="py-3 rounded-xl bg-red-500 text-white font-bold hover:bg-red-600 shadow-lg shadow-red-500/30">Discard</button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}