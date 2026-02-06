import React, { useState } from 'react';

const landingStyles: { [key: string]: React.CSSProperties } = {
    container: {
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100vh',
        zIndex: 100,
        display: 'flex',
        pointerEvents: 'none', // Allow click through when open, handled via state
    },
    curtainPart: {
        width: '50%',
        height: '100%',
        background: 'linear-gradient(135deg, #1a1a1a 0%, #0f0e0e 100%)',
        position: 'relative',
        transition: 'transform 1.5s cubic-bezier(0.77, 0, 0.175, 1)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        boxShadow: 'inset 0 0 100px rgba(0,0,0,0.8)',
        borderRight: '2px solid var(--accent-agave)', // Left curtain border
    },
    curtainRight: {
        width: '50%',
        height: '100%',
        background: 'linear-gradient(225deg, #1a1a1a 0%, #0f0e0e 100%)',
        position: 'relative',
        transition: 'transform 1.5s cubic-bezier(0.77, 0, 0.175, 1)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        boxShadow: 'inset 0 0 100px rgba(0,0,0,0.8)',
        borderLeft: '2px solid var(--accent-agave)', // Right curtain border
    },
    content: {
        position: 'absolute',
        zIndex: 101,
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        textAlign: 'center',
        color: 'var(--accent-gold)',
        cursor: 'pointer',
        pointerEvents: 'auto',
        transition: 'opacity 0.5s ease',
    },
    logo: {
        fontSize: 'clamp(2rem, 5vw, 4rem)',
        fontFamily: 'var(--font-fancy)',
        marginBottom: '1rem',
        textShadow: '0 0 10px rgba(0,0,0,0.5)',
    },
    tapText: {
        fontSize: '1rem',
        fontFamily: 'var(--font-heading)',
        letterSpacing: '4px',
        color: 'var(--text-secondary)',
        textTransform: 'uppercase',
        animation: 'pulse 2s infinite',
    }
};

const CurtainLanding = ({ onEnter }: { onEnter: () => void }) => {
    const [isOpen, setIsOpen] = useState(false);

    const handleEnter = () => {
        setIsOpen(true);
        setTimeout(onEnter, 1500); // Callback after animation
    };

    return (
        <div style={landingStyles.container}>
            {/* Left Curtain */}
            <div
                style={{
                    ...landingStyles.curtainPart,
                    transform: isOpen ? 'translateX(-100%)' : 'translateX(0)',
                    borderRight: isOpen ? 'none' : '2px solid var(--accent-agave)',
                }}
            />

            {/* Right Curtain */}
            <div
                style={{
                    ...landingStyles.curtainRight,
                    transform: isOpen ? 'translateX(100%)' : 'translateX(0)',
                    borderLeft: isOpen ? 'none' : '2px solid var(--accent-agave)',
                }}
            />

            {/* Center Trigger */}
            <div
                style={{
                    ...landingStyles.content,
                    opacity: isOpen ? 0 : 1,
                    pointerEvents: isOpen ? 'none' : 'auto',
                }}
                onClick={handleEnter}
            >
                <h1 style={landingStyles.logo}>DEPOSITO 626</h1>
                <p style={landingStyles.tapText}>Tap to Enter</p>
            </div>

            <style>{`
        @keyframes pulse {
          0% { opacity: 0.6; }
          50% { opacity: 1; }
          100% { opacity: 0.6; }
        }
      `}</style>
        </div>
    );
};

export default CurtainLanding;
