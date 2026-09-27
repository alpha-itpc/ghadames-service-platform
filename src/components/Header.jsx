import React, { useState, useEffect } from 'react';
import {
  MapPin,
  Search,
  User,
  PlusCircle,
  Download,
  ShieldCheck,
  ChevronDown,
  Menu,
  X,
  Heart,
  Briefcase
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Header({ onNavigate, currentPage, onOpenCityModal }) {
  const { user, selectedCity, selectedArea, favorites } = useAuth();
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  useEffect(() => {
    const handler = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstallPWA = () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      deferredPrompt.userChoice.then(() => setDeferredPrompt(null));
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          
          {/* Logo & Slogan */}
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => onNavigate('home')}>
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-tr from-primary-600 to-orange-400 rounded-2xl flex items-center justify-center shadow-lg shadow-orange-500/20 text-white font-extrabold text-xl sm:text-2xl">
              خ
            </div>
            <div>
              <div className="flex items-center gap-1">
                <span className="font-extrabold text-xl sm:text-2xl text-slate-900 tracking-tight">منصة خدمتي</span>
                <span className="bg-orange-100 text-primary-600 text-[10px] font-bold px-1.5 py-0.5 rounded-full border border-orange-200">ليبيا</span>
              </div>
              <p className="text-[11px] sm:text-xs text-slate-500 hidden sm:block">كل الخدمات في مكان واحد</p>
            </div>
          </div>

          {/* City / Area Selector Dropdown */}
          <button
            onClick={onOpenCityModal}
            className="flex items-center gap-2 bg-slate-100 hover:bg-slate-200/80 text-slate-800 text-xs sm:text-sm font-medium px-3.5 py-2 rounded-xl transition-all border border-slate-200/60"
          >
            <MapPin className="w-4 h-4 text-primary-500 shrink-0" />
            <span className="max-w-[120px] truncate font-semibold">
              {selectedCity.name_ar} {selectedArea ? `• ${selectedArea.name_ar}` : ''}
            </span>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          </button>

          {/* Desktop Search Quick Button */}
          <div className="hidden md:flex items-center flex-1 max-w-sm mx-6">
            <button
              onClick={() => onNavigate('search')}
              className="w-full flex items-center justify-between text-slate-400 bg-slate-100 hover:bg-slate-150 px-4 py-2.5 rounded-xl border border-slate-200/80 text-sm transition-all"
            >
              <div className="flex items-center gap-2">
                <Search className="w-4 h-4 text-slate-400" />
                <span>ماذا تبحث عنه؟ (سباك، كهربائي...)</span>
              </div>
              <kbd className="hidden lg:inline-block bg-white text-slate-400 text-[10px] px-1.5 py-0.5 rounded border border-slate-200">بحث</kbd>
            </button>
          </div>

          {/* Desktop Navigation Links */}
          <div className="hidden lg:flex items-center gap-4">
            {/* Install PWA Button if prompt available */}
            {deferredPrompt && (
              <button
                onClick={handleInstallPWA}
                className="flex items-center gap-1.5 text-xs font-semibold bg-emerald-50 text-emerald-700 hover:bg-emerald-100 px-3 py-2 rounded-xl border border-emerald-200 transition-all"
              >
                <Download className="w-4 h-4 text-emerald-600" />
                <span>تثبيت التطبيق</span>
              </button>
            )}

            <button
              onClick={() => onNavigate('add-business')}
              className="flex items-center gap-1.5 text-xs sm:text-sm font-bold bg-primary-500 hover:bg-primary-600 text-white px-4 py-2.5 rounded-xl shadow-lg shadow-orange-500/20 transition-all transform hover:-translate-y-0.5"
            >
              <PlusCircle className="w-4 h-4" />
              <span>أضف نشاطك التجاري</span>
            </button>

            {user ? (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    if (user.role_name === 'admin') onNavigate('admin-dashboard');
                    else if (user.role_name === 'provider' || user.role_name === 'company') onNavigate('provider-dashboard');
                    else onNavigate('customer-dashboard');
                  }}
                  className="flex items-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-800 px-3.5 py-2 rounded-xl font-bold text-xs sm:text-sm transition-all"
                >
                  <User className="w-4 h-4 text-primary-500" />
                  <span>{user.name}</span>
                </button>
              </div>
            ) : (
              <button
                onClick={() => onNavigate('login')}
                className="flex items-center gap-1 text-slate-700 hover:text-primary-600 font-bold text-xs sm:text-sm px-3 py-2"
              >
                <User className="w-4 h-4" />
                <span>تسجيل الدخول</span>
              </button>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="flex lg:hidden items-center gap-2">
            <button
              onClick={() => onNavigate('add-business')}
              className="text-xs font-bold bg-primary-500 text-white px-2.5 py-1.5 rounded-lg shadow-sm"
            >
              أضف نشاطك
            </button>
            <button
              onClick={() => setShowMobileMenu(!showMobileMenu)}
              className="p-2 text-slate-600 hover:text-slate-900 rounded-lg bg-slate-100"
            >
              {showMobileMenu ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {showMobileMenu && (
        <div className="lg:hidden bg-white border-b border-slate-200 px-4 pt-3 pb-6 space-y-3">
          <button
            onClick={() => { onNavigate('search'); setShowMobileMenu(false); }}
            className="w-full text-right py-2.5 px-3 rounded-lg bg-slate-50 font-medium text-slate-700 flex items-center gap-2"
          >
            <Search className="w-4 h-4 text-primary-500" />
            <span>محرك البحث والتصفية</span>
          </button>
          <button
            onClick={() => { onNavigate('categories'); setShowMobileMenu(false); }}
            className="w-full text-right py-2.5 px-3 rounded-lg bg-slate-50 font-medium text-slate-700 flex items-center gap-2"
          >
            <Briefcase className="w-4 h-4 text-primary-500" />
            <span>جميع التصنيفات والخدمات</span>
          </button>
          <button
            onClick={() => { onNavigate('favorites'); setShowMobileMenu(false); }}
            className="w-full text-right py-2.5 px-3 rounded-lg bg-slate-50 font-medium text-slate-700 flex items-center gap-2"
          >
            <Heart className="w-4 h-4 text-red-500" />
            <span>المفضلة ({favorites.length})</span>
          </button>
          {user ? (
            <button
              onClick={() => {
                if (user.role_name === 'admin') onNavigate('admin-dashboard');
                else if (user.role_name === 'provider' || user.role_name === 'company') onNavigate('provider-dashboard');
                else onNavigate('customer-dashboard');
                setShowMobileMenu(false);
              }}
              className="w-full text-right py-2.5 px-3 rounded-lg bg-primary-50 text-primary-700 font-bold flex items-center gap-2"
            >
              <User className="w-4 h-4" />
              <span>لوحة حسابي ({user.name})</span>
            </button>
          ) : (
            <button
              onClick={() => { onNavigate('login'); setShowMobileMenu(false); }}
              className="w-full text-center py-2.5 px-3 rounded-lg bg-primary-500 text-white font-bold"
            >
              تسجيل الدخول / حساب جديد
            </button>
          )}
        </div>
      )}
    </header>
  );
}
