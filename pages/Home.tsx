
import React, { useState, useEffect, useRef } from 'react';
import { Search, Map as MapIcon, List, Filter } from 'lucide-react';
import { CATEGORIES } from '../constants';
import FarmerCard from '../components/FarmerCard';
import { useNavigate } from 'react-router-dom';
import { useFarmers } from '../context/FarmerContext';
import L from 'leaflet';

const Home: React.FC = () => {
  const navigate = useNavigate();
  const { farmers } = useFarmers(); // Get farmers from context
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  
  // Map refs
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<L.Map | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);

  // Filter farmers: Must match search, category, AND be approved
  const filteredFarmers = farmers.filter(farmer => {
    const isApproved = farmer.isApproved;
    const matchesSearch = farmer.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          farmer.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'ALL' || 
                            farmer.products.some(p => p.category === selectedCategory);
    return isApproved && matchesSearch && matchesCategory;
  });

  // Initialize Map
  useEffect(() => {
    if (viewMode === 'map' && mapRef.current && !mapInstance.current) {
      const map = L.map(mapRef.current).setView([56.9496, 24.1052], 10); // Center on Riga

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
      }).addTo(map);

      // Create a layer group for markers to manage them easily
      const layerGroup = L.layerGroup().addTo(map);
      markersLayerRef.current = layerGroup;
      mapInstance.current = map;
    }

    // Cleanup on unmount or view switch (to list)
    return () => {
      if (viewMode === 'list' && mapInstance.current) {
        mapInstance.current.remove();
        mapInstance.current = null;
        markersLayerRef.current = null;
      }
    };
  }, [viewMode]);

  // Update Markers
  useEffect(() => {
    if (viewMode === 'map' && mapInstance.current && markersLayerRef.current) {
      const layerGroup = markersLayerRef.current;
      
      // Clear existing markers
      layerGroup.clearLayers();

      // Add markers
      filteredFarmers.forEach((farmer, index) => {
        // Animation delay for staggered effect
        const delay = index * 0.1; 
        
        // Custom HTML Icon
        const customIcon = L.divIcon({
          className: 'bg-transparent cursor-pointer', // Ensure it's clickable
          html: `
            <div class="relative group" style="animation-delay: ${delay}s">
              <div class="marker-float bg-green-700 w-10 h-10 rounded-full flex items-center justify-center text-white border-2 border-white shadow-lg transition-transform hover:scale-110">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
              </div>
              <div class="absolute top-full mt-1 left-1/2 -translate-x-1/2 bg-white text-stone-800 text-xs font-bold px-2 py-1 rounded shadow-md opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50">
                ${farmer.name}
              </div>
            </div>
          `,
          iconSize: [40, 40],
          iconAnchor: [20, 20], // Center the icon
        });

        const marker = L.marker([farmer.coordinates.lat, farmer.coordinates.lng], { 
          icon: customIcon,
          zIndexOffset: 1000 // Ensure markers are on top
        });
        
        // Bind click event
        marker.on('click', () => {
          navigate(`/farmer/${farmer.id}`);
        });

        marker.addTo(layerGroup);
      });
    }
  }, [viewMode, filteredFarmers, navigate]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-4">
      {/* Animation Styles */}
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-8px); }
        }
        .marker-float {
          animation: float 3s ease-in-out infinite;
        }
      `}</style>

      {/* Mobile-Style Header */}
      <div className="flex justify-between items-start mb-6">
        <div>
          <h1 className="text-3xl font-bold text-stone-900 font-serif">
            Discover
          </h1>
          <p className="text-stone-500 text-sm mt-1">
            Local farmers & markets in Riga
          </p>
        </div>

        {/* View Toggle - Top Right */}
        <div className="flex bg-white rounded-xl p-1 shadow-sm border border-stone-200">
           <button 
              onClick={() => setViewMode('map')}
              className={`p-2 rounded-lg transition-colors ${viewMode === 'map' ? 'bg-green-700 text-white shadow-sm' : 'text-stone-400 hover:text-stone-600'}`}
            >
              <MapIcon size={20} />
            </button>
            <button 
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-lg transition-colors ${viewMode === 'list' ? 'bg-green-700 text-white shadow-sm' : 'text-stone-400 hover:text-stone-600'}`}
            >
              <List size={20} />
            </button>
        </div>
      </div>

      {/* Search & Categories (Compact) */}
      <div className="mb-6 space-y-4">
         <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-stone-400" size={18} />
            <input 
              type="text" 
              placeholder="Search..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-11 pr-4 py-3 bg-white rounded-2xl border border-stone-200 focus:ring-2 focus:ring-green-500 focus:border-transparent shadow-sm outline-none text-sm"
            />
          </div>

        {/* Categories */}
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide -mx-4 px-4 sm:mx-0 sm:px-0">
          {CATEGORIES.map(cat => (
            <button
              key={cat.value}
              onClick={() => setSelectedCategory(cat.value)}
              className={`whitespace-nowrap px-5 py-2 rounded-full text-xs font-semibold transition-colors ${
                selectedCategory === cat.value
                  ? 'bg-stone-800 text-white shadow-md' 
                  : 'bg-white text-stone-600 border border-stone-200'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      {viewMode === 'list' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredFarmers.map(farmer => (
            <FarmerCard 
              key={farmer.id} 
              farmer={farmer} 
              onClick={() => navigate(`/farmer/${farmer.id}`)}
            />
          ))}
          {filteredFarmers.length === 0 && (
            <div className="col-span-full text-center py-20 text-stone-500">
              <p className="text-xl font-medium">No farmers found.</p>
            </div>
          )}
        </div>
      ) : (
        <div className="relative h-[600px] bg-stone-200 rounded-2xl overflow-hidden shadow-inner border border-stone-300">
           {/* Real Map Container */}
           <div id="map" ref={mapRef} className="absolute inset-0 z-0" style={{ height: '100%', width: '100%' }} />
           
           <div className="absolute top-4 left-4 bg-white/90 backdrop-blur px-4 py-2 rounded-lg text-sm font-medium text-stone-700 shadow-md z-[400] pointer-events-none">
              Showing {filteredFarmers.length} nearby producers
           </div>
        </div>
      )}
    </div>
  );
};

export default Home;
