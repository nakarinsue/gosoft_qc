import React, { useState, useEffect, useMemo, useCallback } from 'react';
import MainLayout from './components/layout/MainLayout';
import { ErrorModal, ToastContainer } from './components/ui/ToastSystem';

import LoginScreen from './pages/LoginScreen';
import DashboardScreen from './pages/DashboardScreen';
import UserManagementScreen from './pages/UserManagementScreen';
import CouponManagement from './pages/CouponManagement'; // อย่าลืม Import
import PublicReportScreen from './pages/PublicReportScreen'; // อย่าลืม Import
import BarcodeScreen from './pages/BarcodeScreen'; // อย่าลืม Import
import NotPaymentScreen from './pages/NotPaymentScreen'; 
import AssignFilePage from './pages/AssignFilePage'; 
import Testpage  from './pages/test'; 
import BarcodeManagement  from './pages/BarcodeManagement'; 
import ImportExcelView from './pages/ImportExcelView'; 

// import CsStructureDiagram  from './pages/CsStructureDiagram'; 
import userService from './services/userService';
import PromotionDashboard from './pages/Promotion_job_by_user';
import SearchScreen from './pages/SearchScreen';
import HistoryScreen from './pages/HistoryScreen';
import DefectDetailModal from './pages/DefectDetailModal';
import PromotionWorkflowView from './pages/PromotionWorkflowView';
import VersionsPage  from './pages/VersionsPage';
// ... Import หน้าอื่นๆ ...

export default function App() {

  const [user, setUser] = useState(null);
  const [currentView, setCurrentView] = useState('login');
  
  const [errorModal, setErrorModal] = useState({ isOpen: false, title: '', message: '' });
  const [toasts, setToasts] = useState([]);
  const [notiHistory, setNotiHistory] = useState([]);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

  const addToast = useCallback((title, message) => {
    const id = Date.now();
    setToasts(p => [...p, { id, title, message }]);
    setNotiHistory(p => [{ title, message, time: new Date().toLocaleTimeString('th-TH') }, ...p]);
    setTimeout(() => setToasts(p => p.filter(t => t.id !== id)), 3000);
  }, []);

  const removeToast = (id) => setToasts(p => p.filter(t => t.id !== id));

  // Memo Hook
  const globalActions = useMemo(() => ({
    showError: (title, msg) => setErrorModal({ isOpen: true, title, message: msg }),
    showSuccess: (title, msg) => addToast(title, msg),
    showWarning: (title, msg) => addToast(`⚠️ ${title}`, msg),
  }), [addToast]);

  // Effect Hook (Theme)
  useEffect(() => {
    // Logic Theme ถ้ามี...
  }, []);

  // =========================================================
  // ZONE 2: FUNCTION LOGIC
  // =========================================================
  const handleLogout = () => { 
    if (window.confirm('ยืนยันการออกจากระบบ?')) { 
        setUser(null); 
        setCurrentView('login'); 
        setNotiHistory([]); 
    } 
  };

  const handleEditProfile = () => setIsProfileModalOpen(true);
  const handleSaveProfile = async (formData, isEdit) => {
      try {
          await userService.saveUser(formData, true); 
          setUser(prev => ({ ...prev, name: formData.name, email: formData.email }));
          globalActions.showSuccess("Profile Updated", "แก้ไขข้อมูลส่วนตัวสำเร็จ");
          setIsProfileModalOpen(false);
      } catch (error) {
          globalActions.showError("Update Failed", "ไม่สามารถแก้ไขข้อมูลได้");
      }
    };
  const renderContent = () => {
    const props = { user, actions: globalActions, onViewChange: setCurrentView };
    switch (currentView) {
      case 'dashboard': return <DashboardScreen {...props} />;
      case 'users': return <UserManagementScreen {...props} />;
      case 'barcode':   return <BarcodeScreen {...props} />;
      case 'workflow':  return <PromotionWorkflowView {...props} onBack={() => setCurrentView('dashboard')} />;
      case 'Coupon':    return <CouponManagement {...props} />;
      case 'search':    return <SearchScreen {...props} />;
      case 'history':   return <HistoryScreen {...props} />;
      case 'AssignFilePage':   return <AssignFilePage {...props} />;
      case 'NotPay':   return <NotPaymentScreen {...props} />;
      case 'Product':   return <ProductScreen {...props} />;
      case 'Testpage':   return <Testpage {...props} />;
      case 'ImportFile':   return <ImportExcelView {...props} />;
      case 'BarcodeManagement':   return <BarcodeManagement {...props} />;
      case 'PromotionDashboard':   return <PromotionDashboard {...props} />;
      case 'DefectDetailModal':   return <DefectDetailModal {...props} />;
      case 'version_control':   return <VersionsPage {...props} />;
      default:          return <DashboardScreen {...props} />;
    }
  };

  // =========================================================

  // =========================================================
  
  // ✅ 1. เช็ค Public Page ก่อน (แต่ต้องอยู่ใต้ Hooks ทั้งหมด)
  if (currentView === 'public-report') {
    return <PublicReportScreen onBack={() => setCurrentView('login')} />;
  }

  // ✅ 2. เช็ค Login
  if (!user) {
    return (
      <div className="min-h-screen">
        <LoginScreen 
            onLogin={(u) => { 
                setUser(u); 
                setCurrentView('history'); 
                globalActions.showSuccess('Welcome', `Hi, ${u.name}`); 
            }} 
            onViewChange={setCurrentView} // ส่ง Function นี้เพื่อให้กดปุ่ม Public Report ได้
            onError={(m) => globalActions.showError('Login Failed', m)} 
        />
        <ErrorModal 
            isOpen={errorModal.isOpen} 
            title={errorModal.title} 
            message={errorModal.message} 
            onClose={() => setErrorModal({ ...errorModal, isOpen: false })} 
        />
      </div>
    );
  }

  // ✅ 3. หน้าจอหลัก (Main Layout)
return (
    <MainLayout 
        currentView={currentView} 
        onViewChange={setCurrentView} 
        onLogout={handleLogout} 
        onEditProfile={handleEditProfile}
        user={user} 
        notifications={notiHistory} 
        clearNotifications={() => setNotiHistory([])}
    >
      {/* ลบ div ที่ครอบออกไปเลย เพื่อให้ Props ส่งทะลุถึง Component ได้ */}
      {renderContent()}
      
      <ErrorModal isOpen={errorModal.isOpen} title={errorModal.title} message={errorModal.message} onClose={() => setErrorModal({ ...errorModal, isOpen: false })} />
      <ToastContainer toasts={toasts} removeToast={removeToast} />
      
    </MainLayout>
  );
}