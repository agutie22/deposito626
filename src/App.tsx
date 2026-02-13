import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useCartStore } from './store/useCartStore';
import './index.css';

// Admin Imports
import { AdminProvider, useAdmin } from './context/AdminContext';
import AdminLogin from './pages/admin/AdminLogin';
import AdminDashboard from './pages/admin/AdminDashboard';
import StoreManager from './pages/admin/StoreManager';
import ProductManager from './pages/admin/ProductManager';
import OrderManager from './pages/admin/OrderManager';

// Public Imports
import SunStoneLanding from './components/SunStoneLanding';
import OrderMenu from './components/OrderMenu';
import CartOverlay from './components/CartOverlay';
import Footer from './components/Footer';
import BottomNav from './components/BottomNav';

import { AccessGate } from './components/AccessGate';

// Protected Route Wrapper
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAdmin, isLoading } = useAdmin();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[var(--bg-dark)] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[var(--accent-gold)]"></div>
      </div>
    );
  }

  return isAdmin ? <>{children}</> : <Navigate to="/admin/login" replace />;
};

// Existing Storefront Logic wrapped in a component
const Storefront = () => {
  const [hasEntered, setHasEntered] = useState(false);
  const { service } = useAdmin();
  const { user, setIsCartOpen } = useCartStore();
  const [storeStatus, setStoreStatus] = useState({ isOpen: true, closingMessage: '' });

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const status = await service.getStoreStatus();
        setStoreStatus(status);
      } catch (error) {
        console.error("Failed to fetch store status", error);
      }
    };
    fetchStatus();
  }, [service]);


  return (
    <div className="app-container">
      {!hasEntered && (
        <SunStoneLanding
          onEnter={() => setHasEntered(true)}
          isOpen={storeStatus.isOpen}
          closingMessage={storeStatus.closingMessage}
        />
      )}
      <div style={{
        opacity: hasEntered ? 1 : 0,
        transition: 'opacity 1.5s ease',
        minHeight: '100vh',
        filter: hasEntered ? 'none' : 'blur(10px)',
        transform: hasEntered ? 'scale(1)' : 'scale(0.95)',
      }}>
        <OrderMenu />
        <Footer />
      </div>
      <AccessGate />
      <CartOverlay isOpen={user.isCartOpen} onClose={() => setIsCartOpen(false)} />
      {hasEntered && !user.isCartOpen && (
        <div className="show-on-mobile">
          <BottomNav />
        </div>
      )}
    </div>
  );
};

function App() {
  return (
    <Router>
      <AdminProvider>
        <Routes>
          {/* Public Route */}
          <Route path="/" element={<Storefront />} />

          {/* Admin Routes */}
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin/dashboard" element={
            <ProtectedRoute>
              <AdminDashboard />
            </ProtectedRoute>
          } />
          <Route path="/admin/store" element={
            <ProtectedRoute>
              <StoreManager />
            </ProtectedRoute>
          } />
          <Route path="/admin/products" element={
            <ProtectedRoute>
              <ProductManager />
            </ProtectedRoute>
          } />
          <Route path="/admin/orders" element={
            <ProtectedRoute>
              <OrderManager />
            </ProtectedRoute>
          } />
        </Routes>
      </AdminProvider>
    </Router>
  );
}

export default App;
