import React, { useState } from 'react';
import { authService } from '../../services/authService';
import { Lock, ArrowLeft, ShieldAlert, KeyRound, User, Eye, EyeOff } from 'lucide-react';

interface AdminLoginProps {
  onLoginSuccess: () => void;
  onNavigateHome: () => void;
}

export const AdminLogin: React.FC<AdminLoginProps> = ({ onLoginSuccess, onNavigateHome }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!username.trim() || !password) {
      setError('Please provide both username and password.');
      return;
    }

    setIsLoading(true);

    setTimeout(() => {
      const res = authService.login(username, password);
      setIsLoading(false);

      if (res.success) {
        onLoginSuccess();
      } else {
        setError(res.error || 'Authentication failed. Please check credentials.');
      }
    }, 250);
  };

  return (
    <div className="min-h-screen bg-[#0d0907] text-white flex flex-col items-center justify-center p-4 sm:p-6 relative overflow-hidden selection:bg-amber-500/30 selection:text-amber-200">
      {/* Background ambient lighting */}
      <div
        className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-gradient-to-tr from-sky-500/[0.05] via-amber-500/[0.04] to-transparent rounded-full blur-[140px] pointer-events-none"
        aria-hidden="true"
      />

      <div className="w-full max-w-md space-y-8 relative z-10">
        {/* Back Link */}
        <div>
          <button
            type="button"
            onClick={onNavigateHome}
            className="inline-flex items-center gap-2 text-xs font-mono text-stone-400 hover:text-white transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 rounded-md py-1 px-2"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Return to Portfolio</span>
          </button>
        </div>

        {/* Login Card */}
        <div className="p-8 sm:p-10 rounded-2xl bg-[#140e0b]/90 border border-white/[0.08] shadow-2xl shadow-black/90 space-y-6 animate-in fade-in zoom-in-95 duration-200">
          {/* Header */}
          <div className="text-center space-y-3">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-amber-400/15 border border-amber-400/30 flex items-center justify-center text-amber-300 shadow-lg shadow-amber-400/10">
              <Lock className="w-7 h-7" />
            </div>

            <div className="space-y-1">
              <div className="flex items-center justify-center gap-1.5 text-xs font-bold tracking-tight text-white">
                <span>Sameer</span>
                <span className="text-sky-400">Dev</span>
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-amber-400" />
                <span className="text-stone-400 font-mono font-normal ml-1">Admin</span>
              </div>
              <h1 className="text-2xl font-extrabold tracking-tight text-white">
                Admin Panel Login
              </h1>
              <p className="text-xs text-stone-400">
                Sign in to add products, upload pictures, and manage portfolio items
              </p>
            </div>
          </div>

          {/* Error Banner */}
          {error && (
            <div
              className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-start gap-2.5 animate-in fade-in"
              role="alert"
            >
              <ShieldAlert className="w-4 h-4 shrink-0 text-rose-400 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label
                htmlFor="admin-username"
                className="block text-xs font-semibold text-stone-300 uppercase tracking-wider"
              >
                Username
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-stone-500">
                  <User className="w-4 h-4" />
                </div>
                <input
                  id="admin-username"
                  type="text"
                  autoComplete="username"
                  value={username}
                  onChange={(e) => {
                    setUsername(e.target.value);
                    if (error) setError(null);
                  }}
                  placeholder="Enter username"
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-[#0d0907] border border-white/[0.1] text-sm text-white placeholder-stone-600 focus:outline-none focus:border-sky-400 focus:ring-1 focus:ring-sky-400/40 transition-all"
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label
                htmlFor="admin-password"
                className="block text-xs font-semibold text-stone-300 uppercase tracking-wider"
              >
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-stone-500">
                  <KeyRound className="w-4 h-4" />
                </div>
                <input
                  id="admin-password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (error) setError(null);
                  }}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-11 py-3 rounded-xl bg-[#0d0907] border border-white/[0.1] text-sm text-white placeholder-stone-600 focus:outline-none focus:border-sky-400 focus:ring-1 focus:ring-sky-400/40 transition-all"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-stone-400 hover:text-white transition-colors"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full inline-flex items-center justify-center gap-2 px-5 py-3.5 text-sm font-bold text-stone-950 bg-amber-400 hover:bg-amber-300 rounded-xl btn-micro-fx shadow-lg shadow-amber-400/25 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-300 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <span className="w-4 h-4 border-2 border-stone-950 border-t-transparent rounded-full animate-spin" />
                  <span>Signing In...</span>
                </>
              ) : (
                <>
                  <Lock className="w-4 h-4" />
                  <span>Sign In to Admin Panel</span>
                </>
              )}
            </button>
          </form>

          <div className="pt-4 border-t border-white/[0.06] text-[11px] text-stone-400 text-center leading-relaxed font-mono">
            Backed by Firebase Firestore cloud database.
          </div>
        </div>
      </div>
    </div>
  );
};
