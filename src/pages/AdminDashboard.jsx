import React, { useState, useEffect } from 'react';
import {
  Users,
  Building2,
  CheckCircle2,
  XCircle,
  MapPin,
  Grid,
  ShieldCheck,
  Megaphone,
  Clock,
  Plus,
  LogOut,
  RefreshCw
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function AdminDashboard({ onNavigate, cities, categories, onRefreshCities, onRefreshCategories }) {
  const { user, token, logout } = useAuth();
  const [stats, setStats] = useState(null);
  const [pendingApprovals, setPendingApprovals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('approvals'); // 'approvals', 'cities', 'categories', 'ads'

  // Forms
  const [newCityName, setNewCityName] = useState('');
  const [selectedCityIdForArea, setSelectedCityIdForArea] = useState('');
  const [newAreaName, setNewAreaName] = useState('');
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategoryDesc, setNewCategoryDesc] = useState('');

  const loadAdminData = () => {
    if (!token) return;
    setLoading(true);
    Promise.all([
      fetch('/api/admin/stats', { headers: { Authorization: `Bearer ${token}` } }).then((res) => res.json()),
      fetch('/api/admin/pending-approvals', { headers: { Authorization: `Bearer ${token}` } }).then((res) => res.json())
    ])
      .then(([statsData, pendingData]) => {
        setStats(statsData || null);
        setPendingApprovals(pendingData || []);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadAdminData();
  }, [token]);

  if (!user || user.role_name !== 'admin') {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center space-y-4">
        <h2 className="font-black text-2xl text-slate-900">غير مصرح</h2>
        <p className="text-sm text-slate-500">هذه الصفحة خاصة بمدير النظام (Admin) فقط</p>
        <button
          onClick={() => onNavigate('login')}
          className="bg-primary-500 hover:bg-primary-600 text-white font-extrabold px-6 py-3 rounded-2xl"
        >
          تسجيل الدخول كأدمن
        </button>
      </div>
    );
  }

  const handleApprove = async (type, id, approve) => {
    try {
      const res = await fetch('/api/admin/approve-account', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ type, id, approve })
      });
      if (res.ok) {
        loadAdminData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddCity = async (e) => {
    e.preventDefault();
    if (!newCityName) return;
    try {
      const res = await fetch('/api/admin/cities', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ name_ar: newCityName, name_en: newCityName })
      });
      if (res.ok) {
        setNewCityName('');
        onRefreshCities();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddArea = async (e) => {
    e.preventDefault();
    if (!selectedCityIdForArea || !newAreaName) return;
    try {
      const res = await fetch('/api/admin/areas', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ city_id: selectedCityIdForArea, name_ar: newAreaName })
      });
      if (res.ok) {
        setNewAreaName('');
        onRefreshCities();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddCategory = async (e) => {
    e.preventDefault();
    if (!newCategoryName) return;
    try {
      const res = await fetch('/api/admin/categories', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ name_ar: newCategoryName, description: newCategoryDesc })
      });
      if (res.ok) {
        setNewCategoryName('');
        setNewCategoryDesc('');
        onRefreshCategories();
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
      
      {/* Admin Header */}
      <div className="bg-slate-900 text-white p-6 rounded-3xl shadow-xl flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4 text-center sm:text-right">
          <div className="w-16 h-16 rounded-2xl bg-primary-500 flex items-center justify-center font-black text-2xl text-white shadow-lg shadow-orange-500/30">
            أ
          </div>
          <div>
            <h1 className="text-2xl font-black">{user.name}</h1>
            <p className="text-xs text-orange-400 font-bold">لوحة تحكم مدير النظام الإدارية الشاملة</p>
          </div>
        </div>

        <button
          onClick={() => {
            logout();
            onNavigate('home');
          }}
          className="flex items-center gap-1.5 text-xs font-bold text-red-400 bg-red-950/50 hover:bg-red-900/50 px-4 py-2.5 rounded-xl border border-red-800"
        >
          <LogOut className="w-4 h-4" />
          <span>تسجيل الخروج</span>
        </button>
      </div>

      {/* Stats Counters (Requirement #17) */}
      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm text-center">
            <span className="text-xs text-slate-500 font-bold block">المستخدمون</span>
            <span className="text-xl font-black text-slate-900">{stats.total_users}</span>
          </div>
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm text-center">
            <span className="text-xs text-slate-500 font-bold block">الشركات</span>
            <span className="text-xl font-black text-slate-900">{stats.total_companies}</span>
          </div>
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm text-center">
            <span className="text-xs text-slate-500 font-bold block">المزودون</span>
            <span className="text-xl font-black text-slate-900">{stats.total_providers}</span>
          </div>
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm text-center">
            <span className="text-xs text-slate-500 font-bold block">طلبات الخدمات</span>
            <span className="text-xl font-black text-slate-900">{stats.total_requests}</span>
          </div>
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm text-center">
            <span className="text-xs text-slate-500 font-bold block">قيد المراجعة</span>
            <span className="text-xl font-black text-amber-600">{stats.pending_approvals}</span>
          </div>
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm text-center">
            <span className="text-xs text-slate-500 font-bold block">الحسابات الموثقة</span>
            <span className="text-xl font-black text-emerald-600">{stats.verified_accounts}</span>
          </div>
        </div>
      )}

      {/* Admin Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveTab('approvals')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all ${
            activeTab === 'approvals' ? 'bg-primary-500 text-white shadow-md' : 'bg-white text-slate-700 hover:bg-slate-100'
          }`}
        >
          <Clock className="w-4 h-4" />
          <span>مراجعة وقبول الحسابات ({pendingApprovals.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('cities')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all ${
            activeTab === 'cities' ? 'bg-primary-500 text-white shadow-md' : 'bg-white text-slate-700 hover:bg-slate-100'
          }`}
        >
          <MapPin className="w-4 h-4" />
          <span>إدارة المدن والمناطق ({cities.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('categories')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all ${
            activeTab === 'categories' ? 'bg-primary-500 text-white shadow-md' : 'bg-white text-slate-700 hover:bg-slate-100'
          }`}
        >
          <Grid className="w-4 h-4" />
          <span>إدارة التصنيفات والخدمات ({categories.length})</span>
        </button>
      </div>

      {/* Tab 1: Pending Approvals Queue */}
      {activeTab === 'approvals' && (
        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-black text-slate-900">طلبات الأنشطة قيد المراجعة والتدقيق</h2>
            <button onClick={loadAdminData} className="p-2 rounded-xl bg-slate-100 text-slate-600">
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>

          {pendingApprovals.length > 0 ? (
            <div className="space-y-4">
              {pendingApprovals.map((item) => (
                <div key={`${item.account_type}-${item.id}`} className="bg-slate-50 p-5 rounded-2xl border border-slate-200 flex flex-col md:flex-row items-center justify-between gap-4">
                  <div className="space-y-1 text-center md:text-right">
                    <div className="flex items-center gap-2 justify-center md:justify-start">
                      <h3 className="font-extrabold text-slate-900">{item.name}</h3>
                      <span className="text-[10px] font-bold bg-slate-200 text-slate-800 px-2 py-0.5 rounded-md">
                        {item.account_type === 'company' ? 'شركة' : 'مقدم خدمة'}
                      </span>
                    </div>
                    <p className="text-xs text-primary-600 font-bold">{item.title || item.category_name}</p>
                    <p className="text-xs text-slate-500">{item.description}</p>
                    <div className="flex items-center gap-3 text-xs text-slate-500 pt-1" dir="ltr">
                      <span>📞 {item.phone}</span>
                      <span>💬 {item.whatsapp}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => handleApprove(item.account_type, item.id, true)}
                      className="flex items-center gap-1.5 bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>اعتماد وتوثيق ✓</span>
                    </button>
                    <button
                      onClick={() => handleApprove(item.account_type, item.id, false)}
                      className="flex items-center gap-1.5 bg-red-50 hover:bg-red-100 text-red-600 font-bold text-xs px-3 py-2.5 rounded-xl border border-red-200"
                    >
                      <XCircle className="w-4 h-4" />
                      <span>رفض</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-12 text-center text-slate-400">
              لا توجد طلبات جديدة معلقة في الانتظار حالياً.
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Manage Cities & Areas (Dynamic Libya Expansion) */}
      {activeTab === 'cities' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Add City Form */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
            <h3 className="font-extrabold text-lg text-slate-900 border-r-4 border-primary-500 pr-3">إضافة مدينة جديدة في ليبيا</h3>
            <form onSubmit={handleAddCity} className="space-y-3">
              <input
                type="text"
                required
                value={newCityName}
                onChange={(e) => setNewCityName(e.target.value)}
                placeholder="اسم المدينة (مثال: درج، نالوت، زوارة، طرابلس...)"
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:outline-none focus:border-primary-500"
              />
              <button
                type="submit"
                className="w-full py-3 bg-primary-500 text-white font-extrabold text-sm rounded-xl flex items-center justify-center gap-1 shadow"
              >
                <Plus className="w-4 h-4" />
                <span>إضافة المدينة للسيستم</span>
              </button>
            </form>

            <div className="pt-4 space-y-2">
              <h4 className="text-xs font-bold text-slate-700">المدن الحالية في قاعدة البيانات:</h4>
              <div className="flex flex-wrap gap-2">
                {cities.map((c) => (
                  <span key={c.id} className="bg-slate-100 text-slate-800 text-xs font-bold px-3 py-1 rounded-xl">
                    {c.name_ar} ({c.areas ? c.areas.length : 0} مناطق)
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Add Area Form */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
            <h3 className="font-extrabold text-lg text-slate-900 border-r-4 border-primary-500 pr-3">إضافة منطقة أو حي جديد لمدينة</h3>
            <form onSubmit={handleAddArea} className="space-y-3">
              <select
                required
                value={selectedCityIdForArea}
                onChange={(e) => setSelectedCityIdForArea(e.target.value)}
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:outline-none focus:border-primary-500"
              >
                <option value="">اختر المدينة</option>
                {cities.map((c) => (
                  <option key={c.id} value={c.id}>{c.name_ar}</option>
                ))}
              </select>

              <input
                type="text"
                required
                value={newAreaName}
                onChange={(e) => setNewAreaName(e.target.value)}
                placeholder="اسم المنطقة أو الحي (مثال: حي السلام، التونسية...)"
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:outline-none focus:border-primary-500"
              />

              <button
                type="submit"
                className="w-full py-3 bg-primary-500 text-white font-extrabold text-sm rounded-xl flex items-center justify-center gap-1 shadow"
              >
                <Plus className="w-4 h-4" />
                <span>ربط المنطقة بالمدينة</span>
              </button>
            </form>
          </div>

        </div>
      )}

      {/* Tab 3: Manage Categories */}
      {activeTab === 'categories' && (
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
          <h3 className="font-extrabold text-lg text-slate-900 border-r-4 border-primary-500 pr-3">إضافة تصنيف خدمة جديد</h3>
          <form onSubmit={handleAddCategory} className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <input
              type="text"
              required
              value={newCategoryName}
              onChange={(e) => setNewCategoryName(e.target.value)}
              placeholder="اسم التصنيف (مثال: تنجيد، طاقة شمسية...)"
              className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:outline-none focus:border-primary-500"
            />
            <input
              type="text"
              value={newCategoryDesc}
              onChange={(e) => setNewCategoryDesc(e.target.value)}
              placeholder="وصف مختصر للتصنيف"
              className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:outline-none focus:border-primary-500"
            />
            <button
              type="submit"
              className="py-3 bg-primary-500 text-white font-extrabold text-sm rounded-xl flex items-center justify-center gap-1 shadow"
            >
              <Plus className="w-4 h-4" />
              <span>إضافة التصنيف</span>
            </button>
          </form>

          <div className="pt-4 grid grid-cols-2 sm:grid-cols-4 gap-3">
            {categories.map((cat) => (
              <div key={cat.id} className="p-3 rounded-2xl bg-slate-50 border border-slate-200 text-xs">
                <span className="font-extrabold text-slate-900 block">{cat.name_ar}</span>
                <span className="text-[10px] text-slate-500">{cat.providers_count || 0} مزود</span>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
}
