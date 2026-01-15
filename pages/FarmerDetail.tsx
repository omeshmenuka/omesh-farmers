
import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, Phone, MessageSquare, Heart, Share2, MapPin, Navigation, Check, X, Mail, Facebook, Twitter, CheckCircle, Copy, MessageCircle, Star, ShoppingBag, Loader2, Minus, Plus, Send } from 'lucide-react';
import { useFarmers } from '../context/FarmerContext';
import { useLanguage } from '../context/LanguageContext';
import { Order, Product } from '../types';

const FarmerDetail: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { hash } = useLocation();
  const { farmers, followedIds, toggleFollow, rateFarmer, userRatings, currentUser, addOrder } = useFarmers();
  const { t } = useLanguage();
  const ratingSectionRef = useRef<HTMLDivElement>(null);
  
  const [showShareToast, setShowShareToast] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);
  const [contactForm, setContactForm] = useState({ name: '', email: '', message: '' });
  const [isSubmittingContact, setIsSubmittingContact] = useState(false);
  const [contactSuccess, setContactSuccess] = useState(false);
  
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);
  const [orderStep, setOrderStep] = useState<'items' | 'details' | 'success'>('items');
  const [orderItems, setOrderItems] = useState<Record<string, number>>({});
  const [orderForm, setOrderForm] = useState({ name: '', email: '', phone: '', note: '' });
  const [isSubmittingOrder, setIsSubmittingOrder] = useState(false);

  const [hoverRating, setHoverRating] = useState(0);
  
  const farmer = farmers.find(f => f.id === id);
  const isFollowed = id ? followedIds.includes(id) : false;
  const userRating = id ? userRatings[id] : 0;

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

  const catMap: any = { 
    'Vegetables': t('vegetables'), 
    'Fruits': t('fruits'), 
    'Dairy': t('dairy'), 
    'Honey': t('honey'),
    'Meat': t('meat'),
    'Bakery': t('bakery'),
    'Crafts': t('crafts')
  };

  const shareUrl = window.location.href;
  const googleMapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${farmer.coordinates.lat},${farmer.coordinates.lng}`;
  const googleSearchUrl = `https://www.google.com/maps/search/?api=1&query=${farmer.coordinates.lat},${farmer.coordinates.lng}`;

  const scrollToRating = () => {
    ratingSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  };

  const handleRateSubmit = (score: number) => {
    if (farmer.id) rateFarmer(farmer.id, score);
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Check out ${farmer.name} on Riga Harvest`,
          text: `Fresh products from ${farmer.name} are available now!`,
          url: shareUrl,
        });
      } catch (err) {
        if (err instanceof Error && err.name !== 'AbortError') setIsShareModalOpen(true);
      }
    } else {
      setIsShareModalOpen(true);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(shareUrl).then(() => {
      setShowShareToast(true);
      setTimeout(() => setShowShareToast(false), 2000);
    });
  };

  const updateItemQty = (id: string, delta: number) => {
    setOrderItems(prev => {
      const current = prev[id] || 0;
      const next = Math.max(0, current + delta);
      return { ...prev, [id]: next };
    });
  };

  const handleOrderSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmittingOrder(true);
    
    const selectedList = Object.entries(orderItems)
      .filter(([_, qty]) => (qty as number) > 0)
      .map(([id, qty]) => {
        const p = farmer.products.find(item => item.id === id);
        return `${qty}x ${p?.name}`;
      }).join(', ');

    const newOrder: Order = {
      id: Date.now().toString(),
      customerName: orderForm.name,
      customerEmail: orderForm.email,
      customerPhone: orderForm.phone,
      details: `Items: ${selectedList}. Note: ${orderForm.note}`,
      timestamp: new Date(),
      status: 'pending'
    };

    setTimeout(() => {
      addOrder(farmer.id, newOrder);
      setIsSubmittingOrder(false);
      setOrderStep('success');
    }, 1500);
  };

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmittingContact(true);
    setTimeout(() => {
      setIsSubmittingContact(false);
      setContactSuccess(true);
      setTimeout(() => {
        setIsContactModalOpen(false);
        setContactSuccess(false);
        setContactForm({ name: '', email: '', message: '' });
      }, 2000);
    }, 1200);
  };

  const hasItemsInCart = Object.values(orderItems).some(v => (v as number) > 0);

  return (
    <div className="bg-stone-50 min-h-screen pb-20 relative">
      {showShareToast && (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 z-[100] bg-stone-900 text-white px-6 py-3 rounded-full shadow-2xl flex items-center gap-2 animate-in slide-in-from-top-4 duration-300">
          <CheckCircle size={18} className="text-green-400" />
          <span className="font-bold text-sm">{t('copied')}</span>
        </div>
      )}

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
              <div className="flex items-center gap-2 text-stone-200 drop-shadow-md">
                <MapPin size={18} />
                <span className="text-lg">{farmer.address}</span>
              </div>
            </div>
            <div className="flex gap-3 items-center">
              <button onClick={scrollToRating} className="bg-white/10 hover:bg-white/20 backdrop-blur text-white px-4 py-3 rounded-full transition-colors flex items-center gap-2 font-medium border border-white/20"><Star size={20} /> {t('rate')}</button>
              <button onClick={handleShare} className="bg-white/10 hover:bg-white/20 backdrop-blur text-white p-3 rounded-full transition-colors border border-white/20"><Share2 size={24} /></button>
              <button onClick={() => toggleFollow(farmer.id)} className={`px-6 py-3 rounded-full font-bold shadow-lg transition-all active:scale-95 flex items-center gap-2 border-2 ${isFollowed ? 'bg-white text-green-700 border-white' : 'bg-green-600 text-white border-green-600'}`}><Heart size={20} className={isFollowed ? 'fill-green-700' : ''} />{isFollowed ? t('following') : t('follow')}</button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <section className="bg-white p-6 rounded-2xl shadow-sm border border-stone-100">
            <h2 className="text-xl font-bold text-stone-800 mb-4">{t('about_farm')}</h2>
            <p className="text-stone-600 leading-relaxed text-lg">{farmer.description}</p>
          </section>

          <section id="stock-section" className="scroll-mt-24">
            <h2 className="text-2xl font-bold text-stone-800 mb-4">{t('harvest')}</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {farmer.products.map(product => (
                <div key={product.id} className="bg-white p-4 rounded-xl shadow-sm border border-stone-100 flex justify-between items-center">
                  <div><h4 className="font-semibold text-stone-800">{product.name}</h4><span className="text-xs text-stone-500 uppercase font-bold tracking-wider">{catMap[product.category] || product.category}</span></div>
                  <div className="text-right"><p className="text-green-700 font-bold text-lg">€{product.price.toFixed(2)} <span className="text-stone-400 text-sm font-normal">/ {product.unit}</span></p><span className={`text-xs font-bold ${product.inStock ? 'text-green-600' : 'text-red-400'}`}>{product.inStock ? t('in_stock') : t('out_of_stock')}</span></div>
                </div>
              ))}
            </div>
          </section>

          <section ref={ratingSectionRef} className="bg-white p-6 rounded-2xl shadow-sm border border-stone-100">
             <h2 className="text-xl font-bold text-stone-800 mb-6">{t('rate')}</h2>
             <div className="flex flex-col items-center justify-center py-8 bg-stone-50 rounded-2xl border border-stone-100 shadow-inner">
                <div className="flex gap-3">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button key={star} onClick={() => handleRateSubmit(star)} onMouseEnter={() => !userRating && setHoverRating(star)} onMouseLeave={() => !userRating && setHoverRating(0)} className="p-1 transition-transform hover:scale-125">
                      <Star size={48} className={`transition-all duration-200 ${star <= (hoverRating || userRating) ? 'fill-yellow-400 text-yellow-400' : 'fill-stone-200 text-stone-200'}`} />
                    </button>
                  ))}
                </div>
             </div>
          </section>
        </div>

        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl shadow-md border border-stone-100 sticky top-24">
            <h3 className="text-lg font-bold text-stone-800 mb-4">{t('contact_info')}</h3>
            <div className="space-y-3">
              <button onClick={() => window.open(googleMapsUrl, '_blank')} className="w-full bg-stone-100 hover:bg-green-100 text-stone-800 py-3 rounded-xl font-bold flex items-center justify-center gap-2 border border-stone-200 transition-colors"><Navigation size={20} /> {t('directions')}</button>
              <a href={`tel:${farmer.phone}`} className="w-full bg-green-700 hover:bg-green-800 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 shadow-md"><Phone size={20} /> {t('call')}</a>
              <button onClick={() => setIsContactModalOpen(true)} className="w-full bg-white border-2 border-stone-200 hover:border-green-600 text-stone-600 py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-colors"><MessageSquare size={20} /> {t('message')}</button>
              <button onClick={() => setIsOrderModalOpen(true)} className="w-full bg-orange-600 hover:bg-orange-700 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 shadow-md transition-all active:scale-95"><ShoppingBag size={20} /> {t('order_request')}</button>
            </div>
          </div>
        </div>
      </div>

      {/* Place Order Modal */}
      {isOrderModalOpen && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-lg rounded-[2rem] shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in slide-in-from-bottom-10">
            <div className="p-6 border-b border-stone-100 flex justify-between items-center bg-stone-50/50">
              <h3 className="text-2xl font-bold text-stone-900 font-serif">{t('order_request')}</h3>
              <button onClick={() => { setIsOrderModalOpen(false); setOrderStep('items'); }} className="p-2 hover:bg-stone-200 rounded-full transition-colors"><X size={24} /></button>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              {orderStep === 'items' && (
                <div className="space-y-6">
                  <p className="text-stone-500 text-sm mb-4">Select items and quantities from {farmer.name}:</p>
                  <div className="space-y-3">
                    {farmer.products.filter(p => p.inStock).map(product => (
                      <div key={product.id} className="flex items-center justify-between p-4 bg-stone-50 rounded-2xl border border-stone-100">
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-stone-800 truncate">{product.name}</p>
                          <p className="text-xs text-stone-500">€{product.price.toFixed(2)} / {product.unit}</p>
                        </div>
                        <div className="flex items-center gap-3 bg-white border border-stone-200 rounded-full px-2 py-1">
                          <button onClick={() => updateItemQty(product.id, -1)} className="p-1 hover:bg-stone-100 rounded-full text-stone-400 hover:text-red-500"><Minus size={18} /></button>
                          <span className="w-8 text-center font-bold text-stone-800">{orderItems[product.id] || 0}</span>
                          <button onClick={() => updateItemQty(product.id, 1)} className="p-1 hover:bg-stone-100 rounded-full text-stone-400 hover:text-green-600"><Plus size={18} /></button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {orderStep === 'details' && (
                <form id="order-form" onSubmit={handleOrderSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-bold text-stone-700 mb-1">Your Name</label>
                    <input 
                      required 
                      value={orderForm.name} 
                      onChange={e => setOrderForm({...orderForm, name: e.target.value})} 
                      className="w-full px-4 py-3 rounded-xl bg-stone-50 border border-stone-200 text-stone-900 outline-none focus:ring-2 focus:ring-orange-500" 
                      placeholder="Jane Doe" 
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-bold text-stone-700 mb-1">Email</label>
                      <input 
                        required 
                        type="email" 
                        value={orderForm.email} 
                        onChange={e => setOrderForm({...orderForm, email: e.target.value})} 
                        className="w-full px-4 py-3 rounded-xl bg-stone-50 border border-stone-200 text-stone-900 outline-none focus:ring-2 focus:ring-orange-500" 
                        placeholder="jane@example.com" 
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-stone-700 mb-1">Phone</label>
                      <input 
                        required 
                        value={orderForm.phone} 
                        onChange={e => setOrderForm({...orderForm, phone: e.target.value})} 
                        className="w-full px-4 py-3 rounded-xl bg-stone-50 border border-stone-200 text-stone-900 outline-none focus:ring-2 focus:ring-orange-500" 
                        placeholder="+371..." 
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-stone-700 mb-1">Note for Farmer</label>
                    <textarea 
                      value={orderForm.note} 
                      onChange={e => setOrderForm({...orderForm, note: e.target.value})} 
                      rows={3} 
                      className="w-full px-4 py-3 rounded-xl bg-stone-50 border border-stone-200 text-stone-900 outline-none focus:ring-2 focus:ring-orange-500 resize-none" 
                      placeholder="Prefer delivery in the morning..." 
                    />
                  </div>
                </form>
              )}

              {orderStep === 'success' && (
                <div className="text-center py-10 space-y-4 animate-in zoom-in-95">
                  <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4"><Check size={40} strokeWidth={3} /></div>
                  <h4 className="text-2xl font-bold text-stone-900 font-serif">Request Sent!</h4>
                  <p className="text-stone-500 px-6">{farmer.name} has received your request and will contact you shortly to confirm.</p>
                </div>
              )}
            </div>

            <div className="p-6 border-t border-stone-100 bg-stone-50/50">
              {orderStep === 'items' && (
                <button disabled={!hasItemsInCart} onClick={() => setOrderStep('details')} className="w-full bg-orange-600 hover:bg-orange-700 disabled:opacity-50 text-white font-bold py-4 rounded-xl shadow-lg transition-all active:scale-95">Continue to Details</button>
              )}
              {orderStep === 'details' && (
                <button type="submit" form="order-form" disabled={isSubmittingOrder} className="w-full bg-orange-600 hover:bg-orange-700 disabled:opacity-50 text-white font-bold py-4 rounded-xl shadow-lg flex justify-center items-center gap-2">{isSubmittingOrder ? <Loader2 className="animate-spin" /> : 'Confirm Order Request'}</button>
              )}
              {orderStep === 'success' && (
                <button onClick={() => { setIsOrderModalOpen(false); setOrderStep('items'); }} className="w-full bg-stone-900 text-white font-bold py-4 rounded-xl">Close</button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Contact Modal */}
      {isContactModalOpen && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white w-full max-w-md rounded-[2rem] shadow-2xl overflow-hidden p-8 animate-in slide-in-from-bottom-10">
            {contactSuccess ? (
              <div className="text-center py-8">
                <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-green-600"><CheckCircle size={32} /></div>
                <h4 className="text-xl font-bold text-stone-900">Message Sent</h4>
                <p className="text-stone-500 mt-2">Farmer will respond via email.</p>
              </div>
            ) : (
              <form onSubmit={handleContactSubmit} className="space-y-4">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-xl font-bold text-stone-900">{t('message')} {farmer.name}</h3>
                  <button type="button" onClick={() => setIsContactModalOpen(false)}><X size={20} /></button>
                </div>
                <input 
                  required 
                  value={contactForm.name} 
                  onChange={e => setContactForm({...contactForm, name: e.target.value})} 
                  className="w-full px-4 py-3 rounded-xl border border-stone-200 text-stone-900 outline-none focus:ring-2 focus:ring-green-600" 
                  placeholder="Your Name" 
                />
                <input 
                  required 
                  type="email" 
                  value={contactForm.email} 
                  onChange={e => setContactForm({...contactForm, email: e.target.value})} 
                  className="w-full px-4 py-3 rounded-xl border border-stone-200 text-stone-900 outline-none focus:ring-2 focus:ring-green-600" 
                  placeholder="Email" 
                />
                <textarea 
                  required 
                  rows={4} 
                  value={contactForm.message} 
                  onChange={e => setContactForm({...contactForm, message: e.target.value})} 
                  className="w-full px-4 py-3 rounded-xl border border-stone-200 text-stone-900 outline-none focus:ring-2 focus:ring-green-600 resize-none" 
                  placeholder="How can we help?" 
                />
                <button type="submit" disabled={isSubmittingContact} className="w-full bg-green-700 text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg">{isSubmittingContact ? <Loader2 className="animate-spin" /> : <><Send size={18} /> Send Inquiry</>}</button>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Share Modal Fallback */}
      {isShareModalOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-sm rounded-[2rem] shadow-2xl overflow-hidden p-8">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-bold text-stone-900 font-serif">{t('share')}</h3>
              <button onClick={() => setIsShareModalOpen(false)} className="p-2 hover:bg-stone-100 rounded-full text-stone-400"><X size={24} /></button>
            </div>
            <div className="grid grid-cols-4 gap-4 mb-8">
              <a href={`https://wa.me/?text=${encodeURIComponent(`Check out ${farmer.name}: ${shareUrl}`)}`} target="_blank" className="flex flex-col items-center gap-2 group">
                <div className="w-12 h-12 bg-green-500 text-white rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform"><MessageCircle size={24} /></div>
                <span className="text-[10px] font-bold text-stone-500">WhatsApp</span>
              </a>
              <a href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`} target="_blank" className="flex flex-col items-center gap-2 group">
                <div className="w-12 h-12 bg-[#1877F2] text-white rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform"><Facebook size={24} /></div>
                <span className="text-[10px] font-bold text-stone-500">Facebook</span>
              </a>
              <a href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}`} target="_blank" className="flex flex-col items-center gap-2 group">
                <div className="w-12 h-12 bg-[#1DA1F2] text-white rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform"><Twitter size={24} /></div>
                <span className="text-[10px] font-bold text-stone-500">Twitter</span>
              </a>
              <a href={`mailto:?subject=Local Farmer&body=${shareUrl}`} className="flex flex-col items-center gap-2 group">
                <div className="w-12 h-12 bg-stone-800 text-white rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform"><Mail size={24} /></div>
                <span className="text-[10px] font-bold text-stone-500">Email</span>
              </a>
            </div>
            <div className="bg-stone-50 p-4 rounded-2xl border flex items-center gap-3">
               <div className="flex-1 truncate text-sm text-stone-500 font-medium">{shareUrl}</div>
               <button onClick={copyToClipboard} className="bg-white text-stone-800 p-2 rounded-xl border hover:bg-stone-900 hover:text-white transition-all"><Copy size={18} /></button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FarmerDetail;
