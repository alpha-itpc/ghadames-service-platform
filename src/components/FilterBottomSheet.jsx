import React, { useState, useEffect } from 'react';
import { X, Check, Filter, RotateCcw } from 'lucide-react';

export default function FilterBottomSheet({ isOpen, onClose, filters, onApplyFilters, cities, categories }) {
  const [localFilters, setLocalFilters] = useState(filters);

  useEffect(() => {
    setLocalFilters(filters);
  }, [filters, isOpen]);

  if (!isOpen) return null;

  const currentCityObj = cities.find((c) => c.id == localFilters.city_id);
  const availableAreas = currentCityObj ? currentCityObj.areas || [] : [];

  const handleApply = () => {
    onApplyFilters(localFilters);
    onClose();
  };

  const handleReset = () => {
    const reset = {
      q: '',
      city_id: 1, // Default Ghadames
      area_id: '',
      category_id: '',
      type: 'all',
      verified: '0',
      available: '0'
    };
    setLocalFilters(reset);
    onApplyFilters(reset);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-900/60 backdrop-blur-sm p-0 sm:p-4">
      <div className="w-full max-w-lg bg-white rounded-t-3xl sm:rounded-3xl max-h-[90vh] flex flex-col shadow-2xl animate-in slide-in-from-bottom duration-300 overflow-hidden">
        
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-primary-500" />
            <h3 className="font-extrabold text-lg text-slate-900">فلترة نتائج البحث المتقدمة</h3>
          </div>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-slate-200 text-slate-500">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 overflow-y-auto space-y-6 flex-1">
          
          {/* Account Type Filter */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-2">نوع النشاط</label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'all', label: 'الكل' },
                { id: 'provider', label: 'أفراد / حرفيون' },
                { id: 'company', label: 'شركات ومؤسسات' }
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => setLocalFilters({ ...localFilters, type: item.id })}
                  className={`py-2 px-3 text-xs font-bold rounded-xl border transition-all ${
                    localFilters.type === item.id
                      ? 'bg-primary-500 text-white border-primary-500 shadow-sm'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          {/* City Filter */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-2">المدينة</label>
            <select
              value={localFilters.city_id}
              onChange={(e) => setLocalFilters({ ...localFilters, city_id: e.target.value, area_id: '' })}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm font-semibold text-slate-800 focus:outline-none focus:border-primary-500"
            >
              {cities.map((city) => (
                <option key={city.id} value={city.id}>
                  {city.name_ar} {city.name_ar === 'غدامس' ? '(المدينة الحالية)' : ''}
                </option>
              ))}
            </select>
          </div>

          {/* Area Filter */}
          {availableAreas.length > 0 && (
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-2">المنطقة / الحي</label>
              <select
                value={localFilters.area_id}
                onChange={(e) => setLocalFilters({ ...localFilters, area_id: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm font-semibold text-slate-800 focus:outline-none focus:border-primary-500"
              >
                <option value="">جميع مناطق {currentCityObj?.name_ar}</option>
                {availableAreas.map((area) => (
                  <option key={area.id} value={area.id}>
                    {area.name_ar}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Category Filter */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-2">التصنيف الرئيسي</label>
            <select
              value={localFilters.category_id}
              onChange={(e) => setLocalFilters({ ...localFilters, category_id: e.target.value })}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm font-semibold text-slate-800 focus:outline-none focus:border-primary-500"
            >
              <option value="">جميع التصنيفات</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name_ar}
                </option>
              ))}
            </select>
          </div>

          {/* Verification & Availability Toggles */}
          <div className="space-y-3 pt-2 border-t border-slate-100">
            <label className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200 cursor-pointer">
              <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <span className="text-emerald-600 font-extrabold">✓</span> الحسابات الموثقة فقط
              </span>
              <input
                type="checkbox"
                checked={localFilters.verified === '1'}
                onChange={(e) => setLocalFilters({ ...localFilters, verified: e.target.checked ? '1' : '0' })}
                className="w-4 h-4 text-primary-600 rounded focus:ring-primary-500"
              />
            </label>

            <label className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200 cursor-pointer">
              <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span> المتاحون الآن فقط
              </span>
              <input
                type="checkbox"
                checked={localFilters.available === '1'}
                onChange={(e) => setLocalFilters({ ...localFilters, available: e.target.checked ? '1' : '0' })}
                className="w-4 h-4 text-primary-600 rounded focus:ring-primary-500"
              />
            </label>
          </div>

        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-slate-100 bg-slate-50 flex items-center gap-3">
          <button
            onClick={handleReset}
            className="flex items-center justify-center gap-1 py-3 px-4 rounded-xl border border-slate-200 font-bold text-xs text-slate-600 hover:bg-slate-100"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>إعادة ضبط</span>
          </button>
          <button
            onClick={handleApply}
            className="flex-1 py-3 px-4 rounded-xl bg-primary-500 hover:bg-primary-600 text-white font-bold text-sm shadow-lg shadow-orange-500/20 text-center"
          >
            تطبيق الفلاتر
          </button>
        </div>

      </div>
    </div>
  );
}
