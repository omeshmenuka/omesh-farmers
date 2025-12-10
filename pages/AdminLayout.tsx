
import React, { useEffect, useState } from 'react';
import { Outlet, useNavigate, NavLink, useLocation } from 'react-router-dom';
import { LayoutDashboard, Users, LogOut, Sprout, Menu, X } from 'lucide-react';
import { useFarmers } from '../context/FarmerContext';

const AdminLayout: React.FC = () => {
  const { isAdminLoggedIn, logoutAdmin } = useFarmers();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (!isAdminLoggedIn) {
      navigate('/admin-login');
    }
  }, [isAdminLoggedIn, navigate]);

  // Close mobile menu when route changes
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location]);

  const handleLogout = () => {
    logoutAdmin();
    navigate('/admin-login');
  };

  const NavContent = () => (
    <>
      <div className="p-6 border-b border-stone-800 flex items-center gap-3">
        <div className="bg-green-600 p-1.5 rounded-lg">
           <Sprout size={20} className="text-white" />
        </div>
        <span className="font-serif font-bold text-lg tracking-wide text-white">RH Admin</span>
      </div>

      <nav className="flex-1 p-4 space-y-2">
         <NavLink 
           to="/admin/dashboard" 
           className={({isActive}) => `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${isActive ? 'bg-green-700 text-white' : 'text-stone-400 hover:bg-stone-800 hover:text-white'}`}
         >
           <LayoutDashboard size={18} />
           Overview
         </NavLink>
         <NavLink 
           to="/" 
           target="_blank"
           className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-stone-400 hover:bg-stone-800 hover:text-white transition-colors"
         >
           <Users size={18} />
           View Live Site
         </NavLink>
      </nav>

      <div className="p-4 border-t border-stone-800">
        <button 
          onClick={handleLogout}
          className="flex items-center gap-3 px-4 py-3 w-full rounded-xl text-sm font-medium text-red-400 hover:bg-red-900/20 transition-colors"
        >
          <LogOut size={18} />
          Sign Out
        </button>
      </div>
    </>
  );

  return (
    <div className="flex h-screen bg-stone-100 overflow-hidden">
      {/* Desktop Sidebar */}
      <aside className="w-64 bg-stone-900 hidden md:flex flex-col h-full shadow-xl z-20">
        <NavContent />
      </aside>

      {/* Mobile Sidebar (Drawer) */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          <div 
            className="fixed inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
            onClick={() => setIsMobileMenuOpen(false)}
          />
          <aside className="relative w-64 bg-stone-900 flex flex-col h-full shadow-2xl animate-in slide-in-from-left duration-300">
             <NavContent />
             <button 
               onClick={() => setIsMobileMenuOpen(false)}
               className="absolute top-4 right-4 text-stone-500 hover:text-white"
             >
               <X size={24} />
             </button>
          </aside>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-full overflow-hidden relative">
        {/* Mobile Header */}
        <header className="bg-stone-900 text-white h-16 flex items-center justify-between px-4 md:hidden shadow-md z-10 shrink-0">
            <div className="flex items-center gap-3">
              <button 
                onClick={() => setIsMobileMenuOpen(true)}
                className="p-2 hover:bg-stone-800 rounded-lg transition-colors"
              >
                <Menu size={24} />
              </button>
              <span className="font-bold font-serif tracking-wide">Admin Portal</span>
            </div>
            <div className="bg-green-600/20 text-green-400 px-2 py-1 rounded text-xs font-mono border border-green-600/30">
              v2.4
            </div>
        </header>

        <main className="flex-1 overflow-y-auto overflow-x-hidden p-4 md:p-8 bg-stone-100 scroll-smooth">
           <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
