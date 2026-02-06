import React from 'react';

const footerStyles: { [key: string]: React.CSSProperties } = {
    container: {
        background: '#000',
        padding: '3rem 2rem',
        textAlign: 'center',
        borderTop: '1px solid #222',
    },
    text: {
        color: 'var(--text-secondary)',
        marginBottom: '1rem',
    },
    link: {
        color: 'var(--accent-gold)',
        fontSize: '1.2rem',
        textDecoration: 'none',
        borderBottom: '1px solid transparent',
        transition: 'border-color 0.2s',
    },
    copyright: {
        color: '#444',
        fontSize: '0.8rem',
        marginTop: '2rem',
    }
};

const Footer = () => {
    return (
        <footer style={footerStyles.container}>
            <p style={footerStyles.text}>Ready to order? DM us now.</p>
            <a
                href="https://instagram.com/eldeposito626"
                target="_blank"
                rel="noopener noreferrer"
                style={footerStyles.link}
            >
                @eldeposito626
            </a>
            <p style={footerStyles.copyright}>&copy; {new Date().getFullYear()} Deposito626. All rights reserved.</p>
        </footer>
    );
};

export default Footer;
