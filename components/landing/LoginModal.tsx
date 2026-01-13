
import React, { useState } from 'react';
import { Icons } from '../Icons';
import { VALID_USERS, USERNAMES } from './users';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: () => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onClose, onLoginSuccess }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);

  if (!isOpen) return null;

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    // Simulate network delay
    setTimeout(() => {
      // Validate against preset users
      if (VALID_USERS[username] && VALID_USERS[username] === password) {
        onLoginSuccess();
      } else {
        setError('用户名或密码错误，请联系开发人员EKKO');
        setIsLoading(false);
      }
    }, 1500);
  };

  const filteredUsers = USERNAMES.filter(u => 
    u.toLowerCase().includes(username.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="w-full max-w-lg bg-[#0A0A0A] border border-white/10 rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header - Padding increased to p-10 */}
        <div className="p-10 pb-8 text-center border-b border-white/5">
          <div className="w-14 h-14 bg-orange-500/10 rounded-2xl flex items-center justify-center mx-auto mb-5 text-orange-500 border border-orange-500/20">
            <Icons.Key size={28} />
          </div>
          <h2 className="text-3xl font-serif font-bold text-white mb-2">欢迎回来</h2>
          <p className="text-stone-400 text-base">请验证身份以访问引擎</p>
        </div>

        {/* Form - Padding increased to p-10 */}
        <form onSubmit={handleLogin} className="p-10 space-y-6">
          {error && (
            <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-3 text-red-400 text-sm font-medium animate-in slide-in-from-top-2">
              <Icons.AlertCircle size={16} />
              {error}
            </div>
          )}

          <div className="space-y-2">
            <label className="text-xs font-bold text-stone-500 uppercase tracking-widest ml-1">用户名</label>
            <div className="relative group">
              <Icons.User size={18} className="absolute left-4 top-4 text-stone-500 group-focus-within:text-orange-500 transition-colors" />
              <input 
                type="text" 
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                onFocus={() => setShowSuggestions(true)}
                onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                autoComplete="off"
                className="w-full bg-[#111] border border-white/10 rounded-xl py-3.5 pl-12 pr-4 text-base text-white placeholder-stone-600 focus:outline-none focus:border-orange-500/50 focus:ring-1 focus:ring-orange-500/50 transition-all"
                placeholder="请输入用户名"
              />
              
              {/* Custom Dropdown */}
              {showSuggestions && filteredUsers.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-[#111] border border-white/10 rounded-xl overflow-hidden z-50 shadow-xl max-h-56 overflow-y-auto custom-scrollbar animate-in fade-in slide-in-from-top-1 duration-200">
                  {filteredUsers.map(user => (
                    <div
                      key={user}
                      onClick={() => {
                        setUsername(user);
                        setShowSuggestions(false);
                      }}
                      className="p-3.5 text-base text-stone-400 hover:text-white hover:bg-white/5 cursor-pointer transition-colors flex items-center gap-3"
                    >
                      <Icons.User size={16} className="opacity-50" />
                      {user}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-stone-500 uppercase tracking-widest ml-1">密码</label>
            <div className="relative group">
              <Icons.Lock size={18} className="absolute left-4 top-4 text-stone-500 group-focus-within:text-orange-500 transition-colors" />
              <input 
                type={showPassword ? "text" : "password"} 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-[#111] border border-white/10 rounded-xl py-3.5 pl-12 pr-12 text-base text-white placeholder-stone-600 focus:outline-none focus:border-orange-500/50 focus:ring-1 focus:ring-orange-500/50 transition-all"
                placeholder="请输入密码"
              />
              <button 
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-4 text-stone-500 hover:text-stone-300 transition-colors"
              >
                {showPassword ? <Icons.EyeOff size={18} /> : <Icons.Eye size={18} />}
              </button>
            </div>
          </div>

          <button 
            type="submit" 
            disabled={isLoading}
            className="w-full py-4 bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white font-bold text-base rounded-xl shadow-lg shadow-orange-900/20 transition-all active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-6"
          >
            {isLoading ? (
              <>
                <Icons.Loader2 size={20} className="animate-spin" />
                验证中...
              </>
            ) : (
              <>
                立即登录 <Icons.ArrowRight size={20} />
              </>
            )}
          </button>
          
          <div className="text-center mt-6">
             <button type="button" onClick={onClose} className="text-sm text-stone-500 hover:text-stone-300 transition-colors">
                取消
             </button>
          </div>
        </form>
      </div>
    </div>
  );
};
