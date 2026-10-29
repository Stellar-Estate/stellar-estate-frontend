import React, { useState, useEffect } from 'react';
import { WalletProvider } from './context/WalletContext.tsx';
import { CurrencyProvider } from './context/CurrencyContext.tsx';
import { Navbar } from './components/Navbar.tsx';
import { Footer } from './components/Footer.tsx';
import { HomePage } from './pages/HomePage.tsx';
import { PropertiesPage } from './pages/PropertiesPage.tsx';
import { PropertyDetailPage } from './pages/PropertyDetailPage.tsx';
import { DashboardPage } from './pages/DashboardPage.tsx';
import { AuditPage } from './pages/AuditPage.tsx';
import { AgreementsPage } from './pages/AgreementsPage.tsx';
import { SettlementsPage } from './pages/SettlementsPage.tsx';
import { Property } from './types/index.ts';
import { apiService } from './services/apiService.ts';
import { DemoModeBanner } from './components/DemoModeBanner.tsx';
import { WifiOff } from 'lucide-react';

export const AppContent: React.FC = () => {
  const [currentTab, setCurrentTab] = useState<string>('home');
  const [properties, setProperties] = useState<Property[]>([]);
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [isOffline, setIsOffline] = useState<boolean>(() => typeof navigator !== 'undefined' && !navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  useEffect(() => {
    const fetchProps = async () => {
      const data = await apiService.getProperties();
      setProperties(data);
      if (data.length > 0 && !selectedProperty) {
        setSelectedProperty(data[0]);
      }
    };
    fetchProps();
  }, []);

  const handleSelectProperty = (prop: Property) => {
    setSelectedProperty(prop);
    setCurrentTab('detail');
  };

  return (
    <div className="app-container">
      <Navbar currentTab={currentTab} setCurrentTab={setCurrentTab} />

      <DemoModeBanner onNavigateTab={(tab) => setCurrentTab(tab)} currentTab={currentTab} />

      {isOffline && (
        <div
          style={{
            background: 'linear-gradient(90deg, #dc2626, #b91c1c)',
            color: '#fff',
            padding: '0.6rem 1rem',
            textAlign: 'center',
            fontSize: '0.85rem',
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.5rem',
            boxShadow: '0 2px 10px rgba(0, 0, 0, 0.4)',
            position: 'sticky',
            top: 0,
            zIndex: 9999,
          }}
        >
          <WifiOff size={16} />
          <span>Internet connection lost. Transactions and live Horizon sync are paused. Auto-reconnecting...</span>
        </div>
      )}

      <main className="main-content">
        {currentTab === 'home' && (
          <HomePage
            properties={properties}
            onSelectProperty={handleSelectProperty}
            onExploreProperties={() => setCurrentTab('properties')}
          />
        )}

        {currentTab === 'properties' && (
          <PropertiesPage
            properties={properties}
            onSelectProperty={handleSelectProperty}
          />
        )}

        {currentTab === 'detail' && selectedProperty && (
          <PropertyDetailPage
            property={selectedProperty}
            onBack={() => setCurrentTab('properties')}
            onNavigateToAgreements={() => setCurrentTab('agreements')}
          />
        )}

        {currentTab === 'dashboard' && (
          <DashboardPage
            properties={properties}
            onSelectProperty={handleSelectProperty}
          />
        )}

        {currentTab === 'agreements' && (
          <AgreementsPage
            properties={properties}
            selectedProperty={selectedProperty}
          />
        )}

        {currentTab === 'settlements' && (
          <SettlementsPage
            properties={properties}
            selectedProperty={selectedProperty}
          />
        )}

        {currentTab === 'audit' && (
          <AuditPage properties={properties} />
        )}
      </main>

      <Footer />
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <WalletProvider>
      <CurrencyProvider>
        <AppContent />
      </CurrencyProvider>
    </WalletProvider>
  );
};

export default App;
