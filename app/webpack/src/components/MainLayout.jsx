import React, { useState, useRef, useEffect, useCallback } from 'react';
import { 
  LayoutDashboard, Users, LogOut, FolderUp, Menu, ScanBarcode, Box,
  GitMerge, Ticket, Search, History, BanknoteX, PaintBucket, AppWindow, 
  UserCog, MoreVertical, ChevronDown, BarChart3, Settings, Briefcase, X, Save, ShieldCheck
} from 'lucide-react';

// --- นำเข้า API Service กลาง ---
import apiService from '../services/apiServices'; // ปรับ path ให้ตรงกับที่เก็บไฟล์ของคุณ

// --- นำเข้า UI Widgets ---
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from './ui/select';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger,
} from './ui/dropdown-menu';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from './ui/dialog';

export default function MainLayout({ currentView, onViewChange, onLogout, user, children, onError }) {
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [versions, setVersions] = useState([]);
  const [selectedVersion, setSelectedVersion] = useState(() => {
    const saved = localStorage.getItem('selectedVersion');
    return saved !== null ? Number(saved) : 0;
  });

  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    username: user?.username || '',
    user_id: user?.user_id || '',
    email: user?.email || user?.name + '@gosoft.co.th',
    role: user?.role || 'user',
    password: ''
  });

  // --- 1. กรองเมนูตามสิทธิ์  
  const Admin = localStorage.getItem('role');
  const isAdmin = Admin === 'admin'; 

  const menuGroups = [
    {
      groupName: 'Report',
      icon: BarChart3,
      groupColor: 'text-indigo-500',
      items: [
        { id: 'history', label: 'Audit History', Icon: History, color: 'text-purple-500', bg: 'bg-purple-600', shadow: 'shadow-purple-600/30' },
        { id: 'search', label: 'Search', Icon: Search, color: 'text-blue-500', bg: 'bg-blue-600', shadow: 'shadow-blue-600/30' },
        { id: 'dashboard', label: 'Defect Log', Icon: LayoutDashboard, color: 'text-indigo-500', bg: 'bg-indigo-600', shadow: 'shadow-indigo-600/30' },
        { id: 'workflow', label: 'Add Defect', Icon: GitMerge, color: 'text-sky-500', bg: 'bg-sky-600', shadow: 'shadow-sky-600/30' },
      ]
    },
    {
      groupName: 'Manager',
      icon: Settings,
      groupColor: 'text-amber-500',
      items: [
                    { id: 'ImportFile', label: 'Import Excel', Icon: FolderUp, color: 'text-amber-500', bg: 'bg-amber-500', shadow: 'shadow-amber-500/30' },
                    { id: 'barcode', label: 'Payment Scan', Icon: ScanBarcode, color: 'text-orange-500', bg: 'bg-orange-600', shadow: 'shadow-orange-600/30' },
        isAdmin &&  { id: 'version_control', label: 'Version Control', Icon: PaintBucket, color: 'text-teal-500', bg: 'bg-teal-600', shadow: 'shadow-teal-600/30' },
        isAdmin &&  { id: 'users', label: 'User Management', Icon: Users, color: 'text-cyan-500', bg: 'bg-cyan-600', shadow: 'shadow-cyan-600/30' },
                    { id: 'AssignFilePage', label: 'Assign File', Icon: UserCog, color: 'text-orange-400', bg: 'bg-orange-500', shadow: 'shadow-orange-500/30' },
      ].filter(Boolean)
    },
    {
      groupName: 'Job',
      icon: Briefcase,
      groupColor: 'text-emerald-500',
      items: [
        { id: 'PromotionEntityError', label: 'PromotionEntityError', Icon: Ticket, color: 'text-rose-500', bg: 'bg-rose-600', shadow: 'shadow-rose-600/30' }
        // { id: 'NotPay', label: 'Transaction', Icon: BanknoteX, color: 'text-red-500', bg: 'bg-red-600', shadow: 'shadow-red-600/30' },
        // { id: 'BarcodeManagement', label: 'Barcode Management', Icon: Box, color: 'text-sky-500', bg: 'bg-sky-500', shadow: 'shadow-sky-500/30' },
        // { id: 'PromotionDashboard', label: 'Promotion Ent.', Icon: Menu, color: 'text-violet-500', bg: 'bg-violet-600', shadow: 'shadow-violet-600/30' },
      ]
    },
  ];

  const allItems = menuGroups.flatMap(g => g.items);
  const activeMenu = allItems.find(item => item.id === currentView) || allItems[0];

  // 📍 1. ปรับปรุงฟังก์ชันอัปเดต Profile ให้เรียกใช้งาน apiService กลาง
  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    try {
      // เรียกใช้ API ผ่าน Service กลาง (ไม่ต้องส่ง Token หรือ Header เอง)
      await apiService.auth.updateUser(user.user_id, profileData);
      
      alert("อัปเดตข้อมูลสำเร็จ! ระบบจะทำการ Refresh ข้อมูล");
      setIsEditProfileOpen(false);
      window.location.reload();
    } catch (error) { 
      onError(error.message || "ไม่สามารถอัปเดตข้อมูลได้"); 
    }
  };

  // 📍 2. ปรับปรุงฟังก์ชันดึง Versions ให้เรียกใช้งาน apiService กลาง
  const fetchVersions = useCallback(async () => {
    try {
      const data = await apiService.versions.getAll();
      // สมมติว่าโครงสร้าง response จาก API ส่ง array ข้อมูลกลับมาตรงๆ หรืออยู่ใน data.result 
      // (อิงจาก Swagger ที่คืนค่าเป็น Array)
      setVersions(data || []);
    } catch (error) { 
      onError(error.message || "ไม่สามารถโหลดข้อมูล Versions ได้"); 
    }
  }, [onError]);

  useEffect(() => {
    fetchVersions();
    window.addEventListener('version-data-updated', fetchVersions);
    return () => window.removeEventListener('version-data-updated', fetchVersions);
  }, [fetchVersions]);

  return (
    <div className="flex flex-col h-screen w-full bg-slate-50 dark:bg-slate-950 font-sans text-slate-900 dark:text-white overflow-hidden">
      
      {/* Header */}
      <header className="flex-none z-[60] bg-white/90 dark:bg-slate-900/90 backdrop-blur-md shadow-sm border-b border-gray-200 dark:border-slate-800 px-6 py-4 flex justify-between items-center w-full">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-4">
            <div className={`p-3 rounded-2xl text-white ${activeMenu?.bg} shadow-xl ${activeMenu?.shadow} transition-all`}>
              <activeMenu.Icon size={24} />
            </div>
            <div>
              <h2 className="text-xl font-black leading-tight tracking-tight">{activeMenu?.label}</h2>
              <p className="text-[10px] text-slate-400 uppercase tracking-widest font-black opacity-70">Promotion System v3.0</p>
            </div>
          </div>
        </div>

        {/* เลือก Version */}
        <div className="w-72 relative">
          <Select 
            value={selectedVersion.toString()} 
            onValueChange={(value) => {
              setSelectedVersion(Number(value));
              localStorage.setItem('selectedVersion', value);
            }}
          >
            <SelectTrigger className="w-full h-12 bg-slate-100 dark:bg-slate-800 border-none rounded-2xl py-3 px-5 outline-none focus:ring-2 ring-blue-500/50 text-sm font-black transition-all shadow-sm">
              <SelectValue placeholder="ALL VERSIONS" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="0">ALL VERSIONS</SelectItem>
              {versions.map(ver => (
                <SelectItem key={ver.id} value={ver.id.toString()}>{ver.title}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </header>

      <div className="flex flex-1 relative overflow-hidden">
        {/* Sidebar */}
        <aside 
          onMouseEnter={() => setSidebarOpen(true)}
          onMouseLeave={() => setSidebarOpen(false)}
          className={`absolute left-0 top-0 h-full z-[50] bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 transition-all duration-300 flex flex-col pt-6 ${isSidebarOpen ? 'w-80 shadow-2xl' : 'w-24'}`}
        >
          <nav className="flex-1 px-4 space-y-10 overflow-y-auto custom-scrollbar pb-20">
            {menuGroups.map((group, gIdx) => (
              <div key={gIdx} className="space-y-2">
                {isSidebarOpen ? (
                  <div className={`px-5 text-[16px] font-black uppercase tracking mb-4 ${group.groupColor} opacity-80`}>{group.groupName}</div>
                ) : (
                  <div className="h-px bg-slate-100 dark:bg-slate-800 mx-4 my-8" />
                )}
                {group.items.map((item) => {
                  const isActive = currentView === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => onViewChange(item.id)}
                      className={`w-full flex items-center gap-4 px-5 py-4 rounded-[1.5rem] transition-all duration-300 group relative ${!isSidebarOpen && 'justify-center'} ${isActive ? `${item.bg} text-white shadow-2xl ${item.shadow}` : `text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800/50`}`}
                    >
                      <item.Icon size={20} className={isActive ? 'text-white scale-110' : `${item.color} group-hover:scale-110 transition-transform duration-300`} />
                      {isSidebarOpen && <span className="truncate text-[15px] font-black tracking-tight">{item.label}</span>}
                      
                      {!isSidebarOpen && (
                        <div className="absolute left-full ml-4 px-3 py-2 bg-slate-900 text-white text-[10px] font-black rounded-xl opacity-0 group-hover:opacity-100 transition-all translate-x-[-10px] group-hover:translate-x-0 pointer-events-none whitespace-nowrap z-50 shadow-2xl">
                          {item.label}
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            ))}
          </nav>

          {/* User Profile */}
          <div className="p-5 border-t border-slate-100 dark:border-slate-800 relative">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className={`w-full flex items-center gap-4 p-3 rounded-3xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 hover:border-blue-500 transition-all duration-300 ${!isSidebarOpen && 'justify-center outline-none'}`}>
                  <div className="size-12 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-700 flex items-center justify-center text-white font-black text-sm shadow-xl flex-shrink-0">
                    {user?.username?.substring(0,2).toUpperCase() || 'U'}
                  </div>
                  {isSidebarOpen && (
                    <div className="flex-1 text-left overflow-hidden">
                      <p className="text-sm font-black truncate text-slate-800 dark:text-white">{user?.name}</p>
                      <p className="text-[10px] text-emerald-500 font-black uppercase tracking-widest">{isAdmin ? 'Administrator' : 'Access User'}</p>
                    </div>
                  )}
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align={isSidebarOpen ? "end" : "start"} side="top" className="w-64 mb-4 rounded-[1.5rem] p-3 shadow-2xl border-slate-100 dark:border-slate-800 animate-in slide-in-from-bottom-4">
                <DropdownMenuItem 
                  onClick={() => setIsEditProfileOpen(true)}
                  className="gap-4 px-5 py-4 text-xs font-black text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-2xl cursor-pointer"
                >
                  <UserCog size={20} className="text-blue-500" /> EDIT ACCOUNT
                </DropdownMenuItem>
                <DropdownMenuSeparator className="my-2 bg-slate-100 dark:bg-slate-800" />
                <DropdownMenuItem 
                  onClick={onLogout}
                  className="gap-4 px-5 py-4 text-xs font-black text-red-500 focus:bg-red-50 focus:text-red-600 dark:focus:bg-red-900/20 rounded-2xl cursor-pointer"
                >
                  <LogOut size={20} /> SIGN OUT SYSTEM
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </aside>

        {/* Workspace */}
        <main className="flex-1 ml-24 h-full p-8 bg-slate-50/50 dark:bg-slate-950/50 overflow-hidden">
          <div className="w-full h-full max-w-8xl mx-auto flex flex-col">
              {React.Children.map(children, child => 
                React.isValidElement(child) ? React.cloneElement(child, { selectedVersion }) : child
              )}
          </div>
        </main>
      </div>

      {/* Profile Edit Dialog */}
      <Dialog open={isEditProfileOpen} onOpenChange={setIsEditProfileOpen}>
        <DialogContent className="sm:max-w-lg p-0 overflow-hidden rounded-[3rem] border-none shadow-[0_35px_60px_-15px_rgba(0,0,0,0.3)] bg-white dark:bg-slate-900">
          <div className="p-8 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-gradient-to-r from-blue-600 to-indigo-700 text-white">
            <div className="flex items-center gap-4">
              <ShieldCheck size={32} />
              <div>
                <DialogTitle className="text-2xl font-black tracking-tight text-white border-none m-0">Profile Settings</DialogTitle>
                <DialogDescription className="text-[10px] font-bold uppercase tracking-widest text-white/70 m-0">
                  Update your security information
                </DialogDescription>
              </div>
            </div>
          </div>
          
          <form onSubmit={handleUpdateProfile} className="p-8 space-y-6">
            <div className="grid grid-cols-1 gap-5">
              <div className="space-y-2">
                <Label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Full Identity Name</Label>
                <Input 
                  type="text" 
                  value={profileData.name}
                  onChange={(e) => setProfileData({...profileData, name: e.target.value})}
                  className="h-14 px-6 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl font-black text-slate-700 dark:text-white outline-none focus-visible:ring-4 ring-blue-500/10 transition-all text-base"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Corporate Email</Label>
                <Input 
                  type="email" 
                  value={profileData.email}
                  onChange={(e) => setProfileData({...profileData, email: e.target.value})}
                  className="h-14 px-6 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl font-black text-slate-700 dark:text-white outline-none focus-visible:ring-4 ring-blue-500/10 transition-all text-base"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Secure Password</Label>
                <Input 
                  type="password" 
                  placeholder="Leave blank to keep current"
                  onChange={(e) => setProfileData({...profileData, password: e.target.value})}
                  className="h-14 px-6 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl font-black text-slate-700 dark:text-white outline-none focus-visible:ring-4 ring-blue-500/10 transition-all text-base"
                />
              </div>
            </div>

            <DialogFooter className="pt-4 flex sm:justify-between gap-4 w-full flex-row">
              <Button 
                type="button" 
                variant="secondary"
                onClick={() => setIsEditProfileOpen(false)} 
                className="flex-1 h-14 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 font-black text-slate-500 rounded-2xl transition-all tracking-widest text-xs"
              >
                CANCEL
              </Button>
              <Button 
                type="submit" 
                className="flex-1 h-14 bg-gradient-to-r from-blue-600 to-indigo-700 font-black text-white rounded-2xl shadow-2xl shadow-blue-600/30 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 tracking-widest text-xs"
              >
                <Save size={18} /> APPLY CHANGES
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}