import React, { useState, useRef, useEffect } from 'react';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { Sprout, Bell, User, MapPin, Heart, PlusCircle, Tractor, ShieldCheck, Check, Trash2, Package, Info } from 'lucide-react';
import AIAssistant from './AIAssistant';
import { useFarmers } from '../context/FarmerContext';

const Layout: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { farmers, currentUser, notifications, markAsRead, markAllAsRead, clearNotifications } = useFarmers();
  const [showNotifications, setShowNotifications] = useState(false);
  const notificationRef = useRef<HTMLDivElement>(null);

  const isHome = location.pathname === '/';
  const isAdminRoute = location.pathname.startsWith('/admin') || location.pathname === '/admin-login';

  const unreadCount = notifications.filter(n => !n.read).length;

  // Click outside to close notifications
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleNotificationClick = (id: string, link?: string) => {
    markAsRead(id);
    if (link) {
      navigate(link);
      setShowNotifications(false);
    }
  };

  const getIconForType = (type: string) => {
    switch (type) {
      case 'new_arrival': return <Sprout size={16} className="text-green-600" />;
      case 'stock_update': return <Package size={16} className="text-blue-600" />;
      case 'system': return <Info size={16} className="text-stone-600" />;
      default: return <Bell size={16} className="text-stone-600" />;
    }
  };

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
              <NavLink to="/favorites" className={({isActive}) => `text-sm font-medium transition-colors ${isActive ? 'text-green-700' : 'text-stone-600 hover:text-green-700'}`}>Favorites</NavLink>
              
              <div className="h-6 w-px bg-stone-200"></div>
              
              <div className="flex items-center gap-4">
                 {/* Notification Bell */}
                 <div className="relative" ref={notificationRef}>
                   <button 
                     onClick={() => setShowNotifications(!showNotifications)}
                     className="text-stone-500 hover:text-stone-800 relative group p-2 rounded-full hover:bg-stone-100 transition-colors"
                   >
                     <Bell size={20} />
                     {unreadCount > 0 && (
                       <span className="absolute top-1 right-1 flex h-3 w-3">
                         <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                         <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500 border-2 border-white"></span>
                       </span>
                     )}
                   </button>

                   {/* Notification Dropdown */}
                   {showNotifications && (
                     <div className="absolute top-12 right-0 w-80 bg-white rounded-xl shadow-xl border border-stone-100 z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                       <div className="p-3 border-b border-stone-100 flex justify-between items-center bg-stone-50">
                         <h3 className="text-sm font-bold text-stone-800">Notifications</h3>
                         <div className="flex gap-2">
                            {unreadCount > 0 && (
                              <button onClick={markAllAsRead} className="text-xs text-green-700 hover:underline flex items-center gap-1">
                                <Check size={12} /> Mark read
                              </button>
                            )}
                            <button onClick={clearNotifications} className="text-stone-400 hover:text-red-500 transition-colors">
                              <Trash2 size={14} />
                            </button>
                         </div>
                       </div>
                       <div className="max-h-[350px] overflow-y-auto">
                         {notifications.length === 0 ? (
                           <div className="p-8 text-center text-stone-400 text-sm">
                             No updates yet.
                           </div>
                         ) : (
                           notifications.map((note) => (
                             <div 
                               key={note.id}
                               onClick={() => handleNotificationClick(note.id, note.link)}
                               className={`p-4 border-b border-stone-50 cursor-pointer transition-colors hover:bg-stone-50 ${note.read ? 'opacity-60' : 'bg-green-50/30'}`}
                             >
                               <div className="flex gap-3 items-start">
                                 <div className={`mt-0.5 p-1.5 rounded-full ${note.read ? 'bg-stone-100' : 'bg-white shadow-sm'}`}>
                                    {getIconForType(note.type)}
                                 </div>
                                 <div>
                                   <p className={`text-sm ${note.read ? 'text-stone-600' : 'text-stone-900 font-semibold'}`}>
                                     {note.title}
                                   </p>
                                   <p className="text-xs text-stone-500 mt-1 leading-relaxed">
                                     {note.message}
                                   </p>
                                   <p className="text-[10px] text-stone-400 mt-2">
                                     {new Date(note.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                   </p>
                                 </div>
                               </div>
                             </div>
                           ))
                         )}
                       </div>
                     </div>
                   )}
                 </div>
                 
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
        <div className="grid grid-cols-3 gap-1 items-center">
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
              <span className="text-[10px] font-medium">Sign In</span>
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