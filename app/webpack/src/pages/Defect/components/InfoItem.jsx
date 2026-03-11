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