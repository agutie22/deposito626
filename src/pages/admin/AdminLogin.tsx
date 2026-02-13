import React, { useState } from 'react';
import { useAdmin } from '../../context/AdminContext';
import { useNavigate } from 'react-router-dom';
import { Lock, ArrowRight } from 'lucide-react';

const AdminLogin = () => {
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { login } = useAdmin();
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const success = await login(password);
            if (success) {
                navigate('/admin/dashboard');
            } else {
                setError('Invalid credentials');
            }
        } catch (err) {
            setError('Login failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[var(--bg-dark)] flex items-center justify-center p-4">
            <div className="w-full max-w-md bg-[var(--bg-card)] rounded-2xl shadow-2xl border border-white/5 overflow-hidden animate-[fadeIn_0.5s_ease-out]">
                <div className="p-8 md:p-12">
                    <div className="flex justify-center mb-8">
                        <div className="w-16 h-16 bg-[var(--accent-gold)] rounded-full flex items-center justify-center text-[var(--bg-dark)] shadow-lg shadow-[var(--accent-gold)]/20">
                            <Lock size={32} />
                        </div>
                    </div>

                    <h1 className="text-3xl font-bold text-center text-[var(--text-primary)] mb-2" style={{ fontFamily: 'var(--font-heading)' }}>
                        Admin Access
                    </h1>
                    <p className="text-center text-[var(--text-secondary)] mb-8 text-sm">
                        Enter your secure access code to manage the store.
                    </p>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="relative">
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Enter Access Code"
                                className="w-full bg-black/30 border border-white/10 rounded-xl px-5 py-4 text-[var(--text-primary)] placeholder:text-[var(--text-secondary)] focus:border-[var(--accent-gold)] focus:outline-none transition-colors text-center text-lg tracking-widest"
                                autoFocus
                            />
                        </div>

                        {error && (
                            <div className="text-[#ff4d4d] text-sm text-center bg-[#ff4d4d]/10 py-2 rounded-lg border border-[#ff4d4d]/20">
                                {error}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-gradient-to-r from-[var(--accent-gold)] to-[#b88c2b] text-[var(--bg-dark)] font-bold py-4 rounded-xl flex items-center justify-center gap-2 hover:shadow-lg hover:shadow-[var(--accent-gold)]/20 transition-all active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed group"
                        >
                            {loading ? 'Verifying...' : 'Access Dashboard'}
                            {!loading && <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />}
                        </button>
                    </form>
                </div>
                <div className="bg-white/5 py-4 text-center">
                    <p className="text-[var(--text-secondary)] text-xs">
                        &copy; {new Date().getFullYear()} Deposito 626. Secure Admin Area.
                    </p>
                </div>
            </div>
        </div>
    );
};

// Add standard fade animation if not already present globally
const style = document.createElement('style');
style.textContent = `
  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(10px); }
    to { opacity: 1; transform: translateY(0); }
  }
`;
document.head.appendChild(style);

export default AdminLogin;
