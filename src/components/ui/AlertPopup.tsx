import React from 'react';
import { useAlertStore } from '../../store/useAlertStore';
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react';
import './AlertPopup.css';

export const AlertPopup: React.FC = () => {
    const { isOpen, message, type, hideAlert } = useAlertStore();

    if (!isOpen) return null;

    const renderIcon = () => {
        switch (type) {
            case 'success':
                return <CheckCircle className="alert-icon success-icon" size={20} />;
            case 'error':
                return <AlertCircle className="alert-icon error-icon" size={20} />;
            case 'warning':
                return <AlertTriangle className="alert-icon warning-icon" size={20} />;
            case 'info':
            default:
                return <Info className="alert-icon info-icon" size={20} />;
        }
    };

    return (
        <div className={`alert-popup-container ${isOpen ? 'alert-visible' : ''}`}>
            <div className={`alert-popup ${type}`}>
                <div className="alert-content">
                    {renderIcon()}
                    <span className="alert-message">{message}</span>
                </div>
                <button className="alert-close-btn" onClick={hideAlert} aria-label="Close Alert">
                    <X size={16} />
                </button>
            </div>
        </div>
    );
};

export default AlertPopup;
