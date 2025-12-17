import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sprout, Lock, User, PlusCircle, Tractor, ArrowLeft } from 'lucide-react';
import { useFarmers } from '../context/FarmerContext';

const Login: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useFarmers();
  const [view, setView] = useState<'select' | 'login'>('select');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const success = login(username, password);
    if (success) {
      navigate('/my-farm');
    } else {
      setError('Invalid username or password');
    }
  };

  if (view === 'select') {
    return (
      <div className="min-h-[80vh] flex items-center justify-center px-4 animate-in fade-in duration-500">
        <div className="w-full max-w-md space-y-6">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-stone-900 font-serif mb-2">Welcome Farmer</h2>
            <p className="text-stone-500">Select an option to continue</p>
          </div>

          <div className="grid gap-4">
            <button
              onClick={() => setView('login')}
              className="bg-white p-6 rounded-2xl shadow-sm border border-stone-200 hover:border-green-500 hover:shadow-md transition-all group text-left flex items-center gap-4"
            >
              <div className="bg-green-100 p-4 rounded-xl text-green-700 group-hover:bg-green-600 group-hover:text-white transition-colors">
                <Tractor size={28} />
              </div>
              <div>
                <h3 className="font-bold text-stone-800 text-lg">Farmers Log In</h3>
                <p className="text-stone-500 text-sm">Access your dashboard & stock</p>
              </div>
            </button>

            <button
              onClick={() => navigate('/add-farmer')}
              className="bg-white p-6 rounded-2xl shadow-sm border border-stone-200 hover:border-green-500 hover:shadow-md transition-all group text-left flex items-center gap-4"
            >
              <div className="bg-stone-100 p-4 rounded-xl text-stone-600 group-hover:bg-green-600 group-hover:text-white transition-colors">
                <PlusCircle size={28} />
              </div>
              <div>
                <h3 className="font-bold text-stone-800 text-lg">Add New Farmer</h3>
                <p className="text-stone-500 text-sm">Join the marketplace today</p>
              </div>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="bg-white w-full max-w-md p-8 rounded-2xl shadow-xl border border-stone-100 relative animate-in slide-in-from-right-8 duration-300">
        <button 
          onClick={() => setView('select')}
          className="absolute top-8 left-8 text-stone-400 hover:text-stone-700 transition-colors"
        >
          <ArrowLeft size={20} />
        </button>

        <div className="text-center mb-8">
          <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-green-700">
            <Sprout size={32} />
          </div>
          <h2 className="text-2xl font-bold text-stone-900 font-serif">Farmer Login</h2>
          <p className="text-stone-500 mt-2">Manage your farm profile and stock</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg text-center">
              {error}
            </div>
          )}
          
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1">Username</label>
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400" size={18} />
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full pl-11 pr-4 py-3 rounded-xl bg-stone-50 border border-stone-200 focus:ring-2 focus:ring-green-500 outline-none"
                placeholder="Enter your username"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1">Password</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400" size={18} />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-11 pr-4 py-3 rounded-xl bg-stone-50 border border-stone-200 focus:ring-2 focus:ring-green-500 outline-none"
                placeholder="Enter your password"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-green-700 text-white font-bold py-3 rounded-xl hover:bg-green-800 transition-colors shadow-lg active:scale-[0.98]"
          >
            Sign In
          </button>
        </form>

        <div className="mt-6 text-center text-xs text-stone-400">
          <p>Demo Credentials: user "farm1", pass "123"</p>
        </div>
      </div>
    </div>
  );
};

export default Login;