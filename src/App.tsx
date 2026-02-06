import { useState } from 'react';
import './index.css';
import CurtainLanding from './components/CurtainLanding';
import Menu from './components/Menu';
import Footer from './components/Footer';
import BottomNav from './components/BottomNav';

function App() {
  const [hasEntered, setHasEntered] = useState(false);

  return (
    <div className="app-container">
      {!hasEntered && <CurtainLanding onEnter={() => setHasEntered(true)} />}

      <div style={{
        opacity: hasEntered ? 1 : 0,
        transition: 'opacity 1s ease 0.5s',
        minHeight: '100vh'
      }}>
        {/* Simple Header for inside view */}
        <header style={{ padding: '3rem 1rem', textAlign: 'center' }}>
          <h1 style={{ color: 'var(--accent-gold)', fontSize: '2rem' }}>DEPOSITO 626</h1>
          <p style={{ color: 'var(--accent-clay)', letterSpacing: '2px', fontFamily: 'var(--font-heading)' }}>PRIVATE SERVICE MENU</p>
        </header>

        <Menu />
        <Footer />
        <div className="show-on-mobile">
          <BottomNav />
        </div>
      </div>
    </div>
  );
}

export default App;
