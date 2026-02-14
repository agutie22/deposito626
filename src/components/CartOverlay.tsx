
import React, { useState, useEffect } from 'react';
import { useCartStore } from '../store/useCartStore';
import { generateOrderId, formatOrderMessage, getInstagramDMUrl } from '../utils/instagram';
import { supabase } from '../supabaseClient';
import { X, Plus, Minus, Trash2, Send, Copy, CheckCircle, Instagram } from 'lucide-react';
import './CartOverlay.css';

interface CartOverlayProps {
    isOpen: boolean;
    onClose: () => void;
}

const CartOverlay: React.FC<CartOverlayProps> = ({ isOpen, onClose }) => {
    const { items, updateQuantity, removeItem, clearCart, getSubtotal, user, setPhone } = useCartStore();
    const [step, setStep] = useState<'cart' | 'confirm'>('cart');
    const [phoneInput, setPhoneInput] = useState(user.phone || '');
    const [address, setAddress] = useState('');
    const [countdown, setCountdown] = useState(0);
    const [orderMessage, setOrderMessage] = useState('');

    const subtotal = getSubtotal();
    const isAddressValid = address.trim().length >= 5;

    useEffect(() => {
        if (user.phone) {
            setPhoneInput(user.phone);
        }
    }, [user.phone]);

    // Countdown timer for confirm step
    useEffect(() => {
        if (step === 'confirm' && countdown > 0) {
            const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
            return () => clearTimeout(timer);
        }
    }, [step, countdown]);

    const handleCheckout = () => {
        // Normalize phone: remove non-digits and take last 10
        let cleanPhone = phoneInput.replace(/\D/g, '');
        if (cleanPhone.length > 10) {
            cleanPhone = cleanPhone.substring(cleanPhone.length - 10);
        }

        if (cleanPhone.length < 10) {
            alert("Please enter a valid 10-digit phone number.");
            return;
        }

        // Save normalized phone to store
        setPhone(cleanPhone);
        setPhoneInput(cleanPhone); // Update local state too to show normalized version
        prepareOrder();
    };

    const prepareOrder = async () => {
        const orderId = generateOrderId();
        const order = {
            items,
            subtotal,
            phone: phoneInput,
            address,
            orderId,
        };

        // Generate and copy message
        const message = formatOrderMessage(order);
        setOrderMessage(message);

        try {
            await navigator.clipboard.writeText(message);
        } catch (err) {
            console.error('Failed to copy:', err);
        }

        // Show confirmation step with countdown
        setCountdown(4);
        setStep('confirm');
    };

    const handleOpenInstagram = () => {
        // 1. Open Instagram immediately (synchronously) to avoid popup blockers
        const instagramUrl = getInstagramDMUrl();
        window.open(instagramUrl, '_blank');

        // 2. Fire and forget the database RPC
        (async () => {
            try {
                const { error } = await supabase.rpc('create_order', {
                    model: {
                        customer_name: phoneInput,
                        phone: phoneInput,
                        address: address,
                        items: items.map(item => ({
                            id: item.id,
                            name: item.name,
                            quantity: item.quantity,
                            price: item.price,
                            flavor: item.flavor,
                            size: item.size
                        })),
                        total_amount: subtotal
                    }
                });

                if (error) {
                    console.error("Failed to create order via RPC", error);
                }
            } catch (err) {
                console.error("Error creating order via RPC", err);
            }
        })();

        // 3. Clean up and close
        clearCart();
        setStep('cart');
        onClose();
    };

    const handleCopyAgain = async () => {
        try {
            await navigator.clipboard.writeText(orderMessage);
        } catch (err) {
            console.error('Failed to copy:', err);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="cart-overlay-backdrop" onClick={onClose}>
            <div className="cart-overlay" onClick={(e) => e.stopPropagation()}>
                <header className="cart-header">
                    <h2>
                        {step === 'cart' && 'Your Order'}
                        {step === 'confirm' && 'Ready to Send!'}
                    </h2>
                    <button className="close-btn" onClick={onClose}>
                        <X size={24} />
                    </button>
                </header>

                {step === 'cart' && (
                    <>
                        {items.length === 0 ? (
                            <div className="empty-cart">
                                <p>Your cart is empty</p>
                            </div>
                        ) : (
                            <div className="cart-items">
                                {items.map((item) => (
                                    <div key={item.id} className="cart-item">
                                        {item.imageUrl && <img src={item.imageUrl} alt={item.name} className="cart-item-img" />}
                                        <div className="cart-item-info">
                                            <span className="cart-item-name">{item.name}</span>
                                            {(item.size || item.flavor) && (
                                                <span className="cart-item-variant" style={{ fontSize: '0.8rem', color: '#aaa' }}>
                                                    {[item.size, item.flavor].filter(Boolean).join(' • ')}
                                                </span>
                                            )}
                                            <span className="cart-item-price">${(item.price * item.quantity).toFixed(2)}</span>
                                        </div>
                                        <div className="cart-item-controls">
                                            <button onClick={() => updateQuantity(item.id, item.quantity - 1, item.size, item.flavor)}>
                                                <Minus size={16} />
                                            </button>
                                            <span>{item.quantity}</span>
                                            <button onClick={() => updateQuantity(item.id, item.quantity + 1, item.size, item.flavor)}>
                                                <Plus size={16} />
                                            </button>
                                            <button className="remove-btn" onClick={() => removeItem(item.id, item.size, item.flavor)}>
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {items.length > 0 && (
                            <div className="cart-footer">
                                <div className="cart-address">
                                    <label>Your Phone Number <span className="required">*</span></label>
                                    <input
                                        type="tel"
                                        placeholder="(555) 123-4567"
                                        value={phoneInput}
                                        onChange={(e) => setPhoneInput(e.target.value)}
                                        className={phoneInput.length > 0 && phoneInput.length < 10 ? 'input-error' : ''}
                                    />
                                </div>
                                <div className="cart-address">
                                    <label>Delivery Address <span className="required">*</span></label>
                                    <input
                                        type="text"
                                        placeholder="Enter your full address..."
                                        value={address}
                                        onChange={(e) => setAddress(e.target.value)}
                                        className={!isAddressValid && address.length > 0 ? 'input-error' : ''}
                                    />
                                    {!isAddressValid && address.length > 0 && (
                                        <span className="error-hint">Please enter a valid address</span>
                                    )}
                                </div>
                                <div className="cart-total">
                                    <span>Total</span>
                                    <span className="total-amount">${subtotal.toFixed(2)}</span>
                                </div>
                                <button
                                    className="checkout-btn"
                                    onClick={handleCheckout}
                                    disabled={!isAddressValid || phoneInput.length < 10}
                                >
                                    <Send size={18} />
                                    Order via Instagram DM
                                </button>
                            </div>
                        )}
                    </>
                )}

                {step === 'confirm' && (
                    <div className="confirm-step">
                        <div className="confirm-icon">
                            <CheckCircle size={48} />
                        </div>
                        <h3>Order Copied!</h3>
                        <p className="confirm-instructions">
                            PASTE ORDER IN INSTAGRAM MESSAGE
                        </p>

                        <div className="order-preview">
                            <pre>{orderMessage}</pre>
                            <button className="copy-again-btn" onClick={handleCopyAgain}>
                                <Copy size={14} /> Copy Again
                            </button>
                        </div>

                        <button
                            className="instagram-btn"
                            onClick={handleOpenInstagram}
                            disabled={countdown > 0}
                        >
                            <Instagram size={20} />
                            {countdown > 0
                                ? `Opening in ${countdown}...`
                                : 'Open Instagram'}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CartOverlay;
