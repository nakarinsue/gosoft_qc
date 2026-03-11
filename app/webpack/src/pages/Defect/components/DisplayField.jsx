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
