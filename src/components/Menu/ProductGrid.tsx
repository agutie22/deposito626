import React, { useEffect, useState } from 'react';
import './ProductGrid.css';

interface Product {
    id: number;
    name: string;
    price: number;
    category: 'beer' | 'liquor' | 'mixer' | 'bundle';
    stockStatus: 'in_stock' | 'limited' | 'out_of_stock';
    imageUrl: string;
}

const ProductGrid: React.FC = () => {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch('http://localhost:3001/products')
            .then(res => res.json())
            .then(data => {
                setProducts(data);
                setLoading(false);
            })
            .catch(err => {
                console.error('Failed to load products', err);
                setLoading(false);
            });
    }, []);

    if (loading) return <div className="product-grid-loading">Loading Menu...</div>;

    return (
        <div className="product-grid">
            {products.map(product => (
                <div key={product.id} className="product-card">
                    <img src={product.imageUrl} alt={product.name} className="product-image" />
                    <div className="product-info">
                        <h3>{product.name}</h3>
                        <div className="product-meta">
                            <span className="product-price">${product.price.toFixed(2)}</span>
                            {product.stockStatus === 'limited' && (
                                <span className="stock-badge limited">Low Stock</span>
                            )}
                        </div>
                        <button className="add-btn">Add +</button>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default ProductGrid;
