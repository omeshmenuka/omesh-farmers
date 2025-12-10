
import React from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { Sprout, Bell, User, MapPin, Heart, PlusCircle, Tractor, ShieldCheck } from 'lucide-react';
import AIAssistant from './AIAssistant';
import { useFarmers } from '../context/FarmerContext';

const Layout: React.FC = () => {
  const location = useLocation();
  const { farmers, currentUser } = useFarmers();

  const isHome = location.pathname === '/';
  
  // Check if we are in the "Admin App" section
  const isAdminRoute = location.pathname.startsWith('/admin') || location.pathname === '/admin-login';

  // Calculate pending approvals for notifications
  const pendingCount = farmers.filter(f => !f.isApproved).length;

  if (isAdminRoute) {
    return (
      <div className="min-h-screen bg-stone-100 font-sans text-stone-900">
        <Outlet />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-50 font-sans flex flex-col">
      {/* Desktop Navigation */}
      <nav className={`hidden md:block sticky top-0 z-40 transition-all duration-300 ${isHome ? 'bg-white/80 backdrop-blur-md border-b border-stone-200' : 'bg-white shadow-sm'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            {/* Logo */}
            <NavLink to="/" className="flex items-center gap-2">
              <div className="bg-green-700 p-2 rounded-lg text-white">
                <Sprout size={24} />
              </div>
              <span className="font-serif font-bold text-xl text-stone-800 tracking-tight">Riga Harvest</span>
            </NavLink>

            {/* Desktop Nav Links */}
            <div className="flex items-center gap-8">
              <NavLink to="/" className={({isActive}) => `text-sm font-medium transition-colors ${isActive ? 'text-green-700' : 'text-stone-600 hover:text-green-700'}`}>Discover</NavLink>
              <NavLink to="/add-farmer" className={({isActive}) => `text-sm font-medium transition-colors ${isActive ? 'text-green-700' : 'text-stone-600 hover:text-green-700'}`}>Add Farm</NavLink>
              <NavLink to="/favorites" className={({isActive}) => `text-sm font-medium transition-colors ${isActive ? 'text-green-700' : 'text-stone-600 hover:text-green-700'}`}>Favorites</NavLink>
              
              <div className="h-6 w-px bg-stone-200"></div>
              
              <div className="flex items-center gap-4">
                 <button className="text-stone-500 hover:text-stone-800 relative group">
                   <Bell size={20} />
                   {pendingCount > 0 && (
                     <span className="absolute -top-1 -right-1 flex h-3 w-3">
                       <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                       <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500 border-2 border-white"></span>
                     </span>
                   )}
                 </button>
                 
                 {currentUser ? (
                   <NavLink to="/my-farm" className="flex items-center gap-2 text-white font-medium bg-green-700 px-4 py-1.5 rounded-full hover:bg-green-800 transition-colors shadow-sm">
                     <Tractor size={18} />
                     <span>My Farm</span>
                   </NavLink>
                 ) : (
                   <NavLink to="/login" className="flex items-center gap-2 text-stone-700 font-medium bg-stone-100 px-3 py-1.5 rounded-full hover:bg-stone-200 transition-colors">
                     <User size={18} />
                     <span>Sign In</span>
                   </NavLink>
                 )}
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1 pb-24 md:pb-0">
        <Outlet />
        
        {/* Footer Link to Admin Portal */}
        <div className="py-8 text-center border-t border-stone-200 mt-12 bg-white">
           <NavLink to="/admin-login" className="text-xs text-stone-400 hover:text-green-700 font-medium transition-colors">
              Admin & Partner Portal Login
           </NavLink>
           <p className="text-[10px] text-stone-300 mt-2">© 2024 Riga Harvest</p>
        </div>
      </main>

      {/* Mobile Bottom Navigation */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-stone-200 z-50 px-2 py-2 pb-5 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
        <div className="grid grid-cols-4 gap-1 items-center">
          <NavLink 
            to="/" 
            className={({isActive}) => `flex flex-col items-center gap-1 p-1 ${isActive ? 'text-green-700' : 'text-stone-400'}`}
          >
            <MapPin size={22} strokeWidth={2.5} />
            <span className="text-[10px] font-medium">Map</span>
          </NavLink>

          <NavLink 
            to="/favorites" 
            className={({isActive}) => `flex flex-col items-center gap-1 p-1 ${isActive ? 'text-green-700' : 'text-stone-400'}`}
          >
            <Heart size={22} strokeWidth={2.5} />
            <span className="text-[10px] font-medium">Saved</span>
          </NavLink>

          <NavLink 
            to="/add-farmer" 
            className={({isActive}) => `flex flex-col items-center gap-1 p-1 ${isActive ? 'text-green-700' : 'text-stone-400'}`}
          >
            <PlusCircle size={22} strokeWidth={2.5} />
            <span className="text-[10px] font-medium">Add</span>
          </NavLink>

          {currentUser ? (
             <NavLink 
              to="/my-farm" 
              className={({isActive}) => `flex flex-col items-center gap-1 p-1 ${isActive ? 'text-green-700' : 'text-stone-400'}`}
            >
              <Tractor size={22} strokeWidth={2.5} />
              <span className="text-[10px] font-medium">Profile</span>
            </NavLink>
          ) : (
             <NavLink 
              to="/login" 
              className={({isActive}) => `flex flex-col items-center gap-1 p-1 ${isActive ? 'text-green-700' : 'text-stone-400'}`}
            >
              <User size={22} strokeWidth={2.5} />
              <span className="text-[10px] font-medium">Login</span>
            </NavLink>
          )}
        </div>
      </div>

      {/* Global AI Assistant - Only show on main app */}
      <AIAssistant />
    </div>
  );
};

export default Layout;
