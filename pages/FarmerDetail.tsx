
import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, Phone, MessageSquare, Heart, Share2, MapPin, Clock, Navigation, Check, X, Link as LinkIcon, Mail, Facebook, Twitter, CheckCircle, Copy, MessageCircle, Send, Star, Settings, ShoppingBag, Loader2 } from 'lucide-react';
import { useFarmers } from '../context/FarmerContext';
import { Order } from '../types';

const FarmerDetail: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { hash } = useLocation();
  const { farmers, followedIds, toggleFollow, rateFarmer, userRatings, currentUser, addOrder } = useFarmers();
  const ratingSectionRef = useRef<HTMLDivElement>(null);
  
  const [showShareToast, setShowShareToast] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);
  const [contactMode, setContactMode] = useState<'options' | 'form'>('options');
  const [contactForm, setContactForm] = useState({ name: '', email: '', message: '' });
  const [isSubmittingContact, setIsSubmittingContact] = useState(false);
  const [contactSuccess, setContactSuccess] = useState(false);
  
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
  const isOwner = currentUser && farmer && currentUser.id === farmer.id;

  useEffect(() => {
    if (hash === '#stock') {
      const element = document.getElementById('stock-section');
      if (element) {
        setTimeout(() => {
          element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 100);
      }
    }
  }, [hash, farmer]);

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
  const shareUrl = window.location.href;
  const rawPhone = farmer.phone.replace(/[^0-9]/g, '');

  const scrollToRating = () => {
    ratingSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  };

  const handleRateSubmit = (score: number) => {
    if (farmer.id) {
      rateFarmer(farmer.id, score);
    }
  };

  const handleOrderSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmittingOrder(true);
    
    try {
        const newOrder: Order = {
            id: `ord-${Date.now()}`,
            customerName: orderForm.name,
            customerEmail: orderForm.email,
            customerPhone: orderForm.phone,
            details: orderForm.orderDetails,
            timestamp: new Date(),
            status: 'pending'
        };

        addOrder(farmer.id, newOrder);

        const response = await fetch("https://formspree.io/f/mzznnyvg", {
            method: "POST",
            headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' },
            body: JSON.stringify({
                _subject: `New Order for ${farmer?.name}`,
                _replyto: orderForm.email,
                type: 'Order Request',
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
            setTimeout(() => { setIsOrderModalOpen(false); setOrderSuccess(false); }, 3000);
        } else {
            alert("Order saved, but notification failed. The farmer will see it in their dashboard.");
            setOrderSuccess(true);
        }
    } catch (error) {
        alert("Error submitting order.");
    } finally {
        setIsSubmittingOrder(false);
    }
  };

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmittingContact(true);
    try {
      const response = await fetch("https://formspree.io/f/mzznnyvg", {
        method: "POST",
        headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' },
        body: JSON.stringify({
          _subject: `New Message for ${farmer.name}`,
          _replyto: contactForm.email,
          farmer_name: farmer.name,
          sender_name: contactForm.name,
          sender_email: contactForm.email,
          message: contactForm.message
        })
      });
      if (response.ok) {
        setContactSuccess(true);
        setContactForm({ name: '', email: '', message: '' });
        setTimeout(() => { setIsContactModalOpen(false); setContactSuccess(false); setContactMode('options'); }, 3000);
      }
    } catch (error) { alert("Error submitting form."); } finally { setIsSubmittingContact(false); }
  };

  return (
    <div className="bg-stone-50 min-h-screen pb-20 relative">
      <div className="relative h-72 lg:h-96 w-full">
        <img src={farmer.imageUrl} alt={farmer.name} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
        <button onClick={() => navigate('/')} className="absolute top-4 left-4 bg-white/20 backdrop-blur-md hover:bg-white/30 text-white p-2 rounded-full transition-colors shadow-lg"><ArrowLeft size={24} /></button>
        <div className="absolute bottom-0 left-0 right-0 p-6 text-white max-w-7xl mx-auto w-full">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
            <div>
              <h1 className="text-4xl md:text-6xl font-bold font-serif mb-2 flex items-center gap-3 drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
                {farmer.name}
                {farmer.verified && <div className="bg-blue-500 rounded-full p-1 shadow-lg border-2 border-white"><CheckCircle size={20} className="text-white" /></div>}
              </h1>
              <a href={googleSearchUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-stone-200 hover:text-white transition-colors group cursor-pointer w-fit drop-shadow-md">
                <MapPin size={18} className="group-hover:text-green-400" />
                <span className="text-lg underline decoration-white/30">{farmer.address}</span>
              </a>
              <button 
                onClick={scrollToRating}
                className="flex items-center gap-2 mt-3 group"
              >
                <div className="flex items-center gap-1 bg-yellow-400/20 backdrop-blur-md px-2 py-1 rounded-lg border border-yellow-400/30 group-hover:bg-yellow-400/40 transition-colors">
                  <Star size={16} className="fill-yellow-400 text-yellow-400" />
                  <span className="font-bold text-yellow-100">{farmer.rating}</span>
                </div>
                <span className="text-stone-300 text-sm group-hover:text-white transition-colors">({farmer.reviewCount} reviews)</span>
              </button>
            </div>
            <div className="flex gap-3 items-center">
              <button 
                onClick={scrollToRating}
                className="bg-white/10 hover:bg-white/20 backdrop-blur text-white px-4 py-3 rounded-full transition-colors flex items-center gap-2 font-medium border border-white/20"
              >
                <Star size={20} /> <span className="hidden sm:inline">Rate</span>
              </button>
              <button onClick={() => setIsShareModalOpen(true)} className="bg-white/10 hover:bg-white/20 backdrop-blur text-white p-3 rounded-full transition-colors border border-white/20"><Share2 size={24} /></button>
              <button onClick={() => toggleFollow(farmer.id)} className={`px-6 py-3 rounded-full font-bold shadow-lg transition-all active:scale-95 flex items-center gap-2 border-2 ${isFollowed ? 'bg-white text-green-700 border-white' : 'bg-green-600 text-white border-green-600'}`}><Heart size={20} className={isFollowed ? 'fill-green-700' : ''} />{isFollowed ? 'Following' : 'Follow'}</button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <section className="bg-white p-6 rounded-2xl shadow-sm border border-stone-100">
            <h2 className="text-xl font-bold text-stone-800 mb-4">About the Farm</h2>
            <p className="text-stone-600 leading-relaxed text-lg">{farmer.description}</p>
          </section>

          {/* Rating Section - Primary Interaction */}
          <section ref={ratingSectionRef} className="bg-white p-6 rounded-2xl shadow-sm border border-stone-100 scroll-mt-24">
             <div className="flex items-center justify-between mb-6">
               <h2 className="text-xl font-bold text-stone-800">Rate this Producer</h2>
               {userRating > 0 && (
                 <span className="text-xs font-bold text-green-700 bg-green-100 px-3 py-1 rounded-full flex items-center gap-1">
                    <CheckCircle size={12}/> Voted
                 </span>
               )}
             </div>
             
             <div className="flex flex-col items-center justify-center py-8 bg-stone-50 rounded-2xl border border-stone-100 shadow-inner">
                <div className="flex gap-3">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      onClick={() => handleRateSubmit(star)}
                      onMouseEnter={() => !userRating && setHoverRating(star)}
                      onMouseLeave={() => !userRating && setHoverRating(0)}
                      className="p-1 transition-transform hover:scale-125"
                    >
                      <Star 
                        size={48} 
                        className={`transition-all duration-200 ${
                          star <= (hoverRating || userRating) 
                            ? 'fill-yellow-400 text-yellow-400 drop-shadow-sm' 
                            : 'fill-stone-200 text-stone-200'
                        }`} 
                      />
                    </button>
                  ))}
                </div>
                <div className="mt-4 text-center">
                  <p className="text-stone-800 font-bold text-lg">
                    {userRating > 0 
                      ? `You gave ${userRating} stars!` 
                      : hoverRating > 0 
                        ? `${hoverRating} stars` 
                        : 'Tap a star to rate'}
                  </p>
                  <p className="text-stone-400 text-sm mt-1">
                    {userRating > 0 ? "Thank you for helping our community!" : "Help others discover quality local food"}
                  </p>
                </div>
             </div>
          </section>

          {isOwner && (
            <div className="bg-green-50 border border-green-100 rounded-2xl p-6 flex justify-between items-center shadow-sm">
              <div><h3 className="font-bold text-green-900">Manage Your Farm</h3><p className="text-sm text-green-700">Update stock and view orders</p></div>
              <button onClick={() => navigate('/my-farm')} className="bg-green-700 text-white px-6 py-2 rounded-xl font-bold flex items-center gap-2 hover:bg-green-800 transition-colors shadow-md"><Settings size={18} /> Dashboard</button>
            </div>
          )}

          <section id="stock-section" className="scroll-mt-24">
            <h2 className="text-2xl font-bold text-stone-800 mb-4">Current Harvest</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {farmer.products.map(product => (
                <div key={product.id} className="bg-white p-4 rounded-xl shadow-sm border border-stone-100 flex justify-between items-center hover:border-green-300 transition-colors">
                  <div><h4 className="font-semibold text-stone-800">{product.name}</h4><span className="text-xs text-stone-500 uppercase font-bold tracking-wider">{product.category}</span></div>
                  <div className="text-right"><p className="text-green-700 font-bold text-lg">€{product.price.toFixed(2)} <span className="text-stone-400 text-sm font-normal">/ {product.unit}</span></p><span className={`text-xs font-bold ${product.inStock ? 'text-green-600' : 'text-red-400'}`}>{product.inStock ? 'In Stock' : 'Out of Stock'}</span></div>
                </div>
              ))}
            </div>
          </section>
        </div>

        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl shadow-md border border-stone-100 sticky top-24">
            <h3 className="text-lg font-bold text-stone-800 mb-4">Location & Contact</h3>
            <div className="space-y-3">
              <button onClick={() => window.open(googleMapsUrl, '_blank')} className="w-full bg-stone-100 hover:bg-green-100 text-stone-800 py-3 rounded-xl font-bold flex items-center justify-center gap-2 border border-stone-200 transition-colors"><Navigation size={20} /> Get Directions</button>
              <a href={`tel:${farmer.phone}`} className="w-full bg-green-700 hover:bg-green-800 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 shadow-md"><Phone size={20} /> Call {farmer.phone}</a>
              <button onClick={() => setIsContactModalOpen(true)} className="w-full bg-white border-2 border-stone-200 hover:border-green-600 text-stone-600 py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-colors"><MessageSquare size={20} /> Send Message</button>
              <button onClick={() => setIsOrderModalOpen(true)} className="w-full bg-orange-600 hover:bg-orange-700 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 shadow-md transition-all active:scale-95"><ShoppingBag size={20} /> Place Order Request</button>
            </div>
            <div className="mt-6 pt-6 border-t border-stone-100 flex flex-col gap-3">
               <div className="flex items-center gap-2 text-stone-600 text-sm">
                  <Clock size={16} className="text-stone-400" />
                  <span>Open: 09:00 - 18:00</span>
               </div>
               <div className="flex items-center gap-2 text-stone-600 text-sm">
                  <CheckCircle size={16} className="text-green-500" />
                  <span>Accepts Cash & Cards</span>
               </div>
            </div>
          </div>
        </div>
      </div>

      {/* Order Modal */}
      {isOrderModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden animate-in slide-in-from-bottom-8 duration-300 flex flex-col max-h-[90vh]">
            <div className="p-4 border-b border-stone-100 flex justify-between items-center bg-stone-50">
              <h3 className="font-bold text-stone-800 flex items-center gap-2"><ShoppingBag size={20} className="text-orange-600"/> Place Order</h3>
              <button onClick={() => setIsOrderModalOpen(false)} className="p-1 hover:bg-stone-200 rounded-full transition-colors text-stone-500"><X size={20} /></button>
            </div>
            <div className="overflow-y-auto p-6">
                {orderSuccess ? (
                    <div className="text-center py-10 animate-in fade-in zoom-in"><div className="bg-green-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6"><CheckCircle size={40} className="text-green-600" /></div><h3 className="text-xl font-bold text-stone-900 mb-2">Request Sent!</h3><p className="text-stone-600 text-sm">Your order has been sent to {farmer.name}. They will see it in their dashboard and contact you soon.</p></div>
                ) : (
                    <form onSubmit={handleOrderSubmit} className="space-y-4">
                        <div><label className="block text-sm font-medium text-stone-700 mb-1">Your Name</label><input required value={orderForm.name} onChange={(e) => setOrderForm({...orderForm, name: e.target.value})} className="w-full px-4 py-2.5 rounded-xl border border-stone-200 text-stone-900 focus:ring-2 focus:ring-green-500 outline-none" placeholder="Jane Doe"/></div>
                        <div className="grid grid-cols-2 gap-4">
                            <div><label className="block text-sm font-medium text-stone-700 mb-1">Phone</label><input required type="tel" value={orderForm.phone} onChange={(e) => setOrderForm({...orderForm, phone: e.target.value})} className="w-full px-4 py-2.5 rounded-xl border border-stone-200 text-stone-900 focus:ring-2 focus:ring-green-500 outline-none" placeholder="+371..."/></div>
                            <div><label className="block text-sm font-medium text-stone-700 mb-1">Email</label><input required type="email" value={orderForm.email} onChange={(e) => setOrderForm({...orderForm, email: e.target.value})} className="w-full px-4 py-2.5 rounded-xl border border-stone-200 text-stone-900 focus:ring-2 focus:ring-green-500 outline-none" placeholder="jane@example.com"/></div>
                        </div>
                        <div><label className="block text-sm font-medium text-stone-700 mb-1">Order Details</label><textarea required rows={5} value={orderForm.orderDetails} onChange={(e) => setOrderForm({...orderForm, orderDetails: e.target.value})} placeholder="What would you like to buy?" className="w-full px-4 py-3 rounded-xl border border-stone-200 text-stone-900 resize-none focus:ring-2 focus:ring-green-500 outline-none"/></div>
                        <button type="submit" disabled={isSubmittingOrder} className="w-full bg-stone-900 text-white font-bold py-3.5 rounded-xl flex items-center justify-center gap-2 hover:bg-stone-800 transition-colors shadow-lg">{isSubmittingOrder ? <Loader2 size={18} className="animate-spin" /> : 'Submit Order Request'}</button>
                    </form>
                )}
            </div>
          </div>
        </div>
      )}

      {/* Contact Form Modal */}
      {isContactModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-sm rounded-2xl shadow-2xl overflow-hidden animate-in slide-in-from-bottom-8 duration-300">
            <div className="p-4 border-b border-stone-100 flex justify-between items-center bg-stone-50">
              <h3 className="font-bold text-stone-800">{contactMode === 'options' ? `Contact ${farmer.name}` : 'Send Message'}</h3>
              <button onClick={() => { if (contactMode === 'form') { setContactMode('options'); } else { setIsContactModalOpen(false); } }} className="p-1 hover:bg-stone-200 rounded-full transition-colors text-stone-500">{contactMode === 'form' ? <ArrowLeft size={20} /> : <X size={20} />}</button>
            </div>
            <div className="p-6">
              {contactSuccess ? (
                <div className="text-center py-6 animate-in fade-in zoom-in"><div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"><CheckCircle size={32} className="text-green-600" /></div><h4 className="text-lg font-bold text-stone-900">Message Sent!</h4></div>
              ) : contactMode === 'options' ? (
                <div className="space-y-3">
                  <button onClick={() => setContactMode('form')} className="w-full flex items-center gap-4 p-4 rounded-xl bg-orange-50 border border-orange-200 group text-left transition-colors hover:bg-orange-100"><div className="bg-orange-500 text-white p-2.5 rounded-full"><Mail size={24} fill="currentColor" /></div><span className="font-bold text-stone-800">Direct Email / Form</span></button>
                  <a href={`https://wa.me/${rawPhone}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-4 p-4 rounded-xl bg-[#25D366]/10 border border-[#25D366]/20 group transition-colors hover:bg-[#25D366]/20"><div className="bg-[#25D366] text-white p-2.5 rounded-full"><MessageCircle size={24} fill="currentColor" /> </div><span className="font-bold text-stone-800">WhatsApp</span></a>
                </div>
              ) : (
                <form onSubmit={handleContactSubmit} className="space-y-4 animate-in slide-in-from-right-8 duration-300">
                   <div><label className="block text-sm font-medium text-stone-700 mb-1">Name</label><input required value={contactForm.name} onChange={(e) => setContactForm({...contactForm, name: e.target.value})} className="w-full px-4 py-2.5 rounded-xl border border-stone-200 text-stone-900 focus:ring-2 focus:ring-green-500 outline-none" placeholder="John Doe"/></div>
                   <div><label className="block text-sm font-medium text-stone-700 mb-1">Email</label><input required type="email" value={contactForm.email} onChange={(e) => setContactForm({...contactForm, email: e.target.value})} className="w-full px-4 py-2.5 rounded-xl border border-stone-200 text-stone-900 focus:ring-2 focus:ring-green-500 outline-none" placeholder="john@example.com"/></div>
                   <div><label className="block text-sm font-medium text-stone-700 mb-1">Message</label><textarea required rows={4} value={contactForm.message} onChange={(e) => setContactForm({...contactForm, message: e.target.value})} className="w-full px-4 py-2.5 rounded-xl border border-stone-200 text-stone-900 resize-none focus:ring-2 focus:ring-green-500 outline-none" placeholder="Hi..."/></div>
                   <button type="submit" disabled={isSubmittingContact} className="w-full bg-stone-900 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 shadow-lg hover:bg-stone-800 transition-colors">{isSubmittingContact ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}Send Message</button>
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
