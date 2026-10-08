import React from 'react';
import {
  Star,
  MapPin,
  CheckCircle2,
  Phone,
  MessageCircle,
  Heart,
  ChevronLeft,
  Building2,
  User,
  Clock
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function ProviderCard({ item, onClick, onRequestClick }) {
  const { toggleFavorite, isFavorite } = useAuth();
  const fav = isFavorite(item.type, item.id);

  const isCompany = item.type === 'company';

  const handleCall = (e) => {
    e.stopPropagation();
    window.open(`tel:${item.phone}`, '_self');
  };

  const handleWhatsApp = (e) => {
    e.stopPropagation();
    const cleanPhone = (item.whatsapp || item.phone).replace(/\D/g, '');
    const waPhone = cleanPhone.startsWith('218') ? cleanPhone : '218' + cleanPhone.replace(/^0/, '');
    const msg = encodeURIComponent(`السلام عليكم، تواصلت معك عبر منصة خدمات غدامس لاستفسار عن خدماتكم.`);
    window.open(`https://wa.me/${waPhone}?text=${msg}`, '_blank');
  };

  const handleFavoriteClick = (e) => {
    e.stopPropagation();
    toggleFavorite(item);
  };

  return (
    <div
      onClick={() => onClick(item)}
      className="group bg-white rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-xl hover:border-orange-200 transition-all duration-300 overflow-hidden cursor-pointer flex flex-col justify-between"
    >
      <div>
        {/* Cover & Badges Header */}
        <div className="relative h-28 sm:h-32 bg-slate-100 overflow-hidden">
          {item.cover_url ? (
            <img
              src={item.cover_url}
              alt={item.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-slate-200 to-slate-300 group-hover:scale-105 transition-transform duration-500"></div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-transparent to-transparent"></div>

          {/* Favorite Button */}
          <button
            onClick={handleFavoriteClick}
            className="absolute top-2.5 left-2.5 p-2 rounded-full bg-white/80 hover:bg-white text-slate-700 backdrop-blur-md shadow transition-transform active:scale-95"
          >
            <Heart className={`w-4 h-4 ${fav ? 'fill-red-500 text-red-500' : 'text-slate-600'}`} />
          </button>

          {/* Type Tag */}
          <span className="absolute top-2.5 right-2.5 text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-900/80 text-white backdrop-blur-md flex items-center gap-1">
            {isCompany ? <Building2 className="w-3 h-3 text-orange-400" /> : <User className="w-3 h-3 text-emerald-400" />}
            {isCompany ? 'شركة' : 'مزود مستقل'}
          </span>

          {/* Available Now Indicator */}
          {item.is_available === 1 && (
            <span className="absolute bottom-2.5 left-2.5 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500 text-white shadow-sm flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse"></span>
              متاح الآن
            </span>
          )}
        </div>

        {/* Profile Info Section */}
        <div className="p-4 pt-0 relative">
          {/* Avatar / Logo */}
          <div className="-mt-8 mb-2 flex justify-between items-end">
            <div className="relative">
              {item.image || item.avatar_url || item.logo_url ? (
                <img
                  src={item.image || item.avatar_url || item.logo_url}
                  alt={item.name}
                  className="w-16 h-16 rounded-2xl object-cover border-4 border-white shadow-md bg-white"
                />
              ) : (
                <div className="w-16 h-16 rounded-2xl border-4 border-white shadow-md bg-slate-100 flex items-center justify-center">
                  {isCompany ? <Building2 className="w-8 h-8 text-slate-300" /> : <User className="w-8 h-8 text-slate-300" />}
                </div>
              )}
              {item.is_verified === 1 && (
                <div className="absolute -bottom-1 -right-1 bg-white rounded-full p-0.5 shadow">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 fill-emerald-50" />
                </div>
              )}
            </div>

            {/* Rating Stars */}
            <div className="flex items-center gap-1 bg-amber-50 px-2 py-1 rounded-lg border border-amber-200">
              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              <span className="font-extrabold text-xs text-amber-900">{item.rating_avg || '5.0'}</span>
              <span className="text-[10px] text-amber-700 font-medium">({item.rating_count || 0})</span>
            </div>
          </div>

          {/* Name & Title */}
          <div className="mb-2">
            <div className="flex items-center gap-1.5">
              <h3 className="font-extrabold text-base text-slate-900 group-hover:text-primary-600 transition-colors line-clamp-1">
                {item.name}
              </h3>
              {item.is_verified === 1 && (
                <span className="text-[11px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200 shrink-0">
                  ✓ موثق
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 font-medium line-clamp-1">{item.title || item.category_name}</p>
          </div>

          {/* Location & Category */}
          <div className="flex flex-wrap items-center gap-2 text-xs text-slate-600 mb-3">
            <span className="flex items-center gap-1 bg-slate-100 px-2 py-0.5 rounded-md font-medium text-[11px]">
              <MapPin className="w-3 h-3 text-primary-500" />
              {item.city_name || 'غدامس'} • {item.area_name || 'وسط المدينة'}
            </span>
            <span className="bg-orange-50 text-primary-700 px-2 py-0.5 rounded-md font-medium text-[11px]">
              {item.category_name}
            </span>
          </div>

          {/* Short Bio */}
          {item.description && (
            <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed mb-3">
              {item.description}
            </p>
          )}
        </div>
      </div>

      {/* Action Buttons Footer */}
      <div className="p-3 bg-slate-50/80 border-t border-slate-100 grid grid-cols-3 gap-2">
        <button
          onClick={handleCall}
          className="flex items-center justify-center gap-1 bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs py-2 px-2 rounded-xl transition-all shadow-sm"
        >
          <Phone className="w-3.5 h-3.5" />
          <span>اتصل</span>
        </button>

        <button
          onClick={handleWhatsApp}
          className="flex items-center justify-center gap-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 font-bold text-xs py-2 px-2 rounded-xl transition-all"
        >
          <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
          <span>واتساب</span>
        </button>

        <button
          onClick={(e) => {
            e.stopPropagation();
            onRequestClick(item);
          }}
          className="flex items-center justify-center gap-1 bg-primary-500 hover:bg-primary-600 text-white font-bold text-xs py-2 px-2 rounded-xl transition-all shadow-sm shadow-orange-500/20"
        >
          <span>طلب خدمة</span>
        </button>
      </div>
    </div>
  );
}
