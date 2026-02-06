import React from 'react';

const menuStyles: { [key: string]: React.CSSProperties } = {
    section: {
        // padding handled by css .menu-section
        background: 'var(--bg-dark)',
    },
    heading: {
        textAlign: 'center',
        color: 'var(--accent-gold)',
        fontSize: '2rem',
        marginBottom: '3rem',
        fontFamily: 'var(--font-heading)',
        letterSpacing: '3px',
        borderBottom: '1px solid var(--accent-agave)',
        paddingBottom: '0.5rem',
        textTransform: 'uppercase',
    },
    sectionTitle: {
        color: 'var(--accent-clay)',
        fontSize: '1.5rem',
        marginTop: '3rem',
        marginBottom: '1.5rem',
        textTransform: 'uppercase',
        letterSpacing: '2px',
        borderLeft: '4px solid var(--accent-gold)',
        paddingLeft: '1rem',
    },
    grid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
        gap: '0.75rem',
        maxWidth: '1200px',
        margin: '0 auto',
    },
    card: {
        background: 'transparent',
        borderRadius: '0',
        padding: '0',
        border: 'none',
        boxShadow: 'none',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        textAlign: 'center',
        position: 'relative',
        overflow: 'hidden',
    },
    image: {
        width: '100%',
        height: 'auto',
        aspectRatio: '1 / 1',
        objectFit: 'cover',
        borderRadius: '0',
        marginBottom: '0.75rem',
        // filter: 'sepia(0.2) contrast(1.1)', // Removed for cleaner look
        background: '#222',
    },
    itemName: {
        fontSize: '1.1rem',
        color: 'var(--text-primary)',
        marginBottom: '0.5rem',
        fontFamily: 'var(--font-heading)',
        letterSpacing: '1px',
    },
    itemDesc: {
        color: 'var(--text-secondary)',
        marginBottom: '0.5rem',
        fontSize: '0.8rem',
        fontStyle: 'italic',
    },
    price: {
        color: 'var(--accent-gold)',
        fontSize: '1rem',
        fontWeight: 'bold',
        marginBottom: '1rem',
        border: '1px solid var(--accent-agave)',
        padding: '0.2rem 0.8rem',
        borderRadius: '2px',
    },
    button: {
        background: 'transparent',
        color: 'var(--accent-clay)',
        border: '1px solid var(--accent-clay)',
        padding: '0.75rem 1.5rem',
        width: '100%',
        fontWeight: 'bold',
        textTransform: 'uppercase',
        letterSpacing: '2px',
        transition: 'all 0.3s ease',
        cursor: 'pointer',
    }
};

const COCKTAILS = [
    {
        id: 1,
        name: "Mezcal Michelada",
        desc: "Smoky artisanal mezcal, house-made chamoy blend, sal de gusano rim. A refined classic.",
        price: "$14",
        image: "https://placehold.co/600x400/141313/9d442b?text=Mezcal+Michi"
    },
    {
        id: 2,
        name: "Clarificado",
        desc: "Crystal clear milk-washed tequila punch with citrus notes. Elegant and smooth.",
        price: "$16",
        image: "https://placehold.co/600x400/141313/c5a059?text=Clarificado"
    },
    {
        id: 3,
        name: "Oaxaca Old Fashioned",
        desc: "Aged Reposado, agave nectar, mole bitters. A complex slow sipper.",
        price: "$15",
        image: "https://placehold.co/600x400/141313/1f3a3d?text=Old+Fashioned"
    }
];

const BEERS = [
    {
        id: 4,
        name: "Modelo Negra",
        desc: "A rich, full-flavored Munich Dunkel style lager with balanced malt notes.",
        price: "$6",
        image: "https://placehold.co/600x400/141313/c5a059?text=Negra+Modelo"
    },
    {
        id: 5,
        name: "Victoria",
        desc: "Classic Vienna-style lager. A heritage selection with amber hues and toasted malt.",
        price: "$6",
        image: "https://placehold.co/600x400/141313/9d442b?text=Victoria"
    },
    {
        id: 6,
        name: "Pacifico Clara",
        desc: "Crisp, refreshing pilsner. A pristine coastal selection.",
        price: "$6",
        image: "https://placehold.co/600x400/141313/e0d8c3?text=Pacifico"
    }
];

const Menu = () => {
    return (
        <section className="menu-section" id="menu">
            <div style={{ textAlign: 'center' }}>
                <h2 style={menuStyles.heading}>Curated Selection</h2>
            </div>

            <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
                <h3 style={menuStyles.sectionTitle}>Signature Cocktails</h3>
                <div style={menuStyles.grid}>
                    {COCKTAILS.map((item) => (
                        <MenuItem key={item.id} item={item} />
                    ))}
                </div>

                <h3 style={menuStyles.sectionTitle}>Cervezas</h3>
                <div style={menuStyles.grid}>
                    {BEERS.map((item) => (
                        <MenuItem key={item.id} item={item} />
                    ))}
                </div>
            </div>
        </section>
    );
};

const MenuItem = ({ item }: { item: any }) => (
    <div
        style={menuStyles.card}
        onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = 'var(--accent-gold)';
            e.currentTarget.style.transform = 'translateY(-2px)';
        }}
        onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = 'var(--accent-charcoal)';
            e.currentTarget.style.transform = 'translateY(0)';
        }}
    >
        <img src={item.image} alt={item.name} style={menuStyles.image} />
        <h3 style={menuStyles.itemName}>{item.name}</h3>
        <p style={menuStyles.itemDesc}>{item.desc}</p>
        <div style={menuStyles.price}>{item.price}</div>
        <button
            style={menuStyles.button}
            onClick={() => window.open('https://instagram.com/eldeposito626', '_blank')}
            onMouseEnter={(e) => {
                e.currentTarget.style.background = 'var(--accent-clay)';
                e.currentTarget.style.color = 'var(--bg-dark)';
            }}
            onMouseLeave={(e) => {
                e.currentTarget.style.background = 'transparent';
                e.currentTarget.style.color = 'var(--accent-clay)';
            }}
        >
            Request Service
        </button>
    </div>
);

export default Menu;
