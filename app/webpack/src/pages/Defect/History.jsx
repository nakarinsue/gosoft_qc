function StepBadge({ step, current, label }) {
  const isActive = current === step;
  const isPast = current > step;
  return (
    <div className={`flex items-center gap-2 ${isActive ? 'text-blue-600 dark:text-blue-400' : isPast ? 'text-green-600 dark:text-green-400' : 'text-gray-400 dark:text-slate-500'}`}>
        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all
            ${isActive 
                ? 'bg-blue-600 border-blue-600 text-white dark:bg-blue-500 dark:border-blue-500' 
                : isPast 
                    ? 'bg-green-100 border-green-200 text-green-700 dark:bg-green-900/30 dark:border-green-800 dark:text-green-300' 
                    : 'bg-white border-gray-200 text-gray-400 dark:bg-slate-800 dark:border-slate-700'
            }`}
        >
            {isPast ? <CheckCircle2 className="w-5 h-5"/> : step}
        </div>
        <span className="hidden md:inline text-sm font-medium whitespace-nowrap">{label}</span>
    </div>
  );
}
  
function InfoItem({ label, value, full = false }) {
  return (
    <div className={`p-4 rounded-lg bg-gray-50 dark:bg-slate-700/30 border border-gray-100 dark:border-slate-700 ${full ? "col-span-2 md:col-span-4" : ""}`}>
      <span className="block text-[10px] uppercase tracking-wider font-bold text-gray-400 dark:text-slate-400 mb-1">{label}</span>
      <span className={`block font-medium text-gray-800 dark:text-slate-200 ${full ? "whitespace-normal break-words" : "truncate"}`} title={value}>
          {value || '-'}
      </span>
    </div>
  );
}
  
function DisplayField({ label, value, highlight }) {
  return (
    <div className={`p-4 rounded-lg border transition-colors ${
        highlight 
        ? 'bg-blue-50 border-blue-100 text-blue-900 dark:bg-blue-900/20 dark:border-blue-800 dark:text-blue-100' 
        : 'bg-gray-50 border-gray-100 text-gray-900 dark:bg-slate-700/50 dark:border-slate-600 dark:text-slate-200'
    }`}>
      <span className="block text-xs font-bold opacity-70 mb-1 uppercase tracking-wide">{label}</span>
      <span className="block text-sm font-medium leading-relaxed">{value || '-'}</span>
    </div>
  );
}
