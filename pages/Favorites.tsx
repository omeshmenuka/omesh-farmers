import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart, MapPin } from 'lucide-react';
import { useFarmers } from '../context/FarmerContext';
import FarmerCard from '../components/FarmerCard';

const Favorites: React.FC = () => {
  const navigate = useNavigate();
  const { farmers, followedIds } = useFarmers();

  const favoriteFarmers = farmers.filter(f => followedIds.includes(f.id));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-24">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-stone-900 font-serif">
          My Favorites
        </h1>
        <p className="text-stone-500 text-sm mt-1">
          Farms and markets you follow
        </p>
      </div>

      {favoriteFarmers.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {favoriteFarmers.map(farmer => (
            <FarmerCard 
              key={farmer.id} 
              farmer={farmer} 
              onClick={() => navigate(`/farmer/${farmer.id}`)}
            />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 text-center animate-in fade-in duration-500">
          <div className="bg-stone-100 p-6 rounded-full text-stone-300 mb-6">
            <Heart size={64} fill="currentColor" />
          </div>
          <h2 className="text-xl font-bold text-stone-800 mb-2 font-serif">No favorites yet</h2>
          <p className="text-stone-500 max-w-xs mb-8 leading-relaxed">
            Start following local farmers to build your personal list of sustainable food sources.
          </p>
          <button 
            onClick={() => navigate('/')}
            className="bg-green-700 text-white px-8 py-3 rounded-xl font-medium hover:bg-green-800 transition-colors flex items-center gap-2 shadow-lg active:scale-95 transform duration-200"
          >
            <MapPin size={18} />
            Discover Producers
          </button>
        </div>
      )}
    </div>
  );
};

export default Favorites;