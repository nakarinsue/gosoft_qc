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