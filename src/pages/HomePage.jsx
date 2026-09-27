import React, { useState, useEffect } from 'react';
import {
  Search,
  MapPin,
  Sparkles,
  ShieldCheck,
  ChevronLeft,
  PlusCircle,
  PhoneCall,
  CheckCircle2,
  TrendingUp,
  Star,
  Users,
  Building2,
  Wrench,
  ArrowLeft,
  Calendar,
  MessageSquare
} from 'lucide-react';
import CategoryCard from '../components/CategoryCard';
import ProviderCard from '../components/ProviderCard';
import { useAuth } from '../context/AuthContext';

export default function HomePage({ onNavigate, onSelectProvider, onRequestClick, categories, cities, onOpenCityModal }) {
  const { selectedCity, selectedArea } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [featuredProviders, setFeaturedProviders] = useState([]);
  const [featuredCompanies, setFeaturedCompanies] = useState([]);
  const [ads, setAds] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch('/api/providers/featured').then((res) => res.json()),
      fetch('/api/companies/featured').then((res) => res.json()),
      fetch('/api/ads').then((res) => res.json())
    ])
      .then(([provData, compData, adsData]) => {
        setFeaturedProviders(provData || []);
        setFeaturedCompanies(compData || []);
        setAds(adsData || []);
      })
      .catch((err) => console.error('Error loading home data:', err))
      .finally(() => setLoading(false));
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    onNavigate('search', { q: searchQuery });
  };

  // Areas of Ghadames for "Explore by Area"
  const ghadamesCity = cities.find((c) => c.name_ar === 'غدامس');
  const ghadamesAreas = ghadamesCity ? ghadamesCity.areas || [] : [];

  return (
    <div className="space-y-12 pb-12">
      
      {/* HERO SECTION */}
      <section className="relative bg-gradient-to-b from-slate-900 via-slate-900 to-slate-800 text-white rounded-b-3xl sm:rounded-3xl p-6 sm:p-12 overflow-hidden shadow-2xl">
        
        {/* Background Decorative Pattern */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-orange-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="max-w-4xl mx-auto text-center relative z-10 space-y-6">
          
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md px-4 py-1.5 rounded-full border border-white/10 text-xs sm:text-sm font-semibold text-orange-300">
            <Sparkles className="w-4 h-4 text-primary-400" />
            <span>منصة خدمتي الأولى للخدمات والأعمال المعتمدة</span>
          </div>

          {/* Main Title & Slogan */}
          <div className="space-y-2">
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white leading-tight">
              أهلاً بك في <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-400 to-orange-300">منصة خدمتي</span>
            </h1>
            <p className="text-slate-300 text-sm sm:text-lg max-w-2xl mx-auto leading-relaxed">
              كل الخدمات بين يديك - ابحث عن أفضل السباكين، الكهربائيين، المقاولين، الفنيين والشركات المعتمدة وتواصل معهم مباشرة.
            </p>
          </div>

          {/* BIG SEARCH BOX & REGION SELECTOR (Requirement #3) */}
          <form onSubmit={handleSearchSubmit} className="bg-white p-3 sm:p-4 rounded-2xl sm:rounded-3xl shadow-2xl text-slate-900 max-w-3xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
              
              {/* Search Query Input */}
              <div className="md:col-span-6 relative">
                <Search className="w-5 h-5 text-slate-400 absolute right-3.5 top-3.5" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="ماذا تبحث عنه؟ (سباك، كهربائي، مقاول...)"
                  className="w-full pr-11 pl-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:outline-none focus:border-primary-500 transition-all"
                />
              </div>

              {/* Area Selector */}
              <div className="md:col-span-4">
                <button
                  type="button"
                  onClick={onOpenCityModal}
                  className="w-full flex items-center justify-between bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-3 text-xs sm:text-sm font-bold text-slate-700 hover:bg-slate-100 transition-all"
                >
                  <div className="flex items-center gap-2 truncate">
                    <MapPin className="w-4 h-4 text-primary-500 shrink-0" />
                    <span className="truncate">
                      {selectedCity.name_ar} {selectedArea ? `• ${selectedArea.name_ar}` : '• جميع المناطق'}
                    </span>
                  </div>
                  <ChevronLeft className="w-4 h-4 text-slate-400 shrink-0" />
                </button>
              </div>

              {/* Submit Search Button */}
              <div className="md:col-span-2">
                <button
                  type="submit"
                  className="w-full py-3 px-4 bg-primary-500 hover:bg-primary-600 text-white font-extrabold text-sm rounded-xl shadow-lg shadow-orange-500/30 transition-all flex items-center justify-center gap-1"
                >
                  <span>بحث</span>
                  <Search className="w-4 h-4" />
                </button>
              </div>

            </div>
          </form>

          {/* Quick Keywords Tags */}
          <div className="flex flex-wrap items-center justify-center gap-2 pt-2 text-xs text-slate-400">
            <span className="font-bold text-slate-300">الأكثر بحثاً:</span>
            {['سباك', 'كهربائي', 'مقاول', 'دهان', 'سيراميك', 'تكييف', 'نقل أثاث'].map((tag) => (
              <button
                key={tag}
                onClick={() => onNavigate('search', { q: tag })}
                className="bg-white/10 hover:bg-white/20 text-slate-200 px-2.5 py-1 rounded-lg transition-all"
              >
                {tag}
              </button>
            ))}
          </div>

        </div>
      </section>

      {/* TOP AD BANNER */}
      {ads.length > 0 && (
        <section className="max-w-7xl mx-auto px-4">
          <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-orange-500 to-primary-600 text-white p-6 sm:p-8 shadow-xl flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="space-y-2 text-center sm:text-right">
              <span className="bg-white/20 text-xs font-bold px-2.5 py-1 rounded-full uppercase tracking-wider">إعلان مميز</span>
              <h3 className="text-xl sm:text-2xl font-black">{ads[0].title}</h3>
              <p className="text-xs sm:text-sm text-orange-100 max-w-xl">{ads[0].description}</p>
            </div>
            {ads[0].image_url && (
              <img
                src={ads[0].image_url}
                alt={ads[0].title}
                className="w-full sm:w-64 h-32 object-cover rounded-2xl border-2 border-white/30 shadow"
              />
            )}
          </div>
        </section>
      )}

      {/* CATEGORIES GRID (Requirement #3) */}
      <section className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-black text-slate-900">التصنيفات والخدمات</h2>
            <p className="text-xs sm:text-sm text-slate-500">اختر المجال الذي تريد البحث عن مهنيين فيه في غدامس</p>
          </div>
          <button
            onClick={() => onNavigate('categories')}
            className="flex items-center gap-1 text-xs sm:text-sm font-bold text-primary-600 hover:text-primary-700 bg-orange-50 px-3 py-1.5 rounded-xl border border-orange-200"
          >
            <span>عرض الجميع</span>
            <ChevronLeft className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-3 sm:gap-4">
          {categories.slice(0, 14).map((cat) => (
            <CategoryCard
              key={cat.id}
              category={cat}
              onClick={(c) => onNavigate('search', { category_id: c.id })}
            />
          ))}
        </div>
      </section>

      {/* FEATURED PROVIDERS (Requirement #3) */}
      <section className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between mb-6">
          <div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-6 h-6 text-primary-500" />
              <h2 className="text-2xl font-black text-slate-900">مقدمو الخدمات المميزون</h2>
            </div>
            <p className="text-xs sm:text-sm text-slate-500">حرفيون ومستقلون موثوقون وأصحاب تقييمات عالية بغدامس</p>
          </div>
          <button
            onClick={() => onNavigate('search', { type: 'provider' })}
            className="flex items-center gap-1 text-xs sm:text-sm font-bold text-primary-600 hover:text-primary-700"
          >
            <span>استكشف أكثر</span>
            <ChevronLeft className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {featuredProviders.map((prov) => (
            <ProviderCard
              key={prov.id}
              item={prov}
              onClick={onSelectProvider}
              onRequestClick={onRequestClick}
            />
          ))}
        </div>
      </section>

      {/* FEATURED COMPANIES (Requirement #3) */}
      <section className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between mb-6">
          <div>
            <div className="flex items-center gap-2">
              <Building2 className="w-6 h-6 text-primary-500" />
              <h2 className="text-2xl font-black text-slate-900">الشركات والمؤسسات المميزة</h2>
            </div>
            <p className="text-xs sm:text-sm text-slate-500">شركات المقاولات، التكييف، والصيانة العامة المعتمدة في ليبيا</p>
          </div>
          <button
            onClick={() => onNavigate('search', { type: 'company' })}
            className="flex items-center gap-1 text-xs sm:text-sm font-bold text-primary-600 hover:text-primary-700"
          >
            <span>عرض الشركات</span>
            <ChevronLeft className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {featuredCompanies.map((comp) => (
            <ProviderCard
              key={comp.id}
              item={comp}
              onClick={onSelectProvider}
              onRequestClick={onRequestClick}
            />
          ))}
        </div>
      </section>

      {/* EXPLORE BY AREA IN GHADAMES (Requirement #3) */}
      {ghadamesAreas.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 bg-slate-100/70 py-10 rounded-3xl border border-slate-200/60">
          <div className="text-center max-w-xl mx-auto mb-8 space-y-2">
            <h2 className="text-2xl font-black text-slate-900">استكشف الخدمات حسب أحياء ومناطق غدامس</h2>
            <p className="text-xs sm:text-sm text-slate-500">اعثر على أقرب السباكين والمقاولين في حيك مباشرة</p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 max-w-4xl mx-auto">
            {ghadamesAreas.map((area) => (
              <button
                key={area.id}
                onClick={() => onNavigate('search', { city_id: ghadamesCity.id, area_id: area.id })}
                className="bg-white hover:bg-primary-500 hover:text-white p-3.5 rounded-2xl border border-slate-200 text-center font-bold text-xs sm:text-sm text-slate-800 transition-all shadow-sm flex items-center justify-center gap-2 group"
              >
                <MapPin className="w-4 h-4 text-primary-500 group-hover:text-white shrink-0" />
                <span className="truncate">{area.name_ar}</span>
              </button>
            ))}
          </div>
        </section>
      )}

      {/* HOW IT WORKS SECTION (Requirement #3) */}
      <section className="max-w-7xl mx-auto px-4">
        <div className="text-center max-w-xl mx-auto mb-10 space-y-2">
          <span className="text-xs font-bold text-primary-600 bg-orange-100 px-3 py-1 rounded-full">سهولة وسرعة</span>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900">كيف تعمل منصة خدمات غدامس؟</h2>
          <p className="text-xs sm:text-sm text-slate-500">3 خطوات بسيطة للحصول على أفضل خدمة في مدينتك</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
          
          <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm space-y-3 relative">
            <div className="w-14 h-14 bg-orange-100 text-primary-600 rounded-2xl flex items-center justify-center font-black text-2xl mx-auto">
              1
            </div>
            <h3 className="font-extrabold text-lg text-slate-900">ابحث عن الخدمة</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              اكتب اسم الخدمة التي تحتاجها (سباك، دهان، كهربائي...) وحدد منطقتك في غدامس.
            </p>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm space-y-3 relative">
            <div className="w-14 h-14 bg-orange-100 text-primary-600 rounded-2xl flex items-center justify-center font-black text-2xl mx-auto">
              2
            </div>
            <h3 className="font-extrabold text-lg text-slate-900">شاهد ملفات الأعمال</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              تصفح التقييمات، شارة التوثيق ✓، أوقات العمل، ومعرض صور الأعمال السابقة للمزود.
            </p>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm space-y-3 relative">
            <div className="w-14 h-14 bg-orange-100 text-primary-600 rounded-2xl flex items-center justify-center font-black text-2xl mx-auto">
              3
            </div>
            <h3 className="font-extrabold text-lg text-slate-900">تواصل فوراً</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              اتصل هاتفياً، أرسل رسالة واتساب مباشرة، أو قدم طلب خدمة أونلاين بضغطة زر.
            </p>
          </div>

        </div>
      </section>

      {/* ADD BUSINESS CTA BANNER (Requirement #3 & #8) */}
      <section className="max-w-7xl mx-auto px-4">
        <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white rounded-3xl p-8 sm:p-12 shadow-2xl relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-8">
          
          <div className="space-y-4 max-w-xl text-center md:text-right">
            <span className="bg-primary-500 text-white text-xs font-extrabold px-3 py-1 rounded-full uppercase tracking-wider">
              لأصحاب الحرف والشركات
            </span>
            <h2 className="text-3xl sm:text-4xl font-black leading-tight">
              هل تقدم خدمات في غدامس؟ أضف نشاطك التجاري الآن مجاناً!
            </h2>
            <p className="text-slate-300 text-sm leading-relaxed">
              انضم لأكبر منصة تضم الحرفيين والشركات في غدامس وليبيا، واستقبل طلبات اتصالات وواتساب مباشرة من الزبائن.
            </p>
          </div>

          <div className="shrink-0">
            <button
              onClick={() => onNavigate('add-business')}
              className="flex items-center gap-2 bg-primary-500 hover:bg-primary-600 text-white font-extrabold text-base px-8 py-4 rounded-2xl shadow-xl shadow-orange-500/30 transition-all transform hover:-translate-y-1"
            >
              <PlusCircle className="w-5 h-5" />
              <span>أضف نشاطك التجاري الآن</span>
            </button>
          </div>

        </div>
      </section>

    </div>
  );
}
