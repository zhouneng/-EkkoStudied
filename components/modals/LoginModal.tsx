/**
 * 文件名: LoginModal.tsx
 * 功能: 登录弹窗组件。
 * 核心逻辑:
 * 1. 使用 Neon Database 进行用户身份验证。
 * 2. 处理登录状态（加载中、成功、失败）。
 * 3. 登录成功后显示过渡动画并跳转。
 */

import React, { useState, useEffect } from 'react';
import { Icons } from '../common/Icons';
import { neon, neonConfig } from '@neondatabase/serverless';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: () => void;
}

// Neon DB Connection
const databaseUrl = "postgresql://neondb_owner:npg_MxKYSnXD2b8F@ep-fancy-frog-ahrdh5bh.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require";

// Suppress the warning about running SQL from the browser
neonConfig.disableWarningInBrowsers = true;

export const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onClose, onLoginSuccess }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState('');
  const [dbStatus, setDbStatus] = useState<'idle' | 'checking' | 'connected' | 'offline'>('idle');

  // 初始化检查 (静默模式)
  useEffect(() => {
    if (isOpen) {
        const init = async () => {
            setDbStatus('checking');
            try {
                const sql = neon(databaseUrl);
                // 仅做简单的连接存活测试，不打印日志
                await sql`SELECT 1`;
                setDbStatus('connected');
            } catch (e) {
                // 连接失败静默处理，仅更新 UI 状态小圆点
                setDbStatus('offline');
            }
        };
        init();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    const cleanUsername = username.trim();
    const cleanPassword = password.trim();

    if (!cleanUsername || !cleanPassword) {
      setError("请输入用户名和密码");
      return;
    }

    setIsLoading(true);

    try {
        const sql = neon(databaseUrl);
        
        // 1. 查询用户 (静默查询)
        let users;
        try {
            users = await sql`
                SELECT * FROM "User" 
                WHERE LOWER(TRIM(username)) = LOWER(${cleanUsername})
            `;
        } catch (dbErr: any) {
            throw new Error("数据库连接异常");
        }
        
        // 2. 验证用户是否存在 (不提示数据库中实际有哪些用户，防止泄露)
        if (!users || users.length === 0) {
            throw new Error("账户不存在或用户名错误");
        }

        const user = users[0];

        // 3. 验证密码
        if (String(user.password).trim() !== cleanPassword) {
            throw new Error("密码错误");
        }
        
        // 4. 登录成功
        localStorage.setItem('unimage_user', user.username);
        localStorage.setItem('unimage_role', user.role || 'user');
        
        setDbStatus('connected');
        setIsSuccess(true); // 触发成功动画状态
        
        // 延迟跳转，展示过渡动画
        setTimeout(() => {
            onLoginSuccess();
        }, 2000); // 稍微延长一点时间展示动画

    } catch (err: any) {
        // 不打印具体错误堆栈到控制台
        setDbStatus('offline');
        
        let msg = err.message || '登录失败';
        // 模糊化网络错误
        if (msg.includes('fetch') || msg.includes('network') || msg.includes('Connection')) {
             msg = '无法连接到数据库，请检查网络';
        }
        setError(msg);
        setIsLoading(false); // 只有出错时才取消loading，成功时保持loading状态直到切换
    }
  };

  // 成功过渡动画视图 - Enriched Design
  if (isSuccess) {
      return (
        <div className="fixed inset-0 z-[200] bg-[#000000] flex flex-col items-center justify-center animate-in fade-in duration-500">
            {/* Background Atmosphere */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                 <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-orange-500/5 rounded-full blur-[100px] animate-pulse" />
                 <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-orange-900/10 to-transparent" />
            </div>

            <div className="relative z-10 flex flex-col items-center gap-8 animate-in zoom-in-95 slide-in-from-bottom-4 duration-700">
                {/* Animated Identity Verification Ring */}
                <div className="relative">
                    {/* Outer Glow */}
                    <div className="absolute inset-0 bg-emerald-500/20 rounded-full blur-2xl animate-pulse" />
                    
                    {/* SVG Circle Progress */}
                    <div className="relative w-24 h-24">
                        <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                            {/* Track */}
                            <circle 
                                className="text-stone-800 stroke-current" 
                                strokeWidth="3" 
                                cx="50" cy="50" r="46" 
                                fill="none" 
                            />
                            {/* Progress */}
                            <circle 
                                className="text-emerald-500 stroke-current" 
                                strokeWidth="3" 
                                strokeLinecap="round"
                                cx="50" cy="50" r="46" 
                                fill="none" 
                                strokeDasharray="289" // 2 * pi * 46
                                strokeDashoffset="289"
                            >
                                <animate attributeName="stroke-dashoffset" from="289" to="0" dur="1.2s" fill="freeze" calcMode="spline" keySplines="0.4 0 0.2 1" keyTimes="0;1" />
                            </circle>
                        </svg>
                        
                        {/* Center Icon */}
                        <div className="absolute inset-0 flex items-center justify-center">
                            <div className="w-20 h-20 bg-[#0A0A0A] rounded-full flex items-center justify-center border border-stone-800 shadow-2xl">
                                <Icons.ShieldCheck className="w-8 h-8 text-emerald-500 animate-in zoom-in duration-500 delay-300" strokeWidth={2} />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="text-center space-y-3">
                    <h2 className="text-4xl font-serif font-bold text-transparent bg-clip-text bg-gradient-to-b from-white to-stone-500 tracking-tight animate-in slide-in-from-bottom-2 fade-in duration-700 delay-200">
                        Welcome Back
                    </h2>
                    
                    <div className="flex flex-col items-center gap-2 animate-in fade-in duration-700 delay-500">
                        <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-900/10 border border-emerald-500/20 text-emerald-500 text-[10px] font-bold uppercase tracking-widest">
                            <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                            <span>Identity Verified</span>
                        </div>
                        <div className="flex items-center gap-2 text-stone-600 text-xs font-mono mt-2">
                             <Icons.Loader2 size={12} className="animate-spin" />
                             <span>Initializing Visual Engine...</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
      );
  }

  // Changed border-white/10 to border-stone-800 to fix "white line" issue
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-300">
      <div 
        className="w-full max-w-[400px] bg-[#0A0A0A] border border-stone-800 rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 slide-in-from-bottom-8 duration-500"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-8 pb-6 text-center border-b border-stone-800/50 relative">
          <div className="w-12 h-12 bg-orange-500/10 rounded-xl flex items-center justify-center mx-auto mb-4 text-orange-500 border border-orange-500/20">
            <Icons.Lock size={24} />
          </div>
          <h2 className="text-2xl font-serif font-bold text-white mb-2">
            内部系统登录
          </h2>
          <p className="text-stone-500 text-xs">
            Internal Access Only
          </p>
          
          <div className="absolute top-4 right-4 flex items-center gap-1.5 opacity-50">
             <div className={`w-1.5 h-1.5 rounded-full ${dbStatus === 'connected' ? 'bg-emerald-500' : dbStatus === 'offline' ? 'bg-red-500' : 'bg-stone-500'}`} />
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-5">
          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg flex flex-col gap-1 text-red-400 text-xs font-medium animate-in slide-in-from-top-1">
              <div className="flex items-center gap-2">
                 <Icons.AlertCircle size={14} className="flex-shrink-0" />
                 <span className="font-bold">登录失败</span>
              </div>
              <span className="opacity-80 leading-relaxed ml-6">{error}</span>
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-stone-500 uppercase tracking-widest ml-1">Account</label>
            <div className="relative group">
              <Icons.User size={16} className="absolute left-4 top-3.5 text-stone-600 group-focus-within:text-orange-500 transition-colors" />
              <input 
                type="text" 
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                autoComplete="off"
                className="w-full bg-[#111] border border-stone-800 rounded-xl py-3 pl-11 pr-4 text-sm text-white placeholder-stone-700 focus:outline-none focus:border-orange-500/50 focus:ring-1 focus:ring-orange-500/50 transition-all"
                placeholder="Database Username"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-stone-500 uppercase tracking-widest ml-1">Password</label>
            <div className="relative group">
              <Icons.Key size={16} className="absolute left-4 top-3.5 text-stone-600 group-focus-within:text-orange-500 transition-colors" />
              <input 
                type={showPassword ? "text" : "password"} 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-[#111] border border-stone-800 rounded-xl py-3 pl-11 pr-11 text-sm text-white placeholder-stone-700 focus:outline-none focus:border-orange-500/50 focus:ring-1 focus:ring-orange-500/50 transition-all"
                placeholder="Access Key"
              />
              <button 
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-3.5 text-stone-600 hover:text-stone-400 transition-colors"
              >
                {showPassword ? <Icons.EyeOff size={16} /> : <Icons.Eye size={16} />}
              </button>
            </div>
          </div>

          <button 
            type="submit" 
            disabled={isLoading}
            className="w-full py-3.5 font-bold text-sm rounded-xl shadow-lg transition-all active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-4 bg-white text-black hover:bg-stone-200"
          >
            {isLoading ? (
              <>
                <Icons.Loader2 size={16} className="animate-spin" />
                验证权限中...
              </>
            ) : (
              <>
                进入引擎
                <Icons.ArrowRight size={16} />
              </>
            )}
          </button>
          
          <div className="text-center pt-2">
             <button 
                type="button" 
                onClick={onClose} 
                className="text-xs text-stone-600 hover:text-stone-400 transition-colors"
             >
                取消登录
             </button>
          </div>
        </form>
      </div>
    </div>
  );
};