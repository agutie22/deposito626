
import React, { useState } from 'react';
import { useCartStore } from '../store/useCartStore';
import { supabase } from '../supabaseClient';
import { Lock, Unlock, Key } from 'lucide-react';
import AztecSunStone from './AztecSunStone';
import './AccessGate.css';

export const AccessGate: React.FC = () => {
    const { user, unlockAccess } = useCartStore();
    const [inputPhone, setInputPhone] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    // Only show if modal is open AND user is NOT unlocked
    if (!user.isAccessModalOpen || user.isAccessUnlocked) {
        return null;
    }

    const handleUnlock = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            // Clean the phone input - remove non-digits
            const cleanPhone = inputPhone.replace(/\D/g, '');

            if (cleanPhone.length < 10) {
                throw new Error('Please enter a valid 10-digit phone number');
            }

            // Check if verification passes
            const { data, error: dbError } = await supabase
                .from('verified_members')
                .select('phone_number')
                .eq('phone_number', cleanPhone)
                .maybeSingle();

            if (dbError) throw dbError;

            if (data) {
                // Success!
                unlockAccess(cleanPhone);
            } else {
                throw new Error('Access Denied. This number is not in our trusted network.');
            }
        } catch (err: any) {
            console.error('Unlock failed:', err);
            setError(err.message || 'Verification failed. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="access-gate-overlay">
            {/* Background Element */}
            <div className="aztec-bg-container">
                <AztecSunStone className="aztec-gate-bg" />
            </div>

            <div className="access-gate-card">
                <div className="gate-header">
                    <div className="gate-icon-wrapper">
                        <Lock size={32} className="gate-icon" />
                    </div>
                    <h2>Exclusive Access</h2>
                </div>

                <p className="gate-message">
                    Welcome to <strong>Depositó 626</strong>.<br />
                    Enter a member's phone number to unlock the experience.
                </p>

                <form onSubmit={handleUnlock} className="gate-form">
                    <div className="input-group">
                        <Key size={20} className="input-icon" />
                        <input
                            type="tel"
                            placeholder="Referrer Phone Number"
                            value={inputPhone}
                            onChange={(e) => setInputPhone(e.target.value)}
                            className="gate-input"
                            disabled={isLoading}
                        />
                    </div>
                    {error && <div className="gate-error">{error}</div>}

                    <button type="submit" className="gate-button" disabled={isLoading || !inputPhone}>
                        {isLoading ? (
                            <span className="loading-dots">Verifying</span>
                        ) : (
                            <>
                                Unlock Access <Unlock size={18} />
                            </>
                        )}
                    </button>
                </form>

                <div className="gate-footer">
                    <p>
                        This is an invite-only community.
                    </p>
                </div>
            </div>
        </div>
    );
};
