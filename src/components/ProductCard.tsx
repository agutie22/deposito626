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
    const [selectedFlavor, setSelectedFlavor] = useState<string>(product.availableFlavors?.[0] || 'Original');
    const [packSize, setPackSize] = useState<number>(1);

    // Use available flavors if they exist
    const flavors = product.availableFlavors && product.availableFlavors.length > 0 ? product.availableFlavors : ['Original'];
    const hasFlavors = product.availableFlavors && product.availableFlavors.length > 0;

    // Determine if the currently selected flavor (or product if no flavors) is out of stock
    const isFlavorOutOfStock = hasFlavors
        ? (product.flavorStock?.[selectedFlavor] !== undefined && product.flavorStock[selectedFlavor] <= 0)
        : product.stockStatus === 'out_of_stock';

    const isLimitedStock = hasFlavors
        ? (product.flavorStock?.[selectedFlavor] !== undefined && product.flavorStock[selectedFlavor] > 0 && product.flavorStock[selectedFlavor] <= 5)
        : product.stockStatus === 'limited';

    // Auto-select first option if not selected
    useEffect(() => {
        if (!selectedFlavor && flavors.length > 0) setSelectedFlavor(flavors[0]);
    }, [flavors, selectedFlavor]);

    const handleAdd = () => {
        if (navigator.vibrate) navigator.vibrate(15); // Stronger haptic for Add
        onAdd(packSize, undefined, selectedFlavor);
    };

    return (
        <div className={`product-card ${isFlavorOutOfStock ? 'out-of-stock' : ''}`}>
            <img src={product.imageUrl} alt={product.name} className="product-image" />
            <div className="product-info">
                <h3 className="product-name">{product.name}</h3>
                <p className="product-desc">{product.description}</p>

                <div className="product-options">
                    <div className="options-row">
                        {/* Flavor Cycle Pill */}
                        <CycleSelector
                            label="Flavor"
                            options={flavors}
                            selected={selectedFlavor}
                            onSelect={setSelectedFlavor}
                            disabled={product.stockStatus === 'out_of_stock'}
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
                            disabled={isFlavorOutOfStock}
                        />
                    </div>
                </div>

                <div className="product-footer">
                    <div className="footer-price-row">
                        <div className="price-container">
                            <span className="product-price">${(product.price * packSize).toFixed(2)}</span>
                            {/* Selected Options Summary */}
                            {selectedFlavor && (
                                <span className="footer-options">
                                    {selectedFlavor}
                                </span>
                            )}
                        </div>
                        {isLimitedStock && <span className="stock-badge limited">Low Stock</span>}
                        {isFlavorOutOfStock && <span className="stock-badge out">Sold Out</span>}
                    </div>
                </div>
                {!isFlavorOutOfStock && (
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
