
import React from 'react';
import { MapPin, Star, CheckCircle, Package } from 'lucide-react';
import { Farmer } from '../types';
import { useFarmers } from '../context/FarmerContext';
import { useNavigate } from 'react-router-dom';

interface FarmerCardProps {
  farmer: Farmer;
  onClick: () => void;
}

const FarmerCard: React.FC<FarmerCardProps> = ({ farmer, onClick }) => {
  const { currentUser } = useFarmers();
  const navigate = useNavigate();

  const handleViewStock = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigate(`/farmer/${farmer.id}#stock`);
  };

  return (
    <div 
      onClick={onClick}
      className="bg-white rounded-[20px] p-3 shadow-sm border border-stone-100 flex gap-4 items-start active:scale-[0.98] transition-transform cursor-pointer relative overflow-hidden group"
    >
      {/* Image Section */}
      <div className="relative w-28 h-28 flex-shrink-0">
        <img 
          src={farmer.imageUrl} 
          alt={farmer.name} 
          className="w-full h-full object-cover rounded-2xl"
        />
      </div>
      
      {/* Content Section */}
      <div className="flex-1 min-w-0 py-1 flex flex-col h-full">
        <div className="flex justify-between items-start mb-1">
          <h3 className="font-bold text-stone-900 text-lg leading-tight truncate pr-2">
            {farmer.name}
          </h3>
          {farmer.verified && (
            <div title="Verified Local Producer">
               <CheckCircle size={18} className="text-green-600 fill-green-100 flex-shrink-0" />
            </div>
          )}
        </div>
        
        <div className="flex items-center gap-1 text-stone-500 text-xs mb-2">
          <MapPin size={12} />
          <span className="truncate">{farmer.address}</span>
        </div>

        <div className="flex items-center gap-1 mb-3">
          <Star size={14} className="fill-orange-400 text-orange-400" />
          <span className="font-bold text-sm text-stone-800">{farmer.rating}</span>
          <span className="text-xs text-stone-400">({farmer.reviewCount})</span>
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-2 mb-2">
          {farmer.products.slice(0, 2).map(p => (
            <span key={p.id} className="bg-stone-100 text-stone-600 text-[10px] font-semibold px-2.5 py-1 rounded-lg">
              {p.category}
            </span>
          ))}
          {farmer.products.length > 2 && (
             <span className="text-stone-400 text-[10px] font-medium py-1">
               +{farmer.products.length - 2}
             </span>
          )}
        </div>

        {/* View Stock Button - Only for logged in farmers */}
        {currentUser && (
          <div className="mt-auto pt-1">
            <button
              onClick={handleViewStock}
              className="flex items-center gap-1 text-[10px] font-bold text-green-700 bg-green-50 px-3 py-1.5 rounded-full hover:bg-green-100 transition-colors w-fit"
            >
              <Package size={12} /> View Stock
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default FarmerCard;
