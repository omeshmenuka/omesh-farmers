
import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { Farmer, Product, Notification, Order } from '../types';
import { MOCK_FARMERS, ADMIN_PASSWORD } from '../constants';
import { supabase } from '../services/supabaseService';

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

  // Load orders and farmers from Supabase on init
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch Farmers from Supabase
        const { data: farmersData, error: farmersError } = await supabase
          .from('farmers')
          .select('*');

        if (farmersError) {
          console.error("Supabase: Error fetching farmers. Ensure you ran the SQL script in Supabase Dashboard:", farmersError.message);
        } else if (farmersData && farmersData.length > 0) {
          setFarmers(prev => {
            const merged = [...prev];
            farmersData.forEach((dbFarmer: any) => {
              const index = merged.findIndex(f => f.id === dbFarmer.id);
              const mappedFarmer: Farmer = {
                id: dbFarmer.id,
                name: dbFarmer.name,
                description: dbFarmer.description,
                address: dbFarmer.address,
                coordinates: { lat: dbFarmer.lat, lng: dbFarmer.lng },
                imageUrl: dbFarmer.image_url,
                rating: dbFarmer.rating,
                reviewCount: dbFarmer.review_count,
                phone: dbFarmer.phone,
                email: dbFarmer.email,
                verified: dbFarmer.verified,
                isApproved: dbFarmer.is_approved,
                isOpen: true,
                products: dbFarmer.products || [],
                credentials: { username: dbFarmer.username, password: dbFarmer.password }
              };

              if (index >= 0) {
                merged[index] = { ...merged[index], ...mappedFarmer };
              } else {
                merged.push(mappedFarmer);
              }
            });
            return merged;
          });
        }

        // Fetch Orders from Supabase
        const { data: ordersData, error: ordersError } = await supabase
          .from('orders')
          .select('*')
          .order('timestamp', { ascending: false });

        if (ordersError) {
          console.error("Supabase: Error fetching orders:", ordersError.message);
        } else if (ordersData) {
          setFarmers(prev => prev.map(f => {
            const farmerOrders = ordersData.filter((o: any) => o.farmer_id === f.id).map((o: any) => ({
              id: o.id,
              customerName: o.customer_name,
              customerEmail: o.customer_email,
              customerPhone: o.customer_phone,
              details: o.details,
              timestamp: new Date(o.timestamp),
              status: o.status
            }));
            return { ...f, orders: farmerOrders };
          }));
        }
      } catch (err: any) {
        console.error("Supabase connection failed:", err.message || err);
      }
    };

    fetchData();
  }, []);

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

  const addFarmer = async (newFarmer: Farmer) => {
    // 1. Update local state
    setFarmers(prev => [{ ...newFarmer, isApproved: false, reviewCount: 0, orders: [] }, ...prev]);
    addNotification('New Farm Registered', `${newFarmer.name} joined!`, 'system');

    // 2. Persist to Supabase
    try {
      const { error } = await supabase
        .from('farmers')
        .insert([{
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
      
      if (error) console.error("Error saving farmer to Supabase:", error.message);
    } catch (err: any) {
      console.error("Supabase farmer insert failed:", err.message || err);
    }
  };

  const toggleVerification = async (id: string) => {
    setFarmers(prev => prev.map(f => f.id === id ? { ...f, verified: !f.verified } : f));
    const farmer = farmers.find(f => f.id === id);
    if (farmer) {
      await supabase.from('farmers').update({ verified: !farmer.verified }).eq('id', id);
    }
  };

  const approveFarmer = async (id: string) => {
    const farmer = farmers.find(f => f.id === id);
    setFarmers(prev => prev.map(f => f.id === id ? { ...f, isApproved: true } : f));
    if (farmer) {
      addNotification('New Local Producer', `${farmer.name} is now live!`, 'new_arrival', `/farmer/${farmer.id}`);
      await supabase.from('farmers').update({ is_approved: true }).eq('id', id);
    }
  };

  const deleteFarmer = async (id: string) => {
    setFarmers(prev => prev.filter(f => f.id !== id));
    await supabase.from('farmers').delete().eq('id', id);
  };

  const toggleFollow = (id: string) => {
    setFollowedIds(prev => prev.includes(id) ? prev.filter(fid => fid !== id) : [...prev, id]);
  };

  const rateFarmer = async (id: string, rating: number) => {
    setUserRatings(prev => ({ ...prev, [id]: rating }));
    setFarmers(prev => prev.map(f => {
      if (f.id !== id) return f;
      const currentCount = f.reviewCount || 0;
      const totalScore = (f.rating * currentCount) + rating;
      const newCount = currentCount + 1;
      const newRating = parseFloat((totalScore / newCount).toFixed(1));
      
      supabase.from('farmers').update({ 
        rating: newRating, 
        review_count: newCount 
      }).eq('id', id).then(({error}) => {
        if(error) console.error("Rating sync error:", error.message);
      });

      return { ...f, rating: newRating, reviewCount: newCount };
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

  const updateProductStock = async (farmerId: string, productId: string, inStock: boolean, price: number) => {
    setFarmers(prev => prev.map(f => {
      if (f.id !== farmerId) return f;
      const updatedProducts = f.products.map(p => p.id === productId ? { ...p, inStock, price } : p);
      
      // Sync whole products array to Supabase
      supabase.from('farmers').update({ products: updatedProducts }).eq('id', farmerId).then(({error}) => {
        if (error) console.error("Stock sync error:", error.message);
      });

      if (currentUser?.id === farmerId) setCurrentUser({ ...f, products: updatedProducts });
      return { ...f, products: updatedProducts };
    }));
  };

  const addProduct = async (farmerId: string, product: Product) => {
    setFarmers(prev => prev.map(f => {
      if (f.id !== farmerId) return f;
      const updatedProducts = [...f.products, product];
      
      supabase.from('farmers').update({ products: updatedProducts }).eq('id', farmerId).then(({error}) => {
        if (error) console.error("Add product sync error:", error.message);
      });

      if (currentUser?.id === farmerId) setCurrentUser({ ...f, products: updatedProducts });
      return { ...f, products: updatedProducts };
    }));
  };

  const deleteProduct = async (farmerId: string, productId: string) => {
    setFarmers(prev => prev.map(f => {
      if (f.id !== farmerId) return f;
      const updatedProducts = f.products.filter(p => p.id !== productId);
      
      supabase.from('farmers').update({ products: updatedProducts }).eq('id', farmerId).then(({error}) => {
        if (error) console.error("Delete product sync error:", error.message);
      });

      if (currentUser?.id === farmerId) setCurrentUser({ ...f, products: updatedProducts });
      return { ...f, products: updatedProducts };
    }));
  };

  const updateFarmerProfile = async (farmerId: string, updates: Partial<Farmer>) => {
    setFarmers(prev => prev.map(f => {
      if (f.id !== farmerId) return f;
      const updatedFarmer = { ...f, ...updates };
      
      // Prepare DB updates (map keys correctly)
      const dbUpdates: any = {};
      if (updates.name) dbUpdates.name = updates.name;
      if (updates.description) dbUpdates.description = updates.description;
      if (updates.address) dbUpdates.address = updates.address;
      if (updates.phone) dbUpdates.phone = updates.phone;
      if (updates.email) dbUpdates.email = updates.email;
      if (updates.coordinates) {
        dbUpdates.lat = updates.coordinates.lat;
        dbUpdates.lng = updates.coordinates.lng;
      }

      supabase.from('farmers').update(dbUpdates).eq('id', farmerId).then(({error}) => {
        if (error) console.error("Profile sync error:", error.message);
      });

      if (currentUser?.id === farmerId) setCurrentUser(updatedFarmer);
      return updatedFarmer;
    }));
  };

  const addOrder = async (farmerId: string, order: Order) => {
    setFarmers(prev => prev.map(f => {
      if (f.id !== farmerId) return f;
      const updatedOrders = [...(f.orders || []), order];
      if (currentUser?.id === farmerId) setCurrentUser({ ...f, orders: updatedOrders });
      return { ...f, orders: updatedOrders };
    }));

    try {
      const { error } = await supabase
        .from('orders')
        .insert([{
          id: order.id,
          farmer_id: farmerId,
          customer_name: order.customerName,
          customer_email: order.customerEmail,
          customer_phone: order.customerPhone,
          details: order.details,
          timestamp: order.timestamp.toISOString(),
          status: order.status
        }]);
      
      if (error) console.error("Error saving order to Supabase:", error.message);
    } catch (err: any) {
      console.error("Supabase insert failed:", err.message || err);
    }
  };

  const deleteOrder = async (farmerId: string, orderId: string) => {
    setFarmers(prev => prev.map(f => {
      if (f.id !== farmerId) return f;
      const updatedOrders = (f.orders || []).filter(o => o.id !== orderId);
      if (currentUser?.id === farmerId) setCurrentUser({ ...f, orders: updatedOrders });
      return { ...f, orders: updatedOrders };
    }));

    try {
      const { error } = await supabase
        .from('orders')
        .delete()
        .eq('id', orderId);
      
      if (error) console.error("Error deleting order from Supabase:", error.message);
    } catch (err: any) {
      console.error("Supabase delete failed:", err.message || err);
    }
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
