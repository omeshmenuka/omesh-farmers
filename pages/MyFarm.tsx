
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut, Package, Euro, ToggleLeft, ToggleRight, MapPin, Plus, Trash2, X, Edit, Save, Phone, Mail, Loader2, Crosshair, AlertTriangle } from 'lucide-react';
import { useFarmers } from '../context/FarmerContext';
import { CATEGORIES } from '../constants';
import { Product, ProductCategory } from '../types';

const MyFarm: React.FC = () => {
  const navigate = useNavigate();
  const { currentUser, logout, updateProductStock, addProduct, deleteProduct, updateFarmerProfile, deleteFarmer } = useFarmers();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  
  // New Product Form State
  const [newProduct, setNewProduct] = useState({
    name: '',
    category: 'Vegetables',
    price: '',
    unit: 'kg'
  });

  // Profile Edit State
  const [profileForm, setProfileForm] = useState({
    name: '',
    description: '',
    phone: '',
    email: '',
    address: '',
    coordinates: null as { lat: number, lng: number } | null
  });

  useEffect(() => {
    if (!currentUser) {
      navigate('/login');
    } else {
      // Initialize profile form data
      setProfileForm({
        name: currentUser.name,
        description: currentUser.description,
        phone: currentUser.phone,
        email: currentUser.email || '',
        address: currentUser.address,
        coordinates: currentUser.coordinates
      });
    }
  }, [currentUser, navigate]);

  if (!currentUser) return null;

  const handleStockToggle = (productId: string, currentStatus: boolean, price: number) => {
    updateProductStock(currentUser.id, productId, !currentStatus, price);
  };

  const handlePriceChange = (productId: string, newPrice: string, inStock: boolean) => {
    const price = parseFloat(newPrice);
    if (!isNaN(price)) {
      updateProductStock(currentUser.id, productId, inStock, price);
    }
  };

  const handleDelete = (productId: string) => {
    if (window.confirm('Are you sure you want to remove this item from your harvest?')) {
      deleteProduct(currentUser.id, productId);
    }
  };

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const price = parseFloat(newProduct.price);
    if (!newProduct.name || isNaN(price)) return;

    const productToAdd: Product = {
      id: `p-${Date.now()}`,
      name: newProduct.name,
      category: newProduct.category as ProductCategory,
      price: price,
      unit: newProduct.unit,
      inStock: true
    };

    addProduct(currentUser.id, productToAdd);
    setIsAddModalOpen(false);
    setNewProduct({ name: '', category: 'Vegetables', price: '', unit: 'kg' });
  };

  const handleProfileUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    updateFarmerProfile(currentUser.id, {
      name: profileForm.name,
      description: profileForm.description,
      phone: profileForm.phone,
      email: profileForm.email,
      address: profileForm.address,
      coordinates: profileForm.coordinates || currentUser.coordinates
    });
    setIsEditProfileOpen(false);
  };

  const handleUpdateLocation = () => {
    if (!navigator.geolocation) return;
    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setProfileForm(prev => ({
          ...prev,
          coordinates: { lat: latitude, lng: longitude },
          address: `Lat: ${latitude.toFixed(4)}, Lng: ${longitude.toFixed(4)}`
        }));
        setIsLocating(false);
      },
      (error) => {
        console.error("Error getting location:", error);
        setIsLocating(false);
        alert("Could not access location.");
      }
    );
  };

  const handleDeleteAccount = () => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete your farm profile?\n\nThis action cannot be undone. All your data, products, and reviews will be permanently removed."
    );

    if (confirmDelete) {
      deleteFarmer(currentUser.id);
      logout();
      navigate('/');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-24">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-stone-900 font-serif">My Farm Dashboard</h1>
          <p className="text-stone-500 text-sm mt-1">Manage stock and pricing for {currentUser.name}</p>
        </div>
        <button 
          onClick={() => {
            logout();
            navigate('/login');
          }}
          className="flex items-center gap-2 bg-stone-100 hover:bg-red-50 text-stone-600 hover:text-red-600 px-4 py-2 rounded-lg transition-colors text-sm font-medium border border-stone-200"
        >
          <LogOut size={16} /> Sign Out
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Farm Overview Card */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-stone-100">
          <div className="flex items-center gap-4 mb-6">
            <img 
              src={currentUser.imageUrl} 
              alt={currentUser.name} 
              className="w-16 h-16 rounded-full object-cover border-2 border-green-100"
            />
            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-lg text-stone-800 leading-tight truncate">{currentUser.name}</h3>
              <div className="flex items-center gap-1 text-xs text-stone-500 mt-1">
                <MapPin size={12} /> <span className="truncate">{currentUser.address}</span>
              </div>
            </div>
            <button 
              onClick={() => setIsEditProfileOpen(true)}
              className="bg-stone-100 p-2 rounded-full hover:bg-green-100 text-stone-500 hover:text-green-700 transition-colors"
              title="Edit Profile"
            >
              <Edit size={16} />
            </button>
          </div>
          
          <div className="space-y-3 text-sm">
             <div className="flex justify-between py-2 border-b border-stone-50">
                <span className="text-stone-500">Status</span>
                <span className={`font-semibold ${currentUser.isOpen ? 'text-green-600' : 'text-red-500'}`}>
                  {currentUser.isOpen ? 'Open' : 'Closed'}
                </span>
             </div>
             <div className="flex justify-between py-2 border-b border-stone-50">
                <span className="text-stone-500">Rating</span>
                <span className="font-semibold text-stone-800">{currentUser.rating} ({currentUser.reviewCount} reviews)</span>
             </div>
             <div className="flex justify-between py-2 border-b border-stone-50">
                <span className="text-stone-500">Verification</span>
                <span className="font-semibold text-stone-800">{currentUser.verified ? 'Verified' : 'Pending'}</span>
             </div>
             {currentUser.email && (
               <div className="flex justify-between py-2 border-b border-stone-50 items-center">
                  <span className="text-stone-500">Email</span>
                  <span className="font-semibold text-stone-800 text-xs truncate max-w-[150px]">{currentUser.email}</span>
               </div>
             )}
              <div className="flex justify-between py-2 border-b border-stone-50 items-center">
                  <span className="text-stone-500">Phone</span>
                  <span className="font-semibold text-stone-800 text-xs">{currentUser.phone}</span>
               </div>
          </div>
        </div>

        {/* Stock Management */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-2xl shadow-sm border border-stone-100 overflow-hidden">
            <div className="p-6 border-b border-stone-100 flex justify-between items-center">
              <h3 className="font-bold text-lg text-stone-800 flex items-center gap-2">
                <Package size={20} className="text-green-600" /> Inventory
              </h3>
              <button 
                onClick={() => setIsAddModalOpen(true)}
                className="flex items-center gap-1 bg-green-700 text-white px-3 py-1.5 rounded-lg text-sm font-bold hover:bg-green-800 transition-colors shadow-sm"
              >
                <Plus size={16} /> Add Item
              </button>
            </div>
            
            <div className="divide-y divide-stone-100">
              {currentUser.products.length === 0 && (
                <div className="p-8 text-center text-stone-400">
                  <p>Your inventory is empty. Add your first harvest item!</p>
                </div>
              )}
              {currentUser.products.map(product => (
                <div key={product.id} className="p-4 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-stone-50 transition-colors group">
                  <div className="flex-1">
                    <h4 className="font-semibold text-stone-800">{product.name}</h4>
                    <span className="text-xs text-stone-400 uppercase tracking-wide bg-stone-100 px-2 py-1 rounded-md">{product.category}</span>
                  </div>

                  <div className="flex items-center gap-4 sm:gap-6">
                    {/* Price Input */}
                    <div className="flex flex-col">
                       <label className="text-[10px] text-stone-400 font-bold uppercase mb-1">Price / {product.unit}</label>
                       <div className="relative w-24">
                         <Euro className="absolute left-2 top-1/2 -translate-y-1/2 text-stone-400" size={12} />
                         <input 
                           type="number"
                           step="0.01"
                           value={product.price}
                           onChange={(e) => handlePriceChange(product.id, e.target.value, product.inStock)}
                           className="w-full pl-6 pr-2 py-1.5 text-sm rounded-lg border border-stone-200 focus:border-green-500 outline-none text-stone-900"
                         />
                       </div>
                    </div>

                    {/* Stock Toggle */}
                    <div className="flex flex-col items-end min-w-[100px]">
                       <label className="text-[10px] text-stone-400 font-bold uppercase mb-1">Availability</label>
                       <button
                         onClick={() => handleStockToggle(product.id, product.inStock, product.price)}
                         className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold transition-all ${
                           product.inStock 
                             ? 'bg-green-100 text-green-700 hover:bg-green-200' 
                             : 'bg-red-50 text-red-500 hover:bg-red-100'
                         }`}
                       >
                         {product.inStock ? (
                           <>In Stock <ToggleRight size={16} /></>
                         ) : (
                           <>Out of Stock <ToggleLeft size={16} /></>
                         )}
                       </button>
                    </div>

                    {/* Delete Button */}
                    <button 
                      onClick={() => handleDelete(product.id)}
                      className="p-2 text-stone-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors ml-2"
                      title="Remove item"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="p-4 bg-stone-50 border-t border-stone-100 text-center text-xs text-stone-500">
              Changes are saved automatically
            </div>
          </div>
        </div>
      </div>

      {/* Add Product Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden animate-in slide-in-from-bottom-8 duration-300">
            <div className="p-4 border-b border-stone-100 flex justify-between items-center bg-stone-50">
              <h3 className="font-bold text-stone-800">Add New Harvest</h3>
              <button 
                onClick={() => setIsAddModalOpen(false)}
                className="p-1 hover:bg-stone-200 rounded-full transition-colors text-stone-500"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">Product Name</label>
                <input
                  required
                  type="text"
                  value={newProduct.name}
                  onChange={(e) => setNewProduct({...newProduct, name: e.target.value})}
                  placeholder="e.g. Fresh Carrots"
                  className="w-full px-4 py-2 rounded-xl border border-stone-200 focus:ring-2 focus:ring-green-500 outline-none text-stone-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                 <div>
                    <label className="block text-sm font-medium text-stone-700 mb-1">Category</label>
                    <select
                      value={newProduct.category}
                      onChange={(e) => setNewProduct({...newProduct, category: e.target.value})}
                      className="w-full px-4 py-2 rounded-xl border border-stone-200 focus:ring-2 focus:ring-green-500 outline-none bg-white text-stone-900"
                    >
                      {CATEGORIES.filter(c => c.value !== 'ALL').map(c => (
                        <option key={c.value} value={c.value}>{c.label}</option>
                      ))}
                    </select>
                 </div>
                 <div>
                    <label className="block text-sm font-medium text-stone-700 mb-1">Unit</label>
                    <select
                      value={newProduct.unit}
                      onChange={(e) => setNewProduct({...newProduct, unit: e.target.value})}
                      className="w-full px-4 py-2 rounded-xl border border-stone-200 focus:ring-2 focus:ring-green-500 outline-none bg-white text-stone-900"
                    >
                      <option value="kg">kg</option>
                      <option value="g">g</option>
                      <option value="l">liter</option>
                      <option value="pc">piece</option>
                      <option value="jar">jar</option>
                      <option value="bunch">bunch</option>
                    </select>
                 </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">Price (€)</label>
                <div className="relative">
                  <Euro className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" size={16} />
                  <input
                    required
                    type="number"
                    step="0.01"
                    value={newProduct.price}
                    onChange={(e) => setNewProduct({...newProduct, price: e.target.value})}
                    placeholder="0.00"
                    className="w-full pl-10 pr-4 py-2 rounded-xl border border-stone-200 focus:ring-2 focus:ring-green-500 outline-none text-stone-900"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-green-700 text-white font-bold py-3 rounded-xl hover:bg-green-800 transition-colors shadow-lg mt-2"
              >
                Add to Inventory
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Edit Profile Modal */}
      {isEditProfileOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden animate-in slide-in-from-bottom-8 duration-300 flex flex-col max-h-[90vh]">
            <div className="p-4 border-b border-stone-100 flex justify-between items-center bg-stone-50">
              <h3 className="font-bold text-stone-800 flex items-center gap-2">
                <Edit size={18} /> Edit Profile
              </h3>
              <button 
                onClick={() => setIsEditProfileOpen(false)}
                className="p-1 hover:bg-stone-200 rounded-full transition-colors text-stone-500"
              >
                <X size={20} />
              </button>
            </div>

            <div className="overflow-y-auto">
              <form onSubmit={handleProfileUpdate} className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1">Farm Name</label>
                  <input
                    required
                    type="text"
                    value={profileForm.name}
                    onChange={(e) => setProfileForm({...profileForm, name: e.target.value})}
                    className="w-full px-4 py-2 rounded-xl border border-stone-200 focus:ring-2 focus:ring-green-500 outline-none text-stone-900"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1">Description</label>
                  <textarea
                    rows={3}
                    value={profileForm.description}
                    onChange={(e) => setProfileForm({...profileForm, description: e.target.value})}
                    className="w-full px-4 py-2 rounded-xl border border-stone-200 focus:ring-2 focus:ring-green-500 outline-none resize-none text-stone-900"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                      <label className="block text-sm font-medium text-stone-700 mb-1">Phone</label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" size={16} />
                        <input
                          type="text"
                          value={profileForm.phone}
                          onChange={(e) => setProfileForm({...profileForm, phone: e.target.value})}
                          className="w-full pl-10 pr-4 py-2 rounded-xl border border-stone-200 focus:ring-2 focus:ring-green-500 outline-none text-stone-900"
                        />
                      </div>
                  </div>
                  <div>
                      <label className="block text-sm font-medium text-stone-700 mb-1">Email</label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" size={16} />
                        <input
                          type="email"
                          value={profileForm.email}
                          onChange={(e) => setProfileForm({...profileForm, email: e.target.value})}
                          className="w-full pl-10 pr-4 py-2 rounded-xl border border-stone-200 focus:ring-2 focus:ring-green-500 outline-none text-stone-900"
                        />
                      </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1">Location / Address</label>
                  <div className="relative mb-2">
                      <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" size={16} />
                      <input
                        type="text"
                        value={profileForm.address}
                        onChange={(e) => setProfileForm({...profileForm, address: e.target.value})}
                        className="w-full pl-10 pr-4 py-2 rounded-xl border border-stone-200 focus:ring-2 focus:ring-green-500 outline-none text-stone-900"
                      />
                  </div>
                  <button
                    type="button"
                    onClick={handleUpdateLocation}
                    disabled={isLocating}
                    className="text-xs font-medium text-green-700 hover:text-green-800 flex items-center gap-1 bg-green-50 px-3 py-1.5 rounded-lg border border-green-100 hover:bg-green-100 transition-colors"
                  >
                      {isLocating ? <Loader2 size={12} className="animate-spin" /> : <Crosshair size={12} />}
                      Update from my current GPS
                  </button>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    className="w-full bg-green-700 text-white font-bold py-3 rounded-xl hover:bg-green-800 transition-colors shadow-lg flex items-center justify-center gap-2"
                  >
                    <Save size={18} /> Save Changes
                  </button>
                </div>
              </form>

              {/* Danger Zone */}
              <div className="px-6 pb-6 pt-2">
                <div className="border-t border-red-100 pt-4">
                  <h4 className="text-sm font-bold text-red-700 mb-1 flex items-center gap-1">
                    <AlertTriangle size={14} /> Danger Zone
                  </h4>
                  <p className="text-xs text-stone-500 mb-3">
                    Permanently remove your profile and all data.
                  </p>
                  <button
                    type="button"
                    onClick={handleDeleteAccount}
                    className="w-full bg-white border border-red-200 text-red-600 font-medium py-2 rounded-xl hover:bg-red-50 transition-colors text-sm flex items-center justify-center gap-2"
                  >
                    <Trash2 size={16} /> Delete Account
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyFarm;
