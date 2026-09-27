import React from 'react';
import { Home, Grid, Search, Clock, User, Heart } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function BottomNavigation({ currentPage, onNavigate }) {
  const { user } = useAuth();

  const navItems = [
    { id: 'home', label: 'الرئيسية', icon: Home },
    { id: 'categories', label: 'التصنيفات', icon: Grid },
    { id: 'search', label: 'البحث', icon: Search },
    { id: 'requests', label: 'الطلبات', icon: Clock },
    { id: 'account', label: user ? 'حسابي' : 'الدخول', icon: User }
  ];

  const handleNavClick = (id) => {
    if (id === 'account') {
      if (!user) {
        onNavigate('login');
      } else if (user.role_name === 'admin') {
        onNavigate('admin-dashboard');
      } else if (user.role_name === 'provider' || user.role_name === 'company') {
        onNavigate('provider-dashboard');
      } else {
        onNavigate('customer-dashboard');
      }
    } else if (id === 'requests') {
      if (!user) {
        onNavigate('login');
      } else if (user.role_name === 'provider' || user.role_name === 'company') {
        onNavigate('provider-dashboard');
      } else {
        onNavigate('customer-dashboard');
      }
    } else {
      onNavigate(id);
    }
  };

  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200/80 shadow-[0_-4px_20px_rgba(0,0,0,0.05)] px-2 py-1.5">
      <div className="flex items-center justify-around">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentPage === item.id || (item.id === 'account' && (currentPage.includes('dashboard') || currentPage === 'login'));
          return (
            <button
              key={item.id}
              onClick={() => handleNavClick(item.id)}
              className={`flex flex-col items-center justify-center w-full py-1 transition-all ${
                isActive ? 'text-primary-600 font-bold scale-105' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <div className={`p-1 rounded-xl transition-all ${isActive ? 'bg-orange-100 text-primary-600' : ''}`}>
                <Icon className="w-5 h-5" />
              </div>
              <span className="text-[11px] mt-0.5 leading-none">{item.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
