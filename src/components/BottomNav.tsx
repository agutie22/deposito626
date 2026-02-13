import { Home, Wine, Instagram } from 'lucide-react';
import './BottomNav.css';

const BottomNav = () => {
    return (
        <nav className="bottom-nav">
            <button
                className="bottom-nav-item"
                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            >
                <Home size={24} />
                <span>Home</span>
            </button>
            <button
                className="bottom-nav-item"
                onClick={() => document.getElementById('menu')?.scrollIntoView({ behavior: 'smooth' })}
            >
                <Wine size={24} />
                <span>Selection</span>
            </button>
            <button
                className="bottom-nav-item"
                onClick={() => window.open('https://instagram.com/eldeposito626', '_blank')}
            >
                <Instagram size={24} />
                <span>Contact</span>
            </button>
        </nav>
    );
};

export default BottomNav;
