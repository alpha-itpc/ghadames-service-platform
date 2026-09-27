import React, { useState } from 'react';
import { Phone, Lock, User, LogIn, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function LoginPage({ onNavigate }) {
  const { login } = useAuth();
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, password })
      });

      const data = await res.json();
      if (res.ok && data.token) {
        login(data.token, data.user);
        if (data.user.role_name === 'admin') {
          onNavigate('admin-dashboard');
        } else if (data.user.role_name === 'provider' || data.user.role_name === 'company') {
          onNavigate('provider-dashboard');
        } else {
          onNavigate('customer-dashboard');
        }
      } else {
        setError(data.message || 'بيانات الدخول غير صحيحة');
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
        <div className="w-14 h-14 bg-primary-500 rounded-2xl flex items-center justify-center font-black text-2xl text-white mx-auto shadow-lg shadow-orange-500/30">
          خ
        </div>
        <h1 className="text-2xl font-black text-slate-900">تسجيل الدخول - منصة خدمتي</h1>
        <p className="text-xs text-slate-500">أدخل رقم الهاتف وكلمة المرور لمتابعة حسابك</p>
      </div>

      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-md">
        
        {error && (
          <div className="mb-4 p-3 rounded-xl bg-red-50 text-red-700 text-xs font-bold border border-red-200">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
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
              <span>جاري التحقق...</span>
            ) : (
              <>
                <LogIn className="w-4 h-4" />
                <span>تسجيل الدخول</span>
              </>
            )}
          </button>
        </form>

        <div className="mt-6 pt-6 border-t border-slate-100 text-center space-y-2">
          <p className="text-xs text-slate-500">ليس لديك حساب بعد؟</p>
          <button
            onClick={() => onNavigate('register')}
            className="text-xs font-bold text-primary-600 hover:underline"
          >
            إنشاء حساب عميل جديد
          </button>
          <span className="text-slate-300 block text-xs">أو</span>
          <button
            onClick={() => onNavigate('add-business')}
            className="text-xs font-bold text-slate-800 bg-slate-100 px-3 py-1.5 rounded-xl hover:bg-slate-200 transition-colors"
          >
            أضف نشاطك التجاري كشركة أو حرافي
          </button>
        </div>

      </div>
    </div>
  );
}
