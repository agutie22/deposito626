import React, { useEffect, useState } from 'react';
import { useCartStore } from '../store/useCartStore';
import { useAdmin } from '../context/AdminContext';
import { ShoppingCart, Loader2 } from 'lucide-react';
import type { Product } from '../types';
import { ProductCard } from './ProductCard';

import './OrderMenu.css';

const OrderMenu: React.FC = () => {
    const { addItem, items, getItemCount, getSubtotal, user, openAccessModal, setIsCartOpen } = useCartStore(); // Added user, openAccessModal, setIsCartOpen
    const { service } = useAdmin();
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);

    const itemCount = getItemCount();
    const subtotal = getSubtotal();

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const data = await service.getProducts();
                setProducts(data);
            } catch (error) {
                console.error("Failed to load products", error);
            } finally {
                setLoading(false);
            }
        };
        fetchProducts();
    }, [service]);

    const getQuantityInCart = (productId: number) => {
        return items.filter((i) => i.id === productId).reduce((acc, i) => acc + i.quantity, 0);
    };

    // Group products by category
    const groupedProducts = products.reduce((acc, product) => {
        const category = product.category || 'Other';
        if (!acc[category]) acc[category] = [];
        acc[category].push(product);
        return acc;
    }, {} as Record<string, Product[]>);


    const handleAddToCart = (product: Product, quantity: number, size?: string, flavor?: string) => {
        if (!user.isAccessUnlocked) {
            openAccessModal();
            return;
        }

        addItem({
            id: product.id,
            name: product.name,
            price: product.price,
            imageUrl: product.imageUrl,
            size,
            flavor
        }, quantity);
    };

    if (loading) return <div className="p-10 text-center flex justify-center"><Loader2 className="animate-spin mr-2" /> Loading Menu...</div>;

    return (
        <div id="menu" className="order-menu">
            {/* Sticky Header with Cart */}
            <header className="order-menu-header">
                <div className="header-content">
                    <div className="header-title">
                        <h1>Order Menu</h1>
                        <p>Tap items to add to cart</p>
                    </div>
                    {itemCount > 0 && (
                        <button className="header-cart-btn" onClick={() => setIsCartOpen(true)}>
                            <ShoppingCart size={20} />
                            <span className="header-cart-count">{itemCount}</span>
                            <span className="header-cart-total">${subtotal.toFixed(2)}</span>
                        </button>
                    )}
                </div>
            </header>


            {Object.entries(groupedProducts).length === 0 ? (
                <div className="p-8 text-center text-gray-400">No products available.</div>
            ) : (
                Object.entries(groupedProducts).map(([category, items]) => (
                    <section key={category} className="menu-category">
                        <h2 className="category-title">{category}</h2>
                        <div className="product-grid">
                            {items.map((product) => (
                                <ProductCard
                                    key={product.id}
                                    product={product}
                                    quantity={getQuantityInCart(product.id)}
                                    // Use the new handler
                                    onAdd={(qty, size, flavor) => handleAddToCart(product, qty, size, flavor)}
                                />
                            ))}
                        </div>
                    </section>
                ))
            )}
        </div>
    );
};

export default OrderMenu;
