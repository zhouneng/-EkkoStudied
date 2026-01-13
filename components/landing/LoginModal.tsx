import React, { useState, useEffect } from 'react';
import { Icons } from '../Icons';
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
        
        setTimeout(() => {
            onLoginSuccess();
        }, 500);

    } catch (err: any) {
        // 不打印具体错误堆栈到控制台
        setDbStatus('offline');
        
        let msg = err.message || '登录失败';
        // 模糊化网络错误
        if (msg.includes('fetch') || msg.includes('network') || msg.includes('Connection')) {
             msg = '无法连接到数据库，请检查网络';
        }
        setError(msg);
    } finally {
        setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        className="w-full max-w-[400px] bg-[#0A0A0A] border border-white/10 rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-8 pb-6 text-center border-b border-white/5 relative">
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
                className="w-full bg-[#111] border border-white/10 rounded-xl py-3 pl-11 pr-4 text-sm text-white placeholder-stone-700 focus:outline-none focus:border-orange-500/50 focus:ring-1 focus:ring-orange-500/50 transition-all"
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
                className="w-full bg-[#111] border border-white/10 rounded-xl py-3 pl-11 pr-11 text-sm text-white placeholder-stone-700 focus:outline-none focus:border-orange-500/50 focus:ring-1 focus:ring-orange-500/50 transition-all"
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