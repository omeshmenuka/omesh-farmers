
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, Phone, MessageSquare, Heart, Share2, MapPin, Clock, Navigation, Check, X, Link as LinkIcon, Mail, Facebook, Twitter, CheckCircle, Copy, MessageCircle, Send, Star, Settings, ShoppingBag, Loader2 } from 'lucide-react';
import { useFarmers } from '../context/FarmerContext';

const FarmerDetail: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { hash } = useLocation();
  const { farmers, followedIds, toggleFollow, rateFarmer, userRatings, currentUser } = useFarmers();
  const [showShareToast, setShowShareToast] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  
  // Contact Modal State
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);
  const [contactMode, setContactMode] = useState<'options' | 'form'>('options');
  const [contactForm, setContactForm] = useState({ name: '', email: '', message: '' });
  const [isSubmittingContact, setIsSubmittingContact] = useState(false);
  const [contactSuccess, setContactSuccess] = useState(false);
  
  // Order Form State
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);
  const [isSubmittingOrder, setIsSubmittingOrder] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [orderForm, setOrderForm] = useState({
    name: '',
    email: '',
    phone: '',
    orderDetails: ''
  });

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

  // Reset contact mode when modal closes
  useEffect(() => {
    if (!isContactModalOpen) {
      setContactMode('options');
      setContactSuccess(false);
    }
  }, [isContactModalOpen]);

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

  // Contact Form Submission (General Message)
  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmittingContact(true);
    
    try {
      const response = await fetch("https://formspree.io/f/mzznnyvg", {
        method: "POST",
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          _subject: `New Message for ${farmer.name}`,
          _replyto: contactForm.email, // Important for notifications
          type: 'General Inquiry',
          farmer_name: farmer.name,
          sender_name: contactForm.name,
          sender_email: contactForm.email,
          message: contactForm.message
        })
      });

      if (response.ok) {
        setContactSuccess(true);
        setContactForm({ name: '', email: '', message: '' });
        setTimeout(() => {
          setIsContactModalOpen(false);
          setContactSuccess(false);
          setContactMode('options');
        }, 3000);
      } else {
        alert("Failed to send message. Please try again.");
      }
    } catch (error) {
      alert("Error submitting form. Please check your connection.");
    } finally {
      setIsSubmittingContact(false);
    }
  };

  // Order Submission Logic
  const handleOrderSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmittingOrder(true);
    
    try {
        const response = await fetch("https://formspree.io/f/mzznnyvg", {
            method: "POST",
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                _subject: `New Order for ${farmer?.name}`,
                _replyto: orderForm.email, // Important for notifications
                type: 'Order Request',
                farmer_id: farmer?.id,
                farmer_name: farmer?.name,
                customer_name: orderForm.name,
                customer_email: orderForm.email,
                customer_phone: orderForm.phone,
                order_details: orderForm.orderDetails
            })
        });
        
        if (response.ok) {
            setOrderSuccess(true);
            setOrderForm({ name: '', email: '', phone: '', orderDetails: '' });
            setTimeout(() => {
                setIsOrderModalOpen(false);
                setOrderSuccess(false);
            }, 3000);
        } else {
            alert("Failed to submit order. Please try again.");
        }
    } catch (error) {
        console.error(error);
        alert("Error submitting order. Please check your connection.");
    } finally {
        setIsSubmittingOrder(false);
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
              
              <button 
                onClick={() => setIsOrderModalOpen(true)}
                className="w-full bg-orange-600 hover:bg-orange-700 text-white py-3 rounded-xl font-medium flex items-center justify-center gap-2 transition-colors shadow-sm"
              >
                <ShoppingBag size={20} /> Place Order Request
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
              <h3 className="font-bold text-stone-800">
                {contactMode === 'options' ? `Contact ${farmer.name}` : 'Send Message'}
              </h3>
              <button 
                onClick={() => {
                  if (contactMode === 'form') {
                    setContactMode('options');
                  } else {
                    setIsContactModalOpen(false);
                  }
                }}
                className="p-1 hover:bg-stone-200 rounded-full transition-colors text-stone-500"
              >
                {contactMode === 'form' ? <ArrowLeft size={20} /> : <X size={20} />}
              </button>
            </div>

            <div className="p-6">
              {contactSuccess ? (
                <div className="text-center py-6 animate-in fade-in zoom-in">
                  <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                     <CheckCircle size={32} className="text-green-600" />
                  </div>
                  <h4 className="text-lg font-bold text-stone-900">Message Sent!</h4>
                  <p className="text-sm text-stone-500 mt-1">We've forwarded your message to {farmer.name}.</p>
                </div>
              ) : contactMode === 'options' ? (
                <>
                  <p className="text-sm text-stone-500 mb-6 text-center">
                    Choose your preferred way to message 
                    <br/>
                    <span className="font-semibold text-stone-800">{farmer.phone}</span>
                  </p>
                  
                  <div className="space-y-3">
                    {/* Direct Email Form */}
                    <button
                      onClick={() => setContactMode('form')}
                      className="w-full flex items-center gap-4 p-4 rounded-xl bg-orange-50 hover:bg-orange-100 transition-colors border border-orange-200 group text-left"
                    >
                        <div className="bg-orange-500 text-white p-2.5 rounded-full group-hover:scale-110 transition-transform">
                            <Mail size={24} fill="currentColor" className="text-white" />
                        </div>
                        <span className="font-bold text-stone-800">Direct Email / Form</span>
                    </button>

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
                </>
              ) : (
                <form onSubmit={handleContactSubmit} className="space-y-4 animate-in slide-in-from-right-8 duration-300">
                   <div>
                      <label className="block text-sm font-medium text-stone-700 mb-1">Your Name</label>
                      <input 
                        required 
                        value={contactForm.name}
                        onChange={(e) => setContactForm({...contactForm, name: e.target.value})}
                        className="w-full px-4 py-2.5 rounded-xl border border-stone-200 focus:ring-2 focus:ring-green-500 outline-none text-stone-900"
                        placeholder="John Doe"
                      />
                   </div>
                   <div>
                      <label className="block text-sm font-medium text-stone-700 mb-1">Your Email</label>
                      <input 
                        required 
                        type="email"
                        value={contactForm.email}
                        onChange={(e) => setContactForm({...contactForm, email: e.target.value})}
                        className="w-full px-4 py-2.5 rounded-xl border border-stone-200 focus:ring-2 focus:ring-green-500 outline-none text-stone-900"
                        placeholder="john@example.com"
                      />
                   </div>
                   <div>
                      <label className="block text-sm font-medium text-stone-700 mb-1">Message</label>
                      <textarea 
                        required 
                        rows={4}
                        value={contactForm.message}
                        onChange={(e) => setContactForm({...contactForm, message: e.target.value})}
                        className="w-full px-4 py-2.5 rounded-xl border border-stone-200 focus:ring-2 focus:ring-green-500 outline-none resize-none text-stone-900"
                        placeholder="Hi, I have a question about..."
                      />
                   </div>
                   <button 
                     type="submit" 
                     disabled={isSubmittingContact}
                     className="w-full bg-stone-900 text-white font-bold py-3 rounded-xl hover:bg-stone-800 transition-colors flex items-center justify-center gap-2 disabled:opacity-70"
                   >
                     {isSubmittingContact ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
                     Send Message
                   </button>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
      
      {/* Order Form Modal */}
      {isOrderModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden animate-in slide-in-from-bottom-8 duration-300 flex flex-col max-h-[90vh]">
            <div className="p-4 border-b border-stone-100 flex justify-between items-center bg-stone-50">
              <h3 className="font-bold text-stone-800 flex items-center gap-2">
                 <ShoppingBag size={20} className="text-orange-600"/> Place Order
              </h3>
              <button 
                onClick={() => setIsOrderModalOpen(false)}
                className="p-1 hover:bg-stone-200 rounded-full transition-colors text-stone-500"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="overflow-y-auto p-6">
                {orderSuccess ? (
                    <div className="text-center py-10 animate-in fade-in zoom-in duration-300">
                        <div className="bg-green-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                            <CheckCircle size={40} className="text-green-600" />
                        </div>
                        <h3 className="text-xl font-bold text-stone-900 mb-2">Request Sent!</h3>
                        <p className="text-stone-600 text-sm max-w-xs mx-auto">
                            Your order details have been sent to {farmer.name}. They will contact you shortly to confirm availability and pickup.
                        </p>
                    </div>
                ) : (
                    <form onSubmit={handleOrderSubmit} className="space-y-4">
                        <div className="bg-orange-50 p-4 rounded-xl text-xs text-orange-800 leading-relaxed border border-orange-100 mb-4">
                            Send an order request directly to <strong>{farmer.name}</strong>. List the items you want, and they will get back to you with the total price.
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-stone-700 mb-1">Your Name</label>
                            <input
                                required
                                type="text"
                                name="name"
                                value={orderForm.name}
                                onChange={(e) => setOrderForm({...orderForm, name: e.target.value})}
                                placeholder="Jane Doe"
                                className="w-full px-4 py-2.5 rounded-xl border border-stone-200 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all text-stone-900"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-stone-700 mb-1">Phone</label>
                                <input
                                    required
                                    type="tel"
                                    name="phone"
                                    value={orderForm.phone}
                                    onChange={(e) => setOrderForm({...orderForm, phone: e.target.value})}
                                    placeholder="+371..."
                                    className="w-full px-4 py-2.5 rounded-xl border border-stone-200 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all text-stone-900"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-stone-700 mb-1">Email</label>
                                <input
                                    required
                                    type="email"
                                    name="email"
                                    value={orderForm.email}
                                    onChange={(e) => setOrderForm({...orderForm, email: e.target.value})}
                                    placeholder="jane@example.com"
                                    className="w-full px-4 py-2.5 rounded-xl border border-stone-200 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all text-stone-900"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-stone-700 mb-1">Order Details</label>
                            <textarea
                                required
                                name="message"
                                rows={5}
                                value={orderForm.orderDetails}
                                onChange={(e) => setOrderForm({...orderForm, orderDetails: e.target.value})}
                                placeholder="I would like to order:&#10;- 5kg Potatoes&#10;- 2 jars of Honey&#10;Pickup tomorrow morning."
                                className="w-full px-4 py-3 rounded-xl border border-stone-200 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none resize-none transition-all text-stone-900"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={isSubmittingOrder}
                            className="w-full bg-stone-900 text-white font-bold py-3.5 rounded-xl hover:bg-stone-800 transition-colors shadow-lg active:scale-[0.98] flex items-center justify-center gap-2 mt-2 disabled:opacity-70 disabled:cursor-not-allowed"
                        >
                            {isSubmittingOrder ? (
                                <>
                                    <Loader2 size={18} className="animate-spin" /> Sending...
                                </>
                            ) : (
                                'Submit Order Request'
                            )}
                        </button>
                    </form>
                )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default FarmerDetail;
