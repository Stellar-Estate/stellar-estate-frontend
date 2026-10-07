import React, { useState, useEffect } from 'react';
import { WalletProvider } from './context/WalletContext.tsx';
import { Navbar } from './components/Navbar.tsx';
import { Footer } from './components/Footer.tsx';
import { HomePage } from './pages/HomePage.tsx';
import { PropertiesPage } from './pages/PropertiesPage.tsx';
import { PropertyDetailPage } from './pages/PropertyDetailPage.tsx';
import { DashboardPage } from './pages/DashboardPage.tsx';
import { AuditPage } from './pages/AuditPage.tsx';
import { Property } from './types/index.ts';
import { apiService } from './services/apiService.ts';

export const AppContent: React.FC = () => {
  const [currentTab, setCurrentTab] = useState<string>('home');
  const [properties, setProperties] = useState<Property[]>([]);
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);

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
          />
        )}

        {currentTab === 'dashboard' && (
          <DashboardPage
            properties={properties}
            onSelectProperty={handleSelectProperty}
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
      <AppContent />
    </WalletProvider>
  );
};

export default App;
