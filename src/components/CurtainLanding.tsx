import React, { useState } from 'react';
import aztecSunStone from '../assets/aztec-sun-stone.png';

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
        overflow: 'hidden', // Add hidden overflow to contain the sun stone
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
        overflow: 'hidden', // Add hidden overflow
    },
    content: {
        position: 'absolute',
        zIndex: 101,
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        textAlign: 'center',
        color: 'var(--accent-gold)',
        cursor: 'default', // Changed to default as interaction is now on the stone
        pointerEvents: 'auto',
        transition: 'opacity 0.5s ease',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
        height: '100%',
    },
    logo: {
        fontSize: 'clamp(2rem, 5vw, 4rem)',
        fontFamily: 'var(--font-fancy)',
        marginBottom: '1rem',
        textShadow: '0 0 20px rgba(0,0,0,0.8)', // Stronger shadow for readability
        position: 'relative',
        zIndex: 2,
        pointerEvents: 'none', // Pass clicks through to the stone container if needed, or keep text selectable
    },
    tapText: {
        fontSize: '1rem',
        fontFamily: 'var(--font-heading)',
        letterSpacing: '4px',
        color: 'var(--text-secondary)',
        textTransform: 'uppercase',
        animation: 'pulse 2s infinite',
        position: 'relative',
        zIndex: 2,
        textShadow: '0 0 10px rgba(0,0,0,0.8)',
        pointerEvents: 'none',
    },
    sunStoneContainer: {
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        zIndex: 1,
        width: 'clamp(300px, 80vw, 800px)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        cursor: 'pointer', // Interaction is here
        transition: 'transform 0.5s ease',
    },
    sunStoneImage: {
        width: '100%',
        height: 'auto',
        opacity: 0.25, // Slightly more visible for interaction
        transition: 'filter 0.5s ease, opacity 0.5s ease',
    }
};

const CurtainLanding = ({ onEnter }: { onEnter: () => void }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [isUnlocking, setIsUnlocking] = useState(false);

    const handleUnlock = () => {
        if (isUnlocking || isOpen) return;

        setIsUnlocking(true);

        // Wait for unlock animation
        setTimeout(() => {
            setIsOpen(true);
            setTimeout(onEnter, 1500); // Callback after curtain animation
        }, 1500);
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

            {/* Center Content */}
            <div
                style={{
                    ...landingStyles.content,
                    opacity: isOpen ? 0 : 1,
                    pointerEvents: isOpen ? 'none' : 'auto',
                }}
            >
                {/* Sun Stone Background / Trigger */}
                <div
                    style={{
                        ...landingStyles.sunStoneContainer,
                        transform: isUnlocking
                            ? 'translate(-50%, -50%) scale(1.1)'
                            : 'translate(-50%, -50%) scale(1)',
                    }}
                    onClick={handleUnlock}
                >
                    <img
                        src={aztecSunStone}
                        alt="Aztec Sun Stone"
                        style={{
                            ...landingStyles.sunStoneImage,
                            animation: isUnlocking
                                ? 'spin 2s linear infinite' // Fast spin for unlocking
                                : 'spin 60s linear infinite', // Slow spin for idle
                            opacity: isUnlocking ? 0.8 : 0.25, // Glow up when unlocking
                            filter: isUnlocking ? 'drop-shadow(0 0 20px var(--accent-gold))' : 'none',
                        }}
                    />
                </div>

                <h1 style={landingStyles.logo}>DEPOSITO 626</h1>
                <p style={landingStyles.tapText}>
                    {isUnlocking ? 'Unlocking...' : 'Tap Stone to Unlock'}
                </p>
            </div>

            <style>{`
        @keyframes pulse {
          0% { opacity: 0.6; }
          50% { opacity: 1; }
          100% { opacity: 0.6; }
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
        </div>
    );
};

export default CurtainLanding;
