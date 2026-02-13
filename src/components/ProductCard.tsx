import React, { useState, useEffect } from 'react';
import { Plus } from 'lucide-react';
import type { Product } from '../types';
import { CycleSelector } from './ui/CycleSelector';
import './OrderMenu.css'; // Keep using OrderMenu.css for card styles

interface ProductCardProps {
    product: Product;
    quantity: number;
    onAdd: (quantity: number, size?: string, flavor?: string) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, quantity, onAdd }) => {
    const isOutOfStock = product.stockStatus === 'out_of_stock';
    const [selectedSize, setSelectedSize] = useState<string>(product.availableSizes?.[0] || '');
    const [selectedFlavor, setSelectedFlavor] = useState<string>(product.availableFlavors?.[0] || '');
    const [packSize, setPackSize] = useState<number>(1);

    // Default options if missing (though type suggests they might be undefined)
    const sizes = product.availableSizes && product.availableSizes.length > 0 ? product.availableSizes : ['Standard', 'Large'];
    const flavors = product.availableFlavors && product.availableFlavors.length > 0 ? product.availableFlavors : ['Original', 'Lime', 'Mango'];

    // Auto-select first option if not selected
    useEffect(() => {
        if (!selectedSize && sizes.length > 0) setSelectedSize(sizes[0]);
        if (!selectedFlavor && flavors.length > 0) setSelectedFlavor(flavors[0]);
    }, [sizes, flavors, selectedSize, selectedFlavor]);

    const handleAdd = () => {
        if (navigator.vibrate) navigator.vibrate(15); // Stronger haptic for Add
        onAdd(packSize, selectedSize, selectedFlavor);
    };

    return (
        <div className={`product-card ${isOutOfStock ? 'out-of-stock' : ''}`}>
            <img src={product.imageUrl} alt={product.name} className="product-image" />
            <div className="product-info">
                <h3 className="product-name">{product.name}</h3>
                <p className="product-desc">{product.description}</p>

                <div className="product-options">
                    <div className="options-row">
                        {/* Size Cycle Pill */}
                        <CycleSelector
                            label="Size"
                            options={sizes}
                            selected={selectedSize}
                            onSelect={setSelectedSize}
                            disabled={isOutOfStock}
                        />

                        {/* Flavor Cycle Pill */}
                        <CycleSelector
                            label="Flavor"
                            options={flavors}
                            selected={selectedFlavor}
                            onSelect={setSelectedFlavor}
                            disabled={isOutOfStock}
                        />

                        {/* Quantity Cycle Pill */}
                        <CycleSelector
                            label="Qty"
                            options={['Single', '6 Pack', '12 Pack', '18 Pack']}
                            selected={packSize === 1 ? 'Single' : `${packSize} Pack`}
                            onSelect={(val) => {
                                // Parse visual value back to number
                                const num = val === 'Single' ? 1 : parseInt(val);
                                setPackSize(num);
                            }}
                            disabled={isOutOfStock}
                        />
                    </div>
                </div>

                <div className="product-footer">
                    <div className="footer-price-row">
                        <div className="price-container">
                            <span className="product-price">${(product.price * packSize).toFixed(2)}</span>
                            {/* Selected Options Summary */}
                            {(selectedSize || selectedFlavor) && (
                                <span className="footer-options">
                                    {[selectedSize, selectedFlavor].filter(Boolean).join(' • ')}
                                </span>
                            )}
                        </div>
                        {product.stockStatus === 'limited' && <span className="stock-badge limited">Low Stock</span>}
                        {isOutOfStock && <span className="stock-badge out">Sold Out</span>}
                    </div>
                </div>
                {!isOutOfStock && (
                    <button className="add-btn" onClick={handleAdd}>
                        {quantity > 0 ? (
                            <span className="qty-badge">{quantity} in cart</span>
                        ) : (
                            <>
                                <Plus size={16} /> Add to Cart
                            </>
                        )}
                    </button>
                )}
            </div>
        </div>
    );
};
