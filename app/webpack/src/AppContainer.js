import React, { useState } from 'react';
import { LogIn, LayoutDashboard } from 'lucide-react';
import { Button } from './ui/button';

// นำเข้า LoginFormWidget ที่เราเพิ่งสร้าง
import LoginFormWidget from './LoginFormWidget'; 
import MainLayout from './MainLayout'; // หน้า Layout หลักของคุณ

export default function AppContainer() {
  // สร้าง State สำหรับสลับหน้าจอ: 'landing', 'login', 'dashboard'
  const [currentScreen, setCurrentScreen] = useState('landing');
  const [userData, setUserData] = useState(null);

  // ฟังก์ชันเมื่อ Login สำเร็จ
  const handleLoginSuccess = (user) => {
    setUserData(user);
    setCurrentScreen('dashboard'); // เปลี่ยนไปหน้า MainLayout ของคุณ
  };

  // -----------------------------------------
  // 1. หน้า Landing Page (หน้าเริ่มต้นที่มีปุ่มกดไป Login)
  // -----------------------------------------
  if (currentScreen === 'landing') {
    return (
      <div className="min-h-screen w-full flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-950 p-6 relative overflow-hidden font-sans">
        {/* ของตกแต่งพื้นหลัง */}
        <div className="absolute top-[-20%] right-[-10%] w-[40rem] h-[40rem] bg-indigo-500/10 rounded-full blur-3xl" />
        
        <div className="z-10 flex flex-col items-center text-center space-y-8 max-w-2xl">
          <div className="p-5 bg-white dark:bg-slate-900 rounded-[2rem] shadow-2xl border border-slate-100 dark:border-slate-800">
            <LayoutDashboard size={48} className="text-blue-600 dark:text-blue-400" />
          </div>
          
          <div>
            <h1 className="text-5xl font-black tracking-tight text-slate-900 dark:text-white mb-4">
              Promotion System <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-700">v3.0</span>
            </h1>
            <p className="text-slate-500 dark:text-slate-400 font-medium text-lg">
              ระบบจัดการโปรโมชั่นระดับองค์กร กรุณาเข้าสู่ระบบเพื่อดำเนินการต่อ
            </p>
          </div>

          {/* 📍 ปุ่มสำหรับกดไปหน้า Login */}
          <Button 
            onClick={() => setCurrentScreen('login')}
            className="h-14 px-8 bg-gradient-to-r from-blue-600 to-indigo-700 font-black text-white rounded-2xl shadow-xl shadow-blue-600/30 hover:shadow-2xl hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-3 tracking-widest text-sm"
          >
            <LogIn size={20} /> GO TO LOGIN PORTAL
          </Button>
        </div>
      </div>
    );
  }

  // -----------------------------------------
  // 2. หน้า Login Form
  // -----------------------------------------
  if (currentScreen === 'login') {
    return (
      <LoginFormWidget 
        onLoginSuccess={handleLoginSuccess} 
        onBack={() => setCurrentScreen('landing')} // 📍 ส่งฟังก์ชันย้อนกลับไปให้ Widget
      />
    );
  }

  // -----------------------------------------
  // 3. หน้า Dashboard (เมื่อ Login สำเร็จ)
  // -----------------------------------------
  if (currentScreen === 'dashboard') {
    return (
      <MainLayout 
        user={userData} 
        onLogout={() => {
          setUserData(null);
          setCurrentScreen('landing');
        }}
        currentView="dashboard"
        onViewChange={(view) => console.log('Change view to:', view)}
        onError={(err) => console.error(err)}
      >
        {/* เนื้อหาด้านใน MainLayout */}
        <div className="flex items-center justify-center h-full text-slate-400 font-black">
          WORKSPACE CONTENT AREA
        </div>
      </MainLayout>
    );
  }

  return null;
}