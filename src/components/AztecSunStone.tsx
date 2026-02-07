import React from 'react';

interface AztecSunStoneProps extends React.SVGProps<SVGSVGElement> { }

const AztecSunStone: React.FC<AztecSunStoneProps> = (props) => {
    return (
        <svg
            viewBox="0 0 500 500"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            {...props}
        >
            <defs>
                <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                    <feGaussianBlur stdDeviation="5" result="blur" />
                    <feComposite in="SourceGraphic" in2="blur" operator="over" />
                </filter>
                <clipPath id="center-clip">
                    <circle cx="250" cy="250" r="125" />
                </clipPath>
                <mask id="logo-mask">
                    <image
                        href="/logo.png"
                        x="175"
                        y="175"
                        width="150"
                        height="150"
                    />
                </mask>
            </defs>

            {/* Base Circle */}
            <circle cx="250" cy="250" r="240" fill="#1a1a1a" stroke="currentColor" strokeWidth="2" />

            {/* Outer Ring - Xiuhcoatl / Rays */}
            <g stroke="currentColor" strokeWidth="2" fill="none">
                {Array.from({ length: 8 }).map((_, i) => (
                    <path
                        key={`ray-${i}`}
                        d="M250 10 L270 40 L250 60 L230 40 Z"
                        transform={`rotate(${i * 45} 250 250)`}
                        fill="#2a2a2a"
                    />
                ))}
                {/* Secondary Rays */}
                {Array.from({ length: 40 }).map((_, i) => (
                    <path
                        key={`subray-${i}`}
                        d="M250 20 L255 35 L245 35 Z"
                        transform={`rotate(${i * 9} 250 250)`}
                    />
                ))}
            </g>

            {/* Ring 2 - Calendar Glyphs Ring */}
            <circle cx="250" cy="250" r="180" stroke="currentColor" strokeWidth="2" />
            <g stroke="currentColor" strokeWidth="1.5">
                {Array.from({ length: 20 }).map((_, i) => (
                    <rect
                        key={`glyph-${i}`}
                        x="240"
                        y="80"
                        width="20"
                        height="20"
                        rx="2"
                        transform={`rotate(${i * 18} 250 250)`}
                    />
                ))}
            </g>

            {/* Ring 3 - Inner Circle */}
            <circle cx="250" cy="250" r="130" stroke="currentColor" strokeWidth="4" />

            {/* Inner Decoration Ring - Filling empty space */}
            <g stroke="currentColor" strokeWidth="1.5" fill="none">
                {Array.from({ length: 24 }).map((_, i) => (
                    <path
                        key={`inner-tri-${i}`}
                        d="M250 160 L245 150 L255 150 Z" /* Triangle pointing inward/outward at r=100ish equivalent */
                        transform={`rotate(${i * 15} 250 250)`}
                    />
                ))}
            </g>

            {/* Center - Logo (Masked to match currentColor) */}
            <rect
                x="175"
                y="175"
                width="150"
                height="150"
                fill="currentColor"
                mask="url(#logo-mask)"
                clipPath="url(#center-clip)"
            />

            {/* Decorative Dots in corners */}
            <circle cx="170" cy="170" r="5" fill="currentColor" />
            <circle cx="330" cy="170" r="5" fill="currentColor" />
            <circle cx="170" cy="330" r="5" fill="currentColor" />
            <circle cx="330" cy="330" r="5" fill="currentColor" />

        </svg>
    );
};

export default AztecSunStone;
