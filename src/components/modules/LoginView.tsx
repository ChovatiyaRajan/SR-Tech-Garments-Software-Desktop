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
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-center items-center p-4 sm:p-6 font-sans relative overflow-hidden">
      {/* Background Subtle Gradient Blobs */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 sm:w-[500px] h-96 sm:h-[500px] bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-80 h-80 bg-emerald-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* Main Container */}
      <div className="w-full max-w-md relative z-10 space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-xl bg-gradient-to-br from-indigo-500 via-indigo-600 to-slate-900 border border-indigo-400/30 text-white shadow-xl mb-1">
            <Building className="w-7 h-7 text-indigo-100" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
            SR TECH GARMENT SOFTWARE
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 font-medium">
            Garment Manufacturing & Operations Suite
          </p>
        </div>

        {/* Login Card */}
        <div className="bg-slate-900/90 backdrop-blur-md border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-2xl space-y-6">
          <div className="flex items-center justify-between border-b border-slate-800/80 pb-4">
            <div>
              <h2 className="text-lg font-bold text-white">Sign In to Workspace</h2>
              <p className="text-xs text-slate-400">Enter your credentials to access workspace portal</p>
            </div>
            <span className="px-2.5 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-[10px] font-bold tracking-wider uppercase flex items-center gap-1">
              <ShieldCheck className="w-3 h-3" />
              Secure Auth
            </span>
          </div>

          {/* Error Message Alert */}
          {error && (
            <div className="p-3 bg-rose-950/50 border border-rose-800/80 rounded-xl text-rose-300 text-xs font-semibold flex items-start gap-2.5">
              <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <div className="leading-relaxed">{error}</div>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email / Username Field */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-300">
                Email Address or Username
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="name@textileerp.com"
                  className="w-full h-11 pl-10 pr-3 text-sm bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all font-mono"
                />
                <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <label className="block text-xs font-semibold text-slate-300">
                  Password
                </label>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full h-11 pl-10 pr-10 text-sm bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all font-mono"
                />
                <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 p-1 focus:outline-none cursor-pointer"
                  title={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Options */}
            <div className="flex items-center justify-between text-xs pt-1">
              <label className="flex items-center gap-2 cursor-pointer select-none text-slate-400 hover:text-slate-200">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded bg-slate-950 border-slate-800 text-indigo-600 focus:ring-0 focus:ring-offset-0 cursor-pointer"
                />
                Remember login on this browser
              </label>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full h-11 bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 disabled:opacity-60 text-white font-bold text-sm rounded-xl transition-all shadow-lg shadow-indigo-600/20 flex items-center justify-center gap-2 cursor-pointer mt-2"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Authenticating...</span>
                </>
              ) : (
                <>
                  <span>Sign In to Dashboard</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        </div>

        {/* Footer info */}
        <div className="text-center space-y-1 text-slate-500 text-xs">
          <p>© 2026 SR Tech Garment Software. All Rights Reserved.</p>
          <div className="flex justify-center gap-3 text-[11px] text-slate-600 font-mono pt-1">
            <span className="flex items-center gap-1">
              <Check className="w-3 h-3 text-emerald-500" /> Enterprise SSL Active
            </span>
            <span>•</span>
            <span>v3.4.0 Production</span>
          </div>
        </div>
      </div>
    </div>
  );
};
