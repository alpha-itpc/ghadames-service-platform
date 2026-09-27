import React from 'react';
import {
  Wrench,
  Zap,
  Building2,
  Paintbrush,
  Grid,
  Hammer,
  LayoutGrid,
  ShieldAlert,
  Snowflake,
  Sparkles,
  Truck,
  Car,
  Home,
  Monitor,
  ChevronLeft
} from 'lucide-react';

const iconMap = {
  Wrench,
  Zap,
  Building2,
  Paintbrush,
  Grid,
  Hammer,
  LayoutApp: LayoutGrid,
  ShieldAlert,
  Snowflake,
  Sparkles,
  Truck,
  Car,
  Home,
  Monitor
};

export default function CategoryCard({ category, onClick }) {
  const IconComponent = iconMap[category.icon] || Wrench;

  return (
    <div
      onClick={() => onClick(category)}
      className="group relative bg-white hover:bg-gradient-to-tr hover:from-orange-500 hover:to-primary-500 rounded-2xl p-4 sm:p-5 border border-slate-100 shadow-sm hover:shadow-xl hover:shadow-orange-500/20 transition-all duration-300 cursor-pointer flex flex-col justify-between"
    >
      <div>
        <div className="w-12 h-12 rounded-xl bg-orange-50 group-hover:bg-white/20 text-primary-600 group-hover:text-white flex items-center justify-center mb-3 transition-colors">
          <IconComponent className="w-6 h-6" />
        </div>
        <h3 className="font-bold text-base text-slate-900 group-hover:text-white transition-colors mb-1">
          {category.name_ar}
        </h3>
        <p className="text-xs text-slate-500 group-hover:text-white/80 line-clamp-2 transition-colors mb-3">
          {category.description || 'خدمات متنوعة واحترافية'}
        </p>
      </div>

      <div className="flex items-center justify-between pt-2 border-t border-slate-100 group-hover:border-white/20">
        <span className="text-[11px] font-bold text-orange-600 group-hover:text-white bg-orange-50 group-hover:bg-white/20 px-2 py-0.5 rounded-full transition-colors">
          {category.providers_count || 0} مزود خدمة
        </span>
        <div className="w-6 h-6 rounded-full bg-slate-100 group-hover:bg-white/20 flex items-center justify-center text-slate-400 group-hover:text-white transition-colors">
          <ChevronLeft className="w-4 h-4" />
        </div>
      </div>
    </div>
  );
}
