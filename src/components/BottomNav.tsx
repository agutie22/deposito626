import { Home, Wine, Instagram } from 'lucide-react';

const navStyles: { [key: string]: React.CSSProperties } = {
    container: {
        position: 'fixed',
        bottom: 0,
        left: 0,
        width: '100%',
        background: 'rgba(15, 14, 14, 0.9)',
        backdropFilter: 'blur(10px)',
        borderTop: '1px solid var(--accent-charcoal)',
        display: 'flex',
        justifyContent: 'space-around',
        alignItems: 'center',
        padding: '1rem',
        zIndex: 1000,
        boxShadow: '0 -4px 20px rgba(0,0,0,0.4)',
    },
    item: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        background: 'none',
        border: 'none',
        color: 'var(--text-secondary)',
        fontSize: '0.7rem',
        gap: '0.3rem',
        cursor: 'pointer',
        textTransform: 'uppercase',
        letterSpacing: '1px',
        transition: 'color 0.3s',
    },
    active: {
        color: 'var(--accent-gold)',
    }
};

const BottomNav = () => {
    return (
        <nav style={navStyles.container}>
            <button
                style={navStyles.item}
                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            >
                <Home size={24} />
                <span>Home</span>
            </button>
            <button
                style={navStyles.item}
                onClick={() => document.getElementById('menu')?.scrollIntoView({ behavior: 'smooth' })}
            >
                <Wine size={24} />
                <span>Selection</span>
            </button>
            <button
                style={navStyles.item}
                onClick={() => window.open('https://instagram.com/eldeposito626', '_blank')}
            >
                <Instagram size={24} />
                <span>Contact</span>
            </button>
        </nav>
    );
};

export default BottomNav;
