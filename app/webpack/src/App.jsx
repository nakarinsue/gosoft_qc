import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { ArrowLeft } from 'lucide-react'; 

// นำเข้า UI Widgets จากโฟลเดอร์ ui ส่วนกลาง
import { Toaster, toast } from './components/ui/sonner';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "./components/ui/alert-dialog";
import { ErrorDialog } from "./components/ui/error-dialog"; 
    //NotPay,Coupon,BarcodeManagement,PromotionDashboard,ImportFile,barcode,version_control,users,AssignFilePage,history,search,dashboard,workflow
// Components & Layout
import MainLayout from './components/MainLayout';
import LoginScreen from './page/LoginScreen';
import VersionsPage  from './page/VersionsPage';
import ImportExcelView from './page/ImportExcelView'; 
import AssignFilePage from './page/AssignFilePage';     //app\webpack\src\page\AssignFilePage.jsx
import BarcodeScreen from './page/Paymentpage'; 
import PromotionSearchScreen from './page/PromotionSearchScreenpage';
import PublicReportScreen from './page/homepage'; 
import PromotionWorkflowView from './page/createdefect'; 
import PromotionEntityError from './page/EntityErrorPage'; 
import SearchScreen from './page/SearchScreen';


import DashboardScreen from './pages/DashboardScreen';
import UserManagementScreen from './pages/UserManagementScreen';
import CouponManagement from './pages/CouponManagement'; 
import NotPaymentScreen from './pages/NotPaymentScreen'; 
import BarcodeManagement  from './pages/BarcodeManagement'; 
import PromotionDashboard from './pages/Promotion_job_by_user';
import HistoryScreen from './pages/HistoryScreen';
// import PromotionWorkflowView from './pages/PromotionWorkflowView';


// 📍 เปลี่ยนจาก userService เป็น apiService กลาง
import apiService from './services/apiServices';

export default function App() {
  const [user, setUser] = useState(null);
  
  // 📍 1. ตั้งค่าหน้าเริ่มต้นเป็น 'public-report' แทน 'login'
  const [currentView, setCurrentView] = useState('public-report'); 
  
  const [errorModal, setErrorModal] = useState({ isOpen: false, title: '', message: '' });
  const [isLogoutDialogOpen, setIsLogoutDialogOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  
  const [notiHistory, setNotiHistory] = useState([]);

  const addToast = useCallback((title, message, type = 'default') => {
    if (type === 'success') toast.success(title, { description: message });
    else if (type === 'error') toast.error(title, { description: message });
    else if (type === 'warning') toast.warning(title, { description: message });
    else toast(title, { description: message });
    
    setNotiHistory(p => [{ title, message, time: new Date().toLocaleTimeString('th-TH') }, ...p]);
  }, []);

  const globalActions = useMemo(() => ({
    showError: (title, msg) => setErrorModal({ isOpen: true, title, message: msg }),
    showSuccess: (title, msg) => addToast(title, msg, 'success'),
    showWarning: (title, msg) => addToast(title, msg, 'warning'),
  }), [addToast]);

  const handleLogoutRequest = () => setIsLogoutDialogOpen(true);
  
  const confirmLogout = () => { 
    setUser(null); 
    // 📍 2. เมื่อ Logout ให้กลับไปหน้า 'public-report'
    setCurrentView('public-report'); 
    setNotiHistory([]); 
    setIsLogoutDialogOpen(false);
  };

  const handleEditProfile = () => setIsProfileModalOpen(true);
  
  // 📍 ปรับปรุง: เรียกใช้งาน apiService ในการอัปเดต Profile
  const handleSaveProfile = async (formData, isEdit) => {
    try {
      // เรียกใช้ updateUser จาก API กลาง (ดึง user_id จาก state หรือ formData)
      const targetUserId = user?.user_id || formData.id;
      await apiService.auth.updateUser(targetUserId, formData); 
      
      setUser(prev => ({ ...prev, name: formData.name, email: formData.email }));
      globalActions.showSuccess("Profile Updated", "แก้ไขข้อมูลส่วนตัวสำเร็จ");
      setIsProfileModalOpen(false);
    } catch (error) {
      // ดึง Error Message จาก Service กลางมาแสดง
      globalActions.showError("Update Failed", error.message || "ไม่สามารถแก้ไขข้อมูลได้");
    }
  };
    //AssignFilePage,history,search,dashboard,workflow
  const renderContent = () => {
    const props = { user, actions: globalActions, onViewChange: setCurrentView };
    switch (currentView) {
      case 'dashboard': return <PromotionSearchScreen {...props} />;
      case 'workflow':  return <PromotionWorkflowView {...props} onBack={() => setCurrentView('dashboard')} />;
      case 'search':    return <SearchScreen {...props} />;
      case 'history':   return <HistoryScreen {...props} />;
      case 'AssignFilePage':   return <AssignFilePage {...props} />;

      // case 'Testpage':   return <Testpage {...props} />;

      case 'barcode':   return <BarcodeScreen {...props} />;
      case 'ImportFile':   return <ImportExcelView {...props} />;
      case 'version_control':   return <VersionsPage {...props} />;
      case 'users': return <UserManagementScreen {...props} />;

      // case 'FlowDashboard':   return <TxFlowDashboard {...props} />;
      
      case 'Coupon':    return <CouponManagement {...props} />;//
      case 'NotPay':   return <NotPaymentScreen {...props} />;//
      case 'BarcodeManagement':   return <BarcodeManagement {...props} />;//
      case 'PromotionDashboard':   return <PromotionDashboard {...props} />;//
      case 'PromotionEntityError':   return <PromotionEntityError {...props} />;//

      // case 'DefectDetailModal':   return <DefectDetailModal {...props} />;
      // case 'DynamicForm':   return <DynamicSettingsForm {...props} />;
      default:          return <PromotionSearchScreen {...props} />;
    }
  };

  // =========================================================
  // 📍 3. เช็คสถานะการเข้าสู่ระบบ (Not Logged In Flow)
  // =========================================================
  if (!user) {
    // 3.1 กรณีผู้ใช้กดปุ่ม Login จะเข้ามาเงื่อนไขนี้
    if (currentView === 'login') {
      return (
        <div className="min-h-screen relative bg-slate-50">
          
          {/* ปุ่มลอยสำหรับกดย้อนกลับไปหน้า Home (เผื่อหน้า Login ของคุณไม่มีปุ่มปิด) */}
          <div className="absolute top-6 left-6 z-50">
             <button 
                onClick={() => setCurrentView('public-report')}
                className="flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur-md rounded-xl shadow-sm border border-slate-200 text-sm font-bold text-slate-600 hover:text-indigo-600 hover:bg-white transition-all"
             >
                <ArrowLeft size={16} /> Back to Home
             </button>
          </div>

          <LoginScreen 
              onLogin={(u) => { 
                  setUser(u); 
                  setCurrentView('history'); 
                  globalActions.showSuccess('Welcome', `Hi, ${u.name}`); 
              }} 
              onViewChange={setCurrentView}
              onError={(m) => globalActions.showError('Login Failed', m)} 
          />
          
          <ErrorDialog 
            open={errorModal.isOpen} 
            onOpenChange={(isOpen) => !isOpen && setErrorModal({ ...errorModal, isOpen: false })}
            title={errorModal.title}
            description={errorModal.message}
          />
          <Toaster position="top-right" richColors />
        </div>
      );
    }

    // 3.2 กรณีเป็นหน้าแรกสุด (ยังไม่ได้ Login และไม่ได้เปิดหน้า Login)
    return (
      <div className="min-h-screen">
        {/* ส่ง Props สั่งเปลี่ยนหน้าไปที่ Login */}
        <PublicReportScreen onLoginClick={() => setCurrentView('login')} />
        <Toaster position="top-right" richColors />
      </div>
    );
  }

  // =========================================================
  // 📍 4. กรณี Login สำเร็จแล้ว (Main Application)
  // =========================================================
  return (
    <>
      <MainLayout 
          currentView={currentView} 
          onViewChange={setCurrentView} 
          onLogout={handleLogoutRequest} 
          onEditProfile={handleEditProfile}
          user={user} 
          notifications={notiHistory} 
          clearNotifications={() => setNotiHistory([])}
      >
        {renderContent()}
      </MainLayout>
      
      <ErrorDialog 
        open={errorModal.isOpen} 
        onOpenChange={(isOpen) => !isOpen && setErrorModal({ ...errorModal, isOpen: false })}
        title={errorModal.title}
        description={errorModal.message}
      />

      <AlertDialog open={isLogoutDialogOpen} onOpenChange={setIsLogoutDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>ยืนยันการออกจากระบบ?</AlertDialogTitle>
            <AlertDialogDescription>
              คุณต้องการออกจากระบบและกลับไปยังหน้าหลักใช่หรือไม่?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>ยกเลิก</AlertDialogCancel>
            <AlertDialogAction onClick={confirmLogout} className="bg-red-600 hover:bg-red-700 text-white">
              ออกจากระบบ
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Toaster position="top-right" richColors />
    </>
  );
}