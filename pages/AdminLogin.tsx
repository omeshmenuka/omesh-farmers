
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, ArrowLeft, Lock } from 'lucide-react';
import { useFarmers } from '../context/FarmerContext';

const AdminLogin: React.FC = () => {
  const navigate = useNavigate();
  const { loginAdmin, isAdminLoggedIn } = useFarmers();
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  // Auto-redirect if already logged in
  useEffect(() => {
    if (isAdminLoggedIn) {
      navigate('/admin/dashboard', { replace: true });
    }
  }, [isAdminLoggedIn, navigate]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (loginAdmin(password)) {
      navigate('/admin/dashboard', { replace: true });
    } else {
      setError('Access Denied: Invalid Credentials');
    }
  };

  return (
    <div className="min-h-screen bg-stone-900 flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
         <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-green-500 rounded-full blur-[100px]"></div>
         <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-500 rounded-full blur-[100px]"></div>
      </div>

      <div className="bg-white/5 backdrop-blur-lg border border-white/10 w-full max-w-md p-8 rounded-3xl shadow-2xl relative z-10 animate-in fade-in zoom-in duration-300">
        <button 
          onClick={() => navigate('/')} 
          className="absolute top-4 right-4 text-stone-400 hover:text-white transition-colors"
          title="Return to Main App"
        >
          <ArrowLeft size={20} />
        </button>

        <div className="flex flex-col items-center mb-8">
          <div className="bg-gradient-to-br from-green-500 to-emerald-700 p-4 rounded-2xl shadow-lg mb-4">
            <ShieldCheck size={40} className="text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white font-serif tracking-wide">Admin Portal</h1>
          <p className="text-stone-400 text-sm mt-1">Riga Harvest Management System</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-200 text-sm p-3 rounded-lg text-center flex items-center justify-center gap-2 animate-in slide-in-from-top-2">
              <Lock size={14} /> {error}
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-stone-400 uppercase tracking-wider mb-2">Access Key</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3.5 rounded-xl bg-stone-800/50 border border-stone-700 text-white placeholder-stone-600 focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all text-center tracking-widest"
              placeholder="••••••••"
              autoFocus
            />
          </div>

          <button
            type="submit"
            className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white font-bold py-4 rounded-xl shadow-lg shadow-green-900/20 transition-all active:scale-[0.98]"
          >
            Authenticate
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-white/5 text-center">
           <p className="text-stone-500 text-xs">Restricted access for authorized personnel only.</p>
           <p className="text-stone-600 text-[10px] mt-1">System Version 2.4.0</p>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
