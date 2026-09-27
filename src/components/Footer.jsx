import React from 'react';
import { Phone, Mail, MapPin, ShieldCheck, Heart } from 'lucide-react';

export default function Footer({ onNavigate }) {
  return (
    <footer className="bg-slate-900 text-slate-300 pt-12 pb-24 lg:pb-12 border-t border-slate-800 mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          
          {/* Col 1: Platform Info */}
          <div>
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-10 h-10 bg-primary-500 rounded-xl flex items-center justify-center text-white font-extrabold text-xl shadow-lg shadow-orange-500/30">
                خ
              </div>
              <span className="font-extrabold text-2xl text-white tracking-tight">منصة خدمتي</span>
            </div>
            <p className="text-slate-400 text-sm leading-relaxed mb-4">
              المنصة الرمزية الأولى والحديثة التي تجمع كافة الشركات والمؤسسات والحرفيين ومقدمي الخدمات المنزلية والفنية في غدامس وكافة مدن ليبيا في مكان واحد.
            </p>
            <div className="flex items-center gap-2 text-xs text-orange-400 font-medium">
              <ShieldCheck className="w-4 h-4" />
              <span>منصة موثوقة ومصممة للتوسع في جميع مدن ليبيا</span>
            </div>
          </div>

          {/* Col 2: Quick Links */}
          <div>
            <h4 className="text-white font-bold text-base mb-4 border-r-4 border-primary-500 pr-3">روابط سريعة</h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <button onClick={() => onNavigate('home')} className="hover:text-primary-400 transition-colors">الرئيسية</button>
              </li>
              <li>
                <button onClick={() => onNavigate('categories')} className="hover:text-primary-400 transition-colors">جميع التصنيفات</button>
              </li>
              <li>
                <button onClick={() => onNavigate('search')} className="hover:text-primary-400 transition-colors">محرك البحث المتقدم</button>
              </li>
              <li>
                <button onClick={() => onNavigate('add-business')} className="hover:text-primary-400 transition-colors">أضف نشاطك التجاري</button>
              </li>
              <li>
                <button onClick={() => onNavigate('favorites')} className="hover:text-primary-400 transition-colors">المفضلة</button>
              </li>
            </ul>
          </div>

          {/* Col 3: Popular Services */}
          <div>
            <h4 className="text-white font-bold text-base mb-4 border-r-4 border-primary-500 pr-3">الخدمات المتاحة</h4>
            <ul className="space-y-2 text-sm text-slate-400">
              <li>سباكة وصيانة تسريبات المياه</li>
              <li>كهرباء منازل ومولدات</li>
              <li>شركات مقاولات وبناء</li>
              <li>صيانة وتعبئة فريون التكييف</li>
              <li>تركيب سيراميك ورخام</li>
              <li>خدمات ميكانيك وسحب السيارات</li>
            </ul>
          </div>

          {/* Col 4: Contact & Locations */}
          <div>
            <h4 className="text-white font-bold text-base mb-4 border-r-4 border-primary-500 pr-3">التواصل والموقع</h4>
            <div className="space-y-3 text-sm text-slate-400">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-primary-400 shrink-0" />
                <span>غدامس ومختلف المناطق والمدن - ليبيا</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-primary-400 shrink-0" />
                <span dir="ltr">+218 91 000 0000</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-primary-400 shrink-0" />
                <span>info@khadmati.ly</span>
              </div>
            </div>
          </div>

        </div>

        <div className="pt-8 border-t border-slate-800 text-center text-xs text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>© {new Date().getFullYear()} منصة خدمتي. جميع الحقوق محفوظة.</p>
          <div className="flex items-center gap-1 text-slate-400">
            <span>صُنع بحب لخدمة أهلنا في</span>
            <span className="font-bold text-orange-400">ليبيا ❤️</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
