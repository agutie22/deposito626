import React from 'react';
import { useCartStore } from '../store/useCartStore';
import { ShoppingCart, Plus } from 'lucide-react';
import './OrderMenu.css';

interface Product {
    id: number;
    name: string;
    description: string;
    price: number;
    imageUrl: string;
    stockStatus: 'in_stock' | 'limited' | 'out_of_stock';
    category: string;
}

// Static menu data (will be replaced with API fetch later)
const MENU_DATA: { category: string; items: Product[] }[] = [
    {
        category: 'Ready to Drink',
        items: [
            { id: 1, name: 'BeatBox', description: 'Party punch in a box. Fruity, fun, and ready to fiesta.', price: 8, imageUrl: '/images/beatbox.png', stockStatus: 'in_stock', category: 'rtd' },
            { id: 2, name: 'Buzzballz', description: 'Premixed cocktail in a ball. Portable party power.', price: 6, imageUrl: '/images/buzzball.png', stockStatus: 'in_stock', category: 'rtd' },
            { id: 3, name: 'White Claw', description: 'Light and refreshing hard seltzer. Low carb, big flavor.', price: 5, imageUrl: '/images/whiteclaw.png', stockStatus: 'in_stock', category: 'rtd' },
        ],
    },
    {
        category: 'Cervezas',
        items: [
            { id: 4, name: 'Modelo Negra', description: 'A rich, full-flavored Munich Dunkel style lager.', price: 6, imageUrl: '/images/modelo-negra.png', stockStatus: 'in_stock', category: 'beer' },
            { id: 5, name: 'Victoria', description: 'Classic Vienna-style lager with amber hues.', price: 6, imageUrl: '/images/victoria.png', stockStatus: 'in_stock', category: 'beer' },
            { id: 6, name: 'Pacifico Clara', description: 'Crisp, refreshing pilsner.', price: 6, imageUrl: '/images/pacifico-clara.png', stockStatus: 'out_of_stock', category: 'beer' },
        ],
    },
];

const OrderMenu: React.FC = () => {
    const { addItem, items, getItemCount, getSubtotal } = useCartStore();
    const itemCount = getItemCount();
    const subtotal = getSubtotal();

    const getQuantityInCart = (productId: number) => {
        const item = items.find((i) => i.id === productId);
        return item?.quantity || 0;
    };

    return (
        <div className="order-menu">
            {/* Sticky Header with Cart */}
            <header className="order-menu-header">
                <div className="header-content">
                    <div className="header-title">
                        <h1>Order Menu</h1>
                        <p>Tap items to add to cart</p>
                    </div>
                    {itemCount > 0 && (
                        <button className="header-cart-btn" onClick={() => window.dispatchEvent(new CustomEvent('openCart'))}>
                            <ShoppingCart size={20} />
                            <span className="header-cart-count">{itemCount}</span>
                            <span className="header-cart-total">${subtotal.toFixed(2)}</span>
                        </button>
                    )}
                </div>
            </header>

            {MENU_DATA.map((section) => (
                <section key={section.category} className="menu-category">
                    <h2 className="category-title">{section.category}</h2>
                    <div className="product-grid">
                        {section.items.map((product) => (
                            <ProductCard
                                key={product.id}
                                product={product}
                                quantity={getQuantityInCart(product.id)}
                                onAdd={() => addItem({ id: product.id, name: product.name, price: product.price, imageUrl: product.imageUrl })}
                            />
                        ))}
                    </div>
                </section>
            ))}
        </div>
    );
};

interface ProductCardProps {
    product: Product;
    quantity: number;
    onAdd: () => void;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, quantity, onAdd }) => {
    const isOutOfStock = product.stockStatus === 'out_of_stock';

    return (
        <div className={`product-card ${isOutOfStock ? 'out-of-stock' : ''}`}>
            <img src={product.imageUrl} alt={product.name} className="product-image" />
            <div className="product-info">
                <h3 className="product-name">{product.name}</h3>
                <p className="product-desc">{product.description}</p>
                <div className="product-footer">
                    <span className="product-price">${product.price}</span>
                    {product.stockStatus === 'limited' && <span className="stock-badge limited">Low Stock</span>}
                    {isOutOfStock && <span className="stock-badge out">Sold Out</span>}
                </div>
                {!isOutOfStock && (
                    <button className="add-btn" onClick={onAdd}>
                        {quantity > 0 ? (
                            <span className="qty-badge">{quantity} in cart</span>
                        ) : (
                            <>
                                <Plus size={16} /> Add
                            </>
                        )}
                    </button>
                )}
            </div>
        </div>
    );
};

export default OrderMenu;
