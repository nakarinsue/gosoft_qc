import React from 'react';
import { cn } from '../utils/cn';
import { 
  LayoutDashboard, 
  History, 
  User, 
  LogOut, 
  Sun, 
  Moon, 
  Zap, 
  PlusCircle,
  QrCode,
  TicketPercent,
  BanknoteX ,
  Search as SearchIcon 
} from 'lucide-react';

export default function Navbar({ 
  user, 
  onLogout, 
  onViewChange, 
  currentView, 
  themeMode, 
  isDarkMode, 
  onCycleTheme 
}) {
  
  const navItems = [
    { id: 'workflow', label: 'Defect', icon: <PlusCircle className="size-4"/> },
    { id: 'barcode', label: 'Barcode', icon: <QrCode className="size-4"/> },
    { id: 'Coupon', label: 'Coupon', icon: <TicketPercent className="size-4"/> },
    { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard className="size-4" /> },
    { id: 'search', label: 'Search', icon: <SearchIcon className="size-4" /> },
    { id: 'history', label: 'History', icon: <History className="size-4" /> },
    { id: 'NotPay', label: 'NotPay', icon: <BanknoteX className="size-4" /> },
    { id: 'Product', label: 'Product', icon: <BanknoteX className="size-4" /> },
    { id: 'users', label: 'Admin', icon: <User className="size-4" />, adminOnly: true },
    { id: 'ExcelImportPage', label: 'Import Excel', icon: <FolderUp  className="size-4" /> },
        { id: 'Testpage', label: 'Testpage', icon: <AppWindow  className="size-4" /> },


  ];

  return (
    <nav className="sticky top-0 z-50 bg-white/80 dark:bg-dark-card/80 backdrop-blur-md border-b border-slate-200 dark:border-dark-border px-4 md:px-6 py-3">
      <div className="max-w-[1600px] mx-auto flex justify-between items-center">
        
        {/* Logo Section */}
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => onViewChange('dashboard')}>
          <div className="bg-brand-primary p-2 rounded-xl shadow-lg shadow-brand-primary/20">
            <Zap className="text-white size-5 fill-current" />
          </div>
          <span className="font-bold text-xl hidden sm:block dark:text-white">Promotion Hub</span>
        </div>

        {/* Navigation Items */}
        <div className="hidden md:flex items-center gap-1">
          {navItems.map((item) => {
            if (item.adminOnly && user?.role !== 'admin') return null;
            const active = currentView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onViewChange(item.id)}
                className={cn(
                  "flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all",
                  active 
                    ? "bg-brand-primary/10 text-brand-primary" 
                    : "text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 dark:text-slate-400"
                )}
              >
                {item.icon}
                {item.label}
              </button>
            );
          })}
        </div>

        {/* Action Section */}
        <div className="flex items-center gap-2 md:gap-4">
          {/* Theme Toggle Button */}
          <button 
            onClick={onCycleTheme}
            className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:scale-105 transition-transform"
            title={`Mode: ${themeMode}`}
          >
            {themeMode === 'auto' ? <Zap className="size-5" /> : isDarkMode ? <Sun className="size-5" /> : <Moon className="size-5" />}
          </button>

          <div className="h-8 w-px bg-slate-200 dark:bg-dark-border mx-1" />

          {/* User Profile & Logout */}
          <div className="flex items-center gap-3 pl-1">
            <div className="text-right hidden lg:block">
              <p className="text-sm font-bold dark:text-white">{user?.name || 'Guest User'}</p>
              <p className="text-[10px] text-slate-400 uppercase tracking-widest">{user?.role || 'Member'}</p>
            </div>
            <button 
              onClick={onLogout}
              className="p-2.5 rounded-xl text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"
            >
              <LogOut className="size-5" />
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}