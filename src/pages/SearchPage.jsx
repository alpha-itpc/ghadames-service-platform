import React, { useState, useEffect } from 'react';
import { Search, Filter, RefreshCw, X, ShieldCheck, MapPin } from 'lucide-react';
import ProviderCard from '../components/ProviderCard';
import FilterBottomSheet from '../components/FilterBottomSheet';
import { useAuth } from '../context/AuthContext';

export default function SearchPage({ initialParams = {}, onSelectProvider, onRequestClick, cities, categories }) {
  const { selectedCity } = useAuth();
  
  const [filters, setFilters] = useState({
    q: initialParams.q || '',
    city_id: initialParams.city_id || selectedCity.id,
    area_id: initialParams.area_id || '',
    category_id: initialParams.category_id || '',
    type: initialParams.type || 'all',
    verified: '0',
    available: '0'
  });

  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showFilterModal, setShowFilterModal] = useState(false);

  const fetchResults = () => {
    setLoading(true);
    const queryParams = new URLSearchParams();
    if (filters.q) queryParams.append('q', filters.q);
    if (filters.city_id) queryParams.append('city_id', filters.city_id);
    if (filters.area_id) queryParams.append('area_id', filters.area_id);
    if (filters.category_id) queryParams.append('category_id', filters.category_id);
    if (filters.type && filters.type !== 'all') queryParams.append('type', filters.type);
    if (filters.verified === '1') queryParams.append('verified', '1');
    if (filters.available === '1') queryParams.append('available', '1');

    fetch(`/api/search?${queryParams.toString()}`)
      .then((res) => res.json())
      .then((data) => setResults(data || []))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchResults();
  }, [filters]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchResults();
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
      
      {/* Search Header Bar */}
      <div className="bg-white p-4 rounded-3xl border border-slate-200/80 shadow-sm flex flex-col md:flex-row items-center gap-3">
        <form onSubmit={handleSearchSubmit} className="flex-1 w-full relative">
          <Search className="w-5 h-5 text-slate-400 absolute right-3.5 top-3.5" />
          <input
            type="text"
            value={filters.q}
            onChange={(e) => setFilters({ ...filters, q: e.target.value })}
            placeholder="بحث بالاسم، الخدمة، التخصص، أو الكلمات المفتاحية..."
            className="w-full pr-11 pl-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-semibold focus:outline-none focus:border-primary-500"
          />
        </form>

        <div className="flex items-center gap-2 w-full md:w-auto">
          {/* Filter Button (Opens Bottom Sheet Modal on Mobile) */}
          <button
            onClick={() => setShowFilterModal(true)}
            className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-orange-50 hover:bg-orange-100 text-primary-700 font-bold text-xs sm:text-sm px-4 py-3 rounded-2xl border border-orange-200 transition-all"
          >
            <Filter className="w-4 h-4 text-primary-500" />
            <span>الفلاتر المتقدمة</span>
            {(filters.category_id || filters.area_id || filters.type !== 'all' || filters.verified === '1') && (
              <span className="w-2 h-2 rounded-full bg-primary-500"></span>
            )}
          </button>

          <button
            onClick={fetchResults}
            className="p-3 bg-slate-100 hover:bg-slate-200 rounded-2xl text-slate-600 transition-all"
            title="تحديث النتائج"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Active Filters Bar */}
      <div className="flex flex-wrap items-center gap-2 text-xs font-semibold">
        <span className="text-slate-500">نتائج البحث ({results.length}):</span>
        {filters.q && (
          <span className="bg-slate-200 text-slate-800 px-2.5 py-1 rounded-lg flex items-center gap-1">
            "{filters.q}"
            <X className="w-3 h-3 cursor-pointer" onClick={() => setFilters({ ...filters, q: '' })} />
          </span>
        )}
        {filters.type !== 'all' && (
          <span className="bg-primary-100 text-primary-800 px-2.5 py-1 rounded-lg">
            {filters.type === 'company' ? 'شركات فقط' : 'أفراد فقط'}
          </span>
        )}
        {filters.verified === '1' && (
          <span className="bg-emerald-100 text-emerald-800 px-2.5 py-1 rounded-lg">
            ✓ موثق فقط
          </span>
        )}
      </div>

      {/* Results Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="bg-slate-200 h-64 rounded-3xl"></div>
          ))}
        </div>
      ) : results.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {results.map((item) => (
            <ProviderCard
              key={`${item.type}-${item.id}`}
              item={item}
              onClick={onSelectProvider}
              onRequestClick={onRequestClick}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-16 bg-white rounded-3xl border border-slate-200 p-8 space-y-3">
          <Search className="w-16 h-16 text-slate-300 mx-auto" />
          <h3 className="font-extrabold text-lg text-slate-800">لم يتم العثور على نتائج تطابق هذا البحث</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            جرب إزالة بعض الفلاتر أو إعادة كتابة الكلمة المفتاحية بشكل عام (مثل: سباك، دهان، غدامس).
          </p>
        </div>
      )}

      {/* Bottom Sheet Filter Modal */}
      <FilterBottomSheet
        isOpen={showFilterModal}
        onClose={() => setShowFilterModal(false)}
        filters={filters}
        onApplyFilters={(newFilters) => setFilters(newFilters)}
        cities={cities}
        categories={categories}
      />

    </div>
  );
}
