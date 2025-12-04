
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, Phone, MessageSquare, Heart, Share2, MapPin, Clock, Navigation, Check, X, Link as LinkIcon, Mail, Facebook, Twitter, CheckCircle, Copy, MessageCircle, Send, Star, Settings } from 'lucide-react';
import { useFarmers } from '../context/FarmerContext';

const FarmerDetail: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { hash } = useLocation();
  const { farmers, followedIds, toggleFollow, rateFarmer, userRatings, currentUser } = useFarmers();
  const [showShareToast, setShowShareToast] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);
  const [hoverRating, setHoverRating] = useState(0);
  
  const farmer = farmers.find(f => f.id === id);
  const isFollowed = id ? followedIds.includes(id) : false;
  const userRating = id ? userRatings[id] : 0;
  
  // Check if current user is the owner of this profile
  const isOwner = currentUser && farmer && currentUser.id === farmer.id;

  // Handle auto-scroll to stock section if hash is present
  useEffect(() => {
    if (hash === '#stock') {
      const element = document.getElementById('stock-section');
      if (element) {
        // Small timeout to ensure rendering is complete
        setTimeout(() => {
          element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 100);
      }
    }
  }, [hash, farmer]);

  if (!farmer) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-stone-800">Farmer not found</h2>
          <button onClick={() => navigate('/')} className="mt-4 text-green-700 underline">Back to Home</button>
        </div>
      </div>
    );
  }

  const googleMapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${farmer.coordinates.lat},${farmer.coordinates.lng}`;
  const googleSearchUrl = `https://www.google.com/maps/search/?api=1&query=${farmer.coordinates.lat},${farmer.coordinates.lng}`;
  
  // Share Data
  const shareUrl = window.location.href;
  const shareText = `Check out ${farmer.name}, a local farmer in Riga!`;
  const encodedUrl = encodeURIComponent(shareUrl);
  const encodedText = encodeURIComponent(shareText);

  // Phone formatting
  const rawPhone = farmer.phone.replace(/[^0-9]/g, '');

  const shareOptions = [
    { 
      name: 'WhatsApp', 
      icon: <MessageSquare size={24} />, 
      color: 'bg-[#25D366] hover:bg-[#20bd5a]', 
      href: `https://wa.me/?text=${encodedText}%20${encodedUrl}` 
    },
    { 
      name: 'Facebook', 
      icon: <Facebook size={24} />, 
      color: 'bg-[#1877F2] hover:bg-[#166fe5]', 
      href: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}` 
    },
    { 
      name: 'Twitter', 
      icon: <Twitter size={24} />, 
      color: 'bg-[#1DA1F2] hover:bg-[#1a91da]', 
      href: `https://twitter.com/intent/tweet?text=${encodedText}&url=${encodedUrl}` 
    },
    { 
      name: 'Email', 
      icon: <Mail size={24} />, 
      color: 'bg-stone-600 hover:bg-stone-700', 
      href: `mailto:?subject=${encodeURIComponent(farmer.name)}%20on%20Riga%20Harvest&body=${encodedText}%20${encodedUrl}` 
    }
  ];

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setShowShareToast(true);
      setTimeout(() => setShowShareToast(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handleToggleFollow = () => {
    if (farmer.id) {
      toggleFollow(farmer.id);
    }
  };

  const handleRate = (score: number) => {
    if (farmer.id) {
      rateFarmer(farmer.id, score);
    }
  };

  return (
    <div className="bg-stone-50 min-h-screen pb-20 relative">
      {/* Header Image */}
      <div className="relative h-72 lg:h-96 w-full">
        <img src={farmer.imageUrl} alt={farmer.name} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
        <button 
          onClick={() => navigate('/')}
          className="absolute top-4 left-4 bg-white/20 backdrop-blur-md hover:bg-white/30 text-white p-2 rounded-full transition-colors"
        >
          <ArrowLeft size={24} />
        </button>
        <div className="absolute bottom-0 left-0 right-0 p-6 text-white max-w-7xl mx-auto w-full">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
            <div>
              <h1 className="text-3xl md:text-5xl font-bold font-serif mb-2 flex items-center gap-3">
                {farmer.name}
                {farmer.verified && (
                   <div title="Verified by Riga Harvest" className="bg-blue-500 rounded-full p-1 shadow-lg">
                      <CheckCircle size={24} className="text-white" />
                   </div>
                )}
              </h1>
              
              <a 
                href={googleSearchUrl}
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-stone-200 hover:text-white transition-colors group cursor-pointer w-fit"
                title="View on Google Maps"
              >
                <MapPin size={18} className="group-hover:text-green-400 transition-colors" />
                <span className="text-lg underline decoration-white/30 hover:decoration-white/100 transition-all">{farmer.address}</span>
              </a>

              <div className="flex items-center gap-2 mt-3">
                 <div className="flex items-center gap-1 bg-yellow-400/20 backdrop-blur-sm px-2 py-1 rounded-lg border border-yellow-400/30">
                    <Star size={16} className="fill-yellow-400 text-yellow-400" />
                    <span className="font-bold text-yellow-100">{farmer.rating}</span>
                 </div>
                 <span className="text-stone-300 text-sm">({farmer.reviewCount} reviews)</span>
              </div>
            </div>
            <div className="flex gap-3 relative">
              <button 
                onClick={() => setIsShareModalOpen(true)}
                className="bg-white/10 hover:bg-white/20 backdrop-blur text-white p-3 rounded-full transition-colors active:scale-95"
              >
                <Share2 size={24} />
              </button>

              <button 
                onClick={handleToggleFollow}
                className={`px-6 py-3 rounded-full font-medium shadow-lg transition-all active:scale-95 flex items-center gap-2 border-2 ${
                  isFollowed 
                    ? 'bg-white text-green-700 border-white hover:bg-stone-50' 
                    : 'bg-green-600 text-white border-green-600 hover:bg-green-500'
                }`}
              >
                <Heart size={20} className={isFollowed ? 'fill-green-700' : ''} /> 
                {isFollowed ? 'Following' : 'Follow'}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Col: Info & Products */}
        <div className="lg:col-span-2 space-y-8">
          
          <section className="bg-white p-6 rounded-2xl shadow-sm border border-stone-100">
            <h2 className="text-xl font-bold text-stone-800 mb-4">About the Farm</h2>
            <p className="text-stone-600 leading-relaxed text-lg">{farmer.description}</p>
            <div className="mt-6 flex flex-wrap gap-4">
              <div className="bg-green-50 px-4 py-2 rounded-lg text-green-800 text-sm font-medium flex items-center gap-2">
                <Clock size={16} />
                {farmer.isOpen ? 'Open Today: 08:00 - 18:00' : 'Closed Today'}
              </div>
              <div className="bg-stone-100 px-4 py-2 rounded-lg text-stone-600 text-sm font-medium">
                Established 2015
              </div>
            </div>
          </section>

          {/* Edit Stock Button for Owners */}
          {isOwner && (
            <div className="bg-green-50 border border-green-100 rounded-2xl p-6 flex justify-between items-center">
              <div>
                <h3 className="font-bold text-green-900">Manage Your Farm</h3>
                <p className="text-sm text-green-700">Update your stock and prices</p>
              </div>
              <button 
                onClick={() => navigate('/my-farm')}
                className="bg-green-700 text-white px-6 py-2 rounded-xl font-bold hover:bg-green-800 transition-colors flex items-center gap-2"
              >
                <Settings size={18} /> Edit Stock
              </button>
            </div>
          )}

          {/* Rate This Farmer Section */}
          <section className="bg-white p-6 rounded-2xl shadow-sm border border-stone-100">
             <div className="flex items-center justify-between mb-4">
               <h2 className="text-xl font-bold text-stone-800">Rate this Producer</h2>
               {userRating > 0 && (
                 <span className="text-xs font-semibold text-green-600 bg-green-50 px-3 py-1 rounded-full">
                    Thanks for your vote!
                 </span>
               )}
             </div>
             
             <div className="flex flex-col items-center justify-center py-4 bg-stone-50 rounded-xl border border-stone-100">
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      onClick={() => handleRate(star)}
                      onMouseEnter={() => !userRating && setHoverRating(star)}
                      onMouseLeave={() => !userRating && setHoverRating(0)}
                      className={`p-2 transition-transform hover:scale-110`}
                    >
                      <Star 
                        size={32} 
                        className={`transition-colors duration-200 ${
                          star <= (hoverRating || userRating) 
                            ? 'fill-yellow-400 text-yellow-400' 
                            : 'fill-stone-200 text-stone-200'
                        }`} 
                      />
                    </button>
                  ))}
                </div>
                <p className="text-stone-500 text-sm mt-2 font-medium">
                  {userRating > 0 
                    ? `You rated this ${userRating} stars` 
                    : hoverRating > 0 
                      ? `${hoverRating} stars` 
                      : 'Tap a star to rate'}
                </p>
             </div>
          </section>

          <section id="stock-section" className="scroll-mt-24">
            <h2 className="text-2xl font-bold text-stone-800 mb-4">Current Harvest</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {farmer.products.map(product => (
                <div key={product.id} className="bg-white p-4 rounded-xl shadow-sm border border-stone-100 flex justify-between items-center group hover:border-green-200 transition-colors">
                  <div>
                    <h4 className="font-semibold text-stone-800">{product.name}</h4>
                    <span className="text-xs text-stone-500 uppercase tracking-wide">{product.category}</span>
                  </div>
                  <div className="text-right">
                    <p className="text-green-700 font-bold">€{product.price.toFixed(2)} <span className="text-stone-400 text-sm font-normal">/ {product.unit}</span></p>
                    {product.inStock ? (
                      <span className="text-xs text-green-600 flex items-center justify-end gap-1">In Stock</span>
                    ) : (
                      <span className="text-xs text-red-400">Out of Stock</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>

        </div>

        {/* Right Col: Contact & AI */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-stone-100 sticky top-24">
            <h3 className="text-lg font-bold text-stone-800 mb-4">Location & Contact</h3>
            
            {/* Map Preview */}
            <div className="mb-4 rounded-xl overflow-hidden h-40 bg-stone-100 border border-stone-200 relative group">
              <iframe
                width="100%"
                height="100%"
                frameBorder="0"
                style={{ border: 0 }}
                src={`https://maps.google.com/maps?q=${farmer.coordinates.lat},${farmer.coordinates.lng}&z=13&output=embed`}
                allowFullScreen
                className="grayscale group-hover:grayscale-0 transition-all duration-500"
                title="Google Maps Preview"
              ></iframe>
              <div className="absolute inset-0 pointer-events-none border-2 border-transparent group-hover:border-green-500/20 rounded-xl transition-all"></div>
            </div>

            <div className="space-y-3">
              <button 
                onClick={() => window.open(googleMapsUrl, '_blank')}
                className="w-full bg-stone-100 hover:bg-green-100 text-stone-800 hover:text-green-800 py-3 rounded-xl font-medium flex items-center justify-center gap-2 transition-colors border border-stone-200 hover:border-green-200"
              >
                <Navigation size={20} /> Get Directions
              </button>

              <a 
                href={`tel:${farmer.phone}`}
                className="w-full bg-green-700 hover:bg-green-800 text-white py-3 rounded-xl font-medium flex items-center justify-center gap-2 transition-colors shadow-sm"
              >
                <Phone size={20} /> Call {farmer.phone}
              </a>
              
              <button 
                onClick={() => setIsContactModalOpen(true)}
                className="w-full bg-white border-2 border-stone-200 hover:border-green-600 hover:text-green-700 text-stone-600 py-3 rounded-xl font-medium flex items-center justify-center gap-2 transition-colors"
              >
                <MessageSquare size={20} /> Send Message
              </button>
            </div>
            
            <hr className="my-6 border-stone-100" />
            
            <div className="bg-blue-50 p-4 rounded-xl">
              <h4 className="font-semibold text-blue-900 text-sm mb-2">AI Insight</h4>
              <p className="text-blue-800 text-xs leading-relaxed">
                This farm is known for high-quality root vegetables. Customers often praise the freshness of their potatoes during the late summer harvest season.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Share Modal */}
      {isShareModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-sm rounded-2xl shadow-2xl overflow-hidden animate-in slide-in-from-bottom-8 duration-300">
            <div className="p-4 border-b border-stone-100 flex justify-between items-center bg-stone-50">
              <h3 className="font-bold text-stone-800">Share this Farm</h3>
              <button 
                onClick={() => setIsShareModalOpen(false)}
                className="p-1 hover:bg-stone-200 rounded-full transition-colors text-stone-500"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Social Links */}
              <div className="grid grid-cols-4 gap-4">
                {shareOptions.map((opt) => (
                  <a
                    key={opt.name}
                    href={opt.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex flex-col items-center gap-2 group"
                    onClick={() => setIsShareModalOpen(false)}
                  >
                    <div className={`${opt.color} text-white p-3 rounded-full shadow-sm transition-transform group-hover:scale-110`}>
                      {opt.icon}
                    </div>
                    <span className="text-xs font-medium text-stone-600">{opt.name}</span>
                  </a>
                ))}
              </div>

              {/* Copy Link Section */}
              <div>
                <label className="block text-xs font-semibold text-stone-500 uppercase mb-2">Page Link</label>
                <div className="flex items-center gap-2 bg-stone-100 p-2 rounded-xl border border-stone-200">
                  <div className="p-2 bg-white rounded-lg text-stone-400">
                    <LinkIcon size={16} />
                  </div>
                  <input 
                    type="text" 
                    readOnly 
                    value={shareUrl} 
                    className="bg-transparent border-none outline-none text-sm text-stone-600 flex-1 w-full truncate"
                  />
                  <button 
                    onClick={handleCopyLink}
                    className="bg-stone-800 hover:bg-stone-900 text-white px-3 py-1.5 rounded-lg text-xs font-medium transition-colors flex items-center gap-1"
                  >
                    {showShareToast ? <CheckCircle size={14} /> : <Copy size={14} />}
                    {showShareToast ? 'Copied' : 'Copy'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Contact Options Modal */}
      {isContactModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-sm rounded-2xl shadow-2xl overflow-hidden animate-in slide-in-from-bottom-8 duration-300">
            <div className="p-4 border-b border-stone-100 flex justify-between items-center bg-stone-50">
              <h3 className="font-bold text-stone-800">Contact {farmer.name}</h3>
              <button 
                onClick={() => setIsContactModalOpen(false)}
                className="p-1 hover:bg-stone-200 rounded-full transition-colors text-stone-500"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6">
              <p className="text-sm text-stone-500 mb-6 text-center">
                Choose your preferred way to message 
                <br/>
                <span className="font-semibold text-stone-800">{farmer.phone}</span>
              </p>
              
              <div className="space-y-3">
                {/* WhatsApp */}
                <a
                    href={`https://wa.me/${rawPhone}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-4 p-4 rounded-xl bg-[#25D366]/10 hover:bg-[#25D366]/20 transition-colors border border-[#25D366]/20 group"
                >
                    <div className="bg-[#25D366] text-white p-2.5 rounded-full group-hover:scale-110 transition-transform">
                        <MessageCircle size={24} fill="currentColor" className="text-white" /> 
                    </div>
                    <span className="font-bold text-stone-800">WhatsApp</span>
                </a>

                {/* Telegram */}
                <a
                    href={`https://t.me/+${rawPhone}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-4 p-4 rounded-xl bg-[#0088cc]/10 hover:bg-[#0088cc]/20 transition-colors border border-[#0088cc]/20 group"
                >
                    <div className="bg-[#0088cc] text-white p-2.5 rounded-full group-hover:scale-110 transition-transform">
                        <Send size={24} fill="currentColor" className="text-white" />
                    </div>
                    <span className="font-bold text-stone-800">Telegram</span>
                </a>

                {/* SMS */}
                <a
                    href={`sms:${farmer.phone}`}
                    className="flex items-center gap-4 p-4 rounded-xl bg-stone-100 hover:bg-stone-200 transition-colors border border-stone-200 group"
                >
                    <div className="bg-stone-600 text-white p-2.5 rounded-full group-hover:scale-110 transition-transform">
                        <MessageSquare size={24} fill="currentColor" className="text-white" />
                    </div>
                    <span className="font-bold text-stone-800">SMS / Message</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default FarmerDetail;
