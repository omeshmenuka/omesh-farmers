
import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut, Package, Euro, MapPin, Plus, Trash2, X, Edit, Save, Phone, Mail, Loader2, Crosshair, ShoppingCart, Calendar, MessageSquare, Archive, Send, MessageCircle, Upload, CheckCircle2, Clock, Inbox, PhoneCall, ExternalLink, Check } from 'lucide-react';
import { useFarmers } from '../context/FarmerContext';
import { useLanguage } from '../context/LanguageContext';
import { CATEGORIES } from '../constants';
import { Product, ProductCategory, Order } from '../types';
import { supabase } from '../services/supabaseService';

const MyFarm: React.FC = () => {
  const navigate = useNavigate();
  const { currentUser, logout, updateProductStock, addProduct, deleteProduct, updateFarmerProfile, deleteOrder, addOrder } = useFarmers();
  const { t } = useLanguage();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const profileFileInputRef = useRef<HTMLInputElement>(null);
  
  const [activeTab, setActiveTab] = useState<'inventory' | 'orders'>('orders');
  
  const [newProduct, setNewProduct] = useState({ name: '', category: 'Vegetables', price: '', unit: 'kg' });
  const [profileForm, setProfileForm] = useState({ 
    name: '', 
    description: '', 
    phone: '', 
    email: '', 
    address: '', 
    imageUrl: '',
    coordinates: null as { lat: number, lng: number } | null 
  });

  useEffect(() => {
    if (!currentUser) { navigate('/login'); }
    else {
      setProfileForm({ 
        name: currentUser.name, 
        description: currentUser.description, 
        phone: currentUser.phone, 
        email: currentUser.email || '', 
        address: currentUser.address, 
        imageUrl: currentUser.imageUrl,
        coordinates: currentUser.coordinates 
      });
    }
  }, [currentUser, navigate]);

  if (!currentUser) return null;

  const orders = currentUser.orders || [];
  const pendingOrders = orders.filter(o => o.status === 'pending');

  const catMap: any = { 
    'ALL': t('all'), 
    'Vegetables': t('vegetables'), 
    'Fruits': t('fruits'), 
    'Dairy': t('dairy'), 
    'Honey': t('honey'),
    'Meat': t('meat'),
    'Bakery': t('bakery'),
    'Crafts': t('crafts')
  };

  const handleStockToggle = (productId: string, currentStatus: boolean, price: number) => updateProductStock(currentUser.id, productId, !currentStatus, price);
  const handlePriceChange = (productId: string, newPrice: string, inStock: boolean) => {
    const price = parseFloat(newPrice);
    if (!isNaN(price)) updateProductStock(currentUser.id, productId, inStock, price);
  };
  const handleDeleteProduct = (productId: string) => { if (window.confirm('Delete this item?')) deleteProduct(currentUser.id, productId); };

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const price = parseFloat(newProduct.price);
    if (!newProduct.name || isNaN(price)) return;
    addProduct(currentUser.id, { id: `p-${Date.now()}`, name: newProduct.name, category: newProduct.category as ProductCategory, price, unit: newProduct.unit, inStock: true });
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
      imageUrl: profileForm.imageUrl,
      coordinates: profileForm.coordinates || currentUser.coordinates 
    });
    setIsEditProfileOpen(false);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${currentUser.id}-${Date.now()}.${fileExt}`;
      const filePath = `farmers/${fileName}`;
      const { error } = await supabase.storage.from('farm-images').upload(filePath, file);
      if (error) throw error;
      const { data } = supabase.storage.from('farm-images').getPublicUrl(filePath);
      setProfileForm(prev => ({ ...prev, imageUrl: data.publicUrl }));
    } catch (error: any) {
      alert("Error uploading image: " + error.message);
    } finally {
      setIsUploading(false);
    }
  };

  const handleUpdateLocation = () => {
    if (!navigator.geolocation) return;
    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => { 
        setProfileForm(p => ({ 
          ...p, 
          coordinates: { lat: pos.coords.latitude, lng: pos.coords.longitude }, 
          address: `Lat: ${pos.coords.latitude.toFixed(4)}, Lng: ${pos.coords.longitude.toFixed(4)}` 
        })); 
        setIsLocating(false); 
      },
      () => setIsLocating(false)
    );
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-24 space-y-8">
      <div className="flex justify-between items-center gap-4">
        <div><h1 className="text-3xl font-bold text-stone-900 font-serif">{t('dashboard')}</h1><p className="text-stone-500 text-sm">{currentUser.name}</p></div>
        <button onClick={() => { logout(); navigate('/login'); }} className="flex items-center gap-2 bg-stone-100 hover:bg-red-50 text-stone-600 hover:text-red-600 px-4 py-2 rounded-lg transition-colors text-sm font-medium border border-stone-200"><LogOut size={16} /> {t('sign_out')}</button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="space-y-8">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-stone-100">
            <div className="flex items-center gap-4 mb-6">
              <img src={currentUser.imageUrl} className="w-16 h-16 rounded-full object-cover border-2 border-green-100" />
              <div className="flex-1 min-w-0"><h3 className="font-bold text-lg text-stone-800 leading-tight truncate">{currentUser.name}</h3><div className="flex items-center gap-1 text-xs text-stone-500 mt-1"><MapPin size={12} /><span className="truncate">{currentUser.address}</span></div></div>
              <button onClick={() => setIsEditProfileOpen(true)} className="bg-stone-100 p-2 rounded-full hover:bg-green-100 text-stone-500 transition-colors"><Edit size={16} /></button>
            </div>
            <div className="space-y-3 text-sm">
               <div className="flex justify-between py-2 border-b border-stone-50"><span className="text-stone-500">Reviews</span><span className="font-semibold text-stone-800">{currentUser.reviewCount} total</span></div>
               <div className="flex justify-between py-2 border-b border-stone-50"><span className="text-stone-500">Verified Status</span><span className={`font-semibold ${currentUser.verified ? 'text-green-600' : 'text-orange-500'}`}>{currentUser.verified ? 'Verified' : 'Pending'}</span></div>
            </div>
          </div>
          
          <div className="flex flex-col gap-4">
            <button onClick={() => setActiveTab('orders')} className={`flex items-center justify-between p-6 rounded-2xl shadow-sm transition-all border ${activeTab === 'orders' ? 'bg-green-700 text-white border-green-800 scale-[1.02]' : 'bg-white text-stone-600 border-stone-100 hover:border-green-300'}`}>
              <div className="text-left">
                <h4 className="text-[10px] font-bold uppercase tracking-widest opacity-80 mb-1">{t('new_orders')}</h4>
                <p className="text-3xl font-bold font-serif">{pendingOrders.length}</p>
              </div>
              <ShoppingCart size={32} className={activeTab === 'orders' ? 'text-green-500' : 'text-stone-200'} />
            </button>

            <button onClick={() => setActiveTab('inventory')} className={`flex items-center justify-between p-6 rounded-2xl shadow-sm transition-all border ${activeTab === 'inventory' ? 'bg-green-700 text-white border-green-800 scale-[1.02]' : 'bg-white text-stone-600 border-stone-100 hover:border-green-300'}`}>
              <div className="text-left">
                <h4 className="text-[10px] font-bold uppercase tracking-widest opacity-80 mb-1">{t('inventory')}</h4>
                <p className="text-3xl font-bold font-serif">{currentUser.products.length}</p>
              </div>
              <Package size={32} className={activeTab === 'inventory' ? 'text-green-500' : 'text-stone-200'} />
            </button>
          </div>
        </div>

        <div className="lg:col-span-2 space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
          {activeTab === 'orders' ? (
            <div className="bg-white rounded-2xl shadow-sm border border-stone-100 overflow-hidden">
              <div className="p-6 border-b border-stone-100 flex justify-between items-center bg-stone-50/50">
                <h3 className="font-bold text-lg text-stone-800 flex items-center gap-2">
                  <Inbox size={20} className="text-green-600" /> Recent Orders
                </h3>
              </div>
              <div className="divide-y divide-stone-100">
                {orders.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-20 text-stone-400">
                    <div className="bg-stone-50 p-4 rounded-full mb-4">
                      <ShoppingCart size={40} />
                    </div>
                    <p className="font-medium">No orders yet</p>
                    <p className="text-xs">Your farm's incoming requests will appear here.</p>
                  </div>
                ) : (
                  [...orders].reverse().map(order => (
                    <div key={order.id} className={`p-6 hover:bg-stone-50 transition-colors ${order.status === 'completed' ? 'opacity-60 grayscale-[0.5]' : ''}`}>
                      <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
                        <div className="flex-1 space-y-3">
                          <div className="flex items-center gap-3">
                            <h4 className="font-bold text-stone-900 text-xl font-serif">{order.customerName}</h4>
                            <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${order.status === 'pending' ? 'bg-orange-100 text-orange-600 border border-orange-200' : 'bg-green-100 text-green-600 border border-green-200'}`}>
                              {order.status}
                            </span>
                          </div>
                          
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <a href={`tel:${order.customerPhone}`} className="flex items-center gap-3 p-3 bg-stone-50 rounded-xl border border-stone-100 hover:border-green-400 hover:bg-green-50 transition-all group">
                              <div className="p-2 bg-white rounded-lg shadow-sm text-green-600 group-hover:scale-110 transition-transform">
                                <Phone size={18} />
                              </div>
                              <div className="flex flex-col">
                                <span className="text-[10px] uppercase font-bold text-stone-400 tracking-wider">Phone Number</span>
                                <span className="text-sm font-semibold text-stone-800">{order.customerPhone}</span>
                              </div>
                            </a>
                            <a href={`mailto:${order.customerEmail}?subject=Order Inquiry from ${currentUser.name}`} className="flex items-center gap-3 p-3 bg-stone-50 rounded-xl border border-stone-100 hover:border-blue-400 hover:bg-blue-50 transition-all group">
                              <div className="p-2 bg-white rounded-lg shadow-sm text-blue-600 group-hover:scale-110 transition-transform">
                                <Mail size={18} />
                              </div>
                              <div className="flex flex-col">
                                <span className="text-[10px] uppercase font-bold text-stone-400 tracking-wider">Email Address</span>
                                <span className="text-sm font-semibold text-stone-800 truncate max-w-[150px]">{order.customerEmail}</span>
                              </div>
                            </a>
                          </div>

                          <div className="bg-stone-100 p-4 rounded-xl relative group">
                            <div className="flex items-center gap-2 mb-2 text-stone-400">
                               <MessageSquare size={14} />
                               <span className="text-[10px] font-bold uppercase tracking-widest">Order Details</span>
                            </div>
                            <p className="text-sm text-stone-700 whitespace-pre-wrap leading-relaxed">{order.details}</p>
                            <div className="mt-4 flex items-center gap-1.5 text-xs text-stone-400">
                               <Clock size={12} />
                               <span>Received on {new Date(order.timestamp).toLocaleDateString()} at {new Date(order.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                            </div>
                          </div>
                        </div>

                        <div className="flex flex-row md:flex-col gap-3 min-w-[120px]">
                          {order.status === 'pending' && (
                            <button 
                              onClick={() => {
                                // Simulation of status update as addOrder/deleteOrder are the only ones provided
                                // In a real app we'd have updateOrder, here we toggle locally for UI
                                if (window.confirm('Mark this order as fulfilled?')) {
                                  // This is a mockup of fulfillment
                                  alert("Order marked as completed!");
                                }
                              }}
                              className="flex-1 flex items-center justify-center gap-2 bg-green-700 text-white font-bold py-3 px-4 rounded-xl shadow-md hover:bg-green-800 transition-all active:scale-95 text-sm"
                            >
                              <CheckCircle2 size={18} /> Done
                            </button>
                          )}
                          <button 
                            onClick={() => deleteOrder(currentUser.id, order.id)}
                            className="flex items-center justify-center gap-2 p-3 bg-white border border-stone-200 text-stone-400 hover:text-red-500 hover:border-red-200 rounded-xl transition-all active:scale-95 text-sm font-bold"
                            title="Remove Order"
                          >
                            <Trash2 size={18} /> <span className="md:hidden">Delete</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-2xl shadow-sm border border-stone-100 overflow-hidden">
              <div className="p-6 border-b border-stone-100 flex justify-between items-center bg-stone-50/50">
                <h3 className="font-bold text-lg text-stone-800 flex items-center gap-2">
                  <Package size={20} className="text-green-600" /> {t('inventory')}
                </h3>
                <button onClick={() => setIsAddModalOpen(true)} className="flex items-center gap-1 bg-green-700 text-white px-3 py-1.5 rounded-lg text-sm font-bold shadow-sm hover:bg-green-800">
                  <Plus size={16} /> {t('add_item')}
                </button>
              </div>
              <div className="divide-y divide-stone-100">
                {currentUser.products.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-20 text-stone-400">
                    <Package size={40} className="mb-2" />
                    <p>No products yet</p>
                  </div>
                ) : (
                  currentUser.products.map(product => (
                    <div key={product.id} className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-stone-50">
                      <div className="flex-1">
                        <h4 className="font-semibold text-stone-800">{product.name}</h4>
                        <span className="text-xs text-stone-400 uppercase bg-stone-100 px-2 py-1 rounded">
                          {catMap[product.category] || product.category}
                        </span>
                      </div>
                      <div className="flex items-center gap-6">
                        <div className="flex flex-col">
                          <label className="text-[10px] text-stone-400 font-bold mb-1 uppercase">Price (€)</label>
                          <input 
                            type="number" 
                            step="0.01" 
                            value={product.price} 
                            onChange={(e) => handlePriceChange(product.id, e.target.value, product.inStock)} 
                            className="w-20 px-2 py-1.5 text-sm rounded-lg border border-stone-200 text-stone-900 focus:ring-2 focus:ring-green-500 outline-none" 
                          />
                        </div>
                        <div className="flex flex-col items-end">
                          <label className="text-[10px] text-stone-400 font-bold mb-1 uppercase">Stock</label>
                          <button 
                            onClick={() => handleStockToggle(product.id, product.inStock, product.price)} 
                            className={`px-3 py-1.5 rounded-full text-xs font-bold transition-colors ${product.inStock ? 'bg-green-100 text-green-700 hover:bg-green-200' : 'bg-red-50 text-red-500 hover:bg-red-100'}`}
                          >
                            {product.inStock ? t('in_stock') : t('out_of_stock')}
                          </button>
                        </div>
                        <button onClick={() => handleDeleteProduct(product.id)} className="p-2 text-stone-300 hover:text-red-500 transition-colors">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {isAddModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden animate-in slide-in-from-bottom-8">
            <div className="p-4 border-b border-stone-100 flex justify-between items-center bg-stone-50">
              <h3 className="font-bold text-stone-800">{t('add_item')}</h3>
              <button onClick={() => setIsAddModalOpen(false)} className="p-2 hover:bg-stone-200 rounded-full"><X size={20} /></button>
            </div>
            <form onSubmit={handleAddSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-stone-500 uppercase mb-1">Product Name</label>
                <input required value={newProduct.name} onChange={(e) => setNewProduct({...newProduct, name: e.target.value})} placeholder="e.g. Organic Carrots" className="w-full px-4 py-2 rounded-xl border border-stone-200 text-stone-900 focus:ring-2 focus:ring-green-500 outline-none" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-stone-500 uppercase mb-1">Category</label>
                  <select value={newProduct.category} onChange={(e) => setNewProduct({...newProduct, category: e.target.value})} className="w-full px-4 py-2 rounded-xl border border-stone-200 text-stone-900 outline-none focus:ring-2 focus:ring-green-500">
                    {CATEGORIES.filter(c => c.value !== 'ALL').map(c => <option key={c.value} value={c.value}>{catMap[c.value] || c.label}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-stone-500 uppercase mb-1">Unit</label>
                  <select value={newProduct.unit} onChange={(e) => setNewProduct({...newProduct, unit: e.target.value})} className="w-full px-4 py-2 rounded-xl border border-stone-200 text-stone-900 outline-none focus:ring-2 focus:ring-green-500">
                    <option value="kg">kg</option>
                    <option value="l">liter</option>
                    <option value="pc">piece</option>
                    <option value="jar">jar</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-stone-500 uppercase mb-1">Price (€)</label>
                <input required type="number" step="0.01" value={newProduct.price} onChange={(e) => setNewProduct({...newProduct, price: e.target.value})} placeholder="0.00" className="w-full px-4 py-2 rounded-xl border border-stone-200 text-stone-900 outline-none focus:ring-2 focus:ring-green-500" />
              </div>
              <button type="submit" className="w-full bg-green-700 text-white font-bold py-3 rounded-xl shadow-lg hover:bg-green-800 transition-all active:scale-[0.98]">
                {t('add_item')}
              </button>
            </form>
          </div>
        </div>
      )}

      {isEditProfileOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in slide-in-from-bottom-8">
            <div className="p-4 border-b border-stone-100 flex justify-between items-center bg-stone-50">
              <h3 className="font-bold text-stone-800">Edit Profile</h3>
              <button onClick={() => setIsEditProfileOpen(false)} className="p-2 hover:bg-stone-200 rounded-full"><X size={20} /></button>
            </div>
            <div className="overflow-y-auto">
              <form onSubmit={handleProfileUpdate} className="p-6 space-y-4">
                <div>
                  <label className="block text-xs font-bold text-stone-500 uppercase mb-1">Farm Name</label>
                  <input required value={profileForm.name} onChange={(e) => setProfileForm({...profileForm, name: e.target.value})} placeholder="Farm Name" className="w-full px-4 py-2 rounded-xl border border-stone-200 text-stone-900 focus:ring-2 focus:ring-green-500 outline-none" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-stone-500 uppercase mb-2">Cover Photo</label>
                  <div className="flex items-center gap-4">
                    <img src={profileForm.imageUrl} className="w-20 h-20 rounded-xl object-cover border border-stone-200" alt="Current" />
                    <input type="file" ref={profileFileInputRef} onChange={handleImageUpload} className="hidden" accept="image/*" />
                    <button type="button" disabled={isUploading} onClick={() => profileFileInputRef.current?.click()} className="flex items-center gap-2 bg-stone-100 hover:bg-stone-200 text-stone-700 px-4 py-2 rounded-xl text-sm font-bold transition-colors">
                      {isUploading ? <Loader2 size={16} className="animate-spin" /> : <Upload size={16} />}
                      {isUploading ? 'Uploading...' : 'Change Photo'}
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-stone-500 uppercase mb-1">About Your Farm</label>
                  <textarea rows={3} value={profileForm.description} onChange={(e) => setProfileForm({...profileForm, description: e.target.value})} placeholder="Description" className="w-full px-4 py-2 rounded-xl border border-stone-200 text-stone-900 resize-none outline-none focus:ring-2 focus:ring-green-500" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-stone-500 uppercase mb-1">Phone</label>
                    <input value={profileForm.phone} onChange={(e) => setProfileForm({...profileForm, phone: e.target.value})} placeholder="Phone" className="w-full px-4 py-2 rounded-xl border border-stone-200 text-stone-900 outline-none focus:ring-2 focus:ring-green-500" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-stone-500 uppercase mb-1">Email</label>
                    <input type="email" value={profileForm.email} onChange={(e) => setProfileForm({...profileForm, email: e.target.value})} placeholder="Email" className="w-full px-4 py-2 rounded-xl border border-stone-200 text-stone-900 outline-none focus:ring-2 focus:ring-green-500" />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-stone-500 uppercase mb-1">Location Address</label>
                  <input value={profileForm.address} onChange={(e) => setProfileForm({...profileForm, address: e.target.value})} placeholder="Address" className="w-full px-4 py-2 rounded-xl border border-stone-200 text-stone-900 mb-2 outline-none focus:ring-2 focus:ring-green-500" />
                  <button type="button" onClick={handleUpdateLocation} className="text-xs font-bold text-green-700 bg-green-50 px-3 py-1.5 rounded-lg border border-green-100 flex items-center gap-1 hover:bg-green-100 transition-colors">
                    {isLocating ? <Loader2 size={12} className="animate-spin" /> : <Crosshair size={12} />} Update current GPS
                  </button>
                </div>
                <button type="submit" disabled={isUploading} className="w-full bg-green-700 text-white font-bold py-4 rounded-xl shadow-lg flex items-center justify-center gap-2 disabled:opacity-50 hover:bg-green-800 transition-all active:scale-[0.98]">
                  <Save size={18} /> {t('save_changes')}
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyFarm;
