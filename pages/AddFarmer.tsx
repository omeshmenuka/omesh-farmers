
import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Upload, Loader2, CheckCircle, Crosshair, Map as MapIcon, X, Clock, User, Lock } from 'lucide-react';
import { CATEGORIES } from '../constants';
import { useFarmers } from '../context/FarmerContext';
import { Farmer, ProductCategory } from '../types';
import L from 'leaflet';

const AddFarmer: React.FC = () => {
  const navigate = useNavigate();
  const { addFarmer } = useFarmers();
  const [step, setStep] = useState<'form' | 'success'>('form');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  
  // Image Upload State
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Map Picker State
  const [showMapPicker, setShowMapPicker] = useState(false);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    address: '',
    description: '',
    phone: '',
    username: '',
    password: '',
    categories: [] as string[],
    coordinates: null as { lat: number; lng: number } | null
  });

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

  // Image Upload Handler
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      setPreviewImage(imageUrl);
    }
  };

  // Geolocation Handler
  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) return;
    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setFormData(prev => ({
          ...prev,
          coordinates: { lat: latitude, lng: longitude },
          address: `Lat: ${latitude.toFixed(4)}, Lng: ${longitude.toFixed(4)}`
        }));
        setIsLocating(false);
      },
      (error) => {
        console.error("Error getting location:", error);
        setIsLocating(false);
        alert("Could not access location. Please ensure permissions are granted.");
      }
    );
  };

  // Map Picker Effects
  useEffect(() => {
    if (showMapPicker && mapContainerRef.current && !mapInstanceRef.current) {
      const initialLat = formData.coordinates?.lat || 56.9496;
      const initialLng = formData.coordinates?.lng || 24.1052;
      
      const map = L.map(mapContainerRef.current).setView([initialLat, initialLng], 12);
      
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
      }).addTo(map);

      mapInstanceRef.current = map;
    }

    if (showMapPicker && mapInstanceRef.current) {
      setTimeout(() => {
        mapInstanceRef.current?.invalidateSize();
      }, 100);
    }
  }, [showMapPicker]);

  useEffect(() => {
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  const handleConfirmLocation = () => {
    if (mapInstanceRef.current) {
      const center = mapInstanceRef.current.getCenter();
      setFormData(prev => ({
        ...prev,
        coordinates: { lat: center.lat, lng: center.lng },
        address: prev.address || `Selected Location (${center.lat.toFixed(4)}, ${center.lng.toFixed(4)})`
      }));
      setShowMapPicker(false);
    }
  };


  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    setTimeout(() => {
      const finalCoordinates = formData.coordinates || { 
        lat: 56.9496 + (Math.random() - 0.5) * 0.1, 
        lng: 24.1052 + (Math.random() - 0.5) * 0.1 
      };

      const newFarmer: Farmer = {
        id: Date.now().toString(),
        name: formData.name,
        description: formData.description,
        address: formData.address,
        coordinates: finalCoordinates,
        rating: 0,
        reviewCount: 0,
        imageUrl: previewImage || `https://picsum.photos/400/300?random=${Date.now()}`,
        isOpen: true,
        phone: formData.phone,
        verified: false,
        isApproved: false,
        credentials: {
           username: formData.username || `user${Date.now()}`,
           password: formData.password || '123456'
        },
        products: formData.categories.map((cat, idx) => ({
          id: `new-${Date.now()}-${idx}`,
          name: `Seasonal ${cat}`,
          category: cat as ProductCategory,
          price: 0,
          unit: 'kg',
          inStock: true
        }))
      };

      addFarmer(newFarmer);
      setIsSubmitting(false);
      setStep('success');
    }, 1500);
  };

  if (step === 'success') {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-6 animate-in fade-in duration-500 pb-20">
        <div className="bg-yellow-100 p-4 rounded-full text-yellow-700 mb-6">
          <Clock size={48} />
        </div>
        <h2 className="text-2xl font-bold text-stone-900 font-serif mb-2">Submission Pending</h2>
        <p className="text-stone-600 mb-8 max-w-xs">
          Thank you! Your farm has been submitted. You can login with your username <strong>{formData.username}</strong> once approved.
        </p>
        <button 
          onClick={() => navigate('/')}
          className="bg-stone-900 text-white px-8 py-3 rounded-xl font-medium hover:bg-stone-800 transition-colors shadow-lg"
        >
          Return to Discover
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-6 pb-24">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-stone-900 font-serif">Add New Farmer</h1>
        <p className="text-stone-500 text-sm mt-1">Help grow our local community</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Name */}
        <div>
          <label className="block text-sm font-medium text-stone-700 mb-1">Farm / Market Name</label>
          <input
            required
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            placeholder="e.g. Zemes Dārzs"
            className="w-full px-4 py-3 rounded-xl bg-white border border-stone-200 focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all shadow-sm"
          />
        </div>

        {/* Credentials Section */}
        <div className="bg-green-50 p-4 rounded-xl border border-green-100">
           <h3 className="text-sm font-bold text-green-800 mb-3 flex items-center gap-2"><Lock size={14}/> Farmer Login Setup</h3>
           <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-stone-600 mb-1">Username</label>
                <input
                  required
                  name="username"
                  value={formData.username}
                  onChange={handleInputChange}
                  placeholder="Create username"
                  className="w-full px-3 py-2 rounded-lg bg-white border border-stone-200 focus:ring-2 focus:ring-green-500 outline-none text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-stone-600 mb-1">Password</label>
                <input
                  required
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder="Create password"
                  className="w-full px-3 py-2 rounded-lg bg-white border border-stone-200 focus:ring-2 focus:ring-green-500 outline-none text-sm"
                />
              </div>
           </div>
        </div>

        {/* Categories */}
        <div>
          <label className="block text-sm font-medium text-stone-700 mb-2">Products Sold</label>
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.filter(c => c.value !== 'ALL').map((cat) => (
              <button
                key={cat.value}
                type="button"
                onClick={() => toggleCategory(cat.value)}
                className={`px-4 py-2 rounded-lg text-xs font-semibold border transition-all ${
                  formData.categories.includes(cat.value)
                    ? 'bg-green-700 text-white border-green-700 shadow-sm'
                    : 'bg-white text-stone-600 border-stone-200 hover:border-green-500'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-stone-700 mb-1">Description</label>
          <textarea
            required
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            rows={3}
            placeholder="Tell us about the produce (organic, homemade, etc.)..."
            className="w-full px-4 py-3 rounded-xl bg-white border border-stone-200 focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all resize-none shadow-sm"
          />
        </div>

        {/* Location Section */}
        <div>
          <label className="block text-sm font-medium text-stone-700 mb-1">Location Details</label>
          
          <div className="space-y-3">
            <div className="relative">
              <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400" size={18} />
              <input
                required
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                placeholder="Address or select from map"
                className="w-full pl-11 pr-4 py-3 rounded-xl bg-white border border-stone-200 focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all shadow-sm"
              />
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setShowMapPicker(true)}
                className="flex-1 bg-stone-100 hover:bg-stone-200 text-stone-700 py-2.5 rounded-xl text-sm font-medium transition-colors flex items-center justify-center gap-2 border border-stone-200"
              >
                <MapIcon size={16} /> Select on Map
              </button>
              
              <button
                type="button"
                onClick={handleUseCurrentLocation}
                disabled={isLocating}
                className="flex-1 bg-stone-100 hover:bg-stone-200 text-stone-700 py-2.5 rounded-xl text-sm font-medium transition-colors flex items-center justify-center gap-2 border border-stone-200"
              >
                {isLocating ? <Loader2 size={16} className="animate-spin" /> : <Crosshair size={16} />}
                {isLocating ? 'Locating...' : 'Use My Location'}
              </button>
            </div>
          </div>
          
          {formData.coordinates && (
            <div className="mt-2 text-xs text-green-600 flex items-center gap-1 font-medium bg-green-50 p-2 rounded-lg border border-green-100 w-fit">
              <CheckCircle size={12} />
              Location pinned: {formData.coordinates.lat.toFixed(4)}, {formData.coordinates.lng.toFixed(4)}
            </div>
          )}
        </div>

        {/* Contact */}
        <div>
          <label className="block text-sm font-medium text-stone-700 mb-1">Phone Number</label>
          <input
            type="tel"
            name="phone"
            value={formData.phone}
            onChange={handleInputChange}
            placeholder="+371 20000000"
            className="w-full px-4 py-3 rounded-xl bg-white border border-stone-200 focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all shadow-sm"
          />
        </div>

        {/* Photo Upload */}
        <div>
           <label className="block text-sm font-medium text-stone-700 mb-1">Cover Photo</label>
           <input 
             type="file" 
             ref={fileInputRef} 
             onChange={handleImageUpload} 
             accept="image/*" 
             className="hidden" 
           />
           <div 
             onClick={() => fileInputRef.current?.click()}
             className="border-2 border-dashed border-stone-200 rounded-xl h-48 flex flex-col items-center justify-center text-stone-400 hover:bg-stone-50 hover:border-green-300 transition-all cursor-pointer overflow-hidden relative group bg-stone-50"
           >
              {previewImage ? (
                <>
                  <img src={previewImage} alt="Preview" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="bg-white/20 backdrop-blur text-white px-4 py-2 rounded-full flex items-center gap-2">
                      <Upload size={16} /> Change Photo
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div className="bg-white p-4 rounded-full shadow-sm mb-3 group-hover:scale-110 transition-transform">
                    <Upload size={24} className="text-green-600" />
                  </div>
                  <span className="text-sm font-medium text-stone-600">Tap to upload cover image</span>
                  <span className="text-xs text-stone-400 mt-1">JPG, PNG up to 5MB</span>
                </>
              )}
           </div>
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-green-700 text-white font-bold py-4 rounded-xl shadow-lg hover:bg-green-800 disabled:opacity-70 disabled:cursor-not-allowed transition-all active:scale-[0.98] flex justify-center items-center gap-2 mt-4"
        >
          {isSubmitting ? (
            <>
              <Loader2 size={20} className="animate-spin" />
              Submitting...
            </>
          ) : (
            'Submit Farmer'
          )}
        </button>
      </form>

      {/* Map Picker Modal */}
      {showMapPicker && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-lg rounded-2xl overflow-hidden shadow-2xl flex flex-col h-[70vh]">
            <div className="p-4 border-b border-stone-100 flex justify-between items-center bg-white z-10">
              <div>
                <h3 className="font-bold text-stone-800">Pin Location</h3>
                <p className="text-xs text-stone-500">Drag map to center the pin</p>
              </div>
              <button 
                onClick={() => setShowMapPicker(false)}
                className="p-1 hover:bg-stone-100 rounded-full transition-colors"
              >
                <X size={24} />
              </button>
            </div>
            
            <div className="relative flex-1 bg-stone-100 overflow-hidden">
              <div ref={mapContainerRef} className="absolute inset-0 z-0" />
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10 pointer-events-none pb-[16px]">
                <MapPin size={40} className="text-red-600 drop-shadow-lg fill-red-100" strokeWidth={2.5} />
              </div>
              <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10 bg-white/90 backdrop-blur px-4 py-2 rounded-full shadow-lg text-xs font-semibold text-stone-600 pointer-events-none whitespace-nowrap border border-white/50">
                Move map to place pin
              </div>
            </div>
            
            <div className="p-4 border-t border-stone-100 bg-white z-10">
              <button 
                onClick={handleConfirmLocation}
                className="w-full bg-green-700 text-white font-bold py-3 rounded-xl hover:bg-green-800 transition-colors shadow-lg active:scale-[0.98]"
              >
                Confirm Location
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AddFarmer;
