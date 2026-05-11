import React, { useState, useEffect, useRef } from 'react';
import { FileText, User, Lock, Loader2, FileBarChart, Check, ArrowRight } from 'lucide-react';

// 📍 นำเข้า API Service กลาง
import apiService from '../services/apiServices';

export default function LoginScreen({ onLogin, onError, onViewChange }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const passwordInputRef = useRef(null);

  // 1. Load Remembered Credentials เมื่อเปิดหน้าจอ
  useEffect(() => {
    const savedCreds = localStorage.getItem('remembered_creds');
    if (savedCreds) {
      try {
        const { username: savedUser, password: savedPass } = JSON.parse(savedCreds);
        setUsername(savedUser);
        setPassword(savedPass);
        setRememberMe(true);
      } catch (e) {
        localStorage.removeItem('remembered_creds');
      }
    }
  }, []);

  const handleUsernameKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      passwordInputRef.current?.focus();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username || !password) {
      onError('กรุณากรอกข้อมูลให้ครบถ้วน');
      return;
    }

    setIsLoading(true);

    try {
      // จัดการระบบ Remember Me
      if (rememberMe) {
        localStorage.setItem('remembered_creds', JSON.stringify({ username, password }));
      } else {
        localStorage.removeItem('remembered_creds');
      }

      // 📍 เรียก API Login ผ่าน apiService กลาง (จัดการ OAuth2 Format ให้อัตโนมัติ)
      const data = await apiService.auth.login(username, password);

      if (data && data.access_token) {
        // 📍 บันทึก Token และข้อมูลพื้นฐานลง Storage
        localStorage.setItem('access_token', data.access_token);
        localStorage.setItem('token_type', data.token_type || 'bearer');
        localStorage.setItem('role', data.role || 'user');
        
        // ข้อมูลเพิ่มเติมถ้ามีจาก Backend
        if (data.allmember) localStorage.setItem('allmember', data.allmember);
        if (data.ip_address) localStorage.setItem('ip_address', data.ip_address);

        // แจ้ง Component แม่ว่า Login สำเร็จ
        onLogin({
          token: data.access_token,
          username: username
        });
      } else {
        throw new Error('ไม่พบ Access Token จากเซิร์ฟเวอร์');
      }

    } catch (error) {
      console.error("Login Error:", error);
      // ข้อความ Error จะถูกดึงมาจาก Interceptor ใน apiService
      onError(error.message || 'ชื่อผู้ใช้งานหรือรหัสผ่านไม่ถูกต้อง');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-500 relative overflow-hidden font-sans">
      
      {/* Decorative Background */}
      <div className="absolute top-[-20%] left-[-20%] w-[60%] h-[60%] bg-blue-500/10 rounded-full blur-[120px] pointer-events-none animate-pulse"></div>
      <div className="absolute bottom-[-20%] right-[-20%] w-[60%] h-[60%] bg-purple-500/10 rounded-full blur-[120px] pointer-events-none animate-pulse"></div>

      <div className="bg-white dark:bg-slate-900 p-8 md:p-12 rounded-[2.5rem] shadow-2xl shadow-slate-200/50 dark:shadow-black/50 border border-slate-100 dark:border-slate-800 w-full max-w-md relative z-10 animate-in zoom-in-95 duration-300">
        
        <div className="text-center mb-10">
          <div className="w-20 h-20 bg-blue-50 dark:bg-blue-900/20 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-sm transform -rotate-3 hover:rotate-0 transition-transform duration-500">
             <FileText className="w-10 h-10 text-blue-600 dark:text-blue-400" />
          </div>
          <h1 className="text-3xl font-black text-slate-800 dark:text-white tracking-tight">Welcome Back</h1>
          <p className="text-slate-400 text-sm mt-2 font-bold">Sign in to your workspace</p>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Username</label>
            <div className="relative group">
              <User className="absolute left-4 top-3.5 w-5 h-5 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
              <input 
                type="text" 
                className="w-full pl-12 pr-4 py-3.5 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl text-slate-800 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-blue-500 outline-none transition-all font-bold"
                placeholder="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                onKeyDown={handleUsernameKeyDown}
                disabled={isLoading}
                autoFocus
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Password</label>
            <div className="relative group">
              <Lock className="absolute left-4 top-3.5 w-5 h-5 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
              <input 
                ref={passwordInputRef}
                type="password" 
                className="w-full pl-12 pr-4 py-3.5 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl text-slate-800 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-blue-500 outline-none transition-all font-bold"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
              />
            </div>
          </div>

          <div className="flex items-center justify-between pt-2">
            <label className="flex items-center cursor-pointer group select-none">
              <div className="relative">
                <input
                  type="checkbox"
                  className="peer sr-only"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  disabled={isLoading}
                />
                <div className="w-5 h-5 border-2 border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 peer-checked:bg-blue-600 peer-checked:border-blue-600 transition-all flex items-center justify-center">
                  <Check className="w-3.5 h-3.5 text-white opacity-0 peer-checked:opacity-100 transition-opacity" strokeWidth={4} />
                </div>
              </div>
              <span className="ml-3 text-sm font-bold text-slate-500 dark:text-slate-400 group-hover:text-blue-600 transition-colors">Remember me</span>
            </label>
          </div>

          <button 
            type="submit"
            disabled={isLoading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black py-4 rounded-2xl shadow-xl shadow-blue-500/20 hover:shadow-blue-500/40 transition-all transform active:scale-[0.97] disabled:opacity-70 disabled:cursor-not-allowed flex justify-center items-center gap-3 group"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>SIGNING IN...</span>
              </>
            ) : (
              <>
                <span>SIGN IN</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </button>
        </form>

        <div className="mt-10 text-center space-y-4">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-100 dark:border-slate-800"></div>
            </div>
            <div className="relative flex justify-center text-[10px] font-black uppercase tracking-widest">
              <span className="px-4 bg-white dark:bg-slate-900 text-slate-300">Quick Access</span>
            </div>
          </div>

          <button
            type="button"
            onClick={() => onViewChange && onViewChange('public-report')}
            className="w-full flex items-center justify-center gap-3 px-4 py-4 bg-slate-50 hover:bg-slate-100 dark:bg-slate-800/50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-2xl font-black text-xs transition-all border border-transparent hover:border-slate-200 dark:hover:border-slate-700 group"
          >
            <FileBarChart className="w-5 h-5 text-blue-500 group-hover:scale-110 transition-transform" />
            <span>PUBLIC REPORT DASHBOARD</span>
          </button>
        </div>
      </div>
      
      <div className="absolute bottom-8 text-center w-full">
        <p className="text-[10px] font-black text-slate-300 dark:text-slate-700 uppercase tracking-[0.3em]">© 2026 Nakarinsue. System Standard</p>
      </div>

    </div>
  );
}