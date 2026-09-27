import React, { useState, useEffect } from 'react';
import {
  Clock,
  CheckCircle2,
  Phone,
  Calendar,
  Star,
  Eye,
  ShieldCheck,
  AlertCircle,
  LogOut,
  User,
  Building2,
  RefreshCw
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function ProviderDashboard({ onNavigate }) {
  const { user, token, logout } = useAuth();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchRequests = () => {
    if (!token) return;
    setLoading(true);
    fetch('/api/provider/requests', {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then((res) => res.json())
      .then((data) => setRequests(data || []))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchRequests();
  }, [token]);

  if (!user || (user.role_name !== 'provider' && user.role_name !== 'company')) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center space-y-4">
        <h2 className="font-black text-2xl text-slate-900">غير مصرح</h2>
        <p className="text-sm text-slate-500">هذه الصفحة خاصة بمزودي الخدمات والشركات المسجلة فقط</p>
        <button
          onClick={() => onNavigate('login')}
          className="bg-primary-500 hover:bg-primary-600 text-white font-extrabold px-6 py-3 rounded-2xl"
        >
          تسجيل الدخول
        </button>
      </div>
    );
  }

  const handleUpdateStatus = async (requestId, newStatus) => {
    try {
      const res = await fetch(`/api/provider/requests/${requestId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus })
      });
      if (res.ok) {
        fetchRequests();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const targetInfo = user.target_info || {};

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-8">
      
      {/* Provider Header Profile Box */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-4 text-center sm:text-right">
          <div className="w-16 h-16 rounded-2xl bg-orange-500 text-white flex items-center justify-center font-black text-2xl shadow-lg shadow-orange-500/30">
            {user.role_name === 'company' ? <Building2 className="w-8 h-8" /> : <User className="w-8 h-8" />}
          </div>
          <div>
            <div className="flex items-center gap-2 justify-center sm:justify-start">
              <h1 className="text-2xl font-black text-slate-900">{user.name}</h1>
              {targetInfo.is_verified === 1 && (
                <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                  ✓ موثق
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500" dir="ltr">{user.phone}</p>
            
            {/* Approval Badge */}
            <div className="mt-1">
              {targetInfo.is_approved === 1 ? (
                <span className="bg-emerald-100 text-emerald-800 text-[11px] font-bold px-2.5 py-0.5 rounded-full">
                  ✓ الحساب معتمد ونشط على المنصة
                </span>
              ) : (
                <span className="bg-amber-100 text-amber-800 text-[11px] font-bold px-2.5 py-0.5 rounded-full animate-pulse">
                  ⏳ الحساب قيد المراجعة والتدقيق من الإدارة
                </span>
              )}
            </div>
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

      {/* Stats Counters */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm space-y-1">
          <span className="text-xs font-bold text-slate-400">إجمالي الطلبات</span>
          <p className="text-2xl font-black text-slate-900">{requests.length}</p>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm space-y-1">
          <span className="text-xs font-bold text-slate-400">الطلبات الجديدة</span>
          <p className="text-2xl font-black text-primary-600">
            {requests.filter((r) => r.status === 'new').length}
          </p>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm space-y-1">
          <span className="text-xs font-bold text-slate-400">التقييم العام</span>
          <div className="flex items-center gap-1">
            <Star className="w-5 h-5 fill-amber-400 text-amber-400" />
            <span className="text-xl font-black text-slate-900">{targetInfo.rating_avg || '5.0'}</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm space-y-1">
          <span className="text-xs font-bold text-slate-400">عدد المشاهدات</span>
          <div className="flex items-center gap-1">
            <Eye className="w-5 h-5 text-slate-400" />
            <span className="text-xl font-black text-slate-900">{targetInfo.views_count || 0}</span>
          </div>
        </div>
      </div>

      {/* Incoming Requests Section */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-black text-slate-900">صندوق طلبات الخدمات الواردة</h2>
            <p className="text-xs text-slate-500">تابع طلبات العملاء وقم بتحديث حالتها مباشرة</p>
          </div>
          <button
            onClick={fetchRequests}
            className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>

        {loading ? (
          <div className="py-12 text-center text-slate-400">جاري التحميل...</div>
        ) : requests.length > 0 ? (
          <div className="space-y-4">
            {requests.map((req) => (
              <div
                key={req.id}
                className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-3"
              >
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200/60 pb-3">
                  <div>
                    <span className="font-extrabold text-slate-900 text-sm">{req.customer_name}</span>
                    <a href={`tel:${req.customer_phone}`} className="text-xs text-primary-600 font-bold block" dir="ltr">
                      📞 {req.customer_phone}
                    </a>
                  </div>

                  {/* Status Selection */}
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-500">الحالة:</span>
                    <select
                      value={req.status}
                      onChange={(e) => handleUpdateStatus(req.id, e.target.value)}
                      className="bg-white border border-slate-300 rounded-xl px-3 py-1 text-xs font-bold text-slate-800 focus:outline-none focus:border-primary-500"
                    >
                      <option value="new">جديد</option>
                      <option value="contacted">تم التواصل</option>
                      <option value="in_progress">قيد التنفيذ</option>
                      <option value="completed">مكتمل ✓</option>
                      <option value="cancelled">ملغي</option>
                    </select>
                  </div>
                </div>

                <p className="text-sm text-slate-700 font-medium leading-relaxed">{req.description}</p>

                <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 pt-1">
                  <span>الموقع: {req.address || 'غدامس'}</span>
                  <span>التاريخ: {req.requested_date || 'غير محدد'}</span>
                  <span>الوقت: {req.requested_time || 'غير محدد'}</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-12 text-center text-slate-400">
            لا توجد طلبات واردة حالياً.
          </div>
        )}
      </div>

    </div>
  );
}
