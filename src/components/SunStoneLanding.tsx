import React, { useState } from 'react';
import AztecSunStone from './AztecSunStone';

const styles: { [key: string]: React.CSSProperties } = {
    container: {
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        zIndex: 200, // Higher than everything
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#050505', // Deep black/obsidian
        backgroundImage: 'radial-gradient(circle at center, #1a1a1a 0%, #050505 70%)',
        overflow: 'hidden',
        transition: 'opacity 1s ease',
    },
    title: {
        fontSize: 'clamp(2rem, 5vw, 4rem)',
        fontFamily: 'var(--font-fancy)',
        color: 'var(--accent-gold)',
        marginBottom: '2rem',
        textShadow: '0 0 20px rgba(197, 160, 89, 0.3)',
        zIndex: 2,
        pointerEvents: 'none',
        transition: 'opacity 0.5s ease, transform 0.5s ease',
    },
    stoneContainer: {
        position: 'relative',
        width: 'clamp(280px, 60vw, 600px)',
        height: 'clamp(280px, 60vw, 600px)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        cursor: 'pointer',
        zIndex: 1,
        transition: 'transform 1.5s cubic-bezier(0.7, 0, 0.3, 1)',
        color: 'var(--accent-gold)', // Set primary color for SVG
    },
    stone: {
        width: '100%',
        height: '100%',
        transition: 'filter 0.3s ease',
        filter: 'drop-shadow(0 0 10px rgba(0,0,0,0.8))',
    },
    instruction: {
        marginTop: '3rem',
        fontSize: '1rem',
        fontFamily: 'var(--font-heading)',
        letterSpacing: '4px',
        color: 'var(--text-secondary)',
        textTransform: 'uppercase',
        opacity: 0.7,
        animation: 'pulse 3s infinite ease-in-out',
        zIndex: 2,
        pointerEvents: 'none',
        transition: 'opacity 0.5s ease',
    }
};

interface SunStoneLandingProps {
    onEnter: () => void;
    isOpen: boolean;
    closingMessage?: string;
}

const SunStoneLanding: React.FC<SunStoneLandingProps> = ({ onEnter, isOpen, closingMessage }) => {
    const [isUnlocking, setIsUnlocking] = useState(false);
    const [isUnlocked, setIsUnlocked] = useState(false);

    const handleUnlock = () => {
        if (isUnlocking || isUnlocked || !isOpen) return;

        setIsUnlocking(true);

        // Sequence: 
        // 1. Spool up / High speed spin (handled by CSS class)
        // 2. Expand/Open (handled by state change after delay)

        setTimeout(() => {
            setIsUnlocked(true);
            // Wait for the expansion/fade animation to finish before removing the component conceptually
            setTimeout(onEnter, 1000);
        }, 1500); // 1.5s spin up time
    };

    if (isUnlocked && styles.container) {
        // just to ensure typing is happy
    }

    return (
        <div
            style={{
                ...styles.container,
                opacity: isUnlocked ? 0 : 1,
                pointerEvents: isUnlocked ? 'none' : 'auto',
            }}
        >
            <h1
                style={{
                    ...styles.title,
                    opacity: isUnlocking ? 0 : 1,
                    transform: isUnlocking ? 'translateY(-20px)' : 'translateY(0)',
                }}
            >
                DEPOSITO 626
            </h1>

            <div
                style={{
                    ...styles.stoneContainer,
                    transform: isUnlocking
                        ? 'scale(1.1)' // Pulse/Zoom slightly on interact
                        : 'scale(1)',
                    cursor: isOpen ? 'pointer' : 'not-allowed',
                    opacity: isOpen ? 1 : 0.5,
                }}
                onClick={handleUnlock}
            >
                <AztecSunStone
                    className={isUnlocking ? 'stone-unlocking' : 'stone-idle'}
                    style={{
                        ...styles.stone,
                        filter: isUnlocking
                            ? 'drop-shadow(0 0 30px var(--accent-gold)) brightness(1.2)'
                            : 'drop-shadow(0 0 15px rgba(0,0,0,0.9))',
                    }}
                />
            </div>

            <p
                style={{
                    ...styles.instruction,
                    opacity: isUnlocking ? 0 : 0.7,
                }}
            >

                {isUnlocking
                    ? 'Accessing...'
                    : (!isOpen ? (closingMessage || 'Store Closed') : 'Tap Stone to Unlock')
                }
            </p>

            <style>{`
                @keyframes spin-slow {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
                @keyframes spin-fast {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(1080deg); } /* 3 spins in 1.5s */
                }
                @keyframes pulse {
                    0%, 100% { opacity: 0.4; }
                    50% { opacity: 0.8; }
                }
                
                .stone-idle {
                    animation: spin-slow 120s linear infinite;
                }
                
                .stone-unlocking {
                    animation: spin-fast 1.5s cubic-bezier(0.5, 0, 1, 1) forwards;
                }
            `}</style>
        </div>
    );
};

export default SunStoneLanding;
