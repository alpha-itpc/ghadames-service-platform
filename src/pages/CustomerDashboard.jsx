import React, { useState, useEffect } from 'react';
import { Clock, Heart, User, LogOut, Phone, Calendar, CheckCircle, AlertCircle, XCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import ProviderCard from '../components/ProviderCard';

export default function CustomerDashboard({ onNavigate, onSelectProvider, onRequestClick }) {
  const { user, token, logout, favorites } = useAuth();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('requests'); // 'requests', 'favorites'

  useEffect(() => {
    if (token) {
      fetch('/api/customer/requests', {
        headers: { Authorization: `Bearer ${token}` }
      })
        .then((res) => res.json())
        .then((data) => setRequests(data || []))
        .catch((err) => console.error(err))
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [token]);

  if (!user) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center space-y-4">
        <h2 className="font-black text-2xl text-slate-900">تسجيل الدخول مطلوب</h2>
        <p className="text-sm text-slate-500">يرجى تسجيل الدخول لعرض طلباتك والأنشطة المفضلة لديها</p>
        <button
          onClick={() => onNavigate('login')}
          className="bg-primary-500 hover:bg-primary-600 text-white font-extrabold px-6 py-3 rounded-2xl shadow-lg shadow-orange-500/20"
        >
          تسجيل الدخول الان
        </button>
      </div>
    );
  }

  const getStatusBadge = (status) => {
    switch (status) {
      case 'new':
        return <span className="bg-amber-100 text-amber-800 text-xs font-bold px-2.5 py-1 rounded-full">جديد</span>;
      case 'contacted':
        return <span className="bg-blue-100 text-blue-800 text-xs font-bold px-2.5 py-1 rounded-full">تم التواصل</span>;
      case 'in_progress':
        return <span className="bg-orange-100 text-primary-700 text-xs font-bold px-2.5 py-1 rounded-full">قيد التنفيذ</span>;
      case 'completed':
        return <span className="bg-emerald-100 text-emerald-800 text-xs font-bold px-2.5 py-1 rounded-full">✓ مكتمل</span>;
      case 'cancelled':
        return <span className="bg-red-100 text-red-800 text-xs font-bold px-2.5 py-1 rounded-full">ملغي</span>;
      default:
        return <span className="bg-slate-100 text-slate-700 text-xs font-bold px-2.5 py-1 rounded-full">{status}</span>;
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-6">
      
      {/* Header Profile Box */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4 text-center sm:text-right">
          <div className="w-16 h-16 rounded-2xl bg-orange-100 text-primary-600 flex items-center justify-center font-black text-2xl shadow-inner">
            {user.name.charAt(0)}
          </div>
          <div>
            <h1 className="text-xl font-black text-slate-900">{user.name}</h1>
            <p className="text-xs text-slate-500" dir="ltr">{user.phone}</p>
            <span className="text-[11px] font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-md mt-1 inline-block">حساب عميل</span>
          </div>
        </div>

        <button
          onClick={() => {
            logout();
            onNavigate('home');
          }}
          className="flex items-center gap-1.5 text-xs font-bold text-red-600 bg-red-50 hover:bg-red-100 px-4 py-2.5 rounded-xl border border-red-200"
        >
          <LogOut className="w-4 h-4" />
          <span>تسجيل الخروج</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveTab('requests')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all ${
            activeTab === 'requests'
              ? 'bg-primary-500 text-white shadow-md'
              : 'bg-white text-slate-700 hover:bg-slate-100'
          }`}
        >
          <Clock className="w-4 h-4" />
          <span>طلباتي المرسلة ({requests.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('favorites')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all ${
            activeTab === 'favorites'
              ? 'bg-primary-500 text-white shadow-md'
              : 'bg-white text-slate-700 hover:bg-slate-100'
          }`}
        >
          <Heart className="w-4 h-4" />
          <span>المفضلة ({favorites.length})</span>
        </button>
      </div>

      {/* Content */}
      {activeTab === 'requests' ? (
        <div className="space-y-4">
          {loading ? (
            <div className="p-8 text-center text-slate-400">جاري تحميل الطلبات...</div>
          ) : requests.length > 0 ? (
            requests.map((req) => (
              <div key={req.id} className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-400">طلب رقم #{req.id}</span>
                  {getStatusBadge(req.status)}
                </div>
                <p className="text-sm font-bold text-slate-900">{req.description}</p>
                <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-primary-500" />
                    {req.requested_date || 'غير محدد'}
                  </span>
                  <span>تاريخ الإرسال: {new Date(req.created_at).toLocaleDateString('ar-LY')}</span>
                </div>
              </div>
            ))
          ) : (
            <div className="bg-white p-12 text-center rounded-3xl border border-slate-200 text-slate-400">
              لم تقم بإرسال أي طلبات خدمة بعد.
            </div>
          )}
        </div>
      ) : (
        <div>
          {favorites.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {favorites.map((item) => (
                <ProviderCard
                  key={item.key}
                  item={item}
                  onClick={onSelectProvider}
                  onRequestClick={onRequestClick}
                />
              ))}
            </div>
          ) : (
            <div className="bg-white p-12 text-center rounded-3xl border border-slate-200 text-slate-400">
              قائمة المفضلة فارغة حالياً. اضغط على ❤️ لتقديم نشاط للمفضلة!
            </div>
          )}
        </div>
      )}

    </div>
  );
}
