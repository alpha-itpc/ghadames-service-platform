import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import BottomNavigation from './components/BottomNavigation';
import Footer from './components/Footer';
import PWAInstallBanner from './components/PWAInstallBanner';
import CitySelectorModal from './components/CitySelectorModal';
import ServiceRequestModal from './components/ServiceRequestModal';

// Pages
import HomePage from './pages/HomePage';
import SearchPage from './pages/SearchPage';
import CategoriesPage from './pages/CategoriesPage';
import ProviderDetailsPage from './pages/ProviderDetailsPage';
import AddBusinessPage from './pages/AddBusinessPage';
import CustomerDashboard from './pages/CustomerDashboard';
import ProviderDashboard from './pages/ProviderDashboard';
import AdminDashboard from './pages/AdminDashboard';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';

export default function App() {
  const [currentPage, setCurrentPage] = useState('home');
  const [searchParams, setSearchParams] = useState({});
  const [selectedProvider, setSelectedProvider] = useState(null);
  const [requestProviderTarget, setRequestProviderTarget] = useState(null);

  // Modals
  const [showCityModal, setShowCityModal] = useState(false);
  const [showRequestModal, setShowRequestModal] = useState(false);

  // Global Data
  const [cities, setCities] = useState([]);
  const [categories, setCategories] = useState([]);

  const loadCities = () => {
    fetch('/api/cities')
      .then((res) => res.json())
      .then((data) => setCities(data || []))
      .catch((err) => console.error(err));
  };

  const loadCategories = () => {
    fetch('/api/categories')
      .then((res) => res.json())
      .then((data) => setCategories(data || []))
      .catch((err) => console.error(err));
  };

  useEffect(() => {
    loadCities();
    loadCategories();
  }, []);

  const handleNavigate = (page, params = {}) => {
    setCurrentPage(page);
    if (page === 'search') {
      setSearchParams(params);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectProvider = (item) => {
    setSelectedProvider(item);
    setCurrentPage('provider-details');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOpenRequestModal = (providerItem) => {
    setRequestProviderTarget(providerItem);
    setShowRequestModal(true);
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 font-tajawal antialiased">
      
      {/* PWA Install Banner */}
      <PWAInstallBanner />

      {/* Main Header */}
      <Header
        currentPage={currentPage}
        onNavigate={handleNavigate}
        onOpenCityModal={() => setShowCityModal(true)}
      />

      {/* Main Page Container */}
      <main className="flex-1">
        {currentPage === 'home' && (
          <HomePage
            onNavigate={handleNavigate}
            onSelectProvider={handleSelectProvider}
            onRequestClick={handleOpenRequestModal}
            categories={categories}
            cities={cities}
            onOpenCityModal={() => setShowCityModal(true)}
          />
        )}

        {currentPage === 'search' && (
          <SearchPage
            initialParams={searchParams}
            onSelectProvider={handleSelectProvider}
            onRequestClick={handleOpenRequestModal}
            cities={cities}
            categories={categories}
          />
        )}

        {currentPage === 'categories' && (
          <CategoriesPage
            categories={categories}
            onNavigate={handleNavigate}
          />
        )}

        {currentPage === 'provider-details' && selectedProvider && (
          <ProviderDetailsPage
            type={selectedProvider.type}
            id={selectedProvider.id}
            onBack={() => handleNavigate('search')}
            onRequestClick={handleOpenRequestModal}
          />
        )}

        {currentPage === 'add-business' && (
          <AddBusinessPage
            cities={cities}
            categories={categories}
            onNavigate={handleNavigate}
          />
        )}

        {currentPage === 'customer-dashboard' && (
          <CustomerDashboard
            onNavigate={handleNavigate}
            onSelectProvider={handleSelectProvider}
            onRequestClick={handleOpenRequestModal}
          />
        )}

        {currentPage === 'favorites' && (
          <CustomerDashboard
            onNavigate={handleNavigate}
            onSelectProvider={handleSelectProvider}
            onRequestClick={handleOpenRequestModal}
          />
        )}

        {currentPage === 'provider-dashboard' && (
          <ProviderDashboard onNavigate={handleNavigate} />
        )}

        {currentPage === 'admin-dashboard' && (
          <AdminDashboard
            onNavigate={handleNavigate}
            cities={cities}
            categories={categories}
            onRefreshCities={loadCities}
            onRefreshCategories={loadCategories}
          />
        )}

        {currentPage === 'login' && (
          <LoginPage onNavigate={handleNavigate} />
        )}

        {currentPage === 'register' && (
          <RegisterPage onNavigate={handleNavigate} />
        )}
      </main>

      {/* Main Footer */}
      <Footer onNavigate={handleNavigate} />

      {/* Mobile Bottom Navigation Bar */}
      <BottomNavigation
        currentPage={currentPage}
        onNavigate={handleNavigate}
      />

      {/* City Selector Modal */}
      <CitySelectorModal
        isOpen={showCityModal}
        onClose={() => setShowCityModal(false)}
        cities={cities}
      />

      {/* Service Request Modal */}
      <ServiceRequestModal
        isOpen={showRequestModal}
        onClose={() => setShowRequestModal(false)}
        provider={requestProviderTarget}
      />

    </div>
  );
}
