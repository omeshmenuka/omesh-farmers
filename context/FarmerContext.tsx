
import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { Farmer, Product } from '../types';
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
  // Admin Auth
  isAdminLoggedIn: boolean;
  loginAdmin: (password: string) => boolean;
  logoutAdmin: () => void;
}

const FarmerContext = createContext<FarmerContextType | undefined>(undefined);

export const FarmerProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Initialize state from Local Storage if available, otherwise use defaults
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

  // Persist changes to Local Storage
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
    if (currentUser) {
      localStorage.setItem('currentUser', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('currentUser');
    }
  }, [currentUser]);

  useEffect(() => {
    localStorage.setItem('isAdminLoggedIn', String(isAdminLoggedIn));
  }, [isAdminLoggedIn]);


  const addFarmer = (newFarmer: Farmer) => {
    // Add new farmer to the beginning of the list, but marked as NOT approved
    setFarmers(prev => [{ ...newFarmer, isApproved: false, reviewCount: 0 }, ...prev]);
  };

  const toggleVerification = (id: string) => {
    setFarmers(prev => prev.map(f => 
      f.id === id ? { ...f, verified: !f.verified } : f
    ));
  };

  const approveFarmer = (id: string) => {
    setFarmers(prev => prev.map(f => 
      f.id === id ? { ...f, isApproved: true } : f
    ));
  };

  const deleteFarmer = (id: string) => {
    setFarmers(prev => prev.filter(f => f.id !== id));
  };

  const toggleFollow = (id: string) => {
    setFollowedIds(prev => {
      if (prev.includes(id)) {
        return prev.filter(fid => fid !== id);
      } else {
        return [...prev, id];
      }
    });
  };

  const rateFarmer = (id: string, rating: number) => {
    // Allows multiple ratings for demo purposes
    setUserRatings(prev => ({ ...prev, [id]: rating }));

    setFarmers(prev => prev.map(f => {
      if (f.id !== id) return f;

      const currentCount = f.reviewCount || 0;
      const totalScore = (f.rating * currentCount) + rating;
      const newCount = currentCount + 1;
      const newAverage = totalScore / newCount;

      return {
        ...f,
        rating: parseFloat(newAverage.toFixed(1)),
        reviewCount: newCount
      };
    }));
  };

  // Auth Logic
  const login = (username: string, password: string): boolean => {
    const foundFarmer = farmers.find(f => 
      f.credentials && 
      f.credentials.username === username && 
      f.credentials.password === password
    );

    if (foundFarmer) {
      setCurrentUser(foundFarmer);
      return true;
    }
    return false;
  };

  const logout = () => {
    setCurrentUser(null);
  };

  // Admin Auth Logic
  const loginAdmin = (password: string): boolean => {
    if (password === ADMIN_PASSWORD) {
      setIsAdminLoggedIn(true);
      return true;
    }
    return false;
  };

  const logoutAdmin = () => {
    setIsAdminLoggedIn(false);
  };

  // Stock Management Logic
  const updateProductStock = (farmerId: string, productId: string, inStock: boolean, price: number) => {
    setFarmers(prev => prev.map(f => {
      if (f.id !== farmerId) return f;

      const updatedProducts = f.products.map(p => 
        p.id === productId ? { ...p, inStock, price } : p
      );

      // If current user is the one being updated, update local state too
      if (currentUser && currentUser.id === farmerId) {
        setCurrentUser({ ...f, products: updatedProducts });
      }

      return { ...f, products: updatedProducts };
    }));
  };

  const addProduct = (farmerId: string, product: Product) => {
    setFarmers(prev => prev.map(f => {
      if (f.id !== farmerId) return f;

      const updatedProducts = [...f.products, product];

      if (currentUser && currentUser.id === farmerId) {
        setCurrentUser({ ...f, products: updatedProducts });
      }

      return { ...f, products: updatedProducts };
    }));
  };

  const deleteProduct = (farmerId: string, productId: string) => {
    setFarmers(prev => prev.map(f => {
      if (f.id !== farmerId) return f;

      const updatedProducts = f.products.filter(p => p.id !== productId);

      if (currentUser && currentUser.id === farmerId) {
        setCurrentUser({ ...f, products: updatedProducts });
      }

      return { ...f, products: updatedProducts };
    }));
  };

  const updateFarmerProfile = (farmerId: string, updates: Partial<Farmer>) => {
    setFarmers(prev => prev.map(f => {
      if (f.id !== farmerId) return f;
      
      const updatedFarmer = { ...f, ...updates };
      
      if (currentUser && currentUser.id === farmerId) {
        setCurrentUser(updatedFarmer);
      }
      
      return updatedFarmer;
    }));
  };

  return (
    <FarmerContext.Provider value={{ 
      farmers, 
      addFarmer, 
      toggleVerification, 
      approveFarmer, 
      deleteFarmer, 
      followedIds, 
      toggleFollow, 
      rateFarmer, 
      userRatings,
      currentUser,
      login,
      logout,
      updateProductStock,
      addProduct,
      deleteProduct,
      updateFarmerProfile,
      isAdminLoggedIn,
      loginAdmin,
      logoutAdmin
    }}>
      {children}
    </FarmerContext.Provider>
  );
};

export const useFarmers = () => {
  const context = useContext(FarmerContext);
  if (!context) {
    throw new Error('useFarmers must be used within a FarmerProvider');
  }
  return context;
};