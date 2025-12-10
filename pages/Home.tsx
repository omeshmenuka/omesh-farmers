import React, { useState, useEffect, useRef } from 'react';
import { Search, Map as MapIcon, List } from 'lucide-react';
import { CATEGORIES } from '../constants';
import FarmerCard from '../components/FarmerCard';
import { useNavigate } from 'react-router-dom';
import { useFarmers } from '../context/FarmerContext';
import L from 'leaflet';

const Home: React.FC = () => {
  const navigate = useNavigate();
  const { farmers } = useFarmers();
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  
  // Leaflet Map refs
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<L.Map | null>(null);
  const markerLayerRef = useRef<L.LayerGroup | null>(null);

  // Filter farmers
  const filteredFarmers = farmers.filter(farmer => {
    const isApproved = farmer.isApproved;
    const matchesSearch = farmer.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          farmer.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'ALL' || 
                            farmer.products.some(p => p.category === selectedCategory);
    return isApproved && matchesSearch && matchesCategory;
  });

  // Initialize Leaflet Map
  useEffect(() => {
    if (viewMode === 'map' && mapRef.current && !mapInstance.current) {
      const map = L.map(mapRef.current).setView([56.9496, 24.1052], 10); // Riga Center

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
      }).addTo(map);

      markerLayerRef.current = L.layerGroup().addTo(map);
      mapInstance.current = map;
    }
    
    // Fix for map rendering issues when switching tabs
    if (viewMode === 'map' && mapInstance.current) {
      setTimeout(() => {
        mapInstance.current?.invalidateSize();
      }, 100);
    }
  }, [viewMode]);

  // Update Markers
  useEffect(() => {
    if (viewMode === 'map' && mapInstance.current && markerLayerRef.current) {
      markerLayerRef.current.clearLayers();

      filteredFarmers.forEach((farmer, index) => {
        const customIcon = L.divIcon({
          className: 'leaflet-div-icon',
          html: `
            <div class="relative group cursor-pointer" style="z-index: ${1000 + index};">
              <div class="animate-pin-float" style="animation-delay: ${index * 0.1}s">
                <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="#15803d" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="drop-shadow-lg transform transition-transform group-hover:scale-110">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                  <circle cx="12" cy="10" r="3" fill="white"></circle>
                </svg>
              </div>
              <div class="absolute -bottom-1 left-1/2 -translate-x-1/2 w-3 h-1 bg-black/20 rounded-full blur-[2px]"></div>
              
              <!-- Ping Effect on Hover -->
              <div class="absolute top-0 left-0 w-full h-full rounded-full bg-green-500/30 opacity-0 group-hover:animate-ping"></div>
            </div>
          `,
          iconSize: [40, 40],
          iconAnchor: [20, 40],
        });

        const marker = L.marker([farmer.coordinates.lat, farmer.coordinates.lng], { 
          icon: customIcon,
          zIndexOffset: 1000 
        });

        marker.on('click', () => {
          navigate(`/farmer/${farmer.id}`);
        });

        marker.bindPopup(`
          <div class="p-1 text-center">
            <h3 class="font-bold text-stone-800">${farmer.name}</h3>
            <p class="text-xs text-stone-500">${farmer.address}</p>
          </div>
        `);
        
        // Add hover open popup
        marker.on('mouseover', function (this: L.Marker) {
            this.openPopup();
        });

        if (markerLayerRef.current) {
          markerLayerRef.current.addLayer(marker);
        }
      });
    }
  }, [viewMode, filteredFarmers, navigate]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-4">
      {/* Animation Styles */}
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-8px); }
        }
        .animate-pin-float {
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
           {/* Leaflet Map Container */}
           <div id="map" ref={mapRef} className="absolute inset-0 z-0" style={{ height: '100%', width: '100%' }} />
           
           <div className="absolute top-4 left-4 bg-white/90 backdrop-blur px-4 py-2 rounded-lg text-sm font-medium text-stone-700 shadow-md z-[1000] pointer-events-none">
              Showing {filteredFarmers.length} nearby producers
           </div>
        </div>
      )}
    </div>
  );
};

export default Home;