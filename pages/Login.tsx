
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sprout, Lock, User } from 'lucide-react';
import { useFarmers } from '../context/FarmerContext';

const Login: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useFarmers();
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

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="bg-white w-full max-w-md p-8 rounded-2xl shadow-xl border border-stone-100">
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
