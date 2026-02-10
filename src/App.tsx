import { useState, useEffect } from 'react';
import './index.css';
// import CurtainLanding from './components/CurtainLanding'; // Deprecated
import SunStoneLanding from './components/SunStoneLanding';
import OrderMenu from './components/OrderMenu';

import CartOverlay from './components/CartOverlay';
import Footer from './components/Footer';
import BottomNav from './components/BottomNav';

function App() {
  // Force re-render reference
  const [hasEntered, setHasEntered] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);

  // Listen for cart open event from OrderMenu
  useEffect(() => {
    const handleOpenCart = () => setIsCartOpen(true);
    window.addEventListener('openCart', handleOpenCart);
    return () => window.removeEventListener('openCart', handleOpenCart);
  }, []);

  return (
    <div className="app-container">
      {!hasEntered && <SunStoneLanding onEnter={() => setHasEntered(true)} />}

      <div style={{
        opacity: hasEntered ? 1 : 0,
        transition: 'opacity 1.5s ease', // Slower fade in for dramatic effect
        minHeight: '100vh',
        filter: hasEntered ? 'none' : 'blur(10px)', // Blur effect transitioning out
        transform: hasEntered ? 'scale(1)' : 'scale(0.95)',
      }}>
        {/* Main ordering interface replaces old menu */}
        <OrderMenu />
        <Footer />

      </div>

      {/* Cart Overlay */}
      <CartOverlay isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />

      {/* Bottom Nav - Outside transform container for fixed positioning */}
      {hasEntered && !isCartOpen && (
        <div className="show-on-mobile">
          <BottomNav />
        </div>
      )}
    </div>
  );
}

export default App;
