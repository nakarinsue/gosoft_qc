// import { useState } from 'react';
// import { useNavigate } from 'react-router';
// import { Button } from './ui/button';
// import { Input } from './ui/input';
// import { Label } from './ui/label';
// import { Eye, EyeOff, Lock, Mail } from 'lucide-react';

// export function LoginForm() {
//   const navigate = useNavigate();
//   const [showPassword, setShowPassword] = useState(false);
//   const [email, setEmail] = useState('');
//   const [password, setPassword] = useState('');

//   const handleSubmit = (e: React.FormEvent) => {
//     e.preventDefault();
//     console.log('Login attempt:', { email, password });
//     // Handle login logic here, mock successful login:
//     navigate('/app');
//   };

//   return (
//     <div className="flex w-full max-w-5xl rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.1)] overflow-hidden bg-white/95 backdrop-blur-xl border border-white/60 min-h-[600px]">
      
//       {/* Left side: Graphic / Branding (Optimized for Notebooks) */}
//       <div className="hidden lg:flex lg:w-5/12 relative bg-indigo-900 overflow-hidden">
//         <img 
//           src="https://images.unsplash.com/photo-1762503203730-ca33982518af?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhYnN0cmFjdCUyMGNvbG9yZnVsJTIwbW9kZXJuJTIwZ3JhZGllbnR8ZW58MXx8fHwxNzc0MDIxNDIxfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
//           alt="Abstract Gradient Background"
//           className="absolute inset-0 w-full h-full object-cover mix-blend-overlay opacity-80"
//         />
//         <div className="absolute inset-0 bg-gradient-to-br from-indigo-600/50 via-purple-600/50 to-transparent mix-blend-overlay"></div>
//         <div className="absolute inset-0 bg-gradient-to-t from-indigo-950/90 to-transparent/30"></div>
        
//         <div className="relative z-10 p-10 flex flex-col justify-end text-white h-full">
//           <div className="mb-auto mt-4">
//             <div className="flex items-center gap-3">
//               <div className="w-10 h-10 rounded-xl bg-white shadow-lg flex items-center justify-center">
//                 <span className="text-indigo-900 font-bold text-2xl">M</span>
//               </div>
//               <span className="font-semibold text-2xl tracking-wide">Workspace</span>
//             </div>
//           </div>
//           <h2 className="text-3xl font-bold mb-4 leading-tight">เริ่มต้นจัดการงานของคุณให้เป็นระบบ</h2>
//           <p className="text-indigo-200 text-sm leading-relaxed">
//             เข้าสู่ระบบเพื่อเข้าถึงเครื่องมือจัดการและทำงานร่วมกับทีมของคุณอย่างมีประสิทธิภาพ ในหน้าจอเดียว
//           </p>
//         </div>
//       </div>

//       {/* Right side: Login Form */}
//       <div className="w-full lg:w-7/12 flex items-center justify-center p-8 sm:p-12 lg:p-16 relative">
//         <div className="w-full max-w-md space-y-8">
          
//           {/* Mobile Only Header */}
//           <div className="lg:hidden flex items-center gap-3 justify-center mb-8">
//             <div className="w-10 h-10 rounded-xl bg-indigo-600 shadow-lg flex items-center justify-center">
//               <span className="text-white font-bold text-2xl">M</span>
//             </div>
//             <span className="font-semibold text-2xl tracking-wide text-gray-900">Workspace</span>
//           </div>

//           <div className="text-center lg:text-left space-y-2">
//             <h1 className="text-3xl font-bold tracking-tight text-gray-900">เข้าสู่ระบบ</h1>
//             <p className="text-gray-500">กรุณากรอกข้อมูลเพื่อเข้าสู่บัญชีของคุณ</p>
//           </div>

//           <form onSubmit={handleSubmit} className="space-y-6">
//             <div className="space-y-5">
//               <div className="space-y-2">
//                 <Label htmlFor="email" className="text-gray-700 font-medium">อีเมล</Label>
//                 <div className="relative">
//                   <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 size-5 text-gray-400" />
//                   <Input
//                     id="email"
//                     type="email"
//                     placeholder="your@email.com"
//                     value={email}
//                     onChange={(e) => setEmail(e.target.value)}
//                     className="pl-11 h-12 bg-gray-50 border-gray-200 focus:bg-white focus:ring-2 focus:ring-indigo-500 transition-all rounded-xl text-base"
//                     required
//                   />
//                 </div>
//               </div>
              
//               <div className="space-y-2">
//                 <Label htmlFor="password" className="text-gray-700 font-medium">รหัสผ่าน</Label>
//                 <div className="relative">
//                   <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 size-5 text-gray-400" />
//                   <Input
//                     id="password"
//                     type={showPassword ? 'text' : 'password'}
//                     placeholder="••••••••"
//                     value={password}
//                     onChange={(e) => setPassword(e.target.value)}
//                     className="pl-11 pr-11 h-12 bg-gray-50 border-gray-200 focus:bg-white focus:ring-2 focus:ring-indigo-500 transition-all rounded-xl text-base"
//                     required
//                   />
//                   <button
//                     type="button"
//                     onClick={() => setShowPassword(!showPassword)}
//                     className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-indigo-600 transition-colors"
//                   >
//                     {showPassword ? (
//                       <EyeOff className="size-5" />
//                     ) : (
//                       <Eye className="size-5" />
//                     )}
//                   </button>
//                 </div>
//               </div>
//             </div>

//             <div className="flex items-center justify-between">
//               <label className="flex items-center gap-2 cursor-pointer group">
//                 <input
//                   type="checkbox"
//                   className="w-4.5 h-4.5 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 transition-colors cursor-pointer"
//                 />
//                 <span className="text-sm text-gray-600 group-hover:text-gray-900 transition-colors">จดจำฉันไว้ในระบบ</span>
//               </label>
//               <a href="#" className="text-sm font-medium text-indigo-600 hover:text-indigo-500 hover:underline transition-colors">
//                 ลืมรหัสผ่าน?
//               </a>
//             </div>

//             <Button type="submit" className="w-full h-12 text-base font-medium bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-lg shadow-indigo-600/20 transition-all active:scale-[0.98]">
//               เข้าสู่ระบบ
//             </Button>
//           </form>
//         </div>
//       </div>
//     </div>
//   );
// }


import React, { useState } from 'react';
import { 
  Mail, 
  Lock, 
  Loader2, 
  ArrowRight, 
  ShieldCheck, 
  AlertCircle 
} from 'lucide-react';

// --- นำเข้า UI Widgets เบื้องต้น (อิงจากโครงสร้างเดิม) ---
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';

export default function LoginFormWidget({ onLoginSuccess }) {
  const [credentials, setCredentials] = useState({
    email: '',
    password: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // ฟังก์ชันจัดการการเปลี่ยนแปลงข้อมูลในช่องกรอก
  const handleChange = (e) => {
    const { name, value } = e.target;
    setCredentials(prev => ({
      ...prev,
      [name]: value
    }));
    // ลบข้อความ Error ทิ้งเมื่อผู้ใช้เริ่มพิมพ์ใหม่
    if (errorMessage) setErrorMessage('');
  };

  // ฟังก์ชันจัดการการ Submit ฟอร์ม
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate เบื้องต้น
    if (!credentials.email || !credentials.password) {
      setErrorMessage('กรุณากรอกอีเมลและรหัสผ่านให้ครบถ้วน');
      return;
    }

    setIsLoading(true);
    setErrorMessage('');

    try {
      // TODO: แทนที่ส่วนนี้ด้วยการเรียก API จริงของคุณ
      // ตัวอย่าง: const response = await fetch('/auth/login', { ... })
      
      // จำลองการรอ API (Delay 1.5 วินาที)
      await new Promise(resolve => setTimeout(resolve, 1500));

      // จำลองเงื่อนไขการตรวจสอบ (สามารถลบออกและใช้ response.ok แทนได้)
      if (credentials.email === 'admin@gosoft.co.th' && credentials.password === 'password') {
        const mockUserData = {
          user_id: 'USR-001',
          name: 'System Administrator',
          email: credentials.email,
          role: 'admin',
          username: 'AdminGo'
        };
        
        // บันทึก Token (จำลอง) และเรียก Callback เพื่อเปลี่ยนหน้า
        localStorage.setItem('access_token', 'mock_token_12345');
        localStorage.setItem('role', mockUserData.role);
        
        if (onLoginSuccess) {
          onLoginSuccess(mockUserData);
        }
      } else {
        throw new Error('อีเมลหรือรหัสผ่านไม่ถูกต้อง');
      }

    } catch (error) {
      setErrorMessage(error.message || 'เกิดข้อผิดพลาดในการเข้าสู่ระบบ');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-slate-50 dark:bg-slate-950 p-6 relative overflow-hidden font-sans">
      
      {/* Background Decorations */}
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-blue-500/20 rounded-full blur-3xl" />
      <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl" />

      {/* Login Card Widget */}
      <div className="w-full max-w-md bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-white/20 dark:border-slate-800 rounded-[2.5rem] shadow-2xl overflow-hidden relative z-10">
        
        {/* Header Section */}
        <div className="p-10 pb-6 text-center">
          <div className="mx-auto size-16 bg-gradient-to-tr from-blue-600 to-indigo-700 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-blue-500/30 mb-6">
            <ShieldCheck size={32} />
          </div>
          <h2 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white mb-2">
            Welcome Back
          </h2>
          <p className="text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">
            Promotion System v3.0
          </p>
        </div>

        {/* Form Section */}
        <div className="p-10 pt-0">
          <form onSubmit={handleSubmit} className="space-y-5">
            
            {/* Error Message Display */}
            {errorMessage && (
              <div className="flex items-center gap-3 p-4 rounded-2xl bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 border border-red-100 dark:border-red-500/20 animate-in fade-in slide-in-from-top-2">
                <AlertCircle size={18} className="flex-shrink-0" />
                <p className="text-sm font-bold">{errorMessage}</p>
              </div>
            )}

            {/* Email Input Widget */}
            <div className="space-y-2">
              <Label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">
                Corporate Email
              </Label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                  <Mail size={18} />
                </div>
                <Input 
                  type="email" 
                  name="email"
                  value={credentials.email}
                  onChange={handleChange}
                  placeholder="name@gosoft.co.th"
                  disabled={isLoading}
                  className="h-14 pl-12 pr-6 bg-slate-100 dark:bg-slate-800/50 border-none rounded-2xl font-black text-slate-700 dark:text-white outline-none focus-visible:ring-4 ring-blue-500/20 transition-all text-base w-full disabled:opacity-50"
                />
              </div>
            </div>

            {/* Password Input Widget */}
            <div className="space-y-2 pb-2">
              <div className="flex justify-between items-center ml-1">
                <Label className="text-[11px] font-black text-slate-400 uppercase tracking-widest">
                  Secure Password
                </Label>
                {/* สามารถเพิ่ม Component ลืมรหัสผ่านตรงนี้ได้ในอนาคต */}
                <a href="#" className="text-[11px] font-black text-blue-600 dark:text-blue-400 hover:underline">
                  Forgot?
                </a>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                  <Lock size={18} />
                </div>
                <Input 
                  type="password" 
                  name="password"
                  value={credentials.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  disabled={isLoading}
                  className="h-14 pl-12 pr-6 bg-slate-100 dark:bg-slate-800/50 border-none rounded-2xl font-black text-slate-700 dark:text-white outline-none focus-visible:ring-4 ring-blue-500/20 transition-all text-base w-full disabled:opacity-50"
                />
              </div>
            </div>

            {/* Submit Button Widget */}
            <Button 
              type="submit" 
              disabled={isLoading}
              className="w-full h-14 mt-4 bg-gradient-to-r from-blue-600 to-indigo-700 font-black text-white rounded-2xl shadow-xl shadow-blue-600/30 hover:shadow-2xl hover:shadow-blue-600/40 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 tracking-widest text-sm disabled:opacity-70 disabled:hover:scale-100 disabled:cursor-not-allowed group"
            >
              {isLoading ? (
                <>
                  <Loader2 size={20} className="animate-spin" />
                  AUTHENTICATING...
                </>
              ) : (
                <>
                  SIGN IN TO SYSTEM 
                  <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </Button>
            
          </form>
        </div>
      </div>
    </div>
  );
}