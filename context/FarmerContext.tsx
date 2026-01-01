
import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { Farmer, Product, Notification, Order } from '../types';
import { MOCK_FARMERS, ADMIN_PASSWORD } from '../constants';

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
  // Auth & Stock Management
  currentUser: Farmer | null;
  login: (username: string, password: string) => boolean;
  logout: () => void;
  updateProductStock: (farmerId: string, productId: string, inStock: boolean, price: number) => void;
  addProduct: (farmerId: string, product: Product) => void;
  deleteProduct: (farmerId: string, productId: string) => void;
  updateFarmerProfile: (farmerId: string, updates: Partial<Farmer>) => void;
  // Orders
  addOrder: (farmerId: string, order: Order) => void;
  deleteOrder: (farmerId: string, orderId: string) => void;
  // Admin Auth
  isAdminLoggedIn: boolean;
  loginAdmin: (password: string) => boolean;
  logoutAdmin: () => void;
  // Notifications
  notifications: Notification[];
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  clearNotifications: () => void;
}

const FarmerContext = createContext<FarmerContextType | undefined>(undefined);

export const FarmerProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [farmers, setFarmers] = useState<Farmer[]>(() => {
    try {
      const saved = localStorage.getItem('farmers');
      return saved ? JSON.parse(saved) : MOCK_FARMERS;
    } catch (e) {
      console.error("Failed to load farmers from storage", e);
      return MOCK_FARMERS;
    }
  });

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
    localStorage.setItem('farmers', JSON.stringify(farmers));
  }, [farmers]);

  useEffect(() => {
    localStorage.setItem('followedIds', JSON.stringify(followedIds));
  }, [followedIds]);

  useEffect(() => {
    localStorage.setItem('userRatings', JSON.stringify(userRatings));
  }, [userRatings]);

  useEffect(() => {
    localStorage.setItem('notifications', JSON.stringify(notifications));
  }, [notifications]);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('currentUser', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('currentUser');
    }
  }, [currentUser]);

  useEffect(() => {
    localStorage.setItem('isAdminLoggedIn', String(isAdminLoggedIn));
  }, [isAdminLoggedIn]);

  const addNotification = (title: string, message: string, type: Notification['type'], link?: string) => {
    const newNote: Notification = {
      id: Date.now().toString() + Math.random().toString(),
      title,
      message,
      type,
      timestamp: new Date(),
      read: false,
      link
    };
    setNotifications(prev => [newNote, ...prev].slice(0, 50));
  };

  const markAsRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const clearNotifications = () => {
    setNotifications([]);
  };

  const addFarmer = (newFarmer: Farmer) => {
    setFarmers(prev => [{ ...newFarmer, isApproved: false, reviewCount: 0, orders: [] }, ...prev]);
    addNotification('New Farm Registered', `${newFarmer.name} joined!`, 'system');
  };

  const toggleVerification = (id: string) => {
    setFarmers(prev => prev.map(f => f.id === id ? { ...f, verified: !f.verified } : f));
  };

  const approveFarmer = (id: string) => {
    const farmer = farmers.find(f => f.id === id);
    setFarmers(prev => prev.map(f => f.id === id ? { ...f, isApproved: true } : f));
    if (farmer) {
      addNotification('New Local Producer', `${farmer.name} is now live!`, 'new_arrival', `/farmer/${farmer.id}`);
    }
  };

  const deleteFarmer = (id: string) => {
    setFarmers(prev => prev.filter(f => f.id !== id));
  };

  const toggleFollow = (id: string) => {
    setFollowedIds(prev => prev.includes(id) ? prev.filter(fid => fid !== id) : [...prev, id]);
  };

  const rateFarmer = (id: string, rating: number) => {
    setUserRatings(prev => ({ ...prev, [id]: rating }));
    setFarmers(prev => prev.map(f => {
      if (f.id !== id) return f;
      const currentCount = f.reviewCount || 0;
      const totalScore = (f.rating * currentCount) + rating;
      const newCount = currentCount + 1;
      return { ...f, rating: parseFloat((totalScore / newCount).toFixed(1)), reviewCount: newCount };
    }));
  };

  const login = (username: string, password: string): boolean => {
    const foundFarmer = farmers.find(f => f.credentials?.username === username && f.credentials?.password === password);
    if (foundFarmer) { setCurrentUser(foundFarmer); return true; }
    return false;
  };

  const logout = () => setCurrentUser(null);

  const loginAdmin = (password: string): boolean => {
    if (password === ADMIN_PASSWORD) { setIsAdminLoggedIn(true); return true; }
    return false;
  };

  const logoutAdmin = () => setIsAdminLoggedIn(false);

  const updateProductStock = (farmerId: string, productId: string, inStock: boolean, price: number) => {
    setFarmers(prev => prev.map(f => {
      if (f.id !== farmerId) return f;
      const updatedProducts = f.products.map(p => p.id === productId ? { ...p, inStock, price } : p);
      if (currentUser?.id === farmerId) setCurrentUser({ ...f, products: updatedProducts });
      return { ...f, products: updatedProducts };
    }));
  };

  const addProduct = (farmerId: string, product: Product) => {
    setFarmers(prev => prev.map(f => {
      if (f.id !== farmerId) return f;
      const updatedProducts = [...f.products, product];
      if (currentUser?.id === farmerId) setCurrentUser({ ...f, products: updatedProducts });
      return { ...f, products: updatedProducts };
    }));
  };

  const deleteProduct = (farmerId: string, productId: string) => {
    setFarmers(prev => prev.map(f => {
      if (f.id !== farmerId) return f;
      const updatedProducts = f.products.filter(p => p.id !== productId);
      if (currentUser?.id === farmerId) setCurrentUser({ ...f, products: updatedProducts });
      return { ...f, products: updatedProducts };
    }));
  };

  const updateFarmerProfile = (farmerId: string, updates: Partial<Farmer>) => {
    setFarmers(prev => prev.map(f => {
      if (f.id !== farmerId) return f;
      const updatedFarmer = { ...f, ...updates };
      if (currentUser?.id === farmerId) setCurrentUser(updatedFarmer);
      return updatedFarmer;
    }));
  };

  const addOrder = (farmerId: string, order: Order) => {
    setFarmers(prev => prev.map(f => {
      if (f.id !== farmerId) return f;
      const updatedOrders = [...(f.orders || []), order];
      if (currentUser?.id === farmerId) setCurrentUser({ ...f, orders: updatedOrders });
      return { ...f, orders: updatedOrders };
    }));
  };

  const deleteOrder = (farmerId: string, orderId: string) => {
    setFarmers(prev => prev.map(f => {
      if (f.id !== farmerId) return f;
      const updatedOrders = (f.orders || []).filter(o => o.id !== orderId);
      if (currentUser?.id === farmerId) setCurrentUser({ ...f, orders: updatedOrders });
      return { ...f, orders: updatedOrders };
    }));
  };

  return (
    <FarmerContext.Provider value={{ 
      farmers, addFarmer, toggleVerification, approveFarmer, deleteFarmer, followedIds, toggleFollow, rateFarmer, userRatings, 
      currentUser, login, logout, updateProductStock, addProduct, deleteProduct, updateFarmerProfile, addOrder, deleteOrder,
      isAdminLoggedIn, loginAdmin, logoutAdmin, notifications, markAsRead, markAllAsRead, clearNotifications
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
