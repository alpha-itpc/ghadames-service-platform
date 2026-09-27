import React, { useState } from 'react';
import { X, MapPin, Check, Plus } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function CitySelectorModal({ isOpen, onClose, cities }) {
  const { selectedCity, setSelectedCity, selectedArea, setSelectedArea } = useAuth();
  const [activeCityTab, setActiveCityTab] = useState(selectedCity.id);

  if (!isOpen) return null;

  const currentCityObj = cities.find((c) => c.id === activeCityTab) || cities[0];

  const handleSelectCity = (cityObj) => {
    setSelectedCity(cityObj);
    setSelectedArea(null);
    onClose();
  };

  const handleSelectArea = (areaObj) => {
    const parentCity = cities.find((c) => c.id === areaObj.city_id);
    if (parentCity) {
      setSelectedCity(parentCity);
    }
    setSelectedArea(areaObj);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
      <div className="w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        
        {/* Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2">
            <MapPin className="w-5 h-5 text-primary-500" />
            <h3 className="font-extrabold text-lg text-slate-900">اختر المدينة والمنطقة في ليبيا</h3>
          </div>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-slate-200 text-slate-500">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 overflow-y-auto space-y-6 flex-1">
          
          {/* Cities Grid */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-2.5">المدن المتاحة</label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              {cities.map((city) => {
                const isSelected = selectedCity.id === city.id && !selectedArea;
                return (
                  <button
                    key={city.id}
                    onClick={() => setActiveCityTab(city.id)}
                    className={`p-3 rounded-2xl border text-right transition-all flex items-center justify-between ${
                      activeCityTab === city.id
                        ? 'bg-orange-50 border-primary-500 text-primary-700 font-extrabold shadow-sm'
                        : 'bg-slate-50 border-slate-200 text-slate-700 font-medium hover:bg-slate-100'
                    }`}
                  >
                    <span className="text-sm">
                      {city.name_ar} {city.name_ar === 'غدامس' ? '⭐' : ''}
                    </span>
                    {activeCityTab === city.id && <Check className="w-4 h-4 text-primary-600" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Areas for Active City */}
          {currentCityObj && (
            <div className="pt-4 border-t border-slate-100">
              <div className="flex items-center justify-between mb-3">
                <label className="text-xs font-bold text-slate-700">
                  مناطق مدينة {currentCityObj.name_ar}
                </label>
                <button
                  onClick={() => handleSelectCity(currentCityObj)}
                  className="text-xs font-bold text-primary-600 hover:underline"
                >
                  اختيار كل مناطق {currentCityObj.name_ar}
                </button>
              </div>

              <div className="grid grid-cols-2 gap-2">
                {currentCityObj.areas && currentCityObj.areas.length > 0 ? (
                  currentCityObj.areas.map((area) => {
                    const isSelected = selectedArea && selectedArea.id === area.id;
                    return (
                      <button
                        key={area.id}
                        onClick={() => handleSelectArea(area)}
                        className={`p-2.5 rounded-xl border text-right text-xs font-semibold transition-all ${
                          isSelected
                            ? 'bg-primary-500 text-white border-primary-500'
                            : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                        }`}
                      >
                        {area.name_ar}
                      </button>
                    );
                  })
                ) : (
                  <p className="text-xs text-slate-400 col-span-2 py-2">لا توجد مناطق فرعية مضافة حالياً</p>
                )}
              </div>
            </div>
          )}

        </div>

      </div>
    </div>
  );
}
