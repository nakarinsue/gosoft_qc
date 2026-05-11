import React, { useState, useRef, useEffect, useCallback } from 'react';
import { 
  LayoutDashboard, Users, LogOut, FolderUp, Menu, ScanBarcode, Box,
  GitMerge, Ticket, Search, History, BanknoteX, PaintBucket, AppWindow, 
  UserCog, MoreVertical, ChevronDown, BarChart3, Settings, Briefcase, X, Save, ShieldCheck
} from 'lucide-react';

export default function MainLayout({ currentView, onViewChange, onLogout, user, children, onError }) {
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
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
    email: user?.email || user?.name+'@gosoft.co.th',
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
        isAdmin && { id: 'version_control', label: 'Version Control', Icon: PaintBucket, color: 'text-teal-500', bg: 'bg-teal-600', shadow: 'shadow-teal-600/30' },
        isAdmin && { id: 'users', label: 'User Management', Icon: Users, color: 'text-cyan-500', bg: 'bg-cyan-600', shadow: 'shadow-cyan-600/30' },
        { id: 'AssignFilePage', label: 'Assign File', Icon: UserCog, color: 'text-orange-400', bg: 'bg-orange-500', shadow: 'shadow-orange-500/30' },
      ].filter(Boolean)
    },
    {
      groupName: 'Job',
      icon: Briefcase,
      groupColor: 'text-emerald-500',
      items: [
        { id: 'Coupon', label: 'Coupon System', Icon: Ticket, color: 'text-rose-500', bg: 'bg-rose-600', shadow: 'shadow-rose-600/30' },
        { id: 'NotPay', label: 'Transaction', Icon: BanknoteX, color: 'text-red-500', bg: 'bg-red-600', shadow: 'shadow-red-600/30' },
        { id: 'BarcodeManagement', label: 'Barcode Management', Icon: Box, color: 'text-sky-500', bg: 'bg-sky-500', shadow: 'shadow-sky-500/30' },
        { id: 'PromotionDashboard', label: 'Promotion Ent.', Icon: Menu, color: 'text-violet-500', bg: 'bg-violet-600', shadow: 'shadow-violet-600/30' },
        { id: 'FlowDashboard', label: 'Gateway', Icon: ScanBarcode, color: 'text-violet-500', bg: 'bg-violet-600', shadow: 'shadow-violet-600/30' },
        { id: 'DynamicForm', label: 'From', Icon: GitMerge, color: 'text-violet-500', bg: 'bg-violet-600', shadow: 'shadow-violet-600/30' },
 
      
      
      ]
    }
  ];

  const allItems = menuGroups.flatMap(g => g.items);
  const activeMenu = allItems.find(item => item.id === currentView) || allItems[0];

  const sidebarRef = useRef(null);
  const userMenuRef = useRef(null);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`/auth/users/${user.user_id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`
        },
        body: JSON.stringify(profileData)
      });
      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.detail || "ไม่สามารถอัปเดตข้อมูลได้");
      }
      alert("อัปเดตข้อมูลสำเร็จ! ระบบจะทำการ Refresh ข้อมูล");
      setIsEditProfileOpen(false);
      window.location.reload();
    } catch (error) { onError(error.message); }
  };

  const fetchVersions = useCallback(async () => {
    try {
      const response = await fetch(`/V2/versions/`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('access_token')}` }
      });
      if (response.ok) setVersions(await response.json());
    } catch (error) { onError("ไม่สามารถโหลดข้อมูล Versions ได้"); }
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
            {/* 📍 ปรับขนาด Icon Header เป็น 28 */}
            <div className={`p-3 rounded-2xl text-white ${activeMenu?.bg} shadow-xl ${activeMenu?.shadow} transition-all`}>
              <activeMenu.Icon size={24} />
            </div>
            <div>
              <h2 className="text-xl font-black leading-tight tracking-tight">{activeMenu?.label}</h2>
              <p className="text-[10px] text-slate-400 uppercase tracking-widest font-black opacity-70">Promotion System v3.0</p>
            </div>
          </div>
        </div>

        <div className="relative w-72 group">
          <select 
            value={selectedVersion}
            onChange={(e) => setSelectedVersion(Number(e.target.value))}
            className="w-full bg-slate-100 dark:bg-slate-800 border-none rounded-2xl py-3 px-5 outline-none focus:ring-2 ring-blue-500/50 text-sm font-black appearance-none cursor-pointer transition-all shadow-sm"
          >
            <option value={0}>ALL VERSIONS</option>
            {versions.map(ver => <option key={ver.id} value={ver.id}>{ver.title}</option>)}
          </select>
          <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none group-hover:text-blue-500" size={18} />
        </div>
      </header>

      <div className="flex flex-1 relative overflow-hidden">
        {/* Sidebar */}
        <aside 
          ref={sidebarRef}
          onMouseEnter={() => setSidebarOpen(true)}
          onMouseLeave={() => setSidebarOpen(false)}
          className={`absolute left-0 top-0 h-full z-50 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 transition-all duration-300 flex flex-col pt-6 ${isSidebarOpen ? 'w-80 shadow-2xl' : 'w-24'}`}
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
                      {/* 📍 ปรับขนาด Icon Sidebar เป็น 24 */}
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
          <div className="p-5 border-t border-slate-100 dark:border-slate-800 relative" ref={userMenuRef}>
            <button onClick={() => setIsUserMenuOpen(!isUserMenuOpen)} className={`w-full flex items-center gap-4 p-3 rounded-3xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 hover:border-blue-500 transition-all duration-300 ${!isSidebarOpen && 'justify-center'}`}>
              <div className="size-12 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-700 flex items-center justify-center text-white font-black text-sm shadow-xl flex-shrink-0">
                {user?.username?.substring(0,2).toUpperCase()}
              </div>
              {isSidebarOpen && (
                <div className="flex-1 text-left overflow-hidden">
                  <p className="text-sm font-black truncate text-slate-800 dark:text-white">{user?.name}</p>
                  <p className="text-[10px] text-emerald-500 font-black uppercase tracking-widest">{isAdmin ? 'Administrator' : 'Access User'}</p>
                </div>
              )}
            </button>
            
            {isUserMenuOpen && (
              <div className="absolute bottom-full left-5 mb-4 w-64 bg-white dark:bg-slate-900 rounded-[2rem] shadow-2xl border border-slate-100 dark:border-slate-800 p-3 z-[100] animate-in slide-in-from-bottom-4 duration-300">
                <button 
                  onClick={() => { setIsEditProfileOpen(true); setIsUserMenuOpen(false); }}
                  className="w-full flex items-center gap-4 px-5 py-4 text-xs font-black text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-2xl transition-all"
                >
                  <UserCog size={20} className="text-blue-500" /> EDIT ACCOUNT
                </button>
                <div className="h-px bg-slate-100 dark:bg-slate-800 my-2 mx-2" />
                <button onClick={onLogout} className="w-full flex items-center gap-4 px-5 py-4 text-xs font-black text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-2xl transition-all">
                  <LogOut size={20} /> SIGN OUT SYSTEM
                </button>
              </div>
            )}
          </div>
        </aside>

        {/* Workspace */}
        <main className="flex-1 ml-24 h-full p-8 bg-slate-50/50 dark:bg-slate-950/50 overflow-hidden">
          <div className="w-full h-full max-w-7xl mx-auto flex flex-col">
              {React.Children.map(children, child => 
                React.isValidElement(child) ? React.cloneElement(child, { selectedVersion }) : child
              )}
          </div>
        </main>
      </div>

      {/* Modal Edit Profile */}
      {isEditProfileOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/70 backdrop-blur-md p-4 animate-in fade-in duration-300">
          <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-[3rem] shadow-[0_35px_60px_-15px_rgba(0,0,0,0.3)] overflow-hidden animate-in zoom-in-95 duration-300">
            <div className="p-10 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-gradient-to-r from-blue-600 to-indigo-700 text-white">
              <div className="flex items-center gap-4">
                <ShieldCheck size={32} />
                <div>
                  <h4 className="text-2xl font-black tracking-tight">Profile Settings</h4>
                  <p className="text-[10px] font-bold uppercase tracking-widest opacity-70">Update your security information</p>
                </div>
              </div>
              <button onClick={() => setIsEditProfileOpen(false)} className="p-3 hover:bg-white/20 rounded-full transition-all"><X size={24}/></button>
            </div>
            
            <form onSubmit={handleUpdateProfile} className="p-10 space-y-8">
              <div className="grid grid-cols-1 gap-6">
                <div className="space-y-2">
                  <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Full Identity Name</label>
                  <input 
                    type="text" value={profileData.name}
                    onChange={(e) => setProfileData({...profileData, name: e.target.value})}
                    className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl font-black text-slate-700 dark:text-white outline-none focus:ring-4 ring-blue-500/10 transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Corporate Email</label>
                  <input 
                    type="email" value={profileData.email}
                    onChange={(e) => setProfileData({...profileData, email: e.target.value})}
                    className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl font-black text-slate-700 dark:text-white outline-none focus:ring-4 ring-blue-500/10 transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Secure Password</label>
                  <input 
                    type="password" placeholder="Leave blank to keep current"
                    onChange={(e) => setProfileData({...profileData, password: e.target.value})}
                    className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl font-black text-slate-700 dark:text-white outline-none focus:ring-4 ring-blue-500/10 transition-all"
                  />
                </div>
              </div>

              <div className="pt-6 flex gap-4">
                <button type="button" onClick={() => setIsEditProfileOpen(false)} className="flex-1 py-4 bg-slate-100 dark:bg-slate-800 font-black text-slate-500 rounded-2xl hover:bg-slate-200 transition-all tracking-widest text-xs">CANCEL</button>
                <button type="submit" className="flex-1 py-4 bg-gradient-to-r from-blue-600 to-indigo-700 font-black text-white rounded-2xl shadow-2xl shadow-blue-600/30 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-3 tracking-widest text-xs">
                  <Save size={20} /> APPLY CHANGES
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}