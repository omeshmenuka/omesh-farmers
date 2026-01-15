
import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { Farmer, Product, Notification, Order } from '../types';
import { MOCK_FARMERS, ADMIN_PASSWORD } from '../constants';
import { supabase, checkSupabaseConnection } from '../services/supabaseService';

interface FarmerContextType {
  farmers: Farmer[];
  addFarmer: (farmer: Farmer) => void;
  toggleVerification: (id: string) => void;
  approveFarmer: (id: string) => void;
  deleteFarmer: (id: string) => void;
  followedIds: string[];
  toggleFollow: (id: string) => void;
  rateFarmer: (id: string, rating: number) => void;
  userRatings: Record<string, number>;
  currentUser: Farmer | null;
  login: (username: string, password: string) => boolean;
  logout: () => void;
  updateProductStock: (farmerId: string, productId: string, inStock: boolean, price: number) => void;
  addProduct: (farmerId: string, product: Product) => void;
  deleteProduct: (farmerId: string, productId: string) => void;
  updateFarmerProfile: (farmerId: string, updates: Partial<Farmer>) => void;
  addOrder: (farmerId: string, order: Order) => void;
  deleteOrder: (farmerId: string, orderId: string) => void;
  isAdminLoggedIn: boolean;
  loginAdmin: (password: string) => boolean;
  logoutAdmin: () => void;
  notifications: Notification[];
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  clearNotifications: () => void;
  supabaseStatus: 'connecting' | 'connected' | 'error';
}

const FarmerContext = createContext<FarmerContextType | undefined>(undefined);

export const FarmerProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [supabaseStatus, setSupabaseStatus] = useState<'connecting' | 'connected' | 'error'>('connecting');
  const [farmers, setFarmers] = useState<Farmer[]>([]);

  const [followedIds, setFollowedIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('followedIds');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });

  const [userRatings, setUserRatings] = useState<Record<string, number>>(() => {
    try {
      const saved = localStorage.getItem('userRatings');
      return saved ? JSON.parse(saved) : {};
    } catch (e) {
      return {};
    }
  });

  const [notifications, setNotifications] = useState<Notification[]>(() => {
    try {
      const saved = localStorage.getItem('notifications');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
       return [];
    }
  });

  const [currentUser, setCurrentUser] = useState<Farmer | null>(() => {
    try {
      const saved = localStorage.getItem('currentUser');
      return saved ? JSON.parse(saved) : null;
    } catch (e) {
      return null;
    }
  });

  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(() => {
    return localStorage.getItem('isAdminLoggedIn') === 'true';
  });

  useEffect(() => {
    const fetchData = async () => {
      setSupabaseStatus('connecting');
      try {
        const { connected, error } = await checkSupabaseConnection();
        if (!connected) {
          setSupabaseStatus('error');
          const saved = localStorage.getItem('farmers');
          setFarmers(saved ? JSON.parse(saved) : MOCK_FARMERS);
          return;
        }

        const { data: dbFarmers, error: fError } = await supabase.from('farmers').select('*');
        if (fError) throw fError;

        const { data: dbOrders, error: oError } = await supabase.from('orders').select('*');

        if (dbFarmers) {
          const mapped: Farmer[] = dbFarmers.map((f: any) => ({
            id: f.id,
            name: f.name,
            description: f.description,
            address: f.address,
            coordinates: { lat: f.lat, lng: f.lng },
            imageUrl: f.image_url,
            rating: f.rating || 0,
            reviewCount: f.review_count || 0,
            phone: f.phone,
            email: f.email,
            verified: f.verified || false,
            isApproved: f.is_approved || false,
            isOpen: true,
            products: f.products || [],
            credentials: { username: f.username, password: f.password },
            orders: dbOrders ? dbOrders.filter((o: any) => o.farmer_id === f.id).map((o: any) => ({
              id: o.id,
              customerName: o.customer_name,
              customerEmail: o.customer_email,
              customerPhone: o.customer_phone,
              details: o.details,
              timestamp: new Date(o.timestamp),
              status: o.status
            })) : []
          }));

          setFarmers(mapped.length === 0 ? MOCK_FARMERS : mapped);
          setSupabaseStatus('connected');
        }
      } catch (err) {
        setSupabaseStatus('error');
        const saved = localStorage.getItem('farmers');
        setFarmers(saved ? JSON.parse(saved) : MOCK_FARMERS);
      }
    };
    fetchData();
  }, []);

  useEffect(() => { if (farmers.length > 0) localStorage.setItem('farmers', JSON.stringify(farmers)); }, [farmers]);
  useEffect(() => { localStorage.setItem('followedIds', JSON.stringify(followedIds)); }, [followedIds]);
  useEffect(() => { localStorage.setItem('userRatings', JSON.stringify(userRatings)); }, [userRatings]);
  useEffect(() => { localStorage.setItem('notifications', JSON.stringify(notifications)); }, [notifications]);
  useEffect(() => { localStorage.setItem('isAdminLoggedIn', String(isAdminLoggedIn)); }, [isAdminLoggedIn]);
  useEffect(() => { 
    if (currentUser) localStorage.setItem('currentUser', JSON.stringify(currentUser));
    else localStorage.removeItem('currentUser');
  }, [currentUser]);

  const addNotification = (title: string, message: string, type: Notification['type'], link?: string) => {
    setNotifications(prev => [{ id: Math.random().toString(), title, message, type, timestamp: new Date(), read: false, link }, ...prev]);
  };

  const markAsRead = (id: string) => setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  const markAllAsRead = () => setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  const clearNotifications = () => setNotifications([]);

  const addFarmer = async (newFarmer: Farmer) => {
    setFarmers(prev => [newFarmer, ...prev]);
    addNotification('New Farm!', `${newFarmer.name} requested to join.`, 'system');
    await supabase.from('farmers').insert([{
      id: newFarmer.id, 
      name: newFarmer.name, 
      description: newFarmer.description, 
      address: newFarmer.address,
      lat: newFarmer.coordinates.lat, 
      lng: newFarmer.coordinates.lng, 
      image_url: newFarmer.imageUrl,
      phone: newFarmer.phone, 
      email: newFarmer.email, 
      username: newFarmer.credentials?.username,
      password: newFarmer.credentials?.password, 
      products: newFarmer.products, 
      is_approved: false
    }]);
  };

  const toggleVerification = async (id: string) => {
    const farmer = farmers.find(f => f.id === id);
    if (!farmer) return;
    const newStatus = !farmer.verified;
    setFarmers(prev => prev.map(f => f.id === id ? { ...f, verified: newStatus } : f));
    await supabase.from('farmers').update({ verified: newStatus }).eq('id', id);
  };

  const approveFarmer = async (id: string) => {
    setFarmers(prev => prev.map(f => f.id === id ? { ...f, isApproved: true } : f));
    await supabase.from('farmers').update({ is_approved: true }).eq('id', id);
    const farmer = farmers.find(f => f.id === id);
    if (farmer) addNotification('Approved!', `${farmer.name} is now live.`, 'new_arrival', `/farmer/${farmer.id}`);
  };

  const deleteFarmer = async (id: string) => {
    setFarmers(prev => prev.filter(f => f.id !== id));
    await supabase.from('farmers').delete().eq('id', id);
  };

  const toggleFollow = (id: string) => setFollowedIds(prev => prev.includes(id) ? prev.filter(fid => fid !== id) : [...prev, id]);

  const rateFarmer = async (id: string, rating: number) => {
    setUserRatings(prev => ({ ...prev, [id]: rating }));
    setFarmers(prev => prev.map(f => {
      if (f.id !== id) return f;
      const newCount = (f.reviewCount || 0) + 1;
      const newRating = Number(((f.rating * (f.reviewCount || 0) + rating) / newCount).toFixed(1));
      supabase.from('farmers').update({ rating: newRating, review_count: newCount }).eq('id', id);
      return { ...f, rating: newRating, reviewCount: newCount };
    }));
  };

  const login = (username: string, password: string) => {
    const found = farmers.find(f => f.credentials?.username === username && f.credentials?.password === password);
    if (found) { setCurrentUser(found); return true; }
    return false;
  };

  const logout = () => setCurrentUser(null);
  const loginAdmin = (password: string) => { if (password === ADMIN_PASSWORD) { setIsAdminLoggedIn(true); return true; } return false; };
  const logoutAdmin = () => setIsAdminLoggedIn(false);

  const updateProductStock = async (farmerId: string, productId: string, inStock: boolean, price: number) => {
    setFarmers(prev => prev.map(f => {
      if (f.id !== farmerId) return f;
      const products = f.products.map(p => p.id === productId ? { ...p, inStock, price } : p);
      supabase.from('farmers').update({ products }).eq('id', farmerId);
      if (currentUser?.id === farmerId) setCurrentUser({ ...f, products });
      return { ...f, products };
    }));
  };

  const addProduct = async (farmerId: string, product: Product) => {
    setFarmers(prev => prev.map(f => {
      if (f.id !== farmerId) return f;
      const products = [...f.products, product];
      supabase.from('farmers').update({ products }).eq('id', farmerId);
      if (currentUser?.id === farmerId) setCurrentUser({ ...f, products });
      return { ...f, products };
    }));
  };

  const deleteProduct = async (farmerId: string, productId: string) => {
    setFarmers(prev => prev.map(f => {
      if (f.id !== farmerId) return f;
      const products = f.products.filter(p => p.id !== productId);
      supabase.from('farmers').update({ products }).eq('id', farmerId);
      if (currentUser?.id === farmerId) setCurrentUser({ ...f, products });
      return { ...f, products };
    }));
  };

  const updateFarmerProfile = async (farmerId: string, updates: Partial<Farmer>) => {
    setFarmers(prev => prev.map(f => {
      if (f.id !== farmerId) return f;
      const updated = { ...f, ...updates };
      const db: any = {};
      if (updates.name) db.name = updates.name;
      if (updates.description) db.description = updates.description;
      if (updates.address) db.address = updates.address;
      if (updates.phone) db.phone = updates.phone;
      if (updates.imageUrl) db.image_url = updates.imageUrl;
      if (updates.coordinates) { db.lat = updates.coordinates.lat; db.lng = updates.coordinates.lng; }
      supabase.from('farmers').update(db).eq('id', farmerId);
      if (currentUser?.id === farmerId) setCurrentUser(updated);
      return updated;
    }));
  };

  const addOrder = async (farmerId: string, order: Order) => {
    // Local Update
    setFarmers(prev => prev.map(f => f.id === farmerId ? { ...f, orders: [...(f.orders || []), order] } : f));
    
    // Supabase Insert with all provided fields
    const { error } = await supabase.from('orders').insert([{
      id: order.id, 
      farmer_id: farmerId, 
      customer_name: order.customerName,
      customer_email: order.customerEmail, 
      customer_phone: order.customerPhone,
      details: order.details, 
      timestamp: order.timestamp.toISOString(), 
      status: order.status
    }]);

    if (error) {
      console.error("Supabase Order Insert Error:", error.message);
    }
  };

  const deleteOrder = async (farmerId: string, orderId: string) => {
    setFarmers(prev => prev.map(f => f.id === farmerId ? { ...f, orders: (f.orders || []).filter(o => o.id !== orderId) } : f));
    await supabase.from('orders').delete().eq('id', orderId);
  };

  return (
    <FarmerContext.Provider value={{ 
      farmers, addFarmer, toggleVerification, approveFarmer, deleteFarmer, followedIds, toggleFollow, rateFarmer, userRatings, 
      currentUser, login, logout, updateProductStock, addProduct, deleteProduct, updateFarmerProfile, addOrder, deleteOrder,
      isAdminLoggedIn, loginAdmin, logoutAdmin, notifications, markAsRead, markAllAsRead, clearNotifications, supabaseStatus
    }}>
      {children}
    </FarmerContext.Provider>
  );
};

export const useFarmers = () => {
  const context = useContext(FarmerContext);
  if (!context) throw new Error('useFarmers must be used within a FarmerProvider');
  return context;
};
