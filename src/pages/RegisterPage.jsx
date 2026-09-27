import React, { useState } from 'react';
import { Phone, Lock, User, UserPlus, Mail } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function RegisterPage({ onNavigate }) {
  const { login } = useAuth();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, phone, email, password })
      });

      const data = await res.json();
      if (res.ok && data.token) {
        login(data.token, data.user);
        onNavigate('customer-dashboard');
      } else {
        setError(data.message || 'حدث خطأ أثناء التسجيل');
      }
    } catch (err) {
      setError('خطأ في الاتصال بالشبكة');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-12 space-y-6">
      
      <div className="text-center space-y-2">
        <h1 className="text-2xl font-black text-slate-900">إنشاء حساب عميل جديد</h1>
        <p className="text-xs text-slate-500">سجل حسابك في منصة خدمتي للبحث وطلب الخدمات وسرعة التواصل</p>
      </div>

      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-md">
        
        {error && (
          <div className="mb-4 p-3 rounded-xl bg-red-50 text-red-700 text-xs font-bold border border-red-200">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">الاسم الكامل *</label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-400 absolute right-3 top-3.5" />
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="أدخل اسمك الكامل"
                className="w-full pr-9 pl-3 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:outline-none focus:border-primary-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">رقم الهاتف *</label>
            <div className="relative">
              <Phone className="w-4 h-4 text-slate-400 absolute right-3 top-3.5" />
              <input
                type="tel"
                required
                dir="ltr"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="091XXXXXXX"
                className="w-full pr-9 pl-3 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-right focus:outline-none focus:border-primary-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">البريد الإلكتروني (اختياري)</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute right-3 top-3.5" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full pr-9 pl-3 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:outline-none focus:border-primary-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">كلمة المرور *</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute right-3 top-3.5" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pr-9 pl-3 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:outline-none focus:border-primary-500"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 bg-primary-500 hover:bg-primary-600 text-white font-extrabold text-sm rounded-xl shadow-lg shadow-orange-500/20 flex items-center justify-center gap-2"
          >
            {loading ? (
              <span>جاري التسجيل...</span>
            ) : (
              <>
                <UserPlus className="w-4 h-4" />
                <span>إنشاء الحساب</span>
              </>
            )}
          </button>
        </form>

        <div className="mt-6 pt-6 border-t border-slate-100 text-center">
          <button
            onClick={() => onNavigate('login')}
            className="text-xs font-bold text-primary-600 hover:underline"
          >
            لديك حساب بالفعل؟ تسجيل الدخول
          </button>
        </div>

      </div>
    </div>
  );
}
