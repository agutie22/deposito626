import React, { useState, useEffect } from 'react';
import { useCartStore } from '../store/useCartStore';
import { generateOrderId, formatOrderMessage, getInstagramDMUrl } from '../utils/instagram';
import { X, Plus, Minus, Trash2, Send, Copy, CheckCircle, Instagram } from 'lucide-react';
import './CartOverlay.css';

interface CartOverlayProps {
    isOpen: boolean;
    onClose: () => void;
}

const CartOverlay: React.FC<CartOverlayProps> = ({ isOpen, onClose }) => {
    const { items, updateQuantity, removeItem, clearCart, getSubtotal, user, setPhone, setVerified } = useCartStore();
    const [step, setStep] = useState<'cart' | 'phone' | 'otp' | 'confirm'>('cart');
    const [phoneInput, setPhoneInput] = useState(user.phone);
    const [otpInput, setOtpInput] = useState('');
    const [address, setAddress] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [countdown, setCountdown] = useState(0);
    const [orderMessage, setOrderMessage] = useState('');

    const subtotal = getSubtotal();
    const isAddressValid = address.trim().length >= 5;

    // Countdown timer for confirm step
    useEffect(() => {
        if (step === 'confirm' && countdown > 0) {
            const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
            return () => clearTimeout(timer);
        }
    }, [step, countdown]);

    const handleCheckout = () => {
        if (!user.isVerified) {
            setStep('phone');
        } else {
            prepareOrder();
        }
    };

    const handleSendPhone = async () => {
        setIsLoading(true);
        console.log('📱 Mock OTP sent to:', phoneInput);
        console.log('🔐 Mock OTP Code: 123456');
        setPhone(phoneInput);
        setTimeout(() => {
            setIsLoading(false);
            setStep('otp');
        }, 1000);
    };

    const handleVerifyOtp = async () => {
        setIsLoading(true);
        setTimeout(() => {
            if (otpInput === '123456') {
                setVerified(true);
                setIsLoading(false);
                prepareOrder();
            } else {
                alert('Invalid code. Try 123456 for demo.');
                setIsLoading(false);
            }
        }, 500);
    };

    const prepareOrder = async () => {
        const orderId = generateOrderId();
        const order = {
            items,
            subtotal,
            phone: user.phone || phoneInput,
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
        window.open(getInstagramDMUrl(), '_blank');
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
                        {step === 'phone' && 'Verify Phone'}
                        {step === 'otp' && 'Enter Code'}
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
                                            <span className="cart-item-price">${(item.price * item.quantity).toFixed(2)}</span>
                                        </div>
                                        <div className="cart-item-controls">
                                            <button onClick={() => updateQuantity(item.id, item.quantity - 1)}>
                                                <Minus size={16} />
                                            </button>
                                            <span>{item.quantity}</span>
                                            <button onClick={() => updateQuantity(item.id, item.quantity + 1)}>
                                                <Plus size={16} />
                                            </button>
                                            <button className="remove-btn" onClick={() => removeItem(item.id)}>
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
                                    disabled={!isAddressValid}
                                >
                                    <Send size={18} />
                                    Order via Instagram DM
                                </button>
                            </div>
                        )}
                    </>
                )}

                {step === 'phone' && (
                    <div className="verification-step">
                        <p>Enter your phone number to verify your order</p>
                        <input
                            type="tel"
                            placeholder="(555) 123-4567"
                            value={phoneInput}
                            onChange={(e) => setPhoneInput(e.target.value)}
                            className="phone-input"
                        />
                        <button className="verify-btn" onClick={handleSendPhone} disabled={isLoading || phoneInput.length < 10}>
                            {isLoading ? 'Sending...' : 'Send Verification Code'}
                        </button>
                        <button className="back-btn" onClick={() => setStep('cart')}>Back to Cart</button>
                    </div>
                )}

                {step === 'otp' && (
                    <div className="verification-step">
                        <p>Enter the 6-digit code sent to {phoneInput}</p>
                        <input
                            type="text"
                            placeholder="123456"
                            value={otpInput}
                            onChange={(e) => setOtpInput(e.target.value)}
                            maxLength={6}
                            className="otp-input"
                        />
                        <button className="verify-btn" onClick={handleVerifyOtp} disabled={isLoading || otpInput.length < 6}>
                            {isLoading ? 'Verifying...' : 'Verify & Order'}
                        </button>
                        <button className="back-btn" onClick={() => setStep('phone')}>Change Phone</button>
                    </div>
                )}

                {step === 'confirm' && (
                    <div className="confirm-step">
                        <div className="confirm-icon">
                            <CheckCircle size={48} />
                        </div>
                        <h3>Order Copied!</h3>
                        <p className="confirm-instructions">
                            Your order is ready to send. When Instagram opens,
                            <strong> tap and hold</strong> in the message box, then tap <strong>Paste</strong>.
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

