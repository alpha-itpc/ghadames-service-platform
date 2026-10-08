import React, { useState, useEffect } from 'react';
import {
  Star,
  MapPin,
  CheckCircle2,
  Phone,
  MessageCircle,
  Heart,
  Share2,
  Calendar,
  Clock,
  Building2,
  User,
  Wrench,
  Sparkles,
  ArrowRight,
  Maximize2
} from 'lucide-react';
import InteractiveMap from '../components/InteractiveMap';
import ImageGalleryModal from '../components/ImageGalleryModal';
import ReviewModal from '../components/ReviewModal';
import { useAuth } from '../context/AuthContext';

export default function ProviderDetailsPage({ type, id, onBack, onRequestClick }) {
  const { toggleFavorite, isFavorite } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showGallery, setShowGallery] = useState(false);
  const [galleryIndex, setGalleryIndex] = useState(0);
  const [showReviewModal, setShowReviewModal] = useState(false);

  const fav = data ? isFavorite(data.type, data.id) : false;

  const loadData = () => {
    setLoading(true);
    fetch(`/api/provider/${type}/${id}`)
      .then((res) => res.json())
      .then((resData) => setData(resData))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadData();
  }, [type, id]);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12 text-center animate-pulse space-y-4">
        <div className="bg-slate-200 h-48 rounded-3xl"></div>
        <div className="bg-slate-200 h-24 rounded-2xl w-2/3 mx-auto"></div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12 text-center space-y-4">
        <h3 className="font-extrabold text-xl">الصفحة غير موجودة</h3>
        <button onClick={onBack} className="bg-primary-500 text-white px-4 py-2 rounded-xl font-bold">
          العودة
        </button>
      </div>
    );
  }

  const handleCall = () => window.open(`tel:${data.phone}`, '_self');

  const handleWhatsApp = () => {
    const cleanPhone = (data.whatsapp || data.phone).replace(/\D/g, '');
    const waPhone = cleanPhone.startsWith('218') ? cleanPhone : '218' + cleanPhone.replace(/^0/, '');
    const msg = encodeURIComponent(`السلام عليكم ${data.name}، أتواصل معك عبر منصة خدمات غدامس.`);
    window.open(`https://wa.me/${waPhone}?text=${msg}`, '_blank');
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: data.name,
        text: `صفحة ${data.name} على منصة خدمات غدامس`,
        url: window.location.href
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('تم نسخ رابط الصفحة بنجاح!');
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
      
      {/* Back Button */}
      <button
        onClick={onBack}
        className="flex items-center gap-1 text-xs font-bold text-slate-600 bg-white hover:bg-slate-100 px-3.5 py-2 rounded-xl border border-slate-200 shadow-sm"
      >
        <ArrowRight className="w-4 h-4" />
        <span>العودة للنتائج</span>
      </button>

      {/* Main Cover & Header Box */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-md overflow-hidden relative">
        
        {/* Cover Image */}
        <div className="h-44 sm:h-64 bg-slate-900 relative">
          {data.cover_url ? (
            <img
              src={data.cover_url}
              alt={data.name}
              className="w-full h-full object-cover opacity-80"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-slate-200 to-slate-300 opacity-80"></div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/30 to-transparent"></div>

          {/* Action Tools */}
          <div className="absolute top-4 left-4 flex items-center gap-2 z-10">
            <button
              onClick={() => toggleFavorite(data)}
              className="p-2.5 rounded-full bg-white/90 hover:bg-white text-slate-700 backdrop-blur-md shadow transition-transform active:scale-95"
            >
              <Heart className={`w-5 h-5 ${fav ? 'fill-red-500 text-red-500' : 'text-slate-700'}`} />
            </button>
            <button
              onClick={handleShare}
              className="p-2.5 rounded-full bg-white/90 hover:bg-white text-slate-700 backdrop-blur-md shadow transition-transform active:scale-95"
            >
              <Share2 className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Profile Info Header */}
        <div className="p-6 pt-0 relative">
          
          {/* Avatar & Ratings */}
          <div className="-mt-16 mb-4 flex flex-wrap items-end justify-between gap-4">
            <div className="relative">
              {data.image || data.avatar_url || data.logo_url ? (
                <img
                  src={data.image || data.avatar_url || data.logo_url}
                  alt={data.name}
                  className="w-28 h-28 sm:w-32 sm:h-32 rounded-3xl object-cover border-4 border-white shadow-xl bg-white"
                />
              ) : (
                <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-3xl border-4 border-white shadow-xl bg-slate-100 flex items-center justify-center">
                  {data.type === 'company' ? <Building2 className="w-12 h-12 text-slate-300" /> : <User className="w-12 h-12 text-slate-300" />}
                </div>
              )}
              {data.is_verified === 1 && (
                <div className="absolute -bottom-1 -right-1 bg-white rounded-full p-1 shadow-md">
                  <CheckCircle2 className="w-6 h-6 text-emerald-500 fill-emerald-50" />
                </div>
              )}
            </div>

            <div className="flex items-center gap-2 bg-amber-50 px-3.5 py-1.5 rounded-2xl border border-amber-200">
              <Star className="w-5 h-5 fill-amber-400 text-amber-400" />
              <span className="font-extrabold text-base text-amber-900">{data.rating_avg || '5.0'}</span>
              <span className="text-xs text-amber-700 font-bold">({data.rating_count || 0} تقييم)</span>
            </div>
          </div>

          {/* Title & Category */}
          <div className="space-y-1 mb-4">
            <div className="flex items-center gap-2">
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900">{data.name}</h1>
              {data.is_verified === 1 && (
                <span className="text-xs font-extrabold text-emerald-700 bg-emerald-100 px-2.5 py-1 rounded-full border border-emerald-300">
                  ✓ موثق رسمياً
                </span>
              )}
            </div>
            <p className="text-sm font-bold text-primary-600">{data.title || data.category_name}</p>
            <div className="flex items-center gap-2 text-xs text-slate-500 pt-1">
              <MapPin className="w-4 h-4 text-primary-500" />
              <span>{data.city_name || 'غدامس'} • {data.area_name || 'وسط المدينة'}</span>
              <span>•</span>
              <span className="text-slate-700 font-medium">{data.address}</span>
            </div>
          </div>

          {/* Core Action Buttons Bar (Requirement #9 & #10) */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-2">
            <button
              onClick={handleCall}
              className="flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white font-extrabold text-sm py-3 px-3 rounded-2xl transition-all shadow-md shadow-emerald-500/20"
            >
              <Phone className="w-4 h-4" />
              <span>اتصل الآن</span>
            </button>

            <button
              onClick={handleWhatsApp}
              className="flex items-center justify-center gap-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 font-extrabold text-sm py-3 px-3 rounded-2xl transition-all"
            >
              <MessageCircle className="w-4 h-4 text-emerald-600" />
              <span>واتساب</span>
            </button>

            <button
              onClick={() => onRequestClick(data)}
              className="flex items-center justify-center gap-2 bg-primary-500 hover:bg-primary-600 text-white font-extrabold text-sm py-3 px-3 rounded-2xl transition-all shadow-md shadow-orange-500/20"
            >
              <Wrench className="w-4 h-4" />
              <span>طلب خدمة</span>
            </button>

            <button
              onClick={() => {
                const el = document.getElementById('map-section');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }}
              className="flex items-center justify-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-sm py-3 px-3 rounded-2xl transition-all"
            >
              <MapPin className="w-4 h-4 text-primary-500" />
              <span>الموقع</span>
            </button>
          </div>

        </div>
      </div>

      {/* Description / Bio Section */}
      {data.description && (
        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm space-y-2">
          <h3 className="font-extrabold text-lg text-slate-900 border-r-4 border-primary-500 pr-3">وصف النشاط والخبرة</h3>
          <p className="text-sm text-slate-600 leading-relaxed font-medium">{data.description}</p>
        </div>
      )}

      {/* Portfolio Gallery Section (Requirement #11) */}
      {data.images && data.images.length > 0 && (
        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-extrabold text-lg text-slate-900 border-r-4 border-primary-500 pr-3">معرض الأعمال والنماذج</h3>
            <span className="text-xs font-bold text-slate-400">{data.images.length} صور</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {data.images.map((img, idx) => (
              <div
                key={img.id || idx}
                onClick={() => {
                  setGalleryIndex(idx);
                  setShowGallery(true);
                }}
                className="relative h-36 rounded-2xl overflow-hidden bg-slate-100 group cursor-pointer border border-slate-200"
              >
                <img
                  src={img.image_url}
                  alt={img.caption || 'نموذج عمل'}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-slate-900/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                  <Maximize2 className="w-6 h-6" />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Business Hours Section */}
      {data.business_hours && data.business_hours.length > 0 && (
        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm space-y-3">
          <h3 className="font-extrabold text-lg text-slate-900 border-r-4 border-primary-500 pr-3">أوقات وساعات العمل</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {data.business_hours.map((bh) => (
              <div key={bh.id} className="bg-slate-50 p-3 rounded-2xl border border-slate-100 text-center">
                <span className="block font-bold text-xs text-slate-800">{bh.day_of_week}</span>
                {bh.is_closed ? (
                  <span className="text-[11px] font-bold text-red-500">عطلة مغلق</span>
                ) : (
                  <span className="text-[11px] text-slate-500">{bh.open_time} - {bh.close_time}</span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Interactive Map Section (Requirement #20) */}
      <div id="map-section" className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm space-y-3">
        <h3 className="font-extrabold text-lg text-slate-900 border-r-4 border-primary-500 pr-3">موقع النشاط في غدامس</h3>
        <InteractiveMap lat={data.lat} lng={data.lng} name={data.name} address={data.address} />
      </div>

      {/* Reviews & Ratings Section (Requirement #13) */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-extrabold text-lg text-slate-900 border-r-4 border-primary-500 pr-3">آراء وتقييمات العملاء</h3>
            <p className="text-xs text-slate-500">متوسط التقييم العام: ⭐ {data.rating_avg || '5.0'}</p>
          </div>
          <button
            onClick={() => setShowReviewModal(true)}
            className="bg-orange-50 hover:bg-orange-100 text-primary-700 font-extrabold text-xs px-4 py-2.5 rounded-2xl border border-orange-200 transition-all"
          >
            + أضف تقييمك
          </button>
        </div>

        {data.reviews && data.reviews.length > 0 ? (
          <div className="space-y-3">
            {data.reviews.map((rev) => (
              <div key={rev.id} className="bg-slate-50 p-4 rounded-2xl border border-slate-100 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-extrabold text-xs text-slate-800">{rev.customer_name}</span>
                  <div className="flex items-center gap-1">
                    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    <span className="text-xs font-bold text-amber-900">{rev.rating}</span>
                  </div>
                </div>
                <p className="text-xs text-slate-600 font-medium">{rev.comment}</p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-slate-400 text-center py-4">لا توجد تقييمات مضافة بعد. كن أول من يقيّم هذا النشاط!</p>
        )}
      </div>

      {/* Image Gallery Popup */}
      <ImageGalleryModal
        isOpen={showGallery}
        onClose={() => setShowGallery(false)}
        images={data.images}
        initialIndex={galleryIndex}
      />

      {/* Review Modal */}
      <ReviewModal
        isOpen={showReviewModal}
        onClose={() => setShowReviewModal(false)}
        provider={data}
        onReviewSubmitted={loadData}
      />

    </div>
  );
}
