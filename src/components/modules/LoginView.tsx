import React, { useState } from 'react';
import { 
  Building, 
  Lock, 
  Mail, 
  Eye, 
  EyeOff, 
  ArrowRight, 
  ShieldCheck, 
  AlertTriangle,
  Check
} from 'lucide-react';
import { authService, AuthUser } from '../../services/auth';

interface LoginViewProps {
  onLoginSuccess: (user: AuthUser) => void;
  showToast?: (message: string) => void;
}

export const LoginView: React.FC<LoginViewProps> = ({ onLoginSuccess, showToast }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    setTimeout(() => {
      const res = authService.login(username, password);
      setLoading(false);

      if (res.success && res.user) {
        if (showToast) {
          showToast(`Welcome back, ${res.user.name}!`);
        }
        onLoginSuccess(res.user);
      } else {
        setError(res.error || 'Authentication failed. Please check your credentials.');
      }
    }, 400); // realistic slight network delay
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col justify-center items-center p-4 font-sans relative">
      {/* Windows ERP Main Dialog Frame */}
      <div className="w-full max-w-md bg-slate-800 border-2 border-slate-700 rounded shadow-2xl overflow-hidden select-none">
        {/* Title Bar */}
        <div className="bg-slate-950 px-4 py-2.5 border-b border-slate-700 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded bg-indigo-600 flex items-center justify-center text-white font-bold text-[10px]">
              <Building className="w-3 h-3 text-white" />
            </div>
            <span className="font-extrabold text-xs text-white uppercase tracking-wider">
              SR TECH GARMENT SOFTWARE - SIGN IN
            </span>
          </div>
          <span className="text-[10px] text-slate-400 font-mono bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
            v3.4.0
          </span>
        </div>

        {/* Dialog Body */}
        <div className="p-6 space-y-5 bg-slate-900/90">
          <div className="border-b border-slate-800 pb-3">
            <h2 className="text-base font-bold text-white tracking-tight">System Authentication</h2>
            <p className="text-xs text-slate-400">Garment Manufacturing & Operations ERP Suite</p>
          </div>

          {/* Error Message Alert */}
          {error && (
            <div className="p-2.5 bg-rose-950/80 border border-rose-800 rounded text-rose-300 text-xs font-semibold flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
              <div>{error}</div>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email / Username Field */}
            <div className="space-y-1">
              <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wide">
                User ID / Email Address
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="admin@srtech.com"
                  className="w-full h-9 pl-9 pr-3 text-xs bg-slate-950 border border-slate-700 rounded text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 font-mono"
                />
                <Mail className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-1">
              <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wide">
                Security Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full h-9 pl-9 pr-9 text-xs bg-slate-950 border border-slate-700 rounded text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 font-mono"
                />
                <Lock className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 p-0.5 focus:outline-none cursor-pointer"
                  title={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            {/* Remember Me */}
            <div className="flex items-center justify-between text-xs pt-1">
              <label className="flex items-center gap-2 cursor-pointer select-none text-slate-400 hover:text-slate-200">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-3.5 h-3.5 rounded bg-slate-950 border-slate-700 text-indigo-600 focus:ring-0 cursor-pointer"
                />
                <span className="text-[11px]">Keep session active on this workstation</span>
              </label>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full h-9 bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 disabled:opacity-60 text-white font-bold text-xs rounded transition-colors shadow flex items-center justify-center gap-2 cursor-pointer mt-3 uppercase tracking-wider"
            >
              {loading ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Verifying Credentials...</span>
                </>
              ) : (
                <>
                  <span>Sign In to Garment ERP</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </form>
        </div>

        {/* Footer info */}
        <div className="bg-slate-950 px-4 py-2 text-center text-slate-500 text-[10px] border-t border-slate-800 font-mono">
          <span>SR TECH GARMENT SOFTWARE • LOCAL DATABASE AUTHORIZED ACCESS ONLY</span>
        </div>
      </div>
    </div>
  );
};
