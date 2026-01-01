
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut, Package, Euro, ToggleLeft, ToggleRight, MapPin, Plus, Trash2, X, Edit, Save, Phone, Mail, Loader2, Crosshair, AlertTriangle, ShoppingCart, Calendar, MessageSquare, Archive } from 'lucide-react';
import { useFarmers } from '../context/FarmerContext';
import { CATEGORIES } from '../constants';
import { Product, ProductCategory, Order } from '../types';

const MyFarm: React.FC = () => {
  const navigate = useNavigate();
  const { currentUser, logout, updateProductStock, addProduct, deleteProduct, updateFarmerProfile, deleteFarmer, deleteOrder } = useFarmers();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  
  const [newProduct, setNewProduct] = useState({ name: '', category: 'Vegetables', price: '', unit: 'kg' });
  const [profileForm, setProfileForm] = useState({ name: '', description: '', phone: '', email: '', address: '', coordinates: null as { lat: number, lng: number } | null });

  useEffect(() => {
    if (!currentUser) { navigate('/login'); }
    else {
      setProfileForm({ name: currentUser.name, description: currentUser.description, phone: currentUser.phone, email: currentUser.email || '', address: currentUser.address, coordinates: currentUser.coordinates });
    }
  }, [currentUser, navigate]);

  if (!currentUser) return null;

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
    updateFarmerProfile(currentUser.id, { name: profileForm.name, description: profileForm.description, phone: profileForm.phone, email: profileForm.email, address: profileForm.address, coordinates: profileForm.coordinates || currentUser.coordinates });
    setIsEditProfileOpen(false);
  };

  const handleUpdateLocation = () => {
    if (!navigator.geolocation) return;
    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => { setProfileForm(p => ({ ...p, coordinates: { lat: pos.coords.latitude, lng: pos.coords.longitude }, address: `GPS: ${pos.coords.latitude.toFixed(4)}, ${pos.coords.longitude.toFixed(4)}` })); setIsLocating(false); },
      () => { setIsLocating(false); alert("GPS Error"); }
    );
  };

  const handleArchiveOrder = (orderId: string) => {
    if (window.confirm('Archive this order? It will be removed from your dashboard.')) {
        deleteOrder(currentUser.id, orderId);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-24 space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-stone-900 font-serif">Farmer Dashboard</h1>
          <p className="text-stone-500 text-sm mt-1">Grow your business, {currentUser.name}</p>
        </div>
        <button onClick={() => { logout(); navigate('/login'); }} className="flex items-center gap-2 bg-stone-100 hover:bg-red-50 text-stone-600 hover:text-red-600 px-4 py-2 rounded-lg transition-colors text-sm font-medium border border-stone-200"><LogOut size={16} /> Sign Out</button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="space-y-8">
           {/* Profile Card */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-stone-100">
            <div className="flex items-center gap-4 mb-6">
              <img src={currentUser.imageUrl} className="w-16 h-16 rounded-full object-cover border-2 border-green-100" />
              <div className="flex-1 min-w-0"><h3 className="font-bold text-lg text-stone-800 leading-tight truncate">{currentUser.name}</h3><div className="flex items-center gap-1 text-xs text-stone-500 mt-1"><MapPin size={12} /><span className="truncate">{currentUser.address}</span></div></div>
              <button onClick={() => setIsEditProfileOpen(true)} className="bg-stone-100 p-2 rounded-full hover:bg-green-100 text-stone-500 transition-colors"><Edit size={16} /></button>
            </div>
            <div className="space-y-3 text-sm">
               <div className="flex justify-between py-2 border-b border-stone-50"><span className="text-stone-500">Status</span><span className={`font-semibold ${currentUser.isOpen ? 'text-green-600' : 'text-red-500'}`}>{currentUser.isOpen ? 'Open' : 'Closed'}</span></div>
               <div className="flex justify-between py-2 border-b border-stone-50"><span className="text-stone-500">Reviews</span><span className="font-semibold text-stone-800">{currentUser.reviewCount} total</span></div>
               <div className="flex justify-between py-2 border-b border-stone-50"><span className="text-stone-500">Verified</span><span className="font-semibold text-stone-800">{currentUser.verified ? 'Yes' : 'Pending'}</span></div>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="bg-green-700 text-white p-6 rounded-2xl shadow-lg relative overflow-hidden">
             <div className="relative z-10">
               <h4 className="text-green-100 text-xs font-bold uppercase tracking-widest mb-1">New Orders</h4>
               <p className="text-4xl font-bold font-serif">{(currentUser.orders || []).length}</p>
             </div>
             <ShoppingCart className="absolute -right-4 -bottom-4 text-green-600/30 w-32 h-32" />
          </div>
        </div>

        <div className="lg:col-span-2 space-y-8">
          {/* Orders Section */}
          <div className="bg-white rounded-2xl shadow-sm border border-stone-100 overflow-hidden">
             <div className="p-6 border-b border-stone-100 bg-orange-50/30">
               <h3 className="font-bold text-lg text-stone-800 flex items-center gap-2">
                 <ShoppingCart size={20} className="text-orange-600" /> Incoming Order Requests
               </h3>
             </div>
             <div className="divide-y divide-stone-100 max-h-[400px] overflow-y-auto">
                {(currentUser.orders || []).length === 0 ? (
                  <div className="p-12 text-center text-stone-400">
                    <p className="mb-2">No active order requests.</p>
                    <p className="text-xs">Customer inquiries will appear here as soon as they are submitted.</p>
                  </div>
                ) : (
                  currentUser.orders?.map((order: Order) => (
                    <div key={order.id} className="p-6 hover:bg-stone-50 transition-colors group">
                       <div className="flex justify-between items-start mb-4">
                         <div>
                            <h4 className="font-bold text-stone-900 text-lg">{order.customerName}</h4>
                            <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1">
                               <span className="text-xs text-stone-500 flex items-center gap-1"><Phone size={12}/> {order.customerPhone}</span>
                               <span className="text-xs text-stone-500 flex items-center gap-1"><Mail size={12}/> {order.customerEmail}</span>
                               <span className="text-xs text-stone-400 flex items-center gap-1"><Calendar size={12}/> {new Date(order.timestamp).toLocaleDateString()}</span>
                            </div>
                         </div>
                         <button 
                            onClick={() => handleArchiveOrder(order.id)}
                            className="p-2 text-stone-300 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-all"
                            title="Archive Order"
                          >
                           <Archive size={18} />
                         </button>
                       </div>
                       <div className="bg-stone-100 p-4 rounded-xl border border-stone-200">
                          <p className="text-sm text-stone-700 whitespace-pre-wrap leading-relaxed">
                             <MessageSquare size={14} className="inline mr-2 text-stone-400" />
                             {order.details}
                          </p>
                       </div>
                    </div>
                  ))
                )}
             </div>
          </div>

          {/* Inventory Section */}
          <div className="bg-white rounded-2xl shadow-sm border border-stone-100 overflow-hidden">
            <div className="p-6 border-b border-stone-100 flex justify-between items-center">
              <h3 className="font-bold text-lg text-stone-800 flex items-center gap-2"><Package size={20} className="text-green-600" /> My Inventory</h3>
              <button onClick={() => setIsAddModalOpen(true)} className="flex items-center gap-1 bg-green-700 text-white px-3 py-1.5 rounded-lg text-sm font-bold shadow-sm hover:bg-green-800"><Plus size={16} /> Add Item</button>
            </div>
            <div className="divide-y divide-stone-100">
              {currentUser.products.map(product => (
                <div key={product.id} className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-stone-50">
                  <div className="flex-1"><h4 className="font-semibold text-stone-800">{product.name}</h4><span className="text-xs text-stone-400 uppercase bg-stone-100 px-2 py-1 rounded">{product.category}</span></div>
                  <div className="flex items-center gap-6">
                    <div className="flex flex-col"><label className="text-[10px] text-stone-400 font-bold mb-1 uppercase">Price (€)</label><input type="number" step="0.01" value={product.price} onChange={(e) => handlePriceChange(product.id, e.target.value, product.inStock)} className="w-20 px-2 py-1.5 text-sm rounded-lg border border-stone-200 text-stone-900" /></div>
                    <div className="flex flex-col items-end"><label className="text-[10px] text-stone-400 font-bold mb-1 uppercase">Stock</label><button onClick={() => handleStockToggle(product.id, product.inStock, product.price)} className={`px-3 py-1.5 rounded-full text-xs font-bold ${product.inStock ? 'bg-green-100 text-green-700' : 'bg-red-50 text-red-500'}`}>{product.inStock ? 'In Stock' : 'Out Stock'}</button></div>
                    <button onClick={() => handleDeleteProduct(product.id)} className="p-2 text-stone-300 hover:text-red-500"><Trash2 size={16} /></button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Product Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden animate-in slide-in-from-bottom-8">
            <div className="p-4 border-b border-stone-100 flex justify-between items-center">
              <h3 className="font-bold text-stone-800">New Harvest Item</h3>
              <button onClick={() => setIsAddModalOpen(false)}><X size={20} /></button>
            </div>
            <form onSubmit={handleAddSubmit} className="p-6 space-y-4">
              <div><label className="text-sm font-medium">Name</label><input required value={newProduct.name} onChange={(e) => setNewProduct({...newProduct, name: e.target.value})} className="w-full px-4 py-2 rounded-xl border border-stone-200 text-stone-900" /></div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="text-sm font-medium">Category</label><select value={newProduct.category} onChange={(e) => setNewProduct({...newProduct, category: e.target.value})} className="w-full px-4 py-2 rounded-xl border text-stone-900">{CATEGORIES.filter(c => c.value !== 'ALL').map(c => <option key={c.value} value={c.value}>{c.label}</option>)}</select></div>
                <div><label className="text-sm font-medium">Unit</label><select value={newProduct.unit} onChange={(e) => setNewProduct({...newProduct, unit: e.target.value})} className="w-full px-4 py-2 rounded-xl border text-stone-900"><option value="kg">kg</option><option value="l">liter</option><option value="pc">piece</option><option value="jar">jar</option></select></div>
              </div>
              <div><label className="text-sm font-medium">Price (€)</label><input required type="number" step="0.01" value={newProduct.price} onChange={(e) => setNewProduct({...newProduct, price: e.target.value})} className="w-full px-4 py-2 rounded-xl border text-stone-900" /></div>
              <button type="submit" className="w-full bg-green-700 text-white font-bold py-3 rounded-xl shadow-lg">Add to Inventory</button>
            </form>
          </div>
        </div>
      )}

      {/* Profile Modal */}
      {isEditProfileOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden animate-in slide-in-from-bottom-8 flex flex-col max-h-[90vh]">
            <div className="p-4 border-b border-stone-100 flex justify-between items-center"><h3 className="font-bold text-stone-800">Edit Farm Profile</h3><button onClick={() => setIsEditProfileOpen(false)}><X size={20} /></button></div>
            <div className="overflow-y-auto"><form onSubmit={handleProfileUpdate} className="p-6 space-y-4">
              <div><label className="text-sm font-medium">Farm Name</label><input required value={profileForm.name} onChange={(e) => setProfileForm({...profileForm, name: e.target.value})} className="w-full px-4 py-2 rounded-xl border border-stone-200 text-stone-900" /></div>
              <div><label className="text-sm font-medium">Description</label><textarea rows={3} value={profileForm.description} onChange={(e) => setProfileForm({...profileForm, description: e.target.value})} className="w-full px-4 py-2 rounded-xl border border-stone-200 text-stone-900 resize-none" /></div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="text-sm font-medium">Phone</label><input value={profileForm.phone} onChange={(e) => setProfileForm({...profileForm, phone: e.target.value})} className="w-full px-4 py-2 rounded-xl border border-stone-200 text-stone-900" /></div>
                <div><label className="text-sm font-medium">Email</label><input type="email" value={profileForm.email} onChange={(e) => setProfileForm({...profileForm, email: e.target.value})} className="w-full px-4 py-2 rounded-xl border border-stone-200 text-stone-900" /></div>
              </div>
              <div><label className="text-sm font-medium">Address</label><input value={profileForm.address} onChange={(e) => setProfileForm({...profileForm, address: e.target.value})} className="w-full px-4 py-2 rounded-xl border border-stone-200 text-stone-900 mb-2" /><button type="button" onClick={handleUpdateLocation} className="text-xs font-bold text-green-700 bg-green-50 px-3 py-1.5 rounded-lg border border-green-100 flex items-center gap-1">{isLocating ? <Loader2 size={12} className="animate-spin" /> : <Crosshair size={12} />} Update GPS</button></div>
              <button type="submit" className="w-full bg-green-700 text-white font-bold py-3 rounded-xl shadow-lg flex items-center justify-center gap-2"><Save size={18} /> Save Changes</button>
            </form></div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyFarm;
