import React, { useState } from 'react';
import { PlusCircle, Building2, User, Phone, Mail, MapPin, Wrench, CheckCircle2, ShieldAlert } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function AddBusinessPage({ cities, categories, onNavigate }) {
  const { selectedCity } = useAuth();
  
  const [accountType, setAccountType] = useState('provider'); // 'provider' or 'company'
  const [formData, setFormData] = useState({
    name: '',
    company_name: '',
    title: '',
    phone: '',
    whatsapp: '',
    email: '',
    password: '',
    city_id: selectedCity.id,
    area_id: '',
    category_id: '',
    description: '',
    address: '',
    avatar_url: '',
    logo_url: ''
  });

  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const currentCityObj = cities.find((c) => c.id == formData.city_id);
  const availableAreas = currentCityObj ? currentCityObj.areas || [] : [];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      const res = await fetch('/api/register-business', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          account_type: accountType
        })
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setSubmitted(true);
        setMessage(data.message);
      } else {
        setError(data.message || 'حدث خطأ أثناء التسجيل');
      }
    } catch (err) {
      setError('خطأ في الاتصال بالسيرفر');
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center space-y-4">
        <div className="bg-emerald-50 border-2 border-emerald-200 p-8 rounded-3xl space-y-4">
          <CheckCircle2 className="w-20 h-20 text-emerald-500 mx-auto animate-bounce" />
          <h2 className="text-2xl font-black text-slate-900">تم إرسال نشاطك التجاري بنجاح!</h2>
          <div className="bg-amber-50 p-4 rounded-2xl border border-amber-200 text-xs font-extrabold text-amber-900 flex items-center justify-center gap-2">
            <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0" />
            <span>حالة الحساب: <strong>قيد المراجعة والتدقيق من الإدارة</strong></span>
          </div>
          <p className="text-slate-600 text-sm leading-relaxed">{message}</p>
          <button
            onClick={() => onNavigate('home')}
            className="bg-primary-500 hover:bg-primary-600 text-white font-extrabold px-6 py-3 rounded-2xl shadow-lg shadow-orange-500/20"
          >
            العودة للرئيسية
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">
      
      {/* Page Header */}
      <div className="text-center space-y-2">
        <span className="bg-orange-100 text-primary-700 text-xs font-extrabold px-3 py-1 rounded-full">
          انضم إلينا اليوم
        </span>
        <h1 className="text-3xl font-black text-slate-900">أضف نشاطك التجاري في منصة خدمتي</h1>
        <p className="text-sm text-slate-500 max-w-xl mx-auto">
          سجل حسابك كشركة أو كمقدم خدمة مستقل واستقبل طلبات الخدمات والاتصالات مباشرة
        </p>
      </div>

      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-md">
        
        {error && (
          <div className="mb-6 p-4 rounded-2xl bg-red-50 text-red-700 text-xs font-bold border border-red-200">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* Account Type Selector */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-2">نوع الحساب *</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setAccountType('provider')}
                className={`p-4 rounded-2xl border text-right transition-all flex items-center gap-3 ${
                  accountType === 'provider'
                    ? 'bg-orange-50 border-primary-500 text-primary-700 font-extrabold shadow-sm'
                    : 'bg-slate-50 border-slate-200 text-slate-700 font-medium hover:bg-slate-100'
                }`}
              >
                <div className="p-2.5 rounded-xl bg-white shadow-xs">
                  <User className="w-5 h-5 text-primary-500" />
                </div>
                <div>
                  <span className="block text-sm font-extrabold">مقدم خدمة مستقل</span>
                  <span className="text-[11px] text-slate-500">سباك، كهربائي، دهان، فني...</span>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setAccountType('company')}
                className={`p-4 rounded-2xl border text-right transition-all flex items-center gap-3 ${
                  accountType === 'company'
                    ? 'bg-orange-50 border-primary-500 text-primary-700 font-extrabold shadow-sm'
                    : 'bg-slate-50 border-slate-200 text-slate-700 font-medium hover:bg-slate-100'
                }`}
              >
                <div className="p-2.5 rounded-xl bg-white shadow-xs">
                  <Building2 className="w-5 h-5 text-primary-500" />
                </div>
                <div>
                  <span className="block text-sm font-extrabold">شركة / مؤسسة</span>
                  <span className="text-[11px] text-slate-500">شركة مقاولات، تكييف، تنظيف...</span>
                </div>
              </button>
            </div>
          </div>

          {/* Business Info Inputs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            {accountType === 'company' ? (
              <div className="col-span-2">
                <label className="block text-xs font-bold text-slate-700 mb-1">اسم الشركة أو المؤسسة *</label>
                <input
                  type="text"
                  required
                  value={formData.company_name}
                  onChange={(e) => setFormData({ ...formData, company_name: e.target.value })}
                  placeholder="مثال: شركة واحة غدامس للمقاولات"
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:outline-none focus:border-primary-500"
                />
              </div>
            ) : (
              <>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">الاسم الكامل *</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="مثال: عبدالسلام الغدامسي"
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:outline-none focus:border-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">المسمى الوظيفي / التخصص *</label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="مثال: فني سباكة وتسريبات خبير"
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:outline-none focus:border-primary-500"
                  />
                </div>
              </>
            )}

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">رقم الهاتف للتواصل *</label>
              <input
                type="tel"
                required
                dir="ltr"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="091XXXXXXX"
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-right focus:outline-none focus:border-primary-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">رقم الواتساب</label>
              <input
                type="tel"
                dir="ltr"
                value={formData.whatsapp}
                onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
                placeholder="21891XXXXXXX"
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-right focus:outline-none focus:border-primary-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">البريد الإلكتروني (اختياري)</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="name@example.com"
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:outline-none focus:border-primary-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">كلمة المرور للحساب *</label>
              <input
                type="password"
                required
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                placeholder="••••••••"
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:outline-none focus:border-primary-500"
              />
            </div>

            {/* City & Area */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">المدينة *</label>
              <select
                required
                value={formData.city_id}
                onChange={(e) => setFormData({ ...formData, city_id: e.target.value, area_id: '' })}
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:outline-none focus:border-primary-500"
              >
                {cities.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name_ar}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">المنطقة / الحي *</label>
              <select
                required
                value={formData.area_id}
                onChange={(e) => setFormData({ ...formData, area_id: e.target.value })}
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:outline-none focus:border-primary-500"
              >
                <option value="">اختر المنطقة</option>
                {availableAreas.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.name_ar}
                  </option>
                ))}
              </select>
            </div>

            {/* Category */}
            <div className="col-span-2">
              <label className="block text-xs font-bold text-slate-700 mb-1">التصنيف الرئيسي للخدمات *</label>
              <select
                required
                value={formData.category_id}
                onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:outline-none focus:border-primary-500"
              >
                <option value="">اختر التصنيف الرئيسي</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name_ar}
                  </option>
                ))}
              </select>
            </div>

            <div className="col-span-2">
              <label className="block text-xs font-bold text-slate-700 mb-1">العنوان التفصيلي</label>
              <input
                type="text"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                placeholder="مثال: غدامس - شارع التونسية الرئيسي"
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:outline-none focus:border-primary-500"
              />
            </div>

            <div className="col-span-2">
              <label className="block text-xs font-bold text-slate-700 mb-1">وصف عن النشاط والخدمات المتاحة *</label>
              <textarea
                required
                rows="4"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="اكتب نبذة عن خبراتك والخدمات التي تقدمها بالتفصيل..."
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:border-primary-500"
              ></textarea>
            </div>

          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-4 bg-primary-500 hover:bg-primary-600 text-white font-black text-base rounded-2xl shadow-xl shadow-orange-500/30 transition-all flex items-center justify-center gap-2"
          >
            {submitting ? (
              <span>جاري تقديم الطلب...</span>
            ) : (
              <>
                <PlusCircle className="w-5 h-5" />
                <span>تسجيل النشاط التجاري وإرساله للمراجعة</span>
              </>
            )}
          </button>

        </form>

      </div>
    </div>
  );
}
