
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, ArrowLeft, Lock, Eye, EyeOff, AlertCircle } from 'lucide-react';
import { useFarmers } from '../context/FarmerContext';

const AdminLogin: React.FC = () => {
  const navigate = useNavigate();
  const { loginAdmin, isAdminLoggedIn } = useFarmers();
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Auto-redirect if already logged in
  useEffect(() => {
    if (isAdminLoggedIn) {
      navigate('/admin/dashboard', { replace: true });
    }
  }, [isAdminLoggedIn, navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    // Artificial delay for "security check" feel
    setTimeout(() => {
      if (loginAdmin(password)) {
        navigate('/admin/dashboard', { replace: true });
      } else {
        setError('Access Denied: Invalid Administrative Credentials');
        setIsLoading(false);
      }
    }, 800);
  };

  return (
    <div className="min-h-screen bg-[#0c0c0c] flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Dynamic Background decoration */}
      <div className="absolute top-0 left-0 w-full h-full opacity-20 pointer-events-none">
         <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-emerald-900 rounded-full blur-[120px] animate-pulse"></div>
         <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-green-900 rounded-full blur-[120px]"></div>
      </div>

      <div className="w-full max-w-md relative z-10">
        {/* Back Button */}
        <button 
          onClick={() => navigate('/')} 
          className="flex items-center gap-2 text-stone-500 hover:text-white transition-colors mb-8 group"
        >
          <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
          <span className="text-sm font-medium">Return to marketplace</span>
        </button>

        <div className="bg-white/5 backdrop-blur-2xl border border-white/10 p-8 rounded-[2rem] shadow-2xl overflow-hidden relative">
          {/* Subtle top highlight */}
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
          
          <div className="flex flex-col items-center mb-10">
            <div className="relative">
              <div className="absolute inset-0 bg-green-500 blur-2xl opacity-20 animate-pulse"></div>
              <div className="bg-gradient-to-br from-green-400 to-emerald-600 p-4 rounded-2xl shadow-xl mb-4 relative z-10 border border-white/20">
                <ShieldCheck size={40} className="text-white" />
              </div>
            </div>
            <h1 className="text-3xl font-bold text-white font-serif tracking-tight">Admin Portal</h1>
            <p className="text-stone-400 text-sm mt-2 text-center">Secure Management System v2.4</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            {error && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-xs p-3 rounded-xl flex items-center gap-2 animate-in slide-in-from-top-2">
                <AlertCircle size={16} />
                <span>{error}</span>
              </div>
            )}

            <div className="space-y-2">
              <label className="block text-[10px] font-bold text-stone-500 uppercase tracking-[0.2em] ml-1">Administrative Key</label>
              <div className="relative group">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-500 group-focus-within:text-green-500 transition-colors">
                  <Lock size={18} />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-12 pr-12 py-4 rounded-xl bg-white/5 border border-white/10 text-white placeholder-stone-700 focus:ring-2 focus:ring-green-500/50 focus:border-green-500/50 outline-none transition-all tracking-widest text-sm"
                  placeholder="ENTER ACCESS KEY"
                  autoFocus
                  disabled={isLoading}
                />
                <button 
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-stone-500 hover:text-white transition-colors"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading || !password}
              className="w-full relative group overflow-hidden bg-green-600 hover:bg-green-500 text-white font-bold py-4 rounded-xl shadow-lg shadow-green-900/40 transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]"></div>
              <span className="relative flex items-center justify-center gap-2">
                {isLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    Authenticating...
                  </>
                ) : (
                  'Verify Identity'
                )}
              </span>
            </button>
          </form>

          <div className="mt-10 pt-6 border-t border-white/5 text-center flex flex-col gap-2">
             <div className="flex items-center justify-center gap-1.5">
               <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse"></div>
               <p className="text-stone-500 text-[10px] uppercase font-bold tracking-widest">Restricted Access Area</p>
             </div>
             <p className="text-stone-600 text-[10px]">Unauthorized attempts are logged and monitored.</p>
          </div>
        </div>
        
        <p className="mt-6 text-center text-stone-700 text-[10px] font-medium tracking-widest uppercase">
          Riga Harvest Agriculture Network
        </p>
      </div>

      <style>{`
        @keyframes shimmer {
          100% { transform: translateX(100%); }
        }
      `}</style>
    </div>
  );
};

export default AdminLogin;
