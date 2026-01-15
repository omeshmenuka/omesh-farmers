
import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Upload, Loader2, CheckCircle, Crosshair, Map as MapIcon, X, Clock, User, Lock, Mail } from 'lucide-react';
import { CATEGORIES } from '../constants';
import { useFarmers } from '../context/FarmerContext';
import { useLanguage } from '../context/LanguageContext';
import { Farmer, ProductCategory } from '../types';
import { supabase } from '../services/supabaseService';
import L from 'leaflet';

const AddFarmer: React.FC = () => {
  const navigate = useNavigate();
  const { addFarmer } = useFarmers();
  const { t } = useLanguage();
  const [step, setStep] = useState<'form' | 'success'>('form');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [showMapPicker, setShowMapPicker] = useState(false);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    address: '',
    description: '',
    phone: '',
    email: '',
    username: '',
    password: '',
    categories: [] as string[],
    coordinates: null as { lat: number; lng: number } | null
  });

  const catMap: any = { 
    'Vegetables': t('vegetables'), 
    'Fruits': t('fruits'), 
    'Dairy': t('dairy'), 
    'Honey': t('honey'),
    'Meat': t('meat'),
    'Bakery': t('bakery'),
    'Crafts': t('crafts')
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const toggleCategory = (catValue: string) => {
    if (catValue === 'ALL') return;
    setFormData(prev => {
      const exists = prev.categories.includes(catValue);
      return {
        ...prev,
        categories: exists
          ? prev.categories.filter(c => c !== catValue)
          : [...prev.categories, catValue]
      };
    });
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setPreviewImage(URL.createObjectURL(file));
    }
  };

  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) return;
    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setFormData(prev => ({
          ...prev,
          coordinates: { lat: pos.coords.latitude, lng: pos.coords.longitude },
          address: `Lat: ${pos.coords.latitude.toFixed(4)}, Lng: ${pos.coords.longitude.toFixed(4)}`
        }));
        setIsLocating(false);
      },
      () => setIsLocating(false)
    );
  };

  useEffect(() => {
    if (showMapPicker && mapContainerRef.current && !mapInstanceRef.current) {
      const lat = formData.coordinates?.lat || 56.9496;
      const lng = formData.coordinates?.lng || 24.1052;
      const map = L.map(mapContainerRef.current).setView([lat, lng], 12);
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);
      mapInstanceRef.current = map;
    }
    if (showMapPicker && mapInstanceRef.current) {
      setTimeout(() => mapInstanceRef.current?.invalidateSize(), 100);
    }
  }, [showMapPicker]);

  const handleConfirmLocation = () => {
    if (mapInstanceRef.current) {
      const center = mapInstanceRef.current.getCenter();
      setFormData(prev => ({
        ...prev,
        coordinates: { lat: center.lat, lng: center.lng },
        address: prev.address || `Lat: ${center.lat.toFixed(4)}, Lng: ${center.lng.toFixed(4)}`
      }));
      setShowMapPicker(false);
    }
  };

  const uploadToSupabase = async (file: File): Promise<string | null> => {
    try {
      const fileName = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.]/g, '_')}`;
      const filePath = `farmers/${fileName}`;
      const { error } = await supabase.storage.from('farm-images').upload(filePath, file);
      if (error) throw error;
      const { data } = supabase.storage.from('farm-images').getPublicUrl(filePath);
      return data.publicUrl;
    } catch (e) {
      console.error("Upload error:", e);
      return null;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    let imageUrl = `https://picsum.photos/400/300?random=${Date.now()}`;
    if (selectedFile) {
      const uploaded = await uploadToSupabase(selectedFile);
      if (uploaded) imageUrl = uploaded;
    }

    const finalCoords = formData.coordinates || { lat: 56.9496, lng: 24.1052 };

    const newFarmer: Farmer = {
      id: Date.now().toString(),
      name: formData.name,
      description: formData.description,
      address: formData.address,
      coordinates: finalCoords,
      rating: 0,
      reviewCount: 0,
      imageUrl: imageUrl,
      isOpen: true,
      phone: formData.phone,
      email: formData.email,
      verified: false,
      isApproved: false,
      credentials: {
          username: formData.username,
          password: formData.password
      },
      products: formData.categories.map((cat, idx) => ({
        id: `p-${Date.now()}-${idx}`,
        name: `Fresh ${cat}`,
        category: cat as ProductCategory,
        price: 0,
        unit: 'kg',
        inStock: true
      }))
    };

    try {
      await fetch("https://formspree.io/f/mzznnyvg", {
        method: "POST",
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          _subject: `New Farmer Registration: ${formData.name}`,
          _replyto: formData.email,
          farm_name: formData.name,
          email: formData.email,
          username: formData.username,
          phone: formData.phone,
          address: formData.address,
          description: formData.description,
          categories: formData.categories.join(', '),
          coordinates_lat: finalCoords.lat,
          coordinates_lng: finalCoords.lng,
          image_url: imageUrl
        })
      });
    } catch (error) {
      console.error("Failed to notify via Formspree", error);
    }

    addFarmer(newFarmer);
    setIsSubmitting(false);
    setStep('success');
  };

  if (step === 'success') {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-6 animate-in fade-in duration-500 pb-20">
        <div className="bg-yellow-100 p-4 rounded-full text-yellow-700 mb-6"><Clock size={48} /></div>
        <h2 className="text-2xl font-bold text-stone-900 font-serif mb-2">{t('registration_pending')}</h2>
        <p className="text-stone-600 mb-8 max-w-xs">{t('pending_approval_msg')} <strong>{formData.username}</strong> once approved.</p>
        <button onClick={() => navigate('/')} className="bg-stone-900 text-white px-8 py-3 rounded-xl font-medium shadow-lg transition-all active:scale-95">{t('return_discover')}</button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-6 pb-24">
      <h1 className="text-2xl font-bold text-stone-900 font-serif mb-6">{t('join_market')}</h1>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div><label className="block text-sm font-medium text-stone-700 mb-1">{t('farm_name')}</label><input required name="name" value={formData.name} onChange={handleInputChange} placeholder="e.g. Amber Fields" className="w-full px-4 py-3 rounded-xl border border-stone-200 focus:ring-2 focus:ring-green-500 outline-none transition-all shadow-sm" /></div>
        
        <div className="bg-green-50 p-4 rounded-xl border border-green-100 space-y-4">
           <h3 className="text-xs font-bold text-green-800 uppercase tracking-widest flex items-center gap-2"><Lock size={14}/> Dashboard Login</h3>
           <div className="grid grid-cols-2 gap-4">
              <input required name="username" value={formData.username} onChange={handleInputChange} placeholder={t('username')} className="px-3 py-2 rounded-lg bg-white border border-stone-200 focus:ring-2 focus:ring-green-500 outline-none text-sm" />
              <input required type="password" name="password" value={formData.password} onChange={handleInputChange} placeholder={t('password')} className="px-3 py-2 rounded-lg bg-white border border-stone-200 focus:ring-2 focus:ring-green-500 outline-none text-sm" />
           </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-stone-700 mb-2">{t('primary_products')}</label>
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.filter(c => c.value !== 'ALL').map((cat) => (
              <button key={cat.value} type="button" onClick={() => toggleCategory(cat.value)} className={`px-4 py-2 rounded-lg text-xs font-semibold border transition-all ${formData.categories.includes(cat.value) ? 'bg-green-700 text-white border-green-700' : 'bg-white text-stone-600 border-stone-200 hover:border-green-500'}`}>{catMap[cat.value] || cat.label}</button>
            ))}
          </div>
        </div>

        <div><label className="block text-sm font-medium text-stone-700 mb-1">Description</label><textarea required name="description" value={formData.description} onChange={handleInputChange} rows={3} placeholder="About your organic harvest..." className="w-full px-4 py-3 rounded-xl border border-stone-200 focus:ring-2 focus:ring-green-500 outline-none transition-all resize-none shadow-sm" /></div>

        <div className="grid grid-cols-2 gap-4">
            <div><label className="block text-sm font-medium text-stone-700 mb-1">{t('phone')}</label><input required name="phone" value={formData.phone} onChange={handleInputChange} placeholder="+371..." className="w-full px-4 py-3 rounded-xl border border-stone-200 focus:ring-2 focus:ring-green-500 outline-none shadow-sm" /></div>
            <div><label className="block text-sm font-medium text-stone-700 mb-1">{t('email')}</label><input required type="email" name="email" value={formData.email} onChange={handleInputChange} placeholder="farm@example.com" className="w-full px-4 py-3 rounded-xl border border-stone-200 focus:ring-2 focus:ring-green-500 outline-none shadow-sm" /></div>
        </div>

        <div>
          <label className="block text-sm font-medium text-stone-700 mb-1">{t('location')}</label>
          <div className="space-y-3">
            <input required name="address" value={formData.address} onChange={handleInputChange} placeholder={t('address')} className="w-full px-4 py-3 rounded-xl border border-stone-200 focus:ring-2 focus:ring-green-500 outline-none shadow-sm" />
            <div className="flex gap-2">
              <button type="button" onClick={() => setShowMapPicker(true)} className="flex-1 bg-stone-100 text-stone-700 py-2.5 rounded-xl text-sm font-medium flex items-center justify-center gap-2 border border-stone-200 transition-all hover:bg-stone-200"><MapIcon size={16} /> Map Picker</button>
              <button type="button" onClick={handleUseCurrentLocation} disabled={isLocating} className="flex-1 bg-stone-100 text-stone-700 py-2.5 rounded-xl text-sm font-medium flex items-center justify-center gap-2 border border-stone-200 transition-all hover:bg-stone-200">{isLocating ? <Loader2 size={16} className="animate-spin" /> : <Crosshair size={16} />} Use GPS</button>
            </div>
          </div>
        </div>

        <div>
           <label className="block text-sm font-medium text-stone-700 mb-1">{t('cover_photo')}</label>
           <div onClick={() => fileInputRef.current?.click()} className="border-2 border-dashed border-stone-200 rounded-xl h-48 flex flex-col items-center justify-center text-stone-400 hover:bg-stone-50 hover:border-green-300 transition-all cursor-pointer overflow-hidden relative bg-stone-50">
              <input type="file" ref={fileInputRef} onChange={handleImageSelect} accept="image/*" className="hidden" />
              {previewImage ? <img src={previewImage} className="w-full h-full object-cover" /> : <div className="text-center"><Upload size={24} className="mx-auto mb-2 text-stone-300" /><span className="text-xs font-medium">Click to upload JPG/PNG</span></div>}
           </div>
        </div>

        <button type="submit" disabled={isSubmitting} className="w-full bg-green-700 text-white font-bold py-4 rounded-xl shadow-lg hover:bg-green-800 transition-all active:scale-[0.98] flex justify-center items-center gap-2">{isSubmitting ? <Loader2 size={20} className="animate-spin" /> : t('register_farm')}</button>
      </form>

      {showMapPicker && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-lg rounded-2xl overflow-hidden shadow-2xl flex flex-col h-[70vh]">
            <div className="p-4 border-b border-stone-100 flex justify-between items-center bg-white z-10">
              <h3 className="font-bold text-stone-800">Pin Location</h3>
              <button onClick={() => setShowMapPicker(false)} className="p-1 hover:bg-stone-100 rounded-full transition-colors"><X size={24} /></button>
            </div>
            <div className="relative flex-1 bg-stone-100 overflow-hidden">
              <div ref={mapContainerRef} className="absolute inset-0 z-0" />
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10 pointer-events-none pb-[16px]"><MapPin size={40} className="text-red-600 drop-shadow-lg" strokeWidth={2.5} /></div>
            </div>
            <div className="p-4 border-t border-stone-100 bg-white z-10"><button onClick={handleConfirmLocation} className="w-full bg-green-700 text-white font-bold py-3 rounded-xl hover:bg-green-800 transition-colors shadow-lg active:scale-[0.98]">Confirm Location</button></div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AddFarmer;
